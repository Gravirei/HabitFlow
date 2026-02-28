/**
 * ReactionRow
 * Displays reaction pills below a message with emoji counts and toggle interaction
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { MessageReaction } from './types'
import { useMessagingStore } from './messagingStore'

interface ReactionRowProps {
  reactions: MessageReaction[]
  messageId: string
}

export function ReactionRow({ reactions, messageId }: ReactionRowProps) {
  const prefersReducedMotion = useReducedMotion()

  if (reactions.length === 0) {
    return null
  }

  const handleToggle = (emoji: string, hasCurrentUser: boolean) => {
    const store = useMessagingStore.getState()
    if (hasCurrentUser) {
      store.removeReaction(messageId, emoji)
    } else {
      store.addReaction(messageId, emoji)
    }
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          type="button"
          layout={!prefersReducedMotion}
          initial={
            prefersReducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.8 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', damping: 20, stiffness: 300 }
          }
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={() => handleToggle(reaction.emoji, reaction.hasCurrentUser)}
          aria-label={`${reaction.count} ${reaction.emoji} reaction${reaction.count > 1 ? 's' : ''}, click to ${reaction.hasCurrentUser ? 'remove' : 'add'}`}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
            reaction.hasCurrentUser
              ? 'bg-teal-500/15 border border-teal-400/30 text-teal-300'
              : 'bg-white/[0.06] border border-white/[0.05] text-white/70'
          }`}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </motion.button>
      ))}
    </div>
  )
}
