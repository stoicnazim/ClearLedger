import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   3.1 Customer Onboarding Process Pack
   Phase 3 — OtC Strategic Value
   APQC PCF v8.0: 3.5.1 Manage Customer Onboarding / 8.3.2
   Cross-references: 1.1–1.6, 2.1–2.6, 3.3, 3.5, KPI Spec
   ═══════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0a0e17", surface: "#111827", surfaceAlt: "#1a2234",
  border: "#1e293b", borderHover: "#334155",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  accent: "#22d3ee", accentDim: "rgba(34,211,238,0.12)", accentGlow: "rgba(34,211,238,0.25)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.12)",
  amber: "#fbbf24", amberDim: "rgba(251,191,36,0.12)",
  red: "#f87171", redDim: "rgba(248,113,113,0.12)",
  purple: "#a78bfa", purpleDim: "rgba(167,139,250,0.12)",
  blue: "#60a5fa", blueDim: "rgba(96,165,250,0.12)",
  font: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace",
  radius: "8px", radiusLg: "12px",
};

const Card = ({ children, style, glow, onClick }) => (
  <div onClick={onClick} style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
    padding: "20px", cursor: onClick ? "pointer" : "default",
    ...(glow ? { boxShadow: `0 0 20px ${T.accentGlow}, inset 0 1px 0 ${T.borderHover}` } : {}), ...style,
  }}>{children}</div>
);
const Badge = ({ children, color, bg }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px",
    fontFamily: T.mono, fontWeight: 600, color: color || T.accent, background: bg || T.accentDim, letterSpacing: "0.03em",
  }}>{children}</span>
);
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: "16px" }}>
    <h2 style={{ fontFamily: T.font, fontSize: "18px", fontWeight: 700, color: T.text, margin: 0 }}>{children}</h2>
    {sub && <p style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);
