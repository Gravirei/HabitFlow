/**
 * ReactionRow
 * Modern reaction pills (glass + highlight) inspired by habitflow-messaging-v2.html
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
  const reduced = useReducedMotion()

  if (!reactions || reactions.length === 0) return null

  const handleToggle = (emoji: string, hasCurrentUser: boolean) => {
    const store = useMessagingStore.getState()
    if (hasCurrentUser) store.removeReaction(messageId, emoji)
    else store.addReaction(messageId, emoji)
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1.5 px-1">
      {reactions.map((r) => (
        <motion.button
          key={r.emoji}
          type="button"
          layout={!reduced}
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', damping: 18, stiffness: 320 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          onClick={() => handleToggle(r.emoji, r.hasCurrentUser)}
          aria-label={`${r.count} ${r.emoji} reaction${r.count === 1 ? '' : 's'}. Click to ${r.hasCurrentUser ? 'remove' : 'add'}.`}
          className={
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] transition-all duration-200 cursor-pointer ' +
            (r.hasCurrentUser
              ? 'bg-teal-300/[0.10] border border-teal-300/30 shadow-[0_10px_25px_rgba(0,229,204,0.10)]'
              : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05]')
          }
        >
          <span aria-hidden="true">{r.emoji}</span>
          <span className={
            'text-[11px] font-extrabold tracking-wide ' +
            (r.hasCurrentUser ? 'text-teal-200' : 'text-white/55')
          }>
            {r.count}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
