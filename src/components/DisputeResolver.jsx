import React, { useState } from 'react'
import { FileSpreadsheet, ShieldAlert, CheckCircle, RefreshCw, FileText } from 'lucide-react'
import { useMockDatabase } from '../context/MockDatabaseContext'

export default function DisputeResolver() {
  const { disputes, resolveDisputeAction, contractCatalog } = useMockDatabase()
  const [selectedId, setSelectedId] = useState('disp-1')
  const [isResolving, setIsResolving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

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

  const handleResolve = (id, action) => {
    setIsResolving(true)
    setTimeout(() => {
      resolveDisputeAction(id, action)
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
                {active.podStatus === 'verified' ? (
                  <>
                    <CheckCircle size={18} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Agent Auto-Match Successful:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.3' }}>
                        Disputed shortage of {active.quantityClaimed} units matches shortage signed on carrier POD exception notes. Ready to approve.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Mismatch Flagged:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.3' }}>
                        Carrier logged clean delivery without shortages. Customer claim lacks exception documentation. Rejecting deduction recommended.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Action Workflow buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '110px', boxSizing: 'border-box' }}>
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
                      ) : active.podStatus === 'mismatch' ? (
                        'Override & Approve Credit'
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
