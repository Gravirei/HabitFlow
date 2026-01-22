/**
 * Interval Switch Handler
 * 
 * Handles transitions between work and break intervals.
 * Manages visual and audio feedback for interval switches.
 * 
 * @module intervalSwitchHandler
 */

import type { IntervalType } from '../types/timer.types'
import { getNextInterval, type IntervalState } from './intervalStateMachine'

export interface SwitchResult {
  nextInterval: IntervalType
  nextCount: number
}

/**
 * Calculate the next interval state after a switch
 * Simple wrapper around state machine function for consistency
 */
export function calculateNextInterval(
  currentInterval: IntervalType,
  currentCount: number
): SwitchResult {
  const currentState: IntervalState = {
    type: currentInterval,
    count: currentCount
  }
  
  const nextState = getNextInterval(currentState)
  
  return {
    nextInterval: nextState.type,
    nextCount: nextState.count
  }
}

/**
 * Get the interval that comes before the current one
 * Useful for undo operations or validation
 */
export function getPreviousInterval(
  currentInterval: IntervalType,
  currentCount: number
): SwitchResult {
  if (currentInterval === 'work') {
    // Work comes after break, so previous is break with same or lower count
    return {
      nextInterval: 'break',
      nextCount: currentCount > 0 ? currentCount - 1 : 0
    }
  } else {
    // Break comes after work, so previous is work with same count
    return {
      nextInterval: 'work',
      nextCount: currentCount
    }
  }
}

/**
 * Check if this is the first work interval
 */
export function isFirstInterval(currentInterval: IntervalType, currentCount: number): boolean {
  return currentInterval === 'work' && currentCount === 0
}

/**
 * Check if this is a break interval
 */
export function isBreakInterval(currentInterval: IntervalType): boolean {
  return currentInterval === 'break'
}

/**
 * Check if this is a work interval
 */
export function isWorkInterval(currentInterval: IntervalType): boolean {
  return currentInterval === 'work'
}

/**
 * Get a description of the current interval for display
 */
export function getIntervalDescription(
  currentInterval: IntervalType,
  currentCount: number,
  targetLoopCount?: number
): string {
  const intervalNum = currentInterval === 'work' ? currentCount + 1 : currentCount + 1
  const type = currentInterval === 'work' ? 'Work' : 'Break'
  
  if (targetLoopCount !== undefined) {
    return `${type} ${intervalNum}/${targetLoopCount}`
  }
  
  return `${type} ${intervalNum}`
}
