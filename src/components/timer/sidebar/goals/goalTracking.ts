/**
 * Goal Tracking Utilities
 * Logic for calculating goal progress and tracking
 */

import { isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from 'date-fns'
import type { Goal, GoalProgress } from './types'

export interface TimerRecord {
  id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration: number
  timestamp: number
  completed?: boolean
}

/**
 * Calculate progress for a goal based on timer history
 */
export function calculateGoalProgress(goal: Goal, history: TimerRecord[]): number {
  const goalStart = startOfDay(new Date(goal.startDate))
  const goalEnd = endOfDay(new Date(goal.endDate))

  // Filter history within goal period
  const relevantHistory = history.filter((record) => {
    const recordDate = new Date(record.timestamp)
    return (
      isAfter(recordDate, goalStart) &&
      isBefore(recordDate, goalEnd) &&
      (goal.mode ? record.mode === goal.mode : true)
    )
  })

  switch (goal.type) {
    case 'time': {
      // Sum total duration in seconds
      return relevantHistory.reduce((sum, record) => sum + record.duration, 0)
    }

    case 'sessions': {
      // Count completed sessions
      return relevantHistory.filter(r => r.completed !== false).length
    }

    case 'streak': {
      // Calculate consecutive days with sessions
      return calculateStreak(relevantHistory)
    }

    case 'mode-specific': {
      // Count sessions for specific mode
      return relevantHistory.filter(r => r.mode === goal.mode).length
    }

    default:
      return 0
  }
}

/**
 * Calculate current streak from history
 */
function calculateStreak(history: TimerRecord[]): number {
  if (history.length === 0) return 0

  // Get unique days with activity
  const daysWithActivity = new Set(
    history.map(record => 
      startOfDay(new Date(record.timestamp)).getTime()
    )
  )

  const sortedDays = Array.from(daysWithActivity).sort((a, b) => b - a)
  
  let streak = 0
  let currentDay = startOfDay(new Date()).getTime()

  for (const day of sortedDays) {
    const daysDiff = differenceInDays(currentDay, day)
    
    if (daysDiff === 0 || daysDiff === 1) {
      streak++
      currentDay = day
    } else {
      break
    }
  }

  return streak
}

/**
 * Get goal progress details
 */
export function getGoalProgressDetails(goal: Goal): GoalProgress {
  const percentage = Math.min((goal.current / goal.target) * 100, 100)
  const remaining = Math.max(goal.target - goal.current, 0)
  
  // Calculate time left
  const now = new Date()
  const end = new Date(goal.endDate)
  const daysLeft = Math.max(differenceInDays(end, now), 0)
  
  let timeLeft = ''
  if (daysLeft === 0) {
    timeLeft = 'Today'
  } else if (daysLeft === 1) {
    timeLeft = '1 day left'
  } else {
    timeLeft = `${daysLeft} days left`
  }

  // Determine if on track
  const totalDays = differenceInDays(end, new Date(goal.startDate))
  const daysPassed = totalDays - daysLeft
  const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0
  const onTrack = percentage >= expectedProgress

  return {
    percentage,
    remaining,
    timeLeft,
    onTrack
  }
}

/**
 * Check if goal should be marked as failed
 */
export function isGoalFailed(goal: Goal): boolean {
  const now = new Date()
  const end = new Date(goal.endDate)
  
  return (
    goal.status === 'active' &&
    isAfter(now, end) &&
    goal.current < goal.target
  )
}

/**
 * Update all goals with current progress
 */
export function updateAllGoalsProgress(
  goals: Goal[],
  history: TimerRecord[],
  updateGoalProgress: (id: string, progress: number) => void
): void {
  goals.forEach((goal) => {
    if (goal.status === 'active') {
      const progress = calculateGoalProgress(goal, history)
      if (progress !== goal.current) {
        updateGoalProgress(goal.id, progress)
      }
    }
  })
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(progress: number): string {
  if (progress >= 100) return "🎉 Goal Achieved! Amazing work!"
  if (progress >= 90) return "🔥 Almost there! Keep pushing!"
  if (progress >= 75) return "💪 Great progress! You're doing awesome!"
  if (progress >= 50) return "⭐ Halfway there! Keep it up!"
  if (progress >= 25) return "🚀 Good start! Keep going!"
  return "💫 Let's do this! Start strong!"
}
