import React, { useState } from 'react'
import { FileSpreadsheet, ShieldAlert, CheckCircle, RefreshCw, FileText, DollarSign } from 'lucide-react'
import { useMockDatabase } from '../context/MockDatabaseContext'
import { evaluateRules } from '../ruleEngine'

export default function DisputeResolver({ simulationRules }) {
  const { disputes, resolveDisputeAction, contractCatalog, addDecisionLog, gpoRules, sopRegistry } = useMockDatabase()
  const effectiveRules = simulationRules || gpoRules
  const [selectedId, setSelectedId] = useState('disp-1')
  const [isResolving, setIsResolving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [overrideActive, setOverrideActive] = useState(false)

  // Filter queue based on search term and status pill selected
  const filteredDisputes = disputes.filter(disp => {
    const matchesSearch = 
      disp.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disp.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || disp.status.toUpperCase() === statusFilter.toUpperCase()
    
    return matchesSearch && matchesStatus
  })

  // Ensure selected invoice is valid (fallback to first of filtered, or first of all)
  const active = filteredDisputes.find(d => d.id === selectedId) || filteredDisputes[0] || disputes[0]

  // Contract matching: compare claimed amount vs contract catalog prices
  const contractMatch = (() => {
    if (!active) return null
    const contractPrice = contractCatalog[active.sku]?.basePrice || 0
    const expectedAmount = contractPrice * (active.quantityClaimed || 0)
    const claimed = active.claimAmount || 0
    if (expectedAmount === 0) return { errorMargin: null, matchLevel: 'unknown', expectedAmount: 0, contractPrice: 0 }
    const errorMargin = Math.abs(claimed - expectedAmount) / expectedAmount * 100
    let matchLevel = 'approved'
    if (errorMargin > 10) matchLevel = 'rejected'
    else if (errorMargin > 3) matchLevel = 'flagged'
    return { errorMargin: Math.round(errorMargin * 10) / 10, matchLevel, expectedAmount: Math.round(expectedAmount), contractPrice }
  })()

  // Rule engine: evaluate SOP conditions against current dispute context
  const ruleContext = active ? {
    podVerified: active.podStatus === 'verified',
    claimWithinThreshold: (active.claimAmount || 0) <= effectiveRules.autoApproveThreshold,
    contractMismatch: contractMatch?.matchLevel === 'flagged' || contractMatch?.matchLevel === 'rejected',
    overrideApproved: overrideActive,
    skuFound: !!(active.sku && contractCatalog[active.sku]),
    errorUnder3pct: contractMatch?.matchLevel === 'approved',
    errorOver10pct: contractMatch?.matchLevel === 'rejected',
  } : {}
  const matchedRules = active ? evaluateRules(sopRegistry, ['dispute', 'pricing', 'governance'], ruleContext) : []

  const handleResolve = (id, action) => {
    setIsResolving(true)
    const targetDisp = disputes.find(d => d.id === id) || active
    setTimeout(() => {
      resolveDisputeAction(id, action)
      addDecisionLog({
        agentId: 'DisputeResolver',
        input: { disputeId: id, sku: targetDisp.sku, claimAmount: targetDisp.claimAmount, podStatus: targetDisp.podStatus },
        decision: { action, contractMatch: contractMatch?.matchLevel || 'unknown', errorMargin: contractMatch?.errorMargin || 0, sopRefs: matchedRules.map(r => r.id) },
        outcome: action === 'approved' ? 'Credit memo posted' : 'Counter-dispute filed',
        category: 'dispute'
      })
      setIsResolving(false)
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Title Panel */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Deductions & Dispute Resolver (CPG/Retail Module)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Correlates customer portal claims, carrier 3PL documentation, and contract catalogs to automate credit decisions.
        </p>
      </div>

      {/* Workspace Panel split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        
        {/* Dispute List Sidebar */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', height: '620px', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: '700' }}>Active Claims Queue</h3>
          
          {/* Search and Status Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="text"
              placeholder="Search customer, invoice, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: `1px solid ${statusFilter === status ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    backgroundColor: statusFilter === status ? 'var(--accent-purple-glow)' : 'var(--bg-tertiary)',
                    color: statusFilter === status ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            {filteredDisputes.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                No matching claims found.
              </div>
            ) : (
              filteredDisputes.map(disp => (
                <div 
                  key={disp.id}
                  onClick={() => setSelectedId(disp.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    backgroundColor: selectedId === disp.id ? 'var(--bg-tertiary)' : 'transparent',
                    border: `1px solid ${selectedId === disp.id ? 'var(--border-color)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '140px' }}>
                      {disp.customer || disp.customerId}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{disp.invoiceId || disp.invoice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                      ${(disp.claimAmount || 0).toLocaleString()}
                    </span>
                    <span className={`metric-badge ${
                      disp.status === 'approved' ? 'badge-success' : 
                      disp.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {disp.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Triple-Match Reconciliation Workspace */}
        {active ? (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '620px', boxSizing: 'border-box', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Triple-Match Reconciliation Sheet</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target SKU: <strong>{active.sku}</strong> | Invoice: <strong>{active.invoiceId || active.invoice}</strong></span>
              </div>
              <span className="metric-badge badge-purple" style={{ padding: '0.3rem 0.6rem' }}>
                APQC Task 8.3.4 (Process Customer Claims)
              </span>
            </div>

            {/* Three-Column Verification Board */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              
              {/* Column 1: Customer Claim Data */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <FileText size={14} style={{ color: 'var(--error)' }} /> 1. Customer Claim (Debit)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>Claim Amount: <strong style={{ color: 'var(--text-primary)' }}>${(active.claimAmount || 0).toLocaleString()}</strong></div>
                  <div>SKU: <strong style={{ color: 'var(--text-primary)' }}>{active.sku}</strong></div>
                  <div>Shortage Qty: <strong style={{ color: 'var(--text-primary)' }}>{active.quantityClaimed} units</strong></div>
                  <div>Source: <span style={{ textDecoration: 'underline' }}>Customer Vendor Portal</span></div>
                </div>
              </div>

              {/* Column 2: 3PL Delivery Document (POD) */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <FileText size={14} style={{ color: 'var(--accent-cyan)' }} /> 2. Carrier POD & BOL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>Carrier: <strong>{active.carrier}</strong></div>
                  <div>Tracking: <span style={{ fontFamily: 'var(--font-mono)' }}>{active.tracking}</span></div>
                  <div>POD status: <span className={active.podStatus === 'verified' ? 'metric-badge badge-success' : 'metric-badge badge-error'} style={{ fontSize: '0.65rem' }}>{active.podStatus.toUpperCase()}</span></div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.7rem', marginTop: '0.15rem', lineHeight: '1.2' }}>{active.podDetails}</div>
                </div>
              </div>

              {/* Column 3: CRM Contract / Master Price catalog */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <FileSpreadsheet size={14} style={{ color: 'var(--accent-purple)' }} /> 3. CRM Contract Pricing
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>Active Contract: <strong>Master Pricing v3.4</strong></div>
                  <div>Base Price: <strong style={{ color: 'var(--text-primary)' }}>${(contractCatalog[active.sku]?.basePrice || 0).toLocaleString()}</strong></div>
                  <div>Pricing Terms: <span style={{ textDecoration: 'underline' }}>EXW (Ex Works)</span></div>
                  <div>SOX Control: <span style={{ color: 'var(--success)', fontWeight: '600' }}>Active (OTC-04)</span></div>
                  {contractMatch && contractMatch.matchLevel !== 'unknown' && (
                    <div style={{ marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                        <DollarSign size={11} /> Contract Match <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }}>SOP-007</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Expected: <strong>${contractMatch.expectedAmount.toLocaleString()}</strong> | Claimed: <strong>${(active.claimAmount || 0).toLocaleString()}</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Error: <span style={{
                          color: contractMatch.matchLevel === 'approved' ? 'var(--success)' : contractMatch.matchLevel === 'flagged' ? 'var(--warning)' : 'var(--error)',
                          fontWeight: '700'
                        }}>{contractMatch.errorMargin}%</span>
                        <span className={`metric-badge ${
                          contractMatch.matchLevel === 'approved' ? 'badge-success' : 
                          contractMatch.matchLevel === 'flagged' ? 'badge-warning' : 'badge-error'
                        }`} style={{ fontSize: '0.6rem', marginLeft: '0.4rem', padding: '0.05rem 0.3rem' }}>
                          {contractMatch.matchLevel === 'approved' ? 'Match ✓' : contractMatch.matchLevel === 'flagged' ? 'Review' : 'Mismatch'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* AI Recommendation & Actions Bar */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.8fr 1.2fr', 
              gap: '1rem', 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '1rem',
              marginTop: 'auto',
              alignItems: 'center'
            }}>
              
              {/* Left Side: Recommendation Banner */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: active.podStatus === 'verified' ? 'var(--accent-purple-glow)' : 'var(--error-glow)',
                border: `1px solid ${active.podStatus === 'verified' ? 'var(--accent-purple)' : 'var(--error)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                height: '110px',
                boxSizing: 'border-box',
                overflowY: 'auto'
              }}>
                {(() => {
                  const podOk = active.podStatus === 'verified'
                  const underThreshold = (active.claimAmount || 0) <= effectiveRules.autoApproveThreshold
                  const applicableSops = matchedRules
                  const canAutoApprove = podOk && underThreshold && contractMatch?.matchLevel !== 'rejected' && contractMatch?.matchLevel !== 'unknown'

                  if (canAutoApprove) {
                    return (
                      <>
                        <CheckCircle size={18} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Agent Auto-Match Successful:</strong>
                          <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.3' }}>
                            {contractMatch?.matchLevel === 'flagged'
                              ? `POD verified but claim deviates ${contractMatch.errorMargin}% from contract pricing. Flagged for review per ${applicableSops.join(', ')}.`
                              : `Disputed shortage of ${active.quantityClaimed} units matches POD exception notes. Contract pricing aligns within ${contractMatch?.errorMargin || 0}%. Ready to approve per ${applicableSops.join(', ')}.`
                            }
                          </p>
                          <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {applicableSops.map(r => (
                              <span key={r.id} className="metric-badge badge-purple" style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
                                {r.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  }
                  return (
                    <>
                      <ShieldAlert size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Mismatch Flagged:</strong>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.3' }}>
                          {contractMatch?.matchLevel === 'rejected'
                            ? `Claim of $${(active.claimAmount || 0).toLocaleString()} deviates ${contractMatch.errorMargin}% from contract catalog price (expected $${contractMatch.expectedAmount.toLocaleString()}). Refer to ${applicableSops.map(r => r.id).join(', ')}.`
                            : `Carrier logged clean delivery without shortages. Customer claim lacks exception documentation. Rejecting deduction recommended per ${applicableSops.length ? applicableSops.map(r => r.id).join(', ') : 'SOP-001-R2'}.`
                          }
                        </p>
                        <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {applicableSops.map(r => (
                            <span key={r.id} className="metric-badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
                              {r.id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Right Side: Action Workflow buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '110px', boxSizing: 'border-box' }}>
                {active.status === 'pending' && (
                  <button
                    onClick={() => setOverrideActive(!overrideActive)}
                    style={{
                      alignSelf: 'flex-end', background: 'transparent', border: 'none',
                      fontSize: '0.6rem', color: overrideActive ? 'var(--warning)' : 'var(--text-muted)',
                      cursor: 'pointer', fontWeight: 600, marginBottom: '0.25rem',
                      display: 'flex', alignItems: 'center', gap: '0.2rem',
                    }}
                  >
                    {overrideActive ? '✓ GPO Override Active' : 'GPO Override'}
                  </button>
                )}
                {active.status !== 'pending' ? (
                  <div style={{
                    backgroundColor: active.status === 'approved' ? 'var(--success-glow)' : 'var(--error-glow)',
                    color: active.status === 'approved' ? 'var(--success)' : 'var(--error)',
                    padding: '1rem 0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '700',
                    border: `1px solid ${active.status === 'approved' ? 'var(--success)' : 'var(--error)'}`,
                    fontSize: '0.8rem',
                    lineHeight: '1.3'
                  }}>
                    {active.status === 'approved' ? 
                      `Approved: Memo ${active.invoiceId || active.invoice}-CM posted to ERP.` : 
                      'Rejected: Counter-claim files exported.'
                    }
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <button 
                      className="btn-primary"
                      disabled={isResolving}
                      onClick={() => handleResolve(active.id, 'approved')}
                      style={{
                        padding: '0.6rem',
                        fontSize: '0.8rem',
                        background: active.podStatus === 'verified' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple))' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan))',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {isResolving ? (
                        <>
                          <RefreshCw size={12} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Syncing...
                        </>
                      ) : active.podStatus === 'mismatch' || contractMatch?.matchLevel === 'rejected' ? (
                        'Override & Approve Credit'
                      ) : contractMatch?.matchLevel === 'flagged' ? (
                        'Approve with Flag'
                      ) : (
                        'Auto-Approve Credit Memo'
                      )}
                    </button>
                    <button 
                      className="btn-secondary"
                      disabled={isResolving}
                      onClick={() => handleResolve(active.id, 'rejected')}
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px'
                      }}
                    >
                      {active.podStatus === 'mismatch' ? 'Counter-Dispute (Reject)' : 'Reject Deduction'}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '620px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Select a claim from the queue to start.</span>
          </div>
        )}

      </div>

    </div>
  )
}
