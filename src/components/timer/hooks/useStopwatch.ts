/**
 * useStopwatch Hook
 * Manages stopwatch timer logic and state
 */

import { useState, useEffect, useCallback } from 'react'
import type { UseStopwatchReturn, Lap } from '../types/timer.types'
import {
  STOPWATCH_UPDATE_INTERVAL,
  CIRCLE_CIRCUMFERENCE,
  MS_PER_MINUTE,
  calculateProgress,
  calculateStrokeDashoffset,
  formatTime
} from '../constants/timer.constants'
import { useBaseTimer, getCurrentTime } from './useBaseTimer'
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'
import { logger } from '../utils/logger'

export const useStopwatch = (): UseStopwatchReturn => {
  // Use base timer for shared state and methods
  const baseTimer = useBaseTimer({ mode: 'Stopwatch' })
  const { 
    isActive, 
    isPaused, 
    timerStartTime, 
    pausedElapsed,
    setIsActive,
    setIsPaused,
    setTimerStartTime,
    setPausedElapsed,
    pauseTimer,
    continueTimer,
    killTimer: baseKillTimer
  } = baseTimer
  
  // Stopwatch-specific state
  const [timeLeft, setTimeLeft] = useState(0)
  const [laps, setLaps] = useState<Lap[]>([])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isActive && timerStartTime !== null) {
      interval = setInterval(() => {
        try {
          const now = getCurrentTime()
          const elapsed = now - timerStartTime
          
          // Handle potential overflow (though unlikely)
          if (elapsed > Number.MAX_SAFE_INTEGER - 1000) {
            logger.warn('Timer elapsed time approaching maximum safe integer', { 
              context: 'useStopwatch.interval',
              data: { elapsed }
            })
          }
          
          setTimeLeft(elapsed)
        } catch (error) {
          logError(error, 'useStopwatch.interval')
        }
      }, STOPWATCH_UPDATE_INTERVAL)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timerStartTime])

  const startTimer = useCallback(() => {
    // Prevent starting if already running
    if (isActive) {
      logger.warn('Timer is already running', { context: 'useStopwatch.startTimer' })
      return
    }
    
    try {
      const now = getCurrentTime()
      setTimerStartTime(now)
      setPausedElapsed(0)
      setIsActive(true)
      setIsPaused(false)
    } catch (error) {
      logError(error, 'useStopwatch.startTimer')
    }
  }, [isActive, setTimerStartTime, setPausedElapsed, setIsActive, setIsPaused])

  // Wrap base killTimer to include stopwatch-specific cleanup
  const killTimer = useCallback(() => {
    const duration = baseKillTimer()

    setTimeLeft(0)
    setLaps([])

    return duration
  }, [baseKillTimer])

  // Legacy support
  const toggleTimer = useCallback(() => {
    if (!isActive && !isPaused) {
      startTimer()
    } else if (isActive) {
      pauseTimer()
    } else if (isPaused) {
      continueTimer()
    }
  }, [isActive, isPaused, startTimer, pauseTimer, continueTimer])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setTimeLeft(0)
    setLaps([])
    setTimerStartTime(null)
    setPausedElapsed(0)
  }, [setIsActive, setIsPaused, setTimerStartTime, setPausedElapsed])

  const addLap = useCallback(() => {
    const prevLapTime = laps.length > 0 ? laps[0].timeMs : 0
    const lapDuration = timeLeft - prevLapTime
    
    setLaps((prev) => [{
      id: prev.length + 1,
      time: formatTime(timeLeft),
      timeMs: timeLeft,
      split: formatTime(lapDuration),
      delta: prev.length > 0 ? formatTime(lapDuration - (prev[0].timeMs - (prev[1]?.timeMs || 0))) : undefined
    }, ...prev])
  }, [timeLeft, laps])

  /**
   * Restore timer from saved state
   * Used for persistence when resuming from localStorage
   */
  const restoreTimer = useCallback((state: any) => {
    const now = getCurrentTime()

    // Restore internal state
    setPausedElapsed(state.pausedElapsed)
    
    if (state.isPaused) {
      // Timer was paused - restore paused state
      setIsPaused(true)
      setIsActive(false)
      setTimerStartTime(null)
      
      // Calculate time at pause moment
      const elapsed = (state.startTime ? now - state.startTime : 0) + state.pausedElapsed
      setTimeLeft(elapsed)
    } else if (state.isActive && state.startTime) {
      // Timer was running - calculate current time
      const elapsed = now - state.startTime + state.pausedElapsed
      
      // Adjust start time to account for time passed
      setTimerStartTime(now - elapsed)
      setTimeLeft(elapsed)
      setIsActive(true)
      setIsPaused(false)
    }

    // Restore laps
    if (state.laps && Array.isArray(state.laps)) {
      const restoredLaps = state.laps.map((lap: any, index: number) => ({
        id: parseInt(lap.id) || index + 1,
        time: formatTime(lap.time),
        timeMs: lap.time,
        split: formatTime(lap.time - (state.laps[index + 1]?.time || 0)),
        delta: undefined
      }))
      setLaps(restoredLaps)
    }
  }, [setIsActive, setIsPaused, setTimerStartTime, setPausedElapsed])

  // Calculate progress (1 minute rotation for stopwatch)
  const totalTime = MS_PER_MINUTE
  const progress = calculateProgress(timeLeft % totalTime, totalTime, CIRCLE_CIRCUMFERENCE)
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
    addLap,
    laps,
    progress,
    strokeDashoffset,
    // Expose for persistence
    timerStartTime,
    pausedElapsed,
    restoreTimer
  }
}
