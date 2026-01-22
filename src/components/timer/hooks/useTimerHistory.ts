/**
 * useTimerHistory Hook
 * Shared hook for managing timer history across all timer modes
 * 
 * Now uses TieredStorage for:
 * - Non-logged-in users: LocalStorage only
 * - Logged-in users: Supabase + LocalStorage cache with automatic sync
 */

import { useCallback, useMemo } from 'react'
import { useTieredStorage } from '../../../lib/storage'
import { generateUUID } from '../utils/uuid'
import { MAX_HISTORY_RECORDS } from '../constants/timer.constants'
import type { TimerMode, TimerHistoryRecord, Lap } from '../types/timer.types'
import { isValidTimerHistoryRecord, validateSessionName } from '../utils/validation'
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'
import { logger } from '../utils/logger'

interface UseTimerHistoryOptions {
  mode: TimerMode
  storageKey?: string // Now optional, kept for backward compatibility
}

/**
 * Options for saving a timer session to history
 * All durations should be in SECONDS
 */
export interface SaveHistoryOptions {
  duration: number // In seconds
  startTime?: number
  
  // Stopwatch-specific
  lapCount?: number
  bestLap?: number // In seconds
  laps?: Lap[]
  
  // Countdown-specific
  targetDuration?: number // In seconds
  completed?: boolean
  
  // Intervals-specific
  intervalCount?: number
  completedLoops?: number
  workDuration?: number // In seconds
  breakDuration?: number // In seconds
  sessionName?: string
  targetLoopCount?: number
}

interface UseTimerHistoryReturn {
  history: TimerHistoryRecord[]
  saveToHistory: (options: SaveHistoryOptions) => void
  deleteRecord: (recordId: string) => void
  clearHistory: () => void
  // New properties for sync status
  isLoading?: boolean
  isLoggedIn?: boolean
  syncStatus?: {
    isSyncing: boolean
    lastSyncTime: number | null
    pendingChanges: number
  }
}

/**
 * Custom hook for managing timer history with tiered storage
 * 
 * @param options - Configuration object with mode (storageKey is now optional)
 * @returns Object with history array and utility functions
 * 
 * Features:
 * - Automatic cloud sync for logged-in users
 * - Offline support with sync queue
 * - Data migration on first login
 * 
 * @example
 * ```tsx
 * const { saveToHistory, isLoggedIn, syncStatus } = useTimerHistory({
 *   mode: 'Stopwatch'
 * })
 * 
 * const handleKill = (save: boolean) => {
 *   const duration = killTimer()
 *   if (save) saveToHistory({ duration })
 * }
 * ```
 */
