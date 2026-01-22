/**
 * useAchievementSync Hook
 * Syncs achievements with timer history data in real-time
 */

import { useEffect, useCallback, useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAchievementsStore } from './achievementsStore'
import { calculateUserStats } from './achievementTracking'
import type { TimerHistoryRecord } from '../../types/timer.types'
import type { Achievement } from './types'

const STORAGE_KEYS = {
  stopwatch: 'timer-stopwatch-history',
  countdown: 'timer-countdown-history',
  intervals: 'timer-intervals-history',
}

/**
 * Hook to automatically sync achievements with timer history
 * Checks for newly unlocked achievements and returns them for notification
 */
export function useAchievementSync() {
  const [rawStopwatchHistory] = useLocalStorage<TimerHistoryRecord[]>(STORAGE_KEYS.stopwatch, [])
  const [rawCountdownHistory] = useLocalStorage<TimerHistoryRecord[]>(STORAGE_KEYS.countdown, [])
  const [rawIntervalsHistory] = useLocalStorage<TimerHistoryRecord[]>(STORAGE_KEYS.intervals, [])
  
  const { achievements, updateAchievements, initializeAchievements, unlockAchievement } = useAchievementsStore()
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])

  const normalizeHistory = useCallback((history: TimerHistoryRecord[] | unknown): TimerHistoryRecord[] => {
    return Array.isArray(history) ? history : []
  }, [])

  // Ensure history values are always arrays to prevent "not iterable" errors
  const stopwatchHistory = normalizeHistory(rawStopwatchHistory)
  const countdownHistory = normalizeHistory(rawCountdownHistory)
  const intervalsHistory = normalizeHistory(rawIntervalsHistory)

  const normalizeDurationSeconds = useCallback((duration: number) => {
    if (!Number.isFinite(duration)) return 0
    return duration > 86400 ? duration / 1000 : duration
  }, [])

  /**
   * Convert timer history records to session format for stats calculation
   */
  const convertToSessions = useCallback((records: TimerHistoryRecord[]) => {
    return records.map(record => {
      const durationSeconds = normalizeDurationSeconds(record.duration)
      return {
        id: record.id,
        mode: record.mode,
        duration: Math.floor(durationSeconds),
        startTime: new Date(record.timestamp),
        endTime: new Date(record.timestamp + durationSeconds * 1000),
        completed: true,
      }
    })
  }, [normalizeDurationSeconds])

  /**
   * Check for special achievements that need custom logic
   */
  const checkSpecialAchievements = useCallback((allRecords: TimerHistoryRecord[]) => {
    if (allRecords.length === 0) return

    // Early Bird - Session before 6 AM
    const hasEarlyBird = allRecords.some(record => {
      const hour = new Date(record.timestamp).getHours()
      return hour >= 0 && hour < 6
    })
    if (hasEarlyBird) {
      unlockAchievement('special_early_bird')
    }

    // Night Owl - Session after midnight (but before 5 AM)
    const hasNightOwl = allRecords.some(record => {
      const hour = new Date(record.timestamp).getHours()
      return hour >= 0 && hour < 5
    })
    if (hasNightOwl) {
      unlockAchievement('special_night_owl')
    }

    // Marathon Runner - Single session over 4 hours
    const hasMarathon = allRecords.some(record => {
      const hours = record.duration / (1000 * 60 * 60)
      return hours >= 4
    })
    if (hasMarathon) {
      unlockAchievement('special_marathon')
    }

    // Weekend Warrior - Sessions on both Saturday and Sunday
    const hasSaturday = allRecords.some(record => {
      return new Date(record.timestamp).getDay() === 6
    })
    const hasSunday = allRecords.some(record => {
      return new Date(record.timestamp).getDay() === 0
    })
    if (hasSaturday && hasSunday) {
      unlockAchievement('special_weekend_warrior')
    }

    // Sunrise Seeker - Session between 5 AM and 7 AM
    const hasSunrise = allRecords.some(record => {
      const hour = new Date(record.timestamp).getHours()
      return hour >= 5 && hour < 7
    })
    if (hasSunrise) {
      unlockAchievement('special_sunrise_session')
    }

    // Golden Hour - Session during sunset (6 PM - 8 PM)
    const hasGoldenHour = allRecords.some(record => {
      const hour = new Date(record.timestamp).getHours()
      return hour >= 18 && hour < 20
    })
    if (hasGoldenHour) {
      unlockAchievement('special_golden_hour')
    }

    // Lunch Break Champion - Session during lunch (12 PM - 2 PM)
    const hasLunchBreak = allRecords.some(record => {
      const hour = new Date(record.timestamp).getHours()
      return hour >= 12 && hour < 14
    })
    if (hasLunchBreak) {
      unlockAchievement('special_lunch_break')
    }

    // Speed Demon - 5 sessions in a single day
    const sessionsByDay = new Map<string, number>()
    allRecords.forEach(record => {
      const date = new Date(record.timestamp).toDateString()
      sessionsByDay.set(date, (sessionsByDay.get(date) || 0) + 1)
    })
    const hasSpeedDemon = Array.from(sessionsByDay.values()).some(count => count >= 5)
    if (hasSpeedDemon) {
      unlockAchievement('special_speed_demon')
    }

    // Power Hour - Exactly 1 hour session (within 2 minute tolerance)
    const hasPowerHour = allRecords.some(record => {
      const minutes = record.duration / (1000 * 60)
      return minutes >= 58 && minutes <= 62
    })
    if (hasPowerHour) {
      unlockAchievement('special_power_hour')
    }

    // Double Century - 2 hour session
    const hasDoubleCentury = allRecords.some(record => {
      const hours = record.duration / (1000 * 60 * 60)
      return hours >= 2
    })
    if (hasDoubleCentury) {
      unlockAchievement('special_double_century')
    }

    // Minimalist - 10 short sessions under 5 minutes
    const shortSessions = allRecords.filter(record => {
      const minutes = record.duration / (1000 * 60)
      return minutes < 5
    })
    if (shortSessions.length >= 10) {
      unlockAchievement('special_minimalist')
    }

    // Perfectionist - 25 sessions without missing a day
    const sortedRecords = [...allRecords].sort((a, b) => a.timestamp - b.timestamp)
    let consecutiveDays = 1
    let maxConsecutiveDays = 1
    for (let i = 1; i < sortedRecords.length; i++) {
      const prevDate = new Date(sortedRecords[i - 1].timestamp).toDateString()
      const currDate = new Date(sortedRecords[i].timestamp).toDateString()
      if (prevDate !== currDate) {
        const dayDiff = Math.floor(
          (new Date(currDate).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (dayDiff === 1) {
          consecutiveDays++
          maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays)
        } else {
          consecutiveDays = 1
        }
      }
    }
    if (allRecords.length >= 25 && maxConsecutiveDays >= 25) {
      unlockAchievement('special_perfectionist')
    }

    // Multitasker - All 3 timer modes in one day
    const modesByDay = new Map<string, Set<string>>()
    allRecords.forEach(record => {
      const date = new Date(record.timestamp).toDateString()
      if (!modesByDay.has(date)) {
        modesByDay.set(date, new Set())
      }
      modesByDay.get(date)!.add(record.mode)
    })
    const hasMultitasker = Array.from(modesByDay.values()).some(modes => modes.size === 3)
    if (hasMultitasker) {
      unlockAchievement('special_multitasker')
    }

    // Century Day - 100 minutes in a single day
    const minutesByDay = new Map<string, number>()
    allRecords.forEach(record => {
      const date = new Date(record.timestamp).toDateString()
      // Duration is in SECONDS, convert to minutes
      const minutes = normalizeDurationSeconds(record.duration) / 60
      minutesByDay.set(date, (minutesByDay.get(date) || 0) + minutes)
    })
    const hasCenturyDay = Array.from(minutesByDay.values()).some(mins => mins >= 100)
    if (hasCenturyDay) {
      unlockAchievement('special_century_day')
    }

    // First Week Hero - Timer every day for first week
    if (allRecords.length >= 7) {
      const firstWeek = sortedRecords.slice(0, 7)
      const uniqueDays = new Set(firstWeek.map(r => new Date(r.timestamp).toDateString()))
      if (uniqueDays.size === 7) {
        unlockAchievement('special_first_week')
      }
    }

    // Comeback Kid - Return after 30 days of inactivity
    for (let i = 1; i < sortedRecords.length; i++) {
      const gap = (sortedRecords[i].timestamp - sortedRecords[i - 1].timestamp) / (1000 * 60 * 60 * 24)
      if (gap >= 30) {
        unlockAchievement('special_comeback_kid')
        break
      }
    }

    // Pomodoro Master - 10 sessions of exactly 25 minutes (within 1 minute tolerance)
    const pomodoroSessions = allRecords.filter(record => {
      const minutes = normalizeDurationSeconds(record.duration) / 60
      return minutes >= 24 && minutes <= 26
    })
    if (pomodoroSessions.length >= 10) {
      unlockAchievement('special_pomodoro_master')
    }
  }, [normalizeDurationSeconds, unlockAchievement])

  /**
   * Sync achievements with current timer history
   */
  const syncAchievements = useCallback(() => {
    // Get current achievements directly from store to avoid stale closure
    const currentAchievements = useAchievementsStore.getState().achievements
    
    // Initialize achievements if not already done
    if (currentAchievements.length === 0) {
      initializeAchievements()
      return
    }

    // Combine all history records (already normalized)
    const allRecords = [
      ...stopwatchHistory,
      ...countdownHistory,
      ...intervalsHistory,
    ]

    if (allRecords.length === 0) return

    // Convert to session format
    const allSessions = convertToSessions(allRecords)

    // Calculate user statistics
    const stats = calculateUserStats(allSessions)

    // Store previous achievement states
    const previousAchievements = [...currentAchievements]

    // Update achievements based on stats
    updateAchievements(stats)

    // Check for special achievements
    checkSpecialAchievements(allRecords)

    // After updating, check for newly unlocked achievements
    const updatedAchievements = useAchievementsStore.getState().achievements
    const newUnlocks = updatedAchievements.filter((current) => {
      const previous = previousAchievements.find((p) => p.id === current.id)
      return previous && !previous.unlocked && current.unlocked
    })

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks)
    }
  }, [
    stopwatchHistory,
    countdownHistory,
    intervalsHistory,
    initializeAchievements,
    updateAchievements,
    convertToSessions,
    checkSpecialAchievements,
  ])

  /**
   * Sync on mount and whenever history changes
   */
  useEffect(() => {
    syncAchievements()
  }, [stopwatchHistory, countdownHistory, intervalsHistory, syncAchievements])

  /**
   * Clear newly unlocked achievements
   */
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  /**
   * Manually trigger sync (useful for testing or after major changes)
   */
  const forceSyncAchievements = useCallback(() => {
    syncAchievements()
  }, [syncAchievements])

  return {
    newlyUnlocked,
    clearNewlyUnlocked,
    syncAchievements: forceSyncAchievements,
  }
}
