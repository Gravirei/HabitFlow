import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from '@/lib/auth/AuthContext'
import './index.css'
import { initSentry, captureError } from './lib/sentry'
import { isAppError } from './lib/errors'

// Initialize Sentry error monitoring
initSentry()

// Global handlers for uncaught errors that escape React's ErrorBoundary.
// `unhandledrejection` covers promise rejections; `error` covers sync throws
// outside React. Both forward to Sentry with the typed error code when
// available so failures are searchable in the Sentry UI.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const err = reason instanceof Error ? reason : new Error(String(reason))
    captureError(err, { source: 'unhandledrejection' })
    if (isAppError(err)) {
      // eslint-disable-next-line no-console
      console.error(`[unhandledrejection] ${err.name} (${err.code}): ${err.message}`, err.meta)
    } else {
      // eslint-disable-next-line no-console
      console.error('[unhandledrejection]', err)
    }
  })

  window.addEventListener('error', (event) => {
    // Only forward errors that have an actual Error object; ignore resource
    // load errors which are noisy and not actionable.
    if (event.error instanceof Error) {
      captureError(event.error, { source: 'window.error', filename: event.filename })
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
