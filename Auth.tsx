import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { startLogin } from "@/const";

export default function Auth() {
  return (
    <div className="auth-shell">
      <div className="auth-backdrop" />
      <header className="auth-nav"><a className="landing-brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span><strong>COST<span>/</span>SENTINEL</strong><small>FINOPS INTELLIGENCE</small></span></a><a className="auth-back" href="/"><ArrowLeft size={15} /> Back to overview</a></header>
      <main className="auth-layout">
        <section className="auth-story"><div className="landing-eyebrow"><span className="live-dot" /> PRIVATE COMMAND CENTER · SAFE ACCESS</div><h1>Turn the next spike into a decision.</h1><p>Sign in to keep your investigations, operator feedback, and simulated guardrails in one FinOps workspace.</p><div className="auth-benefits"><div><span><ShieldCheck size={16} /></span><div><strong>Audit-ready reasoning</strong><small>Every root cause carries evidence and confidence.</small></div></div><div><span><Sparkles size={16} /></span><div><strong>Learning loop included</strong><small>Feedback tunes the next signal, not just the current screen.</small></div></div><div><span><LockKeyhole size={16} /></span><div><strong>Safe by default</strong><small>Demo data is isolated and never reaches production systems.</small></div></div></div></section>
        <section className="auth-card"><div className="auth-card-kicker">WELCOME BACK</div><h2>Enter Cost Sentinel</h2><p>Use the secure Manus sign-in flow to open your command center.</p><button className="auth-primary" onClick={startLogin}>Continue with secure sign-in <ArrowRight size={16} /></button><div className="auth-divider"><span>or</span></div><button className="auth-demo" onClick={() => { window.location.href = "/command-center"; }}>Open safe demo without signing in</button><div className="auth-note"><Check size={14} /> No production cloud credentials are required.</div></section>
      </main>
      <footer className="landing-footer"><span>Protected workspace</span><span>Mock APIs · synthetic billing feed · isolated evaluation</span></footer>
    </div>
  );
}
