/**
 * Goals Store Tests
 * Comprehensive tests for the goals Zustand store
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Goal, GoalType, GoalPeriod, TimerMode } from '../types'

// Import store dynamically
let useGoalsStore: typeof import('../goalsStore').useGoalsStore

// Helper to create mock goal data
const createMockGoalData = (overrides: Partial<Omit<Goal, 'id' | 'current' | 'createdAt' | 'status'>> = {}) => ({
  type: 'time' as GoalType,
  target: 3600, // 1 hour in seconds
  period: 'daily' as GoalPeriod,
  name: 'Test Goal',
  description: 'A test goal description',
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000), // Tomorrow
  ...overrides,
})

describe('useGoalsStore', () => {
  let mockDate = 1000000000000

  beforeEach(async () => {
    // Reset modules to ensure fresh store
    vi.resetModules()
    
    // Mock Date.now() for predictable IDs
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })

    // Clear localStorage before each test
    localStorage.clear()

    // Dynamically import store to ensure setup runs first
    const module = await import('../goalsStore')
    useGoalsStore = module.useGoalsStore
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty goals array', () => {
      const state = useGoalsStore.getState()
      expect(state.goals).toEqual([])
    })

    it('should have all required methods', () => {
      const state = useGoalsStore.getState()
      expect(typeof state.addGoal).toBe('function')
      expect(typeof state.updateGoal).toBe('function')
      expect(typeof state.deleteGoal).toBe('function')
      expect(typeof state.updateGoalProgress).toBe('function')
      expect(typeof state.completeGoal).toBe('function')
      expect(typeof state.pauseGoal).toBe('function')
      expect(typeof state.resumeGoal).toBe('function')
      expect(typeof state.getActiveGoals).toBe('function')
      expect(typeof state.getCompletedGoals).toBe('function')
      expect(typeof state.getGoalById).toBe('function')
    })
  })

  describe('addGoal', () => {
    it('should add a new goal with generated ID', () => {
      const { addGoal } = useGoalsStore.getState()
      const goalData = createMockGoalData()

      act(() => {
        addGoal(goalData)
      })

      const { goals } = useGoalsStore.getState()
      expect(goals.length).toBe(1)
      expect(goals[0].id).toMatch(/^goal-\d+-[a-z0-9]+$/)
    })

    it('should set initial current progress to 0', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData())
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].current).toBe(0)
    })

    it('should set initial status to active', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData())
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].status).toBe('active')
    })

    it('should set createdAt to current date', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData())
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].createdAt).toBeInstanceOf(Date)
    })

    it('should preserve all provided goal properties', () => {
      const { addGoal } = useGoalsStore.getState()
      const goalData = createMockGoalData({
        name: 'Custom Goal',
        description: 'Custom description',
        type: 'sessions',
        target: 10,
        period: 'weekly',
      })

      act(() => {
        addGoal(goalData)
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].name).toBe('Custom Goal')
      expect(goals[0].description).toBe('Custom description')
      expect(goals[0].type).toBe('sessions')
      expect(goals[0].target).toBe(10)
      expect(goals[0].period).toBe('weekly')
    })

    it('should add multiple goals', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ name: 'Goal 1' }))
        addGoal(createMockGoalData({ name: 'Goal 2' }))
        addGoal(createMockGoalData({ name: 'Goal 3' }))
      })

      const { goals } = useGoalsStore.getState()
      expect(goals.length).toBe(3)
    })

    it('should generate unique IDs for each goal', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ name: 'Goal 1' }))
        addGoal(createMockGoalData({ name: 'Goal 2' }))
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].id).not.toBe(goals[1].id)
    })

    it('should support mode-specific goals', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ 
          type: 'mode-specific',
          mode: 'Stopwatch' as TimerMode
        }))
      })

      const { goals } = useGoalsStore.getState()
      expect(goals[0].mode).toBe('Stopwatch')
    })
  })

  describe('updateGoal', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ name: 'Original Name' }))
      })
    })

    it('should update goal properties by ID', () => {
      const { updateGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoal(goalId, { name: 'Updated Name' })
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.name).toBe('Updated Name')
    })

    it('should only update specified properties', () => {
      const { updateGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id
      const originalTarget = goals[0].target

      act(() => {
        updateGoal(goalId, { name: 'Updated Name' })
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.target).toBe(originalTarget)
    })

    it('should update multiple properties at once', () => {
      const { updateGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoal(goalId, { 
          name: 'New Name',
          description: 'New Description',
          target: 7200
        })
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.name).toBe('New Name')
      expect(updatedGoal.description).toBe('New Description')
      expect(updatedGoal.target).toBe(7200)
    })

    it('should not affect other goals', () => {
      const { addGoal, updateGoal, goals } = useGoalsStore.getState()
      
      act(() => {
        addGoal(createMockGoalData({ name: 'Second Goal' }))
      })

      const goalId = useGoalsStore.getState().goals[0].id

      act(() => {
        updateGoal(goalId, { name: 'Updated First' })
      })

      const updatedGoals = useGoalsStore.getState().goals
      expect(updatedGoals[1].name).toBe('Second Goal')
    })

    it('should handle non-existent goal ID gracefully', () => {
      const { updateGoal, goals } = useGoalsStore.getState()
      const originalGoals = [...goals]

      act(() => {
        updateGoal('non-existent-id', { name: 'Should Not Update' })
      })

      const updatedGoals = useGoalsStore.getState().goals
      expect(updatedGoals[0].name).toBe(originalGoals[0].name)
    })
  })

  describe('deleteGoal', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ name: 'Goal 1' }))
        addGoal(createMockGoalData({ name: 'Goal 2' }))
      })
    })

    it('should remove goal by ID', () => {
      const { deleteGoal, goals } = useGoalsStore.getState()
      const goalToDelete = goals[0].id

      act(() => {
        deleteGoal(goalToDelete)
      })

      const { goals: updatedGoals } = useGoalsStore.getState()
      expect(updatedGoals.length).toBe(1)
      expect(updatedGoals.find(g => g.id === goalToDelete)).toBeUndefined()
    })

    it('should not affect other goals', () => {
      const { deleteGoal, goals } = useGoalsStore.getState()
      const goalToDelete = goals[0].id
      const remainingGoalId = goals[1].id

      act(() => {
        deleteGoal(goalToDelete)
      })

      const { goals: updatedGoals } = useGoalsStore.getState()
      expect(updatedGoals[0].id).toBe(remainingGoalId)
    })

    it('should handle non-existent goal ID gracefully', () => {
      const initialLength = useGoalsStore.getState().goals.length

      act(() => {
        useGoalsStore.getState().deleteGoal('non-existent-id')
      })

      expect(useGoalsStore.getState().goals.length).toBe(initialLength)
    })

    it('should allow deleting all goals', () => {
      const { deleteGoal, goals } = useGoalsStore.getState()

      act(() => {
        goals.forEach(g => deleteGoal(g.id))
      })

      expect(useGoalsStore.getState().goals.length).toBe(0)
    })
  })

  describe('updateGoalProgress', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ target: 100 }))
      })
    })

    it('should update goal current progress', () => {
      const { updateGoalProgress, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoalProgress(goalId, 50)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.current).toBe(50)
    })

    it('should auto-complete goal when target is reached', () => {
      const { updateGoalProgress, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoalProgress(goalId, 100)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('completed')
      expect(updatedGoal.completedAt).toBeInstanceOf(Date)
    })

    it('should auto-complete goal when target is exceeded', () => {
      const { updateGoalProgress, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoalProgress(goalId, 150)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('completed')
    })

    it('should not auto-complete if goal is not active', () => {
      const { updateGoalProgress, pauseGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        pauseGoal(goalId)
        updateGoalProgress(goalId, 100)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('paused')
    })

    it('should handle non-existent goal ID gracefully', () => {
      expect(() => {
        act(() => {
          useGoalsStore.getState().updateGoalProgress('non-existent-id', 50)
        })
      }).not.toThrow()
    })

    it('should allow progress to be set to 0', () => {
      const { updateGoalProgress, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        updateGoalProgress(goalId, 50)
        updateGoalProgress(goalId, 0)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.current).toBe(0)
    })
  })

  describe('completeGoal', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData())
      })
    })

    it('should set goal status to completed', () => {
      const { completeGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        completeGoal(goalId)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('completed')
    })

    it('should set completedAt date', () => {
      const { completeGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        completeGoal(goalId)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.completedAt).toBeInstanceOf(Date)
    })

    it('should handle already completed goals', () => {
      const { completeGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        completeGoal(goalId)
      })

      const firstCompletedAt = useGoalsStore.getState().goals[0].completedAt

      act(() => {
        completeGoal(goalId)
      })

      const secondCompletedAt = useGoalsStore.getState().goals[0].completedAt
      // Should update the completedAt time (or keep it the same based on implementation)
      expect(secondCompletedAt).toBeInstanceOf(Date)
    })
  })

  describe('pauseGoal', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData())
      })
    })

    it('should set goal status to paused', () => {
      const { pauseGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      act(() => {
        pauseGoal(goalId)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('paused')
    })

    it('should allow pausing an active goal', () => {
      const { pauseGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      expect(goals[0].status).toBe('active')

      act(() => {
        pauseGoal(goalId)
      })

      expect(useGoalsStore.getState().goals[0].status).toBe('paused')
    })
  })

  describe('resumeGoal', () => {
    beforeEach(() => {
      const { addGoal, pauseGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData())
      })
      const goalId = useGoalsStore.getState().goals[0].id
      act(() => {
        pauseGoal(goalId)
      })
    })

    it('should set goal status to active', () => {
      const { resumeGoal, goals } = useGoalsStore.getState()
      const goalId = goals[0].id

      expect(goals[0].status).toBe('paused')

      act(() => {
        resumeGoal(goalId)
      })

      const updatedGoal = useGoalsStore.getState().goals[0]
      expect(updatedGoal.status).toBe('active')
    })
  })

  describe('getActiveGoals', () => {
    beforeEach(() => {
      const { addGoal, pauseGoal, completeGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ name: 'Active Goal 1' }))
        addGoal(createMockGoalData({ name: 'Active Goal 2' }))
        addGoal(createMockGoalData({ name: 'Paused Goal' }))
        addGoal(createMockGoalData({ name: 'Completed Goal' }))
      })

      const goals = useGoalsStore.getState().goals
      act(() => {
        pauseGoal(goals[2].id)
        completeGoal(goals[3].id)
      })
    })

    it('should return only active goals', () => {
      const activeGoals = useGoalsStore.getState().getActiveGoals()
      
      expect(activeGoals.length).toBe(2)
      activeGoals.forEach(g => expect(g.status).toBe('active'))
    })

    it('should not include paused goals', () => {
      const activeGoals = useGoalsStore.getState().getActiveGoals()
      
      expect(activeGoals.find(g => g.name === 'Paused Goal')).toBeUndefined()
    })

    it('should not include completed goals', () => {
      const activeGoals = useGoalsStore.getState().getActiveGoals()
      
      expect(activeGoals.find(g => g.name === 'Completed Goal')).toBeUndefined()
    })
  })

  describe('getCompletedGoals', () => {
    beforeEach(() => {
      const { addGoal, completeGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ name: 'Active Goal' }))
        addGoal(createMockGoalData({ name: 'Completed Goal 1' }))
        addGoal(createMockGoalData({ name: 'Completed Goal 2' }))
      })

      const goals = useGoalsStore.getState().goals
      act(() => {
        completeGoal(goals[1].id)
        completeGoal(goals[2].id)
      })
    })

    it('should return only completed goals', () => {
      const completedGoals = useGoalsStore.getState().getCompletedGoals()
      
      expect(completedGoals.length).toBe(2)
      completedGoals.forEach(g => expect(g.status).toBe('completed'))
    })

    it('should not include active goals', () => {
      const completedGoals = useGoalsStore.getState().getCompletedGoals()
      
      expect(completedGoals.find(g => g.name === 'Active Goal')).toBeUndefined()
    })
  })

  describe('getGoalById', () => {
    beforeEach(() => {
      const { addGoal } = useGoalsStore.getState()
      act(() => {
        addGoal(createMockGoalData({ name: 'Test Goal' }))
      })
    })

    it('should return goal when found', () => {
      const { getGoalById, goals } = useGoalsStore.getState()
      const targetId = goals[0].id
      
      const goal = getGoalById(targetId)
      expect(goal).toBeDefined()
      expect(goal?.id).toBe(targetId)
    })

    it('should return undefined for non-existent ID', () => {
      const { getGoalById } = useGoalsStore.getState()
      
      const goal = getGoalById('non-existent-id')
      expect(goal).toBeUndefined()
    })

    it('should return goal with all properties', () => {
      const { getGoalById, goals } = useGoalsStore.getState()
      const targetId = goals[0].id
      
      const goal = getGoalById(targetId)
      expect(goal?.name).toBe('Test Goal')
      expect(goal?.status).toBe('active')
      expect(goal?.current).toBe(0)
    })
  })

  describe('Persistence', () => {
    it('should persist goals to localStorage', () => {
      const { addGoal } = useGoalsStore.getState()
      
      act(() => {
        addGoal(createMockGoalData({ name: 'Persistent Goal' }))
      })

      const stored = localStorage.getItem('timer-sidebar-goals')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.goals).toBeDefined()
      expect(parsed.state.goals.length).toBe(1)
    })

    it('should use correct storage key', () => {
      const { addGoal } = useGoalsStore.getState()
      
      act(() => {
        addGoal(createMockGoalData())
      })

      const stored = localStorage.getItem('timer-sidebar-goals')
      expect(stored).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid goal additions', () => {
      const { addGoal } = useGoalsStore.getState()

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            addGoal(createMockGoalData({ name: `Goal ${i}` }))
          }
        })
      }).not.toThrow()

      expect(useGoalsStore.getState().goals.length).toBe(100)
    })

    it('should handle goals with very large targets', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ target: Number.MAX_SAFE_INTEGER }))
      })

      const goal = useGoalsStore.getState().goals[0]
      expect(goal.target).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle goals with zero target', () => {
      const { addGoal, updateGoalProgress } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ target: 0 }))
      })

      const goalId = useGoalsStore.getState().goals[0].id

      act(() => {
        updateGoalProgress(goalId, 0)
      })

      // With target 0 and progress 0, it should auto-complete
      const goal = useGoalsStore.getState().goals[0]
      expect(goal.status).toBe('completed')
    })

    it('should handle empty goal name', () => {
      const { addGoal } = useGoalsStore.getState()

      act(() => {
        addGoal(createMockGoalData({ name: '' }))
      })

      const goal = useGoalsStore.getState().goals[0]
      expect(goal.name).toBe('')
    })

    it('should handle special characters in goal name', () => {
      const { addGoal } = useGoalsStore.getState()
      const specialName = '<script>alert("test")</script> & "quotes" \'single\''

      act(() => {
        addGoal(createMockGoalData({ name: specialName }))
      })

      const goal = useGoalsStore.getState().goals[0]
      expect(goal.name).toBe(specialName)
    })
  })
})
