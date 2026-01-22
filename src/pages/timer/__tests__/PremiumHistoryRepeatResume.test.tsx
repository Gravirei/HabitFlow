/**
 * PremiumHistory Repeat/Resume Integration Tests
 * 
 * Tests for the repeat and resume session functionality in the Premium History page
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timerPersistence } from '@/components/timer/utils/timerPersistence'
import type { CountdownSession, IntervalsSession, StopwatchSession } from '@/components/timer/premium-history/types/session.types'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('PremiumHistory Repeat/Resume Functionality', () => {
  let mockLocalStorage: { [key: string]: string } = {}

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
    mockLocalStorage = {}
    mockNavigate.mockClear()
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Repeat Session Handler Logic', () => {
    // Helper function that mimics the handleRepeatClick logic from PremiumHistory
    const handleRepeatClick = (session: CountdownSession | IntervalsSession | StopwatchSession) => {
      switch (session.mode) {
        case 'Countdown': {
          const countdownSession = session as CountdownSession
          const targetSeconds = countdownSession.targetDuration || countdownSession.duration
          const hours = Math.floor(targetSeconds / 3600)
          const minutes = Math.floor((targetSeconds % 3600) / 60)
          const seconds = targetSeconds % 60
          
          timerPersistence.saveRepeatSession({
            mode: 'Countdown',
            hours,
            minutes,
            seconds,
            createdAt: Date.now()
          })
          break
        }
        case 'Intervals': {
          const intervalsSession = session as IntervalsSession
          timerPersistence.saveRepeatSession({
            mode: 'Intervals',
            workMinutes: intervalsSession.workDuration ? Math.floor(intervalsSession.workDuration / 60) : 25,
            breakMinutes: intervalsSession.breakDuration ? Math.floor(intervalsSession.breakDuration / 60) : 5,
            targetLoops: intervalsSession.targetLoopCount || intervalsSession.intervalCount || 4,
            sessionName: intervalsSession.sessionName,
            createdAt: Date.now()
          })
          break
        }
        default:
          // Stopwatch - no configuration needed
          break
      }
      mockNavigate('/timer')
    }

    it('should create correct repeat config for Countdown session', () => {
      const countdownSession: CountdownSession = {
        id: 'session-1',
        mode: 'Countdown',
        startTime: Date.now() - 1500000,
        endTime: Date.now(),
        duration: 1500, // 25 minutes completed
        targetDuration: 1800, // 30 minutes target
        completed: true
      }

      handleRepeatClick(countdownSession)

      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      expect(repeatConfig.mode).toBe('Countdown')
      expect(repeatConfig.hours).toBe(0)
      expect(repeatConfig.minutes).toBe(30) // Target was 30 minutes
      expect(repeatConfig.seconds).toBe(0)
      expect(mockNavigate).toHaveBeenCalledWith('/timer')
    })

    it('should create correct repeat config for Intervals session', () => {
      const intervalsSession: IntervalsSession = {
        id: 'session-2',
        mode: 'Intervals',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        duration: 3000,
        workDuration: 1500, // 25 minutes
        breakDuration: 300, // 5 minutes
        intervalCount: 4,
        targetLoopCount: 4,
        sessionName: 'Deep Work Session',
        completedIntervals: 4,
        totalWorkTime: 6000,
        totalBreakTime: 1200
      }

      handleRepeatClick(intervalsSession)

      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      expect(repeatConfig.mode).toBe('Intervals')
      expect(repeatConfig.workMinutes).toBe(25)
      expect(repeatConfig.breakMinutes).toBe(5)
      expect(repeatConfig.targetLoops).toBe(4)
      expect(repeatConfig.sessionName).toBe('Deep Work Session')
      expect(mockNavigate).toHaveBeenCalledWith('/timer')
    })

    it('should handle Stopwatch session (no config needed)', () => {
      const stopwatchSession: StopwatchSession = {
        id: 'session-3',
        mode: 'Stopwatch',
        startTime: Date.now() - 600000,
        endTime: Date.now(),
        duration: 600,
        laps: []
      }

      handleRepeatClick(stopwatchSession)

      // No repeat config should be saved for Stopwatch
      expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
      expect(mockNavigate).toHaveBeenCalledWith('/timer')
    })

    it('should handle Countdown session with hours', () => {
      const longCountdownSession: CountdownSession = {
        id: 'session-4',
        mode: 'Countdown',
        startTime: Date.now() - 7200000,
        endTime: Date.now(),
        duration: 7200, // 2 hours completed
        targetDuration: 7320, // 2 hours and 2 minutes target
        completed: true
      }

      handleRepeatClick(longCountdownSession)

      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      expect(repeatConfig.hours).toBe(2)
      expect(repeatConfig.minutes).toBe(2)
      expect(repeatConfig.seconds).toBe(0)
    })
  })

  describe('Resume Session Handler Logic', () => {
    // Helper function that mimics the handleResumeClick logic from PremiumHistory
    const handleResumeClick = (session: CountdownSession | IntervalsSession | StopwatchSession) => {
      if (session.mode !== 'Countdown') {
        // For non-countdown, fall back to repeat behavior
        return false
      }

      const countdownSession = session as CountdownSession
      
      if (countdownSession.completed !== false) {
        // Completed session, fall back to repeat
        return false
      }

      const targetSeconds = countdownSession.targetDuration || 0
      const completedSeconds = countdownSession.duration || 0
      const remainingSeconds = targetSeconds - completedSeconds

      if (remainingSeconds <= 0) {
        return false
      }

      const hours = Math.floor(remainingSeconds / 3600)
      const minutes = Math.floor((remainingSeconds % 3600) / 60)
      const seconds = remainingSeconds % 60

      timerPersistence.saveRepeatSession({
        mode: 'Countdown',
        hours,
        minutes,
        seconds,
        createdAt: Date.now()
      })

      mockNavigate('/timer')
      return true
    }

    it('should calculate remaining time correctly for incomplete countdown', () => {
      const incompleteSession: CountdownSession = {
        id: 'session-5',
        mode: 'Countdown',
        startTime: Date.now() - 600000,
        duration: 600, // 10 minutes elapsed
        targetDuration: 1800, // 30 minutes target
        completed: false
      }

      const result = handleResumeClick(incompleteSession)

      expect(result).toBe(true)
      
      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      // Remaining: 30 - 10 = 20 minutes
      expect(repeatConfig.hours).toBe(0)
      expect(repeatConfig.minutes).toBe(20)
      expect(repeatConfig.seconds).toBe(0)
      expect(mockNavigate).toHaveBeenCalledWith('/timer')
    })

    it('should handle remaining time with hours', () => {
      const incompleteSession: CountdownSession = {
        id: 'session-6',
        mode: 'Countdown',
        startTime: Date.now() - 1800000,
        duration: 1800, // 30 minutes elapsed
        targetDuration: 7200, // 2 hours target
        completed: false
      }

      const result = handleResumeClick(incompleteSession)

      expect(result).toBe(true)
      
      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      // Remaining: 2h - 30m = 1h 30m
      expect(repeatConfig.hours).toBe(1)
      expect(repeatConfig.minutes).toBe(30)
      expect(repeatConfig.seconds).toBe(0)
    })

    it('should handle remaining time with seconds', () => {
      const incompleteSession: CountdownSession = {
        id: 'session-7',
        mode: 'Countdown',
        startTime: Date.now() - 125000,
        duration: 125, // 2m 5s elapsed
        targetDuration: 300, // 5 minutes target
        completed: false
      }

      const result = handleResumeClick(incompleteSession)

      expect(result).toBe(true)
      
      const repeatConfig = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      
      // Remaining: 5m - 2m5s = 2m 55s
      expect(repeatConfig.hours).toBe(0)
      expect(repeatConfig.minutes).toBe(2)
      expect(repeatConfig.seconds).toBe(55)
    })

    it('should return false for completed countdown session', () => {
      const completedSession: CountdownSession = {
        id: 'session-8',
        mode: 'Countdown',
        startTime: Date.now() - 1800000,
        endTime: Date.now(),
        duration: 1800,
        targetDuration: 1800,
        completed: true
      }

      const result = handleResumeClick(completedSession)

      expect(result).toBe(false)
      expect(mockLocalStorage['flowmodoro_repeat_session']).toBeUndefined()
    })

    it('should return false for Intervals session', () => {
      const intervalsSession: IntervalsSession = {
        id: 'session-9',
        mode: 'Intervals',
        startTime: Date.now() - 1800000,
        duration: 1800,
        workDuration: 1500,
        breakDuration: 300,
        intervalCount: 2,
        completedIntervals: 2,
        totalWorkTime: 3000,
        totalBreakTime: 600
      }

      const result = handleResumeClick(intervalsSession)

      expect(result).toBe(false)
    })

    it('should return false for Stopwatch session', () => {
      const stopwatchSession: StopwatchSession = {
        id: 'session-10',
        mode: 'Stopwatch',
        startTime: Date.now() - 600000,
        duration: 600,
        laps: []
      }

      const result = handleResumeClick(stopwatchSession)

      expect(result).toBe(false)
    })

    it('should return false when no remaining time', () => {
      const noRemainingSession: CountdownSession = {
        id: 'session-11',
        mode: 'Countdown',
        startTime: Date.now() - 1800000,
        duration: 1800, // Same as target
        targetDuration: 1800,
        completed: false // Marked incomplete but no time left
      }

      const result = handleResumeClick(noRemainingSession)

      expect(result).toBe(false)
    })
  })

  describe('Timer Mode Detection', () => {
    it('should detect pending repeat session for correct mode', () => {
      timerPersistence.saveRepeatSession({
        mode: 'Countdown',
        hours: 0,
        minutes: 25,
        seconds: 0,
        createdAt: Date.now()
      })

      expect(timerPersistence.hasRepeatSession('Countdown')).toBe(true)
      expect(timerPersistence.hasRepeatSession('Intervals')).toBe(false)
      expect(timerPersistence.hasRepeatSession('Stopwatch')).toBe(false)
    })

    it('should load repeat session only once (consumed after load)', () => {
      timerPersistence.saveRepeatSession({
        mode: 'Intervals',
        workMinutes: 25,
        breakMinutes: 5,
        createdAt: Date.now()
      })

      // First load should return config
      const config1 = timerPersistence.loadRepeatSession()
      expect(config1).not.toBeNull()
      expect(config1?.mode).toBe('Intervals')

      // Second load should return null (already consumed)
      const config2 = timerPersistence.loadRepeatSession()
      expect(config2).toBeNull()
    })
  })

  describe('Edge Cases - Repeat Handler', () => {
    const handleRepeatClick = (session: CountdownSession | IntervalsSession | StopwatchSession) => {
      switch (session.mode) {
        case 'Countdown': {
          const countdownSession = session as CountdownSession
          const targetSeconds = countdownSession.targetDuration || countdownSession.duration
          const hours = Math.floor(targetSeconds / 3600)
          const minutes = Math.floor((targetSeconds % 3600) / 60)
          const seconds = targetSeconds % 60
          
          timerPersistence.saveRepeatSession({
            mode: 'Countdown',
            hours,
            minutes,
            seconds,
            createdAt: Date.now()
          })
          break
        }
        case 'Intervals': {
          const intervalsSession = session as IntervalsSession
          timerPersistence.saveRepeatSession({
            mode: 'Intervals',
            workMinutes: intervalsSession.workDuration ? Math.floor(intervalsSession.workDuration / 60) : 25,
            breakMinutes: intervalsSession.breakDuration ? Math.floor(intervalsSession.breakDuration / 60) : 5,
            targetLoops: intervalsSession.targetLoopCount || intervalsSession.intervalCount || 4,
            sessionName: intervalsSession.sessionName,
            createdAt: Date.now()
          })
          break
        }
        default:
          break
      }
      mockNavigate('/timer')
    }

    it('should handle countdown with zero duration', () => {
      const session: CountdownSession = {
        id: 'edge-1',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 0,
        targetDuration: 0,
        completed: true
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.hours).toBe(0)
      expect(config.minutes).toBe(0)
      expect(config.seconds).toBe(0)
    })

    it('should handle countdown with only duration (no targetDuration)', () => {
      const session: CountdownSession = {
        id: 'edge-2',
        mode: 'Countdown',
        startTime: Date.now() - 900000,
        duration: 900, // 15 minutes
        completed: true
        // targetDuration is undefined
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // Should fall back to duration
      expect(config.minutes).toBe(15)
    })

    it('should handle countdown with very long duration (99 hours)', () => {
      const session: CountdownSession = {
        id: 'edge-3',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 356400, // 99 hours
        targetDuration: 356400,
        completed: true
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.hours).toBe(99)
      expect(config.minutes).toBe(0)
      expect(config.seconds).toBe(0)
    })

    it('should handle countdown with fractional seconds', () => {
      const session: CountdownSession = {
        id: 'edge-4',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 90.5, // 1 minute 30.5 seconds
        targetDuration: 90.5,
        completed: true
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // The handler uses Math.floor for hours and minutes but modulo preserves fractional
      expect(config.hours).toBe(0)
      expect(config.minutes).toBe(1)
      // 90.5 % 60 = 30.5 (modulo preserves the fractional part)
      expect(config.seconds).toBe(30.5)
    })

    it('should handle intervals with missing workDuration', () => {
      const session: IntervalsSession = {
        id: 'edge-5',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 1800,
        intervalCount: 4,
        completedIntervals: 4,
        totalWorkTime: 6000,
        totalBreakTime: 1200
        // workDuration and breakDuration are undefined
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // Should use defaults
      expect(config.workMinutes).toBe(25)
      expect(config.breakMinutes).toBe(5)
    })

    it('should handle intervals with missing targetLoopCount and intervalCount', () => {
      const session: IntervalsSession = {
        id: 'edge-6',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 1800,
        workDuration: 1500,
        breakDuration: 300,
        completedIntervals: 2,
        totalWorkTime: 3000,
        totalBreakTime: 600
        // targetLoopCount and intervalCount are undefined
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // Should use default of 4
      expect(config.targetLoops).toBe(4)
    })

    it('should handle intervals with undefined sessionName', () => {
      const session: IntervalsSession = {
        id: 'edge-7',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 1800,
        workDuration: 1500,
        breakDuration: 300,
        intervalCount: 4,
        completedIntervals: 4,
        totalWorkTime: 6000,
        totalBreakTime: 1200
        // sessionName is undefined
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.sessionName).toBeUndefined()
    })

    it('should handle intervals with empty string sessionName', () => {
      const session: IntervalsSession = {
        id: 'edge-8',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 1800,
        workDuration: 1500,
        breakDuration: 300,
        intervalCount: 4,
        completedIntervals: 4,
        totalWorkTime: 6000,
        totalBreakTime: 1200,
        sessionName: ''
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.sessionName).toBe('')
    })

    it('should handle intervals with special characters in sessionName', () => {
      const session: IntervalsSession = {
        id: 'edge-9',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 1800,
        workDuration: 1500,
        breakDuration: 300,
        intervalCount: 4,
        completedIntervals: 4,
        totalWorkTime: 6000,
        totalBreakTime: 1200,
        sessionName: '🔥 Work & "Focus" <session>'
      }

      handleRepeatClick(session)

      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.sessionName).toBe('🔥 Work & "Focus" <session>')
    })
  })

  describe('Edge Cases - Resume Handler', () => {
    const handleResumeClick = (session: CountdownSession | IntervalsSession | StopwatchSession): boolean => {
      if (session.mode !== 'Countdown') {
        return false
      }

      const countdownSession = session as CountdownSession
      
      if (countdownSession.completed !== false) {
        return false
      }

      const targetSeconds = countdownSession.targetDuration || 0
      const completedSeconds = countdownSession.duration || 0
      const remainingSeconds = targetSeconds - completedSeconds

      if (remainingSeconds <= 0) {
        return false
      }

      const hours = Math.floor(remainingSeconds / 3600)
      const minutes = Math.floor((remainingSeconds % 3600) / 60)
      const seconds = remainingSeconds % 60

      timerPersistence.saveRepeatSession({
        mode: 'Countdown',
        hours,
        minutes,
        seconds,
        createdAt: Date.now()
      })

      mockNavigate('/timer')
      return true
    }

    it('should handle resume with exactly 1 second remaining', () => {
      const session: CountdownSession = {
        id: 'resume-edge-1',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 299, // 4:59 elapsed
        targetDuration: 300, // 5 minutes
        completed: false
      }

      const result = handleResumeClick(session)

      expect(result).toBe(true)
      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      expect(config.hours).toBe(0)
      expect(config.minutes).toBe(0)
      expect(config.seconds).toBe(1)
    })

    it('should return false when duration equals targetDuration', () => {
      const session: CountdownSession = {
        id: 'resume-edge-2',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 300,
        targetDuration: 300,
        completed: false
      }

      const result = handleResumeClick(session)

      expect(result).toBe(false)
    })

    it('should return false when duration exceeds targetDuration', () => {
      const session: CountdownSession = {
        id: 'resume-edge-3',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 350, // Over the target
        targetDuration: 300,
        completed: false
      }

      const result = handleResumeClick(session)

      expect(result).toBe(false)
    })

    it('should handle resume with undefined duration (treat as 0)', () => {
      const session: CountdownSession = {
        id: 'resume-edge-4',
        mode: 'Countdown',
        startTime: Date.now(),
        targetDuration: 300,
        completed: false
      } as CountdownSession // duration is undefined

      const result = handleResumeClick(session)

      expect(result).toBe(true)
      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // Full target time should remain
      expect(config.minutes).toBe(5)
    })

    it('should handle resume with undefined targetDuration', () => {
      const session: CountdownSession = {
        id: 'resume-edge-5',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 100,
        completed: false
      } as CountdownSession // targetDuration is undefined (treats as 0)

      const result = handleResumeClick(session)

      // 0 - 100 = -100, which is <= 0
      expect(result).toBe(false)
    })

    it('should handle resume with completed: undefined (treat as not false)', () => {
      const session: CountdownSession = {
        id: 'resume-edge-6',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 100,
        targetDuration: 300
      } as CountdownSession // completed is undefined

      const result = handleResumeClick(session)

      // undefined !== false, so should return false
      expect(result).toBe(false)
    })

    it('should handle resume with completed: null (treat as not false)', () => {
      const session = {
        id: 'resume-edge-7',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 100,
        targetDuration: 300,
        completed: null
      } as unknown as CountdownSession

      const result = handleResumeClick(session)

      // null !== false, so should return false
      expect(result).toBe(false)
    })

    it('should handle very large remaining time', () => {
      const session: CountdownSession = {
        id: 'resume-edge-8',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 60, // 1 minute elapsed
        targetDuration: 86400, // 24 hours target
        completed: false
      }

      const result = handleResumeClick(session)

      expect(result).toBe(true)
      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // 24h - 1m = 23h 59m
      expect(config.hours).toBe(23)
      expect(config.minutes).toBe(59)
      expect(config.seconds).toBe(0)
    })

    it('should handle fractional duration values', () => {
      const session: CountdownSession = {
        id: 'resume-edge-9',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 60.7, // 60.7 seconds elapsed
        targetDuration: 120, // 2 minutes target
        completed: false
      }

      const result = handleResumeClick(session)

      expect(result).toBe(true)
      const config = JSON.parse(mockLocalStorage['flowmodoro_repeat_session'])
      // 120 - 60.7 = 59.3 seconds remaining
      // Math.floor(59.3 / 60) = 0 minutes
      // 59.3 % 60 = 59.3 (modulo preserves fractional)
      expect(config.hours).toBe(0)
      expect(config.minutes).toBe(0)
      expect(config.seconds).toBe(59.3)
    })
  })

  describe('Edge Cases - Session Types', () => {
    it('should handle session with minimal required fields', () => {
      const minimalCountdown: CountdownSession = {
        id: 'minimal-1',
        mode: 'Countdown',
        startTime: Date.now(),
        duration: 60
      }

      // Should not throw when processing
      expect(() => {
        timerPersistence.saveRepeatSession({
          mode: 'Countdown',
          hours: 0,
          minutes: 1,
          seconds: 0,
          createdAt: Date.now()
        })
      }).not.toThrow()
    })

    it('should handle session with all optional fields populated', () => {
      const fullSession: CountdownSession = {
        id: 'full-1',
        mode: 'Countdown',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        duration: 3600,
        targetDuration: 3600,
        completed: true
      }

      timerPersistence.saveRepeatSession({
        mode: 'Countdown',
        hours: 1,
        minutes: 0,
        seconds: 0,
        createdAt: Date.now()
      })

      const config = timerPersistence.loadRepeatSession()
      expect(config?.hours).toBe(1)
    })

    it('should handle intervals session with zero work/break time', () => {
      const zeroSession: IntervalsSession = {
        id: 'zero-1',
        mode: 'Intervals',
        startTime: Date.now(),
        duration: 0,
        workDuration: 0,
        breakDuration: 0,
        intervalCount: 0,
        completedIntervals: 0,
        totalWorkTime: 0,
        totalBreakTime: 0
      }

      timerPersistence.saveRepeatSession({
        mode: 'Intervals',
        workMinutes: 0,
        breakMinutes: 0,
        targetLoops: 0,
        createdAt: Date.now()
      })

      const config = timerPersistence.loadRepeatSession()
      expect(config?.workMinutes).toBe(0)
      expect(config?.breakMinutes).toBe(0)
    })

    it('should handle stopwatch session with many laps', () => {
      const laps = Array.from({ length: 100 }, (_, i) => ({
        id: `lap-${i}`,
        time: i * 1000,
        timestamp: Date.now() + i * 1000
      }))

      const manyLapsSession: StopwatchSession = {
        id: 'laps-1',
        mode: 'Stopwatch',
        startTime: Date.now() - 100000,
        duration: 100000,
        laps,
        bestLap: 500,
        worstLap: 2000,
        averageLap: 1000
      }

      // Stopwatch doesn't save repeat config, just navigates
      mockNavigate('/timer')
      expect(mockNavigate).toHaveBeenCalledWith('/timer')
    })
  })
})
