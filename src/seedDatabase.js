/* ═══════════════════════════════════════════════════════════════════════
   ClearLedger — Deterministic OtC Data Seed Generator
   ───────────────────────────────────────────────────────────────────────
   Produces ~865 linked records modeling the full Order-to-Cash lifecycle:
     Customer → Credit Profile → Sales Order → Invoice
              → Cash Application / Collection Activity / Dispute

   Organized by GBS/SSC/BPO operating model:
     4 hubs (Americas / EMEA / APAC / Retained onshore)
     4 delivery models (Captive SSC / BPO / GBS-hybrid / Retained onshore)
     4 tiers (Platinum / Gold / Silver / Bronze) → SLA bands

   Deterministic: same seed → identical dataset every run (reproducible tests).
   Fixed "today" = 2026-05-24 so aging is stable across sessions.
   ═══════════════════════════════════════════════════════════════════════ */

export const TODAY = new Date('2026-05-24T00:00:00Z')

/* ── Seeded PRNG (Mulberry32) — deterministic, fast, good distribution ── */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Reference dimensions ── */
export const HUBS = ['Americas', 'EMEA', 'APAC', 'Retained onshore']
export const DELIVERY_MODELS = ['Captive SSC', 'BPO', 'GBS-hybrid', 'Retained onshore']
export const TIERS = ['Platinum', 'Gold', 'Silver', 'Bronze']
export const SLA_HOURS = { Platinum: 4, Gold: 8, Silver: 24, Bronze: 48 }
export const SEGMENTS = ['Strategic', 'Transactional']

// region → hub routing (4-hub model: MEA→EMEA, LATAM→Americas)
const REGION_TO_HUB = { NA: 'Americas', LATAM: 'Americas', EU: 'EMEA', MEA: 'EMEA', APAC: 'APAC' }

// region → representative countries + e-invoice mandate
const REGION_COUNTRIES = {
  NA: [{ c: 'US', mandate: null }, { c: 'CA', mandate: null }],
  EU: [{ c: 'PL', mandate: 'KSeF' }, { c: 'IT', mandate: 'SDI' }, { c: 'DE', mandate: 'Peppol' }, { c: 'FR', mandate: 'Peppol' }],
  APAC: [{ c: 'MY', mandate: 'MyInvois' }, { c: 'SG', mandate: 'Peppol' }, { c: 'IN', mandate: 'GST e-Invoice' }],
  MEA: [{ c: 'SA', mandate: 'ZATCA' }, { c: 'AE', mandate: 'GCC VAT' }],
  LATAM: [{ c: 'MX', mandate: 'CFDI' }, { c: 'BR', mandate: 'NF-e' }],
}

