/**
 * Archive Store Tests
 * Comprehensive tests for archive Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import type { ArchivedSession } from '../archiveStore'

// Must import store after mocks are set up
let useArchiveStore: typeof import('../archiveStore').useArchiveStore

describe('useArchiveStore', () => {
  const createMockSession = (overrides: Partial<ArchivedSession> = {}): ArchivedSession => ({
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Stopwatch',
    sessionName: 'Test Session',
    timestamp: Date.now(),
    duration: 3600000,
    archivedAt: Date.now(),
    originalStorage: 'stopwatch',
    ...overrides,
  })

  beforeEach(async () => {
    // Clear localStorage first
    localStorage.clear()
    
    // Dynamic import to ensure fresh store after localStorage is ready
    vi.resetModules()
    const module = await import('../archiveStore')
    useArchiveStore = module.useArchiveStore

    // Reset store to initial state
    useArchiveStore.setState({ archivedSessions: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty archivedSessions array', () => {
      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toEqual([])
    })
  })

  describe('archiveSession', () => {
    it('should archive a single session', () => {
      const { archiveSession } = useArchiveStore.getState()
      const session = createMockSession({ id: 'test-1' })

      act(() => {
        archiveSession(session)
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(1)
      expect(state.archivedSessions[0].id).toBe('test-1')
    })

    it('should preserve all session properties', () => {
      const { archiveSession } = useArchiveStore.getState()
      const session = createMockSession({
        id: 'test-1',
        mode: 'Countdown',
        sessionName: 'Focus Session',
        duration: 1500000,
        targetTime: 1800000,
      })

      act(() => {
        archiveSession(session)
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions[0]).toMatchObject({
        mode: 'Countdown',
        sessionName: 'Focus Session',
        duration: 1500000,
        targetTime: 1800000,
      })
    })

    it('should archive multiple sessions sequentially', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
        archiveSession(createMockSession({ id: 'test-2' }))
        archiveSession(createMockSession({ id: 'test-3' }))
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(3)
    })
  })

  describe('archiveSessions', () => {
    it('should archive multiple sessions at once', () => {
      const { archiveSessions } = useArchiveStore.getState()
      const sessions = [
        createMockSession({ id: 'test-1' }),
        createMockSession({ id: 'test-2' }),
      ]

      act(() => {
        archiveSessions(sessions)
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(2)
    })
  })

  describe('restoreSession', () => {
    it('should restore and remove session from archive', () => {
      const { archiveSession, restoreSession } = useArchiveStore.getState()
      const session = createMockSession({ id: 'test-1' })

      act(() => {
        archiveSession(session)
      })

      let restored: ArchivedSession | null = null
      act(() => {
        restored = useArchiveStore.getState().restoreSession('test-1')
      })

      const state = useArchiveStore.getState()
      expect(restored).not.toBeNull()
      expect(restored?.id).toBe('test-1')
      expect(state.archivedSessions).toHaveLength(0)
    })

    it('should return null for non-existent session', () => {
      const { restoreSession } = useArchiveStore.getState()

      let restored: ArchivedSession | null = null
      act(() => {
        restored = restoreSession('non-existent')
      })

      expect(restored).toBeNull()
    })

    it('should not affect other sessions when restoring one', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
        archiveSession(createMockSession({ id: 'test-2' }))
      })

      act(() => {
        useArchiveStore.getState().restoreSession('test-1')
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(1)
      expect(state.archivedSessions[0].id).toBe('test-2')
    })
  })

  describe('restoreSessions', () => {
    it('should restore multiple sessions at once', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
        archiveSession(createMockSession({ id: 'test-2' }))
        archiveSession(createMockSession({ id: 'test-3' }))
      })

      let restored: ArchivedSession[] = []
      act(() => {
        restored = useArchiveStore.getState().restoreSessions(['test-1', 'test-3'])
      })

      const state = useArchiveStore.getState()
      expect(restored).toHaveLength(2)
      expect(state.archivedSessions).toHaveLength(1)
      expect(state.archivedSessions[0].id).toBe('test-2')
    })
  })

  describe('deleteArchivedSession', () => {
    it('should permanently delete a session', () => {
      const { archiveSession, deleteArchivedSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
      })

      act(() => {
        deleteArchivedSession('test-1')
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(0)
    })

    it('should handle deleting non-existent session gracefully', () => {
      const { deleteArchivedSession } = useArchiveStore.getState()

      act(() => {
        deleteArchivedSession('non-existent')
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(0)
    })
  })

  describe('deleteArchivedSessions', () => {
    it('should delete multiple sessions at once', () => {
      const { archiveSession, deleteArchivedSessions } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
        archiveSession(createMockSession({ id: 'test-2' }))
        archiveSession(createMockSession({ id: 'test-3' }))
      })

      act(() => {
        deleteArchivedSessions(['test-1', 'test-2'])
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(1)
      expect(state.archivedSessions[0].id).toBe('test-3')
    })
  })

  describe('bulkArchive', () => {
    it('should archive multiple sessions in bulk', () => {
      const { bulkArchive } = useArchiveStore.getState()
      const sessions = [
        createMockSession({ id: 'bulk-1' }),
        createMockSession({ id: 'bulk-2' }),
        createMockSession({ id: 'bulk-3' }),
      ]

      act(() => {
        bulkArchive(sessions)
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(3)
    })
  })

  describe('bulkDelete', () => {
    it('should delete multiple sessions in bulk', () => {
      const { bulkArchive, bulkDelete } = useArchiveStore.getState()

      act(() => {
        bulkArchive([
          createMockSession({ id: 'bulk-1' }),
          createMockSession({ id: 'bulk-2' }),
          createMockSession({ id: 'bulk-3' }),
        ])
      })

      act(() => {
        bulkDelete(['bulk-1', 'bulk-3'])
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(1)
      expect(state.archivedSessions[0].id).toBe('bulk-2')
    })
  })

  describe('clearArchive', () => {
    it('should remove all archived sessions', () => {
      const { archiveSession, clearArchive } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1' }))
        archiveSession(createMockSession({ id: 'test-2' }))
      })

      act(() => {
        clearArchive()
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(0)
    })

    it('should handle clearing empty archive', () => {
      const { clearArchive } = useArchiveStore.getState()

      act(() => {
        clearArchive()
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions).toHaveLength(0)
    })
  })

  describe('getArchivedSession', () => {
    it('should return session by id', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1', sessionName: 'My Session' }))
      })

      const { getArchivedSession } = useArchiveStore.getState()
      const session = getArchivedSession('test-1')

      expect(session).toBeDefined()
      expect(session?.sessionName).toBe('My Session')
    })

    it('should return undefined for non-existent session', () => {
      const { getArchivedSession } = useArchiveStore.getState()
      const session = getArchivedSession('non-existent')

      expect(session).toBeUndefined()
    })
  })

  describe('getArchivedByMode', () => {
    it('should filter sessions by mode', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1', mode: 'Stopwatch' }))
        archiveSession(createMockSession({ id: 'test-2', mode: 'Countdown' }))
        archiveSession(createMockSession({ id: 'test-3', mode: 'Stopwatch' }))
        archiveSession(createMockSession({ id: 'test-4', mode: 'Intervals' }))
      })

      const { getArchivedByMode } = useArchiveStore.getState()
      const stopwatchSessions = getArchivedByMode('Stopwatch')

      expect(stopwatchSessions).toHaveLength(2)
      expect(stopwatchSessions.every(s => s.mode === 'Stopwatch')).toBe(true)
    })

    it('should return empty array when no sessions match mode', () => {
      const { archiveSession, getArchivedByMode } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ mode: 'Stopwatch' }))
      })

      const sessions = getArchivedByMode('Countdown')
      expect(sessions).toHaveLength(0)
    })
  })

  describe('getArchivedByDateRange', () => {
    it('should filter sessions within date range', () => {
      const { archiveSession } = useArchiveStore.getState()
      const now = Date.now()

      act(() => {
        archiveSession(createMockSession({ id: 'test-1', timestamp: now - 86400000 * 5 })) // 5 days ago
        archiveSession(createMockSession({ id: 'test-2', timestamp: now - 86400000 * 2 })) // 2 days ago
        archiveSession(createMockSession({ id: 'test-3', timestamp: now })) // today
      })

      const { getArchivedByDateRange } = useArchiveStore.getState()
      const start = new Date(now - 86400000 * 3) // 3 days ago
      const end = new Date(now + 86400000) // tomorrow

      const sessions = getArchivedByDateRange(start, end)
      expect(sessions).toHaveLength(2)
    })

    it('should return empty array when no sessions in range', () => {
      const { archiveSession, getArchivedByDateRange } = useArchiveStore.getState()
      const now = Date.now()

      act(() => {
        archiveSession(createMockSession({ timestamp: now }))
      })

      const start = new Date(now - 86400000 * 10)
      const end = new Date(now - 86400000 * 5)

      const sessions = getArchivedByDateRange(start, end)
      expect(sessions).toHaveLength(0)
    })
  })

  describe('searchArchived / searchArchive', () => {
    it('should search by session name', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ sessionName: 'Morning Focus' }))
        archiveSession(createMockSession({ sessionName: 'Evening Study' }))
        archiveSession(createMockSession({ sessionName: 'Focus Time' }))
      })

      const { searchArchived } = useArchiveStore.getState()
      const results = searchArchived('focus')

      expect(results).toHaveLength(2)
    })

    it('should search by mode', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ mode: 'Stopwatch', sessionName: 'Test' }))
        archiveSession(createMockSession({ mode: 'Countdown', sessionName: 'Test' }))
      })

      const { searchArchive } = useArchiveStore.getState()
      const results = searchArchive('stopwatch')

      expect(results).toHaveLength(1)
    })

    it('should be case insensitive', () => {
      const { archiveSession, searchArchived } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ sessionName: 'FOCUS SESSION' }))
      })

      const results = searchArchived('focus')
      expect(results).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      const { archiveSession, searchArchived } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ sessionName: 'Test' }))
      })

      const results = searchArchived('xyz')
      expect(results).toHaveLength(0)
    })
  })

  describe('filterByMode', () => {
    it('should filter by mode (alias for getArchivedByMode)', () => {
      const { archiveSession, filterByMode } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ mode: 'Intervals' }))
        archiveSession(createMockSession({ mode: 'Stopwatch' }))
      })

      const results = filterByMode('Intervals')
      expect(results).toHaveLength(1)
      expect(results[0].mode).toBe('Intervals')
    })
  })

  describe('Edge Cases', () => {
    it('should handle sessions with no sessionName', () => {
      const { archiveSession, searchArchived } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({ sessionName: undefined }))
      })

      const results = searchArchived('test')
      expect(results).toHaveLength(0)
    })

    it('should handle Intervals mode with all optional fields', () => {
      const { archiveSession } = useArchiveStore.getState()

      act(() => {
        archiveSession(createMockSession({
          mode: 'Intervals',
          workTime: 1500000,
          breakTime: 300000,
          cycles: 4,
          lapCount: 8,
        }))
      })

      const state = useArchiveStore.getState()
      expect(state.archivedSessions[0].workTime).toBe(1500000)
      expect(state.archivedSessions[0].breakTime).toBe(300000)
      expect(state.archivedSessions[0].cycles).toBe(4)
    })
  })
})
