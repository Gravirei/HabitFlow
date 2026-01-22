/**
 * Error Messages Utility
 * 
 * Provides user-friendly error messages for common timer errors.
 * Helps users understand what went wrong and how to fix it.
 */

// Error Categories
export enum ErrorCategory {
  TIMER = 'TIMER',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  NOTIFICATION = 'NOTIFICATION',
  SOUND = 'SOUND',
  VIBRATION = 'VIBRATION'
}

// Error Severities
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export type ErrorType = 
  | 'localStorage_quota'
  | 'localStorage_disabled'
  | 'localStorage_corrupted'
  | 'notification_denied'
  | 'notification_unsupported'
  | 'sound_failed'
  | 'vibration_unsupported'
  | 'timer_validation'
  | 'state_restoration'
  | 'unknown'

export interface ErrorMessage {
  title: string
  message: string
  action?: string
  icon: string
}

export interface FormattedError {
  title: string
  message: string
  category?: ErrorCategory
  severity?: ErrorSeverity
}

/**
 * Get user-friendly error message for a specific error type
 */
export const getErrorMessage = (errorType: ErrorType, details?: string): ErrorMessage => {
  switch (errorType) {
    case 'localStorage_quota':
      return {
        title: 'Storage Full',
        message: 'Your browser storage is full. Please clear some space to save timer data.',
        action: 'Try clearing browser cache or removing unused data from other sites.',
        icon: '💾'
      }

    case 'localStorage_disabled':
      return {
        title: 'Storage Disabled',
        message: 'Browser storage is disabled. Timer state cannot be saved.',
        action: 'Enable cookies and site data in your browser settings.',
        icon: '🔒'
      }

    case 'localStorage_corrupted':
      return {
        title: 'Corrupted Data',
        message: 'Saved timer data is corrupted and has been cleared.',
        action: 'Your timer has been reset. You can start a new session.',
        icon: '⚠️'
      }

    case 'notification_denied':
      return {
        title: 'Notifications Blocked',
        message: 'You\'ve blocked notifications for this site.',
        action: 'Enable notifications in your browser settings to receive timer alerts.',
        icon: '🔴'
      }

    case 'notification_unsupported':
      return {
        title: 'Notifications Not Supported',
        message: 'Your browser doesn\'t support desktop notifications.',
        action: 'Try using Chrome, Firefox, Safari, or Edge for notification support.',
        icon: '❌'
      }

    case 'sound_failed':
      return {
        title: 'Sound Failed',
        message: 'Unable to play completion sound.',
        action: 'Check your volume settings or try a different sound type.',
        icon: '🔇'
      }

    case 'vibration_unsupported':
      return {
        title: 'Vibration Not Supported',
        message: 'Your device doesn\'t support vibration.',
        action: 'This feature only works on mobile devices with vibration hardware.',
        icon: '📱'
      }

    case 'timer_validation':
      return {
        title: 'Invalid Timer',
        message: details || 'The timer configuration is invalid.',
        action: 'Please check your timer settings and try again.',
        icon: '⚙️'
      }

    case 'state_restoration':
      return {
        title: 'Cannot Resume Timer',
        message: details || 'Unable to restore previous timer state.',
        action: 'The saved timer may be too old or corrupted. Start a new timer.',
        icon: '🔄'
      }

    case 'unknown':
    default:
      return {
        title: 'Something Went Wrong',
        message: details || 'An unexpected error occurred.',
        action: 'Try refreshing the page. If the problem persists, contact support.',
        icon: '❓'
      }
  }
}

/**
 * Show a toast-style error message (can be integrated with a toast library)
 */
export const showErrorToast = (errorType: ErrorType, details?: string): void => {
  const error = getErrorMessage(errorType, details)
  
  // For now, use console.error
  // TODO: Integrate with a toast notification library
  console.error(`[Timer Error] ${error.title}: ${error.message}`, {
    action: error.action,
    details
  })
  
  // Optional: Show browser alert for critical errors
  if (errorType === 'localStorage_disabled' || errorType === 'localStorage_quota') {
    // Could show a modal or toast here
  }
}

/**
 * Log error with context and category
 */
export const logError = (
  error: Error | unknown,
  context?: string,
  additionalContext?: Record<string, unknown>,
  category?: ErrorCategory,
  severity?: ErrorSeverity
): void => {
  const categoryTag = category ? `[${category}]` : ''
  const severityTag = severity ? `[${severity}]` : ''
  
  if (context) {
    console.error(`[Timer Error]${categoryTag}${severityTag} ${context}:`, error, additionalContext)
  } else {
    console.error(`[Timer Error]${categoryTag}${severityTag}:`, error, additionalContext)
  }
  
  // Optional: Send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context, category, severity }, extra: additionalContext })
}

