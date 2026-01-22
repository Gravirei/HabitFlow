/**
 * Premium History Error Boundary
 * Catches and handles errors in Premium History features gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logError, ErrorCategory, ErrorSeverity } from '../../utils/errorMessages'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  featureName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary for Premium History features
 * Prevents entire page crashes when a feature fails
 */
export class PremiumHistoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with context
    const featureName = this.props.featureName || 'PremiumHistory'
    logError(
      error,
      `${featureName}.ErrorBoundary`,
      ErrorSeverity.HIGH,
      ErrorCategory.RENDERING,
      { errorInfo }
    )

    console.error(`[${featureName}] Error caught by boundary:`, error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[300px] p-8">
          <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-white/10">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="size-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 dark:text-red-400" style={{ fontSize: '32px' }}>
                  error
                </span>
              </div>
            </div>

            {/* Error Message */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-400 text-center mb-6">
              {this.props.featureName || 'This feature'} encountered an error. Your data is safe.
            </p>

            {/* Error Details (Dev Mode) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-black/20 rounded-lg">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
