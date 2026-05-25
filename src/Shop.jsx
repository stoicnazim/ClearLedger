import { useState, useMemo } from "react"

const T = {
  bg: "#07090e", surface: "#0d1017", s2: "#141924", s3: "#1c2435",
  border: "#232d42", borderH: "#334163",
  t1: "#e6eaf3", t2: "#94a0be", t3: "#5d6b88",
  gold: "#dba651", goldDim: "rgba(219,166,81,0.12)",
  blue: "#5b8def", blueDim: "rgba(91,141,239,0.10)",
  green: "#3ec98a", greenDim: "rgba(62,201,138,0.10)",
  orange: "#e8884e",
  purple: "#a78bfa", purpleDim: "rgba(167,139,250,0.10)",
  red: "#ef6b6b",
  teal: "#42d4be",
  mono: "'JetBrains Mono', monospace",
  font: "'Segoe UI','Helvetica Neue',sans-serif",
}

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "process", label: "Process Packs", icon: "◈" },
  { id: "compliance", label: "Compliance & Risk", icon: "⬡" },
  { id: "strategy", label: "Strategy & Assessment", icon: "◉" },
  { id: "guides", label: "Specialty Guides", icon: "◇" },
  { id: "bundles", label: "Bundles", icon: "◆" },
]

const INDIVIDUAL_TEMPLATES = [
  // ── Process Packs ──
  {
    id: "cash-app", category: "process", name: "Cash Application Process Pack", price: 49, tag: "Bestseller",
    format: "PDF guide (48 pages) + Excel workbook (6 sheets)",
    desc: "Stop manually matching payments. Deploy a production-ready cash application framework used by GBS teams at Fortune 500 scale. Includes full SIPOC, swimlane diagram, RACI matrix, tiered SOP, and an 8-metric KPI scorecard with APQC PCF v8.0 benchmarks.",
    includes: [
      "SIPOC: 30+ suppliers, inputs, processes, outputs, and customers mapped per tier",
      "Swimlane diagram: 8 lanes covering bank ingestion through GL reconciliation",
      "RACI matrix: 18 activities with accountable/consult/inform assignments",
      "SOP: 16 tiered steps from SME (10 steps) to Global MNC (16 steps)",
      "KPI scorecard: First-pass match, exception rate, cycle time, unapplied cash ratio, cost per payment, STP rate, reconciliation timeliness",
    ],
    useCase: "AR Directors building or rebuilding cash application operations. SSC leads standardizing across regions.",
  },
  {
    id: "dispute-res", category: "process", name: "Dispute Resolution Process Pack", price: 49, tag: null,
    format: "PDF guide (44 pages) + Excel workbook (5 sheets)",
    desc: "Cut dispute resolution cycle time by 40% with a structured framework. Taxonomy of 12+ reason codes, SLA matrix by dispute type, escalation workflows, and root cause analysis templates. Aligned to APQC 8.4 Deductions & Disputes.",
    includes: [
      "Dispute taxonomy: 12+ reason codes with descriptions and examples per tier",
      "RACI matrix: 15+ resolution activities with clear owner assignments",
      "SLA matrix: Resolution targets by dispute type (pricing, quality, delivery, etc.)",
      "SOP: 4-tier escalation from standard (3 BD) to executive (immediate)",
      "Root cause analysis template: 5-why framework with trend tracking",
    ],
    useCase: "Dispute managers drowning in manual email chains. Teams needing consistent SLA enforcement across regions.",
  },
  {
    id: "credit-mgmt", category: "process", name: "Credit Management Process Pack", price: 49, tag: null,
    format: "PDF guide (40 pages) + Excel workbook (4 sheets)",
    desc: "A defensible credit framework from policy to provisioning. Credit scoring model, delegated authority matrix, IFRS 9 / CECL staging decision tree, and periodic review workflow. Built for SSC/BPO environments with SOX compliance in mind.",
    includes: [
      "Credit policy template: Scope, risk appetite, approval authority, review cadence",
      "Risk scoring model: 5-factor weighted score (financial, payment history, industry, tenure, external rating)",
      "DoA matrix: Approval limits by credit risk tier and customer segment",
      "IFRS 9 staging decision tree: Stage 1/2/3 criteria with loss provision guidance",
      "Periodic review workflow: Annual, semi-annual, and trigger-based review cycles",
    ],
    useCase: "Credit managers formalizing ad-hoc processes. Controllers preparing for IFRS 9 / CECL audit scrutiny.",
  },
  {
    id: "collections", category: "process", name: "Collections Strategy & Segmentation Model", price: 59, tag: "Popular",
    format: "PDF guide (52 pages) + Excel workbook (7 sheets)",
    desc: "Move from 'call the oldest overdue' to AI-ready collections. A 6-segment collections model across 4 company tiers with dunning workflows, escalation matrices, and a collector worklist optimizer. The strategic core of modern AR operations.",
    includes: [
      "Segmentation engine: 6 segments (Strategic Anchor, Reliable Core, Slow & Steady, At-Risk, High-Volume, New/Unscored) × 4 tiers",
      "Dunning workflow: 5 communication tones (Courtesy → Legal) across a 90-day cycle",
      "Escalation matrix: Day 1 to Day 75 with clear owner per step",
      "Aging strategy map: Treatment path by bucket (current → 90+ DPD) with provision guidance",
      "Collector worklist optimizer: Priority scoring by days overdue, exposure, and risk segment",
    ],
    useCase: "Collection managers scaling from 'hero' to system. GPO leads standardizing collection strategies across BPO providers.",
  },
  {
    id: "billing", category: "process", name: "Billing & Invoicing Process Pack", price: 49, tag: null,
    format: "PDF guide (46 pages) + Excel workbook (5 sheets)",
    desc: "Eliminate invoice errors before they hit the customer. Covers the full billing lifecycle: generation, validation, multi-channel delivery, e-invoicing compliance, and revenue recognition alignment (ASC 606 / IFRS 15).",
    includes: [
      "SIPOC: 40+ elements mapped across 4 automation levels",
      "Swimlane diagram: Validation gates for pricing, PO match, tax, and compliance",
      "RACI matrix: Billing workflow with SOX control alignment",
      "SOP: 4-tier automation from manual (10 steps) to AI-native (16 steps)",
      "E-invoicing format map: Jurisdiction-specific output formats and delivery protocols",
    ],
    useCase: "Billing managers reducing error rates. Teams adapting to new e-invoicing mandates across EU and LATAM.",
  },

  // ── Compliance & Risk ──
  {
    id: "einvoicing", category: "compliance", name: "E-Invoicing Compliance Tracker", price: 39, tag: "Updated 2026",
    format: "Excel workbook (6 sheets: Regulatory matrix, Timeline, Readiness, Penalties, Roadmap, Sources)",
    desc: "Stay ahead of 25+ e-invoicing mandates across EU, LATAM, APAC, and MEA. One workbook tracks every jurisdiction: live status, platform, format, go-live dates, penalties, and technical readiness checklist. Updated for 2026 mandates including Belgium Peppol, Portugal ARe, Poland KSeF.",
    includes: [
      "25-jurisdiction regulatory matrix: Status, model, platform, format, go-live date, penalties",
      "Mandate timeline Gantt: Visual roadmap from 2024 through 2028",
      "Technical readiness checklist: 20-point assessment per jurisdiction tier",
      "Penalty exposure calculator: Estimate non-compliance cost by jurisdiction",
      "Implementation roadmap: Phased approach for SME through Global MNC tiers",
    ],
    useCase: "Compliance managers tracking 10+ jurisdictions. SAP teams needing a single source of truth for e-invoicing requirements.",
  },
  {
    id: "sox", category: "compliance", name: "SOX Compliance Controls Library", price: 39, tag: null,
    format: "Excel workbook (5 sheets: Control matrix, Test scripts, Evidence, Risk rating, Scoping)",
    desc: "32 SOX key controls mapped to every OtC sub-process. Each control includes type (manual/automated/ITGC), nature (preventive/detective), frequency, financial assertion, control owner, test procedure script, and evidence requirements. Ready for auditor review.",
    includes: [
      "32-control matrix: OTC-01 to OTC-32 across billing, cash app, collections, credit, deductions, reporting",
      "Control type mapping: Manual, automated (ITGC), and semi-automated by process",
      "Test procedure scripts: Step-by-step testing instructions per control",
      "Evidence requirements checklist: What to retain and for how long",
      "Risk rating and scoping: Materiality thresholds, entity scope, and reliance strategy",
    ],
    useCase: "Internal audit teams building OtC test plans. Controllers preparing for year-end SOX certification. BPO transition teams designing control handover.",
  },

  // ── Strategy & Assessment ──
  {
    id: "maturity", category: "strategy", name: "AR Maturity Assessment v2", price: 49, tag: "Popular",
    format: "Excel workbook (8 sheets: 6 domain assessments + Scoring + Roadmap)",
    desc: "Benchmark your AR operations against APQC and Hackett world-class standards. A 180-criteria assessment across 6 domains and 6 dimensions, auto-scored to produce a 5-level maturity rating with gap analysis and a prioritized 90-day improvement roadmap.",
    includes: [
      "6-domain assessment: Credit, Collections, Cash App, Disputes, Billing, Reporting — 30 questions per domain",
      "5-level maturity definitions: Reactive (L1) through Autonomous (L5) with detailed anchors",
      "Benchmark comparison: Your score vs. median, top quartile, and world-class by company tier",
      "Gap analysis: Priority-weighted scoring with automated 'fix first' recommendations",
      "90-day improvement roadmap: Action items by domain with effort/impact ratings",
    ],
    useCase: "GPO leads needing an objective baseline. Finance directors building a transformation business case.",
  },
  {
    id: "business-case", category: "strategy", name: "OtC Business Case Builder", price: 49, tag: null,
    format: "Excel workbook (6 sheets: Levers, Investment, Cash flow, Sensitivity, Summary, Data)",
    desc: "Quantify the ROI of your AR transformation. Five benefit levers (DSO reduction, FTE productivity, deduction recovery, early payment capture, e-invoicing savings) feed a 3-year cash flow model with sensitivity analysis. Used by GPO teams to secure funding.",
    includes: [
      "5 benefit lever calculators: Pre-built formulas for each value driver with tier benchmarks",
      "Investment category model: Technology, implementation, people, consulting, and ongoing costs",
      "3-year cash flow projection: Monthly granularity with NPV, IRR, and payback period",
      "Sensitivity analysis: 3 scenarios (conservative, base, optimistic) with tornado chart data",
      "Executive summary template: One-page pitch deck with key metrics and recommendation",
    ],
    useCase: "AR leaders building investment proposals. GPO teams justifying headcount or technology spend.",
  },
  {
    id: "kpi-spec", category: "strategy", name: "KPI Dashboard Blueprint", price: 39, tag: null,
    format: "Excel workbook (43-tab KPI library) + PDF (dashboard wireframes)",
    desc: "The definitive AR KPI reference. 43 metrics (K001–K084) across 9 categories, each with documented formula, APQC benchmark quartiles, reporting tier, and data source mapping. The same specification used by GPO teams to align enterprise-wide reporting.",
    includes: [
      "43 KPI definitions: Every metric with ID, name, category, phase, tier assignment",
      "Formula dictionary: Computation logic with data source mapping for each KPI",
      "APQC benchmark quartiles: Top quartile, median, and bottom quartile values",
      "Tier assignment: T1 (Executive) through T4 (Diagnostic) with reporting cadence",
      "Dashboard wireframe templates: Visual layouts for each tier's reporting view",
    ],
    useCase: "BI developers building AR dashboards. GPO leads standardizing KPI definitions across business units.",
  },

  // ── Specialty Guides ──
  {
    id: "ssc-guide", category: "guides", name: "SSC Transition Guide", price: 39, tag: null,
    format: "PDF guide (56 pages) + Excel workbook (4 sheets: Governance, KPI, Risk, Change)",
    desc: "A phase-gated playbook for moving AR from retained to shared services. Governance model defining 20+ roles, 12-metric KPI scorecard, risk register with mitigation, and a change management toolkit. Based on SSON and Hackett best practices for SSC design.",
    includes: [
      "4-phase transition roadmap: Assess → Design → Migrate → Optimize with phase-gate criteria",
      "Governance model: 20+ roles across steering committee, operating committee, and working groups",
      "KPI scorecard: 12 transition metrics with baseline and target definitions",
      "Risk register: 18 identified risks with likelihood, impact, and mitigation strategy",
      "Change management toolkit: Communication plan, stakeholder mapping, training framework",
    ],
    useCase: "SSC program managers in month 1 of setup. Finance directors evaluating build-vs-buy for shared services.",
  },
  {
    id: "tech-guide", category: "guides", name: "Technology Selection Guide", price: 39, tag: null,
    format: "Excel workbook (5 sheets: Criteria, RFP, Scoring, Landscape, Cost model)",
    desc: "Evaluate 20+ AR automation vendors against 45 weighted criteria. Includes a ready-to-send RFP template, vendor scoring dashboard, market landscape with tier rankings, and a total cost of ownership model. Cuts vendor selection time from 4 months to 6 weeks.",
    includes: [
      "45-criteria evaluation matrix: Weighted scoring across functionality, integration, compliance, service, commercial",
      "RFP template: 60+ questions organized by domain with evaluation guidance",
      "Vendor scoring dashboard: Visual comparison with radar charts and weighted totals",
      "Market landscape: 20+ vendors ranked by tier (Leader, Strong, Niche) with key strengths",
      "Implementation cost model: TCO projection over 3 and 5 years including hidden costs",
    ],
    useCase: "AR teams evaluating their first automation platform. GPO leads running a competitive vendor selection.",
  },
  {
    id: "onboarding", category: "guides", name: "Customer Onboarding Playbook", price: 29, tag: null,
    format: "PDF guide (32 pages) + Excel workbook (3 sheets: Checklist, Matrix, Tracker)",
    desc: "Onboard customers in 8 steps with zero rework. Credit setup, master data validation, portal activation, KYC compliance — every step documented with inputs, outputs, owners, and SLA targets. Reduces onboarding cycle from weeks to days.",
    includes: [
      "Onboarding SOP: 8 sequential steps from application receipt to account activation",
      "Credit setup checklist: Documentation requirements and verification gates",
      "Master data validation matrix: 24-field quality check with pass/fail criteria",
      "Portal activation workflow: Customer portal setup, training, and go-live confirmation",
      "KYC compliance tracker: Tiered due diligence requirements with document retention schedule",
    ],
    useCase: "Customer onboarding teams standardizing across regions. Credit analysts wanting a consistent new-account process.",
  },
  {
    id: "treasury", category: "guides", name: "Treasury & Working Capital Guide", price: 39, tag: null,
    format: "Excel workbook (5 sheets: Diagnostic, Forecast, DSO, SCF, Discount)",
    desc: "Unlock working capital trapped in AR. A practical playbook combining cash forecasting (13-week rolling model), DSO decomposition by customer segment, SCF program evaluation, and early payment discount optimization. Directly connects AR operations to cash outcomes.",
    includes: [
      "Working capital diagnostic: 20-question assessment with prioritized opportunity areas",
      "Cash forecasting model: 13-week rolling forecast with actuals comparison and accuracy tracking",
      "DSO decomposition framework: By customer segment, region, and product line",
      "SCF program evaluation checklist: Readiness, provider selection, and implementation plan",
      "Early payment discount optimizer: Cost-benefit analysis for 1%/10 net 30 vs. alternatives",
    ],
    useCase: "Treasury analysts building cash forecasts from AR data. CFOs wanting to quantify working capital opportunity.",
  },
  {
    id: "bpo-guide", category: "guides", name: "BPO Managed Services Framework", price: 39, tag: null,
    format: "PDF guide (48 pages) + Excel workbook (4 sheets: Vendors, Pricing, SLA, Org)",
    desc: "Evaluate, select, and govern AR BPO providers with confidence. Compares 7 major providers across capability, geography, and scale. Four pricing models explained with pros and cons. Includes a 17-metric SLA framework and retained org design for 6 roles.",
    includes: [
      "7-provider capability comparison: Accenture, Genpact, WNS, Infosys, TCS, EXL, Quatrro mapped by OtC strength",
      "4 pricing models: FTE-based, transaction-based, outcome-based, hybrid — with when-to-use guidance",
      "Transition governance charter: Roles, responsibilities, decision rights, and escalation paths",
      "17-metric SLA framework: Service levels with measurement methodology and penalty regimes",
      "Retained org design: 6 roles, 4 FTEs with job descriptions and competency profiles",
    ],
    useCase: "BPO evaluators comparing providers. AR leaders designing retained organizations after BPO transition.",
  },
]

