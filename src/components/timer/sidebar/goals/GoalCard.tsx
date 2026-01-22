/**
 * Goal Card Component
 * Displays individual goal with progress
 */

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import type { Goal } from './types'

interface GoalCardProps {
  goal: Goal
  onEdit?: () => void
  onDelete?: () => void
  onPause?: () => void
  onResume?: () => void
}

export function GoalCard({ goal, onEdit, onDelete, onPause, onResume }: GoalCardProps) {
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  const remaining = Math.max(goal.target - goal.current, 0)

  const getGoalTypeIcon = () => {
    switch (goal.type) {
      case 'time': return 'schedule'
      case 'sessions': return 'event_repeat'
      case 'streak': return 'local_fire_department'
      case 'mode-specific': return 'tune'
      default: return 'flag'
    }
  }

  const getGoalTypeColor = () => {
    switch (goal.type) {
      case 'time': return 'from-blue-500 to-cyan-500'
      case 'sessions': return 'from-green-500 to-emerald-500'
      case 'streak': return 'from-orange-500 to-red-500'
      case 'mode-specific': return 'from-purple-500 to-pink-500'
      default: return 'from-pink-500 to-violet-600'
    }
  }

  const formatValue = () => {
    if (goal.type === 'time') {
      const hours = Math.floor(goal.current / 3600)
      const mins = Math.floor((goal.current % 3600) / 60)
      return `${hours}h ${mins}m`
    }
    return `${goal.current}`
  }

  const formatTarget = () => {
    if (goal.type === 'time') {
      const hours = Math.floor(goal.target / 3600)
      return `${hours}h`
    }
    return `${goal.target}`
  }

  const isExpired = goal.status === 'active' && new Date() > new Date(goal.endDate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-cyan-400/30 rounded-2xl p-5 overflow-hidden transition-all
        ${goal.status === 'completed'
          ? 'hover:border-green-400/40'
          : goal.status === 'paused'
          ? 'opacity-70 hover:opacity-100'
          : isExpired
          ? 'hover:border-red-400/40'
          : ''
        }
      `}
    >
      {/* Animated background glow */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-3 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${getGoalTypeColor()} rounded-xl blur-md opacity-60`} />
            <div className={`relative size-11 rounded-xl bg-gradient-to-br ${getGoalTypeColor()} flex items-center justify-center border border-white/20`}>
              <span className="material-symbols-outlined text-white text-[22px]">
                {getGoalTypeIcon()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{goal.name}</h3>
            {goal.description && (
              <p className="text-xs text-white/60 mt-0.5 font-medium">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex gap-1 z-10">
          {goal.status === 'active' && onPause && (
            <button
              onClick={onPause}
              className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all border border-transparent hover:border-white/10"
              title="Pause goal"
            >
              <span className="material-symbols-outlined text-[18px] text-white/60 hover:text-white">pause</span>
            </button>
          )}
          {goal.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="size-8 rounded-lg hover:bg-green-500/10 flex items-center justify-center transition-all border border-transparent hover:border-green-400/30"
              title="Resume goal"
            >
              <span className="material-symbols-outlined text-[18px] text-green-400">play_arrow</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="size-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-all border border-transparent hover:border-red-400/30"
              title="Delete goal"
            >
              <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-3 z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-white/70">
            {formatValue()} / {formatTarget()}
          </span>
          <span className={`font-bold ${progress >= 100 ? 'text-green-400' : 'text-cyan-300'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${progress >= 100 ? 'from-green-500 to-emerald-500' : getGoalTypeColor()}`}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="relative flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-4">
          <span className="text-white/60 capitalize font-medium">
            {goal.period}
          </span>
          {goal.mode && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-400/30">
              {goal.mode}
            </span>
          )}
        </div>
        <span className="text-white/60 font-medium">
          {goal.status === 'completed'
            ? `Completed ${format(new Date(goal.completedAt!), 'MMM d')}`
            : isExpired
            ? 'Expired'
            : `Ends ${format(new Date(goal.endDate), 'MMM d')}`
          }
        </span>
      </div>

      {/* Status Badge */}
      {goal.status === 'completed' && (
        <div className="absolute top-3 right-3 z-20">
          <span className="material-symbols-outlined text-green-400 text-[26px] filter drop-shadow-sm">check_circle</span>
        </div>
      )}
      {goal.status === 'paused' && (
        <div className="absolute top-3 right-3 z-20">
          <span className="material-symbols-outlined text-white/60 text-[26px] filter drop-shadow-sm">pause_circle</span>
        </div>
      )}
      {isExpired && (
        <div className="absolute top-3 right-3 z-20">
          <span className="material-symbols-outlined text-red-400 text-[26px] filter drop-shadow-sm">error</span>
        </div>
      )}
    </motion.div>
  )
}
