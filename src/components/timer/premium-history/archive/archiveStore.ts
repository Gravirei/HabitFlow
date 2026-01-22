/**
 * Archive Store
 * State management for archived sessions using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ArchivedSession {
  id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  sessionName?: string
  timestamp: number
  duration: number
  archivedAt: number
  originalStorage: 'stopwatch' | 'countdown' | 'intervals'
  targetTime?: number
  lapCount?: number
  workTime?: number
  breakTime?: number
  cycles?: number
}

interface ArchiveState {
  archivedSessions: ArchivedSession[]
  archiveSession: (session: ArchivedSession) => void
  archiveSessions: (sessions: ArchivedSession[]) => void
  restoreSession: (sessionId: string) => ArchivedSession | null
  restoreSessions: (sessionIds: string[]) => ArchivedSession[]
  deleteArchivedSession: (sessionId: string) => void
  deleteArchivedSessions: (sessionIds: string[]) => void
  bulkArchive: (sessions: ArchivedSession[]) => void
  bulkDelete: (sessionIds: string[]) => void
  clearArchive: () => void
  getArchivedSession: (sessionId: string) => ArchivedSession | undefined
  getArchivedByMode: (mode: string) => ArchivedSession[]
  getArchivedByDateRange: (start: Date, end: Date) => ArchivedSession[]
  searchArchived: (query: string) => ArchivedSession[]
  searchArchive: (query: string) => ArchivedSession[]
  filterByMode: (mode: string) => ArchivedSession[]
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      archivedSessions: [],

      /**
       * Archive a single session
       */
      archiveSession: (session) => {
        set((state) => ({
          archivedSessions: [...state.archivedSessions, session],
        }))
      },

      /**
       * Archive multiple sessions (alias for bulkArchive)
       */
      archiveSessions: (sessions) => {
        set((state) => ({
          archivedSessions: [...state.archivedSessions, ...sessions],
        }))
      },

      /**
       * Restore a session from archive
       */
      restoreSession: (sessionId) => {
        const session = get().archivedSessions.find((s) => s.id === sessionId)
        if (!session) return null

        // Remove from archive
        set((state) => ({
          archivedSessions: state.archivedSessions.filter((s) => s.id !== sessionId),
        }))

        return session
      },

      /**
       * Restore multiple sessions from archive
       */
      restoreSessions: (sessionIds) => {
        const sessions = get().archivedSessions.filter((s) => sessionIds.includes(s.id))
        
        // Remove from archive
        set((state) => ({
          archivedSessions: state.archivedSessions.filter((s) => !sessionIds.includes(s.id)),
        }))

        return sessions
      },

      /**
       * Permanently delete an archived session
       */
      deleteArchivedSession: (sessionId) => {
        set((state) => ({
          archivedSessions: state.archivedSessions.filter((s) => s.id !== sessionId),
        }))
      },

      /**
       * Permanently delete multiple archived sessions
       */
      deleteArchivedSessions: (sessionIds) => {
        set((state) => ({
          archivedSessions: state.archivedSessions.filter((s) => !sessionIds.includes(s.id)),
        }))
      },

      /**
       * Bulk archive multiple sessions
       */
      bulkArchive: (sessions) => {
        set((state) => ({
          archivedSessions: [...state.archivedSessions, ...sessions],
        }))
      },

      /**
       * Bulk delete multiple archived sessions
       */
      bulkDelete: (sessionIds) => {
        set((state) => ({
          archivedSessions: state.archivedSessions.filter(
            (s) => !sessionIds.includes(s.id)
          ),
        }))
      },

      /**
       * Clear entire archive
       */
      clearArchive: () => {
        set({ archivedSessions: [] })
      },

      /**
       * Get archived session by ID
       */
      getArchivedSession: (sessionId) => {
        return get().archivedSessions.find((s) => s.id === sessionId)
      },

      /**
       * Get archived sessions by mode
       */
      getArchivedByMode: (mode) => {
        return get().archivedSessions.filter((s) => s.mode === mode)
      },

      /**
       * Get archived sessions by date range
       */
      getArchivedByDateRange: (start, end) => {
        const startTime = start.getTime()
        const endTime = end.getTime()
        return get().archivedSessions.filter(
          (s) => s.timestamp >= startTime && s.timestamp <= endTime
        )
      },

      /**
       * Search archived sessions
       */
      searchArchived: (query) => {
        const lowerQuery = query.toLowerCase()
        return get().archivedSessions.filter((s) => {
          const sessionName = s.sessionName?.toLowerCase() || ''
          const mode = s.mode.toLowerCase()
          return sessionName.includes(lowerQuery) || mode.includes(lowerQuery)
        })
      },

      /**
       * Search archive (alias for searchArchived)
       */
      searchArchive: (query) => {
        const lowerQuery = query.toLowerCase()
        return get().archivedSessions.filter((s) => {
          const sessionName = s.sessionName?.toLowerCase() || ''
          const mode = s.mode.toLowerCase()
          return sessionName.includes(lowerQuery) || mode.includes(lowerQuery)
        })
      },

      /**
       * Filter by mode (alias for getArchivedByMode)
       */
      filterByMode: (mode) => {
        return get().archivedSessions.filter((s) => s.mode === mode)
      },
    }),
    {
      name: 'timer-archive-storage',
      version: 1,
    }
  )
)
