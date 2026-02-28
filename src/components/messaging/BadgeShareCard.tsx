/**
 * BadgeShareCard — Modern badge/level-up card
 * Styled to match habitflow-messaging-v2.html (top label + centered icon with sheen)
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { BadgeCardPayload } from './types'
import type { BadgeRarity } from '../social/types'
import { MESSAGING_ANIMATIONS } from './constants'

interface BadgeShareCardProps {
  payload: BadgeCardPayload
  isOwnMessage?: boolean
}

function rarityTheme(rarity: BadgeRarity) {
  const map: Record<BadgeRarity, { topBg: string; iconBg: string; accent: string; pill: string }> = {
    common: {
      topBg: 'from-slate-300/[0.10] to-slate-300/[0.03]',
      iconBg: 'from-slate-600 to-slate-500',
      accent: 'text-slate-200',
      pill: 'bg-slate-300/[0.08] border-slate-300/20 text-slate-200',
    },
    rare: {
      topBg: 'from-cyan-300/[0.10] to-blue-300/[0.03]',
      iconBg: 'from-indigo-500 to-sky-500',
      accent: 'text-cyan-200',
      pill: 'bg-cyan-300/[0.08] border-cyan-300/20 text-cyan-200',
    },
    epic: {
      topBg: 'from-violet-300/[0.12] to-fuchsia-300/[0.03]',
      iconBg: 'from-violet-600 to-fuchsia-500',
      accent: 'text-violet-200',
      pill: 'bg-violet-300/[0.08] border-violet-300/20 text-violet-200',
    },
    legendary: {
      topBg: 'from-amber-300/[0.12] to-orange-300/[0.03]',
      iconBg: 'from-amber-500 to-orange-500',
      accent: 'text-amber-200',
      pill: 'bg-amber-300/[0.08] border-amber-300/20 text-amber-200',
    },
  }
  return map[rarity]
}

export function BadgeShareCard({ payload }: BadgeShareCardProps) {
  const reduced = useReducedMotion()
  const anim = reduced
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  const theme = rarityTheme(payload.badgeRarity)

  return (
    <motion.div
      {...anim}
      className="group w-full max-w-[310px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
      role="article"
      aria-label={`Badge: ${payload.badgeName}`}
    >
      <div className={`flex items-center gap-2 border-b border-white/[0.08] bg-gradient-to-br ${theme.topBg} px-4 py-3`}>
        <span
          className={`material-symbols-outlined text-[16px] ${theme.accent}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          military_tech
        </span>
        <span className={`text-[10px] font-extrabold tracking-[0.14em] uppercase ${theme.accent}`}>
          {payload.isLevelUp ? 'Level up' : 'Badge unlocked'}
        </span>
        <span className={`ml-auto rounded-full border px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] uppercase ${theme.pill}`}>
          {payload.badgeRarity}
        </span>
      </div>

      <div className="px-4 py-4 text-center">
        <div className="relative mx-auto">
          <div
            className={`relative mx-auto flex size-[62px] items-center justify-center rounded-[18px] bg-gradient-to-br ${theme.iconBg} shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden`}
          >
            {!reduced && (
              <div
                className="absolute -left-1/2 -top-1/2 h-[200%] w-[60%] rotate-[20deg] bg-white/15"
                style={{ animation: 'hf_sheen 3.5s ease-in-out infinite' }}
                aria-hidden="true"
              />
            )}
            <span
              className="material-symbols-outlined text-[28px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              {payload.badgeIcon || 'emoji_events'}
            </span>
          </div>
        </div>

        <div className="mt-3 text-[15px] font-extrabold tracking-tight text-white">{payload.badgeName}</div>
        <div className="mt-1 text-[12px] text-white/55">{payload.badgeDescription}</div>

        {payload.isLevelUp && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/75">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            Level {payload.levelFrom} → Level {payload.levelTo}
          </div>
        )}

        {typeof payload.xpEarned === 'number' && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1.5 text-[11px] font-semibold text-amber-200">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            +{payload.xpEarned} XP
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.08] px-4 py-3">
        <button
          type="button"
          className="w-full rounded-xl border border-white/[0.10] bg-white/[0.03] py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          aria-label="React to badge"
        >
          <span className="material-symbols-outlined mr-2 align-[-2px] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mood
          </span>
          React
        </button>
      </div>

      {/* local keyframes without adding global css */}
      <style>
        {`@keyframes hf_sheen { 0%,100% { transform: translateX(-120%) rotate(20deg); } 50% { transform: translateX(320%) rotate(20deg); } }`}
      </style>
    </motion.div>
  )
}
