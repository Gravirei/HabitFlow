/**
 * Weekly Summary Card
 */

import type { WeeklySummary } from './types'

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
      day: 'numeric',
    })
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-purple-600/10 p-6 dark:border-purple-600/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
          <span className="material-symbols-outlined text-[22px] text-white">calendar_month</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">This Week's Summary</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(summary.period.start)} - {formatDate(summary.period.end)}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{summary.message}</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon="timer"
          label="Total Time"
          value={formatDuration(highlights.totalDuration)}
        />
        <StatCard icon="counter_1" label="Sessions" value={highlights.totalSessions.toString()} />
        <StatCard icon="calendar_today" label="Active Days" value={`${highlights.activeDays}/7`} />
        <StatCard
          icon="check_circle"
          label="Completed"
          value={`${Math.round(highlights.completionRate)}%`}
        />
      </div>

      {highlights.totalSessions > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">
                emoji_events
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Most productive: <strong>{formatDate(highlights.mostProductiveDay.date)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-purple-600">
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
    <div className="rounded-lg bg-white p-3 dark:bg-slate-700">
      <div className="mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  )
}
