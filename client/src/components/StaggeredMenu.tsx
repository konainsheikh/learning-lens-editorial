/* Learning Lenz mobile navigation: React Bits-inspired staggered panel with a precise editorial motion rhythm. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";

type StaggeredMenuItem = { label: string; ariaLabel: string; link: string };
type StaggeredSocialItem = { label: string; link: string };

type StaggeredMenuProps = {
  items: StaggeredMenuItem[];
  socialItems: StaggeredSocialItem[];
  logoUrl: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};

export default function StaggeredMenu({ items, socialItems, logoUrl, onNavigate, onMenuOpen, onMenuClose }: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef(false);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const lockedScrollRef = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const panel = panelRef.current;
      const layers = preLayersRef.current ? Array.from(preLayersRef.current.children) : [];
      if (!panel) return;
      gsap.set([panel, ...layers], { xPercent: 100 });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: "50% 50%" });
    }, wrapperRef);
    return () => context.revert();
  }, []);

  const openMenu = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayersRef.current ? Array.from(preLayersRef.current.children) : [];
    if (!panel) return;
    closeTweenRef.current?.kill();
    openTimelineRef.current?.kill();
    const labels = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const numbers = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-item"));
    const socials = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));
    gsap.set(labels, { yPercent: 135, rotate: 7 });
    gsap.set(numbers, { "--sm-number-opacity": 0 });
    gsap.set(socials, { y: 14, opacity: 0 });
    const timeline = gsap.timeline();
    layers.forEach((layer, index) => timeline.to(layer, { xPercent: 0, duration: .46, ease: "power4.out" }, index * .06));
    const panelStart = Math.max(0, (layers.length - 1) * .06 + .05);
    timeline.to(panel, { xPercent: 0, duration: .62, ease: "power4.out" }, panelStart);
    timeline.to(labels, { yPercent: 0, rotate: 0, duration: .82, ease: "power4.out", stagger: .075 }, panelStart + .14);
    timeline.to(numbers, { "--sm-number-opacity": 1, duration: .45, ease: "power2.out", stagger: .06 }, panelStart + .22);
    timeline.to(socials, { y: 0, opacity: 1, duration: .42, ease: "power3.out", stagger: .07 }, panelStart + .32);
    openTimelineRef.current = timeline;
    gsap.to(iconRef.current, { rotate: 225, duration: .68, ease: "power4.out", overwrite: true });
  }, []);

  const closeMenu = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayersRef.current ? Array.from(preLayersRef.current.children) : [];
    if (!panel) return;
    openTimelineRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([panel, ...layers], { xPercent: 100, duration: .3, ease: "power3.in", overwrite: "auto" });
    gsap.to(iconRef.current, { rotate: 0, duration: .32, ease: "power3.inOut", overwrite: true });
  }, []);

  const toggleMenu = () => {
    const next = !openRef.current;
    openRef.current = next;
    setOpen(next);
    if (next) {
      onMenuOpen?.();
      openMenu();
    } else {
      onMenuClose?.();
      closeMenu();
    }
  };

  const handleClose = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    closeMenu();
  }, [closeMenu, onMenuClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  useLayoutEffect(() => {
    if (!open) return;
    const body = document.body;
    const root = document.documentElement;
    lockedScrollRef.current = { x: window.scrollX, y: window.scrollY };
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow, scrollBehavior: root.style.scrollBehavior };
    root.classList.add("learning-lenz-menu-open");
    body.classList.add("learning-lenz-menu-open");
    root.style.scrollBehavior = "auto";
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollRef.current.y}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      const { x, y } = lockedScrollRef.current;
      root.classList.remove("learning-lenz-menu-open");
      body.classList.remove("learning-lenz-menu-open");
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(x, y);
      window.requestAnimationFrame(() => { root.style.scrollBehavior = previous.scrollBehavior; });
    };
  }, [open]);

  return <div className="learning-lenz-staggered-menu" ref={wrapperRef} data-open={open || undefined}>
    <button ref={toggleRef} className="sm-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="learning-lenz-mobile-menu" onClick={toggleMenu} type="button">
      <span className="sm-toggle-copy" aria-hidden="true">{open ? "Close" : "Menu"}</span>
      <span className="sm-icon" ref={iconRef} aria-hidden="true"><i /><i /></span>
    </button>
    <button type="button" className="sm-backdrop" aria-label="Close navigation" tabIndex={open ? 0 : -1} onClick={handleClose} />
    <div className="sm-prelayers" ref={preLayersRef} aria-hidden="true"><i /><i /></div>
    <aside className="staggered-menu-panel" id="learning-lenz-mobile-menu" ref={panelRef} aria-hidden={!open} aria-modal="true" role="dialog" aria-label="Mobile navigation">
      <div className="sm-panel-top"><img src={logoUrl} alt="Learning Lenz" /><button type="button" aria-label="Close navigation" tabIndex={open ? 0 : -1} onClick={handleClose}><span>Close</span><b aria-hidden="true">×</b></button></div>
      <nav className="sm-panel-inner" aria-label="Learning Lenz sections">
        <ol className="sm-panel-list">{items.map((item, index) => <li key={item.link}><a className="sm-panel-item" href={item.link} aria-label={item.ariaLabel} tabIndex={open ? 0 : -1} onClick={(event) => { onNavigate(event, item.link); handleClose(); }}><span className="sm-panel-itemLabel">{item.label}</span><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b></a></li>)}</ol>
        <div className="sm-socials"><p>Connect</p><div>{socialItems.map((social) => <a key={social.label} href={social.link} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="sm-socials-link">{social.label}</a>)}</div></div>
      </nav>
    </aside>
  </div>;
}
