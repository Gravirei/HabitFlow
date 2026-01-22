/**
 * useIntervals Hook
 * Manages interval timer logic and state
 * 
 * CRITICAL FIX: Added mutex-like state transition guard to prevent race conditions
 * during interval completion and switching operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { UseIntervalsReturn, IntervalType } from '../types/timer.types'
import {
  INTERVALS_UPDATE_INTERVAL,
  CIRCLE_CIRCUMFERENCE,
  MS_PER_MINUTE,
  calculateProgress,
  calculateStrokeDashoffset
} from '../constants/timer.constants'
import { useBaseTimer, getCurrentTime } from './useBaseTimer'
import { logger } from '../utils/logger'
import { logError } from '../utils/errorMessages'
import { shouldCompleteSession } from '../utils/intervalStateMachine'
import { 
  handleIntervalSessionComplete, 
  calculateSessionDuration,
  type CompletionSettings 
} from '../utils/intervalCompletionHandler'
import { calculateNextInterval } from '../utils/intervalSwitchHandler'

interface UseIntervalsOptions {
  onSessionComplete?: (duration: number, intervalCount: number, sessionName?: string, targetLoopCount?: number) => void
  onTimerComplete?: () => void // Triggered when timer naturally completes (for showing modal)
}

/**
 * State transition phases for preventing race conditions
 */
type TransitionPhase = 'idle' | 'completing' | 'switching'

