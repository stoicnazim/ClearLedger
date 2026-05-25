# ClearLedger — Advisory Library Data Alignment

**Question answered:** Is the advisory library aligned with the Command Center? It is now, for every pack the seed can authoritatively support.

## What changed
A shared `src/liveActuals.js` helper exposes the same selector-computed values the Command Center uses. Every metric-bearing pack imports it and shows a live **ACTUAL** beside its documented TARGET, badged ● LIVE. One math source → tabs cannot disagree.

## Packs now reading live data (7)
| Pack | Live metrics shown |
|---|---|
| Credit Management | Bad debt/leakage, auto-approval, portfolio concentration, review completion |
| AR-KPI Dashboard | DSO, first-pass match, bad debt (consolidated view) |
| Treasury & Working Capital | DSO + AR balance seed the WC model on open |
| Cash Application | Auto-match rate actual vs benchmarks |
| Collections | CEI/DSO/recovery/dispute-cycle where computable |
| Dispute Resolution | Resolution rate, DDO |
| E-Invoicing Compliance | Acceptance rate (87.4%), rejection rate (9.2%) |

## Deliberately NOT given live badges (honest boundary)
These packs show metrics the seed does **not** model, so adding LIVE values would mean fabricating data — which defeats the credibility of the feature:
- **Billing** — invoice accuracy, cycle time, cost-per-invoice (not seeded)
- **Process Mining** — conformance %, variant counts (not seeded)
- **Business Case Builder** — a forward-looking ROI calculator (inputs, not actuals)

These remain accurate as documented TARGET/benchmark references. If you later want them live, the seed must first model invoice-accuracy events, process-event logs, etc.

## Pure-reference packs (no metrics, correctly untouched)
BPO Managed Services, Customer Onboarding, SSC Transition, Technology Selection, SOX Controls Library, KPI Spec, Diagnostic Assessment — these are SIPOC/RACI/SOP documentation.

## Verification
- Build: clean (2,323 modules)
- Lint: 0 problems
- All values trace to the seed-42 source of truth via shared selectors.
