/* ═══════════════════════════════════════════════════════════════════════
   ClearLedger — KPI Calculation Engine
   ───────────────────────────────────────────────────────────────────────
   Single source of computed truth. Every KPI defined in OtC-KPI-SPEC-v2 is
   implemented HERE, by its documented formula, computed from raw seed data.
   No hardcoded metric values anywhere downstream — every tab calls computeKPI.

   Each entry:
     id        — matches the KPI Spec id (K001…)
     formula   — the documented formula (for display + traceability)
     unit      — days | % | currency | count
     compute(db) — returns { value, computable } where computable=false means
                   the seed does not yet carry the data this formula needs
                   (we surface "n/a — needs <data>" rather than fabricate).

   "today" is fixed (seed TODAY = 2026-05-24) so date math is deterministic.
   ═══════════════════════════════════════════════════════════════════════ */

const r1 = (n) => Math.round(n * 10) / 10
const r2 = (n) => Math.round(n * 100) / 100
const NA = { value: null, computable: false }

/* ── shared intermediate aggregates (computed once, reused by formulas) ── */
function aggregates(db) {
  const inv = db.invoices || []
  const open = inv.filter((i) => i.status !== 'paid' && i.status !== 'written_off')
  const endingAR = open.reduce((s, i) => s + i.balance, 0)
  const totalBilled = inv.reduce((s, i) => s + i.amount, 0)
  const currentAR = open.filter((i) => i.daysPastDue <= 0).reduce((s, i) => s + i.balance, 0)
  const ar90 = open.filter((i) => i.daysPastDue > 90).reduce((s, i) => s + i.balance, 0)
  // Period window: use 90-day convention (matches Spec "Days in Period")
  const PERIOD = 90
  // credit sales proxy = total billed in window
  return { inv, open, endingAR, totalBilled, currentAR, ar90, PERIOD }
}

