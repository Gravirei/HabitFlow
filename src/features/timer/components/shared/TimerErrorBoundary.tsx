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
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Timer Error Boundary caught an error:', error, errorInfo)

    // Store error info in state
    this.setState({
      errorInfo
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
      errorInfo: null
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl border border-red-500/30 p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-5xl">⚠️</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Something Went Wrong
              </h2>
              <p className="text-gray-400 text-sm">
                The timer encountered an unexpected error
              </p>
            </div>

            {/* Error details (collapsed) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="bg-black/30 rounded-xl p-4 text-xs">
                <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2 text-gray-300">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
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
                className="w-full py-3 px-4 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg hover:shadow-xl"
              >
                🔄 Reset Timer
              </button>

              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                ↻ Reload Page
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
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
