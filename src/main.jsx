import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { MockDatabaseProvider } from './context/MockDatabaseContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MockDatabaseProvider>
      <App />
    </MockDatabaseProvider>
  </React.StrictMode>
)
