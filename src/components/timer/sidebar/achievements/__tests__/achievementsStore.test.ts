/**
 * Achievements Store Tests
 * Comprehensive tests for the achievements Zustand store
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { UserStats } from '../types'

// Import store and definitions dynamically
let useAchievementsStore: typeof import('../achievementsStore').useAchievementsStore
let ACHIEVEMENT_DEFINITIONS: typeof import('../achievementDefinitions').ACHIEVEMENT_DEFINITIONS

// Helper to create mock user stats
const createMockStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  totalTime: 0,
  totalSessions: 0,
  completedSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  stopwatchSessions: 0,
  countdownSessions: 0,
  intervalsSessions: 0,
  stopwatchTime: 0,
  countdownTime: 0,
  intervalsTime: 0,
  daysActive: 0,
  ...overrides,
})

describe('useAchievementsStore', () => {
  beforeEach(async () => {
    // Reset modules to ensure fresh store
    vi.resetModules()
    
    // Clear localStorage before each test
    localStorage.clear()

    // Dynamically import store to ensure setup runs first
    const storeModule = await import('../achievementsStore')
    const defsModule = await import('../achievementDefinitions')
    useAchievementsStore = storeModule.useAchievementsStore
    ACHIEVEMENT_DEFINITIONS = defsModule.ACHIEVEMENT_DEFINITIONS
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty achievements array', () => {
      const state = useAchievementsStore.getState()
      expect(state.achievements).toEqual([])
    })

    it('should have all required methods', () => {
      const state = useAchievementsStore.getState()
      expect(typeof state.initializeAchievements).toBe('function')
      expect(typeof state.updateAchievements).toBe('function')
      expect(typeof state.unlockAchievement).toBe('function')
      expect(typeof state.getUnlockedAchievements).toBe('function')
      expect(typeof state.getLockedAchievements).toBe('function')
      expect(typeof state.getAchievementById).toBe('function')
      expect(typeof state.getAchievementsByCategory).toBe('function')
      expect(typeof state.getAchievementsByRarity).toBe('function')
      expect(typeof state.resetAchievements).toBe('function')
    })
  })

  describe('initializeAchievements', () => {
    it('should initialize achievements from definitions', () => {
      const { initializeAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const { achievements } = useAchievementsStore.getState()
      expect(achievements.length).toBe(ACHIEVEMENT_DEFINITIONS.length)
    })

    it('should set all achievements as locked initially', () => {
      const { initializeAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const { achievements } = useAchievementsStore.getState()
      achievements.forEach((achievement) => {
        expect(achievement.unlocked).toBe(false)
        expect(achievement.progress).toBe(0)
        expect(achievement.unlockedAt).toBeUndefined()
      })
    })

    it('should not reinitialize if achievements already exist', () => {
      const { initializeAchievements, unlockAchievement } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const firstAchievementId = useAchievementsStore.getState().achievements[0]?.id
      
      act(() => {
        if (firstAchievementId) {
          unlockAchievement(firstAchievementId)
        }
        initializeAchievements() // Should not reset
      })

      const { achievements } = useAchievementsStore.getState()
      const firstAchievement = achievements.find(a => a.id === firstAchievementId)
      expect(firstAchievement?.unlocked).toBe(true)
    })

    it('should copy all properties from definitions', () => {
      const { initializeAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const { achievements } = useAchievementsStore.getState()
      const firstDef = ACHIEVEMENT_DEFINITIONS[0]
      const firstAchievement = achievements.find(a => a.id === firstDef.id)

      expect(firstAchievement).toBeDefined()
      expect(firstAchievement?.name).toBe(firstDef.name)
      expect(firstAchievement?.description).toBe(firstDef.description)
      expect(firstAchievement?.icon).toBe(firstDef.icon)
      expect(firstAchievement?.rarity).toBe(firstDef.rarity)
      expect(firstAchievement?.category).toBe(firstDef.category)
      expect(firstAchievement?.requirement).toBe(firstDef.requirement)
    })
  })

  describe('unlockAchievement', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should unlock a specific achievement by ID', () => {
      const { unlockAchievement, getAchievementById } = useAchievementsStore.getState()
      const achievementId = useAchievementsStore.getState().achievements[0]?.id

      if (!achievementId) throw new Error('No achievement found')

      act(() => {
        unlockAchievement(achievementId)
      })

      const achievement = useAchievementsStore.getState().getAchievementById(achievementId)
      expect(achievement?.unlocked).toBe(true)
      expect(achievement?.unlockedAt).toBeInstanceOf(Date)
    })

    it('should set progress to requirement when unlocking', () => {
      const { unlockAchievement, getAchievementById } = useAchievementsStore.getState()
      const achievement = useAchievementsStore.getState().achievements[0]

      if (!achievement) throw new Error('No achievement found')

      act(() => {
        unlockAchievement(achievement.id)
      })

      const updated = useAchievementsStore.getState().getAchievementById(achievement.id)
      expect(updated?.progress).toBe(achievement.requirement)
    })

    it('should not re-unlock already unlocked achievement', () => {
      const { unlockAchievement, getAchievementById } = useAchievementsStore.getState()
      const achievementId = useAchievementsStore.getState().achievements[0]?.id

      if (!achievementId) throw new Error('No achievement found')

      act(() => {
        unlockAchievement(achievementId)
      })

      const firstUnlockTime = useAchievementsStore.getState().getAchievementById(achievementId)?.unlockedAt

      act(() => {
        unlockAchievement(achievementId)
      })

      const secondUnlockTime = useAchievementsStore.getState().getAchievementById(achievementId)?.unlockedAt
      expect(firstUnlockTime).toEqual(secondUnlockTime)
    })

    it('should handle non-existent achievement ID gracefully', () => {
      const { unlockAchievement, achievements } = useAchievementsStore.getState()
      const initialLength = achievements.length

      act(() => {
        unlockAchievement('non-existent-id')
      })

      const { achievements: updatedAchievements } = useAchievementsStore.getState()
      expect(updatedAchievements.length).toBe(initialLength)
    })
  })

  describe('updateAchievements', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should update progress based on user stats', () => {
      const { updateAchievements } = useAchievementsStore.getState()
      const stats = createMockStats({ totalTime: 18000 }) // 5 hours

      act(() => {
        updateAchievements(stats)
      })

      const timeAchievement = useAchievementsStore.getState().achievements.find(
        a => a.category === 'time'
      )
      expect(timeAchievement?.progress).toBeGreaterThan(0)
    })

    it('should auto-unlock achievement when requirement is met', () => {
      const { updateAchievements } = useAchievementsStore.getState()
      // 10 hours = 36000 seconds (matches 'time_10h' achievement)
      const stats = createMockStats({ totalTime: 36000 })

      act(() => {
        updateAchievements(stats)
      })

      const achievement = useAchievementsStore.getState().achievements.find(
        a => a.id === 'time_10h'
      )
      expect(achievement?.unlocked).toBe(true)
      expect(achievement?.unlockedAt).toBeInstanceOf(Date)
    })

    it('should not modify already unlocked achievements', () => {
      const { updateAchievements, unlockAchievement, getAchievementById } = useAchievementsStore.getState()
      const achievementId = 'time_10h'

      act(() => {
        unlockAchievement(achievementId)
      })

      const unlockedAt = useAchievementsStore.getState().getAchievementById(achievementId)?.unlockedAt

      act(() => {
        updateAchievements(createMockStats({ totalTime: 100 }))
      })

      const achievement = useAchievementsStore.getState().getAchievementById(achievementId)
      expect(achievement?.unlockedAt).toEqual(unlockedAt)
    })

    it('should update session-based achievements', () => {
      const { updateAchievements } = useAchievementsStore.getState()
      const stats = createMockStats({ completedSessions: 50 })

      act(() => {
        updateAchievements(stats)
      })

      const sessionAchievement = useAchievementsStore.getState().achievements.find(
        a => a.id === 'sessions_50'
      )
      expect(sessionAchievement?.unlocked).toBe(true)
    })

    it('should handle empty stats gracefully', () => {
      const { updateAchievements } = useAchievementsStore.getState()

      expect(() => {
        act(() => {
          updateAchievements(createMockStats())
        })
      }).not.toThrow()
    })
  })

  describe('getUnlockedAchievements', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should return empty array when no achievements unlocked', () => {
      const unlocked = useAchievementsStore.getState().getUnlockedAchievements()
      expect(unlocked).toEqual([])
    })

    it('should return only unlocked achievements', () => {
      const { unlockAchievement, getUnlockedAchievements, achievements } = useAchievementsStore.getState()
      
      act(() => {
        unlockAchievement(achievements[0].id)
        unlockAchievement(achievements[1].id)
      })

      const unlocked = useAchievementsStore.getState().getUnlockedAchievements()
      expect(unlocked.length).toBe(2)
      unlocked.forEach(a => expect(a.unlocked).toBe(true))
    })
  })

  describe('getLockedAchievements', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should return all achievements when none unlocked', () => {
      const locked = useAchievementsStore.getState().getLockedAchievements()
      expect(locked.length).toBe(ACHIEVEMENT_DEFINITIONS.length)
    })

    it('should return only locked achievements', () => {
      const { unlockAchievement, achievements } = useAchievementsStore.getState()
      
      act(() => {
        unlockAchievement(achievements[0].id)
      })

      const locked = useAchievementsStore.getState().getLockedAchievements()
      expect(locked.length).toBe(ACHIEVEMENT_DEFINITIONS.length - 1)
      locked.forEach(a => expect(a.unlocked).toBe(false))
    })
  })

  describe('getAchievementById', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should return achievement when found', () => {
      const { getAchievementById, achievements } = useAchievementsStore.getState()
      const targetId = achievements[0].id
      
      const achievement = getAchievementById(targetId)
      expect(achievement).toBeDefined()
      expect(achievement?.id).toBe(targetId)
    })

    it('should return undefined for non-existent ID', () => {
      const { getAchievementById } = useAchievementsStore.getState()
      
      const achievement = getAchievementById('non-existent-id')
      expect(achievement).toBeUndefined()
    })
  })

  describe('getAchievementsByCategory', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should return achievements filtered by category', () => {
      const { getAchievementsByCategory } = useAchievementsStore.getState()
      
      const timeAchievements = getAchievementsByCategory('time')
      timeAchievements.forEach(a => expect(a.category).toBe('time'))
    })

    it('should return empty array for non-existent category', () => {
      const { getAchievementsByCategory } = useAchievementsStore.getState()
      
      const achievements = getAchievementsByCategory('non-existent')
      expect(achievements).toEqual([])
    })

    it('should return different results for different categories', () => {
      const { getAchievementsByCategory } = useAchievementsStore.getState()
      
      const timeAchievements = getAchievementsByCategory('time')
      const sessionAchievements = getAchievementsByCategory('sessions')
      
      expect(timeAchievements).not.toEqual(sessionAchievements)
    })
  })

  describe('getAchievementsByRarity', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should return achievements filtered by rarity', () => {
      const { getAchievementsByRarity } = useAchievementsStore.getState()
      
      const commonAchievements = getAchievementsByRarity('common')
      commonAchievements.forEach(a => expect(a.rarity).toBe('common'))
    })

    it('should return empty array for non-existent rarity', () => {
      const { getAchievementsByRarity } = useAchievementsStore.getState()
      
      const achievements = getAchievementsByRarity('mythical')
      expect(achievements).toEqual([])
    })

    it('should include all rarity types from definitions', () => {
      const { getAchievementsByRarity } = useAchievementsStore.getState()
      
      const rarities = ['common', 'rare', 'epic', 'legendary']
      rarities.forEach(rarity => {
        const defCount = ACHIEVEMENT_DEFINITIONS.filter(d => d.rarity === rarity).length
        const storeCount = getAchievementsByRarity(rarity).length
        expect(storeCount).toBe(defCount)
      })
    })
  })

  describe('resetAchievements', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementsStore.getState()
      act(() => {
        initializeAchievements()
      })
    })

    it('should reset all achievements to locked state', () => {
      const { unlockAchievement, resetAchievements, achievements } = useAchievementsStore.getState()
      
      act(() => {
        unlockAchievement(achievements[0].id)
        unlockAchievement(achievements[1].id)
      })

      act(() => {
        resetAchievements()
      })

      const { achievements: resetAchievementsList } = useAchievementsStore.getState()
      resetAchievementsList.forEach(a => {
        expect(a.unlocked).toBe(false)
        expect(a.progress).toBe(0)
        expect(a.unlockedAt).toBeUndefined()
      })
    })

    it('should preserve achievement metadata after reset', () => {
      const { resetAchievements, achievements } = useAchievementsStore.getState()
      const firstId = achievements[0].id
      const firstName = achievements[0].name

      act(() => {
        resetAchievements()
      })

      const { achievements: resetAchievementsList } = useAchievementsStore.getState()
      const firstAchievement = resetAchievementsList.find(a => a.id === firstId)
      expect(firstAchievement?.name).toBe(firstName)
    })

    it('should keep the same number of achievements after reset', () => {
      const initialCount = useAchievementsStore.getState().achievements.length

      act(() => {
        useAchievementsStore.getState().resetAchievements()
      })

      expect(useAchievementsStore.getState().achievements.length).toBe(initialCount)
    })
  })

  describe('Persistence', () => {
    it('should persist achievements to localStorage', () => {
      const { initializeAchievements, unlockAchievement } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const achievementId = useAchievementsStore.getState().achievements[0]?.id

      act(() => {
        if (achievementId) {
          unlockAchievement(achievementId)
        }
      })

      const stored = localStorage.getItem('timer-sidebar-achievements')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.achievements).toBeDefined()
    })

    it('should use correct storage key', () => {
      const { initializeAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      const stored = localStorage.getItem('timer-sidebar-achievements')
      expect(stored).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid successive updates', () => {
      const { initializeAchievements, updateAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            updateAchievements(createMockStats({ totalTime: i * 1000 }))
          }
        })
      }).not.toThrow()
    })

    it('should handle very large stat values', () => {
      const { initializeAchievements, updateAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      expect(() => {
        act(() => {
          updateAchievements(createMockStats({ 
            totalTime: Number.MAX_SAFE_INTEGER,
            completedSessions: Number.MAX_SAFE_INTEGER 
          }))
        })
      }).not.toThrow()
    })

    it('should handle negative stat values gracefully', () => {
      const { initializeAchievements, updateAchievements } = useAchievementsStore.getState()
      
      act(() => {
        initializeAchievements()
      })

      expect(() => {
        act(() => {
          updateAchievements(createMockStats({ totalTime: -1000 }))
        })
      }).not.toThrow()
    })
  })
})
