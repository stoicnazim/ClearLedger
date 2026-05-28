import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design Tokens ───────────────────────────────────────────────
const C = {
  bg: "#08090E",
  bgCard: "#0D1117",
  bgCard2: "#131A2B",
  surface: "#161D2F",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#E8E6F0",
  textDim: "rgba(232,230,240,0.62)",
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
  red: "#FF6B6B",
  redDim: "rgba(255,107,107,0.08)",
  serif: "'Fraunces', serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
};

// ─── Formspree config ────────────────────────────────────────────
// Replace with your actual Formspree form ID after creating one at formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xojbpajd";

// ─── Logo Mark Component ─────────────────────────────────────────
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor={C.accent} />
        <stop offset="100%" stopColor={C.cyan} />
      </linearGradient>
    </defs>
    <path d="M20 4L36 34H4L20 4Z" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
    <text x="20" y="30" textAnchor="middle" fill="url(#logoGrad)" fontFamily={C.serif} fontSize="16" fontStyle="italic" fontWeight="600">a</text>
  </svg>
);

// ─── Mesh Gradient Background ────────────────────────────────────
const MeshBG = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const blobs = [
      { x: 0.25, y: 0.25, r: 240, c: [107, 92, 231] },
      { x: 0.75, y: 0.45, r: 200, c: [79, 195, 247] },
      { x: 0.5, y: 0.75, r: 180, c: [61, 220, 132] },
      { x: 0.15, y: 0.65, r: 150, c: [107, 92, 231] },
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 720;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blobs.forEach((b, i) => {
        const ox = Math.sin(t + i * 1.8) * 60;
        const oy = Math.cos(t + i * 1.4) * 40;
        const grad = ctx.createRadialGradient(
          b.x * canvas.width + ox, b.y * canvas.height + oy, 0,
          b.x * canvas.width + ox, b.y * canvas.height + oy, b.r
        );
        grad.addColorStop(0, `rgba(${b.c.join(",")},0.18)`);
        grad.addColorStop(1, `rgba(${b.c.join(",")},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "720px", opacity: 0.7, pointerEvents: "none" }} />;
};

// ─── Animated Counter ────────────────────────────────────────────
const Counter = ({ end, suffix = "", prefix = "", duration = 2000 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * end));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
};

// ─── Section Reveal ──────────────────────────────────────────────
const Reveal = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      {children}
    </div>
  );
};

// ─── Dashboard Preview Mockup ────────────────────────────────────
const DashboardPreview = () => {
  const bars = [
    { label: "Collections", w: 88, color: C.accent },
    { label: "Cash App", w: 72, color: C.cyan },
    { label: "Credit Mgmt", w: 64, color: C.green },
    { label: "Billing", w: 56, color: C.accentBright },
    { label: "Deductions", w: 42, color: C.red },
  ];
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: C.radius,
      padding: "20px",
      width: "340px",
      maxWidth: "100%",
      boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${C.border}`,
      animation: "float 6s ease-in-out infinite",
    }}>
      <style>{`@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textMid, textTransform: "uppercase", letterSpacing: "1.2px" }}>OtC Maturity Score</span>
        <span style={{ fontFamily: C.mono, fontSize: "22px", fontWeight: 700, background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3.4</span>
      </div>
      {bars.map((b, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>{b.label}</span>
            <span style={{ fontFamily: C.mono, fontSize: "10px", color: b.color }}>{b.w}%</span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${b.w}%`, height: "100%", background: b.color, borderRadius: "3px", transition: "width 1.5s ease" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: "14px", padding: "10px 12px", background: C.greenDim, borderRadius: C.radiusSm, border: `1px solid rgba(61,220,132,0.15)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px" }}>⚡</span>
          <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.green, fontWeight: 500 }}>3 Quick Wins Identified</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────
export default function ClearLedgerWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeService, setActiveService] = useState(null);

  // ROI Calculator state
  const [revenue, setRevenue] = useState(50);
  const [dso, setDso] = useState(55);
  const [invoiceVol, setInvoiceVol] = useState(5000);
  const [fteCost, setFteCost] = useState(55000);

  // Email form state
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("idle"); // idle | submitting | success | error

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ROI calculations
  const revM = revenue * 1_000_000;
  const cashFlowImpact = Math.round(((dso - 35) / 365) * revM);
  const fteTimeSaved = Math.round(fteCost * 0.4 * (invoiceVol / 5000));
  const badDebtReduction = Math.round(revM * 0.015);
  const totalBenefit = cashFlowImpact + fteTimeSaved + badDebtReduction;

  // Email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || formStatus === "submitting") return;
    setFormStatus("submitting");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, source: "clearledger-website", timestamp: new Date().toISOString() }),
      });
      if (res.ok) {
        setFormStatus("success");
        setEmail("");
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  const fmt = (n) => {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `€${Math.round(n / 1000)}K`;
    return `€${n}`;
  };

  const sectionStyle = { maxWidth: "1140px", margin: "0 auto", padding: "0 24px" };
  const labelStyle = { fontFamily: C.mono, fontSize: "11px", color: C.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" };
  const h2Style = { fontFamily: C.serif, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400, color: C.text, lineHeight: 1.2, margin: "0 0 16px" };
  const pStyle = { fontFamily: C.sans, fontSize: "16px", color: C.textDim, lineHeight: 1.7, maxWidth: "600px" };

  const services = [
    {
      name: "Health Check",
      price: "€5K – 12K",
      timeline: "2–3 weeks",
      best: "You suspect inefficiencies but don't know where to start",
      popular: false,
      features: ["Full OtC maturity assessment (24 domains)", "Current-state process mapping", "APQC benchmark gap analysis", "Prioritized improvement roadmap", "Executive summary with ROI projections"],
      detail: "A structured diagnostic across your entire Order-to-Cash cycle. We assess maturity across 8 domains, benchmark against APQC standards, and deliver a prioritized action plan with clear ROI projections. The output is a ready-to-present business case for your leadership team."
    },
    {
      name: "Accelerator",
      price: "€15K – 35K",
      timeline: "8–12 weeks",
      best: "You know the problems — you need them solved fast",
      popular: true,
      features: ["Everything in Health Check", "Process redesign for 3–5 priority areas", "Technology selection & vendor evaluation", "Implementation playbook with RACI", "Change management framework", "Bi-weekly progress reviews"],
      detail: "Beyond diagnosis into design and implementation planning. We redesign your highest-impact processes, evaluate technology options, and build a detailed playbook your team can execute. Includes hands-on workshops and bi-weekly steering sessions."
    },
    {
      name: "Transformation",
      price: "€40K – 80K",
      timeline: "4–6 months",
      best: "Full OtC overhaul with measurable outcomes",
      popular: false,
      features: ["Everything in Accelerator", "End-to-end implementation support", "ERP/system integration guidance", "Team training & capability building", "KPI dashboard & measurement framework", "Post-go-live optimization (60 days)", "Monthly executive reporting"],
      detail: "A complete transformation engagement. We embed with your team to redesign, implement, and optimize your entire OtC function. Includes technology implementation support, team upskilling, KPI dashboards, and 60 days of post-go-live optimization to ensure results stick."
    },
  ];

  const comparisonRows = [
    { dim: "OtC Expertise", big4: "Generalist consultants", saas: "Software-only, no process advisory", us: "Deep OtC specialization, APQC-aligned" },
    { dim: "Price Range", big4: "€150K – 500K+", saas: "€5K – 50K/yr (license only)", us: "€5K – 80K (fixed scope)" },
    { dim: "What You Get", big4: "PowerPoint recommendations", saas: "A tool with no implementation help", us: "Working frameworks + implementation roadmap" },
    { dim: "Timeline", big4: "6–12 months", saas: "3–6 months to deploy", us: "2 weeks – 6 months" },
    { dim: "Company Size Fit", big4: "Enterprise only (1,000+)", saas: "Mid-market (200+)", us: "Growing companies (10 – 1,000)" },
    { dim: "After Engagement", big4: "Consultant dependency", saas: "Vendor lock-in", us: "Self-sufficient team + reusable tools" },
  ];

  const proofPoints = [
    { metric: "20+", label: "Analytical modules in our OtC toolkit", sub: "APQC PCF v8.0 aligned" },
    { metric: "8", label: "OtC domains covered end-to-end", sub: "Order Mgmt → Cash Application" },
    { metric: "45", label: "KPIs tracked with benchmark data", sub: "Tier-adjusted targets" },
    { metric: "3", label: "Industry vertical packs", sub: "CPG · Manufacturing · Services" },
  ];

  const stats = [
    { val: 47, suffix: "+", label: "Average DSO across industries", src: "APQC 2025" },
    { val: 83, suffix: "%", label: "Of companies haven't automated AR", src: "Hackett Group" },
    { val: 3, suffix: "%", prefix: "", label: "Revenue leakage from manual OtC", src: "Centime Research" },
    { val: 30, suffix: "%", label: "FTE time on low-value AR tasks", src: "APQC Benchmark" },
  ];

  return (
    <main id="main-content" style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: C.sans, overflowX: "hidden" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.accent}; color: white; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${C.accent}; cursor: pointer; border: 2px solid ${C.bg}; box-shadow: 0 0 12px ${C.accentGlow2}; }
        input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: ${C.accent}; cursor: pointer; border: 2px solid ${C.bg}; }
        @media (max-width: 768px) {
          .hero-split { flex-direction: column !important; text-align: center !important; }
          .hero-split > div:first-child { align-items: center !important; }
          .comparison-grid { overflow-x: auto !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .proof-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .roi-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .proof-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── NAV ───────────────────────────────────────────────── */}
      <nav aria-label="Main navigation" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(8,9,14,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <LogoMark size={28} />
            <span style={{ fontFamily: C.serif, fontSize: "18px", color: C.text, fontWeight: 400 }}>ClearLedger</span>
          </a>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="desktop-nav">
            {["Process", "Services", "ROI Calculator", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.textMid}
              >{l}</a>
            ))}
            <a href="/diagnostic/" style={{
              fontFamily: C.sans, fontSize: "13px", fontWeight: 500, color: "white", textDecoration: "none",
              padding: "8px 20px", borderRadius: C.radiusSm,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = `0 4px 20px ${C.accentGlow2}`; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
            >Start Diagnostic</a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} style={{
            display: "none", background: "none", border: "none", cursor: "pointer", padding: "8px",
            color: C.text, fontSize: "24px",
          }} className="mobile-menu-btn">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ padding: "16px 24px 24px", background: "rgba(8,9,14,0.98)", borderBottom: `1px solid ${C.border}` }}>
            {["Process", "Services", "ROI Calculator", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "12px 0", fontFamily: C.sans, fontSize: "15px", color: C.textMid, textDecoration: "none", borderBottom: `1px solid ${C.border}` }}
              >{l}</a>
            ))}
            <a href="/diagnostic/" onClick={() => setMenuOpen(false)} style={{
              display: "block", textAlign: "center", marginTop: "16px", padding: "12px", borderRadius: C.radiusSm,
              background: C.accent, color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 500, textDecoration: "none",
            }}>Start Free Diagnostic</a>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: block !important; }
          }
        `}</style>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "80px", overflow: "hidden" }}>
        <MeshBG />
        <div style={{ ...sectionStyle, position: "relative", zIndex: 1 }}>
          <div className="hero-split" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "60px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Reveal>
                <div style={labelStyle}>Order-to-Cash Advisory</div>
                <h1 style={{ fontFamily: C.serif, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, lineHeight: 1.15, color: C.text, marginBottom: "20px" }}>
                  Turn your receivables into{" "}
                  <span style={{ fontStyle: "italic", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    competitive advantage
                  </span>
                </h1>
                <p style={{ ...pStyle, marginBottom: "32px" }}>
                  APQC-aligned diagnostics, process architecture, and implementation for finance teams
                  who refuse to accept "that's just how AR works."
                </p>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <a href="/diagnostic/" style={{
                    fontFamily: C.sans, fontSize: "14px", fontWeight: 500, color: "white", textDecoration: "none",
                    padding: "14px 28px", borderRadius: C.radiusSm,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                    boxShadow: `0 4px 24px ${C.accentGlow2}`,
                    transition: "transform 0.2s",
                  }}>Start Free Diagnostic</a>
                  <a href="#roi-calculator" style={{
                    fontFamily: C.sans, fontSize: "14px", fontWeight: 500, color: C.text, textDecoration: "none",
                    padding: "14px 28px", borderRadius: C.radiusSm,
                    border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                    transition: "border-color 0.2s",
                  }}>Calculate Your ROI →</a>
                </div>
                <div style={{ display: "flex", gap: "32px", marginTop: "36px", flexWrap: "wrap" }}>
                  {[
                    { val: "APQC PCF v8.0", sub: "Framework aligned" },
                    { val: "20+ Modules", sub: "Analytical toolkit" },
                    { val: "10–1,000", sub: "Employee sweet spot" },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: C.mono, fontSize: "13px", color: C.accent, fontWeight: 600 }}>{s.val}</div>
                      <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, marginTop: "2px" }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div style={{ flex: "0 0 auto" }}>
              <Reveal delay={0.2}>
                <DashboardPreview />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COST OF INACTION ──────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>The Cost of Inaction</div>
              <h2 style={{ ...h2Style, maxWidth: "700px", margin: "0 auto 16px" }}>
                Every month you wait, your OtC process costs you more
              </h2>
            </div>
          </Reveal>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius,
                  padding: "28px 24px", textAlign: "center",
                  transition: "transform 0.3s, border-color 0.3s",
                  cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = C.borderHover; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{ fontFamily: C.serif, fontSize: "40px", fontWeight: 300, color: C.text, marginBottom: "8px" }}>
                    <Counter end={s.val} prefix={s.prefix || ""} suffix={s.suffix} />
                  </div>
                  <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, marginBottom: "8px", lineHeight: 1.4 }}>{s.label}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim }}>{s.src}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / TOOLKIT CREDIBILITY ────────────────── */}
      <section id="about" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>What Powers Our Recommendations</div>
              <h2 style={{ ...h2Style, maxWidth: "700px", margin: "0 auto 16px" }}>
                A proprietary analytical platform, not PowerPoint
              </h2>
              <p style={{ ...pStyle, margin: "0 auto", textAlign: "center" }}>
                Every recommendation we make is backed by a working analytical module — 
                scored, benchmarked, and cross-referenced against APQC process codes.
              </p>
            </div>
          </Reveal>
          <div className="proof-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {proofPoints.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius,
                  padding: "28px 24px",
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "40"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <div style={{ fontFamily: C.serif, fontSize: "36px", fontWeight: 300, color: C.accent, marginBottom: "8px" }}>{p.metric}</div>
                  <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, marginBottom: "6px", lineHeight: 1.4 }}>{p.label}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim }}>{p.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Anonymized case result */}
          <Reveal delay={0.3}>
            <div style={{
              marginTop: "40px", padding: "28px 32px", background: C.bgCard2,
              border: `1px solid ${C.accent}20`, borderRadius: C.radius,
              display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap",
            }}>
              <div style={{ flex: "0 0 auto", width: "48px", height: "48px", borderRadius: "50%", background: C.accentGlow, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
              </div>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, lineHeight: 1.6, marginBottom: "12px" }}>
                  "After implementing the recommended changes from a Health Check engagement, our collections team reduced DSO by 19 days and freed up 2.4 FTEs from manual reconciliation work within 90 days."
                </div>
                <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim }}>
                  — AR Director, Mid-Market FMCG Manufacturer (€120M revenue)
                </div>
              </div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {[{ v: "-19 days", l: "DSO Reduction" }, { v: "2.4 FTE", l: "Capacity Freed" }, { v: "< 90 days", l: "Time to Impact" }].map((r, i) => (
                  <div key={i} style={{ textAlign: "center", minWidth: "80px" }}>
                    <div style={{ fontFamily: C.mono, fontSize: "18px", fontWeight: 600, color: C.green }}>{r.v}</div>
                    <div style={{ fontFamily: C.sans, fontSize: "10px", color: C.textDim, marginTop: "2px" }}>{r.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── POSITIONING TABLE ─────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>How We Compare</div>
              <h2 style={h2Style}>The gap between alternatives</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="comparison-grid" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontFamily: C.sans, fontSize: "13px", minWidth: "640px" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "14px 16px", textAlign: "left", color: C.textDim, fontWeight: 400, borderBottom: `1px solid ${C.border}`, fontSize: "12px" }}>Dimension</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", color: C.textDim, fontWeight: 400, borderBottom: `1px solid ${C.border}`, fontSize: "12px" }}>Big 4 Consulting</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", color: C.textDim, fontWeight: 400, borderBottom: `1px solid ${C.border}`, fontSize: "12px" }}>SaaS Vendor</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", color: C.accent, fontWeight: 600, borderBottom: `2px solid ${C.accent}`, fontSize: "12px", background: C.accentGlow }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><LogoMark size={16} /> ClearLedger</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: "14px 16px", color: C.textMid, borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>{r.dim}</td>
                      <td style={{ padding: "14px 16px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{r.big4}</td>
                      <td style={{ padding: "14px 16px", color: C.textDim, borderBottom: `1px solid ${C.border}` }}>{r.saas}</td>
                      <td style={{ padding: "14px 16px", color: C.text, borderBottom: `1px solid ${C.border}`, background: C.accentGlow, fontWeight: 500 }}>{r.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PROCESS ───────────────────────────────────────────── */}
      <section id="process" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>How It Works</div>
              <h2 style={h2Style}>Four phases. Measurable outcomes.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", position: "relative" }} className="stats-grid">
            {[
              { phase: "01", name: "Diagnose", desc: "APQC-aligned maturity assessment across 8 OtC domains. Baseline your current state.", time: "Week 1–2", icon: "🔍" },
              { phase: "02", name: "Design", desc: "Process architecture and technology recommendations. Benchmark-driven, not opinion-based.", time: "Week 3–6", icon: "📐" },
              { phase: "03", name: "Deploy", desc: "Implementation playbooks, vendor selection, change management. Hands-on, not hands-off.", time: "Week 7–14", icon: "🚀" },
              { phase: "04", name: "Measure", desc: "KPI dashboards, 45 metrics, post-go-live optimization. Prove the ROI.", time: "Week 15+", icon: "📊" },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "28px 24px",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "40"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span style={{ fontFamily: C.mono, fontSize: "12px", color: C.accent }}>{p.phase}</span>
                    <span style={{ fontSize: "24px" }}>{p.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 400, color: C.text, marginBottom: "10px" }}>{p.name}</h3>
                  <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.6, marginBottom: "14px" }}>{p.desc}</p>
                  <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim, padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: C.radiusSm, display: "inline-block" }}>{p.time}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ──────────────────────────────────────────── */}
      <section id="services" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>Fixed-Price Engagements</div>
              <h2 style={h2Style}>Transparent pricing. No surprises.</h2>
              <p style={{ ...pStyle, margin: "0 auto", textAlign: "center" }}>
                Every engagement comes with defined scope, fixed timeline, and measurable deliverables.
              </p>
            </div>
          </Reveal>
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {services.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: C.bgCard,
                  border: `1px solid ${s.popular ? C.accent + "50" : C.border}`,
                  borderRadius: C.radius,
                  padding: "32px 28px",
                  position: "relative",
                  transition: "transform 0.3s, border-color 0.3s",
                  display: "flex", flexDirection: "column",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; if (!s.popular) e.currentTarget.style.borderColor = C.borderHover; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (!s.popular) e.currentTarget.style.borderColor = C.border; }}
                >
                  {s.popular && (
                    <div style={{
                      position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                      background: C.accent, color: "white", fontFamily: C.mono, fontSize: "10px",
                      padding: "4px 14px", borderRadius: "0 0 6px 6px", letterSpacing: "1px",
                    }}>MOST POPULAR</div>
                  )}
                  <h3 style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 400, color: C.text, marginBottom: "8px", marginTop: s.popular ? "12px" : 0 }}>{s.name}</h3>
                  <div style={{ fontFamily: C.mono, fontSize: "20px", color: C.accent, marginBottom: "4px" }}>{s.price}</div>
                  <div style={{ fontFamily: C.mono, fontSize: "12px", color: C.textDim, marginBottom: "16px" }}>{s.timeline}</div>
                  <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.cyan, marginBottom: "20px", padding: "8px 12px", background: C.cyanDim, borderRadius: C.radiusSm }}>
                    Best when: {s.best}
                  </div>
                  <ul style={{ listStyle: "none", marginBottom: "20px", flex: 1 }}>
                    {s.features.map((f, j) => (
                      <li key={j} style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid, padding: "6px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ color: C.green, fontSize: "12px", marginTop: "2px" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setActiveService(activeService === i ? null : i)}
                    style={{
                      width: "100%", padding: "12px", borderRadius: C.radiusSm, cursor: "pointer",
                      fontFamily: C.sans, fontSize: "13px", fontWeight: 500,
                      background: s.popular ? C.accent : "transparent",
                      color: s.popular ? "white" : C.textMid,
                      border: s.popular ? "none" : `1px solid ${C.border}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {activeService === i ? "Hide Details" : "Learn More"}
                  </button>
                  {activeService === i && (
                    <div style={{ marginTop: "16px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: C.radiusSm, fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.6 }}>
                      {s.detail}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROI CALCULATOR ────────────────────────────────────── */}
      <section id="roi-calculator" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>ROI Calculator</div>
              <h2 style={h2Style}>See your potential impact</h2>
              <p style={{ ...pStyle, margin: "0 auto", textAlign: "center" }}>
                Adjust the sliders to match your business. All estimates use conservative assumptions.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
              {/* Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {[
                  { label: "Annual Revenue", val: revenue, set: setRevenue, min: 5, max: 999, suffix: "M€", display: `€${revenue}M` },
                  { label: "Current DSO (Days)", val: dso, set: setDso, min: 25, max: 120, suffix: " days", display: `${dso} days` },
                  { label: "Monthly Invoice Volume", val: invoiceVol, set: setInvoiceVol, min: 100, max: 999999, suffix: "", display: invoiceVol.toLocaleString() },
                  { label: "Average FTE Cost (Annual)", val: fteCost, set: setFteCost, min: 25000, max: 500000, suffix: "", display: `€${fteCost.toLocaleString()}` },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontFamily: C.sans, fontSize: "13px", color: C.textMid }}>{s.label}</span>
                      <span style={{ fontFamily: C.mono, fontSize: "14px", color: C.accent, fontWeight: 600 }}>{s.display}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} value={s.val}
                      onChange={e => s.set(Number(e.target.value))}
                      style={{ width: "100%", background: `linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${((s.val - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.08) ${((s.val - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                    />
                  </div>
                ))}
              </div>

              {/* Results */}
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "32px 28px" }}>
                <div style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px" }}>
                  Estimated Annual Impact
                </div>
                {[
                  { label: "Cash Flow Improvement", val: cashFlowImpact, desc: `Reducing DSO from ${dso} to 35 days` },
                  { label: "FTE Time Saved", val: fteTimeSaved, desc: "40% automation of manual AR tasks" },
                  { label: "Bad Debt Reduction", val: badDebtReduction, desc: "1.5% of revenue recovered" },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: C.sans, fontSize: "14px", color: C.text }}>{r.label}</span>
                      <span style={{ fontFamily: C.mono, fontSize: "18px", fontWeight: 600, color: C.green }}>{fmt(r.val)}</span>
                    </div>
                    <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>{r.desc}</span>
                  </div>
                ))}
                <div style={{ marginTop: "8px", padding: "20px", background: `linear-gradient(135deg, ${C.accentGlow}, ${C.accentGlow2})`, borderRadius: C.radiusSm, border: `1px solid ${C.accent}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, fontWeight: 500 }}>Total Annual Benefit</span>
                    <span style={{ fontFamily: C.mono, fontSize: "28px", fontWeight: 700, background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {fmt(totalBenefit)}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: "16px", fontFamily: C.mono, fontSize: "10px", color: C.textDim, textAlign: "center" }}>
                  Based on APQC median benchmarks · Conservative estimates
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── ABOUT ─────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={labelStyle}>Founder</div>
              <h2 style={h2Style}>Built by a fellow finance operator</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }} className="stats-grid">
            <Reveal>
              <div>
                <div style={{
                  width: "100%", aspectRatio: "1 / 1.2", borderRadius: C.radius,
                  background: `linear-gradient(135deg, ${C.bgCard2}, ${C.surface})`,
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  maxHeight: "400px", overflow: "hidden",
                }}>
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontFamily: C.serif, fontSize: "64px", color: C.accent, marginBottom: "8px" }}>NB</div>
                    <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, letterSpacing: "2px", textTransform: "uppercase" }}>Photo placeholder</div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <h3 style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 400, color: C.text, marginBottom: "4px" }}>Nazim Boukhouf</h3>
                <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.accent, marginBottom: "20px" }}>
                  Finance & AR Operations · Lean Six Sigma Black Belt
                </div>
                <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim, lineHeight: 1.8, marginBottom: "20px" }}>
                  A decade in the trenches of enterprise Order-to-Cash — across three continents, three languages, and some of the most complex AR operations in EMEA. The kind of experience that reveals where processes bleed money and exactly how to stop it.
                </p>
                <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim, lineHeight: 1.8, marginBottom: "20px" }}>
                  ClearLedger is what that experience built: a benchmark-driven OtC practice that treats finance operations like a system — measure it, tune it, prove it.
                </p>
                <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textDim, lineHeight: 1.8 }}>
                  No fluff. No mystery. Just a straight path from where your AR is to where it should be.
                </p>
                <div style={{ display: "flex", gap: "20px", marginTop: "24px" }}>
                  <a href="https://linkedin.com/in/nazim-boukhouf" target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: C.sans, fontSize: "12px", color: C.accent, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = C.accentBright}
                    onMouseLeave={e => e.target.style.color = C.accent}
                  >LinkedIn →</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CTA WITH EMAIL CAPTURE ────────────────────────────── */}
      <section id="cta" style={{ padding: "100px 0", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "600px", borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accentGlow2} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ ...sectionStyle, position: "relative", zIndex: 1, textAlign: "center" }}>
          <Reveal>
            <div style={labelStyle}>Get Started</div>
            <h2 style={{ ...h2Style, maxWidth: "600px", margin: "0 auto 16px" }}>
              Get your OtC health score in 10 minutes
            </h2>
            <p style={{ ...pStyle, margin: "0 auto 36px", textAlign: "center" }}>
              Our free diagnostic assesses your Order-to-Cash maturity across 8 domains,
              benchmarks against APQC standards, and identifies your top 3 quick wins.
            </p>

            {formStatus === "success" ? (
              <div style={{
                maxWidth: "480px", margin: "0 auto", padding: "24px",
                background: C.greenDim, border: `1px solid rgba(61,220,132,0.2)`, borderRadius: C.radius,
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>✓</div>
                <div style={{ fontFamily: C.sans, fontSize: "15px", color: C.green, fontWeight: 500 }}>You're in.</div>
                <div style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, marginTop: "8px" }}>
                  We'll send your diagnostic link within 24 hours.
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    aria-label="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEmailSubmit(e)}
                    style={{
                      flex: 1, padding: "14px 18px", borderRadius: C.radiusSm,
                      background: C.bgCard, border: `1px solid ${C.border}`,
                      color: C.text, fontFamily: C.sans, fontSize: "14px",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                  <button
                    onClick={handleEmailSubmit}
                    disabled={formStatus === "submitting"}
                    style={{
                      padding: "14px 28px", borderRadius: C.radiusSm, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                      color: "white", fontFamily: C.sans, fontSize: "14px", fontWeight: 500,
                      boxShadow: `0 4px 24px ${C.accentGlow2}`,
                      opacity: formStatus === "submitting" ? 0.7 : 1,
                      transition: "transform 0.2s, opacity 0.2s",
                    }}
                  >
                    {formStatus === "submitting" ? "Sending..." : "Get Diagnostic"}
                  </button>
                </div>
                {formStatus === "error" && (
                  <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.red, marginBottom: "8px" }}>
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                  {[
                    { icon: "🔒", text: "No credit card" },
                    { icon: "⏱️", text: "10 minutes" },
                    { icon: "📊", text: "Instant results" },
                  ].map((b, i) => (
                    <span key={i} style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>{b.icon}</span> {b.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "60px 0 32px", borderTop: `1px solid ${C.border}`, background: C.bgCard }}>
        <div style={sectionStyle}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <LogoMark size={24} />
                <span style={{ fontFamily: C.serif, fontSize: "16px", color: C.text }}>ClearLedger</span>
              </div>
              <p style={{ fontFamily: C.sans, fontSize: "13px", color: C.textDim, lineHeight: 1.6, maxWidth: "280px" }}>
                APQC-aligned Order-to-Cash advisory for growing companies. Diagnostics, process architecture, and implementation.
              </p>
              <div style={{ fontFamily: C.mono, fontSize: "11px", color: C.textDim, marginTop: "12px" }}>Warsaw · Global Delivery</div>
              <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textDim, marginTop: "8px" }}>
                <a href="mailto:stoic.nazim20@gmail.com" style={{ color: C.accent, textDecoration: "none" }}>stoic.nazim20@gmail.com</a>
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textMid, fontWeight: 500, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Services</div>
              {["Health Check", "Accelerator", "Transformation", "Free Diagnostic"].map(l => (
                <a key={l} href={l === "Free Diagnostic" ? "/diagnostic/" : "#services"} style={{ display: "block", fontFamily: C.sans, fontSize: "13px", color: C.textDim, textDecoration: "none", padding: "4px 0", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = C.text}
                  onMouseLeave={e => e.target.style.color = C.textDim}
                >{l}</a>
              ))}
            </div>

            {/* Expertise */}
            <div>
              <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textMid, fontWeight: 500, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Expertise</div>
              {["Collections & AR", "Cash Application", "Credit Management", "Deductions", "Treasury & WC"].map(l => (
                <span key={l} style={{ display: "block", fontFamily: C.sans, fontSize: "13px", color: C.textDim, padding: "4px 0" }}>{l}</span>
              ))}
            </div>

            {/* Standards & Legal */}
            <div>
              <div style={{ fontFamily: C.sans, fontSize: "12px", color: C.textMid, fontWeight: 500, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Standards</div>
              {["APQC PCF v8.0", "Hackett Benchmarks", "IFRS 15 / ASC 606", "SOX 404 Controls", "Peppol / e-Invoicing"].map(l => (
                <span key={l} style={{ display: "block", fontFamily: C.mono, fontSize: "11px", color: C.textDim, padding: "4px 0" }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Legal links & copyright */}
          <div style={{
            paddingTop: "24px", borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
          }}>
            <span style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim }}>
              © 2026 ClearLedger. All rights reserved.
            </span>
            <div style={{ display: "flex", gap: "20px" }}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => {
                const legalTabs = { "Privacy Policy": "privacy", "Terms of Service": "terms", "Cookie Policy": "cookies" };
                return (
                  <a key={l} href={`/legal/?tab=${legalTabs[l]}`} style={{ fontFamily: C.sans, fontSize: "11px", color: C.textDim, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = C.text}
                    onMouseLeave={e => e.target.style.color = C.textDim}
                  >{l}</a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
