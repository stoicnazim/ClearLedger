# ClearLedger — Next.js Project

## Quick start
```bash
npm install
npm run dev
```

## Routes
| URL | Page |
|---|---|
| `/` | Main website |
| `/products/` | Product store (AR Dashboard + Business Case Builder) |
| `/diagnostic/` | Free OtC Maturity Assessment |
| `/legal/` | Privacy, Terms, Cookies |

## Deploy to Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com → Import Project → select the repo
3. Framework: Next.js (auto-detected)
4. Deploy

## Before going live
- Replace LemonSqueezy placeholder URLs in `app/products/ClearLedgerProducts.js`
- Update "Book a Call" link in `app/diagnostic/ClearLedgerDiagnostic.js` when Calendly is ready
- Update `BASE_URL` in `app/sitemap.js` if not using clearledger.app
- Submit sitemap to Google Search Console and Bing Webmaster Tools