export const useTimerHistory = ({ 
  mode, 
  storageKey: _storageKey // Kept for backward compatibility but not used
}: UseTimerHistoryOptions): UseTimerHistoryReturn => {
  // Use the new tiered storage hook
  const {
    history: rawHistory,
    saveRecord,
    deleteRecord: deleteStorageRecord,
    clearHistory: clearStorageHistory,
    isLoading,
    isLoggedIn,
    syncStatus,
  } = useTieredStorage(mode)
  
  // Validate and filter history with migration for old data
  const history = useMemo(() => {
    try {
      if (!Array.isArray(rawHistory)) {
        logError(new Error('History is not an array'), 'useTimerHistory.validation')
        return []
      }
      
      // Filter out invalid records and migrate old data
      const validHistory = rawHistory.filter((record) => {
        const isValid = isValidTimerHistoryRecord(record)
        if (!isValid) {
          logger.warn('Invalid record filtered', { 
            context: 'useTimerHistory.validation',
            data: record
          })
        }
        return isValid
      }).map((record) => {
        // MIGRATION: Convert old millisecond durations to seconds
        // If duration is very large (> 86400 = 1 day in seconds), it's likely in milliseconds
        if (record.duration > 86400) {
          logger.info('Migrating old history record from milliseconds to seconds', {
            context: 'useTimerHistory.migration',
            oldDuration: record.duration,
            newDuration: Math.floor(record.duration / 1000)
          })
          return {
            ...record,
            duration: Math.floor(record.duration / 1000)
          }
        }
        return record
      }).slice(0, MAX_HISTORY_RECORDS)
      
      return validHistory
    } catch (error) {
      logError(error, 'useTimerHistory.validation')
      return []
    }
  }, [rawHistory])

  /**
   * Save a timer session to history
   * Only saves if duration is greater than 0
   * Automatically syncs to cloud for logged-in users
   *
   * @param options - SaveHistoryOptions object with duration (in SECONDS) and optional metadata
   */
  const saveToHistory = useCallback((
    options: SaveHistoryOptions
  ) => {
    logger.debug('saveToHistory called', { context: 'useTimerHistory', data: options })
    try {
      const { duration, ...metadata } = options
      
      // Validate duration
      if (duration <= 0 || isNaN(duration) || !isFinite(duration)) {
        logger.error('Invalid duration', undefined, { context: 'useTimerHistory', data: { duration } })
        logError(new Error('Invalid duration for history record'), 'useTimerHistory.saveToHistory')
        return
      }

      // Validate interval count if provided
      if (metadata.intervalCount !== undefined && (metadata.intervalCount < 0 || isNaN(metadata.intervalCount) || !isFinite(metadata.intervalCount))) {
        logger.error('Invalid interval count', undefined, { context: 'useTimerHistory', data: { intervalCount: metadata.intervalCount } })
        logError(new Error('Invalid interval count for history record'), 'useTimerHistory.saveToHistory')
        return
      }

      // Validate and sanitize session name
      const sanitizedMetadata = {
        ...metadata,
        sessionName: validateSessionName(metadata.sessionName)
      }

      const record: TimerHistoryRecord = {
        id: generateUUID(),
        mode,
        duration, // Now in SECONDS
        timestamp: Date.now(),
        ...sanitizedMetadata // Spread all optional metadata fields
      }
      
      logger.debug('Created record', { context: 'useTimerHistory', data: { id: record.id, mode: record.mode, duration: record.duration } })

      // Validate the complete record
      if (!isValidTimerHistoryRecord(record)) {
        logger.error('Record validation failed', undefined, { context: 'useTimerHistory' })
        logError(new Error('Generated invalid history record'), 'useTimerHistory.saveToHistory')
        return
      }

      // Save using tiered storage (handles both local and cloud)
      saveRecord(record)
        .then(() => {
          logger.info('Saved to history', { context: 'useTimerHistory', data: { synced: isLoggedIn } })
        })
        .catch((error) => {
          logger.error('Failed to save history', error, { context: 'useTimerHistory' })
          logError(error, 'useTimerHistory.saveToHistory', ErrorSeverity.MEDIUM, ErrorCategory.STORAGE)
        })
      
      logger.debug('saveToHistory completed', { context: 'useTimerHistory' })
    } catch (error) {
      logger.error('Error in saveToHistory', error, { context: 'useTimerHistory' })
      logError(error, 'useTimerHistory.saveToHistory', ErrorSeverity.MEDIUM, ErrorCategory.STORAGE)
      console.error('[Timer] Failed to save history:', error)
    }
  }, [mode, saveRecord, isLoggedIn])

  /**
   * Delete a specific record from history
   * Deletes from both local and cloud storage for logged-in users
   */
  const deleteRecord = useCallback((recordId: string) => {
    try {
      deleteStorageRecord(recordId)
    } catch (error) {
      logError(error, 'useTimerHistory.deleteRecord')
    }
  }, [deleteStorageRecord])

  /**
   * Clear all history records
   * Clears both local and cloud storage for logged-in users
   */
  const clearHistory = useCallback(() => {
    try {
      clearStorageHistory()
    } catch (error) {
      logError(error, 'useTimerHistory.clearHistory')
    }
  }, [clearStorageHistory])

  return {
    history,
    saveToHistory,
    deleteRecord,
    clearHistory,
    isLoading,
    isLoggedIn,
    syncStatus,
  }
}
