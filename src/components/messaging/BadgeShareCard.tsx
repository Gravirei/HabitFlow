/**
 * BadgeShareCard
 * Rarity-colored glass card displaying a badge unlock or level-up achievement
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

function getRarityGradient(rarity: BadgeRarity): string {
  const gradients: Record<BadgeRarity, string> = {
    common: 'from-slate-500/20 to-slate-400/10',
    rare: 'from-blue-500/20 to-cyan-400/10',
    epic: 'from-purple-500/20 to-pink-400/10',
    legendary: 'from-amber-500/20 to-orange-400/10',
  }
  return gradients[rarity]
}

function getRarityAccent(rarity: BadgeRarity): string {
  const accents: Record<BadgeRarity, string> = {
    common: 'border-l-slate-400',
    rare: 'border-l-blue-400',
    epic: 'border-l-purple-400',
    legendary: 'border-l-amber-400',
  }
  return accents[rarity]
}

function getRarityIconBg(rarity: BadgeRarity): string {
  const bgs: Record<BadgeRarity, string> = {
    common: 'bg-slate-500/20',
    rare: 'bg-blue-500/20',
    epic: 'bg-purple-500/20',
    legendary: 'bg-amber-500/20',
  }
  return bgs[rarity]
}

function getRarityTextColor(rarity: BadgeRarity): string {
  const colors: Record<BadgeRarity, string> = {
    common: 'text-slate-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  }
  return colors[rarity]
}

export function BadgeShareCard({ payload }: BadgeShareCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const animProps = prefersReducedMotion
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  return (
    <motion.div
      {...animProps}
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${getRarityGradient(payload.badgeRarity)} border border-white/[0.05] border-l-[3px] ${getRarityAccent(payload.badgeRarity)}`}
    >
      <div className="p-3">
        {/* Rarity label pill — top right */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 ${getRarityTextColor(payload.badgeRarity)}`}
        >
          {payload.badgeRarity}
        </span>

        {/* Row 1: Badge icon + name/description */}
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-xl ${getRarityIconBg(payload.badgeRarity)} flex items-center justify-center flex-shrink-0`}
          >
            <span
              className={`material-symbols-outlined ${getRarityTextColor(payload.badgeRarity)} text-xl`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {payload.badgeIcon}
            </span>
          </div>
          <div className="flex-1 min-w-0 pr-14">
            <p className="text-sm font-semibold text-white">
              {payload.badgeName}
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {payload.badgeDescription}
            </p>
          </div>
        </div>

        {/* Row 2: Level transition (conditional) */}
        {payload.isLevelUp && (
          <div className="mt-2 pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`material-symbols-outlined ${getRarityTextColor(payload.badgeRarity)} text-sm`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                trending_up
              </span>
              <span className="text-white/80 font-medium">
                Level {payload.levelFrom} → Level {payload.levelTo}
              </span>
            </div>
          </div>
        )}

        {/* Row 3: XP earned (conditional) */}
        {payload.xpEarned && (
          <div
            className={`flex items-center gap-1 text-xs ${payload.isLevelUp ? 'mt-1.5' : 'mt-2 pt-2 border-t border-white/[0.05]'}`}
          >
            <span
              className="material-symbols-outlined text-amber-400 text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-white/70">+{payload.xpEarned} XP</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
