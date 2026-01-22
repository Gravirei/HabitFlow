/**
 * useHabitStore Tests
 * Tests for habit store including new onboarding features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHabitStore } from '@/store/useHabitStore'
import { SAMPLE_HABITS } from '@/constants/sampleData'

describe('useHabitStore', () => {
  let mockDate = 1000000000000 // Start with a predictable timestamp

  beforeEach(() => {
    // Mock Date.now() for predictable IDs
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1 // Increment by 1ms each call
      return mockDate
    })

    // Clear localStorage before each test (uses global mock from setup.ts)
    localStorage.clear()

    // Reset store to initial state - use partial update to preserve methods
    // @ts-ignore - accessing internal state for testing
    const state = useHabitStore.getState()
    useHabitStore.setState({ 
      isFirstVisit: true, 
      habits: [],
      // Preserve all the methods
      addHabit: state.addHabit,
      updateHabit: state.updateHabit,
      deleteHabit: state.deleteHabit,
      toggleHabitCompletion: state.toggleHabitCompletion,
      isHabitCompletedToday: state.isHabitCompletedToday,
      isHabitCompletedOnDate: state.isHabitCompletedOnDate,
      loadSampleHabits: state.loadSampleHabits,
      markOnboardingComplete: state.markOnboardingComplete
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty habits array', () => {
      const { result } = renderHook(() => useHabitStore())
      expect(result.current.habits).toEqual([])
    })

    it('should start with isFirstVisit as true', () => {
      const { result } = renderHook(() => useHabitStore())
      expect(result.current.isFirstVisit).toBe(true)
    })
  })

  describe('loadSampleHabits', () => {
    it('should load sample habits when called', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      expect(result.current.habits).toEqual(SAMPLE_HABITS)
    })

    it('should set isFirstVisit to false after loading samples', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      expect(result.current.isFirstVisit).toBe(false)
    })

    it('should load exactly 4 sample habits', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      expect(result.current.habits.length).toBe(4)
    })

    it('should load habits with correct sample IDs', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      result.current.habits.forEach(habit => {
        expect(habit.id).toMatch(/^sample-/)
      })
    })
  })

  describe('markOnboardingComplete', () => {
    it('should set isFirstVisit to false', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.markOnboardingComplete()
      })

      expect(result.current.isFirstVisit).toBe(false)
    })

    it('should not add any habits when starting fresh', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.markOnboardingComplete()
      })

      expect(result.current.habits).toEqual([])
    })

    it('should persist isFirstVisit state', () => {
      const { result: result1 } = renderHook(() => useHabitStore())

      act(() => {
        result1.current.markOnboardingComplete()
      })

      // Create new hook instance to test persistence
      const { result: result2 } = renderHook(() => useHabitStore())
      expect(result2.current.isFirstVisit).toBe(false)
    })
  })

  describe('addHabit', () => {
    it('should add a new habit to the store', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      expect(result.current.habits.length).toBe(1)
      expect(result.current.habits[0].name).toBe('Test Habit')
    })

    it('should initialize new habit with default values', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      const habit = result.current.habits[0]
      expect(habit.currentStreak).toBe(0)
      expect(habit.bestStreak).toBe(0)
      expect(habit.completionRate).toBe(0)
      expect(habit.totalCompletions).toBe(0)
      expect(habit.completedDates).toEqual([])
    })

    it('should generate unique IDs for new habits', () => {
      const { result } = renderHook(() => useHabitStore())

      // Add habits in separate act() calls to ensure unique timestamps
      act(() => {
        result.current.addHabit({
          name: 'Habit 1',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      act(() => {
        result.current.addHabit({
          name: 'Habit 2',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      const ids = result.current.habits.map(h => h.id)
      expect(new Set(ids).size).toBe(2) // All IDs should be unique
    })
  })

  describe('deleteHabit', () => {
    it('should delete a habit by id', () => {
      const { result } = renderHook(() => useHabitStore())

      let habitId!: string

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      habitId = result.current.habits[0].id
      expect(result.current.habits.length).toBe(1)

      act(() => {
        result.current.deleteHabit(habitId)
      })

      expect(result.current.habits.length).toBe(0)
    })

    it('should be able to delete sample habits', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      expect(result.current.habits.length).toBe(4)

      act(() => {
        result.current.deleteHabit('sample-1')
      })

      expect(result.current.habits.length).toBe(3)
      expect(result.current.habits.find(h => h.id === 'sample-1')).toBeUndefined()
    })
  })

  describe('updateHabit', () => {
    it('should update habit properties', () => {
      const { result } = renderHook(() => useHabitStore())

      let habitId!: string

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      habitId = result.current.habits[0].id

      act(() => {
        result.current.updateHabit(habitId, { name: 'Updated Habit' })
      })

      expect(result.current.habits[0].name).toBe('Updated Habit')
    })
  })

  describe('toggleHabitCompletion', () => {
    it('should mark habit as completed for today', () => {
      const { result } = renderHook(() => useHabitStore())

      let habitId!: string

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      habitId = result.current.habits[0].id

      act(() => {
        result.current.toggleHabitCompletion(habitId)
      })

      expect(result.current.isHabitCompletedToday(habitId)).toBe(true)
    })

    it('should increment totalCompletions when completing', () => {
      const { result } = renderHook(() => useHabitStore())

      let habitId!: string

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      habitId = result.current.habits[0].id
      expect(result.current.habits[0].totalCompletions).toBe(0)

      act(() => {
        result.current.toggleHabitCompletion(habitId)
      })

      expect(result.current.habits[0].totalCompletions).toBe(1)
    })

    it('should toggle completion status', () => {
      const { result } = renderHook(() => useHabitStore())

      let habitId!: string

      act(() => {
        result.current.addHabit({
          name: 'Test Habit',
          icon: 'check_circle',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      habitId = result.current.habits[0].id

      // Complete
      act(() => {
        result.current.toggleHabitCompletion(habitId)
      })
      expect(result.current.isHabitCompletedToday(habitId)).toBe(true)

      // Uncomplete
      act(() => {
        result.current.toggleHabitCompletion(habitId)
      })
      expect(result.current.isHabitCompletedToday(habitId)).toBe(false)
    })
  })

  describe('Integration: Sample Habits and User Habits', () => {
    it('should allow mixing sample habits with user habits', () => {
      const { result } = renderHook(() => useHabitStore())

      act(() => {
        result.current.loadSampleHabits()
      })

      expect(result.current.habits.length).toBe(4)

      act(() => {
        result.current.addHabit({
          name: 'My Custom Habit',
          icon: 'fitness_center',
          frequency: 'weekly',
          goal: 3,
          goalPeriod: 'week',
          reminderEnabled: true,
          reminderTime: '10:00',
          startDate: '2024-01-01',
        })
      })

      expect(result.current.habits.length).toBe(5)
      expect(result.current.habits.some(h => h.name === 'My Custom Habit')).toBe(true)
    })

    it('should persist all habits (sample and custom) to localStorage', () => {
      const { result: result1 } = renderHook(() => useHabitStore())

      act(() => {
        result1.current.loadSampleHabits()
        result1.current.addHabit({
          name: 'My Custom Habit',
          icon: 'fitness_center',
          frequency: 'daily',
          goal: 1,
          goalPeriod: 'day',
          reminderEnabled: false,
          startDate: '2024-01-01',
        })
      })

      // Simulate new session
      const { result: result2 } = renderHook(() => useHabitStore())
      expect(result2.current.habits.length).toBe(5)
    })
  })
})
