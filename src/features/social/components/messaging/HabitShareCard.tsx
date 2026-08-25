/**
 * HabitShareCard — Modern rich habit completion card
 * Styled to match habitflow-messaging-v2.html (header label + tags + actions)
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
  const reduced = useReducedMotion()
  const anim = reduced
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  return (
    <motion.div
      {...anim}
      className="group w-full max-w-[310px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
      role="article"
      aria-label={`Habit completed: ${payload.habitName}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-teal-300/15 bg-gradient-to-br from-teal-300/[0.14] to-emerald-300/[0.06] px-4 py-3">
        <span
          className="material-symbols-outlined text-[16px] text-teal-200"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          check_circle
        </span>
        <span className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-teal-200/90">
          Habit completed
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl border border-teal-300/15 bg-teal-300/[0.08] flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[20px] text-teal-200"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              {payload.habitIcon || 'task_alt'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-extrabold tracking-tight text-white">
              {payload.habitName}
            </div>
            <div className="mt-0.5 text-[11px] text-white/35">Completed</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1 text-[11px] font-semibold text-amber-200">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            {payload.streakCount}-day streak
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/[0.07] px-3 py-1 text-[11px] font-semibold text-teal-200">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            +{payload.xpEarned} XP
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/[0.08] px-4 py-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/[0.10] px-3 py-2 text-[12px] font-semibold text-teal-200 hover:bg-teal-300/[0.16] transition-colors cursor-pointer"
          aria-label="React to habit completion"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mood
          </span>
          React
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[12px] font-semibold text-white/65 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          aria-label="Send a nudge"
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications_active
          </span>
          Nudge
        </button>
      </div>
    </motion.div>
  )
}
