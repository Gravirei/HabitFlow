/**
 * Notification Types
 * Types and interfaces for the notification system
 */

export type NotificationType = 
  | 'session_reminder'
  | 'goal_progress'
  | 'streak_reminder'
  | 'break_reminder'
  | 'daily_summary'
  | 'achievement_unlock'

export type NotificationFrequency = 'daily' | 'weekly' | 'custom'

export interface NotificationSettings {
  enabled: boolean
  
  // Session Reminders
  sessionReminders: {
    enabled: boolean
    times: string[] // Array of times like "09:00", "14:00"
    message: string
  }
  
  // Goal Progress
  goalProgress: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string // "20:00"
  }
  
  // Streak Reminders
  streakReminder: {
    enabled: boolean
    time: string // "21:00"
    message: string
  }
  
  // Break Reminders
  breakReminder: {
    enabled: boolean
    afterMinutes: number // After X minutes of work
    message: string
  }
  
  // Daily Summary
  dailySummary: {
    enabled: boolean
    time: string // "22:00"
  }
  
  // Browser Notifications
  browserNotifications: {
    enabled: boolean
    sound: boolean
  }
}

export interface NotificationSchedule {
  id: string
  type: NotificationType
  scheduledTime: Date
  message: string
  executed: boolean
}

export interface NotificationHistory {
  id: string
  type: NotificationType
  timestamp: number
  message: string
  clicked: boolean
}
