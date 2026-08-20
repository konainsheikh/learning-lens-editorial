/* Learning Lenz intro: scroll-driven expansion adapted from the user-provided React Bits Scroll Expand pattern. */
import { useCallback, useEffect, useRef, type ReactNode } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const progress = clamp((value - edge0) / (edge1 - edge0 || .000001), 0, 1);
  return progress * progress * (3 - 2 * progress);
};

type ScrollExpandProps = {
  src?: string;
  alt?: string;
  title: ReactNode;
  scrollHint: string;
  children?: ReactNode;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  enabled?: boolean;
  className?: string;
  onProgress?: (progress: number) => void;
  onRelease?: () => void;
  onRetract?: () => void;
  mediaMode?: "image" | "none";
  titleExitMode?: "standard" | "word";
};

export default function ScrollExpand({
  src, alt, title, scrollHint, children, startWidth = 50, startHeight = 62, startRadius = 24, endRadius = 0,
  mediaZoom = 1.28, scrollDistance = 1.05, holdDistance = .28, smoothing = .08, overlayScrim = .54,
  enabled = true, className = "", onProgress, onRelease, onRetract, mediaMode = "image", titleExitMode = "standard",
}: ScrollExpandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const releasedRef = useRef(false);
  const propsRef = useRef({ startWidth, startHeight, startRadius, endRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, enabled, onProgress, onRelease, onRetract });
  propsRef.current = { startWidth, startHeight, startRadius, endRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, enabled, onProgress, onRelease, onRetract };

  const applyProgress = useCallback((progress: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    const root = rootRef.current;
    if (!frame) return;
    const config = propsRef.current;
    const eased = smoothstep(0, 1, progress);
    const frameProgress = mediaMode === "none" ? smoothstep(0, .44, progress) : eased;
    const width = config.startWidth + (100 - config.startWidth) * frameProgress;
    const height = config.startHeight + (100 - config.startHeight) * frameProgress;
    const insetX = Math.max(0, (100 - width) / 2);
    const insetY = Math.max(0, (100 - height) / 2);
    const radius = config.startRadius + (config.endRadius - config.startRadius) * frameProgress;
    frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
    root?.style.setProperty("--se-progress", `${progress}`);
    root?.style.setProperty("--welcome-wave-opacity", `${1 - smoothstep(.10, .16, progress)}`);
    root?.style.setProperty("--story-backdrop-opacity", `${smoothstep(.10, .17, progress)}`);
    if (media) {
      media.style.transform = `scale(${config.mediaZoom + (1 - config.mediaZoom) * eased})`;
      media.style.opacity = `${smoothstep(.08, .55, progress)}`;
    }
    if (scrimRef.current) scrimRef.current.style.opacity = `${config.overlayScrim * eased}`;
    const titleExit = smoothstep(.38, .82, progress);
    if (titleRef.current && titleExitMode === "standard") {
      titleRef.current.style.opacity = `${1 - titleExit}`;
      titleRef.current.style.transform = `translate3d(0, ${-25 * titleExit}px, 0) scale(${1 + .05 * titleExit})`;
    }
    if (titleRef.current && titleExitMode === "word") {
      titleRef.current.style.opacity = "1";
      titleRef.current.style.transform = "none";
      const welcomeContent = titleRef.current.querySelector<HTMLElement>(".glass-welcome-content");
      if (welcomeContent) {
        const welcomeExit = smoothstep(.08, .13, progress);
        welcomeContent.style.opacity = `${1 - welcomeExit}`;
        welcomeContent.style.transform = `translate3d(0, ${-18 * welcomeExit}px, 0)`;
      }
      titleRef.current.querySelectorAll<HTMLElement>("[data-scroll-word]").forEach((word, index) => {
        const wordExit = smoothstep(.01 + index * .02, .055 + index * .02, progress);
        word.style.opacity = `${1 - wordExit}`;
        word.style.transform = "none";
        word.style.filter = `blur(${4 * wordExit}px)`;
      });
    }
    const hintExit = smoothstep(0, .12, progress);
    if (hintRef.current) {
      hintRef.current.style.opacity = `${1 - hintExit}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * hintExit}px, 0)`;
    }
    const hasScrollStory = root?.querySelector("[data-story-step]");
    const overlayEnter = hasScrollStory ? smoothstep(.10, .17, progress) : smoothstep(.68, 1, progress);
    if (overlayRef.current) {
      overlayRef.current.style.opacity = `${overlayEnter}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - overlayEnter)}px, 0)`;
    }
    if (root) {
      const storyWindows = [
        [.12, .17, .33, .38],
        [.42, .47, .60, .65],
        [.70, .75, .86, .91],
        [.97, .99, 1.2, 1.3],
      ];
      root.querySelectorAll<HTMLElement>("[data-story-step]").forEach((step, index) => {
        const [enterStart, enterEnd, exitStart, exitEnd] = storyWindows[index] ?? storyWindows[storyWindows.length - 1];
        const enter = smoothstep(enterStart, enterEnd, progress);
        const exit = smoothstep(exitStart, exitEnd, progress);
        const visibility = enter * (1 - exit);
        step.style.opacity = `${visibility}`;
        step.style.transform = `translate3d(0, ${22 * (1 - enter) - 16 * exit}px, 0) scale(${.97 + .03 * enter})`;
      });
    }
  }, [titleExitMode]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!propsRef.current.enabled || reduceMotion) {
      applyProgress(1);
      propsRef.current.onProgress?.(1);
      if (!releasedRef.current) { releasedRef.current = true; propsRef.current.onRelease?.(); }
      return;
    }
    let frame = 0;
    let current = 0;
    let target = 0;
    let releaseProgress = 0;
    let stageHeight = 0;
    let active = false;
    let introNearby = true;
    let pageVisible = !document.hidden;

    const measure = () => {
      const config = propsRef.current;
      stageHeight = window.innerHeight;
      stage.style.height = `${stageHeight}px`;
      track.style.height = `${stageHeight * (1 + Math.max(0, config.scrollDistance) + Math.max(0, config.holdDistance))}px`;
      stage.style.setProperty("--se-title-size", `${clamp(root.clientWidth * .075, 26, 92)}px`);
    };
    const readProgress = () => clamp(-track.getBoundingClientRect().top / (stageHeight * Math.max(.01, propsRef.current.scrollDistance)), 0, 1);
    const readReleaseProgress = () => clamp(-track.getBoundingClientRect().top / (stageHeight * Math.max(.01, propsRef.current.scrollDistance + propsRef.current.holdDistance)), 0, 1);
    const render = () => {
      const config = propsRef.current;
      const easing = config.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * config.smoothing));
      current += (target - current) * easing;
      if (Math.abs(target - current) < .0004) { current = target; active = false; }
      applyProgress(current);
      config.onProgress?.(current);
      if (releaseProgress >= .995 && !releasedRef.current) { releasedRef.current = true; config.onRelease?.(); }
      if (releaseProgress < .93 && releasedRef.current) { releasedRef.current = false; config.onRetract?.(); }
      if (active && introNearby && pageVisible) frame = requestAnimationFrame(render);
    };
    const onScroll = () => {
      if (!introNearby || !pageVisible) return;
      target = readProgress();
      releaseProgress = readReleaseProgress();
      if (reduceMotion || propsRef.current.smoothing <= 0) {
        current = target;
        applyProgress(current);
        propsRef.current.onProgress?.(current);
        if (releaseProgress >= .995 && !releasedRef.current) { releasedRef.current = true; propsRef.current.onRelease?.(); }
        if (releaseProgress < .93 && releasedRef.current) { releasedRef.current = false; propsRef.current.onRetract?.(); }
        return;
      }
      if (!active) { active = true; frame = requestAnimationFrame(render); }
    };
    const onResize = () => { measure(); target = readProgress(); releaseProgress = readReleaseProgress(); current = target; applyProgress(current); };
    const viewportObserver = new IntersectionObserver(([entry]) => {
      introNearby = entry.isIntersecting;
      if (!introNearby && frame) { cancelAnimationFrame(frame); frame = 0; active = false; }
      if (introNearby) onScroll();
    }, { rootMargin: "220px 0px", threshold: 0 });
    const visibility = () => {
      pageVisible = !document.hidden;
      if (!pageVisible && frame) { cancelAnimationFrame(frame); frame = 0; active = false; }
      if (pageVisible && introNearby) onScroll();
    };
    measure();
    target = readProgress();
    releaseProgress = readReleaseProgress();
    current = target;
    applyProgress(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", visibility);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    viewportObserver.observe(root);
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); viewportObserver.disconnect(); };
  }, [applyProgress]);

  return <div ref={rootRef} className={`scroll-expand scroll-expand--window ${className}`.trim()} data-media-mode={mediaMode} data-title-exit={titleExitMode}>
    <div ref={trackRef} className="scroll-expand__track">
      <div ref={stageRef} className="scroll-expand__stage">
        <div ref={frameRef} className="scroll-expand__frame">{mediaMode === "image" && src ? <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt ?? ""} draggable={false} /> : null}<div ref={scrimRef} className="scroll-expand__scrim" />{children ? <div ref={overlayRef} className="scroll-expand__overlay">{children}</div> : null}</div>
        <div ref={titleRef} className="scroll-expand__title">{title}</div>
        <div ref={hintRef} className="scroll-expand__hint">{scrollHint}</div>
      </div>
    </div>
  </div>;
}
