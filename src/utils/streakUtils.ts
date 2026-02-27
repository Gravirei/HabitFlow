import { format, subDays, differenceInCalendarDays, startOfDay } from 'date-fns'

/**
 * Modern streak calculation utility.
 *
 * Uses the "yesterday-tolerant" algorithm adopted by Duolingo, GitHub,
 * Streaks (iOS) and most modern habit-tracking apps:
 *
 *   1. If today is in the completed set → anchor on today.
 *   2. Else if yesterday is in the completed set → anchor on yesterday
 *      (the user still has until end-of-day to maintain the streak).
 *   3. Otherwise the streak is broken → 0.
 *
 * Walking backward from the anchor counts consecutive calendar days.
 *
 * All date comparisons use `date-fns` calendar-day arithmetic so they are
 * immune to timezone / DST / millisecond-rounding issues.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a YYYY-MM-DD string to a local-midnight Date. */
const toDate = (dateStr: string): Date => new Date(`${dateStr}T00:00:00`)

/** Format a Date as YYYY-MM-DD in local time. */
const toKey = (d: Date): string => format(d, 'yyyy-MM-dd')

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate the current streak from an array of completed-date strings.
 *
 * @param completedDates – Array of `"yyyy-MM-dd"` strings (any order, may
 *   contain duplicates).
 * @param today – Override "today" for deterministic testing.
 *   Defaults to `new Date()`.
 * @returns The number of consecutive days ending at the anchor.
 */
export function calculateCurrentStreak(
  completedDates: string[],
  today: Date = new Date(),
): number {
  if (completedDates.length === 0) return 0

  const dateSet = new Set(completedDates)
  const todayKey = toKey(startOfDay(today))
  const yesterdayKey = toKey(subDays(startOfDay(today), 1))

  // Step 1 – determine anchor
  let anchor: Date
  if (dateSet.has(todayKey)) {
    anchor = startOfDay(today)
  } else if (dateSet.has(yesterdayKey)) {
    anchor = subDays(startOfDay(today), 1)
  } else {
    return 0 // streak is broken
  }

  // Step 2 – walk backward counting consecutive calendar days
  let streak = 0
  let checkDate = anchor
  while (dateSet.has(toKey(checkDate))) {
    streak++
    checkDate = subDays(checkDate, 1)
  }

  return streak
}

/**
 * Calculate the best (longest) streak ever achieved from an array of
 * completed-date strings.
 *
 * Scans the full sorted history instead of relying on an incrementally
 * maintained counter, so it is always accurate even after un-completions.
 *
 * @param completedDates – Array of `"yyyy-MM-dd"` strings.
 * @returns The longest run of consecutive calendar days.
 */
export function calculateBestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0

  const sorted = [...new Set(completedDates)].sort() // ascending
  let best = 1
  let run = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = toDate(sorted[i - 1])
    const curr = toDate(sorted[i])
    const diff = differenceInCalendarDays(curr, prev)

    if (diff === 1) {
      run++
      if (run > best) best = run
    } else if (diff > 1) {
      run = 1
    }
    // diff === 0 means duplicate date – keep current run as-is
  }

  return best
}

/**
 * Convenience wrapper that returns both streaks in one call.
 */
export function calculateStreaks(
  completedDates: string[],
  today: Date = new Date(),
): { currentStreak: number; bestStreak: number } {
  const currentStreak = calculateCurrentStreak(completedDates, today)
  const bestStreak = Math.max(
    calculateBestStreak(completedDates),
    currentStreak,
  )
  return { currentStreak, bestStreak }
}
