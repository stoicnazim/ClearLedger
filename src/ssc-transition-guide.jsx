import { useState } from "react";

/* ─────────────────────────────────────────────
   2.6 — Shared Services Transition Guide
   OtC Consulting Toolkit · Phase 2
   ───────────────────────────────────────────── */

const TIERS = [
  { key: "sme", label: "SME", accent: "#22D3EE", desc: "< $50M Rev · 1–2 Entities" },
  { key: "mid", label: "Mid-Market", accent: "#A78BFA", desc: "$50M–$500M · 3–10 Entities" },
  { key: "enterprise", label: "Enterprise", accent: "#F472B6", desc: "$500M–$5B · 10–50 Entities" },
  { key: "global", label: "Global MNC", accent: "#FB923C", desc: "$5B+ · 50+ Entities" },
];

const TABS = [
  { key: "sipoc", label: "SIPOC", icon: "◈" },
  { key: "roadmap", label: "Transition Roadmap", icon: "◆" },
  { key: "raci", label: "RACI & Governance", icon: "◇" },
  { key: "sla", label: "SLA & KT Playbook", icon: "◉" },
  { key: "kpi", label: "KPI Scorecard", icon: "◎" },
];

/* ── SIPOC DATA ─────────────────────────────── */
const SIPOC_DATA = {
  sme: {
    suppliers: [
      { name: "AR Operations Team", pcf: "10940" },
      { name: "IT Support", pcf: "10854" },
      { name: "Finance Leadership", pcf: "10820" },
      { name: "External Accountants", pcf: "—" },
    ],
    inputs: [
      "Current-state process documentation",
      "AR aging reports & reconciliation files",
      "Staff skill inventory",
      "IT systems inventory (ERP, email-based AR)",
      "Customer master data",
    ],
    process: [
      { step: "P1", name: "Assess & Scope", desc: "Baseline current AR ops, identify consolidation candidates" },
      { step: "P2", name: "Design Target Model", desc: "Define single-site shared service scope & org chart" },
      { step: "P3", name: "Build & Configure", desc: "Standardize processes, configure ERP workflows" },
      { step: "P4", name: "Knowledge Transfer", desc: "Buddy-based KT with desktop procedures" },
      { step: "P5", name: "Go-Live & Stabilize", desc: "Cutover with hypercare support (4 weeks)" },
    ],
    outputs: [
      "Centralized AR function",
      "Standardized SOPs (→ Ref 1.2)",
      "Unified collections strategy (→ Ref 1.3)",
      "Basic SLA framework",
      "Post-migration performance baseline",
    ],
    customers: [
      { name: "CFO / Finance Director", pcf: "10820" },
      { name: "Business Unit Leads", pcf: "—" },
      { name: "External Customers", pcf: "—" },
      { name: "External Auditors", pcf: "10943" },
    ],
  },
  mid: {
    suppliers: [
      { name: "AR Operations (multi-site)", pcf: "10940" },
      { name: "IT / ERP Team", pcf: "10854" },
      { name: "HR / Talent Management", pcf: "10800" },
      { name: "Finance Leadership", pcf: "10820" },
      { name: "Procurement (vendor mgmt)", pcf: "10765" },
      { name: "External Consultants", pcf: "—" },
    ],
    inputs: [
      "Multi-entity process maps & variations",
      "FTE allocation data per entity",
      "ERP configuration documentation",
      "Historical KPI data (→ Ref 1.5)",
      "Credit policies per entity (→ Ref 2.1)",
      "Regulatory requirements per jurisdiction (→ Ref 1.4)",
    ],
    process: [
      { step: "P1", name: "Assess & Business Case", desc: "Multi-entity baseline, cost-benefit analysis, stakeholder alignment" },
      { step: "P2", name: "Design SSC Model", desc: "Hub location selection, org design, technology blueprint" },
      { step: "P3", name: "Standardize & Build", desc: "Process harmonization across entities, shared ERP instance config" },
      { step: "P4", name: "Wave 1 Migration", desc: "Pilot entity migration with full KT cycle" },
      { step: "P5", name: "Wave 2–3 Migration", desc: "Remaining entities with lessons-learned refinement" },
      { step: "P6", name: "Stabilize & Optimize", desc: "Hypercare (8 weeks), SLA enforcement, continuous improvement" },
    ],
    outputs: [
      "Regional SSC with 3–10 entities migrated",
      "Harmonized process library (→ Ref 1.1)",
      "Tiered SLA framework",
      "SSC governance charter",
      "Retained organization design",
      "Performance dashboard (→ Ref 1.5)",
    ],
    customers: [
      { name: "CFO / VP Finance", pcf: "10820" },
      { name: "Entity Controllers", pcf: "10825" },
      { name: "Business Unit GMs", pcf: "—" },
      { name: "External Customers", pcf: "—" },
      { name: "Internal Audit", pcf: "10943" },
      { name: "External Auditors", pcf: "10943" },
    ],
  },
  enterprise: {
    suppliers: [
      { name: "Regional AR Teams (multi-geo)", pcf: "10940" },
      { name: "Global IT / ERP CoE", pcf: "10854" },
      { name: "HR / Global Mobility", pcf: "10800" },
      { name: "Finance Transformation Office", pcf: "10820" },
      { name: "Procurement / Vendor Mgmt", pcf: "10765" },
      { name: "Legal / Compliance", pcf: "10955" },
      { name: "External Advisors (Big 4)", pcf: "—" },
      { name: "BPO Partners", pcf: "—" },
    ],
    inputs: [
      "Global process inventory with regional variants",
      "FTE data across all locations",
      "Multi-ERP landscape documentation",
      "SOX control matrices (→ Ref 2.4)",
      "E-invoicing compliance status (→ Ref 1.4)",
      "Credit policies & risk segmentation (→ Ref 1.3, 2.1)",
      "Labor arbitrage analysis",
      "Real estate / facilities data",
    ],
    process: [
      { step: "P1", name: "Strategic Assessment", desc: "Global baseline, operating model options, business case with NPV" },
      { step: "P2", name: "Target Operating Model", desc: "Multi-hub design, retained vs. shared vs. outsourced split, technology roadmap" },
      { step: "P3", name: "Standardize & Harmonize", desc: "Global process standards, ERP template, control framework alignment" },
      { step: "P4", name: "Pilot Hub Launch", desc: "First SSC hub go-live with 3–5 entities" },
      { step: "P5", name: "Wave Migrations (3–5)", desc: "Phased geographic rollout with 5–10 entities per wave" },
      { step: "P6", name: "BPO Integration", desc: "Hybrid insource/outsource model for transactional processes" },
      { step: "P7", name: "Optimize & Scale", desc: "Automation layer, analytics, COE establishment" },
    ],
    outputs: [
      "Multi-hub SSC / hybrid model",
      "Global process standards library",
      "SOX-compliant control framework (→ Ref 2.4)",
      "Tiered SLA architecture",
      "SSC governance & escalation framework",
      "Retained org with COE functions",
      "Automation roadmap (→ Ref 2.5)",
      "Steady-state KPI framework (→ Ref 1.5)",
    ],
    customers: [
      { name: "Global CFO / Group Treasurer", pcf: "10820" },
      { name: "Regional Finance Directors", pcf: "10825" },
      { name: "Business Unit Presidents", pcf: "—" },
      { name: "SSC Managing Director", pcf: "—" },
      { name: "Internal Audit", pcf: "10943" },
      { name: "External Auditors", pcf: "10943" },
      { name: "Regulators", pcf: "10955" },
    ],
  },
  global: {
    suppliers: [
      { name: "Global AR Operations (all regions)", pcf: "10940" },
      { name: "Global IT / Digital CoE", pcf: "10854" },
      { name: "Global HR / Talent & Mobility", pcf: "10800" },
      { name: "GBS Transformation Office", pcf: "10820" },
      { name: "Global Procurement", pcf: "10765" },
      { name: "Legal / Compliance / Regulatory", pcf: "10955" },
      { name: "Big 4 Advisory & SI Partners", pcf: "—" },
      { name: "Strategic BPO Partners", pcf: "—" },
      { name: "Technology Vendors (RPA, AI/ML)", pcf: "—" },
      { name: "Data & Analytics CoE", pcf: "10860" },
    ],
    inputs: [
      "Global process inventory with 50+ entity variants",
      "FTE & cost data across all hubs & entities",
      "Multi-ERP / multi-instance landscape",
      "SOX & local statutory control requirements (→ Ref 2.4)",
      "E-invoicing mandates across 22 jurisdictions (→ Ref 1.4)",
      "Credit risk frameworks & portfolio analytics (→ Ref 1.3, 2.1)",
      "Process mining event logs (→ Ref 2.5)",
      "Labor arbitrage models (5+ geographies)",
      "M&A integration backlog",
      "Global real estate & facilities portfolio",
    ],
    process: [
      { step: "P1", name: "Strategic Vision & Business Case", desc: "Board-level GBS business case with 5-year NPV, benchmarking against peers" },
      { step: "P2", name: "Global Operating Model Design", desc: "Multi-hub GBS with COEs, retained/shared/outsourced/automated decision matrix" },
      { step: "P3", name: "Global Standards & ERP Template", desc: "Single global process standard, ERP golden template, control framework" },
      { step: "P4", name: "Anchor Hub Launch", desc: "Primary GBS hub go-live (largest volume entities)" },
      { step: "P5", name: "Regional Hub Rollouts (3–5)", desc: "Secondary hubs with follow-the-sun model" },
      { step: "P6", name: "Wave Migrations (6–10)", desc: "Phased entity migrations with M&A integration overlay" },
      { step: "P7", name: "BPO & Automation Layer", desc: "Strategic outsourcing + RPA + AI/ML for touchless processing" },
      { step: "P8", name: "COE Maturation", desc: "Analytics COE, Process Excellence COE, Technology COE" },
      { step: "P9", name: "Continuous Transformation", desc: "Ongoing optimization, new capability onboarding, GBS scope expansion" },
    ],
    outputs: [
      "Multi-hub Global GBS with follow-the-sun coverage",
      "Global process standards (500+ SOPs)",
      "SOX & statutory control framework (→ Ref 2.4)",
      "Enterprise SLA architecture with penalty/bonus",
      "GBS governance with executive steering committee",
      "Retained org with strategic finance roles only",
      "Intelligent automation layer (60%+ touchless)",
      "Process mining continuous monitoring (→ Ref 2.5)",
      "Real-time KPI framework (→ Ref 1.5)",
      "GBS P&L and chargeback model",
    ],
    customers: [
      { name: "Group CFO / Board Finance Committee", pcf: "10820" },
      { name: "Regional CFOs", pcf: "10825" },
      { name: "Business Unit CEOs", pcf: "—" },
      { name: "GBS CEO / Managing Director", pcf: "—" },
      { name: "Group Internal Audit", pcf: "10943" },
      { name: "External Auditors (Big 4)", pcf: "10943" },
      { name: "Regulators (multi-jurisdictional)", pcf: "10955" },
      { name: "Institutional Investors / Rating Agencies", pcf: "—" },
    ],
  },
};

