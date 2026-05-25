import React, { useState } from 'react'
import { CheckCircle2, ChevronRight, AlertTriangle, Lightbulb, Play, ClipboardList, Info, ShieldCheck, BookOpen } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

export default function DiagnosticIntake({ activeTier, onTierChange, onNavigate }) {
  const [scores, setScores] = useState({
    credit: 2,
    billing: 3,
    collections: 2,
    cashApp: 1,
    disputes: 2,
    compliance: 3
  })

  const [activeDomainInfo, setActiveDomainInfo] = useState('cashApp')

  const domains = [
    { id: 'credit', name: 'Credit & Risk', desc: 'Credit check speeds, scorecards, credit limits.' },
    { id: 'billing', name: 'Billing & Invoicing', desc: 'E-invoicing compliance, delivery cycles, accuracy.' },
    { id: 'collections', name: 'Collections Strategy', desc: 'Dunning CAD, risk-segmentation prioritization.' },
    { id: 'cashApp', name: 'Cash Application', desc: 'Remittance processing, matching, bank reconciliation.' },
    { id: 'disputes', name: 'Dispute Resolution', desc: 'SLA speed, POD extraction, root cause analysis.' },
    { id: 'compliance', name: 'SOX & Compliance', desc: 'Internal controls, auditability, global mandates.' }
  ]

  const maturityLevels = [
    { val: 1, name: 'Reactive', color: 'var(--error)', desc: 'Highly manual, ad-hoc execution, paperwork-heavy, zero automation.' },
    { val: 2, name: 'Standardized', color: 'var(--warning)', desc: 'Standard operating procedures exist, basic automation templates in place.' },
    { val: 3, name: 'Optimized', color: 'var(--accent-purple)', desc: 'Integrated CRM/ERP data flow, systematic exception management.' },
    { val: 4, name: 'Predictive', color: 'var(--accent-cyan)', desc: 'Advanced analytics, predictive dunning triggers, custom workflow routing.' },
    { val: 5, name: 'Autonomous', color: 'var(--success)', desc: 'Full AI-driven processing, self-learning cash matching, zero human intervention.' }
  ]

  // Construct chart data
  const radarData = domains.map(d => ({
    subject: d.name,
    Score: scores[d.id],
    Benchmark: 4.2 // Hackett Elite Target
  }))

  const handleScoreChange = (domain, val) => {
    setScores(prev => ({ ...prev, [domain]: val }))
  }

  // Dynamic Gap-to-SOX control mapper
  const getGapsAndWins = () => {
    const list = []
    
    if (scores.cashApp <= 2) {
      list.push({
        id: 'cash',
        domain: 'Cash Application',
        severity: 'Critical',
        gap: 'Remittance details are manually entered from bank portals, causing delayed cash allocation and dunning noise.',
        win: 'Deploy the Autonomous Cash App agent to auto-fetch remittances and reach 90%+ match rates.',
        soxControl: 'OTC-12 (Cash Application Segregation & Matching)',
        advisoryTab: 'Cash Application',
        agentTab: 'inbox'
      })
    }
    
    if (scores.disputes <= 2) {
      list.push({
        id: 'disputes',
        domain: 'Dispute Resolution',
        severity: 'High',
        gap: 'Disputes sit idle due to manual retrieval of Proof of Deliveries (PODs) and shipment invoices.',
        win: 'Trigger the Deductions Resolver to pull PODs from carriers and match claims side-by-side.',
        soxControl: 'OTC-13 (Customer Dispute Investigations)',
        advisoryTab: 'Dispute Resolution',
        agentTab: 'disputes'
      })
    }
    
    if (scores.collections <= 2) {
      list.push({
        id: 'coll',
        domain: 'Collections Strategy',
        severity: 'Medium',
        gap: 'Collectors chase payments based on legacy spreadsheet lists without risk-segmentation.',
        win: 'Incorporate active dynamic risk profiling to prioritize transactional vs strategic accounts.',
        soxControl: 'OTC-09 (Collection Activity & Dunning Escalations)',
        advisoryTab: 'Collections Strategy',
        agentTab: 'inbox'
      })
    }

    if (scores.credit <= 2) {
      list.push({
        id: 'credit',
        domain: 'Credit & Risk',
        severity: 'Medium',
        gap: 'Credit evaluations are delayed or run ad-hoc without structured portfolio exposure aggregation.',
        win: 'Implement rating-based scoring rules and standardized approval chains.',
        soxControl: 'OTC-02 (Customer Credit Evaluations)',
        advisoryTab: 'Credit Management',
        agentTab: 'settings' // GPO configuration
      })
    }

    return list
  }

  const gaps = getGapsAndWins()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>OtC Diagnostic & AR Maturity Assessment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            APQC PCF v8.0 Alignment | Calibrated for <strong>{activeTier.toUpperCase()}</strong> operating profile.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Scaling:</span>
          <select 
            value={activeTier} 
            onChange={(e) => onTierChange(e.target.value)}
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}
          >
            <option value="sme">SME Tier</option>
            <option value="mid">Mid-Market Tier</option>
            <option value="enterprise">Enterprise Tier</option>
            <option value="global">Global MNC Tier</option>
          </select>
        </div>
      </div>

      {/* Main Assessment Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem'
      }}>
        
        {/* Domain Scoring Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} style={{ color: 'var(--accent-purple)' }} /> Evaluate Process Capabilities
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {domains.map(d => (
              <div 
                key={d.id} 
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: activeDomainInfo === d.id ? 'var(--accent-purple-glow)' : 'transparent',
                  border: activeDomainInfo === d.id ? '1px solid var(--accent-purple)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onClick={() => setActiveDomainInfo(d.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{d.name}</span>
                  <span className="metric-badge" style={{ 
                    backgroundColor: maturityLevels[scores[d.id] - 1].color + '22',
                    color: maturityLevels[scores[d.id] - 1].color,
                    border: `1px solid ${maturityLevels[scores[d.id] - 1].color}55`
                  }}>
                    Level {scores[d.id]}: {maturityLevels[scores[d.id] - 1].name}
                  </span>
                </div>

                {/* Score Selector (1-5 Level Indicators) */}
                <div style={{ display: 'flex', gap: '0.25rem', height: '0.5rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <div 
                      key={val} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScoreChange(d.id, val);
                      }}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        backgroundColor: val <= scores[d.id] ? maturityLevels[val - 1].color : 'var(--bg-tertiary)',
                        transition: 'var(--transition-fast)',
                        opacity: val <= scores[d.id] ? 1 : 0.4
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart & Details */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} style={{ color: 'var(--accent-cyan)' }} /> Domain Benchmark Mapping
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Comparing current capabilities to Hackett Elite Benchmark (Level 4.2+).</p>
          </div>

          <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" style={{ fontSize: '0.7rem' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="var(--text-muted)" style={{ fontSize: '0.65rem' }} />
                <Radar name="ClearLedger Score" dataKey="Score" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.25} />
                <Radar name="Hackett Benchmark" dataKey="Benchmark" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Active Domain Info Box */}
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.825rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Domain Focus: {domains.find(d => d.id === activeDomainInfo).name}
            </h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {domains.find(d => d.id === activeDomainInfo).desc}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <strong style={{ color: maturityLevels[scores[activeDomainInfo] - 1].color }}>
                {maturityLevels[scores[activeDomainInfo] - 1].name}:
              </strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                {maturityLevels[scores[activeDomainInfo] - 1].desc}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Gap Analysis & Action Planner */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Automated Gap Analysis & Recommendations
        </h3>

        {gaps.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', padding: '1rem', background: 'var(--success-glow)', borderRadius: '8px' }}>
            <CheckCircle2 size={16} /> Fully Optimized. Your processes are calibrated to autonomous maturity standards.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {gaps.map((gap) => (
              <div key={gap.id} style={{
                display: 'grid',
                gridTemplateColumns: '150px 2fr 1.5fr',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span className="metric-badge badge-error" style={{ fontSize: '0.7rem' }}>{gap.severity} Priority</span>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '0.25rem' }}>{gap.domain}</div>
                </div>

                <div style={{ fontSize: '0.85rem' }}>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}><strong>Observed Gap:</strong> {gap.gap}</p>
                  <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    <Lightbulb size={14} style={{ color: 'var(--warning)' }} /> <strong>Quick Win:</strong> {gap.win}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                    <ShieldCheck size={12} /> Compliance Control Target: {gap.soxControl}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => onNavigate(gap.advisoryTab)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    <BookOpen size={12} /> View SOP Pack
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => onNavigate(gap.agentTab)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Deploy Agent <Play size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
