/**
 * MessageBubble — Single message bubble for conversation threads
 * Sent messages: right-aligned teal gradient, received: left-aligned glass
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Message, DeliveryStatus } from './types'

// ─── Props ──────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message
  isSent: boolean
  showAvatar: boolean
  senderName?: string
  senderAvatarUrl?: string
  isLastInGroup: boolean
  showSenderName?: boolean   // true for received messages in group chats
  senderColor?: string       // HSL color string from getSenderColor()
}

// ─── Delivery Status Icon Map ───────────────────────────────────────────────

const deliveryStatusConfig: Record<DeliveryStatus, { icon: string; className: string }> = {
  sending: { icon: 'schedule', className: 'text-white/40' },
  sent: { icon: 'check', className: 'text-white/60' },
  delivered: { icon: 'done_all', className: 'text-white/60' },
  read: { icon: 'done_all', className: 'text-teal-200' },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// ─── Non-text placeholder ───────────────────────────────────────────────────

function RichCardPlaceholder({ type }: { type: string }) {
  const labels: Record<string, { label: string; icon: string }> = {
    habit_card: { label: 'Habit Completion', icon: 'check_circle' },
    badge_card: { label: 'Badge Earned', icon: 'military_tech' },
    nudge: { label: 'Nudge', icon: 'notifications' },
    xp_card: { label: 'XP Milestone', icon: 'bolt' },
    system: { label: 'System Message', icon: 'info' },
  }
  const config = labels[type] ?? { label: type, icon: 'chat_bubble' }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.04] px-3 py-2.5">
      <span
        className="material-symbols-outlined text-[18px] text-teal-400"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {config.icon}
      </span>
      <span className="text-[12px] font-medium text-slate-300">{config.label}</span>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MessageBubble({
  message,
  isSent,
  showAvatar,
  senderName,
  senderAvatarUrl,
  isLastInGroup,
  showSenderName,
  senderColor,
}: MessageBubbleProps) {
  const prefersReducedMotion = useReducedMotion()

  const motionProps = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0, scale: 1 }, animate: { opacity: 1, y: 0, scale: 1 } }
    : {
        initial: { opacity: 0, y: 8, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
      }

  const statusConfig = deliveryStatusConfig[message.deliveryStatus]
  const isTextMessage = message.type === 'text'

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement context menu (Copy, Reply, Delete) in a future phase
    console.log('Context menu:', message.id)
  }

  return (
    <motion.div {...motionProps}>
      {/* Row container */}
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
        {/* Avatar for received messages */}
        {!isSent && showAvatar && senderAvatarUrl && (
          <img
            src={senderAvatarUrl}
            alt={senderName ?? ''}
            className="size-8 rounded-full object-cover mr-2 mt-auto flex-shrink-0"
          />
        )}

        {/* Spacer when avatar hidden for received messages */}
        {!isSent && !showAvatar && <div className="w-10 flex-shrink-0" />}

        {/* Bubble */}
        <div className="max-w-[75%]">
          {/* Sender name for group messages */}
          {showSenderName && !isSent && (
            <span
              className="text-xs font-medium ml-1 mb-0.5 block"
              style={{ color: senderColor ?? '#94a3b8' }}
            >
              {senderName}
            </span>
          )}
          <div
            className={`${
              isSent
                ? 'bg-gradient-to-br from-teal-600 to-emerald-500 text-white rounded-2xl rounded-br-md'
                : 'bg-white/[0.06] border border-white/[0.04] text-slate-200 rounded-2xl rounded-bl-md'
            }`}
            onContextMenu={handleContextMenu}
          >
            <div className="px-3.5 py-2.5">
              {isTextMessage ? (
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              ) : (
                <RichCardPlaceholder type={message.type} />
              )}

              {/* Delivery receipt (sent only) */}
              {isSent && (
                <div className="flex justify-end mt-1">
                  <span className={`material-symbols-outlined text-[12px] ${statusConfig.className}`}>
                    {statusConfig.icon}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp below message group */}
      {isLastInGroup && (
        <p
          className={`text-[10px] text-slate-500 mt-1 ${
            isSent ? 'text-right' : !showAvatar ? 'ml-10' : 'ml-10'
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      )}
    </motion.div>
  )
}
