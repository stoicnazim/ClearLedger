import React, { useState, useEffect, useMemo } from 'react'
import { Mail, AlertCircle, Sparkles, Send, RefreshCw, Eye, Database, ArrowRight, PlusCircle } from 'lucide-react'
import { useMockDatabase } from '../context/MockDatabaseContext'
import { evaluateRules } from '../ruleEngine'

export default function AutonomousInbox({ activeTier, simulationRules }) {
  const { invoices, applyRemittance, resolveDisputeAction, addLog, addDecisionLog, sopRegistry, gpoRules } = useMockDatabase()
  const effectiveRules = simulationRules || gpoRules

  // Fallback defaults if parent doesn't pass simulationRules yet
  const rules = simulationRules || {
    autoApproveThreshold: 1000,
    requireEInvoice: true,
    syncTiming: 'realtime'
  }

  const [emails, setEmails] = useState([
    {
      id: 'em-1',
      sender: 'ap-portal@walmart.com',
      subject: 'Deduction Notice - Invoice #INV-88912 - Shortage Claimed',
      date: 'Today, 08:32 AM',
      body: 'Hi Billing Team, please find attached deduction details for invoice INV-88912. The carrier arrived with 8 short boxes of Item code CL-901. We paid $41,200.00 instead of the invoice amount $45,200.00. Please process credit memo for $4,000.00.',
      status: 'pending',
      category: 'dispute',
      entities: { invoice: 'INV-88912', claimedAmount: 4000.00, reason: 'Shortage', code: 'CL-901' },
      confidence: 96,
      reasoning: 'Customer references invoice number, shortages on carrier arrival, and exact SKU. Intent classified as Deduction Dispute.'
    },
    {
      id: 'em-2',
      sender: 'treasury@acme-corp.com',
      subject: 'Remittance Advice - Invoices #INV-88710 & #INV-88711',
      date: 'Today, 07:15 AM',
      body: 'Good morning, we have authorized wire transfer payment of $120,500.00 covering: INV-88710 ($80,500) and INV-88711 ($40,000). Remittance reference is ACH-992182.',
      status: 'pending',
      category: 'cash_app',
      entities: { invoice: ['INV-88710', 'INV-88711'], claimedAmount: 120500.00, reason: 'Payment Remittance', code: 'ACH-992182' },
      confidence: 99,
      reasoning: 'Extracted multiple invoice numbers and wire amount matching outstanding ERP invoice logs. Straight-Through Processing (STP) candidate.'
    },
    {
      id: 'em-3',
      sender: 'purchasing@globex.de',
      subject: 'Invoice format reject notification',
      date: 'Yesterday',
      body: 'Dear Partner, our system rejected invoice #INV-88691. Value-added tax rates must comply with Polish KSeF formatting. The schema version used (v2.0) is expired. Please re-submit.',
      status: 'pending',
      category: 'compliance',
      entities: { invoice: 'INV-88691', claimedAmount: 0, reason: 'Validation Failure', code: 'KSeF-v2' },
      confidence: 92,
      reasoning: 'Email references e-invoicing compliance rejection code. System must re-route invoice billing XML output through upgraded validation proxy.'
    }
  ])

  const [selectedId, setSelectedId] = useState('em-1')
  const [isProcessing, setIsProcessing] = useState(false)

  // Custom simulation playground states
  const [showInjector, setShowInjector] = useState(false)
  const [customSender, setCustomSender] = useState('billing@customer.com')
  const [customSubject, setCustomSubject] = useState('Inquiry regarding Invoice INV-88912')
  const [customBody, setCustomBody] = useState('Hi, we noticed a billing discrepancy on INV-88912. The pricing agreement states SKU CL-901 should be billed at $500, but we were billed at $600. Please adjust by $800.00.')

  const activeEmail = emails.find(e => e.id === selectedId)

  // Rule engine: evaluate SOP conditions against active email context
  const matchedRules = useMemo(() => {
    if (!activeEmail) return []
    const e = activeEmail
    const ctx = {
      claimWithinThreshold: e.entities.claimedAmount <= rules.autoApproveThreshold,
      amountWithinThreshold: e.entities.claimedAmount <= rules.autoApproveThreshold,
      podVerified: e.category === 'dispute' && e.status === 'pending',
      contractMismatch: false,
      overrideApproved: false,
      singleInvoice: !Array.isArray(e.entities.invoice),
      multiInvoice: Array.isArray(e.entities.invoice),
      exactMatch: e.category === 'cash_app',
      partialMatch: e.category === 'cash_app' && e.entities.claimedAmount > 0,
      xmlSchemaValid: e.category !== 'compliance',
      crossBorderEU: false,
      skuFound: false,
      errorUnder3pct: false,
      errorOver10pct: false,
    }
    return evaluateRules(sopRegistry, [e.category === 'dispute' ? 'dispute' : e.category === 'cash_app' ? 'cash_app' : 'compliance', 'governance'], ctx)
  }, [activeEmail, rules, sopRegistry])

  // Regex parser simulating LLM entity extraction
  const runNLPExtractor = (body, sender, subject) => {
    // 1. Extract Invoice ID
    const invMatches = body.match(/INV-\d+/g) || subject.match(/INV-\d+/g)
    const invoice = invMatches ? (invMatches.length > 1 ? invMatches : invMatches[0]) : 'INV-88912'

    // 2. Extract Dollar Amounts
    const amtMatch = body.match(/\$\d+(?:,\d+)*(?:\.\d+)?/)
    const claimedAmount = amtMatch ? parseFloat(amtMatch[0].replace('$', '').replace(/,/g, '')) : 0.0

    // 3. Classify Category and Intent
    let category = 'dispute'
    let reason = 'Pricing Discrepancy'
    let code = 'CL-901'

    if (body.toLowerCase().includes('remittance') || body.toLowerCase().includes('payment') || body.toLowerCase().includes('paid')) {
      category = 'cash_app'
      reason = 'Payment Remittance'
      code = 'ACH-' + Math.floor(100000 + Math.random() * 900000)
    } else if (body.toLowerCase().includes('format') || body.toLowerCase().includes('reject') || body.toLowerCase().includes('xml') || body.toLowerCase().includes('ksef')) {
      category = 'compliance'
      reason = 'Validation Failure'
      code = 'XML-Err'
    } else if (body.toLowerCase().includes('short') || body.toLowerCase().includes('damaged') || body.toLowerCase().includes('boxes')) {
      reason = 'Shortage / Damage'
      code = 'CL-502'
    }

    // Rule-based confidence: entity extraction quality matrix
    const hasInvoice = Array.isArray(invoice) ? invoice.length > 0 : !!invoice
    const hasAmount = claimedAmount > 0
    const hasReason = reason !== 'Pricing Discrepancy' || body.toLowerCase().includes('short') || body.toLowerCase().includes('damage')
    const hasCode = code && code !== 'CL-901'
    const hasSignal = body.length > 30 && (body.toLowerCase().includes('invoice') || body.toLowerCase().includes('payment'))
    const extractQuality = [hasInvoice, hasAmount, hasReason, hasCode, hasSignal].filter(Boolean).length
    const confidence = Math.min(99, 50 + extractQuality * 10 + (hasAmount && hasInvoice ? 5 : 0))

    const reasoning = `NLP parser identified ${category.toUpperCase()} intent with ${confidence}% confidence. Extracted targets: ${Array.isArray(invoice) ? invoice.join(', ') : invoice} and values: $${claimedAmount.toLocaleString()}.`

    return { invoice, claimedAmount, reason, code, category, confidence, reasoning }
  }

  // Handle Injecting Custom Email
  const handleInject = () => {
    const parsed = runNLPExtractor(customBody, customSender, customSubject)
    const newEmail = {
      id: 'em-' + Date.now(),
      sender: customSender,
      subject: customSubject,
      date: 'Just now',
      body: customBody,
      status: 'pending',
      category: parsed.category,
      entities: {
        invoice: parsed.invoice,
        claimedAmount: parsed.claimedAmount,
        reason: parsed.reason,
        code: parsed.code
      },
      confidence: parsed.confidence,
      reasoning: parsed.reasoning
    }

    setEmails(prev => [newEmail, ...prev])
    setSelectedId(newEmail.id)
    setShowInjector(false)
    addLog('compliance', `Simulated email ingestion from ${customSender} parsed successfully.`, 'success')
  }

  const handleAction = (id, newStatus) => {
    setIsProcessing(true)
    const actionEmail = emails.find(e => e.id === id) || activeEmail
    
    setTimeout(() => {
      setEmails(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
      
      addDecisionLog({
        agentId: 'AutonomousInbox',
        input: { sender: actionEmail.sender, subject: actionEmail.subject, category: actionEmail.category, entities: actionEmail.entities },
        decision: { action: newStatus === 'processed' ? 'approve' : 'reject', confidence: actionEmail.confidence, sopRefs: matchedRules.map(r => r.id) },
        outcome: newStatus === 'processed' ? 'ERP synced' : 'Flagged for GPO audit',
        category: actionEmail.category
      })

      // Update ERP system ledger records dynamically in Mock Context
      if (newStatus === 'processed') {
        if (actionEmail.category === 'cash_app') {
          applyRemittance(actionEmail.entities.invoice, actionEmail.entities.claimedAmount, actionEmail.entities.code)
        } else if (actionEmail.category === 'dispute') {
          resolveDisputeAction(actionEmail.entities.invoice, 'approved')
        }
      }
      
      setIsProcessing(false)
    }, 1200)
  }

  const getERPRecordDetails = () => {
    const targetInv = Array.isArray(activeEmail.entities.invoice) 
      ? activeEmail.entities.invoice[0] 
      : activeEmail.entities.invoice
    
    return invoices.find(inv => inv.id === targetInv)
  }

  const erpRecord = getERPRecordDetails()

  // Apply GPO rules + rule engine to action decisions
  const getActionRecommendation = () => {
    const topMatch = matchedRules[0]
    const topSop = topMatch ? topMatch.id : null

    if (activeEmail.category === 'compliance' && rules.requireEInvoice) {
      return {
        action: 'reject_compliance',
        text: 'Reject & Auto-Notify Billing Hub',
        desc: topMatch ? topMatch.description : 're-routing billing payload to corrected API endpoint.',
        sopRef: topSop || 'SOP-005-R1'
      }
    }

    if (activeEmail.category === 'dispute') {
      const isBelowThreshold = activeEmail.entities.claimedAmount <= rules.autoApproveThreshold
      
      if (isBelowThreshold && topMatch?.action === 'auto_approve') {
        return {
          action: 'approve',
          text: 'Auto-Approve Adjustment',
          desc: `${topMatch.description} (GPO limit: $${rules.autoApproveThreshold.toLocaleString()})`,
          sopRef: topSop || 'SOP-001-R1'
        }
      } else {
        return {
          action: 'flag',
          text: 'Flag for Manual GPO Sign-off',
          desc: topMatch ? topMatch.description : `exceeds active threshold of $${rules.autoApproveThreshold.toLocaleString()}. SOX check required.`,
          sopRef: topSop || 'SOP-001-R2'
        }
      }
    }

    return {
      action: 'approve',
      text: 'Match & Clear Outstanding AR',
      desc: topMatch ? topMatch.description : 'Remittance details align. Ready to post receipts.',
      sopRef: topSop || 'SOP-002-R1'
    }
  }

  const recommendation = getActionRecommendation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '600px' }}>
      
      {/* Header and Injector Toggle */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Autonomous Email Agent</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ingests customer invoices, credit applications, and remittance advices dynamically.</span>
        </div>
        <button className="btn-secondary" onClick={() => setShowInjector(!showInjector)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
          <PlusCircle size={12} /> Test with Custom Email
        </button>
      </div>

      {/* Simulator Injector Form Panel */}
      {showInjector && (
        <div className="glass-card" style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--accent-purple)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--accent-purple)' }}>Scenario Injector Panel</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Sender Email</label>
              <input 
                type="text" 
                value={customSender} 
                onChange={(e) => setCustomSender(e.target.value)} 
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Subject Line</label>
              <input 
                type="text" 
                value={customSubject} 
                onChange={(e) => setCustomSubject(e.target.value)} 
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Email Body</label>
            <textarea 
              rows="3" 
              value={customBody} 
              onChange={(e) => setCustomBody(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowInjector(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleInject}>
              Parse & Ingest <Send size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Split List and Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', flex: 1 }}>
        
        {/* Email List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Live Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
            {emails.map(email => (
              <div 
                key={email.id}
                onClick={() => setSelectedId(email.id)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: selectedId === email.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: `1px solid ${selectedId === email.id ? 'var(--border-color)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                  <span>{email.sender}</span>
                  <span>{email.date}</span>
                </div>
                <h4 style={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', marginBottom: '0.3rem' }}>{email.subject}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`metric-badge ${
                    email.category === 'dispute' ? 'badge-error' : 
                    email.category === 'cash_app' ? 'badge-purple' : 'badge-warning'
                  }`}>
                    {email.category.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: email.status === 'processed' ? 'var(--success)' : 'var(--accent-cyan)' }}>
                    {email.status === 'processed' ? 'Synced' : 'Action Required'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Details & Processing Frame */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{activeEmail.subject}</h3>
              <span className="metric-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} /> {activeEmail.confidence}% Confidence
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From: <strong>{activeEmail.sender}</strong></span>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-line'
          }}>
            {activeEmail.body}
          </div>

          {/* NLP Parsing Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                <Database size={12} /> Extracted Parameters
              </h4>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Target:</span> {Array.isArray(activeEmail.entities.invoice) ? activeEmail.entities.invoice.join(', ') : activeEmail.entities.invoice}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> ${activeEmail.entities.claimedAmount.toLocaleString()}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Intent:</span> {activeEmail.entities.reason}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Ref ID:</span> {activeEmail.entities.code}</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                <Eye size={12} /> NLP Engine Reasoning
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {activeEmail.reasoning}
              </p>
            </div>

          </div>

          {/* Database matching & validation indicators */}
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.8rem'
          }}>
            {erpRecord ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ERP Invoice status: <strong style={{ color: erpRecord.status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>{erpRecord.status.toUpperCase()}</strong></span>
                <span>Ledger Outstanding Balance: <strong>${erpRecord.balance.toLocaleString()}</strong></span>
              </div>
            ) : (
              <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={14} /> ERP matching error: Target record not found in system logs.
              </span>
            )}
          </div>

          {/* Decision Workflow Actions */}
          <div style={{ marginTop: 'auto' }}>
            {activeEmail.status === 'processed' ? (
              <div style={{
                backgroundColor: 'var(--success-glow)',
                color: 'var(--success)',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}>
                Action Sync Complete. Updates pushed to SAP database tables.
              </div>
            ) : activeEmail.status === 'rejected' ? (
              <div style={{
                backgroundColor: 'var(--error-glow)',
                color: 'var(--error)',
                border: '1px solid var(--error)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}>
                Flagged for GPO Audit. Blocked from posting to transactional ledger.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {/* Agent recommendations box */}
                <div style={{
                  backgroundColor: recommendation.action === 'flag' ? 'var(--warning-glow)' : 'var(--accent-purple-glow)',
                  borderLeft: `3px solid ${recommendation.action === 'flag' ? 'var(--warning)' : 'var(--accent-purple)'}`,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.25rem'
                }}>
                  <Sparkles size={12} style={{ color: 'var(--accent-purple)' }} />
                  <span>Agent Action Proposal: <strong>{recommendation.text}</strong> ({recommendation.desc})</span>
                  <div style={{ fontSize: '0.6rem', display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                    {matchedRules.map(r => (
                      <span key={r.id} className="metric-badge badge-purple" style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem' }}>
                        {r.id}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn-primary"
                    disabled={isProcessing}
                    onClick={() => handleAction(activeEmail.id, 'processed')}
                    style={{
                      flex: 1,
                      background: recommendation.action === 'flag' ? 'var(--warning)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple))',
                      boxShadow: recommendation.action === 'flag' ? 'none' : '0 4px 12px rgba(107, 92, 231, 0.2)'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} /> Syncing ERP...
                      </>
                    ) : (
                      <>
                        Confirm Agent Proposal <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-secondary"
                    disabled={isProcessing}
                    onClick={() => handleAction(activeEmail.id, 'rejected')}
                  >
                    Flag/Reject Action
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
