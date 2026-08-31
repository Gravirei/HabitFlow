/**
 * Stopwatch Card Component
 * Displays stopwatch session with Total Time, Laps, and Best Lap
 */

import { motion } from 'framer-motion'
import type { StopwatchSession } from '../types/session.types'

interface StopwatchCardProps {
  session: StopwatchSession
  formatTime: (seconds: number) => string
  onDetailsClick?: () => void
}

export function StopwatchCard({ session, formatTime, onDetailsClick }: StopwatchCardProps) {
  const sessionTime = new Date(session.timestamp)
  const colors = {
    gradient: 'from-blue-500/20 to-blue-500/5',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'bg-blue-500/5',
    hoverBorder: 'hover:border-blue-500/20',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-surface-dark dark:shadow-none ${colors.hoverBorder} mb-4`}
    >
      {/* Gradient Glow */}
      <div
        className={`absolute right-0 top-0 h-32 w-32 ${colors.glow} pointer-events-none -mr-8 -mt-8 rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100`}
      />

      {/* Main Content */}
      <div className="relative z-10 mb-5 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} size-14 shrink-0`}
          >
            <span
              className={`material-symbols-outlined ${colors.text}`}
              style={{ fontSize: '28px' }}
            >
              timer
            </span>
          </div>
          <div>
            <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
              {session.sessionName || 'Stopwatch'}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-gray-400">
                Stopwatch
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
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-gray-500">
            Total Time
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 mb-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-background-light p-3 dark:border-white/5 dark:bg-black/20">
          <div className="rounded-lg bg-white p-1.5 text-slate-400 dark:bg-white/5 dark:text-gray-400">
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>
              restart_alt
            </span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
              Total Laps
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-gray-200">
              {session.lapCount || 0} Laps
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-background-light p-3 dark:border-white/5 dark:bg-black/20">
          <div className={`rounded-lg bg-white p-1.5 dark:bg-white/5 ${colors.text}`}>
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>
              bolt
            </span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
              Best Lap
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-gray-200">
              {formatTime(session.bestLap || Math.floor(session.duration / 3))}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-white/5">
        <button
          onClick={onDetailsClick}
          aria-label={`View details for ${session.sessionName || 'Stopwatch'} session`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            visibility
          </span>
          Details
        </button>
      </div>
    </motion.div>
  )
}