/* ── ROADMAP DATA ───────────────────────────── */
const ROADMAP_DATA = {
  sme: {
    totalWeeks: 16,
    waves: [
      {
        name: "Wave 1: Full Migration",
        entities: "All AR (1–2 entities)",
        phases: [
          { name: "Assess & Scope", start: 0, duration: 3, color: "#22D3EE" },
          { name: "Design Target Model", start: 3, duration: 3, color: "#34D399" },
          { name: "Build & Configure", start: 6, duration: 3, color: "#A78BFA" },
          { name: "Knowledge Transfer", start: 9, duration: 3, color: "#F472B6" },
          { name: "Go-Live & Stabilize", start: 12, duration: 4, color: "#FB923C" },
        ],
      },
    ],
    milestones: [
      { week: 3, label: "Baseline Complete" },
      { week: 6, label: "TOM Approved" },
      { week: 12, label: "Go-Live" },
      { week: 16, label: "Hypercare End" },
    ],
  },
  mid: {
    totalWeeks: 32,
    waves: [
      {
        name: "Wave 1: Pilot (2–3 entities)",
        entities: "Largest entities by volume",
        phases: [
          { name: "Assess & Business Case", start: 0, duration: 4, color: "#A78BFA" },
          { name: "Design SSC Model", start: 4, duration: 4, color: "#34D399" },
          { name: "Standardize & Build", start: 8, duration: 4, color: "#22D3EE" },
          { name: "Migration & KT", start: 12, duration: 4, color: "#F472B6" },
          { name: "Stabilize", start: 16, duration: 4, color: "#FB923C" },
        ],
      },
      {
        name: "Wave 2: Remaining (4–7 entities)",
        entities: "Remaining entities",
        phases: [
          { name: "Prep & Adapt", start: 18, duration: 3, color: "#A78BFA" },
          { name: "Migration & KT", start: 21, duration: 5, color: "#F472B6" },
          { name: "Stabilize & Optimize", start: 26, duration: 6, color: "#FB923C" },
        ],
      },
    ],
    milestones: [
      { week: 4, label: "Business Case Approved" },
      { week: 8, label: "SSC Model Signed Off" },
      { week: 16, label: "Wave 1 Go-Live" },
      { week: 21, label: "Wave 2 Migration Start" },
      { week: 32, label: "Full Steady State" },
    ],
  },
  enterprise: {
    totalWeeks: 52,
    waves: [
      {
        name: "Wave 1: Pilot Hub (3–5 entities)",
        entities: "Primary geography, high-volume entities",
        phases: [
          { name: "Strategic Assessment", start: 0, duration: 6, color: "#F472B6" },
          { name: "TOM Design", start: 6, duration: 6, color: "#34D399" },
          { name: "Standardize & Build", start: 12, duration: 6, color: "#22D3EE" },
          { name: "Pilot Migration & KT", start: 18, duration: 6, color: "#A78BFA" },
          { name: "Stabilize", start: 24, duration: 4, color: "#FB923C" },
        ],
      },
      {
        name: "Wave 2: Expansion (5–10 entities)",
        entities: "Adjacent geographies",
        phases: [
          { name: "Prep & Localize", start: 26, duration: 4, color: "#F472B6" },
          { name: "Migration & KT", start: 30, duration: 6, color: "#A78BFA" },
          { name: "Stabilize", start: 36, duration: 4, color: "#FB923C" },
        ],
      },
      {
        name: "Wave 3–5: Full Scale (remaining)",
        entities: "All remaining entities + BPO integration",
        phases: [
          { name: "Rolling Migration", start: 38, duration: 8, color: "#A78BFA" },
          { name: "BPO Integration", start: 42, duration: 6, color: "#34D399" },
          { name: "Optimize & COE Setup", start: 46, duration: 6, color: "#22D3EE" },
        ],
      },
    ],
    milestones: [
      { week: 6, label: "Business Case (Board)" },
      { week: 12, label: "TOM Approved" },
      { week: 24, label: "Hub 1 Go-Live" },
      { week: 36, label: "Wave 2 Stable" },
      { week: 52, label: "Full Operational" },
    ],
  },
  global: {
    totalWeeks: 78,
    waves: [
      {
        name: "Wave 1: Anchor Hub (5–8 entities)",
        entities: "Primary hub — highest volume geography",
        phases: [
          { name: "Strategic Vision & Board Case", start: 0, duration: 8, color: "#FB923C" },
          { name: "Global TOM Design", start: 8, duration: 8, color: "#34D399" },
          { name: "Global Standards & Template", start: 16, duration: 8, color: "#22D3EE" },
          { name: "Anchor Hub Migration", start: 24, duration: 8, color: "#A78BFA" },
          { name: "Stabilize Anchor", start: 32, duration: 4, color: "#F472B6" },
        ],
      },
      {
        name: "Wave 2–3: Regional Hubs (10–15 entities)",
        entities: "Secondary hubs — EMEA, APAC, Americas",
        phases: [
          { name: "Hub Setup & Localize", start: 34, duration: 6, color: "#FB923C" },
          { name: "Regional Migrations", start: 40, duration: 10, color: "#A78BFA" },
          { name: "Stabilize", start: 50, duration: 4, color: "#F472B6" },
        ],
      },
      {
        name: "Wave 4–6: Full Rollout (remaining)",
        entities: "Long-tail entities, M&A integrations",
        phases: [
          { name: "Rolling Migrations", start: 50, duration: 10, color: "#A78BFA" },
          { name: "BPO & Automation Layer", start: 54, duration: 10, color: "#34D399" },
          { name: "COE Maturation", start: 60, duration: 10, color: "#22D3EE" },
        ],
      },
      {
        name: "Continuous Transformation",
        entities: "GBS-wide scope expansion & optimization",
        phases: [
          { name: "Intelligent Automation", start: 64, duration: 8, color: "#FB923C" },
          { name: "Continuous Optimization", start: 70, duration: 8, color: "#F472B6" },
        ],
      },
    ],
    milestones: [
      { week: 8, label: "Board Approval" },
      { week: 16, label: "Global TOM Signed" },
      { week: 32, label: "Anchor Hub Live" },
      { week: 50, label: "Regional Hubs Live" },
      { week: 64, label: "Full Migration" },
      { week: 78, label: "GBS Mature State" },
    ],
  },
};

