/**
 * Session Templates Store
 * Manages user-created session templates
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionTemplate } from './types'

interface TemplateStore {
  templates: SessionTemplate[]
  addTemplate: (template: Omit<SessionTemplate, 'id' | 'createdAt' | 'useCount' | 'isFavorite'>) => void
  updateTemplate: (id: string, updates: Partial<SessionTemplate>) => void
  deleteTemplate: (id: string) => void
  toggleFavorite: (id: string) => void
  incrementUseCount: (id: string) => void
  getTemplate: (id: string) => SessionTemplate | undefined
  getFavorites: () => SessionTemplate[]
  getRecentlyUsed: (limit?: number) => SessionTemplate[]
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        const newTemplate: SessionTemplate = {
          ...template,
          id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          useCount: 0,
          isFavorite: false,
        }
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
      },

      toggleFavorite: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
          ),
        }))
      },

      incrementUseCount: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, useCount: t.useCount + 1, lastUsed: Date.now() } : t
          ),
        }))
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id)
      },

      getFavorites: () => {
        return get().templates.filter((t) => t.isFavorite)
      },

      getRecentlyUsed: (limit = 5) => {
        return [...get().templates]
          .filter((t) => t.lastUsed)
          .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
          .slice(0, limit)
      },
    }),
    {
      name: 'timer-session-templates',
    }
  )
)
