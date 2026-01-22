/**
 * Goals Store
 * State management for goal tracking
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, GoalType, GoalPeriod, TimerMode } from './types'

interface GoalsState {
  goals: Goal[]
  
  // Actions
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'createdAt' | 'status'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  updateGoalProgress: (id: string, progress: number) => void
  completeGoal: (id: string) => void
  pauseGoal: (id: string) => void
  resumeGoal: (id: string) => void
  
  // Getters
  getActiveGoals: () => Goal[]
  getCompletedGoals: () => Goal[]
  getGoalById: (id: string) => Goal | undefined
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          current: 0,
          status: 'active',
          createdAt: new Date(),
        }
        set((state) => ({ goals: [...state.goals, newGoal] }))
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }))
      },

      updateGoalProgress: (id, progress) => {
        const goal = get().goals.find((g) => g.id === id)
        if (!goal) return

        const updates: Partial<Goal> = { current: progress }
        
        // Auto-complete if target reached
        if (progress >= goal.target && goal.status === 'active') {
          updates.status = 'completed'
          updates.completedAt = new Date()
        }

        get().updateGoal(id, updates)
      },

      completeGoal: (id) => {
        get().updateGoal(id, {
          status: 'completed',
          completedAt: new Date(),
        })
      },

      pauseGoal: (id) => {
        get().updateGoal(id, { status: 'paused' })
      },

      resumeGoal: (id) => {
        get().updateGoal(id, { status: 'active' })
      },

      getActiveGoals: () => {
        return get().goals.filter((goal) => goal.status === 'active')
      },

      getCompletedGoals: () => {
        return get().goals.filter((goal) => goal.status === 'completed')
      },

      getGoalById: (id) => {
        return get().goals.find((goal) => goal.id === id)
      },
    }),
    {
      name: 'timer-sidebar-goals',
    }
  )
)
