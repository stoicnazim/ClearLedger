import { useState, useMemo } from "react";
import { useLiveActuals, liveBadgeStyle, getKpiActual } from "./liveActuals";
import { useMockDatabase } from "./context/MockDatabaseContext";
import { evaluateRules } from "./ruleEngine";

// ─── TIER DEFINITIONS ───
const TIERS = [
  { id: "sme", label: "SME", accent: "#10B981" },
  { id: "mid", label: "Mid-Market", accent: "#3B82F6" },
  { id: "large", label: "Large Enterprise", accent: "#A855F7" },
  { id: "global", label: "Global MNC", accent: "#F59E0B" },
];

const TABS = [
  { id: "segmentation", label: "Segmentation Engine", icon: "◈" },
  { id: "workflow", label: "Collections Workflow", icon: "◇" },
  { id: "worklist", label: "Worklist Optimizer", icon: "◆" },
  { id: "aging", label: "Aging Strategy Map", icon: "◉" },
  { id: "kpi", label: "KPI Scorecard", icon: "◎" },
];

// ─── TAB 1: SEGMENTATION DATA ───
const SEGMENTS = {
  sme: [
    { name: "Reliable Core", risk: "Low", exposure: "Medium", color: "#10B981", strategy: "Automated reminders, self-service portal", cadence: "Monthly statement + Day 7 auto-email", escalation: "Day 30 → AR Manager call", automation: "Full", portfolioPct: 45, payBehavior: "On-time or <7 DPD", creditAction: "Annual review, auto-increase eligible" },
    { name: "Slow but Steady", risk: "Medium", exposure: "Medium", color: "#F59E0B", strategy: "Proactive outreach, flexible payment terms", cadence: "Day 3 email + Day 10 call + Day 20 escalation", escalation: "Day 45 → Credit hold review", automation: "Semi", portfolioPct: 25, payBehavior: "15–30 DPD consistently", creditAction: "Quarterly review, terms tightening" },
    { name: "At-Risk", risk: "High", exposure: "Variable", color: "#EF4444", strategy: "Immediate collector engagement, PTP focus", cadence: "Day 1 call + Day 5 follow-up + weekly thereafter", escalation: "Day 30 → Credit hold + management review", automation: "Manual", portfolioPct: 15, payBehavior: "30+ DPD, broken PTPs", creditAction: "Credit hold trigger, COD consideration" },
    { name: "Small-Balance / High-Volume", risk: "Low", exposure: "Low", color: "#6366F1", strategy: "Batch processing, automated dunning only", cadence: "Automated emails at Day 7, 14, 30", escalation: "Day 60 → Write-off review", automation: "Full", portfolioPct: 10, payBehavior: "Mixed — volume-driven", creditAction: "Threshold-based auto-approval" },
    { name: "New / Unscored", risk: "Unknown", exposure: "Variable", color: "#8B5CF6", strategy: "Tighter terms, proactive monitoring, credit check", cadence: "Day 1 email + Day 5 call for first 3 invoices", escalation: "Day 15 → AR Manager review", automation: "Semi", portfolioPct: 5, payBehavior: "No history — monitoring period", creditAction: "Probationary terms, 90-day scoring window" },
  ],
  mid: [
    { name: "Strategic Anchor", risk: "Low", exposure: "High", color: "#10B981", strategy: "Relationship-managed, executive sponsor alignment", cadence: "Monthly AR review call with Account Manager", escalation: "Day 45 → VP Finance engagement", automation: "Minimal — relationship-driven", portfolioPct: 20, payBehavior: "On-time, contractual terms honoured", creditAction: "Semi-annual review, strategic limit increases" },
    { name: "Reliable Core", risk: "Low", exposure: "Medium", color: "#22D3EE", strategy: "Automated reminders, portal-enabled self-service", cadence: "Monthly statement + Day 7 auto-email + Day 14 call", escalation: "Day 30 → Collections Specialist", automation: "Full", portfolioPct: 30, payBehavior: "On-time or <10 DPD", creditAction: "Annual review, auto-increase eligible" },
    { name: "Slow but Steady", risk: "Medium", exposure: "Medium", color: "#F59E0B", strategy: "Structured payment plans, dedicated collector", cadence: "Day 3 email + Day 7 call + Day 14 escalation + Day 21 management", escalation: "Day 45 → Credit Committee review", automation: "Semi", portfolioPct: 20, payBehavior: "15–30 DPD consistently", creditAction: "Quarterly review, security deposit consideration" },
    { name: "At-Risk", risk: "High", exposure: "Variable", color: "#EF4444", strategy: "Daily collector engagement, PTP enforcement, legal prep", cadence: "Day 1 call + Day 3 follow-up + Day 7 demand + weekly", escalation: "Day 30 → Legal counsel + Credit Committee", automation: "Manual", portfolioPct: 15, payBehavior: "30+ DPD, disputes, broken PTPs", creditAction: "Immediate credit hold, COD enforcement" },
    { name: "Small-Balance / High-Volume", risk: "Low", exposure: "Low", color: "#6366F1", strategy: "Batch dunning, automated write-off workflow", cadence: "Automated emails at Day 7, 14, 30, 45", escalation: "Day 60 → Auto write-off queue", automation: "Full", portfolioPct: 10, payBehavior: "Mixed — volume-driven", creditAction: "Threshold-based auto-approval" },
    { name: "New / Unscored", risk: "Unknown", exposure: "Variable", color: "#8B5CF6", strategy: "Probationary terms, enhanced monitoring, credit scoring", cadence: "Day 1 email + Day 5 call for first 5 invoices", escalation: "Day 15 → Credit Analyst review", automation: "Semi", portfolioPct: 5, payBehavior: "No history — 90-day scoring window", creditAction: "Restricted terms, trade reference verification" },
  ],
  large: [
    { name: "Strategic Anchor", risk: "Low", exposure: "Very High", color: "#10B981", strategy: "Executive-sponsored, quarterly business reviews, bespoke terms", cadence: "Monthly reconciliation + quarterly executive review", escalation: "Day 60 → CFO-to-CFO engagement", automation: "Minimal — white-glove", portfolioPct: 25, payBehavior: "Contractual terms, structured payments", creditAction: "Board-approved limits, annual strategic review" },
    { name: "Reliable Core", risk: "Low", exposure: "Medium–High", color: "#22D3EE", strategy: "Automated with relationship overlay, portal self-service", cadence: "Monthly statement + Day 7 auto-email + Day 14 call + Day 21 escalation", escalation: "Day 30 → Senior Collections Analyst", automation: "High", portfolioPct: 25, payBehavior: "On-time or <10 DPD", creditAction: "Annual review, scoring model-driven increases" },
    { name: "Slow but Steady", risk: "Medium", exposure: "Medium", color: "#F59E0B", strategy: "Dedicated collector, structured PTP with penalty clauses", cadence: "Day 3 email + Day 7 call + Day 10 manager + Day 14 demand + Day 21 pre-legal", escalation: "Day 45 → Credit Committee + Legal review", automation: "Semi", portfolioPct: 20, payBehavior: "15–45 DPD, partial payments", creditAction: "Quarterly Credit Committee review, limit reduction" },
    { name: "At-Risk", risk: "High", exposure: "Variable", color: "#EF4444", strategy: "Intensive management, legal preparation, provision triggers", cadence: "Daily contact attempts + weekly management reporting", escalation: "Day 21 → Legal + IFRS 9 staging review + Credit Committee", automation: "Manual + AI prediction overlay", portfolioPct: 15, payBehavior: "45+ DPD, disputes, litigation risk", creditAction: "Credit suspension, security/guarantee demand" },
    { name: "Small-Balance / High-Volume", risk: "Low", exposure: "Low", color: "#6366F1", strategy: "Full automation, netting optimization, batch processing", cadence: "Automated dunning cycle: Day 5, 10, 20, 30, 45", escalation: "Day 60 → Auto write-off with management approval", automation: "Full", portfolioPct: 10, payBehavior: "Mixed — operational noise", creditAction: "Auto-approval below threshold" },
    { name: "New / Unscored", risk: "Unknown", exposure: "Variable", color: "#8B5CF6", strategy: "Credit scoring model, probationary terms, enhanced due diligence", cadence: "Day 1 email + Day 3 call for first 5 invoices + weekly monitoring", escalation: "Day 10 → Credit Risk Analyst + Compliance review", automation: "Semi — scoring model assisted", portfolioPct: 5, payBehavior: "No history — 120-day scoring window", creditAction: "Restricted terms, bank/trade references, D&B scoring" },
  ],
  global: [
    { name: "Strategic Anchor", risk: "Low", exposure: "Very High", color: "#10B981", strategy: "C-suite sponsored, multi-entity netting, bespoke contractual terms, quarterly business reviews", cadence: "Monthly global reconciliation + quarterly CFO review + annual contract renegotiation", escalation: "Day 60 → Group CFO engagement + Regional Treasury", automation: "Minimal — dedicated relationship team", portfolioPct: 25, payBehavior: "Contractual terms, multi-currency structured payments", creditAction: "Group Credit Committee approved, sovereign risk overlay" },
    { name: "Reliable Core", risk: "Low", exposure: "Medium–High", color: "#22D3EE", strategy: "Automated with regional collector overlay, IC netting optimization, portal self-service", cadence: "Monthly statement + Day 7 auto-email + Day 14 regional call + Day 21 escalation + Day 28 IC netting review", escalation: "Day 30 → Regional Collections Manager", automation: "High with IC netting engine", portfolioPct: 20, payBehavior: "On-time or <10 DPD, FX timing variances", creditAction: "Annual review, country risk adjusted limits, scoring model-driven" },
    { name: "Slow but Steady", risk: "Medium", exposure: "Medium", color: "#F59E0B", strategy: "Dedicated regional collector, structured PTP with FX hedging, multi-jurisdiction terms", cadence: "Day 3 email + Day 7 call + Day 10 regional manager + Day 14 demand + Day 18 treasury + Day 21 pre-legal", escalation: "Day 45 → Regional Credit Committee + Legal + Transfer Pricing review", automation: "Semi — AI prediction + FX monitoring", portfolioPct: 15, payBehavior: "15–45 DPD, FX delays, partial payments, IC disputes", creditAction: "Quarterly Regional Credit Committee, limit reduction, LC/BG consideration" },
    { name: "At-Risk", risk: "High", exposure: "Variable", color: "#EF4444", strategy: "Intensive multi-jurisdiction management, legal preparation across entities, IFRS 9 ECL staging, sanctions screening", cadence: "Daily contact + weekly regional reporting + bi-weekly Group Treasury update", escalation: "Day 21 → Multi-jurisdiction Legal + IFRS 9 review + Group Credit Committee + Sanctions/Compliance", automation: "Manual + AI ECL prediction + sanctions screening", portfolioPct: 10, payBehavior: "45+ DPD, cross-entity disputes, sovereign/political risk", creditAction: "Group credit suspension, sovereign risk escalation, insurance/guarantee demand" },
    { name: "Small-Balance / High-Volume", risk: "Low", exposure: "Low", color: "#6366F1", strategy: "Full automation, multi-entity netting, FX batch processing, automated write-off workflow", cadence: "Automated dunning: Day 5, 10, 20, 30, 45 + monthly IC netting sweep", escalation: "Day 60 → Auto write-off with regional approval + tax write-off optimization", automation: "Full with IC netting + FX batching", portfolioPct: 20, payBehavior: "Mixed — operational/FX noise across entities", creditAction: "Auto-approval below entity threshold, country-specific limits" },
    { name: "New / Unscored", risk: "Unknown", exposure: "Variable", color: "#8B5CF6", strategy: "Enhanced due diligence, country risk overlay, sanctions/AML screening, probationary terms across all entities", cadence: "Day 1 email + Day 3 call for first 5 invoices + weekly monitoring + monthly compliance review", escalation: "Day 10 → Regional Credit Risk + Compliance + Sanctions screening", automation: "Semi — scoring model + sanctions/AML automated", portfolioPct: 10, payBehavior: "No history — 120-day multi-entity scoring window", creditAction: "Restricted terms, UBO verification, bank/trade refs, D&B + country risk, sanctions list check" },
  ],
};

