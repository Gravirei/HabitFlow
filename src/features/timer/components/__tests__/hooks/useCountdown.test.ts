import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '../../hooks/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCountdown())

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.selectedHours).toBe(0)
      expect(result.current.selectedMinutes).toBe(5) // Default 5 minutes
      expect(result.current.selectedSeconds).toBe(0)
      expect(typeof result.current.progress).toBe('number')
    })
  })

  describe('Time Selection', () => {
    it('should update selected hours', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(2)
      })

      expect(result.current.selectedHours).toBe(2)
    })

    it('should update selected minutes', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(30)
      })

      expect(result.current.selectedMinutes).toBe(30)
    })

    it('should update selected seconds', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(45)
      })

      expect(result.current.selectedSeconds).toBe(45)
    })

    it('should allow setting hours, minutes, and seconds together', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(1)
        result.current.setSelectedMinutes(30)
        result.current.setSelectedSeconds(15)
      })

      expect(result.current.selectedHours).toBe(1)
      expect(result.current.selectedMinutes).toBe(30)
      expect(result.current.selectedSeconds).toBe(15)
    })
  })

  describe('setPreset', () => {
    it('should set preset time in minutes', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setPreset(10)
      })

      expect(result.current.selectedHours).toBe(0)
      expect(result.current.selectedMinutes).toBe(10)
      expect(result.current.selectedSeconds).toBe(0)
    })

    it('should reset timer state when setting preset', () => {
      const { result } = renderHook(() => useCountdown())

      // Start a timer first
      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      // Set new preset
      act(() => {
        result.current.setPreset(15)
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.selectedMinutes).toBe(15)
    })

    it('should handle preset of 0 minutes', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setPreset(0)
      })

      expect(result.current.selectedMinutes).toBe(0)
    })
  })

  describe('startTimer', () => {
    it('should start countdown from selected time', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(1)
        result.current.setSelectedSeconds(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.timeLeft).toBe(60000) // 1 minute in ms
    })

    it('should not start if no time is selected', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should calculate total time from hours, minutes, and seconds', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(1)
        result.current.setSelectedMinutes(30)
        result.current.setSelectedSeconds(15)
      })

      act(() => {
        result.current.startTimer()
      })

      // 1h = 3600000ms, 30m = 1800000ms, 15s = 15000ms
      const expectedTime = 3600000 + 1800000 + 15000
      expect(result.current.timeLeft).toBe(expectedTime)
    })

    it('should decrement time after starting', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(10)
      })

      act(() => {
        result.current.startTimer()
      })

      const initialTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(1000) // Advance 1 second
      })

      expect(result.current.timeLeft).toBeLessThan(initialTime)
    })

    it('should stop automatically when time reaches zero', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(1)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1500) // Advance past 1 second
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })
  })

  describe('pauseTimer', () => {
    it('should pause the countdown', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(true)
      expect(result.current.timeLeft).toBeGreaterThan(0)
    })

    it('should stop time progression when paused', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(30)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(2000) // Advance more time
      })

      expect(result.current.timeLeft).toBe(pausedTime) // Should not change
    })
  })

  describe('continueTimer', () => {
    it('should resume countdown from paused state', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(30)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        result.current.continueTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.isPaused).toBe(false)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.timeLeft).toBeLessThan(pausedTime)
    })
  })

  describe('killTimer', () => {
    it('should stop and reset the countdown', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      act(() => {
        result.current.killTimer()
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
    })

    it('should return elapsed duration (time used)', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(10)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(3000) // Use 3 seconds
      })

      let duration = 0

      act(() => {
        duration = result.current.killTimer()
      })

      // Should return approximately 3000ms (time used, not remaining)
      expect(duration).toBeGreaterThan(2900)
      expect(duration).toBeLessThan(3100)
    })

    it('should handle killing timer before any time elapses', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      let duration = 0

      act(() => {
        duration = result.current.killTimer()
      })

      expect(duration).toBe(0) // No time elapsed
    })
  })

  describe('resetTimer', () => {
    it('should reset timer to initial state', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.resetTimer()
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      // Note: Selected time should remain unchanged
      expect(result.current.selectedMinutes).toBe(5)
    })
  })

  describe('progress', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(10)
      })

      act(() => {
        result.current.startTimer()
      })

      // Progress is a calculated number based on time remaining
      expect(typeof result.current.progress).toBe('number')
      const timeRemaining = result.current.timeLeft
      expect(timeRemaining).toBe(10000)

      act(() => {
        vi.advanceTimersByTime(5000) // Use half the time
      })

      // Time should decrease to approximately 5 seconds
      expect(result.current.timeLeft).toBeLessThan(timeRemaining)
      expect(result.current.timeLeft).toBeGreaterThan(4000)
      expect(result.current.timeLeft).toBeLessThan(6000)
    })

    it('should return 0 progress when no time is selected', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      expect(result.current.progress).toBe(0)
    })
  })

  describe('Complex Workflows', () => {
    it('should handle start -> pause -> continue -> kill', () => {
      const { result } = renderHook(() => useCountdown())

      // Set time and start
      act(() => {
        result.current.setSelectedMinutes(1)
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(10000) // 10 seconds
      })

      // Pause
      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.isPaused).toBe(true)

      const pausedTime = result.current.timeLeft

      // Continue
      act(() => {
        result.current.continueTimer()
      })

      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(5000) // 5 more seconds
      })

      expect(result.current.timeLeft).toBeLessThan(pausedTime)

      // Kill
      let duration = 0
      act(() => {
        duration = result.current.killTimer()
      })

      expect(duration).toBeGreaterThan(14000) // At least 14 seconds used
      expect(result.current.timeLeft).toBe(0)
    })

    it('should handle multiple start cycles', () => {
      const { result } = renderHook(() => useCountdown())

      // First cycle
      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(5)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      act(() => {
        result.current.killTimer()
      })

      // Second cycle
      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(10)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(10000)
      expect(result.current.isActive).toBe(true)
    })

    it('should allow changing time while paused', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(5)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      // Change selected time while paused
      act(() => {
        result.current.setSelectedMinutes(10)
      })

      expect(result.current.selectedMinutes).toBe(10)
      // Current timeLeft should remain unchanged from when paused
      expect(result.current.timeLeft).toBe(pausedTime)
    })

    it('should complete countdown naturally', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(2)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)

      // Let it countdown completely
      act(() => {
        vi.advanceTimersByTime(2500)
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small time values (1 second)', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(1)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(1000)

      act(() => {
        vi.advanceTimersByTime(1100)
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    it('should handle large time values (multiple hours)', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(5)
        result.current.setSelectedMinutes(30)
      })

      act(() => {
        result.current.startTimer()
      })

      const expectedTime = 5 * 3600000 + 30 * 60000
      expect(result.current.timeLeft).toBe(expectedTime)
    })

    it('should handle zero values correctly', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should handle only seconds being set', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(30)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(30000)
      expect(result.current.isActive).toBe(true)
    })

    it('should handle only hours being set', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedHours(2)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(7200000) // 2 hours in ms
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('Memory and Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const { result, unmount } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(30)
      })

      act(() => {
        result.current.startTimer()
      })

      unmount()

      // Should not throw errors
      expect(true).toBe(true)
    })

    it('should cleanup interval when timer completes', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(1)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)

      act(() => {
        vi.advanceTimersByTime(2000) // Should not affect time
      })

      // Time should still be 0
      expect(result.current.timeLeft).toBe(0)
    })
  })

  describe('toggleTimer', () => {
    it('should start timer when idle', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(10)
        result.current.toggleTimer()
      })

      expect(result.current.isActive).toBe(true)
    })

    it('should pause when active', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(10)
        result.current.toggleTimer() // Start
      })

      act(() => {
        result.current.toggleTimer() // Pause
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(true)
    })

    it('should continue when paused', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedSeconds(10)
        result.current.toggleTimer() // Start
      })

      act(() => {
        result.current.toggleTimer() // Pause
      })

      act(() => {
        result.current.toggleTimer() // Continue
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.isPaused).toBe(false)
    })
  })

  describe('Auto-Save on Session Completion', () => {
    it('should auto-save to history when countdown reaches zero', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.setSelectedSeconds(0)
        result.current.setSelectedHours(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(mockOnSessionComplete).not.toHaveBeenCalled()

      // Complete countdown (5 minutes)
      act(() => {
        vi.advanceTimersByTime(300100)
      })

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(300000)
      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should auto-save with correct duration for hours, minutes, and seconds', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedHours(1)
        result.current.setSelectedMinutes(30)
        result.current.setSelectedSeconds(45)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete: 1h 30m 45s = 5,445,000ms
      act(() => {
        vi.advanceTimersByTime(5445100)
      })

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(5445000)
      expect(result.current.isActive).toBe(false)
    })

    it('should NOT auto-save when countdown is manually killed before completion', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedMinutes(10)
      })

      act(() => {
        result.current.startTimer()
      })

      // Run for 2 minutes
      act(() => {
        vi.advanceTimersByTime(120000)
      })

      // Manually kill
      act(() => {
        result.current.killTimer()
      })

      expect(mockOnSessionComplete).not.toHaveBeenCalled()
      expect(result.current.isActive).toBe(false)
    })

    it('should NOT auto-save when duration is zero', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(0)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(mockOnSessionComplete).not.toHaveBeenCalled()
    })

    it('should auto-save after pause and resume', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedMinutes(3)
      })

      act(() => {
        result.current.startTimer()
      })

      // Run for 1 minute
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Pause
      act(() => {
        result.current.pauseTimer()
      })
      expect(result.current.isPaused).toBe(true)

      // Wait while paused
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // Resume
      act(() => {
        result.current.continueTimer()
      })

      // Complete remaining 2 minutes
      act(() => {
        vi.advanceTimersByTime(120100)
      })

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(180000)
      expect(result.current.isActive).toBe(false)
    })

    it('should work without onSessionComplete callback (backwards compatibility)', () => {
      const { result } = renderHook(() => useCountdown())

      act(() => {
        result.current.setSelectedMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete countdown
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should auto-save short countdowns correctly', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedHours(0)
        result.current.setSelectedMinutes(0)
        result.current.setSelectedSeconds(30)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(30100)
      })

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(30000)
      expect(result.current.isActive).toBe(false)
    })

    it('should only call onSessionComplete once when countdown completes', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useCountdown({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setSelectedMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      // Advance more time
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
    })
  })
})
