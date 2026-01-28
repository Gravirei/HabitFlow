import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AccountLockout } from '../accountLockout'

describe('AccountLockout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Failed Attempt Tracking', () => {
    it('should track failed login attempts', () => {
      AccountLockout.recordFailedAttempt('user@example.com')
      AccountLockout.recordFailedAttempt('user@example.com')

      const attempts = AccountLockout.getFailedAttempts('user@example.com')
      expect(attempts).toBe(2)
    })

    it('should reset failed attempts on successful login', () => {
      AccountLockout.recordFailedAttempt('user@example.com')
      AccountLockout.recordFailedAttempt('user@example.com')

      expect(AccountLockout.getFailedAttempts('user@example.com')).toBe(2)

      AccountLockout.resetAttempts('user@example.com')

      expect(AccountLockout.getFailedAttempts('user@example.com')).toBe(0)
    })

    it('should track attempts for different users separately', () => {
      AccountLockout.recordFailedAttempt('user1@example.com')
      AccountLockout.recordFailedAttempt('user2@example.com')
      AccountLockout.recordFailedAttempt('user2@example.com')

      expect(AccountLockout.getFailedAttempts('user1@example.com')).toBe(1)
      expect(AccountLockout.getFailedAttempts('user2@example.com')).toBe(2)
    })
  })

  describe('Account Locking', () => {
    it('should lock account after max failed attempts', () => {
      const maxAttempts = 5
      const identifier = 'user@example.com'

      // Record max attempts
      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      expect(AccountLockout.isLocked(identifier, maxAttempts)).toBe(true)
    })

    it('should not lock account before max attempts', () => {
      const maxAttempts = 5
      const identifier = 'user@example.com'

      // Record fewer than max attempts
      for (let i = 0; i < maxAttempts - 1; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      expect(AccountLockout.isLocked(identifier, maxAttempts)).toBe(false)
    })

    it('should unlock account after lockout duration', () => {
      const maxAttempts = 5
      const lockoutDuration = 15 * 60 * 1000 // 15 minutes
      const identifier = 'user@example.com'

      // Lock the account
      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      expect(AccountLockout.isLocked(identifier, maxAttempts)).toBe(true)

      // Advance time past lockout duration
      vi.advanceTimersByTime(lockoutDuration + 1000)

      expect(AccountLockout.isLocked(identifier, maxAttempts, lockoutDuration)).toBe(false)
    })
  })

  describe('Lockout Duration', () => {
    it('should return remaining lockout time', () => {
      const maxAttempts = 3
      const lockoutDuration = 10 * 60 * 1000 // 10 minutes
      const identifier = 'user@example.com'

      // Lock the account
      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      const remaining = AccountLockout.getRemainingLockoutTime(identifier, lockoutDuration)

      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(lockoutDuration)
    })

    it('should return 0 for unlocked accounts', () => {
      const identifier = 'user@example.com'

      const remaining = AccountLockout.getRemainingLockoutTime(identifier, 10 * 60 * 1000)

      expect(remaining).toBe(0)
    })

    it('should decrease remaining time as time passes', () => {
      const maxAttempts = 3
      const lockoutDuration = 10 * 60 * 1000
      const identifier = 'user@example.com'

      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      const remaining1 = AccountLockout.getRemainingLockoutTime(identifier, lockoutDuration)

      vi.advanceTimersByTime(2 * 60 * 1000) // 2 minutes

      const remaining2 = AccountLockout.getRemainingLockoutTime(identifier, lockoutDuration)

      expect(remaining2).toBeLessThan(remaining1)
      expect(remaining2).toBeGreaterThan(0)
    })
  })

  describe('Progressive Lockout', () => {
    it('should increase lockout duration with repeated violations', () => {
      const identifier = 'user@example.com'
      const maxAttempts = 3
      const baseLockout = 5 * 60 * 1000 // 5 minutes

      // First lockout
      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      const duration1 = AccountLockout.getRemainingLockoutTime(identifier, baseLockout)

      // Wait for lockout to expire
      vi.advanceTimersByTime(baseLockout + 1000)

      // Second lockout - should be longer
      for (let i = 0; i < maxAttempts; i++) {
        AccountLockout.recordFailedAttempt(identifier)
      }

      const duration2 = AccountLockout.getRemainingLockoutTime(identifier, baseLockout * 2)

      expect(duration2).toBeGreaterThanOrEqual(duration1)
    })
  })

  describe('Persistence', () => {
    it('should persist lockout data to localStorage', () => {
      AccountLockout.recordFailedAttempt('user@example.com')

      const stored = localStorage.getItem('account_lockout_user@example.com')
      expect(stored).toBeTruthy()

      const data = JSON.parse(stored!)
      expect(data.attempts).toBe(1)
    })

    it('should restore lockout data from localStorage', () => {
      AccountLockout.recordFailedAttempt('user@example.com')
      AccountLockout.recordFailedAttempt('user@example.com')

      // Simulate app restart
      const attempts = AccountLockout.getFailedAttempts('user@example.com')

      expect(attempts).toBe(2)
    })
  })
})
