import { differenceInCalendarDays } from 'date-fns'
import type { Habit } from '@/types/habit'
import { calculateCurrentStreak, calculateBestStreak } from '@/utils/streakUtils'

/* ─── Date helpers ──────────────────────────────────────────────────────────── */

/** Return an ISO date string (YYYY-MM-DD) for a given Date */
export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/* ─── Completion Rate ───────────────────────────────────────────────────────── */

/**
 * Calculate the completion rate (0–100) for a habit based on its frequency,
 * start date, and completed dates.
 *
 * - **Daily**: completions / total days since start
 * - **Weekly**: completions / (weeks since start × timesPerWeek)
 * - **Monthly**: completions / (months since start × goal)
 *
 * Caps at 100% and returns 0 if the habit hasn't started yet.
 */
export function calculateCompletionRate(
  frequency: Habit['frequency'],
  startDate: string,
  completedDatesCount: number,
  goal: number,
  weeklyTimesPerWeek?: number,
  today: Date = new Date(),
): number {
  if (completedDatesCount === 0) return 0

  const start = new Date(`${startDate}T00:00:00`)
  const daysSinceStart = differenceInCalendarDays(today, start) + 1 // inclusive of start day

  if (daysSinceStart <= 0) return 0

  let expectedCompletions: number

  switch (frequency) {
    case 'daily':
      expectedCompletions = daysSinceStart
      break
    case 'weekly': {
      const weeksSinceStart = Math.max(1, Math.ceil(daysSinceStart / 7))
      const timesPerWeek = weeklyTimesPerWeek ?? goal ?? 1
      expectedCompletions = weeksSinceStart * timesPerWeek
      break
    }
    case 'monthly': {
      const monthsSinceStart = Math.max(1, Math.ceil(daysSinceStart / 30))
      expectedCompletions = monthsSinceStart * (goal || 1)
      break
    }
    default:
      expectedCompletions = daysSinceStart
  }

  if (expectedCompletions <= 0) return 0

  return Math.min(100, Math.round((completedDatesCount / expectedCompletions) * 100))
}

/** Get start of the current week (Monday) */
export function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = start
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

/* ─── Calendar Heatmap ──────────────────────────────────────────────────────── */

export interface HeatmapCell {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

/**
 * Build a heatmap grid for the last N weeks.
 * Each cell has a date and intensity level (0-4) based on habit completions.
 */
export function buildHeatmapData(habits: Habit[], weeks: number = 12): HeatmapCell[] {
  // Count completions per date across all habits
  const counts = new Map<string, number>()
  habits.forEach((h) => {
    h.completedDates.forEach((d) => {
      counts.set(d, (counts.get(d) ?? 0) + 1)
    })
  })

  const totalHabits = habits.filter((h) => !h.archived).length || 1
  const today = new Date()
  const cells: HeatmapCell[] = []

  // Start from N weeks ago (Monday)
  const start = getWeekStart(today)
  start.setDate(start.getDate() - (weeks - 1) * 7)

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    if (d > today) break

    const key = toDateKey(d)
    const count = counts.get(key) ?? 0
    const ratio = count / totalHabits

    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (ratio > 0.75) level = 4
    else if (ratio > 0.5) level = 3
    else if (ratio > 0.25) level = 2
    else if (ratio > 0) level = 1

    cells.push({ date: key, count, level })
  }

  return cells
}

/* ─── Sparkline Data ────────────────────────────────────────────────────────── */

/**
 * Return an array of 7 booleans for the last 7 days completion of a habit.
 */
export function getSparklineData(habit: Habit, days: number = 7): boolean[] {
  const today = new Date()
  const result: boolean[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    result.push(habit.completedDates.includes(key))
  }

  return result
}

/* ─── Day-of-Week Patterns ──────────────────────────────────────────────────── */

export interface DayPattern {
  day: string
  shortDay: string
  completions: number
  percentage: number
}

/**
 * Aggregate completions by day of the week across all habits.
 */
export function getDayOfWeekPatterns(habits: Habit[]): DayPattern[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = new Array(7).fill(0)

  habits.forEach((h) => {
    h.completedDates.forEach((dateStr) => {
      const d = new Date(dateStr + 'T00:00:00')
      if (!isNaN(d.getTime())) {
        counts[d.getDay()]++
      }
    })
  })

  const maxCount = Math.max(...counts, 1)

  return dayNames.map((name, i) => ({
    day: name,
    shortDay: shortNames[i],
    completions: counts[i],
    percentage: Math.round((counts[i] / maxCount) * 100),
  }))
}

/* ─── Habit Strength Score ──────────────────────────────────────────────────── */

export interface HabitStrength {
  overall: number
  recency: number
  frequency: number
  streak: number
}

/**
 * Calculate a strength score (0-100) for a habit based on:
 * - Recency (40%): How recently they completed the habit
 * - Frequency (35%): Completion rate (dynamically computed)
 * - Streak (25%): Current streak relative to best (dynamically computed)
 *
 * All values are computed fresh from `completedDates` so they are always
 * accurate — even for habits whose stored fields haven't been updated yet.
 */
