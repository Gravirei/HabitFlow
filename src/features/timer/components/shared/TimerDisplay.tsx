/**
 * TimerDisplay Component
 * Circular progress ring with time display
 */

import React from 'react'
import type { TimerDisplayProps } from '../types/timer.types'
import { 
  TIMER_CLASSES, 
  CIRCLE_CIRCUMFERENCE, 
  CIRCLE_STROKE_WIDTH,
  formatTime 
} from '../constants/timer.constants'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({ 
  timeLeft, 
  progress,
  mode,
  currentInterval,
  intervalCount = 0,
  showIntervalStatus = false
}) => {
  const prefersReducedMotion = useReducedMotion()
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - progress
  
  // Check if we're in the last 30 seconds (for Countdown and Intervals modes)
  const isLastThirtySeconds = (mode === 'Countdown' || mode === 'Intervals') && timeLeft <= 30000 && timeLeft > 0
  
  // Check if we're in the last 10 seconds (for extra urgency with pulse animation)
  const isLastTenSeconds = (mode === 'Countdown' || mode === 'Intervals') && timeLeft <= 10000 && timeLeft > 0

  return (
    <>
      {/* Interval Status (only for Intervals mode) */}
      {showIntervalStatus && currentInterval && (
        <div className={TIMER_CLASSES.interval.container} role="status" aria-live="polite">
          <p className={TIMER_CLASSES.interval.count}>
            Interval {intervalCount + 1}
          </p>
          <p className={TIMER_CLASSES.interval.label}>
            {currentInterval === 'work' ? 'Work Time' : 'Break Time'}
          </p>
        </div>
      )}
      
      {/* Timer Ring */}
      <div className={TIMER_CLASSES.timerRing.container}>
        <div className={`${TIMER_CLASSES.timerRing.wrapper} ${isLastTenSeconds && !prefersReducedMotion ? 'animate-pulse' : ''}`}>
          <svg 
            className={TIMER_CLASSES.timerRing.svg} 
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Timer progress: ${Math.round(progress * 100)}% complete`}
          >
            {/* Background circle */}
            <circle 
              className={TIMER_CLASSES.timerRing.circleBackground}
              cx="50" 
              cy="50" 
              fill="transparent" 
              r="48" 
              strokeWidth={CIRCLE_STROKE_WIDTH}
            />
            
            {/* Progress circle */}
            <circle 
              className={`${TIMER_CLASSES.timerRing.circleProgress} ${isLastThirtySeconds ? '!text-red-500' : ''} ${isLastTenSeconds ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`}
              cx="50" 
              cy="50" 
              fill="transparent" 
              r="48" 
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" 
              strokeWidth={CIRCLE_STROKE_WIDTH}
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Time Display */}
          <div
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Timer: ${formatTime(timeLeft)}`}
            className={`${TIMER_CLASSES.timerRing.timeText} ${isLastThirtySeconds ? '!text-red-500' : ''} ${isLastTenSeconds ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]' : ''}`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
    </>
  )
})

TimerDisplay.displayName = 'TimerDisplay'
