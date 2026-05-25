import { useState } from "react";

/* ─────────────────────────────────────────────────
   2.5 — Process Mining Playbook
   OtC Consulting Toolkit · Phase 2
   ───────────────────────────────────────────────── */

const TIERS = [
  { key: "sme", label: "SME", accent: "#22D3EE", desc: "< $50M Rev · 1–2 Entities" },
  { key: "mid", label: "Mid-Market", accent: "#A78BFA", desc: "$50M–$500M · 3–10 Entities" },
  { key: "enterprise", label: "Enterprise", accent: "#F472B6", desc: "$500M–$5B · 10–50 Entities" },
  { key: "global", label: "Global MNC", accent: "#FB923C", desc: "$5B+ · 50+ Entities" },
];

const TABS = [
  { key: "eventlog", label: "Event Log Schema", icon: "◈" },
  { key: "conformance", label: "Conformance Rules", icon: "◆" },
  { key: "variants", label: "Variant Analysis", icon: "◇" },
  { key: "tools", label: "Tool Stack & Setup", icon: "◉" },
  { key: "playbook", label: "Deployment Playbook", icon: "◎" },
];

/* ── EVENT LOG SCHEMA DATA ──────────────────────── */
const EVENT_LOG_DATA = {
  sme: {
    description: "Minimal event log for single-ERP environments. Focus on core OtC activities with basic attributes for initial process discovery.",
    caseId: { field: "invoice_number", source: "ERP AR module", type: "VARCHAR(20)" },
    mandatoryFields: [
      { field: "case_id", desc: "Invoice number or AR document ID", type: "VARCHAR(20)", pcf: "10940", source: "AR sub-ledger" },
      { field: "activity", desc: "Process step executed", type: "VARCHAR(100)", pcf: "10940", source: "ERP transaction log" },
      { field: "timestamp", desc: "Event timestamp (UTC)", type: "DATETIME", pcf: "—", source: "ERP change log" },
      { field: "user_id", desc: "User who performed action", type: "VARCHAR(50)", pcf: "10800", source: "ERP user master" },
      { field: "customer_id", desc: "Customer account number", type: "VARCHAR(20)", pcf: "10940", source: "Customer master" },
    ],
    optionalFields: [
      { field: "invoice_amount", desc: "Document amount (base currency)", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "payment_terms", desc: "Payment terms code", type: "VARCHAR(10)", source: "Customer master" },
      { field: "entity_code", desc: "Company code / legal entity", type: "VARCHAR(10)", source: "ERP org structure" },
    ],
    activities: [
      "Sales Order Created", "Invoice Generated", "Invoice Sent", "Payment Received",
      "Cash Applied", "Dunning Notice Sent", "Dispute Logged", "Dispute Resolved",
      "Credit Memo Issued", "Write-Off Posted",
    ],
    volumeEstimate: "5K–50K events/month",
    extractionMethod: "Direct SQL query against ERP database (batch, daily)",
  },
  mid: {
    description: "Structured event log supporting multi-entity analysis. Includes resource attributes and process-specific dimensions for variant detection.",
    caseId: { field: "ar_document_id", source: "ERP AR module (unified key across entities)", type: "VARCHAR(30)" },
    mandatoryFields: [
      { field: "case_id", desc: "AR document ID (cross-entity unique)", type: "VARCHAR(30)", pcf: "10940", source: "AR sub-ledger" },
      { field: "activity", desc: "Standardized activity name", type: "VARCHAR(100)", pcf: "10940", source: "Activity mapping table" },
      { field: "timestamp", desc: "Event timestamp (UTC normalized)", type: "DATETIME", pcf: "—", source: "ERP change log" },
      { field: "user_id", desc: "Performer ID", type: "VARCHAR(50)", pcf: "10800", source: "User master" },
      { field: "resource_role", desc: "Functional role of performer", type: "VARCHAR(50)", pcf: "10800", source: "Org hierarchy" },
      { field: "customer_id", desc: "Customer account", type: "VARCHAR(20)", pcf: "10940", source: "Customer master" },
      { field: "entity_code", desc: "Legal entity / company code", type: "VARCHAR(10)", pcf: "10820", source: "ERP org" },
      { field: "subprocess", desc: "OtC subprocess (→1.1 taxonomy)", type: "VARCHAR(50)", pcf: "10940", source: "Activity mapping" },
    ],
    optionalFields: [
      { field: "invoice_amount", desc: "Document amount (local + base ccy)", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "currency_code", desc: "Transaction currency", type: "VARCHAR(3)", source: "AR sub-ledger" },
      { field: "payment_terms", desc: "Payment terms", type: "VARCHAR(10)", source: "Customer master" },
      { field: "credit_segment", desc: "Customer risk segment (→1.3)", type: "VARCHAR(20)", source: "Credit master" },
      { field: "aging_bucket", desc: "Current aging bucket at event time", type: "VARCHAR(20)", source: "AR aging snapshot" },
      { field: "automation_flag", desc: "Manual vs. automated execution", type: "BOOLEAN", source: "ERP/RPA log" },
    ],
    activities: [
      "Sales Order Created", "Sales Order Approved", "Delivery Confirmed",
      "Invoice Generated", "Invoice Validated", "Invoice Sent", "E-Invoice Transmitted",
      "Payment Received", "Payment Matched", "Cash Applied", "Partial Payment Applied",
      "Dunning Level 1 Sent", "Dunning Level 2 Sent", "Dunning Level 3 Sent",
      "Collection Call Logged", "Promise to Pay Recorded",
      "Dispute Created", "Dispute Investigated", "Dispute Resolved",
      "Credit Memo Issued", "Debit Memo Issued", "Write-Off Proposed", "Write-Off Approved",
    ],
    volumeEstimate: "50K–500K events/month",
    extractionMethod: "ETL pipeline (daily batch) with activity standardization layer",
  },
  enterprise: {
    description: "Enterprise-grade event log with multi-ERP harmonization, SOX control event tracking, and automation attribution. Supports cross-hub analysis.",
    caseId: { field: "global_ar_doc_id", source: "MDM layer / unified AR key across ERP instances", type: "VARCHAR(40)" },
    mandatoryFields: [
      { field: "case_id", desc: "Global AR document ID (MDM-generated)", type: "VARCHAR(40)", pcf: "10940", source: "MDM / integration layer" },
      { field: "activity", desc: "Global standard activity name", type: "VARCHAR(100)", pcf: "10940", source: "Global activity master" },
      { field: "timestamp", desc: "Event timestamp (UTC)", type: "DATETIME", pcf: "—", source: "ERP / middleware" },
      { field: "user_id", desc: "Performer ID (global)", type: "VARCHAR(50)", pcf: "10800", source: "Global user directory" },
      { field: "resource_role", desc: "Global role taxonomy", type: "VARCHAR(50)", pcf: "10800", source: "HR / role master" },
      { field: "resource_location", desc: "SSC hub / retained / BPO", type: "VARCHAR(50)", pcf: "—", source: "Org model" },
      { field: "customer_id", desc: "Global customer ID", type: "VARCHAR(30)", pcf: "10940", source: "Global customer master" },
      { field: "entity_code", desc: "Legal entity", type: "VARCHAR(10)", pcf: "10820", source: "ERP org" },
      { field: "region", desc: "Geographic region", type: "VARCHAR(20)", pcf: "—", source: "Org hierarchy" },
      { field: "subprocess", desc: "OtC subprocess (→1.1)", type: "VARCHAR(50)", pcf: "10940", source: "Global taxonomy" },
      { field: "erp_source", desc: "Source ERP system identifier", type: "VARCHAR(20)", pcf: "10854", source: "Integration layer" },
    ],
    optionalFields: [
      { field: "invoice_amount_local", desc: "Amount in local currency", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "invoice_amount_group", desc: "Amount in group currency", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "currency_code", desc: "Transaction currency", type: "VARCHAR(3)", source: "AR sub-ledger" },
      { field: "payment_terms", desc: "Payment terms", type: "VARCHAR(10)", source: "Customer master" },
      { field: "credit_segment", desc: "Risk segment (→1.3, 2.1)", type: "VARCHAR(20)", source: "Credit engine" },
      { field: "sox_control_id", desc: "SOX control point reference (→2.4)", type: "VARCHAR(30)", source: "GRC system" },
      { field: "automation_type", desc: "Manual / RPA / API / AI-assisted", type: "VARCHAR(20)", source: "Execution metadata" },
      { field: "sla_deadline", desc: "SLA target timestamp for this step", type: "DATETIME", source: "SLA engine" },
      { field: "sla_status", desc: "On-time / breached / at-risk", type: "VARCHAR(10)", source: "SLA engine" },
      { field: "e_invoice_status", desc: "E-invoicing compliance status (→1.4)", type: "VARCHAR(20)", source: "E-invoice platform" },
    ],
    activities: [
      "Sales Order Created", "Sales Order Approved", "Credit Check Initiated", "Credit Check Approved",
      "Credit Check Rejected", "Delivery Confirmed", "Invoice Generated", "Invoice Validated",
      "E-Invoice Submitted", "E-Invoice Acknowledged", "Invoice Sent (Manual)",
      "Payment Received", "Lockbox Imported", "Auto-Match Attempted", "Auto-Match Successful",
      "Manual Match Required", "Cash Applied", "Partial Payment Applied", "Overpayment Identified",
      "Dunning Level 1", "Dunning Level 2", "Dunning Level 3", "Dunning Escalation",
      "Collection Call Logged", "Promise to Pay", "Broken Promise Flagged",
      "Dispute Created", "Dispute Categorized", "Dispute Assigned", "Dispute Investigated",
      "Dispute Resolved", "Credit Memo Issued", "Debit Memo Issued",
      "Write-Off Proposed", "Write-Off Approved (SOX)", "SOX Control Executed",
      "Month-End Reconciliation", "Aging Snapshot Generated",
    ],
    volumeEstimate: "500K–5M events/month",
    extractionMethod: "Integration middleware (near real-time) with CDC + activity standardization + MDM enrichment",
  },
  global: {
    description: "Global GBS event log with multi-hub harmonization, AI/ML attribution, follow-the-sun tracking, regulatory compliance events, and continuous conformance monitoring.",
    caseId: { field: "gbs_case_id", source: "GBS integration platform / enterprise MDM (cross-ERP, cross-hub unique)", type: "VARCHAR(50)" },
    mandatoryFields: [
      { field: "case_id", desc: "GBS-wide unique case identifier", type: "VARCHAR(50)", pcf: "10940", source: "GBS MDM" },
      { field: "activity", desc: "Global standard activity (multi-language mapped)", type: "VARCHAR(100)", pcf: "10940", source: "Global process taxonomy" },
      { field: "timestamp", desc: "Event timestamp (UTC, ms precision)", type: "DATETIME(3)", pcf: "—", source: "Event bus" },
      { field: "user_id", desc: "Global performer ID", type: "VARCHAR(50)", pcf: "10800", source: "Global IAM" },
      { field: "resource_role", desc: "Global role taxonomy", type: "VARCHAR(50)", pcf: "10800", source: "GBS role model" },
      { field: "resource_location", desc: "Hub / retained / BPO partner / automated", type: "VARCHAR(50)", pcf: "—", source: "GBS org model" },
      { field: "resource_hub", desc: "GBS hub identifier", type: "VARCHAR(20)", pcf: "—", source: "GBS topology" },
      { field: "customer_id", desc: "Global customer ID", type: "VARCHAR(30)", pcf: "10940", source: "Global CDM" },
      { field: "entity_code", desc: "Legal entity", type: "VARCHAR(10)", pcf: "10820", source: "ERP org" },
      { field: "region", desc: "Geographic region", type: "VARCHAR(20)", pcf: "—", source: "Org hierarchy" },
      { field: "subprocess", desc: "OtC subprocess L3 (→1.1)", type: "VARCHAR(50)", pcf: "10940", source: "Global taxonomy" },
      { field: "erp_source", desc: "Source ERP system", type: "VARCHAR(20)", pcf: "10854", source: "Integration layer" },
      { field: "execution_mode", desc: "Human / RPA / API / AI-ML / Hybrid", type: "VARCHAR(20)", pcf: "—", source: "Orchestration platform" },
    ],
    optionalFields: [
      { field: "invoice_amount_local", desc: "Local currency amount", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "invoice_amount_group", desc: "Group currency amount", type: "DECIMAL(15,2)", source: "AR sub-ledger" },
      { field: "currency_code", desc: "ISO currency", type: "VARCHAR(3)", source: "AR sub-ledger" },
      { field: "credit_segment", desc: "Risk segment (→1.3, 2.1)", type: "VARCHAR(20)", source: "Credit engine" },
      { field: "sox_control_id", desc: "SOX control reference (→2.4)", type: "VARCHAR(30)", source: "GRC" },
      { field: "statutory_control_id", desc: "Local statutory control (→2.4)", type: "VARCHAR(30)", source: "GRC" },
      { field: "automation_confidence", desc: "AI/ML confidence score (0–1)", type: "DECIMAL(3,2)", source: "ML platform" },
      { field: "sla_deadline", desc: "SLA target timestamp", type: "DATETIME", source: "SLA engine" },
      { field: "sla_status", desc: "On-time / breached / at-risk", type: "VARCHAR(10)", source: "SLA engine" },
      { field: "e_invoice_jurisdiction", desc: "E-invoicing jurisdiction code (→1.4)", type: "VARCHAR(10)", source: "E-invoice platform" },
      { field: "e_invoice_status", desc: "Compliance status", type: "VARCHAR(20)", source: "E-invoice platform" },
      { field: "handoff_from_hub", desc: "Follow-the-sun: originating hub", type: "VARCHAR(20)", source: "GBS routing" },
      { field: "handoff_to_hub", desc: "Follow-the-sun: receiving hub", type: "VARCHAR(20)", source: "GBS routing" },
      { field: "process_variant_id", desc: "Detected variant cluster", type: "VARCHAR(20)", source: "Mining platform" },
    ],
    activities: [
      "Sales Order Created", "Sales Order Approved", "Credit Check Initiated (Auto)",
      "Credit Check Initiated (Manual)", "Credit Approved", "Credit Rejected", "Credit Override",
      "Delivery Confirmed", "Invoice Generated (Auto)", "Invoice Generated (Manual)",
      "Invoice Validated (AI)", "Invoice Validated (Human)", "E-Invoice Submitted",
      "E-Invoice Acknowledged", "E-Invoice Rejected", "Invoice Sent (Portal)",
      "Payment Received", "Lockbox Imported", "AI Auto-Match", "Rule-Based Auto-Match",
      "Manual Match", "Cash Applied", "Partial Payment Applied", "Overpayment Routed",
      "Underpayment Flagged", "Dunning L1 (Auto)", "Dunning L2 (Auto)", "Dunning L3 (Manual)",
      "Dunning Escalation", "Collection Call Logged", "Promise to Pay",
      "Broken Promise Flagged", "Collection Agency Referral",
      "Dispute Created", "Dispute Auto-Categorized (AI)", "Dispute Assigned",
      "Dispute Investigated", "Dispute Resolved", "Dispute Escalated",
      "Credit Memo (Auto)", "Credit Memo (Manual)", "Debit Memo",
      "Write-Off Proposed", "Write-Off Approved (SOX)", "Write-Off Posted",
      "SOX Control Executed", "Statutory Control Executed",
      "Month-End Recon", "Intercompany Netting", "Hub Handoff",
      "Aging Snapshot", "KPI Calculation Triggered",
    ],
    volumeEstimate: "5M–50M+ events/month",
    extractionMethod: "Event-driven streaming (Kafka/event bus) + CDC from all ERPs + real-time enrichment pipeline",
  },
};

