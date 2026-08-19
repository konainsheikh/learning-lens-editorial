/**
 * Study Momentum direction: warm-paper background, blue-teal ink, olive focus cues,
 * sky learning surfaces, Sora display type, Manrope reading type, intentional motion.
 * Taste Skill Hero direction: an editorial study folio with concise, exam-specific copy;
 * no decorative hero pills, caption strips, or generic dashboard-like ornament.
 * Mobile-only refinements below 768px reduce scroll without altering tablet or desktop composition.
 */
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion as motionDev, useReducedMotion } from "motion/react";
import ScrollExpand from "@/components/ScrollExpand";
import MoltenMetal from "@/components/MoltenMetal";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Instagram,
  Menu,
  MessageCircle,
  Play,
  X,
} from "lucide-react";

const StaggeredMenu = lazy(() => import("@/components/StaggeredMenu"));
const MaskedHeading = lazy(() => import("@/components/MaskedHeading"));
const GradientWaves = lazy(() => import("@/components/GradientWaves"));
let gsapLoader: Promise<typeof import("gsap").default> | null = null;
const getGSAP = () => {
  if (!gsapLoader) gsapLoader = import("gsap").then(({ default: gsap }) => gsap);
  return gsapLoader;
};

const WHATSAPP_URL = "https://wa.me/923144090277";
const INSTAGRAM_URL = "https://www.instagram.com/the.learning.lenz/";

const subjects = [
  { code: "01", title: "O Level Accounting & Business", short: "O Level", detail: "Build the foundations, understand the working, then use both with confidence in exam conditions.", label: "Core concepts + applied practice" },
  { code: "02", title: "IGCSE Accounting & Business", short: "IGCSE", detail: "Learn how each topic connects, with clear explanations and a steady route into past-paper practice.", label: "Clear systems + solid habits" },
  { code: "03", title: "A Level Accounting & Business", short: "A Level", detail: "Move through advanced frameworks and develop the analytical judgement that longer questions demand.", label: "Higher-level thinking + technique" },
  { code: "04", title: "ACCA FA", short: "Financial Accounting", detail: "Connect standards, working, and exam logic in Financial Accounting without losing sight of the bigger picture.", label: "Standards + structured working" },
  { code: "05", title: "ACCA MA / FMA", short: "Management Accounting", detail: "Make calculations, costing methods, and commercial thinking more logical and much less intimidating.", label: "Calculations + commercial clarity" },
];

const methods = [
  ["01", "Concept focus", "Deep clarity on tricky core Accounting principles, built smoothly from the ground up."],
  ["02", "Topical papers", "Master repetitive exam-question trends and answer layouts, step by step."],
  ["03", "Technique mastery", "Improve speed, time allocation, and custom scoring tactics for the paper in front of you."],
  ["04", "Active tracking", "Use continuous evaluation and supportive check-ins to keep progress visible."],
];

const stories = [
  { index: "01", quote: "Thank you for your support and all the work you’ve put into us throughout the session. Your clear teaching, patience and focus on what’s important has genuinely helped me a lot, and I’m so glad to say that I was able to get an A. I genuinely appreciate every lecture and all the motivation and guidance you’ve provided. Thanks again.", outcome: "A in Business" },
  { index: "02", quote: "Assalamualaikum Maam, the session with you was truly amazing. Your tips and techniques for the exams were really helpful, and I appreciate your unwavering support for all the students.", outcome: "Straight As in AS Level" },
  { index: "03", quote: "Miss, honestly I am really grateful to have a teacher like you. You really understood my weak points and helped me improve them. You’re a teacher who cares for their student’s emotional wellbeing as well, and your counselling helped me navigate through a lot of things.", outcome: "A in Business" },
];

const lessonSessions = [
  { number: "01", eyebrow: "Concept class", title: "Break down the foundations.", detail: "See focused whiteboard work and a clear explanation of the building blocks behind the topic.", href: "https://drive.google.com/file/d/1_V_sHoA3DY4R-l0Qw2y8iKTowojMaEeF/view?usp=sharing" },
  { number: "02", eyebrow: "Exam practice", title: "Turn questions into a plan.", detail: "Watch question analysis, technical review, and target strategy pacing come together in one session.", href: "https://drive.google.com/file/d/1quUZzuP7yw6vyU5ZOVYElQrWScgBrTR8/view?usp=sharing&t=7.725" },
];

const programs = [
  { title: "O Level / IGCSE", eyebrow: "Build strong foundations", points: ["50-minute target sessions", "Comprehensive concept building", "Learning Lens notes", "Topical paper analysis"] },
  { title: "AS & A Level", eyebrow: "Advance your approach", points: ["50-minute high-yield sessions", "Advanced accounting frameworks", "Core learning resources", "Exam technique & speed mastery"] },
  { title: "ACCA Professional", eyebrow: "Prepare with precision", points: ["50-minute intensive sessions", "FA & MA module specialization", "Strategic global exam pacing", "Case-study evaluations"] },
];

