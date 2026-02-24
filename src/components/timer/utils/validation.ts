/**
 * Timer History Validation Utilities
 * Centralized validation and migration logic for timer history records
 */

import type { TimerHistoryRecord } from '../types/timer.types'
import { generateUUID } from './uuid'
import { logError, ErrorCategory, ErrorSeverity } from './errorMessages'
import { logger } from './logger'

// Security: Input length limits to prevent abuse
// Must match UI maxLength in SessionSetupModal (50 chars) and DB CHECK constraint
export const MAX_SESSION_NAME_LENGTH = 50
export const MAX_TAG_LENGTH = 50
export const MAX_TAGS_PER_SESSION = 10

/**
 * Validates and sanitizes session name
 * @param name - The session name to validate
 * @returns Sanitized name or null if invalid
 */
export const validateSessionName = (name: string | undefined): string | undefined => {
  if (!name) return undefined
  
  // Trim whitespace
  const trimmed = name.trim()
  
  // Check length
  if (trimmed.length === 0) return undefined
  if (trimmed.length > MAX_SESSION_NAME_LENGTH) {
    logger.warn('Session name exceeds max length', {
      context: 'validateSessionName',
      length: trimmed.length,
      max: MAX_SESSION_NAME_LENGTH
    })
    return trimmed.substring(0, MAX_SESSION_NAME_LENGTH)
  }
  
  return trimmed
}

/**
 * Validates tag name
 * @param tag - The tag to validate
 * @returns True if valid, false otherwise
 */
export const validateTag = (tag: string): boolean => {
  if (!tag || typeof tag !== 'string') return false
  const trimmed = tag.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_TAG_LENGTH
}

/**
 * Validates and sanitizes array of tags
 * @param tags - Array of tags to validate
 * @returns Sanitized array of valid tags
 */
export const validateTags = (tags: string[]): string[] => {
  if (!Array.isArray(tags)) return []
  
  return tags
    .filter(validateTag)
    .map(tag => tag.trim())
    .slice(0, MAX_TAGS_PER_SESSION) // Limit number of tags
}

/**
 * Validates if a record is a valid TimerHistoryRecord
 * Supports both string IDs (new) and number IDs (legacy) for migration
 */
export const isValidTimerHistoryRecord = (record: unknown): record is TimerHistoryRecord => {
  if (!record || typeof record !== 'object') {
    return false
  }
  
  const r = record as Record<string, unknown>
  
  return (
    (typeof r.id === 'string' || typeof r.id === 'number') &&
    typeof r.duration === 'number' &&
    typeof r.timestamp === 'number' &&
    (r.duration as number) >= 0 &&
    (r.timestamp as number) > 0 &&
    typeof r.mode === 'string' &&
    ['Stopwatch', 'Countdown', 'Intervals'].includes(r.mode) &&
    (r.intervalCount === undefined || typeof r.intervalCount === 'number')
  )
}

/**
 * Migrates old timer history records with number IDs to string IDs
 * Converts number IDs to UUIDs to prevent future collisions
 */
export const migrateTimerHistoryRecord = (record: unknown): TimerHistoryRecord | null => {
  if (!isValidTimerHistoryRecord(record)) {
    return null
  }

  // If ID is already a string (UUID), return as-is
  if (typeof record.id === 'string') {
    return record
  }

  // Migrate number ID to UUID
  return {
    ...record,
    id: generateUUID()
  } as TimerHistoryRecord
}

/**
 * Validates and migrates an array of timer history records
 * Filters out invalid records and migrates old number IDs to UUIDs
 * 
 * @param data - Raw data from localStorage
 * @returns Validated and migrated array of TimerHistoryRecord
 */
export const validateTimerHistory = (data: unknown): TimerHistoryRecord[] => {
  try {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      logger.warn('Invalid timer history data: not an array', { 
        context: 'validateTimerHistory',
        data: { dataType: typeof data }
      })
      return []
    }

    // Validate and migrate each record
    const validatedRecords = data
      .map((item) => migrateTimerHistoryRecord(item))
      .filter((record): record is TimerHistoryRecord => record !== null)

    // Log migration stats
    const numberIds = data.filter((r: unknown) => {
      const rec = r as Record<string, unknown>
      return rec && typeof rec.id === 'number'
    }).length
    
    if (numberIds > 0) {
      console.info(`Migrated ${numberIds} timer history records from number IDs to UUIDs`)
    }

    return validatedRecords
  } catch (error) {
    logError(
      error,
      'Failed to validate timer history',
      undefined,
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM
    )
    return []
  }
}

/**
 * Safely parses and validates timer history from localStorage
 * 
 * @param key - localStorage key
 * @param defaultValue - Default value if parsing fails
 * @returns Validated timer history array
 */
export const loadTimerHistory = (key: string, defaultValue: TimerHistoryRecord[] = []): TimerHistoryRecord[] => {
  try {
    const item = window.localStorage.getItem(key)
    if (!item) {
      return defaultValue
    }

    const parsed = JSON.parse(item)
    return validateTimerHistory(parsed)
  } catch (error) {
    logError(
      error,
      `Failed to load timer history from "${key}"`,
      { key },
      ErrorCategory.STORAGE,
      ErrorSeverity.MEDIUM
    )
    return defaultValue
  }
}
