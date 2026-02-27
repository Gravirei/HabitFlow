/**
 * Profile Tab — XP breakdown, daily summary, badges
 * Polished stats, animated cards, badge grid with filters
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { useProfileStore, getAvatarFallbackUrl } from '@/store/useProfileStore'
import { XPProgressBar } from './XPProgressBar'
import { DailyXPSummaryCard } from './DailyXPSummaryCard'
import { SocialBadgeCard } from './SocialBadgeCard'
import { getLeagueConfig } from './constants'
import type { XPEvent } from './types'

// ─── XP Event Row ───────────────────────────────────────────────────────────

function XPEventRow({ event, index }: { event: { label: string; icon: string; total: number; count: number }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2.5"
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <span className="material-symbols-outlined text-[16px] text-slate-300">{event.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white truncate">{event.label}</p>
        {event.count > 1 && (
          <p className="text-[10px] text-slate-500">×{event.count}</p>
        )}
      </div>
      <span className="text-[13px] font-bold text-emerald-400 tabular-nums">+{event.total}</span>
    </motion.div>
  )
}

// ─── XP Breakdown ───────────────────────────────────────────────────────────

function XPBreakdown({ events, todayXP }: { events: XPEvent[]; todayXP: number }) {
  const grouped = events.reduce<Record<string, { label: string; icon: string; total: number; count: number }>>((acc, e) => {
    if (!acc[e.type]) acc[e.type] = { label: e.label, icon: e.icon, total: 0, count: 0 }
    acc[e.type].total += e.amount
    acc[e.type].count += 1
    return acc
  }, {})

  const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="rounded-2xl bg-white/[0.015] border border-white/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[18px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <h3 className="text-[13px] font-bold text-white">Today's XP</h3>
        </div>
        {todayXP > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
            <span className="text-[12px] font-bold text-primary tabular-nums">+{todayXP}</span>
            <span className="text-[10px] text-primary/60">XP</span>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-800/50">
            <span className="material-symbols-outlined text-2xl text-slate-600">electric_bolt</span>
          </div>
          <p className="text-[12px] text-slate-500 font-medium">No XP earned yet today</p>
          <p className="text-[11px] text-slate-600">Complete a habit to start!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map(([type, data], i) => (
            <XPEventRow key={type} event={data} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function ProfileTab() {
  const {
    totalXP,
    weeklyXP,
    currentStreak,
    currentLeagueTier,
    getTodayXP,
    getTodayEvents,
    getTodaySummary,
    getUnlockedBadges,
    getLockedBadges,
    initializeBadges,
  } = useSocialStore()

  const { fullName, avatarUrl } = useProfileStore()
  const displayAvatar = avatarUrl || getAvatarFallbackUrl(fullName)
  const league = getLeagueConfig(currentLeagueTier)

  const { shouldShowDailySummary, dismissDailySummary, triggerDailySummary, checkSessionEndSummary } = useSocialStore()
  const [showSummary, setShowSummary] = useState(false)

  // Session end trigger (GAP 3 — priority 3)
  useEffect(() => { checkSessionEndSummary() }, [])

  // Auto-show when store triggers it
  useEffect(() => {
    if (shouldShowDailySummary) setShowSummary(true)
  }, [shouldShowDailySummary])
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => { initializeBadges() }, [])

  const todayXP = getTodayXP()
  const todayEvents = getTodayEvents()
  const todaySummary = getTodaySummary()
  const unlocked = getUnlockedBadges()
  const locked = getLockedBadges()
  const badges = badgeFilter === 'unlocked' ? unlocked : badgeFilter === 'locked' ? locked : [...unlocked, ...locked]

  return (
    <div className="space-y-5">
      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border border-white/[0.05] p-5">
        <div className="pointer-events-none absolute -top-16 -right-16 size-36 rounded-full blur-3xl" style={{ backgroundColor: league.color + '12' }} />

        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-primary via-emerald-400 to-cyan-400 opacity-80" />
            <img src={displayAvatar} alt={fullName} className="relative size-14 rounded-2xl object-cover ring-2 ring-slate-800" />
            <div
              className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md shadow-md"
              style={{ backgroundColor: league.color + '33' }}
            >
              <span
                className="material-symbols-outlined text-[11px]"
                style={{ color: league.color, fontVariationSettings: "'FILL' 1" }}
              >
                {league.icon}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{fullName}</h2>
            <p className="text-[11px] text-slate-400 font-medium">{league.label}</p>
          </div>
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary cursor-pointer hover:bg-primary/20 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-sm">summarize</span>
            Summary
          </button>
        </div>

        {/* XP bar */}
        <div className="relative mt-4">
          <XPProgressBar totalXP={totalXP} size="md" />
        </div>

        {/* Stat pills */}
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { v: totalXP.toLocaleString(), l: 'Total XP', c: 'text-white' },
            { v: weeklyXP.toLocaleString(), l: 'This Week', c: 'text-emerald-400' },
            { v: `${currentStreak}d`, l: 'Streak', c: 'text-orange-400' },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center rounded-xl bg-white/[0.03] py-2.5">
              <span className={`text-base font-bold ${s.c} tabular-nums`}>{s.v}</span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* XP Breakdown */}
      <XPBreakdown events={todayEvents} todayXP={todayXP} />

      {/* Manual summary trigger (GAP 3 — priority 2) */}
      <button
        onClick={() => {
          triggerDailySummary()
          setShowSummary(true)
        }}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/[0.02] border border-white/[0.04] py-3 text-[12px] font-semibold text-slate-400 cursor-pointer hover:bg-white/[0.04] hover:text-white transition-all duration-200"
      >
        <span className="material-symbols-outlined text-sm">summarize</span>
        See Today's Summary
      </button>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-white">Badges</h3>
            <span className="flex h-5 items-center rounded-md bg-white/[0.04] border border-white/[0.06] px-1.5 text-[10px] font-bold text-primary tabular-nums">
              {unlocked.length}/{unlocked.length + locked.length}
            </span>
          </div>
          <div className="flex gap-0.5 rounded-lg bg-white/[0.02] border border-white/[0.04] p-0.5">
            {(['all', 'unlocked', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setBadgeFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-all duration-200 ${
                  badgeFilter === f
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {badges.map((b, i) => (
              <SocialBadgeCard key={b.id} badge={b} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-600">military_tech</span>
            <p className="text-[12px] text-slate-400 font-medium">No badges to show</p>
          </div>
        )}
      </div>

      {/* Daily Summary modal */}
      <AnimatePresence>
        {showSummary && (
          <DailyXPSummaryCard
            summary={todaySummary}
            totalXP={totalXP}
            currentStreak={currentStreak}
            isOpen={showSummary}
            onClose={() => {
              setShowSummary(false)
              dismissDailySummary()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
