import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Habit } from '@/types/habit'
import { format } from 'date-fns'
import { SAMPLE_HABITS } from '@/constants/sampleData'
import { calculateStreaks } from '@/utils/streakUtils'

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

  /**
   * Returns only habits that have a valid categoryId, are active, and not archived.
   * Use this in pages/components instead of raw `habits` to avoid orphaned records.
   */
  getActiveHabits: () => Habit[]

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

  // Notes functionality
  addNote: (habitId: string, noteText: string) => void
  deleteNote: (habitId: string, noteId: string) => void

  // Pin functionality
  pinHabit: (habitId: string) => void
  unpinHabit: (habitId: string) => void

  // Hide for today functionality
  hideHabitForToday: (habitId: string, date: string) => void
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
            
            // Calculate streaks using modern yesterday-tolerant algorithm
            const { currentStreak, bestStreak } = calculateStreaks(completedDates)
            
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

      getActiveHabits: () => {
        return get().habits.filter(
          (h) => h.isActive !== false && h.categoryId !== undefined && !h.archived
        )
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

      addNote: (habitId, noteText) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit
            
            const newNote = {
              id: Date.now().toString(),
              text: noteText,
              createdAt: new Date().toISOString(),
            }
            
            return {
              ...habit,
              notes: [...(habit.notes || []), newNote],
            }
          }),
        }))
      },

      deleteNote: (habitId, noteId) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit
            
            return {
              ...habit,
              notes: (habit.notes || []).filter((note) => note.id !== noteId),
            }
          }),
        }))
      },

      pinHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId ? { ...habit, pinned: true } : habit
          ),
        }))
      },

      unpinHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId ? { ...habit, pinned: false } : habit
          ),
        }))
      },

      hideHabitForToday: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  hiddenDates: [...(habit.hiddenDates || []), date],
                }
              : habit
          ),
        }))
      },
    }),
    {
      name: 'habit-storage',
      version: 1,
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
      },
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>

        if (version === 0) {
          // Migration v0→v1: Remove orphaned habits that have no categoryId.
          // These are legacy/sample habits that are already invisible on
          // Today and Habits pages but still bloat storage and skew stats.
          const habits = (state.habits ?? []) as Habit[]
          state.habits = habits.filter((h) => h.categoryId !== undefined)
        }

        return state as HabitState
      },
    }
  )
)
