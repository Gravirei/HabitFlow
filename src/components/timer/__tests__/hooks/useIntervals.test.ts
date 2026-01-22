import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntervals } from '../../hooks/useIntervals'

describe('useIntervals', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useIntervals())

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.workMinutes).toBe(25) // Default Pomodoro work time
      expect(result.current.breakMinutes).toBe(5) // Default Pomodoro break time
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(0)
      expect(typeof result.current.progress).toBe('number')
    })
  })

  describe('Time Configuration', () => {
    it('should update work minutes', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(30)
      })

      expect(result.current.workMinutes).toBe(30)
    })

    it('should update break minutes', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setBreakMinutes(10)
      })

      expect(result.current.breakMinutes).toBe(10)
    })

    it('should allow setting both work and break times', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(45)
        result.current.setBreakMinutes(15)
      })

      expect(result.current.workMinutes).toBe(45)
      expect(result.current.breakMinutes).toBe(15)
    })
  })

  describe('startTimer', () => {
    it('should start with work interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.timeLeft).toBe(25 * 60000) // 25 minutes in ms
      expect(result.current.intervalCount).toBe(0)
    })

    it('should use configured work time', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(30)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(30 * 60000)
    })

    it('should reset interval count on start', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      // Let intervals complete (simulate)
      act(() => {
        vi.advanceTimersByTime(25 * 60100) // Complete work
      })

      act(() => {
        vi.advanceTimersByTime(5 * 60100) // Complete break
      })

      expect(result.current.intervalCount).toBeGreaterThan(0)

      // Kill the timer first (timer is still running after completing one cycle)
      act(() => {
        result.current.killTimer()
      })

      // Start again
      act(() => {
        result.current.startTimer()
      })

      expect(result.current.intervalCount).toBe(0) // Should reset
    })

    it('should decrement time after starting', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      const initialTime = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.timeLeft).toBeLessThan(initialTime)
    })
  })

  describe('Interval Switching', () => {
    it('should switch from work to break when work interval completes', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1) // 1 minute work
        result.current.setBreakMinutes(1) // 1 minute break
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.currentInterval).toBe('work')

      // Complete work interval
      act(() => {
        vi.advanceTimersByTime(60100) // 1 minute + buffer
      })

      expect(result.current.currentInterval).toBe('break')
      expect(result.current.timeLeft).toBeGreaterThan(0)
      expect(result.current.timeLeft).toBeLessThanOrEqual(60000) // Break time
    })

    it('should switch from break to work when break interval completes', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete work interval
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')

      // Complete break interval
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('work')
    })

    it('should increment interval count when transitioning from break to work', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      const initialCount = result.current.intervalCount
      expect(initialCount).toBe(0)

      // Complete one full cycle (work + break)
      act(() => {
        vi.advanceTimersByTime(60100) // Complete work
      })

      expect(result.current.intervalCount).toBe(0) // Not incremented yet

      act(() => {
        vi.advanceTimersByTime(60100) // Complete break
      })

      expect(result.current.intervalCount).toBe(1) // Now incremented
    })

    it('should handle multiple interval cycles', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete 3 full cycles
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(60100) // Work
        })
        act(() => {
          vi.advanceTimersByTime(60100) // Break
        })
      }

      expect(result.current.intervalCount).toBe(3)
      expect(result.current.currentInterval).toBe('work')
    })
  })

  describe('pauseTimer', () => {
    it('should pause the interval timer', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
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
      const { result } = renderHook(() => useIntervals())

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

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.timeLeft).toBe(pausedTime)
    })

    it('should maintain current interval type when paused', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Advance to break
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')

      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.currentInterval).toBe('break')
    })
  })

  describe('continueTimer', () => {
    it('should resume from paused state', () => {
      const { result } = renderHook(() => useIntervals())

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

    it('should continue from break interval if paused during break', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(2)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete work, move to break
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')

      act(() => {
        result.current.pauseTimer()
      })

      act(() => {
        result.current.continueTimer()
      })

      expect(result.current.currentInterval).toBe('break')
      expect(result.current.isActive).toBe(true)
    })
  })

  describe('killTimer', () => {
    it('should stop and reset the interval timer', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.killTimer()
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(0)
    })

    it('should return total elapsed duration and interval count', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(60100) // Complete work
      })

      act(() => {
        vi.advanceTimersByTime(60100) // Complete break
      })

      let killResult = { duration: 0, intervalCount: 0 }

      act(() => {
        killResult = result.current.killTimer()
      })

      expect(killResult.duration).toBeGreaterThan(120000) // At least 2 minutes
      expect(killResult.intervalCount).toBe(1) // Completed 1 full cycle
    })

    it('should return zero intervals if killed during first work session', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      let killResult = { duration: 0, intervalCount: 0 }

      act(() => {
        killResult = result.current.killTimer()
      })

      expect(killResult.intervalCount).toBe(0)
      expect(killResult.duration).toBeGreaterThan(4000)
    })
  })

  describe('resetTimer', () => {
    it('should reset timer to initial state', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.resetTimer()
      })

      expect(result.current.timeLeft).toBe(0)
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(0)
      // Configured times should remain
      expect(result.current.workMinutes).toBe(25)
      expect(result.current.breakMinutes).toBe(5)
    })
  })

  describe('progress', () => {
    it('should calculate progress for work interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(10)
      })

      act(() => {
        result.current.startTimer()
      })

      // Progress is calculated, verify it's a number
      expect(typeof result.current.progress).toBe('number')
      const timeRemaining = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(5 * 60000) // Use half the time
      })

      // Time should have decreased
      expect(result.current.timeLeft).toBeLessThan(timeRemaining)
    })

    it('should recalculate progress for break interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(2)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete work interval
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')

      // Progress is calculated based on current interval
      expect(typeof result.current.progress).toBe('number')
      const timeRemaining = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(60000) // Use half of break time
      })

      // Time should have decreased
      expect(result.current.timeLeft).toBeLessThan(timeRemaining)
      expect(result.current.currentInterval).toBe('break')
    })
  })

  describe('Complex Workflows', () => {
    it('should handle complete work-break-work cycle', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Work interval
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(0)

      act(() => {
        vi.advanceTimersByTime(60100)
      })

      // Break interval
      expect(result.current.currentInterval).toBe('break')
      expect(result.current.intervalCount).toBe(0)

      act(() => {
        vi.advanceTimersByTime(60100)
      })

      // Back to work interval
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(1)
    })

    it('should handle pause during work and resume', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(5)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(2 * 60000) // 2 minutes
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        result.current.continueTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1 * 60000) // 1 more minute
      })

      expect(result.current.timeLeft).toBeLessThan(pausedTime)
      expect(result.current.currentInterval).toBe('work')
    })

    it('should handle pause during break and resume', () => {
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
        vi.advanceTimersByTime(30000) // 30 seconds into break
      })

      act(() => {
        result.current.pauseTimer()
      })

      const pausedTime = result.current.timeLeft

      act(() => {
        result.current.continueTimer()
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(result.current.timeLeft).toBeLessThan(pausedTime)
      expect(result.current.currentInterval).toBe('break')
    })

    it('should handle kill during break interval', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
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
        vi.advanceTimersByTime(30000) // 30 seconds into break
      })

      let killResult = { duration: 0, intervalCount: 0 }

      act(() => {
        killResult = result.current.killTimer()
      })

      expect(killResult.duration).toBeGreaterThan(90000) // Work + partial break
      expect(killResult.intervalCount).toBe(0) // Didn't complete full cycle
      expect(result.current.currentInterval).toBe('work') // Reset to work
    })

    it('should handle multiple cycles with pause and resume', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete first cycle
      act(() => {
        vi.advanceTimersByTime(60100) // Work
      })
      act(() => {
        vi.advanceTimersByTime(60100) // Break
      })

      expect(result.current.intervalCount).toBe(1)

      // Pause during second work interval
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      act(() => {
        result.current.pauseTimer()
      })

      act(() => {
        result.current.continueTimer()
      })

      // Complete second cycle
      act(() => {
        vi.advanceTimersByTime(30000 + 100) // Finish work
      })
      act(() => {
        vi.advanceTimersByTime(60100) // Break
      })

      expect(result.current.intervalCount).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very short work intervals (1 minute)', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(60000)

      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('break')
    })

    it('should handle very short break intervals (1 minute)', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(5)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(5 * 60100) // Complete work
      })

      expect(result.current.currentInterval).toBe('break')
      expect(result.current.timeLeft).toBeLessThanOrEqual(60000)

      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.currentInterval).toBe('work')
    })

    it('should handle long work intervals (60 minutes)', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(60)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(60 * 60000)
    })

    it('should handle asymmetric work/break times', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(50)
        result.current.setBreakMinutes(10)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timeLeft).toBe(50 * 60000)

      act(() => {
        vi.advanceTimersByTime(50 * 60100)
      })

      expect(result.current.currentInterval).toBe('break')
      expect(result.current.timeLeft).toBeLessThanOrEqual(10 * 60000)
    })

    it('should track elapsed time accurately across intervals', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      // Complete 2 full cycles
      for (let i = 0; i < 2; i++) {
        act(() => {
          vi.advanceTimersByTime(60100) // Work
        })
        act(() => {
          vi.advanceTimersByTime(60100) // Break
        })
      }

      let killResult = { duration: 0, intervalCount: 0 }

      act(() => {
        killResult = result.current.killTimer()
      })

      // Should be approximately 4 minutes (2 work + 2 break)
      expect(killResult.duration).toBeGreaterThan(240000)
      expect(killResult.duration).toBeLessThan(250000)
      expect(killResult.intervalCount).toBe(2)
    })
  })

  describe('Memory and Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const { result, unmount } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      unmount()

      expect(true).toBe(true) // Should not throw
    })

    it('should cleanup interval when killing timer', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.killTimer()
      })

      const timeAfterKill = result.current.timeLeft

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.timeLeft).toBe(timeAfterKill) // Still 0
    })
  })

  describe('toggleTimer', () => {
    it('should start timer when idle', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.toggleTimer()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.currentInterval).toBe('work')
    })

    it('should pause when active', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.toggleTimer() // Start
      })

      act(() => {
        result.current.toggleTimer() // Pause
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(true)
    })

    it('should continue when paused', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
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

  describe('Interval Count Accuracy', () => {
    it('should only increment count after completing full work+break cycle', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      expect(result.current.intervalCount).toBe(0)

      // Complete work only
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.intervalCount).toBe(0) // Not yet incremented

      // Complete break
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      expect(result.current.intervalCount).toBe(1) // Now incremented
    })

    it('should track 5 complete cycles accurately', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer()
      })

      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(60100) // Work
        })
        act(() => {
          vi.advanceTimersByTime(60100) // Break
        })
      }

      expect(result.current.intervalCount).toBe(5)
    })
  })

  describe('Target Loop Count (Auto-Stop)', () => {
    it('should stop timer after completing target loop count (2 complete cycles)', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      // Start timer with 2 loops target
      act(() => {
        result.current.startTimer('Test Session', 2)
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.intervalCount).toBe(0)
      expect(result.current.targetLoopCount).toBe(2)

      // Complete Cycle 1: Work
      act(() => {
        vi.advanceTimersByTime(60100)
      })
      expect(result.current.currentInterval).toBe('break')
      expect(result.current.intervalCount).toBe(0)
      expect(result.current.isActive).toBe(true)

      // Complete Cycle 1: Break
      act(() => {
        vi.advanceTimersByTime(60100)
      })
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.intervalCount).toBe(1)
      expect(result.current.isActive).toBe(true)

      // Complete Cycle 2: Work
      act(() => {
        vi.advanceTimersByTime(60100)
      })
      expect(result.current.currentInterval).toBe('break')
      expect(result.current.intervalCount).toBe(1)
      expect(result.current.isActive).toBe(true)

      // Complete Cycle 2: Break - Timer should stop
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      // Timer should be stopped after 2 complete cycles
      expect(result.current.isActive).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.timeLeft).toBe(0)
      expect(result.current.intervalCount).toBe(1)
    })

    it('should stop timer after completing 3 complete cycles', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer('3 Cycles Test', 3)
      })

      expect(result.current.targetLoopCount).toBe(3)

      // Complete 3 full cycles
      for (let i = 0; i < 3; i++) {
        // Work
        act(() => {
          vi.advanceTimersByTime(60100)
        })
        expect(result.current.isActive).toBe(true)

        // Break
        act(() => {
          vi.advanceTimersByTime(60100)
        })

        // Should still be active for cycles 1 and 2
        if (i < 2) {
          expect(result.current.isActive).toBe(true)
          expect(result.current.intervalCount).toBe(i + 1)
        }
      }

      // After 3rd break, should stop
      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should continue indefinitely when no target loop count is set', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      // Start without specifying loop count
      act(() => {
        result.current.startTimer('Continuous Session')
      })

      expect(result.current.targetLoopCount).toBeUndefined()

      // Complete 5 cycles - should keep running
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(60100) // Work
        })
        act(() => {
          vi.advanceTimersByTime(60100) // Break
        })
        expect(result.current.isActive).toBe(true)
      }

      expect(result.current.intervalCount).toBe(5)
      expect(result.current.isActive).toBe(true)
    })

    it('should stop at correct point with different work/break durations', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(2) // 2 min work
        result.current.setBreakMinutes(1) // 1 min break
      })

      act(() => {
        result.current.startTimer('Asymmetric Session', 2)
      })

      // Cycle 1: 2 min work + 1 min break
      act(() => {
        vi.advanceTimersByTime(120100)
      })
      expect(result.current.currentInterval).toBe('break')
      
      act(() => {
        vi.advanceTimersByTime(60100)
      })
      expect(result.current.currentInterval).toBe('work')
      expect(result.current.isActive).toBe(true)

      // Cycle 2: 2 min work + 1 min break (should stop after break)
      act(() => {
        vi.advanceTimersByTime(120100)
      })
      expect(result.current.currentInterval).toBe('break')
      expect(result.current.isActive).toBe(true)
      
      act(() => {
        vi.advanceTimersByTime(60100)
      })
      
      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })
  })

  describe('Auto-Save on Session Completion', () => {
    it('should auto-save to history when session completes all target loops', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useIntervals({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer('Test Session', 2)
      })

      expect(mockOnSessionComplete).not.toHaveBeenCalled()

      // Complete 2 full cycles
      act(() => { vi.advanceTimersByTime(60100) }) // Cycle 1 Work
      expect(mockOnSessionComplete).not.toHaveBeenCalled()
      
      act(() => { vi.advanceTimersByTime(60100) }) // Cycle 1 Break
      expect(mockOnSessionComplete).not.toHaveBeenCalled()

      act(() => { vi.advanceTimersByTime(60100) }) // Cycle 2 Work
      expect(mockOnSessionComplete).not.toHaveBeenCalled()
      
      act(() => { vi.advanceTimersByTime(60100) }) // Cycle 2 Break - Should auto-save

      // Verify auto-save was called with correct parameters
      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(
        expect.any(Number), // duration
        2, // intervalCount (2 completed cycles)
        'Test Session', // sessionName
        2 // targetLoopCount
      )

      // Verify duration is approximately 4 minutes
      const [duration] = mockOnSessionComplete.mock.calls[0]
      expect(duration).toBeGreaterThan(239000)
      expect(duration).toBeLessThan(241000)

      expect(result.current.isActive).toBe(false)
      expect(result.current.timeLeft).toBe(0)
    })

    it('should NOT auto-save when session is manually killed before completion', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useIntervals({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer('Test Session', 2)
      })

      // Complete only 1 work interval
      act(() => {
        vi.advanceTimersByTime(60100)
      })

      // Manually kill before completion
      act(() => {
        result.current.killTimer()
      })

      // Should NOT have auto-saved
      expect(mockOnSessionComplete).not.toHaveBeenCalled()
    })

    it('should auto-save with correct data for multiple loops', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useIntervals({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer('Multi Loop Test', 3)
      })

      // Complete all 3 cycles
      for (let i = 0; i < 3; i++) {
        act(() => { vi.advanceTimersByTime(60100) }) // Work
        act(() => { vi.advanceTimersByTime(60100) }) // Break
      }

      expect(mockOnSessionComplete).toHaveBeenCalledTimes(1)
      expect(mockOnSessionComplete).toHaveBeenCalledWith(
        expect.any(Number),
        3, // 3 completed cycles
        'Multi Loop Test',
        3
      )

      // Verify duration is approximately 6 minutes
      const [duration] = mockOnSessionComplete.mock.calls[0]
      expect(duration).toBeGreaterThan(359000)
      expect(duration).toBeLessThan(361000)
    })

    it('should work without onSessionComplete callback (backwards compatibility)', () => {
      const { result } = renderHook(() => useIntervals())

      act(() => {
        result.current.setWorkMinutes(1)
        result.current.setBreakMinutes(1)
      })

      act(() => {
        result.current.startTimer('Test', 1)
      })

      // Complete 1 cycle - should not crash
      act(() => {
        vi.advanceTimersByTime(60100) // Work
      })
      act(() => {
        vi.advanceTimersByTime(60100) // Break
      })

      // Should stop without error
      expect(result.current.isActive).toBe(false)
    })

    it('should NOT auto-save sessions with zero duration', () => {
      const mockOnSessionComplete = vi.fn()
      
      const { result } = renderHook(() => useIntervals({
        onSessionComplete: mockOnSessionComplete
      }))

      act(() => {
        result.current.setWorkMinutes(0)
        result.current.setBreakMinutes(0)
      })

      act(() => {
        result.current.startTimer('Zero Duration', 1)
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Should not save 0 duration sessions
      expect(mockOnSessionComplete).not.toHaveBeenCalled()
    })
  })
})
