/**
 * Custom Tags Store
 * Manages tags and session tagging
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tag, TaggedSession } from './types'

interface TagStore {
  tags: Tag[]
  sessionTags: TaggedSession[]
  
  // Tag management
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  getTag: (id: string) => Tag | undefined
  getAllTags: () => Tag[]
  
  // Session tagging
  addTagToSession: (sessionId: string, tagId: string) => void
  removeTagFromSession: (sessionId: string, tagId: string) => void
  getSessionTags: (sessionId: string) => string[]
  getSessionsByTag: (tagId: string) => string[]
  clearSessionTags: (sessionId: string) => void
}

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tags: [],
      sessionTags: [],

      // Tag management
      addTag: (tag) => {
        const newTag: Tag = {
          ...tag,
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          usageCount: 0,
        }
        set((state) => ({
          tags: [...state.tags, newTag],
        }))
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          sessionTags: state.sessionTags.map((st) => ({
            ...st,
            tagIds: st.tagIds.filter((tagId) => tagId !== id),
          })),
        }))
      },

      getTag: (id) => {
        return get().tags.find((t) => t.id === id)
      },

      getAllTags: () => {
        return get().tags
      },

      // Session tagging
      addTagToSession: (sessionId, tagId) => {
        set((state) => {
          const existingSession = state.sessionTags.find((st) => st.sessionId === sessionId)
          
          if (existingSession) {
            // Add tag if not already present
            if (!existingSession.tagIds.includes(tagId)) {
              return {
                sessionTags: state.sessionTags.map((st) =>
                  st.sessionId === sessionId
                    ? { ...st, tagIds: [...st.tagIds, tagId] }
                    : st
                ),
                tags: state.tags.map((t) =>
                  t.id === tagId ? { ...t, usageCount: t.usageCount + 1 } : t
                ),
              }
            }
          } else {
            // Create new session tagging entry
            return {
              sessionTags: [...state.sessionTags, { sessionId, tagIds: [tagId] }],
              tags: state.tags.map((t) =>
                t.id === tagId ? { ...t, usageCount: t.usageCount + 1 } : t
              ),
            }
          }
          
          return state
        })
      },

      removeTagFromSession: (sessionId, tagId) => {
        set((state) => ({
          sessionTags: state.sessionTags.map((st) =>
            st.sessionId === sessionId
              ? { ...st, tagIds: st.tagIds.filter((id) => id !== tagId) }
              : st
          ),
          tags: state.tags.map((t) =>
            t.id === tagId ? { ...t, usageCount: Math.max(0, t.usageCount - 1) } : t
          ),
        }))
      },

      getSessionTags: (sessionId) => {
        const session = get().sessionTags.find((st) => st.sessionId === sessionId)
        return session?.tagIds || []
      },

      getSessionsByTag: (tagId) => {
        return get()
          .sessionTags.filter((st) => st.tagIds.includes(tagId))
          .map((st) => st.sessionId)
      },

      clearSessionTags: (sessionId) => {
        set((state) => ({
          sessionTags: state.sessionTags.filter((st) => st.sessionId !== sessionId),
        }))
      },
    }),
    {
      name: 'timer-custom-tags',
    }
  )
)
