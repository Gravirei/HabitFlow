/**
 * Timeline Day Component
 * Single day view in the timeline
 */

import React from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { TimelineSessionBlock } from './TimelineSession'
import type { TimelineDay, TimelineSession } from './types'
import { calculateSessionPosition, formatDuration, getHourLabels, isToday } from './timelineUtils'

interface TimelineDayProps {
  day: TimelineDay
  onSessionClick?: (session: TimelineSession) => void
  showHourLabels?: boolean
}

export function TimelineDayView({ day, onSessionClick, showHourLabels = true }: TimelineDayProps) {
  const dayStart = startOfDay(day.date)
  const dayEnd = endOfDay(day.date)
  const hourLabels = getHourLabels()
  const isTodayDate = isToday(day.date)

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isTodayDate ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>
            {format(day.date, 'EEEE, MMMM d, yyyy')}
            {isTodayDate && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                Today
              </span>
            )}
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {day.sessionCount} session{day.sessionCount !== 1 ? 's' : ''} • {formatDuration(day.totalDuration)} total
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        {/* Hour Grid */}
        {showHourLabels && (
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {hourLabels.map((label, index) => (
              <div
                key={index}
                className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 text-center pb-2"
                style={{ minWidth: '50px' }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Session Track */}
        <div className="relative h-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden mt-2">
          {/* Hour Dividers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 border-r border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>

          {/* Sessions */}
          {day.sessions.length > 0 ? (
            day.sessions.map(session => {
              const position = calculateSessionPosition(session, dayStart, dayEnd)
              return (
                <TimelineSessionBlock
                  key={session.id}
                  session={session}
                  left={position.left}
                  width={position.width}
                  onClick={onSessionClick}
                />
              )
            })
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-slate-400 dark:text-slate-500 text-sm">
                No sessions on this day
              </div>
            </div>
          )}

          {/* Current Time Indicator (if today) */}
          {isTodayDate && (
            <CurrentTimeIndicator dayStart={dayStart} dayEnd={dayEnd} />
          )}
        </div>
      </div>

      {/* Empty State */}
      {day.sessions.length === 0 && (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[48px] mb-2">
            event_busy
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No timer sessions recorded
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Current Time Indicator - shows current time on today's timeline
 */
function CurrentTimeIndicator({ dayStart, dayEnd }: { dayStart: Date; dayEnd: Date }) {
  const now = new Date()
  const totalMinutes = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60)
  const currentMinutes = (now.getTime() - dayStart.getTime()) / (1000 * 60)
  const position = (currentMinutes / totalMinutes) * 100

  if (position < 0 || position > 100) return null

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
      style={{ left: `${position}%` }}
    >
      <div className="absolute top-0 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
      <div className="absolute bottom-0 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
  )
}
