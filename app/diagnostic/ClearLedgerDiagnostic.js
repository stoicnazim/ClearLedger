import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Design Tokens (ClearLedger DNA) ─────────────────────────────
const C = {
  bg: "#08090E",
  bgCard: "#0D1117",
  bgCard2: "#131A2B",
  surface: "#161D2F",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#E8E6F0",
  textDim: "rgba(232,230,240,0.55)",
  textMid: "rgba(232,230,240,0.75)",
  accent: "#6B5CE7",
  accentBright: "#8677F0",
  accentDark: "#5A4BD6",
  accentGlow: "rgba(107,92,231,0.12)",
  accentGlow2: "rgba(107,92,231,0.25)",
  cyan: "#4FC3F7",
  cyanDim: "rgba(79,195,247,0.1)",
  green: "#3DDC84",
  greenDim: "rgba(61,220,132,0.1)",
  amber: "#FFAB40",
  amberDim: "rgba(255,171,64,0.1)",
  red: "#FF6B6B",
  redDim: "rgba(255,107,107,0.08)",
  serif: "'Fraunces', serif",
  sans: "'General Sans', 'DM Sans', -apple-system, sans-serif",
  mono: "'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
};

// ─── APQC-Aligned Assessment Data ────────────────────────────────
const DOMAINS = [
  {
    id: "order-mgmt",
    name: "Order Management",
    icon: "📋",
    apqc: "8.1",
    questions: [
      {
        q: "How are customer orders received and entered into your system?",
        apqc: "8.1.1",
        options: [
          { text: "Manual entry from emails, faxes, or phone calls into spreadsheets", score: 1 },
          { text: "Manual entry into ERP with basic validation checks", score: 2 },
          { text: "Mix of EDI/portal and manual entry with standardized templates", score: 3 },
          { text: "Automated capture via EDI, portals, or e-commerce with exception-only handling", score: 4 },
          { text: "Fully automated multi-channel intake with AI-driven validation and auto-routing", score: 5 },
        ],
      },
      {
        q: "How do you handle order exceptions and discrepancies?",
        apqc: "8.1.2",
        options: [
          { text: "Ad-hoc — whoever notices it fixes it, no tracking", score: 1 },
          { text: "Logged manually, resolved case-by-case with no SLAs", score: 2 },
          { text: "Tracked in a shared system with basic escalation rules", score: 3 },
          { text: "Automated exception routing with SLA monitoring and root cause tagging", score: 4 },
          { text: "Predictive exception prevention with ML-based pattern detection", score: 5 },
        ],
      },
      {
        q: "What visibility do stakeholders have into order status?",
        apqc: "8.1.3",
        options: [
          { text: "None — customers and sales must call/email AR to check", score: 1 },
          { text: "Internal team can check in the ERP but customers cannot self-serve", score: 2 },
          { text: "Basic status portal or email notifications at key milestones", score: 3 },
          { text: "Real-time portal with self-service tracking, automated notifications", score: 4 },
          { text: "Full transparency with predictive delivery updates and proactive alerts", score: 5 },
        ],
      },
    ],
  },
  {
    id: "credit-mgmt",
    name: "Credit Management",
    icon: "🛡️",
    apqc: "8.2",
    questions: [
      {
        q: "How do you evaluate credit risk for new and existing customers?",
        apqc: "8.2.1",
        options: [
          { text: "No formal credit assessment — terms granted by sales relationship", score: 1 },
          { text: "Basic checks (bank references, trade references) done manually", score: 2 },
          { text: "Structured credit application with scoring matrix and approval workflow", score: 3 },
          { text: "Automated scoring integrated with credit bureaus, financial data, and payment history", score: 4 },
          { text: "Dynamic risk scoring with real-time monitoring, predictive default models, and auto-limit adjustment", score: 5 },
        ],
      },
      {
        q: "How are credit limits monitored and enforced?",
        apqc: "8.2.2",
        options: [
          { text: "Not systematically monitored — limits are set and forgotten", score: 1 },
          { text: "Periodic manual review (quarterly or annual)", score: 2 },
          { text: "ERP enforces holds on orders exceeding limits, manual release process", score: 3 },
          { text: "Automated monitoring with tiered alerts and pre-approved override rules", score: 4 },
          { text: "Continuous monitoring with AI-triggered limit adjustments and integrated insurance", score: 5 },
        ],
      },
      {
        q: "How is your credit policy documented and governed?",
        apqc: "8.2.3",
        options: [
          { text: "No written policy — decisions are tribal knowledge", score: 1 },
          { text: "Basic policy exists but not consistently followed", score: 2 },
          { text: "Documented policy with clear authority levels, reviewed annually", score: 3 },
          { text: "Comprehensive policy with risk appetite framework, quarterly reviews, and audit trail", score: 4 },
          { text: "Living policy with dynamic risk segmentation, automated compliance, and board-level reporting", score: 5 },
        ],
      },
    ],
  },
  {
    id: "billing",
    name: "Billing & Invoicing",
    icon: "🧾",
    apqc: "8.3",
    questions: [
      {
        q: "How are invoices generated and delivered to customers?",
        apqc: "8.3.1",
        options: [
          { text: "Manually created in spreadsheets or Word, sent via email/post", score: 1 },
          { text: "Generated from ERP but require manual review before sending", score: 2 },
          { text: "Auto-generated from ERP with standardized templates, mix of email and portal delivery", score: 3 },
          { text: "Automated generation and e-delivery with customer-preferred channel routing", score: 4 },
          { text: "Touchless invoicing with e-invoicing compliance (Peppol/UBL), auto-reconciliation confirmation", score: 5 },
        ],
      },
      {
        q: "What is your invoice error and dispute rate?",
        apqc: "8.3.2",
        options: [
          { text: "High (>5%) — frequent pricing, quantity, or PO mismatches", score: 1 },
          { text: "Moderate (3–5%) — known issues but no systematic prevention", score: 2 },
          { text: "Controlled (1–3%) — validation rules catch most errors pre-send", score: 3 },
          { text: "Low (<1%) — automated PO matching and price verification", score: 4 },
          { text: "Near-zero (<0.5%) — AI-driven anomaly detection, continuous process mining", score: 5 },
        ],
      },
      {
        q: "How do you handle billing complexity (multi-currency, intercompany, milestone billing)?",
        apqc: "8.3.3",
        options: [
          { text: "Entirely manual with high error risk", score: 1 },
          { text: "Some ERP support but heavy manual adjustments required", score: 2 },
          { text: "ERP handles standard cases; complex scenarios require workarounds", score: 3 },
          { text: "Fully configured for multi-currency, intercompany, and project billing", score: 4 },
          { text: "Automated complex billing with revenue recognition compliance (IFRS 15/ASC 606)", score: 5 },
        ],
      },
    ],
  },
  {
    id: "collections",
    name: "Collections",
    icon: "💰",
    apqc: "8.4",
    questions: [
      {
        q: "How is your collections strategy structured?",
        apqc: "8.4.1",
        options: [
          { text: "Reactive — call customers when invoices are significantly overdue", score: 1 },
          { text: "Basic aging report reviewed weekly, calls made by whoever is available", score: 2 },
          { text: "Segmented strategy (A/B/C customers) with defined contact cadence", score: 3 },
          { text: "Risk-based prioritization with automated dunning sequences and escalation rules", score: 4 },
          { text: "AI-optimized contact strategies with predictive payment modeling and dynamic prioritization", score: 5 },
        ],
      },
      {
        q: "How do you track and measure collections performance?",
        apqc: "8.4.2",
        options: [
          { text: "No formal tracking — success measured by cash received", score: 1 },
          { text: "Monthly DSO reported, no drill-down capability", score: 2 },
          { text: "DSO, aging buckets, and collector productivity tracked with basic dashboards", score: 3 },
          { text: "Full KPI suite (DSO, CEI, ADD, BPDSO) with trend analysis and benchmarking", score: 4 },
          { text: "Real-time performance dashboards with predictive analytics and automated root cause analysis", score: 5 },
        ],
      },
      {
        q: "What is your escalation and dispute resolution process for overdue accounts?",
        apqc: "8.4.3",
        options: [
          { text: "No formal process — escalation depends on individual judgment", score: 1 },
          { text: "Basic escalation thresholds exist but are inconsistently applied", score: 2 },
          { text: "Defined escalation matrix with documented authority levels", score: 3 },
          { text: "Automated escalation triggers with cross-functional dispute resolution workflow", score: 4 },
          { text: "Integrated dispute management with root cause analytics and prevention feedback loops", score: 5 },
        ],
      },
    ],
  },
  {
    id: "cash-app",
    name: "Cash Application",
    icon: "🔄",
    apqc: "8.5",
    questions: [
      {
        q: "How is incoming payment matched to open invoices?",
        apqc: "8.5.1",
        options: [
          { text: "Fully manual — team reads remittance advice and keys matches", score: 1 },
          { text: "Semi-manual with ERP auto-match on exact amounts, rest done manually", score: 2 },
          { text: "Rule-based auto-matching (amount, reference, date) with manual exception queue", score: 3 },
          { text: "AI-assisted matching using remittance parsing, pattern recognition, 85%+ auto-match rate", score: 4 },
          { text: "Fully autonomous cash application with ML, 95%+ match rate, self-learning exception handling", score: 5 },
        ],
      },
      {
        q: "How do you handle payments without remittance details or partial payments?",
        apqc: "8.5.2",
        options: [
          { text: "Posted to suspense; sit there for weeks until someone investigates", score: 1 },
          { text: "Manual research using bank statements and customer calls", score: 2 },
          { text: "Defined process for research with SLAs, tracked in a log", score: 3 },
          { text: "Automated remittance harvesting from portals/emails with intelligent partial match logic", score: 4 },
          { text: "Predictive allocation with customer payment behavior modeling and auto-resolution", score: 5 },
        ],
      },
      {
        q: "What is your bank reconciliation process?",
        apqc: "8.5.3",
        options: [
          { text: "Manual monthly reconciliation with frequent unreconciled items", score: 1 },
          { text: "Monthly reconciliation using ERP with some automated matching", score: 2 },
          { text: "Weekly reconciliation with automated bank statement import and matching rules", score: 3 },
          { text: "Daily automated reconciliation with exception-only review", score: 4 },
          { text: "Continuous real-time reconciliation with automated adjustments and anomaly detection", score: 5 },
        ],
      },
    ],
  },
  {
    id: "deductions",
    name: "Deductions & Disputes",
    icon: "⚖️",
    apqc: "8.6",
    questions: [
      {
        q: "How do you identify, categorize, and track deductions?",
        apqc: "8.6.1",
        options: [
          { text: "Discovered during cash application, no formal tracking", score: 1 },
          { text: "Logged in spreadsheets, categories are inconsistent", score: 2 },
          { text: "Tracked in a system with standardized reason codes and assigned owners", score: 3 },
          { text: "Automated identification with AI-categorization, auto-routing by type, and SLA tracking", score: 4 },
          { text: "Predictive deduction management with prevention analytics and automated valid/invalid determination", score: 5 },
        ],
      },
      {
        q: "What is your deduction resolution cycle time?",
        apqc: "8.6.2",
        options: [
          { text: "Unknown or >60 days average", score: 1 },
          { text: "30–60 days, no formal SLAs", score: 2 },
          { text: "15–30 days with defined SLAs by deduction type", score: 3 },
          { text: "<15 days with automated workflow, cross-functional collaboration tools", score: 4 },
          { text: "<7 days with auto-adjudication for valid claims, real-time resolution tracking", score: 5 },
        ],
      },
      {
        q: "Do you analyze deduction root causes to prevent recurrence?",
        apqc: "8.6.3",
        options: [
          { text: "No — deductions are treated as one-off events", score: 1 },
          { text: "Ad-hoc analysis when large deductions occur", score: 2 },
          { text: "Quarterly review of top deduction categories with basic trending", score: 3 },
          { text: "Systematic root cause analysis with cross-functional corrective action process", score: 4 },
          { text: "Continuous process mining with automated root cause detection and upstream prevention triggers", score: 5 },
        ],
      },
    ],
  },
  {
    id: "reporting",
    name: "Reporting & Analytics",
    icon: "📊",
    apqc: "8.7",
    questions: [
      {
        q: "What AR reporting capabilities does your team have?",
        apqc: "8.7.1",
        options: [
          { text: "Basic aging report from ERP, exported to Excel for any analysis", score: 1 },
          { text: "Standard ERP reports plus manual Excel dashboards", score: 2 },
          { text: "BI tool (Power BI, Tableau) with scheduled AR dashboards", score: 3 },
          { text: "Real-time dashboards with drill-down, trend analysis, and benchmarking", score: 4 },
          { text: "Embedded analytics with predictive insights, anomaly alerts, and prescriptive recommendations", score: 5 },
        ],
      },
      {
        q: "How do you forecast cash collections?",
        apqc: "8.7.2",
        options: [
          { text: "No forecasting — cash comes when it comes", score: 1 },
          { text: "Simple aging-based estimates (e.g., 'expect 80% of current to pay this month')", score: 2 },
          { text: "Structured forecast using payment terms and historical patterns", score: 3 },
          { text: "Statistical models incorporating customer payment behavior, seasonality, and economic indicators", score: 4 },
          { text: "ML-driven forecasting with >95% accuracy, scenario modeling, and treasury integration", score: 5 },
        ],
      },
      {
        q: "How does your AR data integrate with broader financial planning?",
        apqc: "8.7.3",
        options: [
          { text: "Siloed — AR data is disconnected from FP&A and treasury", score: 1 },
          { text: "Monthly manual data feeds to FP&A team", score: 2 },
          { text: "Regular data sharing with some automated feeds to planning systems", score: 3 },
          { text: "Integrated data layer connecting AR to cash forecasting, working capital, and P&L analysis", score: 4 },
          { text: "Unified financial data platform with real-time AR impact on liquidity, covenant, and scenario planning", score: 5 },
        ],
      },
    ],
  },
  {
    id: "technology",
    name: "Technology & Automation",
    icon: "⚙️",
    apqc: "8.8",
    questions: [
      {
        q: "What is your current OtC technology stack?",
        apqc: "8.8.1",
        options: [
          { text: "Spreadsheets and email — no dedicated AR system", score: 1 },
          { text: "ERP AR module only (SAP, Oracle, D365) with minimal configuration", score: 2 },
          { text: "ERP plus one or two point solutions (e-invoicing, collections tool)", score: 3 },
          { text: "Integrated OtC platform covering most process areas with workflow automation", score: 4 },
          { text: "AI-native autonomous platform with full process coverage, RPA, and continuous optimization", score: 5 },
        ],
      },
      {
        q: "What percentage of your OtC process is automated vs manual?",
        apqc: "8.8.2",
        options: [
          { text: "<20% automated — most tasks are manual", score: 1 },
          { text: "20–40% — core transactions automated, exceptions are manual", score: 2 },
          { text: "40–60% — major processes automated, some manual bridges remain", score: 3 },
          { text: "60–80% — exception-based processing, most tasks touchless", score: 4 },
          { text: ">80% — autonomous operations with human oversight only", score: 5 },
        ],
      },
      {
        q: "How do you approach OtC technology decisions and roadmap?",
        apqc: "8.8.3",
        options: [
          { text: "No technology roadmap — tools adopted reactively", score: 1 },
          { text: "IT-driven decisions with limited business input", score: 2 },
          { text: "Joint business-IT evaluation with business case requirements", score: 3 },
          { text: "Structured technology roadmap aligned to process maturity targets with ROI tracking", score: 4 },
          { text: "Continuous innovation framework with emerging tech evaluation, proof-of-concept pipeline, and measured adoption", score: 5 },
        ],
      },
    ],
  },
];