// ─── TAB 2: DUNNING / WORKFLOW DATA ───
const TONE_COLORS = {
  Courtesy: "#10B981",
  Friendly: "#22D3EE",
  Firm: "#F59E0B",
  Urgent: "#F97316",
  Demand: "#EF4444",
  "Pre-Legal": "#DC2626",
  Legal: "#991B1B",
};

const DUNNING_STEPS = {
  sme: [
    { day: 0, action: "Invoice issued — auto-email with payment link", tone: "Courtesy", channel: "Email (auto)", role: "System", segment: "All" },
    { day: 3, action: "Payment reminder — friendly nudge email", tone: "Courtesy", channel: "Email (auto)", role: "System", segment: "All" },
    { day: 7, action: "Second reminder — portal link + payment options", tone: "Friendly", channel: "Email (auto)", role: "System", segment: "Reliable Core, Small-Balance" },
    { day: 7, action: "Direct phone call — payment status inquiry", tone: "Friendly", channel: "Phone", role: "AR Clerk", segment: "Slow but Steady, At-Risk, New" },
    { day: 14, action: "Firm reminder email — late fee warning", tone: "Firm", channel: "Email", role: "AR Clerk", segment: "All open" },
    { day: 21, action: "Phone call — PTP negotiation", tone: "Firm", channel: "Phone", role: "AR Manager", segment: "Slow but Steady, At-Risk" },
    { day: 30, action: "Credit hold notification — account suspension warning", tone: "Urgent", channel: "Email + Phone", role: "AR Manager", segment: "At-Risk, Slow but Steady" },
    { day: 45, action: "Formal demand letter — final notice before collection", tone: "Demand", channel: "Letter (registered)", role: "AR Manager", segment: "At-Risk" },
    { day: 60, action: "External collection agency referral OR write-off review", tone: "Pre-Legal", channel: "Letter", role: "Controller", segment: "At-Risk" },
    { day: 90, action: "Write-off approval — bad debt provision booking", tone: "Legal", channel: "Internal", role: "Controller", segment: "At-Risk, Small-Balance" },
  ],
  mid: [
    { day: 0, action: "Invoice issued — auto-email with payment portal link and remittance instructions", tone: "Courtesy", channel: "Email (auto)", role: "System / Billing", segment: "All" },
    { day: 3, action: "Courtesy reminder — upcoming/past due nudge", tone: "Courtesy", channel: "Email (auto)", role: "System", segment: "All" },
    { day: 7, action: "Second reminder — account statement attached, payment options highlighted", tone: "Friendly", channel: "Email (auto)", role: "System", segment: "Reliable Core, Small-Balance" },
    { day: 7, action: "Collector phone call — verify receipt, identify blockers", tone: "Friendly", channel: "Phone", role: "Collections Specialist", segment: "Slow but Steady, At-Risk, New" },
    { day: 14, action: "Firm reminder — late fee accrual notice, credit terms reference", tone: "Firm", channel: "Email", role: "Collections Specialist", segment: "All open" },
    { day: 21, action: "Manager escalation call — structured PTP negotiation", tone: "Firm", channel: "Phone", role: "Collections Manager", segment: "Slow but Steady, At-Risk" },
    { day: 30, action: "Credit hold activation — SOX-compliant segregated approval (Credit ≠ Collections)", tone: "Urgent", channel: "Email + System", role: "Credit Analyst (approve) / Collections Manager (request)", segment: "At-Risk" },
    { day: 30, action: "Account Manager notification — relationship risk alert for Strategic Anchors", tone: "Urgent", channel: "Internal alert", role: "Account Manager", segment: "Strategic Anchor" },
    { day: 45, action: "Formal demand letter — legal language, cure period specified", tone: "Demand", channel: "Letter (registered)", role: "AR Director", segment: "At-Risk, Slow but Steady" },
    { day: 60, action: "Credit Committee escalation — provision assessment, legal counsel engagement", tone: "Pre-Legal", channel: "Internal + Letter", role: "Credit Committee", segment: "At-Risk" },
    { day: 75, action: "External counsel / collection agency engagement", tone: "Legal", channel: "Legal letter", role: "Legal Counsel / AR Director", segment: "At-Risk" },
    { day: 90, action: "Write-off authorization — bad debt booking with full documentation trail", tone: "Legal", channel: "Internal", role: "Controller / CFO", segment: "At-Risk, Small-Balance" },
  ],
  large: [
    { day: 0, action: "Invoice issued — multi-channel delivery (email, EDI, portal), auto-matched to PO", tone: "Courtesy", channel: "Email/EDI/Portal (auto)", role: "System / Billing", segment: "All" },
    { day: 3, action: "Courtesy reminder — auto-dunning with payment link and remittance template", tone: "Courtesy", channel: "Email (auto)", role: "System", segment: "All" },
    { day: 7, action: "Second reminder — statement reconciliation prompt, dispute window notice", tone: "Friendly", channel: "Email (auto)", role: "System", segment: "Reliable Core, Small-Balance" },
    { day: 7, action: "Collector call — receipt verification, blocker identification, dispute triage", tone: "Friendly", channel: "Phone", role: "Senior Collections Analyst", segment: "Slow but Steady, At-Risk, New" },
    { day: 10, action: "AI prediction flag — model identifies elevated roll-rate risk, adjusts priority", tone: "Friendly", channel: "System alert", role: "AI Engine / Collections Manager", segment: "At-Risk (predicted)" },
    { day: 14, action: "Firm reminder — contractual penalty reference, credit terms citation", tone: "Firm", channel: "Email", role: "Senior Collections Analyst", segment: "All open" },
    { day: 21, action: "Manager escalation — structured PTP with penalty clause, payment plan proposal", tone: "Firm", channel: "Phone + Email", role: "Collections Manager", segment: "Slow but Steady, At-Risk" },
    { day: 30, action: "Credit hold request — SOX segregation: Collections requests → Credit approves → System enforces", tone: "Urgent", channel: "System workflow", role: "Credit Risk Manager (approve) / Collections Manager (request)", segment: "At-Risk" },
    { day: 30, action: "Relationship risk alert — Account Director + VP Sales notified for Strategic Anchors", tone: "Urgent", channel: "Internal escalation", role: "Account Director", segment: "Strategic Anchor" },
    { day: 45, action: "Formal demand — legal counsel reviewed, cure period, IFRS 9 Stage 2 assessment", tone: "Demand", channel: "Letter (registered) + Email", role: "AR Director / Legal", segment: "At-Risk, Slow but Steady" },
    { day: 60, action: "Credit Committee — full exposure review, provision calculation, legal strategy decision", tone: "Pre-Legal", channel: "Committee meeting", role: "Credit Committee (CFO, Legal, Credit Risk, AR Director)", segment: "At-Risk" },
    { day: 75, action: "External legal engagement — jurisdiction-specific counsel, litigation preparation", tone: "Legal", channel: "Legal correspondence", role: "External Legal / General Counsel", segment: "At-Risk" },
    { day: 90, action: "IFRS 9 Stage 3 — lifetime ECL provision, write-off authorization matrix (thresholds: <$50K AR Dir, <$500K CFO, >$500K Board)", tone: "Legal", channel: "Internal", role: "CFO / Board (threshold-dependent)", segment: "At-Risk" },
    { day: 120, action: "Final disposition — write-off booking, collection agency assignment, tax deduction optimization", tone: "Legal", channel: "Internal", role: "Controller / Tax", segment: "At-Risk, Small-Balance" },
  ],
  global: [
    { day: 0, action: "Invoice issued — multi-entity, multi-currency, multi-channel delivery (email, EDI, e-invoicing per local mandate, portal)", tone: "Courtesy", channel: "Email/EDI/Portal/E-Invoice (auto)", role: "System / Shared Services", segment: "All" },
    { day: 3, action: "Courtesy reminder — auto-dunning in local language, FX rate lock reminder, payment link", tone: "Courtesy", channel: "Email (auto)", role: "System", segment: "All" },
    { day: 7, action: "Second reminder — multi-entity statement reconciliation, IC netting opportunity flag", tone: "Friendly", channel: "Email (auto)", role: "System / IC Netting Engine", segment: "Reliable Core, Small-Balance" },
    { day: 7, action: "Regional collector call — receipt verification, blocker ID, dispute triage, FX delay assessment", tone: "Friendly", channel: "Phone", role: "Regional Collections Analyst", segment: "Slow but Steady, At-Risk, New" },
    { day: 10, action: "AI prediction — elevated roll-rate risk flagged, sanctions/AML re-screening triggered", tone: "Friendly", channel: "System alert", role: "AI Engine / Regional Collections Manager", segment: "At-Risk (predicted)" },
    { day: 14, action: "Firm reminder — contractual penalty per jurisdiction, credit terms citation, FX variance notification", tone: "Firm", channel: "Email", role: "Regional Collections Analyst", segment: "All open" },
    { day: 18, action: "Treasury coordination — FX hedging review for large exposures, cross-entity netting proposal", tone: "Firm", channel: "Internal", role: "Regional Treasury / Collections Manager", segment: "Strategic Anchor, Slow but Steady" },
    { day: 21, action: "Regional manager escalation — structured PTP with multi-currency payment plan, LC/BG request", tone: "Firm", channel: "Phone + Email", role: "Regional Collections Manager", segment: "Slow but Steady, At-Risk" },
    { day: 30, action: "Credit hold — SOX-compliant: Regional Collections requests → Group Credit approves → System enforces across all entities", tone: "Urgent", channel: "System workflow (multi-entity)", role: "Group Credit Risk (approve) / Regional Collections (request)", segment: "At-Risk" },
    { day: 30, action: "Relationship alert — Regional VP + Global Account Director notified, sovereign risk assessment updated", tone: "Urgent", channel: "Internal escalation", role: "Global Account Director", segment: "Strategic Anchor" },
    { day: 45, action: "Formal demand — multi-jurisdiction legal review, cure period per local law, IFRS 9 Stage 2 + country risk overlay", tone: "Demand", channel: "Letter (registered) + Email (local language)", role: "Regional AR Director / Local Legal", segment: "At-Risk, Slow but Steady" },
    { day: 60, action: "Regional Credit Committee — full cross-entity exposure, ECL calculation, transfer pricing implications, legal strategy by jurisdiction", tone: "Pre-Legal", channel: "Committee meeting", role: "Regional Credit Committee (Regional CFO, Legal, Credit Risk, AR, Tax, Transfer Pricing)", segment: "At-Risk" },
    { day: 75, action: "Multi-jurisdiction legal — local counsel engagement per entity, litigation preparation, regulatory filing assessment", tone: "Legal", channel: "Legal correspondence (multi-language)", role: "External Legal (per jurisdiction) / Group General Counsel", segment: "At-Risk" },
    { day: 90, action: "IFRS 9 Stage 3 — lifetime ECL with sovereign risk overlay, Group Credit Committee write-off matrix (<$100K Regional, <$1M Group CFO, >$1M Board)", tone: "Legal", channel: "Internal", role: "Group CFO / Board (threshold-dependent)", segment: "At-Risk" },
    { day: 120, action: "Final disposition — write-off booking (multi-entity, multi-currency), tax optimization per jurisdiction, collection agency (local), IC balance clean-up", tone: "Legal", channel: "Internal", role: "Group Controller / Regional Tax / Transfer Pricing", segment: "At-Risk, Small-Balance" },
    { day: 150, action: "Post-disposition review — lessons learned, model recalibration, policy update, sanctions list update", tone: "Legal", channel: "Internal", role: "Group Credit Risk / Compliance / AI Model Team", segment: "All (systemic review)" },
  ],
};

