/**
 * ReactionPicker
 * Modern reaction picker overlay (dark glass) with keyboard navigation + ARIA.
 */

import { useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { REACTION_EMOJIS } from './constants'
import { useMessagingStore } from './messagingStore'

const EMOJI_LABELS: Record<string, string> = {
  '🔥': 'Fire',
  '💪': 'Strong',
  '👏': 'Clapping',
  '⭐': 'Star',
  '😄': 'Happy',
  '🎯': 'Bullseye',
  '🙌': 'Celebrate',
  '❤️': 'Heart',
}

interface ReactionPickerProps {
  messageId: string
  isVisible: boolean
  onClose: () => void
  anchorPosition?: 'left' | 'right'
}

export function ReactionPicker({
  messageId,
  isVisible,
  onClose,
  anchorPosition = 'left',
}: ReactionPickerProps) {
  const reduced = useReducedMotion()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const messageReactions = useMessagingStore((state) => {
    const conversationId = state.activeConversationId
    if (!conversationId) return []
    const list = state.messages[conversationId] ?? []
    const m = list.find((mm) => mm.id === messageId)
    return m?.reactions ?? []
  })

  const currentUserEmojis = new Set(messageReactions.filter((r) => r.hasCurrentUser).map((r) => r.emoji))

  const handleReaction = useCallback(
    (emoji: string) => {
      const store = useMessagingStore.getState()
      // Toggle: remove if current user already reacted with this emoji, otherwise add
      if (currentUserEmojis.has(emoji)) {
        store.removeReaction(messageId, emoji)
      } else {
        store.addReaction(messageId, emoji)
      }
      onClose()
    },
    [messageId, onClose, currentUserEmojis]
  )

  useEffect(() => {
    if (isVisible) {
      buttonRefs.current[0]?.focus()
    }
  }, [isVisible])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const total = REACTION_EMOJIS.length
      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault()
          buttonRefs.current[(index + 1) % total]?.focus()
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          buttonRefs.current[(index - 1 + total) % total]?.focus()
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          handleReaction(REACTION_EMOJIS[index])
          break
        }
        case 'Escape': {
          e.preventDefault()
          onClose()
          break
        }
        case 'Tab': {
          e.preventDefault()
          const next = e.shiftKey ? (index - 1 + total) % total : (index + 1) % total
          buttonRefs.current[next]?.focus()
          break
        }
      }
    },
    [handleReaction, onClose]
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50"
            onClick={onClose}
            aria-label="Close reaction picker"
          />

          <motion.div
            initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 10 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 360 }}
            className={`absolute z-[60] bottom-full mb-2 ${anchorPosition === 'right' ? 'right-0' : 'left-0'}`}
            role="radiogroup"
            aria-label="Pick a reaction"
          >
            <div className="flex items-center gap-1.5 rounded-[18px] border border-white/[0.12] bg-[#0f1628]/90 px-2.5 py-2 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              {REACTION_EMOJIS.map((emoji, idx) => {
                const on = currentUserEmojis.has(emoji)
                const label = EMOJI_LABELS[emoji] ?? 'Reaction'

                return (
                  <motion.button
                    key={emoji}
                    ref={(el) => {
                      buttonRefs.current[idx] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${label} reaction`}
                    tabIndex={idx === 0 ? 0 : -1}
                    onClick={() => handleReaction(emoji)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    whileTap={reduced ? undefined : { scale: 1.22 }}
                    className={
                      'flex size-[38px] items-center justify-center rounded-2xl text-[19px] transition-all duration-150 cursor-pointer ' +
                      (on
                        ? 'bg-teal-300/[0.10] ring-2 ring-teal-300/30'
                        : 'hover:bg-white/[0.06]')
                    }
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