export const useIntervals = (options?: UseIntervalsOptions): UseIntervalsReturn => {
  const { onSessionComplete, onTimerComplete } = options || {}
  
  // Intervals-specific state (declare before using in callbacks)
  const [intervalStartTime, setIntervalStartTime] = useState<number | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [basePausedElapsed, setBasePausedElapsed] = useState(0)
  const [totalPausedTime, setTotalPausedTime] = useState(0)
  
  // CRITICAL FIX: Mutex-like guard to prevent race conditions during state transitions
  const transitionPhaseRef = useRef<TransitionPhase>('idle')
  const transitionLockRef = useRef<boolean>(false)
  
  // Custom pause/resume handlers for intervals tracking
  const handlePause = useCallback(() => {
    // Intervals uses intervalStartTime, so we store pausedElapsed
    if (intervalStartTime !== null) {
      const now = getCurrentTime()
      const elapsed = now - intervalStartTime
      setBasePausedElapsed(elapsed)
      setIntervalStartTime(null)
    }
  }, [intervalStartTime])
  
  const handleResume = useCallback(() => {
    const now = getCurrentTime()
    // When continuing, adjust the start time to account for paused elapsed time
    setIntervalStartTime(now - basePausedElapsed)
    // Track total paused time for accurate duration calculation
    if (sessionStartTime !== null && intervalStartTime !== null) {
      const pauseDuration = now - intervalStartTime - basePausedElapsed
      setTotalPausedTime((total) => total + pauseDuration)
    }
  }, [basePausedElapsed, sessionStartTime, intervalStartTime])
  
  // Use base timer for shared state and methods
  const baseTimer = useBaseTimer({ 
    mode: 'Intervals',
    onPause: handlePause,
    onResume: handleResume
  })
  const { 
    isActive, 
    isPaused,
    setIsActive,
    setIsPaused,
    pauseTimer,
    continueTimer,
    killTimer: baseKillTimer,
    settings
  } = baseTimer
  
  // More intervals-specific state
  const [timeLeft, setTimeLeft] = useState(0)
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [currentInterval, setCurrentInterval] = useState<IntervalType>('work')
  const [intervalCount, setIntervalCount] = useState(0)
  const [sessionName, setSessionName] = useState<string | undefined>(undefined)
  const [targetLoopCount, setTargetLoopCount] = useState<number | undefined>(undefined)

  // Use ref to track the current interval for proper cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Refs to store latest callback values (avoid stale closures)
  const settingsRef = useRef(settings)
  const onSessionCompleteRef = useRef(onSessionComplete)
  const onTimerCompleteRef = useRef(onTimerComplete)
  
  // Update refs when callbacks change
  useEffect(() => {
    settingsRef.current = settings
    onSessionCompleteRef.current = onSessionComplete
    onTimerCompleteRef.current = onTimerComplete
  }, [settings, onSessionComplete, onTimerComplete])

  // Handler for interval completion - using utility function
  // CRITICAL FIX: Added transition guard to prevent race conditions
  const handleIntervalComplete = useCallback((now: number, _elapsed: number): boolean => {
    // Prevent concurrent transitions (race condition guard)
    if (transitionLockRef.current) {
      logger.warn('Transition already in progress, skipping completion check', { context: 'useIntervals' })
      return false
    }
    
    const shouldComplete = shouldCompleteSession(
      { type: currentInterval, count: intervalCount },
      targetLoopCount
    )

    if (shouldComplete) {
      // Acquire transition lock
      transitionLockRef.current = true
      transitionPhaseRef.current = 'completing'
      
      try {
        // Calculate total session duration
        const duration = sessionStartTime !== null
          ? calculateSessionDuration(sessionStartTime, now, totalPausedTime)
          : 0
        
        // Use completion handler utility
        const completionSettings: CompletionSettings = {
          soundEnabled: settingsRef.current.soundEnabled,
          soundType: settingsRef.current.soundType,
          soundVolume: settingsRef.current.soundVolume,
          vibrationEnabled: settingsRef.current.vibrationEnabled,
          vibrationPattern: settingsRef.current.vibrationPattern,
          notificationsEnabled: settingsRef.current.notificationsEnabled,
          notificationMessage: settingsRef.current.notificationMessage
        }

        // Stop the timer BEFORE calling callbacks to prevent timer staying active on error
        setIsActive(false)
        setIsPaused(false)
        setIntervalStartTime(null)
        setTimeLeft(0)
        
        // Call completion handlers after timer is stopped (wrapped in try-catch for safety)
        try {
          handleIntervalSessionComplete(
            {
              duration,
              intervalCount: intervalCount + 1,
              sessionName,
              targetLoopCount,
              settings: completionSettings
            },
            {
              onSessionComplete: onSessionCompleteRef.current,
              onTimerComplete: onTimerCompleteRef.current
            }
          )
        } catch (error) {
          // Log callback errors but don't prevent timer from stopping
          logError(error, 'useIntervals.handleIntervalComplete.callback')
        }
        
        return true // Completed
      } finally {
        // Release transition lock
        transitionLockRef.current = false
        transitionPhaseRef.current = 'idle'
      }
    }
    
    return false // Not completed, continue
  }, [currentInterval, intervalCount, targetLoopCount, sessionStartTime, totalPausedTime, sessionName, setIsActive, setIsPaused])

  // Handler for interval switching - using utility function
  // CRITICAL FIX: Added transition guard to prevent race conditions
  const handleIntervalSwitch = useCallback((now: number) => {
    // Prevent concurrent transitions (race condition guard)
    if (transitionLockRef.current) {
      logger.warn('Transition already in progress, skipping interval switch', { context: 'useIntervals' })
      return
    }
    
    // Acquire transition lock
    transitionLockRef.current = true
    transitionPhaseRef.current = 'switching'
    
    try {
      // Calculate next state based on current state
      const nextState = calculateNextInterval(currentInterval, intervalCount)
      
      // Update all state atomically using a batch-like approach
      // React 18+ batches these automatically, but we ensure order
      setCurrentInterval(nextState.nextInterval)
      setIntervalCount(nextState.nextCount)
      setIntervalStartTime(now)
      
      // Set time left for next interval
      const nextDuration = nextState.nextInterval === 'work'
        ? workMinutes * MS_PER_MINUTE
        : breakMinutes * MS_PER_MINUTE
      setTimeLeft(nextDuration)
      
      logger.info('Interval switched', { context: 'useIntervals' })
    } finally {
      // Release transition lock
      transitionLockRef.current = false
      transitionPhaseRef.current = 'idle'
    }
  }, [currentInterval, intervalCount, workMinutes, breakMinutes])

  // Main countdown effect - Only runs timer, no complex logic
  useEffect(() => {
    if (!isActive || intervalStartTime === null) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Get current interval duration
    const currentDuration = currentInterval === 'work'
      ? workMinutes * MS_PER_MINUTE
      : breakMinutes * MS_PER_MINUTE

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      const now = getCurrentTime()
      const elapsed = now - intervalStartTime
      const actualTimeLeft = Math.max(0, currentDuration - elapsed)

      setTimeLeft(actualTimeLeft)

      // Handle interval completion
      if (actualTimeLeft <= 0) {
        // Clear interval first to prevent duplicate triggers
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Check for session completion
        const completed = handleIntervalComplete(now, elapsed)
        
        if (!completed) {
          // Switch to next interval
          handleIntervalSwitch(now)
        }
      }
    }, INTERVALS_UPDATE_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, intervalStartTime, currentInterval, workMinutes, breakMinutes, handleIntervalComplete, handleIntervalSwitch])

  const startTimer = useCallback((name?: string, loops?: number) => {
    // Validate interval configuration
    if (workMinutes <= 0 || isNaN(workMinutes) || !isFinite(workMinutes)) {
      logError(new Error('Invalid work duration'), 'useIntervals.startTimer')
      return
    }
    
    if (breakMinutes <= 0 || isNaN(breakMinutes) || !isFinite(breakMinutes)) {
      logError(new Error('Invalid break duration'), 'useIntervals.startTimer')
      return
    }
    
    if (loops !== undefined && (loops <= 0 || isNaN(loops) || !isFinite(loops))) {
      logError(new Error('Invalid loop count'), 'useIntervals.startTimer')
      return
    }
    
    // Prevent starting if already running
    if (isActive) {
      logger.warn('Timer is already running', { context: 'useIntervals.startTimer' })
      return
    }
    
    try {
      const now = getCurrentTime()
      setIntervalStartTime(now)
      setSessionStartTime(now)
      setBasePausedElapsed(0)
      setTotalPausedTime(0)
      setTimeLeft(workMinutes * MS_PER_MINUTE)
      setCurrentInterval('work')
      setIsActive(true)
      setIsPaused(false)
      setIntervalCount(0)
      setSessionName(name)
      setTargetLoopCount(loops)
    } catch (error) {
      logError(error, 'useIntervals.startTimer')
    }
  }, [workMinutes, breakMinutes, isActive, setIsActive, setIsPaused])

  // Wrap base killTimer to include intervals-specific cleanup and return type
  const killTimer = useCallback(() => {
    baseKillTimer()
    
    const now = getCurrentTime()
    const count = intervalCount

    let duration = 0
    if (sessionStartTime !== null) {
      if (intervalStartTime !== null) {
        // Timer is active
        duration = now - sessionStartTime - totalPausedTime
      } else {
        // Timer is paused
        const pauseStartTime = sessionStartTime + (now - sessionStartTime - totalPausedTime - basePausedElapsed)
        duration = pauseStartTime - sessionStartTime - totalPausedTime + basePausedElapsed
      }
    }

    setTimeLeft(0)
    setCurrentInterval('work')
    setIntervalCount(0)
    setSessionStartTime(null)
    setIntervalStartTime(null)
    setBasePausedElapsed(0)
    setTotalPausedTime(0)
    const currentSessionName = sessionName
    setSessionName(undefined)
    setTargetLoopCount(undefined)

    return { duration, intervalCount: count, sessionName: currentSessionName }
  }, [baseKillTimer, intervalCount, intervalStartTime, basePausedElapsed, sessionStartTime, totalPausedTime, sessionName])

  // Legacy support
  const toggleTimer = useCallback(() => {
    if (!isActive && !isPaused && timeLeft === 0) {
      startTimer()
    } else if (isActive) {
      pauseTimer()
    } else if (isPaused) {
      continueTimer()
    }
  }, [isActive, isPaused, timeLeft, startTimer, pauseTimer, continueTimer])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setTimeLeft(0)
    setCurrentInterval('work')
    setIntervalCount(0)
    setSessionStartTime(null)
    setIntervalStartTime(null)
    setBasePausedElapsed(0)
    setTotalPausedTime(0)
    setSessionName(undefined)
    setTargetLoopCount(undefined)
  }, [setIsActive, setIsPaused])

  /**
   * Restore timer from saved state
   * Used for persistence when resuming from localStorage
   */
  const restoreTimer = useCallback((state: any) => {
    const now = getCurrentTime()

    // Restore basic state
    setWorkMinutes(Math.floor(state.workDuration / (60 * 1000)))
    setBreakMinutes(Math.floor(state.breakDuration / (60 * 1000)))
    setCurrentInterval(state.currentInterval)
    setIntervalCount(state.currentLoop)
    setTargetLoopCount(state.targetLoops)
    setBasePausedElapsed(state.pausedElapsed)

    // Calculate current interval duration
    const intervalDuration = state.currentInterval === 'work'
      ? state.workDuration
      : state.breakDuration

    if (state.isPaused) {
      // Timer was paused - restore paused state
      setIsPaused(true)
      setIsActive(false)
      setIntervalStartTime(null)
      
      // Calculate time left at pause moment
      const elapsed = (state.intervalStartTime ? now - state.intervalStartTime : 0) + state.pausedElapsed
      const remaining = Math.max(0, intervalDuration - elapsed)
      setTimeLeft(remaining)
    } else if (state.isActive && state.intervalStartTime) {
      // Timer was running - calculate current time
      const elapsed = now - state.intervalStartTime + state.pausedElapsed
      const remaining = Math.max(0, intervalDuration - elapsed)
      
      if (remaining > 0) {
        // Adjust start time to account for time passed
        setIntervalStartTime(now - elapsed)
        setTimeLeft(remaining)
        setIsActive(true)
        setIsPaused(false)
        
        // Restore session start time (approximate)
        setSessionStartTime(now - (elapsed + (state.currentLoop * (state.workDuration + state.breakDuration))))
      } else {
        // Interval completed while away - reset to initial state
        setTimeLeft(0)
        setIsActive(false)
        setIsPaused(false)
        setIntervalStartTime(null)
      }
    }
  }, [setIsActive, setIsPaused])

  // Calculate progress
  const totalTime = currentInterval === 'work' 
    ? workMinutes * MS_PER_MINUTE 
    : breakMinutes * MS_PER_MINUTE
  const progress = totalTime > 0 ? calculateProgress(timeLeft, totalTime, CIRCLE_CIRCUMFERENCE) : 0
  const strokeDashoffset = calculateStrokeDashoffset(progress, CIRCLE_CIRCUMFERENCE)

  return {
    timeLeft,
    isActive,
    isPaused,
    toggleTimer,
    resetTimer,
    startTimer,
    pauseTimer,
    continueTimer,
    killTimer,
    workMinutes,
    breakMinutes,
    currentInterval,
    intervalCount,
    sessionName,
    targetLoopCount,
    setWorkMinutes,
    setBreakMinutes,
    progress,
    strokeDashoffset,
    // Expose for persistence
    intervalStartTime,
    pausedElapsed: basePausedElapsed,
    restoreTimer,
    settings
  }
}
