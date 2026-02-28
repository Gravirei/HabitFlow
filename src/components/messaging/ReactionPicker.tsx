/**
 * ReactionPicker
 * Horizontal emoji picker overlay that appears above a message for quick reactions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { REACTION_EMOJIS, MESSAGING_ANIMATIONS } from './constants'
import { useMessagingStore } from './messagingStore'

interface ReactionPickerProps {
  messageId: string
  isVisible: boolean
  onClose: () => void
  /** Position anchor — picker appears above the message */
  anchorPosition?: 'left' | 'right'
}

export function ReactionPicker({
  messageId,
  isVisible,
  onClose,
  anchorPosition = 'left',
}: ReactionPickerProps) {
  const prefersReducedMotion = useReducedMotion()
  const animProps = prefersReducedMotion
    ? MESSAGING_ANIMATIONS.reactionPickerOpen.reducedMotion
    : MESSAGING_ANIMATIONS.reactionPickerOpen.framerProps

  const exitProps = prefersReducedMotion
    ? MESSAGING_ANIMATIONS.reactionPickerClose.reducedMotion
    : MESSAGING_ANIMATIONS.reactionPickerClose.framerProps

  // Read message reactions reactively to highlight already-reacted emojis
  const messageReactions = useMessagingStore((state) => {
    const conversationId = state.activeConversationId
    if (!conversationId) return []
    const messages = state.messages[conversationId] ?? []
    const message = messages.find((m) => m.id === messageId)
    return message?.reactions ?? []
  })

  const currentUserEmojis = new Set(
    messageReactions
      .filter((r) => r.hasCurrentUser)
      .map((r) => r.emoji)
  )

  const handleReaction = (emoji: string) => {
    useMessagingStore.getState().addReaction(messageId, emoji)
    onClose()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Transparent backdrop for click-away dismissal */}
          <div className="fixed inset-0 z-50" onClick={onClose} />

          {/* Picker container */}
          <motion.div
            {...animProps}
            exit={exitProps.exit}
            className={`absolute z-50 bottom-full mb-2 ${anchorPosition === 'right' ? 'right-0' : 'left-0'}`}
            role="toolbar"
            aria-label="React to message"
          >
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/30">
              {REACTION_EMOJIS.map((emoji) => {
                const isSelected = currentUserEmojis.has(emoji)
                return (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileTap={prefersReducedMotion ? undefined : { scale: 1.3 }}
                    onClick={() => handleReaction(emoji)}
                    aria-label={`React with ${emoji}`}
                    className={`size-9 flex items-center justify-center rounded-full text-lg transition-colors ${
                      isSelected
                        ? 'ring-2 ring-teal-400/60 bg-teal-500/10'
                        : 'hover:bg-white/[0.1]'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
