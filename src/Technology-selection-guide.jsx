import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   3.4 OtC Technology Selection Guide
   Phase 3 — OtC Strategic Value
   APQC PCF v8.0: 8.0 / 11.3 Manage IT
   Cross-references: 1.1–1.6, 2.1–2.6, 3.1–3.3, 3.5, KPI Spec
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
  "3.3": { name: "Treasury & Working Capital", p: 3 }, "3.5": { name: "Business Case Builder", p: 3 },
  "KPI": { name: "KPI Specification Document", p: 1 },
};

const TABS = [
  { id: "landscape", label: "1. Vendor Landscape", icon: "🗺️" },
  { id: "scorecard", label: "2. Evaluation Scorecard", icon: "📋" },
  { id: "tco", label: "3. TCO Calculator", icon: "🧮" },
  { id: "rfp", label: "4. RFP Framework", icon: "📄" },
  { id: "arch", label: "5. Integration Architecture", icon: "🏗️" },
  { id: "xref", label: "Toolkit Map", icon: "🔗" },
];

// ═══ VENDOR LANDSCAPE ═══
const TECH_CATEGORIES = [
  {
    id: "ar_auto", name: "AR Automation & Collections", icon: "⚡", color: T.accent,
    description: "End-to-end AR platforms covering credit, collections, cash application, disputes, and analytics",
    toolkitCoverage: ["1.2", "1.3", "2.1", "2.2", "3.2"],
    vendors: [
      { name: "HighRadius", tier: "Leader", deployment: "Cloud", erp: "SAP, Oracle, D365", strengths: "AI cash application, integrated receivables, strong SAP integration", considerations: "Premium pricing, complex implementation", size: "Enterprise", region: "Global" },
      { name: "Billtrust", tier: "Leader", deployment: "Cloud", erp: "Multi-ERP", strengths: "Business payments network, strong e-invoicing, good mid-market fit", considerations: "Less deep on credit management", size: "Mid-Enterprise", region: "NA-focused" },
      { name: "BlackLine AR", tier: "Strong", deployment: "Cloud", erp: "Multi-ERP", strengths: "Financial close integration, strong SOX controls, unified platform", considerations: "AR is add-on to core close product", size: "Enterprise", region: "Global" },
      { name: "Esker", tier: "Strong", deployment: "Cloud", erp: "SAP, Oracle", strengths: "Strong in P2P+O2C combination, good European presence, AI-driven", considerations: "Less US market depth than HighRadius", size: "Mid-Enterprise", region: "EU + Global" },
      { name: "Sidetrade", tier: "Strong", deployment: "Cloud", erp: "Multi-ERP", strengths: "AI-powered (Aimie), strong collections, predictive analytics", considerations: "Smaller partner ecosystem", size: "Mid-Enterprise", region: "EU + Global" },
      { name: "Cforia (Serrala)", tier: "Niche", deployment: "Cloud/Hybrid", erp: "SAP-primary", strengths: "Deep SAP integration, strong cash application, treasury link", considerations: "SAP-centric, less multi-ERP flexibility", size: "Enterprise", region: "EU" },
    ],
  },
  {
    id: "einvoice", name: "E-Invoicing & Compliance", icon: "📨", color: T.green,
    description: "Platforms for electronic invoicing compliance, CTC (continuous transaction controls), and multi-jurisdiction mandate management",
    toolkitCoverage: ["1.4", "2.3", "3.1"],
    vendors: [
      { name: "Sovos", tier: "Leader", deployment: "Cloud", erp: "Multi-ERP", strengths: "Broadest mandate coverage (60+ countries), SAP Certified, real-time compliance", considerations: "Complex pricing model", size: "Enterprise", region: "Global" },
      { name: "Pagero (Thomson Reuters)", tier: "Leader", deployment: "Cloud", erp: "Multi-ERP", strengths: "Peppol access point, strong EU network, smart routing", considerations: "Integration complexity for non-standard ERPs", size: "Mid-Enterprise", region: "EU + Global" },
      { name: "Avalara", tier: "Strong", deployment: "Cloud", erp: "Multi-ERP", strengths: "Tax + e-invoicing combined, strong US sales tax, growing mandates coverage", considerations: "E-invoicing is newer capability vs core tax", size: "All sizes", region: "Global" },
      { name: "Comarch", tier: "Strong", deployment: "Cloud/On-prem", erp: "Multi-ERP", strengths: "Strong CEE/Poland presence, EDI + e-invoicing combined, KSeF-ready", considerations: "Less global reach", size: "Mid-market", region: "EU / CEE" },
      { name: "TrustWeaver", tier: "Niche", deployment: "Cloud", erp: "Via partners", strengths: "Compliance-as-a-service, digital signatures, archiving", considerations: "Niche compliance layer, not full e-invoicing platform", size: "Enterprise", region: "EU" },
    ],
  },
  {
    id: "process_mining", name: "Process Mining & Analytics", icon: "🔬", color: T.purple,
    description: "Process discovery, conformance checking, and continuous improvement platforms for OtC optimization",
    toolkitCoverage: ["2.5", "1.1", "1.6"],
    vendors: [
      { name: "Celonis", tier: "Leader", deployment: "Cloud", erp: "SAP, Oracle, D365+", strengths: "Market leader, deep ERP connectors, execution management, OtC-specific apps", considerations: "Premium pricing, can require dedicated team", size: "Enterprise", region: "Global" },
      { name: "SAP Signavio", tier: "Strong", deployment: "Cloud", erp: "SAP-primary", strengths: "Native SAP integration, process modeling + mining combined, BPM", considerations: "Best value in SAP-only environments", size: "Enterprise", region: "Global" },
      { name: "Microsoft Process Mining", tier: "Strong", deployment: "Cloud", erp: "D365 + multi", strengths: "Power Platform integration, accessible pricing, growing capabilities", considerations: "Less mature than Celonis for complex analysis", size: "All sizes", region: "Global" },
      { name: "ABBYY Timeline", tier: "Niche", deployment: "Cloud", erp: "Multi-ERP", strengths: "Strong task mining, document intelligence, competitive pricing", considerations: "Smaller market share, less OtC-specific content", size: "Mid-market", region: "Global" },
      { name: "Minit (Microsoft)", tier: "Niche", deployment: "Cloud", erp: "Multi-ERP", strengths: "User-friendly, good visualization, now part of Microsoft", considerations: "Being integrated into MS Process Mining", size: "Mid-market", region: "EU" },
    ],
  },
  {
    id: "credit", name: "Credit Risk & Scoring", icon: "🛡️", color: T.amber,
    description: "Credit assessment, scoring models, insurance, and portfolio monitoring platforms",
    toolkitCoverage: ["2.1", "3.1", "1.3"],
    vendors: [
      { name: "Dun & Bradstreet", tier: "Leader", deployment: "Cloud/API", erp: "Multi-ERP", strengths: "Largest business database, DUNS numbers, predictive scoring, global coverage", considerations: "Data quality varies by region", size: "All sizes", region: "Global" },
      { name: "Creditsafe", tier: "Strong", deployment: "Cloud/API", erp: "Multi-ERP", strengths: "Competitive pricing, good EU coverage, real-time monitoring", considerations: "Less depth on financial analytics", size: "All sizes", region: "EU + Global" },
      { name: "CreditRiskMonitor", tier: "Strong", deployment: "Cloud", erp: "Standalone", strengths: "FRISK score (96% accuracy), public company focus, early warning", considerations: "Public company bias, less SME coverage", size: "Enterprise", region: "Global" },
      { name: "Coface", tier: "Niche", deployment: "Cloud/API", erp: "Standalone", strengths: "Credit insurance + information combined, strong trade credit expertise", considerations: "Primarily an insurer, tech is secondary", size: "Mid-Enterprise", region: "EU + Global" },
    ],
  },
  {
    id: "deductions", name: "Deductions & TPM", icon: "🏷️", color: T.orange,
    description: "Trade promotion management, deduction coding/recovery, and retailer chargeback platforms (CPG/FMCG focus)",
    toolkitCoverage: ["3.2", "2.2"],
    vendors: [
      { name: "HighRadius Deductions", tier: "Leader", deployment: "Cloud", erp: "Multi-ERP", strengths: "AI auto-coding, integrated with AR suite, retailer portal integration", considerations: "Part of full HighRadius platform", size: "Enterprise", region: "Global" },
      { name: "Cass Information Systems", tier: "Strong", deployment: "Cloud/BPO", erp: "Multi-ERP", strengths: "Managed service model, strong in freight/logistics chargebacks", considerations: "BPO-hybrid model, less pure software", size: "Enterprise", region: "NA" },
      { name: "SAP TPM / CG Module", tier: "Strong", deployment: "On-prem/Cloud", erp: "SAP only", strengths: "Integrated trade promotion planning + settlement, deep SAP", considerations: "SAP-only, complex configuration", size: "Enterprise", region: "Global" },
      { name: "Vistex", tier: "Niche", deployment: "Cloud/On-prem", erp: "SAP-primary", strengths: "Go-to-market suite including pricing + promotions + rebates", considerations: "Complex implementation, SAP-ecosystem", size: "Enterprise", region: "Global" },
    ],
  },
];

