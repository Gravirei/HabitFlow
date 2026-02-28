/**
 * ConversationScreen — Full direct message thread view
 * Composes MessageBubble and MessageInputBar with scroll management,
 * date separators, typing indicator, and auto-scroll
 */

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
import { MessageBubble } from './MessageBubble'
import { MessageInputBar } from './MessageInputBar'
import toast from 'react-hot-toast'
import type { Message } from './types'

// ─── Constants ──────────────────────────────────────────────────────────────

// TODO: Replace with actual auth user ID
const CURRENT_USER_ID = 'current-user'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ConversationScreenProps {
  conversationId: string
  onBack: () => void
}

// ─── Date Separator Helper ──────────────────────────────────────────────────

function formatDateSeparator(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

// ─── Message Grouping ───────────────────────────────────────────────────────

interface GroupedMessage {
  message: Message
  showAvatar: boolean
  isLastInGroup: boolean
  showDateSeparator: boolean
  dateSeparatorLabel: string
}

function groupMessages(messages: Message[]): GroupedMessage[] {
  const result: GroupedMessage[] = []

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const prevMsg = i > 0 ? messages[i - 1] : null
    const nextMsg = i < messages.length - 1 ? messages[i + 1] : null

    // Date separator: show if first message or different day from previous
    const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt)
    const dateSeparatorLabel = showDateSeparator ? formatDateSeparator(msg.createdAt) : ''

    // Avatar: show on first message in a consecutive sequence from same sender (received only)
    const isSent = msg.senderId === CURRENT_USER_ID
    const isFirstInSequence = !prevMsg || prevMsg.senderId !== msg.senderId || showDateSeparator
    const showAvatar = !isSent && isFirstInSequence

    // Timestamp: show on last message in group (next is different sender or different day)
    const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || !isSameDay(msg.createdAt, nextMsg.createdAt)

    result.push({
      message: msg,
      showAvatar,
      isLastInGroup,
      showDateSeparator,
      dateSeparatorLabel,
    })
  }

  return result
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator({ name, prefersReducedMotion }: { name: string; prefersReducedMotion: boolean }) {
  return (
    <div className="px-4 py-2">
      <span className="text-[12px] text-slate-400 italic">
        {name} is typing
        {prefersReducedMotion ? (
          '...'
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              >
                .
              </motion.span>
            ))}
          </>
        )}
      </span>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const prefersReducedMotion = useReducedMotion()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Messaging store
  const {
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    isLoadingMessages,
    hasMoreMessages,
    setActiveConversation,
    loadMoreMessages,
    sendTextMessage,
    sendHabitCard,
    sendBadgeCard,
    sendNudgeMessage,
    markConversationRead,
  } = useMessagingStore()

  // Social store — nudge delegation
  const { canNudge, sendNudge } = useSocialStore()

  // Find conversation
  const conversation = conversations.find((c) => c.id === conversationId)
  const conversationMessages = messages[conversationId] ?? []
  const typingList = typingUsers[conversationId] ?? []
  const hasMore = hasMoreMessages[conversationId] ?? false

  // Participant info (for direct conversations)
  const participantId = conversation?.memberIds.find((id) => id !== CURRENT_USER_ID)
  const isParticipantOnline = participantId ? !!onlineUsers[participantId] : false

  // Mount / unmount — set active conversation
  useEffect(() => {
    setActiveConversation(conversationId)
    markConversationRead(conversationId)
    return () => {
      setActiveConversation(null)
    }
  }, [conversationId, setActiveConversation, markConversationRead])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [conversationMessages.length, prefersReducedMotion])

  // Scroll-up pagination
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    if (container.scrollTop < 50 && hasMore && !isLoadingMessages) {
      loadMoreMessages(conversationId)
    }
  }, [hasMore, isLoadingMessages, conversationId, loadMoreMessages])

  // Nudge handler
  const handleNudge = () => {
    if (!participantId) return
    if (!canNudge(participantId)) {
      toast.error('Nudge on cooldown', {
        style: { background: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' },
      })
      return
    }
    sendNudge(participantId)
    sendNudgeMessage(conversationId, participantId)
    toast.success(`Nudge sent to ${conversation?.name}!`, {
      style: { background: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid rgba(19, 236, 91, 0.3)' },
    })
  }

  // Group messages for rendering
  const grouped = groupMessages(conversationMessages)

  if (!conversation) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* App Bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-3 py-3 border-b border-white/[0.05] bg-[#0F1117]/95 backdrop-blur-xl">
        {/* Back */}
        <button onClick={onBack} className="cursor-pointer" aria-label="Back to conversations">
          <span className="material-symbols-outlined text-[22px] text-slate-300 hover:text-white transition-colors">
            arrow_back
          </span>
        </button>

        {/* Avatar */}
        <img
          src={conversation.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.name}`}
          alt={conversation.name}
          className="size-8 rounded-full object-cover flex-shrink-0"
        />

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white truncate">{conversation.name}</p>
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <span
              className={`inline-block size-1.5 rounded-full ${
                isParticipantOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className={isParticipantOnline ? 'text-emerald-400' : 'text-slate-500'}>
              {isParticipantOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex gap-1 flex-shrink-0">
          {/* Nudge */}
          <button
            onClick={handleNudge}
            disabled={!participantId || !canNudge(participantId ?? '')}
            className={`cursor-pointer p-1 ${
              participantId && canNudge(participantId)
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            aria-label="Send nudge"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          {/* Info */}
          <button
            onClick={() => console.log('Info panel:', conversationId)}
            className="cursor-pointer p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Conversation info"
          >
            <span className="material-symbols-outlined text-[20px]">info</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {/* Loading spinner for pagination */}
        {isLoadingMessages && (
          <div className="flex justify-center py-4">
            <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {/* Messages */}
        {grouped.map(({ message, showAvatar, isLastInGroup, showDateSeparator, dateSeparatorLabel }) => (
          <div key={message.id}>
            {/* Date separator */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[10px] font-semibold text-slate-500">
                  {dateSeparatorLabel}
                </span>
              </div>
            )}

            <MessageBubble
              message={message}
              isSent={message.senderId === CURRENT_USER_ID}
              showAvatar={showAvatar}
              senderName={message.senderName}
              senderAvatarUrl={message.senderAvatarUrl}
              isLastInGroup={isLastInGroup}
            />
          </div>
        ))}

        {/* Scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingList.length > 0 && (
        <TypingIndicator
          name={typingList[0].displayName}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Message Input */}
      <MessageInputBar
        recipientName={conversation.name}
        onSend={(text) => sendTextMessage(conversationId, text)}
        onShareHabit={() => sendHabitCard(conversationId, '')}
        onShareBadge={() => sendBadgeCard(conversationId, '')}
        onSendNudge={() => {
          if (participantId && canNudge(participantId)) {
            sendNudgeMessage(conversationId, participantId)
          }
        }}
      />
    </div>
  )
}
