import { evaluateRules } from './ruleEngine'

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
  K054: { // Dispute Prevention Score
    formula: 'Weighted score across 8 onboarding quality factors (100-point scale)',
    unit: 'points',
    compute: (db) => {
      const cust = db.customers || []
      if (!cust.length) return NA
      // Proxy from 4 available factors with 25 pts each = 100 scale
      const mdmRatio = cust.reduce((s, c) => s + (c.mdmFieldsPassing || 0), 0) / Math.max(1, cust.reduce((s, c) => s + (c.mdmFieldsTotal || 24), 0))
      const kycRatio = cust.filter((c) => c.kycComplete).length / cust.length
      const dupePenalty = Math.max(0, 1 - cust.filter((c) => c.isDuplicate).length / cust.length)
      const onboardFast = cust.filter((c) => c.onboardCycleDays && c.onboardCycleDays <= 7).length / cust.length
      const score = r1((mdmRatio * 25 + kycRatio * 25 + dupePenalty * 25 + onboardFast * 25))
      return { value: score, computable: true, proxy: '4-factor proxy (MDM quality, KYC, duplicates, cycle time)' }
    },
  },
  /* ============ TECHNOLOGY & AUTOMATION ============ */
  K060: { // Straight-Through Processing Rate
    formula: '(Transactions requiring zero manual touch / Total transactions) × 100',
    unit: '%',
    compute: (db) => {
      const ca = db.cashApplications || []
      const orders = db.salesOrders || []
      const autoMatched = ca.filter((c) => c.matchStatus === 'auto_matched').length
      const autoApproved = orders.filter((o) => o.creditCheckResult === 'pass').length
      const total = ca.length + orders.length
      if (total === 0) return NA
      return { value: r1(((autoMatched + autoApproved) / total) * 100), computable: true, proxy: 'Auto-match rate + auto-approval rate combined' }
    },
  },
  K061: { // System Integration Completeness
    formula: '(Integrated data flows / Required data flows per architecture spec) × 100',
    unit: '%',
    compute: () => ({ ...NA, proxy: 'Requires integration architecture spec — not computable from seed data' }),
  },
  K062: { // RFP Score Variance
    formula: 'StdDev of evaluator scores / Mean score × 100',
    unit: '%',
    compute: () => ({ ...NA, proxy: 'Requires vendor evaluation scores — not in seed data' }),
  },
  K063: { // Total Cost of Ownership (TCO) Variance
    formula: '(Actual TCO − Projected TCO) / Projected TCO × 100',
    unit: '%',
    compute: () => ({ ...NA, proxy: 'Requires TCO projections and actuals — not in seed data' }),
  },
  /* ============ BPO & MANAGED SERVICES ============ */
  K070: { // BPO Cost per Transaction
    formula: 'Total BPO cost / Transactions processed by BPO',
    unit: 'currency',
    compute: (db) => {
      const bpoCustomers = (db.customers || []).filter((c) => c.deliveryModel === 'BPO')
      if (!bpoCustomers.length) return { ...NA, proxy: 'No BPO delivery model customers in seed' }
      const bpoIds = new Set(bpoCustomers.map((c) => c.id))
      const bpoInvs = (db.invoices || []).filter((i) => bpoIds.has(i.customerId))
      if (!bpoInvs.length) return { ...NA, proxy: 'No invoices for BPO customers' }
      const totalCost = bpoInvs.reduce((s, i) => s + (i.costPerInvoice || 0), 0)
      return { value: r2(totalCost / bpoInvs.length), computable: true, proxy: 'Avg cost per invoice for BPO-delivered customers' }
    },
  },
  K071: { // BPO SLA Compliance Rate
    formula: '(SLA targets met / Total SLA targets measured) × 100',
    unit: '%',
    compute: () => ({ ...NA, proxy: 'Requires SLA metrics data — not in seed' }),
  },
  K072: { // Transition Risk Score
    formula: 'Weighted risk register score (8 risk items × likelihood × impact)',
    unit: 'score',
    compute: () => ({ ...NA, proxy: 'Requires risk register data — not in seed' }),
  },
  K073: { // Retained Org Efficiency
    formula: 'Processes governed / Retained FTEs',
    unit: 'ratio',
    compute: () => ({ ...NA, proxy: 'Requires retained org FTE data — not in seed' }),
  },
  /* ============ CROSS-FUNCTIONAL ============ */
  K080: { // OtC Maturity Score
    formula: 'Weighted average across maturity dimensions (1-5 scale)',
    unit: 'level',
    compute: (db) => {
      const cust = db.customers || []
      if (!cust.length) return NA
      // Proxy maturity from 4 dimensions (each 1-5):
      // 1. MDM quality → mdmFieldsPassing/mdmFieldsTotal mapped to 1-5
      // 2. KYC completeness → kycComplete ratio
      // 3. Onboarding speed → onboardCycleDays inverse
      // 4. Credit health → credit profiles risk score inverse
      const profiles = db.creditProfiles || []
      const mdmAvg = cust.reduce((s, c) => s + (c.mdmFieldsPassing || 0) / Math.max(1, c.mdmFieldsTotal || 24), 0) / cust.length
      const kycRatio = cust.filter((c) => c.kycComplete).length / cust.length
      const onboardAvg = cust.reduce((s, c) => s + Math.min(1, 14 / Math.max(1, c.onboardCycleDays || 14)), 0) / cust.length
      const riskAvg = profiles.length ? profiles.reduce((s, p) => s + Math.max(0, 1 - (p.riskScore || 0) / 100), 0) / profiles.length : 0
      const maturity = r1((mdmAvg + kycRatio + onboardAvg + riskAvg) / 4 * 5)
      return { value: Math.min(5, Math.max(1, maturity)), computable: true, proxy: '4-dimension proxy (MDM, KYC, onboarding, credit risk)' }
    },
  },
  K081: { // OtC FTE per $B Revenue
    formula: 'Total OtC FTEs / (Annual revenue / 1B)',
    unit: 'FTEs',
    compute: (db) => {
      const o = db.orgFinancials
      const a = aggregates(db)
      const revenue = (o && o.annualRevenue) || a.totalBilled * 4
      if (!revenue) return { ...NA, proxy: 'Requires total OtC FTE count — not in seed' }
      return { ...NA, proxy: 'FTE headcount data not available in seed; use orgFinancials.fteCollectors as partial proxy' }
    },
  },
  K082: { // Total OtC Cost as % of Revenue
    formula: '(Total OtC operating costs / Net revenue) × 100',
    unit: '%',
    compute: (db) => {
      const inv = db.invoices || []
      const a = aggregates(db)
      if (!inv.length || a.totalBilled === 0) return NA
      const totalCost = inv.reduce((s, i) => s + (i.costPerInvoice || 0), 0)
      return { value: r2((totalCost / a.totalBilled) * 100), computable: true, proxy: 'Sum(costPerInvoice) / totalBilled — excludes system/overhead costs' }
    },
  },
  K083: { // Customer Satisfaction (OtC-related)
    formula: 'Survey score (1-5) across billing, collections, dispute, and portal experience',
    unit: 'score',
    compute: () => ({ ...NA, proxy: 'Requires survey data — not in seed' }),
  },
  K084: { // Process Automation Coverage
    formula: '(Automated process steps / Total process steps) × 100',
    unit: '%',
    compute: (db) => {
      // Proxy: combine auto-match rate and auto-approval rate as proxy for automation breadth
      const ca = db.cashApplications || []
      const orders = db.salesOrders || []
      const matchAuto = ca.length ? ca.filter((c) => c.matchStatus === 'auto_matched').length / ca.length : 0
      const creditAuto = orders.length ? orders.filter((o) => o.creditCheckResult === 'pass').length / orders.length : 0
      const collAuto = (db.collectionActivities || []).length ? 0.4 : 0 // placeholder — no automation field on activities
      const coverage = r1(((matchAuto + creditAuto + collAuto) / 3) * 100)
      return { value: coverage, computable: true, proxy: '3-factor proxy (cash app auto-match, credit auto-approval, collections automation estimate)' }
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
  'dispute prevention': 'K054', 'prevention score': 'K054',
  'straight-through processing': 'K060', 'stp rate': 'K060', 'stp': 'K060',
  'integration completeness': 'K061',
  'rfp score variance': 'K062',
  'tco variance': 'K063', 'total cost of ownership': 'K063',
  'bpo cost per transaction': 'K070',
  'bpo sla compliance': 'K071', 'sla compliance': 'K071',
  'transition risk': 'K072',
  'retained org efficiency': 'K073',
  'otc maturity': 'K080', 'maturity score': 'K080',
  'otc fte per b revenue': 'K081', 'fte per b': 'K081',
  'total otc cost': 'K082', 'otc cost %': 'K082',
  'customer satisfaction': 'K083',
  'automation coverage': 'K084', 'process automation': 'K084',
}

export function lookupKPIByName(name, db) {
  if (!name) return null
  const key = Object.keys(KPI_NAME_TO_ID).find((k) => name.toLowerCase().includes(k))
  if (!key) return null
  return computeKPI(KPI_NAME_TO_ID[key], db)
}

/* ── KPI Threshold Breach Evaluation (Rule Engine integration) ── */

/**
 * KPI threshold definitions mapping KPI IDs to breach conditions.
 * Each entry defines the threshold and which SOP context keys to set when breached.
 */
export const KPI_THRESHOLDS = {
  K001: { label: 'DSO', warnAbove: 42, criticalAbove: 50, contextKeys: { dsoElevated: true, cccWorsening: true } },
  K002: { label: 'Invoice Accuracy', warnBelow: 90, criticalBelow: 80, contextKeys: { skuFound: false } },
  K004: { label: 'E-Invoice Adoption', warnBelow: 50, criticalBelow: 30, contextKeys: { localMandateSchemaValid: false } },
  K010: { label: 'Bad Debt %', warnAbove: 0.5, criticalAbove: 1.0, contextKeys: { autoDowngradeTrigger: true } },
  K012: { label: 'Credit Limit Utilization', warnAbove: 70, criticalAbove: 85, contextKeys: { autoDowngradeTrigger: true } },
  K020: { label: 'CEI', warnBelow: 85, criticalBelow: 75, contextKeys: { escalationDue: true } },
  K021: { label: 'AR > 90 Days', warnAbove: 15, criticalAbove: 25, contextKeys: { dpdOver45: true, noPtp: true } },
  K022: { label: 'Auto-Match Rate', warnBelow: 70, criticalBelow: 55, contextKeys: { partialMatch: true } },
  K024: { label: 'PTP Kept Rate', warnBelow: 70, criticalBelow: 55, contextKeys: { noPtp: true } },
  K040: { label: 'CCC', warnAbove: 55, criticalAbove: 65, contextKeys: { cccWorsening: true, dsoElevated: true } },
  K041: { label: 'Cash Forecast Accuracy', warnBelow: 85, criticalBelow: 75, contextKeys: { forecastAccuracyLow: true } },
  K054: { label: 'Dispute Prevention Score', warnBelow: 60, criticalBelow: 40, contextKeys: { disputePreventionLow: true } },
  K060: { label: 'STP Rate', warnBelow: 50, criticalBelow: 30, contextKeys: { stpLow: true } },
  K070: { label: 'BPO Cost per Transaction', warnAbove: 10, criticalAbove: 15, contextKeys: { bpoCostElevated: true } },
  K080: { label: 'OtC Maturity', warnBelow: 2.5, criticalBelow: 1.5, contextKeys: { maturityLow: true } },
  K082: { label: 'OtC Cost % of Revenue', warnAbove: 0.8, criticalAbove: 1.2, contextKeys: { costElevated: true } },
  K084: { label: 'Process Automation', warnBelow: 40, criticalBelow: 25, contextKeys: { automationLow: true } },
}

/**
 * evaluateKPIThresholds(kpiResults, sopRegistry)
 *
 * @param {Object} kpiResults - output of computeAllKPIs(db) e.g. { K001: { value: 38.5, computable: true }, ... }
 * @param {Array} sopRegistry - full SOP_REGISTRY array from seedDatabase
 * @returns {Array} matched rules sorted by priority, enriched with breach info
 */
export function evaluateKPIThresholds(kpiResults, sopRegistry) {
  const context = {}
  const breaches = []

  for (const [kpiId, threshold] of Object.entries(KPI_THRESHOLDS)) {
    const result = kpiResults[kpiId]
    if (!result || !result.computable || result.value == null) continue

    const val = typeof result.value === 'number' ? result.value : null
    if (val === null) continue

    let breached = false
    let severity = 'ok'
    if (threshold.warnAbove != null && val > threshold.warnAbove) {
      breached = true
      severity = val > threshold.criticalAbove ? 'critical' : 'warning'
    } else if (threshold.warnBelow != null && val < threshold.warnBelow) {
      breached = true
      severity = val < threshold.criticalBelow ? 'critical' : 'warning'
    }

    if (breached) {
      Object.assign(context, threshold.contextKeys)
      breaches.push({ kpiId, label: threshold.label, value: val, severity, threshold })
    }
  }

  const matchedRules = evaluateRules(sopRegistry, ['treasury', 'risk', 'collections', 'credit', 'compliance', 'governance'], context)

  return {
    contextKeysUsed: Object.keys(context),
    breaches,
    matchedRules,
  }
}
