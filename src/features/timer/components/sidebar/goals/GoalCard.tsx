/**
 * Goal Card Component
 * Displays individual goal with progress
 */

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

export function GoalCard({ goal, onDelete, onPause, onResume }: GoalCardProps) {
  const progress = Math.min((goal.current / goal.target) * 100, 100)

  const getGoalTypeIcon = () => {
    switch (goal.type) {
      case 'time':
        return 'schedule'
      case 'sessions':
        return 'event_repeat'
      case 'streak':
        return 'local_fire_department'
      case 'mode-specific':
        return 'tune'
      default:
        return 'flag'
    }
  }

  const getGoalTypeColor = () => {
    switch (goal.type) {
      case 'time':
        return 'from-blue-500 to-cyan-500'
      case 'sessions':
        return 'from-green-500 to-emerald-500'
      case 'streak':
        return 'from-orange-500 to-red-500'
      case 'mode-specific':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-pink-500 to-violet-600'
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
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all hover:border-cyan-400/30 ${
        goal.status === 'completed'
          ? 'hover:border-green-400/40'
          : goal.status === 'paused'
            ? 'opacity-70 hover:opacity-100'
            : isExpired
              ? 'hover:border-red-400/40'
              : ''
      } `}
    >
      {/* Animated background glow */}
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/5 opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:32px_32px]" />

      {/* Header */}
      <div className="relative z-10 mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getGoalTypeColor()} rounded-xl opacity-60 blur-md`}
            />
            <div
              className={`relative size-11 rounded-xl bg-gradient-to-br ${getGoalTypeColor()} flex items-center justify-center border border-white/20`}
            >
              <span className="material-symbols-outlined text-[22px] text-white">
                {getGoalTypeIcon()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{goal.name}</h3>
            {goal.description && (
              <p className="mt-0.5 text-xs font-medium text-white/60">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="z-10 flex gap-1">
          {goal.status === 'active' && onPause && (
            <button
              onClick={onPause}
              className="flex size-8 items-center justify-center rounded-lg border border-transparent transition-all hover:border-white/10 hover:bg-white/5"
              title="Pause goal"
            >
              <span className="material-symbols-outlined text-[18px] text-white/60 hover:text-white">
                pause
              </span>
            </button>
          )}
          {goal.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="flex size-8 items-center justify-center rounded-lg border border-transparent transition-all hover:border-green-400/30 hover:bg-green-500/10"
              title="Resume goal"
            >
              <span className="material-symbols-outlined text-[18px] text-green-400">
                play_arrow
              </span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex size-8 items-center justify-center rounded-lg border border-transparent transition-all hover:border-red-400/30 hover:bg-red-500/10"
              title="Delete goal"
            >
              <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-white/70">
            {formatValue()} / {formatTarget()}
          </span>
          <span className={`font-bold ${progress >= 100 ? 'text-green-400' : 'text-cyan-300'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-white/5 bg-slate-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${progress >= 100 ? 'from-green-500 to-emerald-500' : getGoalTypeColor()}`}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium capitalize text-white/60">{goal.period}</span>
          {goal.mode && (
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 font-bold text-cyan-300">
              {goal.mode}
            </span>
          )}
        </div>
        <span className="font-medium text-white/60">
          {goal.status === 'completed'
            ? `Completed ${format(new Date(goal.completedAt!), 'MMM d')}`
            : isExpired
              ? 'Expired'
              : `Ends ${format(new Date(goal.endDate), 'MMM d')}`}
        </span>
      </div>

      {/* Status Badge */}
      {goal.status === 'completed' && (
        <div className="absolute right-3 top-3 z-20">
          <span className="material-symbols-outlined text-[26px] text-green-400 drop-shadow-sm filter">
            check_circle
          </span>
        </div>
      )}
      {goal.status === 'paused' && (
        <div className="absolute right-3 top-3 z-20">
          <span className="material-symbols-outlined text-[26px] text-white/60 drop-shadow-sm filter">
            pause_circle
          </span>
        </div>
      )}
      {isExpired && (
        <div className="absolute right-3 top-3 z-20">
          <span className="material-symbols-outlined text-[26px] text-red-400 drop-shadow-sm filter">
            error
          </span>
        </div>
      )}
    </motion.div>
  )
}
