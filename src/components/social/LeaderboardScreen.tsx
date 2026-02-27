/**
 * Leaderboard Screen — Weekly & All-Time Rankings
 * Podium for top 3, scrollable list, rank change indicators, current user highlight
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { getLeagueTierColor } from './constants'
import type { LeaderboardEntry, LeaderboardPeriod } from './types'

// ─── Demo Data Banner ───────────────────────────────────────────────────────

// ─── Rank Change Badge ──────────────────────────────────────────────────────

function RankBadge({ entry }: { entry: LeaderboardEntry }) {
  if (entry.rankChange === 'new') {
    return (
      <span className="inline-flex items-center rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider">
        New
      </span>
    )
  }
  if (entry.rankChange === 'up' && entry.previousRank !== null) {
    const diff = entry.previousRank - entry.rank
    return (
      <span className="inline-flex items-center gap-px text-[10px] font-bold text-emerald-400">
        <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
        {diff}
      </span>
    )
  }
  if (entry.rankChange === 'down' && entry.previousRank !== null) {
    const diff = entry.rank - entry.previousRank
    return (
      <span className="inline-flex items-center gap-px text-[10px] font-bold text-red-400">
        <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
        {diff}
      </span>
    )
  }
  return <span className="text-[10px] text-slate-600">—</span>
}

// ─── Podium (Top 3) ────────────────────────────────────────────────────────

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 3) return null

  const podiumOrder = [entries[1], entries[0], entries[2]] // 2nd, 1st, 3rd
  const heights = ['h-20', 'h-28', 'h-16']
  const delays = [0.15, 0, 0.25]
  const medalColors = [
    'from-slate-300 to-gray-400',       // silver
    'from-yellow-400 to-amber-500',     // gold
    'from-amber-600 to-yellow-700',     // bronze
  ]
  const medalShadows = [
    'shadow-gray-400/20',
    'shadow-yellow-500/30',
    'shadow-amber-700/20',
  ]
  return (
    <div className="flex items-end justify-center gap-3 pt-4 pb-2">
      {podiumOrder.map((entry, i) => (
        <motion.div
          key={entry.userId}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delays[i], duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Avatar + medal */}
          <div className="relative mb-2">
            {i === 1 && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="material-symbols-outlined text-yellow-400 text-xl absolute -top-5 left-1/2 -translate-x-1/2"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                kid_star
              </motion.span>
            )}
            <div className={`relative ${i === 1 ? 'size-16' : 'size-12'}`}>
              <div className={`absolute -inset-[2px] rounded-xl bg-gradient-to-br ${medalColors[i]} ${medalShadows[i]} shadow-lg`} />
              <img
                src={entry.avatarUrl}
                alt={entry.displayName}
                className="relative size-full rounded-xl object-cover"
              />
            </div>
            {/* Rank number */}
            <div className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md bg-gradient-to-br ${medalColors[i]} shadow-md`}>
              <span className="text-[10px] font-black text-white">{entry.rank}</span>
            </div>
          </div>

          {/* Name */}
          <p className={`text-[11px] font-semibold text-white truncate max-w-[72px] text-center ${
            entry.isCurrentUser ? 'text-primary' : ''
          }`}>
            {entry.isCurrentUser ? 'You' : entry.displayName.split(' ')[0]}
          </p>

          {/* XP */}
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{entry.xp} XP</p>

          {/* Podium bar */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: delays[i] + 0.2, duration: 0.4, ease: 'easeOut' }}
            className={`${heights[i]} w-16 rounded-t-xl bg-gradient-to-t from-slate-800/80 to-slate-700/40 border border-b-0 border-white/[0.04] mt-2 flex items-start justify-center pt-1.5`}
          >
            <RankBadge entry={entry} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── List Row ───────────────────────────────────────────────────────────────

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.035, ease: 'easeOut' }}
      className={`
        flex items-center gap-3 rounded-2xl px-3.5 py-3 cursor-pointer
        transition-all duration-200 ease-out
        ${entry.isCurrentUser
          ? 'bg-primary/[0.08] border border-primary/20 shadow-sm shadow-primary/5'
          : 'bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
        }
      `}
    >
      {/* Rank */}
      <div className="flex size-8 items-center justify-center flex-shrink-0">
        <span className={`text-sm font-bold tabular-nums ${entry.isCurrentUser ? 'text-primary' : 'text-slate-500'}`}>
          {entry.rank}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img src={entry.avatarUrl} alt={entry.displayName} className="size-10 rounded-xl object-cover" />
        <div
          className="absolute -bottom-px -right-px size-3 rounded-full border-[1.5px] border-slate-900"
          style={{ backgroundColor: getLeagueTierColor(entry.leagueTier) }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold truncate ${entry.isCurrentUser ? 'text-primary' : 'text-white'}`}>
          {entry.isCurrentUser ? 'You' : entry.displayName}
        </p>
        <p className="text-[10px] text-slate-500 font-medium">Level {entry.level}</p>
      </div>

      {/* XP + Change */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-[13px] font-bold text-white tabular-nums">
          {entry.xp.toLocaleString()}
          <span className="text-[10px] text-slate-500 font-medium ml-0.5">XP</span>
        </span>
        <RankBadge entry={entry} />
      </div>
    </motion.div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────

function DemoDataBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 px-3.5 py-2.5"
    >
      <span className="material-symbols-outlined text-sm text-amber-400">info</span>
      <p className="flex-1 text-[11px] text-amber-300/80 font-medium">
        Preview uses sample data until you connect with friends.
      </p>
      <button
        onClick={onDismiss}
        className="flex size-6 items-center justify-center rounded-md hover:bg-white/[0.05] cursor-pointer transition-colors duration-200"
        aria-label="Dismiss notice"
      >
        <span className="material-symbols-outlined text-sm text-amber-400/60">close</span>
      </button>
    </motion.div>
  )
}