const PROCESS_IDS = ["cash-app", "dispute-res", "credit-mgmt", "collections", "billing"]
const COMPLIANCE_IDS = ["einvoicing", "sox"]
const STRATEGY_IDS = ["maturity", "business-case", "kpi-spec"]
const GUIDE_IDS = ["ssc-guide", "tech-guide", "onboarding", "treasury", "bpo-guide"]

const getProcessPrice = () => INDIVIDUAL_TEMPLATES.filter(t => PROCESS_IDS.includes(t.id)).reduce((s, t) => s + t.price, 0)
const getCompliancePrice = () => INDIVIDUAL_TEMPLATES.filter(t => COMPLIANCE_IDS.includes(t.id)).reduce((s, t) => s + t.price, 0)
const getStrategyPrice = () => INDIVIDUAL_TEMPLATES.filter(t => STRATEGY_IDS.includes(t.id)).reduce((s, t) => s + t.price, 0)
const getGuidePrice = () => INDIVIDUAL_TEMPLATES.filter(t => GUIDE_IDS.includes(t.id)).reduce((s, t) => s + t.price, 0)
const getAllPrice = () => INDIVIDUAL_TEMPLATES.reduce((s, t) => s + t.price, 0)

const BUNDLES = [
  {
    id: "bundle-full", category: "bundles", name: "Full OtC Toolkit", price: 349, tag: "Best Value",
    format: "All 15 products — PDF guides + Excel workbooks (email delivery)",
    originalPrice: getAllPrice,
    desc: "Everything. All 5 process packs, both compliance tools, all 3 strategy assets, and all 5 specialty guides. The same toolset a Big4 engagement team would deploy, at 5% of the consulting cost.",
    includes: [
      "5 Process Packs (Cash App, Disputes, Credit, Collections, Billing)",
      "2 Compliance Tools (E-Invoicing Tracker, SOX Controls Library)",
      "3 Strategy Assets (Maturity Assessment, Business Case Builder, KPI Blueprint)",
      "5 Specialty Guides (SSC Transition, Tech Selection, Onboarding, Treasury, BPO)",
      "All future updates for 12 months",
    ],
    useCase: "GPO leads building a full AR toolkit from scratch. Firms wanting to standardize across multiple clients or entities.",
  },
  {
    id: "bundle-process", category: "bundles", name: "Process Excellence Bundle", price: 169, tag: "Save 31%",
    format: "5 PDF guides + 5 Excel workbooks (email delivery)",
    originalPrice: getProcessPrice,
    desc: "All 5 process packs in one bundle: Cash Application, Dispute Resolution, Credit Management, Collections Strategy, and Billing & Invoicing. The operational core of any AR department.",
    includes: ["Cash Application Process Pack", "Dispute Resolution Process Pack", "Credit Management Process Pack", "Collections Strategy & Segmentation Model", "Billing & Invoicing Process Pack"],
    useCase: "AR Directors building out their full process documentation. SSC leads standardizing operations.",
  },
  {
    id: "bundle-compliance", category: "bundles", name: "Compliance Bundle", price: 59, tag: "Save 24%",
    format: "2 Excel workbooks (email delivery)",
    originalPrice: getCompliancePrice,
    desc: "E-invoicing compliance tracker + SOX controls library. The two regulatory essentials every AR team needs, especially when operating across EU mandates or under SOX Section 404.",
    includes: ["E-Invoicing Compliance Tracker (25 jurisdictions)", "SOX Compliance Controls Library (32 controls)"],
    useCase: "Compliance managers tracking multiple e-invoicing mandates. Internal audit teams building SOX test plans.",
  },
  {
    id: "bundle-strategy", category: "bundles", name: "Strategy Bundle", price: 99, tag: "Save 28%",
    format: "3 Excel workbooks + 1 PDF (email delivery)",
    originalPrice: getStrategyPrice,
    desc: "Maturity assessment + business case builder + KPI dashboard blueprint. The strategic trio for planning, quantifying, and measuring your AR transformation.",
    includes: ["AR Maturity Assessment v2 (180 criteria)", "OtC Business Case Builder (5 levers, 3-year cash flow)", "KPI Dashboard Blueprint (43 KPI definitions)"],
    useCase: "GPO leads building a transformation roadmap. Finance directors needing an objective baseline and quantified business case.",
  },
  {
    id: "bundle-ssc", category: "bundles", name: "SSC Launch Bundle", price: 129, tag: "Save 34%",
    format: "3 PDF guides + 3 Excel workbooks (email delivery)",
    originalPrice: () => GUIDE_IDS.reduce((s, id) => s + (INDIVIDUAL_TEMPLATES.find(t => t.id === id)?.price || 0), 0) + 39, // including KPI
    desc: "Five essential guides for standing up a shared service center: transition playbook, tech selection, customer onboarding, BPO evaluation, and KPI blueprint. The complete SSC starter kit.",
    includes: ["SSC Transition Guide", "Technology Selection Guide", "Customer Onboarding Playbook", "BPO Managed Services Framework", "KPI Dashboard Blueprint"],
    useCase: "Program managers in the first 90 days of an SSC setup. Finance directors evaluating shared services for the first time.",
  },
]

