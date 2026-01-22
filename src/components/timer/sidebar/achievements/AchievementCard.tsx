/**
 * Achievement Card Component
 * Displays individual achievement with progress and unlock status
 */

import React from 'react'
import { motion } from 'framer-motion'
import type { Achievement } from './types'
import {
  getRarityColor,
  getRarityGlow,
  getCategoryColor,
  formatAchievementProgress,
  getRarityLabel,
} from './achievementTracking'

interface AchievementCardProps {
  achievement: Achievement
  index?: number
}

export function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const { name, description, icon, rarity, category, unlocked, progress, requirement } = achievement
  
  const progressPercentage = Math.min(100, (progress / requirement) * 100)
  const isLocked = !unlocked

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative rounded-2xl overflow-hidden transition-all
        ${isLocked 
          ? 'bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-white/5' 
          : `bg-gradient-to-br ${getRarityColor(rarity)} shadow-lg ${getRarityGlow(rarity)}`
        }
      `}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/20 backdrop-blur-[1px] z-10" />
      )}

      <div className={`p-4 ${isLocked ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className={`
              size-12 rounded-xl flex items-center justify-center flex-shrink-0
              ${isLocked 
                ? 'bg-slate-200 dark:bg-slate-700' 
                : 'bg-white/20 backdrop-blur-sm'
              }
            `}
          >
            <span
              className={`
                material-symbols-outlined text-[28px]
                ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-white'}
              `}
            >
              {isLocked ? 'lock' : icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`
                  font-bold text-base leading-tight
                  ${isLocked 
                    ? 'text-slate-700 dark:text-slate-300' 
                    : 'text-white'
                  }
                `}
              >
                {name}
              </h3>
              
              {/* Rarity Badge */}
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0
                  ${isLocked
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    : 'bg-white/20 text-white'
                  }
                `}
              >
                {getRarityLabel(rarity)}
              </span>
            </div>

            <p
              className={`
                text-xs leading-relaxed
                ${isLocked 
                  ? 'text-slate-600 dark:text-slate-400' 
                  : 'text-white/90'
                }
              `}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {isLocked && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getRarityColor(rarity)} rounded-full`}
              />
            </div>

            {/* Progress Text */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {formatAchievementProgress(achievement)}
              </span>
              <span className="text-slate-500 dark:text-slate-500 font-bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        )}

        {/* Unlocked Badge */}
        {unlocked && achievement.unlockedAt && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
            <span className="material-symbols-outlined text-white text-[16px]">
              check_circle
            </span>
            <span className="text-[11px] text-white/80 font-medium">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Category Badge (Bottom Left Corner) */}
        <div className="absolute bottom-2 left-2">
          <div
            className={`
              px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider
              ${getCategoryColor(category)}
            `}
          >
            {category}
          </div>
        </div>
      </div>

      {/* Shine Effect for Unlocked */}
      {unlocked && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
    </motion.div>
  )
}