const CREDIT_RATINGS = ['AAA', 'AA', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BB+', 'BB']
const INDUSTRIES = ['Retail', 'CPG', 'Manufacturing', 'Technology', 'Pharma', 'Logistics', 'Automotive', 'Energy']

// SKU catalog (carried over + expanded)
/* ── SOP Policy Registry (Global Process Owner rule book) ── */
export const SOP_REGISTRY = [
  {
    id: 'SOP-001', version: '2.1', effectiveDate: '2026-03-01',
    title: 'Dispute Resolution & Credit Memo Authorization',
    category: 'dispute',
    rules: [
      { id: 'SOP-001-R1', description: 'Auto-approve credit memo when POD verified and claim ≤ autoApproveThreshold', condition: { podVerified: true, claimWithinThreshold: true }, action: 'auto_approve', priority: 1 },
      { id: 'SOP-001-R2', description: 'Flag for GPO manager review when claim exceeds autoApproveThreshold', condition: { claimWithinThreshold: false }, action: 'flag_review', priority: 2 },
      { id: 'SOP-001-R3', description: 'Reject claim when contract price mismatch exceeds 10% error margin', condition: { contractMismatch: true }, action: 'reject', priority: 1 },
      { id: 'SOP-001-R4', description: 'Override available for GPO director when client relationship overrides standard policy', condition: { overrideApproved: true }, action: 'override_approve', priority: 5 },
    ]
  },
  {
    id: 'SOP-002', version: '1.3', effectiveDate: '2026-04-15',
    title: 'Cash Application & Remittance Matching',
    category: 'cash_app',
    rules: [
      { id: 'SOP-002-R1', description: 'Auto-match single invoice remittance with 100% amount match', condition: { singleInvoice: true, exactMatch: true }, action: 'auto_match', priority: 1 },
      { id: 'SOP-002-R2', description: 'Flag partial payments for collector review and short-payment investigation', condition: { partialMatch: true }, action: 'flag_review', priority: 2 },
      { id: 'SOP-002-R3', description: 'Route multi-invoice bulk remittances through cash application workbench', condition: { multiInvoice: true }, action: 'route_workbench', priority: 3 },
    ]
  },
  {
    id: 'SOP-003', version: '2.0', effectiveDate: '2026-02-01',
    title: 'Collections Dunning & Escalation Protocol',
    category: 'collections',
    rules: [
      { id: 'SOP-003-R1', description: 'Auto-send courtesy reminder at Day 0-3 for all open invoices', condition: { dpdRange: '0-3' }, action: 'auto_email_courtesy', priority: 1 },
      { id: 'SOP-003-R2', description: 'Escalate to phone call cadence based on GPO dunningEscalation setting', condition: { cadenceMatch: true }, action: 'phone_call', priority: 2 },
      { id: 'SOP-003-R3', description: 'Trigger credit hold review for accounts exceeding 45 DPD with no PTP', condition: { dpdOver45: true, noPtp: true }, action: 'credit_hold_review', priority: 3 },
    ]
  },
  {
    id: 'SOP-004', version: '1.2', effectiveDate: '2026-05-01',
    title: 'Credit Limit Management & Risk Scoring',
    category: 'credit',
    rules: [
      { id: 'SOP-004-R1', description: 'Auto-approve credit limit increases under 10% of existing limit for low-risk accounts', condition: { increaseUnder10pct: true, lowRisk: true }, action: 'auto_approve', priority: 1 },
      { id: 'SOP-004-R2', description: 'Flag credit limit increases over 25% for Credit Committee review', condition: { increaseOver25pct: true }, action: 'committee_review', priority: 2 },
    ]
  },
  {
    id: 'SOP-005', version: '3.0', effectiveDate: '2026-01-15',
    title: 'E-Invoicing Compliance & Mandate Enforcement',
    category: 'compliance',
    rules: [
      { id: 'SOP-005-R1', description: 'Validate XML schema against local mandate (KSeF, SDI, Peppol, CFDI) before transmission', condition: { xmlSchemaValid: false }, action: 'reject_resubmit', priority: 1 },
      { id: 'SOP-005-R2', description: 'Route e-invoice through approved PEPPOL access point for cross-border EU invoices', condition: { crossBorderEU: true }, action: 'route_peppol', priority: 2 },
    ]
  },
  {
    id: 'SOP-006', version: '1.1', effectiveDate: '2026-04-01',
    title: 'Auto-Approval Threshold Governance',
    category: 'governance',
    rules: [
      { id: 'SOP-006-R1', description: 'All auto-approvals must stay within GPO-defined autoApproveThreshold', condition: { amountWithinThreshold: true }, action: 'allow_auto_approve', priority: 1 },
      { id: 'SOP-006-R2', description: 'Quarterly audit of auto-approved transactions by Internal Audit', condition: { quarterlyAuditDue: true }, action: 'schedule_audit', priority: 5 },
    ]
  },
  {
    id: 'SOP-007', version: '1.0', effectiveDate: '2026-05-01',
    title: 'Contract Catalog Price Verification',
    category: 'pricing',
    rules: [
      { id: 'SOP-007-R1', description: 'Verify claimed deduction against contract catalog base price × quantity', condition: { skuFound: true }, action: 'calculate_expected', priority: 1 },
      { id: 'SOP-007-R2', description: 'Auto-approve deduction when error margin < 3% of contract price', condition: { errorUnder3pct: true }, action: 'auto_approve', priority: 2 },
      { id: 'SOP-007-R3', description: 'Reject deduction when error margin exceeds 10% of contract price', condition: { errorOver10pct: true }, action: 'reject', priority: 2 },
    ]
  },
]

export const SKU_CATALOG = {
  'CL-901': { name: 'Premium OtC Module A', basePrice: 500.00 },
  'CL-502': { name: 'Standard AR Adapter', basePrice: 150.00 },
  'CL-101': { name: 'Core API Endpoint', basePrice: 100.00 },
  'CL-305': { name: 'Collections Automation Pack', basePrice: 320.00 },
  'CL-720': { name: 'Compliance Validator', basePrice: 275.00 },
  'CL-150': { name: 'Cash Match Engine Seat', basePrice: 210.00 },
}
const SKU_IDS = Object.keys(SKU_CATALOG)

const DISPUTE_REASONS = ['shortage', 'pricing', 'damage', 'quality', 'compliance']
const CARRIERS = ['FedEx Freight', 'DHL Supply Chain', 'UPS Freight', 'Maersk', 'DB Schenker', 'Kuehne+Nagel']

// Real-world customer names by region for realism
const CUSTOMER_NAMES = {
  NA: ['Walmart Corp', 'Target Corp', 'Amazon Inc', 'Costco Wholesale', 'Kroger Co', 'Home Depot', 'Best Buy', 'CVS Health', 'Walgreens', 'Albertsons'],
  EU: ['Tesco PLC', 'Carrefour SA', 'Globex de', 'Aldi Sud', 'Lidl Stiftung', 'Ahold Delhaize', 'Sainsbury', 'Metro AG', 'Auchan', 'Rewe Group'],
  APAC: ['Woolworths Ltd', 'Aeon Co', 'Coles Group', 'Seven & i', 'Dairy Farm', 'Reliance Retail', 'FairPrice', 'Lotte Mart'],
  MEA: ['Lulu Group', 'Majid Al Futtaim', 'Almarai', 'Shoprite Holdings'],
  LATAM: ['Grupo Bimbo', 'FEMSA', 'Cencosud', 'Magazine Luiza', 'Falabella'],
}

/* ── helpers ── */
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]
const pickWeighted = (rng, entries) => {
  // entries: [[value, weight], ...]
  const total = entries.reduce((s, e) => s + e[1], 0)
  let r = rng() * total
  for (const [v, w] of entries) { if ((r -= w) <= 0) return v }
  return entries[0][0]
}
const round2 = (n) => Math.round(n * 100) / 100
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d }
const fmtDate = (d) => d.toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.floor((b - a) / 86400000)

