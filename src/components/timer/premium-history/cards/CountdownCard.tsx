/**
 * Countdown Card Component
 * Displays countdown session with completion status or stopped state
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { CountdownSession } from '../types/session.types'

interface CountdownCardProps {
  session: CountdownSession
  formatTime: (seconds: number) => string
  onDetailsClick?: () => void
  onRepeatClick?: () => void
  onResumeClick?: () => void
}

export function CountdownCard({ session, formatTime, onDetailsClick, onRepeatClick, onResumeClick }: CountdownCardProps) {
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
    hoverBorder: 'hover:border-primary/20'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5 relative overflow-hidden transition-all hover:shadow-md ${isStopped ? 'hover:border-red-500/20' : colors.hoverBorder} mb-4`}
    >
      {/* Gradient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${isStopped ? 'bg-red-500/5' : colors.glow} rounded-bl-full -mr-8 -mt-8 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      {/* Main Content */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${isStopped ? 'from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5' : colors.gradient} shrink-0 size-14`}>
            <span className={`material-symbols-outlined ${isStopped ? 'text-slate-500 dark:text-gray-400' : colors.text}`} style={{ fontSize: '28px' }}>
              {isStopped ? 'hourglass_bottom' : 'hourglass_top'}
            </span>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
              {session.sessionName || 'Countdown'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Countdown
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
          {isStopped ? (
            <p className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wide mt-1">
              Stopped
            </p>
          ) : (
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wide">Done</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3 bg-background-light dark:bg-black/20 p-3 rounded-2xl border border-transparent dark:border-white/5">
          <div className="p-1.5 bg-white dark:bg-white/5 rounded-lg text-slate-400 dark:text-gray-400">
            <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>flag</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
              Goal Time
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-gray-200 tabular-nums">
              {formatTime(targetDuration)}
            </span>
          </div>
        </div>
        {isStopped ? (
          <div className="flex items-center gap-3 bg-background-light dark:bg-black/20 p-3 rounded-2xl border border-transparent dark:border-white/5">
            <div className="p-1.5 bg-white dark:bg-white/5 rounded-lg text-red-500">
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>close</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
                Difference
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                {formatTime(Math.abs(difference))}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-background-light dark:bg-black/20 p-3 rounded-2xl border border-transparent dark:border-white/5">
            <div className={`p-1.5 bg-white dark:bg-white/5 rounded-lg ${colors.text}`}>
              <span className="material-symbols-outlined block" style={{ fontSize: '18px' }}>check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
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
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5 relative z-10">
        <button 
          onClick={onDetailsClick}
          aria-label={`View details for ${session.sessionName || 'Countdown'} session`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
          Details
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
        {isStopped ? (
          <button 
            onClick={onResumeClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Resume
          </button>
        ) : (
          <button 
            onClick={onRepeatClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide ${colors.text} hover:bg-primary/5 transition-colors`}
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            Repeat
          </button>
        )}
      </div>
    </motion.div>
  )
}
