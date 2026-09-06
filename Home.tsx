import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Cloud,
  Clock3,
  Command,
  DatabaseZap,
  Gauge,
  GitBranch,
  Info,
  Layers3,
  LineChart,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const costData = [
  { day: "Aug 25", total: 520, bedrock: 82, ecs: 164, other: 274 },
  { day: "Aug 26", total: 548, bedrock: 91, ecs: 171, other: 286 },
  { day: "Aug 27", total: 534, bedrock: 88, ecs: 167, other: 279 },
  { day: "Aug 28", total: 562, bedrock: 93, ecs: 176, other: 293 },
  { day: "Aug 29", total: 590, bedrock: 106, ecs: 182, other: 302 },
  { day: "Aug 30", total: 614, bedrock: 112, ecs: 195, other: 307 },
  { day: "Aug 31", total: 588, bedrock: 108, ecs: 188, other: 292 },
  { day: "Sep 01", total: 1140, bedrock: 402, ecs: 368, other: 370 },
  { day: "Sep 02", total: 2240, bedrock: 976, ecs: 722, other: 542 },
  { day: "Sep 03", total: 3186, bedrock: 1486, ecs: 1035, other: 665 },
  { day: "Sep 04", total: 3012, bedrock: 1392, ecs: 984, other: 636 },
  { day: "Sep 05", total: 2964, bedrock: 1372, ecs: 956, other: 636 },
];

const anomalies = [
  {
    id: "AN-2048",
    service: "Amazon Bedrock",
    account: "prod-ai / 4812",
    time: "Today, 02:15 UTC",
    value: "$1,486",
    delta: "+348%",
    severity: "Critical",
    score: 98,
    icon: BrainCircuit,
    color: "#d8ff87",
    summary: "Token spend accelerated without a matching request-volume increase.",
  },
  {
    id: "AN-2047",
    service: "Amazon ECS",
    account: "prod-core / 4812",
    time: "Yesterday, 18:42 UTC",
    value: "$1,035",
    delta: "+224%",
    severity: "High",
    score: 91,
    icon: Layers3,
    color: "#7dd3fc",
    summary: "Autoscaling floor changed from 3 → 10 during a low-traffic window.",
  },
  {
    id: "AN-2042",
    service: "CloudWatch Logs",
    account: "prod-ai / 4812",
    time: "Sep 03, 09:10 UTC",
    value: "$218",
    delta: "+86%",
    severity: "Medium",
    score: 74,
    icon: Activity,
    color: "#fbbf24",
    summary: "Verbose trace logging enabled for the agent orchestration namespace.",
  },
];

const events = [
  { time: "02:15 UTC", type: "CONFIG_CHANGE", title: "agent-loop-v3 feature flag enabled", actor: "platform-bot", accent: "lime" },
  { time: "02:18 UTC", type: "IAM_ACTIVITY", title: "Bedrock InvokeModel calls × 9.4", actor: "agent-runner-prod", accent: "cyan" },
  { time: "02:22 UTC", type: "SCALING_EVENT", title: "ECS minimum capacity 3 → 10", actor: "terraform-ci", accent: "amber" },
  { time: "02:31 UTC", type: "COST_SIGNAL", title: "Token spend crossed $100 daily guardrail", actor: "sentinel-detector", accent: "red" },
];

const agentSteps = [
  { name: "Detector", detail: "Joint signal score 98/100", icon: Target, state: "complete" },
  { name: "Investigator", detail: "4 evidence links correlated", icon: Search, state: "complete" },
  { name: "Explainer", detail: "Narrative + confidence generated", icon: MessageSquareText, state: "complete" },
  { name: "Remediator", detail: "3 actions ranked by impact", icon: Zap, state: "complete" },
  { name: "Auditor", detail: "Decision trace committed locally", icon: ShieldCheck, state: "complete" },
];

