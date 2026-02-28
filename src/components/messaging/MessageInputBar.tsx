/**
 * MessageInputBar — Bottom input bar with share tray
 * Sticky bottom bar with auto-expanding textarea, share tray for rich content,
 * and full accessibility support
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'

// ─── Props ──────────────────────────────────────────────────────────────────

interface MessageInputBarProps {
  recipientName: string
  onSend: (content: string) => void
  onShareHabit: () => void
  onShareBadge: () => void
  onSendNudge: () => void
}

// ─── Share Tray Items ───────────────────────────────────────────────────────

const SHARE_TRAY_ITEMS = [
  { id: 'habit', label: 'Habit', icon: 'check_circle', color: 'text-emerald-400', ariaLabel: 'Share a habit completion' },
  { id: 'badge', label: 'Badge', icon: 'military_tech', color: 'text-amber-400', ariaLabel: 'Share a badge' },
  { id: 'nudge', label: 'Nudge', icon: 'notifications', color: 'text-orange-400', ariaLabel: 'Send a nudge' },
] as const

// ─── Component ──────────────────────────────────────────────────────────────

export function MessageInputBar({
  recipientName,
  onSend,
  onShareHabit,
  onShareBadge,
  onSendNudge,
}: MessageInputBarProps) {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { shareTrayOpen, toggleShareTray } = useMessagingStore()

  const hasContent = inputValue.trim().length > 0

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [inputValue])

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleShareAction = (id: string) => {
    if (id === 'habit') onShareHabit()
    else if (id === 'badge') onShareBadge()
    else if (id === 'nudge') onSendNudge()
    toggleShareTray()
  }

  const trayTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, damping: 25, stiffness: 300 }

  return (
    <div className="sticky bottom-0 z-10 border-t border-white/[0.05] bg-[#0F1117]/95 backdrop-blur-xl">
      {/* Share Tray */}
      <AnimatePresence>
        {shareTrayOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={trayTransition}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div
              className="grid grid-cols-3 gap-3 p-4"
              role="menu"
              aria-label="Share options"
            >
              {SHARE_TRAY_ITEMS.map((item) => (
                <button
                  key={item.id}
                  role="menuitem"
                  onClick={() => handleShareAction(item.id)}
                  aria-label={item.ariaLabel}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.025] border border-white/[0.04] py-4 hover:bg-white/[0.04] transition-colors cursor-pointer active:scale-95"
                >
                  <span
                    className={`material-symbols-outlined text-[24px] ${item.color}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Row */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        {/* Plus / Attachment button */}
        <motion.button
          animate={{ rotate: shareTrayOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleShareTray}
          className="flex items-center justify-center size-10 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
          aria-label={shareTrayOpen ? 'Close share options' : 'Open share options'}
          aria-expanded={shareTrayOpen}
        >
          <span className="material-symbols-outlined text-[24px] text-slate-400 hover:text-teal-400 transition-colors">
            add_circle
          </span>
        </motion.button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${recipientName}...`}
          rows={1}
          role="textbox"
          aria-label="Type a message"
          aria-multiline="true"
          className="flex-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-[14px] text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all duration-200 min-h-[40px] max-h-[120px]"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!hasContent}
          className={`flex items-center justify-center size-10 rounded-full flex-shrink-0 transition-all duration-200 active:scale-95 ${
            hasContent
              ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 cursor-pointer'
              : 'bg-white/[0.04] text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
          aria-disabled={!hasContent}
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  )
}
