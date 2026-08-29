// @ts-nocheck
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

export function IntervalsCard({
  session,
  formatTime,
  onDetailsClick,
  onRepeatClick,
}: IntervalsCardProps) {
  const sessionTime = new Date(session.timestamp)

  // Check if session was completed (all loops finished)
  const isCompleted = session.targetLoopCount
    ? (session.completedLoops || session.intervalCount || 0) >= session.targetLoopCount
    : true // If no target, assume completed

  const completionPercent = session.targetLoopCount
    ? Math.round(
        ((session.completedLoops || session.intervalCount || 0) / session.targetLoopCount) * 100
      )
    : 100

  const colors = {
    gradient: 'from-orange-500/20 to-orange-500/5',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'bg-orange-500/5',
    hoverBorder: 'hover:border-orange-500/20',
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
              timelapse
            </span>
          </div>
          <div>
            <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
              {session.sessionName || 'Intervals'}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-gray-400">
                Intervals
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
          <div className="mt-1 flex items-center justify-end gap-1">
            {isCompleted ? (
              <>
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  Completed
                </p>
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-red-500" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Stopped ({completionPercent}%)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 mb-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-background-light p-2.5 text-center dark:border-white/5 dark:bg-black/20">
          <span
            className="material-symbols-outlined mb-1 text-slate-400"
            style={{ fontSize: '18px' }}
          >
            repeat
          </span>
          <span className="mb-1 text-[9px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
            Cycles
          </span>
          <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-gray-200">
            {session.completedLoops || session.intervalCount || 0}
            {session.targetLoopCount && (
              <span className="text-[9px] text-slate-400 dark:text-gray-500">
                {' '}
                / {session.targetLoopCount}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-background-light p-2.5 text-center dark:border-white/5 dark:bg-black/20">
          <span
            className={`material-symbols-outlined ${colors.text} mb-1`}
            style={{ fontSize: '18px' }}
          >
            fitness_center
          </span>
          <span className="mb-1 text-[9px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
            Work
          </span>
          <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-gray-200">
            {session.workDuration
              ? Math.floor(session.workDuration / 60)
              : Math.floor((session.duration * 0.7) / 60)}{' '}
            min
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-background-light p-2.5 text-center dark:border-white/5 dark:bg-black/20">
          <span
            className="material-symbols-outlined mb-1 text-slate-400"
            style={{ fontSize: '18px' }}
          >
            coffee
          </span>
          <span className="mb-1 text-[9px] font-bold uppercase leading-none text-slate-400 dark:text-gray-500">
            Break
          </span>
          <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-gray-200">
            {session.breakDuration
              ? Math.floor(session.breakDuration / 60)
              : Math.floor((session.duration * 0.3) / 60)}{' '}
            min
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-white/5">
        <button
          onClick={onDetailsClick}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          Details
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
        <button
          onClick={onRepeatClick}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide ${colors.text} transition-colors hover:bg-primary/5`}
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          Repeat
        </button>
      </div>
    </motion.div>
  )
}
