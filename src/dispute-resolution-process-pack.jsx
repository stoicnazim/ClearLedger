import { useState } from "react";
import { useLiveActuals, liveBadgeStyle, getKpiActual } from "./liveActuals";

/* ─────────────────────────────────────────────────
   2.2 — Dispute Resolution Process Pack
   OtC Consulting Toolkit · Phase 2
   ───────────────────────────────────────────────── */

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

/* ══ SIPOC ════════════════════════════════════════ */
const SIPOC_DATA = {
  sme: {
    suppliers: [
      { name: "Customer (claimant)", pcf: "—" },
      { name: "Sales / Account Mgmt", pcf: "—" },
      { name: "AR / Collections Team", pcf: "10940" },
      { name: "Warehouse / Logistics", pcf: "10756" },
    ],
    inputs: [
      "Customer dispute notification (email/phone/portal)",
      "Invoice and delivery documentation",
      "Proof of delivery / shipping records",
      "AR aging data & payment history",
      "Product / service records",
    ],
    process: [
      { step: "P1", name: "Dispute Received & Logged", desc: "Customer raises dispute; AR logs in tracker" },
      { step: "P2", name: "Categorize & Prioritize", desc: "Classify dispute type (pricing, quality, delivery, billing error)" },
      { step: "P3", name: "Investigate & Gather Evidence", desc: "Pull docs, coordinate with sales/warehouse" },
      { step: "P4", name: "Determine Resolution", desc: "Decide: full credit, partial credit, reject, or rebill" },
      { step: "P5", name: "Approve & Execute", desc: "Process credit memo or adjustment; update AR" },
      { step: "P6", name: "Communicate & Close", desc: "Notify customer, close dispute, document root cause" },
    ],
    outputs: [
      "Resolved dispute with documented outcome",
      "Credit memo or adjustment posted (→1.2)",
      "Root cause log for process improvement",
      "Updated AR aging (→1.5)",
    ],
    customers: [
      { name: "External Customer", pcf: "—" },
      { name: "Sales Team", pcf: "—" },
      { name: "Finance Director", pcf: "10820" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
    ],
  },
  mid: {
    suppliers: [
      { name: "Customer (claimant)", pcf: "—" },
      { name: "Sales / Regional Account Mgrs", pcf: "—" },
      { name: "AR / Dispute Analysts", pcf: "10940" },
      { name: "Supply Chain / Logistics", pcf: "10756" },
      { name: "Quality / Product Management", pcf: "10774" },
      { name: "Billing Team (→2.3)", pcf: "10940" },
    ],
    inputs: [
      "Dispute submission (portal / email / EDI)",
      "Invoice, PO, contract, and pricing agreement",
      "Delivery docs (POD, BOL, tracking)",
      "Quality inspection reports",
      "Historical dispute data for customer",
      "Credit notes / debit notes history",
      "SLA targets for resolution (→2.6)",
    ],
    process: [
      { step: "P1", name: "Intake & Registration", desc: "Dispute logged via portal with auto-categorization attempt" },
      { step: "P2", name: "Validation & Deduplication", desc: "Check for duplicates, validate claim against invoice/contract" },
      { step: "P3", name: "Categorization & Assignment", desc: "Assign category, priority, and responsible analyst/department" },
      { step: "P4", name: "Investigation", desc: "Cross-functional evidence gathering with defined SLA per category" },
      { step: "P5", name: "Root Cause Analysis", desc: "Identify root cause using standardized taxonomy" },
      { step: "P6", name: "Resolution Proposal", desc: "Determine resolution: credit, rebill, reject, commercial gesture" },
      { step: "P7", name: "Approval Workflow", desc: "Tiered approval by value: analyst → manager → VP" },
      { step: "P8", name: "Execution & Communication", desc: "Process adjustment, notify customer, update systems" },
      { step: "P9", name: "Close & Root Cause Reporting", desc: "Close in system, feed root cause data to prevention programs" },
    ],
    outputs: [
      "Resolved dispute with full audit trail",
      "Credit memo / debit memo posted (→1.2)",
      "Root cause classification & trend data",
      "Prevention recommendations by category",
      "Customer satisfaction follow-up",
      "SLA performance data (→2.6)",
    ],
    customers: [
      { name: "External Customer", pcf: "—" },
      { name: "Sales / Account Management", pcf: "—" },
      { name: "VP Finance / Controller", pcf: "10820" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "SSC Operations (→2.6)", pcf: "10940" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
    ],
  },
  enterprise: {
    suppliers: [
      { name: "Customer (multi-channel)", pcf: "—" },
      { name: "Global Sales Organization", pcf: "—" },
      { name: "SSC Dispute Resolution Team", pcf: "10940" },
      { name: "Dispute CoE / Retained Org", pcf: "10940" },
      { name: "Supply Chain / Logistics (global)", pcf: "10756" },
      { name: "Quality / Product Mgmt", pcf: "10774" },
      { name: "Billing & Invoicing (→2.3)", pcf: "10940" },
      { name: "Legal / Compliance", pcf: "10955" },
    ],
    inputs: [
      "Dispute submission (portal / EDI / email / phone)",
      "Invoice, PO, contract, pricing agreement, rebate terms",
      "Global delivery documentation",
      "Quality reports / inspection data",
      "Historical dispute analytics (→2.5 process mining)",
      "Customer credit profile (→2.1)",
      "SOX control requirements (→2.4)",
      "E-invoicing compliance data (→1.4)",
      "SLA framework (→2.6)",
    ],
    process: [
      { step: "P1", name: "Multi-Channel Intake", desc: "Disputes received via portal, EDI, email, phone — unified logging" },
      { step: "P2", name: "Auto-Validation & Dedup", desc: "System validates against invoice/PO, checks duplicates, flags known patterns" },
      { step: "P3", name: "AI-Assisted Categorization", desc: "Auto-categorize by type/subtype using historical patterns" },
      { step: "P4", name: "Routing & Assignment", desc: "Route to SSC (standard) or CoE (complex/high-value) based on rules" },
      { step: "P5", name: "Investigation (SLA-driven)", desc: "Cross-functional investigation with regional coordination" },
      { step: "P6", name: "Root Cause Analysis", desc: "Standardized RCA taxonomy, link to process mining insights (→2.5)" },
      { step: "P7", name: "Resolution Determination", desc: "Decision matrix: auto-resolve (low-value) or analyst proposal" },
      { step: "P8", name: "SOX-Compliant Approval", desc: "Tiered approval with SoD: analyst → manager → director → VP (→2.4)" },
      { step: "P9", name: "Execution & Customer Notification", desc: "Credit/debit memo, customer communication, AR update" },
      { step: "P10", name: "Close, Report & Prevent", desc: "Close in system, update analytics, feed prevention programs" },
    ],
    outputs: [
      "Resolved dispute with SOX-compliant audit trail (→2.4)",
      "Credit/debit memo across entities (→1.2)",
      "Root cause analytics & trend reports",
      "Prevention action items by department",
      "SLA performance by hub/category (→2.6)",
      "Process mining conformance data (→2.5)",
      "Customer experience impact assessment",
      "Dispute cost allocation report",
    ],
    customers: [
      { name: "External Customers (global)", pcf: "—" },
      { name: "Global Sales Leadership", pcf: "—" },
      { name: "SSC / BPO Operations (→2.6)", pcf: "10940" },
      { name: "CFO / Group Controller", pcf: "10820" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors", pcf: "10943" },
      { name: "Quality / Supply Chain Leadership", pcf: "10774" },
    ],
  },
  global: {
    suppliers: [
      { name: "Customer (omnichannel, multi-language)", pcf: "—" },
      { name: "Global Sales & Key Account Mgmt", pcf: "—" },
      { name: "GBS Dispute Operations (all hubs)", pcf: "10940" },
      { name: "Dispute Resolution CoE", pcf: "10940" },
      { name: "Global Supply Chain", pcf: "10756" },
      { name: "Quality / Product (global)", pcf: "10774" },
      { name: "Billing & E-Invoicing (→2.3, 1.4)", pcf: "10940" },
      { name: "Legal / Compliance / Regulatory", pcf: "10955" },
      { name: "AI/ML Platform", pcf: "10854" },
      { name: "Data & Analytics CoE", pcf: "10860" },
    ],
    inputs: [
      "Dispute submission (omnichannel: portal, EDI, API, email, phone, chatbot)",
      "Invoice, PO, contract, pricing, rebate, consignment terms",
      "Global delivery & logistics documentation",
      "Quality data, inspection reports, batch records",
      "Real-time dispute analytics & pattern detection (→2.5)",
      "Customer credit profile & risk segment (→2.1, 1.3)",
      "SOX + statutory control requirements (→2.4)",
      "E-invoicing compliance across jurisdictions (→1.4)",
      "GBS SLA framework (→2.6)",
      "M&A integration dispute backlog",
      "Regulatory dispute requirements by jurisdiction",
    ],
    process: [
      { step: "P1", name: "Omnichannel Intake", desc: "Multi-language, multi-channel intake with AI translation & routing" },
      { step: "P2", name: "AI Auto-Validation", desc: "ML validates claim against invoice/PO/contract, auto-resolves obvious errors" },
      { step: "P3", name: "AI Categorization & Scoring", desc: "ML categorizes, scores complexity, predicts resolution path & timeline" },
      { step: "P4", name: "Intelligent Routing", desc: "Route: auto-resolve (<threshold) / GBS hub (standard) / CoE (complex) / Legal (regulatory)" },
      { step: "P5", name: "Investigation (Follow-the-Sun)", desc: "Cross-hub, cross-functional investigation with hub handoff for 22h coverage" },
      { step: "P6", name: "AI-Assisted RCA", desc: "ML root cause analysis with process mining integration (→2.5)" },
      { step: "P7", name: "Resolution Optimization", desc: "ML-optimized resolution balancing cost, customer relationship, and precedent" },
      { step: "P8", name: "Multi-Jurisdiction Approval", desc: "Jurisdiction-aware SOX + statutory approval chain (→2.4)" },
      { step: "P9", name: "Global Execution", desc: "Credit/debit across entities and ERPs, multi-currency, e-invoice adjustments" },
      { step: "P10", name: "Customer Experience Recovery", desc: "Proactive communication, satisfaction check, relationship recovery" },
      { step: "P11", name: "Close, Analyze & Transform", desc: "Close, feed analytics, drive systemic prevention, update ML models" },
    ],
    outputs: [
      "Resolved dispute with multi-jurisdiction audit trail (→2.4)",
      "Global credit/debit memo processing (→1.2)",
      "AI-driven root cause analytics & predictions",
      "Systemic prevention programs by root cause",
      "GBS SLA performance across all hubs (→2.6)",
      "Process mining conformance & variant data (→2.5)",
      "Customer experience recovery metrics",
      "Dispute cost allocation by entity/hub/BPO",
      "Regulatory dispute compliance reports",
      "ML model performance & retraining data",
    ],
    customers: [
      { name: "Group CFO / Board Finance Committee", pcf: "10820" },
      { name: "Regional CFOs / Controllers", pcf: "10825" },
      { name: "Global Sales Leadership", pcf: "—" },
      { name: "GBS Operations (all hubs) (→2.6)", pcf: "10940" },
      { name: "Group Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors (Big 4)", pcf: "10943" },
      { name: "Regulators (multi-jurisdictional)", pcf: "10955" },
      { name: "Quality / Supply Chain (global)", pcf: "10774" },
      { name: "External Customers (global)", pcf: "—" },
    ],
  },
};

/* ══ SWIMLANE ════════════════════════════════════ */
const SWIMLANE_DATA = {
  sme: {
    lanes: ["Customer", "AR / Disputes", "Sales / Ops", "Finance Dir."],
    steps: [
      { lane: 0, label: "Raise dispute", type: "start" },
      { lane: 1, label: "Log & categorize", type: "task" },
      { lane: 1, label: "Pull invoice + delivery docs", type: "task" },
      { lane: 2, label: "Verify claim (pricing/quality/delivery)", type: "task" },
      { lane: 1, label: "Determine resolution", type: "decision" },
      { lane: 3, label: "Approve credit >$5K", type: "decision" },
      { lane: 1, label: "Post credit memo / reject", type: "task" },
      { lane: 0, label: "Receive resolution notice", type: "end" },
    ],
  },
  mid: {
    lanes: ["Customer", "Dispute Analyst", "Investigation Team", "Dispute Manager", "VP Finance", "ERP / Portal"],
    steps: [
      { lane: 0, label: "Submit via portal", type: "start" },
      { lane: 5, label: "Auto-validate & dedup", type: "system" },
      { lane: 1, label: "Categorize & prioritize", type: "task" },
      { lane: 1, label: "Assign investigation owner", type: "task" },
      { lane: 2, label: "Cross-functional investigation", type: "task" },
      { lane: 1, label: "Root cause analysis", type: "task" },
      { lane: 1, label: "Propose resolution", type: "task" },
      { lane: 1, label: "Approve ≤$25K", type: "decision" },
      { lane: 3, label: "Approve $25K–$100K", type: "decision" },
      { lane: 4, label: "Approve >$100K", type: "decision" },
      { lane: 5, label: "Post credit/debit memo", type: "system" },
      { lane: 0, label: "Receive resolution + letter", type: "end" },
    ],
  },
  enterprise: {
    lanes: ["Customer", "SSC Dispute Ops", "Dispute CoE", "Investigation Network", "Regional FD", "Global VP/CFO", "ERP / GRC"],
    steps: [
      { lane: 0, label: "Submit (multi-channel)", type: "start" },
      { lane: 6, label: "Auto-validate, dedup, pattern flag", type: "system" },
      { lane: 1, label: "AI-categorize & score", type: "task" },
      { lane: 1, label: "Route: standard → SSC", type: "decision" },
      { lane: 2, label: "Route: complex → CoE", type: "decision" },
      { lane: 3, label: "Cross-functional investigation", type: "task" },
      { lane: 2, label: "Root cause analysis (→2.5)", type: "task" },
      { lane: 1, label: "Resolution proposal", type: "task" },
      { lane: 1, label: "Approve ≤$50K", type: "decision" },
      { lane: 4, label: "Approve $50K–$500K", type: "decision" },
      { lane: 5, label: "Approve >$500K (SOX)", type: "decision" },
      { lane: 6, label: "SOX audit trail + memo posting", type: "system" },
      { lane: 0, label: "Resolution + satisfaction check", type: "end" },
    ],
  },
  global: {
    lanes: ["Customer", "GBS Hub Ops", "Dispute CoE", "AI/ML Platform", "Investigation Network", "Regional CFO", "Group CFO / Risk", "ERP / GRC / MDM"],
    steps: [
      { lane: 0, label: "Submit (omnichannel)", type: "start" },
      { lane: 3, label: "AI validate + auto-resolve simple", type: "system" },
      { lane: 3, label: "ML categorize + complexity score", type: "system" },
      { lane: 1, label: "Route: standard → GBS hub", type: "decision" },
      { lane: 2, label: "Route: complex → CoE", type: "decision" },
      { lane: 4, label: "Follow-the-sun investigation", type: "task" },
      { lane: 3, label: "AI root cause analysis (→2.5)", type: "system" },
      { lane: 2, label: "ML resolution optimization", type: "task" },
      { lane: 1, label: "Approve ≤$100K", type: "decision" },
      { lane: 5, label: "Approve $100K–$1M", type: "decision" },
      { lane: 6, label: "Approve >$1M (Board)", type: "decision" },
      { lane: 7, label: "Multi-jurisdiction SOX trail", type: "system" },
      { lane: 7, label: "Global memo posting (all ERPs)", type: "system" },
      { lane: 0, label: "Resolution + experience recovery", type: "end" },
    ],
  },
};

/* ══ RACI ═════════════════════════════════════════ */
const RACI_ROLES = {
  sme: ["Finance Dir.", "AR / Disputes", "Sales / Ops", "IT"],
  mid: ["VP Finance", "Dispute Mgr", "Dispute Analyst", "Sales", "Ops / QA", "IT/ERP"],
  enterprise: ["Global CFO", "Dispute CoE Lead", "SSC Dispute Ops", "Regional FD", "Sales", "Ops/QA/SC", "Legal", "Internal Audit"],
  global: ["Group CFO", "Dispute CoE Global", "GBS Hub Ops", "Regional CFOs", "Sales/KAM", "AI/ML CoE", "Ops/QA/SC", "Legal/Compliance", "Internal Audit"],
};
const RACI_ACTIVITIES = {
  sme: [
    { activity: "Dispute Policy Definition", pcf: "10820", raci: ["A", "R", "C", "I"] },
    { activity: "Dispute Intake & Logging", pcf: "10940", raci: ["I", "R", "C", "I"] },
    { activity: "Categorization", pcf: "10940", raci: ["I", "R", "I", "I"] },
    { activity: "Investigation", pcf: "10940", raci: ["I", "R", "R", "I"] },
    { activity: "Resolution Decision", pcf: "10940", raci: ["A", "R", "C", "I"] },
    { activity: "Credit Memo Processing", pcf: "10940", raci: ["I", "R", "I", "C"] },
    { activity: "Customer Communication", pcf: "10940", raci: ["I", "R", "C", "I"] },
    { activity: "Root Cause Reporting", pcf: "10940", raci: ["C", "R", "C", "I"] },
  ],
  mid: [
    { activity: "Dispute Policy & Taxonomy", pcf: "10820", raci: ["A", "R", "C", "I", "C", "I"] },
    { activity: "Portal Configuration & Intake", pcf: "10854", raci: ["I", "C", "R", "I", "I", "A"] },
    { activity: "Validation & Deduplication", pcf: "10940", raci: ["I", "C", "R", "I", "I", "C"] },
    { activity: "Categorization & Assignment", pcf: "10940", raci: ["I", "A", "R", "I", "I", "I"] },
    { activity: "Investigation Coordination", pcf: "10940", raci: ["I", "A", "R", "C", "R", "I"] },
    { activity: "Root Cause Analysis", pcf: "10940", raci: ["I", "A", "R", "I", "R", "I"] },
    { activity: "Approval ≤$25K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I"] },
    { activity: "Approval $25K–$100K", pcf: "10940", raci: ["I", "A/R", "R", "I", "I", "I"] },
    { activity: "Approval >$100K", pcf: "10940", raci: ["A/R", "R", "C", "C", "I", "I"] },
    { activity: "Credit Memo Execution", pcf: "10940", raci: ["I", "I", "R", "I", "I", "C"] },
    { activity: "Customer Communication", pcf: "10940", raci: ["I", "C", "R", "C", "I", "I"] },
    { activity: "Trend Reporting & Prevention", pcf: "10940", raci: ["C", "A", "R", "I", "R", "I"] },
    { activity: "SOX Compliance (→2.4)", pcf: "10943", raci: ["A", "R", "C", "I", "I", "C"] },
  ],
  enterprise: [
    { activity: "Global Dispute Policy", pcf: "10820", raci: ["A", "R", "C", "C", "C", "C", "C", "C"] },
    { activity: "Multi-Channel Intake Config", pcf: "10854", raci: ["I", "A", "R", "I", "I", "I", "I", "I"] },
    { activity: "AI Categorization & Routing", pcf: "10940", raci: ["I", "A", "R", "I", "I", "C", "I", "I"] },
    { activity: "Standard Investigation (SSC)", pcf: "10940", raci: ["I", "C", "A/R", "I", "C", "R", "I", "I"] },
    { activity: "Complex Investigation (CoE)", pcf: "10940", raci: ["I", "A/R", "C", "I", "C", "R", "C", "I"] },
    { activity: "Root Cause Analysis (→2.5)", pcf: "10940", raci: ["I", "A", "R", "I", "I", "R", "I", "I"] },
    { activity: "Approval ≤$50K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I", "I", "I"] },
    { activity: "Approval $50K–$500K", pcf: "10940", raci: ["I", "C", "R", "A/R", "I", "I", "I", "I"] },
    { activity: "Approval >$500K (SOX)", pcf: "10940", raci: ["A/R", "R", "C", "C", "C", "I", "C", "C"] },
    { activity: "Cross-Entity Memo Processing", pcf: "10940", raci: ["I", "C", "R", "C", "I", "I", "I", "I"] },
    { activity: "Prevention Programs", pcf: "10940", raci: ["C", "A", "C", "C", "R", "R", "I", "I"] },
    { activity: "SOX Controls (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "I", "I", "R", "R"] },
  ],
  global: [
    { activity: "Global Dispute Governance", pcf: "10820", raci: ["A", "R", "C", "C", "C", "I", "C", "C", "C"] },
    { activity: "Omnichannel Intake Platform", pcf: "10854", raci: ["I", "A", "R", "I", "I", "R", "I", "I", "I"] },
    { activity: "AI Auto-Validation & Resolve", pcf: "10940", raci: ["I", "A", "I", "I", "I", "R", "I", "I", "I"] },
    { activity: "ML Categorization & Scoring", pcf: "10940", raci: ["I", "A", "C", "I", "I", "R", "I", "I", "I"] },
    { activity: "GBS Hub Investigation", pcf: "10940", raci: ["I", "C", "A/R", "I", "C", "I", "R", "I", "I"] },
    { activity: "CoE Complex Investigation", pcf: "10940", raci: ["I", "A/R", "C", "I", "C", "C", "R", "C", "I"] },
    { activity: "AI Root Cause (→2.5)", pcf: "10940", raci: ["I", "A", "C", "I", "I", "R", "C", "I", "I"] },
    { activity: "ML Resolution Optimization", pcf: "10940", raci: ["I", "A", "C", "I", "C", "R", "I", "I", "I"] },
    { activity: "Approval ≤$100K", pcf: "10940", raci: ["I", "I", "A/R", "I", "I", "I", "I", "I", "I"] },
    { activity: "Approval $100K–$1M", pcf: "10940", raci: ["I", "C", "R", "A/R", "C", "I", "I", "I", "I"] },
    { activity: "Approval >$1M (Board)", pcf: "10940", raci: ["A/R", "R", "C", "C", "C", "I", "I", "C", "C"] },
    { activity: "Global Memo Processing", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I", "I", "I", "I"] },
    { activity: "Experience Recovery Program", pcf: "10940", raci: ["I", "A", "R", "I", "R", "I", "I", "I", "I"] },
    { activity: "Systemic Prevention", pcf: "10940", raci: ["C", "A", "C", "C", "R", "R", "R", "I", "I"] },
    { activity: "SOX + Statutory (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "I", "C", "I", "R", "R"] },
    { activity: "Process Mining (→2.5)", pcf: "10860", raci: ["I", "C", "I", "I", "I", "A/R", "I", "I", "I"] },
  ],
};

/* ══ SOP ══════════════════════════════════════════ */
const SOP_DATA = {
  sme: {
    title: "SOP-DR-001: Dispute Resolution Procedure",
    scope: "All customer disputes including pricing, billing, delivery, and quality claims",
    categories: [
      { name: "Pricing", code: "PRC", sla: "10 BD", examples: "Wrong price, missing discount, rebate error" },
      { name: "Billing", code: "BIL", sla: "5 BD", examples: "Duplicate invoice, wrong quantity, tax error" },
      { name: "Delivery", code: "DEL", sla: "10 BD", examples: "Short shipment, damaged goods, late delivery" },
      { name: "Quality", code: "QAL", sla: "15 BD", examples: "Defective product, spec mismatch, contamination" },
    ],
    sections: [
      { name: "1. Intake", steps: ["Receive dispute via email/phone from customer or sales", "Log in dispute tracker: customer, invoice, amount, description", "Assign category (PRC/BIL/DEL/QAL) and priority (High >$5K, Standard ≤$5K)"] },
      { name: "2. Investigation", steps: ["Pull original invoice and supporting documentation", "Verify claim against delivery records / pricing agreement", "Contact sales or warehouse for additional context if needed", "Document findings in dispute file"] },
      { name: "3. Resolution", steps: ["Billing errors: correct and issue credit memo immediately", "Pricing disputes: verify against contract, adjust if valid", "Delivery/quality: coordinate with ops, determine liability", "If rejected: document rationale and prepare customer response"] },
      { name: "4. Approval & Execution", steps: ["Credits ≤$5K: AR team approves and processes", "Credits >$5K: Finance Director approval required", "Post credit memo in ERP, update AR aging", "Send resolution notification to customer with explanation"] },
      { name: "5. Close & Report", steps: ["Close dispute in tracker with resolution code and root cause", "Monthly: review dispute volume and trends", "Identify top 3 root causes, recommend process fixes to ops/sales"] },
    ],
    escalation: "Disputes >$10K or unresolved >15 BD → Finance Director. Customer threatening legal action → immediate escalation",
  },
  mid: {
    title: "SOP-DR-001: Dispute Management — Multi-Entity Standard Operating Procedure",
    scope: "All customer disputes across all entities, including pricing, billing, delivery, quality, and commercial disputes",
    categories: [
      { name: "Pricing", code: "PRC", sla: "7 BD", examples: "Price discrepancy, missing discount/rebate, contract pricing error" },
      { name: "Billing", code: "BIL", sla: "5 BD", examples: "Duplicate invoice, quantity error, tax/VAT miscalculation, wrong entity" },
      { name: "Delivery", code: "DEL", sla: "10 BD", examples: "Short shipment, damaged in transit, wrong product, late delivery" },
      { name: "Quality", code: "QAL", sla: "15 BD", examples: "Defective product, out of spec, contamination, warranty claim" },
      { name: "Commercial", code: "COM", sla: "15 BD", examples: "Rebate dispute, volume discount, promotional pricing, returns" },
      { name: "Administrative", code: "ADM", sla: "3 BD", examples: "Wrong PO reference, remittance advice error, payment allocation" },
    ],
    sections: [
      { name: "1. Intake & Validation", steps: ["Customer submits via dispute portal (preferred) or email", "System auto-logs with timestamp and auto-assigns reference number", "Auto-validation: check invoice exists, amount matches claim, no duplicate dispute", "If invalid: return to customer within 1 BD with clarification request"] },
      { name: "2. Categorization & Assignment", steps: ["Auto-categorize based on dispute description keywords", "Analyst validates category and assigns subcategory from taxonomy", "Priority assignment: Critical (>$50K), High ($10K–$50K), Standard (<$10K)", "Assign to investigation owner based on category and entity", "SLA clock starts at validated registration"] },
      { name: "3. Investigation", steps: ["Pull all supporting docs: invoice, PO, contract, delivery records", "For pricing: verify against pricing master and contract terms", "For delivery: obtain POD, carrier records, warehouse confirmation", "For quality: request inspection report, product batch records", "Cross-functional outreach within 2 BD of assignment", "All evidence logged in dispute file with timestamps"] },
      { name: "4. Root Cause & Resolution", steps: ["Apply root cause taxonomy: Process Error / System Error / Customer Error / External", "Subcategorize: e.g., 'Process Error → Pricing Master Not Updated'", "Resolution options: Full Credit / Partial Credit / Rebill / Reject / Commercial Gesture", "Prepare resolution proposal with supporting evidence and financials", "For rejected claims: prepare detailed rationale and supporting data"] },
      { name: "5. Approval", steps: ["≤$25K: Dispute Analyst approves", "$25K–$100K: Dispute Manager approves", ">$100K: VP Finance approves", "Approver ≠ investigation owner (SOX requirement →2.4)", "All approvals with digital signature and timestamp"] },
      { name: "6. Execution & Communication", steps: ["Process credit memo or adjustment in ERP", "For multi-entity: coordinate memo posting across relevant entities", "Send resolution letter to customer (approved template)", "Copy sales/account management on resolution", "Update AR aging and collections status (→1.3)"] },
      { name: "7. Close & Prevention", steps: ["Close dispute in system with full audit trail", "Feed root cause data to monthly trend report", "Quarterly: top 10 root causes reviewed with ops/sales/quality", "Assign prevention action items with owners and deadlines", "Track prevention impact on dispute rate in subsequent quarters"] },
    ],
    escalation: ">$100K or unresolved >SLA+5 BD → VP Finance. Legal threats → Legal + VP Finance. Repeat disputes (3+ same root cause) → process owner escalation",
  },
  enterprise: {
    title: "SOP-DR-001: Enterprise Dispute Resolution — SSC/CoE Model",
    scope: "Global dispute resolution across SSC hubs, CoE, and BPO partners with SOX compliance",
    categories: [
      { name: "Pricing", code: "PRC", sla: "5 BD (SSC) / 10 BD (CoE)", examples: "Price, discount, rebate, contract terms, intercompany pricing" },
      { name: "Billing", code: "BIL", sla: "3 BD", examples: "Duplicate, quantity, tax/VAT, entity, e-invoice rejection (→1.4)" },
      { name: "Delivery", code: "DEL", sla: "7 BD", examples: "Short/wrong/damaged shipment, late delivery, POD disputes" },
      { name: "Quality", code: "QAL", sla: "15 BD", examples: "Defective, out-of-spec, warranty, recall-related" },
      { name: "Commercial", code: "COM", sla: "15 BD (CoE)", examples: "Rebates, volume discounts, promotional, returns, consignment" },
      { name: "Administrative", code: "ADM", sla: "2 BD", examples: "PO reference, remittance, payment allocation, duplicate payment" },
      { name: "Regulatory", code: "REG", sla: "10 BD (Legal)", examples: "E-invoice compliance, tax audit, regulatory penalty dispute" },
    ],
    sections: [
      { name: "1. Multi-Channel Intake", steps: ["Disputes received via: portal (60%+ target), EDI, email parsing, phone (logged by agent)", "Auto-registration with unique global dispute ID", "Auto-validation against invoice data, PO, and delivery records", "Duplicate detection against open and recently closed disputes", "Pattern recognition: flag if customer has >3 open disputes or repeat root cause"] },
      { name: "2. AI-Assisted Categorization & Routing", steps: ["ML model categorizes by type/subtype (target: 85% accuracy)", "Complexity scoring: Simple (auto-resolve eligible) / Standard (SSC) / Complex (CoE) / Legal", "Auto-resolve: billing ADM disputes <$1K with clear evidence → instant credit", "Standard → SSC hub based on entity/region", "Complex → Dispute CoE for specialist handling", "Regulatory → Legal team with compliance escalation"] },
      { name: "3. SLA-Driven Investigation", steps: ["Investigation owner assigned within 4 hours of registration", "Evidence request to relevant departments within 1 BD", "Cross-functional response SLA: 3 BD for all departments", "For cross-entity disputes: lead hub coordinates with affected entities", "BPO partner investigation follows same SLA framework (→2.6)", "All evidence timestamped in dispute management system", "Process mining event logged at each stage (→2.5)"] },
      { name: "4. Root Cause Analysis", steps: ["Standardized RCA taxonomy: 4 levels deep", "Level 1: Internal Process / Internal System / Customer / External / BPO", "Level 2-4: Detailed subcategories per department/process", "Link to process mining variant analysis where applicable (→2.5)", "Systemic flag: mark if root cause affects >5 customers or >$100K exposure"] },
      { name: "5. SOX-Compliant Approval", steps: ["≤$50K: SSC Analyst + independent reviewer", "$50K–$500K: Regional FD with CoE recommendation", ">$500K: Global CFO/VP with full documentation package", "Segregation of duties: investigator ≠ approver (→2.4)", "All approvals digitally signed in GRC system", "Audit trail retained 7+ years"] },
      { name: "6. Execution & Recovery", steps: ["Credit/debit memo processed across all relevant entities and ERPs", "E-invoice adjustment submitted where required (→1.4)", "Customer notified via preferred channel within 1 BD of approval", "High-value (>$100K): account manager conducts relationship recovery call", "AR aging and collections status updated (→1.3)", "Credit risk reassessment trigger if material write-down (→2.1)"] },
      { name: "7. Analytics & Prevention", steps: ["Real-time dispute dashboard: volume, aging, SLA, root cause, cost", "Weekly: SSC hub dispute review with SLA performance", "Monthly: CoE produces global root cause trend report", "Quarterly: executive review of top systemic issues with prevention roadmap", "Prevention action tracking with measurable impact targets", "Feed dispute patterns to process mining for conformance monitoring (→2.5)"] },
    ],
    escalation: ">$500K → Global CFO. Legal/regulatory → Legal + Compliance within 4 hours. Systemic (>$100K or >5 customers) → CoE Lead + relevant process owner within 24 hours. SLA breach → auto-escalation per governance matrix (→2.6)",
  },
  global: {
    title: "SOP-DR-001: Global GBS Dispute Resolution — AI-Enhanced Full Lifecycle",
    scope: "Global dispute operations across all GBS hubs, jurisdictions, and M&A integrations with AI/ML augmentation",
    categories: [
      { name: "Pricing", code: "PRC", sla: "3 BD (auto) / 5 BD (hub) / 10 BD (CoE)", examples: "Price, discount, rebate, contract, intercompany, transfer pricing" },
      { name: "Billing", code: "BIL", sla: "2 BD (auto) / 3 BD (hub)", examples: "Duplicate, quantity, tax, entity, e-invoice rejection (22 jurisdictions)" },
      { name: "Delivery", code: "DEL", sla: "5 BD (hub) / 10 BD (complex)", examples: "Short/wrong/damaged, late, cross-border logistics, customs" },
      { name: "Quality", code: "QAL", sla: "10 BD (hub) / 20 BD (complex)", examples: "Defective, out-of-spec, warranty, recall, batch-level" },
      { name: "Commercial", code: "COM", sla: "10 BD (CoE)", examples: "Rebates, volume, promotional, returns, consignment, SLA penalty" },
      { name: "Administrative", code: "ADM", sla: "1 BD (auto)", examples: "PO ref, remittance, allocation — 90%+ auto-resolve target" },
      { name: "Regulatory", code: "REG", sla: "5 BD (Legal)", examples: "E-invoice, tax audit, statutory, cross-border regulatory" },
      { name: "Intercompany", code: "ICO", sla: "10 BD (CoE)", examples: "IC pricing, netting disputes, transfer pricing adjustments" },
    ],
    sections: [
      { name: "1. Omnichannel AI Intake", steps: ["Multi-language intake: portal, EDI, API, email (NLP parsing), phone (transcription), chatbot", "AI auto-translation for non-English submissions", "Real-time validation against invoice/PO/contract data across all ERPs", "AI duplicate detection (including cross-entity and cross-hub)", "Pattern recognition: real-time flagging of dispute clusters by customer/product/region", "Auto-assign global dispute ID with jurisdiction and hub coding"] },
      { name: "2. ML Classification & Intelligent Routing", steps: ["Ensemble ML model: categorize + subcategorize (target: 92% accuracy)", "Complexity scoring on 5 dimensions: value, evidence clarity, cross-functional need, precedent, jurisdiction", "Auto-resolve tier: ADM <$2K + BIL <$5K with clear evidence → instant credit (human audit sample 10%)", "GBS hub tier: standard disputes within hub expertise → local team", "CoE tier: complex, high-value, cross-entity, or regulatory → specialist", "Legal tier: regulatory disputes, litigation risk, cross-border compliance", "Follow-the-sun assignment: route to active hub for fastest response"] },
      { name: "3. AI-Augmented Investigation", steps: ["Investigation owner assigned within 2 hours (follow-the-sun)", "AI pre-populates investigation package: relevant docs, similar past disputes, suggested resolution", "Cross-functional evidence request with auto-follow-up at 48 hours", "Cross-hub coordination via dispute collaboration platform", "BPO partner investigation per SLA framework (→2.6)", "Real-time process mining tracking of investigation steps (→2.5)", "AI flags investigation bottlenecks and suggests acceleration paths"] },
      { name: "4. AI-Driven Root Cause Analysis", steps: ["ML root cause prediction from dispute description + investigation data", "5-level RCA taxonomy with multi-language support", "Auto-link to process mining variant data (→2.5)", "Systemic detection: ML identifies clusters across customers/products/regions/hubs", "Impact modeling: estimate total exposure for systemic issues", "Auto-generate prevention recommendation based on historical resolution patterns"] },
      { name: "5. Multi-Jurisdiction Approval", steps: ["≤$100K: GBS Hub Ops (dual control)", "$100K–$1M: Regional CFO + CoE recommendation", ">$1M: Group CFO + Board Risk Committee briefing", "Jurisdiction-aware SOX + statutory approval requirements (→2.4)", "Full digital audit trail in global GRC system", "Segregation of duties enforced by system across all hubs", "10-year retention with multi-jurisdiction compliance"] },
      { name: "6. Global Execution & Experience Recovery", steps: ["Credit/debit memo processing across all entities and ERPs globally", "Multi-currency adjustments with automatic FX handling", "E-invoice correction per jurisdiction requirements (→1.4)", "Customer notification via preferred channel in their language", ">$250K: structured relationship recovery program with KAM", "AR aging and credit risk auto-update (→1.3, 2.1)", "Process mining event capture for conformance tracking (→2.5)"] },
      { name: "7. Analytics, AI Learning & Transformation", steps: ["Real-time global dispute dashboard: volume, value, SLA, root cause, cost by hub/entity/category", "AI-generated weekly insights report for hub leaders", "Monthly: global root cause trend analysis with predictive modeling", "Quarterly: executive review with prevention ROI analysis", "Continuous: ML model retraining on new resolution patterns", "Systemic prevention tracking with P&L impact attribution", "Annual: dispute management maturity assessment per hub"] },
    ],
    escalation: ">$1M → Group CFO + Board Risk. Legal/regulatory → Group Legal within 2 hours. Systemic (>$500K or >10 customers) → CoE Lead + Group Controller within 12 hours. Hub SLA breach → auto-escalation with GBS governance (→2.6). AI confidence <60% → mandatory human review",
  },
};

/* ══ KPI ══════════════════════════════════════════ */
const KPI_DATA = {
  sme: [
    { kpi: "Dispute Resolution Time", formula: "Avg BD from intake to close", target: "≤ 10 BD", benchmark: "APQC: Median 14 BD", category: "Speed" },
    { kpi: "Disputes Within SLA", formula: "Closed within category SLA / Total", target: "≥ 85%", benchmark: "Hackett: Median 78%", category: "Speed" },
    { kpi: "Dispute Rate", formula: "Disputes / Total invoices", target: "≤ 5%", benchmark: "APQC: Median 4.8%", category: "Volume" },
    { kpi: "Credit Memo as % of Revenue", formula: "Credit memo value / Revenue", target: "≤ 1.5%", benchmark: "APQC: Median 1.2%", category: "Financial" },
    { kpi: "Disputes Open >30 Days", formula: "Open >30 days / Total open", target: "≤ 10%", benchmark: "—", category: "Volume" },
    { kpi: "Root Cause Documentation", formula: "Disputes with RCA / Total closed", target: "≥ 80%", benchmark: "—", category: "Quality" },
  ],
  mid: [
    { kpi: "SLA Achievement", formula: "Closed within SLA / Total closed", target: "≥ 90%", benchmark: "Hackett: Top quartile 92%", category: "Speed" },
    { kpi: "Avg. Resolution Time", formula: "Average BD by category", target: "≤ 8 BD (blended)", benchmark: "APQC: Top quartile 9 BD", category: "Speed" },
    { kpi: "First Contact Resolution", formula: "Resolved without cross-functional escalation / Total", target: "≥ 25%", benchmark: "—", category: "Speed" },
    { kpi: "Dispute Rate", formula: "Disputes / Total invoices", target: "≤ 3.5%", benchmark: "APQC: Top quartile 3.2%", category: "Volume" },
    { kpi: "Repeat Dispute Rate", formula: "Same customer + same root cause within 12mo", target: "≤ 8%", benchmark: "—", category: "Quality" },
    { kpi: "Credit Memo % of Revenue", formula: "Credit memo value / Revenue", target: "≤ 1.0%", benchmark: "APQC: Top quartile 0.8%", category: "Financial" },
    { kpi: "Dispute Cost per Resolution", formula: "Total dispute dept cost / Resolutions", target: "≤ $45", benchmark: "APQC: Median $52", category: "Financial" },
    { kpi: "Root Cause Completion", formula: "Full RCA / Total closed", target: "≥ 95%", benchmark: "—", category: "Quality" },
    { kpi: "SOX Compliance (→2.4)", formula: "Approval chain adherence", target: "100%", benchmark: "—", category: "Compliance" },
  ],
  enterprise: [
    { kpi: "Global SLA Achievement", formula: "Within SLA across all hubs", target: "≥ 92%", benchmark: "Hackett: Top quartile 94%", category: "Speed" },
    { kpi: "Avg. Resolution by Complexity", formula: "Simple / Standard / Complex BD", target: "≤ 2 / 7 / 15 BD", benchmark: "—", category: "Speed" },
    { kpi: "Auto-Resolve Rate", formula: "Auto-resolved / Total eligible", target: "≥ 20%", benchmark: "Hackett: Top quartile 25%", category: "Speed" },
    { kpi: "Dispute Rate", formula: "Disputes / Total invoices", target: "≤ 2.5%", benchmark: "APQC: Top quartile 2.2%", category: "Volume" },
    { kpi: "Repeat Dispute Rate", formula: "Same root cause recurrence", target: "≤ 5%", benchmark: "—", category: "Quality" },
    { kpi: "Credit Memo % Revenue", formula: "Credit memo / Revenue (consolidated)", target: "≤ 0.7%", benchmark: "APQC: Top quartile 0.6%", category: "Financial" },
    { kpi: "Prevention Impact", formula: "YoY dispute volume reduction from prevention", target: "≥ 10% reduction", benchmark: "—", category: "Quality" },
    { kpi: "Customer Satisfaction (CSAT)", formula: "Post-resolution survey score", target: "≥ 4.0 / 5.0", benchmark: "—", category: "Quality" },
    { kpi: "Cost per Resolution", formula: "Blended cost per resolution", target: "≤ $30", benchmark: "APQC: Top quartile $28", category: "Financial" },
    { kpi: "SOX Compliance (→2.4)", formula: "Zero SoD violations", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance score", target: "≥ 90%", benchmark: "—", category: "Compliance" },
  ],
  global: [
    { kpi: "Global SLA Achievement", formula: "SLA across all hubs and jurisdictions", target: "≥ 95%", benchmark: "Hackett: World-class 96%", category: "Speed" },
    { kpi: "AI Auto-Resolve Rate", formula: "AI auto-resolved / Total", target: "≥ 35%", benchmark: "—", category: "Speed" },
    { kpi: "Avg. Resolution (Global)", formula: "Auto / Hub / CoE / Legal BD", target: "≤ 1 / 5 / 12 / 20 BD", benchmark: "—", category: "Speed" },
    { kpi: "AI Categorization Accuracy", formula: "Correct AI category / Total AI-categorized", target: "≥ 92%", benchmark: "—", category: "Quality" },
    { kpi: "Dispute Rate (Global)", formula: "Disputes / Total invoices (consolidated)", target: "≤ 2.0%", benchmark: "APQC: World-class 1.8%", category: "Volume" },
    { kpi: "Repeat Dispute Rate", formula: "Same root cause recurrence (global)", target: "≤ 3%", benchmark: "—", category: "Quality" },
    { kpi: "Credit Memo % Revenue", formula: "Global credit memo / Revenue", target: "≤ 0.5%", benchmark: "APQC: World-class 0.4%", category: "Financial" },
    { kpi: "Prevention ROI", formula: "Dispute cost avoided / Prevention investment", target: "≥ 3:1", benchmark: "—", category: "Financial" },
    { kpi: "Customer Experience Score", formula: "Post-resolution NPS / CSAT", target: "NPS ≥ 40, CSAT ≥ 4.2", benchmark: "—", category: "Quality" },
    { kpi: "Cost per Resolution (Global)", formula: "Blended across all hubs", target: "≤ $22", benchmark: "APQC: World-class $18", category: "Financial" },
    { kpi: "SOX + Statutory (→2.4)", formula: "Zero findings all jurisdictions", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance for disputes", target: "≥ 92%", benchmark: "—", category: "Compliance" },
    { kpi: "ML Model Performance", formula: "Categorization + resolution prediction accuracy", target: "≥ 90% / ≥ 80%", benchmark: "—", category: "Quality" },
  ],
};

/* ── CROSS-REFS ─────────────────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "Dispute process codes and activity hierarchy" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Credit memo processing, payment adjustment workflows" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Dispute status affects collections strategy and aging" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "E-invoice correction and compliance for dispute adjustments" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "Dispute KPIs integrated into AR dashboard" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Dispute management maturity scoring dimension" },
  { code: "2.1", name: "Credit Management Process Pack", relevance: "Dispute patterns trigger credit risk reassessment" },
  { code: "2.3", name: "Billing & Invoicing Process Pack", relevance: "Billing errors are a primary dispute root cause" },
  { code: "2.4", name: "SOX Compliance Controls Library", relevance: "SoD on approvals, audit trail, credit memo controls" },
  { code: "2.5", name: "Process Mining Playbook", relevance: "Dispute process conformance and variant analysis" },
  { code: "2.6", name: "Shared Services Transition Guide", relevance: "SSC/GBS dispute ops, SLA framework, hub governance" },
];

/* ══════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════ */
const raciColor = (v) => { if (v === "A" || v === "A/R") return "#FB923C"; if (v === "R") return "#22D3EE"; if (v === "C") return "#A78BFA"; if (v === "I") return "rgba(255,255,255,0.15)"; return "transparent"; };
const raciText = (v) => { if (v === "I") return "rgba(255,255,255,0.35)"; return "#0B0F1A"; };
const stepTypeColor = (t, accent) => { if (t === "start") return "#34D399"; if (t === "end") return "#EF4444"; if (t === "decision") return "#FBBF24"; if (t === "system") return "#60A5FA"; return accent; };

export default function DisputeResolutionProcessPack() {
  const live = useLiveActuals();
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("sipoc");
  const [kpiFilter, setKpiFilter] = useState("All");
  const [showXref, setShowXref] = useState(false);

  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

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
            <div style={{ padding: 12 }}>{col.items.map((item, i) => (
              <div key={i} style={{ padding: "8px 10px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `2px solid ${col.key === "process" ? accent : "rgba(255,255,255,0.08)"}`, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{item}</div>
            ))}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSwimlane = () => {
    const data = SWIMLANE_DATA[tier];
    return (
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 700 }}>
          {data.lanes.map((lane, li) => {
            const laneSteps = data.steps.filter((s) => s.lane === li);
            return (
              <div key={li} style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", minHeight: 52 }}>
                <div style={{ width: 150, minWidth: 150, padding: "12px 14px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{lane}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8, flexWrap: "wrap" }}>
                  {laneSteps.map((step, si) => (
                    <div key={si} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ padding: "6px 12px", borderRadius: 6, background: stepTypeColor(step.type, accent) + "22", border: `1px solid ${stepTypeColor(step.type, accent)}44`, fontSize: 11, color: stepTypeColor(step.type, accent), fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>{step.label}</div>
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
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color + "44", border: `1px solid ${l.color}66`, display: "inline-block" }} />{l.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRACI = () => {
    const roles = RACI_ROLES[tier];
    const activities = RACI_ACTIVITIES[tier];
    return (
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
          <thead><tr>
            <th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", left: 0, background: "#0B0F1A", zIndex: 2 }}>Activity</th>
            <th style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace" }}>PCF</th>
            {roles.map((r, i) => (<th key={i} style={{ padding: "10px 6px", textAlign: "center", color: "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{r}</th>))}
          </tr></thead>
          <tbody>{activities.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.8)", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", position: "sticky", left: 0, background: ri % 2 === 0 ? "#0B0F1A" : "#0d1120", zIndex: 1 }}>{row.activity}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'JetBrains Mono', monospace" }}>{row.pcf}</td>
              {row.raci.map((v, ci) => (<td key={ci} style={{ padding: "6px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, background: raciColor(v), color: raciText(v), fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28 }}>{v}</span></td>))}
            </tr>
          ))}</tbody>
        </table>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[{ label: "A = Accountable", color: "#FB923C" }, { label: "R = Responsible", color: "#22D3EE" }, { label: "C = Consulted", color: "#A78BFA" }, { label: "I = Informed", color: "rgba(255,255,255,0.15)" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: "inline-block" }} />{l.label}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderSOP = () => {
    const data = SOP_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>{data.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Scope: {data.scope}</div>
        </div>
        {/* Dispute Category Matrix */}
        <div style={{ marginBottom: 16, overflowX: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Dispute Categories & SLAs</div>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11 }}>
            <thead><tr>
              {["Category", "Code", "SLA", "Examples"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{data.categories.map((cat, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cat.name}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ padding: "2px 6px", borderRadius: 3, background: accent + "22", color: accent, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{cat.code}</span></td>
                <td style={{ padding: "7px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cat.sla}</td>
                <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.5)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cat.examples}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {/* SOP Sections */}
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
        <div style={{ marginTop: 12, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Escalation Matrix</span>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.escalation}</div>
        </div>
      </div>
    );
  };

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
                <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", whiteSpace: "nowrap", marginLeft: 8 }}>{kpi.category}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{kpi.formula}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>TARGET </span><span style={{ fontSize: 12, color: accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.target}</span></div>
                <div style={{ textAlign: "right" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>BENCH </span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>{kpi.benchmark}</span></div>
              </div>
              {getKpiActual(kpi.kpi, live) && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>ACTUAL </span><span style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{getKpiActual(kpi.kpi, live)}</span></div>
                  <span style={{ ...liveBadgeStyle() }}>● LIVE</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.2</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Dispute Resolution Process Pack</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>Dispute categorization, investigation workflows, root cause analysis, SLA-driven resolution, prevention programs</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TIERS.map((t) => (
          <button key={t.key} onClick={() => { setTier(t.key); setKpiFilter("All"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`, background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)", color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tier === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <div>{t.label}</div><div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`, background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
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
          <span style={{ transform: showXref ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>Cross-Reference Index ({XREFS.length} linked deliverables)
        </button>
        {showXref && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8, marginTop: 12 }}>
            {XREFS.map((xr) => (
              <div key={xr.code} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>{xr.code}</span>
                <div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{xr.name}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{xr.relevance}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>APQC PCF v8.0 · Hackett World-Class Metrics 2026 · SSON 2025</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.2 — Dispute Resolution Process Pack · v1.0</span>
      </div>
    </div>
  );
}
