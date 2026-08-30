// @ts-nocheck
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
      className={`relative overflow-hidden rounded-2xl transition-all ${
        isLocked
          ? 'border-2 border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-800/50'
          : `bg-gradient-to-br ${getRarityColor(rarity)} shadow-lg ${getRarityGlow(rarity)}`
      } `}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 bg-slate-900/5 backdrop-blur-[1px] dark:bg-slate-900/20" />
      )}

      <div className={`p-4 ${isLocked ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex size-12 flex-shrink-0 items-center justify-center rounded-xl ${isLocked ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white/20 backdrop-blur-sm'} `}
          >
            <span
              className={`material-symbols-outlined text-[28px] ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-white'} `}
            >
              {isLocked ? 'lock' : icon}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3
                className={`text-base font-bold leading-tight ${isLocked ? 'text-slate-700 dark:text-slate-300' : 'text-white'} `}
              >
                {name}
              </h3>

              {/* Rarity Badge */}
              <span
                className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isLocked
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    : 'bg-white/20 text-white'
                } `}
              >
                {getRarityLabel(rarity)}
              </span>
            </div>

            <p
              className={`text-xs leading-relaxed ${isLocked ? 'text-slate-600 dark:text-slate-400' : 'text-white/90'} `}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {isLocked && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getRarityColor(rarity)} rounded-full`}
              />
            </div>

            {/* Progress Text */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {formatAchievementProgress(achievement)}
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-500">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        )}

        {/* Unlocked Badge */}
        {unlocked && achievement.unlockedAt && (
          <div className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3">
            <span className="material-symbols-outlined text-[16px] text-white">check_circle</span>
            <span className="text-[11px] font-medium text-white/80">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Category Badge (Bottom Left Corner) */}
        <div className="absolute bottom-2 left-2">
          <div
            className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white ${getCategoryColor(category)} `}
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
    </motion.div>
  )
}
