import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './tailwind.css'
import './styles.css'
import './simulators'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)

// global error hooks to avoid silent runtime failures
window.addEventListener('error', (ev) => {
  console.error('Global error', ev.error || ev.message, ev)
})
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection', ev.reason)
})
