/**
 * Stopwatch Card Component
 * Displays stopwatch session with Total Time, Laps, and Best Lap
 */

import React from 'react'
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
    hoverBorder: 'hover:border-blue-500/20'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5 relative overflow-hidden transition-all hover:shadow-md ${colors.hoverBorder} mb-4`}
    >
      {/* Gradient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.glow} rounded-bl-full -mr-8 -mt-8 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      {/* Main Content */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} shrink-0 size-14`}>
            <span className={`material-symbols-outlined ${colors.text}`} style={{ fontSize: '28px' }}>
              timer
            </span>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
              {session.sessionName || 'Stopwatch'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Stopwatch
              </span>
              <span className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                {sessionTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-900 dark:text-white text-2xl font-bold tabular-nums tracking-tight">
            {formatTime(session.duration)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wide mt-1">
            Total Time
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3 bg-background-light dark:bg-black/20 p-3 rounded-2xl border border-transparent dark:border-white/5">
          <div className="p-1.5 bg-white dark:bg-white/5 rounded-lg text-slate-400 dark:text-gray-400">
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>restart_alt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
              Total Laps
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-gray-200 tabular-nums">
              {session.lapCount || 0} Laps
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-background-light dark:bg-black/20 p-3 rounded-2xl border border-transparent dark:border-white/5">
          <div className={`p-1.5 bg-white dark:bg-white/5 rounded-lg ${colors.text}`}>
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
              Best Lap
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-gray-200 tabular-nums">
              {formatTime(session.bestLap || Math.floor(session.duration / 3))}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5 relative z-10">
        <button 
          onClick={onDetailsClick}
          aria-label={`View details for ${session.sessionName || 'Stopwatch'} session`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
          Details
        </button>
      </div>
    </motion.div>
  )
}
