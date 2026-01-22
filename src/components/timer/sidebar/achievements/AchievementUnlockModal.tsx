/**
 * Achievement Unlock Modal
 * Celebration modal when an achievement is unlocked
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from './types'
import { getRarityColor, getRarityLabel } from './achievementTracking'

interface AchievementUnlockModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
}

export function AchievementUnlockModal({
  achievement,
  isOpen,
  onClose,
}: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShowConfetti(false)
    }
  }, [isOpen, onClose])

  if (!isOpen || !achievement) return null

  const { name, description, icon, rarity } = achievement

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: 'easeOut',
                }}
                className={`absolute w-2 h-2 rounded-full ${
                  ['bg-primary', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-yellow-500'][
                    i % 5
                  ]
                }`}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          className="relative bg-white dark:bg-[#1E1E24] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(rarity)} opacity-10`} />

          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  scale: { delay: 0.2, type: 'spring', damping: 15 },
                  rotate: { delay: 0.5, duration: 0.5 },
                }}
                className="inline-block mb-4"
              >
                <div
                  className={`
                    size-24 rounded-full bg-gradient-to-br ${getRarityColor(rarity)} 
                    shadow-2xl ${getRarityColor(rarity).includes('orange') ? 'shadow-orange-500/50' : 'shadow-primary/50'}
                    flex items-center justify-center
                  `}
                >
                  <span className="material-symbols-outlined text-white text-[48px]">
                    {icon}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  Achievement Unlocked!
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`} />
                  <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    {getRarityLabel(rarity)}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Achievement Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-3"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Shine Animation */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              style={{ transform: 'skewX(-20deg)' }}
            />

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="mt-8 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Awesome!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
