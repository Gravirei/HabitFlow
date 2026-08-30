/**
 * Logger Utility
 *
 * Centralized logging with environment-aware output.
 *
 * Output routing:
 *   - DEV (non-PROD):   console.*  +  Sentry breadcrumb (if Sentry initialized)
 *   - PROD:             console.*  (always)  +  Sentry breadcrumb (always)
 *
 * Level filtering is opt-in via `setMinLevel()`. Default is `info`.
 *
 * Sensitive-key redaction is unchanged from the previous implementation —
 * password/token/secret/etc. are replaced with `'[REDACTED]'` before
 * being emitted anywhere.
 */
import { addBreadcrumb, captureError } from './sentry'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

interface LogOptions {
  context?: string
  data?: Record<string, unknown> | unknown
}

// Security: List of sensitive keys to redact
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'sessionId',
  'userId',
  'email',
  'creditCard',
]

function sanitizeData(data: unknown): unknown {
  if (data == null || typeof data !== 'object') return data
  if (Array.isArray(data)) return data.map((item) => sanitizeData(item))

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    )
    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/** Current minimum level. Messages below this are dropped. */
let minLevel: LogLevel = 'info'

/**
 * Set the minimum level emitted by the logger. Defaults to `'info'`,
 * which drops `debug` messages. Call once at app boot to change.
 */
export function setMinLevel(level: LogLevel): void {
  minLevel = level
}

export function getMinLevel(): LogLevel {
  return minLevel
}

function shouldEmit(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[minLevel]
}

class TimerLogger {
  private isDevelopment = import.meta.env.DEV
  private prefix = '[Timer]'

  /**
   * Prepares log data by sanitizing sensitive information
   */
  private prepareLogData(options?: LogOptions): unknown {
    if (!options?.data) return ''
    return sanitizeData(options.data)
  }

  private formatMessage(message: string, options?: LogOptions): string {
    const ctx = options?.context ? `[${options.context}]` : ''
    return `${this.prefix}${ctx} ${message}`
  }

  /**
   * Debug-level logging.
   * Use for detailed debugging information. Default-gated unless
   * `setMinLevel('debug')` is called.
   */
  debug(message: string, options?: LogOptions): void {
    if (!shouldEmit('debug')) return

    const formatted = this.formatMessage(message, options)
    const data = this.prepareLogData(options)

    // Console: only in dev (matches previous behavior — avoid prod noise)
    if (this.isDevelopment) {
      console.log(formatted, data)
    }
    addBreadcrumb(formatted, 'log.debug', { data })
  }

  /**
   * Info-level logging.
   * Use for general information.
   */
  info(message: string, options?: LogOptions): void {
    if (!shouldEmit('info')) return

    const formatted = this.formatMessage(message, options)
    const data = this.prepareLogData(options)

    if (this.isDevelopment) {
      console.info(formatted, data)
    }
    addBreadcrumb(formatted, 'log.info', { data })
  }

  /**
   * Warning-level logging (always shown, but sanitized).
   * Use for recoverable issues.
   */
  warn(message: string, options?: LogOptions): void {
    if (!shouldEmit('warn')) return

    const formatted = this.formatMessage(message, options)
    const data = this.prepareLogData(options)

    // Warnings go to console in both dev and prod (matches previous behavior)
    console.warn(formatted, data)
    addBreadcrumb(formatted, 'log.warn', { level: 'warning', data })
  }

  /**
   * Error-level logging (always shown, but sanitized).
   * Use for errors and exceptions. Captures the Error to Sentry as
   * an exception so it shows up alongside breadcrumbs.
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (!shouldEmit('error')) return

    const formatted = this.formatMessage(message, options)
    const data = this.prepareLogData(options)
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined

    // Console: full details in dev, message-only in prod (previous behavior)
    if (this.isDevelopment) {
      console.error(formatted, err, data)
    } else {
      console.error(formatted)
    }

    addBreadcrumb(formatted, 'log.error', { level: 'error', data })
    if (err) {
      captureError(err, {
        log_message: message,
        ...(options?.context && { context: options.context }),
      })
    }
  }

  /**
   * Log timer state changes
   */
  stateChange(from: string, to: string, context?: string): void {
    this.debug(`State: ${from} → ${to}`, { context })
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, context?: string): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, { context })
  }

  /**
   * Log persistence operations
   */
  persistence(action: string, data?: unknown): void {
    this.debug(`Persistence: ${action}`, { context: 'Storage', data })
  }
}

// Export singleton instance
export const logger = new TimerLogger()

// Export for testing
export { TimerLogger, sanitizeData }
