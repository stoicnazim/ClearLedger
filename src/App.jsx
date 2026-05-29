import React, { useState, useEffect, Component, lazy, Suspense } from 'react'
import { LayoutDashboard, FileCheck, Mail, FileWarning, Settings, Sun, Moon, Shield, Sliders, RefreshCw, AlertCircle, BookOpen, Search, Star, Store } from 'lucide-react'

import Dashboard from './components/Dashboard'
import DiagnosticIntake from './components/DiagnosticIntake'
import AutonomousInbox from './components/AutonomousInbox'
import DisputeResolver from './components/DisputeResolver'
import Shop from './Shop'
import { useMockDatabase } from './context/MockDatabaseContext'

// Syncs App's simulationRules state into MockDatabaseContext gpoRules
function GpoSync({ rules }) {
  const { setGpoRules } = useMockDatabase()
  useEffect(() => { setGpoRules(rules) }, [rules, setGpoRules])
  return null
}

const ADVISORY_COMPONENTS = {
  'AR KPI Dashboard': lazy(() => import('./AR-KPI-Dashboard')),
  'AR Maturity Assessment': lazy(() => import('./AR-maturity-assessment-v2')),
  'Billing & Invoicing': lazy(() => import('./billing-invoicing-process-pack')),
  'BPO Managed Services': lazy(() => import('./BPO-managed-services')),
  'Cash Application': lazy(() => import('./Cash-application-process-pack')),
  'Collections Strategy': lazy(() => import('./Collections-strategy-segmentation-model')),
  'Credit Management': lazy(() => import('./credit-management-process-pack')),
  'Customer Onboarding': lazy(() => import('./Customer-onboarding')),
  'Diagnostic Assessment': lazy(() => import('./Diagnostic-assessment')),
  'Dispute Resolution': lazy(() => import('./dispute-resolution-process-pack')),
  'E-Invoicing': lazy(() => import('./e-invoicing-compliance-readiness-tracker')),
  'OTC Business Case': lazy(() => import('./otc-3.5-business-case-builder')),
  'OTC KPI Spec v2': lazy(() => import('./OtC-KPI-SPEC-v2')),
  'Process Mining': lazy(() => import('./process-mining-playbook')),
  'SOX Compliance': lazy(() => import('./sox-compliance-controls-library')),
  'SSC Transition': lazy(() => import('./ssc-transition-guide')),
  'Technology Selection': lazy(() => import('./Technology-selection-guide')),
  'Treasury & Working Capital': lazy(() => import('./Treasury-working-capital')),
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'var(--error)', background: 'var(--error-glow)', borderRadius: '8px', border: '1px solid var(--error)', marginTop: '20px' }}>
          <h4>Component Render Failed</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>This advisory package could not be displayed due to an internal React exception.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const ADVISORY_CATEGORIES = [
  { name: 'Assessment & Strategy', items: ['AR KPI Dashboard', 'AR Maturity Assessment', 'Diagnostic Assessment', 'OTC Business Case'] },
  { name: 'Process Packs', items: ['Cash Application', 'Collections Strategy', 'Credit Management', 'Dispute Resolution', 'Billing & Invoicing', 'Customer Onboarding'] },
  { name: 'Compliance & Risk', items: ['SOX Compliance', 'E-Invoicing', 'OTC KPI Spec v2'] },
  { name: 'Operations & Transition', items: ['BPO Managed Services', 'SSC Transition', 'Process Mining'] },
  { name: 'Strategy & Planning', items: ['Technology Selection', 'Treasury & Working Capital'] },
]

