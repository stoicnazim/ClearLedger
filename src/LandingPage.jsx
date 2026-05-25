import React, { useState } from 'react'
import { Sparkles, ShieldCheck, BookOpen, BarChart3, Mail, FileWarning, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage({ onEnter }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Store locally; replace with your CRM/webhook endpoint when ready
    try {
      localStorage.setItem('clearlogger_lead_email', email)
      localStorage.setItem('clearlogger_lead_date', new Date().toISOString())
    } catch (_) {}
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '560px', color: '#f9fafb' }}>
          <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', marginBottom: '0.25rem' }}>Your report is on its way.</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
            We sent the APQC-aligned AR Maturity Benchmark to <strong style={{ color: '#f9fafb' }}>{email}</strong>
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left'
          }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', color: '#8b5cf6', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Benchmark Report Includes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                '6-domain maturity scoring (APQC PCF v8.0)',
                'Comparison vs Hackett Elite Benchmark (L4.2)',
                'Automated gap analysis with SOX control mapping',
                'Priority-ranked remediation roadmap',
                '18 process packs reference guide'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#d1d5db' }}>
                  <CheckCircle2 size={14} style={{ color: '#22d3ee', flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Meanwhile, explore the platform:</p>
            <button
              onClick={onEnter}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white', border: 'none',
                padding: '0.75rem 2rem', borderRadius: '8px',
                fontWeight: '600', fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              Launch ClearLedger Platform <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
      color: '#f9fafb',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Nav */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.25rem', height: '2.25rem',
            background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontFamily: "'Outfit', sans-serif", fontSize: '1rem'
          }}>CL</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.25rem' }}>ClearLedger</span>
        </div>
        <button
          onClick={onEnter}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#f9fafb',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Launch App
        </button>
      </header>

      {/* Hero */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#8b5cf6',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <Sparkles size={14} /> APQC PCF v8.0 Certified
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(34, 211, 238, 0.12)',
              color: '#22d3ee',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              $3.4B AR Automation Market (2025)
            </div>
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: '1.1',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Autonomous OtC<br />
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              for SSC, BPO & GBS
            </span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            APQC PCF v8.0 diagnostic tools, 18 process packs, and AI-powered AR agents<br />
            built for shared service centers and business process outsourcers.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '440px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter work email for free benchmark report"
              required
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f9fafb',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Get Free Report'}
            </button>
          </form>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            No spam. We'll email your AR maturity benchmark + score.
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: '#8b5cf6' }}>2026 AR Maturity Benchmark</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Cash Application', score: 2, max: 5 },
              { label: 'Dispute Resolution', score: 3, max: 5 },
              { label: 'Collections Strategy', score: 2, max: 5 },
              { label: 'Credit & Risk', score: 3, max: 5 },
              { label: 'Billing & Invoicing', score: 2, max: 5 },
              { label: 'Compliance', score: 3, max: 5 },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#9ca3af' }}>{item.label}</span>
                  <span style={{ color: '#22d3ee', fontWeight: 600 }}>L{item.score}/5</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(item.score / item.max) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b5cf6, #22d3ee)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#9ca3af'
          }}>
            vs <strong style={{ color: '#f9fafb' }}>Hackett Elite Benchmark: L4.2</strong> — DSO degraded second straight year (Hackett 2025). $600B trapped in AR globally.
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 2rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem'
      }}>
        {[
          { icon: <BarChart3 size={20} />, title: 'AR Diagnostic', desc: '6-domain maturity assessment against APQC PCF v8.0 and Hackett benchmarks. Identifies gaps and auto-generates remediation roadmaps.' },
          { icon: <BookOpen size={20} />, title: '18 Process Packs', desc: 'SOPs, RACIs, SIPOCs, and control matrices for every OtC domain. Ready to deploy in your SSC/BPO operations.' },
          { icon: <Mail size={20} />, title: 'Autonomous Inbox', desc: 'AI agent ingests remittances, disputes, and compliance flags. Extracts entities and proposes actions with confidence scoring.' },
          { icon: <FileWarning size={20} />, title: 'Dispute Resolver', desc: 'Triple-match reconciliation: customer claim vs carrier POD vs contract pricing. Auto-approves or flags based on GPO policy.' },
          { icon: <ShieldCheck size={20} />, title: 'SOX Compliance', desc: 'Built-in control mapping (OTC-02 through OTC-17). Global governance matrix for J-SOX, KSeF, Peppol mandates.' },
          { icon: <BarChart3 size={20} />, title: 'KPI Command Center', desc: 'Live DSO, auto-match %, cash conversion cycle, and revenue leakage tracking. Agent activity log with real-time status.' },
        ].map(f => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem',
            transition: 'all 0.2s'
          }}>
            <div style={{ color: '#8b5cf6', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.5' }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Use Cases */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 4rem'
      }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Built for <span style={{ color: '#22d3ee' }}>SSC, BPO & GBS</span> Operations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { title: 'Standardize Across Clients', desc: 'Deploy consistent APQC-aligned AR processes across every client engagement. 18 ready-to-use process packs eliminate the need to reinvent SOPs.' },
            { title: 'Onboard New Hires Faster', desc: 'Use the maturity assessment to identify skill gaps and the advisory library as training curriculum. Reduce ramp time for new AR analysts.' },
            { title: 'Demonstrate Value to Customers', desc: 'Show clients their AR maturity score, benchmark against peers, and present a data-driven transformation roadmap with measurable KPIs.' },
            { title: 'Reduce Operating Costs', desc: 'Automate cash application, dispute resolution, and collections with AI agents. Reduce manual touch points and headcount per client.' },
          ].map((u, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '1.5rem'
            }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', marginBottom: '0.5rem', color: '#22d3ee' }}>
                {u.title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.5' }}>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 2rem 4rem',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Ready to benchmark your AR operations?
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
          Free APQC-aligned diagnostic. No credit card. No sales call.
        </p>
        <button
          onClick={onEnter}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        >
          Launch ClearLedger <ArrowRight size={16} style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#6b7280',
        fontSize: '0.75rem'
      }}>
        ClearLedger — Autonomous OtC Platform for SSC, BPO & GBS Teams
      </footer>
    </div>
  )
}