/* ── RACI DATA ──────────────────────────────── */
const RACI_ROLES = {
  sme: ["Finance Dir.", "AR Lead", "IT Support", "Ext. Advisor"],
  mid: ["VP Finance", "SSC Manager", "AR Leads", "IT/ERP Lead", "HR Lead", "Ext. Consultant"],
  enterprise: ["Global CFO", "SSC MD", "Regional FDs", "Transition PMO", "IT CoE", "HR/Mobility", "Legal", "BPO Partner"],
  global: ["Group CFO", "GBS CEO", "Regional CFOs", "Transformation Office", "IT/Digital CoE", "HR/Global Mobility", "Legal/Compliance", "BPO Partners", "Analytics CoE", "Steering Committee"],
};

const RACI_ACTIVITIES = {
  sme: [
    { activity: "Business Case Development", pcf: "10820", raci: ["A", "R", "C", "C"] },
    { activity: "Target Operating Model Design", pcf: "10820", raci: ["A", "R", "C", "R"] },
    { activity: "Process Standardization (→1.1)", pcf: "10940", raci: ["A", "R", "I", "C"] },
    { activity: "ERP Configuration", pcf: "10854", raci: ["I", "C", "R", "C"] },
    { activity: "Knowledge Transfer", pcf: "10940", raci: ["I", "R", "C", "I"] },
    { activity: "Go-Live Cutover", pcf: "10940", raci: ["A", "R", "R", "C"] },
    { activity: "SLA Monitoring", pcf: "10943", raci: ["A", "R", "I", "I"] },
    { activity: "SOX Compliance (→2.4)", pcf: "10943", raci: ["A", "R", "C", "R"] },
  ],
  mid: [
    { activity: "Business Case & NPV", pcf: "10820", raci: ["A", "R", "C", "C", "I", "C"] },
    { activity: "SSC Location Selection", pcf: "10820", raci: ["A", "R", "I", "C", "R", "C"] },
    { activity: "TOM Design", pcf: "10820", raci: ["A", "R", "C", "R", "C", "R"] },
    { activity: "Process Harmonization (→1.1)", pcf: "10940", raci: ["I", "A", "R", "C", "I", "C"] },
    { activity: "ERP Template Build", pcf: "10854", raci: ["I", "C", "C", "A/R", "I", "I"] },
    { activity: "Talent Assessment & Transition", pcf: "10800", raci: ["I", "C", "C", "I", "A/R", "I"] },
    { activity: "Wave 1 Migration", pcf: "10940", raci: ["I", "A", "R", "R", "C", "C"] },
    { activity: "Wave 2–3 Migration", pcf: "10940", raci: ["I", "A", "R", "R", "C", "I"] },
    { activity: "SLA Framework & Enforcement", pcf: "10943", raci: ["A", "R", "C", "C", "I", "C"] },
    { activity: "SOX Controls Transition (→2.4)", pcf: "10943", raci: ["A", "R", "C", "R", "I", "C"] },
  ],
  enterprise: [
    { activity: "Board Business Case", pcf: "10820", raci: ["A", "R", "C", "R", "C", "I", "C", "C"] },
    { activity: "Multi-Hub TOM Design", pcf: "10820", raci: ["A", "R", "C", "R", "R", "C", "C", "C"] },
    { activity: "Global Process Standards (→1.1)", pcf: "10940", raci: ["I", "A", "C", "R", "C", "I", "I", "C"] },
    { activity: "ERP Golden Template", pcf: "10854", raci: ["I", "C", "C", "C", "A/R", "I", "I", "I"] },
    { activity: "Retained Org Design", pcf: "10800", raci: ["A", "C", "C", "R", "I", "R", "C", "I"] },
    { activity: "Pilot Hub Migration", pcf: "10940", raci: ["I", "A", "R", "R", "R", "C", "C", "C"] },
    { activity: "BPO Selection & Integration", pcf: "10765", raci: ["A", "R", "I", "R", "C", "I", "R", "R"] },
    { activity: "SOX Framework Migration (→2.4)", pcf: "10943", raci: ["A", "R", "C", "R", "C", "I", "R", "C"] },
    { activity: "Automation Roadmap (→2.5)", pcf: "10854", raci: ["I", "A", "I", "R", "R", "I", "I", "C"] },
    { activity: "Steady-State Governance", pcf: "10820", raci: ["A", "R", "C", "R", "C", "I", "C", "C"] },
  ],
  global: [
    { activity: "GBS Vision & Board Approval", pcf: "10820", raci: ["A", "R", "C", "R", "C", "I", "C", "I", "C", "R"] },
    { activity: "Global Operating Model Design", pcf: "10820", raci: ["A", "R", "C", "R", "R", "C", "C", "C", "C", "A"] },
    { activity: "Global Process Standards (→1.1)", pcf: "10940", raci: ["I", "A", "C", "R", "C", "I", "I", "C", "R", "I"] },
    { activity: "ERP Golden Template & Integration", pcf: "10854", raci: ["I", "C", "I", "C", "A/R", "I", "I", "I", "C", "I"] },
    { activity: "Global Talent Strategy", pcf: "10800", raci: ["C", "A", "C", "R", "I", "R", "C", "C", "I", "I"] },
    { activity: "Anchor Hub Launch", pcf: "10940", raci: ["I", "A", "C", "R", "R", "R", "C", "C", "C", "I"] },
    { activity: "Regional Hub Rollouts", pcf: "10940", raci: ["I", "A", "R", "R", "R", "R", "R", "C", "C", "I"] },
    { activity: "Strategic BPO Partnerships", pcf: "10765", raci: ["A", "R", "I", "R", "C", "I", "R", "R", "I", "I"] },
    { activity: "Intelligent Automation Layer", pcf: "10854", raci: ["I", "A", "I", "R", "R", "I", "I", "R", "R", "I"] },
    { activity: "SOX & Statutory Controls (→2.4)", pcf: "10943", raci: ["A", "R", "C", "R", "C", "I", "R", "C", "C", "I"] },
    { activity: "Process Mining Ops (→2.5)", pcf: "10860", raci: ["I", "C", "I", "R", "C", "I", "I", "I", "A/R", "I"] },
    { activity: "GBS P&L & Chargeback Model", pcf: "10820", raci: ["A", "R", "C", "R", "C", "I", "C", "I", "R", "R"] },
    { activity: "Exec Steering & Governance", pcf: "10820", raci: ["R", "R", "C", "R", "C", "I", "C", "I", "C", "A"] },
  ],
};

