/* Learning Lenz welcome only: React Bits-inspired WebGL wave field, light palette, and reduced-motion-safe rendering. */
import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const hexToRgb = (hex: string) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match ? [Number.parseInt(match[1], 16) / 255, Number.parseInt(match[2], 16) / 255, Number.parseInt(match[3], 16) / 255] : [1, 1, 1];
};

const detailToSteps = (detail: "low" | "medium" | "high") => detail === "low" ? 40 : detail === "high" ? 110 : 70;

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution; uniform float iTime; uniform float uSpeed; uniform float uAmplitude; uniform float uWaveScale; uniform float uWaveRatio; uniform float uSwell; uniform float uTurbulence; uniform float uTilt; uniform float uZoom; uniform float uHeight; uniform float uFogDepth; uniform float uSteps; uniform float uBrightness; uniform float uOpacity; uniform float uGrain; uniform float uGrainIntensity; uniform vec2 uMouse; uniform float uParallax; uniform bool uEnableMouse; uniform vec3 uHorizonColor; uniform vec3 uWaveColor; uniform vec3 uCrestColor; out vec4 fragColor;
const float MAX_DIST = 20000.0;
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float plasma(vec3 r, vec2 freq, vec4 tc) { float mx = r.x + tc.x; mx += uSwell * sin((r.y + mx) / 20.0 + tc.y); float my = r.y - tc.z; my += uTurbulence * cos(r.x / 23.0 + tc.w); return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight); }
float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) { float dist = 0.0; for (int i = 0; i < 128; i++) { if (float(i) >= uSteps) break; float dscene = plasma(pos + dist * dir, freq, tc); if (abs(dscene) < 0.1) break; dist += 0.9 * dscene; if (!(abs(dist) < MAX_DIST)) return MAX_DIST; } return dist; }
void main() {
  float T = iTime * uSpeed; vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0); vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710); float c, s; float vfov = (3.14159 / 2.3) / max(uZoom, 0.05); vec3 cam = vec3(0.0, 0.0, 30.0); vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5; uv.x *= iResolution.x / iResolution.y; uv.y *= -1.0;
  vec3 dir = vec3(0.0, 0.0, -1.0); float ulen = length(uv); float xrot = vfov * ulen; c = cos(xrot); s = sin(xrot); dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir; vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0); c = nuv.x; s = nuv.y; dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir; c = cos(uTilt); s = sin(uTilt); dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
  if (uEnableMouse) { float yaw = (uMouse.x - 0.5) * uParallax * 0.4; float pitch = (uMouse.y - 0.5) * uParallax * 0.4; c = cos(yaw); s = sin(yaw); dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir; c = cos(pitch); s = sin(pitch); dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir; }
  float dist = raymarch(cam, dir, freq, tc); vec3 pos = cam + dist * dir; float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0); vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0)); vec3 col = clamp(mix(uHorizonColor, body, t) * uBrightness, 0.0, 1.0); float alpha = clamp(t, 0.0, 1.0) * uOpacity; if (uGrain > 0.5) { alpha += (hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0) - 0.5) * uGrainIntensity; } fragColor = vec4(col * clamp(alpha, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}`;

type GradientWavesProps = {
  horizonColor: string; waveColor: string; crestColor: string; speed: number; amplitude: number; waveScale: number; waveRatio: number; swell: number; turbulence: number; tilt: number; zoom: number; height: number; fogDepth: number; detail: "low" | "medium" | "high"; brightness: number; opacity: number; mouseInteraction: boolean; parallaxStrength: number; grain: boolean; grainIntensity: number; className?: string;
};

export default function GradientWaves({ horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio, swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness, opacity, mouseInteraction, parallaxStrength, grain, grainIntensity, className = "" }: GradientWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseEnabledRef = useRef(mouseInteraction);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: Renderer | null = null;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let cleanup = () => undefined;
    const enableFallback = () => { container.dataset.waveFallback = "true"; };
    const capabilityProbe = document.createElement("canvas");
    const capabilityContext = capabilityProbe.getContext("webgl2", { alpha: true, antialias: false, failIfMajorPerformanceCaveat: true });
    if (!capabilityContext) { enableFallback(); return; }
    capabilityContext.getExtension("WEBGL_lose_context")?.loseContext();
    try {
      const cappedDpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: cappedDpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      const canvas = gl.canvas;
      canvas.style.cssText = "width:100%;height:100%;display:block";
      container.appendChild(canvas);
      const uniforms: any = {
        iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uSpeed: { value: speed }, uAmplitude: { value: amplitude }, uWaveScale: { value: waveScale }, uWaveRatio: { value: waveRatio }, uSwell: { value: swell }, uTurbulence: { value: turbulence }, uTilt: { value: tilt }, uZoom: { value: zoom }, uHeight: { value: height }, uFogDepth: { value: fogDepth }, uSteps: { value: detailToSteps(detail) }, uBrightness: { value: brightness }, uOpacity: { value: opacity }, uGrain: { value: grain ? 1 : 0 }, uGrainIntensity: { value: grainIntensity }, uMouse: { value: new Float32Array([.5, .5]) }, uParallax: { value: parallaxStrength }, uEnableMouse: { value: mouseInteraction }, uHorizonColor: { value: new Float32Array(hexToRgb(horizonColor)) }, uWaveColor: { value: new Float32Array(hexToRgb(waveColor)) }, uCrestColor: { value: new Float32Array(hexToRgb(crestColor)) },
      };
      const program = new Program(gl, { vertex, fragment, uniforms });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      const resize = () => { const bounds = container.getBoundingClientRect(); renderer?.setSize(Math.max(1, Math.floor(bounds.width)), Math.max(1, Math.floor(bounds.height))); uniforms.iResolution.value[0] = gl.drawingBufferWidth; uniforms.iResolution.value[1] = gl.drawingBufferHeight; renderer?.render({ scene: mesh }); };
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
      const currentMouse = [.5, .5]; const targetMouse = [.5, .5];
      const move = (event: PointerEvent) => { const bounds = canvas.getBoundingClientRect(); targetMouse[0] = (event.clientX - bounds.left) / Math.max(1, bounds.width); targetMouse[1] = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height); };
      const leave = () => { targetMouse[0] = .5; targetMouse[1] = .5; };
      canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
      let inViewport = true; let pageVisible = !document.hidden; let lastRender = 0; const frameInterval = 1000 / 30; const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; const start = performance.now();
      const stop = () => { if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = 0; } };
      const loop = (time: number) => { if (time - lastRender >= frameInterval) { lastRender = time; uniforms.iTime.value = (time - start) * .001; const targetX = mouseEnabledRef.current ? targetMouse[0] : .5; const targetY = mouseEnabledRef.current ? targetMouse[1] : .5; currentMouse[0] += .05 * (targetX - currentMouse[0]); currentMouse[1] += .05 * (targetY - currentMouse[1]); uniforms.uMouse.value[0] = currentMouse[0]; uniforms.uMouse.value[1] = currentMouse[1]; renderer?.render({ scene: mesh }); } animationFrame = requestAnimationFrame(loop); };
      const startLoop = () => { if (inViewport && pageVisible && !reducedMotion && !animationFrame) animationFrame = requestAnimationFrame(loop); };
      intersectionObserver = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; inViewport ? startLoop() : stop(); }, { threshold: 0 }); intersectionObserver.observe(container);
      const visibility = () => { pageVisible = !document.hidden; pageVisible ? startLoop() : stop(); };
      document.addEventListener("visibilitychange", visibility); renderer.render({ scene: mesh }); startLoop();
      cleanup = () => { stop(); resizeObserver?.disconnect(); intersectionObserver?.disconnect(); document.removeEventListener("visibilitychange", visibility); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); if (canvas.parentElement === container) container.removeChild(canvas); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
    } catch { enableFallback(); }
    return () => cleanup();
  }, []);

  useEffect(() => { mouseEnabledRef.current = mouseInteraction; }, [mouseInteraction]);
  return <div ref={containerRef} className={`gradient-waves ${className}`.trim()} aria-hidden="true" />;
}
