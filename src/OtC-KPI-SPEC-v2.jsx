import { useState, useMemo, useRef } from "react";
import { computeKPI, formatKPI } from "./kpiEngine";
import { useMockDatabase } from "./context/MockDatabaseContext";

const APQC_MAP = {
  "8.1": "Invoice-to-Cash",
  "8.2": "Revenue Accounting",
  "8.3": "Credit & Collections",
  "8.4": "Deductions & Disputes",
  "8.5": "Treasury & Cash Mgmt",
  "8.6": "Customer Master Data",
};

const PHASES = [
  { id: "P1", label: "Phase 1 — Foundations", color: "#6366f1" },
  { id: "P2", label: "Phase 2 — Optimization", color: "#06b6d4" },
  { id: "P3", label: "Phase 3 — Strategic Value", color: "#f59e0b" },
];

const TIERS = [
  { id: "T1", label: "Executive", desc: "Board / CFO / CRO — monthly or quarterly", color: "#ef4444" },
  { id: "T2", label: "Operational", desc: "Director / Manager — weekly or biweekly", color: "#f59e0b" },
  { id: "T3", label: "Analytical", desc: "Analyst / Team Lead — daily or continuous", color: "#22c55e" },
  { id: "T4", label: "Diagnostic", desc: "Assessment / Transformation — project-based", color: "#8b5cf6" },
];

const CATEGORIES = [
  "Invoicing & Billing",
  "Credit & Risk",
  "Collections & Cash App",
  "Deductions & Disputes",
  "Treasury & Working Capital",
  "Customer Onboarding & MDM",
  "Technology & Automation",
  "BPO & Managed Services",
  "Cross-Functional",
];

