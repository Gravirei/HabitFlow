/**
 * Timer Persistence Integration Tests
 * 
 * End-to-end tests for timer persistence functionality across all modes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '../../hooks/useCountdown'
import { useStopwatch } from '../../hooks/useStopwatch'
import { useIntervals } from '../../hooks/useIntervals'
import { timerPersistence } from '../../utils/timerPersistence'

// Mock dependencies
vi.mock('../../hooks/useTimerSettings', () => ({
  useTimerSettings: () => ({
    settings: {
      soundEnabled: false,
      vibrationEnabled: false,
      notificationsEnabled: false,
      keyboardShortcutsEnabled: false
    }
  })
}))

describe('Timer Persistence Integration', () => {
  let mockLocalStorage: { [key: string]: string } = {}

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {}
    
    // Create a complete localStorage mock
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {}
      }),
      length: 0,
      key: vi.fn(() => null)
    }
    
    // Use vi.stubGlobal for proper global mocking in vitest
    vi.stubGlobal('localStorage', localStorageMock)

    // Mock console
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Use fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Countdown Timer Persistence', () => {
    it('should persist and restore running countdown timer', async () => {
      // Step 1: Start a timer
      const { result: timer1, unmount: unmount1 } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Set to 5 minutes
      act(() => {
        timer1.current.setSelectedMinutes(5)
      })

      // Start timer
      act(() => {
        timer1.current.startTimer()
      })

      expect(timer1.current.isActive).toBe(true)

      // Let it run for 1 minute (simulated)
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Manually save state (simulating auto-save)
      timerPersistence.saveState({
        mode: 'Countdown',
        isActive: timer1.current.isActive,
        isPaused: timer1.current.isPaused,
        startTime: timer1.current.timerStartTime,
        totalDuration: timer1.current.totalDuration,
        pausedElapsed: timer1.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      // Verify state was saved
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      expect(savedState?.mode).toBe('Countdown')

      // Cleanup first timer
      unmount1()

      // Step 2: Simulate page refresh - create new hook instance
      const { result: timer2 } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Step 3: Restore from saved state
      const stateToRestore = timerPersistence.loadState()
      expect(stateToRestore).toBeTruthy()

      act(() => {
        if (stateToRestore) {
          timer2.current.restoreTimer(stateToRestore)
        }
      })

      // Verify restoration
      expect(timer2.current.isActive).toBe(true)
      expect(timer2.current.timeLeft).toBeGreaterThan(0)
      expect(timer2.current.timeLeft).toBeLessThan(300000) // Less than 5 minutes
    })

    it('should persist paused countdown timer', () => {
      const { result, unmount } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Start and pause
      act(() => {
        result.current.setSelectedMinutes(3)
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(30000) // 30 seconds
      })

      act(() => {
        result.current.pauseTimer()
      })

      expect(result.current.isPaused).toBe(true)

      // Manually save state
      timerPersistence.saveState({
        mode: 'Countdown',
        isActive: result.current.isActive,
        isPaused: result.current.isPaused,
        startTime: result.current.timerStartTime,
        totalDuration: result.current.totalDuration,
        pausedElapsed: result.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      // Verify saved state
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      expect(savedState?.isPaused).toBe(true)

      unmount()

      // Restore
      const { result: restored } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      act(() => {
        if (savedState) {
          restored.current.restoreTimer(savedState)
        }
      })

      expect(restored.current.isPaused).toBe(true)
      expect(restored.current.isActive).toBe(false)
    })

    it('should not restore completed countdown timer', () => {
      const { result } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Start with 1 second timer
      act(() => {
        result.current.setSelectedSeconds(1)
        result.current.startTimer()
      })

      // Let it complete
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Try to validate - should fail
      const savedState = timerPersistence.loadState()
      if (savedState) {
        const validation = timerPersistence.validateResume(savedState)
        expect(validation.canResume).toBe(false)
        expect(validation.isCompleted).toBe(true)
      }
    })
  })

  describe('Stopwatch Timer Persistence', () => {
    it('should persist and restore running stopwatch', () => {
      const { result: timer1, unmount } = renderHook(() => useStopwatch())

      // Start stopwatch
      act(() => {
        timer1.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(45000) // 45 seconds
      })

      expect(timer1.current.isActive).toBe(true)
      expect(timer1.current.timeLeft).toBeGreaterThan(0)

      // Manually save state
      timerPersistence.saveState({
        mode: 'Stopwatch',
        isActive: timer1.current.isActive,
        isPaused: timer1.current.isPaused,
        startTime: timer1.current.timerStartTime,
        pausedElapsed: timer1.current.pausedElapsed,
        laps: timer1.current.laps,
        savedAt: Date.now(),
        version: 1
      })

      // Verify state was saved
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()

      unmount()

      // Restore
      const { result: timer2 } = renderHook(() => useStopwatch())

      act(() => {
        if (savedState) {
          timer2.current.restoreTimer(savedState)
        }
      })

      expect(timer2.current.isActive).toBe(true)
      expect(timer2.current.timeLeft).toBeGreaterThan(0)
    })

    it('should persist and restore stopwatch with laps', () => {
      const { result, unmount } = renderHook(() => useStopwatch())

      // Start and add laps
      act(() => {
        result.current.startTimer()
      })

      act(() => {
        vi.advanceTimersByTime(30000)
        result.current.addLap()
      })

      act(() => {
        vi.advanceTimersByTime(30000)
        result.current.addLap()
      })

      expect(result.current.laps).toHaveLength(2)

      // Manually save state
      timerPersistence.saveState({
        mode: 'Stopwatch',
        isActive: result.current.isActive,
        isPaused: result.current.isPaused,
        startTime: result.current.timerStartTime,
        pausedElapsed: result.current.pausedElapsed,
        laps: result.current.laps,
        savedAt: Date.now(),
        version: 1
      })

      // Verify and unmount
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      unmount()

      // Restore
      const { result: restored } = renderHook(() => useStopwatch())

      act(() => {
        if (savedState) {
          restored.current.restoreTimer(savedState)
        }
      })

      // Laps should be restored
      expect(restored.current.laps.length).toBeGreaterThan(0)
    })
  })

  describe('Intervals Timer Persistence', () => {
    it('should persist and restore intervals timer', () => {
      const { result: timer1, unmount } = renderHook(() => 
        useIntervals({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Configure intervals
      act(() => {
        timer1.current.setWorkMinutes(25)
        timer1.current.setBreakMinutes(5)
      })

      // Start interval session
      act(() => {
        timer1.current.startTimer('Test Session', 3)
      })

      act(() => {
        vi.advanceTimersByTime(120000) // 2 minutes
      })

      expect(timer1.current.isActive).toBe(true)
      expect(timer1.current.currentInterval).toBe('work')

      // Manually save state
      timerPersistence.saveState({
        mode: 'Intervals',
        isActive: timer1.current.isActive,
        isPaused: timer1.current.isPaused,
        currentLoop: timer1.current.intervalCount,
        targetLoops: timer1.current.targetLoopCount || 1,
        currentInterval: timer1.current.currentInterval,
        intervalStartTime: timer1.current.intervalStartTime,
        workDuration: timer1.current.workMinutes * 60000,
        breakDuration: timer1.current.breakMinutes * 60000,
        pausedElapsed: timer1.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      // Verify state was saved
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      expect(savedState?.mode).toBe('Intervals')

      unmount()

      // Restore
      const { result: timer2 } = renderHook(() => 
        useIntervals({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      act(() => {
        if (savedState) {
          timer2.current.restoreTimer(savedState)
        }
      })

      expect(timer2.current.isActive).toBe(true)
      expect(timer2.current.currentInterval).toBe('work')
      expect(timer2.current.intervalCount).toBe(0)
    })

    it('should persist interval progress correctly', () => {
      const { result, unmount } = renderHook(() => 
        useIntervals({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      act(() => {
        result.current.setWorkMinutes(1) // 1 minute work
        result.current.setBreakMinutes(1) // 1 minute break
        result.current.startTimer('Quick Test', 2)
      })

      // Complete work interval, start break
      act(() => {
        vi.advanceTimersByTime(61000) // Just over 1 minute
      })

      // Should be on break now or still on work depending on timing
      // Just verify we can save state at this point
      
      // Manually save state
      timerPersistence.saveState({
        mode: 'Intervals',
        isActive: result.current.isActive,
        isPaused: result.current.isPaused,
        currentLoop: result.current.intervalCount,
        targetLoops: result.current.targetLoopCount || 2,
        currentInterval: result.current.currentInterval,
        intervalStartTime: result.current.intervalStartTime,
        workDuration: result.current.workMinutes * 60000,
        breakDuration: result.current.breakMinutes * 60000,
        pausedElapsed: result.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      
      // Store current interval before unmount for verification
      // const currentIntervalBeforeUnmount = result.current.currentInterval
      unmount()

      const { result: restored } = renderHook(() => 
        useIntervals({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      act(() => {
        if (savedState) {
          restored.current.restoreTimer(savedState)
        }
      })

      // Should restore to break interval
      expect(restored.current.currentInterval).toBe('break')
    })
  })

  describe('Route Persistence Integration', () => {
    it('should save and restore active timer route', () => {
      // Save Countdown as active
      timerPersistence.saveActiveTimer('Countdown')

      // Retrieve using the getActiveTimer method (which uses mocked getItem)
      const activeTimer = timerPersistence.getActiveTimer()
      expect(activeTimer).toBe('Countdown')
      
      // Verify localStorage.setItem was called with correct args
      expect(localStorage.setItem).toHaveBeenCalledWith('flowmodoro_active_timer', 'Countdown')
    })

    it('should clear route when clearing state', () => {
      timerPersistence.saveActiveTimer('Stopwatch')
      
      // Verify it was saved
      expect(timerPersistence.getActiveTimer()).toBe('Stopwatch')

      // Clear state
      timerPersistence.clearState()

      // Both should be cleared
      expect(timerPersistence.getActiveTimer()).toBeNull()
      expect(timerPersistence.loadState()).toBeNull()
    })
  })

  describe('Time Calculation Accuracy', () => {
    it('should accurately calculate time for countdown after delay', () => {
      const { result, unmount } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Start 5 minute timer
      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      // Run for 2 minutes
      act(() => {
        vi.advanceTimersByTime(120000)
      })

      const timeBeforeSave = result.current.timeLeft
      expect(timeBeforeSave).toBeGreaterThan(150000) // Should be around 3 minutes
      expect(timeBeforeSave).toBeLessThan(200000)

      // Manually save state
      timerPersistence.saveState({
        mode: 'Countdown',
        isActive: result.current.isActive,
        isPaused: result.current.isPaused,
        startTime: result.current.timerStartTime,
        totalDuration: result.current.totalDuration,
        pausedElapsed: result.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      // Get saved state
      const savedState = timerPersistence.loadState()
      expect(savedState).toBeTruthy()
      unmount()

      // Simulate 10 second delay (page refresh time)
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Restore
      const { result: restored } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      act(() => {
        if (savedState) {
          restored.current.restoreTimer(savedState)
        }
      })

      // Time should account for the 10 second delay
      const timeAfterRestore = restored.current.timeLeft
      expect(timeAfterRestore).toBeLessThan(timeBeforeSave)
      expect(timeAfterRestore).toBeGreaterThan(timeBeforeSave - 15000) // Within 5 seconds
    })
  })

  describe('Multiple Timer Mode Independence', () => {
    it('should not mix states between different timer modes', () => {
      // Save Countdown state
      const { result, unmount: unmount1 } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )
      
      // Start a timer and save state
      act(() => {
        result.current.setSelectedMinutes(5)
        result.current.startTimer()
      })

      timerPersistence.saveState({
        mode: 'Countdown',
        isActive: result.current.isActive,
        isPaused: result.current.isPaused,
        startTime: result.current.timerStartTime,
        totalDuration: result.current.totalDuration,
        pausedElapsed: result.current.pausedElapsed,
        savedAt: Date.now(),
        version: 1
      })

      timerPersistence.saveActiveTimer('Countdown')
      unmount1()

      // Try to load - should get Countdown state
      const savedState = timerPersistence.loadState()
      expect(savedState?.mode).toBe('Countdown')

      // Stopwatch shouldn't be affected
      const { result: stopwatch } = renderHook(() => useStopwatch())
      
      // Should start fresh, not restore Countdown state
      expect(stopwatch.current.isActive).toBe(false)
      expect(stopwatch.current.timeLeft).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle localStorage quota exceeded', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      // Override the localStorage mock to throw on setItem
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Try to save state - should handle error
      const result = timerPersistence.saveState({
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      })

      // Should return false and log error
      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      // Restore the mock
      localStorage.setItem = originalSetItem
    })

    it('should handle rapid save/load cycles', () => {
      const { result } = renderHook(() => 
        useCountdown({ onSessionComplete: vi.fn(), onTimerComplete: vi.fn() })
      )

      // Rapid start/stop/save cycles
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setSelectedMinutes(i + 1)
          result.current.startTimer()
        })

        // Manually save state
        timerPersistence.saveState({
          mode: 'Countdown',
          isActive: result.current.isActive,
          isPaused: result.current.isPaused,
          startTime: result.current.timerStartTime,
          totalDuration: result.current.totalDuration,
          pausedElapsed: result.current.pausedElapsed,
          savedAt: Date.now(),
          version: 1
        })

        // Load state
        const state = timerPersistence.loadState()
        expect(state).toBeTruthy()

        act(() => {
          result.current.killTimer()
        })
      }

      // Should handle without errors
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
