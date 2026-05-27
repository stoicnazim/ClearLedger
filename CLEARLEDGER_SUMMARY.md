# ClearLedger — Project Summary

## Concept
Autonomous OtC (Order-to-Cash) platform for SSC, BPO & GBS teams.
Target: 10–1,000 employee firms (not competing with HighRadius).
Monetization: consulting-led (€3.5K–€45K) → template marketplace (€29–€399) → future SaaS.

---

## What Exists

### Live Web App (Vite + React, deployed on Vercel)
- **URL:** https://clear-ledger-ebon.vercel.app/
- **GitHub:** force-pushed from `main`
- **Source:** `C:\Users\nazim\Desktop\ClearLedger\`

#### src/ — 30+ components/pages
| Page/Component | Purpose |
|---|---|
| `App.jsx` | Main router, tab navigation |
| `LandingPage.jsx` | Hero, email capture, feature grid, APQC PCF v8.0 badge |
| `Shop.jsx` | Template marketplace (15 standalone + 5 bundles, cart in localStorage) |
| `Diagnostic-assessment.jsx` | Consulting pricing (€3.5K–€45K) with first-5 discount |
| `Cash-application-process-pack.jsx` | Cash Application process pack page |
| `dispute-resolution-process-pack.jsx` | Dispute Resolution process pack page |
| `credit-management-process-pack.jsx` | Credit Management process pack page |
| `Collections-strategy-segmentation-model.jsx` | Collections Strategy page |
| `billing-invoicing-process-pack.jsx` | Billing & Invoicing page |
| `sox-compliance-controls-library.jsx` | SOX Controls Library page |
| `Technology-selection-guide.jsx` | Tech Selection Guide page |
| `process-mining-playbook.jsx` | Process Mining Playbook page |
| `ssc-transition-guide.jsx` | SSC Transition Guide page |
| `Treasury-working-capital.jsx` | Treasury & Working Capital page |
| `Customer-onboarding.jsx` | Customer Onboarding Playbook page |
| `AR-KPI-Dashboard.jsx` | KPI dashboard with live data |
| `OtC-KPI-SPEC-v2.jsx` | KPI specification v2 |
| `AR-maturity-assessment-v2.jsx` | AR maturity assessment tool |
| `e-invoicing-compliance-readiness-tracker.jsx` | E-invoicing compliance tracker |
| `BPO-managed-services.jsx` | BPO managed services page |
| `otc-3.5-business-case-builder.jsx` | Business case builder |
| `kpiEngine.js` | KPI calculation engine |
| `seedDatabase.js` / `liveActuals.js` | Mock data & live data feeds |

### Template Excel Workbooks (openpyxl/Python) — 11 files
Built with **openpyxl 3.1.5**, Python 3.14.4 at:
`C:\Users\nazim\AppData\Local\Python\pythoncore-3.14-64\python.exe`

All in `templates/` — prefixed `ClearLedger_`, Aptos font, dark theme:

| Workbook | Sheets | Size |
|---|---|---|
| Cash Application | 12 (2 hidden, 22 formulas) | 17 KB |
| Dispute Resolution | 5 | 10 KB |
| Credit Management | 5 | 10 KB |
| Collections Strategy | 5 | 10 KB |
| Billing & Invoicing | 5 | 10 KB |
| SOX Controls | 4 | 10 KB |
| Tech Selection Guide | 4 | 9 KB |
| Process Mining Playbook | 4 | 9 KB |
| SSC Transition Guide | 4 | 9 KB |
| Treasury & WC Guide | 5 | 9 KB |
| Customer Onboarding | 5 | 10 KB |

### Build Scripts (Python/openpyxl)
- `scripts/build_cash_app.py` — Cash Application builder (12 sheets, proven)
- `scripts/build_all.py` — Builder for remaining 10 workbooks (uses shared helpers)

### Other
- `references/` — empty (reference files are at `C:\Users\nazim\Desktop\Accounts Receivable\`)
- `vercel.json` — Vercel deployment config
- `vite.config.js` — Vite build config
- `src/index.css` — Global styles (dark theme)

---

## Reference File Analysis — Key Styling Discoveries

Reference files at `C:\Users\nazim\Desktop\Accounts Receivable\`:
- `OtC_Advisory_AR_Dashboard_Dark.xlsx` (12 sheets, authoritative dark template)
- `OtC_Advisory_AR_Dashboard_Light.xlsx` (12 sheets, light variant)

### Actual Reference Colors vs. What We Used

| Element | Reference (Dark) | We Used | Match? |
|---|---|---|---|
| **Accent color** | #6B5CE7 (purple) | #58A6FF (blue) | ❌ |
| **Surface/card** | #131A2B | #161B22 | ❌ |
| **Table header fill** | #1A1F36 | #1A2332 | ❌ |
| **Editable input** | #4FC3F7 (cyan) | #4488FF (dark blue) | ❌ |
| **KPI values** | #F5A623 (gold) | #4488FF / #58A6FF | ❌ |
| **Body labels** | #FFFFFF (bold) | #E6EDF3 (regular) | ❌ |
| **Table header text** | #B8C4D4 | #FFFFFF | ❌ |
| **Section headers** | Aptos Narrow 10pt Bold | Aptos 12pt Bold | ❌ |
| **Dim text** | #6B7B8D | #8B949E | ❌ |
| **Notes text** | 9pt #6B7B8D or #B8C4D4 | 10pt #484F58 | ❌ |
| **Formula results** | 16–18pt Bold #F5A623 | inconsistent | ❌ |
| **Header bottom border** | thin #6B5CE7 (purple) | thin #30363D (grey) | ❌ |
| **BG** | #0D1117 | #0D1117 | ✅ |
| **Borders** | thin #30363D | thin #30363D | ✅ |

### Reference Font Palette
- **Aptos 28pt Bold** #6B5CE7 — Cover title
- **Aptos 24pt Bold** #6B5CE7 — Sheet titles
- **Aptos 16pt Regular** #FFFFFF — Subtitles
- **Aptos 14pt Regular** #B8C4D4 — Section subtitles
- **Aptos Narrow 10pt Bold** #6B5CE7 — ALL CAPS section labels
- **Aptos 12pt Bold** #F5A623 — KPI values (gold)
- **Aptos 11pt Bold** #FFFFFF — Row labels
- **Aptos 11pt Regular** #4FC3F7 — Editable inputs
- **Aptos 10pt Bold** #B8C4D4 — Table headers
- **Aptos 10pt Regular** #B8C4D4 — Table data
- **Aptos 9pt Regular** #6B7B8D — Notes, descriptions
- **Aptos 8pt Bold** #6B7B8D — Tiny metric labels
- **Aptos 18pt Bold** #F5A623 — Big metric values
- **Aptos 16pt Bold** #F5A623 — Formula highlights

### Key Structural Patterns in Reference
- Each sheet starts with "OtC ADVISORY" title at top-left (A1 or B1)
- Section labels in ALL CAPS (Aptos Narrow 10pt Bold, purple)
- Alternating row fills: #0D1117 / #131A2B
- Table headers on #1A1F36 fill, bottom border in #6B5CE7 (purple)
- Editable/input cells in #4FC3F7 on #131A2B surface
- Formula cells in white (#FFFFFF) on surface
- KPI card values in gold (#F5A623) 16–18pt Bold
- 3 blank row spacing before major sections

---

## What Was Fixed / Built This Session

1. **Recreated all project directories** (scripts/, templates/, references/)
2. **Built complete Cash Application workbook** (12 sheets, 22 formulas, 2 hidden) — openpyxl verified
3. **Built build_all.py** — generates all 10 remaining workbooks from shared helpers
4. **Fixed critical bug** in `editable()` helper — `nf` parameter was passed positional (mapped to `border` param instead of `nf` keyword), causing `'#,##0'` to be stored in `wb._borders` and crash on save
5. **Built all 11 workbooks successfully** — all verified to open in openpyxl
6. **Deep-analyzed reference files** — discovered major styling gaps (wrong accent color, wrong surface, wrong editable color, etc.)

---

## Known Issues / Gaps

### Template Styling (CRITICAL — needs full rewrite)
All 11 templates use wrong colors from previous assumptions. Need complete restyle:
- Change all accents from #58A6FF → #6B5CE7 (purple)
- Change surface from #161B22 → #131A2B
- Change input color from #4488FF → #4FC3F7
- Change KPI values from blue → #F5A623 (gold)
- Change section headers to Aptos Narrow 10pt Bold
- Add "ClearLedger" brand title to every sheet (A1 or B1)
- Add ALL CAPS section labels with purple accent bottom borders
- Proper alternating row fills
- 16–18pt Bold gold for KPI/metric value cells
- Changed body label text from #E6EDF3 → #FFFFFF bold
- Changed table header text from #FFFFFF → #B8C4D4
- Add purple bottom border to table headers (#6B5CE7 thin)
- Fix dim/note text colors

### Missing Infrastructure
- No Formspree / production email capture (uses localStorage fallback)
- No Stripe/Paddle payment processing (manual delivery MVP)
- No professional domain name registered
- No LinkedIn cold outreach started
- No social media presence established
- No analytics / conversion tracking
- No Etsy or other marketplace listings

### Codebase
- npm vulnerabilities (Vite dev server only, not production)
- No automated tests
- No CI/CD beyond Vercel auto-deploy

### Marketplace / Shop
- Cart persists in localStorage only
- No actual payment flow — email capture + manual delivery
- No download link generation or access control

---

## Potential Next Steps

### Short-term (Templates Polish)
1. Rewrite all styling constants in build scripts to match reference palette exactly
2. Add proper sheet headers ("ClearLedger" title block on every sheet)
3. Add ALL CAPS purple section labels between sections
4. Implement alternating row fills
5. Make KPI/formula cells gold (#F5A623) bold at 16–18pt
6. Add purple bottom border to table headers
7. Add 2–3 blank row spacing between sections (reference style)
8. Audit all 11 workbooks visually in Excel after restyle
9. Add data validation dropdowns where applicable (reference has these)
10. Consider adding "Instructions" / "How to Use" sheets (reference has these)

### Medium-term (Infrastructure)
1. Register professional domain name
2. Set up Formspree or email service for production
3. Add Stripe/Paddle for automated template delivery
4. Set up analytics (Plausible or similar)
5. Write and schedule LinkedIn outreach cadence
6. Create Etsy seller account for template marketplace

### Longer-term (Growth)
1. Build out SaaS MVP (KPI dashboard, automation calculator)
2. Content marketing — AR optimization guides
3. Build referral / partner program for BPO firms
4. Expand template library to 25+ products
5. APQC PCF v8.0 benchmark data subscription service

---

## Key File Paths

| Artifact | Path |
|---|---|
| Project root | `C:\Users\nazim\Desktop\ClearLedger\` |
| Live site | https://clear-ledger-ebon.vercel.app/ |
| Web source | `C:\Users\nazim\Desktop\ClearLedger\src\` |
| Templates | `C:\Users\nazim\Desktop\ClearLedger\templates\` |
| Build scripts | `C:\Users\nazim\Desktop\ClearLedger\scripts\` |
| Python | `C:\Users\nazim\AppData\Local\Python\pythoncore-3.14-64\python.exe` |
| Reference files | `C:\Users\nazim\Desktop\Accounts Receivable\` |
| Visual assets | `C:\Users\nazim\Desktop\ClearLedger\assets\` |
| Shop component | `C:\Users\nazim\Desktop\ClearLedger\src\Shop.jsx` |
| Main app | `C:\Users\nazim\Desktop\ClearLedger\src\App.jsx` |
| Landing page | `C:\Users\nazim\Desktop\ClearLedger\src\LandingPage.jsx` |

---

*Generated 2026-05-25 — conversational context may have gaps from prior sessions*
