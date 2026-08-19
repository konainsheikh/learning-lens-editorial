/* Learning Lenz welcome: project-local React Bits-inspired image-filled heading with responsive GSAP reveal. */
import { useCallback, useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import gsap from "gsap";

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

type MaskedHeadingProps = {
  text: string;
  src: string;
  mediaType?: "image" | "video";
  poster?: string;
  fillScale?: number;
  parallax?: number;
  reveal?: "rise" | "wipe" | "fade" | "none";
  trigger?: "mount" | "view";
  drift?: number;
  brightness?: number;
  saturation?: number;
  grayscale?: boolean;
  duration?: number;
  stagger?: number;
  align?: "left" | "center" | "right";
  weight?: number;
  tracking?: number;
  lineHeight?: number;
  textScale?: number;
  className?: string;
  style?: CSSProperties;
};

export default function MaskedHeading({
  text, src, mediaType = "image", poster = "", fillScale = 1.25, parallax = 26, reveal = "rise", trigger = "mount", drift = 18,
  brightness = 1, saturation = 1, grayscale = false, duration = 1.1, stagger = .09, align = "center", weight = 700,
  tracking = -.03, lineHeight = 1.06, textScale = .115, className = "", style,
}: MaskedHeadingProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const revealRef = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const baseRefs = useRef<Array<HTMLElement | null>>([]);
  const glyphRefs = useRef<Array<SVGTextElement | null>>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const clipId = `learning-lenz-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const lines = useMemo(() => String(text).split("\n").map((line) => line.trim().split(/\s+/).filter(Boolean)).filter((line) => line.length), [text]);
  const words = useMemo(() => lines.flat(), [lines]);
  const settingsRef = useRef({ fillScale, parallax, drift, brightness, saturation, grayscale, textScale });
  settingsRef.current = { fillScale, parallax, drift, brightness, saturation, grayscale, textScale };

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    const settings = settingsRef.current;
    const maxX = Math.max(0, ((settings.fillScale - 1) / 2) * root.clientWidth);
    const maxY = Math.max(0, ((settings.fillScale - 1) / 2) * root.clientHeight);
    const offset = offsetRef.current;
    media.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${settings.fillScale})`;
    media.style.filter = `brightness(${settings.brightness}) saturate(${settings.saturation})${settings.grayscale ? " grayscale(1)" : ""}`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    root.style.fontSize = `${clamp(root.clientWidth * settingsRef.current.textScale, 24, 170).toFixed(1)}px`;
    const computed = window.getComputedStyle(measure);
    glyphRefs.current.forEach((glyph, index) => {
      const word = wordRefs.current[index];
      const base = baseRefs.current[index];
      if (!glyph || !word || !base) return;
      glyph.setAttribute("x", `${word.offsetLeft}`);
      glyph.setAttribute("y", `${base.offsetTop}`);
      glyph.style.fontFamily = computed.fontFamily;
      glyph.style.fontSize = computed.fontSize;
      glyph.style.fontWeight = computed.fontWeight;
      glyph.style.letterSpacing = computed.letterSpacing;
    });
    place();
  }, [place]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    sync();
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(root);
    document.fonts?.ready.then(sync).catch(() => undefined);
    let animationFrame = 0;
    let inViewport = true;
    let pageVisible = !document.hidden;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let previousTime = performance.now();
    let clock = 0;
    const frame = (now: number) => {
      const delta = Math.min(.05, (now - previousTime) / 1000);
      previousTime = now;
      clock += delta;
      const settings = settingsRef.current;
      const offset = offsetRef.current;
      const easing = 1 - Math.exp(-delta / .18);
      offset.x += (offset.tx + Math.sin(clock * .21) * settings.drift - offset.x) * easing;
      offset.y += (offset.ty + Math.cos(clock * .17) * settings.drift * .6 - offset.y) * easing;
      place();
      if (inViewport && pageVisible && !reducedMotion) animationFrame = requestAnimationFrame(frame);
    };
    const move = (event: PointerEvent) => {
      if (settingsRef.current.parallax <= 0) return;
      const bounds = root.getBoundingClientRect();
      offsetRef.current.tx = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width) * 2 - 1, -1, 1) * -settingsRef.current.parallax;
      offsetRef.current.ty = clamp((event.clientY - bounds.top) / Math.max(1, bounds.height) * 2 - 1, -1, 1) * -settingsRef.current.parallax;
    };
    const leave = () => { offsetRef.current.tx = 0; offsetRef.current.ty = 0; };
    const stop = () => { if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = 0; } };
    const start = () => { if (inViewport && pageVisible && !reducedMotion && !animationFrame) { previousTime = performance.now(); animationFrame = requestAnimationFrame(frame); } };
    const observer = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; inViewport ? start() : stop(); }, { rootMargin: "160px 0px", threshold: .01 });
    const visibility = () => { pageVisible = !document.hidden; pageVisible ? start() : stop(); };
    observer.observe(root);
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    start();
    return () => { stop(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); resizeObserver.disconnect(); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave); };
  }, [place, sync]);

  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    const glyphs = glyphRefs.current.filter((glyph): glyph is SVGTextElement => Boolean(glyph));
    if (!root || !layer || !glyphs.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settle = () => { gsap.set(glyphs, { y: 0 }); gsap.set(layer, { opacity: 1, scale: 1, clipPath: "inset(0 0 0 0)" }); };
    const play = () => {
      tweenRef.current?.kill();
      if (reduceMotion || reveal === "none") { settle(); return; }
      if (reveal === "wipe") { tweenRef.current = gsap.fromTo(layer, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)", duration, ease: "power3.inOut" }); return; }
      if (reveal === "fade") { tweenRef.current = gsap.fromTo(layer, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration, ease: "power3.out" }); return; }
      tweenRef.current = gsap.fromTo(glyphs, { y: () => (Number.parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15 }, { y: 0, duration, stagger, ease: "power4.out", overwrite: "auto" });
    };
    if (trigger === "view" && !reduceMotion) {
      settle();
      gsap.set(glyphs, { y: () => (Number.parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15 });
      const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { play(); observer.disconnect(); } }, { threshold: .25 });
      observer.observe(root);
      return () => { observer.disconnect(); tweenRef.current?.kill(); };
    }
    play();
    return () => tweenRef.current?.kill();
  }, [duration, reveal, stagger, text, trigger]);

  let wordIndex = 0;
  return <h2 ref={rootRef} className={`masked-heading ${className}`.trim()} style={{ textAlign: align, fontWeight: weight, letterSpacing: `${tracking}em`, lineHeight, ...style }} aria-label={text}>
    <span ref={measureRef} className="masked-heading__measure" aria-hidden="true">{lines.map((line, lineIndex) => <span className="masked-heading__measure-line" key={`${line.join("-")}-${lineIndex}`}>{line.map((word) => { const index = wordIndex++; return <span className="masked-heading__word" key={`${word}-${index}`} ref={(element) => { wordRefs.current[index] = element; }}>{word}<i className="masked-heading__base" ref={(element) => { baseRefs.current[index] = element; }} /></span>; })}</span>)}</span>
    <svg className="masked-heading__defs" aria-hidden="true" focusable="false"><defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse">{words.map((word, index) => <text key={`${word}-${index}`} ref={(element) => { glyphRefs.current[index] = element; }}>{word}</text>)}</clipPath></defs></svg>
    <span ref={revealRef} className="masked-heading__reveal" aria-hidden="true"><span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}><span ref={mediaRef} className="masked-heading__media">{mediaType === "video" ? <video className="masked-heading__asset" src={src} poster={poster} autoPlay muted loop playsInline /> : <img className="masked-heading__asset" src={src} alt="" draggable={false} />}</span></span></span>
  </h2>;
}