// ─── Tier Benchmarks ─────────────────────────────────────────────
const TIERS = {
  sme: { label: "SME", sub: "10–100 employees", target: 3.0, color: C.cyan },
  mid: { label: "Mid-Market", sub: "100–1,000 employees", target: 3.5, color: C.accent },
  enterprise: { label: "Enterprise", sub: "1,000–10,000 employees", target: 4.0, color: C.green },
  global: { label: "Global MNC", sub: "10,000+ employees", target: 4.5, color: C.amber },
};

// ─── Quick Win Mapping ───────────────────────────────────────────
const QUICK_WINS = [
  { domain: "cash-app", threshold: 3, title: "Automate Cash Application", desc: "Implement rule-based auto-matching to achieve 85%+ auto-match rate. Typical payback: 3–6 months.", toolkit: "Module 1.2, 1.3" },
  { domain: "collections", threshold: 3, title: "Segment Collections Strategy", desc: "Move from flat aging follow-ups to risk-segmented dunning sequences. DSO reduction: 8–15 days.", toolkit: "Module 1.5, 2.2" },
  { domain: "billing", threshold: 3, title: "Reduce Invoice Errors", desc: "Add PO-matching validation and price verification rules. Target: <1% error rate.", toolkit: "Module 2.1" },
  { domain: "deductions", threshold: 3, title: "Implement Deduction Root Cause Analysis", desc: "Standardize reason codes and quarterly trending. Prevention saves 2–5x resolution cost.", toolkit: "Module 3.2" },
  { domain: "credit-mgmt", threshold: 3, title: "Formalize Credit Policy", desc: "Document risk appetite, authority levels, and review cadence. Reduces bad debt 15–30%.", toolkit: "Module 2.3" },
  { domain: "reporting", threshold: 3, title: "Build AR Analytics Dashboard", desc: "Move from Excel aging reports to real-time BI dashboards with drill-down.", toolkit: "Module 1.1, 4.4" },
  { domain: "order-mgmt", threshold: 3, title: "Digitize Order Intake", desc: "Shift from manual email/fax orders to portal or EDI. Reduces processing cost 40–60%.", toolkit: "Module 2.4" },
  { domain: "technology", threshold: 3, title: "Build Technology Roadmap", desc: "Align tech investments to maturity gaps. Prevents vendor lock-in and reduces TCO.", toolkit: "Module 3.4" },
];

