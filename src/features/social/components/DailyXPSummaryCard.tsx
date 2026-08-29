/**
 * Daily XP Summary Card
 * End-of-day card showing total XP earned, habits completed, streak status
 */

import { motion } from 'framer-motion'
import { XPProgressBar } from './XPProgressBar'
import type { DailyXPSummary } from '../types'

interface DailyXPSummaryCardProps {
  summary: DailyXPSummary
  totalXP: number
  currentStreak: number
  isOpen: boolean
  onClose: () => void
}

export function DailyXPSummaryCard({
  summary,
  totalXP,
  currentStreak,
  isOpen,
  onClose,
}: DailyXPSummaryCardProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with confetti-like gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-emerald-500/10 to-cyan-500/10 px-6 pb-6 pt-8 text-center">
          {/* Decorative circles */}
          <div className="absolute left-6 top-4 size-2 animate-pulse rounded-full bg-primary/40" />
          <div
            className="absolute right-8 top-8 size-1.5 animate-pulse rounded-full bg-emerald-400/40"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-4 left-12 size-1 animate-pulse rounded-full bg-cyan-400/40"
            style={{ animationDelay: '1s' }}
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/20"
          >
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </motion.div>

          <h2 className="mb-1 text-xl font-bold text-white">Daily Summary</h2>
          <p className="text-sm text-slate-400">
            {new Date(summary.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-5 px-6 py-5">
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
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">XP EARNED</p>
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
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">HABITS</p>
            </div>
            <div className="rounded-xl bg-slate-700/30 p-3 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-1"
              >
                <span
                  className="material-symbols-outlined text-lg text-orange-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
              </motion.div>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">STREAK</p>
            </div>
          </div>

          {/* Level Progress */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Level Progress
            </p>
            <XPProgressBar totalXP={totalXP} size="md" />
          </div>

          {/* Streak Bonus */}
          {summary.streakBonus > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
              <span
                className="material-symbols-outlined text-xl text-orange-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
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
