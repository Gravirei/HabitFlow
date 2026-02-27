import { describe, it, expect } from 'vitest'
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateStreaks,
} from '@/utils/streakUtils'
import { subDays, format } from 'date-fns'

// Helper: returns 'yyyy-MM-dd' for N days ago relative to a fixed "today"
const daysAgo = (n: number, today: Date = new Date('2026-02-27T12:00:00')): string =>
  format(subDays(today, n), 'yyyy-MM-dd')

const TODAY = new Date('2026-02-27T12:00:00')

describe('calculateCurrentStreak', () => {
  it('returns 0 for empty dates', () => {
    expect(calculateCurrentStreak([], TODAY)).toBe(0)
  })

  it('returns 1 when only today is completed', () => {
    expect(calculateCurrentStreak([daysAgo(0, TODAY)], TODAY)).toBe(1)
  })

  it('returns 1 when only yesterday is completed (yesterday-tolerant)', () => {
    expect(calculateCurrentStreak([daysAgo(1, TODAY)], TODAY)).toBe(1)
  })

  it('returns 0 when most recent completion is 2+ days ago', () => {
    expect(calculateCurrentStreak([daysAgo(2, TODAY)], TODAY)).toBe(0)
  })

  it('counts consecutive days including today', () => {
    const dates = [daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(3, TODAY), daysAgo(4, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(5)
  })

  it('counts consecutive days starting from yesterday when today is not completed', () => {
    // This is the exact bug scenario: 5-day streak, uncomplete today → should be 4
    const dates = [daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(3, TODAY), daysAgo(4, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(4)
  })

  it('stops at a gap in the streak', () => {
    // today, yesterday, 2 days ago, GAP, 4 days ago
    const dates = [daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(4, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(3)
  })

  it('stops at a gap when anchored on yesterday', () => {
    // yesterday, 2 days ago, GAP, 4 days ago
    const dates = [daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(4, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(2)
  })

  it('handles duplicate dates', () => {
    const dates = [daysAgo(0, TODAY), daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(1, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(2)
  })

  it('handles unsorted dates', () => {
    const dates = [daysAgo(3, TODAY), daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(2, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(4)
  })

  it('returns 0 when dates exist but none are recent', () => {
    const dates = [daysAgo(30, TODAY), daysAgo(31, TODAY), daysAgo(32, TODAY)]
    expect(calculateCurrentStreak(dates, TODAY)).toBe(0)
  })
})

describe('calculateBestStreak', () => {
  it('returns 0 for empty dates', () => {
    expect(calculateBestStreak([])).toBe(0)
  })

  it('returns 1 for a single date', () => {
    expect(calculateBestStreak(['2026-01-15'])).toBe(1)
  })

  it('finds the longest consecutive run', () => {
    // Run of 3, gap, run of 5
    const dates = [
      '2026-01-01', '2026-01-02', '2026-01-03', // 3-day run
      // gap on Jan 4
      '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', // 5-day run
    ]
    expect(calculateBestStreak(dates)).toBe(5)
  })

  it('handles all consecutive dates', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']
    expect(calculateBestStreak(dates)).toBe(4)
  })

  it('handles all isolated dates (no consecutive)', () => {
    const dates = ['2026-01-01', '2026-01-03', '2026-01-05', '2026-01-07']
    expect(calculateBestStreak(dates)).toBe(1)
  })

  it('handles duplicates correctly', () => {
    const dates = ['2026-01-01', '2026-01-01', '2026-01-02', '2026-01-02', '2026-01-03']
    expect(calculateBestStreak(dates)).toBe(3)
  })
})

describe('calculateStreaks (combined)', () => {
  it('returns both current and best streak', () => {
    // Historical best: 5 days in January
    // Current: 3 days ending today
    const dates = [
      '2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14', // 5-day best
      daysAgo(2, TODAY), daysAgo(1, TODAY), daysAgo(0, TODAY), // current 3-day
    ]
    const result = calculateStreaks(dates, TODAY)
    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(5)
  })

  it('best streak is at least as large as current streak', () => {
    const dates = [daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(2, TODAY)]
    const result = calculateStreaks(dates, TODAY)
    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(3)
  })

  // THE KEY BUG SCENARIO
  it('uncompleting today shows previous streak, not 0', () => {
    // Before: 5-day streak (today + 4 previous days) → currentStreak = 5
    const beforeUncomplete = [
      daysAgo(0, TODAY), daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(3, TODAY), daysAgo(4, TODAY),
    ]
    expect(calculateStreaks(beforeUncomplete, TODAY).currentStreak).toBe(5)

    // After: user uncompletes today → remove today → should be 4, NOT 0
    const afterUncomplete = [
      daysAgo(1, TODAY), daysAgo(2, TODAY), daysAgo(3, TODAY), daysAgo(4, TODAY),
    ]
    expect(calculateStreaks(afterUncomplete, TODAY).currentStreak).toBe(4)
  })
})
