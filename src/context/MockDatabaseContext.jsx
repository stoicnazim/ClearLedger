import React, { createContext, useContext, useState, useEffect } from 'react'
import { seedDatabase, selectors, SKU_CATALOG, SOP_REGISTRY } from '../seedDatabase'

const MockDatabaseContext = createContext()

const INITIAL_LOGS = [
  { id: 101, time: '10 mins ago', type: 'compliance', msg: 'Sanctions check completed on customer onboarding request for Global Logistics Corp. Clear.', status: 'success' },
  { id: 102, time: '1 hour ago', type: 'credit', msg: 'Automatic annual review executed on Acme Corp. Credit rating held at A- (Stable).', status: 'success' }
]

export function MockDatabaseProvider({ children }) {
  // Initialize full 865-record seeded database
  const [dbSeed] = useState(() => seedDatabase(42))
  
  const [invoices, setInvoices] = useState(dbSeed.invoices)
  const [disputes, setDisputes] = useState(dbSeed.disputes)
  const [customers, setCustomers] = useState(dbSeed.customers)
  const [cashApplications, setCashApplications] = useState(dbSeed.cashApplications)
  const [collectionActivities] = useState(dbSeed.collectionActivities)
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [decisionLog, setDecisionLog] = useState([])
  const [gpoRules, setGpoRules] = useState({
    autoApproveThreshold: 1000,
    requireEInvoice: true,
    syncTiming: 'realtime',
    dunningEscalation: 7
  })

  const addDecisionLog = (entry) => {
    setDecisionLog(prev => [{
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    }, ...prev.slice(0, 499)])
  }

  // Global KPIs calculated dynamically
  const [financials, setFinancials] = useState({
    dso: 38.5,
    autoMatch: 68.0,
    ccc: 52.0,
    resolvedRate: 88.4,
    revenueLeakage: 3.2
  })

  // Recalculate metrics dynamically based on selectors
  const recalculateMetrics = () => {
    const dbState = { invoices, disputes, cashApplications, customers }
    setFinancials({
      dso: selectors.dso(dbState),
      autoMatch: selectors.autoMatchRate(dbState),
      ccc: selectors.ccc(dbState),
      resolvedRate: selectors.disputeResolutionRate(dbState),
      revenueLeakage: selectors.revenueLeakage(dbState)
    })
  }

  useEffect(() => {
    recalculateMetrics()
  }, [invoices, disputes, cashApplications])

  // Log new agent activity
  const addLog = (type, msg, status = 'success') => {
    setLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        type,
        msg,
        status
      },
      ...prev.slice(0, 8) // Limit to last 9 entries
    ])
  }

  // Resolve disputes dynamically
  const resolveDisputeAction = (disputeId, action) => {
    setDisputes(prev => prev.map(disp => {
      if (disp.id !== disputeId) return disp

      const claimVal = disp.claimAmount || 0

      // Update linked invoice status in ERP if approved
      if (action === 'approved') {
        setInvoices(invs => invs.map(inv => {
          const invIdTarget = disp.invoiceId || disp.invoice
          if (inv.id === invIdTarget) {
            const newBalance = Math.max(0, inv.balance - claimVal)
            return {
              ...inv,
              balance: newBalance,
              status: newBalance === 0 ? 'paid' : 'unpaid'
            }
          }
          return inv
        }))
        addLog('dispute', `Dispute resolved for ${disp.customer || disp.customerId}. Credit Memo of $${claimVal.toLocaleString()} posted to invoice ${disp.invoiceId || disp.invoice}.`, 'success')
      } else {
        addLog('dispute', `Claim disputed for ${disp.customer || disp.customerId}. Counter-dispute packages generated.`, 'alert')
      }

      return { ...disp, status: action }
    }))
  }

  // Handle cash matching (remittances) dynamically
  const applyRemittance = (invoiceIds, amount, refCode) => {
    const list = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds]
    
    // Add to cash applications to dynamically update autoMatch rate
    setCashApplications(prev => [
      {
        id: `CA-${Date.now()}`,
        invoiceId: list[0],
        amountReceived: amount,
        remittanceRef: refCode,
        receivedDate: new Date().toISOString().slice(0, 10),
        matchStatus: 'auto_matched',
        matchConfidence: 100,
        appliedBy: 'CASHAPP-001'
      },
      ...prev
    ])

    setInvoices(prev => prev.map(inv => {
      if (list.includes(inv.id)) {
        addLog('cash_app', `Payment of $${inv.balance.toLocaleString()} applied to invoice ${inv.id} under reference ${refCode}.`, 'success')
        return { ...inv, balance: 0, status: 'paid' }
      }
      return inv
    }))
  }

  // Derived selectors matching the useLiveActuals API definitions
  const derived = {
    totalAR: () => selectors.totalAR({ invoices, disputes, cashApplications, customers }),
    agingBuckets: () => selectors.agingBuckets({ invoices, disputes, cashApplications, customers }),
    dso: () => selectors.dso({ invoices, disputes, cashApplications, customers }),
    autoMatchRate: () => selectors.autoMatchRate({ invoices, disputes, cashApplications, customers }),
    disputeResolutionRate: () => selectors.disputeResolutionRate({ invoices, disputes, cashApplications, customers }),
    revenueLeakage: () => selectors.revenueLeakage({ invoices, disputes, cashApplications, customers }),
    ddo: () => selectors.ddo({ invoices, disputes, cashApplications, customers }),
    ccc: () => selectors.ccc({ invoices, disputes, cashApplications, customers })
  }

  return (
    <MockDatabaseContext.Provider value={{
      invoices,
      disputes,
      customers,
      financials,
      logs,
      derived,
      contractCatalog: SKU_CATALOG,
      sopRegistry: SOP_REGISTRY,
      gpoRules,
      setGpoRules,
      resolveDisputeAction,
      applyRemittance,
      addLog,
      addDecisionLog,
      decisionLog,
      setDisputes,
      setInvoices
    }}>
      {children}
    </MockDatabaseContext.Provider>
  )
}

export function useMockDatabase() {
  return useContext(MockDatabaseContext)
}
