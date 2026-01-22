/**
 * Session Types for Premium History
 * Proper type definitions for session data with all mode-specific properties
 */

import type { TimerMode } from '../../types/timer.types'

/**
 * Base session interface - common properties for all timer modes
 */
export interface BaseSession {
  id: string
  mode: TimerMode
  duration: number // in seconds
  timestamp: number // Unix timestamp
  sessionName?: string
}

/**
 * Stopwatch-specific session properties
 */
export interface StopwatchSession extends BaseSession {
  mode: 'Stopwatch'
  lapCount?: number
  bestLap?: number // in seconds
  laps?: Array<{
    id: number
    time: string
    timeMs: number
    split?: string
    delta?: string
  }>
}

/**
 * Countdown-specific session properties
 */
export interface CountdownSession extends BaseSession {
  mode: 'Countdown'
  completed?: boolean // false if stopped early
  targetDuration?: number // in seconds - the original goal duration
}

/**
 * Intervals-specific session properties
 */
export interface IntervalsSession extends BaseSession {
  mode: 'Intervals'
  intervalCount?: number
  targetLoopCount?: number
  workDuration?: number // in seconds
  breakDuration?: number // in seconds
  completedLoops?: number
}

/**
 * Union type for all session types
 */
export type TimerSession = StopwatchSession | CountdownSession | IntervalsSession

/**
 * Type guard to check if a session is a StopwatchSession
 */
export function isStopwatchSession(session: TimerSession): session is StopwatchSession {
  return session.mode === 'Stopwatch'
}

/**
 * Type guard to check if a session is a CountdownSession
 */
export function isCountdownSession(session: TimerSession): session is CountdownSession {
  return session.mode === 'Countdown'
}

/**
 * Type guard to check if a session is an IntervalsSession
 */
export function isIntervalsSession(session: TimerSession): session is IntervalsSession {
  return session.mode === 'Intervals'
}
