/**
 * Achievement System Types
 * Types and interfaces for the achievement tracking system
 */

export type AchievementCategory = 'time' | 'sessions' | 'streak' | 'mode' | 'special'
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type TimerMode = 'Stopwatch' | 'Countdown' | 'Intervals'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: AchievementCategory
  requirement: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  mode?: TimerMode // For mode-specific achievements
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: AchievementCategory
  requirement: number
  mode?: TimerMode
  checkProgress: (stats: UserStats) => number
}

export interface UserStats {
  totalTime: number // in seconds
  totalSessions: number
  completedSessions: number
  currentStreak: number
  longestStreak: number
  stopwatchSessions: number
  countdownSessions: number
  intervalsSessions: number
  stopwatchTime: number
  countdownTime: number
  intervalsTime: number
  firstSessionDate?: Date
  lastSessionDate?: Date
  daysActive: number
}

export interface AchievementProgress {
  achievementId: string
  current: number
  required: number
  percentage: number
  unlocked: boolean
}

export interface AchievementStats {
  totalAchievements: number
  unlockedAchievements: number
  commonUnlocked: number
  rareUnlocked: number
  epicUnlocked: number
  legendaryUnlocked: number
  completionRate: number
  nextToUnlock: Achievement[]
}
