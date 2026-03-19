/**
 * MessageInputBar — modern input area with share tray and send affordances
 * Inspired by habitflow-messaging-v2.html input zone.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useHabitStore } from '@/store/useHabitStore'
import { useSocialStore } from '../social/socialStore'
import { MESSAGING_ANIMATIONS, MESSAGING_LIMITS } from './constants'

interface MessageInputBarProps {
  onSend: (text: string) => void
  onShareHabit: (habitId: string) => void
  onShareBadge: (badgeId: string) => void
  onSendNudge: () => void
  onTyping: (isTyping: boolean) => void
  shareTrayOpen: boolean
  onToggleShareTray: () => void
}

export function MessageInputBar({
  onSend,
  onShareHabit,
  onShareBadge,
  onSendNudge,
  onTyping,
  shareTrayOpen,
  onToggleShareTray,
}: MessageInputBarProps) {
  const reduced = useReducedMotion()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isTypingRef = useRef(false)

  // Get available habits and badges for sharing
  const habits = useHabitStore((s) => s.habits)
  const badges = useSocialStore((s) => s.badges)

  const canSend = text.trim().length > 0

  const trayAnim = reduced
    ? MESSAGING_ANIMATIONS.shareTrayEntrance.reducedMotion
    : MESSAGING_ANIMATIONS.shareTrayEntrance.framerProps

  // Auto-grow up to ~4 lines
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 90)}px`
  }, [text])

  const send = () => {
    const t = text.trim().slice(0, MESSAGING_LIMITS.MAX_MESSAGE_LENGTH)
    if (!t) return
    // Stop typing indicator before sending
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTyping(false)
    }
    onSend(t)
    setText('')
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const hasText = e.target.value.length > 0
    if (hasText && !isTypingRef.current) {
      isTypingRef.current = true
      onTyping(true)
    } else if (!hasText && isTypingRef.current) {
      isTypingRef.current = false
      onTyping(false)
    }
  }

  return (
    <div className="bg-[#000000] px-3 pb-safe pt-2">
      <AnimatePresence>
        {shareTrayOpen && (
          <motion.div
            {...trayAnim}
            className="mb-3 grid grid-cols-3 gap-2 rounded-3xl bg-[#1C1C1E] p-2"
            role="menu"
            aria-label="Share options"
          >
            <button
              type="button"
              onClick={() => {
                const completedHabits = habits.filter((h) => h.completedDates.length > 0)
                const habitToShare = completedHabits[0] ?? habits[0]
                if (habitToShare) onShareHabit(habitToShare.id)
              }}
              className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-transparent py-3 transition-colors hover:bg-[#2C2C2E]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#32D74B]/10 text-[#32D74B]">
                <span className="material-symbols-outlined text-[26px]">check_circle</span>
              </div>
              <span className="mt-1 text-[12px] font-medium text-[#8E8E93]">Habit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const unlockedBadges = badges.filter((b) => b.unlockedAt)
                const badgeToShare = unlockedBadges[0] ?? badges[0]
                if (badgeToShare) onShareBadge(badgeToShare.id)
              }}
              className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-transparent py-3 transition-colors hover:bg-[#2C2C2E]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#5E5CE6]/10 text-[#5E5CE6]">
                <span className="material-symbols-outlined text-[26px]">military_tech</span>
              </div>
              <span className="mt-1 text-[12px] font-medium text-[#8E8E93]">Badge</span>
            </button>

            <button
              type="button"
              onClick={onSendNudge}
              className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-transparent py-3 transition-colors hover:bg-[#2C2C2E]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#FF9F0A]/10 text-[#FF9F0A]">
                <span className="material-symbols-outlined text-[26px]">notifications_active</span>
              </div>
              <span className="mt-1 text-[12px] font-medium text-[#8E8E93]">Nudge</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 pb-2">
        <button
          type="button"
          onClick={onToggleShareTray}
          className="mb-1 flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#2C2C2E] text-[#8E8E93] transition-colors hover:bg-[#3A3A3C] hover:text-white"
        >
          <span className={`material-symbols-outlined text-[24px] ${shareTrayOpen ? 'rotate-45' : ''}`}
                style={{ transition: 'transform 200ms ease' }}>
            add
          </span>
        </button>

        <div className="flex min-h-[36px] flex-1 items-end rounded-[20px] border border-[#38383A] bg-[#1C1C1E] px-4 py-2 focus-within:border-[#8E8E93]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="iMessage"
            rows={1}
            className="w-full resize-none bg-transparent text-[16px] leading-[22px] text-white placeholder:text-[#8E8E93] outline-none max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend) send()
              }
            }}
          />
        </div>

        {canSend && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            type="button"
            onClick={send}
            className="mb-1 flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#32D74B] text-white transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">arrow_upward</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
