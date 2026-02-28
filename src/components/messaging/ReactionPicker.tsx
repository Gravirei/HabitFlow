/**
 * ReactionPicker
 * Horizontal emoji picker overlay that appears above a message for quick reactions.
 * Full keyboard navigation (Arrow keys, Enter/Space, Escape) and ARIA roles.
 */

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { REACTION_EMOJIS, MESSAGING_ANIMATIONS } from './constants'
import { useMessagingStore } from './messagingStore'

// ─── Emoji Label Map ────────────────────────────────────────────────────────

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

// ─── Props ──────────────────────────────────────────────────────────────────

interface ReactionPickerProps {
  messageId: string
  isVisible: boolean
  onClose: () => void
  /** Position anchor — picker appears above the message */
  anchorPosition?: 'left' | 'right'
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ReactionPicker({
  messageId,
  isVisible,
  onClose,
  anchorPosition = 'left',
}: ReactionPickerProps) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

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

  const handleReaction = useCallback((emoji: string) => {
    useMessagingStore.getState().addReaction(messageId, emoji)
    onClose()
  }, [messageId, onClose])

  // Auto-focus first emoji when picker opens
  useEffect(() => {
    if (isVisible && buttonRefs.current[0]) {
      buttonRefs.current[0].focus()
    }
  }, [isVisible])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const totalEmojis = REACTION_EMOJIS.length

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault()
        const nextIndex = (index + 1) % totalEmojis
        buttonRefs.current[nextIndex]?.focus()
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        const prevIndex = (index - 1 + totalEmojis) % totalEmojis
        buttonRefs.current[prevIndex]?.focus()
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
        // Trap focus within picker
        e.preventDefault()
        if (e.shiftKey) {
          const prevIndex = (index - 1 + totalEmojis) % totalEmojis
          buttonRefs.current[prevIndex]?.focus()
        } else {
          const nextIndex = (index + 1) % totalEmojis
          buttonRefs.current[nextIndex]?.focus()
        }
        break
      }
    }
  }, [handleReaction, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Transparent backdrop for click-away dismissal */}
          <div className="fixed inset-0 z-50" onClick={onClose} />

          {/* Picker container */}
          <motion.div
            ref={containerRef}
            {...animProps}
            exit={exitProps.exit}
            transition={prefersReducedMotion ? { duration: 0 } : animProps.transition}
            className={`absolute z-50 bottom-full mb-2 ${anchorPosition === 'right' ? 'right-0' : 'left-0'}`}
            role="radiogroup"
            aria-label="React to message"
          >
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] backdrop-blur-xl shadow-lg shadow-black/30">
              {REACTION_EMOJIS.map((emoji, index) => {
                const isSelected = currentUserEmojis.has(emoji)
                const label = EMOJI_LABELS[emoji] ?? emoji
                return (
                  <motion.button
                    key={emoji}
                    ref={(el) => { buttonRefs.current[index] = el }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${label} reaction`}
                    whileTap={prefersReducedMotion ? undefined : { scale: 1.3 }}
                    onClick={() => handleReaction(emoji)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    tabIndex={index === 0 ? 0 : -1}
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
