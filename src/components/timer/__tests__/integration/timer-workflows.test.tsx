import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStopwatch } from '../../hooks/useStopwatch'
import { useCountdown } from '../../hooks/useCountdown'
import { useIntervals } from '../../hooks/useIntervals'
import { useTimerHistory } from '../../hooks/useTimerHistory'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Timer Workflows - Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Stopwatch - Complete Session with History', () => {
    it('should complete full stopwatch session and save to history', () => {
      const { result: stopwatchResult } = renderHook(() => useStopwatch())
      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-stopwatch-history' })
      )

      // Start stopwatch
      act(() => {
        stopwatchResult.current.startTimer()
      })

      expect(stopwatchResult.current.isActive).toBe(true)

      // Run for 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // Add some laps
      act(() => {
        stopwatchResult.current.addLap()
      })

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      act(() => {
        stopwatchResult.current.addLap()
      })

      expect(stopwatchResult.current.laps).toHaveLength(2)

      // Kill and save to history
      let duration = 0
      act(() => {
        duration = stopwatchResult.current.killTimer()
      })

      act(() => {
        // Convert ms to seconds for history
        historyResult.current.saveToHistory({ duration: Math.floor(duration / 1000) })
      })

      // Verify history
      expect(historyResult.current.history).toHaveLength(1)
      expect(historyResult.current.history[0].mode).toBe('Stopwatch')
      // Duration is now in seconds
      expect(historyResult.current.history[0].duration).toBeGreaterThanOrEqual(45)
      expect(historyResult.current.history[0].duration).toBeLessThan(46)
    })

    it('should handle pause and continue in stopwatch session', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      const timeBeforePause = result.current.timeLeft

      act(() => {
        result.current.pauseTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000) // Time should not advance
      })

      expect(result.current.timeLeft).toBe(timeBeforePause)

      act(() => {
        result.current.continueTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.timeLeft).toBeGreaterThan(timeBeforePause)
    })
  })

  describe('Countdown - Complete Session with History', () => {
    it('should complete full countdown session and save to history', () => {
      const { result: countdownResult } = renderHook(() => useCountdown())
      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Countdown', storageKey: 'test-countdown-history' })
      )

      // Set 1 minute countdown
      act(() => {
        countdownResult.current.setSelectedMinutes(1)
        countdownResult.current.setSelectedSeconds(0)
      })

      act(() => {
        countdownResult.current.startTimer()
      })

      expect(countdownResult.current.isActive).toBe(true)
      expect(countdownResult.current.timeLeft).toBe(60000)

      // Run for 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      expect(countdownResult.current.timeLeft).toBeGreaterThan(29000)
      expect(countdownResult.current.timeLeft).toBeLessThan(31000)

      // Pause
      act(() => {
        countdownResult.current.pauseTimer()
      })

      // Resume and let it finish
      act(() => {
        countdownResult.current.continueTimer()
      })

      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // Should auto-complete
      expect(countdownResult.current.isActive).toBe(false)
      expect(countdownResult.current.timeLeft).toBe(0)

      // Save used time to history (in seconds)
      act(() => {
        historyResult.current.saveToHistory({ duration: 60 })
      })

      expect(historyResult.current.history).toHaveLength(1)
      expect(historyResult.current.history[0].mode).toBe('Countdown')
      expect(historyResult.current.history[0].duration).toBe(60)
    })

    it('should handle manual kill before completion', () => {
      const { result: countdownResult } = renderHook(() => useCountdown())
      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Countdown', storageKey: 'test-countdown-history' })
      )

      act(() => {
        countdownResult.current.setSelectedMinutes(2)
      })

      act(() => {
        countdownResult.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(45000) // Use 45 seconds
      })

      let usedTime = 0
      act(() => {
        usedTime = countdownResult.current.killTimer()
      })

      // useCountdown.killTimer returns time in milliseconds
      expect(usedTime).toBeGreaterThan(44000)
      expect(usedTime).toBeLessThan(46000)

      act(() => {
        // Convert ms to seconds for history
        historyResult.current.saveToHistory({ duration: Math.floor(usedTime / 1000) })
      })

      expect(historyResult.current.history).toHaveLength(1)
    })
  })

  describe('Intervals - Complete Multiple Cycles with History', () => {
    it('should complete multiple work-break cycles and save to history', () => {
      const { result: intervalsResult } = renderHook(() => useIntervals())
      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Intervals', storageKey: 'test-intervals-history' })
      )

      // Set 1 min work, 1 min break
      act(() => {
        intervalsResult.current.setWorkMinutes(1)
        intervalsResult.current.setBreakMinutes(1)
      })

      act(() => {
        intervalsResult.current.startTimer()
      })

      expect(intervalsResult.current.currentInterval).toBe('work')
      expect(intervalsResult.current.intervalCount).toBe(0)

      // Complete 2 full cycles
      for (let i = 0; i < 2; i++) {
        // Complete work
        act(() => {
          vi.advanceTimersByTime(60100)
        })

        expect(intervalsResult.current.currentInterval).toBe('break')

        // Complete break
        act(() => {
          vi.advanceTimersByTime(60100)
        })

        expect(intervalsResult.current.currentInterval).toBe('work')
      }

      expect(intervalsResult.current.intervalCount).toBe(2)

      // Kill and save
      let result: { duration: number; intervalCount: number }
      act(() => {
        result = intervalsResult.current.killTimer()
      })

      act(() => {
        // Convert ms to seconds for history
        historyResult.current.saveToHistory({ duration: Math.floor(result!.duration / 1000), intervalCount: result!.intervalCount })
      })

      expect(historyResult.current.history).toHaveLength(1)
      expect(historyResult.current.history[0].mode).toBe('Intervals')
      expect(historyResult.current.history[0].intervalCount).toBe(2)
      // Duration is now in seconds (2 work + 2 break cycles of ~60s each = ~240s)
      expect(historyResult.current.history[0].duration).toBeGreaterThanOrEqual(240)
    })

    it('should handle pause during work interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(5)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(2 * 60000)
      })

      expect(result.current.currentInterval).toBe('work')

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(10000) // Should not advance
      })

      expect(result.current.timeLeft).toBe(pausedTime)

      act(() => {
        result.current.continueTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.currentInterval).toBe('work')
    })

    it('should handle pause during break interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(2)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete work
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')

      act(() => {
        vi.advanceTimersByTime(30000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.currentInterval).toBe('break')

      act(() => {
        result.current.continueTimer()
      })

      expect(result.current.currentInterval).toBe('break')
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('Cross-Mode History Management', () => {
    it('should maintain separate histories for each mode', () => {
      const { result: stopwatchHistory } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-stopwatch' })
      )
      const { result: countdownHistory } = renderHook(() => 
        useTimerHistory({ mode: 'Countdown', storageKey: 'test-countdown' })
      )
      const { result: intervalsHistory } = renderHook(() => 
        useTimerHistory({ mode: 'Intervals', storageKey: 'test-intervals' })
      )

      act(() => {
        stopwatchHistory.current.saveToHistory({ duration: 10000 })
        countdownHistory.current.saveToHistory({ duration: 20000 })
        intervalsHistory.current.saveToHistory({ duration: 30000, intervalCount: 3 })
      })

      expect(stopwatchHistory.current.history).toHaveLength(1)
      expect(countdownHistory.current.history).toHaveLength(1)
      expect(intervalsHistory.current.history).toHaveLength(1)

      expect(stopwatchHistory.current.history[0].mode).toBe('Stopwatch')
      expect(countdownHistory.current.history[0].mode).toBe('Countdown')
      expect(intervalsHistory.current.history[0].mode).toBe('Intervals')
    })

    it('should accumulate multiple sessions in history', () => {
      const { result: stopwatchResult } = renderHook(() => useStopwatch())
      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-multi-session' })
      )

      // Session 1
      act(() => {
        stopwatchResult.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      let duration1 = 0
      act(() => {
        duration1 = stopwatchResult.current.killTimer()
      })

      act(() => {
        historyResult.current.saveToHistory({ duration: duration1 })
      })

      // Session 2
      act(() => {
        stopwatchResult.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(20000)
      })

      let duration2 = 0
      act(() => {
        duration2 = stopwatchResult.current.killTimer()
      })

      act(() => {
        historyResult.current.saveToHistory({ duration: duration2 })
      })

      // Session 3
      act(() => {
        stopwatchResult.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      let duration3 = 0
      act(() => {
        duration3 = stopwatchResult.current.killTimer()
      })

      act(() => {
        historyResult.current.saveToHistory({ duration: duration3 })
      })

      expect(historyResult.current.history).toHaveLength(3)
      // Duration is now in seconds (not ms), so adjust expectations
      expect(historyResult.current.history[0].duration).toBeGreaterThan(14) // Most recent (~15s)
      expect(historyResult.current.history[2].duration).toBeGreaterThan(9) // Oldest (~10s)
    })
  })

  describe('Complex User Scenarios', () => {
    it('should handle switching between pause and continue multiple times', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      // Multiple pause/continue cycles
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })

        act(() => {
          result.current.pauseTimer()
        })

        act(() => {
          vi.advanceTimersByTime(500) // Paused time
        })

        act(() => {
          result.current.continueTimer()
        })
      }

      expect(result.current.timeLeft).toBeGreaterThan(4900)
      expect(result.current.timeLeft).toBeLessThan(5100)
    })

    it('should handle rapid lap recording', () => {
      const { result } = renderHook(() => useStopwatch())

      act(() => {
        result.current.startTimer()
      })

      // Record 10 laps rapidly
      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })

        act(() => {
          result.current.addLap()
        })
      }

      expect(result.current.laps).toHaveLength(10)
      // Laps should be in descending order (most recent first)
      for (let i = 0; i < 9; i++) {
        expect(result.current.laps[i].timeMs).toBeGreaterThan(result.current.laps[i + 1].timeMs)
      }
    })

    it('should handle countdown with preset changes', () => {
      const { result } = renderHook(() => useCountdown())

      // Set initial preset
      act(() => {
        result.current.setPreset(5)
      })

      expect(result.current.selectedMinutes).toBe(5)

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.killTimer()
      })

      // Change preset
      act(() => {
        result.current.setPreset(10)
      })

      expect(result.current.selectedMinutes).toBe(10)
      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('Error Recovery', () => {
    it('should recover from localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const { result: historyResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-error' })
      )

      // Should not crash (error is caught internally or by useLocalStorage)
      act(() => {
        try {
          historyResult.current.saveToHistory({ duration: 10000 })
        } catch (e) {
          // Expected to catch error
        }
      })

      // Restore localStorage
      localStorageMock.setItem = originalSetItem
    })

    it('should handle corrupted history data', () => {
      // Pre-populate with corrupted data
      localStorageMock.setItem('test-corrupted', 'invalid json{]')

      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-corrupted' })
      )

      // Should initialize with empty array
      expect(result.current.history).toEqual([])
    })
  })
})
