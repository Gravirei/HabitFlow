/**
 * Habit Schema Validation Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest'
import { habitSchema, validateHabitName, validateGoal } from '@/schemas/habitSchema'

describe('habitSchema', () => {
  it('should allow optional categoryId', () => {
    const validData = {
      categoryId: 'fitness',
      name: 'Test Habit',
      description: '',
      frequency: 'daily' as const,
      goal: 1,
      reminderEnabled: false,
      reminderTime: '',
    }

    const result = habitSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe('name validation', () => {
    it('should accept valid habit names', () => {
      const validData = {
        name: 'Morning Meditation',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty names', () => {
      const invalidData = {
        name: '',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('should reject names with only spaces', () => {
      const invalidData = {
        name: '   ',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('spaces')
      }
    })

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101)
      const invalidData = {
        name: longName,
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 characters')
      }
    })

    it('should accept names at max length (100 chars)', () => {
      const maxName = 'a'.repeat(100)
      const validData = {
        name: maxName,
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from names', () => {
      const dataWithSpaces = {
        name: '  Morning Meditation  ',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(dataWithSpaces)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Morning Meditation')
      }
    })
  })

  describe('description validation', () => {
    it('should accept empty descriptions', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept descriptions up to 500 characters', () => {
      const validData = {
        name: 'Test Habit',
        description: 'a'.repeat(500),
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject descriptions longer than 500 characters', () => {
      const longDescription = 'a'.repeat(501)
      const invalidData = {
        name: 'Test Habit',
        description: longDescription,
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500 characters')
      }
    })
  })

  describe('frequency validation', () => {
    it('should accept "daily" frequency', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept "weekly" frequency', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'weekly' as const,
        goal: 3,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept "monthly" frequency', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'monthly' as const,
        goal: 10,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid frequency', () => {
      const invalidData = {
        name: 'Test Habit',
        description: '',
        frequency: 'yearly' as any,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('goal validation', () => {
    it('should accept goal of 1', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept goal of 100', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 100,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject goal less than 1', () => {
      const invalidData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 0,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1')
      }
    })

    it('should reject goal greater than 100', () => {
      const invalidData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 101,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100')
      }
    })

    it('should reject decimal goals', () => {
      const invalidData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 5.5,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('whole number')
      }
    })
  })

  describe('reminder validation', () => {
    it('should accept valid time format (HH:MM)', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: true,
        reminderTime: '09:00',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept time without leading zero', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: true,
        reminderTime: '9:00',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid time format', () => {
      const invalidData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: true,
        reminderTime: '25:00',
      }

      const result = habitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty reminderTime when not enabled', () => {
      const validData = {
        name: 'Test Habit',
        description: '',
        frequency: 'daily' as const,
        goal: 1,
        reminderEnabled: false,
        reminderTime: '',
      }

      const result = habitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('validateHabitName helper', () => {
  it('should return valid for correct names', () => {
    const result = validateHabitName('Morning Meditation')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should return error for empty names', () => {
    const result = validateHabitName('')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should return error for whitespace-only names', () => {
    const result = validateHabitName('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('spaces')
  })
})

describe('validateGoal helper', () => {
  it('should return valid for goals between 1-100', () => {
    expect(validateGoal(1).valid).toBe(true)
    expect(validateGoal(50).valid).toBe(true)
    expect(validateGoal(100).valid).toBe(true)
  })

  it('should return error for goal 0', () => {
    const result = validateGoal(0)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should return error for goal > 100', () => {
    const result = validateGoal(101)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should return error for decimal goals', () => {
    const result = validateGoal(5.5)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})
