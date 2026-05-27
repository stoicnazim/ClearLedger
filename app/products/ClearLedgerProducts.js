import { useState, useEffect, useRef } from "react";

// ─── Design Tokens (ClearLedger DNA) ─────────────────────────────
const C = {
  bg: "#08090E",
  bgCard: "#0D1117",
  bgCard2: "#131A2B",
  surface: "#161D2F",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#E8E6F0",
  textDim: "rgba(232,230,240,0.55)",
  textMid: "rgba(232,230,240,0.75)",
  accent: "#6B5CE7",
  accentBright: "#8677F0",
  accentDark: "#5A4BD6",
  accentGlow: "rgba(107,92,231,0.12)",
  accentGlow2: "rgba(107,92,231,0.25)",
  cyan: "#4FC3F7",
  cyanDim: "rgba(79,195,247,0.1)",
  green: "#3DDC84",
  greenDim: "rgba(61,220,132,0.1)",
  amber: "#FFAB40",
  amberDim: "rgba(255,171,64,0.1)",
  red: "#FF6B6B",
  serif: "'Fraunces', serif",
  sans: "'General Sans', 'DM Sans', -apple-system, sans-serif",
  mono: "'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
};

// ─── LemonSqueezy URLs (replace with actual product URLs) ────────
const CHECKOUT = {
  arDashboard: "https://clearledger.lemonsqueezy.com/buy/ar-dashboard",
  businessCase: "https://clearledger.lemonsqueezy.com/buy/business-case-builder",
  bundle: "https://clearledger.lemonsqueezy.com/buy/otc-toolkit-bundle",
};

// ─── Logo ────────────────────────────────────────────────────────
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor={C.accent} />
        <stop offset="100%" stopColor={C.cyan} />
      </linearGradient>
    </defs>
    <path d="M20 4L36 34H4L20 4Z" stroke="url(#pLogoGrad)" strokeWidth="2.5" fill="none" />
    <text x="20" y="30" textAnchor="middle" fill="url(#pLogoGrad)" fontFamily={C.serif} fontSize="16" fontStyle="italic" fontWeight="600">a</text>
  </svg>
);

// ─── Reveal Animation ────────────────────────────────────────────
const Reveal = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
    }}>{children}</div>
  );
};

