import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Habit } from '@/types/habit'
import { format } from 'date-fns'
import { SAMPLE_HABITS } from '@/constants/sampleData'

interface HabitState {
  habits: Habit[]
  isFirstVisit: boolean
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completionRate' | 'totalCompletions' | 'completedDates'>) => void
  updateHabit: (id: string, habit: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleHabitCompletion: (habitId: string, date?: string) => void
  isHabitCompletedToday: (habitId: string) => boolean
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean
  loadSampleHabits: () => void
  markOnboardingComplete: () => void

  // Category helpers (additive; no behavior change for existing callers)
  getHabitsByCategory: (categoryId: string) => Habit[]
  moveHabitToCategory: (habitId: string, categoryId: string) => void
  getUncategorizedHabits: () => Habit[]

  /**
   * When a category is deleted, make affected habits Uncategorized by clearing
   * their `categoryId`.
   *
   * Note: this intentionally does not touch the legacy `category` field.
   */
  clearCategoryFromHabits: (categoryId: string) => void

  // Archive functionality
  archiveHabit: (habitId: string) => void
  unarchiveHabit: (habitId: string) => void
}

const mapLegacyCategoryToCategoryId = (
  legacy?: Habit['category']
): string | undefined => {
  if (!legacy) return undefined

  // Minimal compatibility mapping during migration.
  switch (legacy) {
    case 'health':
      return 'health'
    case 'work':
      return 'work'
    case 'personal':
      // Product decision pending; choose a stable default for now.
      return 'home'
    default:
      return undefined
  }
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      isFirstVisit: true,
      
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: Date.now().toString(),
          currentStreak: 0,
          bestStreak: 0,
          completionRate: 0,
          totalCompletions: 0,
          completedDates: [],
        }
        set((state) => ({ habits: [...state.habits, newHabit] }))
      },
      
      updateHabit: (id, updatedData) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updatedData } : habit
          ),
        }))
      },
      
      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }))
      },
      
      toggleHabitCompletion: (habitId, date = format(new Date(), 'yyyy-MM-dd')) => {
        set((state) => {
          const habits = state.habits.map((habit) => {
            if (habit.id !== habitId) return habit
            
            const isCompleted = habit.completedDates.includes(date)
            const completedDates = isCompleted
              ? habit.completedDates.filter((d) => d !== date)
              : [...habit.completedDates, date]
            
            const totalCompletions = isCompleted
              ? habit.totalCompletions - 1
              : habit.totalCompletions + 1
            
            // Calculate streak
            const sortedDates = [...completedDates].sort().reverse()
            let currentStreak = 0
            const today = new Date()
            
            for (let i = 0; i < sortedDates.length; i++) {
              const date = new Date(sortedDates[i])
              const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
              
              if (diffDays === i) {
                currentStreak++
              } else {
                break
              }
            }
            
            const bestStreak = Math.max(habit.bestStreak, currentStreak)
            
            return {
              ...habit,
              completedDates,
              totalCompletions,
              currentStreak,
              bestStreak,
            }
          })
          
          return { habits }
        })
      },
      
      isHabitCompletedToday: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId)
        const today = format(new Date(), 'yyyy-MM-dd')
        return habit?.completedDates.includes(today) || false
      },
      
      isHabitCompletedOnDate: (habitId: string, date: string) => {
        const habit = get().habits.find((h) => h.id === habitId)
        return habit?.completedDates.includes(date) || false
      },
      
      loadSampleHabits: () => {
        set({ 
          habits: SAMPLE_HABITS,
          isFirstVisit: false 
        })
      },
      
      markOnboardingComplete: () => {
        set({ isFirstVisit: false })
      },

      getHabitsByCategory: (categoryId) => {
        return get().habits.filter((habit) => {
          if (habit.categoryId) return habit.categoryId === categoryId
          const mapped = mapLegacyCategoryToCategoryId(habit.category)
          return mapped === categoryId
        })
      },

      moveHabitToCategory: (habitId, categoryId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId ? { ...habit, categoryId } : habit
          ),
        }))
      },

      getUncategorizedHabits: () => {
        return get().habits.filter(
          (habit) => !habit.categoryId && !habit.category
        )
      },

      clearCategoryFromHabits: (categoryId) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.categoryId !== categoryId),
        }))
      },

      archiveHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? { ...habit, archived: true, archivedDate: new Date().toISOString() }
              : habit
          ),
        }))
      },

      unarchiveHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? { ...habit, archived: false, archivedDate: undefined }
              : habit
          ),
        }))
      },
    }),
    {
      name: 'habit-storage',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)
