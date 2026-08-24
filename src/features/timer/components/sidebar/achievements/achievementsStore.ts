/**
 * Achievements Store
 * State management for achievement tracking system using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Achievement, UserStats } from './types'
import { ACHIEVEMENT_DEFINITIONS } from './achievementDefinitions'

interface AchievementsState {
  achievements: Achievement[]
  initializeAchievements: () => void
  updateAchievements: (stats: UserStats) => void
  unlockAchievement: (achievementId: string) => void
  getUnlockedAchievements: () => Achievement[]
  getLockedAchievements: () => Achievement[]
  getAchievementById: (id: string) => Achievement | undefined
  getAchievementsByCategory: (category: string) => Achievement[]
  getAchievementsByRarity: (rarity: string) => Achievement[]
  resetAchievements: () => void
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: [],

      /**
       * Initialize achievements from definitions
       */
      initializeAchievements: () => {
        const currentAchievements = get().achievements
        
        // If achievements already exist, don't reinitialize
        if (currentAchievements.length > 0) return

        const initialAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => ({
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity,
          category: def.category,
          requirement: def.requirement,
          unlocked: false,
          progress: 0,
          mode: def.mode,
        }))

        set({ achievements: initialAchievements })
      },

      /**
       * Update achievement progress based on user stats
       */
      updateAchievements: (stats: UserStats) => {
        const achievements = get().achievements
        const updatedAchievements = achievements.map((achievement) => {
          // Skip if already unlocked
          if (achievement.unlocked) return achievement

          // Get the definition to check progress
          const definition = ACHIEVEMENT_DEFINITIONS.find((def) => def.id === achievement.id)
          if (!definition) return achievement

          // Calculate current progress
          const progress = definition.checkProgress(stats)
          const isUnlocked = progress >= achievement.requirement

          return {
            ...achievement,
            progress,
            unlocked: isUnlocked,
            unlockedAt: isUnlocked && !achievement.unlocked ? new Date() : achievement.unlockedAt,
          }
        })

        set({ achievements: updatedAchievements })
      },

      /**
       * Manually unlock an achievement (for special achievements)
       */
      unlockAchievement: (achievementId: string) => {
        const achievements = get().achievements
        const updatedAchievements = achievements.map((achievement) => {
          if (achievement.id === achievementId && !achievement.unlocked) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date(),
              progress: achievement.requirement,
            }
          }
          return achievement
        })

        set({ achievements: updatedAchievements })
      },

      /**
       * Get all unlocked achievements
       */
      getUnlockedAchievements: () => {
        return get().achievements.filter((a) => a.unlocked)
      },

      /**
       * Get all locked achievements
       */
      getLockedAchievements: () => {
        return get().achievements.filter((a) => !a.unlocked)
      },

      /**
       * Get achievement by ID
       */
      getAchievementById: (id: string) => {
        return get().achievements.find((a) => a.id === id)
      },

      /**
       * Get achievements by category
       */
      getAchievementsByCategory: (category: string) => {
        return get().achievements.filter((a) => a.category === category)
      },

      /**
       * Get achievements by rarity
       */
      getAchievementsByRarity: (rarity: string) => {
        return get().achievements.filter((a) => a.rarity === rarity)
      },

      /**
       * Reset all achievements (for testing)
       */
      resetAchievements: () => {
        const resetAchievements = get().achievements.map((achievement) => ({
          ...achievement,
          unlocked: false,
          unlockedAt: undefined,
          progress: 0,
        }))

        set({ achievements: resetAchievements })
      },
    }),
    {
      name: 'timer-sidebar-achievements',
      version: 1,
    }
  )
)
