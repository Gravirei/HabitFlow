import { describe, it, expect } from 'vitest'
import { shouldResetTaskForStartFresh } from '@/utils/habitResetUtils'

describe('habitResetUtils', () => {
  describe('shouldResetTaskForStartFresh', () => {
    // ─── Guard clauses ────────────────────────────────────────────────

    it('should return false for uncompleted tasks', () => {
      const task = { completed: false, completedDate: '2026-03-01' }
      expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
    })

    it('should return false for tasks without completedDate', () => {
      const task = { completed: true, completedDate: undefined }
      expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
    })

    it('should return false for uncompleted tasks without completedDate', () => {
      const task = { completed: false }
      expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
    })

    // ─── Daily frequency ──────────────────────────────────────────────

    describe('daily frequency', () => {
      it('should reset task completed on the same day', () => {
        const task = { completed: true, completedDate: '2026-03-01' }
        expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(true)
      })

      it('should NOT reset task completed on a different day', () => {
        const task = { completed: true, completedDate: '2026-02-28' }
        expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
      })

      it('should NOT reset task completed yesterday', () => {
        const task = { completed: true, completedDate: '2026-02-28' }
        expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
      })

      it('should NOT reset task completed tomorrow', () => {
        const task = { completed: true, completedDate: '2026-03-02' }
        expect(shouldResetTaskForStartFresh(task, 'daily', '2026-03-01')).toBe(false)
      })
    })

    // ─── Weekly frequency ─────────────────────────────────────────────

    describe('weekly frequency', () => {
      // 2026-03-02 is Monday, 2026-03-08 is Sunday (same week)
      it('should reset task completed on same day within the week', () => {
        const task = { completed: true, completedDate: '2026-03-04' } // Wednesday
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-04')).toBe(true)
      })

      it('should reset task completed on Monday when target is Sunday of same week', () => {
        const task = { completed: true, completedDate: '2026-03-02' } // Monday
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-08')).toBe(true) // Sunday
      })

      it('should reset task completed on Sunday when target is Monday of same week', () => {
        const task = { completed: true, completedDate: '2026-03-08' } // Sunday
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-02')).toBe(true) // Monday
      })

      it('should reset task completed mid-week when target is different day same week', () => {
        const task = { completed: true, completedDate: '2026-03-03' } // Tuesday
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-06')).toBe(true) // Friday
      })

      it('should NOT reset task completed in a previous week', () => {
        const task = { completed: true, completedDate: '2026-02-27' } // Fri previous week
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-02')).toBe(false) // Mon next week
      })

      it('should NOT reset task completed in the following week', () => {
        const task = { completed: true, completedDate: '2026-03-09' } // Mon next week
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-06')).toBe(false) // Fri current week
      })

      // Edge case: Sunday is last day of ISO week (not first)
      it('should treat Sunday as last day of the week (ISO standard)', () => {
        const task = { completed: true, completedDate: '2026-03-01' } // Sunday
        // Monday March 2 is start of next week
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-02')).toBe(false)
      })

      // Edge case: week spanning month boundary
      it('should handle weeks spanning month boundaries', () => {
        // 2026-02-23 is Monday, 2026-03-01 is Sunday (same week)
        const task = { completed: true, completedDate: '2026-02-25' } // Wed Feb
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-03-01')).toBe(true) // Sun Mar (same week)
      })

      // Edge case: week spanning year boundary
      it('should handle weeks spanning year boundaries', () => {
        // 2025-12-29 is Monday, 2026-01-04 is Sunday (same week)
        const task = { completed: true, completedDate: '2025-12-30' } // Tue Dec 30
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2026-01-02')).toBe(true) // Fri Jan 2 (same week)
      })

      it('should NOT cross year boundary to previous week', () => {
        // 2025-12-28 is Sunday (end of prev week), 2025-12-29 is Monday (start of new week)
        const task = { completed: true, completedDate: '2025-12-28' } // Sunday
        expect(shouldResetTaskForStartFresh(task, 'weekly', '2025-12-29')).toBe(false) // Monday next week
      })
    })

    // ─── Monthly frequency ────────────────────────────────────────────

    describe('monthly frequency', () => {
      it('should reset task completed on the same day in the same month', () => {
        const task = { completed: true, completedDate: '2026-03-01' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-15')).toBe(true)
      })

      it('should reset task completed on different days within the same month', () => {
        const task = { completed: true, completedDate: '2026-03-05' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-28')).toBe(true)
      })

      it('should NOT reset task completed in a previous month', () => {
        const task = { completed: true, completedDate: '2026-02-15' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-01')).toBe(false)
      })

      it('should NOT reset task completed in the following month', () => {
        const task = { completed: true, completedDate: '2026-04-01' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-31')).toBe(false)
      })

      it('should NOT reset task from same month in different year', () => {
        const task = { completed: true, completedDate: '2025-03-15' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-15')).toBe(false)
      })

      // Edge case: month boundary
      it('should handle last day of month vs first day of next month', () => {
        const task = { completed: true, completedDate: '2026-02-28' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-03-01')).toBe(false)
      })

      // Edge case: January to December
      it('should handle December to January transition', () => {
        const task = { completed: true, completedDate: '2025-12-31' }
        expect(shouldResetTaskForStartFresh(task, 'monthly', '2026-01-01')).toBe(false)
      })
    })

    // ─── Unknown frequency ────────────────────────────────────────────

    it('should return false for unknown frequency', () => {
      const task = { completed: true, completedDate: '2026-03-01' }
      // @ts-expect-error — testing unknown frequency
      expect(shouldResetTaskForStartFresh(task, 'yearly', '2026-03-01')).toBe(false)
    })
  })
})
