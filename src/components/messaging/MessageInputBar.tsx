/**
 * MessageInputBar — modern input area with share tray and send affordances
 * Inspired by habitflow-messaging-v2.html input zone.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MESSAGING_ANIMATIONS } from './constants'

interface MessageInputBarProps {
  recipientName: string
  onSend: (text: string) => void
  onShareHabit: (habitId: string) => void
  onShareBadge: (badgeId: string) => void
  onSendNudge: () => void
  onTyping: (isTyping: boolean) => void
  shareTrayOpen: boolean
  onToggleShareTray: () => void
}

export function MessageInputBar({
  recipientName,
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

  const sendBtnClass = useMemo(() => {
    if (canSend) {
      return (
        'bg-gradient-to-br from-teal-300 to-emerald-300 text-[#050810] ' +
        'shadow-[0_10px_30px_rgba(0,229,204,0.25)] hover:shadow-[0_12px_36px_rgba(0,229,204,0.33)] '
      )
    }
    return 'bg-white/[0.06] border border-white/[0.08] text-white/25 cursor-not-allowed'
  }, [canSend])

  const send = () => {
    const t = text.trim()
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
    <div className="border-t border-white/[0.06] bg-[#0a0f1c]/75 backdrop-blur-2xl px-3.5 py-3">
      <AnimatePresence>
        {shareTrayOpen && (
          <motion.div
            {...trayAnim}
            className="mb-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.028] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            role="menu"
            aria-label="Share options"
          >
            <button
              type="button"
              onClick={() => onShareHabit('')}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-transparent p-3 text-left transition-all duration-200 hover:bg-white/[0.05] hover:border-teal-300/30 cursor-pointer"
              aria-label="Share habit completion"
            >
              <span
                className="material-symbols-outlined text-[22px] text-teal-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-white/60 group-hover:text-white/80">
                Habit
              </span>
            </button>

            <button
              type="button"
              onClick={() => onShareBadge('')}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-transparent p-3 transition-all duration-200 hover:bg-white/[0.05] hover:border-violet-300/30 cursor-pointer"
              aria-label="Share badge"
            >
              <span
                className="material-symbols-outlined text-[22px] text-violet-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-white/60 group-hover:text-white/80">
                Badge
              </span>
            </button>

            <button
              type="button"
              onClick={onSendNudge}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-transparent p-3 transition-all duration-200 hover:bg-white/[0.05] hover:border-amber-300/30 cursor-pointer"
              aria-label="Send nudge"
            >
              <span
                className="material-symbols-outlined text-[22px] text-amber-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications_active
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-white/60 group-hover:text-white/80">
                Nudge
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2.5">
        <div className="flex flex-1 items-end gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.028] px-3.5 py-2.5 backdrop-blur-xl focus-within:border-teal-300/30 focus-within:bg-teal-300/[0.04] focus-within:shadow-[0_0_0_4px_rgba(0,229,204,0.06)] transition-all duration-200">
          <button
            type="button"
            onClick={onToggleShareTray}
            className="flex size-8 items-center justify-center rounded-xl text-white/30 hover:text-teal-200 transition-colors cursor-pointer"
            aria-label={shareTrayOpen ? 'Close share tray' : 'Open share tray'}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${shareTrayOpen ? 'rotate-45' : ''}`}
              style={{ fontVariationSettings: "'FILL' 1", transition: reduced ? 'none' : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              add
            </span>
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={`Message ${recipientName}…`}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13.5px] leading-relaxed text-white placeholder:text-white/25 outline-none max-h-[90px]"
            aria-label="Message input"
            role="textbox"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend) send()
              }
            }}
          />
        </div>

        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className={`flex size-11 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${sendBtnClass}`}
          aria-label={canSend ? 'Send message' : 'Type a message to send'}
        >
          <span
            className="material-symbols-outlined text-[19px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            arrow_upward
          </span>
        </button>
      </div>
    </div>
  )
}
