import { useState, useMemo } from "react";
import { useLiveActuals } from "./liveActuals";

/* ═══════════════════════════════════════════════════════════════
   3.3 Treasury & Working Capital Optimization
   Phase 3 — OtC Strategic Value
   APQC PCF v8.0: 8.3.4 Manage Accounts Receivable / 8.1 Treasury
   Cross-references: 1.1–1.6, 2.1–2.6, 3.5, KPI Spec
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

const fmt = (n, dec = 0) => {
  if (Math.abs(n) >= 1e6) return `€${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `€${(n / 1e3).toFixed(dec > 0 ? 1 : 0)}k`;
  return `€${n.toFixed(dec)}`;
};

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
  "3.5": { name: "Business Case Builder", phase: 3 },
  "KPI": { name: "KPI Specification Document", phase: 1 },
};

// ─── Shared UI ───
const Card = ({ children, style, glow }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
    padding: "20px", ...(glow ? { boxShadow: `0 0 20px ${T.accentGlow}, inset 0 1px 0 ${T.borderHover}` } : {}), ...style,
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
const NumInput = ({ value, onChange, prefix, suffix, width, step }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {prefix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{prefix}</span>}
    <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} step={step || 1}
      style={{
        width: width || "80px", padding: "6px 8px", background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: "6px", color: T.accent, fontFamily: T.mono, fontSize: "13px", textAlign: "right", outline: "none",
      }}
      onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
    {suffix && <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.textDim }}>{suffix}</span>}
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{label}</label>
    {children}
  </div>
);

const TABS = [
  { id: "dso", label: "1. DSO Levers", icon: "🎯" },
  { id: "scf", label: "2. SCF / Discounting", icon: "⚡" },
  { id: "forecast", label: "3. Cash Forecast", icon: "📉" },
  { id: "cockpit", label: "4. WC Cockpit", icon: "🧭" },
  { id: "epRoi", label: "5. Early Pay ROI", icon: "💎" },
  { id: "xref", label: "Toolkit Map", icon: "🔗" },
];

// ─── DSO Reduction Levers ───
const DSO_LEVERS = [
  { id: "credit", name: "Credit Policy Tightening", impact: "high", dsoReduction: [3, 7], effort: "medium",
    actions: ["Implement automated credit scoring (→ 2.1)", "Set dynamic credit limits by segment", "Auto-block orders at limit breach", "Monthly portfolio review cadence"],
    toolkit: ["2.1", "1.6"], apqc: "8.3.2" },
  { id: "billing", name: "Invoice Accuracy & Speed", impact: "high", dsoReduction: [2, 5], effort: "low",
    actions: ["Same-day invoicing policy", "E-invoicing adoption (→ 1.4)", "Invoice validation before send", "PO matching automation"],
    toolkit: ["2.3", "1.4"], apqc: "8.3.1" },
  { id: "collections", name: "Proactive Collections", impact: "high", dsoReduction: [5, 12], effort: "medium",
    actions: ["Risk-based worklist prioritization (→ 1.3)", "Automated dunning sequences by segment", "Promise-to-pay tracking", "Escalation SLA enforcement"],
    toolkit: ["1.3", "1.5"], apqc: "8.3.4.3" },
  { id: "disputes", name: "Dispute Prevention", impact: "medium", dsoReduction: [2, 6], effort: "high",
    actions: ["Root-cause categorization matrix (→ 2.2)", "Cross-functional prevention programs", "First-call resolution targets", "Deduction auto-coding"],
    toolkit: ["2.2", "2.3"], apqc: "8.3.3" },
  { id: "cashApp", name: "Cash Application Automation", impact: "medium", dsoReduction: [1, 3], effort: "medium",
    actions: ["AI-based remittance matching (→ 1.2)", "Bank file auto-ingestion", "Exception queue optimization", "Same-day posting SLA"],
    toolkit: ["1.2", "2.5"], apqc: "8.3.4.1" },
  { id: "terms", name: "Payment Terms Optimization", impact: "medium", dsoReduction: [3, 8], effort: "low",
    actions: ["Terms harmonization by customer tier", "Early payment incentive programs", "Dynamic discounting deployment", "Contract terms audit"],
    toolkit: ["2.1", "3.5"], apqc: "8.3.2" },
  { id: "process", name: "Process Mining & Elimination", impact: "medium", dsoReduction: [1, 4], effort: "high",
    actions: ["OtC process mining (→ 2.5)", "Variant analysis for slow paths", "Bottleneck identification", "Automation of top-5 manual steps"],
    toolkit: ["2.5", "1.1"], apqc: "8.3" },
];

// ─── SCF Models ───
const SCF_MODELS = [
  { id: "reverseFact", name: "Reverse Factoring (SCF)", description: "Buyer-led program: suppliers get early payment at buyer's credit cost. Bank pays supplier early, buyer pays bank at maturity.",
    pros: ["Extends buyer DPO", "Suppliers get cheaper funding", "Off-balance-sheet (depends on structure)", "Strengthens supply chain"],
    cons: ["Requires bank/platform partnership", "Accounting treatment scrutiny (IFRS)", "Supplier onboarding effort", "Minimum volume thresholds"],
    bestFor: "Large buyers with investment-grade credit, diverse supplier base, DPO > 45 days",
    typicalCost: "SOFR/EURIBOR + 50-150bps", toolkit: ["3.5"] },
  { id: "dynDiscount", name: "Dynamic Discounting", description: "Buyer offers sliding-scale early payment discounts using own cash. Discount rate decreases as payment approaches due date.",
    pros: ["No bank needed — use own cash", "Flexible, supplier self-service", "Attractive yield on excess cash (12-36% APR equiv)", "Quick to deploy"],
    cons: ["Requires excess cash position", "Lower supplier participation vs SCF", "Manual tracking without platform", "Discount expense hits P&L"],
    bestFor: "Cash-rich companies, mid-market, seasonal cash surplus deployment",
    typicalCost: "Self-funded (2% @ 20 days = ~36% APR yield)", toolkit: ["3.5", "1.5"] },
  { id: "factoring", name: "AR Factoring / Invoice Discounting", description: "Sell receivables to a factor at a discount. Immediate cash, factor assumes collection risk (non-recourse) or doesn't (recourse).",
    pros: ["Immediate cash conversion", "Non-recourse = risk transfer", "No debt on balance sheet", "Scales with revenue"],
    cons: ["Expensive (1-5% discount)", "Customer notification (disclosed)", "Recourse clauses common", "Loss of customer relationship control"],
    bestFor: "High-growth companies, cash-constrained, concentrated customer base",
    typicalCost: "1-5% of invoice value", toolkit: ["2.1", "1.3"] },
  { id: "securitization", name: "AR Securitization", description: "Pool receivables into an SPV, issue asset-backed securities. Institutional-grade working capital program.",
    pros: ["Lowest funding cost at scale", "Off-balance-sheet (true sale)", "Diversified funding source", "Large-volume capacity"],
    cons: ["Complex setup (6-12 months)", "High minimum volume (€50M+)", "Ongoing reporting/servicing", "Rating agency requirements"],
    bestFor: "Large corporates with €100M+ AR, stable receivables portfolio, sophisticated treasury",
    typicalCost: "SOFR/EURIBOR + 30-80bps + setup costs", toolkit: ["2.4", "3.5"] },
];

// ─── Aging Buckets for Forecast ───
const DEFAULT_AGING = [
  { bucket: "Current (0-30)", pct: 55, collectRate: 95, avgDays: 15 },
  { bucket: "31-60 days", pct: 25, collectRate: 90, avgDays: 45 },
  { bucket: "61-90 days", pct: 12, collectRate: 80, avgDays: 75 },
  { bucket: "91-120 days", pct: 5, collectRate: 60, avgDays: 105 },
  { bucket: "120+ days", pct: 3, collectRate: 30, avgDays: 150 },
];

export default function TreasuryWorkingCapital() {
  const live = useLiveActuals();
  const [activeTab, setActiveTab] = useState("dso");

  // ─── Shared client params (DSO + AR seeded from live actuals so the
  //     working-capital model ties out with the Command Center on open) ───
  const [params, setParams] = useState({
    revenue: 500, // €M
    arBalance: live ? live.totalARm : 75, // €M
    apBalance: 60, // €M
    inventoryBalance: 45, // €M
    cogs: 350, // €M
    currentDSO: live ? live.dso : 55,
    currentDPO: 40,
    currentDIO: 47,
    wacc: 8,
    excessCash: 30, // €M
    supplierCount: 850,
    avgInvoiceSize: 12, // €k
  });
  const upd = (k, v) => setParams(p => ({ ...p, [k]: v }));

  // ─── DSO Lever state ───
  const [selectedLevers, setSelectedLevers] = useState(new Set(["credit", "billing", "collections"]));
  const toggleLever = id => {
    setSelectedLevers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const dsoAnalysis = useMemo(() => {
    const selected = DSO_LEVERS.filter(l => selectedLevers.has(l.id));
    // Conservative: use low end of range, apply diminishing returns (80% stacking)
    let totalReduction = 0;
    selected.forEach((l, i) => {
      const base = l.dsoReduction[0] + (l.dsoReduction[1] - l.dsoReduction[0]) * 0.4; // mid-conservative
      totalReduction += base * Math.pow(0.85, i); // diminishing returns
    });
    totalReduction = Math.round(totalReduction);
    const newDSO = Math.max(params.currentDSO - totalReduction, 15);
    const dailyRev = (params.revenue * 1e6) / 365;
    const cashFreed = dailyRev * totalReduction;
    const annualBenefit = cashFreed * (params.wacc / 100);
    return { totalReduction, newDSO, cashFreed, annualBenefit, leverCount: selected.length };
  }, [selectedLevers, params]);

  // ─── Aging / Forecast state ───
  const [aging, setAging] = useState(DEFAULT_AGING);
  const [forecastWeeks, setForecastWeeks] = useState(13);
  const updateAging = (idx, key, val) => {
    setAging(prev => prev.map((a, i) => i === idx ? { ...a, [key]: val } : a));
  };

  const forecast = useMemo(() => {
    const weeklyRev = (params.revenue * 1e6) / 52;
    const weeks = [];
    let runningAR = params.arBalance * 1e6;
    for (let w = 1; w <= forecastWeeks; w++) {
      const newBillings = weeklyRev * (0.9 + Math.random() * 0.2); // slight variance
      let collections = 0;
      aging.forEach(a => {
        const bucketAR = runningAR * (a.pct / 100);
        const weeklyCollect = bucketAR * (a.collectRate / 100) / (a.avgDays / 7);
        collections += weeklyCollect;
      });
      collections = Math.min(collections, runningAR);
      runningAR = runningAR + newBillings - collections;
      weeks.push({ week: w, billings: newBillings, collections, arBalance: runningAR, netCash: collections - newBillings });
    }
    return weeks;
  }, [aging, forecastWeeks, params]);

  // ─── Working Capital Metrics ───
  const wcMetrics = useMemo(() => {
    const dso = params.currentDSO;
    const dpo = params.currentDPO;
    const dio = params.currentDIO;
    const ccc = dso + dio - dpo;
    const dailyRev = (params.revenue * 1e6) / 365;
    const dailyCOGS = (params.cogs * 1e6) / 365;
    const wcRequired = (dailyRev * dso) + (dailyCOGS * dio) - (dailyCOGS * dpo);
    const targetCCC = Math.max(ccc - dsoAnalysis.totalReduction, 10);
    const targetWC = wcRequired - (dailyRev * dsoAnalysis.totalReduction);
    return { dso, dpo, dio, ccc, wcRequired, targetCCC, targetWC, dailyRev, dailyCOGS, cashFreed: wcRequired - targetWC };
  }, [params, dsoAnalysis]);

  // ─── Early Payment ROI ───
  const [epParams, setEpParams] = useState({
    programSpend: 100, // €M eligible
    discountRate: 2, // %
    daysEarly: 20,
    participationRate: 40, // %
    fundingCost: 1, // % (own cash WACC opportunity cost)
  });
  const updEP = (k, v) => setEpParams(p => ({ ...p, [k]: v }));

  const epROI = useMemo(() => {
    const eligible = epParams.programSpend * 1e6;
    const participating = eligible * (epParams.participationRate / 100);
    const discountCost = participating * (epParams.discountRate / 100);
    const annualizedYield = (epParams.discountRate / 100) / (epParams.daysEarly / 365) * 100;
    const fundingCost = participating * (epParams.fundingCost / 100) * (epParams.daysEarly / 365);
    const netBenefit = discountCost - fundingCost;
    const dpoImpact = epParams.daysEarly * (epParams.participationRate / 100);
    return { eligible, participating, discountCost, annualizedYield, fundingCost, netBenefit, dpoImpact };
  }, [epParams]);

  // ═══ RENDER FUNCTIONS ═══

  const renderDSO = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card glow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Current DSO", value: `${params.currentDSO} days`, color: T.red },
            { label: "Projected DSO", value: `${dsoAnalysis.newDSO} days`, color: T.green },
            { label: "Cash Freed", value: fmt(dsoAnalysis.cashFreed), color: T.accent },
            { label: "Annual WACC Benefit", value: fmt(dsoAnalysis.annualBenefit), color: T.green },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: "22px", fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "12px", fontFamily: T.font, fontSize: "12px", color: T.textDim }}>
          {dsoAnalysis.leverCount} levers selected · Diminishing returns applied at 85% stacking factor · Links to 3.5 Business Case Builder DSO lever
        </div>
      </Card>

      {/* DSO waterfall bar */}
      <Card>
        <SectionTitle sub="Select levers to model combined DSO reduction impact">DSO Reduction Waterfall</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "160px", marginBottom: "16px", padding: "0 8px" }}>
          {/* Starting DSO bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.textMuted, marginBottom: "4px" }}>{params.currentDSO}d</span>
            <div style={{ width: "100%", height: `${(params.currentDSO / 70) * 140}px`, background: T.redDim, border: `1px solid ${T.red}`, borderRadius: "4px 4px 0 0" }} />
            <span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim, marginTop: "4px", textAlign: "center" }}>Current</span>
          </div>
          {/* Lever reduction bars */}
          {DSO_LEVERS.map(l => {
            const active = selectedLevers.has(l.id);
            const midImpact = (l.dsoReduction[0] + l.dsoReduction[1]) / 2;
            return (
              <div key={l.id} onClick={() => toggleLever(l.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, cursor: "pointer", opacity: active ? 1 : 0.35, transition: "opacity 0.2s" }}>
                <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.amber, marginBottom: "4px" }}>-{l.dsoReduction[0]}–{l.dsoReduction[1]}d</span>
                <div style={{
                  width: "100%", height: `${(midImpact / 70) * 140}px`,
                  background: active ? T.amberDim : T.surfaceAlt, border: `1px solid ${active ? T.amber : T.border}`,
                  borderRadius: "4px 4px 0 0", transition: "all 0.2s",
                }} />
                <span style={{ fontFamily: T.font, fontSize: "9px", color: T.textDim, marginTop: "4px", textAlign: "center", lineHeight: 1.2 }}>{l.name.split(" ")[0]}</span>
              </div>
            );
          })}
          {/* Target DSO bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.green, marginBottom: "4px" }}>{dsoAnalysis.newDSO}d</span>
            <div style={{ width: "100%", height: `${(dsoAnalysis.newDSO / 70) * 140}px`, background: T.greenDim, border: `1px solid ${T.green}`, borderRadius: "4px 4px 0 0" }} />
            <span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim, marginTop: "4px", textAlign: "center" }}>Target</span>
          </div>
        </div>
      </Card>

      {/* Lever detail cards */}
      {DSO_LEVERS.map(l => {
        const active = selectedLevers.has(l.id);
        return (
          <Card key={l.id} style={{ padding: "14px 16px", borderColor: active ? T.accent : T.border, cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => toggleLever(l.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${active ? T.accent : T.border}`, background: active ? T.accentDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: T.accent, transition: "all 0.2s" }}>{active ? "✓" : ""}</div>
                  <span style={{ fontFamily: T.font, fontSize: "14px", fontWeight: 600, color: T.text }}>{l.name}</span>
                  <Badge>{l.apqc}</Badge>
                  <Badge color={l.impact === "high" ? T.green : T.amber} bg={l.impact === "high" ? T.greenDim : T.amberDim}>{l.impact} impact</Badge>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginLeft: "26px" }}>
                  {l.actions.map((a, i) => (
                    <div key={i} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}>
                      <span style={{ color: T.textDim, marginRight: "6px" }}>›</span>{a}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: "90px" }}>
                <div style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: T.accent }}>{l.dsoReduction[0]}–{l.dsoReduction[1]}</div>
                <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>days reduction</div>
                <div style={{ display: "flex", gap: "4px", marginTop: "6px", justifyContent: "flex-end" }}>
                  {l.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderSCF = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Select the right working capital financing structure based on company profile and treasury objectives">Supply Chain Finance & Discount Program Comparison</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <Field label="Annual Addressable Spend"><NumInput value={params.revenue} onChange={v => upd("revenue", v)} suffix="€M" /></Field>
          <Field label="Excess Cash Position"><NumInput value={params.excessCash} onChange={v => upd("excessCash", v)} suffix="€M" /></Field>
          <Field label="Supplier Count"><NumInput value={params.supplierCount} onChange={v => upd("supplierCount", v)} /></Field>
          <Field label="WACC / Hurdle Rate"><NumInput value={params.wacc} onChange={v => upd("wacc", v)} suffix="%" step={0.5} /></Field>
        </div>
      </Card>

      {SCF_MODELS.map(m => (
        <Card key={m.id} style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontFamily: T.font, fontSize: "16px", fontWeight: 700, color: T.text, marginBottom: "4px" }}>{m.name}</div>
              <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted, maxWidth: "600px" }}>{m.description}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase" }}>Typical Cost</div>
              <div style={{ fontFamily: T.mono, fontSize: "13px", color: T.amber }}>{m.typicalCost}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.green, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.08em" }}>Advantages</div>
              {m.pros.map((p, i) => <div key={i} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.green, marginRight: "6px" }}>+</span>{p}</div>)}
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.red, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.08em" }}>Considerations</div>
              {m.cons.map((c, i) => <div key={i} style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, padding: "2px 0" }}><span style={{ color: T.red, marginRight: "6px" }}>−</span>{c}</div>)}
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.accent, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.08em" }}>Best For</div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted }}>{m.bestFor}</div>
              <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                {m.toolkit.map(ref => <Badge key={ref} color={T.textMuted} bg={T.surfaceAlt}>{ref}</Badge>)}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Decision matrix */}
      <Card>
        <SectionTitle sub="Quick-reference decision framework">Program Selection Matrix</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["Criterion", "Reverse Factoring", "Dynamic Discounting", "AR Factoring", "AR Securitization"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Min. Volume", "€20M+", "€5M+", "€1M+", "€50M+"],
                ["Setup Time", "3-6 mo", "1-3 mo", "2-4 wk", "6-12 mo"],
                ["Funding Source", "Bank", "Own cash", "Factor", "Capital markets"],
                ["Cost Level", "Low", "Self-funded yield", "Medium-High", "Lowest at scale"],
                ["Balance Sheet", "Off (if true sale)", "On", "Off (non-recourse)", "Off (true sale)"],
                ["Complexity", "Medium", "Low", "Low", "High"],
                ["Supplier Impact", "Positive", "Positive", "Neutral", "None"],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "8px", color: j === 0 ? T.textMuted : T.text, borderBottom: `1px solid ${T.border}`, fontFamily: j === 0 ? T.font : T.mono, fontSize: j === 0 ? "12px" : "11px" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderForecast = () => {
    const maxAR = Math.max(...forecast.map(w => w.arBalance));
    const maxFlow = Math.max(...forecast.map(w => Math.max(w.billings, w.collections)));
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="Adjust aging distribution and collection rates to model cash inflow scenarios">AR Aging Profile & Collection Assumptions</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Aging Bucket", "% of AR", "Collection Rate", "Avg Days to Collect"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aging.map((a, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 500 }}>{a.bucket}</td>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
                      <NumInput value={a.pct} onChange={v => updateAging(i, "pct", v)} suffix="%" width="60px" />
                    </td>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
                      <NumInput value={a.collectRate} onChange={v => updateAging(i, "collectRate", v)} suffix="%" width="60px" />
                    </td>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
                      <NumInput value={a.avgDays} onChange={v => updateAging(i, "avgDays", v)} suffix="d" width="60px" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" }}>
            <Field label="Starting AR Balance"><NumInput value={params.arBalance} onChange={v => upd("arBalance", v)} suffix="€M" /></Field>
            <Field label="Forecast Horizon"><NumInput value={forecastWeeks} onChange={v => setForecastWeeks(Math.min(Math.max(v, 4), 52))} suffix="weeks" /></Field>
          </div>
        </Card>

        {/* AR Balance Trend */}
        <Card>
          <SectionTitle sub="Projected AR balance based on aging assumptions and revenue run-rate">AR Balance Forecast</SectionTitle>
          <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "2px", padding: "0 4px" }}>
            {forecast.map((w, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "100%", height: `${(w.arBalance / maxAR) * 160}px`,
                  background: `linear-gradient(180deg, ${T.accent}40, ${T.accent}15)`,
                  borderRadius: "3px 3px 0 0", border: `1px solid ${T.accent}30`, borderBottom: "none",
                  transition: "height 0.3s ease",
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px 0", borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim }}>Wk 1</span>
            <span style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim }}>Wk {forecastWeeks}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "16px" }}>
            {[
              { label: "Starting AR", value: fmt(forecast[0]?.arBalance || 0), color: T.textMuted },
              { label: "Ending AR", value: fmt(forecast[forecast.length - 1]?.arBalance || 0), color: T.accent },
              { label: "Total Collections", value: fmt(forecast.reduce((s, w) => s + w.collections, 0)), color: T.green },
              { label: "Total Billings", value: fmt(forecast.reduce((s, w) => s + w.billings, 0)), color: T.amber },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ fontFamily: T.mono, fontSize: "10px", color: T.textDim, textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 600, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly flow bars */}
        <Card>
          <SectionTitle sub="Weekly billings (amber) vs collections (green) — net cash impact">Cash Flow Comparison</SectionTitle>
          <div style={{ height: "140px", display: "flex", alignItems: "flex-end", gap: "2px" }}>
            {forecast.map((w, i) => (
              <div key={i} style={{ flex: 1, display: "flex", gap: "1px", alignItems: "flex-end" }}>
                <div style={{ flex: 1, height: `${(w.billings / maxFlow) * 120}px`, background: T.amberDim, border: `1px solid ${T.amber}30`, borderRadius: "2px 2px 0 0" }} />
                <div style={{ flex: 1, height: `${(w.collections / maxFlow) * 120}px`, background: T.greenDim, border: `1px solid ${T.green}30`, borderRadius: "2px 2px 0 0" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "2px", background: T.amberDim, border: `1px solid ${T.amber}50` }} /><span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Billings</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "2px", background: T.greenDim, border: `1px solid ${T.green}50` }} /><span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>Collections</span></div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCockpit = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      {/* CCC headline */}
      <Card glow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "DSO", value: `${wcMetrics.dso}d`, color: T.accent, sub: `AR: ${fmt(params.arBalance * 1e6)}` },
            { label: "DIO", value: `${wcMetrics.dio}d`, color: T.purple, sub: `Inv: ${fmt(params.inventoryBalance * 1e6)}` },
            { label: "DPO", value: `${wcMetrics.dpo}d`, color: T.amber, sub: `AP: ${fmt(params.apBalance * 1e6)}` },
            { label: "Cash Conversion Cycle", value: `${wcMetrics.ccc}d`, color: wcMetrics.ccc > 50 ? T.red : wcMetrics.ccc > 30 ? T.amber : T.green, sub: "DSO + DIO − DPO" },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: "26px", fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* CCC waterfall visual */}
      <Card>
        <SectionTitle sub="Visual decomposition of Cash Conversion Cycle — adjust inputs to model scenarios">CCC Waterfall</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto 1fr", gap: "12px", alignItems: "end", height: "200px", padding: "0 16px" }}>
          {/* DSO */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.accent, fontWeight: 600, marginBottom: "4px" }}>{wcMetrics.dso}d</span>
            <div style={{ width: "100%", height: `${(wcMetrics.dso / 80) * 160}px`, background: `linear-gradient(180deg, ${T.accent}50, ${T.accent}20)`, border: `1px solid ${T.accent}60`, borderRadius: "6px 6px 0 0", transition: "height 0.3s" }} />
            <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginTop: "6px" }}>DSO</span>
            <NumInput value={params.currentDSO} onChange={v => upd("currentDSO", v)} suffix="d" width="50px" />
          </div>
          {/* + */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "40px" }}>
            <span style={{ fontFamily: T.mono, fontSize: "20px", color: T.textDim }}>+</span>
          </div>
          {/* DIO */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.purple, fontWeight: 600, marginBottom: "4px" }}>{wcMetrics.dio}d</span>
            <div style={{ width: "100%", height: `${(wcMetrics.dio / 80) * 160}px`, background: `linear-gradient(180deg, ${T.purple}50, ${T.purple}20)`, border: `1px solid ${T.purple}60`, borderRadius: "6px 6px 0 0", transition: "height 0.3s" }} />
            <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginTop: "6px" }}>DIO</span>
            <NumInput value={params.currentDIO} onChange={v => upd("currentDIO", v)} suffix="d" width="50px" />
          </div>
          {/* − */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "40px" }}>
            <span style={{ fontFamily: T.mono, fontSize: "20px", color: T.textDim }}>−</span>
          </div>
          {/* DPO */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: T.mono, fontSize: "13px", color: T.amber, fontWeight: 600, marginBottom: "4px" }}>{wcMetrics.dpo}d</span>
            <div style={{ width: "100%", height: `${(wcMetrics.dpo / 80) * 160}px`, background: `linear-gradient(180deg, ${T.amber}50, ${T.amber}20)`, border: `1px solid ${T.amber}60`, borderRadius: "6px 6px 0 0", transition: "height 0.3s" }} />
            <span style={{ fontFamily: T.font, fontSize: "12px", color: T.textMuted, marginTop: "6px" }}>DPO</span>
            <NumInput value={params.currentDPO} onChange={v => upd("currentDPO", v)} suffix="d" width="50px" />
          </div>
        </div>
        {/* CCC result bar */}
        <div style={{ marginTop: "16px", padding: "12px 16px", background: T.bg, borderRadius: T.radius, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>Current CCC: </span>
            <span style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: T.text }}>{wcMetrics.ccc} days</span>
          </div>
          <div style={{ fontFamily: T.font, fontSize: "13px", color: T.textDim }}>→</div>
          <div>
            <span style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>Target CCC (with DSO levers): </span>
            <span style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: T.green }}>{wcMetrics.targetCCC} days</span>
          </div>
          <div>
            <span style={{ fontFamily: T.font, fontSize: "13px", color: T.textMuted }}>Cash freed: </span>
            <span style={{ fontFamily: T.mono, fontSize: "18px", fontWeight: 700, color: T.accent }}>{fmt(wcMetrics.cashFreed)}</span>
          </div>
        </div>
      </Card>

      {/* WC Parameters */}
      <Card>
        <SectionTitle sub="Underlying financials driving working capital metrics">Financial Profile</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { key: "revenue", label: "Annual Revenue", suffix: "€M" },
            { key: "cogs", label: "COGS", suffix: "€M" },
            { key: "arBalance", label: "AR Balance", suffix: "€M" },
            { key: "apBalance", label: "AP Balance", suffix: "€M" },
            { key: "inventoryBalance", label: "Inventory Balance", suffix: "€M" },
            { key: "wacc", label: "WACC", suffix: "%", step: 0.5 },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <NumInput value={params[f.key]} onChange={v => upd(f.key, v)} suffix={f.suffix} step={f.step} width="90px" />
            </Field>
          ))}
        </div>
      </Card>

      {/* Benchmarks */}
      <Card>
        <SectionTitle sub="APQC / Hackett peer benchmarks by industry quartile">Working Capital Benchmarks</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
            <thead>
              <tr>
                {["Metric", "Bottom Quartile", "Median", "Top Quartile", "Best-in-Class", "Your Position"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { metric: "DSO", bq: "58+", med: "42-57", tq: "30-41", bic: "<30", yours: params.currentDSO, unit: "d" },
                { metric: "DPO", bq: "<25", med: "25-39", tq: "40-55", bic: "55+", yours: params.currentDPO, unit: "d" },
                { metric: "DIO", bq: "65+", med: "45-64", tq: "30-44", bic: "<30", yours: params.currentDIO, unit: "d" },
                { metric: "CCC", bq: "75+", med: "45-74", tq: "25-44", bic: "<25", yours: wcMetrics.ccc, unit: "d" },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px", color: T.text, borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>{r.metric}</td>
                  <td style={{ padding: "8px", color: T.red, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px" }}>{r.bq}</td>
                  <td style={{ padding: "8px", color: T.amber, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px" }}>{r.med}</td>
                  <td style={{ padding: "8px", color: T.green, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px" }}>{r.tq}</td>
                  <td style={{ padding: "8px", color: T.accent, borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "11px" }}>{r.bic}</td>
                  <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: "13px", fontWeight: 700, color: T.text }}>{r.yours}{r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderEPROI = () => (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card>
        <SectionTitle sub="Model the return on deploying early payment programs — dynamic discounting or SCF">Early Payment Program Parameters</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <Field label="Eligible Spend"><NumInput value={epParams.programSpend} onChange={v => updEP("programSpend", v)} suffix="€M" /></Field>
          <Field label="Discount Rate Offered"><NumInput value={epParams.discountRate} onChange={v => updEP("discountRate", v)} suffix="%" step={0.25} /></Field>
          <Field label="Days Early"><NumInput value={epParams.daysEarly} onChange={v => updEP("daysEarly", v)} suffix="days" /></Field>
          <Field label="Supplier Participation"><NumInput value={epParams.participationRate} onChange={v => updEP("participationRate", v)} suffix="%" /></Field>
          <Field label="Funding Cost (WACC)"><NumInput value={epParams.fundingCost} onChange={v => updEP("fundingCost", v)} suffix="%" step={0.25} /></Field>
        </div>
      </Card>

      <Card glow>
        <SectionTitle>Program Economics</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { label: "Discount Income Earned", value: fmt(epROI.discountCost), color: T.green, sub: `${epParams.discountRate}% of ${fmt(epROI.participating)} participating` },
            { label: "Annualized Yield", value: `${epROI.annualizedYield.toFixed(1)}%`, color: epROI.annualizedYield > params.wacc ? T.green : T.red, sub: `vs ${params.wacc}% WACC hurdle` },
            { label: "Net Benefit (after funding)", value: fmt(epROI.netBenefit), color: T.accent, sub: `Funding cost: ${fmt(epROI.fundingCost)}` },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: "24px", fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontFamily: T.font, fontSize: "12px", color: T.textDim, marginTop: "2px" }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Discount sliding scale visualization */}
      <Card>
        <SectionTitle sub="Dynamic discount rate declining from invoice date to due date — supplier sees this schedule">Dynamic Discount Schedule</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "160px", padding: "0 8px" }}>
          {Array.from({ length: Math.min(epParams.daysEarly, 60) }, (_, i) => {
            const day = i + 1;
            const rate = epParams.discountRate * (1 - day / (epParams.daysEarly + 1));
            const maxRate = epParams.discountRate;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                <div style={{
                  width: "100%", height: `${(rate / maxRate) * 140}px`,
                  background: `linear-gradient(180deg, ${T.green}60, ${T.green}20)`,
                  borderRadius: "2px 2px 0 0", transition: "height 0.2s",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px 0", borderTop: `1px solid ${T.border}` }}>
          <div>
            <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.green }}>{epParams.discountRate}%</span>
            <span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim, marginLeft: "4px" }}>Day 1</span>
          </div>
          <div>
            <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>0%</span>
            <span style={{ fontFamily: T.font, fontSize: "10px", color: T.textDim, marginLeft: "4px" }}>Day {epParams.daysEarly} (due)</span>
          </div>
        </div>
      </Card>

      {/* Supplier segmentation for participation */}
      <Card>
        <SectionTitle sub="Expected participation rates by supplier segment — adjust program design accordingly">Supplier Participation Modeling</SectionTitle>
        <div style={{ display: "grid", gap: "8px" }}>
          {[
            { segment: "Strategic (top 20 by spend)", pct: 25, participation: 70, reason: "Relationship value + cash flow benefit" },
            { segment: "Core (next 80 by spend)", pct: 35, participation: 50, reason: "Moderate cash benefit, some manual effort" },
            { segment: "Tail (remaining)", pct: 40, participation: 20, reason: "Low individual value, onboarding friction" },
          ].map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 80px 1fr 1fr", gap: "12px", padding: "10px 12px", background: T.bg, borderRadius: T.radius, alignItems: "center" }}>
              <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text, fontWeight: 500 }}>{s.segment}</span>
              <Badge color={T.accent}>{s.pct}% of base</Badge>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>Est. participation</div>
                <div style={{ fontFamily: T.mono, fontSize: "14px", fontWeight: 600, color: T.green }}>{s.participation}%</div>
              </div>
              <span style={{ fontFamily: T.font, fontSize: "11px", color: T.textDim }}>{s.reason}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderXRef = () => {
    const sections = [
      { id: "dso", name: "DSO Reduction Levers", refs: ["1.2", "1.3", "1.5", "1.6", "2.1", "2.2", "2.3", "2.5", "3.5"], apqc: "8.3.4" },
      { id: "scf", name: "SCF / Dynamic Discounting", refs: ["1.3", "1.5", "2.1", "2.4", "3.5"], apqc: "8.1" },
      { id: "forecast", name: "Cash Flow Forecasting", refs: ["1.2", "1.3", "1.5", "KPI"], apqc: "8.1.2" },
      { id: "cockpit", name: "Working Capital Cockpit", refs: ["1.5", "1.6", "KPI", "3.5"], apqc: "8.3" },
      { id: "epRoi", name: "Early Payment ROI", refs: ["1.5", "2.3", "3.5"], apqc: "8.3.2" },
    ];
    return (
      <div style={{ display: "grid", gap: "16px" }}>
        <Card>
          <SectionTitle sub="How each section of 3.3 maps to existing toolkit deliverables and APQC process codes">Cross-Reference Matrix</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font, fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", color: T.textDim, borderBottom: `1px solid ${T.border}`, fontWeight: 500, position: "sticky", left: 0, background: T.surface }}>3.3 Section</th>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge color={ref.phase === 1 ? T.accent : ref.phase === 2 ? T.purple : T.green} bg={ref.phase === 1 ? T.accentDim : ref.phase === 2 ? T.purpleDim : T.greenDim}>
                    P{ref.phase} · {code}
                  </Badge>
                  <span style={{ fontFamily: T.font, fontSize: "13px", color: T.text }}>{ref.name}</span>
                </div>
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
          <Badge color={T.bg} bg={T.accent}>3.3</Badge>
          <Badge>PHASE 3</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC 8.1 / 8.3</Badge>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "26px", fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
          Treasury & Working Capital Optimization
        </h1>
        <p style={{ fontFamily: T.font, fontSize: "14px", color: T.textDim, margin: 0 }}>
          DSO reduction · SCF programs · Cash forecasting · CCC cockpit · Early payment ROI
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px", background: "transparent", border: "none",
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
      {activeTab === "dso" && renderDSO()}
      {activeTab === "scf" && renderSCF()}
      {activeTab === "forecast" && renderForecast()}
      {activeTab === "cockpit" && renderCockpit()}
      {activeTab === "epRoi" && renderEPROI()}
      {activeTab === "xref" && renderXRef()}

      {/* Footer */}
      <div style={{ marginTop: "32px", padding: "16px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: "11px", color: T.textDim }}>OtC Consulting Toolkit · Phase 3 · v3.3.0</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={T.textDim} bg={T.surfaceAlt}>APQC PCF v8.0</Badge>
          <Badge color={T.textDim} bg={T.surfaceAlt}>Benchmarks: APQC + Hackett</Badge>
        </div>
      </div>
    </div>
  );
}
