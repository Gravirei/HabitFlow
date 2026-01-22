/**
 * Logger Utility
 * Centralized logging with environment-aware output
 * Replaces scattered console.log statements throughout the timer module
 * 
 * Security: Sanitizes sensitive data and gates logs by environment
 */


interface LogOptions {
  context?: string
  data?: any
}

// Security: List of sensitive keys to redact
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'apiKey', 'accessToken', 
  'refreshToken', 'sessionId', 'userId', 'email', 'creditCard'
]

/**
 * Sanitizes data object by redacting sensitive fields
 * Security: Prevents accidental logging of sensitive information
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }
  
  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    // Check if key contains sensitive information
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    )
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

class TimerLogger {
  private isDevelopment = import.meta.env.DEV
  private prefix = '[Timer]'
  
  /**
   * Prepares log data by sanitizing sensitive information
   */
  private prepareLogData(options?: LogOptions): any {
    if (!options?.data) return ''
    return sanitizeData(options.data)
  }

  /**
   * Debug-level logging (only in development)
   * Use for detailed debugging information
   */
  debug(message: string, options?: LogOptions): void {
    if (!this.isDevelopment) return

    const contextMsg = options?.context ? `[${options.context}]` : ''
    const sanitizedData = this.prepareLogData(options)
    console.log(`${this.prefix}${contextMsg} ${message}`, sanitizedData)
  }

  /**
   * Info-level logging (only in development)
   * Use for general information
   */
  info(message: string, options?: LogOptions): void {
    if (!this.isDevelopment) return

    const contextMsg = options?.context ? `[${options.context}]` : ''
    const sanitizedData = this.prepareLogData(options)
    console.info(`${this.prefix}${contextMsg} ${message}`, sanitizedData)
  }

  /**
   * Warning-level logging (always shown, but sanitized)
   * Use for recoverable issues
   */
  warn(message: string, options?: LogOptions): void {
    const contextMsg = options?.context ? `[${options.context}]` : ''
    const sanitizedData = this.prepareLogData(options)
    console.warn(`${this.prefix}${contextMsg} ${message}`, sanitizedData)
  }

  /**
   * Error-level logging (always shown, but sanitized)
   * Use for errors and exceptions
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const contextMsg = options?.context ? `[${options.context}]` : ''
    const sanitizedData = this.prepareLogData(options)
    
    // Only log error message and stack in development
    if (this.isDevelopment) {
      console.error(`${this.prefix}${contextMsg} ${message}`, error, sanitizedData)
    } else {
      // In production, only log message without full error details
      console.error(`${this.prefix}${contextMsg} ${message}`)
    }
  }

  /**
   * Log timer state changes (development only)
   */
  stateChange(from: string, to: string, context?: string): void {
    this.debug(`State: ${from} → ${to}`, { context })
  }

  /**
   * Log performance metrics (development only)
   */
  performance(operation: string, duration: number, context?: string): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, { context })
  }

  /**
   * Log persistence operations (development only)
   */
  persistence(action: string, data?: any): void {
    this.debug(`Persistence: ${action}`, { context: 'Storage', data })
  }
}

// Export singleton instance
export const logger = new TimerLogger()

// Export for testing
export { TimerLogger }