// ─── Logo Mark ───────────────────────────────────────────────────
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor={C.accent} />
        <stop offset="100%" stopColor={C.cyan} />
      </linearGradient>
    </defs>
    <path d="M20 4L36 34H4L20 4Z" stroke="url(#dLogoGrad)" strokeWidth="2.5" fill="none" />
    <text x="20" y="30" textAnchor="middle" fill="url(#dLogoGrad)" fontFamily={C.serif} fontSize="16" fontStyle="italic" fontWeight="600">a</text>
  </svg>
);

// ─── Maturity Bar ────────────────────────────────────────────────
const MaturityBar = ({ score, target, label, color, animate = true }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) setTimeout(() => setWidth((score / 5) * 100), 100);
    else setWidth((score / 5) * 100);
  }, [score, animate]);

  const targetPos = (target / 5) * 100;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text }}>{label}</span>
        <span style={{ fontFamily: C.mono, fontSize: "13px", color: score >= target ? C.green : score >= target - 0.5 ? C.amber : C.red, fontWeight: 600 }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div style={{ position: "relative", height: "8px", background: "rgba(255,255,255,0.04)", borderRadius: "4px", overflow: "visible" }}>
        <div style={{
          height: "100%", borderRadius: "4px",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          width: `${width}%`,
          transition: animate ? "width 1.2s cubic-bezier(0.16,1,0.3,1)" : "none",
        }} />
        <div style={{
          position: "absolute", top: "-3px", left: `${targetPos}%`, width: "2px", height: "14px",
          background: C.textDim, borderRadius: "1px",
        }} />
        <span style={{
          position: "absolute", top: "-18px", left: `${targetPos}%`, transform: "translateX(-50%)",
          fontFamily: C.mono, fontSize: "9px", color: C.textDim,
        }}>target</span>
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────
export default function ClearLedgerDiagnostic() {
  const [screen, setScreen] = useState("intro"); // intro | profile | assessment | results
  const [tier, setTier] = useState(null);
  const [company, setCompany] = useState({ name: "", revenue: "", industry: "", erp: "" });
  const [answers, setAnswers] = useState({});
  const [currentDomain, setCurrentDomain] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showDetail, setShowDetail] = useState(null);
  const topRef = useRef(null);

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  // ─── Scoring ─────────────────────────────────────────────────
  const domainScores = useMemo(() => {
    return DOMAINS.map(d => {
      const scores = d.questions.map((_, qi) => answers[`${d.id}-${qi}`] || 0);
      const answered = scores.filter(s => s > 0);
      const avg = answered.length > 0 ? answered.reduce((a, b) => a + b, 0) / answered.length : 0;
      return { id: d.id, name: d.name, icon: d.icon, score: avg, apqc: d.apqc };
    });
  }, [answers]);

  const overallScore = useMemo(() => {
    const scored = domainScores.filter(d => d.score > 0);
    return scored.length > 0 ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0;
  }, [domainScores]);

  const target = tier ? TIERS[tier].target : 3.5;

  const totalQuestions = DOMAINS.reduce((a, d) => a + d.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const quickWins = useMemo(() => {
    return QUICK_WINS.filter(qw => {
      const ds = domainScores.find(d => d.id === qw.domain);
      return ds && ds.score > 0 && ds.score < qw.threshold;
    }).slice(0, 3);
  }, [domainScores]);

  const maturityLevel = overallScore >= 4.5 ? "World-Class" : overallScore >= 3.5 ? "Advanced" : overallScore >= 2.5 ? "Developing" : overallScore >= 1.5 ? "Basic" : "Ad-Hoc";
  const maturityColor = overallScore >= 4.5 ? C.cyan : overallScore >= 3.5 ? C.green : overallScore >= 2.5 ? C.amber : C.red;

  // ─── Recommended engagement ──────────────────────────────────
  const recommendedPackage = overallScore < 2.5 ? "transformation" : overallScore < 3.5 ? "accelerator" : "healthcheck";

  const packages = [
    { key: "healthcheck", name: "Health Check", price: "€5K – 12K", timeline: "2–3 weeks", match: "Best for teams scoring 3.5+ who need fine-tuning", features: ["Full maturity deep-dive", "APQC benchmark report", "Prioritized action plan", "Executive presentation"] },
    { key: "accelerator", name: "Accelerator", price: "€15K – 35K", timeline: "8–12 weeks", match: "Best for teams scoring 2.0–3.5 with clear improvement areas", features: ["Everything in Health Check", "Process redesign (3–5 areas)", "Technology evaluation", "Implementation playbook", "Change management"] },
    { key: "transformation", name: "Transformation", price: "€40K – 80K", timeline: "4–6 months", match: "Best for teams scoring below 2.5 needing full overhaul", features: ["Everything in Accelerator", "End-to-end implementation", "Team training", "KPI dashboards", "60-day post-go-live support"] },
  ];

  // ─── Handlers ────────────────────────────────────────────────
  const selectAnswer = (domainId, qIdx, score) => {
    setAnswers(prev => ({ ...prev, [`${domainId}-${qIdx}`]: score }));
    // Auto-advance
    const domain = DOMAINS[currentDomain];
    if (currentQuestion < domain.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else if (currentDomain < DOMAINS.length - 1) {
      setTimeout(() => { setCurrentDomain(currentDomain + 1); setCurrentQuestion(0); scrollToTop(); }, 400);
    }
  };

  const goToResults = () => { setScreen("results"); scrollToTop(); };

  // ─── Shared styles ──────────────────────────────────────────
  const containerStyle = { maxWidth: "820px", margin: "0 auto", padding: "0 24px" };
  const cardStyle = { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "28px" };

  return (
    <div ref={topRef} style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: C.sans }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.accent}; color: white; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .results-metrics { grid-template-columns: 1fr 1fr !important; }
          .packages-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Header ──────────────────────────────────────────── */}
      <header style={{
        padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(8,9,14,0.92)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LogoMark size={24} />
          <span style={{ fontFamily: C.serif, fontSize: "16px", color: C.text }}>ClearLedger</span>
          <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, marginLeft: "8px", padding: "2px 8px", background: C.accentGlow, borderRadius: "4px" }}>DIAGNOSTIC</span>
        </div>
        {screen === "assessment" && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "120px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: C.accent, borderRadius: "2px", transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim }}>{answeredCount}/{totalQuestions}</span>
          </div>
        )}
      </header>

      {/* ═══════════════ SCREEN: INTRO ═══════════════════════════ */}
      {screen === "intro" && (
        <div style={{ ...containerStyle, paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
          <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" }}>
            OtC Maturity Assessment
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.2, marginBottom: "20px" }}>
            How mature is your{" "}
            <span style={{ fontStyle: "italic", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Order-to-Cash
            </span>{" "}
            process?
          </h1>
          <p style={{ fontFamily: C.sans, fontSize: "17px", color: C.textDim, lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}>
            Answer 24 questions across 8 OtC domains. Get a scored maturity assessment
            benchmarked against APQC standards, with prioritized improvement areas and
            quick wins identified.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "48px", marginBottom: "48px", flexWrap: "wrap" }}>
            {[
              { icon: "⏱️", text: "10 minutes" },
              { icon: "📊", text: "8 domains scored" },
              { icon: "🎯", text: "Quick wins identified" },
              { icon: "🔒", text: "Data stays in your browser" },
            ].map((f, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{f.icon}</div>
                <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textMid }}>{f.text}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { setScreen("profile"); scrollToTop(); }} style={{
            padding: "16px 40px", borderRadius: C.radiusSm, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
            color: "white", fontFamily: C.sans, fontSize: "16px", fontWeight: 500,
            boxShadow: `0 4px 32px ${C.accentGlow2}`,
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Start Assessment →
          </button>

          <div style={{ marginTop: "64px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", textAlign: "left" }} className="results-metrics">
            {DOMAINS.slice(0, 4).map((d, i) => (
              <div key={i} style={{ ...cardStyle, padding: "20px" }}>
                <span style={{ fontSize: "20px" }}>{d.icon}</span>
                <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.text, marginTop: "8px" }}>{d.name}</div>
                <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, marginTop: "4px" }}>APQC {d.apqc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ SCREEN: PROFILE ═════════════════════════ */}
      {screen === "profile" && (
        <div style={{ ...containerStyle, paddingTop: "60px", paddingBottom: "80px" }}>
          <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>
            Step 1 of 3
          </div>
          <h2 style={{ fontFamily: C.serif, fontSize: "32px", fontWeight: 300, marginBottom: "8px" }}>Company Profile</h2>
          <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textDim, lineHeight: 1.6, marginBottom: "36px" }}>
            Select your company tier to set the right benchmark targets. The optional fields help contextualize results.
          </p>

          {/* Tier Selection */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, marginBottom: "14px", fontWeight: 500 }}>Company Tier *</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="results-metrics">
              {Object.entries(TIERS).map(([key, t]) => (
                <button key={key} onClick={() => setTier(key)} style={{
                  ...cardStyle,
                  cursor: "pointer",
                  border: `1px solid ${tier === key ? t.color : C.border}`,
                  background: tier === key ? `${t.color}10` : C.bgCard,
                  transition: "all 0.2s",
                  textAlign: "left",
                }}>
                  <div style={{ fontFamily: C.sans, fontSize: "14px", color: tier === key ? t.color : C.text, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim, marginTop: "4px" }}>{t.sub}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, marginTop: "8px" }}>Target: {t.target.toFixed(1)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <div style={{ ...cardStyle, marginBottom: "36px" }}>
            <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, marginBottom: "18px", fontWeight: 500 }}>Optional Context</div>
            <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { key: "name", label: "Company Name", placeholder: "Acme Corp" },
                { key: "revenue", label: "Annual Revenue", placeholder: "e.g. €50M" },
                { key: "industry", label: "Industry", placeholder: "e.g. Manufacturing, FMCG" },
                { key: "erp", label: "Primary ERP", placeholder: "e.g. SAP, Oracle, D365" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input
                    type="text"
                    value={company[f.key]}
                    onChange={e => setCompany(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: C.radiusSm,
                      background: C.surface, border: `1px solid ${C.border}`,
                      color: C.text, fontFamily: C.sans, fontSize: "14px", outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { if (tier) { setScreen("assessment"); scrollToTop(); } }}
              disabled={!tier}
              style={{
                padding: "14px 32px", borderRadius: C.radiusSm, border: "none", cursor: tier ? "pointer" : "not-allowed",
                background: tier ? `linear-gradient(135deg, ${C.accent}, ${C.accentDark})` : C.surface,
                color: tier ? "white" : C.textDim, fontFamily: C.sans, fontSize: "14px", fontWeight: 500,
                opacity: tier ? 1 : 0.5, transition: "all 0.2s",
              }}
            >
              Begin Assessment →
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ SCREEN: ASSESSMENT ══════════════════════ */}
      {screen === "assessment" && (
        <div style={{ ...containerStyle, paddingTop: "40px", paddingBottom: "80px" }}>
          {/* Domain tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }}>
            {DOMAINS.map((d, i) => {
              const domainAnswered = d.questions.filter((_, qi) => answers[`${d.id}-${qi}`]).length;
              const complete = domainAnswered === d.questions.length;
              return (
                <button key={d.id} onClick={() => { setCurrentDomain(i); setCurrentQuestion(0); }}
                  style={{
                    padding: "8px 14px", borderRadius: C.radiusSm, border: "none", cursor: "pointer",
                    background: i === currentDomain ? C.accent : complete ? C.greenDim : C.bgCard,
                    color: i === currentDomain ? "white" : complete ? C.green : C.textDim,
                    fontFamily: C.sans, fontSize: "12px", fontWeight: 500,
                    whiteSpace: "nowrap", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{d.icon}</span>
                  {d.name}
                  {complete && <span style={{ fontSize: "10px" }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Current domain header */}
          {(() => {
            const domain = DOMAINS[currentDomain];
            const question = domain.questions[currentQuestion];
            const answerKey = `${domain.id}-${currentQuestion}`;
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "28px" }}>{domain.icon}</span>
                  <div>
                    <h3 style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 400, color: C.text }}>{domain.name}</h3>
                    <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim }}>APQC {question.apqc} · Question {currentQuestion + 1} of {domain.questions.length}</span>
                  </div>
                </div>

                {/* Question */}
                <div style={{ ...cardStyle, marginTop: "20px", marginBottom: "24px" }}>
                  <p style={{ fontFamily: C.sans, fontSize: "16px", color: C.text, lineHeight: 1.6, marginBottom: "24px" }}>
                    {question.q}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {question.options.map((opt, oi) => {
                      const selected = answers[answerKey] === opt.score;
                      return (
                        <button key={oi} onClick={() => selectAnswer(domain.id, currentQuestion, opt.score)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: "14px",
                            padding: "14px 18px", borderRadius: C.radiusSm, cursor: "pointer",
                            background: selected ? C.accentGlow : "rgba(255,255,255,0.02)",
                            border: `1px solid ${selected ? C.accent : C.border}`,
                            textAlign: "left", transition: "all 0.2s",
                            width: "100%",
                          }}
                          onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = C.borderHover; }}
                          onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border; }}
                        >
                          <div style={{
                            flex: "0 0 28px", height: "28px", borderRadius: "50%",
                            background: selected ? C.accent : "transparent",
                            border: `2px solid ${selected ? C.accent : C.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: C.mono, fontSize: "12px", fontWeight: 600,
                            color: selected ? "white" : C.textDim,
                            transition: "all 0.2s",
                          }}>
                            {opt.score}
                          </div>
                          <span style={{ fontFamily: C.sans, fontSize: "14px", color: selected ? C.text : C.textMid, lineHeight: 1.5, paddingTop: "3px" }}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => {
                    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
                    else if (currentDomain > 0) { setCurrentDomain(currentDomain - 1); setCurrentQuestion(DOMAINS[currentDomain - 1].questions.length - 1); }
                  }}
                    disabled={currentDomain === 0 && currentQuestion === 0}
                    style={{
                      padding: "10px 20px", borderRadius: C.radiusSm,
                      background: "transparent", border: `1px solid ${C.border}`,
                      color: C.textMid, fontFamily: C.sans, fontSize: "13px",
                      cursor: (currentDomain === 0 && currentQuestion === 0) ? "not-allowed" : "pointer",
                      opacity: (currentDomain === 0 && currentQuestion === 0) ? 0.4 : 1,
                    }}
                  >← Previous</button>

                  {answeredCount === totalQuestions ? (
                    <button onClick={goToResults} style={{
                      padding: "12px 28px", borderRadius: C.radiusSm, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, ${C.green}, #2BC06A)`,
                      color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 600,
                      boxShadow: `0 4px 24px rgba(61,220,132,0.3)`,
                    }}>View Results →</button>
                  ) : (
                    <button onClick={() => {
                      if (currentQuestion < domain.questions.length - 1) setCurrentQuestion(currentQuestion + 1);
                      else if (currentDomain < DOMAINS.length - 1) { setCurrentDomain(currentDomain + 1); setCurrentQuestion(0); scrollToTop(); }
                    }}
                      style={{
                        padding: "10px 20px", borderRadius: C.radiusSm, border: "none", cursor: "pointer",
                        background: C.accent, color: "white", fontFamily: C.sans, fontSize: "13px",
                      }}
                    >Next →</button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════ SCREEN: RESULTS ═════════════════════════ */}
      {screen === "results" && (
        <div style={{ ...containerStyle, paddingTop: "48px", paddingBottom: "80px" }}>
          {/* Overall Score */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>
              Your OtC Maturity Score
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "140px", height: "140px", borderRadius: "50%",
              border: `3px solid ${maturityColor}`,
              boxShadow: `0 0 40px ${maturityColor}30`,
              marginBottom: "16px",
            }}>
              <div>
                <div style={{ fontFamily: C.serif, fontSize: "48px", fontWeight: 300, color: maturityColor }}>{overallScore.toFixed(1)}</div>
                <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim }}>/ 5.0</div>
              </div>
            </div>
            <div style={{ fontFamily: C.serif, fontSize: "24px", color: maturityColor, marginBottom: "4px" }}>{maturityLevel}</div>
            <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim }}>
              Target for {tier ? TIERS[tier].label : "your tier"}: {target.toFixed(1)}
              {overallScore < target && <span style={{ color: C.red, marginLeft: "8px" }}>Gap: {(target - overallScore).toFixed(1)}</span>}
              {overallScore >= target && <span style={{ color: C.green, marginLeft: "8px" }}>✓ Above target</span>}
            </div>
            {company.name && <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, marginTop: "8px" }}>{company.name}</div>}
          </div>

          {/* Domain Scorecard */}
          <div style={{ ...cardStyle, marginBottom: "28px" }}>
            <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px" }}>
              Domain Scorecard
            </div>
            {domainScores.map(d => (
              <MaturityBar
                key={d.id}
                score={d.score}
                target={target}
                label={`${d.icon} ${d.name}`}
                color={d.score >= target ? C.green : d.score >= target - 0.5 ? C.amber : C.red}
              />
            ))}
          </div>

          {/* Summary Metrics */}
          <div className="results-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { label: "Domains Above Target", val: domainScores.filter(d => d.score >= target).length, total: 8, color: C.green },
              { label: "Domains Near Target", val: domainScores.filter(d => d.score >= target - 0.5 && d.score < target).length, total: 8, color: C.amber },
              { label: "Domains Below Target", val: domainScores.filter(d => d.score < target - 0.5).length, total: 8, color: C.red },
              { label: "Quick Wins Found", val: quickWins.length, total: null, color: C.cyan },
            ].map((m, i) => (
              <div key={i} style={{ ...cardStyle, padding: "20px", textAlign: "center" }}>
                <div style={{ fontFamily: C.serif, fontSize: "32px", fontWeight: 300, color: m.color }}>{m.val}</div>
                <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, marginTop: "4px" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: "28px", border: `1px solid ${C.green}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "18px" }}>⚡</span>
                <span style={{ fontFamily: C.mono, fontSize: "11px", color: C.green, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Priority Quick Wins
                </span>
              </div>
              {quickWins.map((qw, i) => (
                <div key={i} style={{
                  padding: "16px 20px", background: C.greenDim, borderRadius: C.radiusSm,
                  marginBottom: i < quickWins.length - 1 ? "12px" : 0,
                  border: `1px solid rgba(61,220,132,0.1)`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500 }}>{qw.title}</div>
                    <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, whiteSpace: "nowrap" }}>{qw.toolkit}</span>
                  </div>
                  <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.5 }}>{qw.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Engagement */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>
              Recommended Engagement
            </div>
            <div className="packages-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {packages.map(pkg => {
                const isRec = pkg.key === recommendedPackage;
                return (
                  <div key={pkg.key} style={{
                    ...cardStyle,
                    border: `1px solid ${isRec ? C.accent : C.border}`,
                    background: isRec ? C.bgCard2 : C.bgCard,
                    position: "relative",
                  }}>
                    {isRec && (
                      <div style={{
                        position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                        background: C.accent, color: "white", fontFamily: C.mono, fontSize: "9px",
                        padding: "3px 12px", borderRadius: "0 0 6px 6px", letterSpacing: "1px",
                      }}>RECOMMENDED</div>
                    )}
                    <h4 style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 400, color: C.text, marginTop: isRec ? "10px" : 0, marginBottom: "6px" }}>{pkg.name}</h4>
                    <div style={{ fontFamily: C.mono, fontSize: "17px", color: C.accent, marginBottom: "4px" }}>{pkg.price}</div>
                    <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim, marginBottom: "14px" }}>{pkg.timeline}</div>
                    <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.cyan, marginBottom: "16px", padding: "8px 10px", background: C.cyanDim, borderRadius: C.radiusSm }}>{pkg.match}</div>
                    <ul style={{ listStyle: "none" }}>
                      {pkg.features.map((f, j) => (
                        <li key={j} style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, padding: "4px 0", display: "flex", gap: "6px" }}>
                          <span style={{ color: C.green, fontSize: "10px", marginTop: "3px" }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div style={{
            ...cardStyle, textAlign: "center",
            background: `linear-gradient(135deg, ${C.accentGlow}, ${C.accentGlow2})`,
            border: `1px solid ${C.accent}30`,
          }}>
            <h3 style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.text, marginBottom: "12px" }}>
              Ready to close the gaps?
            </h3>
            <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim, marginBottom: "24px", maxWidth: "500px", margin: "0 auto 24px" }}>
              Book a 30-minute call to walk through your results and discuss next steps. No obligation, no pitch — just a frank conversation about your OtC process.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <a href="https://clearledger.app" style={{
                padding: "14px 32px", borderRadius: C.radiusSm, textDecoration: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 500,
                boxShadow: `0 4px 24px ${C.accentGlow2}`,
              }}>Book a Call</a>
              <button onClick={() => { setScreen("intro"); setAnswers({}); setTier(null); setCurrentDomain(0); setCurrentQuestion(0); scrollToTop(); }} style={{
                padding: "14px 28px", borderRadius: C.radiusSm, cursor: "pointer",
                background: "transparent", border: `1px solid ${C.border}`,
                color: C.textMid, fontFamily: C.sans, fontSize: "14px",
              }}>Retake Assessment</button>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "48px", padding: "24px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <LogoMark size={18} />
              <span style={{ fontFamily: C.serif, fontSize: "14px", color: C.textDim }}>ClearLedger</span>
            </div>
            <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim }}>
              Assessment methodology aligned to APQC Process Classification Framework v8.0
            </div>
            <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, marginTop: "8px" }}>
              © 2026 ClearLedger. All rights reserved. · <a href="#" style={{ color: C.textDim }}>Privacy</a> · <a href="#" style={{ color: C.textDim }}>Terms</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
