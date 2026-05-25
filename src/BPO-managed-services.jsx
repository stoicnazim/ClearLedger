import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   3.6 OtC Managed Services / BPO Evaluation
   Phase 3 — OtC Strategic Value
   APQC PCF v8.0: 8.3 / 11.5 Manage Outsourcing
   Cross-references: 1.1–1.6, 2.1–2.6, 3.1–3.5, KPI Spec
   ═══════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0a0e17", surface: "#111827", surfaceAlt: "#1a2234",
  border: "#1e293b", borderHover: "#334155",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  accent: "#22d3ee", accentDim: "rgba(34,211,238,0.12)", accentGlow: "rgba(34,211,238,0.25)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.12)",
  amber: "#fbbf24", amberDim: "rgba(251,191,36,0.12)",
  red: "#f87171", redDim: "rgba(248,113,113,0.12)",
  purple: "#a78bfa", purpleDim: "rgba(167,139,250,0.12)",
  blue: "#60a5fa", blueDim: "rgba(96,165,250,0.12)",
  orange: "#fb923c", orangeDim: "rgba(251,146,60,0.12)",
  font: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace",
  radius: "8px", radiusLg: "12px",
};

const fmt = (n) => { if(Math.abs(n)>=1e6) return `€${(n/1e6).toFixed(1)}M`; if(Math.abs(n)>=1e3) return `€${(n/1e3).toFixed(0)}k`; return `€${n.toFixed(0)}`; };

const Card = ({ children, style, glow, onClick }) => (
  <div onClick={onClick} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "20px", cursor: onClick ? "pointer" : "default", ...(glow ? { boxShadow: `0 0 20px ${T.accentGlow}, inset 0 1px 0 ${T.borderHover}` } : {}), ...style }}>{children}</div>
);
const Badge = ({ children, color, bg }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontFamily: T.mono, fontWeight: 600, color: color || T.accent, background: bg || T.accentDim, letterSpacing: "0.03em" }}>{children}</span>
);
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: "16px" }}>
    <h2 style={{ fontFamily: T.font, fontSize: "18px", fontWeight: 700, color: T.text, margin: 0 }}>{children}</h2>
    {sub && <p style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);