// ─── TAB 3: WORKLIST OPTIMIZER DATA ───
const WORKLIST_FACTORS = {
  sme: [
    { id: "amount", name: "Amount Overdue", weight: 25, description: "Total outstanding past-due balance" },
    { id: "dpd", name: "Days Past Due", weight: 25, description: "Aging severity — higher DPD = higher priority" },
    { id: "segment", name: "Customer Segment", weight: 20, description: "Risk segment weighting (At-Risk > Slow > New > Reliable)" },
    { id: "ptp", name: "Broken PTP Count", weight: 15, description: "Number of broken promise-to-pay commitments" },
    { id: "credit_util", name: "Credit Utilization %", weight: 10, description: "Current exposure vs. approved credit limit" },
    { id: "trend", name: "Payment Trend", weight: 5, description: "Improving vs. deteriorating payment pattern (3-month)" },
  ],
  mid: [
    { id: "amount", name: "Amount Overdue", weight: 20, description: "Total outstanding past-due balance" },
    { id: "dpd", name: "Days Past Due", weight: 20, description: "Aging severity — higher DPD = higher priority" },
    { id: "segment", name: "Customer Segment", weight: 15, description: "Risk segment weighting" },
    { id: "ptp", name: "Broken PTP Count", weight: 12, description: "Number of broken promise-to-pay commitments" },
    { id: "credit_util", name: "Credit Utilization %", weight: 10, description: "Current exposure vs. approved credit limit" },
    { id: "trend", name: "Payment Trend", weight: 8, description: "Improving vs. deteriorating pattern (6-month)" },
    { id: "strategic", name: "Strategic Account Flag", weight: 8, description: "Revenue dependency and relationship value" },
    { id: "credit_score", name: "Credit Risk Score", weight: 7, description: "External/internal credit scoring model output" },
  ],
  large: [
    { id: "amount", name: "Amount Overdue", weight: 15, description: "Total outstanding past-due balance" },
    { id: "dpd", name: "Days Past Due", weight: 15, description: "Aging severity" },
    { id: "segment", name: "Customer Segment", weight: 12, description: "Risk segment weighting" },
    { id: "ptp", name: "Broken PTP Count", weight: 10, description: "Broken promise-to-pay history" },
    { id: "credit_util", name: "Credit Utilization %", weight: 8, description: "Exposure vs. credit limit" },
    { id: "trend", name: "Payment Trend", weight: 7, description: "Improving vs. deteriorating (6-month)" },
    { id: "strategic", name: "Strategic Account Flag", weight: 7, description: "Revenue dependency, relationship tier" },
    { id: "credit_score", name: "Credit Risk Score", weight: 7, description: "External + internal scoring model" },
    { id: "dispute", name: "Dispute Complexity", weight: 7, description: "Open dispute count and aging" },
    { id: "ecl", name: "IFRS 9 ECL Staging", weight: 12, description: "Expected credit loss stage (1/2/3) — drives provision impact" },
  ],
  global: [
    { id: "amount", name: "Amount Overdue", weight: 12, description: "Total outstanding past-due balance (USD equivalent)" },
    { id: "dpd", name: "Days Past Due", weight: 12, description: "Aging severity" },
    { id: "segment", name: "Customer Segment", weight: 10, description: "Risk segment weighting" },
    { id: "ptp", name: "Broken PTP Count", weight: 8, description: "Broken promise-to-pay history" },
    { id: "credit_util", name: "Credit Utilization %", weight: 7, description: "Cross-entity exposure vs. group limit" },
    { id: "trend", name: "Payment Trend", weight: 6, description: "Multi-entity payment pattern (6-month)" },
    { id: "strategic", name: "Strategic Account Flag", weight: 7, description: "Global revenue dependency" },
    { id: "credit_score", name: "Credit Risk Score", weight: 6, description: "External + internal + sovereign overlay" },
    { id: "dispute", name: "Dispute Complexity", weight: 6, description: "Cross-entity dispute count and aging" },
    { id: "ecl", name: "IFRS 9 ECL Staging", weight: 10, description: "ECL stage with country risk overlay" },
    { id: "fx", name: "FX Volatility Exposure", weight: 8, description: "Currency risk on open receivables" },
    { id: "sanctions", name: "Sanctions / Compliance Risk", weight: 8, description: "OFAC/EU/UN sanctions list proximity, AML flags" },
  ],
};

