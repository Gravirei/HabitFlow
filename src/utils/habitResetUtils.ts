/**
 * Utility functions for frequency-aware habit task resets.
 * Used by "Start Fresh" and "Reset All" handlers to ensure
 * only tasks from the current period are reset.
 */

import { toLocalDateString } from '@/utils/dateUtils'

/**
 * Returns the Monday of the week for a given date string (YYYY-MM-DD).
 * Uses ISO week definition: Monday is the first day of the week.
 */
function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.getTime())
  monday.setDate(diff)
  return toLocalDateString(monday)
}

/**
 * Checks if two date strings (YYYY-MM-DD) fall in the same ISO week.
 */
function isSameWeek(dateStr1: string, dateStr2: string): boolean {
  return getMondayOfWeek(dateStr1) === getMondayOfWeek(dateStr2)
}

/**
 * Checks if two date strings (YYYY-MM-DD) fall in the same month.
 */
function isSameMonth(dateStr1: string, dateStr2: string): boolean {
  return dateStr1.substring(0, 7) === dateStr2.substring(0, 7)
}

/**
 * Determines whether a task should be reset during a "Start Fresh" or
 * "Reset All" action, based on the habit's frequency.
 *
 * Only resets tasks completed within the CURRENT period:
 * - daily  → same day as targetDate
 * - weekly → same ISO week as targetDate
 * - monthly → same calendar month as targetDate
 *
 * @param task       The habit task to evaluate
 * @param frequency  The habit's frequency (daily | weekly | monthly)
 * @param targetDate The date being "started fresh" (YYYY-MM-DD)
 * @returns true if the task should be reset (unchecked)
 */
export function shouldResetTaskForStartFresh(
  task: { completed: boolean; completedDate?: string },
  frequency: 'daily' | 'weekly' | 'monthly',
  targetDate: string
): boolean {
  if (!task.completed || !task.completedDate) return false

  switch (frequency) {
    case 'daily':
      return task.completedDate === targetDate

    case 'weekly':
      return isSameWeek(task.completedDate, targetDate)

    case 'monthly':
      return isSameMonth(task.completedDate, targetDate)

    default:
      return false
  }
}
