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
  lastWeekTime
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
  const weekChange = lastWeekTime > 0 
    ? ((thisWeekTime - lastWeekTime) / lastWeekTime) * 100 
    : 0
  const isPositiveChange = weekChange >= 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
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
        className="group col-span-2 sm:col-span-1 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden"
      >
        {/* Animated background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-cyan-400/30" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm text-cyan-300 font-bold uppercase tracking-wider">
              Total Time
            </span>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-md group-hover:bg-cyan-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border border-cyan-400/30">
                <span className="material-symbols-outlined text-cyan-300 text-xl sm:text-2xl">schedule</span>
              </div>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono tracking-tight">
            {formatTime(totalTime)}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-gradient-to-r from-cyan-500/50 to-transparent rounded-full" />
            <span className="text-xs text-cyan-200/60 font-medium">
              All time tracked
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total Sessions Card */}
      <motion.div
        variants={cardVariants}
        className="group col-span-2 sm:col-span-1 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-emerald-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-emerald-400/30" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm text-emerald-300 font-bold uppercase tracking-wider">
              Sessions
            </span>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-md group-hover:bg-emerald-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30">
                <span className="material-symbols-outlined text-emerald-300 text-xl sm:text-2xl">fitness_center</span>
              </div>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {totalSessions}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-gradient-to-r from-emerald-500/50 to-transparent rounded-full" />
            <span className="text-xs text-emerald-200/60 font-medium">
              Completed sessions
            </span>
          </div>
        </div>
      </motion.div>

      {/* Current Streak Card */}
      <motion.div
        variants={cardVariants}
        className="group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-orange-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-orange-400/30" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm text-orange-300 font-bold uppercase tracking-wider">
              Streak
            </span>
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400/20 rounded-xl blur-md group-hover:bg-orange-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-400/30">
                <span className="material-symbols-outlined text-orange-300 text-xl sm:text-2xl">local_fire_department</span>
              </div>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {currentStreak}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-gradient-to-r from-orange-500/50 to-transparent rounded-full" />
            <span className="text-xs text-orange-200/60 font-medium">
              Day{currentStreak !== 1 ? 's' : ''} active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Average Length Card */}
      <motion.div
        variants={cardVariants}
        className="group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-violet-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-violet-400/30" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm text-violet-300 font-bold uppercase tracking-wider">
              Average
            </span>
            <div className="relative">
              <div className="absolute inset-0 bg-violet-400/20 rounded-xl blur-md group-hover:bg-violet-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/20 border border-violet-400/30">
                <span className="material-symbols-outlined text-violet-300 text-xl sm:text-2xl">avg_time</span>
              </div>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono tracking-tight">
            {formatTime(avgSessionLength)}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-gradient-to-r from-violet-500/50 to-transparent rounded-full" />
            <span className="text-xs text-violet-200/60 font-medium">
              Per session
            </span>
          </div>
        </div>
      </motion.div>

      {/* This Week Card (Full width on mobile) */}
      <motion.div
        variants={cardVariants}
        className="group col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-pink-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-pink-400/30" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs sm:text-sm text-pink-300 font-bold uppercase tracking-wider">
                  This Week
                </span>
                {weekChange !== 0 && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                    isPositiveChange
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {isPositiveChange ? 'trending_up' : 'trending_down'}
                    </span>
                    {Math.abs(weekChange).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono tracking-tight">
                {formatTime(thisWeekTime)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 bg-gradient-to-r from-pink-500/50 to-transparent rounded-full" />
                <span className="text-xs text-pink-200/60 font-medium">
                  vs {formatTime(lastWeekTime)} last week
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-pink-400/20 rounded-xl blur-md group-hover:bg-pink-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-600/20 border border-pink-400/30">
                <span className="material-symbols-outlined text-pink-300 text-2xl sm:text-3xl">calendar_month</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Longest Session Card */}
      <motion.div
        variants={cardVariants}
        className="group col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 hover:border-indigo-400/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 group-hover:bg-indigo-400/30" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500" />

        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:24px_24px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-xs sm:text-sm text-indigo-300 font-bold uppercase tracking-wider block mb-4">
                Longest Session
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono tracking-tight">
                {formatTime(longestSession)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 bg-gradient-to-r from-indigo-500/50 to-transparent rounded-full" />
                <span className="text-xs text-indigo-200/60 font-medium">
                  Personal record
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400/20 rounded-xl blur-md group-hover:bg-indigo-400/30 transition-all duration-300" />
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border border-indigo-400/30">
                <span className="material-symbols-outlined text-indigo-300 text-2xl sm:text-3xl">trophy</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
