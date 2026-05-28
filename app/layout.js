import './globals.css';

export const metadata = {
  metadataBase: new URL('https://clearledger.app'),
  title: { default: 'ClearLedger — Autonomous OtC Platform for SSC, BPO & GBS', template: '%s | ClearLedger' },
  description: 'APQC PCF v8.0-aligned AR maturity diagnostic, process packs, and Order-to-Cash advisory for shared service centers and business process outsourcers.',
  keywords: ['accounts receivable', 'order to cash', 'SSC', 'BPO', 'GBS', 'AR automation', 'APQC', 'shared services', 'cash application', 'dispute resolution', 'OtC consulting', 'fractional CFO'],
  twitter: { card: 'summary_large_image', title: 'ClearLedger — Autonomous OtC Platform', description: 'APQC-aligned AR diagnostic, process packs, and OtC advisory for SSC, BPO & GBS teams.' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'ClearLedger — Autonomous OtC Platform',
    description: 'APQC-aligned AR diagnostic, process packs, and OtC advisory for SSC, BPO & GBS teams.',
    url: 'https://clearledger.app',
    siteName: 'ClearLedger',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  other: { 'theme-color': '#08090E' },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ClearLedger',
    url: 'https://clearledger.app',
    logo: 'https://clearledger.app/favicon.svg',
    description: 'APQC-aligned Order-to-Cash advisory for growing companies. Diagnostics, process architecture, and implementation.',
    address: { '@type': 'PostalAddress', addressLocality: 'Warsaw', addressCountry: 'PL' },
    knowsAbout: ['Order-to-Cash', 'Accounts Receivable', 'APQC Process Classification Framework', 'OTC Maturity Assessment'],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
