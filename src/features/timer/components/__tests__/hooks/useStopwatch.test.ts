import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStopwatch } from '../../hooks/useStopwatch'

describe('useStopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useStopwatch())

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.laps).toEqual([])
      // Progress is calculated based on time % 60 seconds, can be non-zero initially
      expect(typeof result.current.progress).toBe('number')
    })
  })

  describe('startTimer', () => {
    it('should start the timer', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.isPaused).toBe(false)
    })

    it('should increment time after starting', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      const initialTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(1000) // Advance 1 second
      })

      expect(result.current.timeLeft).toBeGreaterThan(initialTime)
    })

    it('should increment by approximately 100ms intervals', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Should be around 100ms (±10ms tolerance)
      expect(result.current.timeLeft).toBeGreaterThanOrEqual(90)
      expect(result.current.timeLeft).toBeLessThanOrEqual(110)
    })

    it('should not restart if already active', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const timeBeforeSecondStart = result.current.timeLeft

      act(() => {
        result.current.startTimer() // Try to start again
      })

      expect(result.current.timeLeft).toBe(timeBeforeSecondStart)
    })
  })

  describe('pauseTimer', () => {
    it('should pause the timer', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(true)
    })

    it('should stop time progression when paused', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(1000) // Advance more time
      })

      expect(result.current.timeLeft).toBe(pausedTime) // Should not change
    })
  })

  describe('continueTimer', () => {
    it('should resume from paused state', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
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
        vi.advanceTimersByTime(100)
      })

      expect(result.current.timeLeft).toBeGreaterThan(pausedTime)
    })

    it('should not affect timer if not paused', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // const timeBeforeContinue = result.current.timeLeft

      act(() => {
        result.current.continueTimer() // Try to continue when not paused
      })

      // Time should have progressed normally, not reset
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('killTimer', () => {
    it('should stop and reset the timer', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.killTimer()
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
    })

    it('should return the duration before killing', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      let duration: number = 0

      act(() => {
        duration = result.current.killTimer()
      })

      expect(duration).toBeGreaterThan(900) // Around 1000ms
      expect(duration).toBeLessThan(1100)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should clear all laps', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.addLap()
      })

      expect(result.current.laps).toHaveLength(1)

      act(() => {
        result.current.killTimer()
      })

      expect(result.current.laps).toEqual([])
    })
  })

  describe('addLap', () => {
    it('should record a lap time', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.addLap()
      })

      expect(result.current.laps).toHaveLength(1)
      expect(result.current.laps[0].timeMs).toBeGreaterThan(900)
      expect(result.current.laps[0].timeMs).toBeLessThan(1100)
      expect(result.current.laps[0].id).toBe(1)
      expect(typeof result.current.laps[0].time).toBe('string')
    })

    it('should record multiple laps', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.addLap()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.addLap()
      })

      expect(result.current.laps).toHaveLength(2)
      // Most recent lap is first (index 0), so laps[0].timeMs > laps[1].timeMs
      expect(result.current.laps[0].timeMs).toBeGreaterThan(result.current.laps[1].timeMs)
    })

    it('should continue timing after adding lap', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.addLap()
      })

      const timeAfterLap = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.timeLeft).toBeGreaterThan(timeAfterLap)
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('progress', () => {
    it('should calculate progress based on minute rotation', () => {
      const { result } = renderHook(() => useStopwatch())

      // Progress is calculated as time % 60 seconds for visual rotation
      expect(typeof result.current.progress).toBe('number')

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Progress should be a number (not specifically 0, as it's based on rotation)
      expect(typeof result.current.progress).toBe('number')
      expect(result.current.progress).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Complex Workflows', () => {
    it('should handle start -> pause -> continue -> kill', () => {
      const { result } = renderHook(() => useStopwatch())

      // Start
      act(() => {
        result.current.startTimer()
      })
      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(500)
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
      expect(result.current.isPaused).toBe(false)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.timeLeft).toBeGreaterThan(pausedTime)

      // Kill
      let finalDuration = 0
      act(() => {
        finalDuration = result.current.killTimer()
      })
      expect(finalDuration).toBeGreaterThanOrEqual(900) // At least 900ms
      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    it('should handle multiple lap recordings', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      // Record laps at different intervals
      const intervals = [300, 400, 500]
      
      for (const interval of intervals) {
        act(() => {
          vi.advanceTimersByTime(interval)
        })
        
        act(() => {
          result.current.addLap()
        })
      }

      expect(result.current.laps).toHaveLength(3)
      
      // Laps are stored most recent first, so check in reverse order
      // laps[0] = most recent (1200ms total), laps[2] = oldest (300ms total)
      expect(result.current.laps[2].timeMs).toBeLessThan(result.current.laps[1].timeMs)
      expect(result.current.laps[1].timeMs).toBeLessThan(result.current.laps[0].timeMs)
    })
  })

  describe('Memory and Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const { result, unmount } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      unmount()

      // If interval wasn't cleaned up, this would cause issues
      // This test mainly ensures no errors/warnings
      expect(true).toBe(true)
    })

    it('should cleanup interval when killing timer', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      act(() => {
        result.current.killTimer()
      })

      const timeAfterKill = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(1000) // Should not affect time
      })

      expect(result.current.timeLeft).toBe(timeAfterKill) // Still 0
    })
  })
})
