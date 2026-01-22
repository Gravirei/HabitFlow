/**
 * Notification Store Tests
 * Comprehensive tests for notification settings Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import type { NotificationHistory } from '../types'

// Must import store after mocks are set up
let useNotificationStore: typeof import('../notificationStore').useNotificationStore

describe('useNotificationStore', () => {
  const DEFAULT_SETTINGS = {
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
      message: "Take a break! You've been working for a while.",
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

  beforeEach(async () => {
    // Clear localStorage first
    localStorage.clear()
    
    // Dynamic import to ensure fresh store after localStorage is ready
    vi.resetModules()
    const module = await import('../notificationStore')
    useNotificationStore = module.useNotificationStore

    // Reset store to initial state
    useNotificationStore.setState({
      settings: DEFAULT_SETTINGS,
      history: [],
      permissionGranted: false,
      quietHours: { start: '22:00', end: '08:00' },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with default settings', () => {
      const state = useNotificationStore.getState()
      expect(state.settings.enabled).toBe(false)
      expect(state.settings.sessionReminders.enabled).toBe(false)
    })

    it('should start with empty history', () => {
      const state = useNotificationStore.getState()
      expect(state.history).toEqual([])
    })

    it('should start with permissionGranted as false', () => {
      const state = useNotificationStore.getState()
      expect(state.permissionGranted).toBe(false)
    })

    it('should start with default quiet hours', () => {
      const state = useNotificationStore.getState()
      expect(state.quietHours).toEqual({ start: '22:00', end: '08:00' })
    })
  })

  describe('updateSettings', () => {
    it('should update top-level enabled setting', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({ enabled: true })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.enabled).toBe(true)
    })

    it('should update nested sessionReminders settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          sessionReminders: {
            enabled: true,
            times: ['08:00', '12:00'],
            message: 'Custom reminder message',
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.sessionReminders.enabled).toBe(true)
      expect(state.settings.sessionReminders.times).toEqual(['08:00', '12:00'])
      expect(state.settings.sessionReminders.message).toBe('Custom reminder message')
    })

    it('should update goalProgress settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          goalProgress: {
            enabled: true,
            frequency: 'weekly',
            time: '19:00',
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.goalProgress.enabled).toBe(true)
      expect(state.settings.goalProgress.frequency).toBe('weekly')
    })

    it('should update streakReminder settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          streakReminder: {
            enabled: true,
            time: '20:30',
            message: 'Dont break your streak!',
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.streakReminder.enabled).toBe(true)
      expect(state.settings.streakReminder.time).toBe('20:30')
    })

    it('should update breakReminder settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          breakReminder: {
            enabled: true,
            afterMinutes: 45,
            message: 'Time for a break!',
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.breakReminder.afterMinutes).toBe(45)
    })

    it('should update dailySummary settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          dailySummary: {
            enabled: true,
            time: '21:00',
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.dailySummary.enabled).toBe(true)
      expect(state.settings.dailySummary.time).toBe('21:00')
    })

    it('should update browserNotifications settings', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          browserNotifications: {
            enabled: true,
            sound: false,
          },
        })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.browserNotifications.enabled).toBe(true)
      expect(state.settings.browserNotifications.sound).toBe(false)
    })

    it('should preserve other settings when updating one', () => {
      const { updateSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({ enabled: true })
      })

      const state = useNotificationStore.getState()
      expect(state.settings.sessionReminders.times).toEqual(['09:00', '14:00', '20:00'])
    })
  })

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      const { updateSettings, resetSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          enabled: true,
          sessionReminders: { enabled: true, times: ['10:00'], message: 'Custom' },
        })
      })

      act(() => {
        resetSettings()
      })

      const state = useNotificationStore.getState()
      expect(state.settings.enabled).toBe(false)
      expect(state.settings.sessionReminders.enabled).toBe(false)
      expect(state.settings.sessionReminders.times).toEqual(['09:00', '14:00', '20:00'])
    })
  })

  describe('setPermissionGranted', () => {
    it('should set permission to true', () => {
      const { setPermissionGranted } = useNotificationStore.getState()

      act(() => {
        setPermissionGranted(true)
      })

      const state = useNotificationStore.getState()
      expect(state.permissionGranted).toBe(true)
    })

    it('should set permission to false', () => {
      act(() => {
        useNotificationStore.getState().setPermissionGranted(true)
      })

      act(() => {
        useNotificationStore.getState().setPermissionGranted(false)
      })

      const state = useNotificationStore.getState()
      expect(state.permissionGranted).toBe(false)
    })
  })

  describe('addToHistory', () => {
    it('should add notification to history', () => {
      const { addToHistory } = useNotificationStore.getState()
      const entry: NotificationHistory = {
        id: 'notif-1',
        type: 'session_reminder',
        timestamp: Date.now(),
        message: 'Time to focus!',
        clicked: false,
      }

      act(() => {
        addToHistory(entry)
      })

      const state = useNotificationStore.getState()
      expect(state.history).toHaveLength(1)
      expect(state.history[0].id).toBe('notif-1')
    })

    it('should add new notifications at the beginning', () => {
      const { addToHistory } = useNotificationStore.getState()

      act(() => {
        addToHistory({
          id: 'notif-1',
          type: 'session_reminder',
          timestamp: Date.now(),
          message: 'First',
          clicked: false,
        })
        addToHistory({
          id: 'notif-2',
          type: 'streak_reminder',
          timestamp: Date.now(),
          message: 'Second',
          clicked: false,
        })
      })

      const state = useNotificationStore.getState()
      expect(state.history[0].id).toBe('notif-2')
      expect(state.history[1].id).toBe('notif-1')
    })

    it('should limit history to 50 entries', () => {
      const { addToHistory } = useNotificationStore.getState()

      act(() => {
        for (let i = 0; i < 60; i++) {
          addToHistory({
            id: `notif-${i}`,
            type: 'session_reminder',
            timestamp: Date.now(),
            message: `Notification ${i}`,
            clicked: false,
          })
        }
      })

      const state = useNotificationStore.getState()
      expect(state.history).toHaveLength(50)
      expect(state.history[0].id).toBe('notif-59')
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const { addToHistory, clearHistory } = useNotificationStore.getState()

      act(() => {
        addToHistory({
          id: 'notif-1',
          type: 'session_reminder',
          timestamp: Date.now(),
          message: 'Test',
          clicked: false,
        })
      })

      act(() => {
        clearHistory()
      })

      const state = useNotificationStore.getState()
      expect(state.history).toHaveLength(0)
    })
  })

  describe('getSettings', () => {
    it('should return current settings', () => {
      const { updateSettings, getSettings } = useNotificationStore.getState()

      act(() => {
        updateSettings({ enabled: true })
      })

      const settings = useNotificationStore.getState().getSettings()
      expect(settings.enabled).toBe(true)
    })
  })

  describe('enableSessionReminders', () => {
    it('should enable session reminders', () => {
      const { enableSessionReminders } = useNotificationStore.getState()

      act(() => {
        enableSessionReminders()
      })

      const state = useNotificationStore.getState()
      expect(state.settings.sessionReminders.enabled).toBe(true)
    })

    it('should preserve other sessionReminders settings', () => {
      const { updateSettings, enableSessionReminders } = useNotificationStore.getState()

      act(() => {
        updateSettings({
          sessionReminders: {
            enabled: false,
            times: ['10:00'],
            message: 'Custom message',
          },
        })
      })

      act(() => {
        enableSessionReminders()
      })

      const state = useNotificationStore.getState()
      expect(state.settings.sessionReminders.enabled).toBe(true)
      expect(state.settings.sessionReminders.times).toEqual(['10:00'])
      expect(state.settings.sessionReminders.message).toBe('Custom message')
    })
  })

  describe('disableSessionReminders', () => {
    it('should disable session reminders', () => {
      const { enableSessionReminders, disableSessionReminders } = useNotificationStore.getState()

      act(() => {
        enableSessionReminders()
      })

      act(() => {
        disableSessionReminders()
      })

      const state = useNotificationStore.getState()
      expect(state.settings.sessionReminders.enabled).toBe(false)
    })
  })

  describe('setQuietHours', () => {
    it('should set quiet hours', () => {
      const { setQuietHours } = useNotificationStore.getState()

      act(() => {
        setQuietHours({ start: '23:00', end: '07:00' })
      })

      const state = useNotificationStore.getState()
      expect(state.quietHours).toEqual({ start: '23:00', end: '07:00' })
    })
  })

  describe('isQuietHours', () => {
    it('should detect hour within quiet hours (overnight)', () => {
      const { setQuietHours } = useNotificationStore.getState()

      act(() => {
        setQuietHours({ start: '22:00', end: '08:00' })
      })

      const { isQuietHours } = useNotificationStore.getState()

      expect(isQuietHours(23)).toBe(true)
      expect(isQuietHours(3)).toBe(true)
      expect(isQuietHours(7)).toBe(true)
    })

    it('should detect hour outside quiet hours (overnight)', () => {
      const { setQuietHours } = useNotificationStore.getState()

      act(() => {
        setQuietHours({ start: '22:00', end: '08:00' })
      })

      const { isQuietHours } = useNotificationStore.getState()

      expect(isQuietHours(10)).toBe(false)
      expect(isQuietHours(15)).toBe(false)
      expect(isQuietHours(21)).toBe(false)
    })

    it('should handle same-day quiet hours', () => {
      const { setQuietHours } = useNotificationStore.getState()

      act(() => {
        setQuietHours({ start: '12:00', end: '14:00' })
      })

      const { isQuietHours } = useNotificationStore.getState()

      expect(isQuietHours(13)).toBe(true)
      expect(isQuietHours(11)).toBe(false)
      expect(isQuietHours(15)).toBe(false)
    })

    it('should handle edge cases at boundary hours', () => {
      const { setQuietHours } = useNotificationStore.getState()

      act(() => {
        setQuietHours({ start: '22:00', end: '08:00' })
      })

      const { isQuietHours } = useNotificationStore.getState()

      expect(isQuietHours(22)).toBe(true) // Start hour is included
      expect(isQuietHours(8)).toBe(false) // End hour is excluded
    })
  })

  describe('Edge Cases', () => {
    it('should handle all notification types in history', () => {
      const { addToHistory } = useNotificationStore.getState()
      const types = [
        'session_reminder',
        'goal_progress',
        'streak_reminder',
        'break_reminder',
        'daily_summary',
        'achievement_unlock',
      ] as const

      act(() => {
        types.forEach((type, i) => {
          addToHistory({
            id: `notif-${i}`,
            type,
            timestamp: Date.now(),
            message: `Test ${type}`,
            clicked: false,
          })
        })
      })

      const state = useNotificationStore.getState()
      expect(state.history).toHaveLength(6)
    })

    it('should handle clicked notification in history', () => {
      const { addToHistory } = useNotificationStore.getState()

      act(() => {
        addToHistory({
          id: 'notif-1',
          type: 'session_reminder',
          timestamp: Date.now(),
          message: 'Test',
          clicked: true,
        })
      })

      const state = useNotificationStore.getState()
      expect(state.history[0].clicked).toBe(true)
    })
  })
})
