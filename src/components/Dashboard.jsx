import React, { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Sparkles, Activity, ShieldCheck, CheckCircle2, ChevronRight, Layers, FileText, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { useMockDatabase } from '../context/MockDatabaseContext'

export default function Dashboard({ activeTier, onNavigate, simulationRules }) {
  const { financials, logs, disputes, decisionLog, sopRegistry, gpoRules } = useMockDatabase()
  const effectiveRules = simulationRules || gpoRules
  const [showGpoPanel, setShowGpoPanel] = useState(false)

  // Chart tracking over time scaled relative to live actual metrics
  const chartData = [
    { name: 'Jan', DSO: Math.round((financials.dso * 1.12) * 10) / 10, AutoMatch: Math.round((financials.autoMatch * 0.90) * 10) / 10 },
    { name: 'Feb', DSO: Math.round((financials.dso * 1.08) * 10) / 10, AutoMatch: Math.round((financials.autoMatch * 0.93) * 10) / 10 },
    { name: 'Mar', DSO: Math.round((financials.dso * 1.04) * 10) / 10, AutoMatch: Math.round((financials.autoMatch * 0.95) * 10) / 10 },
    { name: 'Apr', DSO: Math.round((financials.dso * 0.98) * 10) / 10, AutoMatch: Math.round((financials.autoMatch * 0.98) * 10) / 10 },
    { name: 'May', DSO: financials.dso, AutoMatch: financials.autoMatch }
  ]

  const totalDisputesCount = disputes.length
  
  // Dynamically group and count disputes based on their reasonCode or reason
  const getDisputeCountByReason = (reason) => {
    return disputes.filter(d => {
      const code = (d.reasonCode || d.reason || '').toLowerCase()
      return code === reason.toLowerCase()
    }).length
  }

  const shortageCount = getDisputeCountByReason('shortage')
  const pricingCount = getDisputeCountByReason('pricing')
  const damageCount = getDisputeCountByReason('damage')
  const complianceCount = getDisputeCountByReason('compliance')
  const qualityCount = getDisputeCountByReason('quality')

  const disputeData = [
    { category: 'Shortages', count: shortageCount },
    { category: 'Pricing Error', count: pricingCount },
    { category: 'Damaged Goods', count: damageCount },
    { category: 'Tax Discrepancy', count: complianceCount },
    { category: 'Others', count: qualityCount }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Dynamic Tier Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, var(--accent-purple-glow), var(--accent-cyan-glow))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        borderRadius: '12px',
        border: '1px solid rgba(107, 92, 231, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.15rem', textTransform: 'capitalize' }}>{activeTier} Tier Operating Model Active</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            APQC PCF v8.0 Framework applied. Controls calibrated for {activeTier === 'global' ? 'Global MNC Compliance (J-SOX, e-Mandates)' : `${activeTier} scale operations`}.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => onNavigate('diagnostic')} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Change Scale / Assess Maturity <ChevronRight size={14} />
        </button>
      </div>

      {/* KPI Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Sales Outstanding</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>{financials.dso}d</span>
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              <TrendingDown size={14} style={{ marginRight: '2px' }} /> -3.2%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>APQC Benchmark: 38.5d (Top)</span>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash Application Auto-Match</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>{financials.autoMatch}%</span>
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} /> +12.4%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Straight-Through Matching Rate</span>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash Conversion Cycle</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>{financials.ccc}d</span>
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              <TrendingDown size={14} style={{ marginRight: '2px' }} /> -1.8%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Treasury Target: 52.0d</span>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Leakage Rate</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>{financials.revenueLeakage}%</span>
            <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} /> +0.2%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disputes, claims & bad debt write-offs</span>
        </div>
      </div>

      {/* Main Grid: Charts & Live Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Analytics Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--accent-purple)' }} /> DSO vs. Auto-Match Progression
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5-Month Trend</span>
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="DSO" stroke="var(--error)" strokeWidth={2.5} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="AutoMatch" stroke="var(--accent-cyan)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dispute Distribution */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--warning)' }} /> Active Disputes Breakdown
          </h3>
          <div style={{ flex: 1, minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disputeData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" stroke="var(--text-secondary)" style={{ fontSize: '0.7rem' }} width={80} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="var(--accent-purple)" radius={[0, 4, 4, 0]}>
                  {disputeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-purple)' : 'var(--accent-cyan)'} opacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            Total Disputes: <strong>{totalDisputesCount}</strong> | Auto-Resolve Rate: <strong>{financials.resolvedRate}%</strong>
          </div>
        </div>
      </div>

      {/* Autonomous Agent Operations Log */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--accent-cyan)' }} /> 
            Autonomous Agent Activity Log
          </h3>
          <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
            <span className="pulse-dot"></span> Live Processing Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              borderLeft: `4px solid ${
                log.status === 'success' ? 'var(--success)' : 
                log.status === 'alert' ? 'var(--error)' : 'var(--accent-cyan)'
              }`,
              fontSize: '0.85rem'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span style={{ fontWeight: '700', textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                    {log.type.replace('_', ' ')} Agent
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontFamily: log.type === 'cash_app' ? 'var(--font-mono)' : 'inherit' }}>
                  {log.msg}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible GPO Policy Adherence */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
        <div
          onClick={() => setShowGpoPanel(!showGpoPanel)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-purple)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>GPO Policy Adherence</span>
            <span className={`metric-badge badge-purple`} style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
              {decisionLog.filter(d => d.decision?.sopRef).length} SOP refs
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showGpoPanel ? 'rotate(180deg)' : 'none' }}>
            ▼
          </span>
        </div>
        {showGpoPanel && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {sopRegistry.map(sop => {
                const recentLogs = decisionLog.filter(d =>
                  d.decision?.sopRef && sop.rules.some(r => r.id === d.decision.sopRef)
                )
                return (
                  <div key={sop.id} style={{
                    background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '0.6rem',
                    border: '1px solid var(--border-color)', opacity: recentLogs.length > 0 ? 1 : 0.45
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: '700' }}>{sop.id} v{sop.version}</span>
                      <span style={{ fontSize: '0.55rem', color: recentLogs.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {recentLogs.length > 0 ? `${recentLogs.length}x applied` : 'idle'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-primary)' }}>{sop.title}</div>
                  </div>
                )
              })}
            </div>
            <div style={{
              padding: '0.4rem 0.6rem', background: 'var(--bg-secondary)',
              borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-secondary)',
              display: 'flex', gap: '1rem', flexWrap: 'wrap'
            }}>
              <span>Threshold: <strong>${effectiveRules.autoApproveThreshold.toLocaleString()}</strong></span>
              <span>Dunning: <strong>Every {effectiveRules.dunningEscalation}d</strong></span>
              <span>E-Invoice: <strong>{effectiveRules.requireEInvoice ? 'On' : 'Off'}</strong></span>
              <span>Sync: <strong>{effectiveRules.syncTiming}</strong></span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