// ═══ EVALUATION SCORECARD ═══
const EVAL_CRITERIA = [
  { category: "Functional Fit", weight: 30, criteria: [
    { name: "OtC Process Coverage", desc: "Breadth across credit, billing, collections, cash app, disputes, deductions", maxScore: 5 },
    { name: "Automation Capabilities", desc: "AI/ML for matching, coding, scoring, prediction; workflow automation", maxScore: 5 },
    { name: "Analytics & Reporting", desc: "Embedded dashboards, KPI tracking, predictive analytics, custom reports", maxScore: 5 },
    { name: "E-Invoicing / Compliance", desc: "Multi-jurisdiction e-invoicing support, CTC readiness, format coverage", maxScore: 5 },
    { name: "Customer Portal", desc: "Self-service invoice viewing, dispute submission, payment, onboarding", maxScore: 5 },
  ]},
  { category: "Technical Fit", weight: 25, criteria: [
    { name: "ERP Integration Depth", desc: "Pre-built connectors, real-time sync, certified for target ERP(s)", maxScore: 5 },
    { name: "API & Extensibility", desc: "REST APIs, webhooks, SDK, custom workflow capability", maxScore: 5 },
    { name: "Security & Compliance", desc: "SOC 2, ISO 27001, GDPR, data residency options, SSO", maxScore: 5 },
    { name: "Scalability & Performance", desc: "Transaction volume capacity, multi-entity, multi-currency, global deployment", maxScore: 5 },
  ]},
  { category: "Vendor Viability", weight: 20, criteria: [
    { name: "Market Position & Trajectory", desc: "Analyst rankings (Gartner, Forrester, IDC), market share growth, funding", maxScore: 5 },
    { name: "Customer References", desc: "References in same industry/size, case studies, community maturity", maxScore: 5 },
    { name: "Support & SLA", desc: "24/7 support, dedicated CSM, uptime SLA, implementation methodology", maxScore: 5 },
    { name: "Product Roadmap", desc: "Innovation velocity, AI investment, planned capabilities, partner ecosystem", maxScore: 5 },
  ]},
  { category: "Commercial", weight: 25, criteria: [
    { name: "Total Cost of Ownership", desc: "License/subscription + implementation + ongoing support + internal cost", maxScore: 5 },
    { name: "Pricing Model Flexibility", desc: "Per-user, per-transaction, flat rate options; scalability of pricing", maxScore: 5 },
    { name: "Time to Value", desc: "Implementation timeline, phased approach capability, quick wins", maxScore: 5 },
    { name: "Contract Terms", desc: "Term length, exit clauses, data portability, price escalation caps", maxScore: 5 },
  ]},
];

