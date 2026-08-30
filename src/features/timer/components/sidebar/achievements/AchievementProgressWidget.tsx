// @ts-nocheck
/**
 * Achievement Progress Widget
 * Small widget showing achievement progress
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievementsStore } from '@/features/timer/store/achievementsStore'
import { getAchievementStats } from './achievementTracking'

export function AchievementProgressWidget() {
  const navigate = useNavigate()
  const { achievements } = useAchievementsStore()
  const stats = getAchievementStats(achievements)

  if (achievements.length === 0) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/timer/achievements')}
      className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-4 shadow-lg transition-all hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[28px] text-white">emoji_events</span>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="mb-1 text-sm font-bold text-white">Achievements</h3>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <span className="text-xs font-bold text-white/90">
              {stats.unlockedAchievements}/{stats.totalAchievements}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <span className="material-symbols-outlined text-[20px] text-white/80">arrow_forward</span>
      </div>

      {/* Next to Unlock */}
      {stats.nextToUnlock.length > 0 && (
        <div className="mt-3 border-t border-white/20 pt-3">
          <p className="mb-1 text-xs text-white/70">Next to unlock:</p>
          <p className="truncate text-xs font-medium text-white">{stats.nextToUnlock[0].name}</p>
        </div>
      )}
    </motion.button>
  )
}
