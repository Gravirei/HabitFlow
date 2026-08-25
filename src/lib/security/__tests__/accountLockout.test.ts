import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '@/lib/supabase'
import {
  isAccountLocked,
  lockAccount,
  unlockAccount,
  checkAndLockAccount,
} from '../accountLockout'
import { createQueryBuilder } from './helpers'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

const fromMock = vi.mocked(supabase.from)

describe('accountLockout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isAccountLocked', () => {
    it('returns not locked when no lockout record exists', async () => {
      const builder = createQueryBuilder({ data: [] })
      fromMock.mockReturnValue(builder)

      const status = await isAccountLocked('user@example.com')

      expect(status).toEqual({ isLocked: false })
      expect(fromMock).toHaveBeenCalledWith('account_lockouts')
    })

    it('returns locked with reason and expiry for an active lockout', async () => {
      const lockedUntil = '2026-01-15T13:00:00.000Z'
      const builder = createQueryBuilder({
        data: [{ email: 'user@example.com', is_locked: true, locked_until: lockedUntil, reason: 'Too many failed login attempts' }],
      })
      fromMock.mockReturnValue(builder)

      const status = await isAccountLocked('user@example.com')

      expect(status.isLocked).toBe(true)
      expect(status.lockedUntil).toEqual(new Date(lockedUntil))
      expect(status.reason).toBe('Too many failed login attempts')
    })

    it('unlocks and reports not-locked when the lockout has expired', async () => {
      const expired = '2026-01-15T11:00:00.000Z'
      const selectBuilder = createQueryBuilder({
        data: [{ email: 'user@example.com', is_locked: true, locked_until: expired }],
      })
      const updateBuilder = createQueryBuilder()
      fromMock
        .mockReturnValueOnce(selectBuilder)
        .mockReturnValueOnce(updateBuilder)

      const status = await isAccountLocked('user@example.com')

      expect(status.isLocked).toBe(false)
      expect(updateBuilder.update).toHaveBeenCalledWith({ is_locked: false })
    })

    it('fails open (not locked) when the query errors', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const builder = createQueryBuilder({ data: null, error: new Error('db down') })
      fromMock.mockReturnValue(builder)

      const status = await isAccountLocked('user@example.com')

      expect(status.isLocked).toBe(false)
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })

  describe('lockAccount', () => {
    it('inserts a lockout record with computed expiry', async () => {
      const insertBuilder = createQueryBuilder()
      fromMock.mockReturnValue(insertBuilder)

      await lockAccount('user@example.com', 'user-1', 'Too many failed login attempts', 30)

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          email: 'user@example.com',
          reason: 'Too many failed login attempts',
          locked_until: '2026-01-15T12:30:00.000Z',
          is_locked: true,
        })
      )
    })
  })

  describe('unlockAccount', () => {
    it('deactivates active lockouts for the email', async () => {
      const updateBuilder = createQueryBuilder()
      fromMock.mockReturnValue(updateBuilder)

      await unlockAccount('user@example.com')

      expect(updateBuilder.update).toHaveBeenCalledWith({ is_locked: false })
      expect(updateBuilder.eq).toHaveBeenCalledWith('email', 'user@example.com')
      expect(updateBuilder.eq).toHaveBeenCalledWith('is_locked', true)
    })
  })

  describe('checkAndLockAccount', () => {
    it('does not lock when failed attempts are below the threshold', async () => {
      const builder = createQueryBuilder({ data: [{ success: false }, { success: false }] })
      fromMock.mockReturnValue(builder)

      const status = await checkAndLockAccount('user@example.com', 5)

      expect(status.isLocked).toBe(false)
      expect(builder.gte).toHaveBeenCalledWith('created_at', '2026-01-15T11:45:00.000Z')
    })

    it('locks the account when the threshold is reached', async () => {
      const attempts = Array.from({ length: 5 }, () => ({ success: false, user_id: 'user-1' }))
      const countBuilder = createQueryBuilder({ data: attempts })
      const insertBuilder = createQueryBuilder()
      fromMock
        .mockReturnValueOnce(countBuilder)
        .mockReturnValueOnce(insertBuilder)

      const status = await checkAndLockAccount('user@example.com', 5, 15, 30)

      expect(status.isLocked).toBe(true)
      expect(status.lockedUntil).toEqual(new Date('2026-01-15T12:30:00.000Z'))
      expect(status.reason).toContain('Too many failed login attempts')
      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com', is_locked: true })
      )
    })

    it('fails open when the attempt lookup errors', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const builder = createQueryBuilder({ data: null, error: new Error('db down') })
      fromMock.mockReturnValue(builder)

      const status = await checkAndLockAccount('user@example.com')

      expect(status.isLocked).toBe(false)
      errorSpy.mockRestore()
    })
  })
})
