/**
 * Notification Store
 * State management for notification settings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationSettings, NotificationHistory } from './types'

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  
  sessionReminders: {
    enabled: false,
    times: ['09:00', '14:00', '20:00'],
    message: 'Time to focus! Start a timer session.',
  },
  
  goalProgress: {
    enabled: false,
    frequency: 'daily',
    time: '20:00',
  },
  
  streakReminder: {
    enabled: false,
    time: '21:00',
    message: 'Keep your streak alive! Use the timer today.',
  },
  
  breakReminder: {
    enabled: false,
    afterMinutes: 60,
    message: 'Take a break! You\'ve been working for a while.',
  },
  
  dailySummary: {
    enabled: false,
    time: '22:00',
  },
  
  browserNotifications: {
    enabled: false,
    sound: true,
  },
}

interface QuietHours {
  start: string
  end: string
}

interface NotificationState {
  settings: NotificationSettings
  history: NotificationHistory[]
  permissionGranted: boolean
  quietHours: QuietHours
  
  updateSettings: (settings: Partial<NotificationSettings>) => void
  resetSettings: () => void
  
  setPermissionGranted: (granted: boolean) => void
  
  addToHistory: (entry: NotificationHistory) => void
  clearHistory: () => void
  
  getSettings: () => NotificationSettings
  
  // Session reminders
  enableSessionReminders: () => void
  disableSessionReminders: () => void
  
  // Quiet hours
  setQuietHours: (hours: QuietHours) => void
  isQuietHours: (hour: number) => boolean
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      history: [],
      permissionGranted: false,
      quietHours: { start: '22:00', end: '08:00' },

      /**
       * Update notification settings
       */
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }))
      },

      /**
       * Reset to default settings
       */
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS })
      },

      /**
       * Set browser notification permission status
       */
      setPermissionGranted: (granted) => {
        set({ permissionGranted: granted })
      },

      /**
       * Add notification to history
       */
      addToHistory: (entry) => {
        set((state) => ({
          history: [entry, ...state.history].slice(0, 50), // Keep last 50
        }))
      },

      /**
       * Clear notification history
       */
      clearHistory: () => {
        set({ history: [] })
      },

      /**
       * Get current settings
       */
      getSettings: () => {
        return get().settings
      },

      /**
       * Enable session reminders
       */
      enableSessionReminders: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            sessionReminders: {
              ...state.settings.sessionReminders,
              enabled: true,
            },
          },
        }))
      },

      /**
       * Disable session reminders
       */
      disableSessionReminders: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            sessionReminders: {
              ...state.settings.sessionReminders,
              enabled: false,
            },
          },
        }))
      },

      /**
       * Set quiet hours
       */
      setQuietHours: (hours) => {
        set({ quietHours: hours })
      },

      /**
       * Check if current hour is within quiet hours
       */
      isQuietHours: (hour) => {
        const { quietHours } = get()
        const startHour = parseInt(quietHours.start.split(':')[0], 10)
        const endHour = parseInt(quietHours.end.split(':')[0], 10)
        
        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (startHour > endHour) {
          return hour >= startHour || hour < endHour
        }
        
        return hour >= startHour && hour < endHour
      },
    }),
    {
      name: 'timer-notification-settings',
      version: 1,
    }
  )
)
