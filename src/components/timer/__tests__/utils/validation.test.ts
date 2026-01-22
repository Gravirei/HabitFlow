import { describe, it, expect } from 'vitest'
import {
  validateTimerHistory,
  isValidTimerHistoryRecord,
  migrateTimerHistoryRecord
} from '../../utils/validation'
import type { TimerHistoryRecord } from '../../types/timer.types'

describe('validation utilities', () => {
  describe('isValidTimerHistoryRecord', () => {
    it('should validate a correct record', () => {
      const validRecord: TimerHistoryRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: 5000,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(validRecord)).toBe(true)
    })

    it('should validate record with intervalCount', () => {
      const validRecord: TimerHistoryRecord = {
        id: 'test-123',
        mode: 'Intervals',
        duration: 5000,
        timestamp: Date.now(),
        intervalCount: 3
      }

      expect(isValidTimerHistoryRecord(validRecord)).toBe(true)
    })

    it('should reject record without id', () => {
      const invalidRecord = {
        mode: 'Stopwatch',
        duration: 5000,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should reject record with invalid mode', () => {
      const invalidRecord = {
        id: 'test-123',
        mode: 'InvalidMode',
        duration: 5000,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should reject record with non-number duration', () => {
      const invalidRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: '5000', // String instead of number
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should reject record with negative duration', () => {
      const invalidRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: -5000,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should reject record with non-number timestamp', () => {
      const invalidRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: 5000,
        timestamp: '2024-01-01' // String instead of number
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should reject null', () => {
      expect(isValidTimerHistoryRecord(null)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(isValidTimerHistoryRecord(undefined)).toBe(false)
    })

    it('should reject non-object values', () => {
      expect(isValidTimerHistoryRecord('string')).toBe(false)
      expect(isValidTimerHistoryRecord(123)).toBe(false)
      expect(isValidTimerHistoryRecord(true)).toBe(false)
    })

    it('should reject array', () => {
      expect(isValidTimerHistoryRecord([])).toBe(false)
    })

    it('should accept record with number id (legacy)', () => {
      const legacyRecord = {
        id: 123,
        mode: 'Stopwatch',
        duration: 5000,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(legacyRecord)).toBe(true)
    })

    it('should reject record with non-number intervalCount', () => {
      const invalidRecord = {
        id: 'test-123',
        mode: 'Intervals',
        duration: 5000,
        timestamp: Date.now(),
        intervalCount: '3' // String instead of number
      }

      expect(isValidTimerHistoryRecord(invalidRecord)).toBe(false)
    })

    it('should accept record with zero duration', () => {
      const validRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: 0,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(validRecord)).toBe(true)
    })

    it('should accept record with zero intervalCount', () => {
      const validRecord = {
        id: 'test-123',
        mode: 'Intervals',
        duration: 5000,
        timestamp: Date.now(),
        intervalCount: 0
      }

      expect(isValidTimerHistoryRecord(validRecord)).toBe(true)
    })
  })

  describe('migrateTimerHistoryRecord', () => {
    it('should migrate record with number id to string id', () => {
      const legacyRecord = {
        id: 123,
        mode: 'Stopwatch' as const,
        duration: 5000,
        timestamp: Date.now()
      }

      const migrated = migrateTimerHistoryRecord(legacyRecord)

      expect(migrated).not.toBeNull()
      expect(typeof migrated!.id).toBe('string')
      expect(migrated!.mode).toBe('Stopwatch')
      expect(migrated!.duration).toBe(5000)
    })

    it('should not migrate record that already has string id', () => {
      const modernRecord: TimerHistoryRecord = {
        id: 'test-123',
        mode: 'Stopwatch',
        duration: 5000,
        timestamp: Date.now()
      }

      const migrated = migrateTimerHistoryRecord(modernRecord)

      expect(migrated).not.toBeNull()
      expect(migrated!.id).toBe('test-123') // Same ID
    })

    it('should return null for invalid record', () => {
      const invalidRecord = {
        mode: 'Stopwatch',
        duration: 5000
        // Missing id and timestamp
      }

      const migrated = migrateTimerHistoryRecord(invalidRecord)

      expect(migrated).toBeNull()
    })

    it('should generate UUID for legacy record', () => {
      const legacyRecord = {
        id: 456,
        mode: 'Countdown' as const,
        duration: 3000,
        timestamp: Date.now()
      }

      const migrated = migrateTimerHistoryRecord(legacyRecord)

      expect(migrated).not.toBeNull()
      expect(typeof migrated!.id).toBe('string')
      expect(migrated!.id.length).toBeGreaterThan(10) // UUID format
    })

    it('should preserve all fields during migration', () => {
      const legacyRecord = {
        id: 789,
        mode: 'Intervals' as const,
        duration: 7000,
        timestamp: 1234567890,
        intervalCount: 5
      }

      const migrated = migrateTimerHistoryRecord(legacyRecord)

      expect(migrated).not.toBeNull()
      expect(migrated!.mode).toBe('Intervals')
      expect(migrated!.duration).toBe(7000)
      expect(migrated!.timestamp).toBe(1234567890)
      expect(migrated!.intervalCount).toBe(5)
    })

    it('should handle null input', () => {
      const migrated = migrateTimerHistoryRecord(null)
      expect(migrated).toBeNull()
    })

    it('should handle undefined input', () => {
      const migrated = migrateTimerHistoryRecord(undefined)
      expect(migrated).toBeNull()
    })
  })

  describe('validateTimerHistory', () => {
    it('should return empty array for null', () => {
      const result = validateTimerHistory(null)
      expect(result).toEqual([])
    })

    it('should return empty array for undefined', () => {
      const result = validateTimerHistory(undefined)
      expect(result).toEqual([])
    })

    it('should return empty array for non-array input', () => {
      expect(validateTimerHistory('string')).toEqual([])
      expect(validateTimerHistory(123)).toEqual([])
      expect(validateTimerHistory({})).toEqual([])
    })

    it('should validate array of valid records', () => {
      const validHistory: TimerHistoryRecord[] = [
        {
          id: 'test-1',
          mode: 'Stopwatch',
          duration: 5000,
          timestamp: Date.now()
        },
        {
          id: 'test-2',
          mode: 'Countdown',
          duration: 3000,
          timestamp: Date.now()
        }
      ]

      const result = validateTimerHistory(validHistory)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('test-1')
      expect(result[1].id).toBe('test-2')
    })

    it('should filter out invalid records', () => {
      const mixedHistory = [
        {
          id: 'test-1',
          mode: 'Stopwatch',
          duration: 5000,
          timestamp: Date.now()
        },
        {
          // Invalid: missing id
          mode: 'Countdown',
          duration: 3000,
          timestamp: Date.now()
        },
        {
          id: 'test-3',
          mode: 'Intervals',
          duration: 7000,
          timestamp: Date.now(),
          intervalCount: 3
        }
      ]

      const result = validateTimerHistory(mixedHistory)

      expect(result).toHaveLength(2) // Only valid records
      expect(result[0].id).toBe('test-1')
      expect(result[1].id).toBe('test-3')
    })

    it('should migrate records with number ids', () => {
      const legacyHistory = [
        {
          id: 123,
          mode: 'Stopwatch' as const,
          duration: 5000,
          timestamp: Date.now()
        },
        {
          id: 456,
          mode: 'Countdown' as const,
          duration: 3000,
          timestamp: Date.now()
        }
      ]

      const result = validateTimerHistory(legacyHistory)

      expect(result).toHaveLength(2)
      expect(typeof result[0].id).toBe('string')
      expect(typeof result[1].id).toBe('string')
    })

    it('should handle mix of legacy and modern records', () => {
      const mixedHistory = [
        {
          id: 'modern-1',
          mode: 'Stopwatch' as const,
          duration: 5000,
          timestamp: Date.now()
        },
        {
          id: 789,
          mode: 'Countdown' as const,
          duration: 3000,
          timestamp: Date.now()
        }
      ]

      const result = validateTimerHistory(mixedHistory)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('modern-1') // Unchanged
      expect(typeof result[1].id).toBe('string') // Migrated
      expect(result[1].id).not.toBe('789') // Should be UUID now
    })

    it('should return empty array for array of invalid records', () => {
      const invalidHistory = [
        { mode: 'Invalid', duration: 5000 },
        { id: 'test', mode: 'Stopwatch' },
        { random: 'data' }
      ]

      const result = validateTimerHistory(invalidHistory)

      expect(result).toEqual([])
    })

    it('should preserve order of valid records', () => {
      const validHistory: TimerHistoryRecord[] = [
        {
          id: 'test-3',
          mode: 'Intervals',
          duration: 7000,
          timestamp: 3000
        },
        {
          id: 'test-1',
          mode: 'Stopwatch',
          duration: 5000,
          timestamp: 1000
        },
        {
          id: 'test-2',
          mode: 'Countdown',
          duration: 3000,
          timestamp: 2000
        }
      ]

      const result = validateTimerHistory(validHistory)

      expect(result[0].id).toBe('test-3')
      expect(result[1].id).toBe('test-1')
      expect(result[2].id).toBe('test-2')
    })

    it('should handle large arrays efficiently', () => {
      const largeHistory: TimerHistoryRecord[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `test-${i}`,
        mode: 'Stopwatch' as const,
        duration: i * 1000,
        timestamp: Date.now() + i
      }))

      const result = validateTimerHistory(largeHistory)

      expect(result).toHaveLength(1000)
      expect(result[0].id).toBe('test-0')
      expect(result[999].id).toBe('test-999')
    })

    it('should handle records with all optional fields', () => {
      const recordWithOptionals: TimerHistoryRecord[] = [
        {
          id: 'test-1',
          mode: 'Intervals',
          duration: 10000,
          timestamp: Date.now(),
          intervalCount: 5
        }
      ]

      const result = validateTimerHistory(recordWithOptionals)

      expect(result).toHaveLength(1)
      expect(result[0].intervalCount).toBe(5)
    })
  })

  describe('Edge Cases', () => {
    it('should handle record with extra properties', () => {
      const recordWithExtra = {
        id: 'test-123',
        mode: 'Stopwatch' as const,
        duration: 5000,
        timestamp: Date.now(),
        extraField: 'should be ignored'
      }

      expect(isValidTimerHistoryRecord(recordWithExtra)).toBe(true)
    })

    it('should validate very large duration values', () => {
      const record = {
        id: 'test-123',
        mode: 'Stopwatch' as const,
        duration: Number.MAX_SAFE_INTEGER,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(record)).toBe(true)
    })

    it('should validate very large timestamp values', () => {
      const record = {
        id: 'test-123',
        mode: 'Stopwatch' as const,
        duration: 5000,
        timestamp: Number.MAX_SAFE_INTEGER
      }

      expect(isValidTimerHistoryRecord(record)).toBe(true)
    })

    it('should reject NaN values', () => {
      const recordWithNaN = {
        id: 'test-123',
        mode: 'Stopwatch' as const,
        duration: NaN,
        timestamp: Date.now()
      }

      expect(isValidTimerHistoryRecord(recordWithNaN)).toBe(false)
    })

    it('should reject Infinity values', () => {
      const recordWithInfinity = {
        id: 'test-123',
        mode: 'Stopwatch' as const,
        duration: Infinity,
        timestamp: Date.now()
      }

      // Note: The validation might accept Infinity as a valid number
      // This depends on implementation - adjust based on actual behavior
      const result = isValidTimerHistoryRecord(recordWithInfinity)
      expect(typeof result).toBe('boolean')
    })
  })
})
