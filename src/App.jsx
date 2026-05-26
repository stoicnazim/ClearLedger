import React, { useState } from 'react'
import ClearLedgerWebsite from './clearledger-website-v3'
import ClearLedgerDiagnostic from './clearledger-diagnostic'
import LegalPages from './clearledger-legal'

export default function App() {
  const [page, setPage] = useState('website')
  const [legalTab, setLegalTab] = useState('privacy')

  if (page === 'diagnostic') {
    return <ClearLedgerDiagnostic onClose={() => setPage('website')} />
  }

  if (page === 'legal') {
    return <LegalPages onClose={() => setPage('website')} initialTab={legalTab} />
  }

  return (
    <ClearLedgerWebsite
      onStartDiagnostic={() => setPage('diagnostic')}
      onShowLegal={(tab) => { setLegalTab(tab || 'privacy'); setPage('legal') }}
    />
  )
}