const KPIS = [
  // ── Invoicing & Billing ──
  { id: "K001", name: "Days Sales Outstanding (DSO)", category: "Invoicing & Billing", tier: "T1", phase: "P1", apqc: ["8.1"], unit: "days", direction: "lower", benchmark: { top: 28, median: 42, bottom: 60 }, formula: "(Ending AR / Revenue) × Days in Period", deliverables: ["1.1","1.2","3.3","3.5"], description: "Primary cash conversion efficiency metric. Measures average collection period from invoice date to payment receipt." },
  { id: "K002", name: "Invoice Accuracy Rate", category: "Invoicing & Billing", tier: "T2", phase: "P1", apqc: ["8.1"], unit: "%", direction: "higher", benchmark: { top: 99.5, median: 97, bottom: 93 }, formula: "(Invoices without errors / Total invoices) × 100", deliverables: ["1.1","3.1","3.2"], description: "Percentage of invoices issued without requiring correction. Directly impacts dispute volume and DSO." },
  { id: "K003", name: "Invoice Cycle Time", category: "Invoicing & Billing", tier: "T2", phase: "P1", apqc: ["8.1"], unit: "days", direction: "lower", benchmark: { top: 1, median: 3, bottom: 7 }, formula: "Avg(Invoice issue date − Delivery/milestone date)", deliverables: ["1.1","2.1"], description: "Time from delivery or milestone completion to invoice issuance. A key DSO input lever." },
  { id: "K004", name: "E-Invoicing Adoption Rate", category: "Invoicing & Billing", tier: "T3", phase: "P2", apqc: ["8.1"], unit: "%", direction: "higher", benchmark: { top: 95, median: 70, bottom: 40 }, formula: "(E-invoices / Total invoices) × 100", deliverables: ["2.1","3.4"], description: "Proportion of invoices delivered electronically. Reduces cycle time, postage cost, and lost invoice disputes." },
  { id: "K005", name: "Cost per Invoice", category: "Invoicing & Billing", tier: "T2", phase: "P2", apqc: ["8.1"], unit: "currency", direction: "lower", benchmark: { top: 2.5, median: 7, bottom: 15 }, formula: "Total invoicing costs / Invoices processed", deliverables: ["2.1","3.5","3.6"], description: "Fully loaded cost including labor, systems, postage, and overhead. Benchmark currency is USD." },
  { id: "K006", name: "First-Time Match Rate", category: "Invoicing & Billing", tier: "T3", phase: "P2", apqc: ["8.1"], unit: "%", direction: "higher", benchmark: { top: 92, median: 78, bottom: 60 }, formula: "(Auto-matched invoices / Total invoices) × 100", deliverables: ["2.1","2.4","3.4"], description: "Percentage of invoices matched to PO and receipt on first pass without manual intervention." },

  // ── Credit & Risk ──
  { id: "K010", name: "Bad Debt as % of Revenue", category: "Credit & Risk", tier: "T1", phase: "P1", apqc: ["8.3"], unit: "%", direction: "lower", benchmark: { top: 0.1, median: 0.5, bottom: 2.0 }, formula: "(Bad debt write-offs / Net revenue) × 100", deliverables: ["1.3","3.5"], description: "Ultimate credit risk outcome metric. Measures actual losses from uncollectible receivables." },
  { id: "K011", name: "Credit Review Cycle Time", category: "Credit & Risk", tier: "T2", phase: "P1", apqc: ["8.3","8.6"], unit: "days", direction: "lower", benchmark: { top: 1, median: 3, bottom: 7 }, formula: "Avg(Credit decision date − Application date)", deliverables: ["1.3","3.1"], description: "Time from credit application receipt to decision. Impacts onboarding speed and customer experience." },
  { id: "K012", name: "Credit Limit Utilization", category: "Credit & Risk", tier: "T2", phase: "P1", apqc: ["8.3"], unit: "%", direction: "monitor", benchmark: { top: 65, median: 75, bottom: 90 }, formula: "(Outstanding AR / Approved credit limit) × 100", deliverables: ["1.3","2.3"], description: "Measures how much of approved credit customers are using. Very high signals risk; very low signals overly conservative limits." },
  { id: "K013", name: "Auto-Approval Rate", category: "Credit & Risk", tier: "T3", phase: "P2", apqc: ["8.3"], unit: "%", direction: "higher", benchmark: { top: 70, median: 45, bottom: 20 }, formula: "(Auto-approved applications / Total applications) × 100", deliverables: ["2.3","3.1","3.4"], description: "Proportion of credit decisions made by automated rules without manual review. Indicator of process maturity and data quality." },

  // ── Collections & Cash Application ──
  { id: "K020", name: "Collection Effectiveness Index (CEI)", category: "Collections & Cash App", tier: "T1", phase: "P1", apqc: ["8.1","8.3"], unit: "%", direction: "higher", benchmark: { top: 98, median: 90, bottom: 78 }, formula: "(Beginning AR + Credit sales − Ending AR) / (Beginning AR + Credit sales − Ending current AR) × 100", deliverables: ["1.2","2.2"], description: "Measures how effectively collections convert receivables to cash relative to what's available to collect." },
  { id: "K021", name: "AR Aging > 90 Days (%)", category: "Collections & Cash App", tier: "T1", phase: "P1", apqc: ["8.1","8.3"], unit: "%", direction: "lower", benchmark: { top: 3, median: 10, bottom: 22 }, formula: "(AR > 90 days / Total AR) × 100", deliverables: ["1.2","3.3"], description: "Concentration of significantly overdue receivables. Leading indicator of bad debt risk and collection process health." },
  { id: "K022", name: "Cash Application Rate (Auto)", category: "Collections & Cash App", tier: "T2", phase: "P2", apqc: ["8.1"], unit: "%", direction: "higher", benchmark: { top: 90, median: 65, bottom: 35 }, formula: "(Auto-applied payments / Total payments) × 100", deliverables: ["2.4","3.4","3.5"], description: "Percentage of incoming payments automatically matched and posted without manual intervention." },
  { id: "K023", name: "Collector Productivity", category: "Collections & Cash App", tier: "T2", phase: "P2", apqc: ["8.3"], unit: "currency", direction: "higher", benchmark: { top: null, median: null, bottom: null }, formula: "Cash collected / FTE collectors", deliverables: ["2.2","3.6"], description: "Cash collected per FTE collector. Benchmark varies heavily by industry and average invoice size." },
  { id: "K024", name: "Promise-to-Pay Kept Rate", category: "Collections & Cash App", tier: "T3", phase: "P2", apqc: ["8.3"], unit: "%", direction: "higher", benchmark: { top: 85, median: 65, bottom: 45 }, formula: "(Promises honored / Promises made) × 100", deliverables: ["2.2","2.5"], description: "Percentage of customer payment commitments that result in actual payment by the promised date." },
  { id: "K025", name: "Average Days Delinquent (ADD)", category: "Collections & Cash App", tier: "T2", phase: "P1", apqc: ["8.3"], unit: "days", direction: "lower", benchmark: { top: 5, median: 15, bottom: 35 }, formula: "DSO − Best Possible DSO", deliverables: ["1.2","3.3"], description: "Gap between actual DSO and theoretical best DSO if all customers paid on terms. Measures pure collection inefficiency." },

  // ── Deductions & Disputes (Phase 3 — 3.2) ──
  { id: "K030", name: "Deduction Rate (% of Revenue)", category: "Deductions & Disputes", tier: "T1", phase: "P3", apqc: ["8.4"], unit: "%", direction: "lower", benchmark: { top: 0.5, median: 2.0, bottom: 5.0 }, formula: "(Total deductions taken / Gross revenue) × 100", deliverables: ["3.2","3.5"], description: "Overall deduction burden as proportion of revenue. Key metric for CPG/FMCG and retail-facing businesses." },
  { id: "K031", name: "Deduction Resolution Cycle Time", category: "Deductions & Disputes", tier: "T2", phase: "P3", apqc: ["8.4"], unit: "days", direction: "lower", benchmark: { top: 15, median: 35, bottom: 60 }, formula: "Avg(Resolution date − Deduction date)", deliverables: ["3.2"], description: "Average days from deduction identification to final resolution (approved, recovered, or written off)." },
  { id: "K032", name: "Invalid Deduction Recovery Rate", category: "Deductions & Disputes", tier: "T1", phase: "P3", apqc: ["8.4"], unit: "%", direction: "higher", benchmark: { top: 85, median: 60, bottom: 35 }, formula: "(Recovered invalid deductions / Total invalid deductions identified) × 100", deliverables: ["3.2","3.5"], description: "Percentage of invalid deductions successfully recovered. Directly impacts bottom line in deduction-heavy industries." },
  { id: "K033", name: "Deduction Write-Off Rate", category: "Deductions & Disputes", tier: "T2", phase: "P3", apqc: ["8.4"], unit: "%", direction: "lower", benchmark: { top: 5, median: 15, bottom: 30 }, formula: "(Deductions written off / Total deductions) × 100", deliverables: ["3.2"], description: "Proportion of deductions absorbed as a loss. High rates signal weak root cause analysis or recovery processes." },
  { id: "K034", name: "Trade Promotion Deduction Accuracy", category: "Deductions & Disputes", tier: "T3", phase: "P3", apqc: ["8.4"], unit: "%", direction: "higher", benchmark: { top: 95, median: 80, bottom: 60 }, formula: "(Valid trade deductions matching promo terms / Total trade deductions) × 100", deliverables: ["3.2"], description: "Measures alignment between retailer deductions and agreed promotion terms. Low accuracy drives dispute volume." },
  { id: "K035", name: "Dispute Volume Trend", category: "Deductions & Disputes", tier: "T3", phase: "P3", apqc: ["8.4","8.1"], unit: "count", direction: "lower", benchmark: { top: null, median: null, bottom: null }, formula: "New disputes opened per period (rolling 12-month trend)", deliverables: ["3.2","3.1"], description: "Tracks whether upstream fixes (invoicing accuracy, onboarding quality, promo management) are reducing dispute inflow." },
  { id: "K036", name: "Root Cause Concentration (Top 3)", category: "Deductions & Disputes", tier: "T3", phase: "P3", apqc: ["8.4"], unit: "%", direction: "monitor", benchmark: { top: null, median: null, bottom: null }, formula: "(Top 3 root cause deductions / Total deductions) × 100", deliverables: ["3.2"], description: "Measures how concentrated deduction causes are. High concentration enables targeted prevention programs." },

  // ── Treasury & Working Capital (Phase 3 — 3.3) ──
  { id: "K040", name: "Cash Conversion Cycle (CCC)", category: "Treasury & Working Capital", tier: "T1", phase: "P3", apqc: ["8.5"], unit: "days", direction: "lower", benchmark: { top: 25, median: 45, bottom: 75 }, formula: "DSO + DIO − DPO", deliverables: ["3.3","3.5"], description: "End-to-end cash cycle from inventory purchase to cash receipt. The master working capital efficiency metric." },
  { id: "K041", name: "Cash Forecast Accuracy (13-Week)", category: "Treasury & Working Capital", tier: "T1", phase: "P3", apqc: ["8.5"], unit: "%", direction: "higher", benchmark: { top: 95, median: 85, bottom: 70 }, formula: "1 − |Actual cash − Forecast cash| / |Actual cash| × 100", deliverables: ["3.3"], description: "Accuracy of 13-week rolling cash flow forecasts. Critical for liquidity management and investment decisions." },
  { id: "K042", name: "DSO by Customer Segment", category: "Treasury & Working Capital", tier: "T2", phase: "P3", apqc: ["8.5","8.1"], unit: "days", direction: "lower", benchmark: { top: null, median: null, bottom: null }, formula: "DSO calculated per customer tier/segment", deliverables: ["3.3","1.2"], description: "Breaks DSO into actionable segments (enterprise, mid-market, SMB, public sector). Reveals where collection delays concentrate." },
  { id: "K043", name: "Early Payment Discount Capture Rate", category: "Treasury & Working Capital", tier: "T2", phase: "P3", apqc: ["8.5"], unit: "%", direction: "higher", benchmark: { top: 80, median: 50, bottom: 20 }, formula: "(Invoices paid within discount window / Discount-eligible invoices) × 100", deliverables: ["3.3","3.5"], description: "How effectively the company captures available early payment discounts from suppliers (DPO side) or offers them to customers (DSO side)." },
  { id: "K044", name: "SCF Program Utilization", category: "Treasury & Working Capital", tier: "T2", phase: "P3", apqc: ["8.5"], unit: "%", direction: "higher", benchmark: { top: 60, median: 30, bottom: 10 }, formula: "(SCF-financed invoices / SCF-eligible invoices) × 100", deliverables: ["3.3"], description: "Adoption rate of supply chain finance programs. Low utilization means the program isn't delivering its working capital potential." },
  { id: "K045", name: "Free Cash Flow to Revenue", category: "Treasury & Working Capital", tier: "T1", phase: "P3", apqc: ["8.5"], unit: "%", direction: "higher", benchmark: { top: 15, median: 8, bottom: 2 }, formula: "(Operating cash flow − CapEx) / Revenue × 100", deliverables: ["3.3","3.5"], description: "Measures how efficiently revenue converts to distributable cash. Ultimate treasury outcome metric." },

  // ── Customer Onboarding & MDM (Phase 3 — 3.1) ──
  { id: "K050", name: "Onboarding Cycle Time", category: "Customer Onboarding & MDM", tier: "T2", phase: "P3", apqc: ["8.6"], unit: "days", direction: "lower", benchmark: { top: 2, median: 7, bottom: 21 }, formula: "Avg(Account active date − Request submission date)", deliverables: ["3.1"], description: "End-to-end time from customer onboarding request to fully active account with credit limit and ERP master data." },
  { id: "K051", name: "Master Data Accuracy Score", category: "Customer Onboarding & MDM", tier: "T2", phase: "P3", apqc: ["8.6"], unit: "%", direction: "higher", benchmark: { top: 99, median: 95, bottom: 88 }, formula: "(Fields passing validation / Total audited fields) × 100", deliverables: ["3.1","2.6"], description: "Quality score across the 24-field master data validation matrix. Directly prevents downstream invoicing and payment errors." },
  { id: "K052", name: "Duplicate Account Rate", category: "Customer Onboarding & MDM", tier: "T3", phase: "P3", apqc: ["8.6"], unit: "%", direction: "lower", benchmark: { top: 0.5, median: 3, bottom: 8 }, formula: "(Duplicate accounts identified / Total active accounts) × 100", deliverables: ["3.1","2.6"], description: "Prevalence of duplicate customer records. Causes split AR, credit limit circumvention, and reporting distortion." },
  { id: "K053", name: "KYC Compliance Rate", category: "Customer Onboarding & MDM", tier: "T2", phase: "P3", apqc: ["8.6","8.3"], unit: "%", direction: "higher", benchmark: { top: 100, median: 95, bottom: 85 }, formula: "(Accounts with complete KYC / Total active accounts) × 100", deliverables: ["3.1"], description: "Percentage of customer accounts meeting the applicable KYC tier requirements. Regulatory compliance and credit risk input." },
  { id: "K054", name: "Dispute Prevention Score", category: "Customer Onboarding & MDM", tier: "T3", phase: "P3", apqc: ["8.6","8.4"], unit: "points", direction: "higher", benchmark: { top: 90, median: 70, bottom: 50 }, formula: "Weighted score across 8 onboarding quality factors (100-point scale)", deliverables: ["3.1","3.2"], description: "Predictive score measuring how well the onboarding process prevents future disputes. Based on data quality, terms clarity, portal adoption, and credit setup." },

  // ── Technology & Automation (Phase 3 — 3.4) ──
  { id: "K060", name: "Straight-Through Processing Rate", category: "Technology & Automation", tier: "T1", phase: "P2", apqc: ["8.1","8.3"], unit: "%", direction: "higher", benchmark: { top: 80, median: 55, bottom: 30 }, formula: "(Transactions requiring zero manual touch / Total transactions) × 100", deliverables: ["2.1","3.4","3.5"], description: "The ultimate automation metric — percentage of OtC transactions processed end-to-end without human intervention." },
  { id: "K061", name: "System Integration Completeness", category: "Technology & Automation", tier: "T4", phase: "P3", apqc: ["8.1","8.5"], unit: "%", direction: "higher", benchmark: { top: 90, median: 65, bottom: 40 }, formula: "(Integrated data flows / Required data flows per architecture spec) × 100", deliverables: ["3.4"], description: "Percentage of the 8 specified integration data flows that are fully operational. Measures technical architecture health." },
  { id: "K062", name: "RFP Score Variance", category: "Technology & Automation", tier: "T4", phase: "P3", apqc: ["8.1"], unit: "%", direction: "lower", benchmark: { top: null, median: null, bottom: null }, formula: "StdDev of evaluator scores / Mean score × 100", deliverables: ["3.4"], description: "Measures evaluator alignment during vendor selection. High variance signals unclear criteria or misaligned stakeholders." },
  { id: "K063", name: "Total Cost of Ownership (TCO) Variance", category: "Technology & Automation", tier: "T4", phase: "P3", apqc: ["8.1"], unit: "%", direction: "lower", benchmark: { top: 5, median: 15, bottom: 30 }, formula: "(Actual TCO − Projected TCO) / Projected TCO × 100", deliverables: ["3.4","3.5"], description: "Post-implementation measure of how well TCO projections held. Informs future business case credibility." },

  // ── BPO & Managed Services (Phase 3 — 3.6) ──
  { id: "K070", name: "BPO Cost per Transaction", category: "BPO & Managed Services", tier: "T2", phase: "P3", apqc: ["8.1","8.3"], unit: "currency", direction: "lower", benchmark: { top: null, median: null, bottom: null }, formula: "Total BPO cost / Transactions processed by BPO", deliverables: ["3.6","3.5"], description: "Unit economics of outsourced processes. Must be compared against in-house cost per transaction for valid assessment." },
  { id: "K071", name: "BPO SLA Compliance Rate", category: "BPO & Managed Services", tier: "T2", phase: "P3", apqc: ["8.1"], unit: "%", direction: "higher", benchmark: { top: 98, median: 92, bottom: 85 }, formula: "(SLA targets met / Total SLA targets measured) × 100", deliverables: ["3.6"], description: "Percentage of the 17-metric SLA framework targets being met by the BPO provider. Triggers governance escalation at thresholds." },
  { id: "K072", name: "Transition Risk Score", category: "BPO & Managed Services", tier: "T4", phase: "P3", apqc: ["8.1"], unit: "score", direction: "lower", benchmark: { top: null, median: null, bottom: null }, formula: "Weighted risk register score (8 risk items × likelihood × impact)", deliverables: ["3.6"], description: "Aggregate risk score during BPO transition phases. Tracked against the 8-item risk register with mitigation status." },
  { id: "K073", name: "Retained Org Efficiency", category: "BPO & Managed Services", tier: "T2", phase: "P3", apqc: ["8.1"], unit: "ratio", direction: "higher", benchmark: { top: null, median: null, bottom: null }, formula: "Processes governed / Retained FTEs", deliverables: ["3.6"], description: "Measures whether the retained organization (6 roles / 4 FTEs) is scaled appropriately for the governance workload." },

  // ── Cross-Functional ──
  { id: "K080", name: "OtC Maturity Score", category: "Cross-Functional", tier: "T4", phase: "P1", apqc: ["8.1","8.3","8.5","8.6"], unit: "level", direction: "higher", benchmark: { top: 4.5, median: 3.0, bottom: 1.5 }, formula: "Weighted average across maturity dimensions (1-5 scale)", deliverables: ["1.6","3.5"], description: "Composite maturity assessment across all OtC process areas. Input to transformation roadmap prioritization." },
  { id: "K081", name: "OtC FTE per $B Revenue", category: "Cross-Functional", tier: "T1", phase: "P2", apqc: ["8.1","8.3"], unit: "FTEs", direction: "lower", benchmark: { top: 30, median: 55, bottom: 90 }, formula: "Total OtC FTEs / (Annual revenue / 1B)", deliverables: ["2.5","3.5","3.6"], description: "Staffing efficiency metric normalized to revenue. Key benchmarking KPI across APQC and Hackett peer groups." },
  { id: "K082", name: "Total OtC Cost as % of Revenue", category: "Cross-Functional", tier: "T1", phase: "P1", apqc: ["8.1","8.3","8.5"], unit: "%", direction: "lower", benchmark: { top: 0.3, median: 0.6, bottom: 1.2 }, formula: "(Total OtC operating costs / Net revenue) × 100", deliverables: ["1.1","3.5","3.6"], description: "Fully loaded OtC process cost including people, technology, and third-party services. The headline efficiency metric." },
  { id: "K083", name: "Customer Satisfaction (OtC-related)", category: "Cross-Functional", tier: "T1", phase: "P2", apqc: ["8.1","8.6"], unit: "score", direction: "higher", benchmark: { top: 4.5, median: 3.5, bottom: 2.5 }, formula: "Survey score (1-5) across billing, collections, dispute, and portal experience", deliverables: ["2.5","3.1"], description: "Customer perception of the OtC experience. Covers invoice clarity, payment ease, dispute handling, and portal usability." },
  { id: "K084", name: "Process Automation Coverage", category: "Cross-Functional", tier: "T2", phase: "P2", apqc: ["8.1","8.3","8.5"], unit: "%", direction: "higher", benchmark: { top: 75, median: 45, bottom: 20 }, formula: "(Automated process steps / Total process steps) × 100", deliverables: ["2.1","3.4","3.5"], description: "Breadth of automation across the OtC process map. Distinct from STP rate which measures transaction-level throughput." },
];

