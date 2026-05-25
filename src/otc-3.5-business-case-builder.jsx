import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   3.5 OtC Transformation Business Case Builder
   Phase 3 — OtC Strategic Value
   APQC PCF v8.0: 8.0 Manage Financial Resources
   Cross-references: 1.1–1.6, 2.1–2.6, KPI Spec
   ═══════════════════════════════════════════════════════════════ */

// ─── Design Tokens ───
const T = {
  bg: "#0a0e17",
  surface: "#111827",
  surfaceAlt: "#1a2234",
  border: "#1e293b",
  borderHover: "#334155",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  accent: "#22d3ee",
  accentDim: "rgba(34,211,238,0.12)",
  accentGlow: "rgba(34,211,238,0.25)",
  green: "#34d399",
  greenDim: "rgba(52,211,153,0.12)",
  amber: "#fbbf24",
  amberDim: "rgba(251,191,36,0.12)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.12)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
  font: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
  radius: "8px",
  radiusLg: "12px",
};

// ─── Maturity Tiers ───
const TIERS = [
  { id: 1, label: "Tier 1 — Manual / Reactive", color: T.red, bg: T.redDim, tag: "Manual" },
  { id: 2, label: "Tier 2 — Standardized", color: T.amber, bg: T.amberDim, tag: "Standard" },
  { id: 3, label: "Tier 3 — Optimized", color: T.accent, bg: T.accentDim, tag: "Optimized" },
  { id: 4, label: "Tier 4 — Intelligent / Autonomous", color: T.purple, bg: T.purpleDim, tag: "Intelligent" },
];

// ─── Benefit Levers (APQC-mapped) ───
const BENEFIT_LEVERS = [
  {
    id: "dso",
    name: "DSO Reduction",
    apqc: "8.3.4",
    unit: "days",
    description: "Reduce Days Sales Outstanding through improved collections, credit management, and cash application",
    toolkit: ["1.2", "1.3", "1.5", "2.1"],
    benchmarks: { tier1: { current: 55, target: 42 }, tier2: { current: 42, target: 35 }, tier3: { current: 35, target: 28 }, tier4: { current: 28, target: 22 } },
    calcType: "cashflow",
  },
  {
    id: "badDebt",
    name: "Bad Debt Write-off Reduction",
    apqc: "8.3.4.3",
    unit: "% of revenue",
    description: "Reduce write-offs via improved credit scoring, ECL models, and proactive collections",
    toolkit: ["2.1", "1.3", "1.6"],
    benchmarks: { tier1: { current: 1.5, target: 0.8 }, tier2: { current: 0.8, target: 0.4 }, tier3: { current: 0.4, target: 0.15 }, tier4: { current: 0.15, target: 0.05 } },
    calcType: "percentage",
  },
  {
    id: "disputes",
    name: "Dispute Resolution Cost",
    apqc: "8.3.3",
    unit: "cost per dispute (€)",
    description: "Reduce dispute handling costs through root-cause categorization and prevention programs",
    toolkit: ["2.2", "2.3", "1.1"],
    benchmarks: { tier1: { current: 85, target: 45 }, tier2: { current: 45, target: 28 }, tier3: { current: 28, target: 15 }, tier4: { current: 15, target: 8 } },
    calcType: "unit_cost",
  },
  {
    id: "cashApp",
    name: "Cash Application Automation",
    apqc: "8.3.4.1",
    unit: "% auto-match rate",
    description: "Increase straight-through processing of incoming payments via AI matching and remittance parsing",
    toolkit: ["1.2", "1.5", "2.5"],
    benchmarks: { tier1: { current: 30, target: 60 }, tier2: { current: 60, target: 80 }, tier3: { current: 80, target: 92 }, tier4: { current: 92, target: 98 } },
    calcType: "fte_saving",
  },
  {
    id: "invoicing",
    name: "Invoice Processing Cost",
    apqc: "8.3.1",
    unit: "cost per invoice (€)",
    description: "Reduce cost-to-invoice through e-invoicing, automation, and template standardization",
    toolkit: ["2.3", "1.4", "2.4"],
    benchmarks: { tier1: { current: 12, target: 6 }, tier2: { current: 6, target: 3.5 }, tier3: { current: 3.5, target: 1.8 }, tier4: { current: 1.8, target: 0.6 } },
    calcType: "unit_cost",
  },
  {
    id: "compliance",
    name: "Compliance & Audit Cost",
    apqc: "8.7",
    unit: "annual cost (€k)",
    description: "Reduce SOX compliance effort, audit prep time, and e-invoicing penalty risk",
    toolkit: ["2.4", "1.4", "1.6"],
    benchmarks: { tier1: { current: 280, target: 180 }, tier2: { current: 180, target: 120 }, tier3: { current: 120, target: 70 }, tier4: { current: 70, target: 35 } },
    calcType: "direct_saving",
  },
  {
    id: "fte",
    name: "FTE Productivity Gain",
    apqc: "8.3",
    unit: "FTEs redeployed",
    description: "Free capacity through process automation, SSC consolidation, and process mining optimization",
    toolkit: ["2.5", "2.6", "1.1", "1.6"],
    benchmarks: { tier1: { current: 0, target: 3 }, tier2: { current: 0, target: 5 }, tier3: { current: 0, target: 8 }, tier4: { current: 0, target: 12 } },
    calcType: "fte_redeploy",
  },
  {
    id: "earlyPay",
    name: "Early Payment Discount Capture",
    apqc: "8.3.2",
    unit: "% of eligible captured",
    description: "Increase capture of supplier/customer early payment discounts through dynamic discounting",
    toolkit: ["1.5", "2.3"],
    benchmarks: { tier1: { current: 15, target: 40 }, tier2: { current: 40, target: 65 }, tier3: { current: 65, target: 82 }, tier4: { current: 82, target: 95 } },
    calcType: "discount_capture",
  },
];