const GOVERNANCE_STRUCTURES = {
  sme: {
    title: "Lean Governance",
    bodies: [
      { name: "Weekly Transition Standup", members: "Finance Dir. + AR Lead + IT", freq: "Weekly", purpose: "Track progress, resolve blockers" },
      { name: "Monthly Sponsor Review", members: "Finance Director", freq: "Monthly", purpose: "Budget, timeline, risk decisions" },
    ],
  },
  mid: {
    title: "Structured Governance",
    bodies: [
      { name: "Transition Steering Committee", members: "VP Finance + SSC Mgr + BU Leads", freq: "Bi-weekly", purpose: "Strategic decisions, scope changes, escalations" },
      { name: "Migration Working Group", members: "SSC Mgr + AR Leads + IT/ERP", freq: "Weekly", purpose: "Execution tracking, issue resolution" },
      { name: "Change Management Forum", members: "HR + SSC Mgr + Comms", freq: "Weekly", purpose: "People impact, communications, training" },
    ],
  },
  enterprise: {
    title: "Multi-Layer Governance",
    bodies: [
      { name: "Executive Steering Committee", members: "CFO + SSC MD + Regional FDs + CIO", freq: "Monthly", purpose: "Strategic direction, investment decisions, escalations" },
      { name: "Transition Program Board", members: "PMO + SSC MD + Workstream Leads", freq: "Bi-weekly", purpose: "Cross-workstream coordination, dependency management" },
      { name: "Migration Control Board", members: "PMO + Entity Leads + IT + HR", freq: "Weekly", purpose: "Wave readiness, go/no-go, cutover management" },
      { name: "Change Network", members: "Change Champions per entity", freq: "Weekly", purpose: "Local engagement, feedback loop, adoption tracking" },
      { name: "SOX Compliance Board (→2.4)", members: "Internal Audit + SSC MD + Legal", freq: "Monthly", purpose: "Control transition oversight, audit readiness" },
    ],
  },
  global: {
    title: "Enterprise-Grade GBS Governance",
    bodies: [
      { name: "GBS Board / Exec Steering", members: "Group CFO + GBS CEO + Regional CFOs + CIO + CHRO", freq: "Monthly", purpose: "GBS strategy, P&L, scope expansion, M&A integration" },
      { name: "Transformation Office", members: "Transformation Lead + Workstream Directors", freq: "Weekly", purpose: "Program-level orchestration, risk management, dependencies" },
      { name: "Regional Migration Boards", members: "Regional CFO + Hub Lead + PMO", freq: "Bi-weekly", purpose: "Regional wave execution, localization decisions" },
      { name: "Technology Governance Council", members: "CIO + IT CoE + Analytics CoE + Vendors", freq: "Bi-weekly", purpose: "ERP template, automation roadmap, integration architecture" },
      { name: "People & Change Committee", members: "CHRO + Global Mobility + Change Leads", freq: "Weekly", purpose: "Talent transitions, retention, culture, communications" },
      { name: "SOX & Compliance Board (→2.4)", members: "Internal Audit + Legal + GBS CEO", freq: "Monthly", purpose: "Control framework migration, regulatory compliance" },
      { name: "Vendor & Partner Governance", members: "Procurement + BPO Partners + GBS CEO", freq: "Monthly", purpose: "BPO performance, contract management, SLA enforcement" },
      { name: "Continuous Improvement Council", members: "Process Excellence COE + Analytics COE", freq: "Monthly", purpose: "Optimization pipeline, process mining insights (→2.5), automation candidates" },
    ],
  },
};

