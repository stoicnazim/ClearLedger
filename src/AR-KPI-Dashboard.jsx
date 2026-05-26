import { useState, useMemo } from "react";
import { useLiveActuals, liveBadgeStyle } from "./liveActuals";
import { useMockDatabase } from "./context/MockDatabaseContext";
import { computeAllKPIs } from "./kpiEngine";
import { BarChart, Bar, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, ReferenceLine } from "recharts";

const ENTITIES = ["Global Consolidated", "North America", "EMEA", "APAC", "LATAM"];

const ENTITY_REGIONS = {
  "North America": ["NA"],
  "EMEA": ["EU", "MEA"],
  "APAC": ["APAC"],
  "LATAM": ["LATAM"],
};

const REGION_LABELS = { NA: "North America", EU: "EMEA", MEA: "EMEA", APAC: "APAC", LATAM: "LATAM" };

const BENCHMARKS = {
  dso: { median: 42, topQ: 32, wc: 28, label: "DSO", unit: "days", lower: true },
  cei: { median: 90, topQ: 95, wc: 98, label: "CEI", unit: "%", lower: false },
  bd: { median: 0.50, topQ: 0.25, wc: 0.10, label: "Bad Debt %", unit: "%", lower: true },
  fpm: { median: 65, topQ: 78, wc: 90, label: "Auto-Match Rate", unit: "%", lower: false },
  tr: { median: 35, topQ: 18, wc: 10, label: "Touch Rate", unit: "%", lower: true },
  dct: { median: 35, topQ: 22, wc: 15, label: "Dispute Cycle Time", unit: "days", lower: true },
  arRev: { median: 5.2, topQ: 3.2, wc: 2.0, label: "AR Cost/$1K Rev", unit: "$", lower: true },
  ei: { median: 70, topQ: 85, wc: 95, label: "E-Invoice Rate", unit: "%", lower: false },
};

const C = {
  bg: "#07090e",
  surface: "#0d1017",
  s2: "#141924",
  s3: "#1c2435",
  border: "#232d42",
  borderH: "#334163",
  t1: "#e6eaf3",
  t2: "#94a0be",
  t3: "#5d6b88",
  gold: "#dba651",
  goldDim: "rgba(219,166,81,0.12)",
  blue: "#5b8def",
  blueDim: "rgba(91,141,239,0.10)",
  green: "#3ec98a",
  greenDim: "rgba(62,201,138,0.10)",
  orange: "#e8884e",
  orangeDim: "rgba(232,136,78,0.10)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.10)",
  red: "#ef6b6b",
  redDim: "rgba(239,107,107,0.10)",
  teal: "#42d4be",
  tealDim: "rgba(66,212,190,0.10)",
  cyan: "#38bdf8",
};

const COLORS_AGING = [C.green, C.blue, C.gold, C.orange, C.red];

function getPerformanceColor(kpi, value) {
  const b = BENCHMARKS[kpi];
  if (!b) return C.t2;
  if (b.lower) {
    if (value <= b.wc) return C.green;
    if (value <= b.topQ) return C.teal;
    if (value <= b.median) return C.gold;
    return C.red;
  } else {
    if (value >= b.wc) return C.green;
    if (value >= b.topQ) return C.teal;
    if (value >= b.median) return C.gold;
    return C.red;
  }
}

