import { useState, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// OtC Diagnostic & Readiness Assessment — P4.3
// Client-facing intake → maturity scoring → gap analysis → engagement recommendation
// Design system: dark theme, DM Sans + JetBrains Mono, APQC PCF v8.0
// ═══════════════════════════════════════════════════════════════

const T = {
  bg: "#0B0F1A", surface: "#111827", surfaceAlt: "#1a2236", border: "#1e293b",
  text: "#f1f5f9", textMuted: "#94a3b8", textDim: "#64748b",
  accent: "#6366f1", accentSoft: "#6366f120", accentMed: "#6366f140",
  green: "#22c55e", greenSoft: "#22c55e20", amber: "#f59e0b", amberSoft: "#f59e0b20",
  red: "#ef4444", redSoft: "#ef444420", cyan: "#06b6d4", cyanSoft: "#06b6d420",
  purple: "#a855f7", purpleSoft: "#a855f720",
  font: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace",
  radius: "8px", radiusSm: "6px",
};

const MATURITY_LEVELS = [
  { level: 1, label: "Ad-Hoc", color: T.red, desc: "Manual, reactive, no standardization" },
  { level: 2, label: "Developing", color: T.amber, desc: "Some documentation, inconsistent execution" },
  { level: 3, label: "Defined", color: "#eab308", desc: "Standardized processes, basic automation" },
  { level: 4, label: "Managed", color: T.cyan, desc: "Measured, optimized, advanced automation" },
  { level: 5, label: "Leading", color: T.green, desc: "Predictive, AI-driven, continuous improvement" },
];

const TIERS = [
  { id: "sme", label: "SME", sub: "50–200 employees", color: T.green },
  { id: "mid", label: "Mid-Market", sub: "200–500 employees", color: T.cyan },
  { id: "enterprise", label: "Enterprise", sub: "500–2,000 employees", color: T.accent },
  { id: "global", label: "Global MNC", sub: "2,000+ employees", color: T.purple },
];

// ── Assessment Domains (8 OtC process areas, APQC-coded) ──
const DOMAINS = [
  {
    id: "order_mgmt", name: "Order Management", icon: "📋", apqc: "10863",
    desc: "Order capture, validation, fulfillment tracking, and exception handling",
    questions: [
      { id: "om1", text: "How are customer orders captured and entered?", anchors: ["Manual entry from email/phone/fax with no validation", "Semi-automated with basic validation rules", "EDI/API integration with automated validation and error routing", "Fully integrated omnichannel with intelligent exception handling", "AI-driven order orchestration with predictive fulfillment"] },
      { id: "om2", text: "How are order exceptions and holds managed?", anchors: ["Ad-hoc, handled by whoever notices the issue", "Basic queue with manual review", "Defined escalation paths with SLA tracking", "Automated routing with root cause categorization", "Predictive exception prevention with ML-based hold optimization"] },
      { id: "om3", text: "What is the order-to-invoice cycle time?", anchors: [">5 business days average", "3–5 business days", "1–2 business days", "Same day for standard orders", "Real-time / continuous invoicing"] },
    ],
  },
  {
    id: "credit_mgmt", name: "Credit Management", icon: "🛡️", apqc: "10864",
    desc: "Credit policy, risk assessment, limit management, and monitoring",
    questions: [
      { id: "cm1", text: "How are credit limits set and reviewed?", anchors: ["No formal credit policy — limits set ad-hoc", "Basic policy with annual reviews", "Tiered policy with semi-annual reviews using financial data", "Dynamic limits with real-time credit bureau integration", "AI-driven scoring with continuous monitoring and predictive risk alerts"] },
      { id: "cm2", text: "How is credit risk monitored for existing customers?", anchors: ["Not monitored — react only when payment is late", "Periodic manual review of aging reports", "Quarterly portfolio reviews with external data", "Automated alerts on payment behavior and credit score changes", "Continuous risk surveillance with predictive default modeling"] },
      { id: "cm3", text: "What is the credit approval process for new customers?", anchors: ["No formal process — sales decides", "Paper-based application with manual check", "Standardized application with credit bureau pull", "Automated scoring with tiered approval authority", "Instant decisioning with AI-based risk assessment and dynamic terms"] },
    ],
  },
  {
    id: "billing", name: "Billing & Invoicing", icon: "🧾", apqc: "10865",
    desc: "Invoice generation, delivery, e-invoicing compliance, and accuracy",
    questions: [
      { id: "bi1", text: "How are invoices generated and delivered?", anchors: ["Manual creation in Word/Excel, sent via email/post", "ERP-generated but manual review before sending", "Automated generation with electronic delivery (PDF/email)", "Fully automated with e-invoicing compliance (Peppol/local mandates)", "AI-validated, multi-format, multi-channel with real-time delivery confirmation"] },
      { id: "bi2", text: "What is the invoice accuracy rate?", anchors: ["Unknown / not measured", "Below 90%", "90–95%", "95–98%", "98%+ with automated validation preventing errors at source"] },
      { id: "bi3", text: "How are billing disputes handled at the invoice stage?", anchors: ["No distinction — all disputes go to collections", "Basic tracking in spreadsheets", "Categorized in ERP with defined resolution workflows", "Automated routing with root cause analytics", "Predictive dispute prevention with pre-invoice validation against PO/contract"] },
    ],
  },
  {
    id: "collections", name: "Collections & Dunning", icon: "📞", apqc: "10866",
    desc: "Dunning strategy, segmentation, escalation, and recovery effectiveness",
    questions: [
      { id: "co1", text: "How is the collections strategy structured?", anchors: ["No strategy — call whoever is oldest overdue", "Basic aging-based follow-up (30/60/90)", "Segmented strategy by risk, value, or behavior", "Automated multi-channel dunning with A/B tested messaging", "AI-optimized contact strategy with propensity-to-pay scoring"] },
      { id: "co2", text: "What is the current Days Sales Outstanding (DSO)?", anchors: [">75 days or unknown", "60–75 days", "45–60 days", "30–45 days", "<30 days with consistent improvement trend"] },
      { id: "co3", text: "How are escalations and write-offs governed?", anchors: ["No formal policy — ad-hoc decisions", "Basic write-off threshold, no escalation matrix", "Defined authority matrix with documented approval chain", "Automated escalation workflows with compliance controls", "Predictive write-off modeling with SOX-compliant automated governance"] },
    ],
  },
  {
    id: "cash_app", name: "Cash Application", icon: "💰", apqc: "10867",
    desc: "Payment matching, remittance processing, and exception resolution",
    questions: [
      { id: "ca1", text: "How are incoming payments matched to invoices?", anchors: ["100% manual matching in spreadsheets or ERP", "Semi-manual with basic ERP matching rules", "Automated matching with 60–75% straight-through rate", "AI-assisted matching with 80–90% STP rate", "ML-driven matching with 95%+ STP and automated exception learning"] },
      { id: "ca2", text: "How are unidentified or short payments handled?", anchors: ["Sit in suspense until someone investigates", "Weekly review with manual research", "Defined workflow with SLA for resolution", "Automated routing with remittance AI parsing", "Real-time identification with predictive deduction coding"] },
      { id: "ca3", text: "What payment channels do customers use?", anchors: ["Mostly checks, manual processing", "Mix of checks and wire transfers", "Primarily electronic (wire/ACH) with payment portal option", "Customer self-service portal with multiple payment methods", "Integrated payment ecosystem with real-time reconciliation across all channels"] },
    ],
  },
  {
    id: "deductions", name: "Deductions & Disputes", icon: "⚖️", apqc: "10868",
    desc: "Deduction management, dispute resolution, root cause analysis, and recovery",
    questions: [
      { id: "de1", text: "How are customer deductions identified and categorized?", anchors: ["No distinction — all short payments treated the same", "Basic categorization (trade vs non-trade) in spreadsheets", "ERP-based tracking with reason codes and owner assignment", "Automated classification with integration to trade promotion data", "AI-driven auto-coding with real-time validity assessment and root cause tagging"] },
      { id: "de2", text: "What is the deduction resolution cycle time?", anchors: [">60 days or unknown", "45–60 days", "30–45 days", "15–30 days", "<15 days with automated fast-track for recurring patterns"] },
      { id: "de3", text: "Is there a deduction prevention program?", anchors: ["No — purely reactive", "Ad-hoc root cause analysis on large deductions", "Quarterly root cause reviews with corrective actions", "Integrated prevention program with cross-functional accountability", "Predictive prevention with ML-based pattern detection and automated upstream corrections"] },
    ],
  },
  {
    id: "reporting", name: "Reporting & Analytics", icon: "📊", apqc: "10869",
    desc: "AR reporting, cash forecasting, performance measurement, and insights",
    questions: [
      { id: "re1", text: "What AR reporting capabilities exist?", anchors: ["Basic aging report from ERP, run manually", "Standard suite of periodic reports (aging, DSO, collections)", "Interactive dashboards with drill-down capability", "Real-time dashboards with predictive analytics", "AI-powered insights with anomaly detection and prescriptive recommendations"] },
      { id: "re2", text: "How is cash flow forecasted?", anchors: ["Not forecasted / gut feel", "Simple extrapolation from historical patterns", "Statistical models using AR aging and payment history", "ML-based forecasting with multiple scenario modeling", "Real-time probabilistic forecasting integrated with treasury management"] },
      { id: "re3", text: "How are OtC KPIs used to drive improvement?", anchors: ["KPIs not tracked or reported", "Monthly reports reviewed by finance leadership", "KPIs tied to team targets with regular performance reviews", "Automated scorecards with root cause drill-down and action tracking", "Predictive KPI management with automated intervention triggers"] },
    ],
  },
  {
    id: "technology", name: "Technology & Integration", icon: "⚙️", apqc: "10870",
    desc: "Systems landscape, automation level, integration maturity, and data quality",
    questions: [
      { id: "te1", text: "What is the core OtC technology stack?", anchors: ["Spreadsheets and basic accounting software", "Single ERP with native AR module", "ERP + 1-2 specialized tools (collections, e-invoicing)", "Integrated best-of-breed stack with middleware/iPaaS", "AI-native platform with unified data layer and process orchestration"] },
      { id: "te2", text: "How well are OtC systems integrated?", anchors: ["No integration — manual data transfer between systems", "Basic file-based batch integrations (CSV/SFTP)", "API-based integrations with periodic sync", "Real-time event-driven integration with error handling", "Unified data platform with bi-directional real-time sync and automated reconciliation"] },
      { id: "te3", text: "What is the data quality across OtC systems?", anchors: ["Poor — frequent errors, duplicates, no master data governance", "Basic cleanup efforts but no formal governance", "Defined data standards with periodic cleansing", "Automated data quality rules with exception dashboards", "Continuous data quality management with ML-based anomaly detection"] },
    ],
  },
];

// ── Engagement Packages ──
const PACKAGES = [
  {
    id: "diagnostic", name: "OtC Health Check", duration: "2–3 weeks", color: T.green,
    desc: "Deep-dive diagnostic with prioritized roadmap",
    includes: ["Process walk-throughs across all 8 OtC domains", "Maturity scoring with benchmark comparison", "Top 5 quick wins with business case quantification", "90-day improvement roadmap", "Executive summary presentation"],
    idealFor: "Companies scoring 1.0–2.5 who need clarity on where to start",
    priceRange: "€3,500 – €7,500",
    note: "First 5 engagements at €3,500 flat in exchange for case study rights",
  },
  {
    id: "accelerator", name: "OtC Accelerator", duration: "8–12 weeks", color: T.cyan,
    desc: "Targeted improvement sprint on 2–3 highest-impact domains",
    includes: ["Everything in Health Check", "Process redesign for priority domains", "Technology selection support (RFP, vendor scoring)", "Change management and training plan", "KPI framework and measurement setup", "Bi-weekly steering committee presentations"],
    idealFor: "Companies scoring 2.0–3.5 with specific pain points to fix fast",
    priceRange: "€9,000 – €22,500",
    note: "Includes all 18 process packs as working assets — no IP withholding",
  },
  {
    id: "transformation", name: "OtC Transformation", duration: "4–6 months", color: T.accent,
    desc: "End-to-end OtC optimization program with implementation support",
    includes: ["Everything in Accelerator", "Full process redesign across all domains", "Technology implementation oversight", "Shared services / BPO evaluation if applicable", "SOX compliance controls design", "Business case tracking and benefits realization", "Monthly executive reporting"],
    idealFor: "Companies scoring 2.5–4.0 ready for structural change",
    priceRange: "€25,000 – €45,000",
    note: "Phased billing: 40% start / 30% milestone / 30% completion + success clause",
  },
];

// ── Cross-references to existing toolkit ──
const TOOLKIT_REFS = {
  order_mgmt: ["1.1 Taxonomy", "3.1 Onboarding"],
  credit_mgmt: ["2.1 Credit Mgmt", "1.6 Maturity"],
  billing: ["2.3 Billing", "1.4 E-Invoicing"],
  collections: ["1.3 Collections", "1.5 KPI Dashboard"],
  cash_app: ["1.2 Cash App", "3.3 Treasury"],
  deductions: ["2.2 Disputes", "3.2 Deductions"],
  reporting: ["1.5 KPI Dashboard", "4.4 KPI Spec v2", "2.5 Process Mining"],
  technology: ["3.4 Tech Selection", "3.5 Business Case"],
};

// ── Components ──
const Card = ({ children, style }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px", ...style }}>{children}</div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontFamily: T.mono, fontWeight: 500, color, background: bg, letterSpacing: "0.02em" }}>{children}</span>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: "16px" }}>
    <h3 style={{ margin: 0, fontFamily: T.font, fontSize: "16px", fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>{children}</h3>
    {sub && <p style={{ margin: "4px 0 0", fontFamily: T.font, fontSize: "12px", color: T.textDim }}>{sub}</p>}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function OtCDiagnostic({ onNavigate }) {
  const [step, setStep] = useState("intro"); // intro | profile | assess | results
  const [tier, setTier] = useState("mid");
  const [company, setCompany] = useState({ name: "", revenue: "", invoiceVolume: "", headcount: "", industry: "Manufacturing", erp: "" });
  const [scores, setScores] = useState({});
  const [currentDomain, setCurrentDomain] = useState(0);
  const [expandedPkg, setExpandedPkg] = useState(null);

  const handleScore = useCallback((qId, value) => {
    setScores(prev => ({ ...prev, [qId]: value }));
  }, []);

  // ── Computed Results ──
  const results = useMemo(() => {
    const domainScores = DOMAINS.map(d => {
      const qScores = d.questions.map(q => scores[q.id] || 0).filter(s => s > 0);
      const avg = qScores.length > 0 ? qScores.reduce((a, b) => a + b, 0) / qScores.length : 0;
      return { ...d, score: Math.round(avg * 10) / 10, answered: qScores.length, total: d.questions.length };
    });
    const overall = domainScores.filter(d => d.score > 0);
    const avgScore = overall.length > 0 ? overall.reduce((a, b) => a + b.score, 0) / overall.length : 0;
    const lowest = [...domainScores].filter(d => d.score > 0).sort((a, b) => a.score - b.score);
    const highest = [...domainScores].filter(d => d.score > 0).sort((a, b) => b.score - a.score);

    // Quick wins = domains with biggest gap between current and tier-appropriate target
    const tierTarget = { sme: 2.5, mid: 3.0, enterprise: 3.5, global: 4.0 }[tier] || 3.0;
    const gaps = domainScores.filter(d => d.score > 0).map(d => ({ ...d, gap: tierTarget - d.score })).filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap);

    // Recommended package
    let recPkg = "diagnostic";
    if (avgScore >= 2.5) recPkg = "transformation";
    else if (avgScore >= 2.0) recPkg = "accelerator";

    return { domainScores, avgScore: Math.round(avgScore * 10) / 10, lowest, highest, gaps, tierTarget, recPkg, answeredDomains: overall.length };
  }, [scores, tier]);

  const domainProgress = useMemo(() => {
    return DOMAINS.map(d => ({
      id: d.id,
      answered: d.questions.filter(q => scores[q.id]).length,
      total: d.questions.length,
    }));
  }, [scores]);

  // ═══════════════════════════════════════════════════════════
  // INTRO SCREEN
  // ═══════════════════════════════════════════════════════════
  const renderIntro = () => (
    <div style={{ display: "grid", gap: "24px", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Order-to-Cash Diagnostic</div>
        <h1 style={{ margin: 0, fontFamily: T.font, fontSize: "28px", fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.3 }}>How Healthy Is Your<br />Order-to-Cash Process?</h1>
        <p style={{ margin: "16px auto 0", maxWidth: "480px", fontFamily: T.font, fontSize: "14px", color: T.textMuted, lineHeight: 1.6 }}>
          A structured assessment across 8 process domains, benchmarked against APQC standards, generating a prioritized improvement roadmap for your organization.
        </p>
      </div>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", textAlign: "center" }}>
          {[
            { n: "8", label: "Process Domains" },
            { n: "24", label: "Assessment Questions" },
            { n: "5", label: "Maturity Levels" },
            { n: "~10", label: "Minutes to Complete" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: T.accent }}>{s.n}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle sub="The assessment evaluates your maturity across the full OtC cycle">What You'll Get</SectionTitle>
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            { icon: "📊", title: "Maturity Scorecard", desc: "Current state score across all 8 OtC domains with visual benchmarking" },
            { icon: "🎯", title: "Gap Analysis", desc: "Where you stand vs. where you should be for your company size and complexity" },
            { icon: "⚡", title: "Quick Wins", desc: "Top priority improvements ranked by impact-to-effort ratio" },
            { icon: "🗺️", title: "Engagement Recommendation", desc: "Tailored service package matched to your specific needs and maturity level" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", padding: "12px", background: T.bg, borderRadius: T.radiusSm, alignItems: "flex-start" }}>
              <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.text }}>{item.title}</div>
                <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginTop: "2px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <button onClick={() => setStep("profile")} style={{
        padding: "14px 28px", background: T.accent, color: "#fff", border: "none", borderRadius: T.radius,
        fontFamily: T.font, fontSize: "15px", fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em",
        transition: "all 0.15s ease", boxShadow: `0 0 20px ${T.accentSoft}`,
      }}>
        Start Assessment →
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // COMPANY PROFILE
  // ═══════════════════════════════════════════════════════════
  const renderProfile = () => (
    <div style={{ display: "grid", gap: "20px", maxWidth: "680px", margin: "0 auto" }}>
      <div>
        <button onClick={() => setStep("intro")} style={{ background: "none", border: "none", color: T.textDim, fontFamily: T.font, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back</button>
        <h2 style={{ margin: "12px 0 4px", fontFamily: T.font, fontSize: "22px", fontWeight: 700, color: T.text }}>Company Profile</h2>
        <p style={{ margin: 0, fontFamily: T.font, fontSize: "13px", color: T.textDim }}>This helps us benchmark your results against relevant peers</p>
      </div>

      <Card>
        <SectionTitle sub="Select the tier that best describes your organization">Organization Tier</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {TIERS.map(t => (
            <button key={t.id} onClick={() => setTier(t.id)} style={{
              padding: "14px", borderRadius: T.radiusSm, cursor: "pointer", textAlign: "left",
              border: `1px solid ${tier === t.id ? t.color : T.border}`,
              background: tier === t.id ? `${t.color}15` : "transparent",
              transition: "all 0.15s ease",
            }}>
              <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: tier === t.id ? t.color : T.text }}>{t.label}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle sub="Optional — enables more accurate benchmarking">Company Details</SectionTitle>
        <div style={{ display: "grid", gap: "12px" }}>
          {[
            { key: "name", label: "Company Name", placeholder: "Acme Corp" },
            { key: "revenue", label: "Annual Revenue (€M)", placeholder: "e.g. 50" },
            { key: "invoiceVolume", label: "Monthly Invoice Volume", placeholder: "e.g. 2000" },
            { key: "headcount", label: "Finance Team Headcount", placeholder: "e.g. 8" },
            { key: "erp", label: "Core ERP System", placeholder: "e.g. SAP, NetSuite, Dynamics" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginBottom: "4px" }}>{f.label}</label>
              <input
                value={company[f.key]} onChange={e => setCompany(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 12px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                  fontFamily: T.font, fontSize: "13px", color: T.text, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginBottom: "4px" }}>Industry</label>
            <select value={company.industry} onChange={e => setCompany(prev => ({ ...prev, industry: e.target.value }))} style={{
              width: "100%", padding: "10px 12px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
              fontFamily: T.font, fontSize: "13px", color: T.text, outline: "none",
            }}>
              {["Manufacturing", "CPG / FMCG", "Technology / SaaS", "Professional Services", "Wholesale / Distribution", "Healthcare", "Financial Services", "Retail", "Other"].map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <button onClick={() => { setStep("assess"); setCurrentDomain(0); }} style={{
        padding: "14px 28px", background: T.accent, color: "#fff", border: "none", borderRadius: T.radius,
        fontFamily: T.font, fontSize: "15px", fontWeight: 600, cursor: "pointer",
      }}>
        Begin Assessment →
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // ASSESSMENT
  // ═══════════════════════════════════════════════════════════
  const renderAssessment = () => {
    const domain = DOMAINS[currentDomain];

    return (
      <div style={{ display: "grid", gap: "20px", maxWidth: "780px", margin: "0 auto" }}>
        {/* Progress bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <button onClick={() => currentDomain > 0 ? setCurrentDomain(currentDomain - 1) : setStep("profile")} style={{ background: "none", border: "none", color: T.textDim, fontFamily: T.font, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back</button>
            <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>Domain {currentDomain + 1} of {DOMAINS.length}</span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {DOMAINS.map((d, i) => {
              const dp = domainProgress[i];
              const complete = dp.answered === dp.total;
              const active = i === currentDomain;
              return (
                <button key={d.id} onClick={() => setCurrentDomain(i)} style={{
                  flex: 1, height: "4px", borderRadius: "2px", border: "none", cursor: "pointer",
                  background: complete ? T.green : active ? T.accent : T.border,
                  transition: "all 0.15s ease",
                }} title={d.name} />
              );
            })}
          </div>
        </div>

        {/* Domain header */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "24px" }}>{domain.icon}</span>
                <h2 style={{ margin: 0, fontFamily: T.font, fontSize: "20px", fontWeight: 700, color: T.text }}>{domain.name}</h2>
              </div>
              <p style={{ margin: 0, fontFamily: T.font, fontSize: "13px", color: T.textDim }}>{domain.desc}</p>
            </div>
            <Badge color={T.textDim} bg={T.surfaceAlt}>APQC {domain.apqc}</Badge>
          </div>
        </Card>

        {/* Questions */}
        <div style={{ display: "grid", gap: "16px" }}>
          {domain.questions.map((q, qi) => {
            const selected = scores[q.id];
            return (
              <Card key={q.id} style={{ border: `1px solid ${selected ? T.accent + "40" : T.border}` }}>
                <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text, marginBottom: "14px" }}>
                  <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, marginRight: "8px" }}>{qi + 1}/{domain.questions.length}</span>
                  {q.text}
                </div>
                <div style={{ display: "grid", gap: "6px" }}>
                  {q.anchors.map((anchor, level) => {
                    const matLevel = level + 1;
                    const isSelected = selected === matLevel;
                    const ml = MATURITY_LEVELS[level];
                    return (
                      <button key={level} onClick={() => handleScore(q.id, matLevel)} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px",
                        background: isSelected ? `${ml.color}15` : T.bg,
                        border: `1px solid ${isSelected ? ml.color : "transparent"}`,
                        borderRadius: T.radiusSm, cursor: "pointer", textAlign: "left",
                        transition: "all 0.12s ease",
                      }}>
                        <div style={{
                          width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isSelected ? ml.color : T.surfaceAlt,
                          color: isSelected ? "#fff" : T.textDim,
                          fontFamily: T.mono, fontSize: "11px", fontWeight: 700,
                          transition: "all 0.12s ease",
                        }}>{matLevel}</div>
                        <div>
                          <div style={{ fontFamily: T.font, fontSize: "11px", fontWeight: 600, color: isSelected ? ml.color : T.textMuted, marginBottom: "2px" }}>{ml.label}</div>
                          <div style={{ fontFamily: T.font, fontSize: "12px", color: isSelected ? T.text : T.textDim, lineHeight: 1.5 }}>{anchor}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <button onClick={() => currentDomain > 0 ? setCurrentDomain(currentDomain - 1) : setStep("profile")} style={{
            flex: 1, padding: "12px", background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`,
            borderRadius: T.radius, fontFamily: T.font, fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}>← Previous</button>
          {currentDomain < DOMAINS.length - 1 ? (
            <button onClick={() => setCurrentDomain(currentDomain + 1)} style={{
              flex: 1, padding: "12px", background: T.accent, color: "#fff", border: "none",
              borderRadius: T.radius, fontFamily: T.font, fontSize: "14px", fontWeight: 600, cursor: "pointer",
            }}>Next Domain →</button>
          ) : (
            <button onClick={() => setStep("results")} style={{
              flex: 1, padding: "12px", background: T.green, color: "#fff", border: "none",
              borderRadius: T.radius, fontFamily: T.font, fontSize: "14px", fontWeight: 600, cursor: "pointer",
              opacity: results.answeredDomains >= 4 ? 1 : 0.5,
            }} disabled={results.answeredDomains < 4}>
              View Results →
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════
  const renderResults = () => {
    const { domainScores, avgScore, gaps, tierTarget, recPkg } = results;
    const overallLevel = MATURITY_LEVELS[Math.min(Math.max(Math.round(avgScore) - 1, 0), 4)];
    const recPackage = PACKAGES.find(p => p.id === recPkg);

    return (
      <div style={{ display: "grid", gap: "20px", maxWidth: "780px", margin: "0 auto" }}>
        <div>
          <button onClick={() => setStep("assess")} style={{ background: "none", border: "none", color: T.textDim, fontFamily: T.font, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back to Assessment</button>
          <h2 style={{ margin: "12px 0 4px", fontFamily: T.font, fontSize: "22px", fontWeight: 700, color: T.text }}>
            {company.name ? `${company.name} — ` : ""}OtC Diagnostic Results
          </h2>
          <p style={{ margin: 0, fontFamily: T.font, fontSize: "13px", color: T.textDim }}>
            {TIERS.find(t => t.id === tier)?.label} tier • {company.industry} • Benchmark target: {tierTarget.toFixed(1)}
          </p>
        </div>

        {/* Overall Score */}
        <Card style={{ textAlign: "center", padding: "32px" }}>
          <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Overall Maturity Score</div>
          <div style={{ fontFamily: T.mono, fontSize: "56px", fontWeight: 700, color: overallLevel.color, lineHeight: 1 }}>{avgScore.toFixed(1)}</div>
          <div style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 600, color: overallLevel.color, marginTop: "4px" }}>{overallLevel.label}</div>
          <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginTop: "8px" }}>{overallLevel.desc}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
            {MATURITY_LEVELS.map(ml => (
              <div key={ml.level} style={{
                width: "48px", height: "6px", borderRadius: "3px",
                background: ml.level <= Math.round(avgScore) ? ml.color : T.border,
              }} />
            ))}
          </div>
          <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginTop: "12px" }}>
            Target for {TIERS.find(t => t.id === tier)?.label}: <strong style={{ color: T.text }}>{tierTarget.toFixed(1)}</strong>
            {avgScore < tierTarget && <span style={{ color: T.amber }}> — gap of {(tierTarget - avgScore).toFixed(1)} levels</span>}
            {avgScore >= tierTarget && <span style={{ color: T.green }}> — meeting or exceeding target ✓</span>}
          </div>
        </Card>

        {/* Domain Heatmap */}
        <Card>
          <SectionTitle sub="Maturity score by OtC process area — darker = lower maturity">Domain Scorecard</SectionTitle>
          <div style={{ display: "grid", gap: "8px" }}>
            {domainScores.map(d => {
              const ml = MATURITY_LEVELS[Math.min(Math.max(Math.round(d.score) - 1, 0), 4)];
              const gap = tierTarget - d.score;
              const barWidth = d.score > 0 ? (d.score / 5) * 100 : 0;
              const targetPos = (tierTarget / 5) * 100;
              return (
                <div key={d.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 60px 80px", gap: "12px", alignItems: "center", padding: "10px 12px", background: T.bg, borderRadius: T.radiusSm }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{d.icon}</span>
                    <div>
                      <div style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.text }}>{d.name}</div>
                      <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim }}>APQC {d.apqc}</div>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: "20px", background: T.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${barWidth}%`, background: `${ml.color}40`, borderRadius: "4px", transition: "width 0.3s ease" }} />
                    <div style={{ position: "absolute", left: `${targetPos}%`, top: 0, height: "100%", width: "2px", background: T.textDim, opacity: 0.5 }} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 700, color: d.score > 0 ? ml.color : T.textDim }}>{d.score > 0 ? d.score.toFixed(1) : "—"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {d.score > 0 && gap > 0 && <Badge color={T.amber} bg={T.amberSoft}>Gap: {gap.toFixed(1)}</Badge>}
                    {d.score > 0 && gap <= 0 && <Badge color={T.green} bg={T.greenSoft}>On target</Badge>}
                    {d.score === 0 && <Badge color={T.textDim} bg={T.surfaceAlt}>Not scored</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", padding: "8px 12px", background: T.surfaceAlt, borderRadius: T.radiusSm }}>
            <div style={{ width: "2px", height: "12px", background: T.textDim, opacity: 0.5 }} />
            <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Dashed line = target maturity for your tier ({tierTarget.toFixed(1)})</span>
          </div>
        </Card>

        {/* Quick Wins / Priority Gaps */}
        {gaps.length > 0 && (
          <Card>
            <SectionTitle sub="Domains with the largest gap between current maturity and tier target — highest improvement potential">Priority Improvement Areas</SectionTitle>
            <div style={{ display: "grid", gap: "10px" }}>
              {gaps.slice(0, 5).map((g, i) => (
                <div key={g.id} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: "12px", alignItems: "center", padding: "12px", background: T.bg, borderRadius: T.radiusSm, borderLeft: `3px solid ${i === 0 ? T.red : i === 1 ? T.amber : T.cyan}` }}>
                  <div style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: i === 0 ? T.red : i === 1 ? T.amber : T.cyan, textAlign: "center" }}>#{i + 1}</div>
                  <div>
                    <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{g.icon} {g.name}</div>
                    <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginTop: "2px" }}>
                      Current: {g.score.toFixed(1)} → Target: {tierTarget.toFixed(1)} • Gap: {g.gap.toFixed(1)} levels
                    </div>
                    <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                      {(TOOLKIT_REFS[g.id] || []).map(ref => (
                        <Badge key={ref} color={T.accent} bg={T.accentSoft}>{ref}</Badge>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${i === 0 ? T.red : i === 1 ? T.amber : T.cyan}15`,
                    fontFamily: T.mono, fontSize: "14px", fontWeight: 700, color: i === 0 ? T.red : i === 1 ? T.amber : T.cyan,
                  }}>
                    {g.gap.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommended Engagement */}
        <Card style={{ borderColor: recPackage?.color + "40" }}>
          <SectionTitle sub="Based on your maturity profile and tier">Recommended Engagement</SectionTitle>
          <div style={{ display: "grid", gap: "12px" }}>
            {PACKAGES.map(pkg => {
              const isRec = pkg.id === recPkg;
              return (
                <div key={pkg.id} onClick={() => setExpandedPkg(expandedPkg === pkg.id ? null : pkg.id)} style={{
                  padding: "16px", borderRadius: T.radiusSm, cursor: "pointer",
                  border: `1px solid ${isRec ? pkg.color : T.border}`,
                  background: isRec ? `${pkg.color}10` : T.bg,
                  transition: "all 0.15s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isRec && <Badge color="#fff" bg={pkg.color}>RECOMMENDED</Badge>}
                      <span style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 700, color: isRec ? pkg.color : T.text }}>{pkg.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.mono, fontSize: "13px", color: pkg.color, fontWeight: 600 }}>{pkg.priceRange}</div>
                      <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>{pkg.duration}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted, marginTop: "6px" }}>{pkg.desc}</div>

                  {expandedPkg === pkg.id && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${T.border}` }}>
                      <div style={{ fontFamily: T.font, fontSize: "12px", fontWeight: 600, color: T.text, marginBottom: "8px" }}>Includes:</div>
                      <div style={{ display: "grid", gap: "4px" }}>
                        {pkg.includes.map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: pkg.color, fontSize: "10px", marginTop: "4px" }}>●</span>
                            <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: "10px", padding: "8px 12px", background: T.surfaceAlt, borderRadius: T.radiusSm }}>
                        <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Ideal for: {pkg.idealFor}</span>
                      </div>
                      {pkg.note && (
                        <div style={{ marginTop: "6px", padding: "8px 12px", background: `${pkg.color}08`, borderRadius: T.radiusSm, borderLeft: `2px solid ${pkg.color}` }}>
                          <span style={{ fontFamily: T.font, fontSize: "11px", color: pkg.color }}>💡 {pkg.note}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Footer */}
        <Card style={{ textAlign: "center", padding: "28px" }}>
          <div style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "8px" }}>Ready to close the gap?</div>
          <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, marginBottom: "16px", maxWidth: "460px", margin: "0 auto 16px" }}>
            This diagnostic maps directly to a library of 20+ OtC process frameworks, templates, and analytical tools. Every recommendation is backed by a specific, deployable deliverable.
          </div>
          <button onClick={() => onNavigate && onNavigate('diagnostic')} style={{
            padding: "12px 24px", background: T.accent, color: "#fff", border: "none", borderRadius: T.radius,
            fontFamily: T.font, fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}>
            Discuss Results →
          </button>
        </Card>

        {/* Meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
          <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>OtC Consulting Toolkit · P4.3 · Diagnostic Assessment</div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
            <Badge color={T.textDim} bg={T.surfaceAlt}>v4.3.0</Badge>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", padding: "24px 16px", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      {step === "intro" && renderIntro()}
      {step === "profile" && renderProfile()}
      {step === "assess" && renderAssessment()}
      {step === "results" && renderResults()}
    </div>
  );
}
