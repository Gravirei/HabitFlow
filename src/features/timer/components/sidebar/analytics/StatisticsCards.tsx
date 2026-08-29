/**
 * Statistics Cards Component
 * Mobile-first design with key metrics display
 * Shows: Total time, sessions, streaks, and averages
 */

import { motion } from 'framer-motion'

interface StatisticsCardsProps {
  totalTime: number // in seconds
  totalSessions: number
  currentStreak: number // days
  longestSession: number // in seconds
  avgSessionLength: number // in seconds
  thisWeekTime: number // in seconds
  lastWeekTime: number // in seconds
}

export function StatisticsCards({
  totalTime,
  totalSessions,
  currentStreak,
  longestSession,
  avgSessionLength,
  thisWeekTime,
  lastWeekTime,
}: StatisticsCardsProps) {
  // Format time helper
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  // Calculate week-over-week change
  const weekChange = lastWeekTime > 0 ? ((thisWeekTime - lastWeekTime) / lastWeekTime) * 100 : 0
  const isPositiveChange = weekChange >= 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 sm:gap-5"
    >
      {/* Total Time Card */}
      <motion.div
        variants={cardVariants}
        className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] sm:col-span-1 sm:p-6"
      >
        {/* Animated background glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl transition-all duration-500 group-hover:bg-cyan-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 sm:text-sm">
              Total Time
            </span>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md transition-all duration-300 group-hover:bg-cyan-400/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 sm:h-11 sm:w-11">
                <span className="material-symbols-outlined text-xl text-cyan-300 sm:text-2xl">
                  schedule
                </span>
              </div>
            </div>
          </div>
          <div className="mb-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
            {formatTime(totalTime)}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <span className="text-xs font-medium text-cyan-200/60">All time tracked</span>
          </div>
        </div>
      </motion.div>

      {/* Total Sessions Card */}
      <motion.div
        variants={cardVariants}
        className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-emerald-400/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] sm:col-span-1 sm:p-6"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-500 group-hover:bg-emerald-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 sm:text-sm">
              Sessions
            </span>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-400/20 blur-md transition-all duration-300 group-hover:bg-emerald-400/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 sm:h-11 sm:w-11">
                <span className="material-symbols-outlined text-xl text-emerald-300 sm:text-2xl">
                  fitness_center
                </span>
              </div>
            </div>
          </div>
          <div className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {totalSessions}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500/50 to-transparent" />
            <span className="text-xs font-medium text-emerald-200/60">Completed sessions</span>
          </div>
        </div>
      </motion.div>

      {/* Current Streak Card */}
      <motion.div
        variants={cardVariants}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-orange-400/30 hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] sm:p-6"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl transition-all duration-500 group-hover:bg-orange-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-300 sm:text-sm">
              Streak
            </span>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-orange-400/20 blur-md transition-all duration-300 group-hover:bg-orange-400/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-gradient-to-br from-orange-500/30 to-orange-600/20 sm:h-11 sm:w-11">
                <span className="material-symbols-outlined text-xl text-orange-300 sm:text-2xl">
                  local_fire_department
                </span>
              </div>
            </div>
          </div>
          <div className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {currentStreak}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-orange-500/50 to-transparent" />
            <span className="text-xs font-medium text-orange-200/60">
              Day{currentStreak !== 1 ? 's' : ''} active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Average Length Card */}
      <motion.div
        variants={cardVariants}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-violet-400/30 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] sm:p-6"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl transition-all duration-500 group-hover:bg-violet-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300 sm:text-sm">
              Average
            </span>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-violet-400/20 blur-md transition-all duration-300 group-hover:bg-violet-400/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-violet-600/20 sm:h-11 sm:w-11">
                <span className="material-symbols-outlined text-xl text-violet-300 sm:text-2xl">
                  avg_time
                </span>
              </div>
            </div>
          </div>
          <div className="mb-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
            {formatTime(avgSessionLength)}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500/50 to-transparent" />
            <span className="text-xs font-medium text-violet-200/60">Per session</span>
          </div>
        </div>
      </motion.div>

      {/* This Week Card (Full width on mobile) */}
      <motion.div
        variants={cardVariants}
        className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-pink-400/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] sm:p-6"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl transition-all duration-500 group-hover:bg-pink-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-300 sm:text-sm">
                  This Week
                </span>
                {weekChange !== 0 && (
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                      isPositiveChange
                        ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                        : 'border-rose-400/30 bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isPositiveChange ? 'trending_up' : 'trending_down'}
                    </span>
                    {Math.abs(weekChange).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="mb-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                {formatTime(thisWeekTime)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-pink-500/50 to-transparent" />
                <span className="text-xs font-medium text-pink-200/60">
                  vs {formatTime(lastWeekTime)} last week
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-pink-400/20 blur-md transition-all duration-300 group-hover:bg-pink-400/30" />
              <div className="sm:w-13 sm:h-13 relative flex h-12 w-12 items-center justify-center rounded-xl border border-pink-400/30 bg-gradient-to-br from-pink-500/30 to-pink-600/20">
                <span className="material-symbols-outlined text-2xl text-pink-300 sm:text-3xl">
                  calendar_month
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Longest Session Card */}
      <motion.div
        variants={cardVariants}
        className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 backdrop-blur-xl transition-all duration-500 hover:border-indigo-400/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] sm:p-6"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-500 group-hover:bg-indigo-400/30 group-hover:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-indigo-300 sm:text-sm">
                Longest Session
              </span>
              <div className="mb-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                {formatTime(longestSession)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500/50 to-transparent" />
                <span className="text-xs font-medium text-indigo-200/60">Personal record</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-indigo-400/20 blur-md transition-all duration-300 group-hover:bg-indigo-400/30" />
              <div className="sm:w-13 sm:h-13 relative flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/30 to-indigo-600/20">
                <span className="material-symbols-outlined text-2xl text-indigo-300 sm:text-3xl">
                  trophy
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
