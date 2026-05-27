import { useState } from "react";
import { useMockDatabase } from './context/MockDatabaseContext';
import { evaluateRules } from './ruleEngine';

/* ─────────────────────────────────────────────────
   2.3 — Billing & Invoicing Process Pack
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
      { name: "Sales / Order Management", pcf: "—" },
      { name: "Warehouse / Shipping", pcf: "10756" },
      { name: "Finance / AR Team", pcf: "10940" },
      { name: "Customer (PO source)", pcf: "—" },
    ],
    inputs: [
      "Confirmed sales order / service completion",
      "Delivery confirmation / proof of delivery",
      "Customer purchase order (PO)",
      "Pricing master / contract terms",
      "Tax rates and rules",
    ],
    process: [
      { step: "P1", name: "Delivery / Service Confirmation", desc: "Verify goods shipped or service rendered" },
      { step: "P2", name: "Invoice Creation", desc: "Generate invoice from order/delivery data in ERP" },
      { step: "P3", name: "Invoice Validation", desc: "Check pricing, quantities, tax, PO reference" },
      { step: "P4", name: "Invoice Approval", desc: "Finance review for invoices above threshold" },
      { step: "P5", name: "Invoice Delivery", desc: "Send to customer via email or print" },
      { step: "P6", name: "AR Posting & Aging", desc: "Post to AR sub-ledger, start aging clock" },
    ],
    outputs: [
      "Issued invoice to customer",
      "AR posting with aging start (→1.2, 1.3)",
      "Invoice copy in document archive",
      "Revenue recognition entry",
    ],
    customers: [
      { name: "External Customer", pcf: "—" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "Finance Director", pcf: "10820" },
      { name: "External Auditors", pcf: "10943" },
    ],
  },
  mid: {
    suppliers: [
      { name: "Sales / Order Management", pcf: "—" },
      { name: "Supply Chain / Logistics", pcf: "10756" },
      { name: "Contract Management", pcf: "10955" },
      { name: "AR / Billing Team", pcf: "10940" },
      { name: "Tax / Compliance", pcf: "10820" },
      { name: "Customer (PO / contract)", pcf: "—" },
    ],
    inputs: [
      "Sales order (approved, credit-checked →2.1)",
      "Delivery confirmation / POD / service acceptance",
      "Customer PO and contract terms",
      "Pricing master with discounts and rebates",
      "Tax determination rules (multi-jurisdiction)",
      "E-invoicing requirements by jurisdiction (→1.4)",
      "Billing schedule (milestone / recurring / one-time)",
    ],
    process: [
      { step: "P1", name: "Billing Trigger Event", desc: "Delivery, milestone, schedule, or manual trigger activates billing" },
      { step: "P2", name: "Auto-Invoice Generation", desc: "ERP generates invoice from order/delivery data with pricing logic" },
      { step: "P3", name: "Tax Determination", desc: "Multi-jurisdiction tax calculation (VAT, GST, sales tax)" },
      { step: "P4", name: "Validation & QC", desc: "System + human validation: pricing, quantity, tax, PO match" },
      { step: "P5", name: "Approval Workflow", desc: "Threshold-based approval for exceptions or high-value invoices" },
      { step: "P6", name: "E-Invoice Submission", desc: "Submit to tax authority / e-invoicing platform where required (→1.4)" },
      { step: "P7", name: "Invoice Delivery", desc: "Multi-channel: e-invoice, portal, email, EDI, print" },
      { step: "P8", name: "AR Posting & Revenue Recognition", desc: "Post to AR, recognize revenue per ASC 606 / IFRS 15" },
    ],
    outputs: [
      "Compliant invoice delivered to customer",
      "E-invoice acknowledgment where required (→1.4)",
      "AR posting with aging activation (→1.2, 1.3)",
      "Revenue recognition entry (ASC 606 / IFRS 15)",
      "Invoice archive with audit trail",
      "Billing performance data (→1.5)",
    ],
    customers: [
      { name: "External Customer", pcf: "—" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "VP Finance / Controller", pcf: "10820" },
      { name: "Tax Department", pcf: "10820" },
      { name: "SSC Operations (→2.6)", pcf: "10940" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
    ],
  },
  enterprise: {
    suppliers: [
      { name: "Global Sales / Order Mgmt", pcf: "—" },
      { name: "Supply Chain (global)", pcf: "10756" },
      { name: "Contract & Pricing CoE", pcf: "10955" },
      { name: "SSC Billing Operations", pcf: "10940" },
      { name: "Tax CoE (global)", pcf: "10820" },
      { name: "Legal / Compliance", pcf: "10955" },
      { name: "E-Invoicing Platform (→1.4)", pcf: "10854" },
      { name: "Customer (PO / contract)", pcf: "—" },
    ],
    inputs: [
      "Sales order (credit-approved →2.1, multi-entity)",
      "Global delivery / service confirmation",
      "Contract terms, pricing agreements, rebate structures",
      "Multi-jurisdiction tax determination engine",
      "E-invoicing mandates per jurisdiction (→1.4)",
      "Intercompany billing requirements",
      "Revenue recognition rules (ASC 606 / IFRS 15)",
      "SOX control requirements (→2.4)",
      "Billing schedules (milestone, recurring, usage-based, consignment)",
    ],
    process: [
      { step: "P1", name: "Billing Trigger Management", desc: "Auto-trigger from delivery, milestone, schedule, or usage meter" },
      { step: "P2", name: "Auto-Invoice Generation", desc: "Multi-entity, multi-currency invoice creation with pricing engine" },
      { step: "P3", name: "Tax Engine Execution", desc: "Global tax determination: VAT, GST, WHT, sales tax, customs duties" },
      { step: "P4", name: "Automated Validation", desc: "Rules engine: PO match, pricing, quantity, tax, contract compliance" },
      { step: "P5", name: "Exception Handling", desc: "Route exceptions to SSC or CoE for resolution" },
      { step: "P6", name: "SOX-Compliant Approval", desc: "Threshold-based approval with SoD controls (→2.4)" },
      { step: "P7", name: "E-Invoice Compliance", desc: "Submit to jurisdiction platforms, handle acknowledgments/rejections (→1.4)" },
      { step: "P8", name: "Multi-Channel Delivery", desc: "E-invoice, portal, EDI, email — per customer preference" },
      { step: "P9", name: "Intercompany Billing", desc: "IC invoices with transfer pricing and elimination entries" },
      { step: "P10", name: "AR Posting & Revenue Recognition", desc: "Multi-GAAP revenue recognition, AR aging activation" },
    ],
    outputs: [
      "Compliant invoices across all entities and jurisdictions",
      "E-invoice compliance confirmations (→1.4)",
      "AR postings with multi-currency aging (→1.2, 1.3)",
      "Multi-GAAP revenue recognition entries",
      "Intercompany billing with transfer pricing documentation",
      "SOX-compliant audit trail (→2.4)",
      "Billing accuracy and SLA performance data (→1.5, 2.6)",
      "Exception and rework metrics for process mining (→2.5)",
    ],
    customers: [
      { name: "External Customers (global)", pcf: "—" },
      { name: "AR / Collections (→1.3)", pcf: "10940" },
      { name: "SSC / BPO Operations (→2.6)", pcf: "10940" },
      { name: "CFO / Group Controller", pcf: "10820" },
      { name: "Tax Authorities (multi-jurisdiction)", pcf: "—" },
      { name: "Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors", pcf: "10943" },
    ],
  },
  global: {
    suppliers: [
      { name: "Global Sales & Key Account Mgmt", pcf: "—" },
      { name: "Global Supply Chain & Logistics", pcf: "10756" },
      { name: "Contract & Pricing CoE (global)", pcf: "10955" },
      { name: "GBS Billing Operations (all hubs)", pcf: "10940" },
      { name: "Global Tax CoE", pcf: "10820" },
      { name: "Legal / Compliance / Regulatory", pcf: "10955" },
      { name: "E-Invoicing Platform (22 jurisdictions →1.4)", pcf: "10854" },
      { name: "AI/ML Platform (auto-billing)", pcf: "10854" },
      { name: "Data & Analytics CoE", pcf: "10860" },
      { name: "Customer (PO / contract / EDI)", pcf: "—" },
    ],
    inputs: [
      "Sales order (credit-approved →2.1, multi-ERP)",
      "Global delivery / service confirmation (real-time)",
      "Contract terms across all entities and jurisdictions",
      "Global pricing engine with rebate, discount, consignment logic",
      "Tax determination engine (22+ jurisdictions, real-time)",
      "E-invoicing mandates & formats per jurisdiction (→1.4)",
      "Intercompany & transfer pricing policies",
      "Multi-GAAP revenue recognition rules (ASC 606, IFRS 15, local)",
      "SOX + statutory control requirements (→2.4)",
      "Process mining event log specs (→2.5)",
      "M&A integration billing configurations",
    ],
    process: [
      { step: "P1", name: "Intelligent Billing Trigger", desc: "AI-monitored triggers: delivery, milestone, usage, schedule, with anomaly detection" },
      { step: "P2", name: "Auto-Invoice Generation (AI)", desc: "Multi-ERP, multi-currency, multi-format with AI data enrichment" },
      { step: "P3", name: "Global Tax Engine", desc: "Real-time tax determination across 22+ jurisdictions with regulatory updates" },
      { step: "P4", name: "AI Validation & QC", desc: "ML-powered validation: pricing, PO match, contract compliance, anomaly detection" },
      { step: "P5", name: "Intelligent Exception Routing", desc: "AI routes exceptions to optimal hub/CoE based on type and complexity" },
      { step: "P6", name: "Multi-Jurisdiction Approval", desc: "SOX + statutory approval chains per jurisdiction (→2.4)" },
      { step: "P7", name: "Global E-Invoice Compliance", desc: "Real-time submission to 22+ jurisdiction platforms with auto-retry (→1.4)" },
      { step: "P8", name: "Omnichannel Delivery", desc: "Customer-preferred channel: e-invoice, portal, EDI, API, email" },
      { step: "P9", name: "Intercompany & Netting", desc: "Global IC billing with transfer pricing, netting, and elimination" },
      { step: "P10", name: "Multi-GAAP Revenue & AR", desc: "Parallel revenue recognition, AR posting, aging across all standards" },
      { step: "P11", name: "Continuous Monitoring", desc: "Real-time billing KPIs, process mining conformance (→2.5)" },
    ],
    outputs: [
      "Compliant invoices across all ERPs, entities, jurisdictions",
      "Real-time e-invoice compliance across 22+ jurisdictions (→1.4)",
      "AR postings with global multi-currency aging (→1.2, 1.3)",
      "Multi-GAAP revenue recognition (parallel books)",
      "Global intercompany billing with transfer pricing docs",
      "SOX + statutory audit trail across all jurisdictions (→2.4)",
      "Real-time billing KPI dashboards (→1.5)",
      "Process mining conformance data (→2.5)",
      "AI model performance metrics",
      "Dispute prevention data feed (→2.2)",
    ],
    customers: [
      { name: "Group CFO / Board Finance Committee", pcf: "10820" },
      { name: "Regional CFOs / Controllers", pcf: "10825" },
      { name: "Global Sales Leadership", pcf: "—" },
      { name: "GBS Operations (all hubs) (→2.6)", pcf: "10940" },
      { name: "Tax Authorities (22+ jurisdictions)", pcf: "—" },
      { name: "Group Internal Audit (→2.4)", pcf: "10943" },
      { name: "External Auditors (Big 4)", pcf: "10943" },
      { name: "Regulators (multi-jurisdictional)", pcf: "10955" },
      { name: "External Customers (global)", pcf: "—" },
    ],
  },
};

/* ══ SWIMLANE ════════════════════════════════════ */
const SWIMLANE_DATA = {
  sme: {
    lanes: ["Sales / Ops", "Finance / AR", "Finance Dir.", "ERP"],
    steps: [
      { lane: 0, label: "Confirm delivery / service", type: "start" },
      { lane: 3, label: "Generate invoice", type: "system" },
      { lane: 1, label: "Validate pricing & tax", type: "task" },
      { lane: 2, label: "Approve if >$10K", type: "decision" },
      { lane: 1, label: "Send to customer", type: "task" },
      { lane: 3, label: "Post to AR", type: "system" },
      { lane: 1, label: "Archive invoice", type: "end" },
    ],
  },
  mid: {
    lanes: ["Sales / Ops", "Billing Analyst", "Tax / Compliance", "Billing Manager", "ERP / E-Invoice Platform"],
    steps: [
      { lane: 0, label: "Delivery / milestone trigger", type: "start" },
      { lane: 4, label: "Auto-generate invoice", type: "system" },
      { lane: 2, label: "Tax determination", type: "task" },
      { lane: 1, label: "Validation & QC check", type: "task" },
      { lane: 1, label: "Handle exceptions", type: "decision" },
      { lane: 3, label: "Approve exceptions / high-value", type: "decision" },
      { lane: 4, label: "E-invoice submission (→1.4)", type: "system" },
      { lane: 4, label: "Multi-channel delivery", type: "system" },
      { lane: 4, label: "AR posting & rev rec", type: "system" },
      { lane: 1, label: "Monitor delivery confirmation", type: "end" },
    ],
  },
  enterprise: {
    lanes: ["Sales / Ops", "SSC Billing Ops", "Tax CoE", "Billing CoE", "Regional FD", "ERP / E-Invoice / GRC"],
    steps: [
      { lane: 0, label: "Trigger event (delivery/milestone)", type: "start" },
      { lane: 5, label: "Auto-generate (multi-entity)", type: "system" },
      { lane: 2, label: "Global tax determination", type: "task" },
      { lane: 5, label: "Rules-based validation", type: "system" },
      { lane: 1, label: "Exception resolution", type: "task" },
      { lane: 3, label: "Complex exception handling", type: "task" },
      { lane: 4, label: "SOX approval (high-value)", type: "decision" },
      { lane: 5, label: "E-invoice submission (→1.4)", type: "system" },
      { lane: 5, label: "Multi-channel delivery", type: "system" },
      { lane: 1, label: "IC billing & netting", type: "task" },
      { lane: 5, label: "Multi-GAAP rev rec + AR posting", type: "system" },
      { lane: 5, label: "SOX audit trail logged", type: "system" },
      { lane: 1, label: "Monitor & report", type: "end" },
    ],
  },
  global: {
    lanes: ["Sales / KAM", "GBS Hub Billing", "Tax CoE", "Billing CoE", "AI/ML Platform", "Regional CFO", "ERP / E-Invoice / GRC / MDM"],
    steps: [
      { lane: 0, label: "Trigger (AI-monitored)", type: "start" },
      { lane: 4, label: "AI auto-generate + enrich", type: "system" },
      { lane: 2, label: "Global tax engine (22+ jurisd.)", type: "task" },
      { lane: 4, label: "ML validation + anomaly detect", type: "system" },
      { lane: 1, label: "Standard exception handling", type: "task" },
      { lane: 3, label: "Complex / regulatory exceptions", type: "task" },
      { lane: 5, label: "Multi-jurisdiction SOX approval", type: "decision" },
      { lane: 6, label: "E-invoice (22+ platforms →1.4)", type: "system" },
      { lane: 6, label: "Omnichannel delivery", type: "system" },
      { lane: 1, label: "IC billing + transfer pricing", type: "task" },
      { lane: 6, label: "Multi-GAAP rev rec + AR", type: "system" },
      { lane: 4, label: "Continuous monitoring (→2.5)", type: "system" },
      { lane: 6, label: "Global audit trail", type: "system" },
      { lane: 1, label: "Real-time KPI reporting", type: "end" },
    ],
  },
};