// ─── Dashboard Mockup SVG ────────────────────────────────────────
const ARDashboardMockup = () => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius,
    padding: "24px", maxWidth: "100%", overflow: "hidden",
    boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${C.border}`,
  }}>
    {/* Title bar */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F" }} />
      </div>
      <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim }}>AR_Dashboard_v2.xlsx</span>
    </div>
    {/* KPI row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
      {[
        { label: "DSO", val: "47.2", delta: "-3.1", good: true },
        { label: "CEI", val: "91.4%", delta: "+2.8%", good: true },
        { label: "Bad Debt", val: "0.8%", delta: "-0.4%", good: true },
        { label: "Current AR", val: "€2.4M", delta: "+12%", good: false },
      ].map((k, i) => (
        <div key={i} style={{ background: C.surface, borderRadius: C.radiusSm, padding: "10px 12px" }}>
          <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, marginBottom: "4px" }}>{k.label}</div>
          <div style={{ fontFamily: C.mono, fontSize: "16px", color: C.text, fontWeight: 600 }}>{k.val}</div>
          <div style={{ fontFamily: C.mono, fontSize: "9px", color: k.good ? C.green : C.amber }}>{k.delta}</div>
        </div>
      ))}
    </div>
    {/* Aging bars */}
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, marginBottom: "8px" }}>AGING DISTRIBUTION</div>
      {[
        { bucket: "Current", pct: 62, color: C.green },
        { bucket: "1–30", pct: 18, color: C.cyan },
        { bucket: "31–60", pct: 10, color: C.amber },
        { bucket: "61–90", pct: 6, color: "#FF8A65" },
        { bucket: "90+", pct: 4, color: C.red },
      ].map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, width: "40px" }}>{b.bucket}</span>
          <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: "4px" }} />
          </div>
          <span style={{ fontFamily: C.mono, fontSize: "9px", color: b.color, width: "30px", textAlign: "right" }}>{b.pct}%</span>
        </div>
      ))}
    </div>
    {/* Dunning preview */}
    <div style={{ background: C.accentGlow, borderRadius: C.radiusSm, padding: "10px 12px", border: `1px solid ${C.accent}20` }}>
      <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.accent, marginBottom: "4px" }}>DUNNING WORKFLOWS</div>
      <div style={{ display: "flex", gap: "6px" }}>
        {["Reminder 1 → 7d", "Reminder 2 → 14d", "Escalation → 30d", "Legal → 60d"].map((s, i) => (
          <span key={i} style={{ fontFamily: C.mono, fontSize: "8px", color: C.textDim, padding: "3px 6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px" }}>{s}</span>
        ))}
      </div>
    </div>
  </div>
);

// ─── Business Case Mockup ────────────────────────────────────────
const BusinessCaseMockup = () => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius,
    padding: "24px", maxWidth: "100%", overflow: "hidden",
    boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${C.border}`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F" }} />
      </div>
      <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim }}>Business_Case_Builder_v2.xlsx</span>
    </div>
    {/* Summary block */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
      {[
        { label: "NPV (3-Year)", val: "€1.2M", color: C.green },
        { label: "Payback Period", val: "8 months", color: C.cyan },
        { label: "IRR", val: "147%", color: C.accent },
      ].map((k, i) => (
        <div key={i} style={{ background: C.surface, borderRadius: C.radiusSm, padding: "12px", textAlign: "center" }}>
          <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, marginBottom: "4px" }}>{k.label}</div>
          <div style={{ fontFamily: C.mono, fontSize: "18px", color: k.color, fontWeight: 600 }}>{k.val}</div>
        </div>
      ))}
    </div>
    {/* Cost vs Benefit bars */}
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, marginBottom: "8px" }}>3-YEAR PROJECTION</div>
      {[
        { year: "Year 1", cost: 35, benefit: 55, net: "€180K" },
        { year: "Year 2", cost: 15, benefit: 80, net: "€520K" },
        { year: "Year 3", cost: 10, benefit: 90, net: "€680K" },
      ].map((y, i) => (
        <div key={i} style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim }}>{y.year}</span>
            <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.green }}>Net: {y.net}</span>
          </div>
          <div style={{ display: "flex", gap: "2px", height: "10px" }}>
            <div style={{ width: `${y.cost}%`, background: C.red + "60", borderRadius: "3px 0 0 3px" }} />
            <div style={{ width: `${y.benefit}%`, background: C.green, borderRadius: "0 3px 3px 0" }} />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
        <span style={{ fontFamily: C.mono, fontSize: "8px", color: C.textDim, display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", background: C.red + "60", borderRadius: "2px", display: "inline-block" }} /> Cost
        </span>
        <span style={{ fontFamily: C.mono, fontSize: "8px", color: C.textDim, display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", background: C.green, borderRadius: "2px", display: "inline-block" }} /> Benefit
        </span>
      </div>
    </div>
    {/* Sheets preview */}
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {["Executive Summary", "Cost Model", "Benefit Model", "Cash Flow", "Sensitivity", "Presentation"].map((s, i) => (
        <span key={i} style={{
          fontFamily: C.mono, fontSize: "8px", color: i === 0 ? C.accent : C.textDim,
          padding: "4px 8px", background: i === 0 ? C.accentGlow : "rgba(255,255,255,0.03)",
          borderRadius: "3px", border: `1px solid ${i === 0 ? C.accent + "30" : "transparent"}`,
        }}>{s}</span>
      ))}
    </div>
  </div>
);

// ─── Price Card ──────────────────────────────────────────────────
const PriceCard = ({ name, price, originalPrice, desc, features, popular, cta, href, badge }) => (
  <div style={{
    background: popular ? C.bgCard2 : C.bgCard,
    border: `1px solid ${popular ? C.accent + "50" : C.border}`,
    borderRadius: C.radius, padding: "32px 28px",
    position: "relative", display: "flex", flexDirection: "column",
    transition: "transform 0.3s, border-color 0.3s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {badge && (
      <div style={{
        position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
        background: popular ? C.accent : C.green, color: "white",
        fontFamily: C.mono, fontSize: "9px", padding: "4px 14px",
        borderRadius: "0 0 6px 6px", letterSpacing: "1px",
      }}>{badge}</div>
    )}
    <h3 style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 400, color: C.text, marginTop: badge ? "8px" : 0, marginBottom: "8px" }}>{name}</h3>
    <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.5, marginBottom: "16px", minHeight: "40px" }}>{desc}</p>
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
      <span style={{ fontFamily: C.mono, fontSize: "32px", fontWeight: 700, color: C.text }}>{price}</span>
      {originalPrice && <span style={{ fontFamily: C.mono, fontSize: "16px", color: C.textDim, textDecoration: "line-through" }}>{originalPrice}</span>}
    </div>
    <ul style={{ listStyle: "none", flex: 1, marginBottom: "24px" }}>
      {features.map((f, i) => (
        <li key={i} style={{
          fontFamily: C.sans, fontSize: "13px", color: C.textMid, padding: "5px 0",
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <span style={{ color: C.green, fontSize: "11px", marginTop: "3px" }}>✓</span>{f}
        </li>
      ))}
    </ul>
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: "block", textAlign: "center", padding: "14px", borderRadius: C.radiusSm,
      background: popular ? `linear-gradient(135deg, ${C.accent}, ${C.accentDark})` : "transparent",
      border: popular ? "none" : `1px solid ${C.border}`,
      color: popular ? "white" : C.textMid,
      fontFamily: C.sans, fontSize: "14px", fontWeight: 500, textDecoration: "none",
      transition: "all 0.2s",
      boxShadow: popular ? `0 4px 24px ${C.accentGlow2}` : "none",
    }}>{cta}</a>
  </div>
);