/* ── SLA DATA ───────────────────────────────── */
const SLA_DATA = {
  sme: {
    slas: [
      { process: "Cash Application (→1.2)", metric: "Same-day cash application rate", target: "≥ 85%", measurement: "Weekly", penalty: "—" },
      { process: "Collections (→1.3)", metric: "Dunning cycle adherence", target: "100% on-schedule", measurement: "Weekly", penalty: "—" },
      { process: "Invoice Processing (→2.3)", metric: "Invoice issuance within 24h of delivery", target: "≥ 90%", measurement: "Weekly", penalty: "—" },
      { process: "Customer Inquiries", metric: "Response within 48h", target: "≥ 90%", measurement: "Weekly", penalty: "—" },
      { process: "Month-End Close Support", metric: "AR reconciliation by WD3", target: "100%", measurement: "Monthly", penalty: "—" },
    ],
    ktFramework: {
      approach: "Buddy-Based Transfer",
      phases: [
        { name: "Document", duration: "2 weeks", desc: "Desktop procedures for all AR tasks", gate: "100% SOPs documented" },
        { name: "Shadow", duration: "2 weeks", desc: "SSC staff shadows current performers", gate: "All processes observed" },
        { name: "Reverse Shadow", duration: "2 weeks", desc: "SSC staff performs with current staff oversight", gate: "95% accuracy on test transactions" },
        { name: "Independent", duration: "2 weeks", desc: "SSC staff performs independently with escalation path", gate: "No critical errors in 5 consecutive days" },
      ],
    },
  },
  mid: {
    slas: [
      { process: "Cash Application (→1.2)", metric: "Same-day application rate", target: "≥ 90%", measurement: "Weekly", penalty: "SLA credit 2%" },
      { process: "Collections (→1.3)", metric: "Contact rate on past-due accounts", target: "≥ 95%", measurement: "Weekly", penalty: "SLA credit 3%" },
      { process: "Invoice Accuracy (→2.3)", metric: "First-time-right invoice rate", target: "≥ 97%", measurement: "Monthly", penalty: "SLA credit 2%" },
      { process: "Dispute Resolution (→2.2)", metric: "Resolution within 15 business days", target: "≥ 85%", measurement: "Monthly", penalty: "SLA credit 3%" },
      { process: "Credit Decisions (→2.1)", metric: "New credit within 3 business days", target: "≥ 90%", measurement: "Monthly", penalty: "SLA credit 2%" },
      { process: "Customer Inquiries", metric: "Response within 24h", target: "≥ 95%", measurement: "Weekly", penalty: "SLA credit 1%" },
      { process: "Month-End Close", metric: "AR sub-ledger close by WD2", target: "100%", measurement: "Monthly", penalty: "SLA credit 5%" },
      { process: "Reporting", metric: "Aging report by WD1", target: "100%", measurement: "Monthly", penalty: "SLA credit 2%" },
    ],
    ktFramework: {
      approach: "Structured KT Program",
      phases: [
        { name: "Process Discovery", duration: "3 weeks", desc: "Detailed process mapping with variations per entity", gate: "Process maps validated by entity leads" },
        { name: "Documentation", duration: "3 weeks", desc: "SOPs, exception handling guides, system guides", gate: "100% SOPs reviewed & approved" },
        { name: "Classroom Training", duration: "2 weeks", desc: "Instructor-led training on processes & systems", gate: "All SSC staff pass knowledge assessment (≥80%)" },
        { name: "Shadow Phase", duration: "3 weeks", desc: "SSC staff shadows per wave entity", gate: "Sign-off per process per person" },
        { name: "Reverse Shadow", duration: "3 weeks", desc: "SSC performs, entity staff validates", gate: "≤ 5% error rate on live transactions" },
        { name: "Controlled Go-Live", duration: "2 weeks", desc: "SSC independent with rapid escalation", gate: "SLA targets met for 10 consecutive days" },
      ],
    },
  },
  enterprise: {
    slas: [
      { process: "Cash Application (→1.2)", metric: "Same-day application rate", target: "≥ 93%", measurement: "Daily", penalty: "Service credits + escalation" },
      { process: "Collections (→1.3)", metric: "Promise-to-pay conversion rate", target: "≥ 40%", measurement: "Weekly", penalty: "Service credits 3%" },
      { process: "Invoice Processing (→2.3)", metric: "Touchless invoice rate", target: "≥ 70%", measurement: "Weekly", penalty: "Service credits 2%" },
      { process: "Dispute Resolution (→2.2)", metric: "Resolution < 10 BD (non-complex)", target: "≥ 90%", measurement: "Weekly", penalty: "Service credits 3%" },
      { process: "Credit Management (→2.1)", metric: "Credit review within SLA", target: "≥ 95%", measurement: "Monthly", penalty: "Service credits 2%" },
      { process: "E-Invoicing Compliance (→1.4)", metric: "Compliant invoice rate", target: "≥ 99%", measurement: "Daily", penalty: "Regulatory risk escalation" },
      { process: "SOX Controls (→2.4)", metric: "Control execution on time", target: "100%", measurement: "Per period", penalty: "Audit finding escalation" },
      { process: "Month-End Close", metric: "AR close by WD1", target: "100%", measurement: "Monthly", penalty: "Service credits 5%" },
      { process: "Reporting & Analytics", metric: "Dashboard refresh by 9am local", target: "100%", measurement: "Daily", penalty: "Service credits 1%" },
      { process: "Customer Satisfaction", metric: "Internal NPS ≥ 7", target: "≥ 7.0", measurement: "Quarterly", penalty: "Remediation plan required" },
    ],
    ktFramework: {
      approach: "Wave-Based KT with Readiness Gates",
      phases: [
        { name: "Process Discovery & Mining (→2.5)", duration: "4 weeks", desc: "Process mining to identify variants, automation candidates", gate: "Variant map and automation shortlist approved" },
        { name: "Global SOP Development", duration: "4 weeks", desc: "Global standard SOPs with regional supplements", gate: "SOPs approved by process owner & compliance" },
        { name: "Training Program Build", duration: "3 weeks", desc: "E-learning modules, system simulations, assessment bank", gate: "Training content peer-reviewed" },
        { name: "Cohort Training", duration: "3 weeks/wave", desc: "Blended learning: e-learning + instructor-led + lab", gate: "All staff ≥ 85% on assessments" },
        { name: "Shadow (In-hub)", duration: "3 weeks/wave", desc: "SSC staff shadows via screen share or on-site", gate: "Process sign-off matrix complete" },
        { name: "Reverse Shadow", duration: "3 weeks/wave", desc: "SSC performs with entity oversight", gate: "Error rate ≤ 3%, SLA preview met" },
        { name: "Parallel Run", duration: "2 weeks/wave", desc: "Dual processing with reconciliation", gate: "Zero material discrepancies" },
        { name: "Cutover & Hypercare", duration: "4 weeks/wave", desc: "Full cutover with on-site/virtual support pod", gate: "SLA targets met for 15 consecutive days" },
      ],
    },
  },
  global: {
    slas: [
      { process: "Cash Application (→1.2)", metric: "Same-day application rate", target: "≥ 95%", measurement: "Real-time", penalty: "Tiered credits + exec escalation" },
      { process: "Collections (→1.3)", metric: "Risk-adjusted collection effectiveness", target: "≥ 85% CEI", measurement: "Weekly", penalty: "Tiered credits + quarterly review" },
      { process: "Invoice Processing (→2.3)", metric: "Touchless invoice rate", target: "≥ 85%", measurement: "Daily", penalty: "Tiered credits 3%" },
      { process: "Dispute Resolution (→2.2)", metric: "Complex dispute < 20 BD", target: "≥ 90%", measurement: "Weekly", penalty: "Tiered credits + root cause req." },
      { process: "Credit Management (→2.1)", metric: "Portfolio ECL accuracy (→IFRS 9)", target: "±5% variance", measurement: "Monthly", penalty: "Regulatory risk escalation" },
      { process: "E-Invoicing (→1.4)", metric: "Multi-jurisdiction compliance", target: "100% (22 jurisdictions)", measurement: "Real-time", penalty: "Regulatory penalty passthrough" },
      { process: "SOX & Statutory (→2.4)", metric: "Zero material weaknesses", target: "0 findings", measurement: "Per audit cycle", penalty: "Board-level escalation" },
      { process: "Month-End Close", metric: "Global AR close by WD1 (follow-the-sun)", target: "100%", measurement: "Monthly", penalty: "Tiered credits 5%" },
      { process: "Real-Time Analytics", metric: "Dashboard uptime & refresh", target: "99.5% / 15min", measurement: "Continuous", penalty: "Credits + tech escalation" },
      { process: "Automation Rate", metric: "Touchless processing rate", target: "≥ 60%", measurement: "Monthly", penalty: "Automation investment trigger" },
      { process: "Process Conformance (→2.5)", metric: "Process mining conformance score", target: "≥ 90%", measurement: "Weekly", penalty: "Process remediation required" },
      { process: "Customer Experience", metric: "End-customer NPS impact", target: "No degradation vs. baseline", measurement: "Quarterly", penalty: "Remediation + investment" },
    ],
    ktFramework: {
      approach: "Global KT Academy with Regional Hubs",
      phases: [
        { name: "Global KT Academy Build", duration: "6 weeks", desc: "Centralized LMS, simulation environments, certification paths", gate: "Academy platform live, content library complete" },
        { name: "Process Mining Baseline (→2.5)", duration: "4 weeks/hub", desc: "Event log extraction, variant analysis, to-be process confirmation", gate: "Process conformance targets set per hub" },
        { name: "Regional Trainer Certification", duration: "3 weeks/hub", desc: "Train-the-trainer for regional hub leads", gate: "All trainers certified ≥ 90%" },
        { name: "Cohort Certification", duration: "4 weeks/wave", desc: "Multi-track certification: process, systems, compliance, analytics", gate: "100% staff certified before go-live" },
        { name: "Immersive Shadow", duration: "4 weeks/wave", desc: "On-site immersion at source entity (funded travel)", gate: "Process sign-off + cultural integration assessment" },
        { name: "Simulated Operations", duration: "2 weeks/wave", desc: "Full simulation with synthetic data, SLA measurement", gate: "SLA targets met in simulation for 5 consecutive days" },
        { name: "Parallel Run", duration: "3 weeks/wave", desc: "Dual processing with automated reconciliation", gate: "Zero material discrepancies, <1% variance" },
        { name: "Controlled Cutover", duration: "2 weeks/wave", desc: "Phased cutover by process, not big-bang", gate: "Each process stream meeting SLA independently" },
        { name: "Hypercare & Transition", duration: "6 weeks/wave", desc: "Dedicated support pod with daily SLA reviews", gate: "20 consecutive days at full SLA, support pod drawdown approved" },
      ],
    },
  },
};

