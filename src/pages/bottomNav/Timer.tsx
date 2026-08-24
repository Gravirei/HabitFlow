/**
 * Timer Page
 * Entry point for the timer feature
 * Now uses the refactored modular timer components
 */

import { TimerContainer } from '@/features/timer/components/TimerContainer'
import { TimerErrorBoundary } from '@/features/timer/components/shared/TimerErrorBoundary'

export function Timer() {
  return (
    <TimerErrorBoundary>
      <TimerContainer />
    </TimerErrorBoundary>
  )
}