const DELIVERABLE_MAP = {
  "1.1": "Process Map & Gap Analysis",
  "1.2": "AR Aging & Collections",
  "1.3": "Credit Risk Framework",
  "1.4": "Dunning Strategy",
  "1.5": "Cash Application",
  "1.6": "Maturity Assessment",
  "2.1": "Invoice Optimization",
  "2.2": "Collections Optimization",
  "2.3": "Credit Automation",
  "2.4": "Cash App Automation",
  "2.5": "Performance Management",
  "2.6": "Data Quality & MDM",
  "3.1": "Customer Onboarding",
  "3.2": "Deductions Management",
  "3.3": "Treasury & Working Capital",
  "3.4": "Technology Selection",
  "3.5": "Business Case Builder",
  "3.6": "BPO Evaluation",
};

function getPhaseColor(p) {
  return PHASES.find(x => x.id === p)?.color || "#888";
}
function getTierObj(t) {
  return TIERS.find(x => x.id === t);
}

function DirectionBadge({ dir }) {
  const map = {
    higher: { label: "↑ Higher is better", bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
    lower: { label: "↓ Lower is better", bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    monitor: { label: "◉ Monitor range", bg: "rgba(234,179,8,0.15)", color: "#eab308" },
  };
  const d = map[dir] || map.monitor;
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: d.bg, color: d.color, fontWeight: 600 }}>{d.label}</span>;
}

