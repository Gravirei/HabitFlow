/**
 * Archive Utilities
 * Helper functions for archive operations
 */

import type { ArchivedSession } from './archiveStore'

/**
 * Convert timer history record to archived session
 */
export function convertToArchivedSession(
  record: any,
  originalStorage: 'stopwatch' | 'countdown' | 'intervals'
): ArchivedSession {
  return {
    id: record.id,
    mode: record.mode,
    sessionName: record.sessionName,
    timestamp: record.timestamp,
    duration: record.duration,
    archivedAt: Date.now(),
    originalStorage,
    targetTime: record.targetTime,
    lapCount: record.lapCount,
    workTime: record.workTime,
    breakTime: record.breakTime,
    cycles: record.cycles,
  }
}

/**
 * Convert archived session back to history record format
 */
export function convertFromArchivedSession(session: ArchivedSession): any {
  const baseRecord = {
    id: session.id,
    mode: session.mode,
    sessionName: session.sessionName,
    timestamp: session.timestamp,
    duration: session.duration,
  }

  // Add mode-specific fields
  if (session.mode === 'Countdown' && session.targetTime) {
    return { ...baseRecord, targetTime: session.targetTime }
  }

  if (session.mode === 'Stopwatch' && session.lapCount !== undefined) {
    return { ...baseRecord, lapCount: session.lapCount }
  }

  if (session.mode === 'Intervals') {
    return {
      ...baseRecord,
      workTime: session.workTime,
      breakTime: session.breakTime,
      cycles: session.cycles,
    }
  }

  return baseRecord
}

/**
 * Get archive statistics
 */
export function getArchiveStats(archivedSessions: ArchivedSession[]) {
  const total = archivedSessions.length
  const totalDuration = archivedSessions.reduce((sum, s) => sum + s.duration, 0)
  
  const byMode = {
    stopwatch: archivedSessions.filter((s) => s.mode === 'Stopwatch').length,
    countdown: archivedSessions.filter((s) => s.mode === 'Countdown').length,
    intervals: archivedSessions.filter((s) => s.mode === 'Intervals').length,
  }

  // Find oldest and newest archived
  const sortedByArchiveDate = [...archivedSessions].sort((a, b) => a.archivedAt - b.archivedAt)
  const oldest = sortedByArchiveDate[0]
  const newest = sortedByArchiveDate[sortedByArchiveDate.length - 1]

  return {
    total,
    totalDuration,
    byMode,
    oldest: oldest ? new Date(oldest.archivedAt) : null,
    newest: newest ? new Date(newest.archivedAt) : null,
  }
}

/**
 * Format archive size in human-readable format
 */
export function formatArchiveSize(sessions: ArchivedSession[]): string {
  const sizeInBytes = JSON.stringify(sessions).length
  const sizeInKB = sizeInBytes / 1024

  if (sizeInKB < 1) {
    return `${sizeInBytes} bytes`
  } else if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(1)} KB`
  } else {
    return `${(sizeInKB / 1024).toFixed(1)} MB`
  }
}

/**
 * Check if session is old enough to archive (default: 90 days)
 */
export function isOldEnough(timestamp: number, daysThreshold: number = 90): boolean {
  const now = Date.now()
  const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24)
  return daysDiff >= daysThreshold
}

/**
 * Get sessions older than specified days
 */
export function getOldSessions(sessions: any[], daysThreshold: number): any[] {
  return sessions.filter((s) => isOldEnough(s.timestamp, daysThreshold))
}
