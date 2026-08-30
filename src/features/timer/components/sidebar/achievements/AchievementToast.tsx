// @ts-nocheck
/**
 * Achievement Toast Component
 * Toast notification for newly unlocked achievements
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from './types'
import { getRarityColor, getRarityLabel } from './achievementTracking'

interface AchievementToastProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  if (!achievement) return null

  const { name, icon, rarity } = achievement

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        className="fixed left-1/2 top-4 z-[300] mx-4 w-full max-w-md -translate-x-1/2"
        onClick={onClose}
      >
        <div
          className={`relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br shadow-2xl ${getRarityColor(rarity)} `}
        >
          {/* Shine Animation */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ transform: 'skewX(-20deg)' }}
          />

          <div className="relative p-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  delay: 0.1,
                }}
                className="flex size-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-[32px] text-white">{icon}</span>
              </motion.div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Achievement Unlocked!
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {getRarityLabel(rarity)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold leading-tight text-white">{name}</h3>
                </motion.div>
              </div>

              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  delay: 0.3,
                }}
              >
                <span className="material-symbols-outlined text-[24px] text-white">
                  emoji_events
                </span>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 origin-left bg-white/30"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