// ═══ RFP SECTIONS ═══
const RFP_SECTIONS = [
  { section: "1. Company Overview", questions: 8, description: "Vendor background, financial stability, relevant experience, organizational structure", keyQuestions: ["Revenue and growth trajectory (3 years)", "Number of OtC-specific customers in our industry/size", "Employee count in R&D vs. services", "Key client references in similar scope"] },
  { section: "2. Functional Requirements", questions: 45, description: "Detailed capability assessment mapped to APQC OtC processes", keyQuestions: ["Demonstrate cash application auto-matching with sample remittance data", "Show credit scoring model configuration and limit calculation", "Walk through dispute/deduction workflow with retailer-specific rules", "Show e-invoicing compliance for [target jurisdictions]"] },
  { section: "3. Technical Architecture", questions: 22, description: "Integration approach, security, scalability, data architecture", keyQuestions: ["Describe ERP integration architecture (real-time vs batch)", "Data residency and sovereignty options for EU deployment", "API rate limits and throughput capabilities", "Disaster recovery RTO/RPO commitments"] },
  { section: "4. Implementation Approach", questions: 15, description: "Methodology, timeline, team, change management, training", keyQuestions: ["Proposed implementation timeline with phase gates", "Team composition (vendor vs client vs SI partner)", "Data migration approach and historical data handling", "Training methodology and knowledge transfer plan"] },
  { section: "5. Support & Operations", questions: 12, description: "Ongoing support model, SLAs, issue escalation, release management", keyQuestions: ["Support tiers and response time commitments", "Release frequency and upgrade process", "Dedicated CSM and QBR cadence", "Incident management and root cause analysis process"] },
  { section: "6. Commercial Proposal", questions: 10, description: "Pricing, licensing, payment terms, contract structure", keyQuestions: ["Itemized pricing by module/capability", "Volume-based pricing tiers and growth scenario", "Implementation fees (fixed vs T&M)", "3-year and 5-year total cost projection"] },
  { section: "7. Proof of Concept", questions: 5, description: "POC scope, success criteria, timeline, data requirements", keyQuestions: ["POC scope covering [2-3 critical processes]", "Success criteria and evaluation rubric", "Data requirements and preparation timeline", "POC-to-production conversion approach"] },
];