export function LeaderboardScreen() {
  const {
    leaderboardPeriod,
    leaderboardEntries,
    setLeaderboardPeriod,
    refreshLeaderboard,
    friends,
  } = useSocialStore()

  const [isLoading, setIsLoading] = useState(true)
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    refreshLeaderboard()
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [leaderboardPeriod])

  const topThree = leaderboardEntries.slice(0, 3)
  const rest = leaderboardEntries.slice(3, 10)
  const currentUser = leaderboardEntries.find((e) => e.isCurrentUser)
  const userInTop10 = currentUser && currentUser.rank <= 10

  const periods: { id: LeaderboardPeriod; label: string; icon: string }[] = [
    { id: 'weekly', label: 'This Week', icon: 'date_range' },
    { id: 'allTime', label: 'All Time', icon: 'history' },
  ]

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex rounded-xl bg-slate-800/50 border border-white/[0.04] p-1 gap-1">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setLeaderboardPeriod(p.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold cursor-pointer
              transition-all duration-200 ease-out
              ${leaderboardPeriod === p.id
                ? 'bg-primary text-primary-content shadow-lg shadow-primary/25'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Demo data banner (GAP 5) */}
      <AnimatePresence>
        {showDemoBanner && friends.length === 0 && (
          <DemoDataBanner onDismiss={() => setShowDemoBanner(false)} />
        )}
      </AnimatePresence>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 pt-8">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center gap-3 pb-4">
            {[56, 72, 48].map((h, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className={`size-${i === 1 ? 16 : 12} rounded-xl bg-slate-700/40`} />
                <div className="h-2 w-12 mt-2 rounded bg-slate-700/40" />
                <div className={`w-16 mt-2 rounded-t-xl bg-slate-800/40`} style={{ height: h }} />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-800/20 px-3.5 py-3 animate-pulse">
              <div className="size-8 rounded-lg bg-slate-700/30" />
              <div className="size-10 rounded-xl bg-slate-700/30" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-slate-700/30" />
                <div className="h-2 w-14 rounded bg-slate-700/30" />
              </div>
              <div className="h-3.5 w-12 rounded bg-slate-700/30" />
            </div>
          ))}
        </div>
      ) : leaderboardEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-800/40 border border-dashed border-slate-700/50">
            <span className="material-symbols-outlined text-4xl text-slate-600">leaderboard</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400">No rankings yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">Complete habits to earn XP and start climbing!</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={leaderboardPeriod}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Podium */}
            <Podium entries={topThree} />

            {/* Divider */}
            <div className="flex items-center gap-3 px-2 pt-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
            </div>

            {/* Remaining entries (4–10) */}
            <div className="space-y-1.5">
              {rest.map((entry, i) => (
                <LeaderboardRow key={entry.userId} entry={entry} index={i} />
              ))}
            </div>

            {/* Current user outside top 10 */}
            {!userInTop10 && currentUser && (
              <>
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="flex-1 h-px bg-slate-700/40" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">You</span>
                  <div className="flex-1 h-px bg-slate-700/40" />
                </div>
                <LeaderboardRow entry={currentUser} index={0} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
