// @ts-nocheck
/**
 * Achievements Modal Component
 * Modal for viewing and managing achievements
 */

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AchievementsPanel } from './AchievementsPanel'
import { useAchievementsStore } from '@/features/timer/store/achievementsStore'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements, initializeAchievements } = useAchievementsStore()

  // Initialize achievements on mount
  useEffect(() => {
    initializeAchievements()
  }, [initializeAchievements])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievements-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1E1E24]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#1E1E24]">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  id="achievements-title"
                  className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white"
                >
                  <span className="material-symbols-outlined text-[24px] text-primary">
                    emoji_events
                  </span>
                  Achievements
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Unlock badges and track your milestones
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close achievements"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AchievementsPanel achievements={achievements} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