// ═══ INTEGRATION PATTERNS ═══
const INTEGRATION_LAYERS = [
  { layer: "ERP Core", color: T.red, systems: ["SAP S/4HANA", "Oracle Cloud ERP", "Microsoft D365 F&O", "NetSuite"], description: "Master data, GL posting, sub-ledger, financial close" },
  { layer: "AR Automation", color: T.accent, systems: ["HighRadius", "Billtrust", "Esker", "Sidetrade"], description: "Credit, collections, cash application, disputes, analytics" },
  { layer: "E-Invoicing", color: T.green, systems: ["Sovos", "Pagero", "Avalara", "Comarch"], description: "Invoice delivery, compliance, CTC, archiving" },
  { layer: "Process Intelligence", color: T.purple, systems: ["Celonis", "SAP Signavio", "MS Process Mining"], description: "Process discovery, conformance, bottleneck analysis" },
  { layer: "Credit & Risk", color: T.amber, systems: ["D&B", "Creditsafe", "CreditRiskMonitor"], description: "Credit scoring, monitoring, portfolio risk" },
  { layer: "Banking & Payments", color: T.blue, systems: ["SWIFT gpi", "Host-to-host", "Payment hubs"], description: "Bank statements, payment files, reconciliation" },
];

const INTEGRATION_POINTS = [
  { from: "ERP Core", to: "AR Automation", dataFlow: "Customer master, invoices, open items, GL codes", pattern: "Real-time API / iDoc", frequency: "Near real-time", toolkit: ["1.1", "1.2"] },
  { from: "AR Automation", to: "ERP Core", dataFlow: "Cash postings, credit updates, dispute resolutions", pattern: "Batch / API callback", frequency: "Hourly / Daily", toolkit: ["1.2", "2.1"] },
  { from: "ERP Core", to: "E-Invoicing", dataFlow: "Invoice data (UBL/CII), tax details, attachments", pattern: "Event-driven / API", frequency: "Per invoice", toolkit: ["1.4", "2.3"] },
  { from: "E-Invoicing", to: "ERP Core", dataFlow: "Delivery status, compliance confirmation, rejections", pattern: "Webhook / polling", frequency: "Per invoice", toolkit: ["1.4"] },
  { from: "ERP Core", to: "Process Intelligence", dataFlow: "Event logs (IDES/change docs), timestamps, users", pattern: "Batch extract / CDC", frequency: "Daily", toolkit: ["2.5"] },
  { from: "Credit & Risk", to: "AR Automation", dataFlow: "Credit scores, ratings, monitoring alerts", pattern: "API / webhook", frequency: "On-demand + alerts", toolkit: ["2.1", "3.1"] },
  { from: "Banking & Payments", to: "AR Automation", dataFlow: "Bank statements (MT940/CAMT.053), remittance advice", pattern: "SFTP / API", frequency: "Multiple daily", toolkit: ["1.2"] },
  { from: "AR Automation", to: "Banking & Payments", dataFlow: "Payment instructions, direct debit mandates", pattern: "Payment file (PAIN.001)", frequency: "Per run", toolkit: ["1.2", "3.3"] },
];

