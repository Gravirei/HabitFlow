/**
 * MessageBubble — Single message bubble for conversation threads
 * Updated to a modern messaging-app look (glass + gradients) inspired by habitflow-messaging-v2.html
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { DeliveryStatus, Message } from './types'
import { HabitShareCard } from './HabitShareCard'
import { BadgeShareCard } from './BadgeShareCard'
import { NudgeMessageCard } from './NudgeMessageCard'
import { ReactionRow } from './ReactionRow'

interface MessageBubbleProps {
  message: Message
  isSent: boolean
  showAvatar: boolean
  senderName?: string
  senderAvatarUrl?: string
  isLastInGroup: boolean
  showSenderName?: boolean
  senderColor?: string
}

const DELIVERY: Record<DeliveryStatus, { icon: string; className: string; label: string }> = {
  sending: { icon: 'schedule', className: 'text-white/35', label: 'Sending' },
  sent: { icon: 'check', className: 'text-white/45', label: 'Sent' },
  delivered: { icon: 'done_all', className: 'text-white/45', label: 'Delivered' },
  read: { icon: 'done_all', className: 'text-teal-200', label: 'Read' },
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function buildAriaLabel(message: Message, isSent: boolean, senderName?: string): string {
  const who = isSent ? 'You' : (senderName || 'Someone')
  const time = formatTime(message.createdAt)

  if (message.type === 'text') {
    const statusSuffix = isSent ? `, ${DELIVERY[message.deliveryStatus].label}` : ''
    return `${who}: ${message.text ?? ''}, ${time}${statusSuffix}`
  }

  const typeLabels: Record<string, string> = {
    habit_card: 'shared a habit completion',
    badge_card: 'shared a badge',
    xp_card: 'shared an XP milestone',
    nudge: 'sent a nudge',
    system: 'system message',
  }
  return `${who} ${typeLabels[message.type] ?? message.type}, ${time}`
}

function RichContent({ message, isSent, senderName }: { message: Message; isSent: boolean; senderName?: string }) {
  if (message.type === 'habit_card' && message.habitCard) {
    return <HabitShareCard payload={message.habitCard} isOwnMessage={isSent} />
  }
  if (message.type === 'badge_card' && message.badgeCard) {
    return <BadgeShareCard payload={message.badgeCard} isOwnMessage={isSent} />
  }
  if (message.type === 'xp_card' && message.badgeCard) {
    // xp_card shares the BadgeShareCard shape — reuse it
    return <BadgeShareCard payload={message.badgeCard} isOwnMessage={isSent} />
  }
  if (message.type === 'nudge' && message.nudgeCard) {
    return <NudgeMessageCard payload={message.nudgeCard} senderName={senderName ?? 'Someone'} isOwnMessage={isSent} />
  }

  // fallback
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 text-[12px] text-white/60">
      Unsupported message type
    </div>
  )
}

const MessageBubbleInner = ({
  message,
  isSent,
  showAvatar,
  senderName,
  senderAvatarUrl,
  isLastInGroup,
  showSenderName,
}: MessageBubbleProps) => {
  const reduced = useReducedMotion()

  const motionProps = reduced
    ? { initial: { opacity: 1, y: 0, scale: 1 }, animate: { opacity: 1, y: 0, scale: 1 } }
    : {
        initial: { opacity: 0, y: 10, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: 'spring' as const, damping: 24, stiffness: 320 },
      }

  const ariaLabel = buildAriaLabel(message, isSent, senderName)

  const receipt = useMemo(() => DELIVERY[message.deliveryStatus], [message.deliveryStatus])

  const bubbleClass = isSent
    ? 'bg-[#32D74B] text-white'
    : 'bg-[#2C2C2E] text-white'

  // shape: last in group gets the "tail" corner
  const radiusClass = isSent
    ? 'rounded-[20px] rounded-br-[4px]'
    : 'rounded-[20px] rounded-bl-[4px]'

  // Soft-deleted messages: show an italicised placeholder instead of content
  if (message.isDeleted) {
    return (
      <motion.div {...motionProps}>
        <div className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`} role="article" aria-label="Deleted message">
          {!isSent && <div className="w-8 flex-shrink-0"><div className="size-7" aria-hidden="true" /></div>}
          <div className={`flex flex-col gap-1 ${isSent ? 'items-end' : 'items-start'} max-w-[75%]`}>
            <div className="rounded-[20px] border border-[#38383A] bg-[#1C1C1E] px-[14px] py-[10px] text-[15px] italic text-[#8E8E93]">
              This message was deleted.
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div {...motionProps}>
      <div className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`} role="article" aria-label={ariaLabel}>
        {/* Avatar */}
        {!isSent && (
          <div className="w-8 flex-shrink-0">
            {showAvatar ? (
              <img
                src={senderAvatarUrl || '/images/avatars/avatar1.jpg'}
                alt={senderName ?? ''}
                className="size-7 rounded-full object-cover bg-[#1C1C1E]"
              />
            ) : (
              <div className="size-7" aria-hidden="true" />
            )}
          </div>
        )}

        <div className={`flex flex-col gap-1 ${isSent ? 'items-end' : 'items-start'} max-w-[75%]`}
        >
          {showSenderName && !isSent && senderName && (
            <span className="px-2 text-[12px] font-medium tracking-wide text-[#8E8E93]">
              {senderName}
            </span>
          )}

          {message.type === 'text' ? (
            <div
              className={`${bubbleClass} ${radiusClass} px-[14px] py-[8px] text-[16px] leading-[22px]`}
              tabIndex={0}
              aria-haspopup="true"
            >
              <div className="whitespace-pre-wrap break-words">{message.text}</div>

              {/* Foot: time + receipt */}
              {isLastInGroup && (
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className={`text-[11px] font-medium ${isSent ? 'text-white/80' : 'text-[#8E8E93]'}`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                  {isSent && (
                    <span
                      className={`material-symbols-outlined text-[14px] ${message.deliveryStatus === 'read' ? 'text-white/100' : 'text-white/80'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-label={receipt.label}
                    >
                      {receipt.icon}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <RichContent message={message} isSent={isSent} senderName={senderName} />
          )}

          {/* Reactions under content (like reference) */}
          <ReactionRow reactions={message.reactions} messageId={message.id} />

          {/* For non-text messages, still show time under group */}
          {message.type !== 'text' && isLastInGroup && (
            <div className={`px-2 text-[11px] font-medium ${isSent ? 'text-right text-[#8E8E93]' : 'text-left text-[#8E8E93]'}`}
            >
              {formatTime(message.createdAt)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const MessageBubble = React.memo(MessageBubbleInner, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.isDeleted === next.message.isDeleted &&
    prev.message.deliveryStatus === next.message.deliveryStatus &&
    prev.message.reactions === next.message.reactions &&
    prev.isSent === next.isSent &&
    prev.showAvatar === next.showAvatar &&
    prev.isLastInGroup === next.isLastInGroup &&
    prev.showSenderName === next.showSenderName &&
    prev.senderColor === next.senderColor
  )
})
