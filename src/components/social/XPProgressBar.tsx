/**
 * XP Progress Bar Component
 * Shows current level, XP progress, and level title
 * Used on profile, leaderboard, and social hub
 */

import { motion } from 'framer-motion'
import { getLevelForXP, getLevelProgress } from './constants'

interface XPProgressBarProps {
  totalXP: number
  size?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
  className?: string
}

export function XPProgressBar({ totalXP, size = 'md', showTitle = true, className = '' }: XPProgressBarProps) {
  const level = getLevelForXP(totalXP)
  const progress = getLevelProgress(totalXP)

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-[10px]', icon: 'text-sm', level: 'text-xs', wrapper: 'gap-1.5' },
    md: { bar: 'h-2.5', text: 'text-xs', icon: 'text-base', level: 'text-sm', wrapper: 'gap-2' },
    lg: { bar: 'h-3.5', text: 'text-sm', icon: 'text-lg', level: 'text-base', wrapper: 'gap-3' },
  }

  const s = sizeClasses[size]

  return (
    <div className={`flex flex-col ${s.wrapper} ${className}`}>
      {/* Level & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 px-2 py-0.5">
            <span className={`material-symbols-outlined ${s.icon} text-primary`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {level.icon}
            </span>
            <span className={`${s.level} font-bold text-primary ml-1`}>Lv.{level.level}</span>
          </div>
          {showTitle && (
            <span className={`${s.text} font-semibold text-slate-300`}>{level.title}</span>
          )}
        </div>
        <span className={`${s.text} font-medium text-slate-500`}>
          {progress.current.toLocaleString()} / {progress.required.toLocaleString()} XP
        </span>
      </div>

      {/* Progress Bar */}
      <div className={`relative w-full ${s.bar} rounded-full bg-slate-800 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-400"
        />
        {/* Shine effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ transform: 'skewX(-20deg)' }}
        />
      </div>
    </div>
  )
}