const SAMPLE_CUSTOMERS = {
  sme: [
    { name: "Acme Tools Ltd", amount: 12500, dpd: 45, segment: 80, ptp: 90, credit_util: 60, trend: 70 },
    { name: "Baker & Sons", amount: 5200, dpd: 15, segment: 30, ptp: 10, credit_util: 40, trend: 20 },
    { name: "CityParts Co", amount: 8700, dpd: 30, segment: 60, ptp: 50, credit_util: 80, trend: 55 },
    { name: "Delta Supply", amount: 3100, dpd: 60, segment: 90, ptp: 80, credit_util: 95, trend: 85 },
    { name: "EuroFix GmbH", amount: 22000, dpd: 7, segment: 20, ptp: 5, credit_util: 30, trend: 10 },
    { name: "FastPack Inc", amount: 1800, dpd: 90, segment: 40, ptp: 60, credit_util: 50, trend: 40 },
  ],
  mid: [
    { name: "Nexus Manufacturing", amount: 87000, dpd: 35, segment: 70, ptp: 60, credit_util: 55, trend: 50, strategic: 80, credit_score: 65 },
    { name: "Orion Health Systems", amount: 145000, dpd: 10, segment: 20, ptp: 5, credit_util: 30, trend: 15, strategic: 90, credit_score: 20 },
    { name: "PrimeTech Solutions", amount: 42000, dpd: 55, segment: 85, ptp: 90, credit_util: 88, trend: 80, strategic: 30, credit_score: 85 },
    { name: "QuickServ Logistics", amount: 23000, dpd: 20, segment: 45, ptp: 30, credit_util: 60, trend: 35, strategic: 40, credit_score: 45 },
    { name: "Redline Automotive", amount: 195000, dpd: 5, segment: 15, ptp: 0, credit_util: 20, trend: 10, strategic: 95, credit_score: 15 },
    { name: "SteelForge Industries", amount: 67000, dpd: 70, segment: 90, ptp: 95, credit_util: 92, trend: 90, strategic: 25, credit_score: 90 },
  ],
  large: [
    { name: "Atlas Global Corp", amount: 520000, dpd: 25, segment: 60, ptp: 40, credit_util: 45, trend: 35, strategic: 85, credit_score: 50, dispute: 70, ecl: 40 },
    { name: "BioMed International", amount: 1200000, dpd: 8, segment: 15, ptp: 5, credit_util: 20, trend: 10, strategic: 95, credit_score: 10, dispute: 5, ecl: 10 },
    { name: "CoreTech Industries", amount: 340000, dpd: 50, segment: 80, ptp: 75, credit_util: 78, trend: 70, strategic: 30, credit_score: 75, dispute: 85, ecl: 80 },
    { name: "DataStream Analytics", amount: 89000, dpd: 15, segment: 35, ptp: 20, credit_util: 50, trend: 25, strategic: 60, credit_score: 30, dispute: 15, ecl: 20 },
    { name: "EnviroSafe Solutions", amount: 780000, dpd: 65, segment: 90, ptp: 90, credit_util: 95, trend: 85, strategic: 20, credit_score: 88, dispute: 60, ecl: 95 },
    { name: "FusionWorks GmbH", amount: 156000, dpd: 40, segment: 50, ptp: 55, credit_util: 65, trend: 50, strategic: 45, credit_score: 55, dispute: 40, ecl: 50 },
  ],
  global: [
    { name: "Zenith Pharmaceuticals AG", amount: 2800000, dpd: 20, segment: 50, ptp: 30, credit_util: 35, trend: 25, strategic: 90, credit_score: 40, dispute: 55, ecl: 30, fx: 60, sanctions: 20 },
    { name: "Pacific Rim Trading Ltd", amount: 890000, dpd: 55, segment: 80, ptp: 70, credit_util: 82, trend: 75, strategic: 35, credit_score: 78, dispute: 65, ecl: 75, fx: 85, sanctions: 45 },
    { name: "Nordic Energy AS", amount: 4500000, dpd: 5, segment: 10, ptp: 0, credit_util: 15, trend: 5, strategic: 98, credit_score: 8, dispute: 0, ecl: 5, fx: 30, sanctions: 5 },
    { name: "Saharan Resources SARL", amount: 670000, dpd: 80, segment: 95, ptp: 95, credit_util: 98, trend: 90, strategic: 15, credit_score: 92, dispute: 80, ecl: 95, fx: 95, sanctions: 90 },
    { name: "MedTech Brasil Ltda", amount: 1200000, dpd: 30, segment: 60, ptp: 45, credit_util: 55, trend: 40, strategic: 70, credit_score: 55, dispute: 35, ecl: 45, fx: 70, sanctions: 15 },
    { name: "Shanghai Dynamics Co", amount: 3100000, dpd: 12, segment: 40, ptp: 15, credit_util: 40, trend: 20, strategic: 85, credit_score: 35, dispute: 20, ecl: 20, fx: 50, sanctions: 35 },
  ],
};

// ─── TAB 4: AGING STRATEGY MAP ───
const AGING_BUCKETS = ["Current", "1–30 DPD", "31–60 DPD", "61–90 DPD", "90+ DPD"];