const faqs = [
  ["How long is each tutoring session?", "Every standard class is 50 minutes long, designed for focused learning without unnecessary cognitive fatigue."],
  ["Are study resources and past papers provided?", "Students receive access to specialized notes and custom learning resources. Physical past-paper compilations are purchased separately."],
  ["What happens if a student needs to miss a class?", "With at least 24 hours’ notice, the source describes a flexible rescheduling approach for the session."],
  ["Are sessions conducted in groups or strictly 1-on-1?", "Both structured small-group and intensive 1-on-1 learning are offered, based on the student's academic needs and learning pace."],
];

const sectionFade = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52 } },
};

const navItems = [
  ["Tutor", "#tutor"], ["Subjects", "#subjects"], ["Lessons", "#lessons"], ["Method", "#method"], ["Programs", "#programs"], ["FAQs", "#faqs"],
];

const mobileNavItems = [
  { label: "Tutor", ariaLabel: "Meet Fatima Sattar", link: "#tutor" }, { label: "Subjects", ariaLabel: "View tutoring subjects", link: "#subjects" }, { label: "Lessons", ariaLabel: "View sample lessons", link: "#lessons" }, { label: "Method", ariaLabel: "View the learning method", link: "#method" }, { label: "Stories", ariaLabel: "Read student success stories", link: "#stories" }, { label: "Programs", ariaLabel: "View tutoring programs", link: "#programs" }, { label: "FAQs", ariaLabel: "View frequently asked questions", link: "#faqs" },
];

const mobileSocialItems = [
  { label: "WhatsApp", link: WHATSAPP_URL }, { label: "Instagram", link: INSTAGRAM_URL },
];

