import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { HabitTask, HabitTaskPriority } from '@/types/habitTask'

interface HabitTaskStore {
  tasks: HabitTask[]
  
  // CRUD operations
  addTask: (task: Omit<HabitTask, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Omit<HabitTask, 'id' | 'habitId' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  
  // Queries
  getTasksByHabitId: (habitId: string) => HabitTask[]
  getTaskCount: (habitId: string) => number
}

export const useHabitTaskStore = create<HabitTaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        const newTask: HabitTask = {
          ...task,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
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
    }),
    {
      name: 'habit-tasks-storage',
    }
  )
)
