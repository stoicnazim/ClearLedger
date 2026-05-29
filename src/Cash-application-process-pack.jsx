import { useState, useCallback } from "react";
import { useLiveActuals, getKpiActual } from "./liveActuals";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CASH APPLICATION PROCESS PACK — Deliverable 1.2
// OtC GPO Consulting Toolkit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ──── DESIGN TOKENS ────
const T = {
  bg: "#0B0E11", bgCard: "#12161C", bgHover: "#1A1F28", bgActive: "#1E2530",
  border: "#1E2530", borderLight: "#2A3140",
  t1: "#E8ECF1", t2: "#9BA4B3", t3: "#6B7385", t4: "#4A5168",
  gold: "#D4A853", goldDim: "rgba(212,168,83,0.12)", goldMid: "rgba(212,168,83,0.25)",
  blue: "#5B9BD5", blueDim: "rgba(91,155,213,0.12)",
  green: "#6BBF7A", greenDim: "rgba(107,191,122,0.12)",
  teal: "#4ECDC4", tealDim: "rgba(78,205,196,0.12)",
  orange: "#E8915A", orangeDim: "rgba(232,145,90,0.12)",
  red: "#E06C75", redDim: "rgba(224,108,117,0.12)",
  purple: "#B07CC6", purpleDim: "rgba(176,124,198,0.12)",
  cyan: "#56B6C2", cyanDim: "rgba(86,182,194,0.12)",
  radius: "8px", radiusSm: "5px", radiusLg: "12px",
  font: "'Segoe UI','SF Pro Text','Helvetica Neue',sans-serif",
  mono: "'SF Mono','Cascadia Code','Fira Code',monospace",
};

const TIERS = [
  { id: "sme", label: "SME", sub: "$50M–$500M", icon: "🏢" },
  { id: "mid", label: "Mid-Market", sub: "$500M–$2B", icon: "🏛️" },
  { id: "large", label: "Large Enterprise", sub: "$2B–$10B", icon: "🏗️" },
  { id: "global", label: "Global MNC", sub: "$10B+", icon: "🌍" },
];

