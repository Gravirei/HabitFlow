/**
 * TypingIndicator
 * Animated typing indicator with 3 pulsing dots and user name display
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'

interface TypingIndicatorProps {
  conversationId: string
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useMessagingStore(
    (state) => state.typingUsers[conversationId] ?? []
  )
  const prefersReducedMotion = useReducedMotion()

  if (typingUsers.length === 0) {
    return null
  }

  // Build display text based on user count
  let typingText: string
  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0].displayName} is typing...`
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing...`
  } else {
    typingText = `${typingUsers.length} people are typing...`
  }

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 350 }}
    >
      {/* Dots container */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.05]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-white/40"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.2, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </div>

      {/* Typing text */}
      <span className="text-xs text-white/40">{typingText}</span>
    </motion.div>
  )
}
