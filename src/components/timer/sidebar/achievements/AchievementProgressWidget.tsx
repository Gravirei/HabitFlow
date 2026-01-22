/**
 * Achievement Progress Widget
 * Small widget showing achievement progress
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAchievementsStore } from './achievementsStore'
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
      className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-[28px]">
            emoji_events
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="text-white font-bold text-sm mb-1">
            Achievements
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <span className="text-white/90 text-xs font-bold">
              {stats.unlockedAchievements}/{stats.totalAchievements}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <span className="material-symbols-outlined text-white/80 text-[20px]">
          arrow_forward
        </span>
      </div>

      {/* Next to Unlock */}
      {stats.nextToUnlock.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-white/70 text-xs mb-1">Next to unlock:</p>
          <p className="text-white text-xs font-medium truncate">
            {stats.nextToUnlock[0].name}
          </p>
        </div>
      )}
    </motion.button>
  )
}