function getPerformanceTier(kpi, value) {
  const b = BENCHMARKS[kpi];
  if (!b) return "";
  if (b.lower) {
    if (value <= b.wc) return "World Class";
    if (value <= b.topQ) return "Top Quartile";
    if (value <= b.median) return "Median";
    return "Below Median";
  } else {
    if (value >= b.wc) return "World Class";
    if (value >= b.topQ) return "Top Quartile";
    if (value >= b.median) return "Median";
    return "Below Median";
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
      <div style={{ color: C.t2, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

function entityFilter(entity, invoices, cashApplications, disputes, customers) {
  if (entity === "Global Consolidated") return { invoices, cashApplications, disputes, customers };
  const regions = ENTITY_REGIONS[entity] || [];
  const fInvs = invoices.filter(i => regions.includes(i.region));
  const fCustIds = new Set(fInvs.map(i => i.customerId));
  const fCusts = customers.filter(c => fCustIds.has(c.id));
  const fInvIds = new Set(fInvs.map(i => i.id));
  const fCas = cashApplications.filter(c => fInvIds.has(c.invoiceId));
  const fDisp = disputes.filter(d => fInvIds.has(d.invoiceId));
  return { invoices: fInvs, cashApplications: fCas, disputes: fDisp, customers: fCusts };
}

function computeEntityKpis(data) {
  const { invoices, cashApplications, disputes } = data;
  const open = invoices.filter(i => i.status !== 'paid' && i.status !== 'written_off');
  const endingAR = open.reduce((s, i) => s + i.balance, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const PERIOD = 90;
  const dso = totalBilled > 0 ? Math.round((endingAR / totalBilled) * PERIOD * 10) / 10 : 0;
  const currentAR = open.filter(i => i.daysPastDue <= 0).reduce((s, i) => s + i.balance, 0);
  const collected = cashApplications.reduce((s, c) => s + c.amountReceived, 0);
  const beginningAR = endingAR + collected;
  const ceiNum = beginningAR + totalBilled - endingAR;
  const ceiDen = beginningAR + totalBilled - currentAR;
  const cei = ceiDen > 0 ? Math.round((ceiNum / ceiDen) * 100 * 10) / 10 : 0;
  const autoCount = cashApplications.filter(c => c.matchStatus === 'auto_matched').length;
  const fpm = cashApplications.length > 0 ? Math.round((autoCount / cashApplications.length) * 1000) / 10 : 0;
  const writeOffs = invoices.filter(i => i.status === 'written_off').reduce((s, i) => s + i.amount, 0);
  const approvedClaims = disputes.filter(d => d.status === 'approved').reduce((s, d) => s + d.claimAmount, 0);
  const bd = totalBilled > 0 ? Math.round(((writeOffs + approvedClaims) / totalBilled) * 100 * 100) / 100 : 0;
  const manualCount = cashApplications.filter(c => c.matchStatus !== 'auto_matched').length;
  const tr = cashApplications.length > 0 ? Math.round((manualCount / cashApplications.length) * 100 * 10) / 10 : 0;
  const resolved = disputes.filter(d => d.resolutionCycleDays != null);
  const dct = resolved.length > 0 ? Math.round(resolved.reduce((s, d) => s + d.resolutionCycleDays, 0) / resolved.length * 10) / 10 : 0;
  const totalCost = invoices.reduce((s, i) => s + (i.costPerInvoice || 0), 0);
  const arRev = totalBilled > 0 ? Math.round((totalCost / totalBilled) * 1000 * 100) / 100 : 0;
  const eInvs = invoices.filter(i => i.eInvoiceStatus && i.eInvoiceStatus !== 'pending').length;
  const ei = invoices.length > 0 ? Math.round((eInvs / invoices.length) * 100 * 10) / 10 : 0;
  const arBalance = Math.round(endingAR / 1000000 * 10) / 10;
  const ar90 = open.filter(i => i.daysPastDue > 90).reduce((s, i) => s + i.balance, 0);
  const overdueM = Math.round(open.filter(i => i.daysPastDue > 0).reduce((s, i) => s + i.balance, 0) / 1000000 * 10) / 10;
  const revenue = Math.round(totalBilled / 1000000 * 10) / 10;
  return { dso, cei, bd: Math.min(bd, 10), fpm, tr, dct, arRev, ei, arBalance, revenue, overdue: overdueM, current: Math.round(currentAR / 1000000 * 10) / 10, ar90: Math.round(ar90 / 1000000 * 10) / 10 };
}

function computeAging(invoices) {
  const open = invoices.filter(i => i.status !== 'paid' && i.status !== 'written_off');
  const total = open.reduce((s, i) => s + i.balance, 0);
  const buckets = [
    { bucket: "Current", key: "current" },
    { bucket: "1-30", key: "1-30" },
    { bucket: "31-60", key: "31-60" },
    { bucket: "61-90", key: "61-90" },
    { bucket: "90+", key: "90+" },
  ];
  return buckets.map(b => {
    const amount = open.filter(i => i.agingBucket === b.key).reduce((s, i) => s + i.balance, 0);
    return { bucket: b.bucket, amount: Math.round(amount / 1000000 * 10) / 10, pct: total > 0 ? Math.round(amount / total * 100) : 0 };
  });
}

function computeTopDelinquent(data, regionFilter) {
  const { invoices, customers } = data;
  const open = invoices.filter(i => i.status !== 'paid' && i.status !== 'written_off' && i.daysPastDue > 0);
  const byCustomer = {};
  open.forEach(i => {
    if (!byCustomer[i.customerId]) byCustomer[i.customerId] = { balance: 0, overdue: 0, maxDpd: 0, region: i.region };
    byCustomer[i.customerId].balance += i.balance;
    byCustomer[i.customerId].overdue += i.balance;
    byCustomer[i.customerId].maxDpd = Math.max(byCustomer[i.customerId].maxDpd, i.daysPastDue);
  });
  return Object.entries(byCustomer)
    .filter(([id, _]) => !regionFilter || regionFilter === "All" || (REGION_LABELS[_.region] === regionFilter))
    .map(([id, d]) => {
      const cust = customers.find(c => c.id === id);
      const risk = d.maxDpd > 60 ? "High" : d.maxDpd > 30 ? "Medium" : "Low";
      return {
        customer: cust ? cust.name : id,
        customerId: id,
        region: REGION_LABELS[d.region] || d.region,
        balance: Math.round(d.balance / 1000000 * 100) / 100,
        overdue: Math.round(d.overdue / 1000000 * 100) / 100,
        dso: Math.round(d.maxDpd + 30),
        risk,
      };
    })
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, 12);
}

function computeDisputeData(disputes) {
  const byReason = {};
  disputes.forEach(d => {
    if (!byReason[d.reasonCode]) byReason[d.reasonCode] = { count: 0, totalDays: 0, resolved: 0, totalValue: 0 };
    byReason[d.reasonCode].count++;
    byReason[d.reasonCode].totalValue += d.claimAmount;
    if (d.resolutionCycleDays != null) {
      byReason[d.reasonCode].totalDays += d.resolutionCycleDays;
      byReason[d.reasonCode].resolved++;
    }
  });
  const reasonLabels = { shortage: "Shortage", pricing: "Pricing Error", damage: "Damage", quality: "Quality / Returns", compliance: "Compliance" };
  return Object.entries(byReason)
    .map(([code, d]) => ({
      reason: reasonLabels[code] || code,
      count: d.count,
      avgDays: d.resolved > 0 ? Math.round(d.totalDays / d.resolved * 10) / 10 : 0,
      value: Math.round(d.totalValue / 1000000 * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeCollectionActivity(collectionActivities) {
  const byMonth = {};
  collectionActivities.forEach(ca => {
    const month = ca.activityDate ? ca.activityDate.slice(0, 7) : "unknown";
    if (!byMonth[month]) byMonth[month] = { calls: 0, emails: 0, promises: 0, collected: 0 };
    if (ca.activityType === 'call') byMonth[month].calls++;
    else byMonth[month].emails++;
    if (ca.outcome === 'promise_to_pay') byMonth[month].promises++;
    if (ca.outcome === 'paid') byMonth[month].collected++;
  });
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentYear = "2026";
  return months.map((m, i) => {
    const key = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
    const d = byMonth[key] || { calls: 0, emails: 0, promises: 0, collected: 0 };
    // Scale counts up for visual (seed has ~170 activities, which is sparse per month)
    const scale = collectionActivities.length > 100 ? 1 : 3;
    return { month: m, calls: d.calls * scale || Math.round(4 + Math.sin(i * 0.8) * 2), emails: d.emails * scale || Math.round(8 + Math.cos(i * 0.6) * 3), promises: d.promises * scale || Math.round(2 + Math.sin(i * 1.2) * 1), collected: d.collected || Math.round(1 + Math.sin(i * 0.5) * 0.5) };
  });
}

function computeProcessHealth(invoices, cashApplications, disputes, customers) {
  const regions = ["NA", "EU", "APAC", "LATAM"];
  const regionLabels = { NA: "North America", EU: "EMEA", APAC: "APAC", LATAM: "LATAM" };
  const processes = [
    { process: "Credit Management", keys: ["dso"] },
    { process: "Order Management", keys: ["dso", "fpm"] },
    { process: "Billing & Invoicing", keys: ["ei", "dso"] },
    { process: "Cash Application", keys: ["fpm"] },
    { process: "Collections", keys: ["cei"] },
    { process: "Reporting & Governance", keys: ["dso", "cei"] },
  ];
  return processes.map(p => {
    const scores = {};
    regions.forEach(r => {
      const fInvs = invoices.filter(i => i.region === r);
      const fCas = cashApplications.filter(c => fInvs.some(iv => iv.id === c.invoiceId));
      const fDisp = disputes.filter(d => fInvs.some(iv => iv.id === d.invoiceId));
      const fCust = customers.filter(c => fInvs.some(iv => iv.customerId === c.id));
      const kpis = computeEntityKpis({ invoices: fInvs, cashApplications: fCas, disputes: fDisp, customers: fCust });
      const vals = p.keys.map(k => kpis[k] || 0);
      scores[regionLabels[r]] = Math.min(100, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * (p.keys.length > 1 ? 2 : 2.5)));
    });
    return { process: p.process, scores };
  });
}

export default function ARDashboard() {
  const live = useLiveActuals();
  const ctx = useMockDatabase() || {};
  const { invoices = [], disputes = [], customers = [], cashApplications = [], collectionActivities = [] } = ctx;

  const [view, setView] = useState("executive");
  const [entity, setEntity] = useState("Global Consolidated");
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const filtered = useMemo(() => entityFilter(entity, invoices, cashApplications, disputes, customers), [entity, invoices, cashApplications, disputes, customers]);

  const data = useMemo(() => {
    const base = computeEntityKpis(filtered);
    if (live && entity === "Global Consolidated") {
      return { ...base, dso: live.dso, fpm: live.autoMatch, bd: live.revenueLeakage, arBalance: live.totalARm };
    }
    return base;
  }, [filtered, entity, live]);

  const aging = useMemo(() => {
    if (live && entity === "Global Consolidated") {
      const a = live.aging;
      const total = Object.values(a).reduce((s, v) => s + v, 0);
      const totalM = Math.round(total / 1000000 * 10) / 10;
      const buckets = [
        { bucket: "Current", amount: Math.round((a.current || 0) / 1000000 * 10) / 10 },
        { bucket: "1-30", amount: Math.round((a['1-30'] || 0) / 1000000 * 10) / 10 },
        { bucket: "31-60", amount: Math.round((a['31-60'] || 0) / 1000000 * 10) / 10 },
        { bucket: "61-90", amount: Math.round((a['61-90'] || 0) / 1000000 * 10) / 10 },
        { bucket: "90+", amount: Math.round((a['90+'] || 0) / 1000000 * 10) / 10 },
      ];
      return buckets.map(b => ({ ...b, pct: totalM > 0 ? Math.round(b.amount / totalM * 100) : 0 }));
    }
    return computeAging(filtered.invoices);
  }, [filtered, entity, live]);

  const topDelinquent = useMemo(() => computeTopDelinquent(filtered, selectedRegion), [filtered, selectedRegion]);

  const disputeData = useMemo(() => computeDisputeData(disputes), [disputes]);

  const collectionActivityData = useMemo(() => computeCollectionActivity(collectionActivities), [collectionActivities]);

  const regionCompare = useMemo(() => {
    const regions = ["NA", "EU", "APAC", "LATAM"];
    const regionLabels = { NA: "North America", EU: "EMEA", APAC: "APAC", LATAM: "LATAM" };
    return regions.map(r => {
      const fInvs = invoices.filter(i => i.region === r);
      const fCas = cashApplications.filter(c => fInvs.some(iv => iv.id === c.invoiceId));
      const fDisp = disputes.filter(d => fInvs.some(iv => iv.id === d.invoiceId));
      const fCust = customers.filter(c => fInvs.some(iv => iv.customerId === c.id));
      const k = computeEntityKpis({ invoices: fInvs, cashApplications: fCas, disputes: fDisp, customers: fCust });
      return { region: regionLabels[r], dso: k.dso, cei: k.cei, fpm: k.fpm, tr: k.tr, bd: k.bd };
    });
  }, [invoices, cashApplications, disputes, customers]);

  const cashFlowData = useMemo(() => {
    const totalBilledM = data.revenue;
    const arBalanceM = data.arBalance;
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => {
      const seasonal = 1 + Math.sin(i * 0.7) * 0.15;
      return {
        month: m,
        billed: Math.round(totalBilledM / 12 * seasonal * 10) / 10,
        collected: Math.round(totalBilledM / 12 * seasonal * 0.92 * 10) / 10,
        netAR: Math.round((arBalanceM + Math.sin(i * 0.4) * arBalanceM * 0.08) * 10) / 10,
      };
    });
  }, [data]);

  const processHealth = useMemo(() => computeProcessHealth(invoices, cashApplications, disputes, customers), [invoices, cashApplications, disputes, customers]);

  const liveIds = (live && entity === "Global Consolidated") ? ["dso", "fpm", "bd"] : [];

  const kpiCards = [
    { id: "dso", label: "DSO", value: data.dso, unit: "days" },
    { id: "cei", label: "CEI", value: data.cei, unit: "%" },
    { id: "bd", label: "Bad Debt %", value: data.bd, unit: "%" },
    { id: "fpm", label: "Auto-Match Rate", value: data.fpm, unit: "%" },
    { id: "tr", label: "Touch Rate", value: data.tr, unit: "%" },
    { id: "dct", label: "Dispute Cycle", value: data.dct, unit: "days" },
    { id: "arRev", label: "Cost/$1K Rev", value: data.arRev, unit: "$" },
    { id: "ei", label: "E-Invoice Rate", value: data.ei, unit: "%" },
  ];

  const trendData = useMemo(() => {
    if (!selectedKPI) return [];
    const b = BENCHMARKS[selectedKPI];
    const baseVal = data[selectedKPI] || 0;
    const variance = baseVal * 0.15;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m, i) => {
      const trend = b?.lower ? -i * (variance / 14) : i * (variance / 14);
      const noise = Math.sin(i * 2.1) * variance * 0.3;
      return { month: m, value: Math.round((baseVal + trend + noise) * 100) / 100 };
    });
  }, [selectedKPI, data]);

  const styles = {
    page: { background: C.bg, minHeight: "100vh", fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", color: C.t1 },
    container: { maxWidth: 1440, margin: "0 auto", padding: "24px 20px 80px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
    title: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: C.t1 },
    subtitle: { fontSize: 13, color: C.t2, marginTop: 4 },
    controls: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
    select: { padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.t1, fontSize: 13, fontWeight: 500, cursor: "pointer", outline: "none" },
    viewBtn: (active) => ({ padding: "8px 18px", borderRadius: 8, border: `1px solid ${active ? C.gold : C.border}`, background: active ? C.goldDim : C.surface, color: active ? C.gold : C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 10, marginBottom: 24 },
    kpiCard: (isSelected, color) => ({ background: isSelected ? `${color}11` : C.surface, border: `1px solid ${isSelected ? color : C.border}`, borderRadius: 10, padding: "16px 14px", cursor: "pointer", transition: "all 0.2s", position: "relative" }),
    chartBox: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px", marginBottom: 16 },
    chartTitle: { fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 4 },
    chartSub: { fontSize: 11, color: C.t3, marginBottom: 16 },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 },
    badge: (color, bgColor) => ({ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: bgColor, color: color, textTransform: "uppercase", letterSpacing: "0.05em" }),
    benchRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}08`, fontSize: 12 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${C.border}`, color: C.t3, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    td: { padding: "10px 12px", borderBottom: `1px solid ${C.border}`, color: C.t2 },
  };

  const iconMap = { dso: "📅", cei: "📊", bd: "⚠️", fpm: "🎯", tr: "👆", dct: "⚡", arRev: "💰", ei: "📄" };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>AR Performance Command Center</div>
            <div style={styles.subtitle}>Order-to-Cash KPI Dashboard · APQC/Hackett Benchmarked · FY2026 · Live Seed Data</div>
          </div>
          <div style={styles.controls}>
            <select style={styles.select} value={entity} onChange={e => { setEntity(e.target.value); setSelectedKPI(null); setSelectedRegion(null); }}>
              {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button style={styles.viewBtn(view === "executive")} onClick={() => setView("executive")}>Executive</button>
            <button style={styles.viewBtn(view === "operational")} onClick={() => setView("operational")}>Operational</button>
          </div>
        </div>

        <div style={styles.grid}>
          {kpiCards.map(k => {
            const color = getPerformanceColor(k.id, k.value);
            const tier = getPerformanceTier(k.id, k.value);
            const isSelected = selectedKPI === k.id;
            return (
              <div key={k.id} style={styles.kpiCard(isSelected, color)} onClick={() => setSelectedKPI(isSelected ? null : k.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</span>
                  <span style={{ fontSize: 14 }}>{iconMap[k.id]}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: color, letterSpacing: "-0.02em" }}>
                  {k.id === "arRev" ? "$" : ""}{k.value}{k.id !== "arRev" ? (k.unit === "days" ? "" : "%") : ""}
                  {k.unit === "days" && <span style={{ fontSize: 13, color: C.t3, marginLeft: 4 }}>days</span>}
                </div>
                <div style={{ marginTop: 6, ...styles.badge(color, `${color}18`) }}>{tier}</div>
                {liveIds.includes(k.id) && <span style={{ ...liveBadgeStyle(), position: "absolute", top: 8, right: 8 }}>● LIVE</span>}
                {isSelected && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "0 0 10px 10px" }} />}
              </div>
            );
          })}
        </div>

        {selectedKPI && (
          <div style={styles.chartBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={styles.chartTitle}>{BENCHMARKS[selectedKPI].label} — 12-Month Trend</div>
                <div style={styles.chartSub}>Click a different KPI card to switch · Dashed lines = APQC benchmarks</div>
              </div>
              <button onClick={() => setSelectedKPI(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.t3, padding: "4px 12px", cursor: "pointer", fontSize: 11 }}>✕ Close</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 20 }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getPerformanceColor(selectedKPI, data[selectedKPI])} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={getPerformanceColor(selectedKPI, data[selectedKPI])} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                  <YAxis tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={BENCHMARKS[selectedKPI].median} stroke={C.t3} strokeDasharray="4 4" label={{ value: "Median", fill: C.t3, fontSize: 10, position: "right" }} />
                  <ReferenceLine y={BENCHMARKS[selectedKPI].topQ} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Top Q", fill: C.gold, fontSize: 10, position: "right" }} />
                  <ReferenceLine y={BENCHMARKS[selectedKPI].wc} stroke={C.green} strokeDasharray="4 4" label={{ value: "WC", fill: C.green, fontSize: 10, position: "right" }} />
                  <Area type="monotone" dataKey="value" stroke={getPerformanceColor(selectedKPI, data[selectedKPI])} fill="url(#trendGrad)" strokeWidth={2} name={BENCHMARKS[selectedKPI].label} dot={{ r: 3, fill: C.surface, stroke: getPerformanceColor(selectedKPI, data[selectedKPI]) }} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ background: C.s2, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>APQC Benchmarks</div>
                {["median", "topQ", "wc"].map(tier => (
                  <div key={tier} style={styles.benchRow}>
                    <span style={{ color: C.t3 }}>{tier === "median" ? "Median" : tier === "topQ" ? "Top Quartile" : "World Class"}</span>
                    <span style={{ color: tier === "wc" ? C.green : tier === "topQ" ? C.gold : C.t3, fontWeight: 600 }}>
                      {selectedKPI === "arRev" ? "$" : ""}{BENCHMARKS[selectedKPI][tier]}{BENCHMARKS[selectedKPI].unit === "%" ? "%" : BENCHMARKS[selectedKPI].unit === "days" ? "d" : ""}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "10px 12px", background: `${getPerformanceColor(selectedKPI, data[selectedKPI])}12`, borderRadius: 6, border: `1px solid ${getPerformanceColor(selectedKPI, data[selectedKPI])}30` }}>
                  <div style={{ fontSize: 11, color: C.t3, marginBottom: 2 }}>Current Position</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: getPerformanceColor(selectedKPI, data[selectedKPI]) }}>
                    {selectedKPI === "arRev" ? "$" : ""}{data[selectedKPI]}{BENCHMARKS[selectedKPI].unit === "%" ? "%" : ""}
                  </div>
                  <div style={{ fontSize: 11, color: getPerformanceColor(selectedKPI, data[selectedKPI]), fontWeight: 600, marginTop: 2 }}>
                    {getPerformanceTier(selectedKPI, data[selectedKPI])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "executive" && (
          <>
            <div style={styles.row}>
              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>Cash Conversion Cycle</div>
                <div style={styles.chartSub}>Billed vs Collected ($M) · Net AR Balance</div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                    <YAxis tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: C.t3 }} />
                    <Bar dataKey="billed" fill={C.blue} name="Billed" radius={[3, 3, 0, 0]} opacity={0.7} />
                    <Bar dataKey="collected" fill={C.green} name="Collected" radius={[3, 3, 0, 0]} opacity={0.7} />
                    <Line type="monotone" dataKey="netAR" stroke={C.gold} strokeWidth={2} dot={false} name="Net AR" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>AR Aging Distribution</div>
                <div style={styles.chartSub}>{entity} · Total: ${data.arBalance}M</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center" }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={aging} dataKey="amount" nameKey="bucket" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2}>
                        {aging.map((_, i) => <Cell key={i} fill={COLORS_AGING[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    {aging.map((a, i) => (
                      <div key={a.bucket} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}20` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS_AGING[i] }} />
                          <span style={{ fontSize: 12, color: C.t2 }}>{a.bucket}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>${a.amount}M</span>
                          <span style={{ fontSize: 11, color: C.t3, marginLeft: 6 }}>{a.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.chartBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={styles.chartTitle}>Regional Performance Comparison</div>
                  <div style={styles.chartSub}>DSO · CEI · Auto-Match Rate · Touch Rate across entities · Click a bar to filter overdue list</div>
                </div>
                {selectedRegion && (
                  <button onClick={() => setSelectedRegion(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.t3, padding: "4px 12px", cursor: "pointer", fontSize: 11 }}>
                    Clear filter: {selectedRegion}
                  </button>
                )}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={regionCompare} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="region" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                  <YAxis tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.t3 }} />
                  <Bar dataKey="dso" fill={C.blue} name="DSO (days)" radius={[3, 3, 0, 0]} onClick={(_, i) => setSelectedRegion(selectedRegion === regionCompare[i]?.region ? null : regionCompare[i]?.region)} />
                  <Bar dataKey="cei" fill={C.green} name="CEI (%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="fpm" fill={C.gold} name="FPM (%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="tr" fill={C.orange} name="Touch Rate (%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={styles.chartTitle}>Top Overdue Accounts — Action Required</div>
                  <div style={styles.chartSub}>
                    Ranked by overdue balance{selectedRegion ? ` · Filtered: ${selectedRegion}` : " · Click a region bar above to filter"}
                    {selectedRegion && ` · ${topDelinquent.length} accounts`}
                  </div>
                </div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Region</th>
                    <th style={styles.th}>Total AR ($M)</th>
                    <th style={styles.th}>Overdue ($M)</th>
                    <th style={styles.th}>Customer DSO</th>
                    <th style={styles.th}>Risk</th>
                    <th style={styles.th}>Overdue %</th>
                  </tr>
                </thead>
                <tbody>
                  {topDelinquent.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center", color: C.t3, padding: 20 }}>No overdue accounts{selectedRegion ? ` in ${selectedRegion}` : ""}</td></tr>
                  ) : topDelinquent.map(c => (
                    <tr key={c.customer} style={{ transition: "background 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = C.s2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...styles.td, color: C.t1, fontWeight: 600 }}>{c.customer}</td>
                      <td style={styles.td}>{c.region}</td>
                      <td style={styles.td}>${c.balance}M</td>
                      <td style={{ ...styles.td, color: C.red, fontWeight: 600 }}>${c.overdue}M</td>
                      <td style={{ ...styles.td, color: c.dso > 50 ? C.red : c.dso > 40 ? C.gold : C.green }}>{c.dso} days</td>
                      <td style={styles.td}>
                        <span style={styles.badge(
                          c.risk === "High" ? C.red : c.risk === "Medium" ? C.gold : C.green,
                          c.risk === "High" ? C.redDim : c.risk === "Medium" ? C.goldDim : C.greenDim
                        )}>{c.risk}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: C.s3, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, c.overdue / (c.balance || 1) * 100)}%`, height: "100%", background: c.overdue / (c.balance || 1) > 0.6 ? C.red : C.gold, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: C.t3, minWidth: 32 }}>{Math.round(c.overdue / (c.balance || 1) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "operational" && (
          <>
            <div style={styles.row}>
              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>Collections Activity Tracker</div>
                <div style={styles.chartSub}>Calls · Emails · Promises-to-Pay · Collected</div>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={collectionActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                    <YAxis yAxisId="left" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} label={{ value: "Activities", angle: -90, position: "insideLeft", fill: C.t3, fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} label={{ value: "$M", angle: 90, position: "insideRight", fill: C.t3, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="calls" fill={C.blue} name="Calls" opacity={0.6} radius={[2,2,0,0]} />
                    <Bar yAxisId="left" dataKey="emails" fill={C.purple} name="Emails" opacity={0.6} radius={[2,2,0,0]} />
                    <Line yAxisId="left" type="monotone" dataKey="promises" stroke={C.gold} strokeWidth={2} name="Promises" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="collected" stroke={C.green} strokeWidth={2} name="Collected" dot={{ r: 3, fill: C.surface, stroke: C.green }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>Dispute Pareto Analysis</div>
                <div style={styles.chartSub}>Top reason codes by volume · Avg resolution days</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={disputeData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis type="number" tick={{ fill: C.t3, fontSize: 11 }} axisLine={{ stroke: C.border }} />
                    <YAxis type="category" dataKey="reason" tick={{ fill: C.t2, fontSize: 11 }} width={110} axisLine={{ stroke: C.border }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={C.orange} name="Count" radius={[0, 4, 4, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.chartBox}>
              <div style={styles.chartTitle}>Dispute Resolution Detail</div>
              <div style={styles.chartSub}>By reason code · Avg days to resolve · Total value at risk</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reason Code</th>
                    <th style={styles.th}>Count</th>
                    <th style={styles.th}>Avg Days</th>
                    <th style={styles.th}>Value ($M)</th>
                    <th style={styles.th}>SLA Status</th>
                    <th style={styles.th}>Volume Share</th>
                  </tr>
                </thead>
                <tbody>
                  {disputeData.map(d => {
                    const totalCount = disputeData.reduce((s, x) => s + x.count, 0);
                    const pct = Math.round(d.count / (totalCount || 1) * 100);
                    return (
                      <tr key={d.reason} onMouseEnter={e => e.currentTarget.style.background = C.s2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ ...styles.td, color: C.t1, fontWeight: 600 }}>{d.reason}</td>
                        <td style={styles.td}>{d.count}</td>
                        <td style={{ ...styles.td, color: d.avgDays > 20 ? C.red : d.avgDays > 14 ? C.gold : C.green, fontWeight: 600 }}>{d.avgDays}d</td>
                        <td style={styles.td}>${d.value}M</td>
                        <td style={styles.td}>
                          <span style={styles.badge(
                            d.avgDays <= 14 ? C.green : d.avgDays <= 21 ? C.gold : C.red,
                            d.avgDays <= 14 ? C.greenDim : d.avgDays <= 21 ? C.goldDim : C.redDim
                          )}>{d.avgDays <= 14 ? "Within SLA" : d.avgDays <= 21 ? "At Risk" : "Breach"}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: C.s3, borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: C.orange, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, color: C.t3, minWidth: 28 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.row}>
              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>Automation & Efficiency Metrics</div>
                <div style={styles.chartSub}>Current state vs. target benchmarks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                  {[
                    { label: "Straight-Through Processing", current: data.fpm, target: 92, color: C.blue },
                    { label: "Auto-Dunning Coverage", current: Math.min(data.fpm + 15, 95), target: 95, color: C.green },
                    { label: "E-Invoice Adoption", current: data.ei, target: 90, color: C.gold },
                    { label: "Auto-Match Rate (Cash App)", current: Math.min(data.fpm + 5, 95), target: 95, color: C.purple },
                    { label: "Touchless Invoice Rate", current: 100 - data.tr, target: 90, color: C.teal },
                    { label: "Credit Check Automation", current: Math.min(data.fpm + 10, 98), target: 98, color: C.orange },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: C.t2 }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.current >= m.target * 0.9 ? C.green : C.gold }}>
                          {m.current}% <span style={{ color: C.t3, fontWeight: 400 }}>/ {m.target}%</span>
                        </span>
                      </div>
                      <div style={{ height: 8, background: C.s3, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                        <div style={{ width: `${m.target}%`, height: "100%", background: `${m.color}20`, borderRadius: 4, position: "absolute" }} />
                        <div style={{ width: `${m.current}%`, height: "100%", background: m.color, borderRadius: 4, position: "relative", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.chartBox}>
                <div style={styles.chartTitle}>Cash Application Performance</div>
                <div style={styles.chartSub}>Match categories · Exception breakdown</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                  {[
                    { label: "Auto-Matched", value: `${data.fpm}%`, sub: `${Math.round(data.fpm * 0.12)} first-pass`, color: C.green },
                    { label: "Manual Match", value: `${Math.round((100 - data.fpm) * 0.6)}%`, sub: "Analyst resolved", color: C.gold },
                    { label: "Unapplied Cash", value: `${Math.round((100 - data.fpm) * 0.25)}%`, sub: ">5 day aged", color: C.orange },
                    { label: "Exceptions", value: `${Math.round((100 - data.fpm) * 0.15)}%`, sub: "Escalated", color: C.red },
                  ].map(m => (
                    <div key={m.label} style={{ background: C.s2, borderRadius: 8, padding: 16, borderLeft: `3px solid ${m.color}` }}>
                      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: m.color, margin: "4px 0" }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: C.t3 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: 12, background: `${C.blue}08`, borderRadius: 8, border: `1px solid ${C.blue}20` }}>
                  <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginBottom: 4 }}>AUTOMATION OPPORTUNITY</div>
                  <div style={{ fontSize: 12, color: C.t2 }}>
                    Moving auto-match from {data.fpm}% to 85% would eliminate ~{Math.max(0, Math.round((85 - data.fpm) / 100 * 1200))} manual touches/month,
                    saving ~{Math.max(0, Math.round((85 - data.fpm) * 0.8))} analyst hours and reducing unapplied cash aging by an estimated 40%.
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.chartBox}>
              <div style={styles.chartTitle}>Process Health Heatmap — By Sub-Process × Region</div>
              <div style={styles.chartSub}>Green = Top Quartile · Gold = Median · Red = Below Median · Based on composite KPI scoring</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...styles.table, minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Sub-Process</th>
                      {ENTITIES.filter(e => e !== "Global Consolidated").map(e => (
                        <th key={e} style={{ ...styles.th, textAlign: "center" }}>{e}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processHealth.map(row => (
                      <tr key={row.process}>
                        <td style={{ ...styles.td, color: C.t1, fontWeight: 600 }}>{row.process}</td>
                        {ENTITIES.filter(e => e !== "Global Consolidated").map(e => {
                          const s = row.scores[e] || 0;
                          const color = s >= 85 ? C.green : s >= 70 ? C.gold : C.red;
                          const bg = s >= 85 ? C.greenDim : s >= 70 ? C.goldDim : C.redDim;
                          return (
                            <td key={e} style={{ ...styles.td, textAlign: "center" }}>
                              <span style={{ ...styles.badge(color, bg), fontSize: 12, padding: "4px 12px" }}>{s}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 11, color: C.t3 }}>
            AR Performance Command Center · v2.0 Live · APQC PCF v8.0 Aligned · Hackett World-Class Benchmarks · Seed Data
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 11, color: C.t3 }}>Data: Seed ({invoices.length} invoices, {disputes.length} disputes)</span>
            <span style={{ fontSize: 11, color: C.t3 }}>Refresh: Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}