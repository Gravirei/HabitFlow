/**
 * useTimerFocus Hook
 * 
 * Provides access to timer focus management context.
 * Used to track which element currently has focus within the timer UI.
 * 
 * Features:
 * - Get current focused element ref
 * - Set focus to specific timer elements
 * - Focus management for keyboard navigation
 * - Accessibility support
 * 
 * @returns Timer focus context value
 * @throws {Error} If used outside TimerFocusProvider
 * 
 * @example
 * ```tsx
 * function TimerButton() {
 *   const { focusedElement, setFocusedElement } = useTimerFocus()
 *   
 *   const handleFocus = () => {
 *     setFocusedElement(buttonRef)
 *   }
 *   
 *   return <button ref={buttonRef} onFocus={handleFocus}>Start</button>
 * }
 * ```
 * 
 * @see {@link TimerFocusContext} for context definition
 * @see {@link TimerFocusProvider} for provider setup
 */

import { useContext } from 'react'
import { TimerFocusContext } from '../context/TimerContext'

export const useTimerFocus = () => {
  const context = useContext(TimerFocusContext)
  if (!context) {
    throw new Error('useTimerFocus must be used within TimerFocusProvider')
  }
  return context
}
