import { Component, ErrorInfo, ReactNode } from 'react'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to Sentry for error tracking
    captureError(error, {
      component: 'GlobalErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-4">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">
              error
            </span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-black hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 px-6 py-3 font-medium text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 dark:bg-gray-800 p-3 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
