import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#08090E",
  bgCard: "#0D1117",
  border: "rgba(255,255,255,0.06)",
  text: "#E8E6F0",
  textDim: "rgba(232,230,240,0.62)",
  textMid: "rgba(232,230,240,0.75)",
  accent: "#6B5CE7",
  accentGlow: "rgba(107,92,231,0.12)",
  cyan: "#4FC3F7",
  serif: "'Fraunces', serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
};

const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor={C.accent} />
        <stop offset="100%" stopColor={C.cyan} />
      </linearGradient>
    </defs>
    <path d="M20 4L36 34H4L20 4Z" stroke="url(#lLogoGrad)" strokeWidth="2.5" fill="none" />
    <text x="20" y="30" textAnchor="middle" fill="url(#lLogoGrad)" fontFamily={C.serif} fontSize="16" fontStyle="italic" fontWeight="600">a</text>
  </svg>
);

const EFFECTIVE_DATE = "May 26, 2026";
const CONTACT_EMAIL = "privacy@clearledger.app";
const COMPANY_NAME = "ClearLedger";
const COMPANY_ENTITY = "ClearLedger (sole proprietorship)";
const COMPANY_LOCATION = "Warsaw, Poland";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: "32px" }}>
    <h3 style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 400, color: C.text, marginBottom: "12px" }}>{title}</h3>
    <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMid, lineHeight: 1.8 }}>{children}</div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div style={{ marginBottom: "16px", marginLeft: "0" }}>
    <h4 style={{ fontFamily: C.sans, fontSize: "15px", fontWeight: 500, color: C.text, marginBottom: "8px" }}>{title}</h4>
    <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMid, lineHeight: 1.8 }}>{children}</div>
  </div>
);

const Li = ({ children }) => (
  <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
    <span style={{ color: C.accent, fontSize: "8px", marginTop: "8px" }}>●</span>
    <span>{children}</span>
  </div>
);

// ─── Privacy Policy Content ──────────────────────────────────
const PrivacyContent = () => (
  <div>
    <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, marginBottom: "28px" }}>
      Effective: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
    </p>

    <Section title="1. Who We Are">
      <p>{COMPANY_NAME} is an Order-to-Cash advisory practice operated by {COMPANY_ENTITY}, based in {COMPANY_LOCATION}. When this policy refers to "we," "us," or "our," it means {COMPANY_NAME}.</p>
      <p style={{ marginTop: "8px" }}>Data Protection Contact: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent, textDecoration: "none" }}>{CONTACT_EMAIL}</a></p>
    </Section>

    <Section title="2. What Data We Collect">
      <SubSection title="2.1 Data You Provide">
        <Li>Email address (when you sign up for our diagnostic or newsletter)</Li>
        <Li>Company information (name, revenue, industry, ERP — when you complete our diagnostic assessment)</Li>
        <Li>Name and contact details (when you book a consultation or engage our services)</Li>
        <Li>Correspondence (emails, messages you send us)</Li>
      </SubSection>
      <SubSection title="2.2 Data Collected Automatically">
        <Li>Device and browser information (type, version, operating system)</Li>
        <Li>IP address and approximate location (country/city level)</Li>
        <Li>Pages visited, time spent, referral source</Li>
        <Li>Diagnostic assessment responses (stored locally in your browser unless you submit results)</Li>
      </SubSection>
      <SubSection title="2.3 Data We Do Not Collect">
        <Li>We do not collect financial account numbers, bank details, or payment card information through our website</Li>
        <Li>We do not use tracking pixels from social media platforms</Li>
        <Li>We do not purchase data from third-party data brokers</Li>
      </SubSection>
    </Section>

    <Section title="3. How We Use Your Data">
      <Li>To deliver the OtC diagnostic assessment and results</Li>
      <Li>To respond to your inquiries and provide advisory services</Li>
      <Li>To send relevant communications about our services (with your consent)</Li>
      <Li>To improve our website and diagnostic tools</Li>
      <Li>To comply with legal obligations</Li>
      <p style={{ marginTop: "12px" }}>We process your data under the following legal bases (GDPR Article 6): consent (for marketing communications), contract performance (for service delivery), legitimate interests (for website improvement and security), and legal obligations.</p>
    </Section>

    <Section title="4. Data Sharing">
      <p>We do not sell your personal data to third parties. We share data only with:</p>
      <Li>Service providers who help us operate (hosting: Vercel; email: Formspree; analytics: if applicable) — under data processing agreements</Li>
      <Li>Professional advisors (legal, accounting) when necessary</Li>
      <Li>Authorities when required by law</Li>
    </Section>

    <Section title="5. Data Retention">
      <p>We retain your data for as long as necessary to provide our services or as required by law. Specifically:</p>
      <Li>Email addresses: until you unsubscribe or request deletion</Li>
      <Li>Diagnostic results: stored in your browser session only (not on our servers) unless you explicitly submit them</Li>
      <Li>Engagement records: 7 years (Polish tax and commercial law requirements)</Li>
      <Li>Website analytics: 26 months maximum</Li>
    </Section>

    <Section title="6. Your Rights (GDPR)">
      <p>Under GDPR, you have the right to:</p>
      <Li>Access your personal data</Li>
      <Li>Rectify inaccurate data</Li>
      <Li>Erase your data ("right to be forgotten")</Li>
      <Li>Restrict processing</Li>
      <Li>Data portability</Li>
      <Li>Object to processing</Li>
      <Li>Withdraw consent at any time</Li>
      <p style={{ marginTop: "12px" }}>To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent, textDecoration: "none" }}>{CONTACT_EMAIL}</a>. We will respond within 30 days. You also have the right to lodge a complaint with the Polish Data Protection Authority (UODO — uodo.gov.pl).</p>
    </Section>

    <Section title="7. International Transfers">
      <p>Your data may be processed outside the EEA by our service providers (e.g., Vercel's infrastructure). Where this occurs, we ensure appropriate safeguards are in place (Standard Contractual Clauses or adequacy decisions).</p>
    </Section>

    <Section title="8. Security">
      <p>We implement appropriate technical and organizational measures to protect your data, including encrypted connections (TLS/SSL), access controls, and regular security reviews. The diagnostic assessment runs entirely in your browser — no diagnostic data is transmitted to our servers unless you explicitly submit it.</p>
    </Section>

    <Section title="9. Changes">
      <p>We may update this policy from time to time. Material changes will be communicated via our website. The "last updated" date at the top reflects the most recent revision.</p>
    </Section>
  </div>
);