/* ── the KPI registry: formula → computation ── */
export const KPI_ENGINE = {
  /* ============ INVOICING & BILLING ============ */
  K001: { // Days Sales Outstanding
    formula: '(Ending AR / Revenue) × Days in Period',
    unit: 'days',
    compute: (db) => {
      const a = aggregates(db)
      if (a.totalBilled === 0) return NA
      return { value: r1((a.endingAR / a.totalBilled) * a.PERIOD), computable: true }
    },
  },
  K002: { // Invoice Accuracy Rate — now from real hasError flag
    formula: '(Invoices without errors / Total invoices) × 100',
    unit: '%',
    compute: (db) => {
      const inv = db.invoices || []
      if (!inv.length) return NA
      const clean = inv.filter((i) => !i.hasError).length
      return { value: r1((clean / inv.length) * 100), computable: true }
    },
  },
  K003: { // Invoice Cycle Time
    formula: 'Avg(Invoice issue date − Delivery/milestone date)',
    unit: 'days',
    compute: (db) => {
      const inv = (db.invoices || []).filter((i) => typeof i.invoiceCycleDays === 'number')
      if (!inv.length) return NA
      return { value: r1(inv.reduce((s, i) => s + i.invoiceCycleDays, 0) / inv.length), computable: true }
    },
  },
  K004: { // E-Invoicing Adoption Rate
    formula: '(E-invoices / Total invoices) × 100',
    unit: '%',
    compute: (db) => {
      const inv = db.invoices || []
      if (!inv.length) return NA
      // e-invoice = any invoice with an eInvoiceStatus that isn't null (mandate jurisdictions)
      const e = inv.filter((i) => i.eInvoiceStatus && i.eInvoiceStatus !== 'pending').length
      return { value: r1((e / inv.length) * 100), computable: true }
    },
  },
  K005: { // Cost per Invoice
    formula: 'Total invoicing costs / Invoices processed',
    unit: 'currency',
    compute: (db) => {
      const inv = (db.invoices || []).filter((i) => typeof i.costPerInvoice === 'number')
      if (!inv.length) return NA
      return { value: r2(inv.reduce((s, i) => s + i.costPerInvoice, 0) / inv.length), computable: true }
    },
  },
  K006: { // First-Time Match Rate (auto-match on cash apps)
    formula: '(Auto-matched invoices / Total invoices) × 100',
    unit: '%',
    compute: (db) => matchRate(db),
  },

  /* ============ CREDIT & RISK ============ */
  K010: { // Bad Debt as % of Revenue
    formula: '(Bad debt write-offs / Net revenue) × 100',
    unit: '%',
    compute: (db) => {
      const a = aggregates(db)
      if (a.totalBilled === 0) return NA
      // write-offs = invoices marked written_off + approved dispute claim value
      const writeOffs = (db.invoices || []).filter((i) => i.status === 'written_off').reduce((s, i) => s + i.amount, 0)
      const approvedClaims = (db.disputes || []).filter((d) => d.status === 'approved').reduce((s, d) => s + d.claimAmount, 0)
      return { value: r2(((writeOffs + approvedClaims) / a.totalBilled) * 100), computable: true }
    },
  },
  K011: { // Credit Review Cycle Time
    formula: 'Avg(Credit decision date − Application date)',
    unit: 'days',
    compute: (db) => {
      const p = (db.creditProfiles || []).filter((x) => typeof x.creditReviewCycleDays === 'number')
      if (!p.length) return NA
      return { value: r1(p.reduce((s, x) => s + x.creditReviewCycleDays, 0) / p.length), computable: true }
    },
  },
  K012: { // Credit Limit Utilization
    formula: '(Outstanding AR / Approved credit limit) × 100',
    unit: '%',
    compute: (db) => {
      const profiles = db.creditProfiles || []
      const totalLimit = profiles.reduce((s, p) => s + p.creditLimit, 0)
      if (totalLimit === 0) return NA
      const open = (db.invoices || []).filter((i) => i.status !== 'paid')
      const outstanding = open.reduce((s, i) => s + i.balance, 0)
      return { value: r1((outstanding / totalLimit) * 100), computable: true }
    },
  },
  K013: { // Auto-Approval Rate (credit) — proxy via creditCheckResult==='pass' on orders
    formula: '(Auto-approved applications / Total applications) × 100',
    unit: '%',
    compute: (db) => {
      const orders = db.salesOrders || []
      if (!orders.length) return NA
      const auto = orders.filter((o) => o.creditCheckResult === 'pass').length
      return { value: r1((auto / orders.length) * 100), computable: true, proxy: true }
    },
  },

  /* ============ COLLECTIONS & CASH APP ============ */
  K020: { // Collection Effectiveness Index
    formula: '(Beginning AR + Credit sales − Ending AR) / (Beginning AR + Credit sales − Ending current AR) × 100',
    unit: '%',
    compute: (db) => {
      const a = aggregates(db)
      // Beginning AR approximated as ending AR + collected-in-period (cash applied)
      const collected = (db.cashApplications || []).reduce((s, c) => s + c.amountReceived, 0)
      const beginningAR = a.endingAR + collected
      const creditSales = a.totalBilled
      const numerator = beginningAR + creditSales - a.endingAR
      const denominator = beginningAR + creditSales - a.currentAR
      if (denominator === 0) return NA
      return { value: r1((numerator / denominator) * 100), computable: true }
    },
  },
  K021: { // AR Aging > 90 Days %
    formula: '(AR > 90 days / Total AR) × 100',
    unit: '%',
    compute: (db) => {
      const a = aggregates(db)
      if (a.endingAR === 0) return NA
      return { value: r1((a.ar90 / a.endingAR) * 100), computable: true }
    },
  },
  K022: { // Cash Application Rate (Auto)
    formula: '(Auto-applied payments / Total payments) × 100',
    unit: '%',
    compute: (db) => matchRate(db),
  },
  K023: { // Collector Productivity = Cash collected / FTE collectors
    formula: 'Cash collected / FTE collectors',
    unit: 'currency',
    compute: (db) => {
      const fte = db.orgFinancials && db.orgFinancials.fteCollectors
      if (!fte) return NA
      const collected = (db.cashApplications || []).reduce((s, c) => s + c.amountReceived, 0)
      return { value: Math.round(collected / fte), computable: true }
    },
  },
  K024: { // Promise-to-Pay Kept Rate
    formula: '(Promises honored / Promises made) × 100',
    unit: '%',
    compute: (db) => {
      const promises = (db.collectionActivities || []).filter((c) => c.outcome === 'promise_to_pay').length
      const kept = (db.collectionActivities || []).filter((c) => c.outcome === 'paid').length
      const base = promises + kept
      if (base === 0) return NA
      return { value: r1((kept / base) * 100), computable: true, proxy: true }
    },
  },
  K025: { // Average Days Delinquent = DSO − Best Possible DSO
    formula: 'DSO − Best Possible DSO',
    unit: 'days',
    compute: (db) => {
      const dso = KPI_ENGINE.K001.compute(db)
      if (!dso.computable) return NA
      const a = aggregates(db)
      // Best Possible DSO = (current AR / total billed) × period
      if (a.totalBilled === 0) return NA
      const bpdso = (a.currentAR / a.totalBilled) * a.PERIOD
      return { value: r1(dso.value - bpdso), computable: true }
    },
  },

  /* ============ DEDUCTIONS & DISPUTES ============ */
  K030: { // Deduction Rate (% of Revenue)
    formula: '(Total deductions taken / Gross revenue) × 100',
    unit: '%',
    compute: (db) => {
      const a = aggregates(db)
      if (a.totalBilled === 0) return NA
      const deductions = (db.disputes || []).reduce((s, d) => s + d.claimAmount, 0)
      return { value: r2((deductions / a.totalBilled) * 100), computable: true }
    },
  },
  K031: { // Deduction Resolution Cycle Time
    formula: 'Avg(Resolution date − Deduction date)',
    unit: 'days',
    compute: (db) => {
      const resolved = (db.disputes || []).filter((d) => typeof d.resolutionCycleDays === 'number')
      if (!resolved.length) return NA
      return { value: r1(resolved.reduce((s, d) => s + d.resolutionCycleDays, 0) / resolved.length), computable: true }
    },
  },
  K032: { // Invalid Deduction Recovery Rate (rejected disputes = recovered for us)
    formula: '(Recovered invalid deductions / Total invalid deductions identified) × 100',
    unit: '%',
    compute: (db) => {
      const decided = (db.disputes || []).filter((d) => d.status === 'approved' || d.status === 'rejected')
      if (!decided.length) return NA
      const recovered = decided.filter((d) => d.status === 'rejected').length // rejected claim = we kept the cash
      return { value: r1((recovered / decided.length) * 100), computable: true, proxy: true }
    },
  },
  K033: { // Deduction Write-Off Rate (approved claims = written off to us)
    formula: '(Deductions written off / Total deductions) × 100',
    unit: '%',
    compute: (db) => {
      const all = db.disputes || []
      if (!all.length) return NA
      const wo = all.filter((d) => d.status === 'approved').length
      return { value: r1((wo / all.length) * 100), computable: true }
    },
  },
  K034: { // Trade Promotion Deduction Accuracy (pricing reason + verified POD = valid)
    formula: '(Valid trade deductions matching promo terms / Total trade deductions) × 100',
    unit: '%',
    compute: (db) => {
      const trade = (db.disputes || []).filter((d) => d.reasonCode === 'pricing')
      if (!trade.length) return NA
      const valid = trade.filter((d) => d.podStatus === 'verified').length
      return { value: r1((valid / trade.length) * 100), computable: true, proxy: true }
    },
  },
  K035: { // Dispute Volume Trend (count of disputes)
    formula: 'New disputes opened per period (rolling 12-month trend)',
    unit: 'count',
    compute: (db) => ({ value: (db.disputes || []).length, computable: true }),
  },
  K036: { // Root Cause Concentration (Top 3)
    formula: '(Top 3 root cause deductions / Total deductions) × 100',
    unit: '%',
    compute: (db) => {
      const all = db.disputes || []
      if (!all.length) return NA
      const byReason = {}
      all.forEach((d) => { byReason[d.reasonCode] = (byReason[d.reasonCode] || 0) + 1 })
      const top3 = Object.values(byReason).sort((a, b) => b - a).slice(0, 3).reduce((s, v) => s + v, 0)
      return { value: r1((top3 / all.length) * 100), computable: true }
    },
  },

  /* ============ TREASURY & WORKING CAPITAL ============ */
  K040: { // Cash Conversion Cycle = DSO + DIO − DPO
    formula: 'DSO + DIO − DPO',
    unit: 'days',
    compute: (db) => {
      const dso = KPI_ENGINE.K001.compute(db)
      if (!dso.computable) return NA
      // DIO & DPO are not in the OtC seed (they're inventory/payables); document the assumption
      const DIO = 0 // no inventory data in OtC scope
      const DPO = 0 // no payables data in OtC scope
      return { value: r1(dso.value + DIO - DPO), computable: true, partial: 'DSO only (DIO/DPO outside OtC scope)' }
    },
  },
  K041: { // Cash Forecast Accuracy (13-Week)
    formula: '1 − |Actual cash − Forecast cash| / |Actual cash| × 100',
    unit: '%',
    compute: (db) => {
      const o = db.orgFinancials
      if (!o || !o.actualCash13wk) return NA
      const acc = (1 - Math.abs(o.actualCash13wk - o.forecastCash13wk) / Math.abs(o.actualCash13wk)) * 100
      return { value: r1(acc), computable: true }
    },
  },
  K042: { // DSO by Customer Segment
    formula: 'DSO calculated per customer tier/segment',
    unit: 'days',
    compute: (db) => {
      const a = aggregates(db)
      const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze']
      const custTier = Object.fromEntries((db.customers || []).map((c) => [c.id, c.tier]))
      const bySeg = {}
      tiers.forEach((t) => {
        const segInv = (db.invoices || []).filter((i) => custTier[i.customerId] === t)
        const billed = segInv.reduce((s, i) => s + i.amount, 0)
        const open = segInv.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.balance, 0)
        bySeg[t] = billed > 0 ? r1((open / billed) * a.PERIOD) : 0
      })
      return { value: bySeg, computable: true, breakdown: true }
    },
  },
  K043: { // Early Payment Discount Capture Rate
    formula: '(Invoices paid within discount window / Discount-eligible invoices) × 100',
    unit: '%',
    compute: (db) => {
      const eligible = (db.invoices || []).filter((i) => i.discountEligible)
      if (!eligible.length) return NA
      const captured = eligible.filter((i) => i.discountCaptured).length
      return { value: r1((captured / eligible.length) * 100), computable: true }
    },
  },
  K044: { // SCF Program Utilization
    formula: '(SCF-financed invoices / SCF-eligible invoices) × 100',
    unit: '%',
    compute: (db) => {
      const o = db.orgFinancials
      if (!o || !o.scfEligibleInvoices) return NA
      return { value: r1((o.scfFinancedInvoices / o.scfEligibleInvoices) * 100), computable: true }
    },
  },
  K045: { // Free Cash Flow to Revenue
    formula: '(Operating cash flow − CapEx) / Revenue × 100',
    unit: '%',
    compute: (db) => {
      const o = db.orgFinancials
      const a = aggregates(db)
      // annualize billed (90-day window × 4) as revenue base if not provided
      const revenue = (o && o.annualRevenue) || a.totalBilled * 4
      if (!o || revenue === 0) return NA
      return { value: r1(((o.operatingCashFlow - o.capex) / revenue) * 100), computable: true }
    },
  },

  /* ============ CUSTOMER ONBOARDING & MDM ============ */
  K050: { // Onboarding Cycle Time
    formula: 'Avg(Account active date − Request submission date)',
    unit: 'days',
    compute: (db) => {
      const c = (db.customers || []).filter((x) => typeof x.onboardCycleDays === 'number')
      if (!c.length) return NA
      return { value: r1(c.reduce((s, x) => s + x.onboardCycleDays, 0) / c.length), computable: true }
    },
  },
  K051: { // Master Data Accuracy Score
    formula: '(Fields passing validation / Total audited fields) × 100',
    unit: '%',
    compute: (db) => {
      const c = (db.customers || []).filter((x) => x.mdmFieldsTotal)
      if (!c.length) return NA
      const pass = c.reduce((s, x) => s + x.mdmFieldsPassing, 0)
      const tot = c.reduce((s, x) => s + x.mdmFieldsTotal, 0)
      return { value: r1((pass / tot) * 100), computable: true }
    },
  },
  K052: { // Duplicate Account Rate
    formula: '(Duplicate accounts / Total active accounts) × 100',
    unit: '%',
    compute: (db) => {
      const active = (db.customers || []).filter((x) => x.status !== 'churned')
      if (!active.length) return NA
      const dupes = active.filter((x) => x.isDuplicate).length
      return { value: r1((dupes / active.length) * 100), computable: true }
    },
  },
  K053: { // KYC Compliance Rate
    formula: '(Accounts with complete KYC / Total active accounts) × 100',
    unit: '%',
    compute: (db) => {
      const active = (db.customers || []).filter((x) => x.status !== 'churned')
      if (!active.length) return NA
      const kyc = active.filter((x) => x.kycComplete).length
      return { value: r1((kyc / active.length) * 100), computable: true }
    },
  },
}

