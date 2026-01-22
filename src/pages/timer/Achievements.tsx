/**
 * Achievements Page
 * Full-page view for achievements with navigation
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AchievementsPanel } from '@/components/timer/sidebar/achievements/AchievementsPanel'
import { useAchievementsStore } from '@/components/timer/sidebar/achievements/achievementsStore'

export function Achievements() {
  const navigate = useNavigate()
  const { achievements, initializeAchievements } = useAchievementsStore()

  // Initialize achievements on mount
  useEffect(() => {
    initializeAchievements()
  }, [initializeAchievements])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1E1E24] border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[28px] text-primary">
                  emoji_events
                </span>
                Achievements
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Unlock badges and track your milestones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-6"
      >
        <AchievementsPanel achievements={achievements} />
      </motion.div>
    </div>
  )
}