/* ══ RACI ═════════════════════════════════════════ */
const RACI_ROLES = {
  sme: ["Finance Dir.", "AR / Billing", "Sales / Ops", "IT"],
  mid: ["VP Finance", "Billing Mgr", "Billing Analyst", "Tax/Compliance", "Sales", "IT/ERP"],
  enterprise: ["Global CFO", "Billing CoE Lead", "SSC Billing Ops", "Tax CoE", "Regional FD", "Sales", "IT CoE", "Internal Audit"],
  global: ["Group CFO", "Billing CoE Global", "GBS Hub Ops", "Tax CoE Global", "Regional CFOs", "Sales/KAM", "AI/ML CoE", "Legal/Compliance", "Internal Audit"],
};
const RACI_ACTIVITIES = {
  sme: [
    { activity: "Billing Policy & Procedures", pcf: "10820", raci: ["A", "R", "C", "I"] },
    { activity: "Invoice Generation", pcf: "10940", raci: ["I", "R", "C", "C"] },
    { activity: "Tax Calculation", pcf: "10820", raci: ["A", "R", "I", "C"] },
    { activity: "Invoice Validation", pcf: "10940", raci: ["C", "R", "I", "I"] },
    { activity: "Invoice Approval (>$10K)", pcf: "10940", raci: ["A", "R", "I", "I"] },
    { activity: "Invoice Delivery", pcf: "10940", raci: ["I", "R", "I", "C"] },
    { activity: "AR Posting", pcf: "10940", raci: ["I", "R", "I", "C"] },
    { activity: "Credit Memo Processing (→2.2)", pcf: "10940", raci: ["A", "R", "C", "I"] },
  ],
  mid: [
    { activity: "Billing Policy & Standards", pcf: "10820", raci: ["A", "R", "C", "C", "C", "I"] },
    { activity: "Billing Trigger Configuration", pcf: "10854", raci: ["I", "A", "R", "I", "C", "R"] },
    { activity: "Auto-Invoice Generation", pcf: "10940", raci: ["I", "C", "R", "I", "I", "C"] },
    { activity: "Tax Determination", pcf: "10820", raci: ["I", "C", "C", "A/R", "I", "C"] },
    { activity: "Validation & QC", pcf: "10940", raci: ["I", "A", "R", "C", "I", "I"] },
    { activity: "Exception Handling", pcf: "10940", raci: ["I", "A", "R", "C", "C", "I"] },
    { activity: "Approval Workflow", pcf: "10940", raci: ["A", "R", "C", "I", "I", "I"] },
    { activity: "E-Invoice Compliance (→1.4)", pcf: "10940", raci: ["I", "A", "R", "R", "I", "C"] },
    { activity: "Multi-Channel Delivery", pcf: "10940", raci: ["I", "C", "R", "I", "I", "C"] },
    { activity: "Revenue Recognition", pcf: "10820", raci: ["A", "R", "C", "C", "I", "C"] },
    { activity: "Billing KPI Reporting (→1.5)", pcf: "10940", raci: ["C", "A", "R", "I", "I", "C"] },
    { activity: "SOX Compliance (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "I", "C"] },
  ],
  enterprise: [
    { activity: "Global Billing Policy", pcf: "10820", raci: ["A", "R", "C", "C", "C", "C", "I", "C"] },
    { activity: "Billing Trigger Management", pcf: "10854", raci: ["I", "A", "R", "I", "I", "C", "R", "I"] },
    { activity: "Multi-Entity Invoice Generation", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I", "C", "I"] },
    { activity: "Global Tax Determination", pcf: "10820", raci: ["I", "C", "C", "A/R", "C", "I", "C", "I"] },
    { activity: "Automated Validation", pcf: "10940", raci: ["I", "A", "R", "C", "I", "I", "R", "I"] },
    { activity: "Exception Resolution (SSC)", pcf: "10940", raci: ["I", "C", "A/R", "C", "I", "C", "I", "I"] },
    { activity: "Complex Exceptions (CoE)", pcf: "10940", raci: ["I", "A/R", "C", "C", "C", "C", "I", "I"] },
    { activity: "SOX Approval (→2.4)", pcf: "10943", raci: ["C", "R", "C", "I", "A", "I", "I", "R"] },
    { activity: "E-Invoice Compliance (→1.4)", pcf: "10940", raci: ["I", "A", "R", "R", "I", "I", "R", "I"] },
    { activity: "IC Billing & Transfer Pricing", pcf: "10820", raci: ["C", "A", "R", "R", "C", "I", "C", "C"] },
    { activity: "Multi-GAAP Revenue Recognition", pcf: "10820", raci: ["A", "R", "C", "C", "R", "I", "C", "C"] },
    { activity: "Process Mining (→2.5)", pcf: "10860", raci: ["I", "C", "I", "I", "I", "I", "A/R", "I"] },
  ],
  global: [
    { activity: "Global Billing Governance", pcf: "10820", raci: ["A", "R", "C", "C", "C", "C", "I", "C", "C"] },
    { activity: "AI Billing Trigger Management", pcf: "10854", raci: ["I", "A", "R", "I", "I", "C", "R", "I", "I"] },
    { activity: "AI Auto-Invoice Generation", pcf: "10940", raci: ["I", "C", "R", "I", "I", "I", "A", "I", "I"] },
    { activity: "Global Tax Engine", pcf: "10820", raci: ["I", "C", "I", "A/R", "C", "I", "C", "C", "I"] },
    { activity: "ML Validation & Anomaly Detection", pcf: "10940", raci: ["I", "A", "C", "C", "I", "I", "R", "I", "I"] },
    { activity: "Hub Exception Handling", pcf: "10940", raci: ["I", "C", "A/R", "C", "I", "C", "I", "I", "I"] },
    { activity: "CoE Complex Exceptions", pcf: "10940", raci: ["I", "A/R", "C", "C", "C", "C", "C", "C", "I"] },
    { activity: "Multi-Jurisdiction Approval (→2.4)", pcf: "10943", raci: ["C", "R", "C", "I", "A", "I", "I", "C", "R"] },
    { activity: "Global E-Invoice (22 jurisd. →1.4)", pcf: "10940", raci: ["I", "A", "R", "R", "I", "I", "R", "R", "I"] },
    { activity: "Global IC & Transfer Pricing", pcf: "10820", raci: ["C", "A", "R", "R", "C", "I", "C", "R", "C"] },
    { activity: "Multi-GAAP Revenue Recognition", pcf: "10820", raci: ["A", "R", "C", "C", "R", "I", "C", "C", "C"] },
    { activity: "Continuous Monitoring (→2.5)", pcf: "10860", raci: ["I", "C", "I", "I", "I", "I", "A/R", "I", "I"] },
    { activity: "SOX + Statutory Controls (→2.4)", pcf: "10943", raci: ["A", "R", "C", "C", "C", "I", "C", "R", "R"] },
  ],
};

/* ══ SOP ══════════════════════════════════════════ */
const SOP_DATA = {
  sme: {
    title: "SOP-BI-001: Billing & Invoicing Procedure",
    scope: "All customer invoicing for goods and services",
    invoiceTypes: [
      { type: "Standard Invoice", trigger: "Delivery / service completion", frequency: "Per transaction", format: "PDF via email" },
      { type: "Credit Memo", trigger: "Dispute resolution / return (→2.2)", frequency: "As needed", format: "PDF via email" },
      { type: "Debit Memo", trigger: "Undercharge correction", frequency: "As needed", format: "PDF via email" },
    ],
    sections: [
      { name: "1. Pre-Billing Verification", steps: ["Confirm delivery or service completion with warehouse/ops", "Verify customer PO number and authorized quantities", "Check pricing against customer contract or pricing master", "Confirm tax applicability and rate"] },
      { name: "2. Invoice Creation", steps: ["Generate invoice in ERP from sales order / delivery note", "System populates: line items, pricing, tax, PO reference", "Review invoice for accuracy: amounts, customer details, dates", "Invoices >$10K: Finance Director reviews before release"] },
      { name: "3. Invoice Delivery", steps: ["Email PDF invoice to customer billing contact", "Copy sales rep on invoice notification", "For key accounts: upload to customer portal if required", "Log delivery timestamp in ERP"] },
      { name: "4. Post-Invoicing", steps: ["AR posting automatic upon invoice release", "Aging clock starts from invoice date", "Archive invoice with supporting documents", "Monthly: reconcile invoiced vs. delivered for completeness"] },
    ],
    escalation: "Pricing discrepancy >5% → Finance Director. Invoice blocked >3 days → AR lead investigates",
  },
  mid: {
    title: "SOP-BI-001: Billing & Invoicing — Multi-Entity Standard",
    scope: "All customer billing across entities including standard, recurring, milestone, credit, and debit invoicing",
    invoiceTypes: [
      { type: "Standard Invoice", trigger: "Delivery / service completion", frequency: "Per transaction", format: "E-invoice, PDF, EDI" },
      { type: "Recurring Invoice", trigger: "Billing schedule (monthly/quarterly)", frequency: "Per schedule", format: "Auto-generated" },
      { type: "Milestone Invoice", trigger: "Project milestone acceptance", frequency: "Per milestone", format: "Manual trigger" },
      { type: "Credit Memo", trigger: "Dispute / return / rebate (→2.2)", frequency: "As needed", format: "Matched to original" },
      { type: "Debit Memo", trigger: "Undercharge / additional charges", frequency: "As needed", format: "Matched to original" },
      { type: "Intercompany Invoice", trigger: "IC service / goods transfer", frequency: "Monthly", format: "Per IC agreement" },
    ],
    sections: [
      { name: "1. Billing Trigger & Setup", steps: ["System monitors billing triggers: delivery confirmation, milestone sign-off, schedule dates", "For new billing arrangements: billing analyst configures schedule in ERP", "Recurring billing: auto-generate per configured schedule with exception alerting", "Manual triggers: authorized requestors submit via billing portal"] },
      { name: "2. Auto-Generation & Tax", steps: ["ERP auto-generates invoice from trigger event", "Pricing engine applies: base price, discounts, rebates, surcharges", "Tax determination engine calculates: VAT, GST, sales tax per jurisdiction", "System applies correct legal entity, currency, and payment terms", "E-invoicing format applied where jurisdiction requires (→1.4)"] },
      { name: "3. Validation & QC", steps: ["Automated checks: PO match (3-way), pricing vs. contract, tax rate, duplicate detection", "Validation pass → auto-release to delivery queue", "Validation fail → exception queue with error code and suggested fix", "Billing analyst resolves exceptions within 1 BD SLA", "Random QC sampling: 5% of auto-released invoices reviewed manually"] },
      { name: "4. Approval & Compliance", steps: ["Standard invoices: auto-approved if validation passes", "Exceptions and adjustments >$25K: Billing Manager approval", "Credit/debit memos: follow dispute approval workflow (→2.2)", "SOX requirement: creator ≠ approver for manual invoices (→2.4)", "E-invoice submission to tax authority where required (→1.4)"] },
      { name: "5. Delivery & Posting", steps: ["Multi-channel delivery per customer preference: e-invoice, portal, email, EDI, print", "Customer acknowledgment tracked for e-invoices", "AR posting upon successful delivery with aging clock start", "Revenue recognized per ASC 606 / IFRS 15 rules", "Invoice and supporting docs archived with 7-year retention"] },
      { name: "6. Monitoring & Improvement", steps: ["Daily: monitor exception queue and aging of undelivered invoices", "Weekly: billing accuracy and timeliness metrics review", "Monthly: reconcile billed vs. delivered, investigate gaps", "Quarterly: top billing errors by type fed to prevention program (→2.2 root cause)"] },
    ],
    escalation: "Exceptions unresolved >2 BD → Billing Manager. Pricing variance >$50K → VP Finance. E-invoice rejection → Tax/Compliance within 4 hours",
  },
  enterprise: {
    title: "SOP-BI-001: Enterprise Billing & Invoicing — SSC/CoE Model",
    scope: "Global billing operations across SSC hubs and CoE including all invoice types, IC billing, and multi-jurisdiction compliance",
    invoiceTypes: [
      { type: "Standard", trigger: "Delivery / completion", frequency: "Per transaction", format: "E-invoice / EDI / PDF" },
      { type: "Recurring", trigger: "Schedule", frequency: "Per config", format: "Auto-generated" },
      { type: "Milestone", trigger: "Acceptance", frequency: "Per milestone", format: "Manual / semi-auto" },
      { type: "Usage-Based", trigger: "Meter reading / consumption", frequency: "Monthly", format: "Auto + validation" },
      { type: "Consignment", trigger: "Customer consumption report", frequency: "Monthly", format: "Semi-auto" },
      { type: "Credit/Debit Memo", trigger: "Dispute / adjustment (→2.2)", frequency: "As needed", format: "Linked to original" },
      { type: "Intercompany", trigger: "IC transaction / allocation", frequency: "Monthly", format: "Per IC policy" },
      { type: "Regulatory/E-Invoice", trigger: "Jurisdiction mandate (→1.4)", frequency: "Per invoice", format: "CTC / clearance / post-audit" },
    ],
    sections: [
      { name: "1. Billing Trigger Management", steps: ["Centralized trigger monitoring across all ERPs and entities", "Auto-triggers: delivery, milestone, schedule, usage meter, consignment report", "Manual triggers: authorized via billing portal with mandatory justification", "Trigger anomaly detection: flag unusual patterns (volume spikes, timing deviations)", "Process mining event logged at trigger point (→2.5)"] },
      { name: "2. Multi-Entity Invoice Generation", steps: ["Invoice factory: centralized generation across entities with pricing engine", "Multi-currency handling with daily rate management", "Pricing waterfall: list price → contract → discount → rebate → surcharge", "Intercompany invoices generated per transfer pricing policy", "Output format determined by jurisdiction and customer preference"] },
      { name: "3. Global Tax & Compliance", steps: ["Tax engine execution: VAT, GST, WHT, customs duties per jurisdiction", "E-invoicing format and submission per jurisdiction mandate (→1.4)", "CTC jurisdictions: real-time submission before customer delivery", "Clearance jurisdictions: submit and await approval before delivery", "Post-audit jurisdictions: generate compliant format, submit on schedule", "Tax determination audit trail retained per SOX requirements (→2.4)"] },
      { name: "4. Validation & Exception Management", steps: ["Automated 5-point validation: PO match, pricing, quantity, tax, compliance", "Pass rate target: ≥ 92% first-time-right", "Exception routing: SSC (standard) → CoE (complex) → Tax (regulatory)", "SSC exception SLA: resolution within 4 hours", "CoE exception SLA: resolution within 1 BD", "Rework tracking for process mining and prevention (→2.5, 2.2)"] },
      { name: "5. SOX-Compliant Approval", steps: ["Auto-approved: validation-passed invoices below threshold", "Manual invoices and adjustments: creator ≠ approver (→2.4)", "High-value (>$500K): Regional FD approval required", "Credit/debit memos: dispute resolution approval chain (→2.2)", "All approvals digitally signed in GRC with timestamp"] },
      { name: "6. Delivery & Revenue Recognition", steps: ["Multi-channel delivery per customer master preferences", "E-invoice: submit to jurisdiction platform, monitor acknowledgment", "EDI/API: transmit via integration layer, confirm receipt", "Portal: upload to customer self-service portal", "AR posting upon delivery confirmation", "Revenue recognition: parallel ASC 606 / IFRS 15 / local GAAP processing", "IC elimination entries posted automatically"] },
      { name: "7. Analytics & Continuous Improvement", steps: ["Real-time billing dashboard: volume, accuracy, timeliness, exceptions by hub", "Daily: exception queue management and SLA monitoring", "Weekly: billing accuracy trend analysis by entity, category, hub", "Monthly: billing cost per invoice, first-time-right rate, e-invoice compliance", "Quarterly: top error categories fed to prevention and automation programs", "Process mining conformance analysis on billing lifecycle (→2.5)"] },
    ],
    escalation: "E-invoice rejection → Tax CoE within 2 hours. Exception >1 BD → Billing CoE Lead. Revenue recognition uncertainty → Group Controller. SOX breach → Internal Audit + CFO within 4 hours",
  },
  global: {
    title: "SOP-BI-001: Global GBS Billing & Invoicing — AI-Enhanced Full Lifecycle",
    scope: "Global billing across all GBS hubs, ERPs, jurisdictions with AI/ML augmentation and continuous compliance",
    invoiceTypes: [
      { type: "Standard", trigger: "Delivery / completion", frequency: "Per transaction", format: "E-invoice / EDI / API / PDF" },
      { type: "Recurring", trigger: "Schedule (AI-optimized)", frequency: "Per config", format: "Auto-generated" },
      { type: "Milestone", trigger: "Acceptance (AI-monitored)", frequency: "Per milestone", format: "Semi-auto with AI validation" },
      { type: "Usage-Based", trigger: "IoT / meter / consumption", frequency: "Real-time / monthly", format: "Auto + ML anomaly check" },
      { type: "Consignment", trigger: "Customer consumption + AI reconciliation", frequency: "Monthly", format: "AI-assisted" },
      { type: "Self-Billing", trigger: "Customer-generated invoice", frequency: "Per agreement", format: "AI validation against contract" },
      { type: "Credit/Debit Memo", trigger: "Dispute / adjustment (→2.2)", frequency: "As needed", format: "AI-routed approval" },
      { type: "Intercompany", trigger: "IC transaction / allocation / netting", frequency: "Monthly + real-time", format: "Transfer pricing compliant" },
      { type: "E-Invoice (22 jurisd.)", trigger: "Jurisdiction mandate (→1.4)", frequency: "Per invoice", format: "CTC / clearance / post-audit / mixed" },
    ],
    sections: [
      { name: "1. AI Billing Trigger & Orchestration", steps: ["AI-monitored trigger events across all ERPs globally (real-time)", "Anomaly detection on trigger patterns: volume, timing, value deviations", "Self-healing: AI auto-corrects known trigger issues (e.g., missing delivery confirmation)", "Follow-the-sun billing queue management across hubs", "M&A entity onboarding: AI maps new entity billing patterns to global standards", "Process mining event capture from trigger through posting (→2.5)"] },
      { name: "2. AI Auto-Invoice Generation", steps: ["Global invoice factory: AI orchestrates generation across 5+ ERPs", "AI data enrichment: auto-populates missing fields from historical patterns", "Multi-currency with AI-optimized FX rate selection", "Pricing waterfall with AI contract interpretation for complex terms", "AI detects pricing anomalies vs. contract terms before generation", "Intercompany: auto-generate with transfer pricing compliance check"] },
      { name: "3. Global Tax & E-Invoice Compliance", steps: ["Real-time global tax engine: 22+ jurisdictions with daily regulatory updates", "AI monitors regulatory changes and auto-adjusts tax rules", "E-invoice format determination per jurisdiction mandate (→1.4)", "CTC jurisdictions: real-time submission with auto-retry on failure", "Clearance: submit → await approval → release (SLA monitoring per jurisdiction)", "Post-audit: compliant archive with scheduled submission", "Tax audit package auto-generated per jurisdiction requirements"] },
      { name: "4. ML Validation & Intelligent Exception Handling", steps: ["ML 7-point validation: PO match, pricing, quantity, tax, compliance, anomaly, format", "First-time-right target: ≥ 97%", "Auto-resolve: ML fixes known error patterns (target: 40% of exceptions auto-fixed)", "GBS hub exceptions: standard issues resolved within 2 hours", "CoE exceptions: complex issues within 1 BD", "Tax/regulatory exceptions: Tax CoE within 4 hours", "ML learns from resolution patterns to prevent future exceptions"] },
      { name: "5. Multi-Jurisdiction Approval & Controls", steps: ["Auto-approved: ML-validated invoices below jurisdiction threshold", "Manual/complex: creator ≠ approver enforced by system (→2.4)", "High-value: jurisdiction-specific approval chains up to Regional CFO", "Credit/debit memos: dispute resolution chain (→2.2)", "SOX + statutory controls applied per jurisdiction requirements", "Full digital audit trail: 10-year retention, multi-jurisdiction compliant"] },
      { name: "6. Omnichannel Delivery & Global AR", steps: ["Customer preference engine: routes via optimal channel per customer", "E-invoice: parallel submission to 22+ jurisdiction platforms", "EDI/API: real-time transmission with automated acknowledgment monitoring", "Portal: customer self-service with invoice history and payment options", "AR posting across all ERPs simultaneously via event bus", "Revenue recognition: parallel multi-GAAP (ASC 606, IFRS 15, local) processing", "IC netting and elimination across all entities"] },
      { name: "7. Continuous Intelligence & Transformation", steps: ["Real-time global billing dashboard across all hubs, entities, jurisdictions", "AI-generated daily insights: billing health, risk alerts, optimization opportunities", "Weekly: global accuracy and SLA review by hub with AI trend predictions", "Monthly: global billing cost analysis, automation rate, compliance scorecard", "Quarterly: executive review with AI-recommended process improvements", "Continuous: ML model retraining on new patterns and regulatory changes", "Annual: billing process maturity assessment per hub with improvement roadmap"] },
    ],
    escalation: "E-invoice rejection in CTC jurisdiction → Tax CoE + Legal within 1 hour. Revenue recognition uncertainty >$1M → Group Controller within 4 hours. SOX breach → Internal Audit + Group CFO immediately. AI confidence <70% on tax determination → mandatory human review. Cross-hub billing failure → GBS governance emergency protocol (→2.6)",
  },
};

/* ══ KPI ══════════════════════════════════════════ */
const KPI_DATA = {
  sme: [
    { kpi: "Invoice Accuracy Rate", formula: "Invoices without errors / Total invoices", target: "≥ 95%", benchmark: "APQC: Median 93%", category: "Quality" },
    { kpi: "Invoice Cycle Time", formula: "Avg. days from delivery to invoice sent", target: "≤ 2 days", benchmark: "APQC: Median 3 days", category: "Speed" },
    { kpi: "Invoices Sent on Time", formula: "Within 24h of delivery / Total", target: "≥ 90%", benchmark: "Hackett: Median 85%", category: "Speed" },
    { kpi: "Cost per Invoice", formula: "Total billing cost / Invoices issued", target: "≤ $8", benchmark: "APQC: Median $8.50", category: "Cost" },
    { kpi: "Credit Memo Rate", formula: "Credit memos / Total invoices", target: "≤ 5%", benchmark: "APQC: Median 4.5%", category: "Quality" },
    { kpi: "Invoice Dispute Rate (→2.2)", formula: "Disputed invoices / Total invoices", target: "≤ 5%", benchmark: "APQC: Median 4.8%", category: "Quality" },
  ],
  mid: [
    { kpi: "First-Time-Right Rate", formula: "Invoices passing validation / Total generated", target: "≥ 92%", benchmark: "Hackett: Top quartile 95%", category: "Quality" },
    { kpi: "Invoice Cycle Time", formula: "Delivery to invoice delivery (avg.)", target: "≤ 1.5 days", benchmark: "APQC: Top quartile 1 day", category: "Speed" },
    { kpi: "Auto-Generation Rate", formula: "Auto-generated / Total invoices", target: "≥ 75%", benchmark: "Hackett: Top quartile 80%", category: "Speed" },
    { kpi: "E-Invoice Compliance (→1.4)", formula: "Compliant e-invoices / Required", target: "≥ 98%", benchmark: "—", category: "Compliance" },
    { kpi: "Exception Rate", formula: "Validation exceptions / Total generated", target: "≤ 8%", benchmark: "Hackett: Top quartile 5%", category: "Quality" },
    { kpi: "Exception Resolution Time", formula: "Avg. hours to resolve billing exception", target: "≤ 8 hours", benchmark: "—", category: "Speed" },
    { kpi: "Cost per Invoice", formula: "Total billing cost / Invoices", target: "≤ $5", benchmark: "APQC: Top quartile $4.50", category: "Cost" },
    { kpi: "Dispute Rate (→2.2)", formula: "Billing-caused disputes / Total invoices", target: "≤ 3%", benchmark: "APQC: Top quartile 2.5%", category: "Quality" },
    { kpi: "SOX Compliance (→2.4)", formula: "SoD adherence in billing approvals", target: "100%", benchmark: "—", category: "Compliance" },
  ],
  enterprise: [
    { kpi: "Global First-Time-Right", formula: "Validation pass across all hubs", target: "≥ 95%", benchmark: "Hackett: Top quartile 96%", category: "Quality" },
    { kpi: "Invoice Cycle Time", formula: "Global avg: trigger to delivery", target: "≤ 1 day", benchmark: "Hackett: Top quartile 0.8 days", category: "Speed" },
    { kpi: "Touchless Invoice Rate", formula: "No-touch invoices / Total", target: "≥ 70%", benchmark: "Hackett: Top quartile 75%", category: "Speed" },
    { kpi: "E-Invoice Compliance (→1.4)", formula: "Compliant across all jurisdictions", target: "≥ 99%", benchmark: "—", category: "Compliance" },
    { kpi: "Exception Rate", formula: "Exceptions / Total generated", target: "≤ 5%", benchmark: "Hackett: Top quartile 4%", category: "Quality" },
    { kpi: "Cost per Invoice", formula: "Blended across hubs", target: "≤ $3.50", benchmark: "APQC: Top quartile $3.20", category: "Cost" },
    { kpi: "IC Billing Accuracy", formula: "IC invoices without adjustment / Total IC", target: "≥ 98%", benchmark: "—", category: "Quality" },
    { kpi: "Dispute Rate (→2.2)", formula: "Billing-caused disputes / Total", target: "≤ 2%", benchmark: "APQC: Top quartile 1.8%", category: "Quality" },
    { kpi: "Revenue Recognition Timeliness", formula: "Rev rec within close cycle / Total", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "SOX Compliance (→2.4)", formula: "Zero findings in billing controls", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance for billing", target: "≥ 90%", benchmark: "—", category: "Compliance" },
  ],
  global: [
    { kpi: "Global First-Time-Right", formula: "FTR across all hubs and ERPs", target: "≥ 97%", benchmark: "Hackett: World-class 98%", category: "Quality" },
    { kpi: "AI Touchless Rate", formula: "AI end-to-end invoices / Total", target: "≥ 80%", benchmark: "—", category: "Speed" },
    { kpi: "Invoice Cycle Time (Global)", formula: "Trigger to delivery (global avg)", target: "≤ 0.5 days", benchmark: "—", category: "Speed" },
    { kpi: "E-Invoice Compliance (→1.4)", formula: "100% across 22+ jurisdictions", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "AI Exception Auto-Fix Rate", formula: "ML auto-resolved / Total exceptions", target: "≥ 40%", benchmark: "—", category: "Speed" },
    { kpi: "Cost per Invoice (Global)", formula: "Global blended cost", target: "≤ $2.50", benchmark: "APQC: World-class $2.10", category: "Cost" },
    { kpi: "IC Billing Accuracy", formula: "IC invoices clean / Total IC (global)", target: "≥ 99%", benchmark: "—", category: "Quality" },
    { kpi: "Dispute Prevention Rate", formula: "YoY reduction in billing-caused disputes", target: "≥ 15% reduction", benchmark: "—", category: "Quality" },
    { kpi: "Multi-GAAP Rev Rec Accuracy", formula: "Zero restatements across all standards", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "SOX + Statutory (→2.4)", formula: "Zero findings across all jurisdictions", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance for billing", target: "≥ 92%", benchmark: "—", category: "Compliance" },
    { kpi: "ML Validation Accuracy", formula: "ML correct pass/fail / Total", target: "≥ 98%", benchmark: "—", category: "Quality" },
    { kpi: "Billing Cost Avoidance", formula: "Savings from automation vs. manual baseline", target: "≥ 40% cost reduction", benchmark: "—", category: "Cost" },
  ],
};

/* ── XREFS ──────────────────────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "Billing process codes and APQC hierarchy" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Invoice data feeds payment matching and cash application" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Invoice aging triggers collection activities" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "Jurisdiction mandates, formats, and submission requirements" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "Billing KPIs integrated into AR dashboard" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Billing & invoicing maturity scoring dimension" },
  { code: "2.1", name: "Credit Management Process Pack", relevance: "Credit approval gates before invoice generation" },
  { code: "2.2", name: "Dispute Resolution Process Pack", relevance: "Billing errors drive disputes; credit memo workflow" },
  { code: "2.4", name: "SOX Compliance Controls Library", relevance: "SoD on invoice approval, revenue recognition controls" },
  { code: "2.5", name: "Process Mining Playbook", relevance: "Billing process conformance, exception variant analysis" },
  { code: "2.6", name: "Shared Services Transition Guide", relevance: "SSC/GBS billing ops, SLA framework, hub governance" },
];

/* ══════════════════════════════════════════════════ */
const raciColor = (v) => { if (v === "A" || v === "A/R") return "#FB923C"; if (v === "R") return "#22D3EE"; if (v === "C") return "#A78BFA"; if (v === "I") return "rgba(255,255,255,0.15)"; return "transparent"; };
const raciText = (v) => { if (v === "I") return "rgba(255,255,255,0.35)"; return "#0B0F1A"; };
const stepTypeColor = (t, a) => { if (t === "start") return "#34D399"; if (t === "end") return "#EF4444"; if (t === "decision") return "#FBBF24"; if (t === "system") return "#60A5FA"; return a; };

export default function BillingInvoicingProcessPack() {
  const { sopRegistry } = useMockDatabase() || {};
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("sipoc");
  const [kpiFilter, setKpiFilter] = useState("All");
  const [showXref, setShowXref] = useState(false);
  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

  const matchedRules = evaluateRules(sopRegistry || [], 'compliance', { xmlSchemaValid: true });
  const sopGroups = {};
  matchedRules.forEach(r => {
    if (!sopGroups[r.sopId]) sopGroups[r.sopId] = { title: r.sopTitle, version: r.sopVersion, rules: [] };
    sopGroups[r.sopId].rules.push(r);
  });

  const renderSIPOC = () => {
    const data = SIPOC_DATA[tier];
    const cols = [
      { key: "suppliers", label: "Suppliers", items: data.suppliers.map((s) => `${s.name}${s.pcf !== "—" ? ` [PCF ${s.pcf}]` : ""}`) },
      { key: "inputs", label: "Inputs", items: data.inputs },
      { key: "process", label: "Process", items: data.process.map((p) => `${p.step}: ${p.name} — ${p.desc}`) },
      { key: "outputs", label: "Outputs", items: data.outputs },
      { key: "customers", label: "Customers", items: data.customers.map((c) => `${c.name}${c.pcf !== "—" ? ` [PCF ${c.pcf}]` : ""}`) },
    ];
    return (<div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16 }}>{cols.map((col) => (<div key={col.key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ padding: "12px 14px", background: col.key === "process" ? accent + "22" : "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: col.key === "process" ? accent : "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{col.label}</span></div><div style={{ padding: 12 }}>{col.items.map((item, i) => (<div key={i} style={{ padding: "8px 10px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `2px solid ${col.key === "process" ? accent : "rgba(255,255,255,0.08)"}`, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{item}</div>))}</div></div>))}</div>);
  };

  const renderSwimlane = () => {
    const data = SWIMLANE_DATA[tier];
    return (<div style={{ marginTop: 16, overflowX: "auto" }}><div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 700 }}>{data.lanes.map((lane, li) => { const ls = data.steps.filter((s) => s.lane === li); return (<div key={li} style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.04)", minHeight: 52 }}><div style={{ width: 160, minWidth: 160, padding: "12px 14px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center" }}><span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{lane}</span></div><div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8, flexWrap: "wrap" }}>{ls.map((step, si) => (<div key={si} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ padding: "6px 12px", borderRadius: 6, background: stepTypeColor(step.type, accent) + "22", border: `1px solid ${stepTypeColor(step.type, accent)}44`, fontSize: 11, color: stepTypeColor(step.type, accent), fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>{step.label}</div>{si < ls.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</span>}</div>))}</div></div>); })}</div><div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>{[{ label: "Start", color: "#34D399" }, { label: "Task", color: accent }, { label: "Decision", color: "#FBBF24" }, { label: "System", color: "#60A5FA" }, { label: "End", color: "#EF4444" }].map((l) => (<div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.4)" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: l.color + "44", border: `1px solid ${l.color}66`, display: "inline-block" }} />{l.label}</div>))}</div></div>);
  };

  const renderRACI = () => {
    const roles = RACI_ROLES[tier]; const activities = RACI_ACTIVITIES[tier];
    return (<div style={{ marginTop: 16, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}><thead><tr><th style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", left: 0, background: "#0B0F1A", zIndex: 2 }}>Activity</th><th style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace" }}>PCF</th>{roles.map((r, i) => (<th key={i} style={{ padding: "10px 6px", textAlign: "center", color: "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{r}</th>))}</tr></thead><tbody>{activities.map((row, ri) => (<tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}><td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.8)", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", position: "sticky", left: 0, background: ri % 2 === 0 ? "#0B0F1A" : "#0d1120", zIndex: 1 }}>{row.activity}</td><td style={{ padding: "8px 8px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'JetBrains Mono', monospace" }}>{row.pcf}</td>{row.raci.map((v, ci) => (<td key={ci} style={{ padding: "6px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, background: raciColor(v), color: raciText(v), fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28 }}>{v}</span></td>))}</tr>))}</tbody></table><div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>{[{ label: "A = Accountable", color: "#FB923C" }, { label: "R = Responsible", color: "#22D3EE" }, { label: "C = Consulted", color: "#A78BFA" }, { label: "I = Informed", color: "rgba(255,255,255,0.15)" }].map((l) => (<div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: "inline-block" }} />{l.label}</div>))}</div></div>);
  };

  const renderSOP = () => {
    const data = SOP_DATA[tier];
    return (<div style={{ marginTop: 16 }}><div style={{ marginBottom: 16 }}><div style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>{data.title}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Scope: {data.scope}</div></div>
      {/* Invoice Type Matrix */}
      <div style={{ marginBottom: 16, overflowX: "auto" }}><div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Invoice Types</div><table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11 }}><thead><tr>{["Type", "Trigger", "Frequency", "Format"].map((h) => (<th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{h}</th>))}</tr></thead><tbody>{data.invoiceTypes.map((t, i) => (<tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}><td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{t.type}</td><td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.55)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{t.trigger}</td><td style={{ padding: "7px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{t.frequency}</td><td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.45)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{t.format}</td></tr>))}</tbody></table></div>
      {/* SOP Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{data.sections.map((sec, i) => (<div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}><div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{sec.name}</div><div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{sec.steps.map((step, j) => (<div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><span style={{ width: 20, minWidth: 20, height: 20, borderRadius: "50%", background: accent + "22", border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: accent, fontWeight: 700, marginTop: 1 }}>{j + 1}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{step}</span></div>))}</div></div>))}</div>
      <div style={{ marginTop: 12, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Escalation</span><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.escalation}</div></div>
    </div>);
  };

  const renderKPI = () => {
    const data = KPI_DATA[tier]; const categories = ["All", ...Array.from(new Set(data.map((k) => k.category)))]; const filtered = kpiFilter === "All" ? data : data.filter((k) => k.category === kpiFilter);
    return (<div style={{ marginTop: 16 }}><div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>{categories.map((cat) => (<button key={cat} onClick={() => setKpiFilter(cat)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${kpiFilter === cat ? accent : "rgba(255,255,255,0.08)"}`, background: kpiFilter === cat ? accent + "22" : "rgba(255,255,255,0.03)", color: kpiFilter === cat ? accent : "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", fontWeight: kpiFilter === cat ? 600 : 400 }}>{cat}</button>))}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>{filtered.map((kpi, i) => (<div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{kpi.kpi}</span><span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", whiteSpace: "nowrap", marginLeft: 8 }}>{kpi.category}</span></div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{kpi.formula}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>TARGET </span><span style={{ fontSize: 12, color: accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.target}</span></div><div style={{ textAlign: "right" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>BENCH </span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>{kpi.benchmark}</span></div></div></div>))}</div></div>);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 24 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.3</span><span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span></div><h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Billing & Invoicing Process Pack</h1><p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>Invoice generation, tax determination, e-invoicing compliance, multi-GAAP revenue recognition, intercompany billing</p></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>{TIERS.map((t) => (<button key={t.key} onClick={() => { setTier(t.key); setKpiFilter("All"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`, background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)", color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tier === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}><div>{t.label}</div><div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div></button>))}</div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>{TABS.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`, background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}><span style={{ marginRight: 6, fontSize: 10 }}>{t.icon}</span>{t.label}</button>))}</div>
      <div style={{ minHeight: 400 }}>{tab === "sipoc" && renderSIPOC()}{tab === "swimlane" && renderSwimlane()}{tab === "raci" && renderRACI()}{tab === "sop" && renderSOP()}{tab === "kpi" && renderKPI()}</div>
      <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}><button onClick={() => setShowXref(!showXref)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 8, padding: 0 }}><span style={{ transform: showXref ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>Cross-Reference Index ({XREFS.length} linked deliverables)</button>{showXref && (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8, marginTop: 12 }}>{XREFS.map((xr) => (<div key={xr.code} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>{xr.code}</span><div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{xr.name}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{xr.relevance}</div></div></div>))}</div>)}</div>
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>APQC PCF v8.0 · Hackett World-Class 2026 · ASC 606 / IFRS 15</span><span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.3 — Billing & Invoicing Process Pack · v1.1</span></div>

      {Object.keys(sopGroups).length > 0 && (
        <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <div style={{ borderLeft: `2px solid ${accent}`, padding: "16px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
              ⚖ Governing SOP Protocols
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {Object.keys(sopGroups).map(sopId => {
                const info = sopGroups[sopId];
                return (
                  <div key={sopId} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", minWidth: 240 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                      {sopId} <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>v{info.version}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{info.title}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {info.rules.map(r => (
                        <span key={r.id} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.75)", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
                          {r.id} · {r.action.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