// ─── Terms of Service Content ────────────────────────────────
const TermsContent = () => (
  <div>
    <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, marginBottom: "28px" }}>
      Effective: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
    </p>

    <Section title="1. Agreement">
      <p>By accessing or using the {COMPANY_NAME} website, diagnostic tools, or advisory services, you agree to these Terms of Service. If you do not agree, please do not use our services. {COMPANY_NAME} is operated by {COMPANY_ENTITY}, registered in {COMPANY_LOCATION}.</p>
    </Section>

    <Section title="2. Services">
      <SubSection title="2.1 Website & Diagnostic Tools">
        <p>Our website provides information about our Order-to-Cash advisory services and offers a free OtC maturity diagnostic assessment. The diagnostic is provided "as is" for informational purposes. Assessment results are generated based on your responses and general industry benchmarks — they do not constitute professional advice specific to your organization.</p>
      </SubSection>
      <SubSection title="2.2 Advisory Services">
        <p>Professional advisory engagements (Health Check, Accelerator, Transformation) are governed by separate engagement agreements. These Terms cover website and diagnostic tool usage. Advisory engagement terms — including scope, deliverables, timelines, fees, and confidentiality — are defined in individual Statements of Work.</p>
      </SubSection>
      <SubSection title="2.3 Digital Products">
        <p>Downloadable products (Excel dashboards, toolkits) are licensed for your organization's internal use only. Redistribution, resale, or sharing outside your organization is prohibited. Products are provided "as is" — while we strive for accuracy, we do not guarantee that formulas or calculations will be error-free for your specific use case.</p>
      </SubSection>
    </Section>

    <Section title="3. Intellectual Property">
      <p>All content on our website, diagnostic tools, and deliverables — including methodologies, frameworks, APQC process alignments, scoring models, design elements, and the △a logo mark — is the intellectual property of {COMPANY_NAME}. APQC Process Classification Framework references are used under fair use for benchmarking purposes; APQC PCF is a trademark of APQC.</p>
      <p style={{ marginTop: "8px" }}>You may not copy, reproduce, distribute, or create derivative works from our content without written permission, except for your organization's internal use of purchased products and engagement deliverables.</p>
    </Section>

    <Section title="4. Acceptable Use">
      <p>You agree not to:</p>
      <Li>Use our services for any unlawful purpose</Li>
      <Li>Attempt to reverse-engineer our diagnostic scoring algorithms</Li>
      <Li>Scrape, crawl, or extract data from our website by automated means</Li>
      <Li>Misrepresent your affiliation with {COMPANY_NAME}</Li>
      <Li>Use our name, logo, or brand assets without written permission</Li>
    </Section>

    <Section title="5. Limitation of Liability">
      <p>To the maximum extent permitted by applicable law (including Polish Civil Code and EU consumer protection directives):</p>
      <Li>{COMPANY_NAME} provides the website and diagnostic tools on an "as is" basis without warranties of any kind</Li>
      <Li>Diagnostic results are general assessments, not professional advice tailored to your organization</Li>
      <Li>We are not liable for business decisions made based on diagnostic results or website content</Li>
      <Li>Our total liability for any claim related to website usage shall not exceed €100</Li>
      <p style={{ marginTop: "8px" }}>This limitation does not affect your statutory rights under EU or Polish consumer protection law.</p>
    </Section>

    <Section title="6. Governing Law & Disputes">
      <p>These Terms are governed by the laws of Poland. Any disputes shall be resolved by the courts of Warsaw, Poland, except where EU consumer protection rules provide otherwise. If you are an EU consumer, you may also use the European Commission's Online Dispute Resolution platform (ec.europa.eu/consumers/odr).</p>
    </Section>

    <Section title="7. Changes">
      <p>We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance. Material changes will be communicated via our website.</p>
    </Section>

    <Section title="8. Contact">
      <p>Questions about these Terms: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent, textDecoration: "none" }}>{CONTACT_EMAIL}</a></p>
    </Section>
  </div>
);

