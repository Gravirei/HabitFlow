import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { supabase } from '@/lib/supabase'
import {
  createSession,
  getUserSessions,
  updateSessionActivity,
  terminateSession,
  terminateAllOtherSessions,
  cleanExpiredSessions,
  isSessionValid,
} from '../sessionManager'
import { createQueryBuilder } from './helpers'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

const fromMock = vi.mocked(supabase.from)

const makeSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-1',
  user_id: 'user-1',
  session_token: 'token-1',
  ip_address: '1.2.3.4',
  user_agent: 'UA/1',
  device_info: {},
  is_active: true,
  last_activity: '2026-01-15T11:00:00.000Z',
  expires_at: '2026-01-16T12:00:00.000Z',
  created_at: '2026-01-15T10:00:00.000Z',
  ...overrides,
})

describe('sessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createSession', () => {
    it('inserts an active session with parsed device info and expiry', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await createSession('user-1', 'token-1', '1.2.3.4', 'Mozilla/5.0 Test')

      expect(fromMock).toHaveBeenCalledWith('user_sessions')
      const inserted = builder.insert.mock.calls[0][0]
      expect(inserted).toMatchObject({
        user_id: 'user-1',
        session_token: 'token-1',
        ip_address: '1.2.3.4',
        user_agent: 'Mozilla/5.0 Test',
        is_active: true,
      })
      expect(inserted.expires_at).toBe('2026-01-16T12:00:00.000Z')
      expect(typeof inserted.device_info).toBe('object')
    })

    it('honours a custom expiry window', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await createSession('user-1', 'token-1', '1.2.3.4', 'UA/1', 48)

      expect(builder.insert.mock.calls[0][0].expires_at).toBe('2026-01-17T12:00:00.000Z')
    })
  })

  describe('getUserSessions', () => {
    it('returns active sessions for the user', async () => {
      const sessions = [makeSession()]
      const builder = createQueryBuilder({ data: sessions })
      fromMock.mockReturnValue(builder)

      const result = await getUserSessions('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].session_token).toBe('token-1')
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(builder.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('returns an empty array when the query errors', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const builder = createQueryBuilder({ data: null, error: new Error('db down') })
      fromMock.mockReturnValue(builder)

      const result = await getUserSessions('user-1')

      expect(result).toEqual([])
      errorSpy.mockRestore()
    })
  })

  describe('updateSessionActivity', () => {
    it('stamps last_activity for the session token', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await updateSessionActivity('token-1')

      expect(builder.update).toHaveBeenCalledWith({ last_activity: '2026-01-15T12:00:00.000Z' })
      expect(builder.eq).toHaveBeenCalledWith('session_token', 'token-1')
    })
  })

  describe('terminateSession', () => {
    it('deactivates the session by id', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await terminateSession('session-1')

      expect(builder.update).toHaveBeenCalledWith({ is_active: false })
      expect(builder.eq).toHaveBeenCalledWith('id', 'session-1')
    })
  })

  describe('terminateAllOtherSessions', () => {
    it('deactivates all other active sessions for the user', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await terminateAllOtherSessions('user-1', 'token-1')

      expect(builder.update).toHaveBeenCalledWith({ is_active: false })
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(builder.neq).toHaveBeenCalledWith('session_token', 'token-1')
      expect(builder.eq).toHaveBeenCalledWith('is_active', true)
    })
  })

  describe('cleanExpiredSessions', () => {
    it('deactivates sessions expired before now', async () => {
      const builder = createQueryBuilder()
      fromMock.mockReturnValue(builder)

      await cleanExpiredSessions()

      expect(builder.update).toHaveBeenCalledWith({ is_active: false })
      expect(builder.lt).toHaveBeenCalledWith('expires_at', '2026-01-15T12:00:00.000Z')
      expect(builder.eq).toHaveBeenCalledWith('is_active', true)
    })
  })

  describe('isSessionValid', () => {
    it('returns true for an unexpired session', async () => {
      const builder = createQueryBuilder({ data: makeSession() })
      fromMock.mockReturnValue(builder)

      const valid = await isSessionValid('token-1')

      expect(valid).toBe(true)
    })

    it('terminates and rejects an expired session', async () => {
      const selectBuilder = createQueryBuilder({
        data: makeSession({ expires_at: '2026-01-15T11:00:00.000Z' }),
      })
      const updateBuilder = createQueryBuilder()
      fromMock.mockReturnValueOnce(selectBuilder).mockReturnValueOnce(updateBuilder)

      const valid = await isSessionValid('token-1')

      expect(valid).toBe(false)
      expect(updateBuilder.update).toHaveBeenCalledWith({ is_active: false })
    })

    it('returns false when the session does not exist', async () => {
      const builder = createQueryBuilder({ data: null, error: new Error('no rows') })
      fromMock.mockReturnValue(builder)

      const valid = await isSessionValid('missing-token')

      expect(valid).toBe(false)
    })
  })
})
