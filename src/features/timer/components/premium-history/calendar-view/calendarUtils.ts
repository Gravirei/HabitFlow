/**
 * Calendar Utilities
 * Helper functions for calendar generation and date manipulation
 */

import type { CalendarDay, CalendarMonth } from './types'

export function generateCalendarMonth(year: number, month: number, sessions: any[]): CalendarMonth {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []

  // Fill in days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    currentWeek.push(createCalendarDay(date, false, sessions))
  }

  // Fill in days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    currentWeek.push(createCalendarDay(date, true, sessions))

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Fill in days from next month
  if (currentWeek.length > 0) {
    let nextMonthDay = 1
    while (currentWeek.length < 7) {
      const date = new Date(year, month + 1, nextMonthDay)
      currentWeek.push(createCalendarDay(date, false, sessions))
      nextMonthDay++
    }
    weeks.push(currentWeek)
  }

  return { year, month, weeks }
}

function createCalendarDay(date: Date, isCurrentMonth: boolean, allSessions: any[]): CalendarDay {
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  // Filter sessions for this day
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayEnd = dayStart + 86400000 - 1

  const sessions = allSessions.filter((session) => {
    return session.timestamp >= dayStart && session.timestamp <= dayEnd
  })

  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)

  return {
    date,
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday,
    sessions,
    totalDuration,
  }
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getMonthName(month: number): string {
  const date = new Date(2000, month, 1)
  return date.toLocaleDateString('en-US', { month: 'long' })
}

export function getDayAbbreviation(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayIndex]
}
