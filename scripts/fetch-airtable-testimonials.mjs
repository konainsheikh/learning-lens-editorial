/**
 * Learning Lenz content pipeline: this script runs only during a production build.
 * It reads Quote and Outcome from Airtable, writes static JSON for Vite, and never
 * exposes Airtable credentials or makes requests from a visitor's browser.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(projectRoot, "client", "src", "data", "testimonials.json");
const tableId = "tblOAaxeM0UjXGRA1";
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

function normaliseText(value, maximumLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maximumLength) : "";
}

function keepFallback(reason) {
  console.warn(`[airtable] ${reason} Keeping the last known approved testimonial JSON.`);
}

async function fetchTestimonials() {
  if (!apiKey || !baseId) {
    keepFallback("AIRTABLE_API_KEY or AIRTABLE_BASE_ID is not available during this build.");
    return;
  }

  try {
    const endpoint = new URL(
      `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`,
    );
    endpoint.searchParams.set("pageSize", "100");

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Airtable responded with ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const testimonials = Array.isArray(payload.records)
      ? payload.records
          .map(({ fields }) => ({
            quote: normaliseText(fields?.Quote, 2_400),
            outcome: normaliseText(fields?.Outcome, 160),
          }))
          .filter(({ quote, outcome }) => quote.length > 0 && outcome.length > 0)
      : [];

    if (testimonials.length === 0) {
      keepFallback("Airtable returned no complete Quote and Outcome records.");
      return;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(testimonials, null, 2)}\n`, "utf8");
    console.log(`[airtable] Generated static testimonials from ${testimonials.length} Airtable record(s).`);
  } catch (error) {
    keepFallback(error instanceof Error ? error.message : "The Airtable request failed.");
  }
}

// A read keeps the fallback file explicit in the pipeline and catches accidental removal early.
await readFile(outputPath, "utf8");
await fetchTestimonials();
