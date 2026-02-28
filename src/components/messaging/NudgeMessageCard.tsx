/**
 * NudgeMessageCard — Modern nudge card
 * Styled to match habitflow-messaging-v2.html (amber tint + icon box)
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

function formatCooldown(payload: NudgeCardPayload): string | null {
  const expiry = new Date(payload.cooldownExpiry)
  if (expiry <= new Date()) return null

  const diff = expiry.getTime() - Date.now()
  const mins = Math.ceil(diff / 60000)
  if (mins < 60) return `${mins}m cooldown`

  const hours = Math.ceil(mins / 60)
  return `${hours}h cooldown`
}

export function NudgeMessageCard({ payload, senderName }: NudgeMessageCardProps) {
  const reduced = useReducedMotion()
  const anim = reduced
    ? MESSAGING_ANIMATIONS.messageEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.messageEntrance.framerProps

  const cooldown = formatCooldown(payload)

  return (
    <motion.div
      {...anim}
      className="w-full max-w-[300px] rounded-[16px] border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 backdrop-blur-xl transition-all duration-200 hover:bg-amber-300/[0.11] hover:-translate-y-0.5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
      role="article"
      aria-label={`Nudge from ${senderName}`}
    >
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-2xl border border-amber-300/25 bg-amber-300/[0.12] flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-[19px] text-amber-200"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            notifications_active
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold tracking-tight text-amber-200">Nudge</div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-white/70">{payload.message}</div>

          {cooldown && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/55">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">schedule</span>
              {cooldown}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
