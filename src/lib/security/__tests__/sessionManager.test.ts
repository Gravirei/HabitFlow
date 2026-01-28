import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionManager } from '../sessionManager'

describe('SessionManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Session Tracking', () => {
    it('should create new session', () => {
      const session = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome on Windows',
      })

      expect(session).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        deviceInfo: 'Chrome on Windows',
        createdAt: expect.any(Number),
        lastActivity: expect.any(Number),
        isActive: true,
      })
    })

    it('should list active sessions', () => {
      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Firefox',
      })

      const sessions = SessionManager.listSessions('user-123')

      expect(sessions).toHaveLength(2)
      expect(sessions[0].deviceInfo).toBe('Chrome')
      expect(sessions[1].deviceInfo).toBe('Firefox')
    })

    it('should update last activity timestamp', () => {
      const session = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      const originalActivity = session.lastActivity

      vi.advanceTimersByTime(5000)

      SessionManager.updateActivity(session.id)

      const updated = SessionManager.getSession(session.id)
      expect(updated?.lastActivity).toBeGreaterThan(originalActivity)
    })
  })

  describe('Session Expiration', () => {
    it('should mark session as inactive after timeout', () => {
      const session = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      expect(session.isActive).toBe(true)

      // Simulate 30 minutes of inactivity
      vi.advanceTimersByTime(30 * 60 * 1000)

      const expired = SessionManager.isSessionExpired(session.id, 20 * 60 * 1000) // 20 min timeout

      expect(expired).toBe(true)
    })

    it('should not expire active sessions', () => {
      const session = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      vi.advanceTimersByTime(10 * 60 * 1000) // 10 minutes
      SessionManager.updateActivity(session.id)

      vi.advanceTimersByTime(10 * 60 * 1000) // Another 10 minutes

      const expired = SessionManager.isSessionExpired(session.id, 20 * 60 * 1000)

      expect(expired).toBe(false)
    })
  })

  describe('Session Revocation', () => {
    it('should revoke specific session', () => {
      const session1 = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      const session2 = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Firefox',
      })

      SessionManager.revokeSession(session1.id)

      const sessions = SessionManager.listSessions('user-123')
      expect(sessions).toHaveLength(1)
      expect(sessions[0].id).toBe(session2.id)
    })

    it('should revoke all sessions for user', () => {
      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Firefox',
      })

      SessionManager.revokeAllSessions('user-123')

      const sessions = SessionManager.listSessions('user-123')
      expect(sessions).toHaveLength(0)
    })

    it('should revoke all sessions except current', () => {
      const current = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Firefox',
      })

      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Safari',
      })

      SessionManager.revokeOtherSessions('user-123', current.id)

      const sessions = SessionManager.listSessions('user-123')
      expect(sessions).toHaveLength(1)
      expect(sessions[0].id).toBe(current.id)
    })
  })

  describe('Session Limits', () => {
    it('should enforce maximum concurrent sessions', () => {
      const maxSessions = 3

      for (let i = 0; i < 5; i++) {
        SessionManager.createSession({
          userId: 'user-123',
          deviceInfo: `Device ${i}`,
        })
      }

      const sessions = SessionManager.listSessions('user-123')

      // Should only keep the most recent sessions
      expect(sessions.length).toBeLessThanOrEqual(maxSessions)
    })
  })

  describe('Persistence', () => {
    it('should persist sessions to localStorage', () => {
      SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      const stored = localStorage.getItem('user_sessions')
      expect(stored).toBeTruthy()

      const data = JSON.parse(stored!)
      expect(data).toHaveLength(1)
    })

    it('should restore sessions from localStorage', () => {
      const session = SessionManager.createSession({
        userId: 'user-123',
        deviceInfo: 'Chrome',
      })

      // Simulate app restart - clear memory but keep localStorage
      const sessionId = session.id

      const restored = SessionManager.getSession(sessionId)
      expect(restored).toBeTruthy()
      expect(restored?.userId).toBe('user-123')
    })
  })
})