/* helper: auto-match rate from cash applications (shared by K006, K022) */
function matchRate(db) {
  const ca = db.cashApplications || []
  if (!ca.length) return NA
  const auto = ca.filter((c) => c.matchStatus === 'auto_matched').length
  return { value: Math.round((auto / ca.length) * 1000) / 10, computable: true }
}

/* ── Public API ──────────────────────────────────────────────────────── */

/* Compute one KPI by id against a db snapshot. */
export function computeKPI(id, db) {
  const entry = KPI_ENGINE[id]
  if (!entry) return { value: null, computable: false, unknown: true }
  return { id, formula: entry.formula, unit: entry.unit, ...entry.compute(db) }
}

/* Compute all KPIs at once → { K001: {...}, ... } */
export function computeAllKPIs(db) {
  const out = {}
  Object.keys(KPI_ENGINE).forEach((id) => { out[id] = computeKPI(id, db) })
  return out
}

/* Format a computed value for display with its unit. */
export function formatKPI(result) {
  if (!result || !result.computable) return 'n/a'
  const { value, unit } = result
  if (value === null || value === undefined) return 'n/a'
  if (typeof value === 'object') return value // breakdown — caller handles
  switch (unit) {
    case 'days': return `${value} days`
    case '%': return `${value}%`
    case 'currency': return `$${value.toLocaleString()}`
    case 'count': return `${value}`
    default: return `${value}`
  }
}