// ─── FAQ Item ────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, cursor: "pointer",
    }} onClick={() => setOpen(!open)}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 0",
      }}>
        <span style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500, flex: 1, paddingRight: "16px" }}>{q}</span>
        <span style={{
          fontFamily: C.mono, fontSize: "18px", color: C.accent,
          transform: open ? "rotate(45deg)" : "rotate(0)",
          transition: "transform 0.2s",
        }}>+</span>
      </div>
      {open && (
        <div style={{
          fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.7,
          paddingBottom: "18px", maxWidth: "640px",
        }}>{a}</div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
export default function ClearLedgerProducts() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionStyle = { maxWidth: "1080px", margin: "0 auto", padding: "0 24px" };
  const labelStyle = { fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" };
  const h2Style = { fontFamily: C.serif, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400, color: C.text, lineHeight: 1.2, margin: "0 0 16px" };

  const arFeatures = [
    { title: "8 KPI Scorecards", desc: "DSO, CEI, ADD, BPDSO, aging ratios, bad debt rate, collection effectiveness, and dispute rate — all auto-calculated with tier-adjusted benchmarks.", icon: "📊" },
    { title: "Aging Analysis Engine", desc: "5-bucket aging with drill-down by customer segment, business unit, and collector. Automatic trend detection and period-over-period comparison.", icon: "📈" },
    { title: "Dunning Workflow Matrix", desc: "Pre-built 4-stage collection cadence with escalation triggers, authority thresholds, and template contact scripts. Customize per customer tier.", icon: "📋" },
    { title: "Write-Off Authority Framework", desc: "Tiered approval matrix aligned to your org structure. Tracks write-off by reason code, flags repeat offenders, calculates provision requirements.", icon: "🛡️" },
    { title: "Collector Productivity Tracker", desc: "Contacts per day, promise-to-pay conversion, recovery rate by collector. Identifies coaching opportunities and workload imbalances.", icon: "👤" },
    { title: "Cash Forecast Integration", desc: "Feeds aging data into a 13-week cash receipt forecast using payment probability weighting. Connects to treasury and working capital planning.", icon: "💰" },
  ];

  const bcFeatures = [
    { title: "Executive Summary Auto-Generator", desc: "Input your assumptions, get a board-ready one-page summary with NPV, IRR, payback period, and strategic rationale.", icon: "📄" },
    { title: "3-Year Cost-Benefit Model", desc: "Detailed cost categories (license, implementation, change management, ongoing) vs. quantified benefits (FTE savings, DSO reduction, error reduction).", icon: "📊" },
    { title: "Sensitivity Analysis", desc: "Built-in tornado charts showing which assumptions most impact your business case. Stress-test adoption rates, timeline slippage, and benefit realization.", icon: "🎯" },
    { title: "Scenario Comparison", desc: "Model up to 3 scenarios (conservative, base, optimistic) side-by-side. Visual comparison with risk-weighted expected values.", icon: "⚖️" },
    { title: "Presentation-Ready Output", desc: "Charts, tables, and summaries formatted for direct inclusion in board presentations. Dark and light theme versions included.", icon: "🎨" },
    { title: "ROI Calculator", desc: "Quick-calc mode for initial conversations. Full-detail mode for formal submissions. Both map to the same underlying financial model.", icon: "🔢" },
  ];

  const faqs = [
    { q: "What format are the products in?", a: "Both products are professionally built Excel workbooks (.xlsx), compatible with Microsoft Excel 2016+ and Google Sheets. They use standard formulas — no VBA macros or external dependencies." },
    { q: "Can I modify the templates for my organization?", a: "Yes. Both products are fully unlocked and editable. Customize formulas, add columns, change categories, adjust benchmarks — they're designed as a foundation you build on." },
    { q: "Do these work with my ERP data?", a: "The dashboards accept manual data entry or paste-from-ERP. They're ERP-agnostic — whether you're on SAP, Oracle, D365, NetSuite, or even a legacy system, you can populate the input sheets with your aging data and the analytics run automatically." },
    { q: "Is this a one-time purchase or subscription?", a: "One-time purchase. You own the file forever. Future updates (if any) will be offered at a discounted upgrade price to existing customers." },
    { q: "Are dark and light themes included?", a: "Yes. Each product includes both dark and light themed versions in the same download. Use whichever fits your organization's presentation context." },
    { q: "Can I use these for multiple entities or business units?", a: "The license covers your organization (one legal entity). For multi-entity groups, you can use the same file across business units within your organization. Reselling or sharing outside your organization requires a separate license." },
    { q: "Do you offer consulting to help implement these?", a: "Yes — our Health Check and Accelerator engagements include hands-on implementation support using these tools as part of the analytical framework. Visit our services page for details." },
  ];

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: C.sans, overflowX: "hidden" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.accent}; color: white; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        @media (max-width: 768px) {
          .product-split { flex-direction: column !important; }
          .product-split-reverse { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── NAV ───────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(8,9,14,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <LogoMark size={24} />
            <span style={{ fontFamily: C.serif, fontSize: "16px", color: C.text }}>ClearLedger</span>
            <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, padding: "2px 8px", background: C.accentGlow, borderRadius: "4px" }}>PRODUCTS</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <a href="/#services" style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, textDecoration: "none" }}>Advisory</a>
            <a href="#pricing" style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, textDecoration: "none" }}>Pricing</a>
            <a href="#pricing" style={{
              fontFamily: C.sans, fontSize: "13px", fontWeight: 500, color: "white", textDecoration: "none",
              padding: "8px 20px", borderRadius: C.radiusSm,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
            }}>Buy Now</a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section style={{ paddingTop: "120px", paddingBottom: "80px", position: "relative" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "800px", height: "600px", borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accentGlow2} 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />
        <div style={{ ...sectionStyle, position: "relative", zIndex: 1, textAlign: "center" }}>
          <Reveal>
            <div style={labelStyle}>Professional OtC Toolkits</div>
            <h1 style={{ fontFamily: C.serif, fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 300, lineHeight: 1.15, marginBottom: "20px", maxWidth: "700px", margin: "0 auto 20px" }}>
              The analytical tools behind{" "}
              <span style={{ fontStyle: "italic", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                world-class AR teams
              </span>
            </h1>
            <p style={{ fontFamily: C.sans, fontSize: "17px", color: C.textDim, lineHeight: 1.7, maxWidth: "580px", margin: "0 auto 36px" }}>
              Production-grade Excel dashboards for AR management and investment justification.
              Built by an OtC specialist. APQC-aligned. Dark + light themes.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
              {[
                { val: "2,000+", sub: "Formulas" },
                { val: "45", sub: "KPI metrics" },
                { val: "0", sub: "Errors (verified)" },
                { val: "2", sub: "Theme variants" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: C.mono, fontSize: "18px", color: C.accent, fontWeight: 600 }}>{s.val}</div>
                  <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRODUCT 1: AR DASHBOARD ──────────────────────────── */}
      <section id="ar-dashboard" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div className="product-split" style={{ display: "flex", gap: "48px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Product 01</div>
                <h2 style={h2Style}>AR Aging & Collections Dashboard</h2>
                <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textDim, lineHeight: 1.7, marginBottom: "24px" }}>
                  A comprehensive receivables management workbook with 8 KPI scorecards,
                  automated aging analysis, dunning workflow matrices, write-off authority
                  frameworks, and collector productivity tracking. 2,002 formulas. Zero errors.
                </p>
                <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
                  {[
                    { label: "Sheets", val: "14" },
                    { label: "Formulas", val: "2,002" },
                    { label: "KPIs", val: "8" },
                    { label: "Themes", val: "Dark + Light" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "10px 16px", background: C.bgCard, borderRadius: C.radiusSm, border: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim }}>{s.label}</div>
                      <div style={{ fontFamily: C.mono, fontSize: "14px", color: C.text, fontWeight: 600 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <a href={CHECKOUT.arDashboard} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-block", padding: "12px 28px", borderRadius: C.radiusSm,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                  color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 500,
                  textDecoration: "none", boxShadow: `0 4px 24px ${C.accentGlow2}`,
                }}>Buy for €99 →</a>
              </div>
              <div style={{ flex: "0 0 420px", maxWidth: "100%" }}>
                <ARDashboardMockup />
              </div>
            </div>
          </Reveal>

          {/* Features grid */}
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "48px" }}>
            {arFeatures.map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "24px",
                  transition: "border-color 0.3s", height: "100%",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <h4 style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500, margin: "10px 0 6px" }}>{f.title}</h4>
                  <p style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT 2: BUSINESS CASE BUILDER ─────────────────── */}
      <section id="business-case" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div className="product-split-reverse" style={{ display: "flex", flexDirection: "row-reverse", gap: "48px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Product 02</div>
                <h2 style={h2Style}>Business Case Builder</h2>
                <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textDim, lineHeight: 1.7, marginBottom: "24px" }}>
                  Build CFO-ready investment cases for OtC transformation projects.
                  13 interconnected sheets, 140 formulas, automated NPV/IRR/payback calculations,
                  sensitivity analysis, and presentation-ready output. Dark + light themes.
                </p>
                <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
                  {[
                    { label: "Sheets", val: "13" },
                    { label: "Formulas", val: "140" },
                    { label: "Scenarios", val: "3" },
                    { label: "Themes", val: "Dark + Light" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "10px 16px", background: C.bgCard, borderRadius: C.radiusSm, border: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim }}>{s.label}</div>
                      <div style={{ fontFamily: C.mono, fontSize: "14px", color: C.text, fontWeight: 600 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <a href={CHECKOUT.businessCase} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-block", padding: "12px 28px", borderRadius: C.radiusSm,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                  color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 500,
                  textDecoration: "none", boxShadow: `0 4px 24px ${C.accentGlow2}`,
                }}>Buy for €79 →</a>
              </div>
              <div style={{ flex: "0 0 420px", maxWidth: "100%" }}>
                <BusinessCaseMockup />
              </div>
            </div>
          </Reveal>

          {/* Features grid */}
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "48px" }}>
            {bcFeatures.map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "24px",
                  transition: "border-color 0.3s", height: "100%",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <h4 style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500, margin: "10px 0 6px" }}>{f.title}</h4>
                  <p style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>Pricing</div>
              <h2 style={h2Style}>One-time purchase. Yours forever.</h2>
              <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textDim, maxWidth: "500px", margin: "0 auto" }}>
                No subscriptions. No vendor lock-in. Full ownership of production-grade analytical tools.
              </p>
            </div>
          </Reveal>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <Reveal delay={0}>
              <PriceCard
                name="AR Dashboard"
                price="€99"
                desc="Complete receivables management workbook with KPI scorecards, aging analysis, and dunning workflows."
                features={[
                  "14 interconnected sheets",
                  "2,002 formulas (0 errors)",
                  "8 KPI scorecards with benchmarks",
                  "Aging analysis + dunning matrix",
                  "Dark + light themes",
                  "Fully editable & customizable",
                ]}
                cta="Buy AR Dashboard"
                href={CHECKOUT.arDashboard}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <PriceCard
                name="Complete OtC Bundle"
                price="€149"
                originalPrice="€178"
                desc="Both products together. Everything you need to manage AR operations and justify transformation investments."
                popular={true}
                badge="SAVE €29"
                features={[
                  "AR Dashboard (€99 value)",
                  "Business Case Builder (€79 value)",
                  "27 sheets, 2,142 formulas total",
                  "Dark + light themes for both",
                  "Free updates for 12 months",
                  "Priority email support",
                ]}
                cta="Buy Bundle & Save"
                href={CHECKOUT.bundle}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <PriceCard
                name="Business Case Builder"
                price="€79"
                desc="CFO-ready investment case workbook with NPV/IRR, sensitivity analysis, and presentation output."
                features={[
                  "13 interconnected sheets",
                  "140 financial formulas",
                  "3-scenario modeling",
                  "Sensitivity tornado charts",
                  "Dark + light themes",
                  "Presentation-ready output",
                ]}
                cta="Buy Business Case Builder"
                href={CHECKOUT.businessCase}
              />
            </Reveal>
          </div>

          {/* Trust signals */}
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "32px", flexWrap: "wrap" }}>
            {[
              { icon: "🔒", text: "Secure checkout via LemonSqueezy" },
              { icon: "📧", text: "Instant download after purchase" },
              { icon: "♻️", text: "30-day money-back guarantee" },
              { icon: "🇪🇺", text: "EU VAT handled automatically" },
            ].map((t, i) => (
              <span key={i} style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{t.icon}</span>{t.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─────────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={labelStyle}>Who It's For</div>
              <h2 style={h2Style}>Built for finance professionals who think in spreadsheets</h2>
            </div>
          </Reveal>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { role: "AR Managers & Team Leads", desc: "Replace your aging Excel spaghetti with a structured dashboard that actually tells you where to focus. Track collector performance and aging trends without building reports from scratch.", icon: "👤" },
              { role: "FP&A and Controllers", desc: "Feed AR data into cash forecasts and working capital models with a consistent framework. Build defensible business cases for OtC investments.", icon: "📊" },
              { role: "SSC / BPO Managers", desc: "Standardize AR reporting across clients and entities. Benchmark process maturity and demonstrate value to stakeholders with professional analytics.", icon: "🏢" },
              { role: "CFOs & Finance Directors", desc: "Get board-ready visibility into receivables health. Use the Business Case Builder to justify transformation investments with hard numbers, not hand-waving.", icon: "💼" },
              { role: "Consultants & Advisors", desc: "License for client use. These tools give you an analytical framework for AR engagements that goes beyond generic templates.", icon: "🎯" },
              { role: "Growing Companies", desc: "You've outgrown basic AR tracking but aren't ready for a six-figure software investment. These tools bridge the gap with professional-grade analytics in Excel.", icon: "🚀" },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "24px",
                  transition: "border-color 0.3s", height: "100%",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <span style={{ fontSize: "24px" }}>{p.icon}</span>
                  <h4 style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500, margin: "10px 0 8px" }}>{p.role}</h4>
                  <p style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...sectionStyle, maxWidth: "720px" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={labelStyle}>FAQ</div>
              <h2 style={h2Style}>Common questions</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </Reveal>
        </div>
      </section>

      {/* ─── BOTTOM CTA ────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "400px", borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accentGlow2} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ ...sectionStyle, position: "relative", zIndex: 1, textAlign: "center" }}>
          <Reveal>
            <h2 style={{ ...h2Style, maxWidth: "500px", margin: "0 auto 16px" }}>
              Stop exporting aging reports into blank spreadsheets
            </h2>
            <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textDim, maxWidth: "460px", margin: "0 auto 32px" }}>
              Get the same analytical framework used in professional OtC advisory engagements — for a fraction of the cost.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <a href={CHECKOUT.bundle} target="_blank" rel="noopener noreferrer" style={{
                padding: "14px 32px", borderRadius: C.radiusSm, textDecoration: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                color: "white", fontFamily: C.sans, fontSize: "15px", fontWeight: 500,
                boxShadow: `0 4px 32px ${C.accentGlow2}`,
              }}>Get the Bundle — €149</a>
              <a href="/#cta" style={{
                padding: "14px 28px", borderRadius: C.radiusSm, textDecoration: "none",
                border: `1px solid ${C.border}`, color: C.textMid,
                fontFamily: C.sans, fontSize: "14px",
              }}>Or take the free diagnostic →</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "40px 0 24px", borderTop: `1px solid ${C.border}`, background: C.bgCard }}>
        <div style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LogoMark size={20} />
            <span style={{ fontFamily: C.serif, fontSize: "14px", color: C.textDim }}>ClearLedger</span>
            <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>· Warsaw · Global Delivery</span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Cookies"].map(l => (
              <a key={l} href={`/legal#${l.toLowerCase()}`} style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>© 2026 ClearLedger</span>
        </div>
      </footer>
    </div>
  );
}
