import { useState, useMemo, useCallback } from "react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from "recharts";

// ═══════════════════════════════════════════════
// MATURITY MODEL v2 — 5-LEVEL × 6-DIMENSION × 6-DOMAIN
// ═══════════════════════════════════════════════

const LEVELS = [
  { level: 1, name: "Reactive", color: "#e85454", bg: "#e8545412", desc: "No standard process. Person-dependent. No metrics." },
  { level: 2, name: "Defined", color: "#e89240", bg: "#e8924012", desc: "Documented but inconsistent. Manual. Basic tracking." },
  { level: 3, name: "Standardized", color: "#d4a345", bg: "#d4a34512", desc: "Global standard. KPIs tracked. Partial automation." },
  { level: 4, name: "Optimized", color: "#4a9be8", bg: "#4a9be812", desc: "Data-driven. Advanced automation. Continuous improvement." },
  { level: 5, name: "Autonomous", color: "#38b573", bg: "#38b57312", desc: "AI-native. Self-healing. Real-time. World-class." },
];

const DIMS = [
  { id: "process", name: "Process", icon: "⚙️", short: "PROC" },
  { id: "technology", name: "Technology", icon: "💻", short: "TECH" },
  { id: "data", name: "Data & Analytics", icon: "📊", short: "DATA" },
  { id: "people", name: "People & Skills", icon: "👥", short: "PPL" },
  { id: "governance", name: "Governance", icon: "📋", short: "GOV" },
  { id: "cx", name: "Customer Exp.", icon: "🤝", short: "CX" },
];

const COMPANY_TIERS = [
  { id: "sme", label: "SME (<$500M)", target: 3.0, context: "Level 3 is strong for SME. Focus on standardization before automation." },
  { id: "mid", label: "Mid-Market ($500M–$2B)", target: 3.5, context: "Target Level 3-4. Invest in selective automation for highest-ROI areas." },
  { id: "enterprise", label: "Enterprise ($2B–$10B)", target: 4.0, context: "Level 4 is the expectation. Below 3 on any domain is a red flag." },
  { id: "global", label: "Global Multinational ($10B+)", target: 4.5, context: "World-class target. Autonomous AR should be on the 18-month roadmap." },
];

