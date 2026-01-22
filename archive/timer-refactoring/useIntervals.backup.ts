/**
 * useIntervals Hook
 * Manages interval timer logic and state
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
import { soundManager } from '../utils/soundManager'
import { vibrationManager } from '../utils/vibrationManager'
import { notificationManager } from '../utils/notificationManager'
import { useTimerSettings } from './useTimerSettings'
import { logError } from '../utils/errorMessages'

interface UseIntervalsOptions {
  onSessionComplete?: (duration: number, intervalCount: number, sessionName?: string, targetLoopCount?: number) => void
  onTimerComplete?: () => void // Triggered when timer naturally completes (for showing modal)
}

// Helper to get current time (works with both real Date.now and vitest's fake timers)
const getCurrentTime = (): number => {
  // Check if we're in a test environment with fake timers
  // @ts-ignore - vi is injected by vitest in test environment
  if (typeof global !== 'undefined' && global.vi && typeof global.vi.now === 'function') {
    // @ts-ignore
    return global.vi.now()
  }
  return Date.now()
}

export const useIntervals = (options?: UseIntervalsOptions): UseIntervalsReturn => {
  const { onSessionComplete, onTimerComplete } = options || {}
  const { settings } = useTimerSettings()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [currentInterval, setCurrentInterval] = useState<IntervalType>('work')
  const [intervalCount, setIntervalCount] = useState(0)
  const [sessionName, setSessionName] = useState<string | undefined>(undefined)
  const [targetLoopCount, setTargetLoopCount] = useState<number | undefined>(undefined)

  // Track wall-clock time for accurate intervals
  const [intervalStartTime, setIntervalStartTime] = useState<number | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [pausedElapsed, setPausedElapsed] = useState(0)
  const [totalPausedTime, setTotalPausedTime] = useState(0)

  // Use ref to prevent duplicate switches when effect re-runs
  const switchingRef = useRef(false)
  // Use ref to track the current interval for proper cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    switchingRef.current = false

    if (isActive && intervalStartTime !== null) {
      intervalRef.current = setInterval(() => {
        // Don't process if we've already switched - wait for effect to restart
        if (switchingRef.current) return

        const now = getCurrentTime()
        const elapsed = now - intervalStartTime

        const currentDuration = currentInterval === 'work'
          ? workMinutes * MS_PER_MINUTE
          : breakMinutes * MS_PER_MINUTE

        const actualTimeLeft = Math.max(0, currentDuration - elapsed)

        setTimeLeft(actualTimeLeft)

        if (actualTimeLeft <= 0) {
          // Prevent duplicate switches and further updates
          switchingRef.current = true

          // Check if we should stop after this interval
          // intervalCount represents completed full cycles (work + break)
          // A "loop" or "set" = Work + Break (complete cycle)
          // intervalCount increments AFTER break completes (line 99)
          // So if targetLoopCount = 2, stop after 2nd break completes (when intervalCount would become 2)
          // Stop when: currentInterval === 'break' AND intervalCount + 1 >= targetLoopCount
          
          if (targetLoopCount !== undefined && currentInterval === 'break' && intervalCount + 1 >= targetLoopCount) {
            // Clear the interval immediately
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            
            // Calculate total session duration before stopping
            let duration = 0
            if (sessionStartTime !== null) {
              duration = now - sessionStartTime - totalPausedTime
            }
            
            // Play completion sound
            if (settings.soundEnabled) {
              try {
                soundManager.playSound(settings.soundType, settings.soundVolume)
              } catch (error) {
                console.error('Failed to play completion sound:', error)
              }
            }
            
            // Trigger completion vibration
            if (settings.vibrationEnabled) {
              try {
                vibrationManager.vibrate(settings.vibrationPattern)
              } catch (error) {
                console.error('Failed to trigger completion vibration:', error)
              }
            }
            
            // Show completion notification
            if (settings.notificationsEnabled) {
              try {
                notificationManager.showTimerComplete(
                  settings.notificationMessage,
                  'Intervals',
                  Math.floor(duration / 1000) // Convert to seconds
                )
              } catch (error) {
                console.error('Failed to show completion notification:', error)
              }
            }
            
            // Auto-save completed session to history with error handling
            try {
              if (onSessionComplete && duration > 0) {
                onSessionComplete(duration, intervalCount + 1, sessionName, targetLoopCount)
              }
            } catch (error) {
              logError(error, 'useIntervals.onSessionComplete callback')
            }
            
            // Automatically stop the timer
            setIsActive(false)
            setIsPaused(false)
            setIntervalStartTime(null)
            setTimeLeft(0)
            
            // Trigger completion callback (for showing modal) with error handling
            try {
              if (onTimerComplete) {
                onTimerComplete()
              }
            } catch (error) {
              logError(error, 'useIntervals.onTimerComplete callback')
            }
            
            return
          }

          // Switch intervals - the effect will restart when intervalStartTime changes
          const newStartTime = now
          if (currentInterval === 'work') {
            setCurrentInterval('break')
            setIntervalStartTime(newStartTime)
            setTimeLeft(breakMinutes * MS_PER_MINUTE)
          } else {
            setCurrentInterval('work')
            setIntervalCount((count) => count + 1)
            setIntervalStartTime(newStartTime)
            setTimeLeft(workMinutes * MS_PER_MINUTE)
          }
        }
      }, INTERVALS_UPDATE_INTERVAL)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, intervalStartTime, currentInterval, workMinutes, breakMinutes, targetLoopCount, intervalCount, sessionStartTime, totalPausedTime, sessionName, onSessionComplete, onTimerComplete])

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
      console.warn('[useIntervals] Timer is already running')
      return
    }
    
    try {
      const now = getCurrentTime()
      setIntervalStartTime(now)
      setSessionStartTime(now)
      setPausedElapsed(0)
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
  }, [workMinutes, breakMinutes, isActive])

  const pauseTimer = useCallback(() => {
    // Prevent pausing if not running
    if (!isActive) {
      console.warn('[useIntervals] Cannot pause: timer is not running')
      return
    }
    
    try {
      if (intervalStartTime !== null) {
        const now = getCurrentTime()
        const elapsed = now - intervalStartTime
        setPausedElapsed(elapsed)
        setIntervalStartTime(null)
      }
      setIsActive(false)
      setIsPaused(true)
    } catch (error) {
      logError(error, 'useIntervals.pauseTimer')
    }
  }, [intervalStartTime, isActive])

  const continueTimer = useCallback(() => {
    // Prevent resuming if not paused
    if (!isPaused) {
      console.warn('[useIntervals] Cannot resume: timer is not paused')
      return
    }
    
    try {
      const now = getCurrentTime()
      // When continuing, adjust the start time to account for paused elapsed time
      setIntervalStartTime(now - pausedElapsed)
      // Track total paused time for accurate duration calculation
      if (sessionStartTime !== null && intervalStartTime !== null) {
        const pauseDuration = now - intervalStartTime - pausedElapsed
        setTotalPausedTime((total) => total + pauseDuration)
      }
      setIsActive(true)
      setIsPaused(false)
    } catch (error) {
      logError(error, 'useIntervals.continueTimer')
    }
  }, [pausedElapsed, sessionStartTime, intervalStartTime, isPaused])

  const killTimer = useCallback(() => {
    const now = getCurrentTime()
    const count = intervalCount

    let duration = 0
    if (sessionStartTime !== null) {
      if (intervalStartTime !== null) {
        // Timer is active
        duration = now - sessionStartTime - totalPausedTime
      } else {
        // Timer is paused
        const pauseStartTime = sessionStartTime + (now - sessionStartTime - totalPausedTime - pausedElapsed)
        duration = pauseStartTime - sessionStartTime - totalPausedTime + pausedElapsed
      }
    }

    setIsActive(false)
    setIsPaused(false)
    setTimeLeft(0)
    setCurrentInterval('work')
    setIntervalCount(0)
    setSessionStartTime(null)
    setIntervalStartTime(null)
    setPausedElapsed(0)
    setTotalPausedTime(0)
    setSessionName(undefined)
    setTargetLoopCount(undefined)

    return { duration, intervalCount: count, sessionName }
  }, [intervalCount, intervalStartTime, pausedElapsed, sessionStartTime, totalPausedTime, sessionName])

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
    setPausedElapsed(0)
    setTotalPausedTime(0)
    setSessionName(undefined)
    setTargetLoopCount(undefined)
  }, [])

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
    setPausedElapsed(state.pausedElapsed)

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
  }, [])

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
    pausedElapsed,
    restoreTimer
  }
}
