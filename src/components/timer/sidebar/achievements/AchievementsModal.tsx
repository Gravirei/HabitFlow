/**
 * Achievements Modal Component
 * Modal for viewing and managing achievements
 */

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AchievementsPanel } from './AchievementsPanel'
import { useAchievementsStore } from './achievementsStore'

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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
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
          className="bg-white dark:bg-[#1E1E24] rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#1E1E24] border-b border-slate-200 dark:border-white/10 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="achievements-title" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] text-primary">
                    emoji_events
                  </span>
                  Achievements
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Unlock badges and track your milestones
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close achievements"
                className="size-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
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