const CART_KEY = "clearlogger_cart"

function getPrice(item) {
  const p = item.price
  if (typeof item.originalPrice === "function") return { price: p, orig: item.originalPrice() }
  if (typeof item.originalPrice === "number") return { price: p, orig: item.originalPrice }
  return { price: p, orig: null }
}

export default function Shop({ onNavigate }) {
  const [category, setCategory] = useState("all")
  const [selected, setSelected] = useState(null)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
  })
  const [showCart, setShowCart] = useState(false)
  const [email, setEmail] = useState("")
  const [checkoutSent, setCheckoutSent] = useState(false)

  const allItems = useMemo(() => [...INDIVIDUAL_TEMPLATES, ...BUNDLES], [])

  const filtered = useMemo(() => {
    if (category === "all") return allItems
    return allItems.filter(t => t.category === category)
  }, [category, allItems])

  const cartItems = useMemo(() => cart.map(id => allItems.find(x => x.id === id)).filter(Boolean), [cart, allItems])
  const cartTotal = useMemo(() => cartItems.reduce((s, t) => s + getPrice(t).price, 0), [cartItems])

  const toggleCart = (id) => {
    setCart(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleCheckout = () => {
    if (!email || cart.length === 0) return
    setCheckoutSent(true)
    setCart([])
    localStorage.removeItem(CART_KEY)
  }

  const resetAll = () => {
    setCheckoutSent(false)
    setShowCart(false)
    setEmail("")
  }

  const s = {
    page: { background: T.bg, minHeight: "100vh", fontFamily: T.font, color: T.t1 },
    wrap: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" },
    h1: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" },
    sub: { fontSize: 13, color: T.t2, marginTop: 4 },
    tab: (active, overrides) => ({ padding: "8px 18px", borderRadius: 8, border: `1px solid ${active ? T.gold : T.border}`, background: active ? T.goldDim : T.surface, color: active ? T.gold : T.t2, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", ...overrides }),
    card: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" },
    badge: (c, bg) => ({ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: bg, color: c, textTransform: "uppercase", letterSpacing: "0.05em" }),
  }

  const m = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
    tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
    modal: { position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" },
    modalInner: { background: T.s2, border: `1px solid ${T.border}`, borderRadius: 16, maxWidth: 600, width: "90%", maxHeight: "85vh", overflow: "auto", padding: 32 },
  }

  const tagStyle = (tag) => {
    if (!tag) return null
    if (tag.includes("Bestseller") || tag.includes("Best")) return { c: T.gold, bg: T.goldDim }
    if (tag.includes("Popular")) return { c: T.purple, bg: T.purpleDim }
    if (tag.includes("Save")) return { c: T.green, bg: T.greenDim }
    if (tag.includes("Updated")) return { c: T.blue, bg: T.blueDim }
    return { c: T.blue, bg: T.blueDim }
  }

  const renderCart = () => (
    <div style={m.modal} onClick={() => setShowCart(false)}>
      <div onClick={e => e.stopPropagation()} style={{ ...m.modalInner, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Cart ({cartItems.length} items)</div>
          <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", color: T.t3, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.t3, fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
            Your cart is empty
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {cartItems.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: T.s3, borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.t1 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: T.t3 }}>{t.category === "bundles" ? "Bundle" : "Template"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>€{getPrice(t).price}</span>
                  <button onClick={() => toggleCart(t.id)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.red, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <div style={{ padding: "14px 0", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              <span>Total</span><span style={{ color: T.gold }}>€{cartTotal}</span>
            </div>
            {checkoutSent ? (
              <div style={{ padding: "14px", background: T.greenDim, borderRadius: 8, border: `1px solid ${T.green}40`, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>✓ Order received!</div>
                <div style={{ fontSize: 12, color: T.t2, marginTop: 4 }}>We'll send invoice + download links to <strong>{email}</strong> within 24 hours.</div>
                <button onClick={resetAll} style={{ marginTop: 10, background: "none", border: `1px solid ${T.border}`, color: T.t2, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11 }}>Continue browsing →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder="Your work email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.s3, color: T.t1, fontSize: 13, outline: "none" }} />
                <button onClick={handleCheckout} disabled={!email}
                  style={{ padding: "12px", borderRadius: 10, border: "none", background: email ? T.gold : T.t3, color: email ? "#000" : T.t2, fontSize: 14, fontWeight: 700, cursor: email ? "pointer" : "not-allowed" }}>
                  Complete Order — €{cartTotal}
                </button>
                <div style={{ fontSize: 10, color: T.t3, textAlign: "center" }}>We'll send you an invoice. Templates delivered by email within 24 hours of payment. VAT may apply.</div>
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: 12, padding: "10px 14px", background: `${T.purple}08`, borderRadius: 8, border: `1px solid ${T.purple}20`, fontSize: 11, color: T.t2, lineHeight: 1.5 }}>
          <strong style={{ color: T.purple }}>Buying for your team?</strong> Enterprise licenses include full commercial rights, multi-user access, and customization allowance. <a style={{ color: T.gold, textDecoration: "underline", cursor: "pointer" }} onClick={() => onNavigate?.('advisory')}>Contact us →</a>
        </div>
      </div>
    </div>
  )

  const renderDetail = (item) => {
    const { price, orig } = getPrice(item)
    const tag = tagStyle(item.tag)
    return (
      <div style={m.modal} onClick={() => setSelected(null)}>
        <div onClick={e => e.stopPropagation()} style={m.modalInner}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.t3, textTransform: "uppercase" }}>
                  {item.category === "bundles" ? "Bundle" : item.category === "process" ? "Process Pack" : item.category === "compliance" ? "Compliance Tool" : item.category === "strategy" ? "Strategy Asset" : "Guide"}
                </span>
                {item.tag && tag && <span style={s.badge(tag.c, tag.bg)}>{item.tag}</span>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.t1 }}>{item.name}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: T.t3, fontSize: 22, cursor: "pointer", padding: 4 }}>✕</button>
          </div>
          <p style={{ color: T.t2, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{item.desc}</p>

          <div style={{ background: T.s3, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 8 }}>What's Included</div>
            {item.includes.map((inc, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 12, color: T.t2 }}>
                <span style={{ color: T.green, flexShrink: 0 }}>✓</span> <span>{inc}</span>
              </div>
            ))}
          </div>

          <div style={{ background: `${T.blue}08`, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 12, color: T.t2, lineHeight: 1.6 }}>
            <strong style={{ color: T.blue }}>Who this is for:</strong> {item.useCase}
          </div>

          <div style={{ background: `${T.gold}06`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: T.t2, marginBottom: 12 }}>
            <strong style={{ color: T.t1 }}>Format:</strong> {item.format}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: T.gold }}>€{price}</span>
              {orig !== null && <span style={{ fontSize: 14, color: T.t3, textDecoration: "line-through" }}>€{orig}</span>}
            </div>
          </div>

          <button onClick={() => { toggleCart(item.id); setSelected(null) }}
            style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 10, border: "none", background: T.gold, color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {cart.includes(item.id) ? "Remove from Cart" : "Add to Cart — €" + price}
          </button>

          <div style={{ marginTop: 12, padding: "10px 14px", background: `${T.blue}10`, borderRadius: 8, border: `1px solid ${T.blue}25`, fontSize: 11, color: T.t2, lineHeight: 1.5 }}>
            <strong style={{ color: T.blue }}>Need it customized?</strong> Every template can be tailored to your specific processes, systems, and industry. <a style={{ color: T.gold, textDecoration: "underline", cursor: "pointer" }} onClick={() => onNavigate?.('advisory')}>Book a consulting engagement →</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={m.header}>
          <div>
            <div style={s.h1}>Template Marketplace</div>
            <div style={s.sub}>Standalone AR process assets — deploy Big4-grade IP at 5% of the consulting cost. All APQC PCF v8.0 aligned.</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setShowCart(true)} style={s.tab(false, { position: "relative" })}>
              Cart ({cartItems.length})
            </button>
            <button onClick={() => onNavigate?.('advisory')} style={s.tab(false, { borderColor: T.blue })}>
              Need Help? → Consulting
            </button>
          </div>
        </div>

        <div style={m.tabs}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={s.tab(category === c.id)}>
              {c.icon && <span style={{ marginRight: 6 }}>{c.icon}</span>}{c.label}
            </button>
          ))}
        </div>

        <div style={m.grid}>
          {filtered.map(item => {
            const inCart = cart.includes(item.id)
            const { price, orig } = getPrice(item)
            const tag = tagStyle(item.tag)
            const isBundle = item.category === "bundles"
            return (
              <div key={item.id} style={{ ...s.card, borderColor: inCart ? T.gold : T.border, position: "relative", display: "flex", flexDirection: "column" }}
                onClick={() => setSelected(item)} onMouseEnter={e => e.currentTarget.style.borderColor = T.borderH}
                onMouseLeave={e => e.currentTarget.style.borderColor = inCart ? T.gold : T.border}>
                {item.tag && tag && <span style={{ ...s.badge(tag.c, tag.bg), position: "absolute", top: 12, right: 12 }}>{item.tag}</span>}
                <div style={{ fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: T.mono }}>
                  {isBundle ? "Bundle" : item.category === "process" ? "Process Pack" : item.category === "compliance" ? "Compliance" : item.category === "strategy" ? "Strategy" : "Guide"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.t1, marginBottom: 6, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.desc}</div>
                <div style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, marginBottom: 12 }}>{item.format.length > 50 ? item.format.slice(0, 50) + "…" : item.format}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: T.gold }}>€{price}</span>
                    {orig !== null && <span style={{ fontSize: 12, color: T.t3, textDecoration: "line-through", marginLeft: 6 }}>€{orig}</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleCart(item.id) }}
                    style={s.tab(inCart, { fontSize: 11, padding: "6px 14px" })}>
                    {inCart ? "Remove" : "Add to Cart"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enterprise upsell */}
        <div style={{ marginTop: 24, background: T.surface, border: `1px solid ${T.gold}30`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.gold }}>Templates Pro — €499/year</div>
              <div style={{ fontSize: 12, color: T.t2, marginTop: 4, maxWidth: 500 }}>
                All 15 templates + every future release. Updates included for 12 months. Single-user license. Cancel anytime.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setSelected(BUNDLES[0])}
                style={s.tab(true, { borderColor: T.gold, background: T.goldDim, color: T.gold })}>Full Toolkit €349</button>
              <button onClick={() => onNavigate?.('advisory')} style={s.tab(false, { borderColor: T.gold, color: T.gold, background: `${T.gold}15` })}>Enterprise €1,999 →</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${T.border}20`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 11, color: T.t3 }}>ClearLedger Template Marketplace · APQC PCF v8.0 · All prices EUR excl. VAT</div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 11, color: T.t3 }}>Delivery: Email (24h)</span>
            <span style={{ fontSize: 11, color: T.t3 }}>License: Per-user / Enterprise</span>
            <span style={{ fontSize: 11, color: T.t3 }}>Updates: 12 months included</span>
          </div>
        </div>
      </div>

      {selected && renderDetail(selected)}
      {showCart && renderCart()}
    </div>
  )
}
