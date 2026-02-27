/**
 * Daily XP Summary Card
 * End-of-day card showing total XP earned, habits completed, streak status
 */

import { motion } from 'framer-motion'
import { XPProgressBar } from './XPProgressBar'
import type { DailyXPSummary } from './types'

interface DailyXPSummaryCardProps {
  summary: DailyXPSummary
  totalXP: number
  currentStreak: number
  isOpen: boolean
  onClose: () => void
}

export function DailyXPSummaryCard({ summary, totalXP, currentStreak, isOpen, onClose }: DailyXPSummaryCardProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with confetti-like gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-emerald-500/10 to-cyan-500/10 px-6 pt-8 pb-6 text-center">
          {/* Decorative circles */}
          <div className="absolute top-4 left-6 size-2 rounded-full bg-primary/40 animate-pulse" />
          <div className="absolute top-8 right-8 size-1.5 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 left-12 size-1 rounded-full bg-cyan-400/40 animate-pulse" style={{ animationDelay: '1s' }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="flex size-16 items-center justify-center rounded-2xl bg-primary/20 mx-auto mb-4"
          >
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
          </motion.div>

          <h2 className="text-xl font-bold text-white mb-1">Daily Summary</h2>
          <p className="text-sm text-slate-400">{new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-5 space-y-5">
          {/* XP Earned */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-700/30 p-3 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-primary"
              >
                +{summary.totalXP}
              </motion.p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">XP EARNED</p>
            </div>
            <div className="rounded-xl bg-slate-700/30 p-3 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                {summary.habitsCompleted}
              </motion.p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">HABITS</p>
            </div>
            <div className="rounded-xl bg-slate-700/30 p-3 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-lg text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
              </motion.div>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">STREAK</p>
            </div>
          </div>

          {/* Level Progress */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Level Progress</p>
            <XPProgressBar totalXP={totalXP} size="md" />
          </div>

          {/* Streak Bonus */}
          {summary.streakBonus > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3">
              <span className="material-symbols-outlined text-xl text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-300">Streak Bonus</p>
                <p className="text-xs text-orange-400/70">{currentStreak}-day streak reward</p>
              </div>
              <span className="text-sm font-bold text-orange-400">+{summary.streakBonus} XP</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-content transition-all hover:bg-primary-focus active:scale-[0.98]"
          >
            Awesome!
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
