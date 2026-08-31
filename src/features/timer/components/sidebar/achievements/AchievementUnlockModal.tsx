/**
 * Achievement Unlock Modal
 * Celebration modal when an achievement is unlocked
 */

import { useEffect, useState } from 'react'
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
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
                className={`absolute h-2 w-2 rounded-full ${
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
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1E1E24]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(rarity)} opacity-10`}
          />

          <div className="relative p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  scale: { delay: 0.2, type: 'spring', damping: 15 },
                  rotate: { delay: 0.5, duration: 0.5 },
                }}
                className="mb-4 inline-block"
              >
                <div
                  className={`size-24 rounded-full bg-gradient-to-br ${getRarityColor(rarity)} shadow-2xl ${getRarityColor(rarity).includes('orange') ? 'shadow-orange-500/50' : 'shadow-primary/50'} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-[48px] text-white">{icon}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
                  Achievement Unlocked!
                </h2>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                  <span
                    className={`h-2 w-2 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`}
                  />
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
              className="space-y-3 text-center"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{name}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ transform: 'skewX(-20deg)' }}
            />

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/30"
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
