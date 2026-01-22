/**
 * Tag Store Tests
 * Comprehensive tests for custom tags Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'

// Must import store after mocks are set up
let useTagStore: typeof import('../tagStore').useTagStore

describe('useTagStore', () => {
  let mockDate = 1000000000000

  beforeEach(async () => {
    // Mock Date.now() for predictable IDs
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })

    // Mock Math.random for predictable IDs
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

    // Clear localStorage first
    localStorage.clear()

    // Dynamic import to ensure fresh store after localStorage is ready
    vi.resetModules()
    const module = await import('../tagStore')
    useTagStore = module.useTagStore

    // Reset store to initial state
    const state = useTagStore.getState()
    useTagStore.setState({
      tags: [],
      sessionTags: [],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty tags array', () => {
      const state = useTagStore.getState()
      expect(state.tags).toEqual([])
    })

    it('should start with empty sessionTags array', () => {
      const state = useTagStore.getState()
      expect(state.sessionTags).toEqual([])
    })
  })

  describe('addTag', () => {
    it('should add a new tag with generated id and metadata', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(1)
      expect(state.tags[0].name).toBe('Work')
      expect(state.tags[0].color).toBe('bg-blue-500')
      expect(state.tags[0].id).toMatch(/^tag-/)
      expect(state.tags[0].createdAt).toBeDefined()
      expect(state.tags[0].usageCount).toBe(0)
    })

    it('should add multiple tags', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Personal', color: 'bg-green-500' })
        addTag({ name: 'Urgent', color: 'bg-red-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(3)
    })

    it('should preserve optional icon field', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500', icon: '💼' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].icon).toBe('💼')
    })
  })

  describe('updateTag', () => {
    it('should update tag name', () => {
      const { addTag, updateTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        updateTag(tagId, { name: 'Office Work' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].name).toBe('Office Work')
    })

    it('should update tag color', () => {
      const { addTag, updateTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        updateTag(tagId, { color: 'bg-purple-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].color).toBe('bg-purple-500')
    })

    it('should update multiple fields at once', () => {
      const { addTag, updateTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        updateTag(tagId, { name: 'New Name', color: 'bg-red-500', icon: '🔥' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].name).toBe('New Name')
      expect(state.tags[0].color).toBe('bg-red-500')
      expect(state.tags[0].icon).toBe('🔥')
    })

    it('should not affect other tags when updating one', () => {
      const { addTag, updateTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Personal', color: 'bg-green-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        updateTag(tagId, { name: 'Updated' })
      })

      const state = useTagStore.getState()
      expect(state.tags[1].name).toBe('Personal')
    })

    it('should handle updating non-existent tag gracefully', () => {
      const { updateTag } = useTagStore.getState()

      act(() => {
        updateTag('non-existent-id', { name: 'Test' })
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(0)
    })
  })

  describe('deleteTag', () => {
    it('should delete a tag by id', () => {
      const { addTag, deleteTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        deleteTag(tagId)
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(0)
    })

    it('should remove tag from all session tags when deleted', () => {
      const { addTag, addTagToSession, deleteTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
        addTagToSession('session-2', tagId)
      })

      act(() => {
        deleteTag(tagId)
      })

      const state = useTagStore.getState()
      expect(state.sessionTags[0].tagIds).not.toContain(tagId)
      expect(state.sessionTags[1].tagIds).not.toContain(tagId)
    })

    it('should handle deleting non-existent tag gracefully', () => {
      const { deleteTag } = useTagStore.getState()

      act(() => {
        deleteTag('non-existent-id')
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(0)
    })
  })

  describe('getTag', () => {
    it('should return tag by id', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id
      const { getTag } = useTagStore.getState()
      const tag = getTag(tagId)

      expect(tag).toBeDefined()
      expect(tag?.name).toBe('Work')
    })

    it('should return undefined for non-existent tag', () => {
      const { getTag } = useTagStore.getState()
      const tag = getTag('non-existent-id')

      expect(tag).toBeUndefined()
    })
  })

  describe('getAllTags', () => {
    it('should return all tags', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Personal', color: 'bg-green-500' })
      })

      const { getAllTags } = useTagStore.getState()
      const tags = getAllTags()

      expect(tags).toHaveLength(2)
    })

    it('should return empty array when no tags exist', () => {
      const { getAllTags } = useTagStore.getState()
      const tags = getAllTags()

      expect(tags).toEqual([])
    })
  })

  describe('addTagToSession', () => {
    it('should add tag to a new session', () => {
      const { addTag, addTagToSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.sessionTags).toHaveLength(1)
      expect(state.sessionTags[0].sessionId).toBe('session-1')
      expect(state.sessionTags[0].tagIds).toContain(tagId)
    })

    it('should add multiple tags to the same session', () => {
      const { addTag, addTagToSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Urgent', color: 'bg-red-500' })
      })

      const tags = useTagStore.getState().tags

      act(() => {
        addTagToSession('session-1', tags[0].id)
        addTagToSession('session-1', tags[1].id)
      })

      const state = useTagStore.getState()
      expect(state.sessionTags).toHaveLength(1)
      expect(state.sessionTags[0].tagIds).toHaveLength(2)
    })

    it('should increment tag usage count when added to session', () => {
      const { addTag, addTagToSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.tags[0].usageCount).toBe(1)
    })

    it('should not add duplicate tag to same session', () => {
      const { addTag, addTagToSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
        addTagToSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.sessionTags[0].tagIds).toHaveLength(1)
    })
  })

  describe('removeTagFromSession', () => {
    it('should remove tag from session', () => {
      const { addTag, addTagToSession, removeTagFromSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
      })

      act(() => {
        removeTagFromSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.sessionTags[0].tagIds).not.toContain(tagId)
    })

    it('should decrement tag usage count when removed', () => {
      const { addTag, addTagToSession, removeTagFromSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
        addTagToSession('session-2', tagId)
      })

      expect(useTagStore.getState().tags[0].usageCount).toBe(2)

      act(() => {
        removeTagFromSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.tags[0].usageCount).toBe(1)
    })

    it('should not let usage count go below 0', () => {
      const { addTag, removeTagFromSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        removeTagFromSession('session-1', tagId)
      })

      const state = useTagStore.getState()
      expect(state.tags[0].usageCount).toBe(0)
    })
  })

  describe('getSessionTags', () => {
    it('should return tag ids for a session', () => {
      const { addTag, addTagToSession, getSessionTags } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Urgent', color: 'bg-red-500' })
      })

      const tags = useTagStore.getState().tags

      act(() => {
        addTagToSession('session-1', tags[0].id)
        addTagToSession('session-1', tags[1].id)
      })

      const sessionTags = useTagStore.getState().getSessionTags('session-1')
      expect(sessionTags).toHaveLength(2)
      expect(sessionTags).toContain(tags[0].id)
      expect(sessionTags).toContain(tags[1].id)
    })

    it('should return empty array for session with no tags', () => {
      const { getSessionTags } = useTagStore.getState()
      const sessionTags = getSessionTags('non-existent-session')

      expect(sessionTags).toEqual([])
    })
  })

  describe('getSessionsByTag', () => {
    it('should return session ids that have a specific tag', () => {
      const { addTag, addTagToSession } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
        addTagToSession('session-2', tagId)
        addTagToSession('session-3', tagId)
      })

      const { getSessionsByTag } = useTagStore.getState()
      const sessions = getSessionsByTag(tagId)

      expect(sessions).toHaveLength(3)
      expect(sessions).toContain('session-1')
      expect(sessions).toContain('session-2')
      expect(sessions).toContain('session-3')
    })

    it('should return empty array for tag with no sessions', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id
      const { getSessionsByTag } = useTagStore.getState()
      const sessions = getSessionsByTag(tagId)

      expect(sessions).toEqual([])
    })
  })

  describe('clearSessionTags', () => {
    it('should remove all tags from a session', () => {
      const { addTag, addTagToSession, clearSessionTags } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
        addTag({ name: 'Urgent', color: 'bg-red-500' })
      })

      const tags = useTagStore.getState().tags

      act(() => {
        addTagToSession('session-1', tags[0].id)
        addTagToSession('session-1', tags[1].id)
      })

      act(() => {
        clearSessionTags('session-1')
      })

      const state = useTagStore.getState()
      expect(state.sessionTags.find(st => st.sessionId === 'session-1')).toBeUndefined()
    })

    it('should not affect other sessions', () => {
      const { addTag, addTagToSession, clearSessionTags } = useTagStore.getState()

      act(() => {
        addTag({ name: 'Work', color: 'bg-blue-500' })
      })

      const tagId = useTagStore.getState().tags[0].id

      act(() => {
        addTagToSession('session-1', tagId)
        addTagToSession('session-2', tagId)
      })

      act(() => {
        clearSessionTags('session-1')
      })

      const state = useTagStore.getState()
      expect(state.sessionTags.find(st => st.sessionId === 'session-2')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string tag name', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: '', color: 'bg-blue-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags).toHaveLength(1)
      expect(state.tags[0].name).toBe('')
    })

    it('should handle special characters in tag name', () => {
      const { addTag } = useTagStore.getState()

      act(() => {
        addTag({ name: '🔥 Hot & Urgent! <script>', color: 'bg-red-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].name).toBe('🔥 Hot & Urgent! <script>')
    })

    it('should handle very long tag names', () => {
      const { addTag } = useTagStore.getState()
      const longName = 'A'.repeat(1000)

      act(() => {
        addTag({ name: longName, color: 'bg-blue-500' })
      })

      const state = useTagStore.getState()
      expect(state.tags[0].name).toBe(longName)
    })
  })
})
