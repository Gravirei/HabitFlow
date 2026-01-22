/**
 * Timeline View Component
 * Main timeline visualization component
 */

import React, { useState, useMemo } from 'react'
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
  const timelineSessions = useMemo(() => 
    convertToTimelineSessions(sessions),
    [sessions]
  )

  // Get timeline data based on view mode
  const timelineData = useMemo(() => 
    getTimelineData(timelineSessions, currentDate, viewMode),
    [timelineSessions, currentDate, viewMode]
  )

  // Get days to display
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'day') {
      return [groupSessionsByDay(timelineSessions, currentDate)]
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day =>
        groupSessionsByDay(timelineSessions, day)
      )
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return eachDayOfInterval({ start: monthStart, end: monthEnd }).map(day =>
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

  // Calculate totals
  const totalSessions = timelineSessions.length
  const totalDuration = timelineSessions.reduce((sum, s) => sum + s.duration, 0)

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.reduce((sum, d) => sum + d.sessionCount, 0)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Sessions
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {Math.round(daysToDisplay.reduce((sum, d) => sum + d.totalDuration, 0) / (1000 * 60 * 60))}h
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Total Time
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.filter(d => d.sessionCount > 0).length}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Active Days
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {daysToDisplay.length > 0
              ? Math.round(daysToDisplay.reduce((sum, d) => sum + d.totalDuration, 0) / daysToDisplay.length / (1000 * 60))
              : 0}m
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Avg/Day
          </div>
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
      {daysToDisplay.every(d => d.sessionCount === 0) && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[64px] mb-4">
            timeline
          </span>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            No Sessions in This Period
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Start using the timer to see your sessions on the timeline
          </p>
          <button
            onClick={handleToday}
            className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Go to Today
          </button>
        </div>
      )}
    </div>
  )
}
