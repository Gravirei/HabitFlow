/**
 * Timer Page
 * Entry point for the timer feature
 * Now uses the refactored modular timer components
 */

import { TimerContainer } from '@/components/timer/TimerContainer'
import { TimerErrorBoundary } from '@/components/timer/shared/TimerErrorBoundary'

export function Timer() {
  return (
    <TimerErrorBoundary>
      <TimerContainer />
    </TimerErrorBoundary>
  )
}
