/**
 * useCountdown Hook
 * Manages countdown timer logic and state
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { UseCountdownReturn } from '../types/timer.types'
import {
  COUNTDOWN_UPDATE_INTERVAL,
  CIRCLE_CIRCUMFERENCE,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  calculateProgress,
  calculateStrokeDashoffset
} from '../constants/timer.constants'
import { soundManager } from '../utils/soundManager'
import { vibrationManager } from '../utils/vibrationManager'
import { notificationManager } from '../utils/notificationManager'
import { useTimerSettings } from './useTimerSettings'
import { logError } from '../utils/errorMessages'

interface UseCountdownOptions {
  onSessionComplete?: (duration: number) => void
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

export const useCountdown = (options?: UseCountdownOptions): UseCountdownReturn => {
  const { onSessionComplete, onTimerComplete } = options || {}
  const { settings } = useTimerSettings()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(5)
  const [selectedSeconds, setSelectedSeconds] = useState(0)

  // Track wall-clock time for accurate countdown
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [totalDuration, setTotalDuration] = useState(0)
  const [pausedElapsed, setPausedElapsed] = useState(0)
  
  // Use ref to track completion to prevent multiple callback calls
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isActive && timerStartTime !== null) {
      interval = setInterval(() => {
        const now = getCurrentTime()
        const elapsed = now - timerStartTime
        const actualTimeLeft = Math.max(0, totalDuration - elapsed)

        setTimeLeft(actualTimeLeft)

        if (actualTimeLeft <= 0 && !hasCompletedRef.current) {
          // Auto-save completed countdown to history (only once)
          hasCompletedRef.current = true
          
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
                'Countdown',
                Math.floor(totalDuration / 1000) // Convert to seconds
              )
            } catch (error) {
              console.error('Failed to show completion notification:', error)
            }
          }
          
          // Call completion callbacks with error handling
          try {
            if (onSessionComplete && totalDuration > 0) {
              onSessionComplete(totalDuration)
            }
          } catch (error) {
            logError(error, 'useCountdown.onSessionComplete callback')
          }
          
          setIsActive(false)
          setTimerStartTime(null)
          setPausedElapsed(0)
          
          // Trigger completion callback (for showing modal)
          try {
            if (onTimerComplete) {
              onTimerComplete()
            }
          } catch (error) {
            logError(error, 'useCountdown.onTimerComplete callback')
          }
        }
      }, COUNTDOWN_UPDATE_INTERVAL)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timerStartTime, totalDuration, onSessionComplete, onTimerComplete])

  const startTimer = useCallback(() => {
    const totalMs = selectedHours * MS_PER_HOUR + selectedMinutes * MS_PER_MINUTE + selectedSeconds * MS_PER_SECOND
    
    // Validate duration
    if (isNaN(totalMs) || !isFinite(totalMs)) {
      logError(new Error('Invalid duration: NaN or Infinity'), 'useCountdown.startTimer')
      return
    }
    
    if (totalMs <= 0) {
      logError(new Error('Invalid duration: must be greater than zero'), 'useCountdown.startTimer')
      return
    }
    
    // Prevent starting if already running
    if (isActive) {
      console.warn('[useCountdown] Timer is already running')
      return
    }
    
    try {
      const now = getCurrentTime()
      hasCompletedRef.current = false // Reset completion flag
      setTotalDuration(totalMs)
      setTimerStartTime(now)
      setPausedElapsed(0)
      setTimeLeft(totalMs)
      setIsActive(true)
      setIsPaused(false)
    } catch (error) {
      logError(error, 'useCountdown.startTimer')
    }
  }, [selectedHours, selectedMinutes, selectedSeconds, isActive])

  const pauseTimer = useCallback(() => {
    // Prevent pausing if not running
    if (!isActive) {
      console.warn('[useCountdown] Cannot pause: timer is not running')
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
    } catch (error) {
      logError(error, 'useCountdown.pauseTimer')
    }
  }, [timerStartTime, isActive])

  const continueTimer = useCallback(() => {
    // Prevent resuming if not paused
    if (!isPaused) {
      console.warn('[useCountdown] Cannot resume: timer is not paused')
      return
    }
    
    try {
      const now = getCurrentTime()
      // When continuing, adjust the start time to account for paused elapsed time
      setTimerStartTime(now - pausedElapsed)
      setIsActive(true)
      setIsPaused(false)
    } catch (error) {
      logError(error, 'useCountdown.continueTimer')
    }
  }, [pausedElapsed, isPaused])

  const killTimer = useCallback(() => {
    const now = getCurrentTime()
    const elapsed = timerStartTime !== null
      ? now - timerStartTime + pausedElapsed
      : pausedElapsed
    const duration = Math.min(elapsed, totalDuration)

    setIsActive(false)
    setIsPaused(false)
    setTimeLeft(0)
    setTimerStartTime(null)
    setPausedElapsed(0)
    setTotalDuration(0)

    return duration
  }, [timerStartTime, pausedElapsed, totalDuration])

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
    setTimerStartTime(null)
    setPausedElapsed(0)
    setTotalDuration(0)
  }, [])

  const setPreset = useCallback((minutes: number) => {
    setSelectedHours(0)
    setSelectedMinutes(minutes)
    setSelectedSeconds(0)
    setTimeLeft(0)
    setIsActive(false)
  }, [])

  /**
   * Restore timer from saved state
   * Used for persistence when resuming from localStorage
   */
  const restoreTimer = useCallback((state: any) => {
    const now = getCurrentTime()
    hasCompletedRef.current = false

    // Restore internal state
    setTotalDuration(state.totalDuration)
    setPausedElapsed(state.pausedElapsed)
    
    if (state.isPaused) {
      // Timer was paused - restore paused state
      setIsPaused(true)
      setIsActive(false)
      setTimerStartTime(null)
      
      // Calculate time left at pause moment
      const elapsed = (state.startTime || now) - state.startTime + state.pausedElapsed
      const remaining = Math.max(0, state.totalDuration - elapsed)
      setTimeLeft(remaining)
    } else if (state.isActive && state.startTime) {
      // Timer was running - calculate current time
      const elapsed = now - state.startTime + state.pausedElapsed
      const remaining = Math.max(0, state.totalDuration - elapsed)
      
      if (remaining > 0) {
        // Adjust start time to account for time passed
        setTimerStartTime(now - elapsed)
        setTimeLeft(remaining)
        setIsActive(true)
        setIsPaused(false)
      } else {
        // Timer completed while away
        setTimeLeft(0)
        setIsActive(false)
        setIsPaused(false)
      }
    }

    // Update wheel picker to show original duration
    const totalSeconds = Math.floor(state.totalDuration / 1000)
    setSelectedHours(Math.floor(totalSeconds / 3600))
    setSelectedMinutes(Math.floor((totalSeconds % 3600) / 60))
    setSelectedSeconds(totalSeconds % 60)
  }, [])

  // Calculate progress
  const totalTime = selectedHours * MS_PER_HOUR + selectedMinutes * MS_PER_MINUTE + selectedSeconds * MS_PER_SECOND
  const progress = totalTime > 0 ? calculateProgress(timeLeft, totalTime, CIRCLE_CIRCUMFERENCE) : 0
  const strokeDashoffset = calculateStrokeDashoffset(progress, CIRCLE_CIRCUMFERENCE)

  /**
   * Start method for backward compatibility with tests
   */
  const start = useCallback((durationMs: number) => {
    // Validate duration
    if (isNaN(durationMs) || !isFinite(durationMs)) {
      logError(new Error('Invalid duration: NaN or Infinity'), 'useCountdown.start')
      return
    }
    
    if (durationMs <= 0) {
      logError(new Error('Invalid duration: must be greater than zero'), 'useCountdown.start')
      return
    }
    
    // Prevent starting if already running
    if (isActive) {
      console.warn('[useCountdown] Timer is already running')
      return
    }
    
    try {
      const now = getCurrentTime()
      hasCompletedRef.current = false
      setTotalDuration(durationMs)
      setTimerStartTime(now)
      setPausedElapsed(0)
      setTimeLeft(durationMs)
      setIsActive(true)
      setIsPaused(false)
      
      // Also update the wheel picker to reflect this duration
      const totalSeconds = Math.floor(durationMs / 1000)
      setSelectedHours(Math.floor(totalSeconds / 3600))
      setSelectedMinutes(Math.floor((totalSeconds % 3600) / 60))
      setSelectedSeconds(totalSeconds % 60)
    } catch (error) {
      logError(error, 'useCountdown.start')
    }
  }, [isActive])

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
    start, // Add for backward compatibility
    selectedHours,
    selectedMinutes,
    selectedSeconds,
    setSelectedHours,
    setSelectedMinutes,
    setSelectedSeconds,
    setPreset,
    progress,
    strokeDashoffset,
    // Expose for persistence
    timerStartTime,
    totalDuration,
    pausedElapsed,
    restoreTimer
  }
}