const NumInput = ({ value, onChange, suffix, width, step, prefix }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {prefix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{prefix}</span>}
    <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} step={step || 1}
      style={{ width: width || "70px", padding: "6px 8px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "6px", color: T.accent, fontFamily: T.mono, fontSize: "13px", textAlign: "right", outline: "none" }}
      onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
    {suffix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{suffix}</span>}
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{label}</label>
    {children}
  </div>
);

const CROSS_REFS = {
  "1.1": { name: "OtC Value Stream Taxonomy", p: 1 }, "1.2": { name: "Cash Application Process Pack", p: 1 },
  "1.3": { name: "Collections Strategy", p: 1 }, "1.4": { name: "E-Invoicing Compliance", p: 1 },
  "1.5": { name: "AR KPI Dashboard", p: 1 }, "1.6": { name: "AR Maturity Assessment", p: 1 },
  "2.1": { name: "Credit Management", p: 2 }, "2.2": { name: "Dispute Resolution", p: 2 },
  "2.3": { name: "Billing & Invoicing", p: 2 }, "2.4": { name: "SOX Controls Library", p: 2 },
  "2.5": { name: "Process Mining Playbook", p: 2 }, "2.6": { name: "SSC Transition Guide", p: 2 },
  "3.1": { name: "Customer Onboarding", p: 3 }, "3.2": { name: "Deductions Management", p: 3 },
  "3.3": { name: "Treasury & Working Capital", p: 3 }, "3.4": { name: "Technology Selection", p: 3 },
  "3.5": { name: "Business Case Builder", p: 3 },
  "KPI": { name: "KPI Specification Document", p: 1 },
};

const TABS = [
  { id: "scope", label: "1. Scope Definition", icon: "📐" },
  { id: "providers", label: "2. Provider Landscape", icon: "🏢" },
  { id: "pricing", label: "3. Pricing Models", icon: "💲" },
  { id: "sla", label: "4. SLA Framework", icon: "📏" },
  { id: "transition", label: "5. Transition & Risk", icon: "⚠️" },
  { id: "governance", label: "6. Governance & Retained Org", icon: "🏛️" },
  { id: "xref", label: "Toolkit Map", icon: "🔗" },
];

// ═══ SCOPE DEFINITION ═══
const OTC_PROCESSES = [
  { process: "Customer Onboarding & Master Data", apqc: "3.5.1", complexity: "Medium", bpoSuitability: "Medium", rationale: "Customer-facing, requires local knowledge; master data maintenance is high-volume and suitable", retainRisk: "Data quality degradation if SLA not tight", toolkit: ["3.1", "1.1"] },
  { process: "Credit Assessment & Scoring", apqc: "8.3.2", complexity: "High", bpoSuitability: "Low–Medium", rationale: "Judgment-heavy, risk exposure high; scoring can be automated but limit decisions often retained", retainRisk: "Credit losses if provider lacks industry depth", toolkit: ["2.1"] },
  { process: "Billing & Invoice Generation", apqc: "8.3.1", complexity: "Medium", bpoSuitability: "High", rationale: "Rules-based, high-volume, well-suited to standardized processing; e-invoicing adds compliance layer", retainRisk: "Invoice accuracy drops affect DSO and disputes", toolkit: ["2.3", "1.4"] },
  { process: "Cash Application", apqc: "8.3.4.1", complexity: "Medium", bpoSuitability: "High", rationale: "Pattern-matching task ideal for BPO + AI; high-volume, measurable, clear SLAs", retainRisk: "Exception handling delays if escalation path unclear", toolkit: ["1.2"] },
  { process: "Collections & Dunning", apqc: "8.3.4.3", complexity: "Medium–High", bpoSuitability: "Medium–High", rationale: "Tiered approach: BPO handles standard dunning, retained team handles strategic/key accounts", retainRisk: "Customer relationship damage if tone/approach wrong", toolkit: ["1.3"] },
  { process: "Dispute & Deduction Management", apqc: "8.3.3", complexity: "High", bpoSuitability: "Medium", rationale: "Investigation-heavy, requires cross-functional coordination; coding/triage suitable, resolution often retained", retainRisk: "Slow resolution cycles, write-off increases", toolkit: ["2.2", "3.2"] },
  { process: "Credit Note Processing", apqc: "8.3.1.2", complexity: "Low–Medium", bpoSuitability: "High", rationale: "Approval-based workflow, rules-driven; well-suited to BPO with proper authority matrix", retainRisk: "Revenue leakage if controls weak", toolkit: ["2.3", "2.4"] },
  { process: "AR Reporting & Analytics", apqc: "8.3.5", complexity: "Medium", bpoSuitability: "Low", rationale: "Insight generation requires business context; data preparation can be outsourced, analysis retained", retainRisk: "Loss of visibility into AR performance", toolkit: ["1.5", "KPI"] },
  { process: "SOX Compliance & Controls", apqc: "8.7", complexity: "High", bpoSuitability: "Low", rationale: "Retained function — provider executes controls but governance, testing, and remediation stay internal", retainRisk: "Audit findings if provider doesn't follow control procedures", toolkit: ["2.4"] },
  { process: "E-Invoicing Compliance", apqc: "8.3.1.1", complexity: "High", bpoSuitability: "Medium", rationale: "Mandate monitoring and technical compliance can be outsourced; regulatory risk remains with company", retainRisk: "Non-compliance penalties, rejected invoices", toolkit: ["1.4"] },
];

// ═══ PROVIDER LANDSCAPE ═══
const PROVIDER_TIERS = [
  {
    tier: "Tier 1 — Global Majors", color: T.accent, bg: T.accentDim,
    description: "Full-stack F&A BPO with global delivery, technology platforms, and transformation capability",
    providers: [
      { name: "Genpact", hq: "US/India", otcStrength: "Strong OtC practice, Cora AI platform, deep industry verticals", fte: "115,000+", geographies: "Global (India, PH, PL, RO, MX, CN)" },
      { name: "WNS", hq: "India/UK", otcStrength: "AR-specific solutions, strong analytics, mid-market friendly", fte: "60,000+", geographies: "India, PH, PL, ZA, CR" },
      { name: "Accenture Operations", hq: "Ireland/US", otcStrength: "End-to-end transformation + operations, strong SAP, consulting arm", fte: "740,000+ (total)", geographies: "Global" },
      { name: "Capgemini BPS", hq: "France", otcStrength: "Strong European presence, F&A centers of excellence, industry-specific", fte: "360,000+ (total)", geographies: "Global (strong EU: PL, IN)" },
      { name: "Cognizant", hq: "US/India", otcStrength: "Digital operations, platform-based delivery, strong analytics", fte: "350,000+", geographies: "Global (India, PH, EU, LATAM)" },
    ],
  },
  {
    tier: "Tier 2 — Specialist F&A", color: T.purple, bg: T.purpleDim,
    description: "F&A-focused providers with deep OtC expertise, often more flexible and cost-competitive than Tier 1",
    providers: [
      { name: "TMF Group", hq: "Netherlands", otcStrength: "Multi-jurisdiction compliance, accounting, entity management", fte: "11,000+", geographies: "85+ countries" },
      { name: "Auxis", hq: "US/LATAM", otcStrength: "Nearshore F&A, strong OtC focus, mid-market, rapid deployment", fte: "3,000+", geographies: "CR, CO, US" },
      { name: "Quatrro", hq: "US/India", otcStrength: "Mid-market F&A BPO, technology-led, flexible engagement models", fte: "3,500+", geographies: "India, US" },
      { name: "Conduent", hq: "US", otcStrength: "Transaction-heavy processing, government + commercial, decent scale", fte: "60,000+", geographies: "US, India, EU" },
    ],
  },
  {
    tier: "Tier 3 — Regional / Niche", color: T.amber, bg: T.amberDim,
    description: "Regional players or niche specialists; often best for single-country or single-process outsourcing",
    providers: [
      { name: "Motokommerce", hq: "Poland", otcStrength: "CEE-based, Polish-speaking, good for regional SSC supplement", fte: "500+", geographies: "PL, CZ, SK" },
      { name: "AccountsIQ (BPO arm)", hq: "Ireland", otcStrength: "SME-focused, cloud accounting + BPO combined", fte: "200+", geographies: "IE, UK" },
      { name: "HighRadius (managed services)", hq: "US/India", otcStrength: "Technology + managed services bundle for AR automation", fte: "4,500+", geographies: "US, India" },
    ],
  },
];

// ═══ PRICING MODELS ═══
const PRICING_MODELS = [
  {
    model: "FTE-Based", description: "Fixed monthly fee per dedicated full-time equivalent assigned to the client's processes",
    icon: "👤", color: T.blue,
    pros: ["Simple to understand and budget", "Guaranteed capacity", "Easy to scale up/down (with notice)", "Familiar model for clients"],
    cons: ["No incentive for provider efficiency", "Risk of overstaffing / underutilization", "Client pays for idle time", "Difficult to benchmark value"],
    bestFor: "Stable, predictable volumes; early-stage outsourcing; complex processes needing dedicated expertise",
    typicalRange: "€2,500–€6,000/FTE/month (varies by location)",
    benchmarks: { india: 2500, philippines: 2800, poland: 4500, latam: 3200 },
  },
  {
    model: "Transaction-Based", description: "Price per unit of work completed — per invoice, per cash posting, per collection call, per dispute resolved",
    icon: "📊", color: T.green,
    pros: ["Pay only for work done", "Scales naturally with business", "Provider incentivized for efficiency", "Easy to benchmark"],
    cons: ["Volume fluctuations create budget variance", "Quality may suffer if provider optimizes for speed", "Complex to define 'transaction' for all processes", "Minimum volume commitments common"],
    bestFor: "High-volume, standardized processes (cash app, invoicing); mature outsourcing relationships",
    typicalRange: "€0.50–€5.00/transaction (varies by complexity)",
    benchmarks: { invoice: 1.2, cashPosting: 0.8, collectionCall: 3.5, disputeResolution: 15 },
  },
  {
    model: "Outcome-Based", description: "Pricing tied to business outcomes — DSO reduction, recovery rate improvement, cost-per-invoice reduction",
    icon: "🎯", color: T.accent,
    pros: ["Aligned incentives", "Provider shares transformation risk", "Results-oriented relationship", "Encourages innovation"],
    cons: ["Complex to structure and measure", "Baseline disputes common", "External factors affect outcomes", "Requires mature governance"],
    bestFor: "Transformational engagements; experienced BPO clients; where clear baseline metrics exist (→ 1.5, KPI Spec)",
    typicalRange: "Base fee + 20–40% variable tied to KPI achievement",
    benchmarks: { basePct: 65, variablePct: 35, typicalKPIs: "DSO, recovery rate, auto-match rate, cost per invoice" },
  },
  {
    model: "Hybrid / Blended", description: "Combination of FTE-based for complex/judgment work + transaction-based for high-volume processing + outcome bonus",
    icon: "🔀", color: T.purple,
    pros: ["Flexibility across process types", "Balances cost predictability with efficiency incentives", "Most common in mature deals", "Adaptable as relationship evolves"],
    cons: ["More complex to administer", "Multiple pricing mechanics to track", "Negotiation complexity at renewal", "Requires strong governance"],
    bestFor: "Multi-process outsourcing; mid-to-large enterprises; deals combining operations + transformation",
    typicalRange: "Varies — typically 50–60% FTE + 30–40% transaction + 10–20% outcome",
    benchmarks: { ftePct: 55, txnPct: 35, outcomePct: 10 },
  },
];

// ═══ SLA FRAMEWORK ═══
const SLA_CATEGORIES = [
  {
    category: "Operational SLAs", color: T.accent,
    slas: [
      { metric: "Invoice Processing Time", target: "Same-day (T+0) for standard; T+1 for complex", measurement: "% of invoices issued within target", penalty: "1% fee reduction per 1% miss", toolkit: ["2.3"] },
      { metric: "Cash Application Rate", target: ">95% auto-match; exceptions within 24hrs", measurement: "Monthly auto-match % + exception aging", penalty: "Tiered: 2% per 1% below 95%", toolkit: ["1.2"] },
      { metric: "Dunning Cycle Adherence", target: "100% of scheduled dunning actions executed on time", measurement: "% of scheduled actions completed in window", penalty: "1.5% fee reduction per 5% miss", toolkit: ["1.3"] },
      { metric: "Dispute Triage Time", target: "<24hrs for coding; <48hrs for initial research", measurement: "Avg hours from receipt to coded + researched", penalty: "€500 per SLA breach above threshold", toolkit: ["2.2", "3.2"] },
      { metric: "Credit Decision Turnaround", target: "Auto: <4hrs; Manual: <2 business days", measurement: "% within target by tier", penalty: "Revenue impact clause for delays", toolkit: ["2.1"] },
    ],
  },
  {
    category: "Quality SLAs", color: T.green,
    slas: [
      { metric: "Invoice Accuracy Rate", target: ">99% first-time-right", measurement: "% of invoices requiring no correction", penalty: "Rework at provider cost + fee reduction", toolkit: ["2.3"] },
      { metric: "Master Data Accuracy", target: ">98% of fields correct at creation", measurement: "Monthly audit sample (5% of new records)", penalty: "Remediation at provider cost", toolkit: ["3.1"] },
      { metric: "Cash Posting Accuracy", target: ">99.5% correctly applied", measurement: "% of postings requiring reversal/correction", penalty: "2% fee reduction per 0.5% miss", toolkit: ["1.2"] },
      { metric: "SOX Control Compliance", target: "100% adherence to control procedures", measurement: "Monthly control testing + audit results", penalty: "Material weakness → contract review clause", toolkit: ["2.4"] },
    ],
  },
  {
    category: "Outcome SLAs", color: T.purple,
    slas: [
      { metric: "DSO Performance", target: "Achieve agreed DSO target (± 2 days)", measurement: "Monthly weighted average DSO", penalty: "Bonus/malus: ±0.5% fee per day vs target", toolkit: ["1.5", "3.3"] },
      { metric: "Recovery Rate (Disputes/Deductions)", target: ">60% recovery rate", measurement: "Quarterly recovered / total disputed", penalty: "Performance bonus above 65%; penalty below 55%", toolkit: ["2.2", "3.2"] },
      { metric: "Bad Debt Write-Off", target: "<0.3% of revenue", measurement: "Quarterly write-off / gross revenue", penalty: "Shared savings for outperformance", toolkit: ["2.1", "1.3"] },
      { metric: "Customer Satisfaction (CSAT)", target: ">4.2/5.0 from internal stakeholders", measurement: "Quarterly survey of sales, ops, finance stakeholders", penalty: "Remediation plan required below 3.8", toolkit: ["1.6"] },
    ],
  },
  {
    category: "Service Management SLAs", color: T.amber,
    slas: [
      { metric: "Reporting Timeliness", target: "Daily flash by 9am; weekly pack by Monday noon; monthly by T+3", measurement: "% of reports delivered on time", penalty: "Warning → escalation → fee reduction", toolkit: ["1.5", "KPI"] },
      { metric: "Attrition / Continuity", target: "<15% annual attrition on dedicated team", measurement: "Rolling 12-month attrition rate", penalty: "Replacement within 30 days; training at provider cost", toolkit: ["2.6"] },
      { metric: "Business Continuity", target: "RTO <4hrs; RPO <1hr for critical processes", measurement: "Annual DR test results", penalty: "Contract termination right for failure", toolkit: ["2.4"] },
      { metric: "Continuous Improvement", target: "Minimum 2 process improvements per quarter", measurement: "Documented improvements with measured impact", penalty: "Governance escalation", toolkit: ["2.5"] },
    ],
  },
];

// ═══ TRANSITION RISKS ═══
const TRANSITION_PHASES = [
  { phase: "Due Diligence & Scoping", duration: "4–6 weeks", activities: ["Current state process documentation (→ 1.1)", "Volume/complexity analysis (→ 2.5)", "In-scope / out-of-scope definition", "Baseline KPI measurement (→ 1.5, KPI Spec)"], risks: ["Scope creep if current state not well-documented", "Underestimating complexity of exceptions"], toolkit: ["1.1", "1.5", "2.5", "KPI"] },
  { phase: "Provider Selection", duration: "8–12 weeks", activities: ["RFI → RFP → shortlist → demo → POC", "Site visits to delivery centers", "Reference checks (same industry/size)", "Commercial negotiation & contracting"], risks: ["Over-weighting cost vs. capability", "Insufficient reference validation", "Inadequate contract protections"], toolkit: ["3.4"] },
  { phase: "Transition Planning", duration: "4–6 weeks", activities: ["Detailed transition plan with milestones", "Knowledge transfer schedule by process", "Technology access & provisioning", "Retained organization design (→ Tab 6)"], risks: ["Insufficient KT time allocation", "Technology access delays", "Key person dependencies"], toolkit: ["2.6"] },
  { phase: "Knowledge Transfer (KT)", duration: "6–12 weeks", activities: ["Shadow period (provider observes)", "Reverse shadow (provider executes, client observes)", "Documentation handover (SOPs, exception guides)", "Competency assessment before go-live"], risks: ["Tribal knowledge not captured", "Provider team turnover during KT", "SOP gaps for exception scenarios"], toolkit: ["2.6", "1.1"] },
  { phase: "Hypercare / Stabilization", duration: "8–12 weeks", activities: ["Parallel run (dual processing)", "Elevated monitoring and daily standups", "Issue log and rapid resolution", "SLA measurement begins (grace period)"], risks: ["Quality dip during learning curve", "Volume surge during parallel run", "Client team disengagement too early"], toolkit: ["1.5", "2.4"] },
  { phase: "Steady State", duration: "Ongoing", activities: ["Full SLA enforcement", "Governance cadence established", "Continuous improvement program", "Regular benchmarking and market testing"], risks: ["Complacency / innovation decline", "Scope creep without pricing adjustment", "Provider lock-in"], toolkit: ["1.5", "2.5", "KPI"] },
];

const RISK_REGISTER = [
  { risk: "Knowledge loss during transition", likelihood: "High", impact: "High", mitigation: "Mandatory 8-week KT, SOP documentation, video recording of exception handling", owner: "Transition Manager", toolkit: ["2.6", "1.1"] },
  { risk: "Service quality degradation post go-live", likelihood: "High", impact: "High", mitigation: "12-week hypercare with daily monitoring, parallel processing for critical items, escalation matrix", owner: "Service Delivery Manager", toolkit: ["1.5"] },
  { risk: "Customer-facing impact (wrong tone/approach in collections)", likelihood: "Medium", impact: "High", mitigation: "Script templates per segment (→ 1.3), call monitoring, customer feedback loop, strategic accounts excluded", owner: "AR Manager (retained)", toolkit: ["1.3"] },
  { risk: "SOX control failures", likelihood: "Medium", impact: "Critical", mitigation: "Controls documented in 2.4 shared with provider, monthly testing, audit right-of-access clause", owner: "Internal Audit / Compliance", toolkit: ["2.4"] },
  { risk: "Provider attrition / key person departure", likelihood: "Medium", impact: "Medium", mitigation: "Cross-training requirement (min 2-deep), 30-day replacement SLA, documentation requirements", owner: "Provider Account Manager", toolkit: ["2.6"] },
  { risk: "Scope creep / change request overload", likelihood: "High", impact: "Medium", mitigation: "Clear scope document with in/out matrix, change request process with pricing impact, quarterly scope review", owner: "Governance Lead", toolkit: ["1.1"] },
  { risk: "Data security / privacy breach", likelihood: "Low", impact: "Critical", mitigation: "SOC 2 / ISO 27001 requirement, data residency controls, access management audit, GDPR DPA in contract", owner: "CISO / DPO", toolkit: ["2.4"] },
  { risk: "Technology access / integration failure", likelihood: "Medium", impact: "High", mitigation: "VDI/secure access provisioning 4 weeks pre-KT, integration testing, fallback manual procedures", owner: "IT / Provider Tech Lead", toolkit: ["3.4"] },
];

// ═══ GOVERNANCE & RETAINED ORG ═══
const GOVERNANCE_LAYERS = [
  { level: "Strategic", cadence: "Quarterly", participants: "CFO, VP Finance, Provider SVP", agenda: "Strategic alignment, contract performance, market benchmarking, innovation pipeline, relationship health", decisions: "Contract modifications, scope changes, renewal/termination", toolkit: ["3.5"] },
  { level: "Tactical", cadence: "Monthly", participants: "AR Director, Provider Delivery Manager, Process Leads", agenda: "SLA performance review, issue resolution, change requests, improvement initiatives, capacity planning", decisions: "Process changes, escalation resolution, resource adjustments", toolkit: ["1.5", "KPI"] },
  { level: "Operational", cadence: "Weekly / Daily", participants: "Retained AR Leads, Provider Team Leads, Process SMEs", agenda: "Daily volume/queue monitoring, exception handling, issue triage, KPI flash reporting", decisions: "Day-to-day operational decisions, exception approval, priority changes", toolkit: ["1.5", "2.6"] },
];

const RETAINED_ROLES = [
  { role: "OtC Process Owner", fte: 1, level: "Senior", responsibilities: ["End-to-end OtC process ownership", "SLA definition and enforcement", "Continuous improvement roadmap", "Stakeholder management (sales, ops, customer)"], retained: true, toolkit: ["1.1", "1.6"] },
  { role: "Provider Governance Lead", fte: 0.5, level: "Mid-Senior", responsibilities: ["Day-to-day provider management", "SLA tracking and reporting", "Change request management", "Escalation point for operational issues"], retained: true, toolkit: ["2.6"] },
  { role: "Credit Risk Manager", fte: 1, level: "Senior", responsibilities: ["Credit policy and limit authority", "Exception approvals (above provider authority)", "Portfolio risk monitoring", "ECL model oversight"], retained: true, toolkit: ["2.1"] },
  { role: "Strategic Collections Lead", fte: 0.5, level: "Mid", responsibilities: ["Key account relationship management", "Escalated collection cases", "Payment plan negotiations", "Sales team liaison"], retained: true, toolkit: ["1.3"] },
  { role: "Controls & Compliance Analyst", fte: 0.5, level: "Mid", responsibilities: ["SOX control testing oversight", "Provider audit coordination", "E-invoicing compliance monitoring", "Policy exception review"], retained: true, toolkit: ["2.4", "1.4"] },
  { role: "AR Analytics / Reporting", fte: 0.5, level: "Mid", responsibilities: ["KPI dashboard maintenance (→ 1.5)", "Ad-hoc analysis for leadership", "Benchmarking and trend analysis", "Business case support (→ 3.5)"], retained: true, toolkit: ["1.5", "3.5", "KPI"] },
];

// ═══ COST MODEL ═══

export default function BPOEvaluation() {
  const [activeTab, setActiveTab] = useState("scope");
  const [scopeSelections, setScopeSelections] = useState(() =>
    Object.fromEntries(OTC_PROCESSES.map((p, i) => [i, i < 4 || i === 6 ? "outsource" : "retain"]))
  );
  const [expandedPricing, setExpandedPricing] = useState(null);

  // Cost comparison model
  const [costParams, setCostParams] = useState({
    currentFTEs: 25,
    avgFTECost: 55, // €k
    overheadMultiplier: 1.35, // benefits, office, IT
    bpoFTERate: 3800, // €/month
    bpoFTECount: 18, // equivalent FTEs at provider
    retainedFTEs: 4,
    retainedAvgCost: 70, // €k — more senior
    transitionCost: 180, // €k one-off
    governanceCost: 35, // €k/year
    techEnablement: 60, // €k one-off
  });
  const updCost = (k, v) => setCostParams(p => ({ ...p, [k]: v }));

  const costComparison = useMemo(() => {
    const currentAnnual = costParams.currentFTEs * costParams.avgFTECost * 1000 * costParams.overheadMultiplier;
    const bpoAnnual = (costParams.bpoFTECount * costParams.bpoFTERate * 12) + (costParams.retainedFTEs * costParams.retainedAvgCost * 1000 * costParams.overheadMultiplier) + (costParams.governanceCost * 1000);
    const y1Cost = bpoAnnual + (costParams.transitionCost + costParams.techEnablement) * 1000;
    const annualSaving = currentAnnual - bpoAnnual;
    const savingPct = (annualSaving / currentAnnual) * 100;
    const paybackMonths = annualSaving > 0 ? ((costParams.transitionCost + costParams.techEnablement) * 1000 / (annualSaving / 12)) : 999;
    const threeYearSaving = (annualSaving * 3) - (costParams.transitionCost + costParams.techEnablement) * 1000;
    return { currentAnnual, bpoAnnual, y1Cost, annualSaving, savingPct, paybackMonths, threeYearSaving };
  }, [costParams]);

  // ─── Render Scope ───
  const renderScope = () => {
    const outsourcedCount = Object.values(scopeSelections).filter(v => v === "outsource").length;
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card glow>
          <SectionTitle sub="Select which OtC processes to outsource vs. retain — based on complexity, BPO suitability, and risk">Scope Definition Matrix</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "10px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "20px", fontWeight: 700, color: T.accent }}>{outsourcedCount}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Processes outsourced</div>
            </div>
            <div style={{ padding: "10px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "20px", fontWeight: 700, color: T.amber }}>{OTC_PROCESSES.length - outsourcedCount}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Processes retained</div>
            </div>
            <div style={{ padding: "10px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "20px", fontWeight: 700, color: T.green }}>{OTC_PROCESSES.length}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Total OtC processes</div>
            </div>
          </div>
        </Card>

        {OTC_PROCESSES.map((p, i) => {
          const isOut = scopeSelections[i] === "outsource";
          return (
            <Card key={i} style={{ padding: "14px 16px", borderColor: isOut ? T.accent : T.border, transition: "border-color 0.2s" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{p.process}</span>
                    <Badge>{p.apqc}</Badge>
                    <Badge color={p.bpoSuitability.includes("High") ? T.green : p.bpoSuitability.includes("Medium") ? T.amber : T.red}
                      bg={p.bpoSuitability.includes("High") ? T.greenDim : p.bpoSuitability.includes("Medium") ? T.amberDim : T.redDim}>
                      BPO: {p.bpoSuitability}
                    </Badge>
                    <Badge color={T.textMuted} bg={T.surfaceAlt}>Complexity: {p.complexity}</Badge>
                  </div>
                  <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginBottom: "4px" }}>{p.rationale}</div>
                  <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>
                    <span style={{ color: T.red, fontFamily: T.mono, fontSize: "10px", marginRight: "4px" }}>RISK</span>{p.retainRisk}
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                    {p.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {["outsource", "retain"].map(opt => (
                    <button key={opt} onClick={() => setScopeSelections(prev => ({ ...prev, [i]: opt }))}
                      style={{
                        padding: "6px 14px", borderRadius: T.radius,
                        border: `1px solid ${scopeSelections[i] === opt ? (opt === "outsource" ? T.accent : T.amber) : T.border}`,
                        background: scopeSelections[i] === opt ? (opt === "outsource" ? T.accentDim : T.amberDim) : "transparent",
                        color: scopeSelections[i] === opt ? (opt === "outsource" ? T.accent : T.amber) : T.textDim,
                        fontFamily: T.font, fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                        textTransform: "capitalize",
                      }}>{opt}</button>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // ─── Render Providers ───
  const renderProviders = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      {PROVIDER_TIERS.map((tier, ti) => (
        <Card key={ti} style={{ borderLeft: `3px solid ${tier.color}` }}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 700, color: tier.color, marginBottom: "4px" }}>{tier.tier}</div>
            <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim }}>{tier.description}</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Provider", "HQ", "OtC Strengths", "Scale", "Geographies"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tier.providers.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 6px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.accent }}>{p.hq}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textMuted, maxWidth: "280px" }}>{p.otcStrength}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.textMuted }}>{p.fte}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textDim, fontSize: "11px" }}>{p.geographies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {/* Selection criteria summary */}
      <Card>
        <SectionTitle sub="Key differentiators when evaluating BPO providers for OtC">Provider Evaluation Criteria</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { criterion: "OtC Domain Expertise", weight: "Critical", desc: "Specific OtC process knowledge, not just generic F&A. Ask for OtC-specific case studies and named SMEs." },
            { criterion: "Technology Stack", weight: "High", desc: "Provider's own tooling vs. operating your systems. AI/automation capabilities for cash app, collections, coding." },
            { criterion: "Delivery Location", weight: "High", desc: "Language coverage, time zone overlap, regulatory constraints (GDPR for EU data), labor market stability." },
            { criterion: "Transition Methodology", weight: "High", desc: "Proven KT framework, transition risk management, hypercare approach. Reference-check transition experiences." },
            { criterion: "Scalability & Flexibility", weight: "Medium", desc: "Ability to scale ±20% without notice. Flexibility on pricing model evolution. Multi-entity deployment capability." },
            { criterion: "Cultural Fit", weight: "Medium", desc: "Communication style, management approach, customer interaction standards. Critical for collections and disputes." },
          ].map((c, i) => (
            <div key={i} style={{ padding: "12px", background: T.bg, borderRadius: T.radius }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.text }}>{c.criterion}</span>
                <Badge color={c.weight === "Critical" ? T.red : c.weight === "High" ? T.amber : T.green}
                  bg={c.weight === "Critical" ? T.redDim : c.weight === "High" ? T.amberDim : T.greenDim}>{c.weight}</Badge>
              </div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── Render Pricing ───
  const renderPricing = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="4 pricing models compared — select based on maturity, volume predictability, and transformation ambition">Pricing Model Comparison</SectionTitle>
      </Card>

      {PRICING_MODELS.map((pm, i) => (
        <Card key={i} onClick={() => setExpandedPricing(expandedPricing === i ? null : i)}
          style={{ borderLeft: `3px solid ${pm.color}`, cursor: "pointer", transition: "all 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: expandedPricing === i ? "12px" : "0" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "18px" }}>{pm.icon}</span>
                <span style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 700, color: T.text }}>{pm.model}</span>
              </div>
              <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>{pm.description}</div>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: "16px", color: T.textDim, transition: "transform 0.2s", transform: expandedPricing === i ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </div>
          {expandedPricing === i && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.green, textTransform: "uppercase", marginBottom: "6px" }}>Advantages</div>
                  {pm.pros.map((p, j) => <div key={j} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.green, marginRight: "6px" }}>+</span>{p}</div>)}
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.red, textTransform: "uppercase", marginBottom: "6px" }}>Considerations</div>
                  {pm.cons.map((c, j) => <div key={j} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.red, marginRight: "6px" }}>−</span>{c}</div>)}
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.accent, textTransform: "uppercase", marginBottom: "6px" }}>Best For</div>
                  <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{pm.bestFor}</div>
                  <div style={{ marginTop: "8px", padding: "8px 10px", background: T.bg, borderRadius: T.radius }}>
                    <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.amber, textTransform: "uppercase", marginBottom: "4px" }}>Typical Range</div>
                    <div style={{ fontFamily: T.mono, fontSize: "12px", color: T.text }}>{pm.typicalRange}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      ))}

      {/* Cost comparison calculator */}
      <Card glow>
        <SectionTitle sub="Model in-house vs BPO cost to build the financial case for outsourcing">Cost Comparison Calculator</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Current In-House</div>
            <div style={{ display: "grid", gap: "8px" }}>
              <Field label="Current AR FTEs"><NumInput value={costParams.currentFTEs} onChange={v => updCost("currentFTEs", v)} width="70px" /></Field>
              <Field label="Avg FTE Cost (fully loaded)"><NumInput value={costParams.avgFTECost} onChange={v => updCost("avgFTECost", v)} suffix="€k" width="70px" /></Field>
              <Field label="Overhead Multiplier"><NumInput value={costParams.overheadMultiplier} onChange={v => updCost("overheadMultiplier", v)} suffix="x" step={0.05} width="70px" /></Field>
            </div>
            <div style={{ marginTop: "12px", padding: "10px", background: T.bg, borderRadius: T.radius }}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>Current Annual Cost</div>
              <div style={{ fontFamily: T.mono, fontSize: "22px", fontWeight: 700, color: T.amber }}>{fmt(costComparison.currentAnnual)}</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>BPO Model</div>
            <div style={{ display: "grid", gap: "8px" }}>
              <Field label="BPO FTE Count"><NumInput value={costParams.bpoFTECount} onChange={v => updCost("bpoFTECount", v)} width="70px" /></Field>
              <Field label="BPO FTE Rate"><NumInput value={costParams.bpoFTERate} onChange={v => updCost("bpoFTERate", v)} suffix="€/mo" width="80px" /></Field>
              <Field label="Retained FTEs"><NumInput value={costParams.retainedFTEs} onChange={v => updCost("retainedFTEs", v)} width="70px" /></Field>
              <Field label="Retained Avg Cost"><NumInput value={costParams.retainedAvgCost} onChange={v => updCost("retainedAvgCost", v)} suffix="€k" width="70px" /></Field>
              <Field label="Transition Cost (one-off)"><NumInput value={costParams.transitionCost} onChange={v => updCost("transitionCost", v)} suffix="€k" width="70px" /></Field>
              <Field label="Governance Cost (annual)"><NumInput value={costParams.governanceCost} onChange={v => updCost("governanceCost", v)} suffix="€k" width="70px" /></Field>
            </div>
            <div style={{ marginTop: "12px", padding: "10px", background: T.bg, borderRadius: T.radius }}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>BPO Annual Cost (steady state)</div>
              <div style={{ fontFamily: T.mono, fontSize: "22px", fontWeight: 700, color: T.accent }}>{fmt(costComparison.bpoAnnual)}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { label: "Annual Saving", value: fmt(costComparison.annualSaving), color: costComparison.annualSaving > 0 ? T.green : T.red, sub: `${costComparison.savingPct.toFixed(0)}% reduction` },
            { label: "Year 1 (incl transition)", value: fmt(costComparison.y1Cost), color: T.amber, sub: "includes one-off costs" },
            { label: "Payback Period", value: `${costComparison.paybackMonths.toFixed(0)} months`, color: costComparison.paybackMonths < 12 ? T.green : T.amber, sub: "transition cost recovery" },
            { label: "3-Year Net Saving", value: fmt(costComparison.threeYearSaving), color: T.green, sub: "cumulative after transition" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "10px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim, textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── Render SLA ───
  const renderSLA = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      {SLA_CATEGORIES.map((cat, ci) => (
        <Card key={ci} style={{ borderLeft: `3px solid ${cat.color}` }}>
          <div style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 700, color: cat.color, marginBottom: "12px" }}>{cat.category}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["SLA Metric", "Target", "Measurement", "Penalty / Incentive", "Toolkit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cat.slas.map((s, si) => (
                <tr key={si}>
                  <td style={{ padding: "8px 6px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>{s.metric}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.green }}>{s.target}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textMuted, fontSize: "11px" }}>{s.measurement}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.amber, fontSize: "11px" }}>{s.penalty}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", gap: "3px" }}>{s.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );

  // ─── Render Transition & Risk ───
  const renderTransition = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="6-phase transition lifecycle from due diligence through steady state">Transition Roadmap</SectionTitle>
      </Card>

      {TRANSITION_PHASES.map((p, i) => (
        <Card key={i} style={{ padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: T.accentDim, border: `2px solid ${T.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: "14px", fontWeight: 700, color: T.accent,
              }}>{i + 1}</div>
              {i < TRANSITION_PHASES.length - 1 && <div style={{ width: "2px", flex: 1, background: T.border, marginTop: "4px" }} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 600, color: T.text }}>{p.phase}</span>
                <Badge color={T.accent}>{p.duration}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <div style={{ padding: "8px 10px", background: T.bg, borderRadius: T.radius }}>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.green, textTransform: "uppercase", marginBottom: "4px" }}>Activities</div>
                  {p.activities.map((a, j) => <div key={j} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.accent, marginRight: "6px" }}>›</span>{a}</div>)}
                </div>
                <div style={{ padding: "8px 10px", background: T.bg, borderRadius: T.radius }}>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.red, textTransform: "uppercase", marginBottom: "4px" }}>Key Risks</div>
                  {p.risks.map((r, j) => <div key={j} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.red, marginRight: "6px" }}>⚠</span>{r}</div>)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {p.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Risk Register */}
      <Card>
        <SectionTitle sub="8 key transition risks with likelihood, impact, mitigation, and ownership">Risk Register</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["Risk", "Likelihood", "Impact", "Mitigation", "Owner", "Toolkit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISK_REGISTER.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 6px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, maxWidth: "180px" }}>{r.risk}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                    <Badge color={r.likelihood === "High" ? T.red : r.likelihood === "Medium" ? T.amber : T.green}
                      bg={r.likelihood === "High" ? T.redDim : r.likelihood === "Medium" ? T.amberDim : T.greenDim}>{r.likelihood}</Badge>
                  </td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                    <Badge color={r.impact === "Critical" ? T.red : r.impact === "High" ? T.amber : T.green}
                      bg={r.impact === "Critical" ? T.redDim : r.impact === "High" ? T.amberDim : T.greenDim}>{r.impact}</Badge>
                  </td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textMuted, fontSize: "11px", maxWidth: "280px" }}>{r.mitigation}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.purple }}>{r.owner}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>{r.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ─── Render Governance ───
  const renderGovernance = () => {
    const totalRetainedFTE = RETAINED_ROLES.reduce((s, r) => s + r.fte, 0);
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="3-tier governance model ensuring strategic alignment, operational control, and continuous improvement">Governance Framework</SectionTitle>
          <div style={{ display: "grid", gap: "6px" }}>
            {GOVERNANCE_LAYERS.map((g, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 100px 1fr 1fr", gap: "12px", padding: "12px", background: T.bg, borderRadius: T.radius, alignItems: "start" }}>
                <div>
                  <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 700, color: T.text }}>{g.level}</div>
                  <Badge color={T.accent}>{g.cadence}</Badge>
                </div>
                <div style={{ fontFamily: T.font, fontSize: "12px", color: T.purple }}>{g.participants}</div>
                <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{g.agenda}</div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.amber, textTransform: "uppercase", marginBottom: "4px" }}>Decisions</div>
                  <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{g.decisions}</div>
                  <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>{g.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Retained Organization */}
        <Card glow>
          <SectionTitle sub="Minimum viable retained team to govern the BPO relationship and manage retained processes">Retained Organization Design</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>
              The retained organization is the most critical success factor in BPO. Under-investing here is the #1 cause of outsourcing failure. These roles ensure governance, quality, and strategic control remain in-house.
            </div>
            <div style={{ padding: "12px 20px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>Total Retained FTEs</div>
              <div style={{ fontFamily: T.mono, fontSize: "28px", fontWeight: 700, color: T.accent }}>{totalRetainedFTE}</div>
            </div>
          </div>

          {RETAINED_ROLES.map((r, i) => (
            <div key={i} style={{ padding: "12px 14px", borderBottom: i < RETAINED_ROLES.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{r.role}</span>
                  <Badge color={T.accent}>{r.fte} FTE</Badge>
                  <Badge color={T.textMuted} bg={T.surfaceAlt}>{r.level}</Badge>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {r.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginLeft: "0" }}>
                {r.responsibilities.map((resp, j) => (
                  <div key={j} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}>
                    <span style={{ color: T.accent, marginRight: "6px" }}>›</span>{resp}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>

        {/* RACI summary */}
        <Card>
          <SectionTitle sub="Responsibility assignment between retained team and BPO provider">RACI Summary (Key Activities)</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Activity", "Client (Retained)", "BPO Provider"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["OtC Strategy & Policy", "Accountable / Responsible", "Informed"],
                  ["Credit Limit Decisions (>threshold)", "Accountable / Responsible", "Consulted"],
                  ["Credit Limit Decisions (<threshold)", "Informed", "Accountable / Responsible"],
                  ["Invoice Generation & Delivery", "Informed", "Accountable / Responsible"],
                  ["Cash Application (standard)", "Informed", "Accountable / Responsible"],
                  ["Cash Application (exceptions)", "Consulted", "Responsible"],
                  ["Collections — Standard Dunning", "Informed", "Accountable / Responsible"],
                  ["Collections — Strategic Accounts", "Accountable / Responsible", "Informed"],
                  ["Dispute Investigation & Filing", "Consulted", "Responsible"],
                  ["Dispute Resolution Authority", "Accountable", "Responsible"],
                  ["Write-Off Approval", "Accountable / Responsible", "Consulted"],
                  ["SOX Control Execution", "Accountable", "Responsible"],
                  ["SOX Control Testing", "Accountable / Responsible", "Consulted"],
                  ["KPI Reporting & Analytics", "Accountable", "Responsible (data)"],
                  ["Continuous Improvement", "Accountable", "Responsible"],
                  ["Vendor/Stakeholder Management", "Accountable / Responsible", "Informed"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: row[1].includes("Accountable") ? T.accent : T.textMuted }}>{row[1]}</td>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: row[2].includes("Accountable") ? T.accent : row[2].includes("Responsible") ? T.green : T.textDim }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ─── Render Cross-Reference ───
  const renderXRef = () => {
    const sections = [
      { id: "scope", name: "Scope Definition", refs: ["1.1", "1.5", "2.5", "KPI", "2.4", "1.4", "2.1", "2.2", "2.3", "3.1", "3.2"], apqc: "11.5" },
      { id: "providers", name: "Provider Landscape", refs: ["2.6"], apqc: "11.5.1" },
      { id: "pricing", name: "Pricing Models", refs: ["1.5", "3.5", "KPI"], apqc: "11.5.2" },
      { id: "sla", name: "SLA Framework", refs: ["1.2", "1.3", "1.5", "2.1", "2.2", "2.3", "2.4", "2.6", "3.2", "3.3", "KPI"], apqc: "11.5.3" },
      { id: "transition", name: "Transition & Risk", refs: ["1.1", "1.5", "2.4", "2.5", "2.6", "3.4", "KPI"], apqc: "11.5.4" },
      { id: "governance", name: "Governance & Retained Org", refs: ["1.1", "1.3", "1.4", "1.5", "1.6", "2.1", "2.4", "2.6", "3.5", "KPI"], apqc: "11.5.5" },
    ];
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="How each section of 3.6 maps to toolkit deliverables — this deliverable has the broadest cross-reference footprint">Cross-Reference Matrix</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>3.6 Section</th>
                  {Object.keys(CROSS_REFS).map(code => (
                    <th key={code} style={{ padding: "8px 3px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "9px", textAlign: "center", minWidth: "26px" }}>{code}</th>
                  ))}
                  <th style={{ padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "10px" }}>APQC</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>{s.name}</td>
                    {Object.keys(CROSS_REFS).map(code => (
                      <td key={code} style={{ padding: "4px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                        {s.refs.includes(code) ? <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: T.accent }} /> : <span style={{ color: T.border }}>·</span>}
                      </td>
                    ))}
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}><Badge>{s.apqc}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {Object.entries(CROSS_REFS).map(([code, ref]) => (
            <Card key={code} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge color={ref.p === 1 ? T.accent : ref.p === 2 ? T.purple : T.green} bg={ref.p === 1 ? T.accentDim : ref.p === 2 ? T.purpleDim : T.greenDim}>P{ref.p} · {code}</Badge>
                <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text }}>{ref.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: T.font, background: T.bg, color: T.text, minHeight: "100vh", padding: "24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Badge color={T.bg} bg={T.accent}>3.6</Badge>
          <Badge>PHASE 3</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC 11.5</Badge>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "26px", fontWeight: 700, color: T.text, margin: "0 0 4px" }}>OtC Managed Services / BPO Evaluation</h1>
        <p style={{ fontFamily: T.font, fontSize: "14px", color: T.textDim, margin: 0 }}>Scope definition · Provider landscape · Pricing models · SLA benchmarks · Transition risk · Governance</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 14px", background: "transparent", border: "none",
            borderBottom: `2px solid ${activeTab === tab.id ? T.accent : "transparent"}`,
            color: activeTab === tab.id ? T.accent : T.textDim,
            fontFamily: T.font, fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400,
            cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease", marginBottom: "-1px",
          }}><span style={{ marginRight: "6px" }}>{tab.icon}</span>{tab.label}</button>
        ))}
      </div>

      {activeTab === "scope" && renderScope()}
      {activeTab === "providers" && renderProviders()}
      {activeTab === "pricing" && renderPricing()}
      {activeTab === "sla" && renderSLA()}
      {activeTab === "transition" && renderTransition()}
      {activeTab === "governance" && renderGovernance()}
      {activeTab === "xref" && renderXRef()}

      <div style={{ marginTop: "32px", padding: "16px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>OtC Consulting Toolkit · Phase 3 · v3.6.0</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>12 Providers Mapped</Badge>
        </div>
      </div>
    </div>
  );
}