function BenchmarkBar({ benchmark, unit }) {
  if (!benchmark.top && !benchmark.median) return <span style={{ color: "#666", fontSize: 12 }}>Industry-specific — no universal benchmark</span>;
  const vals = [benchmark.top, benchmark.median, benchmark.bottom].filter(v => v != null);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pct = v => ((v - min) / range) * 100;

  return (
    <div style={{ position: "relative", height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, right: 0, background: "linear-gradient(90deg, rgba(34,197,94,0.12) 0%, rgba(234,179,8,0.12) 50%, rgba(239,68,68,0.12) 100%)", borderRadius: 6 }} />
      {benchmark.top != null && (
        <div style={{ position: "absolute", left: `${pct(benchmark.top)}%`, top: 2, bottom: 2, width: 2, background: "#22c55e", borderRadius: 1 }}>
          <span style={{ position: "absolute", top: -1, left: 6, fontSize: 10, color: "#22c55e", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{benchmark.top}{unit === "%" ? "%" : ""}</span>
        </div>
      )}
      {benchmark.median != null && (
        <div style={{ position: "absolute", left: `${pct(benchmark.median)}%`, top: 2, bottom: 2, width: 2, background: "#eab308", borderRadius: 1 }}>
          <span style={{ position: "absolute", top: -1, left: 6, fontSize: 10, color: "#eab308", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{benchmark.median}{unit === "%" ? "%" : ""}</span>
        </div>
      )}
      {benchmark.bottom != null && (
        <div style={{ position: "absolute", left: `${pct(benchmark.bottom)}%`, top: 2, bottom: 2, width: 2, background: "#ef4444", borderRadius: 1 }}>
          <span style={{ position: "absolute", bottom: -1, left: 6, fontSize: 10, color: "#ef4444", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{benchmark.bottom}{unit === "%" ? "%" : ""}</span>
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi, onClose }) {
  const tier = getTierObj(kpi.tier);
  const ctx = useMockDatabase();
  const live = ctx && ctx.engineDb ? computeKPI(kpi.id, ctx.engineDb) : null;
  const liveText = live && live.computable ? (typeof live.value === "object" ? null : formatKPI(live)) : null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, maxWidth: 620, width: "90%", maxHeight: "85vh", overflow: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#666" }}>{kpi.id}</span>
            <h2 style={{ margin: "4px 0 8px", fontSize: 22, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.3 }}>{kpi.name}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${getPhaseColor(kpi.phase)}22`, color: getPhaseColor(kpi.phase), fontWeight: 600 }}>{kpi.phase}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${tier.color}22`, color: tier.color, fontWeight: 600 }}>{tier.label}</span>
              <DirectionBadge dir={kpi.direction} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 24, cursor: "pointer", padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{kpi.description}</p>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>Formula</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#e0e0e0", lineHeight: 1.6 }}>{kpi.formula}</div>
        </div>

        {liveText && (
          <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#34D399", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              ● Live Actual <span style={{ color: "#666", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— computed from seeded data by this formula</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#fff", fontWeight: 700 }}>{liveText}</div>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Benchmarks</div>
          <BenchmarkBar benchmark={kpi.benchmark} unit={kpi.unit} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#666" }}>
            <span>● Top quartile</span><span>● Median</span><span>● Bottom quartile</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>APQC Process</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {kpi.apqc.map(a => <span key={a} style={{ fontSize: 12, color: "#bbb" }}>{a} — {APQC_MAP[a]}</span>)}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Reporting</div>
            <div style={{ fontSize: 12, color: "#bbb" }}>Unit: <span style={{ color: "#f0f0f0", fontFamily: "'JetBrains Mono', monospace" }}>{kpi.unit}</span></div>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>Cadence: <span style={{ color: "#f0f0f0" }}>{tier.desc.split("—")[1]?.trim()}</span></div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Toolkit Cross-References</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {kpi.deliverables.map(d => (
              <span key={d} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: d.startsWith("3") ? "rgba(245,158,11,0.12)" : d.startsWith("2") ? "rgba(6,182,212,0.12)" : "rgba(99,102,241,0.12)", color: d.startsWith("3") ? "#f59e0b" : d.startsWith("2") ? "#06b6d4" : "#6366f1", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>
                {d} {DELIVERABLE_MAP[d]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KPISpec() {
  const [search, setSearch] = useState("");
  const [selPhase, setSelPhase] = useState("ALL");
  const [selTier, setSelTier] = useState("ALL");
  const [selCategory, setSelCategory] = useState("ALL");
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [view, setView] = useState("grid"); // grid | table | matrix
  const headerRef = useRef(null);

  const filtered = useMemo(() => {
    return KPIS.filter(k => {
      if (selPhase !== "ALL" && k.phase !== selPhase) return false;
      if (selTier !== "ALL" && k.tier !== selTier) return false;
      if (selCategory !== "ALL" && k.category !== selCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        return k.name.toLowerCase().includes(s) || k.id.toLowerCase().includes(s) || k.description.toLowerCase().includes(s) || k.category.toLowerCase().includes(s);
      }
      return true;
    });
  }, [search, selPhase, selTier, selCategory]);

  const stats = useMemo(() => {
    const byPhase = {};
    const byTier = {};
    const byCat = {};
    KPIS.forEach(k => {
      byPhase[k.phase] = (byPhase[k.phase] || 0) + 1;
      byTier[k.tier] = (byTier[k.tier] || 0) + 1;
      byCat[k.category] = (byCat[k.category] || 0) + 1;
    });
    return { byPhase, byTier, byCat, total: KPIS.length };
  }, []);

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e0e0e0",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1e", color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div ref={headerRef} style={{ padding: "32px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6366f1", fontWeight: 600, letterSpacing: 1 }}>P4.4</span>
            <span style={{ fontSize: 12, color: "#444" }}>|</span>
            <span style={{ fontSize: 12, color: "#666" }}>APQC 8.1–8.6</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 8px", background: "linear-gradient(135deg, #6366f1, #06b6d4, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            OtC KPI Specification
          </h1>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>{stats.total} metrics across {CATEGORIES.length} categories — Phases 1–3 complete</p>

          {/* Summary tiles */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            {PHASES.map(p => (
              <div key={p.id} style={{ background: `${p.color}11`, border: `1px solid ${p.color}33`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setSelPhase(selPhase === p.id ? "ALL" : p.id)}>
                <div style={{ fontSize: 20, fontWeight: 700, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{stats.byPhase[p.id] || 0}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{p.id} KPIs</div>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
              {["grid", "table", "matrix"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: view === v ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6, color: view === v ? "#6366f1" : "#666", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search KPIs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...selectStyle, flex: "1 1 200px", minWidth: 180 }}
          />
          <select value={selPhase} onChange={e => setSelPhase(e.target.value)} style={selectStyle}>
            <option value="ALL">All Phases</option>
            {PHASES.map(p => <option key={p.id} value={p.id}>{p.label} ({stats.byPhase[p.id]})</option>)}
          </select>
          <select value={selTier} onChange={e => setSelTier(e.target.value)} style={selectStyle}>
            <option value="ALL">All Tiers</option>
            {TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({stats.byTier[t.id]})</option>)}
          </select>
          <select value={selCategory} onChange={e => setSelCategory(e.target.value)} style={selectStyle}>
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c} ({stats.byCat[c]})</option>)}
          </select>
          <span style={{ fontSize: 13, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length} shown</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {view === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340, 1fr))", gap: 14 }}>
            {filtered.map(kpi => {
              const tier = getTierObj(kpi.tier);
              return (
                <div
                  key={kpi.id}
                  onClick={() => setSelectedKPI(kpi)}
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s", borderLeft: `3px solid ${getPhaseColor(kpi.phase)}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#555" }}>{kpi.id}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: `${tier.color}22`, color: tier.color, fontWeight: 600 }}>{tier.label.charAt(0)}</span>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: `${getPhaseColor(kpi.phase)}22`, color: getPhaseColor(kpi.phase), fontWeight: 600 }}>{kpi.phase}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0", marginBottom: 6, lineHeight: 1.3 }}>{kpi.name}</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{kpi.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <DirectionBadge dir={kpi.direction} />
                    <span style={{ fontSize: 11, color: "#555" }}>{kpi.unit}</span>
                  </div>
                  <BenchmarkBar benchmark={kpi.benchmark} unit={kpi.unit} />
                </div>
              );
            })}
          </div>
        )}

        {view === "table" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["ID", "KPI", "Category", "Phase", "Tier", "Unit", "Direction", "Top Q", "Median", "Bottom Q"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(kpi => {
                  const tier = getTierObj(kpi.tier);
                  return (
                    <tr key={kpi.id} onClick={() => setSelectedKPI(kpi)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666" }}>{kpi.id}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#f0f0f0", maxWidth: 260 }}>{kpi.name}</td>
                      <td style={{ padding: "10px 12px", color: "#aaa", fontSize: 12 }}>{kpi.category}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: `${getPhaseColor(kpi.phase)}22`, color: getPhaseColor(kpi.phase), fontWeight: 600 }}>{kpi.phase}</span></td>
                      <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: `${tier.color}22`, color: tier.color, fontWeight: 600 }}>{tier.label}</span></td>
                      <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#aaa" }}>{kpi.unit}</td>
                      <td style={{ padding: "10px 12px" }}><DirectionBadge dir={kpi.direction} /></td>
                      <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#22c55e" }}>{kpi.benchmark.top ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#eab308" }}>{kpi.benchmark.median ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ef4444" }}>{kpi.benchmark.bottom ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {view === "matrix" && (
          <div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Category × Tier matrix — cell count shows KPI density. Click any cell to filter.</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", fontSize: 11, color: "#888", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Category</th>
                    {TIERS.map(t => (
                      <th key={t.id} style={{ padding: "10px 14px", fontSize: 11, color: t.color, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", minWidth: 90 }}>{t.label}</th>
                    ))}
                    <th style={{ padding: "10px 14px", fontSize: 11, color: "#888", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => {
                    const catKpis = KPIS.filter(k => k.category === cat);
                    return (
                      <tr key={cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#ccc", fontWeight: 500 }}>{cat}</td>
                        {TIERS.map(t => {
                          const count = catKpis.filter(k => k.tier === t.id).length;
                          return (
                            <td key={t.id} style={{ padding: "10px 14px", textAlign: "center" }}>
                              {count > 0 ? (
                                <span
                                  onClick={() => { setSelCategory(cat); setSelTier(t.id); setView("grid"); }}
                                  style={{ display: "inline-block", width: 32, height: 32, lineHeight: "32px", borderRadius: 8, background: `${t.color}${Math.min(15 + count * 12, 40).toString(16)}`, color: t.color, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "transform 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                >{count}</span>
                              ) : (
                                <span style={{ color: "#333", fontSize: 12 }}>—</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#888", fontWeight: 600 }}>{catKpis.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>∅</div>
            <div style={{ fontSize: 15 }}>No KPIs match the current filters</div>
            <button onClick={() => { setSearch(""); setSelPhase("ALL"); setSelTier("ALL"); setSelCategory("ALL"); }} style={{ marginTop: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#6366f1", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Reset filters</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedKPI && <KPICard kpi={selectedKPI} onClose={() => setSelectedKPI(null)} />}
    </div>
  );
}