const DOMAINS = [
  {
    id: "credit", name: "Credit Management", icon: "🛡️", code: "OtC-3.1", accent: "#4a9be8",
    benchmarks: { median: 2.6, topQ: 3.4, wc: 4.3 },
    dims: {
      process: [
        "No credit policy. Ad hoc approvals by Sales. No documentation.",
        "Basic credit policy exists. Manual limit-setting with simple rules. Inconsistent enforcement.",
        "Standardized global credit policy. Scoring model with periodic reviews. DoA matrix enforced.",
        "Risk-adjusted dynamic scoring. Automated credit checks integrated in order flow. ECL-compliant.",
        "AI-driven continuous monitoring. Predictive default models. Auto-adjusting limits in real-time."
      ],
      technology: [
        "Spreadsheets only. No system integration. Manual D&B lookups.",
        "ERP credit master maintained. Basic block/release workflow.",
        "External bureau API integration (D&B, Experian). ERP-native credit checks on orders.",
        "Dedicated credit platform (Highradius, Billtrust). Automated scoring engine with ML.",
        "Real-time external data feeds (news, financials, market signals). Autonomous decisioning."
      ],
      data: [
        "No credit data tracked. Exposure unknown. No reporting.",
        "AR aging used as proxy for risk. Manual exposure reports in Excel.",
        "Credit exposure dashboard. Utilization tracking. Periodic reporting to credit committee.",
        "Predictive default probability models. Portfolio risk segmentation. Scenario analysis.",
        "Real-time credit risk heatmaps. ECL model integration. Forward-looking macroeconomic inputs."
      ],
      people: [
        "No dedicated credit function. Sales approves own credit.",
        "1-2 credit analysts. Limited training. Reactive posture only.",
        "Dedicated credit team with defined roles. Credit committee meets regularly.",
        "Specialized credit risk analysts. Continuous training. Cross-functional alignment with Sales.",
        "Credit center of excellence. Data science capabilities. Strategic advisory to the business."
      ],
      governance: [
        "No credit policy document. No approval matrix. No audit trail.",
        "Basic policy exists. Approval limits defined but inconsistently enforced.",
        "Formal policy with DoA matrix. SOX controls documented. Periodic internal audits.",
        "Risk appetite framework linked to credit policy. IFRS 9/CECL compliant provisioning.",
        "Integrated risk governance. Real-time compliance monitoring. Board-level risk reporting."
      ],
      cx: [
        "Customers experience unpredictable credit decisions. No transparency on terms.",
        "Basic communication of credit terms at onboarding. Manual, slow process.",
        "Structured onboarding with clear timelines. Standard terms communicated proactively.",
        "Self-service credit application portal. Real-time application status visibility.",
        "Frictionless onboarding. Instant credit decisions. Dynamic terms by customer segment."
      ],
    },
  },
  {
    id: "billing", name: "Billing & Invoicing", icon: "📄", code: "OtC-3.3", accent: "#8b6ce0",
    benchmarks: { median: 2.4, topQ: 3.2, wc: 4.2 },
    dims: {
      process: [
        "Manual invoice creation in Word/Excel. High error rates. No templates.",
        "ERP-based billing. Some templates standardized. Manual adjustments frequent.",
        "Automated billing from delivery/milestone triggers. Standard templates. Credit memo workflow.",
        "Rules-based billing engine. Auto-adjustments. IFRS 15/ASC 606 revenue recognition automated.",
        "Autonomous billing. Self-correcting errors pre-delivery. Zero-touch invoice lifecycle."
      ],
      technology: [
        "Manual creation. Email-only delivery. No output management.",
        "ERP billing module. PDF generation. Basic email distribution.",
        "E-invoicing for key markets (Peppol, CFDI). Multi-channel delivery. AP portal integration.",
        "Dedicated billing platform. Full e-invoicing compliance. Embedded payment links.",
        "AI-powered generation. Universal e-invoicing. Auto-format per jurisdiction. Self-validating."
      ],
      data: [
        "No billing metrics tracked. Invoice accuracy and error rates unknown.",
        "Basic invoice volume reporting. Manual error tracking in spreadsheets.",
        "Invoice accuracy rate, e-invoicing adoption rate, and billing cycle time tracked.",
        "Revenue leakage detection. Rejection root-cause analytics. Billing efficiency dashboard.",
        "Real-time billing performance. Predictive error prevention. Auto-reconciliation to GL."
      ],
      people: [
        "Billing handled by multiple functions with no clear ownership.",
        "Billing team exists but lacks e-invoicing and tax compliance expertise.",
        "Trained billing team. E-invoicing specialists assigned for key mandate markets.",
        "Cross-trained team covering all formats and jurisdictions. Tax-aware billing analysts.",
        "Billing center of excellence. Regulatory change specialists. Continuous upskilling program."
      ],
      governance: [
        "No billing standards. Inconsistent formats across entities. No compliance tracking.",
        "Basic billing procedures documented. Some templates version-controlled.",
        "Global billing standards enforced. E-invoicing compliance tracked per country. Audit trail.",
        "Automated compliance validation pre-delivery. ViDA/Peppol/CFDI governance integrated.",
        "Real-time regulatory compliance. Auto-adaptation to mandate changes. Zero compliance gaps."
      ],
      cx: [
        "Customers receive inconsistent, error-prone invoices. High dispute volume from billing errors.",
        "Standard invoice format established. Basic delivery channel preferences captured.",
        "Customer-preferred delivery channels active. Self-service invoice portal available.",
        "Personalized billing experience. Multi-format delivery. Real-time dispute submission.",
        "Frictionless invoicing. Embedded payment links. AI pre-validates invoices against PO/contract."
      ],
    },
  },
  {
    id: "cashapp", name: "Cash Application", icon: "💰", code: "OtC-3.4", accent: "#1d9e75",
    benchmarks: { median: 2.3, topQ: 3.3, wc: 4.4 },
    dims: {
      process: [
        "Fully manual matching. Spreadsheet-based tracking. High unapplied cash balances.",
        "Basic ERP auto-match on amount + invoice number. Many exceptions queued manually.",
        "Rule-based matching engine. Multi-criteria matching. Exception workflows with SLAs.",
        "ML-enhanced matching at 80%+ auto-match. Intelligent exception routing by complexity.",
        "Autonomous cash application. 95%+ straight-through processing. Self-learning algorithms."
      ],
      technology: [
        "Manual bank statement review. No electronic bank feeds. Paper lockbox only.",
        "Electronic bank statements (MT940/BAI2). Basic ERP matching rules.",
        "Lockbox integration. Multi-format remittance parsing. OCR for paper remittance advice.",
        "Dedicated cash app platform (Highradius, Billtrust). ML matching. Auto-remittance reading.",
        "AI-native cash application. Real-time payment rails integration. Autonomous reconciliation."
      ],
      data: [
        "No cash application metrics tracked. Unapplied cash balance and aging unknown.",
        "Basic match rate tracked manually. Unapplied cash aging maintained in spreadsheets.",
        "First-pass match rate dashboard. Exception categorization by type. Aging tracked to SLA.",
        "Match rate by channel, customer, and payment method. Root-cause analytics on exceptions.",
        "Real-time STP metrics. Predictive unapplied cash forecasting. Auto-root-cause analysis."
      ],
      people: [
        "Cash application done by whoever is available. No specialization or training.",
        "Dedicated cash app analysts with basic skills. Manual investigation methods.",
        "Structured team with bank format expertise. Defined exception handling procedures.",
        "Analysts focused on exceptions only. Automation tuning and algorithm governance skills.",
        "Minimal human involvement. Team focuses on edge cases and continuous algorithm improvement."
      ],
      governance: [
        "No tolerance policies. No write-off thresholds defined. No SLAs for posting.",
        "Basic tolerance thresholds established. Manual write-off approvals. Informal SLAs.",
        "Defined SLAs for unapplied cash aging (e.g., <5 days). Tolerance matrix. Approval workflow.",
        "SLA performance tracked and reported. Auto-escalation on breaches. Root-cause governance.",
        "Self-governing with exception-based human oversight. Continuous optimization cadence."
      ],
      cx: [
        "Customers see misapplied payments. Incorrect dunning notices sent. Disputes arise from errors.",
        "Payments applied within 2-3 business days. Occasional misapplication complaints.",
        "Same-day application for electronic payments. Customer notified on payment receipt.",
        "Real-time application with confirmation. Self-service payment allocation portal.",
        "Instant application and confirmation. Customer portal shows real-time balance. Zero misapplication."
      ],
    },
  },
  {
    id: "collections", name: "Collections", icon: "📞", code: "OtC-3.5a", accent: "#ba7517",
    benchmarks: { median: 2.5, topQ: 3.3, wc: 4.2 },
    dims: {
      process: [
        "No structured process. Random follow-ups. No customer prioritization or segmentation.",
        "Basic aging-based follow-up. Dunning letters sent manually. One-size-fits-all approach.",
        "Segmented collection strategies by risk/value. Automated dunning cadence. Promise-to-pay tracking.",
        "Risk-scored prioritization with ML models. Predictive aging. Multi-channel orchestration.",
        "AI-driven autonomous collections. Self-optimizing strategies. Predictive pre-delinquency intervention."
      ],
      technology: [
        "Phone and email only. Tracking in personal spreadsheets or sticky notes.",
        "ERP dunning program configured. Basic correspondence templates available.",
        "Collections worklist in ERP or add-on tool. Email templates. Activity logging system.",
        "Dedicated collections platform with AI prioritization. Automated multi-channel correspondence.",
        "Agentic collections engine. Autonomous outreach. Real-time strategy adjustment per customer."
      ],
      data: [
        "No collections performance metrics. Effectiveness of outreach unknown.",
        "AR aging report is the primary tool. Activity tracking is manual and incomplete.",
        "CEI, DSO, and collector productivity tracked. Collections activity dashboard available.",
        "Predictive DSO forecasting. Customer payment behavior ML models. Collector performance analytics.",
        "Real-time collection probability scoring. Cash flow impact simulation by intervention type."
      ],
      people: [
        "No dedicated collectors. AR staff handles collections when time permits.",
        "Dedicated collectors but with basic skills only. High manual effort, low strategic focus.",
        "Specialized team with portfolio assignments. Regular training program. Defined career path.",
        "Skilled negotiators with analytics literacy. Cross-functional collaboration with Sales.",
        "Strategic advisors focused on exceptions only. AI-augmented decision support for every interaction."
      ],
      governance: [
        "No collection policy. No escalation paths defined. No write-off process.",
        "Basic escalation rules based on aging thresholds. Ad hoc write-off approvals.",
        "Formal collection policy. Escalation matrix with SLA targets per aging bucket.",
        "Dynamic policy with customer segment overlays. Continuous performance governance cycle.",
        "Self-optimizing policies via reinforcement learning. Integrated with credit risk framework."
      ],
      cx: [
        "Aggressive or inconsistent dunning tone. Customers receive duplicate contacts.",
        "Standard dunning tone established. Basic contact preferences documented.",
        "Customer segment-appropriate communication style. Self-service payment options available.",
        "Personalized collections experience. Flexible payment arrangements via customer portal.",
        "Proactive engagement before overdue. AI-crafted empathetic communication. Seamless resolution."
      ],
    },
  },
  {
    id: "disputes", name: "Dispute & Deduction Mgmt", icon: "⚡", code: "OtC-3.5b", accent: "#d85a30",
    benchmarks: { median: 2.2, topQ: 3.1, wc: 4.0 },
    dims: {
      process: [
        "No formal dispute process. Issues handled in email chains. No tracking or categorization.",
        "Disputes logged in shared tracker. No reason code taxonomy. Manual routing. No SLAs.",
        "Reason code taxonomy with RACI-based routing. SLAs defined. Formal investigation workflow.",
        "Auto-routing and escalation. Root-cause Pareto analysis feeds prevention loop. Tight SLAs.",
        "AI-powered dispute prediction and auto-resolution for known patterns. Near-zero repeat disputes."
      ],
      technology: [
        "Email and personal spreadsheet tracking only. No centralized system.",
        "Basic dispute log in ERP or shared Excel file. Manual status updates.",
        "ERP dispute module (SAP UDM / Oracle). Workflow-based routing and status tracking.",
        "Dedicated dispute platform. Auto-categorization. Document matching AI for evidence.",
        "Intelligent auto-adjudication for known dispute patterns. Self-learning resolution engine."
      ],
      data: [
        "No dispute metrics. Volume, cost, and cycle time completely unknown.",
        "Dispute count and basic aging tracked. No root-cause analysis capability.",
        "Cycle time, resolution rate, and reason code distribution measured and reported.",
        "Pareto analysis automated. Cost-to-resolve calculated. Trend forecasting by reason code.",
        "Predictive dispute identification before customer raises it. Real-time elimination tracking."
      ],
      people: [
        "Disputes handled by whoever receives the complaint. No training or specialization.",
        "AR analysts handle disputes alongside other tasks. Minimal investigation skills.",
        "Dedicated dispute analysts with cross-functional relationships (Sales, Logistics, Quality).",
        "Specialized resolution team empowered to resolve within authority limits. Deep process knowledge.",
        "Dispute prevention specialists. Strategic role focused on root-cause elimination, not resolution."
      ],
      governance: [
        "No dispute policy. No authority matrix. No audit trail for resolutions.",
        "Basic resolution guidelines exist. Write-off thresholds loosely defined.",
        "Formal dispute policy with DoA matrix. Audit trail maintained. Reason code governance.",
        "Prevention-focused governance. Cross-functional accountability. Improvement loops established.",
        "Autonomous governance with exception-based human review. Zero-tolerance for systemic repeat causes."
      ],
      cx: [
        "Slow, opaque resolution. Customers have no visibility into dispute status. High frustration.",
        "Disputes acknowledged with reference number. Resolution timeline communicated but often missed.",
        "Structured intake portal with tracking. Status updates provided. SLAs met for most disputes.",
        "Self-service dispute submission and real-time tracking. Fast resolution. Feedback loop active.",
        "Proactive prevention — AI flags issues before customer notices. Near-instant resolution when raised."
      ],
    },
  },
  {
    id: "reporting", name: "Reporting & Governance", icon: "📊", code: "OtC-3.6", accent: "#7a7a7a",
    benchmarks: { median: 2.4, topQ: 3.2, wc: 4.1 },
    dims: {
      process: [
        "No standardized AR reporting. Data pulled ad hoc from ERP by whoever needs it.",
        "Monthly AR aging report produced manually. Basic DSO calculation. Inconsistent methodology.",
        "Standardized KPI suite (DSO, CEI, aging, FPM, touch rate). Monthly cadence. Benchmarked.",
        "Automated dashboards with drill-down. Variance analysis. Trend forecasting. Executive narrative.",
        "Real-time command center. Self-generating narratives. Predictive anomaly detection."
      ],
      technology: [
        "ERP standard reports only. No BI tools. Export to Excel for formatting.",
        "Excel-based reporting with manual data extraction. Basic charts and pivots.",
        "BI tool (Power BI / Tableau) with scheduled refresh. Standard AR dashboard.",
        "Integrated BI platform with automated refresh. Advanced visualizations. Mobile access.",
        "AI analytics engine with NLP query interface. Autonomous insight generation."
      ],
      data: [
        "Data quality poor. No master data governance. Frequent reconciliation failures.",
        "Basic data hygiene practices. Monthly manual reconciliation. Known data gaps documented.",
        "Data quality rules enforced in ERP. Sub-ledger to GL reconciliation automated.",
        "Data governance framework with quality scoring. Anomaly detection alerts.",
        "Trusted data foundation. Real-time quality monitoring. Self-healing data pipelines."
      ],
      people: [
        "No dedicated AR reporting capability. Finance produces ad hoc reports on request.",
        "One analyst produces monthly reports. Limited analytical depth. Reactive to requests.",
        "Reporting team with BI skills. Standardized report catalog. Proactive insight delivery.",
        "Analytics team with data science capabilities. Insight-driven recommendations to leadership.",
        "Embedded analytics in process. Minimal report production focus. Strategic insight as service."
      ],
      governance: [
        "No AR governance structure. No defined process ownership. No review cadence.",
        "AR Manager role exists. Basic oversight. Informal governance. No SLAs with stakeholders.",
        "GPO/Process Owner role defined. Governance board active. SLAs with Sales, Treasury, IT.",
        "Formal governance framework with RACI enforced. Continuous improvement program (DMAIC).",
        "Self-governing with KPI-triggered interventions. Fully integrated in enterprise governance."
      ],
      cx: [
        "No customer-facing AR visibility. Account statements only on request.",
        "Monthly statements distributed via email. Basic balance inquiry response by phone.",
        "Customer portal with balance, aging, and invoice visibility. Self-service statements.",
        "Real-time customer dashboard with payment history and document repository.",
        "Integrated CX platform. Predictive insights shared with customers. Collaborative AR relationship."
      ],
    },
  },
];

