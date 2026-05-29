import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import { MockDatabaseProvider } from './context/MockDatabaseContext.jsx'
import './index.css'

function AppWrapper() {
  const [showApp, setShowApp] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [initialTab, setInitialTab] = useState('dashboard')

  const handleEnter = () => {
    setInitialTab('diagnostic')
    setTransitioning(true)
    setTimeout(() => setShowApp(true), 300)
  }

  return (
    <React.StrictMode>
      {showApp ? (
        <div className={transitioning ? '' : ''} style={{ animation: transitioning ? 'none' : 'fadeIn 0.3s ease' }}>
          <MockDatabaseProvider>
            <App initialTab={initialTab} />
          </MockDatabaseProvider>
        </div>
      ) : (
        <div style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.25s ease' }}>
          <LandingPage onEnter={handleEnter} />
        </div>
      )}
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppWrapper />
)
