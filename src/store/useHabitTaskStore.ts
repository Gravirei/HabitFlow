import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { HabitTask } from '@/types/habitTask'
import { getLocalToday, toLocalDateString } from '@/utils/dateUtils'

interface HabitTaskStore {
  tasks: HabitTask[]
  
  // CRUD operations
  addTask: (task: Omit<HabitTask, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Omit<HabitTask, 'id' | 'habitId' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  
  // Queries
  getTasksByHabitId: (habitId: string) => HabitTask[]
  getTaskCount: (habitId: string) => number
  getCompletedTaskCount: (habitId: string) => number
  
  // Reset tasks based on frequency
  resetTasksIfNeeded: (habitId: string, frequency: 'daily' | 'weekly' | 'monthly') => void
  
  // Batch reset all tasks for a new day (called by day-change detector)
  resetAllTasksForNewDay: () => void
}

export const useHabitTaskStore = create<HabitTaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        const newTask: HabitTask = {
          ...task,
          id: Date.now().toString(),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() }
              
              // If marking as completed, set completedDate (use provided date or default to today)
              if (updates.completed === true && !task.completed) {
                updatedTask.completedDate = updates.completedDate || getLocalToday()
              }
              
              // If marking as uncompleted, clear completedDate
              if (updates.completed === false && task.completed) {
                updatedTask.completedDate = undefined
              }
              
              return updatedTask
            }
            return task
          }),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      getTasksByHabitId: (habitId) => {
        return get().tasks.filter((task) => task.habitId === habitId)
      },

      getTaskCount: (habitId) => {
        return get().tasks.filter((task) => task.habitId === habitId).length
      },

      getCompletedTaskCount: (habitId) => {
        return get().tasks.filter((task) => task.habitId === habitId && task.completed).length
      },

      resetTasksIfNeeded: (habitId, frequency) => {
        const today = getLocalToday()
        
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.habitId !== habitId) return task
            if (!task.completed || !task.completedDate) return task
            
            // Check if task should be reset based on frequency
            const shouldReset = (() => {
              if (frequency === 'daily') {
                // Reset if completed on a different day
                return task.completedDate !== today
              } else if (frequency === 'weekly') {
                // Reset if completed in a different week
                const completedDate = new Date(task.completedDate)
                const todayDate = new Date(today)
                
                // Get Monday of the week for both dates
                const getMonday = (d: Date) => {
                  const clone = new Date(d.getTime())
                  const day = clone.getDay()
                  const diff = clone.getDate() - day + (day === 0 ? -6 : 1)
                  clone.setDate(diff)
                  return toLocalDateString(clone)
                }
                
                return getMonday(completedDate) !== getMonday(todayDate)
              } else if (frequency === 'monthly') {
                // Reset if completed in a different month
                const completedMonth = task.completedDate.substring(0, 7) // YYYY-MM
                const currentMonth = today.substring(0, 7)
                return completedMonth !== currentMonth
              }
              return false
            })()
            
            if (shouldReset) {
              return {
                ...task,
                completed: false,
                completedDate: undefined,
                updatedAt: new Date().toISOString(),
              }
            }
            
            return task
          }),
        }))
      },

      resetAllTasksForNewDay: () => {
        const today = getLocalToday()
        
        set((state) => ({
          tasks: state.tasks.map((task) => {
            // Only reset completed tasks from previous days
            if (!task.completed || !task.completedDate) return task
            if (task.completedDate === today) return task
            
            return {
              ...task,
              completed: false,
              completedDate: undefined,
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },
    }),
    {
      name: 'habit-tasks-storage',
    }
  )
)