const QUICK_WINS_DB = {
  credit: [
    { maxLevel: 2, text: "Document a formal credit policy with delegation of authority matrix. The #1 audit finding — costs nothing, fixes everything downstream.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Integrate D&B or Experian API for automated credit bureau pulls. Eliminates 2-4 hours per new customer of manual research.", effort: "Medium", impact: "High" },
    { maxLevel: 3, text: "Establish quarterly credit review cadence for top 50 accounts by exposure. Most organizations review annually — quarterly catches deterioration 3x faster.", effort: "Low", impact: "Medium" },
    { maxLevel: 4, text: "Deploy predictive credit scoring model using payment history data. Start with logistic regression on your aging data — you already have everything you need.", effort: "Medium", impact: "High" },
  ],
  billing: [
    { maxLevel: 2, text: "Standardize invoice templates globally. One template per invoice type. Reduces disputes from formatting errors by 25-30%.", effort: "Low", impact: "Medium" },
    { maxLevel: 3, text: "Implement Peppol/e-invoicing for your top 20 customers by volume. Moves e-invoice adoption from <30% to 50%+ in one step.", effort: "Medium", impact: "High" },
    { maxLevel: 3, text: "Automate credit memo workflow with reason code-triggered approval routing. Reduces billing adjustment cycle time by 40-60%.", effort: "Medium", impact: "Medium" },
    { maxLevel: 4, text: "Embed IFRS 15/ASC 606 revenue recognition rules in billing engine. Eliminates manual journal entries and audit risk.", effort: "High", impact: "High" },
  ],
  cashapp: [
    { maxLevel: 2, text: "Enable electronic bank statement auto-import (MT940/BAI2/CAMT.053). Eliminates manual bank statement review entirely.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Enable multi-criteria matching in your ERP (invoice #, amount, PO, customer ref). Most organizations only match on 1-2 fields.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Implement OCR/AI remittance advice parsing for lockbox and email payments. This single step typically increases auto-match by 15-20 points.", effort: "Medium", impact: "High" },
    { maxLevel: 4, text: "Deploy ML-based cash app engine (Highradius, Billtrust, Esker). Target: 65% to 85%+ first-pass match in 90 days.", effort: "High", impact: "High" },
  ],
  collections: [
    { maxLevel: 2, text: "Implement customer segmentation (risk × value matrix). Stop treating all overdue accounts identically — this is the #1 collections mistake.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Automate dunning cadence with 3-4 escalation levels and auto-send. Replace manual follow-up scheduling with system-driven worklists.", effort: "Medium", impact: "High" },
    { maxLevel: 3, text: "Start tracking promise-to-pay commitments with follow-up dates. Creates accountability and catches broken promises within 48 hours.", effort: "Low", impact: "Medium" },
    { maxLevel: 4, text: "Deploy AI-driven collections prioritization. Rank by probability of payment, not just aging bucket. Typical DSO impact: 3-7 days.", effort: "High", impact: "High" },
  ],
  disputes: [
    { maxLevel: 2, text: "Implement standardized reason code taxonomy (7-10 codes max). You cannot fix what you cannot categorize. Start with Pareto of your top dispute types.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Build a cross-functional RACI for dispute resolution. Most disputes age because nobody owns the investigation step — not because it's hard.", effort: "Low", impact: "High" },
    { maxLevel: 3, text: "Set SLAs per dispute type (e.g., pricing error = 7 days, quality claim = 14 days). Track and report breach rates weekly.", effort: "Low", impact: "Medium" },
    { maxLevel: 4, text: "Automate Pareto analysis on dispute root causes. Target: eliminate top 3 causes (typically 60-70% of volume) within 6 months.", effort: "Medium", impact: "High" },
  ],
  reporting: [
    { maxLevel: 2, text: "Implement count-back DSO calculation with daily refresh. Eliminate the monthly spreadsheet DSO that nobody trusts.", effort: "Low", impact: "Medium" },
    { maxLevel: 3, text: "Automate AR sub-ledger to GL reconciliation. The #1 period-end close bottleneck in AR. Saves 2-3 days per close cycle.", effort: "Medium", impact: "High" },
    { maxLevel: 3, text: "Deploy standardized KPI dashboard (DSO, CEI, FPM, touch rate, bad debt %, dispute cycle time) with APQC benchmarks.", effort: "Medium", impact: "High" },
    { maxLevel: 4, text: "Build predictive DSO forecasting using 12-month rolling payment behavior. Gives Treasury 30-day forward cash visibility.", effort: "Medium", impact: "High" },
  ],
};

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════

