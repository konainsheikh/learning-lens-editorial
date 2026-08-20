/**
 * Study Momentum direction: the welcome is deliberately lightweight and CSS-led;
 * the complete editorial continuation preloads only after the first intentional scroll.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import ScrollExpand from "@/components/ScrollExpand";

const ReleasedExperience = lazy(() => import("./ReleasedExperience"));
let releasedExperienceLoader: Promise<typeof import("./ReleasedExperience")> | null = null;
const preloadReleasedExperience = () => { if (!releasedExperienceLoader) releasedExperienceLoader = import("./ReleasedExperience"); return releasedExperienceLoader; };

function GlassWelcomeTitle() { return <div className="glass-welcome-title" aria-label="Welcome to Learning Lenz"><div className="glass-welcome-bg" aria-hidden="true" /><div className="glass-welcome-content"><span className="glass-welcome-kicker">The Learning Lenz</span><div className="glass-welcome-words" aria-hidden="true"><span data-scroll-word>WELCOME</span><span data-scroll-word>TO</span><span data-scroll-word>LEARNING</span><span data-scroll-word>LENZ</span></div><span className="glass-welcome-rule" /></div></div>; }
function TeachingScrollStory() { return <div className="teaching-scroll-story" aria-label="Teaching you what matters. Clearer study. Stronger results. Accounting and Business tutoring."><i className="teaching-ambient teaching-ambient-a" aria-hidden="true" /><i className="teaching-ambient teaching-ambient-b" aria-hidden="true" /><i className="teaching-ambient teaching-ambient-c" aria-hidden="true" /><p data-story-step className="teaching-story-line teaching-story-line-primary">Teaching you</p><p data-story-step className="teaching-story-line teaching-story-line-accent">what matters.</p><p data-story-step className="teaching-story-line teaching-story-line-catch">Clearer study.<br />Stronger results.</p><p data-story-step className="teaching-story-line teaching-story-line-subject">Accounting <span>&amp;</span> Business tutoring</p></div>; }

export default function Home() {
  const [reduceMotion, setReduceMotion] = useState(false); const [introReleased, setIntroReleased] = useState(false);
  useEffect(() => { const query = window.matchMedia("(prefers-reduced-motion: reduce)"); const sync = () => { setReduceMotion(query.matches); if (query.matches) { preloadReleasedExperience(); setIntroReleased(true); } }; sync(); query.addEventListener("change", sync); return () => query.removeEventListener("change", sync); }, []);
  useEffect(() => { if (introReleased) preloadReleasedExperience(); }, [introReleased]);
  return <div className={`momentum-shell ${introReleased ? "intro-released" : "intro-active"}`}>
    <main id="top">{!reduceMotion && <ScrollExpand className="learning-lenz-intro learning-lenz-glass-intro" title={<GlassWelcomeTitle />} scrollHint="Scroll to reveal what matters" startWidth={52} startHeight={64} startRadius={26} endRadius={0} scrollDistance={3.1} holdDistance={.22} smoothing={.08} overlayScrim={0} enabled mediaMode="none" titleExitMode="word" onProgress={(progress) => { if (progress > .01) preloadReleasedExperience(); }} onRelease={() => setIntroReleased(true)} onRetract={() => setIntroReleased(false)}><TeachingScrollStory /></ScrollExpand>}{introReleased && <Suspense fallback={null}><ReleasedExperience reduceMotion={reduceMotion} /></Suspense>}</main>
  </div>;
}
