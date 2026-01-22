/**
 * Session Card Component
 * Smart wrapper that renders the appropriate card type based on timer mode
 */

import React from 'react'
import { StopwatchCard } from './StopwatchCard'
import { CountdownCard } from './CountdownCard'
import { IntervalsCard } from './IntervalsCard'
import { 
  type TimerSession, 
  isStopwatchSession, 
  isCountdownSession, 
  isIntervalsSession 
} from '../types/session.types'

interface SessionCardProps {
  session: TimerSession
  formatTime: (seconds: number) => string
  onDetailsClick?: () => void
  onRepeatClick?: () => void
  onResumeClick?: () => void
}

export function SessionCard({ session, formatTime, onDetailsClick, onRepeatClick, onResumeClick }: SessionCardProps) {
  const mode = session.mode

  // Use type guards for proper type narrowing
  if (isStopwatchSession(session)) {
    return <StopwatchCard session={session} formatTime={formatTime} onDetailsClick={onDetailsClick} />
  }
  
  if (isCountdownSession(session)) {
    return (
      <CountdownCard 
        session={session} 
        formatTime={formatTime} 
        onDetailsClick={onDetailsClick}
        onRepeatClick={onRepeatClick}
        onResumeClick={onResumeClick}
      />
    )
  }
  
  if (isIntervalsSession(session)) {
    return (
      <IntervalsCard 
        session={session} 
        formatTime={formatTime} 
        onDetailsClick={onDetailsClick}
        onRepeatClick={onRepeatClick}
      />
    )
  }
  
  return null
}
