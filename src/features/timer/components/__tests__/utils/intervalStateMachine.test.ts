/**
 * Tests for Interval State Machine
 */

import { describe, it, expect } from 'vitest'
import {
  getNextInterval,
  shouldCompleteSession,
  getCurrentDuration,
  getNextDuration,
  calculateIntervalProgress,
  getIntervalDisplayName,
  isValidIntervalConfig,
  type IntervalState,
  type IntervalConfig
} from '../../utils/intervalStateMachine'

describe('intervalStateMachine', () => {
  describe('getNextInterval', () => {
    it('should transition from work to break (count stays same)', () => {
      const current: IntervalState = { type: 'work', count: 0 }
      const next = getNextInterval(current)
      
      expect(next.type).toBe('break')
      expect(next.count).toBe(0)
    })

    it('should transition from break to work (count increments)', () => {
      const current: IntervalState = { type: 'break', count: 0 }
      const next = getNextInterval(current)
      
      expect(next.type).toBe('work')
      expect(next.count).toBe(1)
    })

    it('should handle multiple transitions correctly', () => {
      let state: IntervalState = { type: 'work', count: 0 }
      
      state = getNextInterval(state) // work -> break (count: 0)
      expect(state).toEqual({ type: 'break', count: 0 })
      
      state = getNextInterval(state) // break -> work (count: 1)
      expect(state).toEqual({ type: 'work', count: 1 })
      
      state = getNextInterval(state) // work -> break (count: 1)
      expect(state).toEqual({ type: 'break', count: 1 })
      
      state = getNextInterval(state) // break -> work (count: 2)
      expect(state).toEqual({ type: 'work', count: 2 })
    })
  })

  describe('shouldCompleteSession', () => {
    it('should return false when no target loop count (infinite mode)', () => {
      const state: IntervalState = { type: 'break', count: 100 }
      expect(shouldCompleteSession(state, undefined)).toBe(false)
    })

    it('should return false when on work interval', () => {
      const state: IntervalState = { type: 'work', count: 2 }
      expect(shouldCompleteSession(state, 3)).toBe(false)
    })

    it('should return false when on break but not reached target', () => {
      const state: IntervalState = { type: 'break', count: 1 }
      expect(shouldCompleteSession(state, 3)).toBe(false)
    })

    it('should return true when on break and reached target', () => {
      const state: IntervalState = { type: 'break', count: 2 }
      expect(shouldCompleteSession(state, 3)).toBe(true)
    })

    it('should return true when on break and exceeded target', () => {
      const state: IntervalState = { type: 'break', count: 5 }
      expect(shouldCompleteSession(state, 3)).toBe(true)
    })
  })

  describe('getCurrentDuration', () => {
    const config: IntervalConfig = {
      workDuration: 25 * 60 * 1000, // 25 minutes
      breakDuration: 5 * 60 * 1000,  // 5 minutes
    }

    it('should return work duration for work interval', () => {
      const state: IntervalState = { type: 'work', count: 0 }
      expect(getCurrentDuration(state, config)).toBe(25 * 60 * 1000)
    })

    it('should return break duration for break interval', () => {
      const state: IntervalState = { type: 'break', count: 0 }
      expect(getCurrentDuration(state, config)).toBe(5 * 60 * 1000)
    })
  })

  describe('getNextDuration', () => {
    const config: IntervalConfig = {
      workDuration: 25 * 60 * 1000,
      breakDuration: 5 * 60 * 1000,
    }

    it('should return break duration when currently on work', () => {
      const state: IntervalState = { type: 'work', count: 0 }
      expect(getNextDuration(state, config)).toBe(5 * 60 * 1000)
    })

    it('should return work duration when currently on break', () => {
      const state: IntervalState = { type: 'break', count: 0 }
      expect(getNextDuration(state, config)).toBe(25 * 60 * 1000)
    })
  })

  describe('calculateIntervalProgress', () => {
    it('should return 0 when no time elapsed', () => {
      expect(calculateIntervalProgress(0, 1000)).toBe(0)
    })

    it('should return 0.5 when halfway through', () => {
      expect(calculateIntervalProgress(500, 1000)).toBe(0.5)
    })

    it('should return 1 when complete', () => {
      expect(calculateIntervalProgress(1000, 1000)).toBe(1)
    })

    it('should not exceed 1 when overtime', () => {
      expect(calculateIntervalProgress(1500, 1000)).toBe(1)
    })

    it('should return 1 when duration is 0', () => {
      expect(calculateIntervalProgress(100, 0)).toBe(1)
    })

    it('should not go below 0 for negative elapsed', () => {
      expect(calculateIntervalProgress(-100, 1000)).toBe(0)
    })
  })

  describe('getIntervalDisplayName', () => {
    it('should return "Work Time" for work interval', () => {
      expect(getIntervalDisplayName('work')).toBe('Work Time')
    })

    it('should return "Break Time" for break interval', () => {
      expect(getIntervalDisplayName('break')).toBe('Break Time')
    })
  })

  describe('isValidIntervalConfig', () => {
    it('should return true for valid config', () => {
      const config: IntervalConfig = {
        workDuration: 1000,
        breakDuration: 500,
        targetLoopCount: 3
      }
      expect(isValidIntervalConfig(config)).toBe(true)
    })

    it('should return true for valid config without target', () => {
      const config: IntervalConfig = {
        workDuration: 1000,
        breakDuration: 500,
        targetLoopCount: undefined
      }
      expect(isValidIntervalConfig(config)).toBe(true)
    })

    it('should return false for zero work duration', () => {
      const config: IntervalConfig = {
        workDuration: 0,
        breakDuration: 500,
      }
      expect(isValidIntervalConfig(config)).toBe(false)
    })

    it('should return false for negative work duration', () => {
      const config: IntervalConfig = {
        workDuration: -1000,
        breakDuration: 500,
      }
      expect(isValidIntervalConfig(config)).toBe(false)
    })

    it('should return false for zero break duration', () => {
      const config: IntervalConfig = {
        workDuration: 1000,
        breakDuration: 0,
      }
      expect(isValidIntervalConfig(config)).toBe(false)
    })

    it('should return false for zero target loop count', () => {
      const config: IntervalConfig = {
        workDuration: 1000,
        breakDuration: 500,
        targetLoopCount: 0
      }
      expect(isValidIntervalConfig(config)).toBe(false)
    })

    it('should return false for negative target loop count', () => {
      const config: IntervalConfig = {
        workDuration: 1000,
        breakDuration: 500,
        targetLoopCount: -1
      }
      expect(isValidIntervalConfig(config)).toBe(false)
    })
  })
})