const P = {
  bg: "#07090e", sf: "#0d1017", s2: "#141924", s3: "#1c2435",
  bd: "#232d42", bdH: "#334163",
  t1: "#e6eaf3", t2: "#94a0be", t3: "#5d6b88",
};

const lc = (l) => LEVELS[l - 1]?.color || P.t3;
const lbg = (l) => LEVELS[l - 1]?.bg || "transparent";

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function MaturityV2({ onNavigate }) {
  const [scores, setScores] = useState(() => {
    const s = {};
    DOMAINS.forEach(d => { s[d.id] = {}; DIMS.forEach(dm => { s[d.id][dm.id] = 0; }); });
    return s;
  });
  const [view, setView] = useState("assess");
  const [activeDomain, setActiveDomain] = useState("credit");
  const [companyName, setCompanyName] = useState("");
  const [companyTier, setCompanyTier] = useState("enterprise");

  const setScore = useCallback((domainId, dimId, level) => {
    setScores(prev => ({ ...prev, [domainId]: { ...prev[domainId], [dimId]: prev[domainId][dimId] === level ? 0 : level } }));
  }, []);

  const domainAvg = useCallback((domainId) => {
    const vals = Object.values(scores[domainId]).filter(v => v > 0);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0;
  }, [scores]);

  const overallAvg = useMemo(() => {
    const avgs = DOMAINS.map(d => domainAvg(d.id)).filter(v => v > 0);
    return avgs.length > 0 ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length * 10) / 10 : 0;
  }, [domainAvg]);

  const completion = useMemo(() => {
    let filled = 0, total = DOMAINS.length * DIMS.length;
    DOMAINS.forEach(d => DIMS.forEach(dm => { if (scores[d.id][dm.id] > 0) filled++; }));
    return { filled, total, pct: Math.round(filled / total * 100) };
  }, [scores]);

  const tier = COMPANY_TIERS.find(t => t.id === companyTier);

  const radarDataDomain = useMemo(() => {
    return DOMAINS.map(d => ({ domain: d.name.replace(" & Deduction Mgmt", "").replace(" & Invoicing", ""), score: domainAvg(d.id), benchmark: d.benchmarks.topQ, median: d.benchmarks.median }));
  }, [domainAvg]);

  const radarDataDim = useMemo(() => {
    return DIMS.map(dm => {
      const entry = { dimension: dm.name };
      DOMAINS.forEach(d => { entry[d.name] = scores[d.id][dm.id] || 0; });
      return entry;
    });
  }, [scores]);

  const gapAnalysis = useMemo(() => {
    const gaps = [];
    const target = tier?.target || 4;
    DOMAINS.forEach(d => {
      DIMS.forEach(dm => {
        const s = scores[d.id][dm.id];
        if (s > 0 && s < target) {
          gaps.push({
            domain: d.name, domainId: d.id, domainIcon: d.icon,
            dim: dm.name, dimId: dm.id,
            current: s, target: Math.min(Math.ceil(target), 5),
            gap: Math.min(Math.ceil(target), 5) - s,
            severity: s <= 2 ? "Critical" : s <= 3 ? "Important" : "Monitor",
          });
        }
      });
    });
    return gaps.sort((a, b) => b.gap - a.gap || a.current - b.current);
  }, [scores, tier]);

  const quickWins = useMemo(() => {
    const wins = [];
    DOMAINS.forEach(d => {
      const avg = domainAvg(d.id);
      if (avg > 0 && QUICK_WINS_DB[d.id]) {
        QUICK_WINS_DB[d.id].forEach(qw => {
          if (avg < qw.maxLevel) {
            wins.push({ ...qw, domain: d.name, domainId: d.id, icon: d.icon, currentAvg: avg });
          }
        });
      }
    });
    return wins.sort((a, b) => {
      const eSort = { Low: 0, Medium: 1, High: 2 };
      const iSort = { High: 0, Medium: 1, Low: 2 };
      return iSort[a.impact] - iSort[b.impact] || eSort[a.effort] - eSort[b.effort];
    }).slice(0, 10);
  }, [domainAvg]);

  const lowestDomain = useMemo(() => {
    let min = 6, minD = null;
    DOMAINS.forEach(d => { const a = domainAvg(d.id); if (a > 0 && a < min) { min = a; minD = d; } });
    return minD;
  }, [domainAvg]);

  const strongestDomain = useMemo(() => {
    let max = 0, maxD = null;
    DOMAINS.forEach(d => { const a = domainAvg(d.id); if (a > max) { max = a; maxD = d; } });
    return maxD;
  }, [domainAvg]);

  const resetAll = () => {
    const s = {};
    DOMAINS.forEach(d => { s[d.id] = {}; DIMS.forEach(dm => { s[d.id][dm.id] = 0; }); });
    setScores(s);
  };

  const s = {
    page: { background: P.bg, minHeight: "100vh", fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", color: P.t1 },
    wrap: { maxWidth: 1440, margin: "0 auto", padding: "24px 20px 80px" },
    card: { background: P.sf, border: `1px solid ${P.bd}`, borderRadius: 12, padding: 20, marginBottom: 14 },
    row: { display: "flex", gap: 8, flexWrap: "wrap" },
    btn: (active, color) => ({ padding: "7px 16px", borderRadius: 7, border: `1px solid ${active ? (color || "#dba651") : P.bd}`, background: active ? `${color || "#dba651"}14` : P.sf, color: active ? (color || "#dba651") : P.t2, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase", transition: "all .15s" }),
    input: { padding: "7px 12px", borderRadius: 7, border: `1px solid ${P.bd}`, background: P.s2, color: P.t1, fontSize: 13, fontFamily: "inherit", outline: "none" },
    select: { padding: "7px 12px", borderRadius: 7, border: `1px solid ${P.bd}`, background: P.s2, color: P.t1, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" },
    tag: (color, bg) => ({ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 4, background: bg || `${color}18`, color, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }),
    prog: { height: 6, background: P.s3, borderRadius: 3, overflow: "hidden" },
    progFill: (pct, color) => ({ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }),
    tt: (color) => ({ fontSize: 11, color: color || P.t2, lineHeight: 1.55, padding: "8px 12px", background: `${color || P.t2}10`, borderRadius: 6, borderLeft: `3px solid ${color || P.t2}`, marginTop: 6 }),
  };

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (<div style={{ background: P.s2, border: `1px solid ${P.bd}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: P.t2, fontWeight: 600, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || p.stroke, fontSize: 11 }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}</div>)}
    </div>);
  };

  const currentDomain = DOMAINS.find(d => d.id === activeDomain);

  return (
    <div style={s.page}><div style={s.wrap}>

      {/* ══ HEADER ══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>AR Maturity Assessment</div>
            <div style={{ fontSize: 13, color: P.t2, marginTop: 3 }}>5-Level Model · 6 Domains × 6 Dimensions · APQC/Hackett Benchmarked</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: P.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: overallAvg >= 4 ? "#38b573" : overallAvg >= 3 ? "#d4a345" : overallAvg >= 2 ? "#e89240" : overallAvg > 0 ? "#e85454" : P.t3 }}>{overallAvg > 0 ? overallAvg : "—"}<span style={{ fontSize: 13, color: P.t3, fontWeight: 400 }}>/5</span></div>
            </div>
            <div style={{ width: 80 }}>
              <div style={s.prog}><div style={s.progFill(completion.pct, completion.pct === 100 ? "#38b573" : "#d4a345")} /></div>
              <div style={{ fontSize: 10, color: P.t3, marginTop: 3, textAlign: "center" }}>{completion.filled}/{completion.total} scored</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CLIENT BAR ══ */}
      <div style={{ ...s.card, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "12px 18px" }}>
        <span style={{ fontSize: 10, color: P.t3, fontWeight: 600, textTransform: "uppercase" }}>Client</span>
        <input style={{ ...s.input, width: 200 }} placeholder="Company name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        <span style={{ fontSize: 10, color: P.t3, fontWeight: 600, textTransform: "uppercase" }}>Size</span>
        <select style={s.select} value={companyTier} onChange={e => setCompanyTier(e.target.value)}>
          {COMPANY_TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div style={{ fontSize: 11, color: P.t3, fontStyle: "italic", marginLeft: 8 }}>{tier?.context}</div>
        <button style={{ ...s.btn(false), marginLeft: "auto", fontSize: 11, padding: "5px 12px" }} onClick={resetAll}>Reset All</button>
      </div>

      {/* ══ VIEW TABS ══ */}
      <div style={{ ...s.row, marginBottom: 20, borderBottom: `1px solid ${P.bd}`, paddingBottom: 12 }}>
        <button style={s.btn(view === "assess")} onClick={() => setView("assess")}>Assessment</button>
        <button style={s.btn(view === "results")} onClick={() => setView("results")}>Results & Radar</button>
        <button style={s.btn(view === "gaps")} onClick={() => setView("gaps")}>Gap Analysis</button>
        <button style={s.btn(view === "wins")} onClick={() => setView("wins")}>Quick Wins</button>
      </div>

      {/* ══════════════════════ ASSESSMENT ══════════════════════ */}
      {view === "assess" && (<>
        {/* Maturity scale legend */}
        <div style={{ ...s.card, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", padding: "10px 18px" }}>
          <span style={{ fontSize: 10, color: P.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Scale:</span>
          {LEVELS.map(l => (
            <div key={l.level} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: l.bg, border: `2px solid ${l.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: l.color }}>{l.level}</div>
              <span style={{ fontSize: 11, color: P.t2 }}>{l.name}</span>
            </div>
          ))}
        </div>

        {/* Domain nav */}
        <div style={{ ...s.row, marginBottom: 14 }}>
          {DOMAINS.map(d => {
            const avg = domainAvg(d.id);
            const filled = Object.values(scores[d.id]).filter(v => v > 0).length;
            return (
              <button key={d.id} style={{ ...s.btn(activeDomain === d.id, d.accent), display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setActiveDomain(d.id); }}>
                <span>{d.icon}</span> {d.name}
                {avg > 0 && <span style={{ fontWeight: 700, color: lc(Math.round(avg)), marginLeft: 4 }}>{avg.toFixed(1)}</span>}
                {filled === 6 && <span style={{ color: "#38b573", fontSize: 11 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Scoring grid for active domain */}
        {currentDomain && (
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{currentDomain.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{currentDomain.name}</span>
              <span style={{ fontSize: 11, color: P.t3, fontFamily: "monospace" }}>{currentDomain.code}</span>
              {domainAvg(currentDomain.id) > 0 && (
                <span style={s.tag(lc(Math.round(domainAvg(currentDomain.id))))}>
                  {domainAvg(currentDomain.id).toFixed(1)} — {LEVELS[Math.min(Math.round(domainAvg(currentDomain.id)), 5) - 1]?.name}
                </span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: P.t3 }}>
                <span>APQC Median: <b style={{ color: "#e89240" }}>{currentDomain.benchmarks.median}</b></span>
                <span>Top Q: <b style={{ color: "#d4a345" }}>{currentDomain.benchmarks.topQ}</b></span>
                <span>WC: <b style={{ color: "#38b573" }}>{currentDomain.benchmarks.wc}</b></span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: P.t3, marginBottom: 16 }}>Score each dimension 1-5. Click a score button to see what that level means for this specific capability.</div>

            {DIMS.map(dm => {
              const val = scores[currentDomain.id][dm.id];
              return (
                <div key={dm.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, padding: "12px 0", borderBottom: `1px solid ${P.bd}12` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.t1, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>{dm.icon}</span> {dm.name}
                    </div>
                    <div style={{ fontSize: 10, color: P.t3, marginTop: 2 }}>{dm.short}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <button key={level} onClick={() => setScore(currentDomain.id, dm.id, level)}
                          style={{ width: 42, height: 42, borderRadius: 7, border: `2px solid ${val === level ? lc(level) : P.bd}`, background: val === level ? lbg(level) : P.s2, color: val === level ? lc(level) : P.t3, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .12s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {level}
                        </button>
                      ))}
                      {val > 0 && (
                        <span style={{ ...s.tag(lc(val)), marginLeft: 8, fontSize: 11 }}>
                          L{val} {LEVELS[val - 1]?.name}
                        </span>
                      )}
                    </div>
                    {val > 0 && currentDomain.dims[dm.id]?.[val - 1] && (
                      <div style={s.tt(lc(val))}>
                        <span style={{ fontWeight: 600 }}>Level {val}: </span>
                        {currentDomain.dims[dm.id][val - 1]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>)}

      {/* ══════════════════════ RESULTS ══════════════════════ */}
      {view === "results" && (<>
        {completion.filled === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No Scores Yet</div>
            <div style={{ fontSize: 13, color: P.t3 }}>Complete the assessment first to see results.</div>
          </div>
        ) : (<>
          {/* Score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 16 }}>
            {DOMAINS.map(d => {
              const avg = domainAvg(d.id);
              const tgt = tier?.target || 4;
              const gap = avg > 0 ? Math.max(tgt - avg, 0) : 0;
              return (
                <div key={d.id} style={{ ...s.card, textAlign: "center", padding: "16px 12px" }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>{d.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: P.t2, marginBottom: 6 }}>{d.name}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: avg > 0 ? lc(Math.round(avg)) : P.t3 }}>{avg > 0 ? avg.toFixed(1) : "—"}</div>
                  <div style={{ fontSize: 10, color: avg > 0 ? lc(Math.round(avg)) : P.t3, fontWeight: 600, textTransform: "uppercase", marginTop: 2, marginBottom: 8 }}>
                    {avg > 0 ? LEVELS[Math.min(Math.round(avg), 5) - 1]?.name : "Not Scored"}
                  </div>
                  {avg > 0 && (<>
                    <div style={s.prog}><div style={s.progFill(avg / 5 * 100, lc(Math.round(avg)))} /></div>
                    {gap > 0 && <div style={{ fontSize: 10, color: "#e89240", marginTop: 6 }}>Gap to target: {gap.toFixed(1)}</div>}
                  </>)}
                </div>
              );
            })}
          </div>

          {/* Radars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={s.card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Domain Maturity vs. APQC Benchmarks</div>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 12 }}>Your score vs. APQC Top Quartile and Median</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarDataDomain} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <PolarGrid stroke={P.bd} />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: P.t2, fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: P.t3, fontSize: 10 }} />
                  <Radar name="Your Score" dataKey="score" stroke="#4a9be8" fill="#4a9be8" fillOpacity={0.12} strokeWidth={2} dot={{ r: 4, fill: "#4a9be8" }} />
                  <Radar name="APQC Top Quartile" dataKey="benchmark" stroke="#38b573" fill="none" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3, fill: "#38b573" }} />
                  <Radar name="APQC Median" dataKey="median" stroke="#e89240" fill="none" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3, fill: "#e89240" }} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Dimension View — Cross-Domain</div>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 12 }}>How each dimension performs across all 6 domains</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarDataDim} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <PolarGrid stroke={P.bd} />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: P.t2, fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: P.t3, fontSize: 10 }} />
                  {DOMAINS.map((d, i) => {
                    const cols = ["#4a9be8", "#8b6ce0", "#1d9e75", "#ba7517", "#d85a30", "#7a7a7a"];
                    if (domainAvg(d.id) === 0) return null;
                    return <Radar key={d.id} name={d.name} dataKey={d.name} stroke={cols[i]} fill={cols[i]} fillOpacity={0.05} strokeWidth={1.5} dot={{ r: 3, fill: cols[i] }} />;
                  })}
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heatmap */}
          <div style={s.card}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Dimension × Domain Heatmap</div>
            <div style={{ fontSize: 11, color: P.t3, marginBottom: 12 }}>Complete scoring matrix. Target for {tier?.label}: {tier?.target}/5</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${P.bd}`, color: P.t3, fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Dimension</th>
                    {DOMAINS.map(d => (
                      <th key={d.id} style={{ textAlign: "center", padding: "8px 6px", borderBottom: `2px solid ${P.bd}`, color: P.t3, fontSize: 10, fontWeight: 600, textTransform: "uppercase", minWidth: 90 }}>{d.icon} {d.name.split(" ")[0]}</th>
                    ))}
                    <th style={{ textAlign: "center", padding: "8px 6px", borderBottom: `2px solid ${P.bd}`, color: P.t3, fontSize: 10, fontWeight: 600 }}>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {DIMS.map(dm => {
                    const dimVals = DOMAINS.map(d => scores[d.id][dm.id]).filter(v => v > 0);
                    const dimAvg = dimVals.length > 0 ? (dimVals.reduce((a, b) => a + b, 0) / dimVals.length).toFixed(1) : "—";
                    return (
                      <tr key={dm.id}>
                        <td style={{ padding: "8px 10px", borderBottom: `1px solid ${P.bd}15`, color: P.t2, fontWeight: 500, fontSize: 12 }}>{dm.icon} {dm.name}</td>
                        {DOMAINS.map(d => {
                          const v = scores[d.id][dm.id];
                          return (
                            <td key={d.id} style={{ textAlign: "center", padding: "6px", borderBottom: `1px solid ${P.bd}15` }}>
                              {v > 0 ? (
                                <span style={{ display: "inline-block", width: 34, height: 34, lineHeight: "34px", borderRadius: 7, background: lbg(v), color: lc(v), fontWeight: 700, fontSize: 14, border: `1px solid ${lc(v)}40` }}>{v}</span>
                              ) : <span style={{ color: P.t3, fontSize: 11 }}>—</span>}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: "center", padding: "6px", borderBottom: `1px solid ${P.bd}15`, fontWeight: 600, color: typeof dimAvg === "string" ? P.t3 : lc(Math.round(parseFloat(dimAvg))), fontSize: 13 }}>{dimAvg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Executive Summary Box */}
          {completion.pct > 50 && (
            <div style={{ ...s.card, borderLeft: `4px solid #d4a345`, background: `${P.sf}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Executive Summary</div>
              <div style={{ fontSize: 13, color: P.t2, lineHeight: 1.7 }}>
                {companyName ? `${companyName}` : "This organization"} scores an overall <b style={{ color: lc(Math.round(overallAvg)) }}>{overallAvg}/5.0 ({LEVELS[Math.min(Math.round(overallAvg), 5) - 1]?.name})</b> on the AR maturity model
                {tier && <>, against a target of <b style={{ color: "#d4a345" }}>{tier.target}/5.0</b> for {tier.label} organizations</>}.
                {strongestDomain && <> The strongest domain is <b style={{ color: DOMAINS.find(d => d.id === strongestDomain.id)?.accent }}>{strongestDomain.icon} {strongestDomain.name}</b> at {domainAvg(strongestDomain.id).toFixed(1)}</>}
                {lowestDomain && <>, while the most critical gap is <b style={{ color: "#e85454" }}>{lowestDomain.icon} {lowestDomain.name}</b> at {domainAvg(lowestDomain.id).toFixed(1)}</>}.
                {gapAnalysis.filter(g => g.severity === "Critical").length > 0 && <> There are <b style={{ color: "#e85454" }}>{gapAnalysis.filter(g => g.severity === "Critical").length} critical gaps</b> requiring immediate attention.</>}
                {quickWins.length > 0 && <> {quickWins.length} quick wins have been identified that can be executed within 30-90 days.</>}
              </div>
            </div>
          )}
        </>)}
      </>)}

      {/* ══════════════════════ GAP ANALYSIS ══════════════════════ */}
      {view === "gaps" && (<>
        {gapAnalysis.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{completion.filled === 0 ? "No Scores Yet" : "No Gaps Detected"}</div>
            <div style={{ fontSize: 13, color: P.t3 }}>{completion.filled === 0 ? "Complete the assessment to see gap analysis." : "All scored areas meet or exceed target. Outstanding."}</div>
          </div>
        ) : (<>
          <div style={{ ...s.card, padding: "12px 18px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: P.t2 }}>Target for <b>{tier?.label}</b>: <b style={{ color: "#d4a345" }}>{tier?.target}/5</b></span>
            <span style={s.tag("#e85454")}>Critical: {gapAnalysis.filter(g => g.severity === "Critical").length}</span>
            <span style={s.tag("#e89240")}>Important: {gapAnalysis.filter(g => g.severity === "Important").length}</span>
            <span style={s.tag("#4a9be8")}>Monitor: {gapAnalysis.filter(g => g.severity === "Monitor").length}</span>
            <span style={{ fontSize: 12, color: P.t3, marginLeft: "auto" }}>Total gaps: {gapAnalysis.length}</span>
          </div>

          <div style={s.card}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Priority Gap Ranking</div>
            <div style={{ fontSize: 11, color: P.t3, marginBottom: 14 }}>Sorted by gap severity. Target = {Math.min(Math.ceil(tier?.target || 4), 5)}/5 based on company tier.</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["#", "Domain", "Dimension", "Current", "Target", "Gap", "Severity"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${P.bd}`, color: P.t3, fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gapAnalysis.slice(0, 20).map((g, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${P.s2}60` }}>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15`, color: P.t3, fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15`, color: P.t1, fontWeight: 600 }}>{g.domainIcon} {g.domain}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15`, color: P.t2 }}>{g.dim}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15` }}>
                      <span style={{ color: lc(g.current), fontWeight: 700, fontSize: 14 }}>{g.current}</span>
                      <span style={{ color: P.t3, fontSize: 10, marginLeft: 4 }}>{LEVELS[g.current - 1]?.name}</span>
                    </td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15` }}>
                      <span style={{ color: lc(g.target), fontWeight: 700, fontSize: 14 }}>{g.target}</span>
                    </td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: g.gap >= 3 ? "#e85454" : g.gap >= 2 ? "#e89240" : "#d4a345", fontWeight: 700 }}>+{g.gap}</span>
                        <div style={{ ...s.prog, flex: 1, maxWidth: 60 }}><div style={s.progFill(g.gap / 4 * 100, g.gap >= 3 ? "#e85454" : g.gap >= 2 ? "#e89240" : "#d4a345")} /></div>
                      </div>
                    </td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${P.bd}15` }}>
                      <span style={s.tag(g.severity === "Critical" ? "#e85454" : g.severity === "Important" ? "#e89240" : "#4a9be8")}>{g.severity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
      </>)}

      {/* ══════════════════════ QUICK WINS ══════════════════════ */}
      {view === "wins" && (<>
        {quickWins.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{completion.filled === 0 ? "No Scores Yet" : "No Quick Wins Available"}</div>
            <div style={{ fontSize: 13, color: P.t3 }}>{completion.filled === 0 ? "Complete the assessment to see recommendations." : "Your scores are advanced enough that remaining improvements require strategic initiatives, not quick fixes."}</div>
          </div>
        ) : (<>
          <div style={{ ...s.card, padding: "12px 18px" }}>
            <div style={{ fontSize: 13, color: P.t2 }}>
              <b style={{ color: P.t1 }}>{quickWins.length} actionable recommendations</b> based on your current maturity profile. Sorted by impact (high → low), then effort (low → high). Each can be executed within 30-90 days.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 12 }}>
            {quickWins.map((qw, i) => (
              <div key={i} style={{ ...s.card, borderLeft: `4px solid ${DOMAINS.find(d => d.id === qw.domainId)?.accent || P.bd}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{qw.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: P.t1 }}>{qw.domain}</span>
                  <span style={{ fontSize: 10, color: P.t3 }}>Current: {qw.currentAvg.toFixed(1)}</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                    <span style={s.tag(qw.impact === "High" ? "#38b573" : "#d4a345")}>Impact: {qw.impact}</span>
                    <span style={s.tag(qw.effort === "Low" ? "#38b573" : qw.effort === "Medium" ? "#d4a345" : "#e89240")}>Effort: {qw.effort}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: P.t2, lineHeight: 1.6 }}>{qw.text}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ ...s.card, display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <button style={{ ...s.btn(false, "#38b573"), padding: "10px 20px" }} onClick={() => onNavigate && onNavigate('SSC Transition Guide')}>
              Generate Transformation Roadmap →
            </button>
            <button style={{ ...s.btn(false, "#4a9be8"), padding: "10px 20px" }} onClick={() => onNavigate && onNavigate('OTC Business Case')}>
              Build ROI Business Case →
            </button>
          </div>
        </>)}
      </>)}

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${P.bd}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 11, color: P.t3 }}>
        <span>AR Maturity Assessment v2.0 · 5-Level Model · APQC PCF 8.0 · Hackett World-Class Benchmarks</span>
        <span>{companyName && `${companyName} · `}{tier?.label} · Overall: {overallAvg > 0 ? `${overallAvg}/5.0` : "—"}</span>
      </div>
    </div></div>
  );
}
