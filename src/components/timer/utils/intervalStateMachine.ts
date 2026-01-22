/**
 * Interval State Machine
 * 
 * Pure functions for managing interval timer state transitions.
 * No side effects, no React dependencies - easy to test and reason about.
 * 
 * @module intervalStateMachine
 */

import type { IntervalType } from '../types/timer.types'

export interface IntervalState {
  type: IntervalType
  count: number
}

export interface IntervalConfig {
  workDuration: number // in milliseconds
  breakDuration: number // in milliseconds
  targetLoopCount?: number // undefined = infinite
}

/**
 * Get the next interval state after current interval completes
 */
export function getNextInterval(current: IntervalState): IntervalState {
  if (current.type === 'work') {
    // After work comes break (count stays same)
    return {
      type: 'break',
      count: current.count
    }
  } else {
    // After break comes work (count increments)
    return {
      type: 'work',
      count: current.count + 1
    }
  }
}

/**
 * Check if the session should complete
 * Session completes when we finish a break interval and reached target loop count
 */
export function shouldCompleteSession(
  state: IntervalState,
  targetLoopCount?: number
): boolean {
  // If no target, never complete (infinite mode)
  if (targetLoopCount === undefined) {
    return false
  }
  
  // Complete when finishing a break and reached target
  return state.type === 'break' && state.count + 1 >= targetLoopCount
}

/**
 * Get the duration for the current interval
 */
export function getCurrentDuration(
  state: IntervalState,
  config: IntervalConfig
): number {
  return state.type === 'work' 
    ? config.workDuration 
    : config.breakDuration
}

/**
 * Get the next duration after switching intervals
 */
export function getNextDuration(
  state: IntervalState,
  config: IntervalConfig
): number {
  const nextState = getNextInterval(state)
  return getCurrentDuration(nextState, config)
}

/**
 * Calculate progress for current interval (0 to 1)
 */
export function calculateIntervalProgress(
  elapsed: number,
  duration: number
): number {
  if (duration <= 0) return 1
  const progress = elapsed / duration
  return Math.min(1, Math.max(0, progress))
}

/**
 * Get display name for interval type
 */
export function getIntervalDisplayName(type: IntervalType): string {
  return type === 'work' ? 'Work Time' : 'Break Time'
}

/**
 * Validate interval configuration
 */
export function isValidIntervalConfig(config: IntervalConfig): boolean {
  return (
    config.workDuration > 0 &&
    config.breakDuration > 0 &&
    (config.targetLoopCount === undefined || config.targetLoopCount > 0)
  )
}
