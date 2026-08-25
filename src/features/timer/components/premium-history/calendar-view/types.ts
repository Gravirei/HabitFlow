/**
 * Calendar View Types
 */

export interface CalendarDay {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  sessions: any[]
  totalDuration: number
}

export interface CalendarMonth {
  year: number
  month: number
  weeks: CalendarDay[][]
}
