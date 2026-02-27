/**
 * League Screen — Competitive tiers: Bronze → Silver → Gold → Platinum → Diamond
 * Visual promotion/demotion zones, league timer, tier progress
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { getLeagueConfig, getLeagueTierColor, getLeagueTierGradient } from './constants'
import type { LeagueTier, LeagueMember } from './types'

// ─── Tier Badge ─────────────────────────────────────────────────────────────

function TierBadge({ tier, size = 'md' }: { tier: LeagueTier; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = getLeagueConfig(tier)
  const s = {
    sm: { w: 'size-10', icon: 'text-xl', label: 'text-[9px]' },
    md: { w: 'size-14', icon: 'text-3xl', label: 'text-[10px]' },
    lg: { w: 'size-20', icon: 'text-4xl', label: 'text-xs' },
  }[size]

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${s.w} rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg relative overflow-hidden`}
      >
        <span
          className={`material-symbols-outlined ${s.icon} text-white drop-shadow-md`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {cfg.icon}
        </span>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          style={{ transform: 'skewX(-20deg)' }}
        />
      </motion.div>
      <span className={`${s.label} font-bold text-white`}>{cfg.label}</span>
    </div>
  )
}

// ─── Tier Progress Dots ─────────────────────────────────────────────────────

function TierProgress({ current }: { current: LeagueTier }) {
  const tiers: LeagueTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
  const idx = tiers.indexOf(current)

  return (
    <div className="flex items-center justify-center gap-1 w-full">
      {tiers.map((tier, i) => {
        const active = i <= idx
        const isCurrent = i === idx
        return (
          <div key={tier} className="flex items-center gap-1 flex-1">
            {/* Dot */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                active ? `bg-gradient-to-r ${getLeagueTierGradient(tier)}` : 'bg-slate-700/40'
              }`} />
              <span
                className={`material-symbols-outlined text-[13px] transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
                style={{
                  color: active ? getLeagueTierColor(tier) : '#475569',
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {tier === 'diamond' || tier === 'platinum' ? 'diamond' : 'shield'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Member Row ─────────────────────────────────────────────────────────────

function MemberRow({ member, index }: { member: LeagueMember; index: number }) {
  const zoneBorder = {
    promotion: 'border-l-emerald-500/60',
    safe: 'border-l-transparent',
    demotion: 'border-l-red-500/60',
  }[member.zone]

  const zoneBg = {
    promotion: member.rank <= 3 ? 'bg-emerald-500/[0.04]' : '',
    safe: '',
    demotion: 'bg-red-500/[0.03]',
  }[member.zone]

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, ease: 'easeOut' }}
      className={`
        flex items-center gap-2.5 rounded-xl px-3 py-2 border-l-2
        transition-all duration-200
        ${zoneBorder} ${zoneBg}
        ${member.isCurrentUser
          ? 'bg-primary/[0.07] border-l-primary/60'
          : 'hover:bg-white/[0.02]'
        }
      `}
    >
      {/* Rank */}
      <div className="flex size-7 items-center justify-center flex-shrink-0">
        {member.rank <= 3 ? (
          <div
            className={`flex size-6 items-center justify-center rounded-md bg-gradient-to-br shadow-sm ${
              member.rank === 1
                ? 'from-yellow-400 to-amber-500 shadow-yellow-500/20'
                : member.rank === 2
                ? 'from-slate-300 to-gray-400 shadow-gray-400/20'
                : 'from-amber-600 to-yellow-700 shadow-amber-700/20'
            }`}
          >
            <span className="text-[10px] font-black text-white">{member.rank}</span>
          </div>
        ) : (
          <span className="text-[11px] font-bold text-slate-500 tabular-nums">{member.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <img
        src={member.avatarUrl}
        alt={member.displayName}
        className="size-8 rounded-lg object-cover flex-shrink-0"
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-medium truncate ${
          member.isCurrentUser ? 'text-primary font-semibold' : 'text-white'
        }`}>
          {member.isCurrentUser ? 'You' : member.displayName}
        </p>
      </div>

      {/* XP */}
      <span className="text-[12px] font-bold text-slate-300 tabular-nums flex-shrink-0">
        {member.weeklyXP}
        <span className="text-[9px] text-slate-500 ml-0.5">XP</span>
      </span>

      {/* Zone arrow */}
      {member.zone === 'promotion' && (
        <span className="material-symbols-outlined text-[14px] text-emerald-400 flex-shrink-0">north</span>
      )}
      {member.zone === 'demotion' && (
        <span className="material-symbols-outlined text-[14px] text-red-400 flex-shrink-0">south</span>
      )}
    </motion.div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function LeagueScreen() {
  const { currentLeagueTier, leagueMembers, refreshLeague, getLeagueDaysRemaining } = useSocialStore()
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    refreshLeague()
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const days = getLeagueDaysRemaining()
  const visible = showAll ? leagueMembers : leagueMembers.slice(0, 10)
  const me = leagueMembers.find((m) => m.isCurrentUser)

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border border-white/[0.05] p-5 text-center">
        {/* Ambient */}
        <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full blur-3xl" style={{ backgroundColor: getLeagueTierColor(currentLeagueTier) + '15' }} />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-32 rounded-full blur-3xl" style={{ backgroundColor: getLeagueTierColor(currentLeagueTier) + '10' }} />

        <div className="relative">
          <TierBadge tier={currentLeagueTier} size="lg" />

          {/* Timer pill */}
          <div className="inline-flex items-center gap-1.5 mt-4 rounded-full bg-white/[0.05] border border-white/[0.06] py-1.5 px-4">
            <span className="material-symbols-outlined text-[14px] text-slate-400">timer</span>
            <span className="text-[12px] font-semibold text-white">
              {days} day{days !== 1 ? 's' : ''} left
            </span>
          </div>

          {/* Tier progress */}
          <div className="mt-4">
            <TierProgress current={currentLeagueTier} />
          </div>

          {/* Position */}
          {me && (
            <div className="mt-3 flex items-center justify-center gap-4 text-[12px]">
              <span className="text-slate-400">Rank</span>
              <span className="font-bold text-primary">#{me.rank}</span>
              <span className="text-slate-700">·</span>
              <span className="font-bold text-white">{me.weeklyXP} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-medium">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-400">Promote (Top 5)</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-slate-600" />
          <span className="text-slate-400">Safe</span>
        </span>
        {currentLeagueTier !== 'bronze' && (
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-red-400" />
            <span className="text-slate-400">Demote (Bottom 5)</span>
          </span>
        )}
      </div>

      {/* Members */}
      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2 animate-pulse">
              <div className="size-6 rounded-md bg-slate-700/30" />
              <div className="size-8 rounded-lg bg-slate-700/30" />
              <div className="flex-1"><div className="h-3 w-20 rounded bg-slate-700/30" /></div>
              <div className="h-3 w-10 rounded bg-slate-700/30" />
            </div>
          ))}
        </div>
      ) : leagueMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-800/40 border border-dashed border-slate-700/50">
            <span className="material-symbols-outlined text-4xl text-slate-600">shield</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400">No league yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Earn XP to join a league!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {visible.map((m, i) => (
              <MemberRow key={m.userId} member={m} index={i} />
            ))}
          </div>

          {leagueMembers.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] py-2.5 text-[11px] font-semibold text-slate-400 cursor-pointer hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-sm">
                {showAll ? 'expand_less' : 'expand_more'}
              </span>
              {showAll ? 'Show Less' : `Show All ${leagueMembers.length}`}
            </button>
          )}
        </>
      )}

      {/* Info card */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">How It Works</h4>
        <div className="space-y-2 text-[11px] text-slate-400">
          {[
            { icon: 'north', color: 'text-emerald-400', text: 'Top 5 promote to the next league each week' },
            ...(currentLeagueTier !== 'bronze'
              ? [{ icon: 'south', color: 'text-red-400', text: 'Bottom 5 move down — every week is a fresh start!' }]
              : []),
            { icon: 'restart_alt', color: 'text-primary', text: 'Weekly reset every Monday — earn XP to climb' },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-2">
              <span className={`material-symbols-outlined text-sm mt-px ${item.color}`}>{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