/* Map common KPI display names → spec ids, so packs that show a name can
   look up the live computed value without knowing the id. */
export const KPI_NAME_TO_ID = {
  'days sales outstanding': 'K001', 'dso': 'K001',
  'invoice accuracy': 'K002',
  'e-invoicing adoption': 'K004', 'e-invoice adoption': 'K004',
  'first-time match': 'K006', 'first-pass match': 'K006', 'first time match': 'K006',
  'bad debt': 'K010',
  'credit limit utilization': 'K012',
  'auto-approval': 'K013', 'auto approval': 'K013',
  'collection effectiveness': 'K020', 'cei': 'K020',
  'ar aging > 90': 'K021', 'aging > 90': 'K021', '90+': 'K021',
  'cash application rate': 'K022', 'auto-match': 'K022', 'cash app': 'K022',
  'promise-to-pay': 'K024', 'ptp': 'K024',
  'average days delinquent': 'K025', 'add': 'K025',
  'deduction rate': 'K030',
  'invalid deduction recovery': 'K032', 'recovery rate': 'K032',
  'deduction write-off': 'K033', 'write-off rate': 'K033',
  'trade promotion deduction': 'K034',
  'dispute volume': 'K035',
  'root cause concentration': 'K036',
  'cash conversion cycle': 'K040', 'ccc': 'K040',
  'dso by customer segment': 'K042', 'dso by segment': 'K042',
}

export function lookupKPIByName(name, db) {
  if (!name) return null
  const key = Object.keys(KPI_NAME_TO_ID).find((k) => name.toLowerCase().includes(k))
  if (!key) return null
  return computeKPI(KPI_NAME_TO_ID[key], db)
}