/* ── CONFORMANCE RULES DATA ─────────────────────── */
const CONFORMANCE_DATA = {
  sme: [
    { id: "CR-01", rule: "Invoice must precede payment", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→1.2" },
    { id: "CR-02", rule: "Cash application within 2 BD of payment receipt", type: "SLA", severity: "High", pcf: "10940", ref: "→1.2" },
    { id: "CR-03", rule: "Dunning sequence follows defined cadence", type: "Ordering", severity: "Medium", pcf: "10940", ref: "→1.3" },
    { id: "CR-04", rule: "Dispute must be logged before credit memo", type: "Ordering", severity: "High", pcf: "10940", ref: "→2.2" },
    { id: "CR-05", rule: "Write-off requires approval before posting", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4" },
    { id: "CR-06", rule: "No duplicate invoice for same delivery", type: "Integrity", severity: "Critical", pcf: "10940", ref: "→2.3" },
  ],
  mid: [
    { id: "CR-01", rule: "Invoice must precede payment", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→1.2" },
    { id: "CR-02", rule: "Cash application within SLA by segment", type: "SLA", severity: "High", pcf: "10940", ref: "→1.2, 2.6" },
    { id: "CR-03", rule: "Credit check before first shipment to new customer", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→2.1" },
    { id: "CR-04", rule: "Dunning follows segment-specific cadence", type: "Ordering", severity: "High", pcf: "10940", ref: "→1.3" },
    { id: "CR-05", rule: "Dispute categorization before investigation start", type: "Ordering", severity: "Medium", pcf: "10940", ref: "→2.2" },
    { id: "CR-06", rule: "Write-off dual approval (preparer ≠ approver)", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4" },
    { id: "CR-07", rule: "E-invoice submission within regulatory deadline", type: "Regulatory", severity: "Critical", pcf: "10940", ref: "→1.4" },
    { id: "CR-08", rule: "No invoice without valid delivery confirmation", type: "Integrity", severity: "High", pcf: "10940", ref: "→2.3" },
    { id: "CR-09", rule: "SSC SLA targets met per process step", type: "SLA", severity: "High", pcf: "10943", ref: "→2.6" },
    { id: "CR-10", rule: "Month-end close activities completed by WD2", type: "SLA", severity: "High", pcf: "10820", ref: "→1.5" },
  ],
  enterprise: [
    { id: "CR-01", rule: "Invoice must precede payment (all entities)", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→1.2" },
    { id: "CR-02", rule: "Automated cash application attempted before manual", type: "Ordering", severity: "High", pcf: "10940", ref: "→1.2" },
    { id: "CR-03", rule: "Credit check before order release (all segments)", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→2.1" },
    { id: "CR-04", rule: "Dunning escalation follows global cadence", type: "Ordering", severity: "High", pcf: "10940", ref: "→1.3" },
    { id: "CR-05", rule: "Dispute SLA: non-complex < 10 BD", type: "SLA", severity: "High", pcf: "10940", ref: "→2.2, 2.6" },
    { id: "CR-06", rule: "SOX: segregation of duties on write-offs", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4" },
    { id: "CR-07", rule: "SOX: credit limit override requires documented approval", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4, 2.1" },
    { id: "CR-08", rule: "E-invoice compliance per jurisdiction (→1.4 matrix)", type: "Regulatory", severity: "Critical", pcf: "10940", ref: "→1.4" },
    { id: "CR-09", rule: "BPO handoff within agreed SLA window", type: "SLA", severity: "High", pcf: "10943", ref: "→2.6" },
    { id: "CR-10", rule: "No rework loops >2 on same case without escalation", type: "Quality", severity: "Medium", pcf: "10940", ref: "—" },
    { id: "CR-11", rule: "Cross-entity netting requires treasury approval", type: "SOX", severity: "Critical", pcf: "10820", ref: "→2.4" },
    { id: "CR-12", rule: "Dashboard refresh by 9am local per hub", type: "SLA", severity: "Medium", pcf: "10854", ref: "→1.5, 2.6" },
  ],
  global: [
    { id: "CR-01", rule: "Invoice → Payment ordering (global, all ERPs)", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→1.2" },
    { id: "CR-02", rule: "AI auto-match before manual (≥95% confidence)", type: "Ordering", severity: "High", pcf: "10940", ref: "→1.2" },
    { id: "CR-03", rule: "Credit check (auto or manual) before any order release", type: "Ordering", severity: "Critical", pcf: "10940", ref: "→2.1" },
    { id: "CR-04", rule: "Dunning cadence per segment × jurisdiction", type: "Ordering", severity: "High", pcf: "10940", ref: "→1.3" },
    { id: "CR-05", rule: "Dispute AI categorization accuracy ≥ 90%", type: "Quality", severity: "High", pcf: "10940", ref: "→2.2" },
    { id: "CR-06", rule: "SOX: full segregation of duties chain", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4" },
    { id: "CR-07", rule: "SOX: credit override → documented approval → audit trail", type: "SOX", severity: "Critical", pcf: "10943", ref: "→2.4, 2.1" },
    { id: "CR-08", rule: "Statutory controls per jurisdiction (22 jurisdictions)", type: "Regulatory", severity: "Critical", pcf: "10955", ref: "→2.4, 1.4" },
    { id: "CR-09", rule: "E-invoice real-time compliance per jurisdiction", type: "Regulatory", severity: "Critical", pcf: "10940", ref: "→1.4" },
    { id: "CR-10", rule: "Hub handoff within follow-the-sun SLA", type: "SLA", severity: "High", pcf: "10943", ref: "→2.6" },
    { id: "CR-11", rule: "No variant with >3 rework loops without root cause ticket", type: "Quality", severity: "Medium", pcf: "10940", ref: "—" },
    { id: "CR-12", rule: "Intercompany netting requires treasury + legal sign-off", type: "SOX", severity: "Critical", pcf: "10820", ref: "→2.4" },
    { id: "CR-13", rule: "Process conformance score ≥ 92% per hub (weekly)", type: "Quality", severity: "High", pcf: "10940", ref: "→2.6" },
    { id: "CR-14", rule: "Touchless rate ≥ 60% for eligible transactions", type: "Automation", severity: "Medium", pcf: "10854", ref: "→2.6" },
    { id: "CR-15", rule: "GBS P&L allocation accuracy per chargeback model", type: "Financial", severity: "High", pcf: "10820", ref: "→2.6" },
  ],
};

/* ── VARIANT ANALYSIS DATA ──────────────────────── */
const VARIANT_DATA = {
  sme: {
    targetVariants: 3,
    description: "Identify core happy path vs. exception paths. Focus on rework and unnecessary manual steps.",
    variants: [
      { id: "V1", name: "Happy Path", path: "Order → Invoice → Payment → Cash Applied", frequency: "60–70%", impact: "Baseline", action: "Benchmark and protect" },
      { id: "V2", name: "Late Payment Path", path: "Order → Invoice → Dunning L1 → Dunning L2 → Payment → Cash Applied", frequency: "20–25%", impact: "DSO +15 days avg", action: "Analyze root causes (→1.3 segmentation)" },
      { id: "V3", name: "Dispute Path", path: "Order → Invoice → Dispute → Investigation → Resolution → Credit Memo / Payment", frequency: "10–15%", impact: "DSO +30 days, cost 3× happy path", action: "Categorize disputes (→2.2), fix root causes" },
    ],
    analysisApproach: "Manual process discovery with basic frequency analysis. Use simple process map visualization.",
  },
  mid: {
    targetVariants: 8,
    description: "Multi-entity variant analysis to identify entity-specific deviations and standardization opportunities.",
    variants: [
      { id: "V1", name: "Happy Path (Standard)", path: "Order → Credit Check → Invoice → E-Invoice → Payment → Auto-Match → Cash Applied", frequency: "45–55%", impact: "Baseline", action: "Protect, increase automation" },
      { id: "V2", name: "Happy Path (Manual Match)", path: "Order → Credit Check → Invoice → Payment → Manual Match → Cash Applied", frequency: "10–15%", impact: "Cost +40% vs auto", action: "Improve matching rules, remittance quality" },
      { id: "V3", name: "Late Payment (Single Dunning)", path: "...→ Dunning L1 → Payment → Cash Applied", frequency: "15–20%", impact: "DSO +10 days", action: "Review payment terms, early pay incentives" },
      { id: "V4", name: "Late Payment (Escalated)", path: "...→ Dunning L1 → L2 → L3 → Collection Call → Payment", frequency: "5–8%", impact: "DSO +25 days", action: "Segment-specific strategy (→1.3)" },
      { id: "V5", name: "Simple Dispute", path: "...→ Dispute → Quick Resolution → Payment", frequency: "8–12%", impact: "DSO +12 days", action: "Root cause analysis (→2.2)" },
      { id: "V6", name: "Complex Dispute", path: "...→ Dispute → Multi-step Investigation → Escalation → Resolution", frequency: "3–5%", impact: "DSO +40 days", action: "Process redesign (→2.2)" },
      { id: "V7", name: "Credit Block Path", path: "Order → Credit Check Failed → Hold → Review → Release → Invoice...", frequency: "5–8%", impact: "Order-to-cash +5 days", action: "Credit policy review (→2.1)" },
      { id: "V8", name: "Rework Loop", path: "Invoice → Error → Cancel → Re-Invoice → ...", frequency: "2–4%", impact: "Cost 5× happy path", action: "Billing accuracy program (→2.3)" },
    ],
    analysisApproach: "Automated variant mining with entity-level comparison. Pareto analysis on variant frequency × cost impact.",
  },
  enterprise: {
    targetVariants: 15,
    description: "Cross-hub variant analysis with automation attribution, SOX compliance overlay, and BPO performance tracking.",
    variants: [
      { id: "V1", name: "Fully Automated Happy Path", path: "Order → Auto-Credit → Auto-Invoice → E-Invoice → Auto-Match → Auto-Apply", frequency: "35–45%", impact: "Touchless baseline", action: "Maximize volume through this path" },
      { id: "V2", name: "Semi-Auto Happy Path", path: "Order → Auto-Credit → Auto-Invoice → Manual Match → Cash Applied", frequency: "15–20%", impact: "Cost +30% vs V1", action: "Improve auto-match algorithms" },
      { id: "V3", name: "Manual Happy Path", path: "Fully manual end-to-end", frequency: "5–8%", impact: "Cost +200% vs V1", action: "Identify automation blockers" },
      { id: "V4-V6", name: "Dunning Variants (L1/L2/L3)", path: "3 paths by escalation level", frequency: "15–20% combined", impact: "DSO +10 to +30 days", action: "Segment strategy (→1.3)" },
      { id: "V7-V8", name: "Dispute Variants (Simple/Complex)", path: "2 paths by complexity", frequency: "8–12% combined", impact: "DSO +15 to +45 days", action: "Root cause (→2.2)" },
      { id: "V9", name: "Credit Exception Path", path: "Credit check failed → override or reject", frequency: "4–6%", impact: "Revenue delay or bad debt", action: "Credit policy tuning (→2.1)" },
      { id: "V10", name: "BPO Handoff Path", path: "SSC → BPO transition with quality check", frequency: "10–15%", impact: "Adds 1–2 days latency", action: "SLA optimization (→2.6)" },
      { id: "V11", name: "Cross-Entity Rework", path: "Invoice error → cancel → re-process across entities", frequency: "2–3%", impact: "Cost 8× baseline", action: "Billing accuracy (→2.3)" },
      { id: "V12", name: "SOX Violation Path", path: "Any path with segregation of duties breach", frequency: "<1%", impact: "Audit risk — critical", action: "Automated SoD controls (→2.4)" },
    ],
    analysisApproach: "AI-powered variant clustering with cost/time/compliance multi-dimensional scoring. Continuous monitoring with drift alerts.",
  },
  global: {
    targetVariants: 25,
    description: "Global GBS variant analysis with jurisdiction-specific overlays, AI attribution, follow-the-sun patterns, and M&A integration tracking.",
    variants: [
      { id: "V1", name: "AI Touchless Path", path: "Fully AI-orchestrated: auto-credit, auto-invoice, AI-match, auto-apply", frequency: "30–40%", impact: "Lowest cost baseline", action: "Expand AI coverage" },
      { id: "V2", name: "AI-Assisted Path", path: "AI initiates, human validates at 1–2 checkpoints", frequency: "20–25%", impact: "Cost +50% vs V1", action: "Increase AI confidence thresholds" },
      { id: "V3", name: "Manual Fallback Path", path: "AI fails, fully manual processing", frequency: "5–8%", impact: "Cost +300% vs V1", action: "AI model retraining, data quality" },
      { id: "V4-V7", name: "Dunning Variants (4 levels + agency)", path: "Segment × jurisdiction matrix", frequency: "15–20%", impact: "DSO +8 to +45 days", action: "Jurisdiction-specific optimization" },
      { id: "V8-V10", name: "Dispute Variants (3 complexity tiers)", path: "Simple / Complex / Regulatory disputes", frequency: "8–12%", impact: "DSO +10 to +60 days", action: "AI categorization + routing (→2.2)" },
      { id: "V11-V12", name: "Credit Variants (Auto/Manual)", path: "Credit check paths by risk tier", frequency: "5–8%", impact: "Revenue / risk trade-off", action: "ML credit scoring (→2.1)" },
      { id: "V13-V14", name: "Hub Handoff Variants", path: "Follow-the-sun handoff patterns", frequency: "10–15%", impact: "Latency risk", action: "Handoff SLA monitoring (→2.6)" },
      { id: "V15", name: "M&A Integration Path", path: "Acquired entity non-standard processing", frequency: "3–5%", impact: "Cost 4× baseline", action: "Accelerate standardization" },
      { id: "V16", name: "Regulatory Exception Path", path: "Jurisdiction-specific deviations", frequency: "5–8%", impact: "Compliance critical", action: "Jurisdiction overlay maintenance (→1.4)" },
      { id: "V17", name: "SOX/Statutory Violation Path", path: "Any control breach", frequency: "<0.5%", impact: "Audit critical", action: "Real-time GRC alerting (→2.4)" },
    ],
    analysisApproach: "Real-time variant detection with ML clustering, multi-dimensional impact scoring (cost, time, compliance, customer experience), automated root cause attribution, and continuous optimization recommendations.",
  },
};

/* ── TOOL STACK DATA ────────────────────────────── */
const TOOL_DATA = {
  sme: {
    tier: "Basic Discovery",
    tools: [
      { category: "Process Mining", tool: "Disco (Fluxicon) or ProM (open-source)", purpose: "Process discovery, basic conformance", license: "Disco: €1K/yr; ProM: free", setup: "Desktop install, CSV import" },
      { category: "Data Extraction", tool: "Direct SQL / Excel export", purpose: "Event log extraction from ERP", license: "Included with ERP", setup: "SQL queries against ERP DB" },
      { category: "Visualization", tool: "Power BI (basic) or Excel", purpose: "KPI dashboards, variant charts", license: "Included or $10/user/mo", setup: "Connect to mining output" },
    ],
    integrations: "Batch CSV export from ERP → manual import to mining tool. Refresh weekly.",
    architecture: "Standalone: ERP → SQL extract → CSV → Mining tool → Manual analysis → PPT/Excel reporting",
  },
  mid: {
    tier: "Structured Mining",
    tools: [
      { category: "Process Mining", tool: "Celonis EMS (Academic/Starter) or Minit", purpose: "Automated discovery, conformance, variant analysis", license: "$25K–$75K/yr", setup: "Cloud deployment, ERP connector config" },
      { category: "Data Integration", tool: "Celonis EMS Connector or custom ETL", purpose: "Automated event log extraction & standardization", license: "Included with platform", setup: "ERP connector + activity mapping" },
      { category: "Dashboarding", tool: "Celonis Analysis or Power BI Premium", purpose: "Process KPIs, conformance dashboards (→1.5)", license: "Included or $20/user/mo", setup: "Template dashboards + custom views" },
      { category: "Collaboration", tool: "Celonis Task Mining (optional)", purpose: "Desktop-level activity capture for unmapped steps", license: "Add-on module", setup: "Agent install on user desktops" },
    ],
    integrations: "ERP connector (SAP, Oracle, D365) → ETL pipeline → Mining platform. Daily batch refresh with activity standardization layer.",
    architecture: "Cloud: ERP(s) → Connector/ETL → Mining Platform → Analysis Dashboards → Action Workflows → Ticketing System",
  },
  enterprise: {
    tier: "Enterprise Mining Platform",
    tools: [
      { category: "Process Mining", tool: "Celonis EMS Enterprise", purpose: "Full-suite: discovery, conformance, prediction, action flows", license: "$150K–$500K/yr", setup: "Enterprise cloud, multi-ERP connectors" },
      { category: "Data Integration", tool: "Celonis Integration Hub + middleware (MuleSoft/Boomi)", purpose: "Multi-ERP harmonization, near real-time CDC", license: "Platform-dependent", setup: "CDC connectors per ERP + MDM enrichment" },
      { category: "Automation", tool: "Celonis Action Engine + UiPath/Automation Anywhere", purpose: "Auto-remediation of conformance violations", license: "Enterprise license", setup: "Action flow templates per violation type" },
      { category: "GRC Integration", tool: "GRC connector (SAP GRC, ServiceNow GRC)", purpose: "SOX control monitoring, audit trail (→2.4)", license: "Connector module", setup: "Bidirectional sync: mining ↔ GRC" },
      { category: "Dashboarding", tool: "Celonis + Power BI / Tableau Enterprise", purpose: "Executive dashboards, hub-level views (→1.5)", license: "Enterprise license", setup: "Embedded analytics + role-based access" },
    ],
    integrations: "Multi-ERP CDC → Integration middleware → Mining platform → Action engine → RPA/GRC systems. Near real-time with 15-minute refresh for critical processes.",
    architecture: "Enterprise: Multi-ERP → CDC/Integration → MDM Enrichment → Mining Platform → Action Engine → RPA + GRC + Ticketing → Executive Dashboards",
  },
  global: {
    tier: "Global GBS Mining Ecosystem",
    tools: [
      { category: "Process Mining", tool: "Celonis EMS Global (or SAP Signavio Process Intelligence)", purpose: "Global process intelligence, cross-hub conformance, AI-driven optimization", license: "$500K–$2M+/yr", setup: "Global cloud, multi-region deployment" },
      { category: "Data Integration", tool: "Enterprise event bus (Kafka) + Celonis connectors", purpose: "Real-time streaming from all ERPs and hubs", license: "Platform-dependent", setup: "Kafka topics per ERP + real-time CDC" },
      { category: "AI/ML Layer", tool: "Celonis ML + custom models (Python/R)", purpose: "Predictive conformance, anomaly detection, auto-routing", license: "Included + custom dev", setup: "ML pipeline integration, model training on historical logs" },
      { category: "Automation", tool: "Celonis Action Engine + RPA (multi-vendor) + AI orchestration", purpose: "Intelligent automation of remediation and optimization", license: "Enterprise suite", setup: "Action flows + RPA bots + AI decision engine" },
      { category: "GRC Integration", tool: "GRC platform (multi-jurisdiction SOX + statutory)", purpose: "Real-time compliance monitoring (→2.4)", license: "Enterprise GRC", setup: "Bidirectional real-time sync" },
      { category: "Analytics CoE", tool: "Custom analytics layer (Snowflake/Databricks + mining API)", purpose: "Advanced analytics, custom KPIs, GBS P&L analytics", license: "Enterprise data platform", setup: "Data lakehouse + mining API integration" },
      { category: "Collaboration", tool: "Process Excellence Hub (Celonis + Confluence/SharePoint)", purpose: "Global process community, best practice sharing", license: "Included", setup: "Template library + regional forums" },
    ],
    integrations: "Global event streaming: All ERPs → Kafka → Real-time enrichment → Mining platform → AI/ML → Action engine → RPA + GRC + Analytics → Global dashboards. Sub-minute latency for critical paths.",
    architecture: "Global: Multi-ERP (5+) → Event Bus (Kafka) → Real-Time MDM Enrichment → Mining Platform → AI/ML Prediction → Action Engine → RPA + GRC + Orchestration → Analytics CoE → GBS Executive Dashboards → Continuous Optimization Loop",
  },
};

/* ── DEPLOYMENT PLAYBOOK DATA ───────────────────── */
const PLAYBOOK_DATA = {
  sme: {
    totalWeeks: 8,
    phases: [
      { name: "Scope & Data Assessment", weeks: "W1–W2", activities: ["Identify OtC processes in scope", "Map ERP tables to event log fields", "Write extraction SQL queries", "Validate data quality (completeness, timestamps)"], gate: "Event log sample validated" },
      { name: "Tool Setup & Discovery", weeks: "W3–W4", activities: ["Install/configure mining tool", "Import full event log", "Generate initial process map", "Identify top 3 variants"], gate: "Process map reviewed with finance lead" },
      { name: "Analysis & Conformance", weeks: "W5–W6", activities: ["Define conformance rules (6 rules)", "Run conformance check", "Quantify variant impact (time, cost)", "Identify top 5 improvement opportunities"], gate: "Analysis report approved" },
      { name: "Action & Reporting", weeks: "W7–W8", activities: ["Build basic KPI dashboard", "Create improvement roadmap", "Set up recurring extraction (weekly)", "Train finance team on tool usage"], gate: "Recurring mining operational" },
    ],
    teamSize: "1–2 FTE (part-time analyst + finance sponsor)",
    investmentRange: "$5K–$20K (tool + effort)",
  },
  mid: {
    totalWeeks: 14,
    phases: [
      { name: "Strategy & Data Mapping", weeks: "W1–W3", activities: ["Define mining scope across entities", "Map multi-entity ERP tables", "Design activity standardization layer", "Build ETL pipeline (batch daily)", "Data quality assessment per entity"], gate: "ETL pipeline producing clean event log" },
      { name: "Platform Deployment", weeks: "W4–W6", activities: ["Deploy mining platform (cloud)", "Configure ERP connectors", "Load historical event data (12 months)", "Configure process taxonomy (→1.1 alignment)"], gate: "Platform operational with full data load" },
      { name: "Discovery & Conformance", weeks: "W7–W9", activities: ["Run automated process discovery", "Variant analysis across entities", "Define and activate conformance rules (10 rules)", "Build conformance monitoring dashboard"], gate: "Conformance baseline established" },
      { name: "Optimization & Operationalize", weeks: "W10–W12", activities: ["Quantify improvement opportunities", "Configure action workflows for top violations", "Build executive dashboard (→1.5 alignment)", "Train SSC team on mining insights"], gate: "Action workflows active" },
      { name: "Steady State & CI", weeks: "W13–W14", activities: ["Establish monthly mining review cadence", "Define KPI targets from mining insights", "Integrate with SSC governance (→2.6)", "Document runbook for ongoing operations"], gate: "Mining integrated into operations" },
    ],
    teamSize: "3–5 FTE (mining analyst, ETL developer, process owner, PM, part-time finance sponsor)",
    investmentRange: "$50K–$150K (platform + implementation + effort)",
  },
  enterprise: {
    totalWeeks: 24,
    phases: [
      { name: "Strategic Assessment", weeks: "W1–W4", activities: ["Executive alignment on mining goals", "Multi-ERP data landscape assessment", "Define global activity taxonomy (→1.1)", "MDM strategy for cross-ERP case ID", "Vendor selection / platform sizing", "Data privacy & compliance review"], gate: "Board-approved mining business case" },
      { name: "Platform & Data Foundation", weeks: "W5–W10", activities: ["Deploy enterprise mining platform", "Configure multi-ERP connectors + CDC", "Build MDM enrichment pipeline", "Implement activity standardization", "Load 18+ months historical data", "GRC integration for SOX events (→2.4)"], gate: "Full event log flowing from all ERPs" },
      { name: "Discovery & Variant Analysis", weeks: "W11–W14", activities: ["Automated discovery across all hubs", "AI-powered variant clustering", "Cross-hub performance benchmarking", "SOX conformance rule activation (12 rules)", "Identify top 10 automation opportunities"], gate: "Variant analysis report to steering committee" },
      { name: "Action Engine & Automation", weeks: "W15–W18", activities: ["Configure action flows for conformance violations", "Connect RPA bots for auto-remediation", "Build executive dashboard suite (→1.5)", "Deploy real-time alerting for critical violations", "BPO performance monitoring integration (→2.6)"], gate: "Action engine operational" },
      { name: "Operationalize & Scale", weeks: "W19–W22", activities: ["Train hub teams on mining insights", "Establish Process Excellence CoE", "Integrate mining into governance cadence (→2.6)", "Expand scope to additional processes", "Begin predictive analytics pilot"], gate: "Mining embedded in operations" },
      { name: "Continuous Optimization", weeks: "W23–W24", activities: ["Establish continuous improvement pipeline", "Define optimization KPI targets", "Build mining community of practice", "Document global runbook"], gate: "Self-sustaining mining operations" },
    ],
    teamSize: "8–15 FTE (mining CoE: analysts, data engineers, process owners, automation engineers, PM, executive sponsor)",
    investmentRange: "$300K–$1M (platform + implementation + CoE establishment)",
  },
  global: {
    totalWeeks: 36,
    phases: [
      { name: "GBS Mining Vision", weeks: "W1–W6", activities: ["Board-level mining strategy alignment", "Global data landscape assessment (5+ ERPs)", "Define global process taxonomy (→1.1, all levels)", "MDM + event bus architecture design", "Vendor strategy (platform + SI partner)", "Data sovereignty & multi-jurisdiction compliance"], gate: "Board-approved global mining program" },
      { name: "Global Platform Foundation", weeks: "W7–W14", activities: ["Deploy global mining platform (multi-region)", "Kafka event bus deployment", "Configure real-time CDC for all ERPs", "Build global MDM enrichment pipeline", "Implement multi-language activity standardization", "GRC integration for SOX + statutory (→2.4)", "Load 24+ months historical data per hub"], gate: "Global event streaming operational" },
      { name: "Hub-by-Hub Discovery", weeks: "W15–W20", activities: ["Anchor hub deep discovery + variant analysis", "Regional hub discovery (parallel tracks)", "AI-powered cross-hub variant clustering", "Global conformance rule activation (15 rules)", "Follow-the-sun pattern analysis", "M&A integration pattern assessment"], gate: "Global variant landscape mapped" },
      { name: "AI/ML & Action Engine", weeks: "W21–W26", activities: ["Deploy predictive conformance models", "Configure intelligent action engine", "Connect RPA + AI orchestration layer", "Build global executive dashboard suite", "Real-time alerting for compliance + SLA violations", "GBS P&L attribution analytics"], gate: "AI-powered action engine live" },
      { name: "Global Operationalization", weeks: "W27–W32", activities: ["Establish Analytics CoE with regional leads", "Train all hub teams (train-the-trainer)", "Integrate into GBS governance (→2.6)", "Expand scope: new processes, new hubs", "M&A integration playbook for mining onboarding", "Build global process community of practice"], gate: "Mining embedded globally" },
      { name: "Continuous Transformation", weeks: "W33–W36", activities: ["Establish continuous optimization pipeline", "Implement automated opportunity scoring", "Build self-service mining for business users", "Define Year 2+ AI/ML roadmap", "Document global mining operations playbook"], gate: "Self-sustaining global mining ecosystem" },
    ],
    teamSize: "20–40 FTE (Global Analytics CoE: mining leads per hub, data engineers, ML engineers, process excellence, automation engineers, regional PMs, executive sponsor, SI partner team)",
    investmentRange: "$1.5M–$5M+ (platform + global implementation + CoE + SI partner)",
  },
};

/* ── CROSS-REFERENCE MAP ────────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "Activity taxonomy source — all mining activities map to PCF codes" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Cash app process definitions, SOP basis for conformance rules" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Segment-specific dunning conformance, variant analysis by risk tier" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "Jurisdiction-specific compliance events in event log" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "KPI definitions aligned with mining outputs, dashboard integration" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Maturity scores inform mining scope prioritization" },
  { code: "2.1", name: "Credit Management Process Pack", relevance: "Credit check conformance rules, credit variant analysis" },
  { code: "2.2", name: "Dispute Resolution Process Pack", relevance: "Dispute categorization, resolution SLA conformance" },
  { code: "2.3", name: "Billing & Invoicing Process Pack", relevance: "Invoice generation accuracy, rework loop detection" },
  { code: "2.4", name: "SOX Compliance Controls Library", relevance: "SOX control events in event log, SoD conformance rules" },
  { code: "2.6", name: "Shared Services Transition Guide", relevance: "SSC/GBS performance monitoring, hub conformance tracking" },
];

/* ══════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════ */

const severityColor = (s) => {
  if (s === "Critical") return "#EF4444";
  if (s === "High") return "#FB923C";
  if (s === "Medium") return "#FBBF24";
  return "rgba(255,255,255,0.3)";
};

export default function ProcessMiningPlaybook() {
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("eventlog");
  const [showXref, setShowXref] = useState(false);
  const [conformanceFilter, setConformanceFilter] = useState("All");

  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

  /* ── Event Log Tab ────────────────────────── */
  const renderEventLog = () => {
    const data = EVENT_LOG_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>{data.description}</p>

        {/* Case ID */}
        <div style={{ padding: 12, background: accent + "11", borderRadius: 8, border: `1px solid ${accent}33`, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Case Identifier</span>
          <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{data.caseId.field}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Source: {data.caseId.source}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>{data.caseId.type}</span>
          </div>
        </div>

        {/* Mandatory Fields */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Mandatory Fields</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr>
                  {["Field", "Description", "Type", "PCF", "Source"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.mandatoryFields.map((f, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                    <td style={{ padding: "7px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11 }}>{f.field}</td>
                    <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{f.desc}</td>
                    <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 10 }}>{f.type}</td>
                    <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 10 }}>{f.pcf}</td>
                    <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 10 }}>{f.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional Fields */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Optional / Enrichment Fields</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.optionalFields.map((f, i) => (
              <span key={i} style={{ padding: "5px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>
                {f.field} <span style={{ color: "rgba(255,255,255,0.25)" }}>({f.type})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Activities + Metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Activity Universe ({data.activities.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {data.activities.map((a, i) => (
                <span key={i} style={{ padding: "3px 8px", background: accent + "11", borderRadius: 3, fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif" }}>{a}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Extraction</div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>VOLUME </span>
              <span style={{ fontSize: 12, color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{data.volumeEstimate}</span>
            </div>
            <div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>METHOD </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{data.extractionMethod}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Conformance Tab ──────────────────────── */
  const renderConformance = () => {
    const data = CONFORMANCE_DATA[tier];
    const types = ["All", ...Array.from(new Set(data.map((r) => r.type)))];
    const filtered = conformanceFilter === "All" ? data : data.filter((r) => r.type === conformanceFilter);
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {types.map((t) => (
            <button key={t} onClick={() => setConformanceFilter(t)} style={{ padding: "5px 12px", borderRadius: 5, border: `1px solid ${conformanceFilter === t ? accent : "rgba(255,255,255,0.08)"}`, background: conformanceFilter === t ? accent + "22" : "rgba(255,255,255,0.03)", color: conformanceFilter === t ? accent : "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", fontWeight: conformanceFilter === t ? 600 : 400 }}>{t}</button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
            <thead>
              <tr>
                {["ID", "Rule", "Type", "Severity", "PCF", "Cross-Ref"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                  <td style={{ padding: "7px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.id}</td>
                  <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.rule}</td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ padding: "2px 7px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{r.type}</span></td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ padding: "2px 7px", borderRadius: 3, background: severityColor(r.severity) + "22", color: severityColor(r.severity), fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.severity}</span></td>
                  <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.pcf}</td>
                  <td style={{ padding: "7px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{r.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{filtered.length} rules · {data.filter((r) => r.severity === "Critical").length} critical</div>
      </div>
    );
  };

  /* ── Variant Analysis Tab ─────────────────── */
  const renderVariants = () => {
    const data = VARIANT_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{data.description}</p>
          <span style={{ fontSize: 11, color: accent, fontFamily: "'JetBrains Mono', monospace", padding: "4px 10px", background: accent + "11", borderRadius: 4, whiteSpace: "nowrap", marginLeft: 12 }}>Target: {data.targetVariants} variants</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.variants.map((v, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, fontWeight: 700, padding: "2px 6px", background: accent + "22", borderRadius: 3 }}>{v.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{v.name}</span>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{v.frequency}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>{v.path}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Impact: <span style={{ color: v.impact === "Baseline" || v.impact === "Touchless baseline" || v.impact === "Lowest cost baseline" ? "#34D399" : "#FBBF24" }}>{v.impact}</span></span>
                <span style={{ fontSize: 10, color: accent }}>{v.action}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Analysis Approach</span>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{data.analysisApproach}</div>
        </div>
      </div>
    );
  };

  /* ── Tool Stack Tab ───────────────────────── */
  const renderTools = () => {
    const data = TOOL_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>{data.tier}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {data.tools.map((t, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.category}</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{t.tool}</div>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{t.license}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{t.purpose}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>Setup: {t.setup}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Integration Architecture</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 8 }}>{data.integrations}</div>
          <div style={{ fontSize: 10, color: accent, fontFamily: "'JetBrains Mono', monospace", padding: "8px 10px", background: accent + "08", borderRadius: 4, lineHeight: 1.5 }}>{data.architecture}</div>
        </div>
      </div>
    );
  };

  /* ── Deployment Playbook Tab ──────────────── */
  const renderPlaybook = () => {
    const data = PLAYBOOK_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Total duration: <span style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{data.totalWeeks} weeks</span></span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>{data.teamSize}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.phases.map((phase, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: accent + "22", border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{phase.name}</span>
                </div>
                <span style={{ fontSize: 10, color: accent, fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px", background: accent + "11", borderRadius: 3 }}>{phase.weeks}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {phase.activities.map((a, j) => (
                  <span key={j} style={{ padding: "4px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 4, fontSize: 10, color: "rgba(255,255,255,0.6)", borderLeft: `2px solid ${accent}33`, fontFamily: "'DM Sans', sans-serif" }}>{a}</span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>Gate: {phase.gate}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 12, background: accent + "08", borderRadius: 8, border: `1px solid ${accent}22` }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>INVESTMENT </span>
          <span style={{ fontSize: 12, color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{data.investmentRange}</span>
        </div>
      </div>
    );
  };

  /* ── MAIN RENDER ──────────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.5</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Process Mining Playbook</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>
          Event log schemas, conformance rules, variant analysis frameworks, tool stack specifications, deployment methodology
        </p>
      </div>

      {/* Tier Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TIERS.map((t) => (
          <button key={t.key} onClick={() => { setTier(t.key); setConformanceFilter("All"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`, background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)", color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tier === t.key ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif" }}>
            <div>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 14px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`, background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
            <span style={{ marginRight: 5, fontSize: 10 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: 400 }}>
        {tab === "eventlog" && renderEventLog()}
        {tab === "conformance" && renderConformance()}
        {tab === "variants" && renderVariants()}
        {tab === "tools" && renderTools()}
        {tab === "playbook" && renderPlaybook()}
      </div>

      {/* Cross-Reference Panel */}
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

      {/* Footer */}
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>APQC PCF v8.0 · IEEE 1849-2016 (XES) · Celonis Best Practices</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.5 — Process Mining Playbook · v1.0</span>
      </div>
    </div>
  );
}
