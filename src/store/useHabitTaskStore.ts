import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { HabitTask } from '@/types/habitTask'

interface HabitTaskStore {
  tasks: HabitTask[]
  
  // CRUD operations
  addTask: (task: Omit<HabitTask, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Omit<HabitTask, 'id' | 'habitId' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  
  // Queries
  getTasksByHabitId: (habitId: string) => HabitTask[]
  getTaskCount: (habitId: string) => number
  
  // Reset tasks based on frequency
  resetTasksIfNeeded: (habitId: string, frequency: 'daily' | 'weekly' | 'monthly') => void
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
              
              // If marking as completed, set completedDate to today
              if (updates.completed === true && !task.completed) {
                updatedTask.completedDate = new Date().toISOString().split('T')[0]
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

      resetTasksIfNeeded: (habitId, frequency) => {
        const today = new Date().toISOString().split('T')[0]
        
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
                  const day = d.getDay()
                  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
                  return new Date(d.setDate(diff)).toISOString().split('T')[0]
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
    }),
    {
      name: 'habit-tasks-storage',
    }
  )
)
