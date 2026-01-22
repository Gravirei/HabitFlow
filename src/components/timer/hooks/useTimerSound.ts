/**
 * useTimerSound Hook
 * Manages sound and vibration playback for timer completions
 * Integrates with timer settings for user preferences
 */

import { useCallback, useEffect } from 'react'
import { useTimerSettings } from './useTimerSettings'
import { soundManager, type SoundType } from '../utils/soundManager'
import { vibrationManager, type VibrationPattern } from '../utils/vibrationManager'
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'

export const useTimerSound = () => {
  const { settings } = useTimerSettings()

  // Cleanup audio context on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      soundManager.cleanup()
    }
  }, [])

  /**
   * Play completion sound and vibration based on user settings
   * Called when a timer naturally completes
   */
  const playCompletionSound = useCallback(() => {
    // Play sound if enabled in settings
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

    // Trigger vibration if enabled in settings
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
  }, [
    settings.soundEnabled,
    settings.soundType,
    settings.soundVolume,
    settings.vibrationEnabled,
    settings.vibrationPattern
  ])

  /**
   * Play a preview sound (for testing in settings UI)
   * @param soundType - Optional sound type override
   * @param volume - Optional volume override
   */
  const playPreviewSound = useCallback((
    soundType?: SoundType,
    volume?: number
  ) => {
    try {
      soundManager.playSound(
        soundType || settings.soundType,
        volume !== undefined ? volume : settings.soundVolume
      )
    } catch (error) {
      logError(
        error,
        'Failed to play preview sound',
        { soundType: soundType || settings.soundType, volume: volume ?? settings.soundVolume },
        ErrorCategory.SOUND,
        ErrorSeverity.LOW
      )
    }
  }, [settings.soundType, settings.soundVolume])

  /**
   * Play a preview vibration (for testing in settings UI)
   * @param pattern - Optional pattern override
   */
  const playPreviewVibration = useCallback((
    pattern?: VibrationPattern
  ) => {
    try {
      vibrationManager.vibrate(pattern || settings.vibrationPattern)
    } catch (error) {
      logError(
        error,
        'Failed to trigger preview vibration',
        { pattern: pattern || settings.vibrationPattern },
        ErrorCategory.VIBRATION,
        ErrorSeverity.LOW
      )
    }
  }, [settings.vibrationPattern])

  /**
   * Stop any ongoing vibration
   * Useful for cancelling test vibrations in settings
   */
  const stopVibration = useCallback(() => {
    try {
      vibrationManager.stop()
    } catch (error) {
      logError(
        error,
        'Failed to stop vibration',
        undefined,
        ErrorCategory.VIBRATION,
        ErrorSeverity.LOW
      )
    }
  }, [])

  return {
    playCompletionSound,
    playPreviewSound,
    playPreviewVibration,
    stopVibration,
    isVibrationSupported: vibrationManager.isSupported()
  }
}
