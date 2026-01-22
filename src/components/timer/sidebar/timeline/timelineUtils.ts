/**
 * Timeline Utilities
 * Helper functions for timeline data processing and calculations
 */

import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  isWithinInterval,
  format,
  isSameDay,
  differenceInMinutes,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths
} from 'date-fns'

import type { TimelineSession, TimelineDay, TimelineWeek, TimelineMonth, TimelineViewMode } from './types'

/**
 * Convert timer history records to timeline sessions
 */
export function convertToTimelineSessions(records: any[]): TimelineSession[] {
  return records.map(record => ({
    id: record.id,
    mode: record.mode,
    sessionName: record.sessionName,
    startTime: new Date(record.timestamp),
    endTime: new Date(record.timestamp + record.duration),
    duration: record.duration,
    completed: true,
    targetTime: record.targetTime,
  }))
}

/**
 * Group sessions by day
 */
export function groupSessionsByDay(sessions: TimelineSession[], date: Date): TimelineDay {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  
  const daySessions = sessions.filter(session => 
    isWithinInterval(session.startTime, { start: dayStart, end: dayEnd })
  )
  
  const totalDuration = daySessions.reduce((sum, s) => sum + s.duration, 0)
  
  return {
    date: dayStart,
    sessions: daySessions,
    totalDuration,
    sessionCount: daySessions.length,
  }
}

/**
 * Group sessions by week
 */
export function groupSessionsByWeek(sessions: TimelineSession[], date: Date): TimelineWeek {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }) // Sunday
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day =>
    groupSessionsByDay(sessions, day)
  )
  
  const totalDuration = days.reduce((sum, d) => sum + d.totalDuration, 0)
  const sessionCount = days.reduce((sum, d) => sum + d.sessionCount, 0)
  
  return {
    weekStart,
    weekEnd,
    days,
    totalDuration,
    sessionCount,
  }
}

/**
 * Group sessions by month
 */
export function groupSessionsByMonth(sessions: TimelineSession[], date: Date): TimelineMonth {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 0 }
  ).map(week => groupSessionsByWeek(sessions, week))
  
  const totalDuration = weeks.reduce((sum, w) => sum + w.totalDuration, 0)
  const sessionCount = weeks.reduce((sum, w) => sum + w.sessionCount, 0)
  
  return {
    monthStart,
    monthEnd,
    weeks,
    totalDuration,
    sessionCount,
  }
}

/**
 * Get timeline data based on view mode
 */
export function getTimelineData(
  sessions: TimelineSession[],
  date: Date,
  viewMode: TimelineViewMode
): TimelineDay | TimelineWeek | TimelineMonth {
  switch (viewMode) {
    case 'day':
      return groupSessionsByDay(sessions, date)
    case 'week':
      return groupSessionsByWeek(sessions, date)
    case 'month':
      return groupSessionsByMonth(sessions, date)
  }
}

/**
 * Calculate position and width for session block in timeline
 */
export function calculateSessionPosition(session: TimelineSession, dayStart: Date, dayEnd: Date) {
  const totalMinutes = differenceInMinutes(dayEnd, dayStart)
  const startMinutes = differenceInMinutes(session.startTime, dayStart)
  const durationMinutes = session.duration / (1000 * 60)
  
  const left = (startMinutes / totalMinutes) * 100
  const width = (durationMinutes / totalMinutes) * 100
  
  return {
    left: Math.max(0, Math.min(100, left)),
    width: Math.max(0.5, Math.min(100 - left, width)),
  }
}

/**
 * Get color for session based on mode
 */
export function getSessionColor(mode: TimelineSession['mode']): string {
  switch (mode) {
    case 'Stopwatch':
      return 'bg-blue-500'
    case 'Countdown':
      return 'bg-green-500'
    case 'Intervals':
      return 'bg-purple-500'
    default:
      return 'bg-slate-500'
  }
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Navigate to next/previous period
 */
export function navigatePeriod(
  currentDate: Date,
  direction: 'prev' | 'next',
  viewMode: TimelineViewMode
): Date {
  switch (viewMode) {
    case 'day':
      return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1)
    case 'week':
      return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
    case 'month':
      return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Format date for timeline header
 */
export function formatTimelineDate(date: Date, viewMode: TimelineViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy')
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 })
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    case 'month':
      return format(date, 'MMMM yyyy')
  }
}

/**
 * Get hour labels for timeline (0-24)
 */
export function getHourLabels(): string[] {
  return Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return '12 AM'
    if (i === 12) return '12 PM'
    if (i < 12) return `${i} AM`
    return `${i - 12} PM`
  })
}

/**
 * Get sessions for specific hour
 */
export function getSessionsInHour(sessions: TimelineSession[], date: Date, hour: number): TimelineSession[] {
  const hourStart = new Date(date)
  hourStart.setHours(hour, 0, 0, 0)
  
  const hourEnd = new Date(date)
  hourEnd.setHours(hour, 59, 59, 999)
  
  return sessions.filter(session =>
    isWithinInterval(session.startTime, { start: hourStart, end: hourEnd }) ||
    isWithinInterval(session.endTime, { start: hourStart, end: hourEnd }) ||
    (session.startTime < hourStart && session.endTime > hourEnd)
  )
}
