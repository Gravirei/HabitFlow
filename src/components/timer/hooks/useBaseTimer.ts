/**
 * useBaseTimer Hook
 * Shared timer logic and state management for all timer modes
 * Eliminates ~200 lines of duplicate code across useCountdown, useStopwatch, and useIntervals
 */

import { useState, useCallback } from 'react'
import { useTimerSettings } from './useTimerSettings'
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'
import { logger } from '../utils/logger'

/**
 * Helper to get current time (works with both real Date.now and vitest's fake timers)
 * This function is used across all timer modes to ensure consistent time handling
 */
export const getCurrentTime = (): number => {
  // Check if we're in a test environment with fake timers
  // Use globalThis which is available in all environments
  const globalObj = globalThis as any
  if (globalObj.vi && typeof globalObj.vi.now === 'function') {
    return globalObj.vi.now()
  }
  return Date.now()
}

interface UseBaseTimerOptions {
  mode: 'Countdown' | 'Stopwatch' | 'Intervals'
  onPause?: () => void     // Optional hook for mode-specific pause logic
  onResume?: () => void    // Optional hook for mode-specific resume logic
  onKill?: () => void      // Optional hook for mode-specific kill logic
}

export interface UseBaseTimerReturn {
  // State
  isActive: boolean
  isPaused: boolean
  timerStartTime: number | null
  pausedElapsed: number
  
  // Setters (exposed for mode-specific logic)
  setIsActive: (active: boolean) => void
  setIsPaused: (paused: boolean) => void
  setTimerStartTime: (time: number | null) => void
  setPausedElapsed: (elapsed: number) => void
  
  // Shared methods
  pauseTimer: () => void
  continueTimer: () => void
  killTimer: () => number
  getCurrentTime: () => number
  
  // Settings
  settings: ReturnType<typeof useTimerSettings>['settings']
}

/**
 * Base timer hook that provides shared state and methods
 * Used by useCountdown, useStopwatch, and useIntervals to eliminate code duplication
 */
export const useBaseTimer = (options: UseBaseTimerOptions): UseBaseTimerReturn => {
  const { mode, onPause, onResume, onKill } = options
  const { settings } = useTimerSettings()
  
  // Shared state across all timer modes
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [pausedElapsed, setPausedElapsed] = useState(0)

  /**
   * Pause the timer
   * Calculates elapsed time and stores it for resume
   */
  const pauseTimer = useCallback(() => {
    // Prevent pausing if not running
    if (!isActive) {
      logger.warn('Cannot pause: timer is not running', { context: `${mode}.pauseTimer` })
      return
    }
    
    try {
      if (timerStartTime !== null) {
        const now = getCurrentTime()
        const elapsed = now - timerStartTime
        setPausedElapsed(elapsed)
        setTimerStartTime(null)
      }
      setIsActive(false)
      setIsPaused(true)
      
      // Call mode-specific pause hook if provided
      if (onPause) {
        onPause()
      }
    } catch (error) {
      logError(error, `${mode}.pauseTimer`)
    }
  }, [timerStartTime, isActive, mode, onPause])

  /**
   * Resume the timer after pause
   * Adjusts start time to account for paused duration
   */
  const continueTimer = useCallback(() => {
    // Prevent resuming if not paused
    if (!isPaused) {
      logger.warn('Cannot resume: timer is not paused', { context: `${mode}.continueTimer` })
      return
    }
    
    try {
      const now = getCurrentTime()
      // When continuing, adjust the start time to account for paused elapsed time
      setTimerStartTime(now - pausedElapsed)
      setIsActive(true)
      setIsPaused(false)
      
      // Call mode-specific resume hook if provided
      if (onResume) {
        onResume()
      }
    } catch (error) {
      logError(error, `${mode}.continueTimer`)
    }
  }, [pausedElapsed, isPaused, mode, onResume])

  /**
   * Kill the timer and return elapsed time
   * Resets all state and returns the total elapsed time
   */
  const killTimer = useCallback((): number => {
    if (!isActive && !isPaused) {
      logger.warn('Cannot kill: timer is not active', { context: `${mode}.killTimer` })
      return 0
    }
    
    try {
      const now = getCurrentTime()
      const elapsed = isPaused 
        ? pausedElapsed 
        : timerStartTime !== null 
          ? now - timerStartTime 
          : 0

      setIsActive(false)
      setIsPaused(false)
      setTimerStartTime(null)
      setPausedElapsed(0)
      
      // Call mode-specific kill hook if provided
      if (onKill) {
        onKill()
      }

      return elapsed
    } catch (error) {
      logError(error, `${mode}.killTimer`)
      return 0
    }
  }, [isActive, isPaused, timerStartTime, pausedElapsed, mode, onKill])

  return {
    // State
    isActive,
    isPaused,
    timerStartTime,
    pausedElapsed,
    
    // Setters
    setIsActive,
    setIsPaused,
    setTimerStartTime,
    setPausedElapsed,
    
    // Methods
    pauseTimer,
    continueTimer,
    killTimer,
    getCurrentTime,
    
    // Settings
    settings
  }
}
