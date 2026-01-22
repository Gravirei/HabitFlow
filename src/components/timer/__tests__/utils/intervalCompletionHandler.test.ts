/**
 * Tests for Interval Completion Handler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleIntervalSessionComplete,
  calculateSessionDuration,
  isValidSession,
  type CompletionParams,
  type CompletionCallbacks
} from '../../utils/intervalCompletionHandler'
import { soundManager } from '../../utils/soundManager'
import { vibrationManager } from '../../utils/vibrationManager'
import { notificationManager } from '../../utils/notificationManager'

// Mock the managers
vi.mock('../../utils/soundManager')
vi.mock('../../utils/vibrationManager')
vi.mock('../../utils/notificationManager')

describe('intervalCompletionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleIntervalSessionComplete', () => {
    const defaultParams: CompletionParams = {
      duration: 30 * 60 * 1000, // 30 minutes
      intervalCount: 3,
      sessionName: 'Test Session',
      targetLoopCount: 3,
      settings: {
        soundEnabled: true,
        soundType: 'beep',
        soundVolume: 0.8,
        vibrationEnabled: true,
        vibrationPattern: 'pulse',
        notificationsEnabled: true,
        notificationMessage: 'Session complete!'
      }
    }

    it('should play sound when sound is enabled', () => {
      const result = handleIntervalSessionComplete(defaultParams, {})

      expect(soundManager.playSound).toHaveBeenCalledWith('beep', 0.8)
      expect(result.completed).toBe(true)
    })

    it('should not play sound when sound is disabled', () => {
      const params = {
        ...defaultParams,
        settings: { ...defaultParams.settings, soundEnabled: false }
      }

      handleIntervalSessionComplete(params, {})

      expect(soundManager.playSound).not.toHaveBeenCalled()
    })

    it('should trigger vibration when vibration is enabled', () => {
      const result = handleIntervalSessionComplete(defaultParams, {})

      expect(vibrationManager.vibrate).toHaveBeenCalledWith('pulse')
      expect(result.completed).toBe(true)
    })

    it('should not trigger vibration when vibration is disabled', () => {
      const params = {
        ...defaultParams,
        settings: { ...defaultParams.settings, vibrationEnabled: false }
      }

      handleIntervalSessionComplete(params, {})

      expect(vibrationManager.vibrate).not.toHaveBeenCalled()
    })

    it('should show notification when notifications are enabled', () => {
      const result = handleIntervalSessionComplete(defaultParams, {})

      expect(notificationManager.showTimerComplete).toHaveBeenCalledWith(
        'Session complete!',
        'Intervals',
        1800 // 30 minutes in seconds
      )
      expect(result.completed).toBe(true)
    })

    it('should not show notification when notifications are disabled', () => {
      const params = {
        ...defaultParams,
        settings: { ...defaultParams.settings, notificationsEnabled: false }
      }

      handleIntervalSessionComplete(params, {})

      expect(notificationManager.showTimerComplete).not.toHaveBeenCalled()
    })

    it('should call onSessionComplete callback with correct parameters', () => {
      const onSessionComplete = vi.fn()
      const callbacks: CompletionCallbacks = { onSessionComplete }

      handleIntervalSessionComplete(defaultParams, callbacks)

      expect(onSessionComplete).toHaveBeenCalledWith(
        30 * 60 * 1000,
        3,
        'Test Session',
        3
      )
    })

    it('should not call onSessionComplete when duration is 0', () => {
      const onSessionComplete = vi.fn()
      const params = { ...defaultParams, duration: 0 }

      handleIntervalSessionComplete(params, { onSessionComplete })

      expect(onSessionComplete).not.toHaveBeenCalled()
    })

    it('should call onTimerComplete callback', () => {
      const onTimerComplete = vi.fn()
      const callbacks: CompletionCallbacks = { onTimerComplete }

      handleIntervalSessionComplete(defaultParams, callbacks)

      expect(onTimerComplete).toHaveBeenCalled()
    })

    it('should handle errors in sound playback gracefully', () => {
      vi.mocked(soundManager.playSound).mockImplementation(() => {
        throw new Error('Sound error')
      })

      const result = handleIntervalSessionComplete(defaultParams, {})

      // Should still complete successfully despite sound error
      expect(result.completed).toBe(true)
    })

    it('should handle errors in vibration gracefully', () => {
      vi.mocked(vibrationManager.vibrate).mockImplementation(() => {
        throw new Error('Vibration error')
      })

      const result = handleIntervalSessionComplete(defaultParams, {})

      expect(result.completed).toBe(true)
    })

    it('should handle errors in notification gracefully', () => {
      vi.mocked(notificationManager.showTimerComplete).mockImplementation(() => {
        throw new Error('Notification error')
      })

      const result = handleIntervalSessionComplete(defaultParams, {})

      expect(result.completed).toBe(true)
    })

    it('should handle errors in onSessionComplete callback gracefully', () => {
      const onSessionComplete = vi.fn().mockImplementation(() => {
        throw new Error('Callback error')
      })

      const result = handleIntervalSessionComplete(defaultParams, { onSessionComplete })

      expect(result.completed).toBe(true)
    })

    it('should work with minimal settings', () => {
      const params: CompletionParams = {
        duration: 1000,
        intervalCount: 1,
        settings: {
          soundEnabled: false,
          soundType: 'beep',
          soundVolume: 0.5,
          vibrationEnabled: false,
          vibrationPattern: 'short',
          notificationsEnabled: false,
          notificationMessage: ''
        }
      }

      const result = handleIntervalSessionComplete(params, {})

      expect(result.completed).toBe(true)
      expect(soundManager.playSound).not.toHaveBeenCalled()
      expect(vibrationManager.vibrate).not.toHaveBeenCalled()
      expect(notificationManager.showTimerComplete).not.toHaveBeenCalled()
    })
  })

  describe('calculateSessionDuration', () => {
    it('should calculate duration correctly', () => {
      const sessionStart = 1000
      const currentTime = 31000
      const pausedTime = 5000

      const duration = calculateSessionDuration(sessionStart, currentTime, pausedTime)

      expect(duration).toBe(25000) // 31000 - 1000 - 5000
    })

    it('should handle zero paused time', () => {
      const duration = calculateSessionDuration(1000, 11000, 0)
      expect(duration).toBe(10000)
    })

    it('should not return negative duration', () => {
      const duration = calculateSessionDuration(10000, 5000, 0)
      expect(duration).toBe(0)
    })

    it('should handle large paused time', () => {
      const duration = calculateSessionDuration(1000, 10000, 15000)
      expect(duration).toBe(0) // Can't go negative
    })
  })

  describe('isValidSession', () => {
    it('should return true for valid session', () => {
      expect(isValidSession(1000, 1)).toBe(true)
      expect(isValidSession(60000, 5)).toBe(true)
    })

    it('should return false for zero duration', () => {
      expect(isValidSession(0, 1)).toBe(false)
    })

    it('should return false for negative duration', () => {
      expect(isValidSession(-1000, 1)).toBe(false)
    })

    it('should return false for zero interval count', () => {
      expect(isValidSession(1000, 0)).toBe(false)
    })

    it('should return false for negative interval count', () => {
      expect(isValidSession(1000, -1)).toBe(false)
    })

    it('should return false when both are invalid', () => {
      expect(isValidSession(0, 0)).toBe(false)
      expect(isValidSession(-1000, -1)).toBe(false)
    })
  })
})
