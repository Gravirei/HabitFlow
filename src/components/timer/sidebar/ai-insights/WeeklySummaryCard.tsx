/**
 * Weekly Summary Card
 */

import React from 'react'
import { WeeklySummary } from './types'

interface WeeklySummaryCardProps {
  summary: WeeklySummary
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  const { highlights } = summary

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-6 border border-primary/20 dark:border-purple-600/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[22px]">
            calendar_month
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            This Week's Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(summary.period.start)} - {formatDate(summary.period.end)}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        {summary.message}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="timer"
          label="Total Time"
          value={formatDuration(highlights.totalDuration)}
        />
        <StatCard
          icon="counter_1"
          label="Sessions"
          value={highlights.totalSessions.toString()}
        />
        <StatCard
          icon="calendar_today"
          label="Active Days"
          value={`${highlights.activeDays}/7`}
        />
        <StatCard
          icon="check_circle"
          label="Completed"
          value={`${Math.round(highlights.completionRate)}%`}
        />
      </div>

      {highlights.totalSessions > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                emoji_events
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Most productive: <strong>{formatDate(highlights.mostProductiveDay.date)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-[18px]">
                schedule
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Longest: <strong>{formatDuration(highlights.longestSession.duration)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-[18px]">
          {icon}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  )
}
