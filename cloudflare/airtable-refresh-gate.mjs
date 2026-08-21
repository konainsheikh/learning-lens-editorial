/**
 * Learning Lenz refresh gate. Airtable sends signed native Webhooks API pings
 * to this Worker. A Durable Object coalesces edit bursts for three minutes,
 * renews the Airtable subscription before its seven-day expiration, and starts
 * one Pages rebuild. It never sends testimonial content to visitors.
 */

const decoder = new TextDecoder();

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });

const empty = (status = 204) => new Response(null, { status });

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function validAirtableSignature(rawBody, signature, macSecretBase64) {
  if (!signature?.startsWith("hmac-sha256=") || !macSecretBase64) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(macSecretBase64),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, rawBody);
  return constantTimeEqual(`hmac-sha256=${bytesToHex(new Uint8Array(digest))}`, signature);
}

export class TestimonialDebounce {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const event = await request.json();
    if (event.type === "initialize") return this.initialize(event);
    if (event.type === "notification") return this.queueNotification(event);
    return json({ error: "Unsupported internal request." }, 400);
  }

  async initialize({ expirationTime, webhookId }) {
    const initialized = await this.state.storage.get("initialized");
    if (initialized) return json({ error: "Webhook state has already been initialized." }, 409);

    const expirationAt = Date.parse(expirationTime);
    if (!webhookId || Number.isNaN(expirationAt)) {
      return json({ error: "Webhook initialization data is invalid." }, 400);
    }

    await this.state.storage.put({ expirationAt, initialized: true, webhookId });
    await this.scheduleNextAlarm();
    return empty();
  }

  async queueNotification({ timestamp }) {
    // Airtable may send its initial subscription ping before the creator has
    // stored the private MAC secret. Returning 204 avoids retries at that point.
    if (!(await this.state.storage.get("initialized"))) return empty();

    const now = Date.now();
    const sequence = ((await this.state.storage.get("sequence")) ?? 0) + 1;
    await this.state.storage.put({
      lastEventAt: now,
      lastNotificationAt: timestamp ?? new Date(now).toISOString(),
      sequence,
    });
    await this.scheduleNextAlarm();
    return empty();
  }

  async alarm() {
    if (!(await this.state.storage.get("initialized"))) return;

    const now = Date.now();
    const expirationAt = await this.state.storage.get("expirationAt");
    const renewalAt = this.getRenewalAt(expirationAt);
    if (renewalAt && now >= renewalAt) {
      const renewed = await this.renewAirtableWebhook();
      if (!renewed) {
        await this.scheduleNextAlarm();
        return;
      }
    }

    const lastEventAt = await this.state.storage.get("lastEventAt");
    const quietPeriod = Number(this.env.QUIET_PERIOD_MS);
    if (lastEventAt && now >= lastEventAt + quietPeriod) {
      const sequence = await this.state.storage.get("sequence");
      await this.retryProductionBuild();

      // Preserve notices delivered while the Pages request was in flight. They
      // start a new quiet period rather than being erased by this completed build.
      if ((await this.state.storage.get("sequence")) === sequence) {
        await this.state.storage.delete(["lastEventAt", "lastNotificationAt", "sequence"]);
      }
    }

    await this.scheduleNextAlarm();
  }

  getRenewalAt(expirationAt) {
    return expirationAt ? expirationAt - Number(this.env.WEBHOOK_RENEWAL_LEAD_MS) : null;
  }

  async renewAirtableWebhook() {
    const webhookId = await this.state.storage.get("webhookId");
    if (!webhookId) throw new Error("Airtable webhook ID is missing from private state.");

    const renewal = await fetch(
      `https://api.airtable.com/v0/bases/${this.env.AIRTABLE_BASE_ID}/webhooks/${webhookId}/refresh`,
      {
        headers: { authorization: `Bearer ${this.env.AIRTABLE_WEBHOOK_TOKEN}` },
        method: "POST",
      },
    );

    if (!renewal.ok) {
      const expirationAt = await this.state.storage.get("expirationAt");
      const retryAt = Math.min(
        Date.now() + Number(this.env.WEBHOOK_RENEWAL_RETRY_MS),
        expirationAt - 60_000,
      );
      await this.state.storage.put({ renewalRetryAt: retryAt });
      return false;
    }

    const { expirationTime } = await renewal.json();
    const expirationAt = Date.parse(expirationTime);
    if (Number.isNaN(expirationAt)) throw new Error("Airtable returned an invalid webhook expiry.");

    await this.state.storage.put({ expirationAt, renewalRetryAt: null });
    return true;
  }

  async retryProductionBuild() {
    const apiBase = `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}`;
    const headers = {
      authorization: `Bearer ${this.env.PAGES_REBUILD_TOKEN}`,
      "content-type": "application/json",
    };
    const deploymentsResponse = await fetch(
      `${apiBase}/pages/projects/${this.env.PAGES_PROJECT}/deployments?per_page=10`,
      { headers },
    );
    if (!deploymentsResponse.ok) {
      throw new Error(`Could not read Pages deployments (${deploymentsResponse.status}).`);
    }

    const deployments = await deploymentsResponse.json();
    const productionDeployment = deployments.result?.find(
      (deployment) => deployment.environment === "production",
    );
    if (!productionDeployment?.id) throw new Error("No production Pages deployment was available to retry.");

    const retryResponse = await fetch(
      `${apiBase}/pages/projects/${this.env.PAGES_PROJECT}/deployments/${productionDeployment.id}/retry`,
      { headers, method: "POST" },
    );
    if (!retryResponse.ok) throw new Error(`Could not start Pages rebuild (${retryResponse.status}).`);
  }

  async scheduleNextAlarm() {
    const now = Date.now();
    const lastEventAt = await this.state.storage.get("lastEventAt");
    const expirationAt = await this.state.storage.get("expirationAt");
    const renewalRetryAt = await this.state.storage.get("renewalRetryAt");
    const dueTimes = [
      lastEventAt ? lastEventAt + Number(this.env.QUIET_PERIOD_MS) : null,
      renewalRetryAt || this.getRenewalAt(expirationAt),
    ].filter((time) => Number.isFinite(time) && time > now);

    if (dueTimes.length) await this.state.storage.setAlarm(Math.min(...dueTimes));
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const debounce = env.DEBOUNCER.get(env.DEBOUNCER.idFromName("learning-lenz-testimonials"));

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ service: "learning-lenz-testimonial-refresh", status: "ok" });
    }

    if (url.pathname !== "/airtable-webhooks" || request.method !== "POST") {
      return json({ error: "Not found" }, 404);
    }

    const rawBody = await request.arrayBuffer();
    const signature = request.headers.get("x-airtable-content-mac");
    const trusted = await validAirtableSignature(rawBody, signature, env.AIRTABLE_WEBHOOK_MAC_SECRET);
    if (!trusted) return json({ error: "Unauthorized" }, 401);

    const notification = JSON.parse(decoder.decode(rawBody));
    if (notification.base?.id !== env.AIRTABLE_BASE_ID) return json({ error: "Unexpected base." }, 400);

    return debounce.fetch(
      new Request("https://internal/notification", {
        body: JSON.stringify({ timestamp: notification.timestamp, type: "notification" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );
  },
};
