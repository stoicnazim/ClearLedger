import { useState } from "react";
import { useMockDatabase } from "./context/MockDatabaseContext";

/* ─────────────────────────────────────────────────
   2.1 — Credit Management Process Pack
   OtC Consulting Toolkit · Phase 2
   ───────────────────────────────────────────────── */

/* ── LIVE ACTUALS BRIDGE ────────────────────────────
   Maps KPI names to live values computed from the single
   source of truth. Returns { value, meets } where `meets`
   compares against the documented target. Reused across packs. */
function getLiveActual(kpiName, db, derived) {
  if (!db || !derived) return null;
  const name = kpiName.toLowerCase();
  const fmtPct = (n) => `${n}%`;

  if (name.includes("bad debt") || name.includes("write-off")) {
    return { value: fmtPct(derived.revenueLeakage()), raw: derived.revenueLeakage(), lowerIsBetter: true };
  }
  if (name.includes("auto-approval") || name.includes("auto-decision") || name.includes("auto-approve")) {
    // proxy: cash auto-match rate stands in for straight-through processing
    return { value: fmtPct(derived.autoMatchRate()), raw: derived.autoMatchRate(), lowerIsBetter: false };
  }
  if (name.includes("portfolio concentration")) {
    const exposure = derived.exposureByCustomer();
    const totalAR = derived.totalAR();
    const top10 = Object.values(exposure).sort((a, b) => b - a).slice(0, 10).reduce((s, v) => s + v, 0);
    const pct = totalAR > 0 ? Math.round((top10 / totalAR) * 1000) / 10 : 0;
    return { value: fmtPct(pct), raw: pct, lowerIsBetter: true };
  }
  if (name.includes("review completion") || name.includes("review")) {
    const profiles = db.creditProfiles || [];
    const onTime = profiles.filter((p) => {
      const days = (new Date("2026-05-24") - new Date(p.lastReviewDate)) / 86400000;
      return days <= 365;
    }).length;
    const pct = profiles.length ? Math.round((onTime / profiles.length) * 1000) / 10 : 0;
    return { value: fmtPct(pct), raw: pct, lowerIsBetter: false };
  }
  return null;
}

const TIERS = [
  { key: "sme", label: "SME", accent: "#22D3EE", desc: "< $50M Rev · 1–2 Entities" },
  { key: "mid", label: "Mid-Market", accent: "#A78BFA", desc: "$50M–$500M · 3–10 Entities" },
  { key: "enterprise", label: "Enterprise", accent: "#F472B6", desc: "$500M–$5B · 10–50 Entities" },
  { key: "global", label: "Global MNC", accent: "#FB923C", desc: "$5B+ · 50+ Entities" },
];

const TABS = [
  { key: "sipoc", label: "SIPOC", icon: "◈" },
  { key: "swimlane", label: "Swimlane", icon: "◆" },
  { key: "raci", label: "RACI", icon: "◇" },
  { key: "sop", label: "SOP", icon: "◉" },
  { key: "kpi", label: "KPI", icon: "◎" },
];

