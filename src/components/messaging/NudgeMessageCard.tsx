/**
 * NudgeMessageCard
 * Amber/orange tinted card displaying a nudge message with optional cooldown indicator
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { NudgeCardPayload } from './types'
import { MESSAGING_ANIMATIONS } from './constants'

interface NudgeMessageCardProps {
  payload: NudgeCardPayload
  senderName: string
  isOwnMessage?: boolean
}

export function NudgeMessageCard({ payload, senderName }: NudgeMessageCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const animProps = prefersReducedMotion
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  const isCooldownActive = new Date(payload.cooldownExpiry) > new Date()

  return (
    <motion.div
      {...animProps}
      className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 border-l-[3px] border-l-amber-400"
    >
      <div className="p-3">
        {/* Row 1: Bell icon + sender/message */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-amber-400 text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications_active
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-300/80 font-medium">
              {senderName} sent a nudge
            </p>
            <p className="text-sm text-white/90 mt-0.5">{payload.message}</p>
          </div>
        </div>

        {/* Row 2: Cooldown indicator (conditional) */}
        {isCooldownActive && (
          <div className="mt-2 pt-2 border-t border-amber-500/10">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px' }}
              >
                schedule
              </span>
              <span>Cooldown active</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