export function calculateHabitStrength(habit: Habit): HabitStrength {
  const today = new Date()

  // Recency score (0-100): based on days since last completion
  let recency = 0
  if (habit.completedDates.length > 0) {
    const sorted = [...habit.completedDates].sort().reverse()
    const lastDate = new Date(sorted[0] + 'T00:00:00')
    const daysSince = differenceInCalendarDays(today, lastDate)
    if (daysSince === 0) recency = 100
    else if (daysSince === 1) recency = 90
    else if (daysSince <= 3) recency = 70
    else if (daysSince <= 7) recency = 40
    else recency = Math.max(0, 20 - daysSince)
  }

  // Frequency score (0-100): dynamically computed completion rate
  const frequency = calculateCompletionRate(
    habit.frequency,
    habit.startDate,
    habit.completedDates.length,
    habit.goal,
    habit.weeklyTimesPerWeek,
    today,
  )

  // Streak score (0-100): dynamically computed current/best ratio
  const currentStreak = calculateCurrentStreak(habit.completedDates, today)
  const bestStreak = calculateBestStreak(habit.completedDates)
  const streak =
    bestStreak > 0
      ? Math.round((currentStreak / bestStreak) * 100)
      : currentStreak > 0
        ? 50
        : 0

  const overall = Math.round(recency * 0.4 + frequency * 0.35 + streak * 0.25)

  return { overall, recency, frequency, streak: Math.min(100, streak) }
}

/* ─── Milestones ────────────────────────────────────────────────────────────── */

export interface Milestone {
  habitName: string
  habitIcon: string
  currentStreak: number
  nextMilestone: number
  progress: number // 0-100
  daysRemaining: number
}

const MILESTONE_THRESHOLDS = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365]

/**
 * Find the next upcoming milestone for each habit with an active streak.
 * Computes current streak dynamically from completedDates.
 */
export function getUpcomingMilestones(habits: Habit[], limit: number = 3): Milestone[] {
  const milestones: Milestone[] = []

  habits
    .filter((h) => !h.archived)
    .forEach((h) => {
      const streak = calculateCurrentStreak(h.completedDates)
      if (streak <= 0) return

      const next = MILESTONE_THRESHOLDS.find((t) => t > streak)
      if (next) {
        const prevThreshold = MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.indexOf(next) - 1] ?? 0
        const range = next - prevThreshold
        const done = streak - prevThreshold
        milestones.push({
          habitName: h.name,
          habitIcon: h.icon || 'check_circle',
          currentStreak: streak,
          nextMilestone: next,
          progress: Math.round((done / range) * 100),
          daysRemaining: next - streak,
        })
      }
    })

  // Sort by closest to unlocking (highest progress first)
  return milestones.sort((a, b) => b.progress - a.progress).slice(0, limit)
}

/* ─── Target vs Actual ──────────────────────────────────────────────────────── */

export interface TargetVsActual {
  habitName: string
  habitIcon: string
  habitIconColor: number
  frequency: string
  target: string
  actual: number
  status: 'on-track' | 'behind' | 'ahead'
}

/**
 * Compare each habit's goal frequency to actual completion rate.
 * Computes completion rate dynamically from completedDates.
 */
export function getTargetVsActual(habits: Habit[]): TargetVsActual[] {
  return habits
    .filter((h) => !h.archived)
    .map((h) => {
      let target: string
      if (h.frequency === 'daily') target = '7x / week'
      else if (h.frequency === 'weekly') target = `${h.weeklyTimesPerWeek ?? h.goal}x / week`
      else target = `${h.goal}x / month`

      const actual = calculateCompletionRate(
        h.frequency,
        h.startDate,
        h.completedDates.length,
        h.goal,
        h.weeklyTimesPerWeek,
      )

      let status: 'on-track' | 'behind' | 'ahead' = 'on-track'
      if (actual >= 90) status = 'ahead'
      else if (actual < 50) status = 'behind'

      return {
        habitName: h.name,
        habitIcon: h.icon || 'check_circle',
        habitIconColor: h.iconColor ?? 0,
        frequency: h.frequency,
        target,
        actual,
        status,
      }
    })
    .sort((a, b) => b.actual - a.actual)
}

/* ─── Motivational Messages ─────────────────────────────────────────────────── */

export interface Motivation {
  title: string
  message: string
  icon: string
  gradient: string
}

/**
 * Generate a contextual motivational message based on user's performance.
 */
export function getMotivation(
  avgCompletion: number,
  longestStreak: number,
  totalHabits: number
): Motivation {
  if (totalHabits === 0) {
    return {
      title: 'Ready to Start?',
      message: 'Create your first habit and begin your journey toward better consistency.',
      icon: 'rocket_launch',
      gradient: 'from-blue-500 to-cyan-500',
    }
  }

  if (longestStreak >= 30) {
    return {
      title: 'Unstoppable!',
      message: `${longestStreak} days and counting. You've built a remarkable habit. Keep the momentum going!`,
      icon: 'military_tech',
      gradient: 'from-amber-500 to-orange-500',
    }
  }

  if (avgCompletion >= 80) {
    return {
      title: 'Outstanding Progress!',
      message: "You're completing over 80% of your habits. You're building real consistency!",
      icon: 'stars',
      gradient: 'from-green-500 to-emerald-500',
    }
  }

  if (avgCompletion >= 50) {
    return {
      title: 'Building Momentum',
      message: "You're halfway there. Small improvements each day add up to big changes.",
      icon: 'trending_up',
      gradient: 'from-blue-500 to-indigo-500',
    }
  }

  if (longestStreak >= 3) {
    return {
      title: 'Keep Going!',
      message: `You've got a ${longestStreak}-day streak. Don't break the chain — each day makes the next one easier.`,
      icon: 'local_fire_department',
      gradient: 'from-orange-500 to-red-500',
    }
  }

  return {
    title: 'Every Day Counts',
    message: 'Start small, stay consistent. Focus on completing just one habit today.',
    icon: 'wb_sunny',
    gradient: 'from-violet-500 to-purple-500',
  }
}
