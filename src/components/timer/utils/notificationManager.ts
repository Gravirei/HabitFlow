/**
 * NotificationManager
 * 
 * Handles browser notifications for timer completions.
 * Provides a centralized interface for managing notification permissions,
 * displaying notifications, and handling browser compatibility.
 * 
 * Features:
 * - Permission management (request, check status)
 * - Browser support detection
 * - Timer-specific notifications with icons
 * - Error handling and graceful degradation
 * - Auto-close after duration
 * - Click to focus window
 * 
 * Usage:
 * ```typescript
 * // Check support
 * if (notificationManager.isSupported()) {
 *   // Request permission
 *   const granted = await notificationManager.requestPermission()
 *   
 *   // Show notification
 *   await notificationManager.showTimerComplete(
 *     'Time is up!',
 *     'Countdown',
 *     300
 *   )
 * }
 * ```
 * 
 * @module notificationManager
 */

import { logError, ErrorCategory, ErrorSeverity } from './errorMessages'
import { logger } from './logger'

/**
 * Options for displaying a timer notification
 */
export interface TimerNotificationOptions {
  /** Main notification title (optional, defaults to mode-specific title) */
  title?: string
  /** Notification message body */
  message: string
  /** Timer mode for context-specific icons and titles */
  mode?: 'Stopwatch' | 'Countdown' | 'Intervals'
  /** Timer duration in seconds (for context) */
  duration?: number
  /** Custom icon URL (optional, defaults to app icon) */
  icon?: string
  /** Custom badge URL (optional, defaults to app icon) */
  badge?: string
  /** Duration before auto-close in milliseconds (default: 5000ms) */
  autoCloseDuration?: number
}

/**
 * NotificationManager Class
 * Singleton pattern for managing browser notifications
 */