export default function App({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard')
  const [theme, setTheme] = useState('dark')
  const [activeTier, setActiveTier] = useState('enterprise')

  const [selectedAdvisory, setSelectedAdvisory] = useState('AR KPI Dashboard')
  const [advisorySearch, setAdvisorySearch] = useState('')
  const [favorites, setFavorites] = useState([])
  const [expandedCategories, setExpandedCategories] = useState(() =>
    Object.fromEntries(ADVISORY_CATEGORIES.map(c => [c.name, true]))
  )

  // GPO control panel simulation rules
  const [simulationRules, setSimulationRules] = useState({
    autoApproveThreshold: 1000,
    requireEInvoice: true,
    syncTiming: 'realtime',
    dunningEscalation: 7
  })

  // Theme synchronization hook
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleRuleChange = (key, value) => {
    setSimulationRules(prev => ({ ...prev, [key]: value }))
  }

  const toggleFavorite = (name) => {
    setFavorites(f => f.includes(name) ? f.filter(x => x !== name) : [...f, name])
  }

  const filterMatches = (name) =>
    name.toLowerCase().includes(advisorySearch.toLowerCase())

  const categorizedItems = ADVISORY_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(name => filterMatches(name) || favorites.includes(name)),
    hasActive: cat.items.includes(selectedAdvisory)
  }))

  const hasSearch = advisorySearch.trim().length > 0

  const ActiveAdvisoryComponent = ADVISORY_COMPONENTS[selectedAdvisory]

  return (
    <div className="app-container">
      
      {/* Premium gradient accent bar */}
      <div className="accent-bar" />

      {/* Top Header Navbar */}
      <header className="navbar">
        <div className="brand-section">
          <div className="brand-logo">CL</div>
          <div>
            <h1 className="brand-name">ClearLedger</h1>
            <span className="brand-subtitle">Autonomous OtC Platform</span>
          </div>
        </div>

        <nav className="nav-links">
          {[
            { key: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Command Center' },
            { key: 'diagnostic', icon: <FileCheck size={16} />, label: 'Diagnostic & Maturity' },
            { key: 'inbox', icon: <Mail size={16} />, label: 'Autonomous Inbox' },
            { key: 'disputes', icon: <FileWarning size={16} />, label: 'Dispute Resolver' },
            { key: 'advisory', icon: <BookOpen size={16} />, label: 'Advisory Library' },
            { key: 'shop', icon: <Store size={16} />, label: 'Shop' },
            { key: 'settings', icon: <Settings size={16} />, label: 'Control Panel' },
          ].map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="tier-badge">
            <Shield size={12} style={{ color: 'var(--accent-purple)' }} />
            <span>{activeTier} Scale</span>
            <span className="preview-badge">Preview</span>
          </div>

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="main-content">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            activeTier={activeTier} 
            onNavigate={setActiveTab}
            simulationRules={simulationRules}
          />
        )}
        
        {activeTab === 'diagnostic' && (
          <DiagnosticIntake 
            activeTier={activeTier} 
            onTierChange={setActiveTier}
            onNavigate={(tabName) => {
              // Direct navigation hooks from diagnostic wins to advisory components
              if (tabName === 'inbox' || tabName === 'disputes') {
                setActiveTab(tabName)
              } else {
                setSelectedAdvisory(tabName)
                setActiveTab('advisory')
              }
            }}
          />
        )}
        
        {activeTab === 'inbox' && (
          <AutonomousInbox 
            activeTier={activeTier} 
            simulationRules={simulationRules}
          />
        )}
        
        {activeTab === 'disputes' && (
          <DisputeResolver simulationRules={simulationRules} />
        )}

        {/* GPO sync: pushes App-level simulationRules into MockDatabaseContext */}
        <GpoSync rules={simulationRules} />

        {/* Advisory Toolkit Workspace */}
        {activeTab === 'advisory' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', minHeight: '650px' }}>
            
            {/* Sidebar List */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <BookOpen size={16} style={{ color: 'var(--accent-purple)' }} /> Advisory Packages
                </h3>
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    value={advisorySearch}
                    onChange={(e) => setAdvisorySearch(e.target.value)}
                    placeholder="Search frameworks..."
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem 0.4rem 2rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flex: 1, maxHeight: '520px' }}>
                {categorizedItems.map(cat => {
                  const catExpanded = expandedCategories[cat.name]
                  const showCat = cat.items.length > 0
                  if (!showCat) return null
                  return (
                    <div key={cat.name}>
                      <div
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.name]: !prev[cat.name] }))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.35rem 0.5rem', marginTop: '0.25rem',
                          cursor: 'pointer', fontSize: '0.65rem', fontWeight: '700',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          color: cat.hasActive ? 'var(--accent-purple)' : 'var(--text-muted)',
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <span>{cat.name}</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{catExpanded ? '−' : '+'}</span>
                      </div>
                      {catExpanded && cat.items.map(name => (
                        <div 
                          key={name}
                          onClick={() => setSelectedAdvisory(name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.5rem 0.4rem 0.75rem',
                            borderRadius: '4px',
                            marginLeft: '0.25rem',
                            backgroundColor: selectedAdvisory === name ? 'var(--accent-purple-glow)' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            color: selectedAdvisory === name ? 'var(--accent-purple)' : 'var(--text-secondary)',
                            fontWeight: selectedAdvisory === name ? '600' : 'normal',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <span>{name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(name) }}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: favorites.includes(name) ? 'var(--warning)' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', padding: '2px'
                            }}
                          >
                            <Star size={10} fill={favorites.includes(name) ? 'var(--warning)' : 'none'} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Component Render Pane */}
            <div className="glass-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              overflowY: 'auto',
              maxHeight: '650px',
              padding: 0,
              gap: 0
            }}>
              <div style={{ 
                borderBottom: '1px solid var(--border-subtle)', 
                padding: '1rem 1.5rem',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: '14px 14px 0 0'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>{selectedAdvisory}</h3>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>REFERENCE MODEL</span>
              </div>
              
              <div style={{ flex: 1, padding: '1.5rem' }}>
                <ErrorBoundary key={selectedAdvisory}>
                  <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading advisory package...</div>}>
                    <ActiveAdvisoryComponent />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

          </div>
        )}

        {/* Shop / Template Marketplace */}
        {activeTab === 'shop' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Shop onNavigate={setActiveTab} />
          </div>
        )}

        {/* Settings view */}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} style={{ color: 'var(--accent-purple)' }} /> Global Agentic Rule Controls (GPO Deck)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Define regulatory parameters, dollar thresholds, and orchestration timers for active AI agents.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Auto-Approval Limit (Disputes & Deductions)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                      ${simulationRules.autoApproveThreshold.toLocaleString()}
                    </span>
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Disputes with high matching confidence score below this amount will auto-post credit notes directly to ERP.
                  </p>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    value={simulationRules.autoApproveThreshold} 
                    onChange={(e) => handleRuleChange('autoApproveThreshold', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: 'var(--accent-purple)',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    ERP Synchronization Timing
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Timing cycle for pushing agent decisions and matches to the backend ERP database systems.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['realtime', 'batch_daily', 'batch_weekly'].map(timing => (
                      <button 
                        key={timing}
                        onClick={() => handleRuleChange('syncTiming', timing)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: simulationRules.syncTiming === timing ? 'var(--accent-purple-glow)' : 'var(--bg-tertiary)',
                          color: simulationRules.syncTiming === timing ? 'var(--accent-purple)' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {timing.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Enforce E-Invoicing Compliance XML Validation</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Rejects out-of-format invoices matching SDI, Poland KSeF, or Peppol requirements before emailing customer.
                    </p>
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={simulationRules.requireEInvoice}
                      onChange={(e) => handleRuleChange('requireEInvoice', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }} 
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: simulationRules.requireEInvoice ? 'var(--accent-cyan)' : '#ccc',
                      borderRadius: '34px', transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px',
                        backgroundColor: 'white', borderRadius: '50%', transition: '0.4s',
                        transform: simulationRules.requireEInvoice ? 'translateX(20px)' : 'none'
                      }}></span>
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Dunning Escalation Cadence</span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Every {simulationRules.dunningEscalation} Days
                    </span>
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Sets the frequency at which the agent drafts escalating payment reminders for delinquent balances.
                  </p>
                  <input 
                    type="range" 
                    min="3" 
                    max="30" 
                    step="1"
                    value={simulationRules.dunningEscalation} 
                    onChange={(e) => handleRuleChange('dunningEscalation', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: 'var(--accent-cyan)',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--accent-purple-glow)',
              color: 'var(--accent-purple)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--accent-purple)',
              fontSize: '0.85rem',
              marginTop: '1rem'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Global Governance Matrix active:</strong> Any changes made to these rules update the compliance threshold logic globally, adjusting SOX audit controls (OTC-17 Model Governance) in real-time.
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  )
}