// ─── Cookie Policy Content ───────────────────────────────────
const CookieContent = () => (
  <div>
    <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, marginBottom: "28px" }}>
      Effective: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
    </p>

    <Section title="1. What Are Cookies">
      <p>Cookies are small text files stored on your device when you visit a website. They serve various functions like remembering your preferences, analyzing site usage, and enabling certain features.</p>
    </Section>

    <Section title="2. Cookies We Use">
      <SubSection title="2.1 Strictly Necessary Cookies">
        <p>These are essential for the website to function. They do not require consent.</p>
        <Li>Session management (keeping your diagnostic progress as you navigate)</Li>
        <Li>Security cookies (CSRF protection)</Li>
        <p style={{ marginTop: "8px" }}>Note: Our OtC Diagnostic stores your assessment responses in your browser's local memory (React state) during your session. This data is not transmitted to our servers and is cleared when you close the browser tab.</p>
      </SubSection>
      <SubSection title="2.2 Analytics Cookies (Optional)">
        <p>If we implement analytics in the future, we will update this policy and request your consent before setting any analytics cookies. We currently do not use Google Analytics, Facebook Pixel, or similar tracking tools.</p>
      </SubSection>
      <SubSection title="2.3 Third-Party Cookies">
        <Li>Formspree: may set cookies when you submit the email capture form (for spam prevention)</Li>
        <Li>Vercel: our hosting provider may set performance-related cookies</Li>
        <Li>Google Fonts: loaded for typography; Google's privacy policy applies to font requests</Li>
      </SubSection>
    </Section>

    <Section title="3. Managing Cookies">
      <p>You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking strictly necessary cookies may affect website functionality.</p>
      <p style={{ marginTop: "8px" }}>Common browser cookie settings:</p>
      <Li>Chrome: Settings → Privacy and Security → Cookies</Li>
      <Li>Firefox: Settings → Privacy & Security → Cookies and Site Data</Li>
      <Li>Safari: Preferences → Privacy → Manage Website Data</Li>
      <Li>Edge: Settings → Cookies and Site Permissions</Li>
    </Section>

    <Section title="4. Your Rights">
      <p>Under GDPR and the ePrivacy Directive, you have the right to accept or refuse non-essential cookies. We will not set analytics or marketing cookies without your explicit consent. You can withdraw consent at any time by clearing your browser cookies.</p>
    </Section>

    <Section title="5. Contact">
      <p>Questions about our cookie practices: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.accent, textDecoration: "none" }}>{CONTACT_EMAIL}</a></p>
    </Section>
  </div>
);

// ─── Main Component ──────────────────────────────────────────
export default function LegalPages() {
  const [tab, setTab] = useState("privacy");
  const topRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["privacy", "terms", "cookies"].includes(tabParam)) {
      setTab(tabParam);
    }
  }, []);

  const tabs = [
    { key: "privacy", label: "Privacy Policy" },
    { key: "terms", label: "Terms of Service" },
    { key: "cookies", label: "Cookie Policy" },
  ];

  return (
    <main id="main-content" ref={topRef} style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: C.sans }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.accent}; color: white; }
        body { background: ${C.bg}; }
        a { transition: color 0.2s; }
        a:hover { color: ${C.text} !important; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(8,9,14,0.92)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <LogoMark size={24} />
          <span style={{ fontFamily: C.serif, fontSize: "16px", color: C.text }}>ClearLedger</span>
        </a>
        <a href="/" style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, textDecoration: "none" }}>← Back to Home</a>
      </header>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Page Title */}
        <h1 style={{ fontFamily: C.serif, fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 300, marginBottom: "8px" }}>Legal</h1>
        <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim, marginBottom: "32px" }}>
          How we handle your data, the rules for using our services, and our cookie practices.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "40px", borderBottom: `1px solid ${C.border}`, paddingBottom: "0" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); topRef.current?.scrollIntoView({ behavior: "smooth" }); }}
              style={{
                padding: "12px 20px", borderRadius: `${C.radiusSm} ${C.radiusSm} 0 0`,
                border: "none", cursor: "pointer",
                background: tab === t.key ? C.accentGlow : "transparent",
                color: tab === t.key ? C.accent : C.textDim,
                fontFamily: C.sans, fontSize: "13px", fontWeight: tab === t.key ? 600 : 400,
                borderBottom: tab === t.key ? `2px solid ${C.accent}` : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Content */}
        {tab === "privacy" && <PrivacyContent />}
        {tab === "terms" && <TermsContent />}
        {tab === "cookies" && <CookieContent />}

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <LogoMark size={18} />
            <span style={{ fontFamily: C.serif, fontSize: "14px", color: C.textDim }}>ClearLedger</span>
          </div>
          <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>
            © 2026 ClearLedger. All rights reserved. · {COMPANY_LOCATION}
          </div>
        </div>
      </div>
    </main>
  );
}
