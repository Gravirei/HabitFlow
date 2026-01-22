/**
 * Achievement Tracking Utilities
 * Helper functions for tracking and calculating achievement progress
 */

import { differenceInDays, startOfDay } from 'date-fns'
import type { Achievement, AchievementStats, UserStats } from './types'

/**
 * Calculate user statistics from timer sessions
 */
export function calculateUserStats(sessions: any[]): UserStats {
  let totalTime = 0
  let totalSessions = sessions.length
  let completedSessions = 0
  let stopwatchSessions = 0
  let countdownSessions = 0
  let intervalsSessions = 0
  let stopwatchTime = 0
  let countdownTime = 0
  let intervalsTime = 0
  
  const uniqueDays = new Set<string>()
  let firstSessionDate: Date | undefined
  let lastSessionDate: Date | undefined

  sessions.forEach((session) => {
    const duration = session.duration || 0
    totalTime += duration

    if (session.completed) {
      completedSessions++
    }

    // Track by mode
    if (session.mode === 'Stopwatch') {
      stopwatchSessions++
      stopwatchTime += duration
    } else if (session.mode === 'Countdown') {
      countdownSessions++
      countdownTime += duration
    } else if (session.mode === 'Intervals') {
      intervalsSessions++
      intervalsTime += duration
    }

    // Track dates
    const sessionDate = new Date(session.startTime)
    if (!firstSessionDate || sessionDate < firstSessionDate) {
      firstSessionDate = sessionDate
    }
    if (!lastSessionDate || sessionDate > lastSessionDate) {
      lastSessionDate = sessionDate
    }

    // Track unique days
    const dayKey = startOfDay(sessionDate).toISOString()
    uniqueDays.add(dayKey)
  })

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(sessions)

  return {
    totalTime,
    totalSessions,
    completedSessions,
    currentStreak,
    longestStreak,
    stopwatchSessions,
    countdownSessions,
    intervalsSessions,
    stopwatchTime,
    countdownTime,
    intervalsTime,
    firstSessionDate,
    lastSessionDate,
    daysActive: uniqueDays.size,
  }
}

/**
 * Calculate current and longest streaks
 */
function calculateStreaks(sessions: any[]): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Group sessions by day
  const sessionsByDay = new Map<string, any[]>()
  sessions.forEach((session) => {
    const dayKey = startOfDay(new Date(session.startTime)).toISOString()
    if (!sessionsByDay.has(dayKey)) {
      sessionsByDay.set(dayKey, [])
    }
    sessionsByDay.get(dayKey)!.push(session)
  })

  // Sort days descending
  const sortedDays = Array.from(sessionsByDay.keys())
    .map((key) => new Date(key))
    .sort((a, b) => b.getTime() - a.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let expectedDate = startOfDay(new Date())

  // Calculate current streak
  for (const day of sortedDays) {
    const daysDiff = differenceInDays(expectedDate, day)

    if (daysDiff === 0 || daysDiff === 1) {
      currentStreak++
      tempStreak++
      expectedDate = day
      longestStreak = Math.max(longestStreak, tempStreak)
    } else if (currentStreak > 0) {
      // Current streak broken
      break
    }
  }

  // Calculate longest streak (scan all days)
  tempStreak = 1
  for (let i = 1; i < sortedDays.length; i++) {
    const daysDiff = differenceInDays(sortedDays[i - 1], sortedDays[i])

    if (daysDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { currentStreak, longestStreak }
}

/**
 * Get achievement statistics
 */
export function getAchievementStats(achievements: Achievement[]): AchievementStats {
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  
  const commonUnlocked = achievements.filter((a) => a.unlocked && a.rarity === 'common').length
  const rareUnlocked = achievements.filter((a) => a.unlocked && a.rarity === 'rare').length
  const epicUnlocked = achievements.filter((a) => a.unlocked && a.rarity === 'epic').length
  const legendaryUnlocked = achievements.filter((a) => a.unlocked && a.rarity === 'legendary').length
  
  const completionRate = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0

  // Get next achievements to unlock (sorted by progress)
  const nextToUnlock = achievements
    .filter((a) => !a.unlocked)
    .sort((a, b) => {
      const progressA = a.progress / a.requirement
      const progressB = b.progress / b.requirement
      return progressB - progressA
    })
    .slice(0, 3)

  return {
    totalAchievements,
    unlockedAchievements,
    commonUnlocked,
    rareUnlocked,
    epicUnlocked,
    legendaryUnlocked,
    completionRate,
    nextToUnlock,
  }
}

/**
 * Get rarity color classes
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'from-slate-500 to-slate-600'
    case 'rare':
      return 'from-blue-500 to-blue-600'
    case 'epic':
      return 'from-purple-500 to-purple-600'
    case 'legendary':
      return 'from-orange-500 to-red-600'
    default:
      return 'from-slate-500 to-slate-600'
  }
}

/**
 * Get rarity glow color
 */
export function getRarityGlow(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'shadow-slate-500/50'
    case 'rare':
      return 'shadow-blue-500/50'
    case 'epic':
      return 'shadow-purple-500/50'
    case 'legendary':
      return 'shadow-orange-500/50'
    default:
      return 'shadow-slate-500/50'
  }
}

/**
 * Get category color
 */
export function getCategoryColor(category: Achievement['category']): string {
  switch (category) {
    case 'time':
      return 'bg-blue-500'
    case 'sessions':
      return 'bg-green-500'
    case 'streak':
      return 'bg-orange-500'
    case 'mode':
      return 'bg-purple-500'
    case 'special':
      return 'bg-pink-500'
    default:
      return 'bg-slate-500'
  }
}

/**
 * Format achievement progress
 */
export function formatAchievementProgress(achievement: Achievement): string {
  const { progress, requirement, category } = achievement

  if (category === 'time') {
    const hoursProgress = Math.floor(progress / 3600)
    const hoursRequired = Math.floor(requirement / 3600)
    return `${hoursProgress}/${hoursRequired} hours`
  }

  return `${progress}/${requirement}`
}

/**
 * Check for newly unlocked achievements
 */
export function checkNewlyUnlocked(
  previousAchievements: Achievement[],
  currentAchievements: Achievement[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = []

  currentAchievements.forEach((current) => {
    const previous = previousAchievements.find((p) => p.id === current.id)
    if (previous && !previous.unlocked && current.unlocked) {
      newlyUnlocked.push(current)
    }
  })

  return newlyUnlocked
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'Common'
    case 'rare':
      return 'Rare'
    case 'epic':
      return 'Epic'
    case 'legendary':
      return 'Legendary'
    default:
      return 'Unknown'
  }
}

/**
 * Get category label
 */
export function getCategoryLabel(category: Achievement['category']): string {
  switch (category) {
    case 'time':
      return 'Time'
    case 'sessions':
      return 'Sessions'
    case 'streak':
      return 'Streak'
    case 'mode':
      return 'Mode Mastery'
    case 'special':
      return 'Special'
    default:
      return 'Unknown'
  }
}
