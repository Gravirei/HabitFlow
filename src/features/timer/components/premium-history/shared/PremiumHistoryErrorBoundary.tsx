/**
 * Premium History Error Boundary
 * Catches and handles errors in Premium History features gracefully
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { logError, ErrorCategory, ErrorSeverity } from '@/features/timer/utils/errorMessages'

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
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with context
    const featureName = this.props.featureName || 'PremiumHistory'
    logError(error, `${featureName}.ErrorBoundary`, { errorInfo }, ErrorCategory.VALIDATION, ErrorSeverity.HIGH)

    console.error(`[${featureName}] Error caught by boundary:`, error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
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
        <div className="flex min-h-[300px] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-surface-dark">
            {/* Error Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <span
                  className="material-symbols-outlined text-red-500 dark:text-red-400"
                  style={{ fontSize: '32px' }}
                >
                  error
                </span>
              </div>
            </div>

            {/* Error Message */}
            <h3 className="mb-2 text-center text-lg font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h3>
            <p className="mb-6 text-center text-sm text-slate-600 dark:text-gray-400">
              {this.props.featureName || 'This feature'} encountered an error. Your data is safe.
            </p>

            {/* Error Details (Dev Mode) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-black/20">
                <p className="break-words font-mono text-xs text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="hover:from-primary-dark flex-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 py-3 text-sm font-bold text-white transition-all hover:to-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
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
