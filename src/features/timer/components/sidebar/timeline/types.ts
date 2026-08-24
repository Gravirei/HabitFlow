/**
 * Timeline Types
 * Types and interfaces for the timeline visualization
 */

export type TimelineViewMode = 'day' | 'week' | 'month'
export type TimerMode = 'Stopwatch' | 'Countdown' | 'Intervals'

export interface TimelineSession {
  id: string
  mode: TimerMode
  sessionName?: string
  startTime: Date
  endTime: Date
  duration: number // in milliseconds
  completed: boolean
  targetTime?: number // For countdown
}

export interface TimelineDay {
  date: Date
  sessions: TimelineSession[]
  totalDuration: number
  sessionCount: number
}

export interface TimelineWeek {
  weekStart: Date
  weekEnd: Date
  days: TimelineDay[]
  totalDuration: number
  sessionCount: number
}

export interface TimelineMonth {
  monthStart: Date
  monthEnd: Date
  weeks: TimelineWeek[]
  totalDuration: number
  sessionCount: number
}

export interface TimelineRange {
  start: Date
  end: Date
}
