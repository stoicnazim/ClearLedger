# ClearLedger — Next.js Project (v3 — Fixed)

## Changes in this version
- APQC PCF v8.0 everywhere (website, diagnostic, metadata)
- Company Size Fit: "Growing companies (10–1,000)" not "All company sizes"
- Legal footer links: Privacy Policy, Terms of Service, Cookie Policy
- Hero: all 3 credential badges including "10–1,000 Employee sweet spot"
- Formspree endpoint: xojbpajd (live)
- SSR via Next.js static export — Google can index every page

## Quick start
```bash
npm install
npm run dev
```

## Routes
| URL | Page |
|---|---|
| `/` | Main website |
| `/products/` | Product store |
| `/diagnostic/` | Free OtC Maturity Assessment |
| `/legal/` | Privacy, Terms, Cookies |

## Deploy to Vercel
1. Push to GitHub
2. vercel.com → Import → select repo → Deploy

## Before going live
- Replace LemonSqueezy URLs in `app/products/ClearLedgerProducts.js`
- Update "Book a Call" link in diagnostic when Calendly ready
- Update BASE_URL in sitemap.js if not using clearledger.app
- Submit sitemap to Google Search Console
