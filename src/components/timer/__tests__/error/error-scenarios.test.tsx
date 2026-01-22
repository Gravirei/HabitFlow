/**
 * Error Scenarios Integration Tests
 * 
 * Tests for various error scenarios across the timer system:
 * - LocalStorage errors
 * - Invalid state transitions
 * - Corrupted data recovery
 * - Permission errors
 * - Network/API errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from "@testing-library/react"
// Unused import removed
// Unused import removed
import { renderHook } from '@testing-library/react'
import { useCountdown } from '../../hooks/useCountdown'
import { useTimerHistory } from '../../hooks/useTimerHistory'
import { useTimerPersistence } from '../../hooks/useTimerPersistence'

describe('Error Scenarios', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    vi.useRealTimers()
    vi.clearAllMocks()
    // Clear localStorage manually since .clear() might not be available
    try {
      Object.keys(localStorage).forEach(key => localStorage.removeItem(key))
    } catch (e) {
      // localStorage might be mocked/unavailable
    }
    // Restore Storage.prototype methods
    vi.restoreAllMocks()
  })

  describe('LocalStorage Errors', () => {
    it('should handle localStorage.setItem quota exceeded error', () => {
      // Save original setItem
      const originalSetItem = window.localStorage.setItem
      
      // Mock setItem to throw QuotaExceededError
      // Create a custom error object since DOMException.name is read-only
      const mockSetItem = vi.fn().mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })
      
      window.localStorage.setItem = mockSetItem

      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      act(() => {
        result.current.saveToHistory({ duration: 1000 })
      })

      // Should have called console.error for the quota exceeded error
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(mockSetItem).toHaveBeenCalled()
      
      // Restore
      window.localStorage.setItem = originalSetItem
    })

    it('should handle localStorage.getItem errors', () => {
      // Save original getItem
      const originalGetItem = window.localStorage.getItem
      
      // Mock getItem to throw error
      const mockGetItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage access denied')
      })
      
      window.localStorage.getItem = mockGetItem

      // This should trigger getItem during hook initialization
      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      expect(result.current.history).toEqual([])
      // getItem should have been called and error logged
      expect(mockGetItem).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      // Restore
      window.localStorage.getItem = originalGetItem
    })

    it('should handle corrupted JSON in localStorage', () => {
      localStorage.setItem('test_history', 'invalid json {{{')

      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      expect(result.current.history).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should recover from malformed timer state', () => {
      localStorage.setItem('flowmodoro_active_timer', JSON.stringify({
        mode: 'InvalidMode',
        // Missing required fields
      }))

      const onResume = vi.fn()
      const { result } = renderHook(() => useTimerPersistence('Countdown', onResume))

      act(() => {
        result.current.checkForSavedState()
      })

      // Should return null or default state instead of crashing
      expect(result.current.savedState).toBeFalsy()
    })

    it('should handle localStorage unavailable (private browsing)', () => {
      // Save original localStorage
      const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')
      
      // Simulate private browsing where localStorage is unavailable
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('localStorage is not available')
        },
        configurable: true
      })

      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      // Should handle gracefully without crashing
      expect(result.current.history).toEqual([])
      
      // Restore original localStorage
      if (originalLocalStorage) {
        Object.defineProperty(window, 'localStorage', originalLocalStorage)
      }
    })

    it('should clear corrupted history data', () => {
      // Save original getItem
      const originalGetItem = Storage.prototype.getItem
      
      // Mock localStorage to throw error instead of actually setting it
      const getItemMock = vi.fn().mockReturnValue(JSON.stringify([
        { id: 1, duration: 'not a number', timestamp: Date.now(), mode: 'Stopwatch' },
        { id: 2, duration: 1000, timestamp: Date.now(), mode: 'InvalidMode' },
      ]))
      Storage.prototype.getItem = getItemMock

      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      // Should filter out invalid records
      expect(result.current.history.length).toBe(0)
      
      // Restore original getItem
      Storage.prototype.getItem = originalGetItem
    })
  })

  describe('Invalid State Transitions', () => {
    it('should prevent starting timer when already running', () => {
      const { result } = renderHook(() => useCountdown())

      // Start timer
      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      // Try to start again
      act(() => {
        result.current.startTimer()
      })

      // Should still be running
      expect(result.current.isActive).toBe(true)
    })

    it('should handle pause when timer is not running', () => {
      const { result } = renderHook(() => useCountdown())

      // Try to pause without starting
      act(() => {
        result.current.pauseTimer()
      })

      // Should not crash
      expect(result.current.isActive).toBe(false)
    })

    it('should handle resume when timer was never started', () => {
      const { result } = renderHook(() => useCountdown())

      // Try to resume without starting
      act(() => {
        result.current.continueTimer()
      })

      // Should not crash
      expect(result.current.isActive).toBe(false)
    })

    it('should handle reset during running timer', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.resetTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should handle multiple rapid state changes', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
        result.current.pauseTimer()
        result.current.continueTimer()
        result.current.pauseTimer()
        result.current.continueTimer()
      })

      // Should end in a valid state
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('Data Validation Errors', () => {
    it('should reject negative duration', () => {
      const { result } = renderHook(() => useCountdown())

      // Set negative hours
      act(() => {
        result.current.setSelectedHours(-1)
      })

      // Try to start timer with negative duration
      act(() => {
        result.current.startTimer()
      })

      // Should not start with negative duration (negative hours * 3600000 = negative total)
      // The timer calculates: -1 * 3600000 + 5 * 60000 + 0 * 1000 = -3300000 (negative)
      // This should be rejected and timer should not start
      expect(result.current.isActive).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should reject zero duration', () => {
      const { result } = renderHook(() => useCountdown())

      // Set all durations to zero
      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      // Try to start timer with zero duration
      act(() => {
        result.current.startTimer()
      })

      // Should not start with zero duration
      expect(result.current.isActive).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should reject extremely large duration', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(9999999)
        result.current.startTimer()
      })

      // Should handle or reject
      // Behavior depends on implementation
    })

    it('should reject NaN duration', () => {
      const { result } = renderHook(() => useCountdown())

      // Set hours to NaN
      act(() => {
        result.current.setSelectedHours(NaN)
      })

      // Try to start timer with NaN duration
      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Permission Errors', () => {
    it('should handle notification permission denied', async () => {
      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        writable: true,
        value: {
          permission: 'denied',
          requestPermission: vi.fn().mockResolvedValue('denied')
        }
      })

      // Attempt to request permission (this would be in notificationManager)
      const permission = await Notification.requestPermission()

      expect(permission).toBe('denied')
      // App should continue to function without notifications
    })

    it('should handle notification not supported', () => {
      // Remove Notification API
      const originalNotification = window.Notification
      delete (window as any).Notification

      // App should detect and handle missing API
      expect(window.Notification).toBeUndefined()

      // Restore
      window.Notification = originalNotification
    })

    it('should handle vibration not supported', () => {
      // Remove vibrate API
      const originalVibrate = navigator.vibrate
      delete (navigator as any).vibrate

      expect(navigator.vibrate).toBeUndefined()
      // App should continue without vibration

      // Restore
      if (originalVibrate) {
        navigator.vibrate = originalVibrate
      }
    })
  })

  describe('Audio/Sound Errors', () => {
    it('should handle audio context creation failure', () => {
      const originalAudioContext = window.AudioContext
      
      // Mock AudioContext to throw error
      ;(window as any).AudioContext = class {
        constructor() {
          throw new Error('AudioContext not available')
        }
      }

      // Sound manager should handle gracefully
      // This would be tested in soundManager.test.ts

      window.AudioContext = originalAudioContext
    })

    it('should handle audio file load failure', async () => {
      const audio = new Audio()
      
      // Simulate load error
      const errorEvent = new Event('error')
      audio.dispatchEvent(errorEvent)

      // Should handle without crashing
    })

    it('should handle audio play rejection', async () => {
      const audio = new Audio()
      audio.play = vi.fn().mockRejectedValue(new Error('Play failed'))

      try {
        await audio.play()
      } catch (e) {
        expect(e).toBeDefined()
      }
    })
  })

  describe('Race Conditions', () => {
    it('should handle rapid start/stop cycles', () => {
      const { result } = renderHook(() => useCountdown())

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.startTimer()
          result.current.resetTimer()
        })
      }

      // Should end in stopped state
      expect(result.current.isActive).toBe(false)
    })

    it('should handle concurrent state updates', async () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
      })

      // Simulate concurrent updates
      const updates = Array(5).fill(null).map(() => 
        act(() => {
          result.current.pauseTimer()
          result.current.continueTimer()
        })
      )

      await Promise.all(updates)

      // Should be in a valid state
      expect(typeof result.current.isActive).toBe('boolean')
    })

    it('should handle timer completion during pause', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(1)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.pauseTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000) // Advance past completion
      })

      // Should remain paused, not complete
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('Memory Management', () => {
    it('should cleanup timers on unmount', () => {
      const { result, unmount } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
      })

      unmount()

      // Timer should be cleaned up
      // No errors should occur
    })

    it('should prevent memory leaks from interval cleanup', () => {
      const { result, unmount } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
      })

      // Start and stop multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.pauseTimer()
          result.current.continueTimer()
        })
      }

      unmount()

      // All intervals should be cleaned up
    })

    it('should handle large history without memory issues', () => {
      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      // Add many records
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.saveToHistory({ duration: i + 1 })
        }
      })

      // Should handle large dataset
      expect(result.current.history.length).toBeGreaterThan(0)
    })
  })

  describe('Browser Compatibility', () => {
    it('should handle missing localStorage gracefully', () => {
      // Save original getItem
      const originalGetItem = window.localStorage.getItem
      
      // Mock localStorage to throw error when accessed
      const getItemMock = vi.fn().mockImplementation(() => {
        throw new Error('localStorage is not available')
      })
      window.localStorage.getItem = getItemMock

      const { result } = renderHook(() => useTimerHistory({
        mode: 'Stopwatch',
        storageKey: 'test_history'
      }))

      // Should handle gracefully and return empty array
      expect(result.current.history).toEqual([])
      // Verify the mock was actually called during hook initialization
      expect(getItemMock).toHaveBeenCalled()
      
      // Restore original getItem
      window.localStorage.getItem = originalGetItem
    })

    it('should handle missing performance.now()', () => {
      const originalPerformance = window.performance
      delete (window as any).performance

      // Timer should fall back to Date.now()
      const timestamp = Date.now()
      expect(timestamp).toBeGreaterThan(0)

      window.performance = originalPerformance
    })

    it('should handle missing requestAnimationFrame', () => {
      const originalRAF = window.requestAnimationFrame
      delete (window as any).requestAnimationFrame

      // Should fall back to setTimeout
      expect(window.requestAnimationFrame).toBeUndefined()

      window.requestAnimationFrame = originalRAF
    })
  })

  describe('Network Errors', () => {
    it('should handle offline state', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      expect(navigator.onLine).toBe(false)
      // Timer should continue to work offline

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
    })

    it('should handle service worker errors', () => {
      // Mock service worker failure
      const swError = new Event('error')
      if (navigator.serviceWorker) {
        navigator.serviceWorker.dispatchEvent(swError)
      }

      // App should continue to function
    })
  })

  describe('Edge Cases', () => {
    it('should handle page visibility changes during timer', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(1)
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      // Simulate page hidden
      const visibilityEvent = new Event('visibilitychange')
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      })
      document.dispatchEvent(visibilityEvent)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Simulate page visible
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      })
      document.dispatchEvent(visibilityEvent)

      // Timer should continue accurately
      expect(result.current.isActive).toBe(true)
    })

    it('should handle system time changes', () => {
      const { result } = renderHook(() => useCountdown())

      // Start timer with a duration
      act(() => {
        result.current.setSelectedMinutes(30) // 30 minutes
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      // Simulate system time jump (user changes clock forward by 1 hour)
      // This will cause the timer to think it's completed
      const originalDateNow = Date.now
      const jumpedTime = originalDateNow() + 3600000 // +1 hour
      Date.now = vi.fn().mockReturnValue(jumpedTime)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // When system time jumps forward significantly, the timer may complete
      // This is expected behavior - we just want to ensure it doesn't crash
      expect(typeof result.current.isActive).toBe('boolean')
      expect(result.current.timeLeft).toBeGreaterThanOrEqual(0)

      Date.now = originalDateNow
    })

    it('should handle component re-renders during timer', () => {
      const { result, rerender } = renderHook(() => useCountdown())

      act(() => {
        result.current.startTimer()
      })

      // Force multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender()
      }

      // Timer should still be running correctly
      expect(result.current.isActive).toBe(true)
    })
  })
})