const serviceMix = [
  { name: "Bedrock", value: 48, color: "#d8ff87" },
  { name: "ECS", value: 32, color: "#7dd3fc" },
  { name: "CloudWatch", value: 9, color: "#fbbf24" },
  { name: "Other", value: 11, color: "#64748b" },
];

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "lime" | "red" | "amber" | "cyan" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function MetricCard({ label, value, change, hint, icon: Icon, accent = "lime" }: { label: string; value: string; change: string; hint: string; icon: React.ElementType; accent?: string }) {
  return (
    <div className="metric-card">
      <div className="metric-topline"><span>{label}</span><span className={`metric-icon metric-icon-${accent}`}><Icon size={16} /></span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot"><span className={change.startsWith("+") ? "up" : "down"}>{change.startsWith("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}</span><span>{hint}</span></div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><div className="tooltip-label">{label}</div>{payload.map((item: any) => <div className="tooltip-row" key={item.dataKey}><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCurrency(item.value)}</strong></div>)}</div>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedAnomaly, setSelectedAnomaly] = useState(anomalies[0]);
  const [investigating, setInvestigating] = useState(false);
  const [investigated, setInvestigated] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [cap, setCap] = useState(100);
  const [minCapacity, setMinCapacity] = useState(10);
  const [whatIf, setWhatIf] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState({ service: "All", team: "All", region: "All", deployId: "All", severity: "All" });
  const [scanStage, setScanStage] = useState(-1);
  const [actioned, setActioned] = useState<string[]>([]);
  const [backendInvestigation, setBackendInvestigation] = useState<any>(null);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const overviewQuery = trpc.sentinel.overview.useQuery();
  const detectMutation = trpc.sentinel.detect.useMutation();
  const investigateMutation = trpc.sentinel.investigate.useMutation();
  const whatIfMutation = trpc.sentinel.whatIf.useMutation();
  const feedbackMutation = trpc.sentinel.feedback.useMutation();
  const learningQuery = trpc.sentinel.learning.useQuery();
  const latestSnapshot = overviewQuery.data?.costs.at(-1);
  const totalSpend = latestSnapshot?.total ?? 2964;
  const challengeAnalysis = overviewQuery.data?.analysis;
  const primaryCause = challengeAnalysis?.rootCauses?.[0];
  const filterRecords = overviewQuery.data?.facets?.records ?? [];
  const filteredAnomalies = useMemo(() => anomalies.filter((item) => {
    const facet = filterRecords.find((record: any) => record.anomalyId === item.id);
    return facet && (filters.service === "All" || facet.service === filters.service) && (filters.team === "All" || facet.team === filters.team) && (filters.region === "All" || facet.region === filters.region) && (filters.deployId === "All" || facet.deployId === filters.deployId) && (filters.severity === "All" || item.severity === filters.severity);
  }), [filterRecords, filters]);
  const anomalyCount = overviewQuery.isLoading ? 3 : filteredAnomalies.length;
  const updateFilter = (key: keyof typeof filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const nextVisible = anomalies.filter((item) => {
      const facet = filterRecords.find((record: any) => record.anomalyId === item.id);
      return facet && (next.service === "All" || facet.service === next.service) && (next.team === "All" || facet.team === next.team) && (next.region === "All" || facet.region === next.region) && (next.deployId === "All" || facet.deployId === next.deployId) && (next.severity === "All" || item.severity === next.severity);
    });
    if (nextVisible.length) {
      setSelectedAnomaly(nextVisible[0]);
      setInvestigated(nextVisible[0].id === "AN-2048");
      setBackendInvestigation(null);
    }
  };
  const displayedEvidence = backendInvestigation?.evidenceRanking?.length
    ? backendInvestigation.evidenceRanking.map((event: any) => ({ time: event.eventTime, type: event.type, title: event.title, actor: event.actor, accent: event.accent }))
    : events;

  const savings = whatIfResult?.savings ?? Math.max(0, Math.round(1486 - cap * 1.12));
  const throttle = whatIfResult?.throttle ?? Math.min(28, Math.max(4, Math.round((100 - cap) * 0.18)));
  const projectedData = useMemo(() => costData.map((point, index) => ({ ...point, simulated: index > 7 ? Math.max(560, point.total - (index - 7) * savings * 0.44) : point.total })), [savings]);

  useEffect(() => {
    if (scanStage < 0 || scanStage >= 4) return;
    const timer = window.setTimeout(() => setScanStage((current) => current + 1), 650);
    return () => window.clearTimeout(timer);
  }, [scanStage]);

  const runInvestigation = () => {
    setInvestigating(true);
    setInvestigated(false);
    investigateMutation.mutate({ anomalyId: selectedAnomaly.id }, {
      onSuccess: (result) => {
        setBackendInvestigation(result);
        setInvestigating(false);
        setInvestigated(true);
      },
      onError: () => {
        setInvestigating(false);
        setInvestigated(true);
      },
    });
  };

  const runScan = () => {
    setScanStage(0);
    detectMutation.mutate();
  };

  const toggleAction = (title: string) => setActioned((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);

  const runWhatIf = () => {
    if (whatIf) {
      setWhatIf(false);
      return;
    }
    whatIfMutation.mutate({ anomalyId: selectedAnomaly.id, dailyCap: cap, minCapacity }, {
      onSuccess: (result) => {
        setWhatIfResult(result);
        setWhatIf(true);
      },
    });
  };

  const sendFeedback = (verdict: "correct" | "wrong") => {
    setFeedback(verdict);
    feedbackMutation.mutate({ anomalyId: selectedAnomaly.id, verdict });
  };

  const chooseAnomaly = (item: typeof anomalies[number]) => {
    setSelectedAnomaly(item);
    setFeedback(null);
    if (item.id !== "AN-2048") setInvestigated(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-lockup"><div className="brand-mark"><span /><span /><span /></div><div><div className="brand-name">COST<span>/</span>SENTINEL</div><div className="brand-sub">FINOPS INTELLIGENCE</div></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
        <div className="environment-card"><div className="eyebrow"><span className="live-dot" /> SAFE TEST ENVIRONMENT</div><div className="env-name">demo-organization</div><div className="env-detail"><span>Mock AWS Organization · {overviewQuery.isSuccess ? "API connected" : "API warming up"}</span><span className="env-status"><Check size={11} /> isolated</span></div></div>
        <nav className="side-nav"><div className="nav-label">COMMAND CENTER</div>{[
          ["Overview", Gauge], ["Investigations", Search], ["What-if studio", GitBranch], ["Learning loop", BrainCircuit],
        ].map(([label, Icon]: any) => <button key={label} className={`nav-item ${activeTab === label ? "active" : ""}`} onClick={() => { setActiveTab(label); setMobileOpen(false); }}><Icon size={17} /><span>{label}</span>{label === "Investigations" && <span className="nav-count">3</span>}{activeTab === label && <ChevronRight className="nav-chevron" size={15} />}</button>)}<div className="nav-label nav-label-spaced">SYSTEM</div><button className="nav-item" onClick={() => { setActiveTab("Settings"); setMobileOpen(false); }}><Settings2 size={17} /><span>Detection settings</span></button><button className="nav-item" onClick={() => setActiveTab("Audit log")}><ShieldCheck size={17} /><span>Audit trail</span></button></nav>
        <div className="sidebar-bottom"><div className="pipeline-mini"><div className="eyebrow">ACTIVE PIPELINE <span className="pulse-label"><span className="live-dot" /> LIVE</span></div><div className="mini-flow">{agentSteps.slice(0, 4).map((step, i) => <div key={step.name} className="mini-node"><div className="mini-node-icon"><step.icon size={13} /></div>{i < 3 && <span className="mini-line" />}</div>)}</div><div className="mini-caption">5 agents · last run 32 sec ago</div></div><div className="user-chip"><div className="avatar">AR</div><div><strong>Alex Rivera</strong><span>Platform engineering</span></div><MoreHorizontal size={17} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="topbar-left"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span className="muted">Workspace</span><ChevronRight size={14} /><strong>{activeTab}</strong></div></div><div className="top-actions"><div className="last-sync"><span className="sync-dot" /> {overviewQuery.isSuccess ? "API connected" : "Connecting API"} <strong>· synthetic data</strong></div><button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button><button className="help-button"><CircleHelp size={16} /> Guide</button></div></header>

        <div className="content-wrap">
          <section className="filter-bar panel"><div className="filter-heading"><div className="panel-kicker"><Target size={14} /> SLICE ANOMALIES BY DIMENSION</div><strong>{anomalyCount} of {overviewQuery.data?.anomalies.length ?? 3} anomalies visible</strong></div><div className="filter-controls">{(["service", "team", "region", "deployId", "severity"] as const).map((key) => { const labels = { service: "Service", team: "Team", region: "Region", deployId: "Deployment", severity: "Severity" }; const options = key === "severity" ? ["Critical", "High", "Medium"] : overviewQuery.data?.facets?.[key === "deployId" ? "deployments" : `${key}s` as "services" | "teams" | "regions"] ?? []; return <label className="filter-field" key={key}><span>{labels[key]}</span><select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}><option>All</option>{options.map((option: string) => <option key={option}>{option}</option>)}</select></label>; })}<button className="clear-filter" onClick={() => { setFilters({ service: "All", team: "All", region: "All", deployId: "All", severity: "All" }); setSelectedAnomaly(anomalies[0]); setInvestigated(true); setBackendInvestigation(null); }}>Clear filters</button></div></section>
          {scanStage >= 0 && <section className={`scan-console panel ${scanStage >= 4 ? "scan-complete" : ""}`}><div className="scan-console-head"><div><div className="panel-kicker"><Activity size={14} /> LIVE DETECTION RUN · scan_8f29a</div><strong>{scanStage >= 4 ? "Scan complete — 3 signals ranked for review" : "Sentinel is correlating your cloud signals…"}</strong></div><span className="scan-percent">{Math.min(scanStage, 4) * 25}%</span></div><div className="scan-progress"><span style={{ width: `${Math.min(scanStage, 4) * 25}%` }} /></div><div className="scan-steps">{["Ingest CUR rows", "Score usage drift", "Correlate changes", "Rank root causes"].map((step, index) => <span className={scanStage > index ? "done" : scanStage === index ? "active" : ""} key={step}><i>{scanStage > index ? "✓" : index + 1}</i>{step}</span>)}</div></section>}
          <section className="hero-row"><div><div className="kicker"><Sparkles size={13} /> AUTONOMOUS FINOPS CONTROL PLANE</div><h1>Good morning, Alex<span className="lime-dot">.</span></h1><p className="hero-copy">Your cloud is spending <strong>{formatCurrency(totalSpend)} today</strong>. Sentinel found <strong className="warning-text">{anomalyCount} signals</strong> worth investigating.</p></div><div className="hero-actions"><button className="secondary-button" onClick={() => setActiveTab("Audit log")}><Clock3 size={16} /> View audit trail</button><button className="primary-button" onClick={runScan} disabled={detectMutation.isPending || scanStage >= 0 && scanStage < 4}><Play size={15} fill="currentColor" /> {detectMutation.isPending || scanStage >= 0 && scanStage < 4 ? "Scanning…" : scanStage >= 4 ? "Run again" : "Run scan now"}</button></div></section>

          <section className="metric-grid"><MetricCard label="Spend today" value={formatCurrency(totalSpend)} change="+382%" hint="vs. 7-day baseline" icon={TrendingUp} accent="lime" /><MetricCard label="Avoidable spend" value="$1,486" change="+48.9%" hint="of today's total" icon={AlertTriangle} accent="red" /><MetricCard label="Time to insight" value="2m 14s" change="−96%" hint="vs. manual triage" icon={TimerReset} accent="cyan" /><MetricCard label="Detection confidence" value="98.2%" change="+12.4 pts" hint="after feedback loop" icon={Target} accent="amber" /></section>
          <section className="challenge-proof-grid"><div className="panel challenge-proof"><div className="panel-kicker"><DatabaseZap size={14} /> COMMAND CENTER · MULTI-SIGNAL ANOMALY SCORE</div><div className="challenge-proof-top"><div><h2>From billing row to probable cause.</h2><p>{overviewQuery.data?.dataset.rowCount ?? 48} CUR-style line items across {overviewQuery.data?.dataset.fields.length ?? 11} fields feed the detector.</p></div><Pill tone={challengeAnalysis?.isAnomaly ? "red" : "lime"}>{challengeAnalysis?.isAnomaly ? "anomaly confirmed" : "baseline monitoring"}</Pill></div><div className="challenge-stat-row"><div><span>Joint score</span><strong>{challengeAnalysis?.multiSignalScore ?? 98}/100</strong><small>cost + usage + changes</small></div><div><span>Projected monthly</span><strong>${(challengeAnalysis?.projectedMonthlyCost ?? totalSpend * 30).toLocaleString()}</strong><small>if ignored at current run rate</small></div><div><span>Incremental impact</span><strong>${(challengeAnalysis?.monthlyImpact ?? 0).toLocaleString()}</strong><small>above 7-day baseline</small></div><div><span>Top attribution</span><strong>{primaryCause?.value ?? "Amazon Bedrock"}</strong><small>{primaryCause ? `${primaryCause.contribution}% of daily lift` : "ranked by contribution"}</small></div></div><div className="signal-meter-row"><span>Cost deviation <b>{challengeAnalysis?.signals?.costDeviation ?? 0}</b></span><span>Usage deviation <b>{challengeAnalysis?.signals?.usageDeviation ?? 0}</b></span><span>Change intensity <b>{challengeAnalysis?.signals?.changeIntensity ?? 0}</b></span></div></div><div className="panel challenge-proof root-cause-proof"><div className="panel-kicker"><Target size={14} /> RANKED ROOT-CAUSE ATTRIBUTION</div><h2>{challengeAnalysis?.primaryCause ?? "Correlating service, tag, region, and deploy dimensions."}</h2><div className="cause-list">{(challengeAnalysis?.rootCauses ?? []).slice(0, 4).map((cause: any) => <div className="cause-row" key={`${cause.dimension}-${cause.value}`}><span>{cause.dimension}</span><strong>{cause.value}</strong><em>{cause.contribution}%</em></div>)}</div></div></section>

          {(activeTab === "Overview" || activeTab === "Investigations") && <>
          <section className="primary-grid"><div className="panel spend-panel"><div className="panel-header"><div><div className="panel-kicker"><LineChart size={14} /> COST PULSE · LAST 12 DAYS</div><h2>Spend accelerated after two correlated changes</h2></div><div className="panel-header-actions"><Pill tone="red"><span className="status-dot" /> anomaly active</Pill><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div></div><div className="legend"><span><i className="legend-box lime" /> Total spend</span><span><i className="legend-box cyan" /> Bedrock</span><span><i className="legend-box amber" /> ECS</span><span className="legend-note"><span className="legend-line" /> baseline corridor</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={255}><AreaChart data={costData} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}><defs><linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8ff87" stopOpacity={0.34} /><stop offset="100%" stopColor="#d8ff87" stopOpacity={0} /></linearGradient><linearGradient id="bedrockFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.18} /><stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#253244" vertical={false} strokeDasharray="3 7" /><XAxis dataKey="day" tick={{ fill: "#71829b", fontSize: 11 }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fill: "#71829b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip content={<ChartTooltip />} /><ReferenceLine y={620} stroke="#6a7e97" strokeDasharray="5 5" label={{ value: "baseline", fill: "#71829b", fontSize: 10, position: "insideTopRight" }} /><Area type="monotone" dataKey="total" name="Total" stroke="#d8ff87" strokeWidth={3} fill="url(#totalFill)" activeDot={{ r: 5, fill: "#d8ff87", stroke: "#0e1726", strokeWidth: 3 }} /><Area type="monotone" dataKey="bedrock" name="Bedrock" stroke="#7dd3fc" strokeWidth={1.8} fill="url(#bedrockFill)" activeDot={{ r: 4, fill: "#7dd3fc", stroke: "#0e1726", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer><div className="chart-callout"><span className="callout-line" /><div><strong>3.8× spike</strong><span>Sep 01 → Sep 03</span></div></div></div><div className="chart-foot"><span><span className="signal-icon"><Zap size={13} /></span> Joint score weighs cost, usage + change events</span><button className="text-button" onClick={() => setActiveTab("Detection settings")}>Tune detector <ChevronRight size={14} /></button></div></div>

          <div className="panel mix-panel"><div className="panel-header"><div><div className="panel-kicker"><Cloud size={14} /> SERVICE MIX</div><h2>Where today's spend went</h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height={176}><PieChart><Pie data={serviceMix} dataKey="value" innerRadius={52} outerRadius={76} paddingAngle={3} stroke="none">{serviceMix.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{totalSpend.toLocaleString()}</strong><span>USD today</span></div></div><div className="mix-list">{serviceMix.map((item) => <div className="mix-row" key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div><div className="mix-insight"><BrainCircuit size={15} /><span><strong>Bedrock is the outlier</strong> — 48% of spend, up from 14% baseline.</span></div></div></section>

          <section className="lower-grid"><div className="panel anomalies-panel"><div className="panel-header"><div><div className="panel-kicker"><AlertTriangle size={14} /> DETECTION QUEUE</div><h2>Anomalies needing attention <span className="count-badge">{anomalyCount}</span></h2></div><button className="text-button" onClick={() => setActiveTab("Investigations")}>View all <ChevronRight size={14} /></button></div><div className="anomaly-list">{filteredAnomalies.length ? filteredAnomalies.map((item) => { const Icon = item.icon; return <button key={item.id} className={`anomaly-row ${selectedAnomaly.id === item.id ? "selected" : ""}`} onClick={() => chooseAnomaly(item)}><div className="anomaly-service-icon" style={{ color: item.color, background: `${item.color}12` }}><Icon size={17} /></div><div className="anomaly-main"><div className="anomaly-title"><strong>{item.service}</strong><Pill tone={item.severity === "Critical" ? "red" : item.severity === "High" ? "amber" : "slate"}>{item.severity}</Pill></div><span>{item.account} · {item.time}</span></div><div className="anomaly-value"><strong>{item.value}</strong><span>{item.delta}</span></div><div className="confidence"><span>confidence</span><strong>{item.score}%</strong><div className="confidence-bar"><span style={{ width: `${item.score}%` }} /></div></div><ChevronRight size={16} className="row-chevron" /></button> }) : <div className="filter-empty"><Target size={18} /><strong>No matching anomalies</strong><span>Clear a filter to restore the queue.</span></div>}</div></div>

          <div className="panel pipeline-panel"><div className="panel-header"><div><div className="panel-kicker"><Bot size={14} /> AGENT TRACE</div><h2>From signal to decision</h2></div><Pill tone="lime"><span className="status-dot" /> 5 agents active</Pill></div><div className="agent-pipeline">{agentSteps.map((step, index) => <div key={step.name} className="agent-step"><div className={`agent-icon ${step.state}`}><step.icon size={16} /></div><div className="agent-copy"><strong>{step.name}</strong><span>{step.detail}</span></div>{index < agentSteps.length - 1 && <div className="agent-connector"><span /></div>}</div>)}</div><div className="trace-log"><div className="trace-log-head"><span><span className="live-dot" /> LIVE TRACE</span><span>run_8f29a</span></div><div className="trace-line"><span>09:41:22</span><strong>investigator</strong><span>weighted 4 signals → <em>root cause candidate</em></span></div><div className="trace-line"><span>09:41:25</span><strong>remediator</strong><span>ranked 3 actions → <em>$1,326 savings</em></span></div></div></div></section>

          <section className="investigation-grid"><div className="panel explain-panel"><div className="panel-header"><div><div className="panel-kicker"><MessageSquareText size={14} /> AI ROOT-CAUSE EXPLAINER</div><h2>{selectedAnomaly.service} / {selectedAnomaly.id}</h2></div><div className="explain-actions"><Pill tone="lime"><Check size={12} /> {investigated ? "investigated" : "queued"}</Pill><button className="primary-button small" onClick={runInvestigation}>{investigating ? <><RotateCcw size={14} className="spin" /> correlating…</> : <><Search size={14} /> Investigate</>}</button></div></div>{investigated ? <><div className="explanation-hero"><div className="explanation-score"><span>confidence</span><strong>{backendInvestigation?.confidence ?? selectedAnomaly.score}<small>%</small></strong><div className="score-ring"><span /></div></div><div><div className="root-cause-label"><span className="pulse-dot" /> ROOT CAUSE CANDIDATE</div><h3>{backendInvestigation?.rootCause ?? "Runaway agent loop amplified by an autoscaling floor change."}</h3><p>At <strong>02:15 UTC</strong>, the <strong>agent-loop-v3</strong> flag was enabled while the ECS minimum capacity had already been raised from <strong>3 → 10</strong>. Bedrock calls rose <strong>9.4×</strong> without a proportional request increase, pointing to recursive retries rather than organic demand. <strong>High confidence:</strong> the correlated config, IAM, and scaling events explain the majority of the cost delta.</p></div></div><div className="classification-row"><div><span>Cost behavior</span><strong><span className="class-dot usage" /> {backendInvestigation?.classification ?? "Usage-driven"}</strong></div><div><span>Likely owner</span><strong><UserRound size={14} /> {backendInvestigation?.owner ?? "AI Platform · on-call"}</strong></div><div><span>Blast radius</span><strong><span className="class-dot high" /> ${((backendInvestigation?.blastRadius ?? 1486) as number).toLocaleString()} / day</strong></div></div><div className="evidence-section"><div className="section-mini-title"><span>SUPPORTING EVIDENCE</span><span>{displayedEvidence.length} correlated events</span></div>{displayedEvidence.slice(0, 3).map((event: any) => <div className="evidence-row" key={event.time}><span className={`event-time event-${event.accent}`}>{event.time}</span><div><strong>{event.title}</strong><span>{event.type} · {event.actor}</span></div><Check size={15} className="evidence-check" /></div>)}</div><div className="remediation-box"><div className="remediation-head"><span><Zap size={14} /> RECOMMENDED ACTIONS</span><Pill tone="cyan">ranked by impact</Pill></div><div className="recommendations"><div><span className="rank">01</span><div><strong>Disable agent-loop-v3</strong><span>Immediate containment · saves ~$980/day</span></div><Check size={16} /></div><div><span className="rank">02</span><div><strong>Restore ECS minimum to 3</strong><span>Right-size capacity · saves ~$346/day</span></div><Check size={16} /></div><div><span className="rank">03</span><div><strong>Set Bedrock token budget at $100/day</strong><span>Prevent recurrence · 4–8% request throttling</span></div><Check size={16} /></div></div></div><div className="feedback-row"><span>Was this explanation helpful?</span><button className={feedback === "correct" ? "feedback active-good" : "feedback"} onClick={() => sendFeedback("correct")}><Check size={14} /> Correct</button><button className={feedback === "wrong" ? "feedback active-bad" : "feedback"} onClick={() => sendFeedback("wrong")}><X size={14} /> Misleading</button>{feedback && <span className="feedback-thanks"><Sparkles size={13} /> Feedback absorbed · threshold tuned to 2.9σ</span>}</div></> : <div className="empty-investigation"><div className="empty-icon"><Search size={22} /></div><h3>Ready to investigate {selectedAnomaly.service}</h3><p>Correlate cost, usage, change events, and model behavior into an auditable explanation.</p><button className="primary-button" onClick={runInvestigation}><Play size={15} fill="currentColor" /> Start investigation</button></div>}</div>

          <div className="panel events-panel"><div className="panel-header"><div><div className="panel-kicker"><DatabaseZap size={14} /> EVENT CORRELATION</div><h2>Change radar</h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><p className="events-intro">The system found a <strong>27-minute window</strong> where operational changes and cost acceleration overlapped.</p><div className="event-timeline">{events.map((event, index) => <div className="timeline-row" key={event.time}><div className={`timeline-marker marker-${event.accent}`}><span /></div>{index < events.length - 1 && <div className="timeline-rail" />}<div className="timeline-copy"><span>{event.time} <em>{event.type}</em></span><strong>{event.title}</strong><small>{event.actor}</small></div></div>)}</div><div className="event-foot"><span><Info size={14} /> Synthetic CloudTrail-like events</span><button className="text-button">Open event explorer <ChevronRight size={14} /></button></div></div></section>
          <section className="remediation-deck panel"><div className="panel-header"><div><div className="panel-kicker"><Zap size={14} /> OPERATOR ACTION DECK</div><h2>Move from insight to containment.</h2></div><Pill tone={actioned.length ? "lime" : "slate"}>{actioned.length}/3 actions staged</Pill></div><div className="remediation-cards">{[{ title: "Disable agent-loop-v3", detail: "Stop recursive model calls", impact: "$980/day", tone: "red" }, { title: "Restore ECS minimum to 3", detail: "Right-size idle capacity", impact: "$346/day", tone: "amber" }, { title: "Set Bedrock token budget", detail: "Prevent the next recurrence", impact: "4–8% throttle", tone: "cyan" }].map((action) => <button key={action.title} className={`remediation-card ${actioned.includes(action.title) ? "actioned" : ""}`} onClick={() => toggleAction(action.title)}><span className={`remediation-icon ${action.tone}`}><Zap size={15} /></span><span className="remediation-copy"><strong>{action.title}</strong><small>{action.detail}</small></span><span className="remediation-impact">{actioned.includes(action.title) ? <><Check size={14} /> staged</> : action.impact}</span></button>)}</div></section>
          </>}

          {activeTab === "What-if studio" && <section className="whatif-page panel"><div className="whatif-heading"><div><div className="kicker"><GitBranch size={13} /> COUNTERFACTUAL COST STUDIO</div><h2>Plan the cheaper timeline.</h2><p>Model a guardrail before it becomes a postmortem.</p></div><Pill tone="cyan"><span className="live-dot" /> simulated · no production impact</Pill></div><div className="whatif-layout"><div className="whatif-controls"><div className="control-label"><span>Bedrock daily token cap</span><strong>${cap}/day</strong></div><input type="range" min="40" max="180" value={cap} onChange={(event) => { setCap(Number(event.target.value)); setWhatIf(false); setWhatIfResult(null); }} /><div className="range-labels"><span>$40</span><span>$100 recommended</span><span>$180</span></div><div className="capacity-control"><div className="control-label"><span>ECS minimum capacity</span><strong>{minCapacity} tasks</strong></div><input type="range" min="1" max="10" value={minCapacity} onChange={(event) => { setMinCapacity(Number(event.target.value)); setWhatIf(false); setWhatIfResult(null); }} /><div className="range-labels"><span>1</span><span>5 balanced</span><span>10 current</span></div></div><div className="scenario-card"><div className="scenario-icon"><BrainCircuit size={18} /></div><div><strong>Scenario: protect the AI budget</strong><span>Cap Bedrock at ${cap}/day and hold ECS minimum at {minCapacity} tasks.</span></div></div><button className={`primary-button full ${whatIf ? "active-scenario" : ""}`} onClick={runWhatIf} disabled={whatIfMutation.isPending}>{whatIfMutation.isPending ? <><RotateCcw size={15} className="spin" /> Simulating…</> : whatIf ? <><Pause size={15} /> Pause simulation</> : <><Play size={15} fill="currentColor" /> Run what-if simulation</>}</button><div className="tradeoff-grid"><div><span>Estimated savings</span><strong>${savings.toLocaleString()}</strong><small>over next 48 hours</small></div><div><span>Requests throttled</span><strong>{throttle}%</strong><small>during peak window</small></div></div></div><div className="whatif-chart"><div className="chart-title"><span>Actual vs. simulated cost curve</span><Pill tone={whatIf ? "lime" : "slate"}>{whatIf ? "scenario active" : "preview mode"}</Pill></div><ResponsiveContainer width="100%" height={310}><AreaChart data={projectedData} margin={{ top: 18, right: 12, left: -10, bottom: 0 }}><defs><linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.3} /><stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#253244" vertical={false} strokeDasharray="3 7" /><XAxis dataKey="day" tick={{ fill: "#71829b", fontSize: 11 }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fill: "#71829b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="total" name="Actual" stroke="#d8ff87" strokeWidth={2.5} fill="none" /><Area type="monotone" dataKey="simulated" name="With cap" stroke="#7dd3fc" strokeWidth={2.5} strokeDasharray="6 5" fill="url(#simFill)" /></AreaChart></ResponsiveContainer><div className="whatif-narrative"><Sparkles size={16} /><span><strong>Sentinel says:</strong> A ${cap}/day cap with ECS minimum {minCapacity} would have prevented <strong>${savings.toLocaleString()}</strong> in excess spend, with a manageable <strong>{throttle}% peak-window throttle</strong>. This is a containment lever, not a capacity fix.</span></div></div></div></section>}

          {activeTab === "Learning loop" && <section className="learning-page"><div className="panel learning-hero"><div><div className="kicker"><BrainCircuit size={13} /> SELF-IMPROVING FEEDBACK LOOP</div><h2>Every investigation makes the next one sharper.</h2><p>Sentinel uses operator feedback to tune thresholds and emphasize the evidence that matters for your accounts.</p></div><div className="learning-score"><span>MODEL TRUST</span><strong>{(learningQuery.data?.trust ?? 94.6).toFixed(1)}%</strong><span className="up"><ArrowUpRight size={13} /> {learningQuery.data?.total ?? 0} persisted feedback events</span><div className="threshold-pills">{(learningQuery.data?.serviceThresholds ?? []).map((item: any) => <Pill key={item.service} tone="cyan">{item.service.replace("Amazon ", "")} · {item.threshold}σ</Pill>)}</div></div></div><div className="learning-grid"><div className="panel"><div className="panel-header"><div><div className="panel-kicker"><Gauge size={14} /> BEFORE → AFTER</div><h2>Detector calibration</h2></div><Pill tone="lime">learning active</Pill></div><div className="calibration"><div className="cal-row"><div className="cal-label"><span>False positive rate</span><strong>12.4% <ArrowDownRight size={13} /> 4.1%</strong></div><div className="dual-bar"><span className="old" style={{ width: "62%" }} /><span className="new" style={{ width: "21%" }} /></div></div><div className="cal-row"><div className="cal-label"><span>Root-cause precision</span><strong>71% <ArrowUpRight size={13} /> 89%</strong></div><div className="dual-bar"><span className="old" style={{ width: "49%" }} /><span className="new" style={{ width: "79%" }} /></div></div><div className="cal-row"><div className="cal-label"><span>Alert lead time</span><strong>1.8d <ArrowUpRight size={13} /> 3.4d</strong></div><div className="dual-bar"><span className="old" style={{ width: "35%" }} /><span className="new" style={{ width: "68%" }} /></div></div></div><div className="cal-legend"><span><i className="old-key" /> before feedback</span><span><i className="new-key" /> after feedback</span></div></div><div className="panel feedback-history"><div className="panel-header"><div><div className="panel-kicker"><MessageSquareText size={14} /> OPERATOR SIGNAL</div><h2>Recent feedback</h2></div><button className="text-button">Export <ChevronRight size={14} /></button></div><div className="history-row"><div className="history-icon good"><Check size={15} /></div><div><strong>AN-2048 explanation marked correct</strong><span>Emphasized config changes for AI services</span></div><time>2m ago</time></div><div className="history-row"><div className="history-icon good"><Check size={15} /></div><div><strong>AN-2039 owner suggestion confirmed</strong><span>Raised confidence for AI Platform</span></div><time>4h ago</time></div><div className="history-row"><div className="history-icon bad"><X size={15} /></div><div><strong>AN-2031 classified as misleading</strong><span>Lowered sensitivity for planned scaling</span></div><time>1d ago</time></div></div></div></section>}

          {activeTab === "Settings" && <section className="panel settings-page"><div className="kicker"><Settings2 size={13} /> DETECTION SETTINGS</div><h2>Make the signal useful, not noisy.</h2><p>These settings are local to the safe demo environment.</p><div className="settings-list"><div><div><strong>Multi-signal scoring</strong><span>Cost, usage, change events, and token behavior</span></div><div className="toggle on"><span /></div></div><div><div><strong>AI workload guardrails</strong><span>Detect recursive agent loops and model budget drift</span></div><div className="toggle on"><span /></div></div><div><div><strong>Feedback threshold tuning</strong><span>Adjust thresholds after operator confirmation</span></div><div className="toggle on"><span /></div></div><div><div><strong>Planned change suppression</strong><span>Reduce severity when traffic scales proportionally</span></div><div className="toggle"><span /></div></div></div></section>}

          <footer className="app-footer"><span><ShieldCheck size={14} /> Safe test environment · all data is synthetic · no production systems accessed</span><span>Cost/Sentinel v0.8.4 <span className="footer-separator">·</span> build 7f29a</span></footer>
        </div>
      </main>
    </div>
  );
}

export { costData };
