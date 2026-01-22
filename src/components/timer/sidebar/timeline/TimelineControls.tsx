/**
 * Timeline Controls Component
 * Navigation and view mode controls for timeline
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { TimelineViewMode } from './types'
import { formatTimelineDate } from './timelineUtils'

interface TimelineControlsProps {
  currentDate: Date
  viewMode: TimelineViewMode
  onViewModeChange: (mode: TimelineViewMode) => void
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
}

export function TimelineControls({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
}: TimelineControlsProps) {
  const viewModes: { id: TimelineViewMode; label: string; icon: string }[] = [
    { id: 'day', label: 'Day', icon: 'calendar_today' },
    { id: 'week', label: 'Week', icon: 'calendar_view_week' },
    { id: 'month', label: 'Month', icon: 'calendar_view_month' },
  ]

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* View Mode Selector */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {viewModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${viewMode === mode.id
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            <span className="material-symbols-outlined text-[18px]">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('prev')}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous period"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </motion.button>

        {/* Current Date Display */}
        <div className="min-w-[250px] text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            {formatTimelineDate(currentDate, viewMode)}
          </div>
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('next')}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next period"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </motion.button>

        {/* Today Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToday}
          className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          Today
        </motion.button>
      </div>
    </div>
  )
}