const NumInput = ({ value, onChange, suffix, width, step }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} step={step || 1}
      style={{ width: width || "70px", padding: "6px 8px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "6px", color: T.accent, fontFamily: T.mono, fontSize: "13px", textAlign: "right", outline: "none" }}
      onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
    {suffix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{suffix}</span>}
  </div>
);

const CROSS_REFS = {
  "1.1": { name: "OtC Value Stream Taxonomy", phase: 1 },
  "1.2": { name: "Cash Application Process Pack", phase: 1 },
  "1.3": { name: "Collections Strategy & Segmentation", phase: 1 },
  "1.4": { name: "E-Invoicing Compliance Tracker", phase: 1 },
  "1.5": { name: "AR KPI Dashboard Blueprint", phase: 1 },
  "1.6": { name: "AR Maturity Assessment", phase: 1 },
  "2.1": { name: "Credit Management", phase: 2 },
  "2.2": { name: "Dispute Resolution", phase: 2 },
  "2.3": { name: "Billing & Invoicing", phase: 2 },
  "2.4": { name: "SOX Controls Library", phase: 2 },
  "2.5": { name: "Process Mining Playbook", phase: 2 },
  "2.6": { name: "SSC Transition Guide", phase: 2 },
  "3.3": { name: "Treasury & Working Capital", phase: 3 },
  "3.5": { name: "Business Case Builder", phase: 3 },
  "KPI": { name: "KPI Specification Document", phase: 1 },
};

const TABS = [
  { id: "kyc", label: "1. KYC / Due Diligence", icon: "🔍" },
  { id: "master", label: "2. Master Data", icon: "🗄️" },
  { id: "credit", label: "3. Credit Integration", icon: "📋" },
  { id: "portal", label: "4. Portal / Self-Service", icon: "🖥️" },
  { id: "sla", label: "5. SLA & Cycle Time", icon: "⏱️" },
  { id: "prevention", label: "6. Dispute Prevention", icon: "🛡️" },
  { id: "xref", label: "Toolkit Map", icon: "🔗" },
];

// ─── KYC Tiers ───
const KYC_TIERS = [
  {
    tier: "Simplified", riskLevel: "Low", color: T.green, bg: T.greenDim,
    criteria: ["Domestic entity", "Public company / rated", "Expected annual revenue < €100k", "Standard payment terms"],
    documents: ["Business registration certificate", "VAT/Tax ID", "Bank account details", "Authorized signatory list"],
    checks: ["Sanctions screening (automated)", "Company registry verification", "VAT validation (VIES/local)"],
    approver: "AR Analyst", sla: "1 business day", toolkit: ["2.1"],
  },
  {
    tier: "Standard", riskLevel: "Medium", color: T.amber, bg: T.amberDim,
    criteria: ["International entity", "Private company", "Expected revenue €100k–€5M", "Non-standard terms requested"],
    documents: ["All Simplified docs +", "Financial statements (2 years)", "Trade references (2–3)", "Beneficial ownership declaration", "Certificate of incorporation"],
    checks: ["All Simplified checks +", "Credit bureau report (D&B / Creditsafe)", "Financial ratio analysis", "Trade reference verification", "PEP / adverse media screening"],
    approver: "Credit Manager", sla: "3 business days", toolkit: ["2.1", "2.4"],
  },
  {
    tier: "Enhanced", riskLevel: "High", color: T.red, bg: T.redDim,
    criteria: ["High-risk jurisdiction", "Complex ownership structure", "Expected revenue > €5M", "Extended payment terms > 60 days", "Government / SOE entity"],
    documents: ["All Standard docs +", "Audited financials (3 years)", "Group structure chart", "UBO documentation to natural person", "Board resolution / authority to trade", "AML compliance certificate (if applicable)"],
    checks: ["All Standard checks +", "Enhanced due diligence (EDD)", "On-site visit (if applicable)", "Legal entity verification to UBO", "Country risk assessment", "Ongoing monitoring enrollment"],
    approver: "Credit Director / CFO", sla: "5–10 business days", toolkit: ["2.1", "2.4", "1.6"],
  },
];

// ─── Master Data Fields ───
const MASTER_DATA_CATEGORIES = [
  {
    category: "Legal Entity", icon: "🏢", fields: [
      { field: "Legal Name", required: true, validation: "Match to company registry", erp: "All" },
      { field: "Trading Name (DBA)", required: false, validation: "Free text, max 100 chars", erp: "All" },
      { field: "Registration Number", required: true, validation: "Format by country regex", erp: "All" },
      { field: "VAT/Tax ID", required: true, validation: "VIES check (EU) / local API", erp: "All" },
      { field: "Legal Form", required: true, validation: "Enum: LLC, Corp, GmbH, etc.", erp: "SAP, Oracle" },
      { field: "Country of Incorporation", required: true, validation: "ISO 3166-1", erp: "All" },
    ],
  },
  {
    category: "Financial", icon: "💰", fields: [
      { field: "Credit Limit (proposed)", required: true, validation: "From credit scoring model (→ 2.1)", erp: "All" },
      { field: "Payment Terms", required: true, validation: "Enum: Net 30/45/60/90, CBD, COD", erp: "All" },
      { field: "Currency", required: true, validation: "ISO 4217", erp: "All" },
      { field: "Bank Account (IBAN)", required: true, validation: "IBAN checksum + SWIFT lookup", erp: "All" },
      { field: "Billing Cycle", required: false, validation: "Monthly / Bi-weekly / Per-order", erp: "SAP, D365" },
      { field: "Revenue Recognition Rule", required: true, validation: "Map to IFRS 15 / ASC 606 type", erp: "SAP, Oracle" },
    ],
  },
  {
    category: "Contact & Address", icon: "📍", fields: [
      { field: "Registered Address", required: true, validation: "Address verification API", erp: "All" },
      { field: "Billing Address", required: true, validation: "Address verification API", erp: "All" },
      { field: "Shipping Address(es)", required: false, validation: "Multi-address support", erp: "All" },
      { field: "Primary Contact (AP)", required: true, validation: "Email + phone format", erp: "All" },
      { field: "Escalation Contact", required: true, validation: "Email + phone format", erp: "SAP, Oracle" },
      { field: "E-Invoicing Contact", required: false, validation: "Email / EDI endpoint", erp: "All" },
    ],
  },
  {
    category: "Compliance & Classification", icon: "📊", fields: [
      { field: "Customer Segment", required: true, validation: "Enum: Strategic/Key/Standard/Tail", erp: "All" },
      { field: "Industry (NAICS/SIC)", required: true, validation: "Code lookup", erp: "SAP, Oracle" },
      { field: "Dunning Profile", required: true, validation: "Map to collections segment (→ 1.3)", erp: "SAP, D365" },
      { field: "E-Invoicing Mandate", required: true, validation: "Country mandate check (→ 1.4)", erp: "All" },
      { field: "SOX Control Flag", required: false, validation: "Auto-flag if revenue > threshold", erp: "SAP, Oracle" },
      { field: "Intercompany Flag", required: true, validation: "Boolean + IC partner code", erp: "All" },
    ],
  },
];

// ─── Credit Integration Workflow ───
const CREDIT_WORKFLOW = [
  { step: 1, name: "Application Receipt", owner: "AR Ops", system: "CRM / Portal", action: "Customer submits credit application with supporting documents", gate: "Completeness check — reject incomplete", duration: "0d", toolkit: [] },
  { step: 2, name: "Data Enrichment", owner: "AR Ops", system: "ERP + APIs", action: "Auto-pull D&B score, VIES validation, sanctions screening, company registry data", gate: "Auto-block if sanctions hit", duration: "0d (auto)", toolkit: ["2.1"] },
  { step: 3, name: "Credit Scoring", owner: "Credit Analyst", system: "Credit Engine", action: "Run scoring model: financial ratios, payment behavior, external rating, industry risk", gate: "Score ≥ threshold → auto-approve; below → manual review", duration: "1d", toolkit: ["2.1", "1.6"] },
  { step: 4, name: "Limit Calculation", owner: "Credit Analyst", system: "Credit Engine", action: "Calculate recommended limit: % of equity, % of revenue, payment behavior multiplier", gate: "Limit within authority matrix → approve; above → escalate", duration: "0.5d", toolkit: ["2.1", "2.4"] },
  { step: 5, name: "Terms Negotiation", owner: "Sales + Credit", system: "CRM", action: "If non-standard terms requested: sales business case, margin analysis, security requirements", gate: "Approved terms within policy; exceptions need CFO sign-off", duration: "1–3d", toolkit: ["2.4"] },
  { step: 6, name: "Approval & Activation", owner: "Approver (per matrix)", system: "ERP", action: "Formal approval, master data creation/update, credit block removal, welcome notification", gate: "SOX-compliant approval trail (→ 2.4)", duration: "0.5d", toolkit: ["2.4", "2.1"] },
  { step: 7, name: "Ongoing Monitoring", owner: "Credit Team", system: "Credit Engine", action: "Periodic review triggers: anniversary, payment deterioration, external rating change, over-limit", gate: "Auto-escalation rules", duration: "Ongoing", toolkit: ["2.1", "1.3", "1.5"] },
];

// ─── Portal Registration Flow ───
const PORTAL_STEPS = [
  { step: 1, name: "Registration Request", channel: "Web / Email link", description: "Customer receives invitation or self-registers via public portal URL", fields: "Company name, contact email, country, expected volume", ux: "Single-page form, <2 min to complete" },
  { step: 2, name: "Email Verification", channel: "Automated", description: "Verification email with secure link, 24h expiry", fields: "—", ux: "Click-to-verify, mobile responsive" },
  { step: 3, name: "Company Profile", channel: "Portal", description: "Complete legal entity details, upload documents per KYC tier", fields: "All master data fields by tier", ux: "Progressive disclosure — show only required fields for tier" },
  { step: 4, name: "E-Invoicing Setup", channel: "Portal", description: "Select e-invoicing channel: email PDF, Peppol, EDI, country-specific (→ 1.4)", fields: "Peppol ID / EDI endpoint / email", ux: "Auto-detect mandate by country, suggest compliant channel" },
  { step: 5, name: "PO & Billing Preferences", channel: "Portal", description: "PO requirements, billing cycle, invoice format, consolidation rules", fields: "PO mandatory flag, billing frequency, format preference", ux: "Defaults pre-filled by segment" },
  { step: 6, name: "Document Upload & Verification", channel: "Portal + Back-office", description: "Upload KYC documents, automated OCR extraction, manual verification queue", fields: "Per KYC tier checklist", ux: "Drag-and-drop upload, progress tracker, status notifications" },
  { step: 7, name: "Approval & Welcome", channel: "Automated + Email", description: "Credit decision notification, portal access activated, welcome kit sent", fields: "Credit limit, payment terms, account manager assigned", ux: "Dashboard access with order-ready confirmation" },
];

// ─── SLA Benchmarks ───
const SLA_METRICS = [
  { metric: "Total Onboarding Cycle Time", unit: "business days", target: { low: 1, med: 3, high: 7 }, benchmark: "APQC median: 5 days", apqc: "3.5.1", toolkit: ["1.5", "KPI"] },
  { metric: "KYC Completion Rate", unit: "%", target: { low: 98, med: 95, high: 90 }, benchmark: "Target: >95% first-pass", apqc: "3.5.1.1", toolkit: ["2.1"] },
  { metric: "Master Data Accuracy", unit: "% fields correct at go-live", target: { low: 99, med: 98, high: 95 }, benchmark: "Target: >98%", apqc: "3.5.1.2", toolkit: ["2.5"] },
  { metric: "Credit Decision Turnaround", unit: "business days", target: { low: 0.5, med: 1, high: 3 }, benchmark: "Auto-approve: <4 hrs", apqc: "8.3.2", toolkit: ["2.1"] },
  { metric: "First Invoice Accuracy", unit: "% error-free", target: { low: 99, med: 97, high: 93 }, benchmark: "APQC top quartile: 98%+", apqc: "8.3.1", toolkit: ["2.3", "2.2"] },
  { metric: "Portal Self-Service Adoption", unit: "% of new customers", target: { low: 80, med: 60, high: 30 }, benchmark: "Best-in-class: 75%+", apqc: "3.5.1", toolkit: ["1.4"] },
  { metric: "Onboarding-Related Dispute Rate", unit: "% of first-90-day invoices disputed", target: { low: 1, med: 3, high: 8 }, benchmark: "Target: <2%", apqc: "8.3.3", toolkit: ["2.2"] },
  { metric: "Cost per Onboarding", unit: "€", target: { low: 25, med: 75, high: 200 }, benchmark: "APQC median: €85", apqc: "3.5.1", toolkit: ["3.5", "KPI"] },
];

// ─── Dispute Prevention Scoring ───
const PREVENTION_FACTORS = [
  { factor: "PO Requirement Captured", weight: 20, riskIfMissing: "Invoice rejection — 'no PO, no pay' policies", remediation: "Mandatory PO field at onboarding; auto-block if not set", toolkit: ["2.2", "2.3"] },
  { factor: "Billing Address Verified", weight: 15, riskIfMissing: "Invoice non-delivery, delayed payment", remediation: "Address verification API at registration; quarterly refresh", toolkit: ["2.3"] },
  { factor: "E-Invoicing Channel Confirmed", weight: 15, riskIfMissing: "Format rejection, compliance penalty (→ 1.4)", remediation: "Country mandate auto-check; Peppol/EDI enrollment", toolkit: ["1.4", "2.3"] },
  { factor: "Payment Terms Aligned to Contract", weight: 15, riskIfMissing: "Terms mismatch disputes, deduction claims", remediation: "Contract-to-master-data reconciliation at onboarding", toolkit: ["2.1", "2.2"] },
  { factor: "Tax Classification Correct", weight: 10, riskIfMissing: "Tax amount disputes, credit note volume", remediation: "Tax engine validation; exemption certificate on file", toolkit: ["2.3", "2.4"] },
  { factor: "Pricing / Rate Card Loaded", weight: 10, riskIfMissing: "Price discrepancy disputes — #1 dispute type", remediation: "Price list auto-load from contract; deviation alert", toolkit: ["2.2", "2.3"] },
  { factor: "AP Contact Validated", weight: 8, riskIfMissing: "Invoices sent to wrong person → aging", remediation: "Contact verification call/email at onboarding", toolkit: ["1.3"] },
  { factor: "Dunning Profile Assigned", weight: 7, riskIfMissing: "Wrong collection treatment, customer complaints", remediation: "Auto-assign by segment (→ 1.3); manual override option", toolkit: ["1.3", "1.6"] },
];

export default function CustomerOnboarding() {
  const [activeTab, setActiveTab] = useState("kyc");
  const [selectedTier, setSelectedTier] = useState(1); // 0=Simplified, 1=Standard, 2=Enhanced
  const [expandedCategory, setExpandedCategory] = useState(null);

  // SLA input overrides
  const [slaInputs, setSlaInputs] = useState({});
  const updSLA = (idx, val) => setSlaInputs(p => ({ ...p, [idx]: val }));

  // Dispute prevention scores
  const [preventionScores, setPreventionScores] = useState(() =>
    Object.fromEntries(PREVENTION_FACTORS.map((f, i) => [i, true]))
  );
  const togglePrevention = (idx) => setPreventionScores(p => ({ ...p, [idx]: !p[idx] }));

  const preventionTotal = useMemo(() => {
    return PREVENTION_FACTORS.reduce((sum, f, i) => sum + (preventionScores[i] ? f.weight : 0), 0);
  }, [preventionScores]);

  const preventionRisk = preventionTotal >= 85 ? { label: "Low Risk", color: T.green, bg: T.greenDim }
    : preventionTotal >= 60 ? { label: "Medium Risk", color: T.amber, bg: T.amberDim }
    : { label: "High Risk", color: T.red, bg: T.redDim };

  // ─── Render KYC ───
  const renderKYC = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Risk-tiered due diligence — select tier to see required documents, checks, and approval authority">KYC Tier Framework</SectionTitle>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {KYC_TIERS.map((t, i) => (
            <button key={i} onClick={() => setSelectedTier(i)} style={{
              flex: 1, padding: "12px 16px", borderRadius: T.radius,
              border: `2px solid ${selectedTier === i ? t.color : T.border}`,
              background: selectedTier === i ? t.bg : "transparent",
              color: selectedTier === i ? t.color : T.textMuted,
              fontFamily: T.font, fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}>
              <div>{t.tier}</div>
              <div style={{ fontSize: "11px", fontFamily: T.mono, fontWeight: 400, marginTop: "2px" }}>{t.riskLevel} Risk</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Selected tier detail */}
      {(() => {
        const tier = KYC_TIERS[selectedTier];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Criteria */}
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Trigger Criteria</div>
              {tier.criteria.map((c, i) => (
                <div key={i} style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted, padding: "4px 0", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: tier.color, fontSize: "8px", marginTop: "5px" }}>●</span>{c}
                </div>
              ))}
            </Card>

            {/* Documents */}
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Required Documents</div>
              {tier.documents.map((d, i) => (
                <div key={i} style={{ fontFamily: T.font, fontSize: "13px", color: d.includes("All") ? T.textDim : T.textMuted, padding: "4px 0", display: "flex", alignItems: "flex-start", gap: "8px", fontStyle: d.includes("All") ? "italic" : "normal" }}>
                  <span style={{ color: tier.color, fontSize: "8px", marginTop: "5px" }}>●</span>{d}
                </div>
              ))}
            </Card>

            {/* Checks */}
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Verification Checks</div>
              {tier.checks.map((c, i) => (
                <div key={i} style={{ fontFamily: T.font, fontSize: "13px", color: c.includes("All") ? T.textDim : T.textMuted, padding: "4px 0", display: "flex", alignItems: "flex-start", gap: "8px", fontStyle: c.includes("All") ? "italic" : "normal" }}>
                  <span style={{ color: T.accent, fontSize: "8px", marginTop: "5px" }}>●</span>{c}
                </div>
              ))}
            </Card>

            {/* Approval & SLA */}
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Approval & SLA</div>
              <div style={{ display: "grid", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: T.bg, borderRadius: T.radius }}>
                  <span style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>Approval Authority</span>
                  <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.text, fontWeight: 600 }}>{tier.approver}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: T.bg, borderRadius: T.radius }}>
                  <span style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>Target SLA</span>
                  <span style={{ fontFamily: T.mono, fontSize: "13px", color: tier.color, fontWeight: 600 }}>{tier.sla}</span>
                </div>
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  {tier.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* SIPOC summary */}
      <Card>
        <SectionTitle sub="APQC 3.5.1 — Suppliers, Inputs, Process, Outputs, Customers">Onboarding SIPOC</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["Suppliers", "Inputs", "Process", "Outputs", "Customers"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: T.accent, borderBottom: `1px solid ${T.border}`, fontWeight: 600, fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Sales / BD", "Customer request, contract terms", "Application receipt & triage", "KYC tier assignment", "Credit team"],
                ["Customer", "Legal documents, financials", "Document collection & verification", "Verified entity profile", "AR Operations"],
                ["Credit bureaus (D&B)", "Credit scores, financial data", "Credit scoring & limit calc", "Credit decision & limit", "Sales"],
                ["Company registries", "Registration data, UBO info", "Master data creation", "Active customer account", "ERP / Billing"],
                ["Compliance (AML)", "Sanctions lists, PEP data", "Portal setup & e-invoice config", "Self-service access", "Customer"],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "8px 10px", color: T.textMuted, borderBottom: `1px solid ${T.border}`, verticalAlign: "top" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ─── Render Master Data ───
  const renderMaster = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Required fields, validation rules, and ERP mapping — ensuring data quality at the point of entry">Master Data Setup & Validation Matrix</SectionTitle>
        <p style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, marginBottom: "16px" }}>
          Poor master data is the root cause of 35–45% of all AR disputes. This matrix defines the minimum viable data set for each customer record, with validation logic that prevents garbage-in at onboarding.
        </p>
      </Card>

      {MASTER_DATA_CATEGORIES.map((cat, ci) => (
        <Card key={ci} style={{ padding: "0", overflow: "hidden" }}>
          <div
            onClick={() => setExpandedCategory(expandedCategory === ci ? null : ci)}
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: expandedCategory === ci ? T.surfaceAlt : "transparent", transition: "background 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{cat.icon}</span>
              <span style={{ fontFamily: T.font, fontSize: "15px", fontWeight: 600, color: T.text }}>{cat.category}</span>
              <Badge>{cat.fields.length} fields</Badge>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: "16px", color: T.textDim, transition: "transform 0.2s", transform: expandedCategory === ci ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </div>
          {expandedCategory === ci && (
            <div style={{ padding: "0 20px 16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Field", "Required", "Validation Rule", "ERP Support"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cat.fields.map((f, fi) => (
                    <tr key={fi}>
                      <td style={{ padding: "8px 6px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{f.field}</td>
                      <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontFamily: T.mono, fontSize: "11px", color: f.required ? T.green : T.textDim }}>{f.required ? "Required" : "Optional"}</span>
                      </td>
                      <td style={{ padding: "8px 6px", color: T.textMuted, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px" }}>{f.validation}</td>
                      <td style={{ padding: "8px 6px", borderBottom: `1px solid ${T.border}` }}>
                        <Badge color={T.textMuted} bg={T.surfaceAlt}>{f.erp}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))}

      {/* Data Quality Rules */}
      <Card>
        <SectionTitle sub="Automated checks that prevent duplicate and incomplete records">Duplicate Detection & Quality Gates</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { rule: "Exact Match Detection", description: "Block creation if Tax ID or Registration Number already exists in active customers", severity: "Hard block", color: T.red },
            { rule: "Fuzzy Name Match", description: "Flag potential duplicates when legal name similarity > 85% (Levenshtein distance)", severity: "Soft warning", color: T.amber },
            { rule: "Address Deduplication", description: "Cross-reference billing address against existing customers at same location", severity: "Soft warning", color: T.amber },
            { rule: "Completeness Score", description: "Calculate % of required fields populated; block activation if < 90%", severity: "Hard block", color: T.red },
            { rule: "Format Validation", description: "Real-time validation of IBAN, email, phone, postal code, VAT ID formats", severity: "Field-level error", color: T.red },
            { rule: "Cross-Field Logic", description: "E.g., if country = EU and no VAT ID → flag; if terms > 60d → require credit approval", severity: "Process gate", color: T.amber },
          ].map((r, i) => (
            <div key={i} style={{ padding: "12px", background: T.bg, borderRadius: T.radius, borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.text, marginBottom: "4px" }}>{r.rule}</div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginBottom: "6px" }}>{r.description}</div>
              <Badge color={r.color} bg={r.color === T.red ? T.redDim : T.amberDim}>{r.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── Render Credit Integration ───
  const renderCredit = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="End-to-end credit application workflow — handoff from onboarding to credit management (→ 2.1)">Credit Application Integration</SectionTitle>
      </Card>

      {/* Workflow steps */}
      <div style={{ display: "grid", gap: "4px" }}>
        {CREDIT_WORKFLOW.map((s, i) => (
          <Card key={i} style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: T.accentDim, border: `2px solid ${T.accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: "13px", fontWeight: 700, color: T.accent,
                }}>{s.step}</div>
                {i < CREDIT_WORKFLOW.length - 1 && <div style={{ width: "2px", flex: 1, background: T.border, marginTop: "4px" }} />}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{s.name}</span>
                      <Badge color={T.textMuted} bg={T.surfaceAlt}>{s.owner}</Badge>
                      <Badge color={T.purple} bg={T.purpleDim}>{s.system}</Badge>
                    </div>
                    <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginTop: "4px" }}>{s.action}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.accent, fontWeight: 600 }}>{s.duration}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: T.bg, borderRadius: T.radius, marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.amber, textTransform: "uppercase" }}>Gate</span>
                    <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{s.gate}</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {s.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Authority Matrix */}
      <Card>
        <SectionTitle sub="SOX-compliant approval thresholds — maps to 2.4 Controls Library">Credit Approval Authority Matrix</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
          <thead>
            <tr>
              {["Credit Limit Range", "Approver", "Supporting Evidence", "Review Frequency"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["< €50k", "AR Analyst (auto)", "Credit score ≥ threshold", "Annual"],
              ["€50k – €250k", "Credit Manager", "Score + financial review", "Semi-annual"],
              ["€250k – €1M", "Credit Director", "Full analysis + trade refs", "Quarterly"],
              ["> €1M", "CFO / Credit Committee", "Full package + board memo", "Quarterly"],
              ["Any (override)", "CFO + CEO", "Business case + security", "Per occurrence"],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "8px", color: j === 0 ? T.accent : T.textMuted, borderBottom: `1px solid ${T.border}`, fontFamily: j === 0 ? T.mono : T.font, fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // ─── Render Portal ───
  const renderPortal = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Customer-facing self-service registration flow — reduces onboarding cost and improves data accuracy">Portal Registration Journey</SectionTitle>
      </Card>

      {/* Flow visualization */}
      <div style={{ display: "grid", gap: "4px" }}>
        {PORTAL_STEPS.map((s, i) => (
          <Card key={i} style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 200px", gap: "16px", alignItems: "start" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: T.accentDim, border: `1px solid ${T.accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: "13px", fontWeight: 700, color: T.accent,
              }}>{s.step}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{s.name}</span>
                  <Badge color={T.purple} bg={T.purpleDim}>{s.channel}</Badge>
                </div>
                <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginBottom: "6px" }}>{s.description}</div>
                <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>Fields: {s.fields}</div>
              </div>
              <div style={{ padding: "8px 12px", background: T.bg, borderRadius: T.radius }}>
                <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>UX Guideline</div>
                <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textMuted }}>{s.ux}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Self-service benefits */}
      <Card>
        <SectionTitle sub="Quantified impact of portal adoption on onboarding cost and quality">Self-Service Value Proposition</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { label: "Cost Reduction", value: "60–75%", sub: "vs manual onboarding", color: T.green },
            { label: "Cycle Time", value: "70% faster", sub: "self-service vs email", color: T.accent },
            { label: "Data Accuracy", value: "+15pp", sub: "customer-entered vs re-keyed", color: T.purple },
            { label: "First Invoice Right", value: "98%+", sub: "with validated master data", color: T.green },
          ].map((m, i) => (
            <div key={i} style={{ padding: "12px", background: T.bg, borderRadius: T.radius, textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: "20px", fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{m.label}</div>
              <div style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── Render SLA ───
  const renderSLA = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Track onboarding performance against targets by KYC risk tier — all metrics map to KPI Spec Doc">SLA & Cycle Time Dashboard</SectionTitle>
      </Card>

      {SLA_METRICS.map((m, i) => {
        const val = slaInputs[i];
        const hasInput = val !== undefined;
        const tgt = m.target;
        let status = "—";
        let statusColor = T.textDim;
        if (hasInput) {
          // For "higher is better" metrics (rates/percentages), green if ≥ low target
          // For "lower is better" metrics (days/cost), green if ≤ low target
          const lowerBetter = m.unit.includes("day") || m.unit.includes("€") || m.unit.includes("disputed");
          if (lowerBetter) {
            status = val <= tgt.low ? "● On Target" : val <= tgt.med ? "● At Risk" : "● Off Track";
            statusColor = val <= tgt.low ? T.green : val <= tgt.med ? T.amber : T.red;
          } else {
            status = val >= tgt.low ? "● On Target" : val >= tgt.med ? "● At Risk" : "● Off Track";
            statusColor = val >= tgt.low ? T.green : val >= tgt.med ? T.amber : T.red;
          }
        }
        return (
          <Card key={i} style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: "16px", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{m.metric}</span>
                  <Badge>{m.apqc}</Badge>
                </div>
                <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{m.benchmark}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.green, textTransform: "uppercase" }}>Top</div>
                <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.green, fontWeight: 600 }}>{tgt.low}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.amber, textTransform: "uppercase" }}>Med</div>
                <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.amber, fontWeight: 600 }}>{tgt.med}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.red, textTransform: "uppercase" }}>Low</div>
                <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.red, fontWeight: 600 }}>{tgt.high}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <NumInput value={hasInput ? val : ""} onChange={v => updSLA(i, v)} suffix={m.unit.split(" ")[0]} width="60px" step={0.5} />
                <span style={{ fontFamily: T.mono, fontSize: "11px", color: statusColor }}>{status}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
              {m.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
            </div>
          </Card>
        );
      })}
    </div>
  );

  // ─── Render Dispute Prevention ───
  const renderPrevention = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Dispute Prevention Score</div>
            <div style={{ fontFamily: T.mono, fontSize: "36px", fontWeight: 700, color: preventionRisk.color }}>{preventionTotal}/100</div>
            <Badge color={preventionRisk.color} bg={preventionRisk.bg}>{preventionRisk.label}</Badge>
          </div>
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: `4px solid ${T.border}`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="120" height="120" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke={T.border} strokeWidth="6" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={preventionRisk.color} strokeWidth="6"
                strokeDasharray={`${(preventionTotal / 100) * 339.3} 339.3`}
                strokeLinecap="round" style={{ transition: "stroke-dasharray 0.4s ease" }} />
            </svg>
            <span style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: T.text, zIndex: 1 }}>{preventionTotal}%</span>
          </div>
        </div>
        <div style={{ marginTop: "12px", fontFamily: T.font, fontSize: "12px", color: T.textDim }}>
          Toggle onboarding factors below to model their impact on downstream dispute risk. Score represents the percentage of common dispute root causes mitigated at onboarding.
        </div>
      </Card>

      {PREVENTION_FACTORS.map((f, i) => {
        const active = preventionScores[i];
        return (
          <Card key={i} onClick={() => togglePrevention(i)}
            style={{ padding: "14px 16px", borderColor: active ? T.green : T.border, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "4px",
                    border: `2px solid ${active ? T.green : T.border}`,
                    background: active ? T.greenDim : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: T.green, transition: "all 0.2s",
                  }}>{active ? "✓" : ""}</div>
                  <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{f.factor}</span>
                  <Badge color={T.accent}>{f.weight} pts</Badge>
                </div>
                <div style={{ marginLeft: "26px" }}>
                  <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginBottom: "4px" }}>
                    <span style={{ color: T.red, fontFamily: T.mono, fontSize: "10px", marginRight: "6px" }}>RISK IF MISSING</span>{f.riskIfMissing}
                  </div>
                  <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>
                    <span style={{ color: T.green, fontFamily: T.mono, fontSize: "10px", marginRight: "6px" }}>REMEDIATION</span>{f.remediation}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {f.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  // ─── Render Cross-Reference ───
  const renderXRef = () => {
    const sections = [
      { id: "kyc", name: "KYC / Due Diligence", refs: ["2.1", "2.4", "1.6"], apqc: "3.5.1" },
      { id: "master", name: "Master Data Setup", refs: ["1.1", "1.4", "2.3", "2.5"], apqc: "3.5.1.2" },
      { id: "credit", name: "Credit Integration", refs: ["2.1", "2.4", "1.3", "1.5", "1.6", "3.5"], apqc: "8.3.2" },
      { id: "portal", name: "Portal / Self-Service", refs: ["1.4", "2.3"], apqc: "3.5.1" },
      { id: "sla", name: "SLA & Cycle Time", refs: ["1.5", "KPI", "2.5", "3.5"], apqc: "3.5.1" },
      { id: "prevention", name: "Dispute Prevention", refs: ["2.2", "2.3", "1.3", "1.4", "1.6"], apqc: "8.3.3" },
    ];
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="How each section of 3.1 maps to existing toolkit deliverables and APQC process codes">Cross-Reference Matrix</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>3.1 Section</th>
                  {Object.keys(CROSS_REFS).map(code => (
                    <th key={code} style={{ padding: "8px 4px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "10px", textAlign: "center", minWidth: "32px" }}>{code}</th>
                  ))}
                  <th style={{ padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "10px" }}>APQC</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>{s.name}</td>
                    {Object.keys(CROSS_REFS).map(code => (
                      <td key={code} style={{ padding: "4px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                        {s.refs.includes(code) ? <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: T.accent }} /> : <span style={{ color: T.border }}>·</span>}
                      </td>
                    ))}
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}><Badge>{s.apqc}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {Object.entries(CROSS_REFS).map(([code, ref]) => (
            <Card key={code} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge color={ref.phase === 1 ? T.accent : ref.phase === 2 ? T.purple : T.green} bg={ref.phase === 1 ? T.accentDim : ref.phase === 2 ? T.purpleDim : T.greenDim}>
                  P{ref.phase} · {code}
                </Badge>
                <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text }}>{ref.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: T.font, background: T.bg, color: T.text, minHeight: "100vh", padding: "24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Badge color={T.bg} bg={T.accent}>3.1</Badge>
          <Badge>PHASE 3</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC 3.5.1 / 8.3.2</Badge>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "26px", fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
          Customer Onboarding Process Pack
        </h1>
        <p style={{ fontFamily: T.font, fontSize: "14px", color: T.textDim, margin: 0 }}>
          KYC workflows · Master data validation · Credit integration · Portal design · Dispute prevention scoring
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 14px", background: "transparent", border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? T.accent : "transparent"}`,
              color: activeTab === tab.id ? T.accent : T.textDim,
              fontFamily: T.font, fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease", marginBottom: "-1px",
            }}>
            <span style={{ marginRight: "6px" }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "kyc" && renderKYC()}
      {activeTab === "master" && renderMaster()}
      {activeTab === "credit" && renderCredit()}
      {activeTab === "portal" && renderPortal()}
      {activeTab === "sla" && renderSLA()}
      {activeTab === "prevention" && renderPrevention()}
      {activeTab === "xref" && renderXRef()}

      {/* Footer */}
      <div style={{ marginTop: "32px", padding: "16px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>OtC Consulting Toolkit · Phase 3 · v3.1.0</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>Benchmarks: APQC + Hackett</Badge>
        </div>
      </div>
    </div>
  );
}
