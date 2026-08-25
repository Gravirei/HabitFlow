/**
 * Goal Tracking Types
 * Data structures for goal management system
 */

export type GoalType = 'time' | 'sessions' | 'streak' | 'mode-specific'
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused'
export type TimerMode = 'Stopwatch' | 'Countdown' | 'Intervals'

export interface Goal {
  id: string
  type: GoalType
  target: number
  current: number
  period: GoalPeriod
  mode?: TimerMode // For mode-specific goals
  name: string
  description?: string
  startDate: Date
  endDate: Date
  status: GoalStatus
  createdAt: Date
  completedAt?: Date
  streak?: number
}

export interface GoalProgress {
  percentage: number
  remaining: number
  timeLeft?: string
  onTrack: boolean
}

export interface GoalStats {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  completionRate: number
  currentStreak: number
  longestStreak: number
}