const TABS = [
  { id: "sipoc", label: "SIPOC", icon: "◈" },
  { id: "swimlane", label: "Swimlane", icon: "◇" },
  { id: "raci", label: "RACI", icon: "◆" },
  { id: "sop", label: "SOP Template", icon: "◎" },
  { id: "kpi", label: "KPI Scorecard", icon: "◉" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA: SIPOC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SIPOC_DATA = {
  suppliers: [
    { name: "Banks / Financial Institutions", desc: "Bank statements, lockbox files, BAI2/MT940 feeds, electronic payment notifications", tiers: ["sme","mid","large","global"] },
    { name: "Customers", desc: "Remittance advices, payment references, self-service portal payments", tiers: ["sme","mid","large","global"] },
    { name: "Payment Processors", desc: "Credit card settlement files, ACH/SEPA confirmation, digital wallet notifications", tiers: ["mid","large","global"] },
    { name: "AR / Billing Team", desc: "Open invoice register, customer master data, credit memo data", tiers: ["sme","mid","large","global"] },
    { name: "Treasury", desc: "Bank account structures, FX rates, netting agreements, cash pool instructions", tiers: ["large","global"] },
    { name: "Intercompany Partners", desc: "IC payment notifications, netting schedules, cross-entity settlement data", tiers: ["large","global"] },
    { name: "E-invoicing Networks", desc: "Peppol payment status, CFDI complement confirmations, ViDA settlement data", tiers: ["global"] },
  ],
  inputs: [
    { name: "Bank Statement Files", desc: "BAI2 (US), MT940/CAMT.053 (EU), CNAB (Brazil) — daily/intraday feeds", tiers: ["sme","mid","large","global"] },
    { name: "Lockbox Remittance Data", desc: "Scanned check images, OCR-extracted remittance details, MICR data", tiers: ["mid","large","global"] },
    { name: "Electronic Payment Files", desc: "ACH/SEPA/BACS return files, wire confirmations, real-time payment notifications", tiers: ["sme","mid","large","global"] },
    { name: "Remittance Advices", desc: "Customer-sent payment details (email, EDI 820, portal uploads, PDF attachments)", tiers: ["sme","mid","large","global"] },
    { name: "Open AR Ledger", desc: "Aged open items with invoice #, amount, currency, due date, customer ID", tiers: ["sme","mid","large","global"] },
    { name: "Customer Master Data", desc: "Payment terms, banking instructions, alternate payer relationships, payment behavior history", tiers: ["sme","mid","large","global"] },
    { name: "Credit Memo / Debit Memo Register", desc: "Outstanding adjustments pending offset against incoming payments", tiers: ["mid","large","global"] },
    { name: "FX Rate Feeds", desc: "Daily spot rates, contracted hedge rates for multi-currency matching", tiers: ["large","global"] },
    { name: "Intercompany Netting Schedule", desc: "Periodic IC settlement positions and netting center instructions", tiers: ["global"] },
  ],
  process: [
    { name: "P1 — Receive & Ingest Payments", desc: "Import bank statements, lockbox files, electronic payment notifications into ERP/cash app engine", tiers: ["sme","mid","large","global"] },
    { name: "P2 — Parse & Normalize Remittance", desc: "Extract payment references, amounts, dates from varied formats; standardize into matching-ready records", tiers: ["sme","mid","large","global"] },
    { name: "P3 — Auto-Match Payments", desc: "Execute rule-based and AI/ML matching against open invoices (1:1, 1:many, many:1, many:many)", tiers: ["sme","mid","large","global"] },
    { name: "P4 — Handle Exceptions", desc: "Route unmatched/partial/over-payments to exception queues; investigate with remittance data, customer contact", tiers: ["sme","mid","large","global"] },
    { name: "P5 — Apply Cash & Clear Items", desc: "Post matched payments to customer accounts; clear open AR items in sub-ledger", tiers: ["sme","mid","large","global"] },
    { name: "P6 — Process Deductions & Short-Pays", desc: "Identify deduction reasons, create deduction records, route to dispute/trade promotion teams", tiers: ["mid","large","global"] },
    { name: "P7 — Reconcile & Validate", desc: "Reconcile bank-to-book, AR sub-ledger-to-GL, cash account balances; resolve breaks", tiers: ["sme","mid","large","global"] },
    { name: "P8 — Report & Analyze", desc: "Generate match rate reports, exception aging, SLA dashboards, auto-post rate trending", tiers: ["mid","large","global"] },
  ],
  outputs: [
    { name: "Cleared AR Items", desc: "Invoices marked as paid/partially paid in sub-ledger with payment reference", tiers: ["sme","mid","large","global"] },
    { name: "Payment Posting Documents", desc: "Accounting entries (Dr Bank, Cr AR) with audit trail and matching documentation", tiers: ["sme","mid","large","global"] },
    { name: "Exception Worklist", desc: "Queue of unmatched/partial payments with aging, reason codes, assigned handlers", tiers: ["sme","mid","large","global"] },
    { name: "Deduction Records", desc: "Classified short-pay items with reason codes routed to dispute management", tiers: ["mid","large","global"] },
    { name: "Reconciliation Reports", desc: "Bank-to-book reconciliation, sub-ledger-to-GL tie-out, outstanding items report", tiers: ["sme","mid","large","global"] },
    { name: "Cash Application KPI Package", desc: "First-pass match rate, exception rate, cycle time, auto-post rate, aging of unapplied cash", tiers: ["mid","large","global"] },
    { name: "Unapplied Cash Register", desc: "Aged listing of on-account payments pending allocation with reason tracking", tiers: ["sme","mid","large","global"] },
    { name: "Updated Cash Position", desc: "Real-time cash position feed to Treasury for cash forecasting and liquidity planning", tiers: ["large","global"] },
  ],
  customers: [
    { name: "Collections Team", desc: "Needs cleared items to update customer aging and adjust collection strategies", tiers: ["sme","mid","large","global"] },
    { name: "Treasury / Cash Management", desc: "Relies on posted cash for daily cash positioning, forecasting, and investment decisions", tiers: ["mid","large","global"] },
    { name: "GL / Record-to-Report", desc: "Receives AR sub-ledger postings and reconciliation sign-offs for period-end close", tiers: ["sme","mid","large","global"] },
    { name: "Dispute / Deductions Team", desc: "Receives classified deductions with supporting documentation for resolution", tiers: ["mid","large","global"] },
    { name: "Credit Management", desc: "Uses payment behavior data to update credit scores and adjust credit limits", tiers: ["mid","large","global"] },
    { name: "Customer / External", desc: "Receives payment confirmations, account statements, and application notifications", tiers: ["sme","mid","large","global"] },
    { name: "External Auditors", desc: "Reviews reconciliation evidence, matching documentation, and control testing samples", tiers: ["large","global"] },
    { name: "AR Governance / GPO", desc: "Consumes KPI dashboards and exception trend analysis for process improvement", tiers: ["large","global"] },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA: SWIMLANE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SWIMLANE_LANES = {
  sme: ["Bank/Customer", "AR Clerk", "AR Supervisor", "GL/Finance"],
  mid: ["Bank/Payment Source", "Cash App Specialist", "Cash App Lead", "AR Manager", "GL/Treasury"],
  large: ["Bank/Payment Source", "Cash App Engine (AI)", "Cash App Analyst", "Cash App Lead", "Dispute Team", "AR Manager", "GL/Treasury"],
  global: ["Bank/Payment Source", "Cash App Engine (AI)", "Cash App Analyst (SSC)", "Exception Handler (SSC)", "Dispute/Deductions Team", "Cash App Lead (GBS)", "AR GPO", "GL/Treasury/IC"],
};

const SWIMLANE_STEPS = [
  {
    id: "S1", phase: "Ingest", label: "Receive bank statements & payment files",
    lanes: { sme: 0, mid: 0, large: 0, global: 0 },
    type: "start", detail: "BAI2/MT940/CAMT.053 files imported via automated feed or manual upload. Lockbox files received from bank."
  },
  {
    id: "S2", phase: "Ingest", label: "Parse & normalize remittance data",
    lanes: { sme: 1, mid: 1, large: 1, global: 1 },
    type: "process", detail: "Extract payment references, amounts, payer info. Standardize formats across bank feeds, EDI 820, email remittances, portal data."
  },
  {
    id: "S3", phase: "Match", label: "Execute auto-matching rules",
    lanes: { sme: 1, mid: 1, large: 1, global: 1 },
    type: "auto", detail: "Rule engine / AI applies multi-criteria matching: invoice #, amount, PO #, customer ref, date proximity. Handles 1:1, 1:many, many:many patterns."
  },
  {
    id: "D1", phase: "Match", label: "Match found?",
    lanes: { sme: 1, mid: 1, large: 1, global: 1 },
    type: "decision", detail: "System evaluates match confidence score. High-confidence matches auto-post; low-confidence routes to exception queue."
  },
  {
    id: "S4", phase: "Match", label: "Auto-post matched payments",
    lanes: { sme: 1, mid: 1, large: 1, global: 2 },
    type: "auto", detail: "Straight-through processing: Dr Bank, Cr Customer AR. Clear matched invoices. Generate posting document with audit trail."
  },
  {
    id: "S5", phase: "Exception", label: "Route to exception queue",
    lanes: { sme: 1, mid: 1, large: 2, global: 3 },
    type: "process", detail: "Unmatched/partial/overpayments assigned to handler based on customer segment, amount threshold, or territory."
  },
  {
    id: "S6", phase: "Exception", label: "Research & investigate exception",
    lanes: { sme: 1, mid: 1, large: 2, global: 3 },
    type: "manual", detail: "Review remittance advice, contact customer, check for unapplied credits/debits, validate amount variances, check for duplicate payments."
  },
  {
    id: "D2", phase: "Exception", label: "Short-pay / deduction?",
    lanes: { sme: 1, mid: 2, large: 2, global: 3 },
    type: "decision", detail: "Determine if variance is a valid deduction (trade promotion, pricing, freight) or an invalid short-pay requiring dispute."
  },
  {
    id: "S7", phase: "Exception", label: "Create deduction & route to dispute team",
    lanes: { sme: 2, mid: 2, large: 4, global: 4 },
    type: "process", detail: "Classify deduction by reason code. Attach backup documentation. Route to trade promotion, pricing, or dispute team per routing rules."
  },
  {
    id: "S8", phase: "Exception", label: "Apply payment with tolerance / on-account",
    lanes: { sme: 1, mid: 1, large: 2, global: 3 },
    type: "process", detail: "Apply within tolerance threshold or post as on-account/unapplied cash. Flag for follow-up if over tolerance."
  },
  {
    id: "S9", phase: "Reconcile", label: "Reconcile bank-to-book",
    lanes: { sme: 2, mid: 3, large: 5, global: 5 },
    type: "process", detail: "Match posted cash to bank statement line items. Identify timing differences, bank charges, FX gains/losses. Clear reconciling items."
  },
  {
    id: "S10", phase: "Reconcile", label: "Reconcile AR sub-ledger to GL",
    lanes: { sme: 3, mid: 4, large: 5, global: 7 },
    type: "process", detail: "Verify AR sub-ledger balance ties to GL control account. Investigate and resolve any breaks before period-end close."
  },
  {
    id: "S11", phase: "Report", label: "Generate KPI dashboard & exception reports",
    lanes: { sme: 2, mid: 3, large: 5, global: 6 },
    type: "output", detail: "Publish first-pass match rate, exception aging, unapplied cash trend, auto-post rate, cycle time metrics. Distribute to stakeholders."
  },
  {
    id: "S12", phase: "Report", label: "Feed cash position to Treasury",
    lanes: { sme: 3, mid: 4, large: 5, global: 7 },
    type: "output", detail: "Update daily cash position report with applied receipts. Feed into cash forecasting model and liquidity planning."
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA: RACI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RACI_ROLES = {
  sme: ["AR Clerk", "AR Supervisor", "Finance Manager", "IT / ERP Admin", "External Bank"],
  mid: ["Cash App Specialist", "Cash App Lead", "AR Manager", "Treasury Analyst", "IT / ERP Admin", "External Bank"],
  large: ["Cash App Analyst", "Cash App Lead", "AR Manager", "Dispute Specialist", "Treasury", "IT / Automation", "External Bank", "Internal Audit"],
  global: ["Cash App Analyst (SSC)", "Exception Handler (SSC)", "Cash App Lead (GBS)", "AR GPO", "Dispute/Deductions Team", "Treasury (Regional)", "IT / Automation CoE", "External Bank/Network", "Internal Audit / SOX"],
};

const RACI_ACTIVITIES = [
  { activity: "Configure bank statement import feeds", 
    sme: ["C","C","I","R","A"], mid: ["I","C","I","C","R","A"], large: ["I","C","C","I","I","R","A","I"], global: ["I","I","C","C","I","I","R","A","I"] },
  { activity: "Import & validate daily bank files",
    sme: ["R","A","I","C","I"], mid: ["R","A","I","I","C","I"], large: ["R","A","I","I","I","C","I","I"], global: ["R","I","A","I","I","I","C","I","I"] },
  { activity: "Maintain matching rules & tolerance thresholds",
    sme: ["C","R","A","C","I"], mid: ["C","R","A","I","C","I"], large: ["C","R","A","I","I","C","I","I"], global: ["C","C","R","A","I","I","C","I","I"] },
  { activity: "Execute auto-matching engine",
    sme: ["R","A","I","C","I"], mid: ["R","A","I","I","C","I"], large: ["I","A","I","I","I","R","I","I"], global: ["I","I","A","I","I","I","R","I","I"] },
  { activity: "Review & approve auto-matched postings",
    sme: ["R","A","I","I","I"], mid: ["R","A","I","I","I","I"], large: ["R","A","I","I","I","I","I","I"], global: ["R","I","A","I","I","I","I","I","I"] },
  { activity: "Investigate & resolve exceptions",
    sme: ["R","A","I","I","I"], mid: ["R","A","C","I","I","I"], large: ["R","A","C","C","I","I","I","I"], global: ["R","R","A","I","C","I","I","I","I"] },
  { activity: "Classify & route deductions",
    sme: ["R","A","I","I","I"], mid: ["R","A","C","I","I","I"], large: ["C","A","C","R","I","I","I","I"], global: ["C","R","A","I","R","I","I","I","I"] },
  { activity: "Post on-account / unapplied cash",
    sme: ["R","A","I","I","I"], mid: ["R","A","I","I","I","I"], large: ["R","A","I","I","I","I","I","I"], global: ["R","I","A","I","I","I","I","I","I"] },
  { activity: "Perform bank-to-book reconciliation",
    sme: ["R","A","I","I","I"], mid: ["C","R","A","C","I","I"], large: ["C","R","A","I","C","I","I","I"], global: ["C","C","R","A","I","C","I","I","C"] },
  { activity: "Reconcile AR sub-ledger to GL",
    sme: ["C","R","A","I","I"], mid: ["C","C","R","A","I","I"], large: ["C","C","R","I","A","I","I","C"], global: ["C","C","R","A","I","C","I","I","C"] },
  { activity: "Monitor & report Cash App KPIs",
    sme: ["I","R","A","I","I"], mid: ["I","R","A","I","I","I"], large: ["I","C","R","I","I","C","I","A"], global: ["I","I","C","R","I","I","C","I","A"] },
  { activity: "Manage unapplied cash aging & escalation",
    sme: ["R","A","I","I","I"], mid: ["R","A","C","I","I","I"], large: ["R","A","C","I","I","I","I","I"], global: ["R","R","A","C","I","I","I","I","I"] },
  { activity: "Approve write-off of unresolvable items",
    sme: ["I","C","A","I","I"], mid: ["I","C","A","I","I","I"], large: ["I","C","A","I","I","I","I","C"], global: ["I","I","C","A","I","I","I","I","C"] },
  { activity: "SOX/audit control testing for cash app",
    sme: ["C","R","A","I","I"], mid: ["C","C","R","I","C","I"], large: ["C","C","C","I","I","I","I","R"], global: ["C","C","C","I","I","I","I","I","R"] },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA: SOP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SOP_SECTIONS = [
  {
    id: "sop1", title: "1. Purpose & Scope",
    content: {
      sme: "This SOP governs the end-to-end cash application process for [Company Name]. It covers receipt of customer payments through bank feeds, matching to open invoices, exception handling, and reconciliation. Applies to all AR staff processing incoming payments.",
      mid: "This SOP governs the end-to-end cash application process across all business units of [Company Name]. It covers automated and manual payment matching, exception management, deduction routing, and bank-to-book reconciliation. Applies to the Cash Application team within the Shared Service Center.",
      large: "This SOP governs the global cash application process for [Company Name] across all operating entities and legal entities. It covers AI-assisted payment matching, multi-currency processing, exception management, deduction classification, intercompany cash application, and multi-level reconciliation. Applies to all SSC/GBS cash application teams globally.",
      global: "This SOP governs the global cash application process for [Company Name] across [X] countries, [Y] legal entities, and [Z] currencies. It covers autonomous AI matching, multi-format bank ingestion (BAI2/MT940/CAMT.053/CNAB), exception management, deduction/dispute routing, intercompany netting, FX revaluation, and multi-tier reconciliation. Applies to all GBS cash application centers (primary and secondary), regional oversight teams, and the Global Process Owner.",
    },
  },
  {
    id: "sop2", title: "2. Roles & Responsibilities",
    content: {
      sme: "AR Clerk — Imports bank files, performs manual matching, investigates exceptions, posts payments.\nAR Supervisor — Reviews exception aging, approves tolerance postings, monitors KPIs, escalates aged items.\nFinance Manager — Approves write-offs, reviews reconciliation sign-off, reports to leadership.",
      mid: "Cash App Specialist — Executes daily bank file import, reviews auto-match results, resolves exceptions, posts manual matches.\nCash App Lead — Manages exception queues, maintains matching rules, trains staff, reviews SLA performance.\nAR Manager — Owns process KPIs, approves tolerance changes, escalates systemic issues, signs off on reconciliation.\nTreasury Analyst — Validates bank account setup, monitors cash position feeds, coordinates with banks.",
      large: "Cash App Analyst — Monitors auto-match engine output, resolves Tier 1 exceptions (< threshold), processes standard remittances.\nCash App Lead — Manages team workload, resolves Tier 2 exceptions, maintains AI model feedback loop, reports KPIs.\nAR Manager — Owns cash application KPIs, chairs weekly exception review, approves rule changes, manages vendor relationship with cash app platform.\nDispute Specialist — Receives classified deductions, validates reason codes, coordinates resolution with business partners.\nInternal Audit — Tests SOX key controls (segregation of duties, tolerance overrides, reconciliation timeliness).",
      global: "Cash App Analyst (SSC) — Monitors autonomous matching output, resolves Tier 1 exceptions per region.\nException Handler (SSC) — Investigates complex exceptions (multi-currency, IC, cross-entity), contacts customers.\nCash App Lead (GBS) — Regional process owner, manages SLAs, maintains AI model performance, escalates systemic issues.\nAR GPO — Global process owner, sets policy, approves rule changes across all regions, chairs monthly governance forum.\nDispute/Deductions Team — Manages deduction lifecycle from classification through resolution and write-off.\nTreasury (Regional) — Manages bank connectivity, validates FX rates, coordinates intercompany netting.\nIT/Automation CoE — Maintains AI/ML models, bank feed integrations, RPA bots, system performance.\nInternal Audit/SOX — Tests key controls across all GBS centers, validates segregation of duties and exception handling.",
    },
  },
  {
    id: "sop3", title: "3. Daily Process Steps",
    content: {
      sme: "Step 1: Import bank statement file (BAI2 or CSV) into ERP by 9:00 AM.\nStep 2: Review import log for errors or missing transactions. Resolve any file format issues.\nStep 3: Run auto-matching program (SAP F110 / Oracle AutoMatch). Review match proposals.\nStep 4: Approve high-confidence matches (>95% score). Post to customer accounts.\nStep 5: Print exception report. Begin manual investigation — check remittance emails, call customers.\nStep 6: Post resolved exceptions. Escalate items unresolved >2 business days to AR Supervisor.\nStep 7: Post any on-account receipts for payments with no identifiable invoice reference.\nStep 8: Run unapplied cash aging report. Review items >5 days and escalate.\nStep 9: Perform bank-to-book reconciliation. Identify timing differences and bank charges.\nStep 10: End-of-day: Verify total cash applied = total bank receipts. Flag any variance >$100.",
      mid: "Step 1: Validate automated bank feed ingestion (BAI2/MT940) completed by 8:00 AM. Check feed dashboard for failures.\nStep 2: Review auto-import validation report. Reject and reprocess any corrupted files.\nStep 3: Verify lockbox processing completed. Reconcile lockbox totals to bank statement.\nStep 4: Review AI/rule-based auto-match results. Approve auto-post batch for matches >90% confidence.\nStep 5: Distribute exception worklist to team by customer segment assignment.\nStep 6: Investigate Tier 1 exceptions (<$5K): check remittance PDFs, EDI 820 data, customer portal.\nStep 7: Investigate Tier 2 exceptions (>$5K): contact customer AR, review contract terms, check for deductions.\nStep 8: Classify identified deductions by reason code (trade promo, pricing, freight, returns). Route to dispute team.\nStep 9: Post resolved items. Apply tolerance-within payments per approved threshold matrix.\nStep 10: Post on-account receipts with standardized reason codes. Set auto-escalation trigger at 5 days.\nStep 11: Complete bank-to-book reconciliation by 4:00 PM. Investigate breaks >$500.\nStep 12: Update daily KPI tracker: match rate, exception count, unapplied cash balance, cycle time.",
      large: "Step 1: Verify automated bank feed ingestion across all bank accounts (BAI2/MT940/CAMT.053) by 7:30 AM. Monitor feed dashboard.\nStep 2: Review AI engine processing log. Validate auto-match batch: total items, match rate, confidence distribution.\nStep 3: Release auto-post batch for high-confidence matches (>92% threshold). Generate posting audit trail.\nStep 4: Review AI-suggested matches in medium-confidence band (70-92%). Approve, reject, or override with reason.\nStep 5: Distribute exception worklist to analysts by segment: Key Accounts, Commercial, SMB, Intercompany.\nStep 6: Tier 1 exceptions (<$10K): Analysts resolve using remittance data, customer portal history, AI-suggested alternatives.\nStep 7: Tier 2 exceptions ($10K-$100K): Lead reviews, contacts customer AR, escalates to Collections if needed.\nStep 8: Tier 3 exceptions (>$100K): Manager review required. May involve Sales, Legal, or Treasury coordination.\nStep 9: Process deductions: validate reason codes against approved deduction taxonomy, attach documentation, route per matrix.\nStep 10: Execute intercompany cash application per netting schedule. Apply IC payments per settlement instructions.\nStep 11: Process multi-currency payments: validate FX rate application, post realized FX gains/losses.\nStep 12: Reconcile bank-to-book for all accounts by 3:00 PM. Escalate breaks >$1,000.\nStep 13: Reconcile AR sub-ledger to GL by 5:00 PM on close days.\nStep 14: Update process health dashboard: match rate, exception aging, unapplied cash, SLA compliance, deduction backlog.",
      global: "Step 1: Monitor global bank feed ingestion dashboard. Validate feeds across all regions (APAC by 6:00 AM CET, EMEA by 8:00 AM CET, Americas by 2:00 PM CET).\nStep 2: Review autonomous AI matching results by region. Validate match rates against regional SLA thresholds.\nStep 3: Release auto-post batches per regional approval matrices. Dual-approval required for batches >$1M.\nStep 4: AI-assisted exception triage: system auto-classifies exceptions by type, assigns priority score, routes to correct SSC.\nStep 5: SSC analysts resolve Tier 1 exceptions using AI-suggested matches and customer payment history.\nStep 6: Exception handlers tackle Tier 2/3 items requiring cross-entity research, customer contact, or IC coordination.\nStep 7: GBS Lead reviews escalated items, monitors SLA compliance, feeds exception patterns back to AI model.\nStep 8: Process deductions per global taxonomy. Route trade promotions to regional commercial teams, pricing disputes to pricing team.\nStep 9: Execute intercompany netting per monthly/weekly netting cycle. Apply IC settlements across entities.\nStep 10: Process multi-currency cash app. Apply daily FX rates from Treasury; post FX gains/losses per IFRS 21/ASC 830.\nStep 11: Handle cross-border payments: validate withholding tax deductions, statutory reporting implications.\nStep 12: Reconcile bank-to-book across all entities by regional close deadlines.\nStep 13: Complete sub-ledger-to-GL reconciliation. Sign off via reconciliation workflow tool.\nStep 14: Generate global cash application KPI package. Publish to GPO dashboard.\nStep 15: Feed applied cash data to global Treasury for consolidated cash position and forecast update.\nStep 16: GPO weekly review: regional KPI comparison, exception trend analysis, AI model performance review, process improvement pipeline.",
    },
  },
  {
    id: "sop4", title: "4. Exception Handling Procedures",
    content: {
      sme: "Unmatched Payments: Check customer remittance email inbox. Search by amount ±2%. Call customer if unresolved after 1 day.\nPartial Payments: Apply to oldest invoice first. Post remainder as on-account if <$50 tolerance. Escalate if >$50.\nOverpayments: Verify not a duplicate. Contact customer for allocation instructions. If no response in 3 days, post as on-account.\nDuplicate Payments: Flag immediately. Notify AR Supervisor. Initiate refund process per refund SOP.\nEscalation: Items unresolved >3 business days → AR Supervisor. >7 days → Finance Manager.",
      mid: "Exception Classification Matrix:\n• Type A (Data Quality): Missing/invalid invoice reference → AR Specialist resolves using fuzzy match, customer history.\n• Type B (Amount Variance): ±threshold tolerance → apply within tolerance; outside tolerance → investigate.\n• Type C (Deduction): Intentional short-pay → classify reason code, route to dispute team.\n• Type D (Duplicate): Potential duplicate payment → hold, verify, initiate refund if confirmed.\n• Type E (Cross-Reference): Payment references different entity/division → route to correct team.\n\nEscalation Tiers:\nTier 1 (<$5K, <3 days): Cash App Specialist\nTier 2 ($5K-$50K, 3-5 days): Cash App Lead\nTier 3 (>$50K or >5 days): AR Manager",
      large: "Exception Taxonomy (15 reason codes aligned to root cause):\nA1-Data: Missing reference, invalid format, unreadable remittance\nA2-Data: Customer master mismatch (payer vs. sold-to)\nB1-Amount: Under-tolerance variance (auto-apply)\nB2-Amount: Over-tolerance variance (investigate)\nB3-Amount: Overpayment (verify & refund/credit)\nC1-Deduction: Trade promotion\nC2-Deduction: Pricing dispute\nC3-Deduction: Freight/logistics claim\nC4-Deduction: Returns/credits expected\nD1-Duplicate: Same amount, same payer, same period\nE1-Cross: Wrong entity, route to correct SSC\nE2-Cross: Intercompany payment, route to IC team\nF1-FX: Currency conversion variance\nF2-FX: Withholding tax deduction\nG1-System: ERP posting error, interface failure\n\nEscalation & SLA Matrix:\nTier 1 (<$10K): 2 business days SLA → Cash App Analyst\nTier 2 ($10K-$100K): 3 business days SLA → Cash App Lead\nTier 3 (>$100K): 5 business days SLA → AR Manager + stakeholder\nAged >10 days: Auto-escalation to AR Director with root cause required",
      global: "Global Exception Framework (20+ reason codes, regionally extensible):\n[Core taxonomy as per Large tier, plus:]\nH1-Regulatory: E-invoicing payment complement mismatch (CFDI, Peppol)\nH2-Regulatory: Withholding tax rate dispute by jurisdiction\nI1-IC: Intercompany netting variance\nI2-IC: Cross-border transfer pricing adjustment\nJ1-Customer: Customer bankruptcy/insolvency filing\nJ2-Customer: Payment plan / installment arrangement\n\nGlobal Escalation Matrix:\nTier 1 (<$25K): 2 BD SLA → SSC Analyst (regional)\nTier 2 ($25K-$250K): 3 BD SLA → GBS Lead (regional)\nTier 3 ($250K-$1M): 5 BD SLA → AR GPO + Regional Finance\nTier 4 (>$1M): Immediate escalation → CFO office + Legal\nAged >7 days: Auto-escalation with mandatory root cause\nAged >14 days: GPO direct intervention, included in governance report\n\nRegional Overlays:\n• EMEA: SEPA return reason codes (AM04, AC01, etc.)\n• APAC: SWIFT gpi tracking for cross-border resolution\n• LATAM: Boleto/PIX reconciliation-specific exception codes\n• NA: ACH return codes (R01-R29) mapped to exception types",
    },
  },
  {
    id: "sop5", title: "5. Controls & Compliance",
    content: {
      sme: "Segregation of Duties: Person importing bank files ≠ person approving postings.\nTolerance Limits: Auto-apply tolerance set at $25 or 1% of invoice (whichever is lower). Requires Supervisor approval to change.\nReconciliation: Bank-to-book reconciliation completed daily. Monthly sign-off by Finance Manager.\nAudit Trail: All manual postings require reason code and comment. System retains full audit log.",
      mid: "Key Controls:\n1. Segregation of duties between cash receipt processing and payment posting (SOX ITGC)\n2. Dual approval for tolerance threshold changes\n3. Auto-match rule changes require AR Manager + IT joint approval\n4. Write-off approval matrix: <$1K (Lead), $1K-$10K (Manager), >$10K (Director)\n5. Daily bank-to-book reconciliation with 24-hour break resolution SLA\n6. Monthly AR sub-ledger to GL reconciliation with sign-off workflow\n7. Quarterly user access review for cash application system roles\n8. Automated duplicate payment detection with hold-and-review protocol",
      large: "SOX Key Controls Matrix:\nCA-01: Bank feed import validation — automated, daily, preventive\nCA-02: Auto-match confidence threshold — configurable, approved by AR Manager, detective\nCA-03: Segregation of duties — system-enforced role separation, preventive\nCA-04: Tolerance override approval — dual approval with reason code, detective\nCA-05: Exception aging escalation — automated triggers at SLA breach, detective\nCA-06: Bank reconciliation — daily with 24-hour break resolution, detective\nCA-07: Sub-ledger to GL reconciliation — monthly with workflow sign-off, detective\nCA-08: Write-off approval DOA — tiered authority matrix, preventive\nCA-09: Deduction reason code accuracy — monthly audit sample, detective\nCA-10: Duplicate payment detection — real-time system check, preventive\nCA-11: User access review — quarterly with SOD conflict check, preventive\nCA-12: AI model performance monitoring — monthly accuracy review, detective",
      global: "Global SOX / Internal Control Framework:\n[All Large tier controls, plus:]\nCA-13: Cross-entity posting authorization — prevents unauthorized inter-entity cash movement\nCA-14: FX rate source validation — daily verification of rate feed accuracy\nCA-15: Intercompany netting approval — dual sign-off across entities\nCA-16: Regional variance reporting — auto-flag control exceptions across GBS centers\nCA-17: AI/ML model governance — quarterly model validation, bias testing, drift detection\nCA-18: Data privacy compliance — PII handling in remittance data per GDPR/local privacy laws\n\nCompliance Mapping:\n• SOX 404: Controls CA-01 through CA-18 mapped to control objectives\n• IFRS 9/CECL: Cash app data feeds bad debt provision calculations\n• IFRS 15/ASC 606: Deduction classification impacts revenue recognition\n• ViDA/Peppol: Payment status reporting for e-invoicing compliance\n• Transfer Pricing: IC cash application supports arm's-length documentation",
    },
  },
  {
    id: "sop6", title: "6. System Configuration",
    content: {
      sme: "ERP: SAP S/4HANA — T-codes: FLB1 (bank statement import), F-28 (incoming payment), F-32 (clearing), FBL5N (line item report), F.13 (auto-clear)\nOR Oracle Fusion: Manage Receipts, Auto Cash Rule Sets, Lockbox Processing\nBank Format: BAI2 (US domestic) or MT940 (international). File imported daily via batch job.",
      mid: "Primary ERP: SAP S/4HANA / Oracle Fusion Receivables\nCash App Platform: Highradius Autonomous Receivables / Billtrust / Esker (recommended)\nKey SAP Transactions: FF_5 (electronic bank statement), FEBA (post-process bank statement), F-28/F-30 (incoming payment), FBL5N/FBL3N (line item display)\nKey Oracle Paths: Manage Receipts → AutoCash Rule Sets → Receipt Application Rules → Lockbox\nIntegration: Bank → SFTP → ERP (automated daily feed). Cash app engine via API to ERP posting.\nMatching Rules: Configure minimum 8 matching criteria (invoice #, amount, PO, customer ref, date, currency, payer name, bank reference).",
      large: "Technology Stack:\n• ERP: SAP S/4HANA (primary) + Oracle Fusion (legacy entities in migration)\n• Cash App Engine: Highradius Autonomous Receivables (AI-first)\n• Bank Connectivity: SWIFT Alliance Lite2 / Host-to-Host / API banking\n• OCR/AI: Intelligent remittance extraction (email, PDF, image processing)\n• RPA: UiPath/Automation Anywhere for legacy system data extraction\n• Reconciliation: BlackLine / Trintech for automated matching and certification\n\nSAP Configuration:\n• Bank Statement Processing: FF_5, FEBA, FEBAN (electronic bank statement)\n• Cash Application: F-28, F-30, F-32, F.13 (auto-clearing)\n• Reporting: FBL5N, S_ALR_87012178 (AR aging), F.31 (reconciliation)\n• Master Data: FD01/FD02 (customer master), OB74 (tolerance groups)\n• Config: OB74 (clearing tolerances), OBXH (auto-posting rules)",
      global: "Global Technology Architecture:\n• ERP Landscape: SAP S/4HANA (core), Oracle Fusion (APAC legacy), local ERPs (LATAM — TOTVS, SAP B1)\n• Cash App Engine: Highradius Autonomous Receivables (global deployment)\n• AI/ML Layer: Custom ML models for region-specific matching patterns + Highradius native AI\n• Bank Connectivity: SWIFT gpi (cross-border), Host-to-Host (domestic), API banking (real-time)\n• E-invoicing Integration: Peppol Access Point, SAT (CFDI), SEFAZ (NF-e)\n• Reconciliation: BlackLine (global), with regional reconciliation hubs\n• Data Lake: Centralized AR data lake for cross-entity analytics and AI model training\n• Orchestration: Celonis Process Mining for continuous process monitoring\n\nGlobal Configuration Standards:\n• Matching rule library: 25+ rules, regionally configurable\n• Tolerance matrix: By entity, currency, customer segment\n• Posting rule engine: Automated accounting determination by entity/currency/payment method\n• FX processing: Treasury rate feed with daily/intraday options per region",
    },
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA: KPI SCORECARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const KPI_DATA = [
  {
    id: "kpi1", name: "First-Pass Match Rate",
    definition: "Percentage of incoming payments auto-matched and posted without manual intervention on first attempt.",
    formula: "(Auto-Matched Payments ÷ Total Incoming Payments) × 100",
    unit: "%", direction: "higher",
    benchmarks: {
      sme: { worldClass: 85, topQ: 72, median: 55, belowMed: 40 },
      mid: { worldClass: 90, topQ: 78, median: 62, belowMed: 45 },
      large: { worldClass: 93, topQ: 82, median: 68, belowMed: 50 },
      global: { worldClass: 95, topQ: 85, median: 72, belowMed: 55 },
    },
    frequency: "Daily", owner: "Cash App Lead",
  },
  {
    id: "kpi2", name: "Exception Rate",
    definition: "Percentage of payments requiring manual investigation or intervention before posting.",
    formula: "(Exception Items ÷ Total Incoming Payments) × 100",
    unit: "%", direction: "lower",
    benchmarks: {
      sme: { worldClass: 15, topQ: 28, median: 45, belowMed: 60 },
      mid: { worldClass: 10, topQ: 22, median: 38, belowMed: 55 },
      large: { worldClass: 7, topQ: 18, median: 32, belowMed: 50 },
      global: { worldClass: 5, topQ: 15, median: 28, belowMed: 45 },
    },
    frequency: "Daily", owner: "Cash App Lead",
  },
  {
    id: "kpi3", name: "Cash Application Cycle Time",
    definition: "Average elapsed time from payment receipt (bank statement date) to full application against AR open items.",
    formula: "Avg(Payment Application Date − Bank Statement Date) in business hours",
    unit: "hrs", direction: "lower",
    benchmarks: {
      sme: { worldClass: 8, topQ: 16, median: 32, belowMed: 48 },
      mid: { worldClass: 4, topQ: 12, median: 24, belowMed: 40 },
      large: { worldClass: 2, topQ: 8, median: 18, belowMed: 36 },
      global: { worldClass: 1, topQ: 6, median: 16, belowMed: 32 },
    },
    frequency: "Daily", owner: "Cash App Lead",
  },
  {
    id: "kpi4", name: "Unapplied Cash Ratio",
    definition: "Total unapplied/on-account cash as a percentage of total AR balance. Indicates unresolved cash not clearing invoices.",
    formula: "(Unapplied Cash Balance ÷ Total AR Balance) × 100",
    unit: "%", direction: "lower",
    benchmarks: {
      sme: { worldClass: 2, topQ: 5, median: 10, belowMed: 18 },
      mid: { worldClass: 1.5, topQ: 4, median: 8, belowMed: 15 },
      large: { worldClass: 1, topQ: 3, median: 6, belowMed: 12 },
      global: { worldClass: 0.5, topQ: 2, median: 5, belowMed: 10 },
    },
    frequency: "Weekly", owner: "AR Manager",
  },
  {
    id: "kpi5", name: "Unapplied Cash Aging (>30 days)",
    definition: "Percentage of unapplied cash aged beyond 30 days. Signals systemic resolution failures.",
    formula: "(Unapplied Cash >30 Days ÷ Total Unapplied Cash) × 100",
    unit: "%", direction: "lower",
    benchmarks: {
      sme: { worldClass: 5, topQ: 12, median: 25, belowMed: 40 },
      mid: { worldClass: 3, topQ: 8, median: 20, belowMed: 35 },
      large: { worldClass: 2, topQ: 6, median: 15, belowMed: 30 },
      global: { worldClass: 1, topQ: 5, median: 12, belowMed: 25 },
    },
    frequency: "Weekly", owner: "Cash App Lead",
  },
  {
    id: "kpi6", name: "Cost per Payment Applied",
    definition: "Fully loaded cost (labor + system + overhead) to process and apply a single incoming payment.",
    formula: "Total Cash App Dept Cost ÷ Total Payments Applied",
    unit: "$", direction: "lower",
    benchmarks: {
      sme: { worldClass: 3.5, topQ: 5.5, median: 9, belowMed: 15 },
      mid: { worldClass: 2.0, topQ: 4.0, median: 7, belowMed: 12 },
      large: { worldClass: 1.2, topQ: 2.8, median: 5, belowMed: 9 },
      global: { worldClass: 0.8, topQ: 2.0, median: 4, belowMed: 7 },
    },
    frequency: "Monthly", owner: "AR Manager",
  },
  {
    id: "kpi7", name: "Auto-Post Rate (STP)",
    definition: "Percentage of payments processed completely straight-through — auto-matched AND auto-posted without any human touch.",
    formula: "(Auto-Posted Payments ÷ Total Incoming Payments) × 100",
    unit: "%", direction: "higher",
    benchmarks: {
      sme: { worldClass: 70, topQ: 55, median: 35, belowMed: 18 },
      mid: { worldClass: 80, topQ: 65, median: 45, belowMed: 25 },
      large: { worldClass: 88, topQ: 75, median: 55, belowMed: 35 },
      global: { worldClass: 92, topQ: 80, median: 62, belowMed: 40 },
    },
    frequency: "Daily", owner: "Cash App Lead",
  },
  {
    id: "kpi8", name: "Bank Reconciliation Timeliness",
    definition: "Percentage of bank accounts reconciled within SLA deadline (typically same-day for daily recon, T+1 for weekly).",
    formula: "(Accounts Reconciled On-Time ÷ Total Accounts Requiring Reconciliation) × 100",
    unit: "%", direction: "higher",
    benchmarks: {
      sme: { worldClass: 100, topQ: 95, median: 80, belowMed: 60 },
      mid: { worldClass: 100, topQ: 97, median: 85, belowMed: 70 },
      large: { worldClass: 100, topQ: 98, median: 90, belowMed: 75 },
      global: { worldClass: 100, topQ: 99, median: 92, belowMed: 80 },
    },
    frequency: "Daily", owner: "AR Manager",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const s = {
  app: { background: T.bg, color: T.t1, fontFamily: T.font, minHeight: "100vh", padding: 0, margin: 0, lineHeight: 1.55 },
  hdr: { padding: "32px 28px 0", maxWidth: 1300, margin: "0 auto" },
  h1: { fontSize: "1.7rem", fontWeight: 700, color: T.t1, margin: 0, letterSpacing: "-0.02em" },
  sub: { fontSize: "0.82rem", color: T.t3, marginTop: 6 },
  badge: { display: "inline-block", fontSize: "0.65rem", padding: "3px 10px", borderRadius: 20, background: T.goldDim, color: T.gold, fontWeight: 600, letterSpacing: "0.04em", marginRight: 8 },

  // Tier selector
  tierBar: { display: "flex", gap: 8, padding: "16px 28px 0", maxWidth: 1300, margin: "0 auto", flexWrap: "wrap" },
  tierBtn: (active) => ({
    padding: "8px 16px", borderRadius: T.radius, border: `1px solid ${active ? T.gold : T.border}`,
    background: active ? T.goldDim : "transparent", color: active ? T.gold : T.t3,
    cursor: "pointer", fontSize: "0.78rem", fontWeight: active ? 600 : 400, transition: "all 0.2s",
    fontFamily: T.font,
  }),

  // Tabs
  tabBar: { display: "flex", gap: 2, padding: "16px 28px 0", maxWidth: 1300, margin: "0 auto", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" },
  tab: (active) => ({
    padding: "10px 18px", borderRadius: `${T.radius} ${T.radius} 0 0`,
    background: active ? T.bgCard : "transparent", color: active ? T.gold : T.t3,
    border: active ? `1px solid ${T.border}` : "1px solid transparent", borderBottom: active ? `1px solid ${T.bgCard}` : "none",
    cursor: "pointer", fontSize: "0.8rem", fontWeight: active ? 600 : 400, fontFamily: T.font,
    marginBottom: -1, transition: "all 0.15s",
  }),

  // Content
  content: { maxWidth: 1300, margin: "0 auto", padding: "24px 28px 60px" },
  card: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "24px", marginBottom: 20 },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: T.t1, marginBottom: 4 },
  cardSub: { fontSize: "0.75rem", color: T.t3, marginBottom: 16 },

  // SIPOC columns
  sipocGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 },
  sipocCol: () => ({
    background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden",
  }),
  sipocHdr: (color, dim) => ({
    background: dim, padding: "10px 14px", borderBottom: `1px solid ${T.border}`,
    fontSize: "0.75rem", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.06em",
  }),
  sipocItem: { padding: "10px 14px", borderBottom: `1px solid ${T.border}`, fontSize: "0.75rem", color: T.t2, lineHeight: 1.45 },
  sipocItemName: { fontWeight: 600, color: T.t1, marginBottom: 3 },

  // Swimlane
  laneRow: (i) => ({
    display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: `1px solid ${T.border}`,
    background: i % 2 === 0 ? T.bg : T.bgCard,
  }),
  laneName: { padding: "10px 14px", fontSize: "0.72rem", fontWeight: 600, color: T.t2, borderRight: `1px solid ${T.border}`, display: "flex", alignItems: "center" },
  laneContent: { padding: "8px 12px", minHeight: 48, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  stepBox: (type) => {
    const colors = {
      start: { bg: T.greenDim, border: T.green, color: T.green },
      process: { bg: T.blueDim, border: T.blue, color: T.blue },
      auto: { bg: T.tealDim, border: T.teal, color: T.teal },
      manual: { bg: T.orangeDim, border: T.orange, color: T.orange },
      decision: { bg: T.goldDim, border: T.gold, color: T.gold },
      output: { bg: T.purpleDim, border: T.purple, color: T.purple },
    };
    const c = colors[type] || colors.process;
    return {
      padding: "6px 12px", borderRadius: type === "decision" ? "2px" : T.radiusSm,
      border: `1px solid ${c.border}`, background: c.bg, color: c.color,
      fontSize: "0.72rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
      transform: type === "decision" ? "rotate(0deg)" : "none",
      maxWidth: 280,
    };
  },

  // RACI
  raciCell: (val) => {
    const map = { R: T.blue, A: T.gold, C: T.teal, I: T.t4 };
    const bgMap = { R: T.blueDim, A: T.goldDim, C: T.tealDim, I: "transparent" };
    return {
      textAlign: "center", padding: "6px 4px", fontSize: "0.75rem", fontWeight: val === "R" || val === "A" ? 700 : 400,
      color: map[val] || T.t4, background: bgMap[val] || "transparent",
      borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
    };
  },
  thCell: { padding: "8px 6px", fontSize: "0.65rem", fontWeight: 600, color: T.t3, textAlign: "center", borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.bgCard, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "normal", lineHeight: 1.3, verticalAlign: "bottom" },

  // SOP
  sopSection: { marginBottom: 20 },
  sopTitle: { fontSize: "0.9rem", fontWeight: 700, color: T.gold, marginBottom: 8 },
  sopBody: { fontSize: "0.8rem", color: T.t2, whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: T.font },

  // KPI
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  kpiCard: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px" },
  kpiName: { fontSize: "0.85rem", fontWeight: 700, color: T.t1, marginBottom: 6 },
  kpiDef: { fontSize: "0.73rem", color: T.t3, marginBottom: 10, lineHeight: 1.45 },
  kpiFormula: { fontSize: "0.72rem", color: T.teal, fontFamily: T.mono, padding: "6px 10px", background: T.tealDim, borderRadius: T.radiusSm, marginBottom: 12 },
  benchRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.border}` },
  benchLabel: { fontSize: "0.7rem", fontWeight: 600 },
  benchVal: { fontSize: "0.82rem", fontWeight: 700, fontFamily: T.mono },
  kpiMeta: { display: "flex", gap: 12, marginTop: 10, fontSize: "0.68rem", color: T.t3 },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SIPOCView({ tier }) {
  const [expanded, setExpanded] = useState(null);
  const cols = [
    { key: "suppliers", label: "Suppliers", color: T.blue, dim: T.blueDim },
    { key: "inputs", label: "Inputs", color: T.teal, dim: T.tealDim },
    { key: "process", label: "Process", color: T.gold, dim: T.goldDim },
    { key: "outputs", label: "Outputs", color: T.green, dim: T.greenDim },
    { key: "customers", label: "Customers", color: T.purple, dim: T.purpleDim },
  ];

  return (
    <div>
      <div style={s.card}>
        <div style={s.cardTitle}>SIPOC — Cash Application Process</div>
        <div style={s.cardSub}>Suppliers → Inputs → Process → Outputs → Customers | Filtered by {TIERS.find(t=>t.id===tier)?.label} tier</div>
        <div style={{ ...s.sipocGrid, overflowX: "auto" }}>
          {cols.map(col => {
            const items = SIPOC_DATA[col.key].filter(it => it.tiers.includes(tier));
            return (
              <div key={col.key} style={s.sipocCol(col.color)}>
                <div style={s.sipocHdr(col.color, col.dim)}>
                  {col.label} <span style={{ float: "right", opacity: 0.6 }}>{items.length}</span>
                </div>
                {items.map((it, i) => (
                  <div
                    key={i} style={{ ...s.sipocItem, cursor: "pointer", background: expanded === `${col.key}-${i}` ? col.dim : "transparent" }}
                    onClick={() => setExpanded(expanded === `${col.key}-${i}` ? null : `${col.key}-${i}`)}
                  >
                    <div style={s.sipocItemName}>{col.key === "process" ? it.name.split("—")[0].trim() : it.name}</div>
                    {expanded === `${col.key}-${i}` && (
                      <div style={{ marginTop: 6, fontSize: "0.7rem", color: T.t3, lineHeight: 1.5 }}>{it.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...s.card, padding: "16px 20px" }}>
        <div style={{ fontSize: "0.73rem", color: T.t3 }}>
          <strong style={{ color: T.gold }}>GPO Tip:</strong> The SIPOC is your scoping anchor. If a process improvement or automation initiative touches elements not in this SIPOC, it's scope creep. Use it as the "in/out" frame in every project charter.
        </div>
      </div>
    </div>
  );
}

function SwimlaneView({ tier }) {
  const lanes = SWIMLANE_LANES[tier];
  const steps = SWIMLANE_STEPS;
  const [selectedStep, setSelectedStep] = useState(null);
  const phases = ["Ingest", "Match", "Exception", "Reconcile", "Report"];
  const phaseColors = { Ingest: T.blue, Match: T.teal, Exception: T.orange, Reconcile: T.gold, Report: T.purple };

  return (
    <div>
      <div style={s.card}>
        <div style={s.cardTitle}>Swimlane Process Flow — Cash Application</div>
        <div style={s.cardSub}>{lanes.length} roles/actors | {steps.length} process steps | Click any step for detail</div>

        {/* Phase legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {phases.map(p => (
            <span key={p} style={{ fontSize: "0.68rem", color: phaseColors[p], fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: phaseColors[p], display: "inline-block" }} />
              {p}
            </span>
          ))}
          <span style={{ fontSize: "0.68rem", color: T.t4, marginLeft: 12 }}>
            Type: <span style={{ color: T.teal }}>■ Auto</span> · <span style={{ color: T.orange }}>■ Manual</span> · <span style={{ color: T.gold }}>◆ Decision</span> · <span style={{ color: T.purple }}>■ Output</span>
          </span>
        </div>

        <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: T.radius }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: `2px solid ${T.border}`, background: T.bgCard }}>
            <div style={{ padding: "10px 14px", fontSize: "0.7rem", fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: "0.05em", borderRight: `1px solid ${T.border}` }}>Actor / Role</div>
            <div style={{ padding: "10px 14px", fontSize: "0.7rem", fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Process Steps</div>
          </div>
          {/* Lanes */}
          {lanes.map((lane, li) => {
            const laneSteps = steps.filter(st => st.lanes[tier] === li);
            return (
              <div key={li} style={s.laneRow(li)}>
                <div style={s.laneName}>{lane}</div>
                <div style={s.laneContent}>
                  {laneSteps.map(st => (
                    <div
                      key={st.id}
                      style={{ ...s.stepBox(st.type), outline: selectedStep === st.id ? `2px solid ${T.gold}` : "none" }}
                      onClick={() => setSelectedStep(selectedStep === st.id ? null : st.id)}
                      title={st.detail}
                    >
                      <span style={{ fontSize: "0.65rem", opacity: 0.6, marginRight: 4 }}>{st.id}</span>
                      {st.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Detail Panel */}
      {selectedStep && (() => {
        const st = steps.find(s => s.id === selectedStep);
        if (!st) return null;
        return (
          <div style={{ ...s.card, borderLeft: `3px solid ${T.gold}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "0.68rem", color: T.gold, fontWeight: 600, marginBottom: 4 }}>{st.id} — {st.phase} Phase</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.t1, marginBottom: 8 }}>{st.label}</div>
                <div style={{ fontSize: "0.78rem", color: T.t2, lineHeight: 1.55 }}>{st.detail}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ ...s.badge, background: T.bgHover, color: T.t3 }}>{st.type}</span>
                <span style={{ ...s.badge }}>{SWIMLANE_LANES[tier][st.lanes[tier]]}</span>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ ...s.card, padding: "16px 20px" }}>
        <div style={{ fontSize: "0.73rem", color: T.t3 }}>
          <strong style={{ color: T.gold }}>GPO Tip:</strong> The biggest cycle time killer is the S5→S6 handoff (exception routing to investigation). Organizations that implement AI-suggested alternative matches at the exception queue stage reduce Tier 1 resolution time by 60%. The swimlane shows you WHERE time is lost — the SOP tells you HOW to fix it.
        </div>
      </div>
    </div>
  );
}