/**
 * Check if error is a quota exceeded error
 */
export const isQuotaExceededError = (error: unknown): boolean => {
  if (error instanceof DOMException) {
    // Chrome, Firefox
    return error.name === 'QuotaExceededError' ||
           // Safari
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  }
  return false
}

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Safe localStorage operation with error handling
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      logError(error, 'localStorage_disabled', { operation: 'getItem', key })
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      if (isQuotaExceededError(error)) {
        logError(error, 'localStorage_quota', { operation: 'setItem', key })
        showErrorToast('localStorage_quota')
      } else {
        logError(error, 'localStorage_disabled', { operation: 'setItem', key })
        showErrorToast('localStorage_disabled')
      }
      return false
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logError(error, 'localStorage_disabled', { operation: 'removeItem', key })
      return false
    }
  }
}

/**
 * Timer-specific error messages
 */
export const getTimerErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'START_FAILED':
      return 'Failed to start timer. Please try again.'
    case 'PAUSE_FAILED':
      return 'Failed to pause timer. Please try again.'
    case 'STOP_FAILED':
      return 'Failed to stop timer. Please try again.'
    case 'RESET_FAILED':
      return 'Failed to reset timer. Please try again.'
    case 'RESUME_FAILED':
      return 'Failed to resume timer. Please try again.'
    case 'INVALID_STATE':
      return 'Timer is in an invalid state. Please reset and try again.'
    case 'CALCULATION_ERROR':
      return 'Timer calculation error occurred. Please reset the timer.'
    default:
      return 'An unknown timer error occurred.'
  }
}

/**
 * Storage-specific error messages
 */
export const getStorageErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'SAVE_FAILED':
      return 'Failed to save timer data to storage.'
    case 'LOAD_FAILED':
      return 'Failed to load timer data from storage.'
    case 'QUOTA_EXCEEDED':
      return 'storage is full. Please clear some space.'
    case 'PARSE_ERROR':
      return 'Failed to parse stored timer data.'
    case 'CORRUPTED_DATA':
      return 'Stored timer data is corrupted.'
    case 'STORAGE_UNAVAILABLE':
      return 'Storage is unavailable. Data cannot be saved.'
    default:
      return 'An unknown storage error occurred.'
  }
}

/**
 * Validation error messages
 */
export const getValidationErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'INVALID_DURATION':
      return 'invalid duration provided. Please enter a valid time.'
    case 'INVALID_INTERVAL':
      return 'invalid interval configuration. Please check your settings.'
    case 'INVALID_PRESET':
      return 'invalid preset data. Please check your preset configuration.'
    case 'INVALID_HISTORY_RECORD':
      return 'invalid history record. The record will be skipped.'
    case 'INVALID_MODE':
      return 'invalid timer mode. Please select a valid mode.'
    case 'OUT_OF_RANGE':
      return 'Value is out of acceptable range. Please enter a valid value.'
    default:
      return 'Validation error occurred.'
  }
}

/**
 * Notification error messages
 */
export const getNotificationErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'PERMISSION_DENIED':
      return 'Notification permission denied. Please enable notifications in your browser settings.'
    case 'NOT_SUPPORTED':
      return 'Notifications are not supported in this browser.'
    case 'SEND_FAILED':
      return 'failed to send notification.'
    default:
      return 'Notification error occurred.'
  }
}

/**
 * Sound error messages
 */
export const getSoundErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'LOAD_FAILED':
      return 'Failed to load sound file.'
    case 'PLAY_FAILED':
      return 'Failed to play sound.'
    case 'NOT_SUPPORTED':
      return 'Audio playback is not supported in this browser.'
    case 'DECODE_ERROR':
      return 'Failed to decode sound file.'
    default:
      return 'Sound error occurred.'
  }
}

/**
 * Vibration error messages
 */
export const getVibrationErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'NOT_SUPPORTED':
      return 'Vibration is not supported on this device.'
    case 'TRIGGER_FAILED':
      return 'failed to trigger vibration.'
    case 'INVALID_PATTERN':
      return 'invalid vibration pattern provided.'
    default:
      return 'Vibration error occurred.'
  }
}

/**
 * Format error for user display
 */
export const formatErrorForUser = (
  error: Error,
  title: string,
  category?: ErrorCategory,
  severity?: ErrorSeverity
): FormattedError => {
  // Sanitize error message (remove potential XSS)
  const sanitizedMessage = error.message
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .substring(0, 500) // Truncate long messages

  return {
    title,
    message: sanitizedMessage || 'An error occurred',
    category,
    severity
  }
}
