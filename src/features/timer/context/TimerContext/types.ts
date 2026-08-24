/**
 * Timer Context Types
 * Type definitions for timer context
 */

import type { TimerMode } from '../../types/timer.types'

export interface TimerFocusContextType {
  isTimerActive: boolean
  activeTimer: TimerMode | null
  focusTimer: (mode: TimerMode) => void
  unfocusTimer: () => void
}
