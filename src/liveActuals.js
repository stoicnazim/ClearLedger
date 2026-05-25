/* ═══════════════════════════════════════════════════════════════════════
   ClearLedger — Shared Live Actuals Helper
   ───────────────────────────────────────────────────────────────────────
   One overlay used by every metric-bearing advisory pack so that the numbers
   shown next to documented TARGETS are the SAME selector-computed actuals the
   Command Center shows. Import { useLiveActuals } and read the fields you need.

   This guarantees cross-tab alignment: there is exactly one math source.
   ═══════════════════════════════════════════════════════════════════════ */
import { useMockDatabase } from './context/MockDatabaseContext'
import { computeAllKPIs } from './kpiEngine'

const r2 = (n) => Math.round(n * 100) / 100

export function useLiveActuals() {
  const ctx = useMockDatabase() || {}
  const { derived, invoices = [], disputes = [], customers = [], engineDb } = ctx
  if (!derived) return null

  // Engine results (formula-computed) — the authoritative source
  const engine = engineDb ? computeAllKPIs(engineDb) : null

  // Per-region AR + overdue (region lives on invoices) — seed-authoritative
  const regions = ['NA', 'EU', 'APAC', 'MEA', 'LATAM']
  const byRegion = {}
  regions.forEach((rg) => {
    const open = invoices.filter((i) => i.region === rg && i.status !== 'paid')
    byRegion[rg] = {
      ar: r2(open.reduce((s, i) => s + i.balance, 0)),
      overdue: r2(open.filter((i) => i.daysPastDue > 0).reduce((s, i) => s + i.balance, 0)),
      count: open.length,
    }
  })

  const aging = derived.agingBuckets()
  const totalAR = derived.totalAR()

  // e-invoice acceptance / rejection (seed tracks eInvoiceStatus)
  const total = invoices.length || 1
  const accepted = invoices.filter((i) => i.eInvoiceStatus === 'accepted').length
  const rejected = invoices.filter((i) => i.eInvoiceStatus === 'rejected').length

  return {
    // headline KPIs (consolidated)
    dso: derived.dso(),
    autoMatch: derived.autoMatchRate(),
    totalAR,
    totalARm: r2(totalAR / 1_000_000), // in $M for packs that display millions
    disputeResolution: derived.disputeResolutionRate(),
    revenueLeakage: derived.revenueLeakage(),
    ddo: derived.ddo(),
    ccc: derived.ccc(),
    // aging
    aging,
    agingOverdue: r2((aging['1-30'] || 0) + (aging['31-60'] || 0) + (aging['61-90'] || 0) + (aging['90+'] || 0)),
    agingCurrent: aging.current || 0,
    // counts
    openInvoiceCount: invoices.filter((i) => i.status !== 'paid').length,
    disputeCount: disputes.length,
    eInvoiceAcceptance: r2((accepted / total) * 100),
    eInvoiceRejection: r2((rejected / total) * 100),
    pendingDisputes: disputes.filter((d) => d.status === 'pending' || d.status === 'escalated').length,
    customerCount: customers.length,
    // per-region
    byRegion,
    engine,
  }
}

/* Small inline badge component (consistent across packs).
   Usage: {live && <LiveBadge />}  next to a metric. */
export function liveBadgeStyle() {
  return {
    fontSize: 9, padding: '2px 8px', borderRadius: 10,
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: 0.5,
    background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)',
    whiteSpace: 'nowrap',
  }
}

/* Maps a documented KPI name to its live actual. Now routes through the KPI
   ENGINE (single formula source) via name→id lookup, falling back to the older
   direct fields for names the engine doesn't map. */
export function getKpiActual(kpiName, live) {
  if (!live || !kpiName) return null
  const n = kpiName.toLowerCase()
  // engine-backed values (preferred) are attached to `live.engine` when available
  if (live.engine) {
    const map = {
      'auto-match': 'K022', 'auto match': 'K022', 'cash application': 'K022',
      'first-pass': 'K006', 'first time match': 'K006', 'first-time match': 'K006',
      'dso': 'K001', 'collection effectiveness': 'K020', 'cei': 'K020',
      'recovery rate': 'K032', 'resolution cycle': 'K031', 'ddo': 'K031',
      'bad debt': 'K010', 'write-off': 'K033', 'leakage': 'K010',
      'cash conversion': 'K040', 'ccc': 'K040', 'aging > 90': 'K021', '90+': 'K021',
      'acceptance rate': 'K004', 'rejection': 'K004', 'error rate': 'K002',
      'deduction rate': 'K030', 'promise': 'K024',
    }
    const key = Object.keys(map).find((k) => n.includes(k))
    if (key && live.engine[map[key]] && live.engine[map[key]].computable) {
      const r = live.engine[map[key]]
      const v = r.value
      return r.unit === 'days' ? `${v} days` : r.unit === '%' ? `${v}%` : r.unit === 'currency' ? `$${v.toLocaleString()}` : `${v}`
    }
  }
  // fallback to legacy direct fields
  if (n.includes('auto-match') || n.includes('match rate') || n.includes('first-pass')) return `${live.autoMatch}%`
  if (n.includes('dso')) return `${live.dso} days`
  if (n.includes('acceptance rate')) return `${live.eInvoiceAcceptance}%`
  if (n.includes('rejection') || n.includes('error rate')) return `${live.eInvoiceRejection}%`
  return null
}
