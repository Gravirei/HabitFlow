import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task } from '@/types/task'

interface TaskState {
  tasks: Task[]

  // Mutations
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void

  // Helpers
  getTasksByCategory: (categoryId: string) => Task[]
  clearCategoryFromTasks: (categoryId: string) => void
}

const readJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const readLegacyTasks = (): Task[] | null => {
  const legacy = readJson<Task[]>(localStorage.getItem('tasks'))
  if (!legacy || !Array.isArray(legacy) || legacy.length === 0) return null
  return legacy
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) => {
        const next = get().tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !t.completed,
                status: !t.completed ? 'completed' : 'todo',
                updatedAt: new Date().toISOString(),
              }
            : t
        )
        set({ tasks: next })
      },

      getTasksByCategory: (categoryId) =>
        get().tasks.filter((task) => task.categoryId === categoryId),

      clearCategoryFromTasks: (categoryId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.categoryId === categoryId ? { ...task, categoryId: undefined } : task
          ),
        }))
      },
    }),
    {
      name: 'task-storage',
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
        },
      },
      merge: (persisted, current) => {
        // Zustand persist passes the *inner* state object to merge(), not `{ state }`.
        const typedPersisted = persisted as Partial<TaskState> | undefined
        const persistedTasks = typedPersisted?.tasks

        if (persistedTasks && persistedTasks.length > 0) {
          return { ...current, ...typedPersisted, tasks: persistedTasks }
        }

        // Legacy migration: Tasks page previously stored under localStorage['tasks'].
        const legacyTasks = readLegacyTasks()
        if (legacyTasks) {
          // Best-effort cleanup to avoid divergence.
          localStorage.removeItem('tasks')
          return { ...current, ...typedPersisted, tasks: legacyTasks }
        }

        return { ...current, ...typedPersisted }
      },
    }
  )
)