class NotificationManager {
  private static instance: NotificationManager

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize any necessary state
    this.logBrowserSupport()
  }

  /**
   * Get singleton instance of NotificationManager
   */
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  /**
   * Log browser notification support status (for debugging)
   */
  private logBrowserSupport(): void {
    if (this.isSupported()) {
      logger.debug('Browser supports notifications', { 
        context: 'NotificationManager',
        data: { permission: this.getPermission() }
      })
    } else {
      logger.warn('Browser does not support notifications', { 
        context: 'NotificationManager'
      })
    }
  }

  /**
   * Check if browser supports the Notification API
   * @returns true if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && typeof Notification !== 'undefined'
  }

  /**
   * Get current notification permission status
   * @returns 'default' | 'granted' | 'denied'
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }

  /**
   * Check if notifications are currently allowed
   * @returns true if permission is granted
   */
  isPermissionGranted(): boolean {
    return this.getPermission() === 'granted'
  }

  /**
   * Request notification permission from user
   * Shows browser's native permission prompt
   * 
   * @returns Promise<boolean> - true if permission granted
   */
  async requestPermission(): Promise<boolean> {
    // Check browser support
    if (!this.isSupported()) {
      logger.warn('Cannot request permission - notifications not supported', { 
        context: 'NotificationManager.requestPermission'
      })
      // Show user-friendly message
      this.showErrorMessage('notification_unsupported')
      return false
    }

    // Check if already granted
    if (this.isPermissionGranted()) {
      logger.debug('Permission already granted', { 
        context: 'NotificationManager.requestPermission'
      })
      return true
    }

    // Check if already denied
    if (this.getPermission() === 'denied') {
      logger.warn('Permission previously denied by user', { 
        context: 'NotificationManager.requestPermission'
      })
      // Show user-friendly message
      this.showErrorMessage('notification_denied')
      return false
    }

    try {
      logger.debug('Requesting notification permission...', { 
        context: 'NotificationManager.requestPermission'
      })
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'

      if (granted) {
        logger.debug('Permission granted', { 
          context: 'NotificationManager.requestPermission'
        })
      } else {
        logger.warn('Permission denied by user', { 
          context: 'NotificationManager.requestPermission'
        })
        this.showErrorMessage('notification_denied')
      }

      return granted
    } catch (error) {
      logError(
        error,
        'Failed to request permission',
        undefined,
        ErrorCategory.NOTIFICATION,
        ErrorSeverity.MEDIUM
      )
      return false
    }
  }

  /**
   * Show user-friendly error message
   * (Can be integrated with toast notifications in the future)
   */
  private showErrorMessage(type: 'notification_denied' | 'notification_unsupported'): void {
    // Import error message utility
    import('./errorMessages').then(({ getErrorMessage }) => {
      const error = getErrorMessage(type)
      logger.warn(`${error.title}: ${error.message}`, { 
        context: 'NotificationManager.showErrorMessage',
        data: { type, action: error.action }
      })
      // TODO: Show toast notification
      // toast.error(error.message, { description: error.action })
    })
  }

  /**
   * Show a basic notification
   * 
   * @param options - Notification options
   * @returns Promise<void>
   */
  async showNotification(
    options: TimerNotificationOptions
  ): Promise<Notification | null> {
    // Check browser support
    if (!this.isSupported()) {
      logger.warn('Cannot show notification - not supported', { 
        context: 'NotificationManager.showNotification'
      })
      return null
    }

    // Check permission
    if (!this.isPermissionGranted()) {
      logger.warn('Cannot show notification - permission not granted', { 
        context: 'NotificationManager.showNotification'
      })
      return null
    }

    try {
      const title = options.title || 'Timer Complete!'
      const body = options.message

      // Create notification
      const notification = new Notification(title, {
        body,
        icon: options.icon || '/vite.svg',
        badge: options.badge || '/vite.svg',
        tag: 'timer-notification', // Replace previous notification
        requireInteraction: false, // Don't require user action to dismiss
        silent: false, // Play system sound
        // timestamp: Date.now(),
      })

      // Auto-close after duration
      const autoCloseDuration = options.autoCloseDuration ?? 5000 // Default 5s
      if (autoCloseDuration > 0) {
        setTimeout(() => {
          notification.close()
        }, autoCloseDuration)
      }

      // Focus window when notification is clicked
      notification.onclick = () => {
        logger.debug('Notification clicked - focusing window', { 
          context: 'NotificationManager.showNotification'
        })
        window.focus()
        notification.close()
      }

      // Log error if notification fails to show
      notification.onerror = (event) => {
        logError(
          new Error('Notification error'),
          'Notification display error',
          { event },
          ErrorCategory.NOTIFICATION,
          ErrorSeverity.LOW
        )
      }

      logger.debug('Notification shown', { 
        context: 'NotificationManager.showNotification',
        data: { title }
      })
      return notification
    } catch (error) {
      logError(
        error,
        'Failed to show notification',
        { title: options.title, message: options.message },
        ErrorCategory.NOTIFICATION,
        ErrorSeverity.LOW
      )
      return null
    }
  }

  /**
   * Show a timer completion notification with mode-specific styling
   * 
   * @param message - Custom message to display
   * @param mode - Timer mode (Stopwatch, Countdown, Intervals)
   * @param duration - Timer duration in seconds (optional)
   * @returns Promise<Notification | null>
   */
  async showTimerComplete(
    message: string,
    mode: 'Stopwatch' | 'Countdown' | 'Intervals',
    duration?: number
  ): Promise<Notification | null> {
    // Mode-specific icons (emoji for now, can be custom images)
    const modeIcons = {
      Stopwatch: '⏱️',
      Countdown: '⏲️',
      Intervals: '🔄',
    }

    // Mode-specific titles
    const modeTitle = `${modeIcons[mode]} ${mode} Timer Complete!`

    // Format duration if provided
    let fullMessage = message
    if (duration !== undefined && duration > 0) {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      const durationStr =
        minutes > 0
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`
      fullMessage = `${message}\n(${durationStr})`
    }

    return this.showNotification({
      title: modeTitle,
      message: fullMessage,
      mode,
      duration,
      autoCloseDuration: 5000,
    })
  }

  /**
   * Test notification - shows a sample notification
   * Useful for testing if notifications are working
   * 
   * @returns Promise<Notification | null>
   */
  async showTestNotification(): Promise<Notification | null> {
    return this.showNotification({
      title: '🔔 Test Notification',
      message: 'Notifications are working! You will see this when your timer completes.',
      autoCloseDuration: 5000,
    })
  }

  /**
   * Check if notification can be shown right now
   * Validates support and permission
   * 
   * @returns true if notification can be shown
   */
  canShowNotification(): boolean {
    return this.isSupported() && this.isPermissionGranted()
  }

  /**
   * Get user-friendly permission status message
   * Useful for UI display
   * 
   * @returns Status message
   */
  getPermissionStatusMessage(): string {
    if (!this.isSupported()) {
      return 'Your browser does not support notifications'
    }

    const permission = this.getPermission()
    switch (permission) {
      case 'granted':
        return 'Notifications enabled'
      case 'denied':
        return 'Notifications blocked - please enable in browser settings'
      case 'default':
        return 'Permission not requested yet'
      default:
        return 'Unknown permission status'
    }
  }
}

/**
 * Export singleton instance
 * Use this throughout the app for notification management
 */
export const notificationManager = NotificationManager.getInstance()

/**
 * Export class for testing purposes
 */
export { NotificationManager }
