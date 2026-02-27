/**
 * Social Badge Card
 * Displays an individual social badge with unlock status
 */

import { motion } from 'framer-motion'
import type { SocialBadge, BadgeRarity } from './types'

interface SocialBadgeCardProps {
  badge: SocialBadge
  index?: number
  compact?: boolean
}

function getRarityColor(rarity: BadgeRarity): string {
  const colors: Record<BadgeRarity, string> = {
    common: 'from-slate-500 to-slate-400',
    rare: 'from-blue-500 to-cyan-400',
    epic: 'from-purple-500 to-pink-400',
    legendary: 'from-amber-500 to-orange-400',
  }
  return colors[rarity]
}

function getRarityGlow(rarity: BadgeRarity): string {
  const glows: Record<BadgeRarity, string> = {
    common: '',
    rare: 'shadow-blue-500/20',
    epic: 'shadow-purple-500/20',
    legendary: 'shadow-amber-500/30',
  }
  return glows[rarity]
}

function getRarityLabel(rarity: BadgeRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

export function SocialBadgeCard({ badge, index = 0, compact = false }: SocialBadgeCardProps) {
  const { name, description, icon, rarity, unlocked } = badge
  const isLocked = !unlocked

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03 }}
        className={`
          flex size-14 items-center justify-center rounded-xl relative
          ${isLocked
            ? 'bg-slate-800/50 border border-slate-700/50'
            : `bg-gradient-to-br ${getRarityColor(rarity)} shadow-lg ${getRarityGlow(rarity)}`
          }
        `}
        title={`${name}: ${description}`}
      >
        <span
          className={`material-symbols-outlined text-2xl ${isLocked ? 'text-slate-600' : 'text-white'}`}
          style={{ fontVariationSettings: unlocked ? "'FILL' 1" : "'FILL' 0" }}
        >
          {isLocked ? 'lock' : icon}
        </span>
        {isLocked && (
          <div className="absolute inset-0 bg-slate-900/30 rounded-xl" />
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative rounded-2xl overflow-hidden transition-all
        ${isLocked
          ? 'bg-slate-800/50 border border-slate-700/50'
          : `bg-gradient-to-br ${getRarityColor(rarity)} shadow-lg ${getRarityGlow(rarity)}`
        }
      `}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] z-10" />
      )}

      <div className={`p-4 ${isLocked ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3">
          <div
            className={`
              size-11 rounded-xl flex items-center justify-center flex-shrink-0
              ${isLocked ? 'bg-slate-700/50' : 'bg-white/20 backdrop-blur-sm'}
            `}
          >
            <span
              className={`material-symbols-outlined text-[24px] ${isLocked ? 'text-slate-500' : 'text-white'}`}
              style={{ fontVariationSettings: unlocked ? "'FILL' 1" : "'FILL' 0" }}
            >
              {isLocked ? 'lock' : icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className={`font-bold text-sm ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                {name}
              </h3>
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                  ${isLocked
                    ? 'bg-slate-700/50 text-slate-500'
                    : 'bg-white/20 text-white'
                  }
                `}
              >
                {getRarityLabel(rarity)}
              </span>
            </div>
            <p className={`text-xs ${isLocked ? 'text-slate-500' : 'text-white/80'}`}>
              {description}
            </p>
          </div>
        </div>

        {unlocked && badge.earnedAt && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/15">
            <span className="material-symbols-outlined text-white/80 text-sm">check_circle</span>
            <span className="text-[11px] text-white/70 font-medium">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Shine for unlocked */}
      {unlocked && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
    </motion.div>
  )
}