const AGING_DATA = {
  sme: [
    { bucket: "Current", actions: "Auto-email invoice + payment link; monitor credit utilization", role: "System / AR Clerk", escalation: "None — business as usual", provision: "0% — no provision required", taxonomyRef: "L4: 8.3.3.1 Invoice Delivery", kpi: "Invoice accuracy rate, on-time delivery %" },
    { bucket: "1–30 DPD", actions: "Auto-reminder Day 7; AR Clerk call Day 14; late fee warning Day 21", role: "AR Clerk → AR Manager (Day 21+)", escalation: "Day 14 — no response triggers manual follow-up", provision: "0.5–1% — general allowance", taxonomyRef: "L4: 8.3.3.2 Collections Follow-up", kpi: "Right Party Contact Rate, PTP Conversion" },
    { bucket: "31–60 DPD", actions: "Firm reminder + PTP negotiation; credit hold review at Day 45", role: "AR Manager", escalation: "Day 45 — credit hold activation (Controller approval)", provision: "5–10% — specific provision assessment", taxonomyRef: "L4: 8.3.3.3 Escalation Management", kpi: "CEI, Roll Rate (30→60)" },
    { bucket: "61–90 DPD", actions: "Demand letter; external collection assessment; payment plan negotiation", role: "AR Manager → Controller", escalation: "Day 75 — Controller decision: collect internally or refer externally", provision: "25–50% — elevated provision", taxonomyRef: "L4: 8.3.3.4 Pre-Legal Assessment", kpi: "Recovery Rate, Cost-to-Collect" },
    { bucket: "90+ DPD", actions: "Collection agency referral or write-off; bad debt booking", role: "Controller", escalation: "Day 90 — write-off authorization; Day 120 — final disposition", provision: "50–100% — full provision / write-off", taxonomyRef: "L4: 8.3.3.5 Write-off & Recovery", kpi: "Bad Debt Ratio, Recovery Rate 90+" },
  ],
  mid: [
    { bucket: "Current", actions: "Auto-invoice delivery (email/EDI/portal); credit monitoring dashboard; dispute window communication", role: "System / Billing Team", escalation: "None — routine monitoring", provision: "0% — IFRS 9 Stage 1 (12-month ECL placeholder)", taxonomyRef: "L4: 8.3.3.1 Invoice Delivery", kpi: "Invoice accuracy, delivery confirmation rate" },
    { bucket: "1–30 DPD", actions: "Auto-dunning sequence (Day 3, 7, 14); Collections Specialist call Day 14; Account Manager alert for Strategic Anchors at Day 21", role: "Collections Specialist → Collections Manager (Day 21+)", escalation: "Day 21 — no PTP triggers manager escalation", provision: "1–2% — general allowance per segment", taxonomyRef: "L4: 8.3.3.2 Collections Follow-up", kpi: "Right Party Contact Rate, PTP Conversion, DSO by Segment" },
    { bucket: "31–60 DPD", actions: "Structured PTP with penalty clauses; credit hold activation (SOX-compliant segregation); Credit Committee briefing at Day 45", role: "Collections Manager → Credit Analyst (credit hold) → AR Director (Day 45+)", escalation: "Day 30 — credit hold request; Day 45 — Credit Committee", provision: "5–15% — specific provision, segment-adjusted", taxonomyRef: "L4: 8.3.3.3 Escalation Management", kpi: "CEI, Roll Rate (30→60), Credit Hold Conversion %" },
    { bucket: "61–90 DPD", actions: "Formal demand letter (legal-reviewed); legal counsel engagement; provision reassessment; payment plan formalization", role: "AR Director → Credit Committee → Legal", escalation: "Day 60 — Credit Committee decision; Day 75 — external counsel", provision: "25–50% — elevated specific provision", taxonomyRef: "L4: 8.3.3.4 Pre-Legal Assessment", kpi: "Recovery Rate, Cost-to-Collect, Dispute Resolution Cycle Time" },
    { bucket: "90+ DPD", actions: "External legal / collection agency; write-off authorization (tiered matrix); bad debt booking; tax deduction filing", role: "Controller / CFO (threshold-dependent)", escalation: "Day 90 — write-off matrix; Day 120 — final disposition", provision: "50–100% — full provision / write-off", taxonomyRef: "L4: 8.3.3.5 Write-off & Recovery", kpi: "Bad Debt Ratio, Recovery Rate 90+, Write-off as % of Revenue" },
  ],
  large: [
    { bucket: "Current", actions: "Multi-channel invoice delivery (email/EDI/e-invoicing/portal); PO auto-match; AI-driven payment prediction; credit dashboard monitoring", role: "System / Billing / AI Engine", escalation: "AI flag — predicted late payment triggers pre-emptive outreach", provision: "0% — IFRS 9 Stage 1 (12-month ECL, model-driven)", taxonomyRef: "L4: 8.3.3.1 Invoice Delivery", kpi: "Invoice accuracy, first-pass match rate, payment prediction accuracy" },
    { bucket: "1–30 DPD", actions: "Auto-dunning (Day 3, 7, 14); Senior Analyst call Day 14; dispute triage; AI re-scoring; Account Director alert for Strategic at Day 21", role: "Senior Collections Analyst → Collections Manager (Day 21+)", escalation: "Day 21 — manager escalation; AI prediction override check", provision: "1–3% — model-driven ECL, segment-adjusted", taxonomyRef: "L4: 8.3.3.2 Collections Follow-up", kpi: "Right Party Contact Rate, PTP Conversion, DSO by Segment, AI Prediction Accuracy" },
    { bucket: "31–60 DPD", actions: "Structured PTP with penalty; credit hold (SOX 3-way segregation); Credit Committee briefing; IFRS 9 Stage 2 assessment; relationship risk scoring", role: "Collections Manager → Credit Risk Manager → AR Director → Credit Committee", escalation: "Day 30 — credit hold; Day 45 — Credit Committee + IFRS 9 review", provision: "5–20% — IFRS 9 Stage 2 (lifetime ECL if SICR triggered)", taxonomyRef: "L4: 8.3.3.3 Escalation Management", kpi: "CEI, Roll Rate, Credit Hold Conversion, IFRS 9 Staging Accuracy" },
    { bucket: "61–90 DPD", actions: "Legal demand (jurisdiction-specific); Credit Committee formal session; provision recalculation; external counsel briefing; payment plan with security/guarantee", role: "AR Director → Credit Committee → General Counsel → CFO", escalation: "Day 60 — Credit Committee decision; Day 75 — external counsel engagement", provision: "25–60% — elevated IFRS 9 provision, specific assessment", taxonomyRef: "L4: 8.3.3.4 Pre-Legal Assessment", kpi: "Recovery Rate, Cost-to-Collect, Legal Engagement Rate" },
    { bucket: "90+ DPD", actions: "IFRS 9 Stage 3 — lifetime ECL; write-off matrix (<$50K AR Dir, <$500K CFO, >$500K Board); external legal/agency; tax optimization", role: "CFO / Board (threshold) / Controller / Tax", escalation: "Day 90 — authorization matrix; Day 120 — final disposition + model recalibration", provision: "50–100% — IFRS 9 Stage 3, full lifetime ECL", taxonomyRef: "L4: 8.3.3.5 Write-off & Recovery", kpi: "Bad Debt Ratio, Recovery Rate 90+, ECL Forecast Accuracy" },
  ],
  global: [
    { bucket: "Current", actions: "Multi-entity, multi-currency, multi-channel invoice delivery (email/EDI/e-invoicing per local mandate); PO auto-match; IC netting identification; AI payment prediction with FX overlay; sanctions screening", role: "System / Shared Services / AI Engine / Compliance", escalation: "AI flag — predicted late payment + FX volatility triggers pre-emptive action; sanctions hit → immediate compliance escalation", provision: "0% — IFRS 9 Stage 1 (12-month ECL, sovereign risk overlay, model-driven)", taxonomyRef: "L4: 8.3.3.1 Invoice Delivery", kpi: "Invoice accuracy, e-invoicing compliance rate, IC netting capture rate, sanctions screening pass rate" },
    { bucket: "1–30 DPD", actions: "Auto-dunning (local language, Day 3/7/14); Regional Analyst call Day 14; IC netting sweep; FX delay assessment; dispute triage; AI re-scoring with country risk", role: "Regional Collections Analyst → Regional Collections Manager (Day 21+)", escalation: "Day 21 — regional manager; FX delay >5% triggers Treasury alert", provision: "1–5% — model-driven ECL, segment + country risk adjusted", taxonomyRef: "L4: 8.3.3.2 Collections Follow-up", kpi: "Right Party Contact Rate, PTP Conversion, DSO by Region/Segment, FX Impact on Collections" },
    { bucket: "31–60 DPD", actions: "Structured PTP (multi-currency payment plan, LC/BG consideration); credit hold (SOX 3-way, multi-entity enforcement); Regional Credit Committee; IFRS 9 Stage 2 + sovereign overlay; transfer pricing review", role: "Regional Collections Manager → Group Credit Risk → Regional Credit Committee → Transfer Pricing", escalation: "Day 30 — multi-entity credit hold; Day 45 — Regional Credit Committee + IFRS 9 + TP review", provision: "5–25% — IFRS 9 Stage 2 (lifetime ECL + sovereign risk premium)", taxonomyRef: "L4: 8.3.3.3 Escalation Management", kpi: "CEI, Roll Rate, Credit Hold Conversion, IC Netting Efficiency, IFRS 9 Staging Accuracy" },
    { bucket: "61–90 DPD", actions: "Multi-jurisdiction legal demand; Regional + Group Credit Committee; provision recalculation (multi-entity consolidated); external counsel per jurisdiction; payment plan with cross-border security", role: "Regional AR Director → Group Credit Committee → Local Legal → Group General Counsel → Regional CFO", escalation: "Day 60 — Group Credit Committee; Day 75 — multi-jurisdiction legal; sovereign risk alert if applicable", provision: "25–70% — elevated IFRS 9 provision, sovereign + FX + counterparty overlay", taxonomyRef: "L4: 8.3.3.4 Pre-Legal Assessment", kpi: "Recovery Rate, Cost-to-Collect, Legal Engagement Rate, FX Loss on Write-down" },
    { bucket: "90+ DPD", actions: "IFRS 9 Stage 3 (sovereign overlay); Group write-off matrix (<$100K Regional, <$1M Group CFO, >$1M Board); multi-jurisdiction legal; IC balance clean-up; tax optimization per jurisdiction; collection agency (local); model recalibration; lessons learned", role: "Group CFO / Board (threshold) / Group Controller / Regional Tax / Transfer Pricing / Compliance", escalation: "Day 90 — Group authorization; Day 120 — final multi-entity disposition; Day 150 — post-mortem + policy update", provision: "50–100% — IFRS 9 Stage 3, full lifetime ECL, sovereign + FX + political risk", taxonomyRef: "L4: 8.3.3.5 Write-off & Recovery", kpi: "Bad Debt Ratio, Recovery Rate 90+, ECL Forecast Accuracy, Tax Recovery Rate, IC Write-off Ratio" },
  ],
};