function SpecularButton({
  href, children, className = "", target, rel, size = "lg", radius = 18, tint = "#ffffff", tintOpacity = 0,
  blur = 0, textColor = "#f5f5f5", lineColor = "#ffffff", baseColor = "#525252", intensity = 1,
  shineSize = 10, shineFade = 40, thickness = 1, speed = 0.35, followMouse = true, proximity = 250,
}: {
  href: string; children: ReactNode; className?: string; target?: string; rel?: string; size?: "sm" | "lg"; radius?: number;
  tint?: string; tintOpacity?: number; blur?: number; textColor?: string; lineColor?: string; baseColor?: string;
  intensity?: number; shineSize?: number; shineFade?: number; thickness?: number; speed?: number; followMouse?: boolean; proximity?: number;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const style = {
    "--spec-radius": `${radius}px`, "--spec-tint": tint, "--spec-tint-opacity": tintOpacity, "--spec-blur": `${blur}px`,
    "--spec-text": textColor, "--spec-line": lineColor, "--spec-base": baseColor, "--spec-intensity": intensity,
    "--spec-shine-size": `${shineSize}px`, "--spec-shine-fade": `${shineFade}%`, "--spec-thickness": `${thickness}px`,
    "--spec-speed": `${speed}s`, "--spec-proximity": `${proximity}px`,
  } as CSSProperties;

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!followMouse) return;
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--spec-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    button.style.setProperty("--spec-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleEnter = () => { const button = buttonRef.current; if (button) getGSAP().then((gsap) => gsap.to(button, { boxShadow: "0 0 0 1px rgba(217,239,255,.7), 0 12px 30px rgba(59,130,246,.18)", duration: 0.24, ease: "power2.out", overwrite: true })); };
  const handleLeave = () => { const button = buttonRef.current; if (button) getGSAP().then((gsap) => gsap.to(button, { boxShadow: "0 8px 20px rgba(23,50,77,.12)", duration: 0.24, ease: "power2.out", overwrite: true })); };

  return <a ref={buttonRef} className={`specular-button specular-${size} ${className}`} style={style} href={href} target={target} rel={rel} onPointerMove={handlePointerMove} onPointerEnter={handleEnter} onPointerLeave={handleLeave}><span className="specular-lens" /><span className="specular-content">{children}</span></a>;
}

function GooeyNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  return <nav className="gooey-nav" aria-label="Primary navigation">
    <svg className="gooey-filter" aria-hidden="true"><defs><filter id="learning-lens-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></defs></svg>
    {navItems.map(([label, href], index) => <a key={label} href={href} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className={activeIndex === index ? "is-active" : ""}>
      {activeIndex === index && <span className="gooey-active-wrap"><motionDev.i className="gooey-active-pill" layoutId="gooey-nav-pill" transition={{ type: "spring", stiffness: 380, damping: 28 }} />{[0, 1, 2, 3].map((particle) => <motionDev.b key={particle} className={`goo-particle goo-particle-${particle}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, .7, 0], scale: [0, 1, .3], x: [0, particle % 2 ? 16 : -16], y: [0, particle < 2 ? -11 : 11] }} transition={{ duration: .53, delay: particle * .035, ease: "easeOut" }} />)}</span>}
      <span>{label}</span>
    </a>)}
  </nav>;
}

function MagicBentoCard({ quote, outcome, index }: { quote: string; outcome: string; index: string }) {
  const cardRef = useRef<HTMLQuoteElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [motionActive, setMotionActive] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let inViewport = false;
    let pageVisible = !document.hidden;
    const syncMotion = () => setMotionActive(inViewport && pageVisible && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const observer = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; syncMotion(); }, { rootMargin: "180px 0px", threshold: .01 });
    const onVisibility = () => { pageVisible = !document.hidden; syncMotion(); };
    observer.observe(card);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tiltX = ((y / rect.height) - .5) * -5;
    const tiltY = ((x / rect.width) - .5) * 5;
    card.style.setProperty("--bento-x", `${x}px`);
    card.style.setProperty("--bento-y", `${y}px`);
    getGSAP().then((gsap) => gsap.to(card, { rotateX: tiltX, rotateY: tiltY, x: tiltY * .8, y: tiltX * -.8, duration: .28, ease: "power2.out", overwrite: true }));
  };
  const handleLeave = () => { const card = cardRef.current; if (card) getGSAP().then((gsap) => gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: .42, ease: "power3.out", overwrite: true })); };
  const handleClick = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = { id: Date.now(), x: event.clientX - rect.left, y: event.clientY - rect.top };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => setRipples((current) => current.filter((item) => item.id !== ripple.id)), 680);
  };

  return <blockquote ref={cardRef} className={`magic-bento-card testimonial-text-card ${motionActive ? "is-motion-active" : ""}`} onPointerMove={handleMove} onPointerLeave={handleLeave} onPointerDown={handleClick}>
    <MoltenMetal />
    <span className="bento-index">{index}</span><span className="bento-orbit" />
    <span className="bento-stars" aria-hidden="true"><i /><i /><i /><i /></span>
    <span className="testimonial-text-card__eyebrow">Student feedback</span><span className="testimonial-text-card__quote-mark" aria-hidden="true">“</span><p>{quote}</p><footer><span>Outcome</span><strong>{outcome}</strong></footer>
    {ripples.map((ripple) => <span key={ripple.id} className="bento-ripple" style={{ left: ripple.x, top: ripple.y }} />)}
  </blockquote>;
}

export default function Home() {
  const [activeSubject, setActiveSubject] = useState(2);
  const [activeLesson, setActiveLesson] = useState(0);
  const [activeMethod, setActiveMethod] = useState(0);
  const [activeStory, setActiveStory] = useState(0);
  const [activeProgram, setActiveProgram] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);
  const reduceMotion = useReducedMotion();
  const [introReleased, setIntroReleased] = useState(Boolean(reduceMotion));
  const rootRef = useRef<HTMLElement>(null);
  const storyCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) setIntroReleased(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !introReleased) return;
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup = () => undefined;
    getGSAP().then((gsap) => {
      if (disposed) return;
      const hoverCleanup: Array<() => void> = [];
      let revealObserver: IntersectionObserver | null = null;
      let orbitObserver: IntersectionObserver | null = null;
      let orbitTween: ReturnType<typeof gsap.to> | null = null;
      let onVisibility: (() => void) | null = null;
      const ctx = gsap.context(() => {
      const heroOrbit = root.querySelector<HTMLElement>(".hero-orbit-special");
      let heroVisible = true;
      let pageVisible = !document.hidden;
      orbitTween = heroOrbit ? gsap.to(heroOrbit, { y: -13, rotation: 4, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true }) : null;
      const syncOrbit = () => heroVisible && pageVisible ? orbitTween?.play() : orbitTween?.pause();
      orbitObserver = heroOrbit ? new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncOrbit(); }, { rootMargin: "160px 0px", threshold: .01 }) : null;
      if (heroOrbit) orbitObserver?.observe(heroOrbit);
      onVisibility = () => { pageVisible = !document.hidden; syncOrbit(); };
      document.addEventListener("visibilitychange", onVisibility);
      revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const kind = element.dataset.revealKind;
        if (kind === "section") gsap.fromTo(element.querySelectorAll<HTMLElement>(".gsap-item"), { y: 28 }, { y: 0, duration: .72, stagger: .09, ease: "power3.out", overwrite: "auto" });
        if (kind === "rail") gsap.fromTo(element, { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: "power3.out", transformOrigin: "left center", overwrite: "auto" });
        if (kind === "image") gsap.fromTo(element, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1, ease: "power3.inOut", overwrite: "auto" });
        if (kind === "headline") gsap.fromTo(element, { y: 25, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 0% 0)", duration: .78, ease: "power3.out", overwrite: "auto" });
        revealObserver?.unobserve(element);
      }), { rootMargin: "0px 0px 220px", threshold: .01 });
      root.querySelectorAll<HTMLElement>("[data-scroll-section]").forEach((section) => { section.dataset.revealKind = "section"; revealObserver?.observe(section); });
      root.querySelectorAll<HTMLElement>(".scroll-rail").forEach((rail) => { rail.dataset.revealKind = "rail"; revealObserver?.observe(rail); });
      root.querySelectorAll<HTMLElement>(".image-sweep").forEach((image) => { image.dataset.revealKind = "image"; revealObserver?.observe(image); });
      root.querySelectorAll<HTMLElement>("h2").forEach((headline) => { headline.dataset.revealKind = "headline"; revealObserver?.observe(headline); });
      root.querySelectorAll<HTMLElement>(".gsap-button").forEach((button) => {
        const enter = () => gsap.to(button, { y: -3, scale: 1.015, boxShadow: "0 14px 32px rgba(59, 130, 246, .26)", duration: 0.2, ease: "power2.out", overwrite: true });
        const leave = () => gsap.to(button, { y: 0, scale: 1, boxShadow: "0 0 0 rgba(59, 130, 246, 0)", duration: 0.22, ease: "power2.out", overwrite: true });
        button.addEventListener("mouseenter", enter);
        button.addEventListener("mouseleave", leave);
        button.addEventListener("focus", enter);
        button.addEventListener("blur", leave);
        hoverCleanup.push(() => {
          button.removeEventListener("mouseenter", enter);
          button.removeEventListener("mouseleave", leave);
          button.removeEventListener("focus", enter);
          button.removeEventListener("blur", leave);
        });
      });

      }, root);
      cleanup = () => { hoverCleanup.forEach((remove) => remove()); revealObserver?.disconnect(); orbitObserver?.disconnect(); orbitTween?.kill(); if (onVisibility) document.removeEventListener("visibilitychange", onVisibility); ctx.revert(); };
    });
    return () => { disposed = true; cleanup(); };
  }, [introReleased, reduceMotion]);

  const handleMobileNavigate = (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    window.history.pushState(null, "", href);
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, 270);
  };
  const active = subjects[activeSubject];
  const activeLessonItem = lessonSessions[activeLesson];
  const activeMethodItem = methods[activeMethod];
  const activeStoryItem = stories[activeStory];
  const activeProgramItem = programs[activeProgram];
  const scrollStoryTo = (index: number) => {
    const rail = storyCarouselRef.current;
    const slide = rail?.querySelector<HTMLElement>(`[data-story-index="${index}"]`);
    if (rail && slide) rail.scrollTo({ left: slide.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    setActiveStory(index);
  };
  const handleStoryCarouselScroll = () => {
    const rail = storyCarouselRef.current;
    if (!rail) return;
    const slides = Array.from(rail.querySelectorAll<HTMLElement>("[data-story-index]"));
    const closest = slides.reduce((best, slide) => Math.abs(slide.offsetLeft - rail.scrollLeft) < Math.abs(best.offsetLeft - rail.scrollLeft) ? slide : best, slides[0]);
    const nextIndex = Number(closest?.dataset.storyIndex);
    if (Number.isFinite(nextIndex)) setActiveStory(nextIndex);
  };
  const handleSurfacePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const surface = event.currentTarget;
    const rect = surface.getBoundingClientRect();
    surface.style.setProperty("--surface-x", `${event.clientX - rect.left}px`);
    surface.style.setProperty("--surface-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div className={`momentum-shell ${introReleased ? "intro-released" : "intro-active"}`}>
      {introReleased && <header className="momentum-header">
        <div className="page-wrap nav-wrap">
          <a className="momentum-brand" href="#top" aria-label="The Learning Lens home"><img className="brand-logo" src="/manus-storage/learning-lenz-logo_92a3e8bb.webp" alt="The Learning Lens graduation cap and book logo" decoding="async" /></a>
          <GooeyNav />
          <SpecularButton className="nav-specular" href={WHATSAPP_URL} target="_blank" rel="noreferrer" tint="#3b82f6" tintOpacity={0} textColor="#f5f5f5" lineColor="#d9efff" baseColor="#17324d" intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}>Book a free trial <ArrowRight size={16} /></SpecularButton>
          <Suspense fallback={null}><StaggeredMenu items={mobileNavItems} socialItems={mobileSocialItems} logoUrl="/manus-storage/learning-lenz-logo_92a3e8bb.webp" onNavigate={handleMobileNavigate} /></Suspense>
        </div>
      </header>}

      <main ref={rootRef} id="top">
        {!reduceMotion && <ScrollExpand className="learning-lenz-intro" src="/manus-storage/learning-lenz-intro_366e06b5.webp" alt="Student studying Accounting and Business notes" title={<div className="intro-masked-title"><Suspense fallback={null}><GradientWaves className="intro-gradient-waves" horizonColor="#eff7ff" waveColor="#d9efff" crestColor="#78aee8" speed={0.4} amplitude={2.5} waveScale={0.6} waveRatio={0.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={15} detail="medium" brightness={1} opacity={1} mouseInteraction parallaxStrength={0.5} grain grainIntensity={0.05} /></Suspense><h1 id="welcome-title" className="sr-only">Welcome to Learning Lenz</h1><Suspense fallback={null}><MaskedHeading text={"WELCOME TO\nLEARNING LENZ"} src="/manus-storage/learning-lenz-masked-heading-student_1eab19b8.webp" fillScale={1.25} parallax={26} reveal="rise" trigger="mount" drift={18} brightness={1} saturation={1} grayscale={false} duration={1.1} stagger={.09} align="center" weight={700} tracking={-.03} lineHeight={1.06} textScale={.115} /></Suspense><motionDev.img className="welcome-logo-v4" src="/manus-storage/learning-lenz-logo_92a3e8bb.webp" alt="Learning Lenz graduation cap and book logo" initial={reduceMotion ? false : { opacity: 0, y: -20, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .7, ease: "easeOut" }} /></div>} scrollHint="Scroll to enter Learning Lenz" startWidth={52} startHeight={64} startRadius={26} endRadius={0} mediaZoom={1.28} scrollDistance={1.05} holdDistance={.28} smoothing={.08} overlayScrim={.58} enabled onRelease={() => setIntroReleased(true)} onRetract={() => setIntroReleased(false)}>
          <span className="intro-release-copy">Teaching you<br />what matters<b>Accounting &amp; Business tutoring</b></span>
        </ScrollExpand>}

        {introReleased && <>
        <section className="hero-v2 hero-centered-v4" id="hero" aria-labelledby="hero-title">
          <div className="hero-atmosphere" aria-hidden="true"><span className="hero-paper-grid" /></div>
          <motionDev.div className="page-wrap hero-copy-v2 hero-copy-centered-v4" initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .45 }} transition={{ duration: .65, ease: "easeOut" }}>
              <p className="hero-kicker">Accounting &amp; Business tutoring</p>
              <h2 id="hero-title">Make the paper <em>make sense.</em></h2>
              <p className="hero-lead">Clear, targeted support for the topic, paper, or exam that is holding you back.</p>
              <div className="hero-actions-v2"><SpecularButton href={WHATSAPP_URL} target="_blank" rel="noreferrer" tint="#3b82f6" tintOpacity={0} textColor="#f5f5f5" lineColor="#d9efff" baseColor="#17324d" intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}>Book a free trial <ArrowRight size={18} /></SpecularButton><a className="button-quiet-v2" href="#subjects">View subjects</a></div>
          </motionDev.div>
        </section>

        <section className="tutor-v2" id="tutor" data-scroll-section aria-labelledby="tutor-title">
          <div className="tutor-atmosphere" aria-hidden="true" />
          <div className="page-wrap tutor-grid-v2">
            <div className="tutor-label gsap-item"><span>01</span><p>Meet your tutor</p></div>
            <motionDev.div className="tutor-copy-v2 gsap-item" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, ease: "easeOut" }}><p className="eyebrow-v2">An experienced guide, not a corporate bio</p><h2 id="tutor-title">Hi, I’m <em>Fatima Sattar.</em></h2><p className="body-large-v2">As an ACCA National Place Winner with more than six years of classroom and online instruction experience, I built The Learning Lens to bridge the gap between abstract text and genuine concept mastery.</p><div className="tutor-credentials-v4"><span><small>Experience</small><b>6+ years teaching</b></span><span><small>Perspective</small><b>ACCA F2 national place winner</b></span></div><a className="inline-link-v2" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Start working with me <ArrowRight size={17} /></a></motionDev.div>
            <motionDev.div className="tutor-points gsap-item" initial={{ opacity: 0, x: 22, rotate: 2 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: "spring", stiffness: 165, damping: 18 }} whileHover={{ y: -6, rotate: -1 }}><span>What to expect</span><p><Check size={17} />Clear explanations, made for the way you learn.</p><p><Check size={17} />Active exam technique, not passive worksheets.</p><p><Check size={17} />Calm, consistent support as you improve.</p><motionDev.div className="tutor-pulse" animate={reduceMotion ? { scale: 1, opacity: .2 } : { scale: [1, 1.25, 1], opacity: [.35, .08, .35] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }} /></motionDev.div>
          </div>
        </section>

        <section className="subjects-v2" id="subjects" data-scroll-section aria-labelledby="subjects-title">
          <div className="page-wrap subject-heading-v2 gsap-item"><div><p className="eyebrow-v2">02 / Subjects</p><h2 id="subjects-title">Find your <em>starting point.</em></h2></div><p>Choose your course to see where focused support can make the biggest difference.</p></div>
          <div className="page-wrap subject-explorer-v2 gsap-item">
            <div className="subject-tabs-v2" role="tablist" aria-label="Subjects">
              {subjects.map((subject, index) => <motionDev.button key={subject.code} className={activeSubject === index ? "is-active" : ""} type="button" role="tab" id={`subject-tab-${subject.code}`} aria-controls="subject-panel" aria-selected={activeSubject === index} onMouseEnter={() => setActiveSubject(index)} onFocus={() => setActiveSubject(index)} onClick={() => setActiveSubject(index)} layout transition={{ type: "spring", stiffness: 350, damping: 30 }}><span>{subject.code}</span>{subject.short}{activeSubject === index && <motionDev.i layoutId="active-subject-dot" transition={{ type: "spring", stiffness: 400, damping: 28 }} />}</motionDev.button>)}
            </div>
            <AnimatePresence mode="wait">
              <motionDev.article className="subject-panel-v2" key={active.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24, ease: "easeOut" }} role="tabpanel" id="subject-panel" aria-labelledby={`subject-tab-${active.code}`}>
                <div className="subject-big-number">{active.code}</div><div><p className="subject-panel-label">{active.label}</p><h3>{active.title}</h3><p>{active.detail}</p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Ask about this subject <ArrowRight size={16} /></a></div>
              </motionDev.article>
            </AnimatePresence>
          </div>
        </section>

        <section className="lessons-v2" id="lessons" data-scroll-section aria-labelledby="lessons-title">
          <div className="page-wrap lesson-showcase-v3 gsap-item">
            <header className="lesson-showcase-head"><div><p className="eyebrow-v2">03 / Sample lessons</p><h2 id="lessons-title">Experience a lecture firsthand before you commit.</h2></div><p>Explore the source lesson library before you book. One clip focuses on clarity; the other shows how we approach exam questions.</p></header>
            <div className="lesson-showcase-body">
              <figure className="lesson-visual-v3"><img src="/manus-storage/learning-lenz-notes_80fcc885.webp" alt="Organized revision notes and study tools" loading="lazy" decoding="async" /><figcaption><span>Learning Lens / watch the process</span><b>2 sample sessions</b></figcaption></figure>
              <div className="lesson-queue-v3">
                <article><div className="lesson-chip"><span>01</span><i>Concept class</i></div><h3>Break down the foundations.</h3><p>See focused whiteboard work and a clear explanation of the building blocks behind the topic.</p><SpecularButton className="lesson-specular" href="https://drive.google.com/file/d/1_V_sHoA3DY4R-l0Qw2y8iKTowojMaEeF/view?usp=sharing" target="_blank" rel="noreferrer" size="sm" radius={16} tint="#d9efff" tintOpacity={0} textColor="#f5f5f5" lineColor="#d9efff" baseColor="#17324d" intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}>Open lesson <ExternalLink size={15} /></SpecularButton></article>
                <article><div className="lesson-chip"><span>02</span><i>Exam practice</i></div><h3>Turn questions into a plan.</h3><p>Watch question analysis, technical review, and target strategy pacing come together in one session.</p><SpecularButton className="lesson-specular" href="https://drive.google.com/file/d/1quUZzuP7yw6vyU5ZOVYElQrWScgBrTR8/view?usp=sharing&t=7.725" target="_blank" rel="noreferrer" size="sm" radius={16} tint="#d9efff" tintOpacity={0} textColor="#17324d" lineColor="#3b82f6" baseColor="#d9efff" intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}>Open lesson <ExternalLink size={15} /></SpecularButton></article>
              </div>
            </div>
            <div className="lesson-mobile-v3">
              <div className="lesson-mobile-tablist" role="tablist" aria-label="Sample lessons">{lessonSessions.map((lesson, index) => <motionDev.button key={lesson.number} type="button" className={activeLesson === index ? "is-active" : ""} role="tab" id={`lesson-mobile-tab-${lesson.number}`} aria-selected={activeLesson === index} aria-controls="lesson-mobile-panel" onClick={() => setActiveLesson(index)} onFocus={() => setActiveLesson(index)}>{activeLesson === index && <motionDev.i layoutId="lesson-mobile-active" transition={{ type: "spring", stiffness: 410, damping: 31 }} />}<span>{lesson.number}</span><b>{lesson.eyebrow}</b></motionDev.button>)}</div>
              <AnimatePresence mode="wait"><motionDev.article key={activeLessonItem.number} className="lesson-mobile-panel" role="tabpanel" id="lesson-mobile-panel" aria-labelledby={`lesson-mobile-tab-${activeLessonItem.number}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22, ease: "easeOut" }}><p className="lesson-mobile-chip"><span>{activeLessonItem.number}</span>{activeLessonItem.eyebrow}</p><h3>{activeLessonItem.title}</h3><p>{activeLessonItem.detail}</p><SpecularButton className="lesson-specular" href={activeLessonItem.href} target="_blank" rel="noreferrer" size="sm" radius={16} tint="#d9efff" tintOpacity={0} textColor={activeLesson === 0 ? "#f5f5f5" : "#17324d"} lineColor={activeLesson === 0 ? "#d9efff" : "#3b82f6"} baseColor={activeLesson === 0 ? "#17324d" : "#d9efff"} intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}>Open lesson <ExternalLink size={15} /></SpecularButton></motionDev.article></AnimatePresence>
            </div>
          </div>
        </section>

        <section className="method-v2" id="method" data-scroll-section aria-labelledby="method-title">
          <div className="page-wrap method-showcase-v3 gsap-item">
            <header className="method-showcase-head"><div><p className="eyebrow-v2">04 / The method</p><h2 id="method-title">Less panic. More <em>progress.</em></h2></div><p>Every session follows a repeatable sequence that turns the next difficult chapter into a clear, practical plan.</p></header>
            <div className="method-showcase-body">
              <figure className="method-visual-v3"><img className="image-sweep" src="/manus-storage/learning-lenz-notebook_3925733f.webp" alt="A student writing notes beside an open study book" loading="lazy" decoding="async" /><figcaption><span>Build the understanding first.</span><b>4-step method</b></figcaption></figure>
              <div className="method-console-v3">
                <div className="method-tabs-v3" role="tablist" aria-label="Learning method stages">{methods.map(([number, title], index) => <motionDev.button key={number} type="button" className={activeMethod === index ? "is-active" : ""} role="tab" id={`method-tab-${number}`} aria-controls="method-detail" aria-selected={activeMethod === index} onClick={() => setActiveMethod(index)} onMouseEnter={() => setActiveMethod(index)} onFocus={() => setActiveMethod(index)} layout><span>{number}</span><b>{title}</b>{activeMethod === index && <motionDev.i layoutId="method-active-line" transition={{ type: "spring", stiffness: 410, damping: 31 }} />}</motionDev.button>)}</div>
                <AnimatePresence mode="wait"><motionDev.div className="method-detail-v3" role="tabpanel" id="method-detail" aria-labelledby={`method-tab-${activeMethodItem[0]}`} key={activeMethodItem[0]} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .25, ease: "easeOut" }}><span>{activeMethodItem[0]} / active step</span><h3>{activeMethodItem[1]}</h3><p>{activeMethodItem[2]}</p><div className="method-progress-v3"><i /><i className={activeMethod > 0 ? "is-filled" : ""} /><i className={activeMethod > 1 ? "is-filled" : ""} /><i className={activeMethod > 2 ? "is-filled" : ""} /></div></motionDev.div></AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <section className="stories-v2" id="stories" data-scroll-section aria-labelledby="stories-title" onPointerMove={handleSurfacePointerMove}>
          <div className="story-section-orbit" aria-hidden="true" /><div className="story-section-spark" aria-hidden="true" />
          <div className="page-wrap story-header-v2 gsap-item"><div><p className="eyebrow-v2">05 / Student success stories</p><h2 id="stories-title">When the work starts to <em>click.</em></h2></div><motionDev.span className="story-motion-cue" animate={reduceMotion ? { x: 0 } : { x: [0, 5, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}><i />Explore a story</motionDev.span></div>
          <div className="page-wrap story-carousel-v4" role="region" aria-roledescription="carousel" aria-label="Student success stories">
            <div className="story-carousel-rail" ref={storyCarouselRef} onScroll={handleStoryCarouselScroll} tabIndex={0} aria-label="Swipe or scroll to browse student stories">
              {stories.map((story, index) => <motionDev.div key={story.index} className="story-peek-slide" data-story-index={index} role="group" aria-roledescription="slide" aria-label={`Story ${index + 1} of ${stories.length}`} initial={reduceMotion ? false : { opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .4, delay: index * .05, ease: "easeOut" }}><MagicBentoCard index={story.index} quote={story.quote} outcome={story.outcome} /></motionDev.div>)}
            </div>
            <div className="story-carousel-controls"><button type="button" className="story-carousel-arrow is-previous" aria-label="Previous student story" onClick={() => scrollStoryTo((activeStory + stories.length - 1) % stories.length)}><ArrowRight size={17} /></button><div className="story-carousel-dots" aria-label="Choose student story">{stories.map((story, index) => <button key={story.index} type="button" aria-label={`Show story ${index + 1}`} aria-pressed={activeStory === index} className={activeStory === index ? "is-active" : ""} onClick={() => scrollStoryTo(index)} />)}</div><span>{activeStoryItem.index} / 03</span><button type="button" className="story-carousel-arrow" aria-label="Next student story" onClick={() => scrollStoryTo((activeStory + 1) % stories.length)}><ArrowRight size={17} /></button></div>
          </div>
        </section>

        <section className="programs-v2" id="programs" data-scroll-section aria-labelledby="programs-title">
          <div className="page-wrap program-showcase-v3 gsap-item">
            <header className="program-showcase-head"><div><p className="eyebrow-v2">06 / Programs</p><h2 id="programs-title">Choose your <em>next move.</em></h2></div><p>Pick the study stream in front of you. Each plan starts with the topics that will make the biggest difference.</p></header>
            <div className="program-grid-v3">{programs.map((program, index) => <article onPointerMove={handleSurfacePointerMove} className={`program-card-v3 ${index === 1 ? "is-featured" : ""}`} key={program.title}><span className="program-number-v3">0{index + 1}</span><p>{program.eyebrow}</p><h3>{program.title}</h3><ul>{program.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Explore this plan <ArrowRight size={16} /></a></article>)}</div>
            <div className="program-mobile-carousel" role="region" aria-roledescription="carousel" aria-label="Tutoring programs">
              <div className="mobile-carousel-window">
                <AnimatePresence mode="wait" initial={false}><motionDev.article key={activeProgramItem.title} onPointerMove={handleSurfacePointerMove} className={`program-card-v3 program-mobile-slide ${activeProgram === 1 ? "is-featured" : ""}`} role="group" aria-roledescription="slide" aria-label={`Program ${activeProgram + 1} of ${programs.length}`} initial={reduceMotion ? false : { opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }} transition={{ type: "spring", stiffness: 360, damping: 32 }}><span className="program-number-v3">0{activeProgram + 1}</span><p>{activeProgramItem.eyebrow}</p><h3>{activeProgramItem.title}</h3><ul>{activeProgramItem.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Explore this plan <ArrowRight size={16} /></a></motionDev.article></AnimatePresence>
              </div>
              <div className="mobile-carousel-controls"><button type="button" className="mobile-carousel-arrow is-previous" aria-label="Previous tutoring program" onClick={() => setActiveProgram((current) => (current + programs.length - 1) % programs.length)}><ArrowRight size={17} /></button><div className="mobile-carousel-dots" aria-label="Choose tutoring program">{programs.map((program, index) => <button key={program.title} type="button" aria-label={`Show ${program.title}`} aria-pressed={activeProgram === index} className={activeProgram === index ? "is-active" : ""} onClick={() => setActiveProgram(index)} />)}</div><span>0{activeProgram + 1} / 03</span><button type="button" className="mobile-carousel-arrow" aria-label="Next tutoring program" onClick={() => setActiveProgram((current) => (current + 1) % programs.length)}><ArrowRight size={17} /></button></div>
            </div>
          </div>
        </section>

        <section className="faq-v2" id="faqs" data-scroll-section aria-labelledby="faqs-title">
          <div className="page-wrap faq-showcase-v3 gsap-item">
            <aside className="faq-intro-v3"><p className="eyebrow-v2">07 / FAQs</p><h2 id="faqs-title">Questions are part of the <em>process.</em></h2><p>Start with the thing that is making the course feel harder than it needs to. A clearer answer is often the best next step.</p><span><MessageCircle size={17} />Direct, student-first support</span></aside>
            <div className="faq-accordion-v3">{faqs.map(([question, answer], index) => <motionDev.article className={faqOpen === index ? "is-open" : ""} key={question} layout transition={{ duration: .26, ease: "easeOut" }}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} aria-expanded={faqOpen === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`}><span className="faq-index-v3">0{index + 1}</span><span>{question}</span><motionDev.i aria-hidden="true" animate={{ rotate: faqOpen === index ? 45 : 0 }} transition={{ duration: .18 }}><ChevronDown size={20} /></motionDev.i></button><AnimatePresence initial={false}>{faqOpen === index && <motionDev.div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} className="faq-answer-v3" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .24, ease: "easeOut" }}><p>{answer}</p></motionDev.div>}</AnimatePresence></motionDev.article>)}</div>
          </div>
        </section>

        <section className="contact-v2" data-scroll-section aria-labelledby="contact-title"><div className="page-wrap contact-showcase-v3 gsap-item" onPointerMove={handleSurfacePointerMove}><div className="contact-orbit-v3" aria-hidden="true" /><motionDev.div className="contact-ping-v3" aria-hidden="true" animate={reduceMotion ? { scale: 1, opacity: .2 } : { scale: [1, 1.35, 1], opacity: [.35, .06, .35] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }} /><div className="contact-copy-v3"><p className="eyebrow-v2">Ready when you are</p><h2 id="contact-title">Make the hard part <em>make sense.</em></h2><p>Send a direct message to talk through the course, the exam, or the topic that is not clicking yet.</p><div><SpecularButton className="contact-specular" href={WHATSAPP_URL} target="_blank" rel="noreferrer" tint="#d9efff" tintOpacity={0} textColor="#f5f5f5" lineColor="#ffffff" baseColor="#3b82f6" intensity={1} shineSize={10} shineFade={40} thickness={1} speed={0.35} followMouse proximity={250}><MessageCircle size={18} />Contact me</SpecularButton><a className="contact-instagram-v2" href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram size={18} />@the.learning.lenz</a></div></div><div className="contact-stat-v3"><span>01</span><p>Your next session can start with the question you have right now.</p><b>Reach Out</b></div></div></section>
        </>}
      </main>

      {introReleased && <footer className="footer-v2"><div className="page-wrap footer-grid-v3"><div className="footer-brand-v3"><a className="footer-logo-v3" href="#top" aria-label="Back to the top of Learning Lenz"><img className="brand-logo" src="/manus-storage/learning-lenz-logo_92a3e8bb.webp" alt="Learning Lenz graduation cap and book logo" decoding="async" /><span>Learning <b>Lenz</b></span></a><p>Focused Accounting and Business tutoring for O Level, IGCSE, A Level, and ACCA students.</p><div className="footer-socials-v3"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Message Learning Lenz on WhatsApp" title="WhatsApp"><MessageCircle size={17} aria-hidden="true" /></a><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Follow Learning Lenz on Instagram" title="Instagram"><Instagram size={17} aria-hidden="true" /></a></div></div><nav className="footer-links-v3" aria-label="Footer navigation"><p>Explore</p><a href="#tutor">Meet the tutor</a><a href="#subjects">Subjects</a><a href="#lessons">Sample lessons</a><a href="#programs">Programs</a></nav><div className="footer-contact-v3"><p>Start with one question</p><strong>Need a clearer plan for the paper ahead?</strong><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Message Fatima <ArrowRight size={15} /></a></div></div><div className="page-wrap footer-bottom-v3"><span>© 2026 Learning Lenz. All rights reserved.</span><a href="#top">Back to top <ArrowRight size={14} /></a></div></footer>}
    </div>
  );
}
