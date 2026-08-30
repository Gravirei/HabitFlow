/**
 * TimerErrorBoundary Component
 *
 * Catches React errors in the timer section and provides a fallback UI.
 * Prevents the entire app from crashing when timer components error.
 *
 * Features:
 * - Catches errors in timer components
 * - Shows user-friendly error message
 * - Provides recovery options (reload, reset)
 * - Logs errors for debugging
 * - Optional error reporting integration
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class TimerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Timer Error Boundary caught an error:', error, errorInfo)

    // Store error info in state
    this.setState({
      errorInfo,
    })

    // Send to Sentry for error tracking
    captureError(error, {
      component: 'TimerErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    // Call optional error callback (for additional handling)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = (): void => {
    // Clear any corrupted timer state
    try {
      localStorage.removeItem('flowmodoro_timer_state')
      localStorage.removeItem('flowmodoro_active_timer')
      console.log('[TimerErrorBoundary] Cleared timer state')
    } catch (e) {
      console.error('[TimerErrorBoundary] Failed to clear state:', e)
    }

    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
          <div className="w-full max-w-md space-y-6 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-5xl">⚠️</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Something Went Wrong</h2>
              <p className="text-sm text-gray-400">The timer encountered an unexpected error</p>
            </div>

            {/* Error details (collapsed) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="rounded-xl bg-black/30 p-4 text-xs">
                <summary className="mb-2 cursor-pointer font-semibold text-red-400">
                  Error Details (Development)
                </summary>
                <div className="space-y-2 text-gray-300">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 overflow-x-auto">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Recovery options */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl"
              >
                🔄 Reset Timer
              </button>

              <button
                onClick={this.handleReload}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-semibold text-white transition-all hover:bg-white/20"
              >
                ↻ Reload Page
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full rounded-xl bg-white/5 px-4 py-3 font-semibold text-gray-300 transition-all hover:bg-white/10"
              >
                ← Go to Home
              </button>
            </div>

            {/* Help text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                If this problem persists, try clearing your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

/**
 * Hook version for functional component usage
 * (Note: Error boundaries must be class components)
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
