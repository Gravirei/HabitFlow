import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from '../rateLimiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter('test', 3, 60000) // 3 requests per minute

      expect(limiter.checkLimit()).toBe(true)
      expect(limiter.checkLimit()).toBe(true)
      expect(limiter.checkLimit()).toBe(true)
    })

    it('should block requests exceeding limit', () => {
      const limiter = new RateLimiter('test', 3, 60000)

      limiter.checkLimit()
      limiter.checkLimit()
      limiter.checkLimit()

      expect(limiter.checkLimit()).toBe(false)
    })

    it('should reset after time window', () => {
      const limiter = new RateLimiter('test', 2, 1000) // 2 requests per second

      expect(limiter.checkLimit()).toBe(true)
      expect(limiter.checkLimit()).toBe(true)
      expect(limiter.checkLimit()).toBe(false)

      // Advance time by 1 second
      vi.advanceTimersByTime(1000)

      // Should allow requests again
      expect(limiter.checkLimit()).toBe(true)
    })

    it('should track different keys separately', () => {
      const limiter1 = new RateLimiter('action1', 1, 60000)
      const limiter2 = new RateLimiter('action2', 1, 60000)

      expect(limiter1.checkLimit()).toBe(true)
      expect(limiter2.checkLimit()).toBe(true)

      expect(limiter1.checkLimit()).toBe(false)
      expect(limiter2.checkLimit()).toBe(false)
    })
  })

  describe('getRemainingTime', () => {
    it('should return 0 when not rate limited', () => {
      const limiter = new RateLimiter('test', 3, 60000)

      expect(limiter.getRemainingTime()).toBe(0)
    })

    it('should return remaining time when rate limited', () => {
      const limiter = new RateLimiter('test', 1, 60000)

      limiter.checkLimit()
      limiter.checkLimit() // This should be blocked

      const remaining = limiter.getRemainingTime()
      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(60000)
    })

    it('should decrease remaining time as time passes', () => {
      const limiter = new RateLimiter('test', 1, 10000)

      limiter.checkLimit()
      limiter.checkLimit() // Blocked

      const remaining1 = limiter.getRemainingTime()

      vi.advanceTimersByTime(5000)

      const remaining2 = limiter.getRemainingTime()

      expect(remaining2).toBeLessThan(remaining1)
      expect(remaining2).toBeGreaterThan(0)
    })
  })

  describe('reset', () => {
    it('should clear rate limit data', () => {
      const limiter = new RateLimiter('test', 1, 60000)

      limiter.checkLimit()
      limiter.checkLimit() // Blocked

      expect(limiter.checkLimit()).toBe(false)

      limiter.reset()

      expect(limiter.checkLimit()).toBe(true)
    })
  })

  describe('persistence', () => {
    it('should persist rate limit data to localStorage', () => {
      const limiter = new RateLimiter('test', 2, 60000)

      limiter.checkLimit()
      limiter.checkLimit()

      const stored = localStorage.getItem('rate_limit_test')
      expect(stored).toBeTruthy()

      const data = JSON.parse(stored!)
      expect(data.count).toBe(2)
    })

    it('should restore rate limit data from localStorage', () => {
      const limiter1 = new RateLimiter('test', 2, 60000)

      limiter1.checkLimit()
      limiter1.checkLimit()

      // Create new instance - should restore from localStorage
      const limiter2 = new RateLimiter('test', 2, 60000)

      expect(limiter2.checkLimit()).toBe(false) // Should still be blocked
    })
  })
})