/* ══ SIPOC DATA ══════════════════════════════════ */
const SIPOC_DATA = {
  sme: {
    suppliers: [
      { name: "Sales / Account Management", pcf: "—" },
      { name: "Finance / AR Team", pcf: "10940" },
      { name: "External Credit Agencies", pcf: "—" },
      { name: "Customer (applicant)", pcf: "—" },
    ],
    inputs: [
      "New customer application / credit request",
      "Trade references",
      "External credit report (D&B / Experian)",
      "Financial statements (if available)",
      "Internal AR history (existing customers)",
    ],
    process: [
      { step: "P1", name: "Credit Application Received", desc: "New or existing customer submits credit request via sales or portal" },
      { step: "P2", name: "Data Collection & Verification", desc: "Gather trade references, credit bureau report, financials" },
      { step: "P3", name: "Credit Assessment", desc: "Score customer risk, assign internal rating" },
      { step: "P4", name: "Credit Limit Decision", desc: "Set credit limit and payment terms based on risk" },
      { step: "P5", name: "Approval & Communication", desc: "Approve/reject, notify sales and customer" },
      { step: "P6", name: "Master Data Setup", desc: "Enter credit limit and terms into ERP customer master" },
    ],
    outputs: [
      "Approved credit limit in ERP",
      "Payment terms assignment",
      "Credit decision documentation",
      "Customer onboarding complete (→2.3)",
    ],
    customers: [
      { name: "Sales Team", pcf: "—" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "Finance Director", pcf: "10820" },
      { name: "External Customer", pcf: "—" },
    ],
  },
  mid: {
    suppliers: [
      { name: "Sales / Regional Account Mgrs", pcf: "—" },
      { name: "AR Operations (multi-entity)", pcf: "10940" },
      { name: "Credit Analyst(s)", pcf: "10940" },
      { name: "Credit Bureau Providers", pcf: "—" },
      { name: "Customer (applicant)", pcf: "—" },
      { name: "Legal / Compliance", pcf: "10955" },
    ],
    inputs: [
      "Credit application (standardized form)",
      "Credit bureau reports (D&B, Experian, Creditsafe)",
      "Financial statements (2–3 years if >$50K limit)",
      "Trade references (3 minimum)",
      "Internal AR aging & payment history (→1.5)",
      "Industry risk data",
      "Entity-specific credit policies",
    ],
    process: [
      { step: "P1", name: "Credit Application Intake", desc: "Standardized application via portal or sales submission" },
      { step: "P2", name: "Automated Pre-Screening", desc: "Auto-pull credit bureau data, flag high-risk indicators" },
      { step: "P3", name: "Credit Analysis", desc: "Financial ratio analysis, internal scoring model, segment assignment" },
      { step: "P4", name: "Risk Segmentation", desc: "Assign risk tier (Low/Medium/High/Watch) per credit policy (→1.3)" },
      { step: "P5", name: "Credit Limit Calculation", desc: "Formula-based limit with manual adjustment authority" },
      { step: "P6", name: "Approval Workflow", desc: "Tiered approval: analyst → manager → VP based on limit value" },
      { step: "P7", name: "Terms Assignment & Communication", desc: "Set payment terms, notify stakeholders, issue credit letter" },
      { step: "P8", name: "ERP Master Data Update", desc: "Credit limit, terms, risk segment into customer master" },
    ],
    outputs: [
      "Credit limit approved and loaded in ERP",
      "Risk segment assignment (→1.3 collections strategy)",
      "Payment terms per entity policy",
      "Credit file / decision audit trail",
      "Credit letter to customer",
      "Periodic review schedule set",
    ],
    customers: [
      { name: "Sales / Account Management", pcf: "—" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "VP Finance / Controller", pcf: "10820" },
      { name: "SSC Operations (→2.6)", pcf: "10940" },
      { name: "External Customer", pcf: "—" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
    ],
  },
  enterprise: {
    suppliers: [
      { name: "Global Sales Organization", pcf: "—" },
      { name: "Regional AR / Credit Teams", pcf: "10940" },
      { name: "Credit Risk CoE", pcf: "10940" },
      { name: "Credit Bureau / Rating Agencies", pcf: "—" },
      { name: "Treasury / Risk Management", pcf: "10820" },
      { name: "Legal / Compliance", pcf: "10955" },
      { name: "Customer (applicant)", pcf: "—" },
      { name: "Credit Insurance Provider", pcf: "—" },
    ],
    inputs: [
      "Credit application (global standard form)",
      "Multi-bureau credit data (D&B, Moody's, S&P for large accounts)",
      "Audited financial statements (3 years)",
      "Bank references, trade references (5+)",
      "Internal payment behavior analytics (→1.5)",
      "Credit insurance portfolio data",
      "Country risk ratings",
      "SOX control requirements (→2.4)",
      "Existing group exposure data",
    ],
    process: [
      { step: "P1", name: "Application Intake & Triage", desc: "Global portal submission, auto-triage by requested limit tier" },
      { step: "P2", name: "Automated Screening & Bureau Pull", desc: "Multi-bureau data aggregation, sanctions/PEP screening, auto-score" },
      { step: "P3", name: "Financial Analysis", desc: "Ratio analysis, trend analysis, peer benchmarking, cash flow assessment" },
      { step: "P4", name: "Internal Scoring Model", desc: "Proprietary scorecard: financials + payment history + industry + country risk" },
      { step: "P5", name: "Risk Segmentation & ECL Overlay", desc: "IFRS 9 / CECL expected credit loss integration, segment assignment" },
      { step: "P6", name: "Credit Limit Calculation", desc: "Model-driven limit with group exposure aggregation" },
      { step: "P7", name: "Credit Insurance Assessment", desc: "Check insurable amount, coverage gap analysis" },
      { step: "P8", name: "Approval Workflow (SOX-compliant)", desc: "Tiered: analyst → mgr → director → VP/CFO based on limit (→2.4 SoD)" },
      { step: "P9", name: "Terms & Conditions Assignment", desc: "Payment terms, security requirements, guarantees if needed" },
      { step: "P10", name: "Master Data & Systems Update", desc: "ERP credit block config, risk segment, terms across entities" },
    ],
    outputs: [
      "Credit limit (entity + group level) in ERP",
      "Risk segment with ECL provision (→1.3, 1.5)",
      "Payment terms & security requirements",
      "SOX-compliant approval documentation (→2.4)",
      "Credit insurance coverage confirmation",
      "Automated credit block configuration",
      "Periodic review schedule (annual/semi-annual/quarterly by tier)",
      "Group exposure report",
    ],
    customers: [
      { name: "Global Sales Leadership", pcf: "—" },
      { name: "Regional AR / Collections (→1.3)", pcf: "10940" },
      { name: "SSC / BPO Operations (→2.6)", pcf: "10940" },
      { name: "Treasury / Risk Management", pcf: "10820" },
      { name: "CFO / Group Controller", pcf: "10820" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors", pcf: "10943" },
      { name: "Credit Insurance Broker", pcf: "—" },
    ],
  },
  global: {
    suppliers: [
      { name: "Global Sales & Key Account Mgmt", pcf: "—" },
      { name: "GBS Credit Operations (all hubs)", pcf: "10940" },
      { name: "Global Credit Risk CoE", pcf: "10940" },
      { name: "Rating Agencies (D&B, Moody's, S&P, Fitch)", pcf: "—" },
      { name: "Group Treasury & Risk", pcf: "10820" },
      { name: "Legal / Compliance / Regulatory", pcf: "10955" },
      { name: "Credit Insurance Panel", pcf: "—" },
      { name: "AI/ML Platform (scoring models)", pcf: "10854" },
      { name: "Data & Analytics CoE", pcf: "10860" },
      { name: "Customer (applicant)", pcf: "—" },
    ],
    inputs: [
      "Credit application (multi-language, global portal)",
      "Multi-bureau + rating agency data aggregation",
      "Audited financials (3 years) + management accounts",
      "Bank references, trade references (5+), industry data",
      "Real-time payment behavior analytics (→1.5, 2.5)",
      "Credit insurance portfolio (multi-insurer)",
      "Country risk + sovereign ratings (22+ jurisdictions)",
      "SOX + statutory control requirements (→2.4)",
      "Group-wide exposure data (real-time)",
      "M&A pipeline / acquired entity credit data",
      "Process mining conformance data (→2.5)",
      "IFRS 9 / CECL / local GAAP provisioning requirements",
    ],
    process: [
      { step: "P1", name: "Global Application Intake", desc: "Multi-language portal, auto-routing to appropriate hub by jurisdiction" },
      { step: "P2", name: "AI Pre-Screening & Enrichment", desc: "ML-driven auto-score, multi-bureau aggregation, sanctions/PEP/adverse media" },
      { step: "P3", name: "Comprehensive Financial Analysis", desc: "Automated ratio analysis, peer benchmarking, predictive cash flow modeling" },
      { step: "P4", name: "ML Credit Scoring", desc: "Ensemble model: financials + behavior + industry + country + news sentiment" },
      { step: "P5", name: "Portfolio Risk Assessment", desc: "Group exposure, concentration risk, correlation analysis, stress testing" },
      { step: "P6", name: "ECL / Provisioning Calculation", desc: "Multi-GAAP (IFRS 9, CECL, local) expected loss by segment" },
      { step: "P7", name: "Credit Limit Optimization", desc: "ML-optimized limit balancing risk vs. revenue, group-level aggregation" },
      { step: "P8", name: "Credit Insurance Optimization", desc: "Multi-insurer coverage optimization, self-retention strategy" },
      { step: "P9", name: "Approval Workflow (Multi-jurisdiction SOX)", desc: "Jurisdiction-aware tiered approval with full audit trail (→2.4)" },
      { step: "P10", name: "Terms, Security & Documentation", desc: "Payment terms, guarantees, UCC filings, letters of credit as needed" },
      { step: "P11", name: "Global Master Data Propagation", desc: "Real-time limit propagation across all ERPs, hubs, and entities" },
      { step: "P12", name: "Continuous Monitoring Activation", desc: "Real-time credit watch, trigger-based review, automated alerts" },
    ],
    outputs: [
      "Global credit limit (entity + group + portfolio level)",
      "ML-driven risk scores with explainability",
      "Multi-GAAP ECL provisions (→1.5)",
      "Risk segment with dynamic adjustment (→1.3)",
      "SOX + statutory compliant audit trail (→2.4)",
      "Credit insurance optimization report",
      "Automated credit block/release across all ERPs",
      "Continuous monitoring alerts & triggers",
      "Portfolio-level risk dashboards (→1.5)",
      "Group exposure & concentration reports",
      "M&A integration credit assessment",
      "Regulatory reporting packages",
    ],
    customers: [
      { name: "Group CFO / Board Risk Committee", pcf: "10820" },
      { name: "Regional CFOs / Controllers", pcf: "10825" },
      { name: "Global Sales Leadership", pcf: "—" },
      { name: "GBS Operations (all hubs) (→2.6)", pcf: "10940" },
      { name: "Group Treasury", pcf: "10820" },
      { name: "Group Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors (Big 4)", pcf: "10943" },
      { name: "Regulators (multi-jurisdictional)", pcf: "10955" },
      { name: "Credit Insurance Panel", pcf: "—" },
      { name: "Rating Agencies / Investors", pcf: "—" },
    ],
  },
};

/* ══ SWIMLANE DATA ═══════════════════════════════ */
const SWIMLANE_DATA = {
  sme: {
    lanes: ["Sales", "Credit / AR", "Finance Dir.", "ERP System"],
    steps: [
      { lane: 0, label: "Submit credit request", type: "start" },
      { lane: 1, label: "Pull credit report", type: "task" },
      { lane: 1, label: "Verify trade refs", type: "task" },
      { lane: 1, label: "Assess risk & score", type: "task" },
      { lane: 1, label: "Propose limit & terms", type: "task" },
      { lane: 2, label: "Approve / reject (>$25K)", type: "decision" },
      { lane: 1, label: "Communicate decision", type: "task" },
      { lane: 3, label: "Update customer master", type: "system" },
      { lane: 0, label: "Receive confirmation", type: "end" },
    ],
  },
  mid: {
    lanes: ["Sales", "Credit Analyst", "Credit Manager", "VP Finance", "ERP / Portal"],
    steps: [
      { lane: 0, label: "Submit via portal", type: "start" },
      { lane: 4, label: "Auto-pull bureau data", type: "system" },
      { lane: 1, label: "Financial analysis & scoring", type: "task" },
      { lane: 1, label: "Risk segment assignment", type: "task" },
      { lane: 1, label: "Calculate credit limit", type: "task" },
      { lane: 1, label: "Approve ≤$100K", type: "decision" },
      { lane: 2, label: "Approve $100K–$500K", type: "decision" },
      { lane: 3, label: "Approve >$500K", type: "decision" },
      { lane: 1, label: "Issue credit letter", type: "task" },
      { lane: 4, label: "Update master data (all entities)", type: "system" },
      { lane: 4, label: "Set periodic review trigger", type: "system" },
      { lane: 0, label: "Confirmation + terms letter", type: "end" },
    ],
  },
  enterprise: {
    lanes: ["Sales", "SSC Credit Ops", "Credit Risk CoE", "Regional FD", "Global CFO/VP", "ERP / GRC"],
    steps: [
      { lane: 0, label: "Submit global portal", type: "start" },
      { lane: 5, label: "Auto-screen + multi-bureau pull", type: "system" },
      { lane: 1, label: "Data verification & enrichment", type: "task" },
      { lane: 2, label: "Financial & ratio analysis", type: "task" },
      { lane: 2, label: "Internal scoring model", type: "task" },
      { lane: 2, label: "ECL / IFRS 9 overlay", type: "task" },
      { lane: 2, label: "Group exposure check", type: "task" },
      { lane: 2, label: "Credit insurance assessment", type: "task" },
      { lane: 1, label: "Approve ≤$250K", type: "decision" },
      { lane: 3, label: "Approve $250K–$2M", type: "decision" },
      { lane: 4, label: "Approve >$2M (SOX control)", type: "decision" },
      { lane: 5, label: "SOX audit trail logged", type: "system" },
      { lane: 1, label: "Terms & security assignment", type: "task" },
      { lane: 5, label: "Propagate across entities", type: "system" },
      { lane: 5, label: "Configure credit blocks", type: "system" },
      { lane: 0, label: "Receive decision + terms", type: "end" },
    ],
  },
  global: {
    lanes: ["Sales / KAM", "GBS Hub Credit Ops", "Credit Risk CoE", "Regional CFO", "Group CFO / Risk Committee", "AI/ML Platform", "ERP / GRC / MDM"],
    steps: [
      { lane: 0, label: "Submit (multi-language portal)", type: "start" },
      { lane: 5, label: "AI pre-screen + enrichment", type: "system" },
      { lane: 5, label: "ML auto-score + bureau aggregation", type: "system" },
      { lane: 6, label: "Sanctions / PEP / adverse media", type: "system" },
      { lane: 1, label: "Data quality review", type: "task" },
      { lane: 2, label: "Financial analysis + peer benchmark", type: "task" },
      { lane: 5, label: "Ensemble ML scoring", type: "system" },
      { lane: 2, label: "Portfolio exposure + stress test", type: "task" },
      { lane: 2, label: "Multi-GAAP ECL calculation", type: "task" },
      { lane: 5, label: "ML limit optimization", type: "system" },
      { lane: 2, label: "Insurance coverage optimization", type: "task" },
      { lane: 1, label: "Approve ≤$500K", type: "decision" },
      { lane: 3, label: "Approve $500K–$5M", type: "decision" },
      { lane: 4, label: "Approve >$5M (Board Risk)", type: "decision" },
      { lane: 6, label: "Multi-jurisdiction SOX trail", type: "system" },
      { lane: 6, label: "Global MDM propagation", type: "system" },
      { lane: 6, label: "Credit block config (all ERPs)", type: "system" },
      { lane: 5, label: "Activate continuous monitoring", type: "system" },
      { lane: 0, label: "Decision + terms + portal access", type: "end" },
    ],
  },
};

/* ══ RACI DATA ═══════════════════════════════════ */
const RACI_ROLES = {
  sme: ["Finance Dir.", "AR / Credit", "Sales", "IT"],
  mid: ["VP Finance", "Credit Mgr", "Credit Analyst", "Sales", "IT/ERP", "Legal"],
  enterprise: ["Global CFO", "Credit CoE Lead", "SSC Credit Ops", "Regional FD", "Sales", "IT CoE", "Legal", "Internal Audit"],
  global: ["Group CFO", "Credit CoE Global", "GBS Hub Ops", "Regional CFOs", "Sales/KAM", "AI/ML CoE", "Legal/Compliance", "Internal Audit", "Risk Committee"],
};
const RACI_ACTIVITIES = {
  sme: [
    { activity: "Credit Policy Definition", pcf: "10820", raci: ["A", "R", "C", "I"] },
    { activity: "Application Intake", pcf: "10940", raci: ["I", "R", "C", "I"] },
    { activity: "Credit Bureau Data Pull", pcf: "10940", raci: ["I", "R", "I", "C"] },
    { activity: "Credit Assessment & Scoring", pcf: "10940", raci: ["C", "R", "I", "I"] },
    { activity: "Credit Limit Decision", pcf: "10940", raci: ["A", "R", "C", "I"] },
    { activity: "ERP Master Data Update", pcf: "10854", raci: ["I", "R", "I", "C"] },
    { activity: "Periodic Credit Review", pcf: "10940", raci: ["A", "R", "I", "I"] },
    { activity: "Credit Hold / Release", pcf: "10940", raci: ["A", "R", "C", "I"] },
  ],
  mid: [
    { activity: "Credit Policy Development", pcf: "10820", raci: ["A", "R", "C", "I", "I", "C"] },
    { activity: "Application Intake & Triage", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I"] },
    { activity: "Bureau Data Aggregation", pcf: "10940", raci: ["I", "I", "R", "I", "C", "I"] },
    { activity: "Financial & Risk Analysis", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I"] },
    { activity: "Scoring Model Execution", pcf: "10940", raci: ["I", "A", "R", "I", "C", "I"] },
    { activity: "Risk Segmentation (→1.3)", pcf: "10940", raci: ["I", "A", "R", "I", "I", "I"] },
    { activity: "Limit Approval ≤$100K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I"] },
    { activity: "Limit Approval $100K–$500K", pcf: "10940", raci: ["I", "A/R", "R", "I", "I", "I"] },
    { activity: "Limit Approval >$500K", pcf: "10940", raci: ["A/R", "R", "R", "C", "I", "C"] },
    { activity: "ERP Master Data Update", pcf: "10854", raci: ["I", "I", "R", "I", "A", "I"] },
    { activity: "Periodic Review Execution", pcf: "10940", raci: ["C", "A", "R", "I", "I", "I"] },
    { activity: "Credit Hold Management", pcf: "10940", raci: ["C", "A", "R", "C", "C", "I"] },
    { activity: "SOX Compliance (→2.4)", pcf: "10943", raci: ["A", "R", "C", "I", "I", "C"] },
  ],
  enterprise: [
    { activity: "Global Credit Policy", pcf: "10820", raci: ["A", "R", "C", "C", "C", "I", "C", "C"] },
    { activity: "Application Intake & Triage", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I", "I", "I"] },
    { activity: "Multi-Bureau Screening", pcf: "10940", raci: ["I", "C", "R", "I", "I", "R", "I", "I"] },
    { activity: "Financial Analysis", pcf: "10940", raci: ["I", "A", "R", "I", "I", "I", "I", "I"] },
    { activity: "Internal Scoring Model", pcf: "10940", raci: ["I", "A", "R", "I", "I", "R", "I", "I"] },
    { activity: "ECL / IFRS 9 Calculation", pcf: "10820", raci: ["C", "A", "R", "C", "I", "R", "I", "C"] },
    { activity: "Group Exposure Assessment", pcf: "10820", raci: ["C", "A/R", "C", "C", "I", "C", "I", "I"] },
    { activity: "Credit Insurance Mgmt", pcf: "10820", raci: ["C", "A/R", "C", "I", "I", "I", "C", "I"] },
    { activity: "Approval ≤$250K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I", "I", "I"] },
    { activity: "Approval $250K–$2M", pcf: "10940", raci: ["I", "C", "R", "A/R", "I", "I", "I", "I"] },
    { activity: "Approval >$2M (SOX)", pcf: "10940", raci: ["A/R", "R", "C", "C", "C", "I", "C", "C"] },
    { activity: "Master Data Propagation", pcf: "10854", raci: ["I", "I", "R", "I", "I", "A", "I", "I"] },
    { activity: "Continuous Monitoring", pcf: "10940", raci: ["I", "A", "R", "C", "I", "R", "I", "I"] },
    { activity: "SOX Controls (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "I", "C", "R", "R"] },
  ],
  global: [
    { activity: "Global Credit Policy & Governance", pcf: "10820", raci: ["A", "R", "C", "C", "C", "I", "C", "C", "R"] },
    { activity: "Application Intake (global portal)", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I", "I", "I", "I"] },
    { activity: "AI Pre-Screening & Enrichment", pcf: "10940", raci: ["I", "C", "I", "I", "I", "A/R", "I", "I", "I"] },
    { activity: "Financial Analysis & Peer Benchmark", pcf: "10940", raci: ["I", "A", "R", "I", "I", "R", "I", "I", "I"] },
    { activity: "ML Ensemble Scoring", pcf: "10940", raci: ["I", "A", "I", "I", "I", "R", "I", "I", "I"] },
    { activity: "Portfolio Risk & Stress Testing", pcf: "10820", raci: ["C", "A/R", "C", "C", "I", "R", "I", "I", "C"] },
    { activity: "Multi-GAAP ECL Provisioning", pcf: "10820", raci: ["C", "A", "R", "R", "I", "R", "C", "C", "C"] },
    { activity: "Credit Insurance Optimization", pcf: "10820", raci: ["I", "A/R", "C", "C", "I", "I", "C", "I", "I"] },
    { activity: "Approval ≤$500K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I", "I", "I", "I"] },
    { activity: "Approval $500K–$5M", pcf: "10940", raci: ["I", "C", "R", "A/R", "C", "I", "I", "I", "I"] },
    { activity: "Approval >$5M (Board Risk)", pcf: "10940", raci: ["C", "R", "C", "C", "C", "I", "C", "C", "A/R"] },
    { activity: "Global MDM Propagation", pcf: "10854", raci: ["I", "I", "R", "I", "I", "C", "I", "I", "I"] },
    { activity: "Continuous AI Monitoring", pcf: "10940", raci: ["I", "A", "R", "I", "I", "R", "I", "I", "I"] },
    { activity: "SOX + Statutory Controls (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "I", "C", "R", "R", "C"] },
    { activity: "Process Mining Integration (→2.5)", pcf: "10860", raci: ["I", "C", "I", "I", "I", "A/R", "I", "I", "I"] },
  ],
};

/* ══ SOP DATA ════════════════════════════════════ */
const SOP_DATA = {
  sme: {
    title: "SOP-CM-001: Credit Assessment & Approval",
    scope: "All new credit applications and annual reviews for existing customers",
    sections: [
      { name: "1. Application Receipt", steps: ["Receive credit application from sales or customer", "Log in credit request tracker (spreadsheet or ERP)", "Assign priority: New customer = High, Review = Standard"] },
      { name: "2. Data Collection", steps: ["Order credit report from D&B or Experian", "Request 2 trade references from customer", "Obtain most recent financial statements (if available)", "Pull internal AR history for existing customers"] },
      { name: "3. Assessment", steps: ["Review credit score from bureau report", "Check trade reference responses", "Assess payment history (internal) — flag if >60 days past due", "Assign internal risk rating: Low / Medium / High"] },
      { name: "4. Limit Determination", steps: ["Low risk: credit limit = 10% of customer's annual revenue (max $100K)", "Medium risk: limit = 5% of revenue (max $50K)", "High risk: COD or secured terms only", "Limits >$25K require Finance Director approval"] },
      { name: "5. Approval & Setup", steps: ["Document decision with rationale", "Obtain approval signature if required", "Enter credit limit and payment terms in ERP customer master", "Notify sales team of decision", "Set annual review reminder"] },
    ],
    escalation: "Any credit request >$50K or customer with prior write-off history → Finance Director review",
    reviewCycle: "Annual for all customers; semi-annual for High risk",
  },
  mid: {
    title: "SOP-CM-001: Credit Management — New Credit & Periodic Review",
    scope: "All new credit applications, limit increases, and periodic reviews across all entities",
    sections: [
      { name: "1. Application Intake", steps: ["Customer or sales submits via credit portal", "System auto-assigns to analyst based on region/entity", "Auto-pulls credit bureau data (D&B, Experian, Creditsafe)", "System flags: sanctions list, duplicate check, existing exposure"] },
      { name: "2. Analysis & Scoring", steps: ["Review bureau score and report highlights", "Analyze financial statements (if limit >$50K): liquidity, leverage, profitability ratios", "Check 3 trade references (target: 5 BD turnaround)", "Calculate internal credit score using scoring template", "Assign risk segment: Low / Medium / High / Watch (→1.3 alignment)", "Document analysis in credit file"] },
      { name: "3. Limit Calculation", steps: ["Apply credit limit formula: Base = f(revenue, industry, risk segment)", "Low risk: 15% of revenue, max $500K", "Medium risk: 10% of revenue, max $250K", "High risk: 5% of revenue, max $50K, or secured terms", "Watch: COD or letter of credit only", "Check group exposure across entities"] },
      { name: "4. Approval Workflow", steps: ["≤$100K: Credit Analyst approves", "$100K–$500K: Credit Manager approves", ">$500K: VP Finance approves", "All approvals logged with timestamp and rationale", "SOX requirement: approver ≠ requester (→2.4)"] },
      { name: "5. Terms & Communication", steps: ["Assign payment terms per entity policy and risk segment", "Generate credit decision letter (approved template)", "Notify sales, AR, and customer", "Update ERP customer master: limit, terms, risk segment, review date"] },
      { name: "6. Periodic Review", steps: ["System generates review queue 30 days before due date", "Annual: all customers; Semi-annual: Medium/High; Quarterly: Watch", "Pull updated bureau data, internal payment performance", "Re-run scoring model, adjust limit/segment as needed", "Escalate downgrades to Credit Manager for review"] },
    ],
    escalation: "Credit limit >$500K or customer downgrade to Watch → VP Finance. Any sanctions match → Legal + VP Finance immediate escalation",
    reviewCycle: "Annual (Low), Semi-annual (Medium/High), Quarterly (Watch)",
  },
  enterprise: {
    title: "SOP-CM-001: Enterprise Credit Management — Full Lifecycle",
    scope: "Global credit application, assessment, approval, monitoring, and review across all entities, hubs, and BPO partners",
    sections: [
      { name: "1. Application & Triage", steps: ["Submission via global credit portal (multi-entity)", "Auto-triage: <$250K → SSC standard; $250K–$2M → CoE; >$2M → CoE + Regional FD", "Multi-bureau auto-pull: D&B + Experian + local bureau", "Automated sanctions/PEP/adverse media screening", "Duplicate detection and group exposure flag"] },
      { name: "2. Financial Analysis", steps: ["3-year financial trend analysis (automated ratios + manual review)", "Peer benchmarking against industry cohort", "Cash flow analysis and debt service coverage", "Country risk overlay from published sovereign ratings", "Credit insurance check: current coverage and insurable amount"] },
      { name: "3. Scoring & Segmentation", steps: ["Execute proprietary scorecard (weighted model)", "Inputs: financials (40%) + payment behavior (25%) + industry (15%) + country (10%) + qualitative (10%)", "Output: internal rating A through E", "Map to risk segment: A/B = Low, C = Medium, D = High, E = Watch/Decline", "Calculate IFRS 9 ECL for segment: 12-month for Low, lifetime for Medium+", "Document scoring rationale in credit file"] },
      { name: "4. Limit & Terms", steps: ["Model-driven limit: f(rating, revenue, industry cap, group exposure)", "Group exposure aggregation across all entities", "Credit insurance gap analysis: insured vs. self-retained", "Payment terms assignment per global policy matrix", "Security requirements for High/Watch: guarantee, UCC filing, or LOC"] },
      { name: "5. SOX-Compliant Approval", steps: ["≤$250K: SSC Credit Ops (Analyst + independent reviewer)", "$250K–$2M: Credit CoE Lead + Regional FD", ">$2M: Global CFO/VP with documented board authority", "All approvals: digital sign-off with timestamp in GRC", "Segregation of duties: requester ≠ analyst ≠ approver (→2.4)", "Audit trail: all changes versioned and retained 7 years"] },
      { name: "6. Master Data & Blocks", steps: ["Propagate limit, terms, and risk segment to all relevant entities in ERP", "Configure automatic credit block at 90% of limit", "Hard block at 100% with auto-notification to sales and credit", "Set credit block override authority by role (SOX controlled)"] },
      { name: "7. Monitoring & Review", steps: ["Daily: automated monitoring of payment behavior, bureau alerts", "Weekly: SSC generates credit watch list from trigger events", "Trigger events: 60+ DPD, bureau downgrade, adverse news, financial restatement", "Periodic: Annual (A/B), Semi-annual (C), Quarterly (D), Monthly (E)", "Re-score on any trigger event within 5 BD", "Downgrade communication to sales within 24 hours"] },
    ],
    escalation: ">$2M or any Watch/Decline → Global CFO. Sanctions match → Legal + Compliance + CFO within 4 hours. Material group exposure (>5% of AR) → Risk Committee",
    reviewCycle: "Annual (A/B), Semi-annual (C), Quarterly (D), Monthly (E), Trigger-based (any)",
  },
  global: {
    title: "SOP-CM-001: Global GBS Credit Management — AI-Enhanced Full Lifecycle",
    scope: "Global credit operations across all GBS hubs, ERPs, jurisdictions, and M&A integrations",
    sections: [
      { name: "1. Global Intake & AI Triage", steps: ["Multi-language portal submission with auto-translation", "AI auto-routing: hub assignment by jurisdiction + complexity scoring", "<$500K routine → GBS Hub auto-process; $500K–$5M → CoE; >$5M → CoE + Board Risk", "Real-time multi-bureau + rating agency data aggregation", "AI-powered sanctions/PEP/adverse media screening (continuous)", "Duplicate detection, group exposure real-time check"] },
      { name: "2. AI-Enhanced Analysis", steps: ["Automated 3-year financial analysis with anomaly detection", "ML-driven peer benchmarking (industry × geography × size cohort)", "Predictive cash flow modeling (12-month forward)", "News sentiment analysis and social media risk signals", "Country risk scoring with forward-looking indicators", "Credit insurance portfolio optimization (multi-insurer)"] },
      { name: "3. ML Scoring & Portfolio View", steps: ["Ensemble ML model execution (5 sub-models, weighted)", "Model inputs: financials + behavior + industry + country + news + ESG", "Output: continuous risk score (0–1000) mapped to internal rating", "Explainability report for auditors (SHAP values / feature importance)", "Portfolio-level impact simulation of proposed limit", "Concentration risk and correlation analysis", "Multi-GAAP ECL: IFRS 9 + CECL + local requirements per jurisdiction"] },
      { name: "4. Limit Optimization & Terms", steps: ["ML-optimized limit balancing risk appetite vs. revenue potential", "Group-wide exposure aggregation (real-time across all ERPs)", "Credit insurance optimization: insured vs. self-retained vs. decline", "Payment terms from global policy matrix × jurisdiction × risk tier", "Security requirements: guarantees, LOCs, UCC filings, parent guarantees", "Terms approved by Credit CoE with regional legal review"] },
      { name: "5. Multi-Jurisdiction Approval", steps: ["≤$500K: GBS Hub Credit Ops (dual control)", "$500K–$5M: Credit CoE + Regional CFO", ">$5M: Group CFO + Board Risk Committee", "Multi-jurisdiction SOX + statutory compliance in approval chain (→2.4)", "Full digital audit trail in GRC: versioned, timestamped, 10-year retention", "Segregation of duties enforced by system (→2.4)"] },
      { name: "6. Global Propagation", steps: ["Real-time MDM update: limit, terms, risk segment to all ERPs globally", "Automated credit block configuration across all ERP instances", "Block thresholds: warning at 80%, soft block at 95%, hard block at 100%", "Override authority matrix by role × jurisdiction × amount", "Process mining event logged for conformance tracking (→2.5)"] },
      { name: "7. Continuous Monitoring", steps: ["Real-time payment behavior monitoring across all hubs", "Bureau alert integration (daily feeds from all providers)", "AI-driven early warning system: predicts deterioration 60–90 days ahead", "Trigger events: 45+ DPD, bureau alert, news flag, financial covenant breach", "Auto-initiated re-score within 24 hours of trigger", "Follow-the-sun escalation: hub-to-hub handoff for continuous coverage", "Monthly portfolio review by Credit CoE: concentration, migration, ECL trends", "Quarterly Board Risk Committee reporting"] },
    ],
    escalation: ">$5M → Board Risk Committee (5 BD SLA). Sanctions match → Legal + Compliance + Group CFO within 2 hours. Portfolio concentration >3% single name → Group CFO. Sovereign downgrade affecting >10 entities → Emergency Risk Committee within 24 hours",
    reviewCycle: "Continuous (AI monitoring), Annual (Low), Semi-annual (Medium), Quarterly (High), Monthly (Watch), Trigger-based (any tier)",
  },
};

/* ══ KPI DATA ════════════════════════════════════ */
const KPI_DATA = {
  sme: [
    { kpi: "Credit Decision Turnaround", formula: "Avg. business days from application to decision", target: "≤ 3 BD", benchmark: "APQC: Median 4 BD", category: "Speed" },
    { kpi: "Credit Application Backlog", formula: "Open applications > SLA / Total open", target: "≤ 10%", benchmark: "—", category: "Speed" },
    { kpi: "Bad Debt Write-Off Rate", formula: "Write-offs / Total revenue", target: "≤ 0.5%", benchmark: "APQC: Median 0.4%", category: "Quality" },
    { kpi: "Credit Limit Utilization", formula: "Outstanding AR / Total credit limits", target: "40–60%", benchmark: "Hackett: Median 52%", category: "Quality" },
    { kpi: "Past-Due % of AR", formula: "Past-due AR / Total AR", target: "≤ 15%", benchmark: "APQC: Median 18%", category: "Quality" },
    { kpi: "Review Completion Rate", formula: "Reviews completed on time / Due", target: "≥ 90%", benchmark: "—", category: "Compliance" },
  ],
  mid: [
    { kpi: "Credit Decision SLA", formula: "Decisions within SLA / Total decisions", target: "≥ 90%", benchmark: "APQC: Top quartile 95%", category: "Speed" },
    { kpi: "Avg. Decision Turnaround", formula: "Average BD to decision by tier", target: "≤ 3 BD (std), ≤ 5 BD (complex)", benchmark: "APQC: Median 4 BD", category: "Speed" },
    { kpi: "Auto-Approval Rate", formula: "Auto-approved / Total (low-risk segment)", target: "≥ 30%", benchmark: "Hackett: Top quartile 40%", category: "Speed" },
    { kpi: "Bad Debt Write-Off Rate", formula: "Write-offs / Revenue", target: "≤ 0.3%", benchmark: "APQC: Top quartile 0.25%", category: "Quality" },
    { kpi: "Credit Limit Accuracy", formula: "Limits requiring adjustment within 6mo / Total", target: "≤ 15%", benchmark: "—", category: "Quality" },
    { kpi: "Risk Segment Migration", formula: "Downgrade rate (net) per quarter", target: "≤ 5%", benchmark: "—", category: "Quality" },
    { kpi: "Review Completion Rate", formula: "On-time reviews / Due reviews", target: "≥ 95%", benchmark: "—", category: "Compliance" },
    { kpi: "SOX Compliance (→2.4)", formula: "Approval chain adherence", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Credit Cost per Decision", formula: "Total credit dept cost / Decisions", target: "≤ $35", benchmark: "APQC: Median $42", category: "Cost" },
  ],
  enterprise: [
    { kpi: "Global Decision SLA", formula: "Decisions within SLA across all hubs", target: "≥ 93%", benchmark: "Hackett: Top quartile 95%", category: "Speed" },
    { kpi: "Avg. Turnaround by Tier", formula: "BD to decision: std / complex / strategic", target: "≤ 2 / 5 / 10 BD", benchmark: "APQC: Median 3/6/12", category: "Speed" },
    { kpi: "Auto-Approval Rate", formula: "Auto-approved (A/B rated) / Total", target: "≥ 45%", benchmark: "Hackett: Top quartile 50%", category: "Speed" },
    { kpi: "Bad Debt Rate", formula: "Write-offs / Revenue", target: "≤ 0.20%", benchmark: "APQC: Top quartile 0.18%", category: "Quality" },
    { kpi: "ECL Accuracy (IFRS 9)", formula: "Actual losses / Provisioned amount", target: "80–120% (±20% accuracy)", benchmark: "—", category: "Quality" },
    { kpi: "Portfolio Concentration", formula: "Top 10 exposures / Total AR", target: "≤ 25%", benchmark: "Hackett: Median 30%", category: "Quality" },
    { kpi: "Credit Insurance Coverage", formula: "Insured exposure / Total insurable", target: "≥ 70%", benchmark: "—", category: "Quality" },
    { kpi: "SOX Compliance (→2.4)", formula: "Zero SoD violations in credit approvals", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Review Completion", formula: "On-time reviews by risk tier", target: "≥ 97%", benchmark: "—", category: "Compliance" },
    { kpi: "Credit Cost per Decision", formula: "Total credit cost / Decisions", target: "≤ $25", benchmark: "APQC: Top quartile $22", category: "Cost" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance score for credit process", target: "≥ 90%", benchmark: "—", category: "Compliance" },
  ],
  global: [
    { kpi: "Global Decision SLA", formula: "SLA adherence across all hubs / jurisdictions", target: "≥ 95%", benchmark: "Hackett: World-class 97%", category: "Speed" },
    { kpi: "AI Auto-Decision Rate", formula: "AI auto-approved or auto-declined / Total", target: "≥ 55%", benchmark: "Hackett: Top quartile 50%", category: "Speed" },
    { kpi: "Avg. Turnaround (Global)", formula: "BD: auto / std / complex / strategic", target: "≤ 0.5 / 2 / 5 / 8 BD", benchmark: "—", category: "Speed" },
    { kpi: "Global Bad Debt Rate", formula: "Write-offs / Revenue (consolidated)", target: "≤ 0.15%", benchmark: "APQC: World-class 0.12%", category: "Quality" },
    { kpi: "ML Model Accuracy", formula: "Default prediction accuracy (Gini)", target: "≥ 80%", benchmark: "—", category: "Quality" },
    { kpi: "Multi-GAAP ECL Accuracy", formula: "Actual loss / Provision (all standards)", target: "90–110%", benchmark: "—", category: "Quality" },
    { kpi: "Portfolio Concentration", formula: "Top 10 exposures / Total AR", target: "≤ 20%", benchmark: "Hackett: Top quartile 22%", category: "Quality" },
    { kpi: "Credit Insurance Optimization", formula: "Insurance cost / Claims recovered", target: "≤ 200% (cost:claim ratio)", benchmark: "—", category: "Cost" },
    { kpi: "SOX + Statutory Compliance", formula: "Zero findings across all jurisdictions", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Continuous Monitoring Coverage", formula: "Customers under real-time monitoring / Total", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance for credit lifecycle", target: "≥ 92%", benchmark: "—", category: "Compliance" },
    { kpi: "Credit Cost per Decision", formula: "Global blended cost per decision", target: "≤ $18", benchmark: "APQC: World-class $15", category: "Cost" },
    { kpi: "Early Warning Accuracy", formula: "AI-flagged deteriorations confirmed / Total flags", target: "≥ 70% precision", benchmark: "—", category: "Quality" },
  ],
};

/* ── CROSS-REFERENCE MAP ────────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "Credit management process codes and hierarchy" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Payment behavior data feeds credit scoring models" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Risk segments from credit directly drive collection strategy" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "Jurisdiction compliance affects terms and security requirements" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "Credit KPIs integrated into AR dashboard, ECL reporting" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Credit management maturity scoring dimension" },
  { code: "2.2", name: "Dispute Resolution Process Pack", relevance: "Dispute patterns inform credit risk reassessment" },
  { code: "2.3", name: "Billing & Invoicing Process Pack", relevance: "Invoice accuracy impacts credit utilization and disputes" },
  { code: "2.4", name: "SOX Compliance Controls Library", relevance: "SoD controls, approval matrices, audit trail requirements" },
  { code: "2.5", name: "Process Mining Playbook", relevance: "Credit process conformance monitoring and variant analysis" },
  { code: "2.6", name: "Shared Services Transition Guide", relevance: "Credit ops in SSC/GBS scope, SLA definitions, hub operations" },
];

/* ══════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════ */
const raciColor = (v) => { if (v === "A" || v === "A/R") return "#FB923C"; if (v === "R") return "#22D3EE"; if (v === "C") return "#A78BFA"; if (v === "I") return "rgba(255,255,255,0.15)"; return "transparent"; };
const raciText = (v) => { if (v === "I") return "rgba(255,255,255,0.35)"; return "#0B0F1A"; };
const stepTypeColor = (t, accent) => { if (t === "start") return "#34D399"; if (t === "end") return "#EF4444"; if (t === "decision") return "#FBBF24"; if (t === "system") return "#60A5FA"; return accent; };

export default function CreditManagementProcessPack() {
  const { derived, customers, creditProfiles, invoices } = useMockDatabase() || {};
  const liveDb = { creditProfiles, invoices, customers };
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("sipoc");
  const [kpiFilter, setKpiFilter] = useState("All");
  const [showXref, setShowXref] = useState(false);

  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

  /* ── SIPOC ──────────────────────────────── */
  const renderSIPOC = () => {
    const data = SIPOC_DATA[tier];
    const cols = [
      { key: "suppliers", label: "Suppliers", items: data.suppliers.map((s) => `${s.name}${s.pcf !== "—" ? ` [PCF ${s.pcf}]` : ""}`) },
      { key: "inputs", label: "Inputs", items: data.inputs },
      { key: "process", label: "Process", items: data.process.map((p) => `${p.step}: ${p.name} — ${p.desc}`) },
      { key: "outputs", label: "Outputs", items: data.outputs },
      { key: "customers", label: "Customers", items: data.customers.map((c) => `${c.name}${c.pcf !== "—" ? ` [PCF ${c.pcf}]` : ""}`) },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16 }}>
        {cols.map((col) => (
          <div key={col.key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", background: col.key === "process" ? accent + "22" : "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: col.key === "process" ? accent : "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{col.label}</span>
            </div>
            <div style={{ padding: 12 }}>
              {col.items.map((item, i) => (
                <div key={i} style={{ padding: "8px 10px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `2px solid ${col.key === "process" ? accent : "rgba(255,255,255,0.08)"}`, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ── Swimlane ───────────────────────────── */
  const renderSwimlane = () => {
    const data = SWIMLANE_DATA[tier];
    return (
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 700 }}>
          {data.lanes.map((lane, li) => {
            const laneSteps = data.steps.filter((s) => s.lane === li);
            return (
              <div key={li} style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", minHeight: 52 }}>
                <div style={{ width: 140, minWidth: 140, padding: "12px 14px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{lane}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8, flexWrap: "wrap" }}>
                  {laneSteps.map((step, si) => (
                    <div key={si} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ padding: "6px 12px", borderRadius: step.type === "decision" ? 0 : 6, transform: step.type === "decision" ? "rotate(0deg)" : "none", background: stepTypeColor(step.type, accent) + "22", border: `1px solid ${stepTypeColor(step.type, accent)}44`, fontSize: 11, color: stepTypeColor(step.type, accent), fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {step.label}
                      </div>
                      {si < laneSteps.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[{ label: "Start", color: "#34D399" }, { label: "Task", color: accent }, { label: "Decision", color: "#FBBF24" }, { label: "System", color: "#60A5FA" }, { label: "End", color: "#EF4444" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color + "44", border: `1px solid ${l.color}66`, display: "inline-block" }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── RACI ────────────────────────────────── */
  const renderRACI = () => {
    const roles = RACI_ROLES[tier];
    const activities = RACI_ACTIVITIES[tier];
    return (
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", left: 0, background: "#0B0F1A", zIndex: 2 }}>Activity</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace" }}>PCF</th>
              {roles.map((r, i) => (
                <th key={i} style={{ padding: "10px 6px", textAlign: "center", color: "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.8)", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", position: "sticky", left: 0, background: ri % 2 === 0 ? "#0B0F1A" : "#0d1120", zIndex: 1 }}>{row.activity}</td>
                <td style={{ padding: "8px 8px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'JetBrains Mono', monospace" }}>{row.pcf}</td>
                {row.raci.map((v, ci) => (
                  <td key={ci} style={{ padding: "6px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, background: raciColor(v), color: raciText(v), fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28 }}>{v}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[{ label: "A = Accountable", color: "#FB923C" }, { label: "R = Responsible", color: "#22D3EE" }, { label: "C = Consulted", color: "#A78BFA" }, { label: "I = Informed", color: "rgba(255,255,255,0.15)" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: "inline-block" }} />{l.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── SOP ─────────────────────────────────── */
  const renderSOP = () => {
    const data = SOP_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>{data.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Scope: {data.scope}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.sections.map((sec, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{sec.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {sec.steps.map((step, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ width: 20, minWidth: 20, height: 20, borderRadius: "50%", background: accent + "22", border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: accent, fontWeight: 700, marginTop: 1 }}>{j + 1}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Escalation</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.escalation}</div>
          </div>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Review Cycle</span>
            <div style={{ fontSize: 11, color: accent, marginTop: 4, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{data.reviewCycle}</div>
          </div>
        </div>
      </div>
    );
  };

  /* ── KPI ─────────────────────────────────── */
  const renderKPI = () => {
    const data = KPI_DATA[tier];
    const categories = ["All", ...Array.from(new Set(data.map((k) => k.category)))];
    const filtered = kpiFilter === "All" ? data : data.filter((k) => k.category === kpiFilter);
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setKpiFilter(cat)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${kpiFilter === cat ? accent : "rgba(255,255,255,0.08)"}`, background: kpiFilter === cat ? accent + "22" : "rgba(255,255,255,0.03)", color: kpiFilter === cat ? accent : "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", fontWeight: kpiFilter === cat ? 600 : 400 }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
          {filtered.map((kpi, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{kpi.kpi}</span>
                <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", marginLeft: 8 }}>{kpi.category}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{kpi.formula}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>TARGET </span><span style={{ fontSize: 12, color: accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.target}</span></div>
                <div style={{ textAlign: "right" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>BENCH </span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>{kpi.benchmark}</span></div>
              </div>
              {(() => {
                const actual = getLiveActual(kpi.kpi, liveDb, derived);
                if (!actual) return null;
                return (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>ACTUAL </span>
                      <span style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{actual.value}</span>
                    </div>
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: 0.5, background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }}>● LIVE</span>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── MAIN RENDER ───────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.1</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Credit Management Process Pack</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>
          Credit assessment, scoring models, approval workflows, risk segmentation, continuous monitoring, SOX-compliant lifecycle
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TIERS.map((t) => (
          <button key={t.key} onClick={() => { setTier(t.key); setKpiFilter("All"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`, background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)", color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tier === t.key ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif" }}>
            <div>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`, background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
            <span style={{ marginRight: 6, fontSize: 10 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {tab === "sipoc" && renderSIPOC()}
        {tab === "swimlane" && renderSwimlane()}
        {tab === "raci" && renderRACI()}
        {tab === "sop" && renderSOP()}
        {tab === "kpi" && renderKPI()}
      </div>

      <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
        <button onClick={() => setShowXref(!showXref)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 8, padding: 0 }}>
          <span style={{ transform: showXref ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>
          Cross-Reference Index ({XREFS.length} linked deliverables)
        </button>
        {showXref && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8, marginTop: 12 }}>
            {XREFS.map((xr) => (
              <div key={xr.code} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>{xr.code}</span>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{xr.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{xr.relevance}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>APQC PCF v8.0 · Hackett World-Class Metrics 2026 · IFRS 9 / CECL / ECL Standards</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.1 — Credit Management Process Pack · v1.0</span>
      </div>
    </div>
  );
}
