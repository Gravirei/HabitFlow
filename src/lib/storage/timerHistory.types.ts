/**
 * Timer history storage types — canonical home.
 *
 * These live in lib/storage (not features/timer) because the storage layer
 * persists timer history regardless of which feature writes it; the legal
 * dependency direction is feature -> lib, never lib -> feature.
 */

// Timer Modes
export type TimerMode = 'Stopwatch' | 'Countdown' | 'Intervals'

// Lap Data
export interface Lap {
  id: number
  time: string
  timeMs: number
  split?: string
  delta?: string
}

// History Record
export interface TimerHistoryRecord {
  id: string
  mode: TimerMode
  duration: number // In SECONDS (changed from milliseconds)
  timestamp: number // End time (when session was saved)

  // Common fields
  startTime?: number // When timer started (timestamp)

  // Stopwatch-specific
  lapCount?: number
  bestLap?: number // In seconds
  laps?: Lap[]

  // Countdown-specific
  targetDuration?: number // Original goal in seconds
  completed?: boolean // True if countdown reached zero, false if stopped early

  // Intervals-specific
  intervalCount?: number // Total intervals completed
  completedLoops?: number // Same as intervalCount (for clarity)
  workDuration?: number // Work period in seconds
  breakDuration?: number // Break period in seconds
  sessionName?: string
  targetLoopCount?: number // Target number of loops
}