/* ── KPI DATA ───────────────────────────────── */
const KPI_DATA = {
  sme: [
    { kpi: "Migration On-Time Delivery", formula: "Actual go-live date vs. plan", target: "0 days variance", benchmark: "APQC: 78% on-time", category: "Transition" },
    { kpi: "Migration Cost vs. Budget", formula: "Actual cost / Budgeted cost", target: "≤ 105%", benchmark: "Hackett: Median 112%", category: "Transition" },
    { kpi: "Knowledge Transfer Completion", formula: "Processes signed off / Total processes", target: "100%", benchmark: "—", category: "Transition" },
    { kpi: "FTE Productivity (Post-Migration)", formula: "Invoices processed / AR FTE", target: "≥ Pre-migration baseline", benchmark: "APQC: Median 7,500/FTE", category: "Operational" },
    { kpi: "Error Rate (First 90 Days)", formula: "Errors / Total transactions", target: "≤ 2%", benchmark: "Hackett: Top quartile < 1%", category: "Operational" },
    { kpi: "SLA Achievement Rate", formula: "SLAs met / Total SLAs", target: "≥ 90%", benchmark: "Hackett: Top quartile 95%", category: "Operational" },
    { kpi: "Employee Retention (SSC)", formula: "SSC staff retained at 6mo / Starting headcount", target: "≥ 85%", benchmark: "SSON: Median 80%", category: "People" },
    { kpi: "Stakeholder Satisfaction", formula: "Survey score (1–5)", target: "≥ 3.5", benchmark: "SSON: Median 3.2", category: "People" },
  ],
  mid: [
    { kpi: "Migration On-Time Delivery", formula: "Waves delivered on schedule / Total waves", target: "≥ 90%", benchmark: "APQC: 78% on-time", category: "Transition" },
    { kpi: "Migration Cost vs. Budget", formula: "Actual / Budget (including change requests)", target: "≤ 110%", benchmark: "Hackett: Median 112%", category: "Transition" },
    { kpi: "Business Case Realization", formula: "Actual savings / Projected savings at 12mo", target: "≥ 70%", benchmark: "Hackett: Median 65%", category: "Transition" },
    { kpi: "Process Standardization Rate", formula: "Processes on global standard / Total", target: "≥ 80%", benchmark: "APQC: Top quartile 85%", category: "Transition" },
    { kpi: "Cost per Invoice (→1.5)", formula: "Total AR cost / Invoices processed", target: "≤ $5.00", benchmark: "APQC: Median $6.40", category: "Operational" },
    { kpi: "DSO Impact", formula: "Post-migration DSO vs. baseline", target: "No degradation, then -2 days/yr", benchmark: "APQC: Median 38 days", category: "Operational" },
    { kpi: "SLA Achievement Rate", formula: "SLAs met / Total SLAs measured", target: "≥ 92%", benchmark: "Hackett: Top quartile 95%", category: "Operational" },
    { kpi: "Automation Rate", formula: "Auto-processed transactions / Total", target: "≥ 30%", benchmark: "Hackett: Top quartile 50%", category: "Operational" },
    { kpi: "Attrition Rate (SSC)", formula: "Annual voluntary turnover in SSC", target: "≤ 15%", benchmark: "SSON: Median 18%", category: "People" },
    { kpi: "Internal Customer NPS", formula: "Net Promoter Score from BU stakeholders", target: "≥ 30", benchmark: "SSON: Median 22", category: "People" },
  ],
  enterprise: [
    { kpi: "Program On-Time / On-Budget", formula: "Milestones on-time / Total & cost variance", target: "≥ 85% on-time, ≤ 110% budget", benchmark: "Hackett: Median 72% / 115%", category: "Transition" },
    { kpi: "Business Case NPV Realization", formula: "Actual cumulative savings vs. NPV model", target: "≥ 75% at Year 2", benchmark: "Hackett: Median 60%", category: "Transition" },
    { kpi: "Process Harmonization Index", formula: "Entities on global std / Total entities", target: "≥ 85%", benchmark: "APQC: Top quartile 90%", category: "Transition" },
    { kpi: "BPO Integration Effectiveness", formula: "BPO SLA achievement + quality score", target: "≥ 90% SLA, ≤ 2% error", benchmark: "Hackett: Top quartile 94%", category: "Transition" },
    { kpi: "Cost per Invoice (→1.5)", formula: "Total AR cost / Invoices", target: "≤ $3.50", benchmark: "APQC: Top quartile $3.20", category: "Operational" },
    { kpi: "DSO Improvement", formula: "DSO reduction vs. baseline", target: "-3 to -5 days by Year 2", benchmark: "APQC: Top quartile 33 days", category: "Operational" },
    { kpi: "Touchless Processing Rate", formula: "Straight-through transactions / Total", target: "≥ 55%", benchmark: "Hackett: Top quartile 65%", category: "Operational" },
    { kpi: "SOX Compliance (→2.4)", formula: "Control deficiencies in OtC", target: "0 material weaknesses", benchmark: "—", category: "Compliance" },
    { kpi: "E-Invoice Compliance (→1.4)", formula: "Compliant invoices / Total invoices", target: "≥ 99%", benchmark: "—", category: "Compliance" },
    { kpi: "SSC Employee Engagement", formula: "Annual engagement survey score", target: "≥ 70th percentile", benchmark: "SSON: Median 62nd", category: "People" },
    { kpi: "Attrition (First 18mo)", formula: "Cumulative turnover in SSC", target: "≤ 20%", benchmark: "SSON: Median 25%", category: "People" },
    { kpi: "Internal NPS", formula: "Quarterly NPS from entity stakeholders", target: "≥ 40", benchmark: "SSON: Top quartile 45", category: "People" },
  ],
  global: [
    { kpi: "GBS Program Delivery Index", formula: "Composite: time, cost, scope, quality", target: "≥ 80 / 100", benchmark: "Hackett: Top quartile 75", category: "Transition" },
    { kpi: "5-Year NPV Realization", formula: "Actual cumulative value vs. board case", target: "≥ 80% at Year 3", benchmark: "Hackett: Median 65%", category: "Transition" },
    { kpi: "Global Standardization Index", formula: "Processes × entities on global standard", target: "≥ 90%", benchmark: "APQC: World-class 95%", category: "Transition" },
    { kpi: "M&A Integration Speed", formula: "Time to onboard acquired entity to GBS", target: "≤ 90 days", benchmark: "Hackett: Median 180 days", category: "Transition" },
    { kpi: "Cost per Invoice (→1.5)", formula: "Global blended cost per invoice", target: "≤ $2.50", benchmark: "APQC: World-class $2.10", category: "Operational" },
    { kpi: "Global DSO", formula: "Consolidated DSO", target: "≤ 35 days (or -5 from baseline)", benchmark: "APQC: World-class 30 days", category: "Operational" },
    { kpi: "Intelligent Automation Rate", formula: "AI/ML + RPA touchless rate", target: "≥ 65%", benchmark: "Hackett: Top quartile 60%", category: "Operational" },
    { kpi: "Process Conformance (→2.5)", formula: "Mining conformance score across hubs", target: "≥ 92%", benchmark: "—", category: "Operational" },
    { kpi: "SOX & Statutory (→2.4)", formula: "Material weaknesses + statutory findings", target: "0 across all jurisdictions", benchmark: "—", category: "Compliance" },
    { kpi: "E-Invoice Compliance (→1.4)", formula: "22-jurisdiction compliance rate", target: "100%", benchmark: "—", category: "Compliance" },
    { kpi: "Follow-the-Sun Coverage", formula: "Hours of live AR support per day", target: "22+ hours", benchmark: "—", category: "Operational" },
    { kpi: "GBS Employee Engagement", formula: "Global engagement index", target: "≥ 75th percentile", benchmark: "SSON: Top quartile 72nd", category: "People" },
    { kpi: "Global Attrition", formula: "Annualized voluntary turnover across hubs", target: "≤ 12%", benchmark: "SSON: Median 16%", category: "People" },
    { kpi: "End-Customer Experience", formula: "External NPS impact from GBS migration", target: "No degradation + improvement by Yr 2", benchmark: "—", category: "People" },
    { kpi: "GBS P&L", formula: "GBS unit economics (revenue less cost)", target: "Self-funding by Year 3", benchmark: "Hackett: Top quartile Year 2", category: "Financial" },
  ],
};