function RACIView({ tier }) {
  const roles = RACI_ROLES[tier];
  const raciLegend = [
    { code: "R", label: "Responsible", desc: "Does the work", color: T.blue },
    { code: "A", label: "Accountable", desc: "Approves / owns outcome", color: T.gold },
    { code: "C", label: "Consulted", desc: "Provides input", color: T.teal },
    { code: "I", label: "Informed", desc: "Kept in the loop", color: T.t4 },
  ];

  return (
    <div>
      <div style={s.card}>
        <div style={s.cardTitle}>RACI Matrix — Cash Application</div>
        <div style={s.cardSub}>{RACI_ACTIVITIES.length} activities × {roles.length} roles | {TIERS.find(t=>t.id===tier)?.label} operating model</div>

        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          {raciLegend.map(l => (
            <span key={l.code} style={{ fontSize: "0.7rem", color: l.color, fontWeight: 600 }}>
              {l.code} = {l.label} <span style={{ fontWeight: 400, color: T.t3 }}>({l.desc})</span>
            </span>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${T.border}` }}>
            <thead>
              <tr>
                <th style={{ ...s.thCell, textAlign: "left", minWidth: 220, textTransform: "none", fontSize: "0.72rem" }}>Activity</th>
                {roles.map((r, i) => (
                  <th key={i} style={{ ...s.thCell, minWidth: 75 }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RACI_ACTIVITIES.map((row, ri) => {
                const vals = row[tier];
                return (
                  <tr key={ri}>
                    <td style={{ padding: "8px 12px", fontSize: "0.74rem", color: T.t1, fontWeight: 500, borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: ri % 2 === 0 ? T.bg : T.bgCard }}>
                      {row.activity}
                    </td>
                    {vals.map((v, vi) => (
                      <td key={vi} style={{ ...s.raciCell(v), background: ri % 2 === 0 && v === "I" ? T.bg : s.raciCell(v).background }}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance notes */}
      <div style={{ ...s.card, padding: "16px 20px" }}>
        <div style={{ fontSize: "0.73rem", color: T.t3 }}>
          <strong style={{ color: T.gold }}>GPO Tip:</strong> The #1 RACI failure in cash application is having the same person who imports bank files also approve postings — it's a SOX segregation-of-duties violation. Notice how in every tier, the "Import" and "Approve" rows have different R assignments. If your org has one person doing both, flag it immediately.
        </div>
      </div>
    </div>
  );
}

function SOPView({ tier }) {
  const [expandedSection, setExpandedSection] = useState("sop1");

  return (
    <div>
      <div style={{ ...s.card, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={s.cardTitle}>Standard Operating Procedure — Cash Application</div>
            <div style={s.cardSub}>Calibrated for: {TIERS.find(t=>t.id===tier)?.label} ({TIERS.find(t=>t.id===tier)?.sub})</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={s.badge}>SOP-CA-001</span>
            <span style={{ ...s.badge, background: T.blueDim, color: T.blue }}>Rev 1.0</span>
            <span style={{ ...s.badge, background: T.greenDim, color: T.green }}>Active</span>
          </div>
        </div>
      </div>

      {SOP_SECTIONS.map(sec => (
        <div key={sec.id} style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: expandedSection === sec.id ? T.goldDim : "transparent", transition: "background 0.15s",
            }}
            onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
          >
            <span style={s.sopTitle}>{sec.title}</span>
            <span style={{ color: T.t3, fontSize: "0.8rem" }}>{expandedSection === sec.id ? "▾" : "▸"}</span>
          </div>
          {expandedSection === sec.id && (
            <div style={{ padding: "4px 20px 20px" }}>
              <div style={s.sopBody}>{sec.content[tier]}</div>
            </div>
          )}
        </div>
      ))}

      <div style={{ ...s.card, padding: "16px 20px" }}>
        <div style={{ fontSize: "0.73rem", color: T.t3 }}>
          <strong style={{ color: T.gold }}>GPO Tip:</strong> A good SOP is a living document. Set a review cadence: Quarterly for process steps, Semi-annually for controls, Annually for the full document. After any system upgrade or org change, trigger an off-cycle review. The most common audit finding? SOPs that describe a process nobody actually follows anymore.
        </div>
      </div>
    </div>
  );
}

function KPIView({ tier }) {
  const live = useLiveActuals();
  return (
    <div>
      <div style={s.card}>
        <div style={s.cardTitle}>Cash Application KPI Scorecard</div>
        <div style={s.cardSub}>8 KPIs with APQC/Hackett-aligned benchmarks | Calibrated for {TIERS.find(t=>t.id===tier)?.label} tier</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          {[
            { label: "World Class", color: T.green },
            { label: "Top Quartile", color: T.teal },
            { label: "Median", color: T.gold },
            { label: "Below Median", color: T.red },
          ].map(b => (
            <span key={b.label} style={{ fontSize: "0.68rem", color: b.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, display: "inline-block" }} />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <div style={s.kpiGrid}>
        {KPI_DATA.map(kpi => {
          const b = kpi.benchmarks[tier];
          const benchmarks = [
            { key: "worldClass", label: "World Class", color: T.green },
            { key: "topQ", label: "Top Quartile", color: T.teal },
            { key: "median", label: "Median", color: T.gold },
            { key: "belowMed", label: "Below Median", color: T.red },
          ];
          return (
            <div key={kpi.id} style={s.kpiCard}>
              <div style={s.kpiName}>{kpi.name}</div>
              <div style={s.kpiDef}>{kpi.definition}</div>
              <div style={s.kpiFormula}>{kpi.formula}</div>
              {benchmarks.map(bm => (
                <div key={bm.key} style={s.benchRow}>
                  <span style={{ ...s.benchLabel, color: bm.color }}>{bm.label}</span>
                  <span style={{ ...s.benchVal, color: bm.color }}>
                    {kpi.unit === "$" ? `$${b[bm.key].toFixed(2)}` : `${b[bm.key]}${kpi.unit}`}
                  </span>
                </div>
              ))}
              {getKpiActual(kpi.name, live) && (
                <div style={{ ...s.benchRow, borderTop: "1px dashed rgba(255,255,255,0.12)", marginTop: 4, paddingTop: 6 }}>
                  <span style={{ ...s.benchLabel, color: "#34D399", fontWeight: 700 }}>● Actual (LIVE)</span>
                  <span style={{ ...s.benchVal, color: "#34D399", fontWeight: 700 }}>{getKpiActual(kpi.name, live)}</span>
                </div>
              )}
              <div style={s.kpiMeta}>
                <span>📊 {kpi.frequency}</span>
                <span>👤 {kpi.owner}</span>
                <span>{kpi.direction === "higher" ? "↑ Higher is better" : "↓ Lower is better"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...s.card, padding: "16px 20px", marginTop: 20 }}>
        <div style={{ fontSize: "0.73rem", color: T.t3 }}>
          <strong style={{ color: T.gold }}>GPO Tip:</strong> First-Pass Match Rate is the #1 diagnostic metric for cash application health. If yours is below median, don't invest in more headcount — invest in remittance data quality and matching rule optimization. Every 10-point improvement in match rate typically reduces FTE requirements by 15-20%. That's the business case your CFO wants to hear.
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function CashAppProcessPack() {
  const [tier, setTier] = useState("large");
  const [tab, setTab] = useState("sipoc");

  const renderTab = useCallback(() => {
    switch (tab) {
      case "sipoc": return <SIPOCView tier={tier} />;
      case "swimlane": return <SwimlaneView tier={tier} />;
      case "raci": return <RACIView tier={tier} />;
      case "sop": return <SOPView tier={tier} />;
      case "kpi": return <KPIView tier={tier} />;
      default: return null;
    }
  }, [tab, tier]);

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={s.h1}>Cash Application Process Pack</div>
          <span style={s.badge}>Deliverable 1.2</span>
          <span style={{ ...s.badge, background: T.blueDim, color: T.blue }}>Phase 1</span>
        </div>
        <div style={s.sub}>
          SIPOC · Swimlane · RACI · SOP · KPI Scorecard — Tier-adjustable across 4 organization sizes
        </div>
      </div>

      {/* Tier Selector */}
      <div style={s.tierBar}>
        <span style={{ fontSize: "0.72rem", color: T.t3, fontWeight: 600, display: "flex", alignItems: "center", marginRight: 4 }}>ORG TIER:</span>
        {TIERS.map(t => (
          <button key={t.id} style={s.tierBtn(tier === t.id)} onClick={() => setTier(t.id)}>
            {t.icon} {t.label} <span style={{ opacity: 0.5, marginLeft: 4, fontSize: "0.68rem" }}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {renderTab()}
      </div>
    </div>
  );
}
