/**
 * Countdown Card Component
 * Displays countdown session with completion status or stopped state
 */

import { motion } from 'framer-motion'
import type { CountdownSession } from '../types/session.types'

interface CountdownCardProps {
  session: CountdownSession
  formatTime: (seconds: number) => string
  onDetailsClick?: () => void
  onRepeatClick?: () => void
  onResumeClick?: () => void
}

export function CountdownCard({
  session,
  formatTime,
  onDetailsClick,
  onRepeatClick,
  onResumeClick,
}: CountdownCardProps) {
  const sessionTime = new Date(session.timestamp)

  // Check if countdown was stopped early
  const isStopped = session.completed === false
  const targetDuration = session.targetDuration || session.duration
  const completionPercent = Math.round((session.duration / targetDuration) * 100)
  const difference = session.duration - targetDuration

  const colors = {
    gradient: 'from-primary/20 to-primary/5',
    text: 'text-primary-dark dark:text-primary',
    glow: 'bg-primary/5',
    hoverBorder: 'hover:border-primary/20',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-surface-dark dark:shadow-none ${isStopped ? 'hover:border-red-500/20' : colors.hoverBorder} mb-4`}
    >
      {/* Gradient Glow */}
      <div
        className={`absolute right-0 top-0 h-32 w-32 ${isStopped ? 'bg-red-500/5' : colors.glow} pointer-events-none -mr-8 -mt-8 rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100`}
      />

      {/* Main Content */}
      <div className="relative z-10 mb-5 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${isStopped ? 'from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5' : colors.gradient} size-14 shrink-0`}
          >
            <span
              className={`material-symbols-outlined ${isStopped ? 'text-slate-500 dark:text-gray-400' : colors.text}`}
              style={{ fontSize: '28px' }}
            >
              {isStopped ? 'hourglass_bottom' : 'hourglass_top'}
            </span>
          </div>
          <div>
            <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
              {session.sessionName || 'Countdown'}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-gray-400">
                Countdown
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
                {sessionTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
            {formatTime(session.duration)}
          </p>
          {isStopped ? (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-red-500 dark:text-red-400">
              Stopped
            </p>
          ) : (
            <div className="mt-1 flex items-center justify-end gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Done</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 mb-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-background-light p-3 dark:border-white/5 dark:bg-black/20">
          <div className="rounded-lg bg-white p-1.5 text-slate-400 dark:bg-white/5 dark:text-gray-400">
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>
              flag
            </span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
              Goal Time
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-gray-200">
              {formatTime(targetDuration)}
            </span>
          </div>
        </div>
        {isStopped ? (
          <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-background-light p-3 dark:border-white/5 dark:bg-black/20">
            <div className="rounded-lg bg-white p-1.5 text-red-500 dark:bg-white/5">
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>
                close
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
                Difference
              </span>
              <span className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
                {formatTime(Math.abs(difference))}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-background-light p-3 dark:border-white/5 dark:bg-black/20">
            <div className={`rounded-lg bg-white p-1.5 dark:bg-white/5 ${colors.text}`}>
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>
                check_circle
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
                Completion
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-gray-200">
                {completionPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-white/5">
        <button
          onClick={onDetailsClick}
          aria-label={`View details for ${session.sessionName || 'Countdown'} session`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            visibility
          </span>
          Details
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
        {isStopped ? (
          <button
            onClick={onResumeClick}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-slate-400 transition-colors hover:bg-slate-50 dark:text-gray-500 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Resume
          </button>
        ) : (
          <button
            onClick={onRepeatClick}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide ${colors.text} transition-colors hover:bg-primary/5`}
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Repeat
          </button>
        )}
      </div>
    </motion.div>
  )
}