/* ── CROSS-REFERENCE MAP ────────────────────── */
const XREFS = [
  { code: "1.1", name: "OtC Value Stream Taxonomy", relevance: "Process codes referenced in all SLA & RACI definitions" },
  { code: "1.2", name: "Cash Application Process Pack", relevance: "Cash app SLAs, RACI roles, SOP templates reused in SSC context" },
  { code: "1.3", name: "Collections Strategy & Segmentation", relevance: "Risk segments fed by credit (2.1), collection SLAs in SSC scope" },
  { code: "1.4", name: "E-Invoicing Compliance Tracker", relevance: "Jurisdictional compliance requirements in multi-geo SSC/GBS" },
  { code: "1.5", name: "AR KPI Dashboard Blueprint", relevance: "KPI definitions, benchmarks, dashboard architecture" },
  { code: "1.6", name: "AR Maturity Assessment", relevance: "Maturity scoring informs SSC readiness & target state" },
  { code: "2.1", name: "Credit Management Process Pack", relevance: "Credit decisions upstream of collections, SSC scope inclusion" },
  { code: "2.2", name: "Dispute Resolution Process Pack", relevance: "Dispute handling SLAs, retained vs. shared decision" },
  { code: "2.3", name: "Billing & Invoicing Process Pack", relevance: "Invoice generation workflows, e-invoicing integration" },
  { code: "2.4", name: "SOX Compliance Controls Library", relevance: "Control framework migration, audit readiness in SSC" },
  { code: "2.5", name: "Process Mining Playbook", relevance: "Event log specs for SSC process monitoring, conformance tracking" },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

const raciColor = (v) => {
  if (v === "A" || v === "A/R") return "#FB923C";
  if (v === "R") return "#22D3EE";
  if (v === "C") return "#A78BFA";
  if (v === "I") return "rgba(255,255,255,0.15)";
  return "transparent";
};
const raciText = (v) => {
  if (v === "I") return "rgba(255,255,255,0.35)";
  return "#0B0F1A";
};

export default function SharedServicesTransitionGuide() {
  const [tier, setTier] = useState("mid");
  const [tab, setTab] = useState("sipoc");
  const [kpiFilter, setKpiFilter] = useState("All");
  const [showXref, setShowXref] = useState(false);

  const currentTier = TIERS.find((t) => t.key === tier);
  const accent = currentTier.accent;

  /* ── SIPOC Tab ─────────────────────────────── */
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
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: col.key === "process" ? accent : "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                {col.label}
              </span>
            </div>
            <div style={{ padding: 12 }}>
              {col.items.map((item, i) => (
                <div key={i} style={{ padding: "8px 10px", marginBottom: 6, background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `2px solid ${col.key === "process" ? accent : "rgba(255,255,255,0.08)"}`, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ── Roadmap Tab ────────────────────────────── */
  const renderRoadmap = () => {
    const data = ROADMAP_DATA[tier];
    const weekWidth = Math.max(12, 760 / data.totalWeeks);
    return (
      <div style={{ marginTop: 16 }}>
        {/* Timeline header */}
        <div style={{ display: "flex", marginBottom: 8, paddingLeft: 200 }}>
          {Array.from({ length: data.totalWeeks }, (_, i) => (
            <div key={i} style={{ width: weekWidth, minWidth: weekWidth, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              {(i + 1) % (tier === "global" ? 6 : tier === "enterprise" ? 4 : 2) === 0 ? `W${i + 1}` : ""}
            </div>
          ))}
        </div>
        {/* Waves */}
        {data.waves.map((wave, wi) => (
          <div key={wi} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{wave.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{wave.entities}</div>
            {wave.phases.map((phase, pi) => (
              <div key={pi} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <div style={{ width: 200, minWidth: 200, fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", paddingRight: 12, textAlign: "right" }}>{phase.name}</div>
                <div style={{ position: "relative", height: 22, flex: 1 }}>
                  <div style={{ position: "absolute", left: phase.start * weekWidth, width: phase.duration * weekWidth, height: "100%", background: phase.color + "33", borderRadius: 4, border: `1px solid ${phase.color}55` }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: `linear-gradient(90deg, ${phase.color}44, transparent)`, borderRadius: 4 }} />
                    <span style={{ position: "absolute", left: 6, top: 3, fontSize: 10, color: phase.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{phase.duration}w</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {/* Milestones */}
        <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Key Milestones</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {data.milestones.map((ms, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: accent + "11", borderRadius: 6, border: `1px solid ${accent}33` }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, fontWeight: 600 }}>W{ms.week}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>{ms.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
          Total program duration: <span style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{data.totalWeeks} weeks</span>
        </div>
      </div>
    );
  };

  /* ── RACI Tab ──────────────────────────────── */
  const renderRACI = () => {
    const roles = RACI_ROLES[tier];
    const activities = RACI_ACTIVITIES[tier];
    const gov = GOVERNANCE_STRUCTURES[tier];
    return (
      <div style={{ marginTop: 16 }}>
        {/* RACI Matrix */}
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
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
                      {v !== "—" && (
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, background: raciColor(v), color: raciText(v), fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: 28 }}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "A = Accountable", color: "#FB923C" },
            { label: "R = Responsible", color: "#22D3EE" },
            { label: "C = Consulted", color: "#A78BFA" },
            { label: "I = Informed", color: "rgba(255,255,255,0.15)" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: "inline-block" }} />
              {l.label}
            </div>
          ))}
        </div>
        {/* Governance */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
            {gov.title}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {gov.bodies.map((b, i) => (
              <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{b.members}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{b.freq}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{b.purpose}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── SLA & KT Tab ──────────────────────────── */
  const renderSLA = () => {
    const data = SLA_DATA[tier];
    return (
      <div style={{ marginTop: 16 }}>
        {/* SLAs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: accent, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Service Level Agreements</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr>
                  {["Process", "Metric", "Target", "Measurement", "Penalty / Escalation"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slas.map((sla, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                    <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.04)", fontWeight: 500 }}>{sla.process}</td>
                    <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{sla.metric}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 4, background: accent + "22", color: accent, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{sla.target}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11 }}>{sla.measurement}</td>
                    <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11 }}>{sla.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* KT Framework */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: accent, fontFamily: "'DM Sans', sans-serif" }}>Knowledge Transfer Framework</div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 4 }}>{data.ktFramework.approach}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.ktFramework.phases.map((phase, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent + "22", border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{phase.name}</span>
                    <span style={{ fontSize: 10, color: accent, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", background: accent + "11", borderRadius: 3 }}>{phase.duration}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{phase.desc}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>Gate: {phase.gate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── KPI Tab ───────────────────────────────── */
  const renderKPI = () => {
    const data = KPI_DATA[tier];
    const categories = ["All", ...Array.from(new Set(data.map((k) => k.category)))];
    const filtered = kpiFilter === "All" ? data : data.filter((k) => k.category === kpiFilter);
    return (
      <div style={{ marginTop: 16 }}>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setKpiFilter(cat)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: `1px solid ${kpiFilter === cat ? accent : "rgba(255,255,255,0.08)"}`,
                background: kpiFilter === cat ? accent + "22" : "rgba(255,255,255,0.03)", color: kpiFilter === cat ? accent : "rgba(255,255,255,0.5)",
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", fontWeight: kpiFilter === cat ? 600 : 400,
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
          {filtered.map((kpi, i) => (
            <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{kpi.kpi}</span>
                <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", marginLeft: 8 }}>{kpi.category}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{kpi.formula}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>TARGET </span>
                  <span style={{ fontSize: 12, color: accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.target}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>BENCH </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>{kpi.benchmark}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── MAIN RENDER ────────────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#fff", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>2.6</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Phase 2 · OtC Consulting Toolkit</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Shared Services Transition Guide</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
          SSC / GBS migration playbook — transition waves, KT frameworks, SLA definitions, governance structures, retained org design
        </p>
      </div>

      {/* Tier Selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TIERS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTier(t.key); setKpiFilter("All"); }}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: `1.5px solid ${tier === t.key ? t.accent : "rgba(255,255,255,0.08)"}`,
              background: tier === t.key ? t.accent + "15" : "rgba(255,255,255,0.03)",
              color: tier === t.key ? t.accent : "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: tier === t.key ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s ease",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px", border: "none", borderBottom: `2px solid ${tab === t.key ? accent : "transparent"}`,
              background: "transparent", color: tab === t.key ? accent : "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer",
              transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ marginRight: 6, fontSize: 10 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: 400 }}>
        {tab === "sipoc" && renderSIPOC()}
        {tab === "roadmap" && renderRoadmap()}
        {tab === "raci" && renderRACI()}
        {tab === "sla" && renderSLA()}
        {tab === "kpi" && renderKPI()}
      </div>

      {/* Cross-Reference Panel */}
      <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
        <button
          onClick={() => setShowXref(!showXref)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 8, padding: 0 }}
        >
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
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>APQC PCF v8.0 · SSON Benchmarks 2025 · Hackett Group World-Class Metrics 2026</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>2.6 — Shared Services Transition Guide · v1.0</span>
      </div>
    </div>
  );
}
