/**
 * Tests for Interval Switch Handler
 */

import { describe, it, expect } from 'vitest'
import {
  calculateNextInterval,
  getPreviousInterval,
  isFirstInterval,
  isBreakInterval,
  isWorkInterval,
  getIntervalDescription
} from '../../utils/intervalSwitchHandler'

describe('intervalSwitchHandler', () => {
  describe('calculateNextInterval', () => {
    it('should transition from work to break', () => {
      const result = calculateNextInterval('work', 0)
      
      expect(result.nextInterval).toBe('break')
      expect(result.nextCount).toBe(0)
    })

    it('should transition from break to work and increment count', () => {
      const result = calculateNextInterval('break', 0)
      
      expect(result.nextInterval).toBe('work')
      expect(result.nextCount).toBe(1)
    })

    it('should handle multiple transitions', () => {
      let result = calculateNextInterval('work', 2)
      expect(result).toEqual({ nextInterval: 'break', nextCount: 2 })
      
      result = calculateNextInterval('break', 2)
      expect(result).toEqual({ nextInterval: 'work', nextCount: 3 })
    })
  })

  describe('getPreviousInterval', () => {
    it('should go back from work to break', () => {
      const result = getPreviousInterval('work', 1)
      
      expect(result.nextInterval).toBe('break')
      expect(result.nextCount).toBe(0)
    })

    it('should go back from break to work', () => {
      const result = getPreviousInterval('break', 1)
      
      expect(result.nextInterval).toBe('work')
      expect(result.nextCount).toBe(1)
    })

    it('should handle first interval edge case', () => {
      const result = getPreviousInterval('work', 0)
      
      expect(result.nextInterval).toBe('break')
      expect(result.nextCount).toBe(0)
    })
  })

  describe('isFirstInterval', () => {
    it('should return true for first work interval', () => {
      expect(isFirstInterval('work', 0)).toBe(true)
    })

    it('should return false for other work intervals', () => {
      expect(isFirstInterval('work', 1)).toBe(false)
      expect(isFirstInterval('work', 2)).toBe(false)
    })

    it('should return false for any break interval', () => {
      expect(isFirstInterval('break', 0)).toBe(false)
      expect(isFirstInterval('break', 1)).toBe(false)
    })
  })

  describe('isBreakInterval', () => {
    it('should return true for break interval', () => {
      expect(isBreakInterval('break')).toBe(true)
    })

    it('should return false for work interval', () => {
      expect(isBreakInterval('work')).toBe(false)
    })
  })

  describe('isWorkInterval', () => {
    it('should return true for work interval', () => {
      expect(isWorkInterval('work')).toBe(true)
    })

    it('should return false for break interval', () => {
      expect(isWorkInterval('break')).toBe(false)
    })
  })

  describe('getIntervalDescription', () => {
    it('should format work interval with target', () => {
      const desc = getIntervalDescription('work', 0, 5)
      expect(desc).toBe('Work 1/5')
    })

    it('should format break interval with target', () => {
      const desc = getIntervalDescription('break', 0, 5)
      expect(desc).toBe('Break 1/5')
    })

    it('should format work interval without target', () => {
      const desc = getIntervalDescription('work', 2)
      expect(desc).toBe('Work 3')
    })

    it('should format break interval without target', () => {
      const desc = getIntervalDescription('break', 2)
      expect(desc).toBe('Break 3')
    })

    it('should handle various counts correctly', () => {
      expect(getIntervalDescription('work', 0, 3)).toBe('Work 1/3')
      expect(getIntervalDescription('work', 1, 3)).toBe('Work 2/3')
      expect(getIntervalDescription('work', 2, 3)).toBe('Work 3/3')
    })
  })
})