// ─── TAB 5: KPI SCORECARD DATA ───
const KPI_DATA = {
  sme: [
    { name: "Collection Effectiveness Index (CEI)", formula: "(Beginning AR + Credit Sales − Ending AR) / (Beginning AR + Credit Sales − Ending Current AR) × 100", topQ: "≥ 90%", median: "80–89%", bottomQ: "< 80%", target: "85%", description: "Measures efficiency of converting receivables to cash within period" },
    { name: "Right Party Contact Rate", formula: "Successful Contacts / Total Contact Attempts × 100", topQ: "≥ 75%", median: "55–74%", bottomQ: "< 55%", target: "65%", description: "Effectiveness of reaching decision-makers on collection calls" },
    { name: "PTP Conversion Rate", formula: "Kept Promises / Total Promises × 100", topQ: "≥ 85%", median: "65–84%", bottomQ: "< 65%", target: "75%", description: "Reliability of promise-to-pay commitments from customers" },
    { name: "DSO by Segment", formula: "(Segment AR Balance / Segment Credit Sales) × Days in Period", topQ: "< 35 days", median: "35–50 days", bottomQ: "> 50 days", target: "< 45 days", description: "Segment-specific days sales outstanding measurement" },
    { name: "Roll Rate (30→60→90)", formula: "AR Moving to Next Bucket / AR in Current Bucket × 100", topQ: "< 8%", median: "8–15%", bottomQ: "> 15%", target: "< 12%", description: "Percentage of receivables migrating to older aging buckets" },
    { name: "Recovery Rate 90+ DPD", formula: "Cash Recovered from 90+ / Total 90+ Balance × 100", topQ: "≥ 25%", median: "10–24%", bottomQ: "< 10%", target: "15%", description: "Effectiveness of recovering severely delinquent balances" },
    { name: "Cost-to-Collect", formula: "Total Collections Dept Cost / Total Cash Collected × 100", topQ: "< 1.5%", median: "1.5–3.0%", bottomQ: "> 3.0%", target: "< 2.5%", description: "Operational efficiency of the collections function" },
    { name: "Dispute Resolution Cycle Time", formula: "Average Days from Dispute Open to Resolution", topQ: "< 15 days", median: "15–30 days", bottomQ: "> 30 days", target: "< 25 days", description: "Speed of resolving customer disputes blocking payment" },
  ],
  mid: [
    { name: "Collection Effectiveness Index (CEI)", formula: "(Beginning AR + Credit Sales − Ending AR) / (Beginning AR + Credit Sales − Ending Current AR) × 100", topQ: "≥ 92%", median: "82–91%", bottomQ: "< 82%", target: "88%", description: "Measures efficiency of converting receivables to cash within period" },
    { name: "Right Party Contact Rate", formula: "Successful Contacts / Total Contact Attempts × 100", topQ: "≥ 80%", median: "60–79%", bottomQ: "< 60%", target: "70%", description: "Effectiveness of reaching decision-makers on collection calls" },
    { name: "PTP Conversion Rate", formula: "Kept Promises / Total Promises × 100", topQ: "≥ 88%", median: "70–87%", bottomQ: "< 70%", target: "80%", description: "Reliability of promise-to-pay commitments from customers" },
    { name: "DSO by Segment", formula: "(Segment AR Balance / Segment Credit Sales) × Days in Period", topQ: "< 32 days", median: "32–48 days", bottomQ: "> 48 days", target: "< 42 days", description: "Segment-specific days sales outstanding measurement" },
    { name: "Roll Rate (30→60→90)", formula: "AR Moving to Next Bucket / AR in Current Bucket × 100", topQ: "< 6%", median: "6–12%", bottomQ: "> 12%", target: "< 10%", description: "Percentage of receivables migrating to older aging buckets" },
    { name: "Recovery Rate 90+ DPD", formula: "Cash Recovered from 90+ / Total 90+ Balance × 100", topQ: "≥ 30%", median: "15–29%", bottomQ: "< 15%", target: "20%", description: "Effectiveness of recovering severely delinquent balances" },
    { name: "Cost-to-Collect", formula: "Total Collections Dept Cost / Total Cash Collected × 100", topQ: "< 1.0%", median: "1.0–2.5%", bottomQ: "> 2.5%", target: "< 2.0%", description: "Operational efficiency of the collections function" },
    { name: "Dispute Resolution Cycle Time", formula: "Average Days from Dispute Open to Resolution", topQ: "< 12 days", median: "12–25 days", bottomQ: "> 25 days", target: "< 20 days", description: "Speed of resolving customer disputes blocking payment" },
  ],
  large: [
    { name: "Collection Effectiveness Index (CEI)", formula: "(Beginning AR + Credit Sales − Ending AR) / (Beginning AR + Credit Sales − Ending Current AR) × 100", topQ: "≥ 95%", median: "85–94%", bottomQ: "< 85%", target: "92%", description: "Measures efficiency of converting receivables to cash within period" },
    { name: "Right Party Contact Rate", formula: "Successful Contacts / Total Contact Attempts × 100", topQ: "≥ 85%", median: "65–84%", bottomQ: "< 65%", target: "75%", description: "Effectiveness of reaching decision-makers on collection calls" },
    { name: "PTP Conversion Rate", formula: "Kept Promises / Total Promises × 100", topQ: "≥ 90%", median: "75–89%", bottomQ: "< 75%", target: "85%", description: "Reliability of promise-to-pay commitments from customers" },
    { name: "DSO by Segment", formula: "(Segment AR Balance / Segment Credit Sales) × Days in Period", topQ: "< 30 days", median: "30–45 days", bottomQ: "> 45 days", target: "< 38 days", description: "Segment-specific days sales outstanding measurement" },
    { name: "Roll Rate (30→60→90)", formula: "AR Moving to Next Bucket / AR in Current Bucket × 100", topQ: "< 5%", median: "5–10%", bottomQ: "> 10%", target: "< 8%", description: "Percentage of receivables migrating to older aging buckets" },
    { name: "Recovery Rate 90+ DPD", formula: "Cash Recovered from 90+ / Total 90+ Balance × 100", topQ: "≥ 35%", median: "18–34%", bottomQ: "< 18%", target: "25%", description: "Effectiveness of recovering severely delinquent balances" },
    { name: "Cost-to-Collect", formula: "Total Collections Dept Cost / Total Cash Collected × 100", topQ: "< 0.7%", median: "0.7–2.0%", bottomQ: "> 2.0%", target: "< 1.5%", description: "Operational efficiency of the collections function" },
    { name: "Dispute Resolution Cycle Time", formula: "Average Days from Dispute Open to Resolution", topQ: "< 10 days", median: "10–20 days", bottomQ: "> 20 days", target: "< 15 days", description: "Speed of resolving customer disputes blocking payment" },
  ],
  global: [
    { name: "Collection Effectiveness Index (CEI)", formula: "(Beginning AR + Credit Sales − Ending AR) / (Beginning AR + Credit Sales − Ending Current AR) × 100", topQ: "≥ 96%", median: "88–95%", bottomQ: "< 88%", target: "93%", description: "Multi-entity, multi-currency collection efficiency" },
    { name: "Right Party Contact Rate", formula: "Successful Contacts / Total Contact Attempts × 100", topQ: "≥ 82%", median: "62–81%", bottomQ: "< 62%", target: "72%", description: "Cross-regional effectiveness of reaching decision-makers" },
    { name: "PTP Conversion Rate", formula: "Kept Promises / Total Promises × 100", topQ: "≥ 92%", median: "78–91%", bottomQ: "< 78%", target: "86%", description: "Multi-currency PTP reliability, FX-adjusted" },
    { name: "DSO by Segment/Region", formula: "(Segment AR Balance / Segment Credit Sales) × Days in Period", topQ: "< 28 days", median: "28–42 days", bottomQ: "> 42 days", target: "< 36 days", description: "Segment and region-specific DSO, FX-normalized" },
    { name: "Roll Rate (30→60→90)", formula: "AR Moving to Next Bucket / AR in Current Bucket × 100", topQ: "< 4%", median: "4–9%", bottomQ: "> 9%", target: "< 7%", description: "Multi-entity bucket migration, country risk adjusted" },
    { name: "Recovery Rate 90+ DPD", formula: "Cash Recovered from 90+ / Total 90+ Balance × 100", topQ: "≥ 38%", median: "20–37%", bottomQ: "< 20%", target: "28%", description: "Cross-jurisdiction recovery effectiveness" },
    { name: "Cost-to-Collect", formula: "Total Collections Dept Cost / Total Cash Collected × 100", topQ: "< 0.5%", median: "0.5–1.5%", bottomQ: "> 1.5%", target: "< 1.0%", description: "Global operational efficiency, FX-adjusted" },
    { name: "Dispute Resolution Cycle Time", formula: "Average Days from Dispute Open to Resolution", topQ: "< 8 days", median: "8–18 days", bottomQ: "> 18 days", target: "< 14 days", description: "Cross-entity dispute velocity, multi-jurisdiction" },
  ],
};

