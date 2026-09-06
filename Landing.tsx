import { useEffect, useRef, useState } from "react";
import { ArrowRight, BrainCircuit, Check, GitBranch, LineChart, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { startLogin } from "@/const";

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frames: number[] = [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.classList.add("is-visible");
        observer.unobserve(element);
        if (!element.classList.contains("count-up") || element.dataset.started) return;
        element.dataset.started = "true";
        const index = Number(element.dataset.index ?? 0);
        const target = Number(element.dataset.target ?? 0);
        if (reducedMotion) {
          setCounts((current) => current.map((value, itemIndex) => itemIndex === index ? target : value));
          return;
        }
        const startedAt = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - startedAt) / 1300, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCounts((current) => current.map((value, itemIndex) => itemIndex === index ? Math.round(target * eased) : value));
          if (progress < 1) frames.push(window.requestAnimationFrame(animate));
        };
        frames.push(window.requestAnimationFrame(animate));
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".scroll-reveal, .count-up").forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); frames.forEach((frame) => window.cancelAnimationFrame(frame)); };
  }, []);

  const handleVisualMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = visualRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: Number((y * -5).toFixed(2)), y: Number((x * 5).toFixed(2)) });
  };

  return (
    <div className="landing-shell">
      <video className="landing-bg-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" /></video><div className="landing-video-shade" />
      {loading && <div className="landing-loader" role="status" aria-live="polite"><div className="loader-brand"><span className="brand-mark"><i /><i /><i /></span><div><strong>COST<span>/</span>SENTINEL</strong><small>FINOPS INTELLIGENCE</small></div></div><div className="loader-status"><span className="live-dot" /> Initializing command center</div><div className="loader-track"><span /></div><div className="loader-caption">Secure synthetic environment · preparing your workspace</div></div>}
      <header className="landing-nav">
        <a className="landing-brand" href="/">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><strong>COST<span>/</span>SENTINEL</strong><small>FINOPS INTELLIGENCE</small></span>
        </a>
        <nav><a href="#how-it-works">How it works</a><a href="#proof">Why Sentinel</a><a href="/auth">Sign in</a></nav>
        <button className="landing-nav-cta" onClick={startLogin}>Open command center <ArrowRight size={15} /></button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow"><span className="live-dot" /> SAFE SYNTHETIC CLOUD ENVIRONMENT · READY TO DEMO</div>
            <div className="trust-row"><span className="trust-ring"><b>◆</b></span><span className="trust-ring"><b>Λ</b></span><span className="trust-ring"><b>G</b></span><span className="trust-pill">Trusted for safe FinOps evaluation</span></div>
            <h1>Know <em>why</em> your cloud bill moved.</h1>
            <p>Cost Sentinel turns a billing spike into an evidence-backed investigation: which service, which team, which deploy, and what it will cost if nobody acts.</p>
            <div className="landing-actions"><button className="landing-primary" onClick={() => { window.location.href = "/auth"; }}>Start an investigation <ArrowRight size={17} /></button><a className="landing-secondary" href="/command-center">Explore the demo <Sparkles size={15} /></a></div>
            <div className="landing-trust"><span><Check size={13} /> CUR-style synthetic feed</span><span><Check size={13} /> z-score detector</span><span><Check size={13} /> no production access</span></div>
          </div>
          <div ref={visualRef} className="landing-hero-visual tilt-card" style={{ "--tilt-x": `${tilt.x}deg`, "--tilt-y": `${tilt.y}deg` } as React.CSSProperties} onMouseMove={handleVisualMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} aria-label="Command center preview">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-float float-signal"><span className="live-dot" /> 3 signals detected</div><div className="hero-float float-impact"><strong>+$71,966</strong><span>avoidable impact</span></div>
            <div className="hero-window-bar"><span /><span /><span /><small>command-center / anomaly AN-2048</small></div>
            <div className="hero-signal-card"><div className="hero-signal-top"><span><span className="live-dot" /> ANOMALY CONFIRMED</span><strong>z = 76.75σ</strong></div><h3>Amazon Bedrock · $2,964/day</h3><p>Runaway agent loop amplified by an autoscaling floor change.</p><div className="hero-score-row"><div><small>PROJECTED MONTHLY</small><strong>$88,920</strong></div><div><small>TOP DRIVER</small><strong>agent-loop-v3</strong></div></div></div>
            <div className="hero-mini-chart"><div className="chart-grid"><i /><i /><i /><i /></div><svg viewBox="0 0 500 150" preserveAspectRatio="none"><path d="M0 125 C80 121, 120 120, 180 115 S245 120, 285 105 S330 70, 360 30 S420 16, 500 10" fill="none" stroke="#d8ff87" strokeWidth="4" /><path d="M0 125 C80 121, 120 120, 180 115 S245 120, 285 105 S330 70, 360 30 S420 16, 500 10 V150 H0 Z" fill="url(#heroFill)" /></svg></div>
            <div className="hero-window-foot"><span><Target size={13} /> 4 correlated signals</span><span><ShieldCheck size={13} /> audit trace committed</span></div>
          </div>
        </section>

        <section id="proof" className="landing-proof scroll-reveal"><div><span className="proof-number">01</span><h2>Beyond “your spend is high.”</h2><p>Sentinel combines cost deviation, usage movement, and operational change intensity to separate a real incident from a planned scale-up.</p></div><div className="proof-grid"><article className="scroll-reveal"><span className="proof-icon lime"><LineChart size={18} /></span><strong>Multi-signal scoring</strong><p>Cost + usage + changes in one transparent score.</p></article><article className="scroll-reveal"><span className="proof-icon cyan"><BrainCircuit size={18} /></span><strong>Evidence-backed AI</strong><p>Top events, confidence, and usage/rate classification.</p></article><article className="scroll-reveal"><span className="proof-icon amber"><GitBranch size={18} /></span><strong>Counterfactual planning</strong><p>Test a cap or capacity choice before the next invoice.</p></article></div></section>

        <section id="how-it-works" className="landing-flow scroll-reveal"><div className="flow-heading"><span className="proof-number">02</span><h2>From signal to decision in one command center.</h2></div><div className="flow-steps"><div className="scroll-reveal"><span>01</span><strong>Ingest</strong><p>CUR-style billing rows, usage signals, tags, regions, and mock CloudTrail events.</p></div><div className="scroll-reveal"><span>02</span><strong>Detect</strong><p>Statistical baseline and multi-signal score identify the anomaly with a clear trail.</p></div><div className="scroll-reveal"><span>03</span><strong>Explain</strong><p>Ranked root causes turn the spike into a plain-English operator decision.</p></div><div className="scroll-reveal"><span>04</span><strong>Act</strong><p>Simulate savings, capture feedback, and make the next investigation sharper.</p></div></div></section>

        <section className="landing-bottom-cta scroll-reveal"><div><span className="landing-eyebrow"><Zap size={13} /> FINOPS COMMAND CENTER</span><h2>Stop triaging charts. Start closing causes.</h2></div><button className="landing-primary" onClick={startLogin}>Enter safe demo <ArrowRight size={17} /></button></section>
        <section className="landing-stats scroll-reveal"><div className="count-up" data-index="0" data-target="48"><strong>{counts[0]}</strong><span>CUR-style line items</span></div><div className="count-up" data-index="1" data-target="96"><strong>{counts[1]}<span>/100</span></strong><span>multi-signal score</span></div><div className="count-up" data-index="2" data-target="3"><strong>{counts[2]}</strong><span>ranked root causes</span></div><div className="count-up" data-index="3" data-target="88900"><strong>${(counts[3] / 1000).toFixed(1)}k</strong><span>projected monthly impact</span></div></section>
      </main>
      <footer className="landing-footer"><span>© Cost Sentinel · built for safe evaluation</span><span>Mock data only · no production cloud access</span></footer>
      <svg width="0" height="0" aria-hidden="true"><defs><linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8ff87" stopOpacity=".28" /><stop offset="100%" stopColor="#d8ff87" stopOpacity="0" /></linearGradient></defs></svg>
    </div>
  );
}
