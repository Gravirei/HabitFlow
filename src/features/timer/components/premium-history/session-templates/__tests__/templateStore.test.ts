/**
 * Template Store Tests
 * Comprehensive tests for session templates Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'

// Must import store after mocks are set up
let useTemplateStore: typeof import('../templateStore').useTemplateStore

describe('useTemplateStore', () => {
  let mockDate = 1000000000000

  beforeEach(async () => {
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

    // Clear localStorage first
    localStorage.clear()
    
    // Dynamic import to ensure fresh store after localStorage is ready
    vi.resetModules()
    const module = await import('../templateStore')
    useTemplateStore = module.useTemplateStore

    // Reset store to initial state
    useTemplateStore.setState({ templates: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty templates array', () => {
      const state = useTemplateStore.getState()
      expect(state.templates).toEqual([])
    })
  })

  describe('addTemplate', () => {
    it('should add a new template with generated metadata', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({
          name: 'Focus Session',
          mode: 'Countdown',
          countdownDuration: 1500000,
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(1)
      expect(state.templates[0].name).toBe('Focus Session')
      expect(state.templates[0].id).toMatch(/^template-/)
      expect(state.templates[0].createdAt).toBeDefined()
      expect(state.templates[0].useCount).toBe(0)
      expect(state.templates[0].isFavorite).toBe(false)
    })

    it('should add Stopwatch template', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({
          name: 'Open Session',
          mode: 'Stopwatch',
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].mode).toBe('Stopwatch')
    })

    it('should add Countdown template with duration', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({
          name: '25 Min Focus',
          mode: 'Countdown',
          countdownDuration: 1500000,
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].countdownDuration).toBe(1500000)
    })

    it('should add Intervals template with all settings', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({
          name: 'Pomodoro',
          mode: 'Intervals',
          workDuration: 1500000,
          breakDuration: 300000,
          targetLoops: 4,
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].workDuration).toBe(1500000)
      expect(state.templates[0].breakDuration).toBe(300000)
      expect(state.templates[0].targetLoops).toBe(4)
    })

    it('should preserve optional fields', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({
          name: 'Custom Template',
          mode: 'Countdown',
          description: 'A custom timer',
          icon: '⏱️',
          color: 'bg-blue-500',
          category: 'Work',
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].description).toBe('A custom timer')
      expect(state.templates[0].icon).toBe('⏱️')
      expect(state.templates[0].color).toBe('bg-blue-500')
      expect(state.templates[0].category).toBe('Work')
    })

    it('should add multiple templates', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
        addTemplate({ name: 'Template 3', mode: 'Intervals' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(3)
    })
  })

  describe('updateTemplate', () => {
    it('should update template name', () => {
      const { addTemplate, updateTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Original', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        updateTemplate(templateId, { name: 'Updated' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].name).toBe('Updated')
    })

    it('should update template mode and settings', () => {
      const { addTemplate, updateTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        updateTemplate(templateId, {
          mode: 'Countdown',
          countdownDuration: 1800000,
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].mode).toBe('Countdown')
      expect(state.templates[0].countdownDuration).toBe(1800000)
    })

    it('should update multiple fields at once', () => {
      const { addTemplate, updateTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        updateTemplate(templateId, {
          name: 'New Name',
          description: 'New Description',
          icon: '🎯',
          color: 'bg-red-500',
        })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].name).toBe('New Name')
      expect(state.templates[0].description).toBe('New Description')
      expect(state.templates[0].icon).toBe('🎯')
      expect(state.templates[0].color).toBe('bg-red-500')
    })

    it('should not affect other templates', () => {
      const { addTemplate, updateTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        updateTemplate(templateId, { name: 'Updated' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[1].name).toBe('Template 2')
    })

    it('should handle updating non-existent template gracefully', () => {
      const { updateTemplate } = useTemplateStore.getState()

      act(() => {
        updateTemplate('non-existent', { name: 'Test' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(0)
    })
  })

  describe('deleteTemplate', () => {
    it('should delete a template by id', () => {
      const { addTemplate, deleteTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        deleteTemplate(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(0)
    })

    it('should only delete the specified template', () => {
      const { addTemplate, deleteTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        deleteTemplate(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(1)
      expect(state.templates[0].name).toBe('Template 2')
    })

    it('should handle deleting non-existent template gracefully', () => {
      const { deleteTemplate } = useTemplateStore.getState()

      act(() => {
        deleteTemplate('non-existent')
      })

      const state = useTemplateStore.getState()
      expect(state.templates).toHaveLength(0)
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite to true', () => {
      const { addTemplate, toggleFavorite } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        toggleFavorite(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].isFavorite).toBe(true)
    })

    it('should toggle favorite back to false', () => {
      const { addTemplate, toggleFavorite } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        toggleFavorite(templateId)
        toggleFavorite(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].isFavorite).toBe(false)
    })
  })

  describe('incrementUseCount', () => {
    it('should increment use count', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        incrementUseCount(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].useCount).toBe(1)
    })

    it('should increment multiple times', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        incrementUseCount(templateId)
        incrementUseCount(templateId)
        incrementUseCount(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].useCount).toBe(3)
    })

    it('should set lastUsed timestamp', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id

      act(() => {
        incrementUseCount(templateId)
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].lastUsed).toBeDefined()
    })
  })

  describe('getTemplate', () => {
    it('should return template by id', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const templateId = useTemplateStore.getState().templates[0].id
      const { getTemplate } = useTemplateStore.getState()
      const template = getTemplate(templateId)

      expect(template).toBeDefined()
      expect(template?.name).toBe('Test')
    })

    it('should return undefined for non-existent template', () => {
      const { getTemplate } = useTemplateStore.getState()
      const template = getTemplate('non-existent')

      expect(template).toBeUndefined()
    })
  })

  describe('getFavorites', () => {
    it('should return only favorited templates', () => {
      const { addTemplate, toggleFavorite } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
        addTemplate({ name: 'Template 3', mode: 'Intervals' })
      })

      const templates = useTemplateStore.getState().templates

      act(() => {
        toggleFavorite(templates[0].id)
        toggleFavorite(templates[2].id)
      })

      const { getFavorites } = useTemplateStore.getState()
      const favorites = getFavorites()

      expect(favorites).toHaveLength(2)
      expect(favorites.map(t => t.name)).toContain('Template 1')
      expect(favorites.map(t => t.name)).toContain('Template 3')
    })

    it('should return empty array when no favorites', () => {
      const { addTemplate, getFavorites } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const favorites = getFavorites()
      expect(favorites).toHaveLength(0)
    })
  })

  describe('getRecentlyUsed', () => {
    it('should return recently used templates sorted by lastUsed', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
        addTemplate({ name: 'Template 3', mode: 'Intervals' })
      })

      const templates = useTemplateStore.getState().templates

      act(() => {
        incrementUseCount(templates[0].id) // Used first
        incrementUseCount(templates[2].id) // Used second
        incrementUseCount(templates[1].id) // Used last (most recent)
      })

      const { getRecentlyUsed } = useTemplateStore.getState()
      const recentlyUsed = getRecentlyUsed()

      expect(recentlyUsed).toHaveLength(3)
      expect(recentlyUsed[0].name).toBe('Template 2') // Most recent
    })

    it('should respect limit parameter', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
        addTemplate({ name: 'Template 3', mode: 'Intervals' })
      })

      const templates = useTemplateStore.getState().templates

      act(() => {
        templates.forEach(t => incrementUseCount(t.id))
      })

      const { getRecentlyUsed } = useTemplateStore.getState()
      const recentlyUsed = getRecentlyUsed(2)

      expect(recentlyUsed).toHaveLength(2)
    })

    it('should only return templates with lastUsed set', () => {
      const { addTemplate, incrementUseCount } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Template 1', mode: 'Stopwatch' })
        addTemplate({ name: 'Template 2', mode: 'Countdown' })
      })

      const templates = useTemplateStore.getState().templates

      act(() => {
        incrementUseCount(templates[0].id)
      })

      const { getRecentlyUsed } = useTemplateStore.getState()
      const recentlyUsed = getRecentlyUsed()

      expect(recentlyUsed).toHaveLength(1)
      expect(recentlyUsed[0].name).toBe('Template 1')
    })

    it('should return empty array when no templates used', () => {
      const { addTemplate, getRecentlyUsed } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch' })
      })

      const recentlyUsed = getRecentlyUsed()
      expect(recentlyUsed).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string template name', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: '', mode: 'Stopwatch' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].name).toBe('')
    })

    it('should handle special characters in template name', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: '🎯 Focus & Study <time>', mode: 'Countdown' })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].name).toBe('🎯 Focus & Study <time>')
    })

    it('should handle very long descriptions', () => {
      const { addTemplate } = useTemplateStore.getState()
      const longDesc = 'A'.repeat(1000)

      act(() => {
        addTemplate({ name: 'Test', mode: 'Stopwatch', description: longDesc })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].description).toBe(longDesc)
    })

    it('should handle zero duration', () => {
      const { addTemplate } = useTemplateStore.getState()

      act(() => {
        addTemplate({ name: 'Zero', mode: 'Countdown', countdownDuration: 0 })
      })

      const state = useTemplateStore.getState()
      expect(state.templates[0].countdownDuration).toBe(0)
    })
  })
})
