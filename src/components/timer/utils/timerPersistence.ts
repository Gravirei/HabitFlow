/**
 * Timer Persistence Utility
 * 
 * Handles saving and restoring timer state to/from localStorage.
 * Allows users to resume timers after browser refresh, tab close, or crash.
 * 
 * Features:
 * - Auto-save active timer state
 * - Smart time calculation (accounts for time passed while closed)
 * - State validation and corruption handling
 * - Edge case detection (completed timers, time changes)
 * - Multi-timer mode support (Countdown, Stopwatch, Intervals)
 * 
 * CRITICAL FIX: Added input validation and sanitization to prevent XSS
 * and other injection attacks from malicious localStorage data.
 * 
 * @module timerPersistence
 */

import type { TimerMode } from '../types/timer.types'
import { logger } from './logger'
import { STATE_MAX_AGE_MS } from '../constants/performance.constants'

const STORAGE_KEY = 'flowmodoro_timer_state'
const ACTIVE_TIMER_KEY = 'flowmodoro_active_timer'
const REPEAT_SESSION_KEY = 'flowmodoro_repeat_session'
const MAX_AGE_MS = STATE_MAX_AGE_MS

// Valid timer modes (whitelist for validation)
const VALID_TIMER_MODES: TimerMode[] = ['Countdown', 'Stopwatch', 'Intervals']
const VALID_INTERVAL_TYPES = ['work', 'break'] as const

// Maximum safe values to prevent memory/performance issues
const MAX_SAFE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in ms
const MAX_SAFE_LOOP_COUNT = 1000
const MAX_SAFE_LAP_COUNT = 10000
const MAX_STRING_LENGTH = 500 // For session names, etc.

/**
 * Sanitizes a string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove potential script injection patterns
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  sanitized = sanitized.replace(/data:/gi, '')
  
  // Encode special HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
  
  // Truncate to max length
  return sanitized.slice(0, MAX_STRING_LENGTH)
}

/**
 * Validates and sanitizes a number value
 */
function sanitizeNumber(input: unknown, min: number, max: number, defaultValue: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    return defaultValue
  }
  return Math.max(min, Math.min(max, input))
}

/**
 * Validates that a value is a safe timestamp
 */
function isValidTimestamp(value: unknown): value is number {
  if (typeof value !== 'number') return false
  if (!Number.isFinite(value)) return false
  // Timestamp should be reasonable (between year 2000 and 2100)
  const minTimestamp = 946684800000 // Jan 1, 2000
  const maxTimestamp = 4102444800000 // Jan 1, 2100
  return value >= minTimestamp && value <= maxTimestamp
}

/**
 * Validates timer mode is in whitelist
 */
function isValidTimerMode(mode: unknown): mode is TimerMode {
  return typeof mode === 'string' && VALID_TIMER_MODES.includes(mode as TimerMode)
}

/**
 * Lap data for Stopwatch mode
 */
export interface LapData {
  id: string
  time: number
  timestamp: number
}

/**
 * Base timer state (common to all modes)
 */
interface BaseTimerState {
  mode: TimerMode
  isActive: boolean
  isPaused: boolean
  savedAt: number
  version: number // For future compatibility
}

/**
 * Countdown timer state
 */
export interface CountdownTimerState extends BaseTimerState {
  mode: 'Countdown'
  startTime: number | null
  totalDuration: number
  pausedElapsed: number
}

/**
 * Stopwatch timer state
 */
export interface StopwatchTimerState extends BaseTimerState {
  mode: 'Stopwatch'
  startTime: number | null
  pausedElapsed: number
  laps: LapData[]
}

/**
 * Intervals timer state
 */
export interface IntervalsTimerState extends BaseTimerState {
  mode: 'Intervals'
  currentLoop: number
  targetLoops?: number
  currentInterval: 'work' | 'break'
  intervalStartTime: number | null
  workDuration: number
  breakDuration: number
  pausedElapsed: number
}

/**
 * Union type for all timer states
 */
export type SavedTimerState =
  | CountdownTimerState
  | StopwatchTimerState
  | IntervalsTimerState

/**
 * Resume validation result
 */
export interface ResumeValidation {
  canResume: boolean
  reason?: string
  isCompleted?: boolean
  remainingTime?: number
}