// ─── STYLES ───
const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`;

const baseStyles = {
  fontFamily: "'DM Sans', sans-serif",
  background: "#0B0F1A",
  color: "#E2E8F0",
  minHeight: "100vh",
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

// ─── COMPONENTS ───

function TierSelector({ tier, setTier }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#131829", borderRadius: 10, padding: 4 }}>
      {TIERS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTier(t.id)}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
            background: tier === t.id ? t.accent + "22" : "transparent",
            color: tier === t.id ? t.accent : "#64748B",
            boxShadow: tier === t.id ? `inset 0 0 0 1.5px ${t.accent}44` : "none",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TabBar({ tab, setTab, accent }) {
  return (
    <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
            background: tab === t.id ? accent + "18" : "transparent",
            color: tab === t.id ? accent : "#64748B",
            borderBottom: tab === t.id ? `2px solid ${accent}` : "2px solid transparent",
          }}
        >
          <span style={{ marginRight: 6 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#131829",
        borderRadius: 12,
        border: "1px solid #1E293B",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        background: color + "22",
        color: color,
        ...monoFont,
      }}
    >
      {text}
    </span>
  );
}

// ─── TAB 1: SEGMENTATION ENGINE ───
function SegmentationTab({ tier, accent }) {
  const segments = SEGMENTS[tier];
  const [selected, setSelected] = useState(0);
  const seg = segments[selected];

  // Dynamic segment scoring from live database
  const { invoices, disputes, collectionActivities, customers, derived, sopRegistry, gpoRules } = useMockDatabase()
  const segmentScores = useMemo(() => {
    const tierKey = { sme: 'Silver', mid: 'Gold', large: 'Platinum', global: 'Platinum' }
    const tierCustomers = customers.filter(c => c.tier === tierKey[tier])
    const tierInvoices = invoices.filter(inv => tierCustomers.some(c => c.id === inv.customerId))
    const tierDisputes = disputes.filter(d => tierCustomers.some(c => c.id === (d.customerId || d.customer)))
    const tierActivities = collectionActivities.filter(a => tierCustomers.some(c => c.id === a.customerId))

    return segments.map(seg => {
      const segCustomers = tierCustomers.filter(c => c.segment === 'Strategic')
      const segInvoices = invoices.filter(inv => segCustomers.some(c => c.id === inv.customerId))
      const segDisputes = disputes.filter(d => segCustomers.some(c => c.id === (d.customerId || d.customer)))

      const totalBalance = segInvoices.reduce((s, inv) => s + (inv.balance || 0), 0)
      const overdueCount = segInvoices.filter(inv => inv.status === 'unpaid' && inv.balance > 0).length
      const disputeCount = segDisputes.length
      const disputeRatio = segInvoices.length > 0 ? disputeCount / segInvoices.length : 0
      const totalActivities = tierActivities.length

      const monetaryScore = Math.min(100, Math.round(totalBalance / 10000))
      const frequencyScore = Math.min(100, Math.round(overdueCount * 15))
      const disputeScore = Math.min(100, Math.round(disputeRatio * 100))
      const recencyScore = segDisputes.length > 0 ? 60 : 95

      const composite = Math.round((monetaryScore * 0.25 + frequencyScore * 0.25 + (100 - disputeScore) * 0.30 + recencyScore * 0.20))
      return { ...seg, monetaryScore, frequencyScore, disputeScore, recencyScore, composite }
    })
  }, [tier, customers, invoices, disputes, collectionActivities])

  // Evaluate collections SOP rules from live invoice data for the selected segment
  const matchedRules = useMemo(() => {
    const segScore = segmentScores[selected]
    if (!segScore) return []
    const lowComposite = segScore.composite < 50
    const highDispute = segScore.disputeScore > 60
    const lowRecency = segScore.recencyScore < 70

    return evaluateRules(sopRegistry, 'collections', {
      earlyStage: segScore.composite >= 75,
      escalationDue: lowComposite || highDispute,
      dpdOver45: lowComposite,
      noPtp: lowRecency || highDispute,
    })
  }, [selected, segmentScores, sopRegistry])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.3</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Risk-Based Customer Segmentation Matrix</span>
      </div>

      {/* Segment selector pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {segments.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSelected(i)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: selected === i ? s.color + "22" : "#0B0F1A",
              color: selected === i ? s.color : "#64748B",
              boxShadow: selected === i ? `inset 0 0 0 1.5px ${s.color}66` : "inset 0 0 0 1px #1E293B",
              transition: "all 0.2s",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Portfolio distribution bar */}
      <Card>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Portfolio Distribution</div>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", gap: 2 }}>
          {segments.map((s, i) => (
            <div
              key={s.name}
              onClick={() => setSelected(i)}
              style={{
                flex: s.portfolioPct,
                background: selected === i ? s.color + "55" : s.color + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                border: selected === i ? `1.5px solid ${s.color}` : "1.5px solid transparent",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: s.color, ...monoFont }}>{s.portfolioPct}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          {segments.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: 10, color: "#94A3B8" }}>{s.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Live Segment Health Scores */}
      <Card style={{ borderColor: accent + '44' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Live Segment Health Scores
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {segmentScores.map(s => {
            const scoreColor = s.composite >= 75 ? '#10B981' : s.composite >= 50 ? '#F59E0B' : '#EF4444'
            return (
              <div key={s.name} style={{
                background: '#0B0F1A', borderRadius: 8, padding: '10px 12px',
                border: `1px solid ${selected === segments.indexOf(s) ? s.color + '44' : '#1E293B'}`,
                cursor: 'pointer'
              }} onClick={() => setSelected(segments.indexOf(s))}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor, ...monoFont }}>{s.composite}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <Badge text={`M:${s.monetaryScore}`} color="#6366F1" />
                  <Badge text={`F:${s.frequencyScore}`} color="#22D3EE" />
                  <Badge text={`D:${s.disputeScore}`} color="#F59E0B" />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 8, ...monoFont }}>
          Recency/Frequency/Monetary/Dispute composite · Higher = healthier
        </div>
      </Card>

      {/* Segment detail card */}
      <Card style={{ borderLeft: `3px solid ${seg.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: seg.color }}>{seg.name}</h3>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Badge text={`Risk: ${seg.risk}`} color={seg.risk === "High" ? "#EF4444" : seg.risk === "Medium" ? "#F59E0B" : seg.risk === "Low" ? "#10B981" : "#8B5CF6"} />
              <Badge text={`Exposure: ${seg.exposure}`} color={accent} />
              <Badge text={`Automation: ${seg.automation}`} color="#6366F1" />
            </div>
          </div>
          <div style={{ ...monoFont, fontSize: 28, fontWeight: 700, color: seg.color + "88" }}>{seg.portfolioPct}%</div>
        </div>

        {[
          { label: "Payment Behavior", value: seg.payBehavior },
          { label: "Collection Strategy", value: seg.strategy },
          { label: "Contact Cadence", value: seg.cadence },
          { label: "Escalation Path", value: seg.escalation },
          { label: "Credit Action", value: seg.creditAction },
        ].map((item) => (
          <div key={item.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>{item.value}</div>
          </div>
        ))}

        {matchedRules.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Active SOP Protocols</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {matchedRules.map(r => (
                <div key={r.id} style={{
                  background: "#0B0F1A", borderRadius: 6, padding: "6px 10px",
                  border: "1px solid #1E293B", fontSize: 11, color: "#CBD5E1"
                }}>
                  <span style={{ color: "#A855F7", fontWeight: 700, ...monoFont }}>{r.id}</span>
                  <span style={{ color: "#64748B", margin: "0 4px" }}>·</span>
                  {r.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── TAB 2: COLLECTIONS WORKFLOW ───
function WorkflowTab({ tier, accent }) {
  const steps = DUNNING_STEPS[tier];
  const [expandedStep, setExpandedStep] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.3</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Dunning Sequence & Escalation Matrix</span>
        <Badge text={`${steps.length} steps`} color={accent} />
      </div>

      {/* Tone legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(TONE_COLORS).map(([tone, color]) => (
          <div key={tone} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>{tone}</span>
          </div>
        ))}
      </div>

      {/* SOX compliance note */}
      <Card style={{ background: "#1a1520", borderColor: "#A855F733" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#A855F7", marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>SOX Compliance Note</div>
        <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>
          Credit hold activation requires segregation of duties: Collections requests → Credit approves → System enforces. Write-off authorization follows tiered approval matrix. All actions audit-logged with timestamp, user ID, and approval chain.
        </div>
      </Card>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: "#1E293B" }} />
        {steps.map((step, i) => {
          const toneColor = TONE_COLORS[step.tone] || "#64748B";
          const isExpanded = expandedStep === i;
          return (
            <div
              key={i}
              onClick={() => setExpandedStep(isExpanded ? null : i)}
              style={{ position: "relative", marginBottom: 8, cursor: "pointer" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -18,
                  top: 14,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: toneColor + "33",
                  border: `2px solid ${toneColor}`,
                  zIndex: 1,
                }}
              />
              <Card
                style={{
                  marginLeft: 8,
                  padding: "12px 16px",
                  borderLeft: `3px solid ${toneColor}`,
                  background: isExpanded ? "#1a1d2e" : "#131829",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: toneColor }}>Day {step.day}</span>
                      <Badge text={step.tone} color={toneColor} />
                      <span style={{ fontSize: 10, color: "#64748B", ...monoFont }}>{step.channel}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.4 }}>{step.action}</div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1E293B", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Responsible</span>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{step.role}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Target Segments</span>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{step.segment}</div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 3: WORKLIST OPTIMIZER ───
function WorklistTab({ tier, accent }) {
  const factorsData = WORKLIST_FACTORS[tier];
  const customers = SAMPLE_CUSTOMERS[tier];
  const [weights, setWeights] = useState(() => {
    const w = {};
    factorsData.forEach((f) => (w[f.id] = f.weight));
    return w;
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const rankedCustomers = useMemo(() => {
    return customers
      .map((c) => {
        let score = 0;
        factorsData.forEach((f) => {
          const raw = c[f.id] || 0;
          const normalizedWeight = weights[f.id] / (totalWeight || 1);
          score += raw * normalizedWeight;
        });
        return { ...c, score: Math.round(score * 10) / 10 };
      })
      .sort((a, b) => b.score - a.score);
  }, [weights, customers, factorsData, totalWeight]);

  const handleWeightChange = (id, val) => {
    setWeights((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const resetWeights = () => {
    const w = {};
    factorsData.forEach((f) => (w[f.id] = f.weight));
    setWeights(w);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.3</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Weighted Scoring Model — Collector Worklist Ranking</span>
        <Badge text={`${factorsData.length} factors`} color={accent} />
      </div>

      {/* Weight sliders */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase" }}>Factor Weights</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: totalWeight === 100 ? "#10B981" : "#F59E0B", ...monoFont, fontWeight: 600 }}>
              Total: {totalWeight}%{totalWeight !== 100 ? " ⚠" : " ✓"}
            </span>
            <button
              onClick={resetWeights}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #1E293B",
                background: "#0B0F1A",
                color: "#94A3B8",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {factorsData.map((f) => (
            <div key={f.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 500 }}>{f.name}</span>
                <span style={{ fontSize: 12, color: accent, ...monoFont, fontWeight: 600 }}>{weights[f.id]}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights[f.id]}
                  onChange={(e) => handleWeightChange(f.id, e.target.value)}
                  style={{ flex: 1, accentColor: accent, height: 4 }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{f.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ranked portfolio */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Sample Portfolio — Ranked by Score</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rankedCustomers.map((c, i) => {
            const maxScore = rankedCustomers[0]?.score || 1;
            const barPct = (c.score / maxScore) * 100;
            const priorityColor = i === 0 ? "#EF4444" : i === 1 ? "#F97316" : i === 2 ? "#F59E0B" : "#22D3EE";
            return (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 24, textAlign: "center" }}>
                  <span style={{ ...monoFont, fontSize: 14, fontWeight: 700, color: priorityColor }}>#{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{c.name}</span>
                    <span style={{ ...monoFont, fontSize: 13, fontWeight: 700, color: priorityColor }}>{c.score}</span>
                  </div>
                  <div style={{ height: 6, background: "#0B0F1A", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${barPct}%`,
                        background: `linear-gradient(90deg, ${priorityColor}44, ${priorityColor})`,
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 4: AGING STRATEGY MAP ───
function AgingTab({ tier, accent }) {
  const data = AGING_DATA[tier];
  const [selectedBucket, setSelectedBucket] = useState(0);
  const bucketColors = ["#10B981", "#22D3EE", "#F59E0B", "#F97316", "#EF4444"];
  const item = data[selectedBucket];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.3</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Aging Strategy Map — Actions by DPD Bucket</span>
      </div>

      {/* Aging bucket selector */}
      <div style={{ display: "flex", gap: 4 }}>
        {AGING_BUCKETS.map((b, i) => (
          <button
            key={b}
            onClick={() => setSelectedBucket(i)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: selectedBucket === i ? bucketColors[i] + "22" : "#0B0F1A",
              color: selectedBucket === i ? bucketColors[i] : "#64748B",
              boxShadow: selectedBucket === i ? `inset 0 0 0 1.5px ${bucketColors[i]}66` : "inset 0 0 0 1px #1E293B",
              transition: "all 0.2s",
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Risk escalation bar */}
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
        {bucketColors.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: selectedBucket >= i ? c : c + "22",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Strategy detail */}
      <Card style={{ borderLeft: `3px solid ${bucketColors[selectedBucket]}` }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: bucketColors[selectedBucket] }}>
          {item.bucket}
        </h3>

        {[
          { label: "Prescribed Actions", value: item.actions },
          { label: "Responsible Role(s)", value: item.role },
          { label: "Escalation Trigger", value: item.escalation },
          { label: "Provisioning Threshold", value: item.provision },
          { label: "Taxonomy Reference", value: item.taxonomyRef },
          { label: "Connected KPIs", value: item.kpi },
        ].map((row) => (
          <div key={row.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
            <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>{row.value}</div>
          </div>
        ))}
      </Card>

      {/* Cross-reference card */}
      <Card style={{ background: "#0f1520", borderColor: accent + "33" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Cross-References</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { ref: "1.1", desc: "Taxonomy L3/L4 codes" },
            { ref: "1.2", desc: "RACI role alignment" },
            { ref: "1.5", desc: "Dashboard aging widget" },
            { ref: "1.6", desc: "Maturity domain mapping" },
          ].map((x) => (
            <div key={x.ref} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge text={x.ref} color={accent} />
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{x.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 5: KPI SCORECARD ───
function KpiTab({ tier, accent }) {
  const live = useLiveActuals();
  const kpis = KPI_DATA[tier];
  const [expandedKpi, setExpandedKpi] = useState(null);

  const getBenchmarkColor = (label) => {
    if (label === "Top Quartile") return "#10B981";
    if (label === "Median") return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.3</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Collections-Specific KPI Scorecard</span>
        <Badge text={`${kpis.length} metrics`} color={accent} />
      </div>

      {/* Benchmark legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Top Quartile", color: "#10B981" },
          { label: "Median", color: "#F59E0B" },
          { label: "Bottom Quartile", color: "#EF4444" },
        ].map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: b.color + "33", border: `1.5px solid ${b.color}` }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{b.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: accent + "33", border: `1.5px solid ${accent}` }} />
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Tier Target</span>
        </div>
      </div>

      {/* KPI cards */}
      {kpis.map((kpi, i) => {
        const isExpanded = expandedKpi === i;
        return (
          <Card
            key={kpi.name}
            style={{ cursor: "pointer", transition: "all 0.2s", background: isExpanded ? "#1a1d2e" : "#131829" }}
          >
            <div onClick={() => setExpandedKpi(isExpanded ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{kpi.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{kpi.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge text={`Target: ${kpi.target}`} color={accent} />
                  {getKpiActual(kpi.name, live) && (
                    <span style={{ ...liveBadgeStyle() }}>● {getKpiActual(kpi.name, live)} LIVE</span>
                  )}
                </div>
              </div>

              {/* Benchmark bars */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {[
                  { label: "Top Quartile", value: kpi.topQ },
                  { label: "Median", value: kpi.median },
                  { label: "Bottom Quartile", value: kpi.bottomQ },
                ].map((b) => {
                  const c = getBenchmarkColor(b.label);
                  return (
                    <div key={b.label} style={{ background: c + "11", borderRadius: 8, padding: "8px 12px", border: `1px solid ${c}22` }}>
                      <div style={{ fontSize: 10, color: c, fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{b.label}</div>
                      <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600, ...monoFont }}>{b.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Formula</div>
                <div style={{ fontSize: 12, color: "#94A3B8", ...monoFont, lineHeight: 1.6, background: "#0B0F1A", padding: 12, borderRadius: 6 }}>
                  {kpi.formula}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ───
export default function CollectionsStrategyModel() {
  const [tier, setTier] = useState("sme");
  const [tab, setTab] = useState("segmentation");
  const accent = TIERS.find((t) => t.id === tier)?.accent || "#10B981";

  const renderTab = () => {
    switch (tab) {
      case "segmentation":
        return <SegmentationTab tier={tier} accent={accent} />;
      case "workflow":
        return <WorkflowTab tier={tier} accent={accent} />;
      case "worklist":
        return <WorklistTab tier={tier} accent={accent} key={tier} />;
      case "aging":
        return <AgingTab tier={tier} accent={accent} />;
      case "kpi":
        return <KpiTab tier={tier} accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div style={baseStyles}>
      <style>{fonts}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: accent, ...monoFont, fontWeight: 600, letterSpacing: 1 }}>DELIVERABLE 1.3</span>
            <span style={{ fontSize: 11, color: "#475569" }}>·</span>
            <span style={{ fontSize: 11, color: "#64748B", ...monoFont }}>OtC Consulting Toolkit — Phase 1</span>
          </div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: 26, fontWeight: 700, color: "#F8FAFC", letterSpacing: -0.5 }}>
            Collections Strategy & Segmentation Model
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
            Risk-based customer segmentation, dunning workflow design, worklist prioritization, aging strategy mapping, and collections KPI benchmarking.
          </p>
        </div>

        {/* Tier selector */}
        <div style={{ marginBottom: 16 }}>
          <TierSelector tier={tier} setTier={setTier} />
        </div>

        {/* Tab bar */}
        <div style={{ marginBottom: 20 }}>
          <TabBar tab={tab} setTab={setTab} accent={accent} />
        </div>

        {/* Tab content */}
        {renderTab()}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>APQC PCF 8.3.3 · Collections Strategy & Segmentation</span>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>OtC Consulting Toolkit v1.0</span>
        </div>
      </div>
    </div>
  );
}
