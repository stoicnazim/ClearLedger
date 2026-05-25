# ClearLedger — KPI Calculation Engine

**Principle applied:** No hardcoded metrics. Every KPI is *computed* from raw seed data by the formula defined in the OtC KPI Spec. One engine feeds every tab.

## What was built

### 1. `src/kpiEngine.js` — the single calculation source
Implements all **33 KPIs** from `OtC-KPI-SPEC-v2` by their documented formula, each computing from raw records:
- `computeKPI(id, db)` → `{ value, unit, formula, computable }`
- `computeAllKPIs(db)` → all KPIs at once
- `formatKPI(result)` → display string with unit
- `lookupKPIByName(name, db)` → resolve a KPI by its display name

Every value traces to a formula + raw data. Examples (seed 42):
DSO 69.9d · Invoice Accuracy 95% · Invoice Cycle 2.3d · Cost/Invoice $4.81 · Bad Debt 0.2% · Credit Review 2.6d · CEI 70.7% · Aging>90 12.6% · Auto-Match 69.9% · Deduction Rate 1.26% · Resolution Cycle 22d · CCC 69.9d · Forecast Accuracy 94.9% · Onboarding 8.4d · MDM Accuracy 96.1% · KYC 94.6% … (33 total, 0 hardcoded).

### 2. `src/context/seedDatabase.js` — extended raw data
Added the raw fields the formulas need (so nothing is faked):
- Invoices: `deliveryDate`, `invoiceCycleDays`, `hasError`, `costPerInvoice`, `discountEligible/Captured`, `written_off` status
- Credit profiles: `creditReviewCycleDays`
- Customers: `onboardRequestDate`, `onboardCycleDays`, `mdmFieldsPassing/Total`, `isDuplicate`, `kycComplete`
- Disputes: `openedDate`, `resolutionDate`, `resolutionCycleDays`
- `orgFinancials` block (FTE, forecast, SCF, cash flow) for treasury/productivity KPIs

### 3. Wiring (engine → tabs)
- **KPI Spec tab** — each KPI detail now shows its **Live Actual** computed by its formula, beside the definition
- **`liveActuals.js`** — now routes through the engine, so the 7 advisory packs already wired (Credit, AR-KPI, Treasury, Cash App, Collections, Disputes, E-Invoicing) pull engine-computed values
- Context exposes `engineDb` (clean snapshot) + `orgFinancials`

## Status
- Build: clean (2,324 modules) · Lint: 0 problems
- 33/33 KPIs computable from real data, 0 hardcoded, 0 n/a
- Deterministic (seed 42), reproducible across sessions

## Install order (depends on each other)
1. `context/seedDatabase.js` (extended raw data)
2. `context/MockDatabaseContext.jsx` (exposes engineDb)
3. `kpiEngine.js` (new — the engine)
4. `liveActuals.js` (routes through engine)
5. `OtC-KPI-SPEC-v2.jsx` (shows live actuals)

## Still to wire (next pass)
The Command Center (`components/Dashboard.jsx`) and the remaining advisory packs' inline numbers can be pointed at `computeKPI` the same way. The engine + pattern are in place; it's now mechanical repetition per tab.
