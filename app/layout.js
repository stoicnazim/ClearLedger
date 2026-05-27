import './globals.css';

export const metadata = {
  title: { default: 'ClearLedger — Autonomous OtC Platform for SSC, BPO & GBS', template: '%s | ClearLedger' },
  description: 'APQC PCF v8.0-aligned AR maturity diagnostic, process packs, and AI-powered Order-to-Cash automation for shared service centers and business process outsourcers.',
  keywords: ['accounts receivable', 'order to cash', 'SSC', 'BPO', 'GBS', 'AR automation', 'APQC', 'shared services', 'cash application', 'dispute resolution'],
  openGraph: { title: 'ClearLedger — Autonomous OtC Platform', description: 'APQC-aligned AR diagnostic, process packs, and AI agents for SSC, BPO & GBS teams.', url: 'https://clearledger.app', siteName: 'ClearLedger', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'ClearLedger — Autonomous OtC Platform', description: 'APQC-aligned AR diagnostic, process packs, and AI agents for SSC, BPO & GBS teams.' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
