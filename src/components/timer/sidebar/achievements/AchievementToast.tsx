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
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] max-w-md w-full mx-4"
        onClick={onClose}
      >
        <div
          className={`
            relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer
            bg-gradient-to-br ${getRarityColor(rarity)}
          `}
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
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
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
                className="size-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
              >
                <span className="material-symbols-outlined text-white text-[32px]">
                  {icon}
                </span>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Achievement Unlocked!
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white">
                      {getRarityLabel(rarity)}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">
                    {name}
                  </h3>
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
                <span className="material-symbols-outlined text-white text-[24px]">
                  emoji_events
                </span>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
