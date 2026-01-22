/**
 * Intervals Card Component
 * Displays intervals session with cycles, work, and break breakdown
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { IntervalsSession } from '../types/session.types'

interface IntervalsCardProps {
  session: IntervalsSession
  formatTime: (seconds: number) => string
  onDetailsClick?: () => void
  onRepeatClick?: () => void
}

export function IntervalsCard({ session, formatTime, onDetailsClick, onRepeatClick }: IntervalsCardProps) {
  const sessionTime = new Date(session.timestamp)
  
  // Check if session was completed (all loops finished)
  const isCompleted = session.targetLoopCount 
    ? (session.completedLoops || session.intervalCount || 0) >= session.targetLoopCount
    : true // If no target, assume completed
  
  const completionPercent = session.targetLoopCount 
    ? Math.round(((session.completedLoops || session.intervalCount || 0) / session.targetLoopCount) * 100)
    : 100
  
  const colors = {
    gradient: 'from-orange-500/20 to-orange-500/5',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'bg-orange-500/5',
    hoverBorder: 'hover:border-orange-500/20'
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
              timelapse
            </span>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
              {session.sessionName || 'Intervals'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Intervals
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
          <div className="flex items-center justify-end gap-1 mt-1">
            {isCompleted ? (
              <>
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] text-primary font-bold uppercase tracking-wide">Completed</p>
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-red-500" />
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wide">
                  Stopped ({completionPercent}%)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
        <div className="flex flex-col justify-center items-center bg-background-light dark:bg-black/20 p-2.5 rounded-2xl border border-transparent dark:border-white/5 text-center">
          <span className="material-symbols-outlined text-slate-400 mb-1" style={{ fontSize: '18px' }}>
            repeat
          </span>
          <span className="text-[9px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
            Cycles
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-gray-200 tabular-nums">
            {session.completedLoops || session.intervalCount || 0}
            {session.targetLoopCount && (
              <span className="text-[9px] text-slate-400 dark:text-gray-500"> / {session.targetLoopCount}</span>
            )}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center bg-background-light dark:bg-black/20 p-2.5 rounded-2xl border border-transparent dark:border-white/5 text-center">
          <span className={`material-symbols-outlined ${colors.text} mb-1`} style={{ fontSize: '18px' }}>
            fitness_center
          </span>
          <span className="text-[9px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
            Work
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-gray-200 tabular-nums">
            {session.workDuration ? Math.floor(session.workDuration / 60) : Math.floor(session.duration * 0.7 / 60)} min
          </span>
        </div>
        <div className="flex flex-col justify-center items-center bg-background-light dark:bg-black/20 p-2.5 rounded-2xl border border-transparent dark:border-white/5 text-center">
          <span className="material-symbols-outlined text-slate-400 mb-1" style={{ fontSize: '18px' }}>
            coffee
          </span>
          <span className="text-[9px] uppercase text-slate-400 dark:text-gray-500 font-bold leading-none mb-1">
            Break
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-gray-200 tabular-nums">
            {session.breakDuration ? Math.floor(session.breakDuration / 60) : Math.floor(session.duration * 0.3 / 60)} min
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5 relative z-10">
        <button 
          onClick={onDetailsClick}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          Details
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
        <button 
          onClick={onRepeatClick}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide ${colors.text} hover:bg-primary/5 transition-colors`}
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          Repeat
        </button>
      </div>
    </motion.div>
  )
}
