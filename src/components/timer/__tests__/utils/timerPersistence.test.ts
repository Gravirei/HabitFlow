/**

// Type declarations for test environment
declare const global: typeof globalThis
declare const process: NodeJS.Process

 * timerPersistence Tests
 * 
 * Comprehensive test suite for timer state persistence functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timerPersistence, TimerPersistence } from '../../utils/timerPersistence'
import type { CountdownTimerState, StopwatchTimerState, IntervalsTimerState } from '../../utils/timerPersistence'

describe('TimerPersistence', () => {
  let mockLocalStorage: { [key: string]: string } = {}

  // Create a mock localStorage object
  const localStorageMock = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockLocalStorage[key] = value
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key]
    },
    clear: () => {
      mockLocalStorage = {}
    },
    get length() {
      return Object.keys(mockLocalStorage).length
    },
    key: (index: number) => {
      const keys = Object.keys(mockLocalStorage)
      return keys[index] || null
    }
  }

  beforeEach(() => {
    // Reset mock storage
    mockLocalStorage = {}
    
    // Replace global localStorage with our mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })

    // Clear console spies
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Save State', () => {
    it('should save Countdown timer state', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000, // 5 minutes
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const result = timerPersistence.saveState(state)

      expect(result).toBe(true)
      
      // Verify data was saved to mock storage
      expect(mockLocalStorage['flowmodoro_timer_state']).toBeTruthy()

      const saved = JSON.parse(mockLocalStorage['flowmodoro_timer_state'])
      expect(saved.mode).toBe('Countdown')
      expect(saved.totalDuration).toBe(300000)
    })

    it('should save Stopwatch timer state with laps', () => {
      const state: StopwatchTimerState = {
        mode: 'Stopwatch',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        pausedElapsed: 0,
        laps: [
          { id: '1', time: 60000, timestamp: Date.now() },
          { id: '2', time: 120000, timestamp: Date.now() }
        ],
        savedAt: Date.now(),
        version: 1
      }

      const result = timerPersistence.saveState(state)

      expect(result).toBe(true)
      const saved = JSON.parse(mockLocalStorage['flowmodoro_timer_state'])
      expect(saved.mode).toBe('Stopwatch')
      expect(saved.laps).toHaveLength(2)
      expect(saved.laps[0].time).toBe(60000)
    })

    it('should save Intervals timer state', () => {
      const state: IntervalsTimerState = {
        mode: 'Intervals',
        isActive: true,
        isPaused: false,
        currentLoop: 1,
        targetLoops: 3,
        currentInterval: 'work',
        intervalStartTime: Date.now(),
        workDuration: 1500000, // 25 minutes
        breakDuration: 300000, // 5 minutes
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const result = timerPersistence.saveState(state)

      expect(result).toBe(true)
      const saved = JSON.parse(mockLocalStorage['flowmodoro_timer_state'])
      expect(saved.mode).toBe('Intervals')
      expect(saved.currentLoop).toBe(1)
      expect(saved.targetLoops).toBe(3)
      expect(saved.currentInterval).toBe('work')
    })

    it('should handle localStorage errors gracefully', () => {
      // Temporarily replace localStorage.setItem to throw error
      const originalSetItem = global.localStorage.setItem
      global.localStorage.setItem = () => {
        throw new Error('QuotaExceededError')
      }

      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const result = timerPersistence.saveState(state)

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalled()
      
      // Restore
      global.localStorage.setItem = originalSetItem
    })

    it('should add savedAt timestamp', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: now - 10000,
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: now - 10000, // Old timestamp
        version: 1
      }

      timerPersistence.saveState(state)

      const saved = JSON.parse(mockLocalStorage['flowmodoro_timer_state'])
      expect(saved.savedAt).toBe(now) // Should be updated to current time
    })
  })

  describe('Load State', () => {
    it('should load saved Countdown state', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      mockLocalStorage['flowmodoro_timer_state'] = JSON.stringify(state)

      const loaded = timerPersistence.loadState()

      expect(loaded).toBeTruthy()
      expect(loaded?.mode).toBe('Countdown')
    })

    it('should return null when no state exists', () => {
      const loaded = timerPersistence.loadState()
      expect(loaded).toBeNull()
    })

    it('should handle corrupted JSON data', () => {
      mockLocalStorage['flowmodoro_timer_state'] = 'invalid json {'

      const loaded = timerPersistence.loadState()

      expect(loaded).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it('should reject invalid state structure', () => {
      // Missing required fields
      const invalidState = {
        mode: 'Countdown',
        isActive: true
        // Missing other required fields
      }

      mockLocalStorage['flowmodoro_timer_state'] = JSON.stringify(invalidState)

      const loaded = timerPersistence.loadState()

      expect(loaded).toBeNull()
      expect(console.warn).toHaveBeenCalled()
    })

    it('should reject state older than 7 days', () => {
      const oldState: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
        version: 1
      }

      mockLocalStorage['flowmodoro_timer_state'] = JSON.stringify(oldState)

      const loaded = timerPersistence.loadState()

      expect(loaded).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[Timer][TimerPersistence] State too old'),
        '' // logger.warn outputs data ?? '' as second param
      )
    })

    it('should reject state with negative age (system time changed)', () => {
      const futureState: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now() + 1000000, // Future timestamp
        version: 1
      }

      mockLocalStorage['flowmodoro_timer_state'] = JSON.stringify(futureState)

      const loaded = timerPersistence.loadState()

      expect(loaded).toBeNull()
    })
  })

  describe('Clear State', () => {
    it('should clear timer state', () => {
      mockLocalStorage['flowmodoro_timer_state'] = 'some data'

      timerPersistence.clearState()

      expect(mockLocalStorage['flowmodoro_timer_state']).toBeUndefined()
    })

    it('should clear active timer route', () => {
      mockLocalStorage['flowmodoro_timer_state'] = 'timer data'
      mockLocalStorage['flowmodoro_active_timer'] = 'Countdown'

      timerPersistence.clearState()

      expect(mockLocalStorage['flowmodoro_timer_state']).toBeUndefined()
      expect(mockLocalStorage['flowmodoro_active_timer']).toBeUndefined()
    })

    it('should handle errors gracefully', () => {
      // Temporarily replace removeItem to throw error
      const originalRemoveItem = global.localStorage.removeItem
      global.localStorage.removeItem = () => {
        throw new Error('Storage error')
      }

      timerPersistence.clearState()

      expect(console.error).toHaveBeenCalled()
      
      // Restore
      global.localStorage.removeItem = originalRemoveItem
    })
  })

  describe('Has State', () => {
    it('should return true when state exists', () => {
      mockLocalStorage['flowmodoro_timer_state'] = 'some data'

      expect(timerPersistence.hasState()).toBe(true)
    })

    it('should return false when state does not exist', () => {
      expect(timerPersistence.hasState()).toBe(false)
    })
  })

  describe('Active Timer Management', () => {
    it('should save active timer mode', () => {
      timerPersistence.saveActiveTimer('Countdown')

      // Verify data was saved
      expect(mockLocalStorage['flowmodoro_active_timer']).toBe('Countdown')
      
      // Verify we can retrieve it
      const saved = timerPersistence.getActiveTimer()
      expect(saved).toBe('Countdown')
    })

    it('should get saved active timer', () => {
      // Save first
      timerPersistence.saveActiveTimer('Stopwatch')
      
      // Then retrieve
      const active = timerPersistence.getActiveTimer()
      expect(active).toBe('Stopwatch')
    })

    it('should return null when no active timer', () => {
      const active = timerPersistence.getActiveTimer()

      expect(active).toBeNull()
    })

    it('should clear active timer', () => {
      // Save first
      timerPersistence.saveActiveTimer('Intervals')
      expect(timerPersistence.getActiveTimer()).toBe('Intervals')
      
      // Clear
      timerPersistence.clearActiveTimer()
      
      // Should be null now
      expect(timerPersistence.getActiveTimer()).toBeNull()
    })
  })

  describe('Validate Resume - Countdown', () => {
    it('should allow resume for valid Countdown timer', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - 60000, // Started 1 minute ago
        totalDuration: 300000, // 5 minutes total
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(true)
      expect(validation.remainingTime).toBeGreaterThan(0)
      expect(validation.remainingTime).toBeLessThan(300000)
    })

    it('should reject Countdown timer that already completed', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - 400000, // Started 6.67 minutes ago
        totalDuration: 300000, // 5 minutes total (already finished)
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(false)
      expect(validation.isCompleted).toBe(true)
      expect(validation.remainingTime).toBe(0)
    })

    it('should reject Countdown with no start time', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: null,
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(false)
      expect(validation.reason).toContain('No start time')
    })
  })

  describe('Validate Resume - Stopwatch', () => {
    it('should allow resume for Stopwatch (always resumable)', () => {
      const state: StopwatchTimerState = {
        mode: 'Stopwatch',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - 60000,
        pausedElapsed: 0,
        laps: [],
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(true)
    })
  })

  describe('Validate Resume - Intervals', () => {
    it('should allow resume for valid Intervals timer', () => {
      const state: IntervalsTimerState = {
        mode: 'Intervals',
        isActive: true,
        isPaused: false,
        currentLoop: 1,
        targetLoops: 3,
        currentInterval: 'work',
        intervalStartTime: Date.now() - 60000,
        workDuration: 1500000,
        breakDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(true)
      expect(validation.remainingTime).toBeGreaterThan(0)
    })

    it('should reject completed Intervals session', () => {
      const state: IntervalsTimerState = {
        mode: 'Intervals',
        isActive: true,
        isPaused: false,
        currentLoop: 3, // At target
        targetLoops: 3,
        currentInterval: 'break',
        intervalStartTime: Date.now() - 400000, // Break already completed
        workDuration: 1500000,
        breakDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(false)
      expect(validation.isCompleted).toBe(true)
    })
  })

  describe('Validate Resume - Time Jumps', () => {
    it('should reject timer with backward time jump', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now() + 100000, // Saved in the "future"
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(false)
      expect(validation.reason).toContain('time was changed')
    })

    it('should reject timer older than 24 hours', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - (25 * 60 * 60 * 1000),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        version: 1
      }

      const validation = timerPersistence.validateResume(state)

      expect(validation.canResume).toBe(false)
      expect(validation.reason).toContain('24 hours')
    })
  })

  describe('Utility Methods', () => {
    it('should format time since save correctly', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now() - 75000, // 1 minute 15 seconds ago
        version: 1
      }

      const timeSince = timerPersistence.getTimeSinceSave(state)

      expect(timeSince).toContain('minute')
    })

    it('should format remaining time correctly', () => {
      const time1 = timerPersistence.formatRemainingTime(125000) // 2m 5s
      expect(time1).toContain('2m')
      expect(time1).toContain('5s')

      const time2 = timerPersistence.formatRemainingTime(45000) // 45s
      expect(time2).toContain('45s')
      expect(time2).not.toContain('0m')
    })

    it('should get timer description', () => {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now() - 60000,
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      }

      const description = timerPersistence.getTimerDescription(state)

      expect(description).toContain('remaining')
    })
  })

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = TimerPersistence.getInstance()
      const instance2 = TimerPersistence.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('Repeat Session', () => {
    describe('saveRepeatSession', () => {
      it('should save countdown repeat session configuration', () => {
        const config = {
          mode: 'Countdown' as const,
          hours: 1,
          minutes: 30,
          seconds: 0,
          createdAt: Date.now()
        }

        const result = timerPersistence.saveRepeatSession(config)

        expect(result).toBe(true)
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeTruthy()

        const saved = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
        expect(saved.mode).toBe('Countdown')
        expect(saved.hours).toBe(1)
        expect(saved.minutes).toBe(30)
        expect(saved.seconds).toBe(0)
      })

      it('should save intervals repeat session configuration', () => {
        const config = {
          mode: 'Intervals' as const,
          workMinutes: 25,
          breakMinutes: 5,
          targetLoops: 4,
          sessionName: 'Pomodoro Session',
          createdAt: Date.now()
        }

        const result = timerPersistence.saveRepeatSession(config)

        expect(result).toBe(true)

        const saved = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
        expect(saved.mode).toBe('Intervals')
        expect(saved.workMinutes).toBe(25)
        expect(saved.breakMinutes).toBe(5)
        expect(saved.targetLoops).toBe(4)
        expect(saved.sessionName).toBe('Pomodoro Session')
      })

      it('should save stopwatch repeat session configuration', () => {
        const config = {
          mode: 'Stopwatch' as const,
          createdAt: Date.now()
        }

        const result = timerPersistence.saveRepeatSession(config)

        expect(result).toBe(true)

        const saved = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
        expect(saved.mode).toBe('Stopwatch')
      })

      it('should reject invalid timer mode', () => {
        const config = {
          mode: 'InvalidMode' as any,
          createdAt: Date.now()
        }

        const result = timerPersistence.saveRepeatSession(config)

        expect(result).toBe(false)
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })

      it('should overwrite previous repeat session', () => {
        const config1 = {
          mode: 'Countdown' as const,
          hours: 1,
          minutes: 0,
          seconds: 0,
          createdAt: Date.now()
        }

        const config2 = {
          mode: 'Intervals' as const,
          workMinutes: 25,
          breakMinutes: 5,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(config1)
        timerPersistence.saveRepeatSession(config2)

        const saved = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
        expect(saved.mode).toBe('Intervals')
      })
    })

    describe('loadRepeatSession', () => {
      it('should load and consume repeat session configuration', () => {
        const config = {
          mode: 'Countdown' as const,
          hours: 0,
          minutes: 25,
          seconds: 0,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(config)

        // First load should return the config
        const loaded = timerPersistence.loadRepeatSession()

        expect(loaded).not.toBeNull()
        expect(loaded?.mode).toBe('Countdown')
        expect(loaded?.minutes).toBe(25)

        // Second load should return null (consumed)
        const loadedAgain = timerPersistence.loadRepeatSession()
        expect(loadedAgain).toBeNull()
      })

      it('should return null when no repeat session exists', () => {
        const loaded = timerPersistence.loadRepeatSession()
        expect(loaded).toBeNull()
      })

      it('should return null and clear for expired repeat session (> 5 minutes)', () => {
        const expiredConfig = {
          mode: 'Countdown' as const,
          hours: 0,
          minutes: 10,
          seconds: 0,
          createdAt: Date.now() - (6 * 60 * 1000) // 6 minutes ago
        }

        mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(expiredConfig)

        const loaded = timerPersistence.loadRepeatSession()

        expect(loaded).toBeNull()
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })

      it('should return null and clear for invalid mode in stored config', () => {
        const invalidConfig = {
          mode: 'InvalidMode',
          createdAt: Date.now()
        }

        mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(invalidConfig)

        const loaded = timerPersistence.loadRepeatSession()

        expect(loaded).toBeNull()
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })

      it('should return null and clear for corrupted JSON', () => {
        mockLocalStorage['flowmodoro_repeat_session'] = 'not valid json'

        const loaded = timerPersistence.loadRepeatSession()

        expect(loaded).toBeNull()
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })
    })

    describe('clearRepeatSession', () => {
      it('should clear repeat session from storage', () => {
        const config = {
          mode: 'Countdown' as const,
          hours: 1,
          minutes: 0,
          seconds: 0,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(config)
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeTruthy()

        timerPersistence.clearRepeatSession()
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })

      it('should not throw when no repeat session exists', () => {
        expect(() => timerPersistence.clearRepeatSession()).not.toThrow()
      })
    })

    describe('hasRepeatSession', () => {
      it('should return true when repeat session exists', () => {
        const config = {
          mode: 'Countdown' as const,
          hours: 0,
          minutes: 15,
          seconds: 0,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(config)

        expect(timerPersistence.hasRepeatSession()).toBe(true)
      })

      it('should return false when no repeat session exists', () => {
        expect(timerPersistence.hasRepeatSession()).toBe(false)
      })

      it('should return true when checking for specific mode that matches', () => {
        const config = {
          mode: 'Intervals' as const,
          workMinutes: 25,
          breakMinutes: 5,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(config)

        expect(timerPersistence.hasRepeatSession('Intervals')).toBe(true)
        expect(timerPersistence.hasRepeatSession('Countdown')).toBe(false)
        expect(timerPersistence.hasRepeatSession('Stopwatch')).toBe(false)
      })

      it('should return false for expired repeat session', () => {
        const expiredConfig = {
          mode: 'Countdown' as const,
          hours: 0,
          minutes: 10,
          seconds: 0,
          createdAt: Date.now() - (6 * 60 * 1000) // 6 minutes ago
        }

        mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(expiredConfig)

        expect(timerPersistence.hasRepeatSession()).toBe(false)
        // Should also clean up expired session
        expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      })

      it('should return false for corrupted JSON', () => {
        mockLocalStorage['flowmodoro_repeat_session'] = 'invalid json'

        expect(timerPersistence.hasRepeatSession()).toBe(false)
      })
    })

    describe('Resume Session Flow', () => {
      it('should support resume flow for incomplete countdown', () => {
        // Simulate saving remaining time from an incomplete countdown
        const remainingSeconds = 180 // 3 minutes remaining
        const hours = Math.floor(remainingSeconds / 3600)
        const minutes = Math.floor((remainingSeconds % 3600) / 60)
        const seconds = remainingSeconds % 60

        const resumeConfig = {
          mode: 'Countdown' as const,
          hours,
          minutes,
          seconds,
          createdAt: Date.now()
        }

        timerPersistence.saveRepeatSession(resumeConfig)

        const loaded = timerPersistence.loadRepeatSession()

        expect(loaded).not.toBeNull()
        expect(loaded?.mode).toBe('Countdown')
        expect(loaded?.hours).toBe(0)
        expect(loaded?.minutes).toBe(3)
        expect(loaded?.seconds).toBe(0)
      })
    })

    describe('Edge Cases', () => {
      describe('Boundary Values', () => {
        it('should handle zero duration countdown', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 0,
            seconds: 0,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.hours).toBe(0)
          expect(loaded?.minutes).toBe(0)
          expect(loaded?.seconds).toBe(0)
        })

        it('should handle maximum reasonable countdown (24 hours)', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 24,
            minutes: 0,
            seconds: 0,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.hours).toBe(24)
        })

        it('should handle seconds overflow (>59 seconds)', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 0,
            seconds: 120, // 2 minutes worth of seconds
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          // Should preserve the value as-is (normalization is UI concern)
          expect(loaded?.seconds).toBe(120)
        })

        it('should handle negative values gracefully', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: -1,
            minutes: -5,
            seconds: -10,
            createdAt: Date.now()
          }

          // Should still save (validation is UI concern)
          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)
        })

        it('should handle very large interval values', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 999,
            breakMinutes: 999,
            targetLoops: 100,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.workMinutes).toBe(999)
          expect(loaded?.targetLoops).toBe(100)
        })

        it('should handle zero interval values', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 0,
            breakMinutes: 0,
            targetLoops: 0,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.workMinutes).toBe(0)
          expect(loaded?.breakMinutes).toBe(0)
          expect(loaded?.targetLoops).toBe(0)
        })
      })

      describe('Expiry Edge Cases', () => {
        it('should expire session slightly over 5 minutes', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 10,
            seconds: 0,
            createdAt: Date.now() - (5 * 60 * 1000 + 100) // 5 minutes + 100ms ago
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          // At 5 minutes + 100ms, the session should be expired
          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should accept session just under 5 minutes', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 10,
            seconds: 0,
            createdAt: Date.now() - (4 * 60 * 1000 + 59 * 1000) // 4 min 59 sec ago
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).not.toBeNull()
        })

        it('should expire session at 5 minutes + 1ms', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 10,
            seconds: 0,
            createdAt: Date.now() - (5 * 60 * 1000 + 1) // 5 minutes + 1ms ago
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle future createdAt timestamp', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 10,
            seconds: 0,
            createdAt: Date.now() + (60 * 1000) // 1 minute in the future
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          // Future timestamp should be valid (time diff is negative, not > MAX)
          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).not.toBeNull()
        })

        it('should handle very old timestamp', () => {
          const config = {
            mode: 'Countdown' as const,
            hours: 0,
            minutes: 10,
            seconds: 0,
            createdAt: Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })
      })

      describe('Malformed Data', () => {
        it('should handle empty object in storage', () => {
          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify({})

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle null in storage', () => {
          mockLocalStorage['flowmodoro_repeat_session'] = 'null'

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle array instead of object', () => {
          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify([1, 2, 3])

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle missing mode field', () => {
          const config = {
            hours: 1,
            minutes: 30,
            seconds: 0,
            createdAt: Date.now()
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle missing createdAt field', () => {
          const config = {
            mode: 'Countdown',
            hours: 1,
            minutes: 30,
            seconds: 0
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          // NaN - Date.now() results in NaN, and NaN > MAX_AGE is false
          // So this actually passes through (createdAt is optional in terms of expiry check)
          const loaded = timerPersistence.loadRepeatSession()
          // The implementation doesn't strictly require createdAt for loading
          expect(loaded).not.toBeNull()
          expect(loaded?.mode).toBe('Countdown')
        })

        it('should handle string mode instead of valid enum', () => {
          const config = {
            mode: 'countdown', // lowercase
            hours: 1,
            minutes: 30,
            seconds: 0,
            createdAt: Date.now()
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          // 'countdown' !== 'Countdown', should be invalid
          expect(loaded).toBeNull()
        })

        it('should handle numeric mode', () => {
          const config = {
            mode: 123,
            hours: 1,
            minutes: 30,
            seconds: 0,
            createdAt: Date.now()
          }

          mockLocalStorage['flowmodoro_repeat_session'] = JSON.stringify(config)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()
        })

        it('should handle special characters in sessionName', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 25,
            breakMinutes: 5,
            sessionName: '<script>alert("xss")</script>',
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          // Should preserve the string as-is (sanitization is UI concern)
          expect(loaded?.sessionName).toBe('<script>alert("xss")</script>')
        })

        it('should handle very long sessionName', () => {
          const longName = 'A'.repeat(10000)
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 25,
            breakMinutes: 5,
            sessionName: longName,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.sessionName).toBe(longName)
        })

        it('should handle unicode in sessionName', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 25,
            breakMinutes: 5,
            sessionName: '🔥 深度工作 セッション 🎯',
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.sessionName).toBe('🔥 深度工作 セッション 🎯')
        })
      })

      describe('Storage Errors', () => {
        it('should handle localStorage.setItem throwing error', () => {
          const originalSetItem = localStorageMock.setItem
          localStorageMock.setItem = () => {
            throw new Error('QuotaExceededError')
          }

          const config = {
            mode: 'Countdown' as const,
            hours: 1,
            minutes: 0,
            seconds: 0,
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(false)

          localStorageMock.setItem = originalSetItem
        })

        it('should handle localStorage.getItem throwing error', () => {
          const originalGetItem = localStorageMock.getItem
          localStorageMock.getItem = () => {
            throw new Error('SecurityError')
          }

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded).toBeNull()

          const hasSession = timerPersistence.hasRepeatSession()
          expect(hasSession).toBe(false)

          localStorageMock.getItem = originalGetItem
        })

        it('should handle localStorage.removeItem throwing error', () => {
          const originalRemoveItem = localStorageMock.removeItem
          localStorageMock.removeItem = () => {
            throw new Error('SecurityError')
          }

          // Should not throw
          expect(() => timerPersistence.clearRepeatSession()).not.toThrow()

          localStorageMock.removeItem = originalRemoveItem
        })
      })

      describe('Concurrent Operations', () => {
        it('should handle rapid save/load cycles', () => {
          for (let i = 0; i < 100; i++) {
            const config = {
              mode: 'Countdown' as const,
              hours: 0,
              minutes: i,
              seconds: 0,
              createdAt: Date.now()
            }

            timerPersistence.saveRepeatSession(config)
            const loaded = timerPersistence.loadRepeatSession()
            
            expect(loaded?.minutes).toBe(i)
          }
        })

        it('should handle alternating mode saves', () => {
          const modes = ['Countdown', 'Intervals', 'Stopwatch'] as const
          
          for (let i = 0; i < 30; i++) {
            const mode = modes[i % 3]
            const config = {
              mode,
              hours: mode === 'Countdown' ? 1 : undefined,
              minutes: mode === 'Countdown' ? 30 : undefined,
              seconds: mode === 'Countdown' ? 0 : undefined,
              workMinutes: mode === 'Intervals' ? 25 : undefined,
              breakMinutes: mode === 'Intervals' ? 5 : undefined,
              createdAt: Date.now()
            }

            timerPersistence.saveRepeatSession(config)
            const loaded = timerPersistence.loadRepeatSession()
            
            expect(loaded?.mode).toBe(mode)
          }
        })
      })

      describe('Optional Fields', () => {
        it('should handle countdown with only required fields', () => {
          const config = {
            mode: 'Countdown' as const,
            createdAt: Date.now()
            // hours, minutes, seconds are undefined
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.mode).toBe('Countdown')
          expect(loaded?.hours).toBeUndefined()
          expect(loaded?.minutes).toBeUndefined()
          expect(loaded?.seconds).toBeUndefined()
        })

        it('should handle intervals with only required fields', () => {
          const config = {
            mode: 'Intervals' as const,
            createdAt: Date.now()
            // workMinutes, breakMinutes, targetLoops, sessionName are undefined
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.mode).toBe('Intervals')
          expect(loaded?.workMinutes).toBeUndefined()
          expect(loaded?.sessionName).toBeUndefined()
        })

        it('should handle intervals with partial fields', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 25,
            // breakMinutes is undefined
            targetLoops: 4,
            // sessionName is undefined
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.workMinutes).toBe(25)
          expect(loaded?.breakMinutes).toBeUndefined()
          expect(loaded?.targetLoops).toBe(4)
        })

        it('should handle empty string sessionName', () => {
          const config = {
            mode: 'Intervals' as const,
            workMinutes: 25,
            breakMinutes: 5,
            sessionName: '',
            createdAt: Date.now()
          }

          const result = timerPersistence.saveRepeatSession(config)
          expect(result).toBe(true)

          const loaded = timerPersistence.loadRepeatSession()
          expect(loaded?.sessionName).toBe('')
        })
      })
    })
  })
})