/**
 * Repeat session configuration - used to pre-configure timer when repeating a session
 */
export interface RepeatSessionConfig {
  mode: TimerMode
  // Countdown settings
  hours?: number
  minutes?: number
  seconds?: number
  // Intervals settings
  workMinutes?: number
  breakMinutes?: number
  targetLoops?: number
  sessionName?: string
  // Metadata
  createdAt: number
}

/**
 * Timer Persistence Manager
 */
class TimerPersistence {
  private static instance: TimerPersistence
  private readonly storageKey = STORAGE_KEY
  private readonly currentVersion = 1

  private constructor() {}

  static getInstance(): TimerPersistence {
    if (!TimerPersistence.instance) {
      TimerPersistence.instance = new TimerPersistence()
    }
    return TimerPersistence.instance
  }

  /**
   * Save timer state to localStorage
   */
  saveState(state: SavedTimerState): boolean {
    try {
      const stateWithMetadata = {
        ...state,
        savedAt: Date.now(),
        version: this.currentVersion
      }

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(stateWithMetadata)
      )

      logger.persistence('State saved', { mode: state.mode })
      return true
    } catch (error) {
      logger.error('Failed to save state', error, { context: 'TimerPersistence' })
      return false
    }
  }

  /**
   * Load timer state from localStorage
   * CRITICAL FIX: Added sanitization to prevent XSS from malicious data
   */
  loadState(): SavedTimerState | null {
    try {
      const savedData = localStorage.getItem(this.storageKey)

      if (!savedData) {
        return null
      }

      // Parse with size limit check (prevent DoS from huge payloads)
      if (savedData.length > 100000) { // 100KB max
        logger.warn('State data too large, clearing', { context: 'TimerPersistence' })
        this.clearState()
        return null
      }

      const rawState = JSON.parse(savedData)

      // Validate state structure
      if (!this.isValidState(rawState)) {
        logger.warn('Invalid state structure, clearing', { context: 'TimerPersistence' })
        this.clearState()
        return null
      }

      // Sanitize the state before returning
      const sanitizedState = this.sanitizeState(rawState)
      
      if (!sanitizedState) {
        logger.warn('State sanitization failed, clearing', { context: 'TimerPersistence' })
        this.clearState()
        return null
      }

      // Check if state is too old
      if (this.isStateTooOld(sanitizedState)) {
        logger.warn('State too old, clearing', { context: 'TimerPersistence' })
        this.clearState()
        return null
      }

      logger.persistence('State loaded and sanitized', { mode: sanitizedState.mode })
      return sanitizedState
    } catch (error) {
      logger.error('Failed to load state', error, { context: 'TimerPersistence' })
      this.clearState()
      return null
    }
  }

  /**
   * Sanitizes loaded state to prevent XSS and validate all values
   * CRITICAL FIX: Ensures all loaded data is safe
   */
  private sanitizeState(state: SavedTimerState): SavedTimerState | null {
    try {
      // Validate and sanitize base fields
      if (!isValidTimerMode(state.mode)) {
        return null
      }

      if (!isValidTimestamp(state.savedAt)) {
        return null
      }

      const baseState = {
        mode: state.mode,
        isActive: Boolean(state.isActive),
        isPaused: Boolean(state.isPaused),
        savedAt: state.savedAt,
        version: sanitizeNumber(state.version, 1, 100, 1)
      }

      switch (state.mode) {
        case 'Countdown': {
          const countdownState = state as CountdownTimerState
          return {
            ...baseState,
            mode: 'Countdown' as const,
            startTime: countdownState.startTime !== null && isValidTimestamp(countdownState.startTime) 
              ? countdownState.startTime 
              : null,
            totalDuration: sanitizeNumber(countdownState.totalDuration, 0, MAX_SAFE_DURATION, 0),
            pausedElapsed: sanitizeNumber(countdownState.pausedElapsed, 0, MAX_SAFE_DURATION, 0)
          }
        }

        case 'Stopwatch': {
          const stopwatchState = state as StopwatchTimerState
          // Sanitize laps array
          const sanitizedLaps: LapData[] = []
          if (Array.isArray(stopwatchState.laps)) {
            for (const lap of stopwatchState.laps.slice(0, MAX_SAFE_LAP_COUNT)) {
              if (lap && typeof lap === 'object') {
                sanitizedLaps.push({
                  id: sanitizeString(lap.id) || String(sanitizedLaps.length + 1),
                  time: sanitizeNumber(lap.time, 0, MAX_SAFE_DURATION, 0),
                  timestamp: isValidTimestamp(lap.timestamp) ? lap.timestamp : Date.now()
                })
              }
            }
          }
          return {
            ...baseState,
            mode: 'Stopwatch' as const,
            startTime: stopwatchState.startTime !== null && isValidTimestamp(stopwatchState.startTime)
              ? stopwatchState.startTime
              : null,
            pausedElapsed: sanitizeNumber(stopwatchState.pausedElapsed, 0, MAX_SAFE_DURATION, 0),
            laps: sanitizedLaps
          }
        }

        case 'Intervals': {
          const intervalsState = state as IntervalsTimerState
          const currentInterval = VALID_INTERVAL_TYPES.includes(intervalsState.currentInterval as any)
            ? intervalsState.currentInterval
            : 'work'
          
          return {
            ...baseState,
            mode: 'Intervals' as const,
            currentLoop: sanitizeNumber(intervalsState.currentLoop, 0, MAX_SAFE_LOOP_COUNT, 0),
            targetLoops: intervalsState.targetLoops !== undefined 
              ? sanitizeNumber(intervalsState.targetLoops, 1, MAX_SAFE_LOOP_COUNT, 4)
              : undefined,
            currentInterval: currentInterval as 'work' | 'break',
            intervalStartTime: intervalsState.intervalStartTime !== null && isValidTimestamp(intervalsState.intervalStartTime)
              ? intervalsState.intervalStartTime
              : null,
            workDuration: sanitizeNumber(intervalsState.workDuration, 0, MAX_SAFE_DURATION, 25 * 60 * 1000),
            breakDuration: sanitizeNumber(intervalsState.breakDuration, 0, MAX_SAFE_DURATION, 5 * 60 * 1000),
            pausedElapsed: sanitizeNumber(intervalsState.pausedElapsed, 0, MAX_SAFE_DURATION, 0)
          }
        }

        default:
          return null
      }
    } catch (error) {
      logger.error('State sanitization error', error, { context: 'TimerPersistence' })
      return null
    }
  }

  /**
   * Clear saved state
   */
  clearState(): void {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(ACTIVE_TIMER_KEY)
      logger.persistence('State cleared')
    } catch (error) {
      logger.error('Failed to clear state', error, { context: 'TimerPersistence' })
    }
  }

  /**
   * Save active timer mode (for route persistence)
   */
  saveActiveTimer(mode: TimerMode): void {
    try {
      localStorage.setItem(ACTIVE_TIMER_KEY, mode)
      logger.persistence('Active timer saved', { mode })
    } catch (error) {
      logger.error('Failed to save active timer', error, { context: 'TimerPersistence' })
    }
  }

  /**
   * Get saved active timer mode
   * CRITICAL FIX: Validates mode against whitelist to prevent injection
   */
  getActiveTimer(): TimerMode | null {
    try {
      const mode = localStorage.getItem(ACTIVE_TIMER_KEY)
      
      // Validate against whitelist (prevent arbitrary string injection)
      if (mode && isValidTimerMode(mode)) {
        return mode
      }
      
      // If invalid mode found, clear it
      if (mode) {
        logger.warn('Invalid active timer mode found, clearing', { context: 'TimerPersistence' })
        this.clearActiveTimer()
      }
      
      return null
    } catch (error) {
      logger.error('Failed to get active timer', error, { context: 'TimerPersistence' })
      return null
    }
  }

  /**
   * Clear saved active timer
   */
  clearActiveTimer(): void {
    try {
      localStorage.removeItem(ACTIVE_TIMER_KEY)
      logger.persistence('Active timer cleared')
    } catch (error) {
      logger.error('Failed to clear active timer', error, { context: 'TimerPersistence' })
    }
  }

  /**
   * Check if a saved state exists
   */
  hasState(): boolean {
    return localStorage.getItem(this.storageKey) !== null
  }

  /**
   * Validate state structure
   */
  private isValidState(state: unknown): state is SavedTimerState {
    if (!state || typeof state !== 'object') {
      return false
    }
    const s = state as Record<string, unknown>

    // Check required base fields
    if (
      !s.mode ||
      typeof s.isActive !== 'boolean' ||
      typeof s.isPaused !== 'boolean' ||
      typeof s.savedAt !== 'number'
    ) {
      return false
    }

    // Validate mode-specific fields
    switch (s.mode) {
      case 'Countdown':
        return (
          typeof s.totalDuration === 'number' &&
          typeof s.pausedElapsed === 'number'
        )

      case 'Stopwatch':
        return (
          typeof s.pausedElapsed === 'number' &&
          Array.isArray(s.laps)
        )

      case 'Intervals':
        return (
          typeof s.currentLoop === 'number' &&
          (s.targetLoops === undefined || typeof s.targetLoops === 'number') &&
          (s.currentInterval === 'work' ||
            s.currentInterval === 'break') &&
          typeof s.workDuration === 'number' &&
          typeof s.breakDuration === 'number' &&
          typeof s.pausedElapsed === 'number'
        )

      default:
        return false
    }
  }

  /**
   * Check if state is too old (older than MAX_AGE_MS)
   */
  private isStateTooOld(state: SavedTimerState): boolean {
    const now = Date.now()
    const age = now - state.savedAt

    return age > MAX_AGE_MS || age < 0 // Also check for negative (system time changed)
  }

  /**
   * Validate if timer can be resumed
   */
  validateResume(state: SavedTimerState): ResumeValidation {
    const now = Date.now()

    // Check for suspicious time jumps
    const timeSinceSave = now - state.savedAt
    if (timeSinceSave < 0) {
      return {
        canResume: false,
        reason: 'System time was changed (went backwards)'
      }
    }

    if (timeSinceSave > 24 * 60 * 60 * 1000) {
      return {
        canResume: false,
        reason: 'Timer is more than 24 hours old'
      }
    }

    // Mode-specific validation
    switch (state.mode) {
      case 'Countdown':
        return this.validateCountdownResume(state as CountdownTimerState)

      case 'Stopwatch':
        // Stopwatch can always resume (just continues counting)
        return { canResume: true }

      case 'Intervals':
        return this.validateIntervalsResume(state as IntervalsTimerState)

      default:
        return {
          canResume: false,
          reason: 'Unknown timer mode'
        }
    }
  }

  /**
   * Validate Countdown timer resume
   */
  private validateCountdownResume(
    state: CountdownTimerState
  ): ResumeValidation {
    if (!state.startTime) {
      return { canResume: false, reason: 'No start time recorded' }
    }

    const now = Date.now()
    const elapsed = now - state.startTime + state.pausedElapsed
    const remaining = state.totalDuration - elapsed

    if (remaining <= 0) {
      return {
        canResume: false,
        reason: 'Timer already completed',
        isCompleted: true,
        remainingTime: 0
      }
    }

    return {
      canResume: true,
      remainingTime: remaining
    }
  }

  /**
   * Validate Intervals timer resume
   */
  private validateIntervalsResume(
    state: IntervalsTimerState
  ): ResumeValidation {
    if (!state.intervalStartTime) {
      return { canResume: false, reason: 'No interval start time recorded' }
    }

    const now = Date.now()
    const intervalDuration =
      state.currentInterval === 'work'
        ? state.workDuration
        : state.breakDuration

    const elapsed = now - state.intervalStartTime + state.pausedElapsed
    const remaining = intervalDuration - elapsed

    // Check if current interval completed
    if (remaining <= 0) {
      // Check if entire session completed
      if (
        state.currentInterval === 'break' &&
        state.targetLoops !== undefined &&
        state.currentLoop >= state.targetLoops
      ) {
        return {
          canResume: false,
          reason: 'Session already completed',
          isCompleted: true,
          remainingTime: 0
        }
      }

      // Still can resume - will start next interval
      return {
        canResume: true,
        remainingTime: 0
      }
    }

    return {
      canResume: true,
      remainingTime: remaining
    }
  }

  /**
   * Get human-readable time since save
   */
  getTimeSinceSave(state: SavedTimerState): string {
    const now = Date.now()
    const elapsed = now - state.savedAt

    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }

  /**
   * Format remaining time for display
   */
  formatRemainingTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  /**
   * Get user-friendly description of saved timer
   */
  getTimerDescription(state: SavedTimerState): string {
    const validation = this.validateResume(state)

    switch (state.mode) {
      case 'Countdown':
        if (validation.isCompleted) {
          return 'Timer completed while you were away'
        }
        if (validation.remainingTime) {
          return `${this.formatRemainingTime(validation.remainingTime)} remaining`
        }
        return 'Countdown timer'

      case 'Stopwatch':
        if (state.isPaused) {
          return 'Stopwatch paused'
        }
        return 'Stopwatch running'

      case 'Intervals': {
        if (validation.isCompleted) {
          return 'Session completed while you were away'
        }
        const intervalType =
          (state as IntervalsTimerState).currentInterval === 'work'
            ? 'Work'
            : 'Break'
        return `${intervalType} interval - Loop ${(state as IntervalsTimerState).currentLoop}/${(state as IntervalsTimerState).targetLoops}`
      }

      default:
        return 'Timer'
    }
  }

  /**
   * Save a repeat session configuration
   * Used when user wants to repeat a previous session with same settings
   */
  saveRepeatSession(config: RepeatSessionConfig): boolean {
    try {
      // Validate mode
      if (!isValidTimerMode(config.mode)) {
        logger.warn('Invalid repeat session mode', { context: 'TimerPersistence' })
        return false
      }

      const configWithTimestamp = {
        ...config,
        createdAt: Date.now()
      }

      localStorage.setItem(REPEAT_SESSION_KEY, JSON.stringify(configWithTimestamp))
      logger.persistence('Repeat session saved', { mode: config.mode })
      return true
    } catch (error) {
      logger.error('Failed to save repeat session', error, { context: 'TimerPersistence' })
      return false
    }
  }

  /**
   * Load and consume repeat session configuration
   * Returns null if no repeat session is pending
   * Automatically clears the config after loading (one-time use)
   */
  loadRepeatSession(): RepeatSessionConfig | null {
    try {
      const savedData = localStorage.getItem(REPEAT_SESSION_KEY)
      
      if (!savedData) {
        return null
      }

      const config = JSON.parse(savedData) as RepeatSessionConfig

      // Validate mode
      if (!isValidTimerMode(config.mode)) {
        this.clearRepeatSession()
        return null
      }

      // Check if config is too old (5 minutes max)
      const MAX_REPEAT_AGE = 5 * 60 * 1000
      if (Date.now() - config.createdAt > MAX_REPEAT_AGE) {
        logger.warn('Repeat session expired', { context: 'TimerPersistence' })
        this.clearRepeatSession()
        return null
      }

      // Clear after reading (one-time use)
      this.clearRepeatSession()
      
      logger.persistence('Repeat session loaded', { mode: config.mode })
      return config
    } catch (error) {
      logger.error('Failed to load repeat session', error, { context: 'TimerPersistence' })
      this.clearRepeatSession()
      return null
    }
  }

  /**
   * Clear repeat session configuration
   */
  clearRepeatSession(): void {
    try {
      localStorage.removeItem(REPEAT_SESSION_KEY)
    } catch (error) {
      logger.error('Failed to clear repeat session', error, { context: 'TimerPersistence' })
    }
  }

  /**
   * Check if there's a pending repeat session for a specific mode
   */
  hasRepeatSession(mode?: TimerMode): boolean {
    try {
      const savedData = localStorage.getItem(REPEAT_SESSION_KEY)
      if (!savedData) return false
      
      const config = JSON.parse(savedData) as RepeatSessionConfig
      
      // Check expiry
      const MAX_REPEAT_AGE = 5 * 60 * 1000
      if (Date.now() - config.createdAt > MAX_REPEAT_AGE) {
        this.clearRepeatSession()
        return false
      }
      
      if (mode) {
        return config.mode === mode
      }
      return true
    } catch {
      return false
    }
  }
}

/**
 * Export singleton instance
 */
export const timerPersistence = TimerPersistence.getInstance()

/**
 * Export class for testing
 */
export { TimerPersistence }

/**
 * Helper functions for compatibility with tests
 */
export const loadTimerState = () => timerPersistence.loadState()
export const saveTimerState = (state: SavedTimerState) => timerPersistence.saveState(state)
export const clearTimerState = () => timerPersistence.clearState()