function agingBucket(daysPastDue) {
  if (daysPastDue <= 0) return 'current'
  if (daysPastDue <= 30) return '1-30'
  if (daysPastDue <= 60) return '31-60'
  if (daysPastDue <= 90) return '61-90'
  return '90+'
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN GENERATOR
   ═══════════════════════════════════════════════════════════════════════ */
export function seedDatabase(seed = 42) {
  const rng = mulberry32(seed)

  const customers = []
  const creditProfiles = []
  const salesOrders = []
  const invoices = []
  const cashApplications = []
  const collectionActivities = []
  const disputes = []

  let soCounter = 10000
  let invCounter = 88000
  let caCounter = 5000
  let colCounter = 3000
  let dispCounter = 0

  // track used names per region so we don't duplicate
  const nameIdx = { NA: 0, EU: 0, APAC: 0, MEA: 0, LATAM: 0 }

  const TARGET_CUSTOMERS = 75

  for (let i = 0; i < TARGET_CUSTOMERS; i++) {
    const custId = `CUST-${String(i + 1).padStart(3, '0')}`

    // region distribution: NA & EU heaviest, then APAC, then MEA/LATAM
    const region = pickWeighted(rng, [['NA', 32], ['EU', 30], ['APAC', 20], ['LATAM', 10], ['MEA', 8]])
    const countryInfo = pick(rng, REGION_COUNTRIES[region])

    // tier distribution: ~12 Plat / 23 Gold / 25 Silver / 15 Bronze
    const tier = pickWeighted(rng, [['Platinum', 16], ['Gold', 31], ['Silver', 33], ['Bronze', 20]])

    // segment correlates with tier
    const segment = (tier === 'Platinum' || tier === 'Gold')
      ? pickWeighted(rng, [['Strategic', 70], ['Transactional', 30]])
      : pickWeighted(rng, [['Strategic', 20], ['Transactional', 80]])

    // delivery model: strategic/platinum lean Retained onshore; transactional lean BPO
    let deliveryModel
    if (segment === 'Strategic' && tier === 'Platinum') {
      deliveryModel = pickWeighted(rng, [['Retained onshore', 50], ['GBS-hybrid', 30], ['Captive SSC', 20]])
    } else if (segment === 'Transactional') {
      deliveryModel = pickWeighted(rng, [['BPO', 55], ['Captive SSC', 30], ['GBS-hybrid', 15]])
    } else {
      deliveryModel = pick(rng, DELIVERY_MODELS)
    }

    // processing hub: Retained onshore model → Retained onshore hub; else region routing
    const processingHub = deliveryModel === 'Retained onshore' ? 'Retained onshore' : REGION_TO_HUB[region]

    // pick unique-ish name
    const pool = CUSTOMER_NAMES[region]
    const baseName = pool[nameIdx[region] % pool.length]
    const suffix = nameIdx[region] >= pool.length ? ` ${Math.floor(nameIdx[region] / pool.length) + 1}` : ''
    nameIdx[region]++
    const name = baseName + suffix

    // status: mostly active, some on_hold, few churned
    const status = pickWeighted(rng, [['active', 88], ['on_hold', 8], ['churned', 4]])

    const onboardedDaysAgo = 120 + Math.floor(rng() * 900)
    // Onboarding request → active cycle (K050); MDM/KYC quality (K051/K052/K053)
    const onboardCycleDays = pickWeighted(rng, [[2, 25], [5, 30], [9, 25], [16, 15], [25, 5]])
    const mdmFieldsTotal = 24
    const mdmFieldsPassing = mdmFieldsTotal - Math.floor(rng() * (tier === 'Platinum' ? 1 : tier === 'Gold' ? 2 : 4))
    const isDuplicate = rng() < 0.03
    const kycComplete = rng() < (tier === 'Platinum' || tier === 'Gold' ? 0.98 : 0.9)

    customers.push({
      id: custId, name, tier, region, country: countryInfo.c,
      processingHub, deliveryModel, slaHours: SLA_HOURS[tier],
      industry: pick(rng, INDUSTRIES), segment,
      onboardedDate: fmtDate(addDays(TODAY, -onboardedDaysAgo)),
      onboardRequestDate: fmtDate(addDays(TODAY, -(onboardedDaysAgo + onboardCycleDays))),
      onboardCycleDays,
      mdmFieldsTotal, mdmFieldsPassing,
      isDuplicate, kycComplete,
      status,
      eInvoiceMandate: countryInfo.mandate,
    })

    /* ── CREDIT PROFILE (1:1) ── */
    const creditLimit = pickWeighted(rng, [
      [100000, 20], [250000, 30], [500000, 25], [750000, 15], [1000000, 10]
    ])
    const rating = tier === 'Platinum' ? pick(rng, CREDIT_RATINGS.slice(0, 4))
      : tier === 'Gold' ? pick(rng, CREDIT_RATINGS.slice(2, 6))
        : pick(rng, CREDIT_RATINGS.slice(4))
    // creditStatus: most approved, some blocked/review (seed edge cases)
    const creditStatus = pickWeighted(rng, [['approved', 80], ['review', 12], ['blocked', 8]])
    const riskScore = tier === 'Platinum' ? 5 + Math.floor(rng() * 15)
      : tier === 'Gold' ? 15 + Math.floor(rng() * 20)
        : tier === 'Silver' ? 30 + Math.floor(rng() * 25)
          : 45 + Math.floor(rng() * 35)
    // Credit review cycle (K011): application→decision days, and whether auto-decided
    const creditReviewCycleDays = pickWeighted(rng, [[1, 35], [2, 25], [3, 20], [5, 15], [7, 5]])

    creditProfiles.push({
      customerId: custId, creditRating: rating, creditLimit,
      paymentTermsDays: pickWeighted(rng, [[30, 45], [45, 35], [60, 20]]),
      creditStatus, riskScore,
      creditReviewCycleDays,
      lastReviewDate: fmtDate(addDays(TODAY, -(15 + Math.floor(rng() * 180)))),
      // creditUsed / availableCredit are DERIVED later from open invoices
    })

    // churned customers get no new orders/invoices
    if (status === 'churned') continue

    /* ── SALES ORDERS (2–4 per customer) ── */
    const orderCount = 2 + Math.floor(rng() * 3)
    for (let o = 0; o < orderCount; o++) {
      const orderId = `SO-${++soCounter}`
      // ~25% of orders are "aged" — issued long ago to populate 60-90+ buckets
      const isAged = rng() < 0.25
      const orderDaysAgo = isAged ? (95 + Math.floor(rng() * 70)) : (8 + Math.floor(rng() * 70))
      const lineCount = 1 + Math.floor(rng() * 2)
      const lines = []
      for (let l = 0; l < lineCount; l++) {
        const sku = pick(rng, SKU_IDS)
        const qty = 20 + Math.floor(rng() * 200)
        lines.push({ sku, qty, unitPrice: SKU_CATALOG[sku].basePrice })
      }
      const orderValue = round2(lines.reduce((s, ln) => s + ln.qty * ln.unitPrice, 0))

      // credit check: blocked customers / over-limit → hold
      let creditCheckResult = 'pass'
      let orderStatus = 'fulfilled'
      if (creditStatus === 'blocked') { creditCheckResult = 'hold'; orderStatus = 'credit_hold' }
      else if (rng() < 0.06) { creditCheckResult = 'override'; orderStatus = 'approved' }
      else if (rng() < 0.04) { orderStatus = 'cancelled' }

      salesOrders.push({
        id: orderId, customerId: custId,
        orderDate: fmtDate(addDays(TODAY, -orderDaysAgo)),
        status: orderStatus, lines, orderValue, creditCheckResult,
      })

      // cancelled / credit_hold orders don't bill
      if (orderStatus === 'cancelled' || orderStatus === 'credit_hold') continue

      /* ── INVOICES (1 per order line group; here 1–2 per order) ── */
      const invCount = lines.length
      for (let v = 0; v < invCount; v++) {
        const line = lines[v]
        const invId = `INV-${++invCounter}`
        const issueDaysAgo = Math.max(1, orderDaysAgo - 2 - Math.floor(rng() * 5))
        const terms = creditProfiles[creditProfiles.length - 1].paymentTermsDays
        const issueDate = addDays(TODAY, -issueDaysAgo)
        const dueDate = addDays(issueDate, terms)
        const amount = round2(line.qty * line.unitPrice)
        const dpd = Math.max(0, daysBetween(dueDate, TODAY))
        // Invoice cycle time (K003): delivery → issue lag, in days
        const invoiceCycleDays = pickWeighted(rng, [[1, 40], [2, 30], [3, 20], [5, 7], [7, 3]])
        const deliveryDate = addDays(issueDate, -invoiceCycleDays)
        // Invoice accuracy flag (K002): small share have errors
        const hasError = rng() < 0.04
        // Cost per invoice (K005): varies by delivery model
        const costPerInvoice = deliveryModel === 'BPO' ? round2(2 + rng() * 3)
          : deliveryModel === 'Captive SSC' ? round2(4 + rng() * 4)
            : deliveryModel === 'GBS-hybrid' ? round2(3 + rng() * 4)
              : round2(8 + rng() * 7) // Retained onshore costliest
        // Early-payment discount eligibility/capture (K043)
        const discountEligible = rng() < 0.4
        const discountCaptured = discountEligible && rng() < 0.5

        // aged orders are more likely to still be unpaid (overdue) — realistic
        const roll = rng()
        let balance = amount
        let invStatus = 'unpaid'
        if (!isAged && roll < 0.20) { balance = 0; invStatus = 'paid' }
        else if (roll < 0.32) { balance = round2(amount * (0.3 + rng() * 0.4)); invStatus = 'partial' }
        // small share of very old unpaid → write-off candidates (K010)
        if (dpd > 120 && invStatus === 'unpaid' && rng() < 0.15) { invStatus = 'written_off' }

        // e-invoice status: rejects concentrated in mandate jurisdictions
        let eInvoiceStatus = 'accepted'
        if (countryInfo.mandate && rng() < 0.12) eInvoiceStatus = 'rejected'
        else if (countryInfo.mandate && rng() < 0.05) eInvoiceStatus = 'pending'

        invoices.push({
          id: invId, orderId, customerId: custId,
          customer: name, // legacy alias for components still reading .customer
          sku: line.sku, qty: line.qty, amount, balance, status: invStatus,
          issueDate: fmtDate(issueDate), dueDate: fmtDate(dueDate),
          deliveryDate: fmtDate(deliveryDate), invoiceCycleDays,
          hasError, costPerInvoice, discountEligible, discountCaptured,
          region, companyCode: String(1000 + (i % 9) * 1000),
          plant: `${countryInfo.c}-${String(1 + (o % 3)).padStart(2, '0')}`,
          eInvoiceStatus, daysPastDue: dpd, agingBucket: agingBucket(dpd),
        })

        /* ── CASH APPLICATIONS (for paid/partial invoices) ── */
        if (invStatus === 'paid' || invStatus === 'partial') {
          const received = invStatus === 'paid' ? amount : round2(amount - balance)
          const matchStatus = pickWeighted(rng, [
            ['auto_matched', 70], ['manual', 18], ['partial', 8], ['unmatched', 4]
          ])
          cashApplications.push({
            id: `CA-${++caCounter}`, invoiceId: invId, customerId: custId,
            amountReceived: received,
            remittanceRef: `ACH-${100000 + Math.floor(rng() * 900000)}`,
            receivedDate: fmtDate(addDays(TODAY, -Math.floor(rng() * 20))),
            matchStatus,
            matchConfidence: matchStatus === 'auto_matched' ? 92 + Math.floor(rng() * 8) : 60 + Math.floor(rng() * 30),
            appliedBy: matchStatus === 'auto_matched' ? 'CASHAPP-001' : 'AR-ANALYST',
          })
        }

        /* ── COLLECTION ACTIVITIES (for overdue unpaid/partial) ── */
        if (dpd > 0 && invStatus !== 'paid') {
          const dunningLevel = dpd > 90 ? 4 : dpd > 60 ? 3 : dpd > 30 ? 2 : 1
          collectionActivities.push({
            id: `COL-${++colCounter}`, invoiceId: invId, customerId: custId,
            activityType: ['reminder', 'call', 'escalation', 'final_notice', 'legal'][Math.min(dunningLevel, 4)],
            activityDate: fmtDate(addDays(TODAY, -Math.floor(rng() * 10))),
            dunningLevel,
            outcome: pickWeighted(rng, [
              ['promise_to_pay', 35], ['no_response', 30], ['paid', 15], ['dispute_raised', 20]
            ]),
            nextActionDate: fmtDate(addDays(TODAY, 3 + Math.floor(rng() * 7))),
          })
        }
      }
    }
  }

  /* ═══ DISPUTES — target 75, drawn against existing unpaid/partial invoices ═══ */
  const disputableInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial')
  const TARGET_DISPUTES = 75
  for (let d = 0; d < TARGET_DISPUTES && disputableInvoices.length > 0; d++) {
    const inv = disputableInvoices[Math.floor(rng() * disputableInvoices.length)]
    const custName = (customers.find(c => c.id === inv.customerId) || {}).name || inv.customerId
    const reason = pick(rng, DISPUTE_REASONS)
    const unitPrice = SKU_CATALOG[inv.sku].basePrice
    const qtyClaimed = 1 + Math.floor(rng() * 12)
    const claimAmount = round2(qtyClaimed * unitPrice)
    // POD status varies by reason
    const podStatus = reason === 'shortage' ? pickWeighted(rng, [['verified', 60], ['mismatch', 30], ['missing', 10]])
      : reason === 'damage' ? pickWeighted(rng, [['verified', 50], ['mismatch', 35], ['missing', 15]])
        : pickWeighted(rng, [['verified', 40], ['mismatch', 40], ['missing', 20]])

    const dispStatus = pickWeighted(rng, [['pending', 60], ['approved', 22], ['rejected', 12], ['escalated', 6]])
    // Dispute open → resolution cycle time (K031); resolved ones carry a resolution date
    const openedDaysAgo = 5 + Math.floor(rng() * 50)
    const resolutionCycleDays = (dispStatus === 'approved' || dispStatus === 'rejected')
      ? pickWeighted(rng, [[8, 25], [15, 30], [25, 25], [40, 15], [60, 5]])
      : null

    disputes.push({
      id: `DISP-${String(++dispCounter).padStart(3, '0')}`,
      invoiceId: inv.id, customerId: inv.customerId,
      invoice: inv.id, customer: custName, // legacy aliases for DisputeResolver
      claimAmount, sku: inv.sku, quantityClaimed: qtyClaimed,
      reasonCode: reason,
      status: dispStatus,
      openedDate: fmtDate(addDays(TODAY, -openedDaysAgo)),
      resolutionDate: resolutionCycleDays !== null ? fmtDate(addDays(TODAY, -(openedDaysAgo - resolutionCycleDays > 0 ? openedDaysAgo - resolutionCycleDays : 0))) : null,
      resolutionCycleDays,
      carrier: pick(rng, CARRIERS),
      tracking: `${pick(rng, ['FX', 'DHL', 'UPS', 'MSK'])}-${10000 + Math.floor(rng() * 89999)}`,
      podStatus,
      podDetails: podStatus === 'verified' ? `POD signed with exception: "${qtyClaimed} units short on delivery."`
        : podStatus === 'mismatch' ? 'POD signed clean. No exceptions logged. Mismatch flagged.'
          : 'POD document missing from carrier portal. Awaiting retrieval.',
    })
  }

  return {
    customers, creditProfiles, salesOrders, invoices,
    cashApplications, collectionActivities, disputes,
    skuCatalog: SKU_CATALOG,
    generatedAt: fmtDate(TODAY),
    // Org-level financials (not transactional) — used by treasury/productivity KPIs.
    // These are operating assumptions for the modeled entity, surfaced explicitly
    // so the relevant KPIs compute rather than showing n/a.
    orgFinancials: {
      fteCollectors: 8,
      scfEligibleInvoices: 60,   // count eligible for supply-chain finance
      scfFinancedInvoices: 22,   // count actually financed
      forecastCash13wk: 7200000, // 13-week forecast ($)
      actualCash13wk: 6850000,   // actual realized ($)
      operatingCashFlow: 4200000,
      capex: 900000,
      annualRevenue: null,       // derived below from billed × annualization
    },
    counts: {
      customers: customers.length, creditProfiles: creditProfiles.length,
      salesOrders: salesOrders.length, invoices: invoices.length,
      cashApplications: cashApplications.length,
      collectionActivities: collectionActivities.length, disputes: disputes.length,
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   DERIVED AGGREGATE SELECTORS (computed, never stored)
   These guarantee every tab shows the same numbers.
   ═══════════════════════════════════════════════════════════════════════ */
export const selectors = {
  totalAR: (db) => round2(db.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.balance, 0)),

  openInvoices: (db) => db.invoices.filter(i => i.status !== 'paid' && i.status !== 'written_off'),

  creditUsedByCustomer: (db, customerId) =>
    round2(db.invoices.filter(i => i.customerId === customerId && i.status !== 'paid').reduce((s, i) => s + i.balance, 0)),

  exposureByCustomer: (db) => {
    const map = {}
    db.invoices.filter(i => i.status !== 'paid').forEach(i => {
      map[i.customerId] = round2((map[i.customerId] || 0) + i.balance)
    })
    return map
  },

  agingBuckets: (db) => {
    const buckets = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    db.invoices.filter(i => i.status !== 'paid').forEach(i => {
      buckets[i.agingBucket] = round2((buckets[i.agingBucket] || 0) + i.balance)
    })
    return buckets
  },

  dso: (db) => {
    // simplified: (open AR / total billed) * 90-day window
    const openAR = selectors.totalAR(db)
    const totalBilled = db.invoices.reduce((s, i) => s + i.amount, 0)
    if (totalBilled === 0) return 0
    return round2((openAR / totalBilled) * 90)
  },

  autoMatchRate: (db) => {
    const total = db.cashApplications.length
    if (total === 0) return 0
    const auto = db.cashApplications.filter(c => c.matchStatus === 'auto_matched').length
    return round2((auto / total) * 100)
  },

  disputeResolutionRate: (db) => {
    const total = db.disputes.length
    if (total === 0) return 100
    const resolved = db.disputes.filter(d => d.status === 'approved' || d.status === 'rejected').length
    return round2((resolved / total) * 100)
  },

  revenueLeakage: (db) => {
    const approvedClaims = db.disputes.filter(d => d.status === 'approved').reduce((s, d) => s + d.claimAmount, 0)
    const totalRevenue = db.invoices.reduce((s, i) => s + i.amount, 0)
    if (totalRevenue === 0) return 0
    return round2((approvedClaims / totalRevenue) * 100)
  },

  ddo: (db) => {
    // avg age of open disputes (days) — uses linked invoice issueDate as proxy
    const open = db.disputes.filter(d => d.status === 'pending' || d.status === 'escalated')
    if (open.length === 0) return 0
    const totalAge = open.reduce((s, d) => {
      const inv = db.invoices.find(i => i.id === d.invoiceId)
      return s + (inv ? Math.max(0, daysBetween(new Date(inv.issueDate), TODAY)) : 0)
    }, 0)
    return round2(totalAge / open.length)
  },

  ccc: (db) => round2(selectors.dso(db) + 12), // DIO−DPO approximated as +12, as in original

  countByHub: (db) => {
    const map = { Americas: 0, EMEA: 0, APAC: 0, 'Retained onshore': 0 }
    db.customers.forEach(c => { map[c.processingHub] = (map[c.processingHub] || 0) + 1 })
    return map
  },

  countByDeliveryModel: (db) => {
    const map = {}
    db.customers.forEach(c => { map[c.deliveryModel] = (map[c.deliveryModel] || 0) + 1 })
    return map
  },
}
