/**
 * Notification Service
 * Handles browser notifications and permission management
 */

import { useNotificationStore } from './notificationStore'
import type { NotificationType } from './types'

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    useNotificationStore.getState().setPermissionGranted(true)
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    useNotificationStore.getState().setPermissionGranted(granted)
    return granted
  }

  return false
}

/**
 * Check if notifications are supported and permitted
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Send a browser notification
 */
export function sendNotification(
  title: string,
  options: {
    body?: string
    icon?: string
    badge?: string
    tag?: string
    silent?: boolean
    data?: any
  } = {}
): Notification | null {
  if (!areNotificationsSupported()) {
    console.warn('Notifications not supported or not permitted')
    return null
  }

  const settings = useNotificationStore.getState().settings

  // Check if browser notifications are enabled
  if (!settings.browserNotifications.enabled) {
    return null
  }

  const notification = new Notification(title, {
    body: options.body,
    icon: options.icon || '/vite.svg',
    badge: options.badge,
    tag: options.tag,
    silent: !settings.browserNotifications.sound || options.silent,
    data: options.data,
  })

  // Add to history
  useNotificationStore.getState().addToHistory({
    id: crypto.randomUUID(),
    type: options.data?.type || 'session_reminder',
    timestamp: Date.now(),
    message: title + (options.body ? ': ' + options.body : ''),
    clicked: false,
  })

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close()
  }, 5000)

  return notification
}

/**
 * Send session reminder notification
 */
export function sendSessionReminder(message?: string): void {
  const settings = useNotificationStore.getState().settings
  const defaultMessage = settings.sessionReminders.message

  sendNotification('Timer Reminder', {
    body: message || defaultMessage,
    tag: 'session-reminder',
    data: { type: 'session_reminder' },
  })
}

/**
 * Send goal progress notification
 */
export function sendGoalProgressNotification(goalName: string, progress: number): void {
  sendNotification('Goal Progress Update', {
    body: `${goalName}: ${Math.round(progress)}% complete`,
    tag: 'goal-progress',
    data: { type: 'goal_progress' },
  })
}

/**
 * Send streak reminder notification
 */
export function sendStreakReminder(currentStreak: number): void {
  const settings = useNotificationStore.getState().settings
  const message = settings.streakReminder.message

  sendNotification('Streak Reminder', {
    body: `Current streak: ${currentStreak} days. ${message}`,
    tag: 'streak-reminder',
    data: { type: 'streak_reminder' },
  })
}

/**
 * Send break reminder notification
 */
export function sendBreakReminder(): void {
  const settings = useNotificationStore.getState().settings
  const message = settings.breakReminder.message

  sendNotification('Break Time', {
    body: message,
    tag: 'break-reminder',
    data: { type: 'break_reminder' },
  })
}

/**
 * Send daily summary notification
 */
export function sendDailySummary(sessionCount: number, totalMinutes: number): void {
  sendNotification('Daily Summary', {
    body: `Today: ${sessionCount} session${sessionCount !== 1 ? 's' : ''}, ${totalMinutes} minutes of focus time`,
    tag: 'daily-summary',
    data: { type: 'daily_summary' },
  })
}

/**
 * Send achievement unlock notification
 */
export function sendAchievementNotification(achievementName: string): void {
  sendNotification('Achievement Unlocked!', {
    body: achievementName,
    tag: 'achievement',
    data: { type: 'achievement_unlock' },
  })
}

/**
 * Check notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * Schedule notification for specific time
 */
export function scheduleNotification(time: string, callback: () => void): number | null {
  const [hours, minutes] = time.split(':').map(Number)
  
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(hours, minutes, 0, 0)

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime.getTime() - now.getTime()

  // Don't schedule if delay is too long (> 24 hours)
  if (delay > 24 * 60 * 60 * 1000) {
    return null
  }

  return window.setTimeout(() => {
    callback()
    // Reschedule for next day
    scheduleNotification(time, callback)
  }, delay)
}

/**
 * Clear all scheduled notifications
 */
const scheduledTimers: number[] = []

export function clearAllScheduledNotifications(): void {
  scheduledTimers.forEach((timerId) => clearTimeout(timerId))
  scheduledTimers.length = 0
}

/**
 * Initialize notification scheduler
 */
export function initializeNotificationScheduler(): void {
  const settings = useNotificationStore.getState().settings

  // Clear existing schedules
  clearAllScheduledNotifications()

  if (!settings.enabled || !settings.browserNotifications.enabled) {
    return
  }

  // Schedule session reminders
  if (settings.sessionReminders.enabled) {
    settings.sessionReminders.times.forEach((time) => {
      const timerId = scheduleNotification(time, () => {
        sendSessionReminder()
      })
      if (timerId) scheduledTimers.push(timerId)
    })
  }

  // Schedule streak reminder
  if (settings.streakReminder.enabled) {
    const timerId = scheduleNotification(settings.streakReminder.time, () => {
      // Get current streak from achievements store
      sendStreakReminder(0) // Will be updated with actual streak
    })
    if (timerId) scheduledTimers.push(timerId)
  }

  // Schedule daily summary
  if (settings.dailySummary.enabled) {
    const timerId = scheduleNotification(settings.dailySummary.time, () => {
      // Calculate today's stats
      sendDailySummary(0, 0) // Will be updated with actual stats
    })
    if (timerId) scheduledTimers.push(timerId)
  }
}
