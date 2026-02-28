/**
 * TypingIndicator
 * Modern typing indicator matching the received bubble style.
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'

interface TypingIndicatorProps {
  conversationId: string
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useMessagingStore((s) => s.typingUsers[conversationId] ?? [])
  const reduced = useReducedMotion()

  if (typingUsers.length === 0) return null

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].displayName} is typing…`
      : typingUsers.length === 2
        ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing…`
        : `${typingUsers.length} people are typing…`

  const srText = text.replace('…', '')

  return (
    <div className="flex items-end gap-2 px-1" role="status" aria-live="polite">
      <span className="sr-only">{srText}</span>

      <div className="rounded-[18px] rounded-bl-[6px] border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {reduced ? (
            <span className="text-[12px] text-white/35">• • •</span>
          ) : (
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-[6px] rounded-full bg-white/35"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -5, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
              />
            ))
          )}
        </div>
      </div>

      <span className="pb-1 text-[11px] text-white/30" aria-hidden="true">
        {text}
      </span>
    </div>
  )
}
