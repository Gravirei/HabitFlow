/**
 * Timer Drift Edge Case Tests
 * 
 * Tests timer behavior under unusual conditions:
 * - System sleep/wake
 * - Tab backgrounding
 * - Large time jumps
 * - Clock adjustments
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '../../hooks/useCountdown'
import { useStopwatch } from '../../hooks/useStopwatch'
import { getCurrentTime } from '../../hooks/useBaseTimer'

describe('Timer Drift Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Countdown Timer - System Sleep', () => {
    it('should handle system sleep and wake correctly', () => {
      const { result } = renderHook(() => useCountdown())

      // Set 5 minutes countdown
      act(() => {
        result.current.setSelectedMinutes(5)
      })

      // Start timer
      act(() => {
        result.current.startTimer()
      })

      // Advance 2 minutes normally
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      // Should have 3 minutes left
      expect(result.current.timeLeft).toBeGreaterThan(2.9 * 60 * 1000)
      expect(result.current.timeLeft).toBeLessThan(3.1 * 60 * 1000)

      // Simulate system sleep (time jump forward 10 minutes)
      const currentTime = Date.now()
      vi.setSystemTime(currentTime + 10 * 60 * 1000)

      // Advance timers to trigger interval
      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Timer should be at 0 (expired during sleep)
      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    it.skip('should maintain accuracy after tab backgrounding', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(30)
      })

      act(() => {
        result.current.startTimer()
      })

      // Advance 10 seconds
      act(() => {
        vi.advanceTimersByTime(10 * 1000)
      })

      expect(result.current.timeLeft).toBeGreaterThan(19 * 1000)
      expect(result.current.timeLeft).toBeLessThan(21 * 1000)

      // Simulate tab backgrounding (timer intervals may be throttled)
      // But getCurrentTime() should still be accurate
      const currentTime = Date.now()
      vi.setSystemTime(currentTime + 5 * 1000)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Should adjust to real elapsed time (not interval time)
      expect(result.current.timeLeft).toBeGreaterThan(14 * 1000)
      expect(result.current.timeLeft).toBeLessThan(16 * 1000)
    })
  })

  describe('Stopwatch Timer - Large Time Jumps', () => {
    it.skip('should handle large forward time jump', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      // Run for 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.timeElapsed).toBeGreaterThan(900)
      expect(result.current.timeElapsed).toBeLessThan(1100)

      // Simulate large time jump (e.g., NTP correction)
      const currentTime = Date.now()
      vi.setSystemTime(currentTime + 1000 * 1000) // Jump 1000 seconds forward

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Stopwatch should continue from real elapsed time
      // Note: Large jumps might show unusual elapsed time
      expect(result.current.timeElapsed).toBeGreaterThan(1000)
    })

    it.skip('should not go negative on backward time jump', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const elapsed = result.current.timeElapsed

      // Simulate backward time jump (clock adjusted back)
      const currentTime = Date.now()
      vi.setSystemTime(currentTime - 10 * 1000)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Elapsed should not go negative or wildly incorrect
      // Implementation should handle this gracefully
      expect(result.current.timeElapsed).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Timer Accuracy', () => {
    it.skip('should maintain sub-second accuracy', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(10)
      })

      act(() => {
        result.current.startTimer()
      })

      // Check accuracy at multiple points
      const measurements: number[] = []

      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })
        measurements.push(result.current.timeLeft)
      }

      // Timer should be completed
      expect(result.current.timeLeft).toBe(0)

      // Check that each measurement was accurate (within 100ms tolerance)
      measurements.forEach((time, index) => {
        const expected = (9 - index) * 1000
        const tolerance = 100
        expect(Math.abs(time - expected)).toBeLessThan(tolerance)
      })
    })

    it('should use getCurrentTime for consistency', () => {
      // getCurrentTime should return consistent values
      const time1 = getCurrentTime()
      const time2 = getCurrentTime()
      const time3 = getCurrentTime()

      expect(time2).toBeGreaterThanOrEqual(time1)
      expect(time3).toBeGreaterThanOrEqual(time2)

      // Should be monotonically increasing
      expect(time3 - time1).toBeLessThan(10) // Less than 10ms between calls
    })
  })

  describe('Pause and Resume After Time Jump', () => {
    it('should handle pause/resume correctly after time jump', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
      })

      act(() => {
        result.current.startTimer()
      })

      // Run for 1 minute
      act(() => {
        vi.advanceTimersByTime(60 * 1000)
      })

      // Pause
      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.isPaused).toBe(true)
      const timeWhenPaused = result.current.timeLeft

      // Simulate time jump while paused (should not affect paused time)
      vi.setSystemTime(Date.now() + 30 * 1000)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Time should remain the same while paused
      expect(result.current.timeLeft).toBe(timeWhenPaused)

      // Resume
      act(() => {
        result.current.continueTimer()
      })

      // Should continue from where it paused
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.timeLeft).toBeLessThan(timeWhenPaused)
    })
  })
})
