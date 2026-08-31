/**
 * Timeline View Component
 * Main timeline visualization component
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TimelineControls } from './TimelineControls'
import { TimelineDayView } from './TimelineDay'
import type { TimelineViewMode, TimelineSession } from './types'
import {
  convertToTimelineSessions,
  getTimelineData,
  navigatePeriod,
  groupSessionsByDay,
} from './timelineUtils'
import { eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface TimelineViewProps {
  sessions: any[] // Timer history records
  onSessionClick?: (session: TimelineSession) => void
}

export function TimelineView({ sessions, onSessionClick }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week')

  // Convert sessions to timeline format
  const timelineSessions = useMemo(() => convertToTimelineSessions(sessions), [sessions])

  // Get timeline data based on view mode (reserved for future summary views)
  useMemo(
    () => getTimelineData(timelineSessions, currentDate, viewMode),
    [timelineSessions, currentDate, viewMode]
  )

  // Get days to display
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'day') {
      return [groupSessionsByDay(timelineSessions, currentDate)]
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) =>
        groupSessionsByDay(timelineSessions, day)
      )
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) =>
        groupSessionsByDay(timelineSessions, day)
      )
    }
  }, [timelineSessions, currentDate, viewMode])

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate(navigatePeriod(currentDate, direction, viewMode))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Calculate totals (reserved for future summary views)
  void timelineSessions.length

  return (
    <div className="space-y-6">
      {/* Controls */}
      <TimelineControls
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={handleNavigate}
        onToday={handleToday}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.reduce((sum, d) => sum + d.sessionCount, 0)}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Sessions</div>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {Math.round(
              daysToDisplay.reduce((sum, d) => sum + d.totalDuration, 0) / (1000 * 60 * 60)
            )}
            h
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Time</div>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.filter((d) => d.sessionCount > 0).length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Days</div>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.length > 0
              ? Math.round(
                  daysToDisplay.reduce((sum, d) => sum + d.totalDuration, 0) /
                    daysToDisplay.length /
                    (1000 * 60)
                )
              : 0}
            m
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg/Day</div>
        </div>
      </div>

      {/* Timeline Days */}
      <div className="space-y-8">
        {viewMode === 'day' ? (
          // Single day view
          <TimelineDayView
            day={daysToDisplay[0]}
            onSessionClick={onSessionClick}
            showHourLabels={true}
          />
        ) : (
          // Multi-day view (week/month)
          daysToDisplay.map((day, index) => (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TimelineDayView
                day={day}
                onSessionClick={onSessionClick}
                showHourLabels={index === 0 && viewMode === 'week'}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {daysToDisplay.every((d) => d.sessionCount === 0) && (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined mb-4 text-[64px] text-slate-300 dark:text-slate-600">
            timeline
          </span>
          <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
            No Sessions in This Period
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Start using the timer to see your sessions on the timeline
          </p>
          <button
            onClick={handleToday}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            Go to Today
          </button>
        </div>
      )}
    </div>
  )
}
