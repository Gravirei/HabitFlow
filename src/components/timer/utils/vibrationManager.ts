/**
 * Vibration Manager
 * Wrapper for Vibration API with pattern support
 * Handles feature detection and graceful degradation
 */

import { logError, ErrorCategory, ErrorSeverity } from './errorMessages'
import { logger } from './logger'

export type VibrationPattern = 'short' | 'long' | 'pulse'

class VibrationManager {
  /**
   * Check if vibration is supported by the browser/device
   * @returns true if Vibration API is available
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator
  }

  /**
   * Trigger vibration with specified pattern
   * @param pattern - Vibration pattern type (short, long, pulse)
   */
  public vibrate(pattern: VibrationPattern): void {
    if (!this.isSupported()) {
      logger.warn('Vibration API not supported on this device/browser', { 
        context: 'vibrationManager.vibrate' 
      })
      return
    }

    try {
      // Define vibration patterns (in milliseconds)
      const patterns: Record<VibrationPattern, number | number[]> = {
        short: 200,                       // Single 200ms vibration
        long: 500,                        // Single 500ms vibration
        pulse: [100, 50, 100, 50, 100]   // Triple pulse: vibrate-pause-vibrate-pause-vibrate
      }

      const selectedPattern = patterns[pattern]
      
      if (!selectedPattern) {
        logger.warn(`Unknown vibration pattern: ${pattern}`, { 
          context: 'vibrationManager.vibrate' 
        })
        return
      }

      // Trigger vibration
      navigator.vibrate(selectedPattern)
    } catch (error) {
      logError(
        error,
        'Failed to trigger vibration',
        { pattern },
        ErrorCategory.VIBRATION,
        ErrorSeverity.LOW
      )
    }
  }

  /**
   * Stop any ongoing vibration
   * Useful for cancelling long or repeating vibrations
   */
  public stop(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0)
      } catch (error) {
        logError(
          error,
          'Failed to stop vibration',
          undefined,
          ErrorCategory.VIBRATION,
          ErrorSeverity.LOW
        )
      }
    }
  }
}

// Singleton instance
export const vibrationManager = new VibrationManager()