// ─── Investment Categories ───
const INVESTMENT_CATEGORIES = [
  { id: "tech", name: "Technology & Licensing", icon: "⚡", default: { tier1: 0, tier2: 80, tier3: 250, tier4: 600 } },
  { id: "impl", name: "Implementation & Integration", icon: "🔧", default: { tier1: 0, tier2: 60, tier3: 180, tier4: 400 } },
  { id: "people", name: "Change Management & Training", icon: "👥", default: { tier1: 15, tier2: 40, tier3: 80, tier4: 150 } },
  { id: "consulting", name: "Advisory & Consulting", icon: "📋", default: { tier1: 25, tier2: 50, tier3: 100, tier4: 180 } },
  { id: "ongoing", name: "Annual Run Cost (recurring)", icon: "🔄", default: { tier1: 5, tier2: 30, tier3: 80, tier4: 200 } },
];

// ─── Cross-Reference Mesh ───
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
  "KPI": { name: "KPI Specification Document", phase: 1 },
};

// ─── Helpers ───
const fmt = (n, dec = 0) => {
  if (Math.abs(n) >= 1e6) return `€${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `€${(n / 1e3).toFixed(dec > 0 ? 1 : 0)}k`;
  return `€${n.toFixed(dec)}`;
};

const pct = (n) => `${n.toFixed(1)}%`;

// ─── Styled Components (inline) ───
const Card = ({ children, style, glow, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: "20px",
      transition: "all 0.2s ease",
      cursor: onClick ? "pointer" : "default",
      ...(glow ? { boxShadow: `0 0 20px ${T.accentGlow}, inset 0 1px 0 ${T.borderHover}` } : {}),
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color, bg }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontFamily: T.mono,
      fontWeight: 600,
      color: color || T.accent,
      background: bg || T.accentDim,
      letterSpacing: "0.03em",
    }}
  >
    {children}
  </span>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: "16px" }}>
    <h2 style={{ fontFamily: T.font, fontSize: "18px", fontWeight: 700, color: T.text, margin: 0 }}>{children}</h2>
    {sub && <p style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const NumberInput = ({ value, onChange, min, max, step, prefix, suffix, width }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {prefix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{prefix}</span>}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step || 1}
      style={{
        width: width || "80px",
        padding: "6px 8px",
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: "6px",
        color: T.accent,
        fontFamily: T.mono,
        fontSize: "13px",
        textAlign: "right",
        outline: "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.border)}
    />
    {suffix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{suffix}</span>}
  </div>
);

// ─── Tabs ───
const TABS = [
  { id: "config", label: "1. Configuration", icon: "⚙️" },
  { id: "benefits", label: "2. Benefits", icon: "📈" },
  { id: "investment", label: "3. Investment", icon: "💰" },
  { id: "summary", label: "4. Business Case", icon: "📊" },
  { id: "xref", label: "Toolkit Map", icon: "🔗" },
];

// ─── Main Component ───
export default function BusinessCaseBuilder() {
  const [activeTab, setActiveTab] = useState("config");
  const [currentTier, setCurrentTier] = useState(1);
  const [targetTier, setTargetTier] = useState(3);

  // Client parameters
  const [clientParams, setClientParams] = useState({
    companyName: "Client Co.",
    annualRevenue: 500, // €M
    invoiceVolume: 120000, // annual
    disputeVolume: 4800, // annual
    arFTEs: 25,
    avgFTECost: 55, // €k fully loaded
    discountEligibleSpend: 80, // €M
    avgDiscountRate: 2, // %
    timelineMonths: 18,
    discountRate: 8, // % WACC
  });

  // Override toggles for benefits
  const [benefitOverrides] = useState({});
  const [investmentOverrides, setInvestmentOverrides] = useState({});

  const updateClient = (key, val) => setClientParams((p) => ({ ...p, [key]: val }));

  const getBenchmark = (lever, tier) => {
    const tierKey = `tier${tier}`;
    return lever.benchmarks[tierKey] || lever.benchmarks.tier1;
  };

  // ─── Benefit Calculations ───
  const benefits = useMemo(() => {
    return BENEFIT_LEVERS.map((lever) => {
      const from = getBenchmark(lever, currentTier);
      const to = getBenchmark(lever, targetTier);
      const override = benefitOverrides[lever.id] || {};
      const currentVal = override.current ?? from.current;
      const targetVal = override.target ?? to.target;
      const delta = currentVal - targetVal;

      let annualBenefit = 0;
      let explanation = "";

      switch (lever.calcType) {
        case "cashflow": {
          // DSO: freed cash = revenue/365 * days_reduced
          const dailyRev = (clientParams.annualRevenue * 1e6) / 365;
          const freedCash = dailyRev * delta;
          annualBenefit = freedCash * (clientParams.discountRate / 100);
          explanation = `${delta} days × €${(dailyRev / 1000).toFixed(0)}k/day = €${(freedCash / 1e6).toFixed(1)}M freed → ${clientParams.discountRate}% WACC`;
          break;
        }
        case "percentage": {
          annualBenefit = (delta / 100) * clientParams.annualRevenue * 1e6;
          explanation = `${delta.toFixed(2)}pp × €${clientParams.annualRevenue}M revenue`;
          break;
        }
        case "unit_cost": {
          if (lever.id === "disputes") {
            annualBenefit = delta * clientParams.disputeVolume;
            explanation = `€${delta} saving × ${clientParams.disputeVolume.toLocaleString()} disputes`;
          } else {
            annualBenefit = delta * clientParams.invoiceVolume;
            explanation = `€${delta.toFixed(1)} saving × ${clientParams.invoiceVolume.toLocaleString()} invoices`;
          }
          break;
        }
        case "fte_saving": {
          const autoImprovement = (targetVal - currentVal) / 100;
          const ftesFreed = autoImprovement * clientParams.arFTEs * 0.4; // 40% of AR FTEs touch cash app
          annualBenefit = ftesFreed * clientParams.avgFTECost * 1000;
          explanation = `${(autoImprovement * 100).toFixed(0)}pp auto-match uplift → ${ftesFreed.toFixed(1)} FTEs × €${clientParams.avgFTECost}k`;
          break;
        }
        case "direct_saving": {
          annualBenefit = delta * 1000;
          explanation = `€${currentVal}k → €${targetVal}k annual compliance cost`;
          break;
        }
        case "fte_redeploy": {
          annualBenefit = targetVal * clientParams.avgFTECost * 1000;
          explanation = `${targetVal} FTEs × €${clientParams.avgFTECost}k fully loaded cost`;
          break;
        }
        case "discount_capture": {
          const additionalCapture = (targetVal - currentVal) / 100;
          annualBenefit = additionalCapture * clientParams.discountEligibleSpend * 1e6 * (clientParams.avgDiscountRate / 100);
          explanation = `${(additionalCapture * 100).toFixed(0)}pp more × €${clientParams.discountEligibleSpend}M × ${clientParams.avgDiscountRate}%`;
          break;
        }
      }

      return {
        ...lever,
        currentVal,
        targetVal,
        delta,
        annualBenefit: Math.max(0, annualBenefit),
        explanation,
      };
    });
  }, [clientParams, currentTier, targetTier, benefitOverrides]);

  const totalAnnualBenefit = benefits.reduce((s, b) => s + b.annualBenefit, 0);

  // ─── Investment Calculations ───
  const investments = useMemo(() => {
    const fromKey = `tier${currentTier}`;
    const toKey = `tier${targetTier}`;
    return INVESTMENT_CATEGORIES.map((cat) => {
      const override = investmentOverrides[cat.id];
      // Investment = difference between target tier cost and current tier cost
      const defaultVal = Math.max(0, cat.default[toKey] - cat.default[fromKey]);
      const value = override ?? defaultVal;
      return { ...cat, value, isRecurring: cat.id === "ongoing" };
    });
  }, [currentTier, targetTier, investmentOverrides]);

  const totalOneOff = investments.filter((i) => !i.isRecurring).reduce((s, i) => s + i.value, 0);
  const totalRecurring = investments.filter((i) => i.isRecurring).reduce((s, i) => s + i.value, 0);
  const totalInvestmentY1 = totalOneOff + totalRecurring;

  // ─── ROI Metrics ───
  const roi = useMemo(() => {
    const annBenK = totalAnnualBenefit / 1000;
    const netY1 = annBenK - totalInvestmentY1;
    const netY2 = annBenK - totalRecurring;
    const netY3 = annBenK - totalRecurring;
    const cumulative3Y = netY1 + netY2 + netY3;
    const roiPct = totalInvestmentY1 > 0 ? ((annBenK - totalRecurring) / totalInvestmentY1) * 100 : 0;
    const paybackMonths = totalInvestmentY1 > 0 ? (totalInvestmentY1 / (annBenK / 12)) : 0;

    // NPV calculation (3-year)
    const r = clientParams.discountRate / 100;
    const npv = -totalInvestmentY1 + (annBenK - totalRecurring) / (1 + r) + (annBenK - totalRecurring) / Math.pow(1 + r, 2) + (annBenK - totalRecurring) / Math.pow(1 + r, 3);

    return {
      annBenK,
      netY1,
      netY2,
      netY3,
      cumulative3Y,
      roiPct,
      paybackMonths,
      npv,
      totalInvK: totalInvestmentY1,
    };
  }, [totalAnnualBenefit, totalInvestmentY1, totalRecurring, clientParams.discountRate]);

  // ─── Render Tabs ───
  const renderConfig = () => (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Tier Selection */}
      <Card>
        <SectionTitle sub="Select current and target maturity levels (maps to 1.6 AR Maturity Assessment)">Maturity Tier Transition</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "20px", alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current State</div>
            {TIERS.map((t) => (
              <div
                key={t.id}
                onClick={() => { if (t.id < targetTier) setCurrentTier(t.id); }}
                style={{
                  padding: "10px 14px",
                  marginBottom: "6px",
                  borderRadius: T.radius,
                  border: `1px solid ${currentTier === t.id ? t.color : T.border}`,
                  background: currentTier === t.id ? t.bg : "transparent",
                  cursor: t.id < targetTier ? "pointer" : "not-allowed",
                  opacity: t.id >= targetTier ? 0.35 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontFamily: T.font, fontSize: "13px", color: currentTier === t.id ? t.color : T.textMuted, fontWeight: currentTier === t.id ? 600 : 400 }}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingTop: "32px", fontSize: "24px", color: T.textDim }}>→</div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Target State</div>
            {TIERS.map((t) => (
              <div
                key={t.id}
                onClick={() => { if (t.id > currentTier) setTargetTier(t.id); }}
                style={{
                  padding: "10px 14px",
                  marginBottom: "6px",
                  borderRadius: T.radius,
                  border: `1px solid ${targetTier === t.id ? t.color : T.border}`,
                  background: targetTier === t.id ? t.bg : "transparent",
                  cursor: t.id > currentTier ? "pointer" : "not-allowed",
                  opacity: t.id <= currentTier ? 0.35 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontFamily: T.font, fontSize: "13px", color: targetTier === t.id ? t.color : T.textMuted, fontWeight: targetTier === t.id ? 600 : 400 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Client Parameters */}
      <Card>
        <SectionTitle sub="Key financial parameters driving benefit calculations">Client Profile</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { key: "companyName", label: "Company Name", type: "text" },
            { key: "annualRevenue", label: "Annual Revenue", suffix: "€M", step: 10 },
            { key: "invoiceVolume", label: "Annual Invoice Volume", step: 1000 },
            { key: "disputeVolume", label: "Annual Dispute Volume", step: 100 },
            { key: "arFTEs", label: "AR / OtC FTEs", step: 1 },
            { key: "avgFTECost", label: "Avg FTE Cost (fully loaded)", suffix: "€k", step: 5 },
            { key: "discountEligibleSpend", label: "Discount-Eligible Spend", suffix: "€M", step: 5 },
            { key: "avgDiscountRate", label: "Avg Early Pay Discount", suffix: "%", step: 0.25 },
            { key: "timelineMonths", label: "Implementation Timeline", suffix: "months", step: 3 },
            { key: "discountRate", label: "Discount Rate (WACC)", suffix: "%", step: 0.5 },
          ].map((field) => (
            <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{field.label}</label>
              {field.type === "text" ? (
                <input
                  value={clientParams[field.key]}
                  onChange={(e) => updateClient(field.key, e.target.value)}
                  style={{
                    padding: "8px 10px",
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: "6px",
                    color: T.text,
                    fontFamily: T.font,
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    value={clientParams[field.key]}
                    onChange={(e) => updateClient(field.key, parseFloat(e.target.value) || 0)}
                    step={field.step}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      background: T.bg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "6px",
                      color: T.accent,
                      fontFamily: T.mono,
                      fontSize: "13px",
                      textAlign: "right",
                      outline: "none",
                    }}
                  />
                  {field.suffix && <span style={{ fontFamily: T.mono, fontSize: "12px", color: T.textDim, minWidth: "40px" }}>{field.suffix}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderBenefits = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      {/* Summary bar */}
      <Card glow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Annual Benefit</div>
            <div style={{ fontFamily: T.mono, fontSize: "28px", fontWeight: 700, color: T.green }}>{fmt(totalAnnualBenefit)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>as % of revenue</div>
            <div style={{ fontFamily: T.mono, fontSize: "20px", color: T.accent }}>{pct((totalAnnualBenefit / (clientParams.annualRevenue * 1e6)) * 100)}</div>
          </div>
        </div>
      </Card>

      {/* Benefit bars */}
      <div style={{ display: "grid", gap: "2px" }}>
        {benefits
          .sort((a, b) => b.annualBenefit - a.annualBenefit)
          .map((b) => {
            const maxBenefit = Math.max(...benefits.map((x) => x.annualBenefit));
            const barWidth = maxBenefit > 0 ? (b.annualBenefit / maxBenefit) * 100 : 0;
            return (
              <Card key={b.id} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{b.name}</span>
                      <Badge>{b.apqc}</Badge>
                    </div>
                    <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim }}>{b.description}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "100px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 700, color: T.green }}>{fmt(b.annualBenefit)}</div>
                    <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>/year</div>
                  </div>
                </div>

                {/* Bar */}
                <div style={{ height: "4px", background: T.bg, borderRadius: "2px", marginBottom: "8px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barWidth}%`, background: `linear-gradient(90deg, ${T.green}, ${T.accent})`, borderRadius: "2px", transition: "width 0.4s ease" }} />
                </div>

                {/* Detail row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontFamily: T.mono, fontSize: "12px", color: T.textMuted }}>
                      {b.currentVal} → {b.targetVal} {b.unit}
                    </span>
                    <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>({b.explanation})</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {b.toolkit.map((ref) => (
                      <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>
                        {ref}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );

  const renderInvestment = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>One-off Investment</div>
            <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: T.amber }}>{fmt(totalOneOff * 1000)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Run Cost</div>
            <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: T.amber }}>{fmt(totalRecurring * 1000)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Year 1 Total</div>
            <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: T.red }}>{fmt(totalInvestmentY1 * 1000)}</div>
          </div>
        </div>
      </Card>

      {investments.map((inv) => (
        <Card key={inv.id} style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{inv.icon}</span>
              <div>
                <div style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{inv.name}</div>
                {inv.isRecurring && <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.amber }}>recurring annually</span>}
              </div>
            </div>
            <NumberInput
              value={inv.value}
              onChange={(v) => setInvestmentOverrides((p) => ({ ...p, [inv.id]: v }))}
              prefix="€"
              suffix="k"
              width="90px"
            />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderSummary = () => {
    const years = [
      { label: "Year 1", benefit: roi.annBenK, cost: roi.totalInvK, net: roi.netY1 },
      { label: "Year 2", benefit: roi.annBenK, cost: totalRecurring, net: roi.netY2 },
      { label: "Year 3", benefit: roi.annBenK, cost: totalRecurring, net: roi.netY3 },
    ];
    const maxVal = Math.max(...years.map((y) => Math.max(y.benefit, y.cost)));

    return (
      <div style={{ display: "grid", gap: "16px" }}>
        {/* Hero metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { label: "3-Year NPV", value: fmt(roi.npv * 1000), color: roi.npv > 0 ? T.green : T.red, sub: `@ ${clientParams.discountRate}% WACC` },
            { label: "Annual ROI", value: `${roi.roiPct.toFixed(0)}%`, color: roi.roiPct > 100 ? T.green : roi.roiPct > 0 ? T.amber : T.red, sub: "net benefit / investment" },
            { label: "Payback Period", value: `${roi.paybackMonths.toFixed(1)} mo`, color: roi.paybackMonths < 12 ? T.green : roi.paybackMonths < 24 ? T.amber : T.red, sub: "months to break-even" },
            { label: "3-Year Cumulative", value: fmt(roi.cumulative3Y * 1000), color: T.accent, sub: "total net benefit" },
          ].map((m, i) => (
            <Card key={i} glow={i === 0}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{m.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: "22px", fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim, marginTop: "2px" }}>{m.sub}</div>
            </Card>
          ))}
        </div>

        {/* Year-by-year waterfall */}
        <Card>
          <SectionTitle sub="Annual benefit vs. cost comparison with cumulative net position">3-Year P&L Waterfall</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {years.map((y, i) => {
              let cumNet = 0;
              for (let j = 0; j <= i; j++) cumNet += years[j].net;
              return (
                <div key={i}>
                  <div style={{ fontFamily: T.font, fontSize: "13px", fontWeight: 600, color: T.text, marginBottom: "10px" }}>{y.label}</div>
                  {/* Benefit bar */}
                  <div style={{ marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Benefit</span>
                      <span style={{ fontFamily: T.mono, fontSize: "12px", color: T.green }}>{fmt(y.benefit * 1000)}</span>
                    </div>
                    <div style={{ height: "8px", background: T.bg, borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${maxVal > 0 ? (y.benefit / maxVal) * 100 : 0}%`, background: T.green, borderRadius: "4px" }} />
                    </div>
                  </div>
                  {/* Cost bar */}
                  <div style={{ marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Cost</span>
                      <span style={{ fontFamily: T.mono, fontSize: "12px", color: T.red }}>{fmt(y.cost * 1000)}</span>
                    </div>
                    <div style={{ height: "8px", background: T.bg, borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${maxVal > 0 ? (y.cost / maxVal) * 100 : 0}%`, background: T.red, borderRadius: "4px" }} />
                    </div>
                  </div>
                  {/* Net */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${T.border}` }}>
                    <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>Net</span>
                    <span style={{ fontFamily: T.mono, fontSize: "14px", fontWeight: 700, color: y.net >= 0 ? T.green : T.red }}>{fmt(y.net * 1000)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Cumulative</span>
                    <span style={{ fontFamily: T.mono, fontSize: "12px", color: cumNet >= 0 ? T.accent : T.amber }}>{fmt(cumNet * 1000)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sensitivity callout */}
        <Card>
          <SectionTitle sub="What happens if benefits are realized at 50%, 75%, or 125% of modeled values">Sensitivity Analysis</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { label: "Conservative (50%)", factor: 0.5 },
              { label: "Moderate (75%)", factor: 0.75 },
              { label: "Base Case (100%)", factor: 1.0 },
              { label: "Upside (125%)", factor: 1.25 },
            ].map((scenario) => {
              const adjBen = roi.annBenK * scenario.factor;
              const adjNPV = -roi.totalInvK + (adjBen - totalRecurring) / (1 + clientParams.discountRate / 100) + (adjBen - totalRecurring) / Math.pow(1 + clientParams.discountRate / 100, 2) + (adjBen - totalRecurring) / Math.pow(1 + clientParams.discountRate / 100, 3);
              const adjPayback = roi.totalInvK > 0 ? roi.totalInvK / (adjBen / 12) : 0;
              return (
                <div
                  key={scenario.label}
                  style={{
                    padding: "12px",
                    borderRadius: T.radius,
                    border: `1px solid ${scenario.factor === 1 ? T.accent : T.border}`,
                    background: scenario.factor === 1 ? T.accentDim : "transparent",
                  }}
                >
                  <div style={{ fontFamily: T.font, fontSize: "12px", fontWeight: 600, color: scenario.factor === 1 ? T.accent : T.textMuted, marginBottom: "8px" }}>{scenario.label}</div>
                  <div style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 700, color: adjNPV >= 0 ? T.green : T.red, marginBottom: "4px" }}>{fmt(adjNPV * 1000)}</div>
                  <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>NPV</div>
                  <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.textMuted, marginTop: "6px" }}>{adjPayback.toFixed(1)} mo payback</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Executive summary */}
        <Card>
          <SectionTitle>Executive Summary</SectionTitle>
          <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted, lineHeight: 1.7 }}>
            <p>
              Moving <strong style={{ color: T.text }}>{clientParams.companyName}</strong> from{" "}
              <Badge color={TIERS[currentTier - 1].color} bg={TIERS[currentTier - 1].bg}>{TIERS[currentTier - 1].tag}</Badge>
              {" → "}
              <Badge color={TIERS[targetTier - 1].color} bg={TIERS[targetTier - 1].bg}>{TIERS[targetTier - 1].tag}</Badge>
              {" "}maturity across the Order-to-Cash value stream generates an estimated <strong style={{ color: T.green }}>{fmt(totalAnnualBenefit)}</strong> in
              annualized benefits against a Year 1 investment of <strong style={{ color: T.amber }}>{fmt(totalInvestmentY1 * 1000)}</strong>.
            </p>
            <p>
              The transformation achieves payback in <strong style={{ color: T.accent }}>{roi.paybackMonths.toFixed(1)} months</strong> with
              a 3-year NPV of <strong style={{ color: roi.npv > 0 ? T.green : T.red }}>{fmt(roi.npv * 1000)}</strong> at
              {" "}{clientParams.discountRate}% WACC. Even at 50% benefit realization, the business case remains{" "}
              {(() => {
                const conservNPV = -roi.totalInvK + (roi.annBenK * 0.5 - totalRecurring) / (1 + clientParams.discountRate / 100) + (roi.annBenK * 0.5 - totalRecurring) / Math.pow(1 + clientParams.discountRate / 100, 2) + (roi.annBenK * 0.5 - totalRecurring) / Math.pow(1 + clientParams.discountRate / 100, 3);
                return conservNPV > 0 ? <strong style={{ color: T.green }}>NPV-positive</strong> : <strong style={{ color: T.red }}>NPV-negative at conservative assumptions</strong>;
              })()}.
            </p>
            <p style={{ color: T.textDim, fontSize: "12px", marginTop: "12px" }}>
              Benefit quantification methodology aligned to APQC PCF v8.0 process codes. Benchmarks sourced from APQC Open Standards and Hackett Group 2026 peer data. All figures in EUR.
              Toolkit deliverables referenced: {Object.keys(CROSS_REFS).join(", ")}.
            </p>
          </div>
        </Card>
      </div>
    );
  };

  const renderXRef = () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <Card>
        <SectionTitle sub="How each benefit lever maps to toolkit deliverables — click a deliverable to see which levers it supports">Benefit ↔ Deliverable Matrix</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>Benefit Lever</th>
                {Object.entries(CROSS_REFS).map(([code]) => (
                  <th key={code} style={{ padding: "8px 4px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px", textAlign: "center", minWidth: "36px" }}>
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BENEFIT_LEVERS.map((lever) => (
                <tr key={lever.id}>
                  <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>
                    {lever.name}
                    <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim, marginLeft: "6px" }}>{lever.apqc}</span>
                  </td>
                  {Object.keys(CROSS_REFS).map((code) => (
                    <td key={code} style={{ padding: "4px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                      {lever.toolkit.includes(code) ? (
                        <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: T.accent }} />
                      ) : (
                        <span style={{ color: T.border }}>·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deliverable index */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {Object.entries(CROSS_REFS).map(([code, ref]) => {
          const leversUsing = BENEFIT_LEVERS.filter((l) => l.toolkit.includes(code));
          return (
            <Card key={code} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Badge color={ref.phase === 1 ? T.accent : T.purple} bg={ref.phase === 1 ? T.accentDim : T.purpleDim}>
                    P{ref.phase} · {code}
                  </Badge>
                  <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text, marginLeft: "8px" }}>{ref.name}</span>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: "12px", color: T.textDim }}>{leversUsing.length} levers</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        fontFamily: T.font,
        background: T.bg,
        color: T.text,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Badge color={T.bg} bg={T.accent}>3.5</Badge>
          <Badge>PHASE 3</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC 8.0</Badge>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "26px", fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
          OtC Transformation Business Case Builder
        </h1>
        <p style={{ fontFamily: T.font, fontSize: "14px", color: T.textDim, margin: 0 }}>
          ROI calculator · Benefit quantification · Investment model · Sensitivity analysis
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", borderBottom: `1px solid ${T.border}`, paddingBottom: "0" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? T.accent : "transparent"}`,
              color: activeTab === tab.id ? T.accent : T.textDim,
              fontFamily: T.font,
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              marginBottom: "-1px",
            }}
          >
            <span style={{ marginRight: "6px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "config" && renderConfig()}
        {activeTab === "benefits" && renderBenefits()}
        {activeTab === "investment" && renderInvestment()}
        {activeTab === "summary" && renderSummary()}
        {activeTab === "xref" && renderXRef()}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "32px", padding: "16px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>
          OtC Consulting Toolkit · Phase 3 · v3.5.0
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>Benchmarks: APQC + Hackett</Badge>
        </div>
      </div>
    </div>
  );
}
