import { useState } from "react";

/* ─────────────────────────────────────────────────
   2.4 — SOX Compliance Controls Library
   OtC Consulting Toolkit · Phase 2
   ───────────────────────────────────────────────── */

const TIERS = [
  { key: "sme", label: "SME", accent: "#22D3EE", desc: "< $50M Rev · 1–2 Entities" },
  { key: "mid", label: "Mid-Market", accent: "#A78BFA", desc: "$50M–$500M · 3–10 Entities" },
  { key: "enterprise", label: "Enterprise", accent: "#F472B6", desc: "$500M–$5B · 10–50 Entities" },
  { key: "global", label: "Global MNC", accent: "#FB923C", desc: "$5B+ · 50+ Entities" },
];

const TABS = [
  { key: "matrix", label: "Control Matrix", icon: "◈" },
  { key: "riskmap", label: "Risk & Control Mapping", icon: "◆" },
  { key: "testing", label: "Testing Procedures", icon: "◇" },
  { key: "deficiency", label: "Deficiency Tracker", icon: "◉" },
  { key: "audit", label: "Audit Readiness", icon: "◎" },
];

/* ══ CONTROL MATRIX ══════════════════════════════ */
const CONTROL_MATRIX = {
  sme: [
    { id: "OTC-01", name: "Credit Limit Approval", process: "Credit Mgmt (→2.1)", type: "Manual", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Finance Dir.", description: "Credit limits >$25K require Finance Director written approval before ERP entry", evidence: "Signed approval form, ERP change log" },
    { id: "OTC-02", name: "Invoice Accuracy Review", process: "Billing (→2.3)", type: "Manual", nature: "Detective", frequency: "Per event", assertion: "Accuracy", owner: "AR / Billing", description: "Invoices >$10K reviewed for pricing, quantity, and tax accuracy before release", evidence: "Reviewer sign-off, invoice copy" },
    { id: "OTC-03", name: "Credit Memo Approval", process: "Disputes (→2.2)", type: "Manual", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Finance Dir.", description: "Credit memos >$5K require Finance Director approval; creator ≠ approver", evidence: "Approval signature, CM document" },
    { id: "OTC-04", name: "Cash Application Reconciliation", process: "Cash App (→1.2)", type: "Manual", nature: "Detective", frequency: "Weekly", assertion: "Completeness", owner: "AR Team", description: "Weekly reconciliation of cash receipts to bank statement and AR sub-ledger", evidence: "Reconciliation workpaper, sign-off" },
    { id: "OTC-05", name: "Write-Off Authorization", process: "Collections (→1.3)", type: "Manual", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Finance Dir.", description: "All write-offs require Finance Director approval with documented rationale", evidence: "Write-off form, approval, supporting docs" },
    { id: "OTC-06", name: "AR Aging Review", process: "Collections (→1.3)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "Valuation", owner: "Finance Dir.", description: "Monthly review of AR aging report; investigate items >60 days past due", evidence: "Aging report with review notes" },
    { id: "OTC-07", name: "Revenue Recognition Review", process: "Billing (→2.3)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "Cutoff", owner: "Finance Dir.", description: "Month-end review that revenue is recognized per delivery/service completion", evidence: "Rev rec checklist, supporting docs" },
    { id: "OTC-08", name: "Customer Master Data Changes", process: "Master Data", type: "IT-Dependent Manual", nature: "Preventive", frequency: "Per event", assertion: "Existence", owner: "AR Team", description: "Changes to customer master (bank details, credit terms) require dual authorization", evidence: "Change request form, ERP audit log" },
  ],
  mid: [
    { id: "OTC-01", name: "Credit Limit Approval Workflow", process: "Credit Mgmt (→2.1)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Credit Mgr", description: "System-enforced tiered approval: ≤$100K analyst, $100K–$500K manager, >$500K VP. Requestor ≠ approver enforced by workflow.", evidence: "Workflow audit trail, ERP approval log" },
    { id: "OTC-02", name: "Credit Limit Override Control", process: "Credit Mgmt (→2.1)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Weekly", assertion: "Valuation", owner: "Credit Mgr", description: "Weekly review of all credit limit overrides; investigate and document justification", evidence: "Override report, review notes" },
    { id: "OTC-03", name: "Auto-Invoice Validation", process: "Billing (→2.3)", type: "Automated (ITGC)", nature: "Preventive", frequency: "Per event", assertion: "Accuracy", owner: "Billing Mgr", description: "System validates invoices against PO (3-way match), pricing master, and tax rules before release", evidence: "System validation log, exception report" },
    { id: "OTC-04", name: "Invoice Exception Review", process: "Billing (→2.3)", type: "Manual", nature: "Detective", frequency: "Daily", assertion: "Accuracy", owner: "Billing Analyst", description: "Daily review and resolution of billing exceptions; exceptions >$25K escalated to manager", evidence: "Exception queue log, resolution notes" },
    { id: "OTC-05", name: "Credit Memo SoD", process: "Disputes (→2.2)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Dispute Mgr", description: "System enforces segregation: dispute investigator ≠ credit memo approver. Tiered approval by value.", evidence: "Workflow configuration, approval trail" },
    { id: "OTC-06", name: "Cash Application Reconciliation", process: "Cash App (→1.2)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Daily", assertion: "Completeness", owner: "AR Mgr", description: "Daily reconciliation of auto-matched and manual cash applications to bank deposits", evidence: "Reconciliation report, sign-off" },
    { id: "OTC-07", name: "Write-Off Dual Approval", process: "Collections (→1.3)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "VP Finance", description: "Write-offs require preparer + independent approver. >$50K requires VP Finance.", evidence: "Workflow trail, write-off package" },
    { id: "OTC-08", name: "AR Aging & Reserve Review", process: "Collections (→1.3)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "Valuation", owner: "VP Finance", description: "Monthly AR aging review with bad debt reserve adequacy assessment", evidence: "Aging report, reserve calculation, VP sign-off" },
    { id: "OTC-09", name: "Revenue Recognition Assessment", process: "Billing (→2.3)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "Cutoff / Accuracy", owner: "Controller", description: "Month-end assessment of revenue recognition per ASC 606 / IFRS 15 criteria", evidence: "Rev rec workpaper, contract review" },
    { id: "OTC-10", name: "E-Invoice Compliance Check", process: "Billing (→1.4, 2.3)", type: "Automated", nature: "Detective", frequency: "Daily", assertion: "Compliance", owner: "Tax/Compliance", description: "Daily monitoring of e-invoice submission status and rejection resolution", evidence: "E-invoice status dashboard, rejection log" },
    { id: "OTC-11", name: "User Access Review", process: "IT General Controls", type: "Manual", nature: "Detective", frequency: "Quarterly", assertion: "All", owner: "IT/Finance", description: "Quarterly review of user access to OtC systems; verify appropriate roles and SoD", evidence: "Access review report, remediation log" },
    { id: "OTC-12", name: "Customer Master Data Governance", process: "Master Data", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Existence", owner: "AR Mgr", description: "Dual-approval workflow for customer master changes (bank details, credit terms, addresses)", evidence: "Change workflow trail, ERP audit log" },
  ],
  enterprise: [
    { id: "OTC-01", name: "Credit Approval Workflow (Multi-tier)", process: "Credit Mgmt (→2.1)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Credit CoE Lead", description: "System-enforced tiered approval across SSC/CoE/Regional FD/CFO with SoD. Group exposure check automated.", evidence: "GRC workflow trail, exposure report" },
    { id: "OTC-02", name: "Credit Override & Exception Monitoring", process: "Credit Mgmt (→2.1)", type: "Automated + Manual", nature: "Detective", frequency: "Daily", assertion: "Valuation", owner: "Credit CoE Lead", description: "Automated alert on all credit block overrides; daily CoE review with documented rationale", evidence: "Override alert log, CoE review notes" },
    { id: "OTC-03", name: "Invoice Validation Engine", process: "Billing (→2.3)", type: "Automated (ITGC)", nature: "Preventive", frequency: "Per event", assertion: "Accuracy", owner: "Billing CoE", description: "5-point automated validation (PO match, pricing, quantity, tax, compliance) with configurable tolerance", evidence: "Validation engine log, config documentation" },
    { id: "OTC-04", name: "Billing Exception Management", process: "Billing (→2.3)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Daily", assertion: "Accuracy", owner: "SSC Billing Ops", description: "Daily exception management with tiered escalation (SSC → CoE → Regional FD) per SLA", evidence: "Exception queue, resolution timestamps" },
    { id: "OTC-05", name: "Credit Memo SoD & Approval Chain", process: "Disputes (→2.2)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Dispute CoE", description: "System-enforced multi-level SoD: investigator ≠ analyst ≠ approver. Value-based approval tiers.", evidence: "GRC workflow, SoD matrix" },
    { id: "OTC-06", name: "Cash Application Reconciliation (Multi-entity)", process: "Cash App (→1.2)", type: "Automated + Manual", nature: "Detective", frequency: "Daily", assertion: "Completeness", owner: "SSC Cash Ops", description: "Auto-reconciliation with daily manual review of exceptions and unmatched items across all entities", evidence: "Reconciliation dashboard, exception report" },
    { id: "OTC-07", name: "Write-Off Authorization Chain", process: "Collections (→1.3)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Global CFO", description: "Multi-tier write-off: SSC (≤$50K), Regional FD ($50K–$500K), CFO (>$500K). Full audit trail.", evidence: "GRC approval chain, write-off package" },
    { id: "OTC-08", name: "ECL / Bad Debt Reserve", process: "Collections (→1.3)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Monthly", assertion: "Valuation", owner: "Group Controller", description: "Monthly IFRS 9 ECL calculation with model validation; reserve adequacy assessment by Controller", evidence: "ECL model output, Controller sign-off" },
    { id: "OTC-09", name: "Multi-GAAP Revenue Recognition", process: "Billing (→2.3)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Monthly", assertion: "Cutoff / Accuracy", owner: "Group Controller", description: "Parallel ASC 606 / IFRS 15 / local GAAP assessment with contract-level review for complex arrangements", evidence: "Rev rec workpapers, contract analysis" },
    { id: "OTC-10", name: "E-Invoice Compliance Monitoring", process: "Billing (→1.4, 2.3)", type: "Automated", nature: "Detective", frequency: "Real-time", assertion: "Compliance", owner: "Tax CoE", description: "Real-time monitoring of e-invoice submission across all jurisdictions with auto-alert on rejections", evidence: "E-invoice dashboard, rejection/resolution log" },
    { id: "OTC-11", name: "Intercompany Billing & Elimination", process: "Billing (→2.3)", type: "Automated + Manual", nature: "Detective", frequency: "Monthly", assertion: "Accuracy", owner: "Group Controller", description: "Automated IC matching with manual review of mismatches; elimination entries validated before close", evidence: "IC reconciliation, elimination journal" },
    { id: "OTC-12", name: "User Access & SoD Review", process: "IT General Controls", type: "Manual", nature: "Detective", frequency: "Quarterly", assertion: "All", owner: "IT CoE / Internal Audit", description: "Quarterly SoD conflict analysis across all OtC roles; remediation within 30 days of finding", evidence: "SoD matrix, access review, remediation log" },
    { id: "OTC-13", name: "SSC/BPO Performance Controls", process: "SSC Ops (→2.6)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "All", owner: "SSC Governance", description: "Monthly review of SSC/BPO control effectiveness, SLA compliance, and control exceptions", evidence: "SLA scorecard, control effectiveness report" },
    { id: "OTC-14", name: "Process Mining Conformance", process: "Process Mining (→2.5)", type: "Automated", nature: "Detective", frequency: "Weekly", assertion: "All", owner: "Billing CoE", description: "Weekly automated conformance check of actual OtC processes vs. documented controls", evidence: "Conformance report, deviation log" },
    { id: "OTC-15", name: "Customer Master Data (Global)", process: "Master Data", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Existence", owner: "SSC Ops", description: "Dual-approval workflow for master data changes propagated across all entities via MDM", evidence: "MDM workflow trail, propagation log" },
  ],
  global: [
    { id: "OTC-01", name: "Global Credit Approval (AI-Enhanced)", process: "Credit Mgmt (→2.1)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Credit CoE Global", description: "AI-scored credit decisions with system-enforced multi-jurisdiction approval chain. ML explainability for audit. Group exposure real-time.", evidence: "AI score log, SHAP report, GRC trail" },
    { id: "OTC-02", name: "Credit Override & Portfolio Monitoring", process: "Credit Mgmt (→2.1)", type: "Automated", nature: "Detective", frequency: "Real-time", assertion: "Valuation", owner: "Credit CoE Global", description: "Real-time alerting on credit block overrides, concentration breaches, and portfolio triggers across all hubs", evidence: "Alert log, portfolio dashboard, CoE review" },
    { id: "OTC-03", name: "AI Invoice Validation", process: "Billing (→2.3)", type: "Automated (ITGC)", nature: "Preventive", frequency: "Per event", assertion: "Accuracy", owner: "Billing CoE Global", description: "ML 7-point validation with anomaly detection. AI auto-fix for known patterns with human audit sampling.", evidence: "ML validation log, audit sample, model metrics" },
    { id: "OTC-04", name: "Global Billing Exception Governance", process: "Billing (→2.3)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Daily", assertion: "Accuracy", owner: "GBS Hub Ops", description: "Follow-the-sun exception management with auto-escalation. Hub → CoE → Tax → Regional CFO per SLA.", evidence: "Exception queue, SLA compliance log" },
    { id: "OTC-05", name: "Dispute Resolution SoD (Multi-jurisdiction)", process: "Disputes (→2.2)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Dispute CoE Global", description: "System-enforced SoD across all hubs and jurisdictions. Investigator ≠ analyst ≠ approver. Jurisdiction-specific thresholds.", evidence: "GRC configuration, workflow trails" },
    { id: "OTC-06", name: "Global Cash Reconciliation", process: "Cash App (→1.2)", type: "Automated + Manual", nature: "Detective", frequency: "Daily", assertion: "Completeness", owner: "GBS Cash Ops", description: "Automated reconciliation across all bank accounts, entities, and hubs with exception management", evidence: "Global recon dashboard, exception reports" },
    { id: "OTC-07", name: "Write-Off Authorization (Global)", process: "Collections (→1.3)", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Valuation", owner: "Group CFO", description: "Multi-jurisdiction write-off chain: Hub (≤$100K), Regional CFO ($100K–$1M), Group CFO (>$1M), Board Risk (>$5M).", evidence: "GRC approval chain, board minutes" },
    { id: "OTC-08", name: "Multi-GAAP ECL & Reserve", process: "Collections (→1.3)", type: "Automated + Manual", nature: "Detective", frequency: "Monthly", assertion: "Valuation", owner: "Group Controller", description: "Parallel IFRS 9 / CECL / local GAAP ECL with ML model validation. Reserve adequacy by segment and jurisdiction.", evidence: "ECL model output, validation report, sign-off" },
    { id: "OTC-09", name: "Multi-GAAP Revenue Recognition", process: "Billing (→2.3)", type: "IT-Dependent Manual", nature: "Detective", frequency: "Monthly", assertion: "Cutoff / Accuracy", owner: "Group Controller", description: "Parallel ASC 606 / IFRS 15 / local revenue recognition with AI-assisted contract analysis for complex arrangements", evidence: "Rev rec workpapers, AI contract analysis log" },
    { id: "OTC-10", name: "Global E-Invoice Compliance", process: "Billing (→1.4, 2.3)", type: "Automated", nature: "Detective", frequency: "Real-time", assertion: "Compliance", owner: "Tax CoE Global", description: "Real-time compliance monitoring across 22+ jurisdictions with auto-retry, escalation, and regulatory reporting", evidence: "Jurisdiction compliance dashboard, audit packages" },
    { id: "OTC-11", name: "Global IC Billing & Elimination", process: "Billing (→2.3)", type: "Automated + Manual", nature: "Detective", frequency: "Monthly", assertion: "Accuracy", owner: "Group Controller", description: "AI-assisted IC matching across all entities with transfer pricing compliance and elimination validation", evidence: "IC recon, TP documentation, elimination log" },
    { id: "OTC-12", name: "Global User Access & SoD", process: "IT General Controls", type: "Automated + Manual", nature: "Detective", frequency: "Quarterly", assertion: "All", owner: "IT CoE / Internal Audit", description: "Automated continuous SoD monitoring with quarterly full review across all hubs, ERPs, and jurisdictions", evidence: "Continuous SoD monitor, quarterly report" },
    { id: "OTC-13", name: "GBS Control Effectiveness", process: "SSC Ops (→2.6)", type: "Manual", nature: "Detective", frequency: "Monthly", assertion: "All", owner: "GBS Governance", description: "Monthly control effectiveness assessment across all hubs and BPO partners with benchmarking", evidence: "Control scorecard, BPO audit reports" },
    { id: "OTC-14", name: "Process Mining Conformance (Real-time)", process: "Process Mining (→2.5)", type: "Automated", nature: "Detective", frequency: "Real-time", assertion: "All", owner: "Analytics CoE", description: "Real-time conformance monitoring of all OtC processes against control design. AI-driven anomaly detection.", evidence: "Conformance dashboard, anomaly alerts" },
    { id: "OTC-15", name: "Global Master Data Governance", process: "Master Data", type: "Automated", nature: "Preventive", frequency: "Per event", assertion: "Existence", owner: "GBS MDM Ops", description: "Global MDM with dual-approval, real-time propagation across all ERPs, and change audit trail", evidence: "MDM workflow, propagation confirmation" },
    { id: "OTC-16", name: "Statutory Control Overlay", process: "Multi-Jurisdiction", type: "Manual + Automated", nature: "Preventive / Detective", frequency: "Per jurisdiction", assertion: "Compliance", owner: "Legal / Compliance", description: "Jurisdiction-specific statutory controls layered over SOX framework (e.g., J-SOX, C-SOX, UK SOX)", evidence: "Statutory control matrix, jurisdiction reports" },
    { id: "OTC-17", name: "AI/ML Model Governance", process: "AI/ML Controls", type: "Manual", nature: "Detective", frequency: "Quarterly", assertion: "All", owner: "AI/ML CoE", description: "Quarterly validation of all AI/ML models used in OtC: accuracy, bias, drift, explainability audit", evidence: "Model validation report, bias analysis, SHAP" },
    { id: "OTC-18", name: "M&A Integration Controls", process: "M&A", type: "Manual", nature: "Preventive", frequency: "Per event", assertion: "All", owner: "Group Controller", description: "Acquired entity control gap assessment and remediation plan within 90 days of close", evidence: "Gap assessment, remediation plan, status log" },
  ],
};

/* ══ RISK & CONTROL MAPPING ══════════════════════ */
const RISK_MAP = {
  sme: [
    { risk: "Inaccurate invoicing leading to disputes", likelihood: "Medium", impact: "Medium", controls: ["OTC-02"], process: "Billing (→2.3)" },
    { risk: "Unauthorized credit exposure", likelihood: "Low", impact: "High", controls: ["OTC-01"], process: "Credit (→2.1)" },
    { risk: "Fictitious credit memos reducing revenue", likelihood: "Low", impact: "High", controls: ["OTC-03"], process: "Disputes (→2.2)" },
    { risk: "Unreconciled cash leading to misstatement", likelihood: "Medium", impact: "Medium", controls: ["OTC-04"], process: "Cash App (→1.2)" },
    { risk: "Excessive bad debt from inadequate write-off controls", likelihood: "Low", impact: "High", controls: ["OTC-05", "OTC-06"], process: "Collections (→1.3)" },
    { risk: "Revenue recognized in wrong period", likelihood: "Medium", impact: "High", controls: ["OTC-07"], process: "Revenue (→2.3)" },
  ],
  mid: [
    { risk: "Unauthorized or excessive credit exposure", likelihood: "Medium", impact: "High", controls: ["OTC-01", "OTC-02"], process: "Credit (→2.1)" },
    { risk: "Invoice errors causing disputes and revenue leakage", likelihood: "Medium", impact: "High", controls: ["OTC-03", "OTC-04"], process: "Billing (→2.3)" },
    { risk: "Fraudulent credit memos", likelihood: "Low", impact: "Critical", controls: ["OTC-05"], process: "Disputes (→2.2)" },
    { risk: "Cash misapplication or misappropriation", likelihood: "Low", impact: "High", controls: ["OTC-06"], process: "Cash App (→1.2)" },
    { risk: "Inadequate bad debt provisioning", likelihood: "Medium", impact: "High", controls: ["OTC-07", "OTC-08"], process: "Collections (→1.3)" },
    { risk: "Revenue misstatement (cutoff / recognition)", likelihood: "Medium", impact: "Critical", controls: ["OTC-09"], process: "Revenue (→2.3)" },
    { risk: "E-invoice non-compliance penalties", likelihood: "Medium", impact: "Medium", controls: ["OTC-10"], process: "E-Invoice (→1.4)" },
    { risk: "Inappropriate system access / SoD violations", likelihood: "Low", impact: "High", controls: ["OTC-11"], process: "ITGC" },
    { risk: "Unauthorized customer master changes", likelihood: "Low", impact: "High", controls: ["OTC-12"], process: "Master Data" },
  ],
  enterprise: [
    { risk: "Unauthorized credit across entities / group", likelihood: "Medium", impact: "Critical", controls: ["OTC-01", "OTC-02"], process: "Credit (→2.1)" },
    { risk: "Global invoice inaccuracy at scale", likelihood: "Medium", impact: "High", controls: ["OTC-03", "OTC-04"], process: "Billing (→2.3)" },
    { risk: "Credit memo fraud across hubs", likelihood: "Low", impact: "Critical", controls: ["OTC-05"], process: "Disputes (→2.2)" },
    { risk: "Cash reconciliation failure (multi-entity)", likelihood: "Medium", impact: "High", controls: ["OTC-06"], process: "Cash App (→1.2)" },
    { risk: "Material bad debt / ECL model failure", likelihood: "Low", impact: "Critical", controls: ["OTC-07", "OTC-08"], process: "Collections (→1.3)" },
    { risk: "Multi-GAAP revenue misstatement", likelihood: "Medium", impact: "Critical", controls: ["OTC-09"], process: "Revenue (→2.3)" },
    { risk: "Multi-jurisdiction e-invoice non-compliance", likelihood: "High", impact: "High", controls: ["OTC-10"], process: "E-Invoice (→1.4)" },
    { risk: "IC billing / elimination errors", likelihood: "Medium", impact: "High", controls: ["OTC-11"], process: "IC Billing (→2.3)" },
    { risk: "SoD violations across SSC/BPO", likelihood: "Medium", impact: "High", controls: ["OTC-12"], process: "ITGC" },
    { risk: "SSC/BPO control degradation", likelihood: "Medium", impact: "High", controls: ["OTC-13"], process: "SSC (→2.6)" },
    { risk: "Process deviations undetected", likelihood: "Medium", impact: "Medium", controls: ["OTC-14"], process: "Mining (→2.5)" },
  ],
  global: [
    { risk: "Global credit exposure exceeding risk appetite", likelihood: "Medium", impact: "Critical", controls: ["OTC-01", "OTC-02"], process: "Credit (→2.1)" },
    { risk: "AI-driven invoice errors at global scale", likelihood: "Low", impact: "Critical", controls: ["OTC-03", "OTC-04"], process: "Billing (→2.3)" },
    { risk: "Cross-hub credit memo fraud", likelihood: "Low", impact: "Critical", controls: ["OTC-05"], process: "Disputes (→2.2)" },
    { risk: "Global cash reconciliation failure", likelihood: "Medium", impact: "Critical", controls: ["OTC-06"], process: "Cash App (→1.2)" },
    { risk: "Multi-GAAP ECL / reserve misstatement", likelihood: "Medium", impact: "Critical", controls: ["OTC-07", "OTC-08"], process: "Collections (→1.3)" },
    { risk: "Global multi-GAAP revenue misstatement", likelihood: "Medium", impact: "Critical", controls: ["OTC-09"], process: "Revenue (→2.3)" },
    { risk: "22+ jurisdiction e-invoice non-compliance", likelihood: "High", impact: "Critical", controls: ["OTC-10"], process: "E-Invoice (→1.4)" },
    { risk: "Global IC / transfer pricing misstatement", likelihood: "Medium", impact: "Critical", controls: ["OTC-11"], process: "IC Billing (→2.3)" },
    { risk: "Global SoD violations", likelihood: "Medium", impact: "High", controls: ["OTC-12"], process: "ITGC" },
    { risk: "GBS / BPO control breakdown", likelihood: "Medium", impact: "High", controls: ["OTC-13"], process: "GBS (→2.6)" },
    { risk: "Undetected process deviations at scale", likelihood: "High", impact: "High", controls: ["OTC-14"], process: "Mining (→2.5)" },
    { risk: "Multi-jurisdiction statutory non-compliance", likelihood: "High", impact: "Critical", controls: ["OTC-16"], process: "Statutory" },
    { risk: "AI/ML model failure in controls", likelihood: "Low", impact: "Critical", controls: ["OTC-17"], process: "AI/ML" },
    { risk: "M&A integration control gaps", likelihood: "High", impact: "High", controls: ["OTC-18"], process: "M&A" },
  ],
};

/* ══ TESTING PROCEDURES ══════════════════════════ */
const TESTING_DATA = {
  sme: {
    approach: "Annual testing by external auditor with management self-assessment support",
    sampleSizing: "Small population (<250 occurrences): test all or 25 items. Larger: 25–40 items per control.",
    procedures: [
      { control: "OTC-01", method: "Inquiry + Inspection", sample: "All approvals in period", steps: "Obtain credit approval log → verify signature and authority → confirm limit in ERP matches approved amount → test 100% of >$25K approvals" },
      { control: "OTC-02", method: "Reperformance", sample: "25 invoices (random)", steps: "Select sample → independently verify pricing against contract → recalculate tax → compare to issued invoice → document exceptions" },
      { control: "OTC-03", method: "Inspection + Inquiry", sample: "All credit memos >$5K", steps: "Obtain CM listing → verify approval signature ≠ creator → confirm supporting documentation → trace to dispute file" },
      { control: "OTC-05", method: "Inspection", sample: "All write-offs in period", steps: "Obtain write-off log → verify FD approval for each → confirm rationale documented → verify AR adjusted" },
    ],
  },
  mid: {
    approach: "Combined management testing and external audit reliance. Quarterly management self-assessment with annual external validation.",
    sampleSizing: "Automated controls: 1 per period (test design + implementation). Manual daily: 25–40. Manual weekly: 5–15. Manual monthly: 2–4. Manual quarterly: 2.",
    procedures: [
      { control: "OTC-01", method: "Walkthrough + System Config Review", sample: "1 walkthrough + config inspection", steps: "Walkthrough approval workflow → inspect system configuration for tier thresholds and SoD enforcement → test 1 transaction per tier → verify GRC audit trail integrity" },
      { control: "OTC-03", method: "Automated Test + Reperformance", sample: "1 config test + 25 invoice reperformance", steps: "Test validation engine configuration → select 25 invoices across entities → reperform PO match, pricing, tax → verify exception handling per SOP" },
      { control: "OTC-05", method: "System Config + Transaction Test", sample: "1 config + 25 credit memos", steps: "Verify SoD configuration → test 25 CMs: confirm investigator ≠ approver → verify value-based routing → confirm supporting dispute file" },
      { control: "OTC-09", method: "Reperformance", sample: "3 monthly assessments", steps: "Select 3 month-end periods → reperform rev rec for 10 contracts each → verify ASC 606/IFRS 15 criteria applied → check cutoff accuracy" },
      { control: "OTC-11", method: "Inspection + Data Analytics", sample: "Full population", steps: "Extract full user access list → run SoD conflict report → inspect quarterly review documentation → verify remediation of identified conflicts within 30 days" },
    ],
  },
  enterprise: {
    approach: "Continuous controls monitoring (CCM) layer supplemented by quarterly management testing and annual external audit. GRC-integrated testing workflow.",
    sampleSizing: "Automated: 1 design + implementation test. High-frequency manual: 25–60 (risk-based). Monthly: 2–4. Quarterly: 2. CCM: full population analytics.",
    procedures: [
      { control: "OTC-01", method: "CCM + Walkthrough", sample: "Full population analytics + 1 walkthrough per hub", steps: "CCM: analyze 100% of credit approvals for SoD violations, threshold breaches → Walkthrough: one per SSC hub → verify GRC trail integrity and group exposure automation" },
      { control: "OTC-03", method: "CCM + Reperformance", sample: "Full population + 40 reperformance", steps: "CCM: validation engine pass/fail analysis on full population → anomaly detection for false passes → Reperform 40 invoices across entities/hubs" },
      { control: "OTC-08", method: "Model Validation + Reperformance", sample: "Model validation + 3 monthly ECL calculations", steps: "Validate ECL model methodology against IFRS 9 → test input data accuracy → reperform 3 monthly calculations → assess reserve adequacy vs. actuals" },
      { control: "OTC-10", method: "CCM + Jurisdiction Sample", sample: "Full population + 5 jurisdiction deep-dives", steps: "CCM: 100% e-invoice submission status monitoring → Deep-dive 5 jurisdictions: verify format compliance, rejection handling, regulatory reporting" },
      { control: "OTC-14", method: "Automated Report Review", sample: "Weekly reports for full period", steps: "Review weekly conformance reports from process mining → investigate deviations >5% from expected → verify corrective actions documented and implemented" },
    ],
  },
  global: {
    approach: "AI-augmented continuous controls monitoring across all hubs and jurisdictions. Quarterly management testing per hub. Annual external audit with reliance on CCM. Multi-jurisdiction statutory testing overlay.",
    sampleSizing: "CCM covers full population for automated controls. Manual: risk-weighted sampling 40–80 per control. Statutory: per-jurisdiction requirements. AI model controls: quarterly full validation.",
    procedures: [
      { control: "OTC-01", method: "CCM + AI Audit + Hub Walkthroughs", sample: "100% population + 1 walkthrough per hub", steps: "CCM: AI analyzes all credit decisions for SoD, threshold, exposure → audit AI model accuracy (SHAP analysis) → walkthrough 1 per hub → statutory overlay testing per jurisdiction" },
      { control: "OTC-03", method: "CCM + AI Model Validation + Reperformance", sample: "100% + model validation + 60 reperformance", steps: "CCM: ML validation results for full population → validate ML model accuracy/bias/drift → reperform 60 invoices across hubs/ERPs/jurisdictions → test auto-fix accuracy" },
      { control: "OTC-10", method: "CCM + Full Jurisdiction Review", sample: "100% + all 22 jurisdictions reviewed", steps: "CCM: real-time compliance across all jurisdictions → annual review of each jurisdiction: format, submission, rejection handling, regulatory reporting, audit package adequacy" },
      { control: "OTC-16", method: "Jurisdiction-Specific Testing", sample: "Per statutory requirement", steps: "Identify all applicable statutory requirements (J-SOX, C-SOX, UK SOX, etc.) → map to OtC controls → test incremental requirements per jurisdiction → document compliance" },
      { control: "OTC-17", method: "Full Model Audit", sample: "All OtC AI/ML models", steps: "Quarterly: inventory all AI/ML models → validate accuracy metrics → test for bias and drift → review explainability outputs → assess human override frequency and appropriateness" },
    ],
  },
};

/* ══ DEFICIENCY TRACKER ══════════════════════════ */
const DEFICIENCY_DATA = {
  sme: {
    categories: [
      { level: "Deficiency", definition: "Control exists but does not operate effectively in isolated instances", response: "Remediate within 60 days; management monitoring", color: "#FBBF24" },
      { level: "Significant Deficiency", definition: "Reasonable possibility that material misstatement would not be prevented or detected timely", response: "Remediate within 30 days; report to Audit Committee", color: "#FB923C" },
      { level: "Material Weakness", definition: "Reasonable possibility that material misstatement of annual financials would not be prevented or detected", response: "Immediate remediation; disclose in 10-K; CEO/CFO certification impact", color: "#EF4444" },
    ],
    escalation: "Finance Director reviews all findings. Material Weakness → Board / external auditor notification within 48 hours.",
    commonFindings: [
      "Lack of documented approval for credit decisions",
      "No segregation of duties on credit memo processing",
      "Incomplete or late AR reconciliation",
      "Revenue recognition without delivery confirmation",
    ],
  },
  mid: {
    categories: [
      { level: "Control Observation", definition: "Improvement opportunity; control effective but could be enhanced", response: "Track in improvement log; address within 90 days", color: "#34D399" },
      { level: "Deficiency", definition: "Control does not operate effectively in isolated instances", response: "Remediate within 60 days; management testing confirmation", color: "#FBBF24" },
      { level: "Significant Deficiency", definition: "Reasonable possibility of material misstatement not prevented/detected timely", response: "Remediate within 30 days; Audit Committee reporting; compensating controls", color: "#FB923C" },
      { level: "Material Weakness", definition: "Reasonable possibility of material misstatement of annual financials", response: "Immediate remediation plan; 10-K disclosure; CEO/CFO certification", color: "#EF4444" },
    ],
    escalation: "VP Finance reviews all deficiencies. Significant Deficiency → Audit Committee within 5 BD. Material Weakness → Board + external auditor within 24 hours.",
    commonFindings: [
      "SoD conflicts in credit memo approval workflow",
      "Incomplete evidence for credit limit override justification",
      "E-invoice rejections not resolved within regulatory deadline",
      "User access review not completed within quarterly cycle",
      "Revenue recognition assessment not covering all complex contracts",
    ],
  },
  enterprise: {
    categories: [
      { level: "Control Observation", definition: "Enhancement opportunity; no impact on control effectiveness", response: "Improvement backlog; 90-day resolution", color: "#34D399" },
      { level: "Deficiency", definition: "Control gap in isolated instances at specific hub/entity", response: "60-day remediation; hub-level management confirmation", color: "#FBBF24" },
      { level: "Significant Deficiency", definition: "Control gap across multiple hubs/entities or in key control", response: "30-day remediation; Audit Committee; compensating controls activated", color: "#FB923C" },
      { level: "Material Weakness", definition: "Pervasive control failure or failure in key financial reporting control", response: "Immediate remediation; Board notification; 10-K disclosure; enhanced testing", color: "#EF4444" },
    ],
    escalation: "Hub findings → SSC Governance → Group Controller. Cross-hub → Internal Audit + CFO. Material Weakness → Board + external auditor within 12 hours.",
    commonFindings: [
      "SoD conflicts across SSC hubs (investigator/approver overlap)",
      "BPO partner not executing controls per documented design",
      "ECL model inputs not validated against actual loss experience",
      "Intercompany elimination timing differences unresolved at close",
      "Process mining conformance deviations not investigated within SLA",
      "Multi-jurisdiction e-invoice compliance gaps in newly mandated jurisdictions",
    ],
  },
  global: {
    categories: [
      { level: "Control Observation", definition: "Enhancement opportunity; no effectiveness impact", response: "Global improvement backlog; 90 days; track by hub", color: "#34D399" },
      { level: "Deficiency", definition: "Hub-level or entity-level control gap", response: "60-day remediation; hub governance confirmation", color: "#FBBF24" },
      { level: "Significant Deficiency", definition: "Cross-hub, cross-jurisdiction, or key control gap", response: "30-day remediation; Audit Committee; compensating controls; enhanced monitoring", color: "#FB923C" },
      { level: "Material Weakness", definition: "Pervasive or key financial reporting control failure", response: "Immediate; Board within 12 hours; 10-K disclosure; CEO/CFO cert impact", color: "#EF4444" },
      { level: "Statutory Finding", definition: "Jurisdiction-specific statutory control failure (J-SOX, etc.)", response: "Per jurisdiction requirements; local regulator notification if required", color: "#C084FC" },
    ],
    escalation: "Hub → Regional governance → Group Controller → Internal Audit → Audit Committee → Board. Material Weakness: Group CFO + Board Chair + Lead Audit Partner within 12 hours.",
    commonFindings: [
      "AI/ML model drift in credit scoring not detected in quarterly review",
      "SoD conflicts in newly integrated M&A entities",
      "Cross-hub follow-the-sun handoff creating control gaps",
      "Statutory control requirements missed in new jurisdiction onboarding",
      "BPO partner sub-contracting without control framework extension",
      "E-invoice compliance gap in recently mandated CTC jurisdiction",
      "AI auto-resolve decisions not audited at required sample rate",
      "Transfer pricing documentation incomplete for IC billing disputes",
    ],
  },
};

/* ══ AUDIT READINESS ═════════════════════════════ */
const AUDIT_DATA = {
  sme: {
    readinessChecklist: [
      { item: "Control documentation (narratives / flowcharts)", status: "Required", owner: "Finance Dir.", timing: "Maintain current" },
      { item: "Evidence binders organized by control", status: "Required", owner: "AR Team", timing: "Ongoing" },
      { item: "AR reconciliation workpapers (monthly)", status: "Required", owner: "AR Team", timing: "Monthly by WD5" },
      { item: "Credit approval files complete", status: "Required", owner: "AR Team", timing: "Per event" },
      { item: "Write-off authorization documentation", status: "Required", owner: "Finance Dir.", timing: "Per event" },
      { item: "Revenue recognition support", status: "Required", owner: "Finance Dir.", timing: "Monthly" },
    ],
    timeline: "External audit fieldwork typically 2–4 weeks. Prepare evidence binders 2 weeks prior.",
    keyDates: "Interim testing: Q3. Year-end testing: within 60 days of fiscal year-end.",
  },
  mid: {
    readinessChecklist: [
      { item: "Control matrix current (all 12 controls)", status: "Required", owner: "Internal Audit", timing: "Update quarterly" },
      { item: "Risk & control mapping validated", status: "Required", owner: "VP Finance", timing: "Annual + trigger events" },
      { item: "GRC workflow configurations documented", status: "Required", owner: "IT/Finance", timing: "Per change" },
      { item: "Management testing workpapers", status: "Required", owner: "Internal Audit", timing: "Quarterly" },
      { item: "Evidence repository organized by control", status: "Required", owner: "Billing/AR Mgrs", timing: "Ongoing" },
      { item: "SoD conflict resolution log", status: "Required", owner: "IT", timing: "Quarterly" },
      { item: "E-invoice compliance documentation", status: "Required", owner: "Tax", timing: "Per jurisdiction" },
      { item: "Deficiency remediation status", status: "Required", owner: "VP Finance", timing: "Track continuously" },
    ],
    timeline: "Interim audit: Q2–Q3 (6–8 weeks). Year-end: within 45 days. Management testing: quarterly cadence.",
    keyDates: "Management self-assessment: each quarter-end. Deficiency remediation: before year-end testing.",
  },
  enterprise: {
    readinessChecklist: [
      { item: "Global control matrix (15 controls across all hubs)", status: "Required", owner: "Internal Audit", timing: "Quarterly refresh" },
      { item: "Risk assessment updated with emerging risks", status: "Required", owner: "Group Controller", timing: "Semi-annual" },
      { item: "CCM reports archived and reviewed", status: "Required", owner: "Internal Audit", timing: "Weekly" },
      { item: "Hub-level control self-assessments", status: "Required", owner: "Hub Governance", timing: "Quarterly" },
      { item: "BPO SOC 1 / ISAE 3402 reports obtained", status: "Required", owner: "Vendor Mgmt", timing: "Annual" },
      { item: "GRC system audit trails exported", status: "Required", owner: "IT CoE", timing: "Per audit request" },
      { item: "Process mining conformance reports", status: "Required", owner: "Analytics CoE", timing: "Weekly" },
      { item: "E-invoice jurisdiction compliance matrix", status: "Required", owner: "Tax CoE", timing: "Per mandate change" },
      { item: "Deficiency tracker with remediation evidence", status: "Required", owner: "Internal Audit", timing: "Continuous" },
      { item: "ECL model documentation and validation", status: "Required", owner: "Group Controller", timing: "Annual validation" },
    ],
    timeline: "Continuous: CCM monitoring. Interim: Q2–Q3 (8–12 weeks). Year-end: within 45 days. Hub audits: rotating schedule, all hubs covered within 2 years.",
    keyDates: "CCM review: weekly. Hub self-assessment: each quarter. Deficiency remediation: 30/60 days per severity. BPO SOC 1: received by Q3.",
  },
  global: {
    readinessChecklist: [
      { item: "Global control matrix (18 controls × all hubs × jurisdictions)", status: "Required", owner: "Internal Audit", timing: "Quarterly refresh" },
      { item: "Multi-jurisdiction risk assessment", status: "Required", owner: "Group Controller", timing: "Semi-annual" },
      { item: "CCM + AI audit analytics archived", status: "Required", owner: "Analytics CoE", timing: "Continuous" },
      { item: "Hub-level + jurisdiction control self-assessments", status: "Required", owner: "Hub/Regional Governance", timing: "Quarterly" },
      { item: "BPO SOC 1 / ISAE 3402 (all partners)", status: "Required", owner: "Vendor Governance", timing: "Annual per partner" },
      { item: "AI/ML model validation documentation", status: "Required", owner: "AI/ML CoE", timing: "Quarterly" },
      { item: "Global GRC audit trails (all hubs, ERPs)", status: "Required", owner: "IT CoE", timing: "Continuous" },
      { item: "Process mining conformance + anomaly reports", status: "Required", owner: "Analytics CoE", timing: "Real-time" },
      { item: "E-invoice compliance (22+ jurisdictions)", status: "Required", owner: "Tax CoE Global", timing: "Real-time" },
      { item: "Statutory control overlay documentation", status: "Required", owner: "Legal/Compliance", timing: "Per jurisdiction" },
      { item: "M&A integration control gap assessments", status: "Required", owner: "Group Controller", timing: "Per acquisition" },
      { item: "Global deficiency tracker with remediation evidence", status: "Required", owner: "Internal Audit", timing: "Continuous" },
    ],
    timeline: "Continuous: CCM + AI monitoring. Interim: Q2–Q3 (12–16 weeks, parallel across regions). Year-end: within 45 days. Hub audits: all hubs annually. Statutory: per jurisdiction calendar.",
    keyDates: "CCM: real-time. AI model review: quarterly. Hub self-assessment: quarterly. Statutory filings: per jurisdiction. BPO SOC 1: Q3. M&A control gap: 90 days post-close.",
  },
};

/* ── XREFS ──────────────────────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "APQC process codes linked to each control" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Cash reconciliation and application controls" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Write-off, aging, bad debt reserve controls" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "E-invoice compliance controls across jurisdictions" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "Control effectiveness KPIs in AR dashboard" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Controls maturity as assessment dimension" },
  { code: "2.1", name: "Credit Management Process Pack", relevance: "Credit approval, override, and exposure controls" },
  { code: "2.2", name: "Dispute Resolution Process Pack", relevance: "Credit memo SoD, dispute resolution approval controls" },
  { code: "2.3", name: "Billing & Invoicing Process Pack", relevance: "Invoice validation, revenue recognition, billing controls" },
  { code: "2.5", name: "Process Mining Playbook", relevance: "Conformance monitoring as detective control" },
  { code: "2.6", name: "Shared Services Transition Guide", relevance: "SSC/BPO control frameworks and governance" },
];

/* ══════════════════════════════════════════════════ */
const riskColor = (l) => { if (l === "Critical") return "#EF4444"; if (l === "High") return "#FB923C"; if (l === "Medium") return "#FBBF24"; return "#34D399"; };

export default function SOXComplianceControlsLibrary() {
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("matrix");
  const [matrixFilter, setMatrixFilter] = useState("All");
  const [showXref, setShowXref] = useState(false);
  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

  const renderMatrix = () => {
    const data = CONTROL_MATRIX[tier];
    const types = ["All", ...Array.from(new Set(data.map((c) => c.nature)))];
    const filtered = matrixFilter === "All" ? data : data.filter((c) => c.nature === matrixFilter);
    return (<div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>{types.map((t) => (<button key={t} onClick={() => setMatrixFilter(t)} style={{ padding: "5px 12px", borderRadius: 5, border: `1px solid ${matrixFilter === t ? accent : "rgba(255,255,255,0.08)"}`, background: matrixFilter === t ? accent + "22" : "rgba(255,255,255,0.03)", color: matrixFilter === t ? accent : "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", fontWeight: matrixFilter === t ? 600 : 400 }}>{t}</button>))}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{filtered.map((c, i) => (
        <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, fontWeight: 700, padding: "2px 6px", background: accent + "22", borderRadius: 3 }}>{c.id}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: c.nature === "Preventive" ? "#34D39922" : "#60A5FA22", color: c.nature === "Preventive" ? "#34D399" : "#60A5FA", fontFamily: "'JetBrains Mono', monospace" }}>{c.nature}</span>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>{c.type}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginBottom: 6 }}>{c.description}</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            <span><span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>PROCESS </span>{c.process}</span>
            <span><span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>FREQ </span><span style={{ color: accent }}>{c.frequency}</span></span>
            <span><span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>ASSERT </span>{c.assertion}</span>
            <span><span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>OWNER </span>{c.owner}</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>Evidence: {c.evidence}</div>
        </div>
      ))}</div>
      <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{filtered.length} controls · {data.filter((c) => c.nature === "Preventive").length} preventive · {data.filter((c) => c.nature === "Detective").length} detective</div>
    </div>);
  };

  const renderRiskMap = () => {
    const data = RISK_MAP[tier];
    return (<div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>{data.map((r, i) => (
      <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{r.risk}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: riskColor(r.likelihood) + "22", color: riskColor(r.likelihood), fontFamily: "'JetBrains Mono', monospace" }}>L: {r.likelihood}</span>
            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: riskColor(r.impact) + "22", color: riskColor(r.impact), fontFamily: "'JetBrains Mono', monospace" }}>I: {r.impact}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{r.process}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>→</span>
          <div style={{ display: "flex", gap: 4 }}>{r.controls.map((c) => (<span key={c} style={{ fontSize: 10, padding: "2px 6px", background: accent + "22", color: accent, borderRadius: 3, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{c}</span>))}</div>
        </div>
      </div>
    ))}</div>);
  };

  const renderTesting = () => {
    const data = TESTING_DATA[tier];
    return (<div style={{ marginTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Approach</span><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.approach}</div></div>
        <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Sample Sizing</span><div style={{ fontSize: 11, color: accent, marginTop: 4, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{data.sampleSizing}</div></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{data.procedures.map((p, i) => (
        <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, fontWeight: 700, padding: "2px 6px", background: accent + "22", borderRadius: 3 }}>{p.control}</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{p.method}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Sample: {p.sample}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{p.steps}</div>
        </div>
      ))}</div>
    </div>);
  };

  const renderDeficiency = () => {
    const data = DEFICIENCY_DATA[tier];
    return (<div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>{data.categories.map((cat, i) => (
        <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: `1px solid ${cat.color}33`, borderLeft: `3px solid ${cat.color}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: cat.color, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{cat.level}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4, lineHeight: 1.5 }}>{cat.definition}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>Response: {cat.response}</div>
        </div>
      ))}</div>
      <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Escalation</span><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.escalation}</div></div>
      <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Common Findings</span><div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>{data.commonFindings.map((f, i) => (<div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: "#FBBF24", fontSize: 8, marginTop: 4 }}>▸</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{f}</span></div>))}</div></div>
    </div>);
  };

  const renderAudit = () => {
    const data = AUDIT_DATA[tier];
    return (<div style={{ marginTop: 16 }}>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11 }}>
          <thead><tr>{["Readiness Item", "Status", "Owner", "Timing"].map((h) => (<th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>{data.readinessChecklist.map((item, i) => (<tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}><td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{item.item}</td><td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ padding: "2px 6px", borderRadius: 3, background: "#34D39922", color: "#34D399", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{item.status}</span></td><td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.5)", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{item.owner}</td><td style={{ padding: "8px 10px", color: accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{item.timing}</td></tr>))}</tbody>
        </table>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Timeline</span><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.5 }}>{data.timeline}</div></div>
        <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Key Dates</span><div style={{ fontSize: 11, color: accent, marginTop: 4, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{data.keyDates}</div></div>
      </div>
    </div>);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 24 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.4</span><span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span></div><h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>SOX Compliance Controls Library</h1><p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>Control matrix, risk mapping, testing procedures, deficiency classification, audit readiness checklists</p></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>{TIERS.map((t) => (<button key={t.key} onClick={() => { setTier(t.key); setMatrixFilter("All"); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`, background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)", color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tier === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}><div>{t.label}</div><div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div></button>))}</div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>{TABS.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`, background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}><span style={{ marginRight: 6, fontSize: 10 }}>{t.icon}</span>{t.label}</button>))}</div>
      <div style={{ minHeight: 400 }}>{tab === "matrix" && renderMatrix()}{tab === "riskmap" && renderRiskMap()}{tab === "testing" && renderTesting()}{tab === "deficiency" && renderDeficiency()}{tab === "audit" && renderAudit()}</div>
      <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}><button onClick={() => setShowXref(!showXref)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 8, padding: 0 }}><span style={{ transform: showXref ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>Cross-Reference Index ({XREFS.length} linked deliverables)</button>{showXref && (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8, marginTop: 12 }}>{XREFS.map((xr) => (<div key={xr.code} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>{xr.code}</span><div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{xr.name}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{xr.relevance}</div></div></div>))}</div>)}</div>
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>COSO 2013 · PCAOB AS 2201 · SOX Section 404 · IFRS 9 / ASC 606</span><span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.4 — SOX Compliance Controls Library · v1.0</span></div>
    </div>
  );
}
