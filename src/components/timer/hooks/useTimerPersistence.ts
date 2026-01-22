/**
 * useTimerPersistence Hook
 * 
 * React hook for managing timer state persistence.
 * Handles detection, validation, and restoration of saved timer state.
 * 
 * @module useTimerPersistence
 */

import { useState, useEffect, useCallback } from 'react'
import { timerPersistence, type SavedTimerState } from '../utils/timerPersistence'
import type { TimerMode } from '../types/timer.types'

export interface UseTimerPersistenceReturn {
  // State
  hasSavedState: boolean
  savedState: SavedTimerState | null
  showResumeModal: boolean
  
  // Actions
  checkForSavedState: () => void
  resumeTimer: () => void
  discardTimer: () => void
  closeModal: () => void
}

/**
 * Hook for detecting and managing saved timer state
 * 
 * Usage:
 * ```tsx
 * const { 
 *   hasSavedState, 
 *   savedState, 
 *   showResumeModal,
 *   resumeTimer,
 *   discardTimer 
 * } = useTimerPersistence('Countdown', onResume)
 * ```
 */
export const useTimerPersistence = (
  mode: TimerMode,
  onResume: (state: SavedTimerState) => void
): UseTimerPersistenceReturn => {
  const [hasSavedState, setHasSavedState] = useState(false)
  const [savedState, setSavedState] = useState<SavedTimerState | null>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)

  /**
   * Check for saved state on mount
   */
  const checkForSavedState = useCallback(() => {
    const state = timerPersistence.loadState()

    if (state && state.mode === mode) {
      // Validate if timer can be resumed
      const validation = timerPersistence.validateResume(state)

      if (validation.canResume) {
        // Timer can be resumed
        setSavedState(state)
        setHasSavedState(true)
        setShowResumeModal(true)
        console.log('[useTimerPersistence] Found resumable timer:', mode)
      } else if (validation.isCompleted) {
        // Timer completed while away - could show completion notification
        console.log('[useTimerPersistence] Timer completed while away:', validation.reason)
        timerPersistence.clearState()
        // Optionally: show completion notification here
      } else {
        // Can't resume - clear state
        console.log('[useTimerPersistence] Cannot resume timer:', validation.reason)
        timerPersistence.clearState()
      }
    }
  }, [mode])

  /**
   * Check on mount
   */
  useEffect(() => {
    checkForSavedState()
  }, [checkForSavedState])

  /**
   * Resume timer from saved state
   */
  const resumeTimer = useCallback(() => {
    if (savedState) {
      console.log('[useTimerPersistence] Resuming timer:', mode)
      onResume(savedState)
      setShowResumeModal(false)
      setHasSavedState(false)
      setSavedState(null)
    }
  }, [savedState, mode, onResume])

  /**
   * Discard saved timer
   */
  const discardTimer = useCallback(() => {
    console.log('[useTimerPersistence] Discarding saved timer:', mode)
    timerPersistence.clearState()
    setShowResumeModal(false)
    setHasSavedState(false)
    setSavedState(null)
  }, [mode])

  /**
   * Close modal without action
   */
  const closeModal = useCallback(() => {
    setShowResumeModal(false)
  }, [])

  return {
    hasSavedState,
    savedState,
    showResumeModal,
    checkForSavedState,
    resumeTimer,
    discardTimer,
    closeModal
  }
}
