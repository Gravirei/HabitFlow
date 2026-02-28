/**
 * HabitShareCard
 * Glass morphism card displaying a habit completion share with streak and XP info
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HabitCardPayload } from './types'
import { MESSAGING_ANIMATIONS } from './constants'

interface HabitShareCardProps {
  payload: HabitCardPayload
  isOwnMessage?: boolean
}

export function HabitShareCard({ payload }: HabitShareCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const animProps = prefersReducedMotion
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  return (
    <motion.div
      {...animProps}
      className="rounded-2xl overflow-hidden bg-white/[0.025] border border-white/[0.05] border-l-[3px] border-l-teal-400"
    >
      <div className="p-3">
        {/* Row 1: Habit icon + name */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-teal-400 text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {payload.habitIcon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {payload.habitName}
            </p>
            <p className="text-xs text-white/50">Habit completed</p>
          </div>
        </div>

        {/* Row 2: Streak + XP */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.05]">
          <div className="flex items-center gap-1 text-xs">
            <span
              className="material-symbols-outlined text-orange-400 text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-white/70">
              {payload.streakCount} day streak
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span
              className="material-symbols-outlined text-amber-400 text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-white/70">+{payload.xpEarned} XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
