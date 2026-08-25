/**
 * Interval Completion Handler
 * 
 * Handles the completion of interval timer sessions.
 * Manages sound, vibration, notifications, and callbacks.
 * 
 * @module intervalCompletionHandler
 */

import { soundManager, type SoundType } from './soundManager'
import { vibrationManager, type VibrationPattern } from './vibrationManager'
import { notificationManager } from './notificationManager'
import { logError, ErrorCategory, ErrorSeverity } from './errorMessages'

export interface CompletionSettings {
  soundEnabled: boolean
  soundType: SoundType
  soundVolume: number
  vibrationEnabled: boolean
  vibrationPattern: VibrationPattern
  notificationsEnabled: boolean
  notificationMessage: string
}

export interface CompletionParams {
  duration: number // Total session duration in milliseconds
  intervalCount: number // Number of intervals completed
  sessionName?: string
  targetLoopCount?: number
  settings: CompletionSettings
}

export interface CompletionCallbacks {
  onSessionComplete?: (duration: number, intervalCount: number, sessionName?: string, targetLoopCount?: number) => void
  onTimerComplete?: () => void
}

export interface CompletionResult {
  completed: boolean
  error?: Error
}

/**
 * Handle interval timer session completion
 * Plays feedback (sound/vibration/notification) and triggers callbacks
 * 
 * @returns Result indicating success/failure
 */
export function handleIntervalSessionComplete(
  params: CompletionParams,
  callbacks: CompletionCallbacks
): CompletionResult {
  const { duration, intervalCount, sessionName, targetLoopCount, settings } = params
  const { onSessionComplete, onTimerComplete } = callbacks

  try {
    // Play completion sound
    if (settings.soundEnabled) {
      try {
        soundManager.playSound(settings.soundType, settings.soundVolume)
      } catch (error) {
        logError(
          error,
          'Failed to play completion sound',
          { soundType: settings.soundType, volume: settings.soundVolume },
          ErrorCategory.SOUND,
          ErrorSeverity.LOW
        )
      }
    }

    // Trigger completion vibration
    if (settings.vibrationEnabled) {
      try {
        vibrationManager.vibrate(settings.vibrationPattern)
      } catch (error) {
        logError(
          error,
          'Failed to trigger completion vibration',
          { pattern: settings.vibrationPattern },
          ErrorCategory.VIBRATION,
          ErrorSeverity.LOW
        )
      }
    }

    // Show completion notification
    if (settings.notificationsEnabled) {
      try {
        notificationManager.showTimerComplete(
          settings.notificationMessage,
          'Intervals',
          Math.floor(duration / 1000)
        )
      } catch (error) {
        logError(
          error,
          'Failed to show completion notification',
          { mode: 'Intervals', duration },
          ErrorCategory.NOTIFICATION,
          ErrorSeverity.LOW
        )
      }
    }

    // Call session complete callback
    if (onSessionComplete && duration > 0) {
      try {
        onSessionComplete(duration, intervalCount, sessionName, targetLoopCount)
      } catch (error) {
        logError(error, 'intervalCompletionHandler.onSessionComplete callback')
      }
    }

    // Call timer complete callback (for showing modal)
    if (onTimerComplete) {
      try {
        onTimerComplete()
      } catch (error) {
        logError(error, 'intervalCompletionHandler.onTimerComplete callback')
      }
    }

    return { completed: true }
  } catch (error) {
    logError(error, 'intervalCompletionHandler.handleIntervalSessionComplete')
    return { 
      completed: false, 
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * Calculate total session duration accounting for paused time
 */
export function calculateSessionDuration(
  sessionStartTime: number,
  currentTime: number,
  totalPausedTime: number
): number {
  return Math.max(0, currentTime - sessionStartTime - totalPausedTime)
}

/**
 * Check if a session is valid for saving to history
 */
export function isValidSession(duration: number, intervalCount: number): boolean {
  return duration > 0 && intervalCount > 0
}