export default function TechSelectionGuide() {
  const [activeTab, setActiveTab] = useState("landscape");
  const [expandedCat, setExpandedCat] = useState("ar_auto");

  // Scorecard state — up to 3 vendors
  const [vendors, setVendors] = useState(["Vendor A", "Vendor B", "Vendor C"]);
  const [scores, setScores] = useState(() => {
    const init = {};
    EVAL_CRITERIA.forEach(cat => cat.criteria.forEach(c => {
      vendors.forEach((v, vi) => { init[`${c.name}-${vi}`] = 0; });
    }));
    return init;
  });
  const updateScore = (criterionName, vendorIdx, val) => setScores(p => ({ ...p, [`${criterionName}-${vendorIdx}`]: Math.min(5, Math.max(0, val)) }));
  const updateVendorName = (idx, name) => setVendors(p => p.map((v, i) => i === idx ? name : v));

  const vendorTotals = useMemo(() => {
    return vendors.map((v, vi) => {
      let weightedTotal = 0;
      let maxPossible = 0;
      EVAL_CRITERIA.forEach(cat => {
        let catScore = 0;
        let catMax = 0;
        cat.criteria.forEach(c => {
          catScore += (scores[`${c.name}-${vi}`] || 0);
          catMax += c.maxScore;
        });
        weightedTotal += (catScore / catMax) * cat.weight;
        maxPossible += cat.weight;
      });
      return { name: v, score: weightedTotal, pct: (weightedTotal / maxPossible) * 100 };
    });
  }, [scores, vendors]);

  // TCO calculator
  const [tco, setTco] = useState({
    licenseFee: 150, // €k/year
    implCost: 300, // €k one-off
    implMonths: 9,
    customization: 50, // €k
    training: 30, // €k
    annualSupport: 25, // €k/year (% of license)
    internalFTEs: 1.5,
    fteCost: 55, // €k
    infra: 15, // €k/year (if applicable)
    dataCleanup: 40, // €k one-off
    years: 5,
    escalation: 3, // % annual price increase
  });
  const updTCO = (k, v) => setTco(p => ({ ...p, [k]: v }));

  const tcoCalc = useMemo(() => {
    const years = [];
    let cumulative = 0;
    for (let y = 1; y <= tco.years; y++) {
      const escalator = Math.pow(1 + tco.escalation / 100, y - 1);
      const license = tco.licenseFee * 1000 * escalator;
      const support = tco.annualSupport * 1000 * escalator;
      const internal = tco.internalFTEs * tco.fteCost * 1000;
      const infra = tco.infra * 1000;
      const oneOff = y === 1 ? (tco.implCost + tco.customization + tco.training + tco.dataCleanup) * 1000 : 0;
      const total = license + support + internal + infra + oneOff;
      cumulative += total;
      years.push({ year: y, license, support, internal, infra, oneOff, total, cumulative });
    }
    const totalTCO = cumulative;
    const avgAnnual = totalTCO / tco.years;
    return { years, totalTCO, avgAnnual };
  }, [tco]);

  // ─── Render Landscape ───
  const renderLandscape = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="5 technology categories spanning the OtC stack — each mapped to toolkit deliverables they support">OtC Technology Landscape</SectionTitle>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {TECH_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} style={{
              padding: "8px 14px", borderRadius: T.radius,
              border: `1px solid ${expandedCat === cat.id ? cat.color : T.border}`,
              background: expandedCat === cat.id ? `${cat.color}18` : "transparent",
              color: expandedCat === cat.id ? cat.color : T.textMuted,
              fontFamily: T.font, fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}>
              <span style={{ marginRight: "6px" }}>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
      </Card>

      {TECH_CATEGORIES.filter(cat => expandedCat === null || expandedCat === cat.id).map(cat => (
        <Card key={cat.id} style={{ borderLeft: `3px solid ${cat.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "18px" }}>{cat.icon}</span>
                <span style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 700, color: T.text }}>{cat.name}</span>
              </div>
              <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, maxWidth: "600px" }}>{cat.description}</div>
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {cat.toolkitCoverage.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Vendor", "Tier", "Deploy", "ERP Fit", "Strengths", "Considerations", "Best For"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.vendors.map((v, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 6px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{v.name}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                      <Badge color={v.tier === "Leader" ? T.green : v.tier === "Strong" ? T.amber : T.textMuted}
                        bg={v.tier === "Leader" ? T.greenDim : v.tier === "Strong" ? T.amberDim : T.surfaceAlt}>{v.tier}</Badge>
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.accent }}>{v.deployment}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "10px", color: T.textMuted }}>{v.erp}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textMuted, fontSize: "11px", maxWidth: "200px" }}>{v.strengths}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, color: T.textDim, fontSize: "11px", maxWidth: "180px" }}>{v.considerations}</td>
                    <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontSize: "11px" }}>
                      <Badge color={T.textMuted} bg={T.surfaceAlt}>{v.size}</Badge>
                      <Badge color={T.textMuted} bg={T.surfaceAlt}>{v.region}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );

  // ─── Render Scorecard ───
  const renderScorecard = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card glow>
        <SectionTitle sub="Weighted evaluation across 4 categories — enter vendor names and score each criterion 0–5">Vendor Evaluation Scorecard</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {vendors.map((v, vi) => (
            <div key={vi}>
              <Field label={`Vendor ${vi + 1}`}>
                <input value={v} onChange={e => updateVendorName(vi, e.target.value)}
                  style={{ padding: "8px 10px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "6px", color: T.text, fontFamily: T.font, fontSize: "13px", outline: "none", width: "100%" }} />
              </Field>
            </div>
          ))}
        </div>
        {/* Score summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {vendorTotals.map((vt, i) => (
            <div key={i} style={{ padding: "12px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted, marginBottom: "4px" }}>{vt.name}</div>
              <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: vt.pct >= 70 ? T.green : vt.pct >= 50 ? T.amber : T.red }}>{vt.pct.toFixed(0)}%</div>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>{vt.score.toFixed(1)} / 100 weighted</div>
            </div>
          ))}
        </div>
      </Card>

      {EVAL_CRITERIA.map((cat, ci) => (
        <Card key={ci}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 700, color: T.text }}>{cat.category}</div>
            <Badge color={T.accent}>{cat.weight}% weight</Badge>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, width: "40%" }}>Criterion</th>
                {vendors.map((v, vi) => (
                  <th key={vi} style={{ textAlign: "center", padding: "6px 8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cat.criteria.map((c, cri) => (
                <tr key={cri}>
                  <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, verticalAlign: "top" }}>
                    <div style={{ fontWeight: 500, color: T.text }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{c.desc}</div>
                  </td>
                  {vendors.map((v, vi) => (
                    <td key={vi} style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                      <NumInput value={scores[`${c.name}-${vi}`] || 0} onChange={val => updateScore(c.name, vi, val)} width="50px" step={1} suffix={`/${c.maxScore}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );

  // ─── Render TCO ───
  const renderTCO = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Model total cost of ownership including license, implementation, internal, and ongoing costs">TCO Input Parameters</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { k: "licenseFee", l: "Annual License / Subscription", s: "€k/yr" },
            { k: "implCost", l: "Implementation Cost", s: "€k" },
            { k: "implMonths", l: "Implementation Duration", s: "months" },
            { k: "customization", l: "Customization / Config", s: "€k" },
            { k: "training", l: "Training & Change Mgmt", s: "€k" },
            { k: "annualSupport", l: "Annual Support / Maint", s: "€k/yr" },
            { k: "internalFTEs", l: "Internal Admin FTEs", s: "FTEs", step: 0.5 },
            { k: "fteCost", l: "FTE Cost (fully loaded)", s: "€k" },
            { k: "infra", l: "Infrastructure / Hosting", s: "€k/yr" },
            { k: "dataCleanup", l: "Data Cleanup / Migration", s: "€k" },
            { k: "years", l: "Projection Period", s: "years" },
            { k: "escalation", l: "Annual Price Escalation", s: "%", step: 0.5 },
          ].map(f => (
            <Field key={f.k} label={f.l}>
              <NumInput value={tco[f.k]} onChange={v => updTCO(f.k, v)} suffix={f.s} step={f.step} width="80px" />
            </Field>
          ))}
        </div>
      </Card>

      <Card glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase" }}>{tco.years}-Year Total TCO</div>
            <div style={{ fontFamily: T.mono, fontSize: "28px", fontWeight: 700, color: T.red }}>{fmt(tcoCalc.totalTCO)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase" }}>Avg Annual Cost</div>
            <div style={{ fontFamily: T.mono, fontSize: "28px", fontWeight: 700, color: T.amber }}>{fmt(tcoCalc.avgAnnual)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase" }}>Year 1 (incl setup)</div>
            <div style={{ fontFamily: T.mono, fontSize: "28px", fontWeight: 700, color: T.accent }}>{fmt(tcoCalc.years[0]?.total || 0)}</div>
          </div>
        </div>
      </Card>

      {/* Year-by-year breakdown */}
      <Card>
        <SectionTitle sub="Annual cost decomposition with escalation applied">Year-by-Year TCO Breakdown</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
          <thead>
            <tr>
              {["Year", "License", "Support", "Internal", "Infra", "One-off", "Total", "Cumulative"].map(h => (
                <th key={h} style={{ textAlign: "right", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tcoCalc.years.map(y => (
              <tr key={y.year}>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.text, fontWeight: 600, textAlign: "right" }}>Y{y.year}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.textMuted, textAlign: "right" }}>{fmt(y.license)}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.textMuted, textAlign: "right" }}>{fmt(y.support)}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.textMuted, textAlign: "right" }}>{fmt(y.internal)}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.textMuted, textAlign: "right" }}>{fmt(y.infra)}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: y.oneOff > 0 ? T.amber : T.textDim, textAlign: "right" }}>{y.oneOff > 0 ? fmt(y.oneOff) : "—"}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.text, fontWeight: 600, textAlign: "right" }}>{fmt(y.total)}</td>
                <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, color: T.accent, fontWeight: 600, textAlign: "right" }}>{fmt(y.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Visual bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px", marginTop: "16px", padding: "0 8px" }}>
          {tcoCalc.years.map(y => {
            const maxTotal = Math.max(...tcoCalc.years.map(yr => yr.total));
            return (
              <div key={y.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.textMuted, marginBottom: "4px" }}>{fmt(y.total)}</span>
                <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                  {y.oneOff > 0 && <div style={{ height: `${(y.oneOff / maxTotal) * 100}px`, background: T.amberDim, border: `1px solid ${T.amber}40`, borderRadius: "3px 3px 0 0" }} />}
                  <div style={{ height: `${(y.license / maxTotal) * 100}px`, background: T.accentDim, border: `1px solid ${T.accent}40` }} />
                  <div style={{ height: `${((y.support + y.internal + y.infra) / maxTotal) * 100}px`, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0 0 3px 3px" }} />
                </div>
                <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim, marginTop: "4px" }}>Y{y.year}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "10px", height: "10px", background: T.amberDim, border: `1px solid ${T.amber}40`, borderRadius: "2px" }} /><span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim }}>One-off</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "10px", height: "10px", background: T.accentDim, border: `1px solid ${T.accent}40`, borderRadius: "2px" }} /><span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim }}>License</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "10px", height: "10px", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "2px" }} /><span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim }}>Support/Internal/Infra</span></div>
        </div>
      </Card>
    </div>
  );

  // ─── Render RFP ───
  const renderRFP = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="7-section RFP structure covering 117 total questions — adapt to your specific technology selection">RFP Framework & Question Bank</SectionTitle>
        <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, marginBottom: "8px" }}>
          This framework is designed for AR automation / OtC platform selection but can be adapted for any of the 5 technology categories. The full question bank covers functional requirements mapped to APQC processes.
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Badge>117 questions total</Badge>
          <Badge color={T.textMuted} bg={T.surfaceAlt}>7 sections</Badge>
          <Badge color={T.textMuted} bg={T.surfaceAlt}>Mapped to APQC PCF</Badge>
        </div>
      </Card>

      {RFP_SECTIONS.map((s, i) => (
        <Card key={i} style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <div style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 700, color: T.text, marginBottom: "4px" }}>{s.section}</div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim }}>{s.description}</div>
            </div>
            <Badge color={T.accent}>{s.questions} questions</Badge>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Key Questions</div>
          <div style={{ display: "grid", gap: "4px" }}>
            {s.keyQuestions.map((q, j) => (
              <div key={j} style={{ padding: "6px 10px", background: T.bg, borderRadius: T.radius, fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>
                <span style={{ color: T.accent, fontFamily: T.mono, fontSize: "11px", marginRight: "8px" }}>{i + 1}.{j + 1}</span>{q}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Evaluation timeline */}
      <Card>
        <SectionTitle sub="Recommended timeline from RFP issuance to contract signature">Selection Process Timeline</SectionTitle>
        <div style={{ display: "grid", gap: "6px" }}>
          {[
            { phase: "Requirements & Shortlist", duration: "2–3 weeks", activities: "Define requirements, market scan, create longlist (8–10), shortlist (3–4)" },
            { phase: "RFP Issuance & Response", duration: "3–4 weeks", activities: "Issue RFP, vendor Q&A, collect responses, initial scoring" },
            { phase: "Demo & Deep Dive", duration: "2–3 weeks", activities: "Structured demos (scripted scenarios), reference calls, technical deep-dive" },
            { phase: "Proof of Concept", duration: "3–4 weeks", activities: "POC with top 2 vendors, test with real data, evaluate against success criteria" },
            { phase: "Commercial Negotiation", duration: "2–3 weeks", activities: "Final pricing, contract terms, SLA negotiation, legal review" },
            { phase: "Decision & Contract", duration: "1–2 weeks", activities: "Steering committee decision, contract execution, kick-off planning" },
          ].map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 100px 1fr", gap: "12px", padding: "10px 12px", background: T.bg, borderRadius: T.radius, alignItems: "center" }}>
              <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text, fontWeight: 600 }}>{p.phase}</span>
              <Badge color={T.accent}>{p.duration}</Badge>
              <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{p.activities}</span>
            </div>
          ))}
          <div style={{ padding: "10px 12px", background: T.accentDim, borderRadius: T.radius, textAlign: "center" }}>
            <span style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.accent }}>Total: 13–19 weeks (3–5 months)</span>
          </div>
        </div>
      </Card>
    </div>
  );

  // ─── Render Architecture ───
  const renderArch = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="6-layer OtC technology stack with integration points mapped to toolkit deliverables">Integration Architecture Overview</SectionTitle>
        <div style={{ display: "grid", gap: "6px" }}>
          {INTEGRATION_LAYERS.map((layer, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: "12px", padding: "12px", background: T.bg, borderRadius: T.radius, borderLeft: `3px solid ${layer.color}`, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: layer.color }}>{layer.layer}</div>
                <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{layer.description}</div>
              </div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {layer.systems.map(s => <Badge key={s} color={T.textMuted} bg={T.surfaceAlt}>{s}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle sub="Data flows between system layers — pattern, frequency, and toolkit reference">Integration Points Matrix</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["From", "To", "Data Flow", "Pattern", "Frequency", "Toolkit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INTEGRATION_POINTS.map((ip, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 6px", color: T.accent, borderBottom: `1px solid ${T.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{ip.from}</td>
                  <td style={{ padding: "8px 6px", color: T.green, borderBottom: `1px solid ${T.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{ip.to}</td>
                  <td style={{ padding: "8px 6px", color: T.textMuted, borderBottom: `1px solid ${T.border}`, maxWidth: "220px" }}>{ip.dataFlow}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.purple }}>{ip.pattern}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px", color: T.textMuted }}>{ip.frequency}</td>
                  <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", gap: "3px" }}>{ip.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Integration Considerations */}
      <Card>
        <SectionTitle sub="Critical decision points that affect architecture and vendor selection">Integration Decision Framework</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { q: "Real-time vs. Batch?", guidance: "Cash application and credit checks need near real-time (API). Process mining and analytics can be daily batch (CDC/extract).", color: T.accent },
            { q: "Best-of-breed vs. Suite?", guidance: "Suite (e.g., HighRadius full stack) reduces integration complexity but may sacrifice depth. Best-of-breed optimizes each function but multiplies integration points.", color: T.purple },
            { q: "ERP-native vs. Third-party?", guidance: "SAP-only shops may benefit from Signavio + SAP TPM. Multi-ERP environments need ERP-agnostic platforms with pre-built connectors.", color: T.amber },
            { q: "Build vs. Buy middleware?", guidance: "iPaaS (MuleSoft, Dell Boomi, Workato) reduces custom code but adds another vendor. Evaluate against ERP-native integration tools (SAP CPI, Oracle IC).", color: T.green },
            { q: "Data residency requirements?", guidance: "EU data sovereignty (GDPR, Schrems II) may require EU-hosted instances. Check vendor's data center locations and processing agreements.", color: T.red },
            { q: "Multi-entity complexity?", guidance: "Global deployments need multi-currency, multi-language, multi-entity support. Evaluate per-entity licensing costs and configuration effort.", color: T.blue },
          ].map((d, i) => (
            <div key={i} style={{ padding: "12px", background: T.bg, borderRadius: T.radius, borderLeft: `3px solid ${d.color}` }}>
              <div style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 700, color: d.color, marginBottom: "6px" }}>{d.q}</div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{d.guidance}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── Render Cross-Reference ───
  const renderXRef = () => {
    const sections = [
      { id: "landscape", name: "Vendor Landscape", refs: ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "2.5", "3.1", "3.2"], apqc: "11.3" },
      { id: "scorecard", name: "Evaluation Scorecard", refs: ["1.5", "1.6", "KPI"], apqc: "11.3" },
      { id: "tco", name: "TCO Calculator", refs: ["3.5"], apqc: "11.3.3" },
      { id: "rfp", name: "RFP Framework", refs: ["1.1", "1.6", "2.4", "2.5"], apqc: "11.3.2" },
      { id: "arch", name: "Integration Architecture", refs: ["1.2", "1.4", "2.1", "2.3", "2.5", "3.3"], apqc: "11.3.4" },
    ];
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="How each section of 3.4 maps to toolkit deliverables">Cross-Reference Matrix</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>3.4 Section</th>
                  {Object.keys(CROSS_REFS).map(code => (
                    <th key={code} style={{ padding: "8px 3px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "9px", textAlign: "center", minWidth: "28px" }}>{code}</th>
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
          <Badge color={T.bg} bg={T.accent}>3.4</Badge>
          <Badge>PHASE 3</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC 11.3</Badge>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "26px", fontWeight: 700, color: T.text, margin: "0 0 4px" }}>OtC Technology Selection Guide</h1>
        <p style={{ fontFamily: T.font, fontSize: "14px", color: T.textDim, margin: 0 }}>Vendor landscape · Evaluation scorecards · TCO calculator · RFP templates · Integration architecture</p>
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

      {activeTab === "landscape" && renderLandscape()}
      {activeTab === "scorecard" && renderScorecard()}
      {activeTab === "tco" && renderTCO()}
      {activeTab === "rfp" && renderRFP()}
      {activeTab === "arch" && renderArch()}
      {activeTab === "xref" && renderXRef()}

      <div style={{ marginTop: "32px", padding: "16px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>OtC Consulting Toolkit · Phase 3 · v3.4.0</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>25+ Vendors Mapped</Badge>
        </div>
      </div>
    </div>
  );
}
