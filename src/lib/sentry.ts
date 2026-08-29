/**
 * Sentry Error Monitoring Configuration
 *
 * Provides centralized error tracking and performance monitoring for the application.
 * Integrates with React error boundaries to capture and report errors.
 */

import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import { env } from './env'
import { isAppError } from './errors'

/**
 * Initialize Sentry for error tracking and performance monitoring
 *
 * Call this once at application startup in main.tsx
 */
export function initSentry() {
  // Only initialize Sentry in production or when explicitly enabled
  const shouldInitialize = import.meta.env.PROD || env.ENABLE_SENTRY

  if (!shouldInitialize) {
    if (import.meta.env.DEV) {
      console.log('[Sentry] Skipping initialization (not in production)')
    }
    return
  }

  const dsn = env.SENTRY_DSN

  if (!dsn) {
    // Warn only in dev; in prod a missing DSN means the operator didn't
    // configure Sentry, so we silently no-op (matches previous behavior).
    if (import.meta.env.DEV) {
      console.warn('[Sentry] No DSN provided. Set VITE_SENTRY_DSN in .env')
    }
    return
  }

  Sentry.init({
    dsn,

    // Environment configuration
    environment: import.meta.env.MODE || 'development',

    // Release tracking (useful for identifying which version has issues)
    release: env.APP_VERSION,

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration({
        // Track navigation and route changes
        enableInp: true,
      }),

      // Replay integration for session recordings (optional)
      Sentry.replayIntegration({
        // Privacy settings
        maskAllText: true,
        blockAllMedia: true,
      }),

      // React integration for component tree info
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation: () => window.location,
        useNavigationType: () => 'PUSH',
        createRoutesFromChildren: () => [],
        matchRoutes: () => null,
      }),
    ],

    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev

    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (import.meta.env.DEV && !env.ENABLE_SENTRY) {
        return null
      }

      // Filter out known non-critical errors
      const error = hint.originalException

      if (error instanceof Error) {
        // Ignore network errors (user's connection issues)
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          return null
        }

        // Ignore browser extension errors
        if (
          error.message.includes('chrome-extension://') ||
          error.message.includes('moz-extension://')
        ) {
          return null
        }

        // Attach the typed error code as a tag for Sentry searchability
        if (isAppError(error)) {
          event.tags = { ...event.tags, error_code: error.code }
        }
      }

      return event
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension',
      'moz-extension',

      // Network errors (user's internet connection)
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // ResizeObserver errors (harmless browser quirk)
      'ResizeObserver loop limit exceeded',

      // Safari-specific errors
      'The operation is insecure',
      'SecurityError',
    ],

    // Additional context
    initialScope: {
      tags: {
        app: 'habitflow',
      },
    },
  })

  if (import.meta.env.DEV) {
    console.log('[Sentry] Initialized successfully')
  }
}

/**
 * Capture an error manually
 *
 * Use this for caught errors that you still want to track
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('error_context', context)
  }
  if (isAppError(error)) {
    Sentry.setTag('error_code', error.code)
  }
  Sentry.captureException(error)
}

/**
 * Capture a message (non-error event)
 *
 * Use this for important events or warnings
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * Set user context
 *
 * Call this when user logs in to associate errors with specific users
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

/**
 * Clear user context
 *
 * Call this when user logs out
 */
export function clearUser() {
  Sentry.setUser(null)
}

/**
 * Add breadcrumb (trail of events leading to error)
 *
 * Use this to track important user actions
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'user-action',
    level: 'info',
    data,
  })
}

/**
 * Start a performance transaction
 *
 * Use this to measure the performance of critical operations
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    (span) => span
  )
}

// Re-export Sentry for advanced usage
export { Sentry }
