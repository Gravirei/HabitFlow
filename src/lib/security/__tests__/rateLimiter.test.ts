import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { supabase } from '@/lib/supabase'
import {
  RATE_LIMIT_CONFIGS,
  checkRateLimit,
  recordLoginAttempt,
  getClientIP,
  getUserAgent,
  clearOldAttempts,
} from '../rateLimiter'
import { createQueryBuilder } from './helpers'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

const fromMock = vi.mocked(supabase.from)

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('RATE_LIMIT_CONFIGS', () => {
    it('exposes sane defaults for login, signup, and forgotPassword', () => {
      expect(RATE_LIMIT_CONFIGS.login).toMatchObject({ maxAttempts: 5, windowMinutes: 15 })
      expect(RATE_LIMIT_CONFIGS.signup.maxAttempts).toBeGreaterThan(0)
      expect(RATE_LIMIT_CONFIGS.forgotPassword.lockoutMinutes).toBeGreaterThan(0)
    })
  })

  describe('checkRateLimit', () => {
    const config = { maxAttempts: 3, windowMinutes: 60, lockoutMinutes: 30 }

    it('allows requests within the limit and reports remaining attempts', async () => {
      const builder = createQueryBuilder({ data: [{ success: false }, { success: false }] })
      fromMock.mockReturnValue(builder)

      const result = await checkRateLimit('user@example.com', '1.2.3.4', config)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(1)
      expect(builder.or).toHaveBeenCalledWith('email.eq.user@example.com,ip_address.eq.1.2.3.4')
      expect(builder.gte).toHaveBeenCalledWith('created_at', '2026-01-15T11:00:00.000Z')
    })

    it('blocks requests exceeding the limit with a reset time', async () => {
      const attempts = Array.from({ length: 3 }, () => ({ success: false }))
      const builder = createQueryBuilder({ data: attempts })
      fromMock.mockReturnValue(builder)

      const result = await checkRateLimit('user@example.com', '1.2.3.4', config)

      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      expect(result.resetAt).toEqual(new Date('2026-01-15T12:30:00.000Z'))
    })

    it('fails closed when the lookup errors', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const builder = createQueryBuilder({ data: null, error: new Error('db down') })
      fromMock.mockReturnValue(builder)

      const result = await checkRateLimit('user@example.com', '1.2.3.4', config)

      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      errorSpy.mockRestore()
    })
  })

  describe('recordLoginAttempt', () => {
    it('inserts an attempt record', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await recordLoginAttempt('user@example.com', '1.2.3.4', 'UA/1', false, 'user-1')

      expect(fromMock).toHaveBeenCalledWith('login_attempts')
      expect(builder.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        email: 'user@example.com',
        ip_address: '1.2.3.4',
        user_agent: 'UA/1',
        success: false,
      })
    })

    it('defaults user_id to null when not provided', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await recordLoginAttempt('user@example.com', '1.2.3.4', 'UA/1', true)

      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: null, success: true })
      )
    })
  })

  describe('client helpers', () => {
    it('returns a placeholder client IP', () => {
      expect(getClientIP()).toBe('unknown')
    })

    it('returns the navigator user agent', () => {
      expect(getUserAgent()).toBe(navigator.userAgent || 'unknown')
    })
  })

  describe('clearOldAttempts', () => {
    it('deletes attempts older than the cutoff (default 7 days)', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await clearOldAttempts()

      expect(builder.delete).toHaveBeenCalled()
      expect(builder.lt).toHaveBeenCalledWith('created_at', '2026-01-08T12:00:00.000Z')
    })
  })
})
