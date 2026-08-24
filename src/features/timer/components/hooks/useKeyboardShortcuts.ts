/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcut manager for timer controls
 * 
 * Provides keyboard shortcuts for timer operations:
 * - Space: Start/Pause/Continue timer
 * - Escape: Stop timer
 * - K: Kill timer (when active or paused)
 * - L: Add lap (Stopwatch only)
 * - R: Restart timer (when stopped)
 * - ?: Show keyboard shortcuts help
 * 
 * Features:
 * - Respects user settings (enabled/disabled)
 * - Prevents conflicts with typing in inputs
 * - Prevents default browser behaviors
 * - Mode-specific shortcuts (L only for Stopwatch)
 * - State-aware (knows when timer is running/paused)
 */

import { useEffect } from 'react'
import { useTimerSettings } from './useTimerSettings'
import { useKeyboardHelp } from '../TimerContainer'
import type { UseKeyboardShortcutsOptions } from '../types/timer.types'

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions) => {
  const { settings } = useTimerSettings()
  const { showHelp, isHelpModalOpen } = useKeyboardHelp()
  const {
    isActive,
    isPaused,
    mode,
    onStart,
    onPause,
    onContinue,
    onStop,
    onKill,
    onLap,
    enabled = true
  } = options

  useEffect(() => {
    // Only attach shortcuts if enabled in settings and component prop
    if (!settings.keyboardShortcutsEnabled || !enabled) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when help modal is open
      if (isHelpModalOpen) {
        return
      }

      // Check if user is typing in an input field or editable element
      const target = e.target as HTMLElement
      const tagName = target?.tagName || ''
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)
      const isEditing = target && typeof target.getAttribute === 'function' && target.getAttribute('contenteditable') === 'true'
      
      // Don't trigger shortcuts while user is typing
      if (isTyping || isEditing) {
        return
      }

      // Get the pressed key (lowercase for consistency)
      const key = e.key.toLowerCase()

      // Handle different keyboard shortcuts based on key
      switch (key) {
        case ' ': // Space - Start/Pause/Continue
          e.preventDefault() // Prevent page scroll
          if (isPaused) {
            // Timer paused - continue it
            onContinue()
          } else if (!isActive) {
            // Timer not started - start it
            onStart()
          } else {
            // Timer running - pause it
            onPause()
          }
          break

        case 'escape': // Escape - Stop timer
          if (isActive) {
            e.preventDefault()
            onStop()
          }
          break

        case 'k': // K - Kill timer (when active or paused)
          if ((isActive || isPaused) && onKill) {
            e.preventDefault()
            onKill()
          }
          break

        case 'l': // L - Add lap (Stopwatch only)
          if (mode === 'Stopwatch' && isActive && !isPaused && onLap) {
            e.preventDefault()
            onLap()
          }
          break

        case 'r': // R - Restart (when stopped)
          if (!isActive) {
            e.preventDefault()
            onStart()
          }
          break

        case '?': // ? - Show help modal
          e.preventDefault()
          showHelp()
          break

        default:
          // No action for other keys
          break
      }
    }

    // Attach global keyboard event listener
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    isActive,
    isPaused,
    mode,
    onStart,
    onPause,
    onContinue,
    onStop,
    onKill,
    onLap,
    enabled,
    settings.keyboardShortcutsEnabled,
    isHelpModalOpen
  ])
}
