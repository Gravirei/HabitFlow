/**
 * ConversationScreen — Full message thread view
 * Modern messaging-app UI inspired by habitflow-messaging-v2.html
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
import { MessageBubble } from './MessageBubble'
import { MessageInputBar } from './MessageInputBar'
import { GroupInfoScreen } from './GroupInfoScreen'
import { TypingIndicator } from './TypingIndicator'
import toast from 'react-hot-toast'
import type { Message } from './types'

const CURRENT_USER_ID = 'current-user'
const SCROLL_FAB_THRESHOLD = 200

interface ConversationScreenProps {
  conversationId: string
  onBack: () => void
}

function formatDateSeparator(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

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
    const prev = i > 0 ? messages[i - 1] : null
    const next = i < messages.length - 1 ? messages[i + 1] : null

    const showDateSeparator = !prev || !isSameDay(prev.createdAt, msg.createdAt)
    const dateSeparatorLabel = showDateSeparator ? formatDateSeparator(msg.createdAt) : ''

    const isSent = msg.senderId === CURRENT_USER_ID
    const isFirstInSequence = !prev || prev.senderId !== msg.senderId || showDateSeparator
    const showAvatar = !isSent && isFirstInSequence

    const isLastInGroup = !next || next.senderId !== msg.senderId || !isSameDay(msg.createdAt, next.createdAt)

    result.push({ message: msg, showAvatar, isLastInGroup, showDateSeparator, dateSeparatorLabel })
  }

  return result
}

function getSenderColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash >> 8) % 21)
  const lightness = 58 + (Math.abs(hash >> 16) % 16)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
      <div className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-white/40 uppercase">
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
    </div>
  )
}

export function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const reduced = useReducedMotion()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    shareTrayOpen,
    toggleShareTray,
    sendTyping,
  } = useMessagingStore()

  const { canNudge, friends } = useSocialStore()

  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showScrollFab, setShowScrollFab] = useState(false)
  const [unreadBelow, setUnreadBelow] = useState(0)

  const conversation = conversations.find((c) => c.id === conversationId)
  const isGroupChat = conversation?.type === 'group'
  const conversationMessages = messages[conversationId] ?? []
  const typingList = typingUsers[conversationId] ?? []
  const hasMore = hasMoreMessages[conversationId] ?? false

  const participantId = conversation?.memberIds.find((id) => id !== CURRENT_USER_ID)
  const isParticipantOnline = participantId ? !!onlineUsers[participantId] : false

  const grouped = useMemo(() => groupMessages(conversationMessages), [conversationMessages])

  useEffect(() => {
    setActiveConversation(conversationId) // Also calls markConversationRead internally
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  useEffect(() => {
    if (!showScrollFab) {
      messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    }
  }, [conversationMessages.length, reduced, showScrollFab])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    if (container.scrollTop < 50 && hasMore && !isLoadingMessages) {
      loadMoreMessages(conversationId)
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollFab(distanceFromBottom > SCROLL_FAB_THRESHOLD)

    if (distanceFromBottom <= 10) setUnreadBelow(0)
  }, [hasMore, isLoadingMessages, conversationId, loadMoreMessages])

  const prevMessageCountRef = useRef(conversationMessages.length)
  useEffect(() => {
    if (showScrollFab && conversationMessages.length > prevMessageCountRef.current) {
      // Count all new messages from other users since last check
      const newMessages = conversationMessages.slice(prevMessageCountRef.current)
      const newFromOthers = newMessages.filter((m) => m.senderId !== CURRENT_USER_ID).length
      if (newFromOthers > 0) setUnreadBelow((p) => p + newFromOthers)
    }
    prevMessageCountRef.current = conversationMessages.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages.length])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    setShowScrollFab(false)
    setUnreadBelow(0)
  }, [reduced])

  const handleNudge = () => {
    if (!participantId || !conversation) return
    if (!canNudge(participantId)) {
      toast.error('Nudge on cooldown', {
        style: { background: '#0f1628', color: '#fff', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' },
      })
      return
    }
    // sendNudgeMessage handles the socialStore.sendNudge call internally — do NOT call it here too
    sendNudgeMessage(conversationId, participantId)
    toast.success(`Nudge sent to ${conversation.name}`, {
      style: { background: '#0f1628', color: '#fff', borderRadius: '14px', border: '1px solid rgba(0,229,204,0.2)' },
    })
  }

  const handleSendText = useCallback(
    async (text: string) => {
      try {
        await sendTextMessage(conversationId, text)
      } catch {
        toast.error('Message failed to send', {
          style: { background: '#0f1628', color: '#fff', borderRadius: '14px', border: '1px solid rgba(255,77,109,0.3)' },
        })
      }
    },
    [conversationId, sendTextMessage]
  )

  if (!conversation) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-white/45">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0a0f1c]/65 backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-xl border border-transparent text-white/70 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
            aria-label="Back to conversations"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {isGroupChat ? (
              <div className="flex items-center -space-x-2">
                {conversation.memberIds.slice(0, 3).map((id) => {
                  const friend = friends.find((f) => f.userId === id)
                  return (
                    <img
                      key={id}
                      src={friend?.avatarUrl || '/images/avatars/avatar1.jpg'}
                      alt=""
                      className="size-8 rounded-xl border-2 border-[#0F1117] object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/avatar1.jpg' }}
                    />
                  )
                })}
              </div>
            ) : (
              <>
                <img
                  src={conversation.avatarUrl || '/images/avatars/avatar1.jpg'}
                  alt={conversation.name}
                  className="size-10 rounded-2xl object-cover border border-white/[0.06]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/avatar1.jpg' }}
                />
                <span
                  className={
                    `absolute -bottom-0.5 -right-0.5 size-[10px] rounded-full ring-2 ring-[#0F1117] ` +
                    (isParticipantOnline ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/25')
                  }
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-extrabold tracking-tight text-white">
              {conversation.name}
            </div>
            <div className="mt-0.5 text-[11px] text-white/35">
              {isGroupChat
                ? `${conversation.memberCount} members · ${conversation.onlineCount} online`
                : isParticipantOnline
                  ? 'Active now'
                  : 'Offline'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isGroupChat && (
              <button
                type="button"
                onClick={handleNudge}
                className="flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-amber-200 transition-colors cursor-pointer"
                aria-label="Send nudge"
              >
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              className="flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              aria-label={isGroupChat ? 'Group info' : 'Conversation info'}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 py-4"
        role="log"
        aria-live="polite"
        aria-label="Message list"
      >
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] ${reduced ? '' : 'animate-pulse'}`}
              />
            ))}
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-3xl border border-white/[0.06] bg-white/[0.028] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] text-white/20">chat_bubble_outline</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">No messages yet</p>
              <p className="mt-1 text-xs text-white/35">Send a message to start the conversation.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {grouped.map((g) => {
              const isSent = g.message.senderId === CURRENT_USER_ID
              const showSender = isGroupChat && !isSent
              const color = showSender ? getSenderColor(g.message.senderId) : undefined

              return (
                <div key={g.message.id}>
                  {g.showDateSeparator && <DateSeparator label={g.dateSeparatorLabel} />}

                  <MessageBubble
                    message={g.message}
                    isSent={isSent}
                    showAvatar={g.showAvatar}
                    senderName={g.message.senderName}
                    senderAvatarUrl={g.message.senderAvatarUrl}
                    isLastInGroup={g.isLastInGroup}
                    showSenderName={showSender}
                    senderColor={color}
                  />
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing indicator (bottom, above input) */}
        {typingList.length > 0 && (
          <div className="mt-2">
            <TypingIndicator conversationId={conversationId} />
          </div>
        )}
      </div>

      {/* Scroll-to-bottom FAB */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            type="button"
            onClick={scrollToBottom}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 320 }}
            className="fixed bottom-28 right-4 z-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0f1628]/80 px-3.5 py-2 text-[12px] font-semibold text-white/80 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] cursor-pointer"
            aria-label="Scroll to latest messages"
          >
            {unreadBelow > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-300 px-2 text-[10px] font-extrabold text-[#050810]">
                {unreadBelow > 99 ? '99+' : unreadBelow}
              </span>
            )}
            <span className="material-symbols-outlined text-[18px]">south</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInputBar
        recipientName={conversation.name}
        onSend={handleSendText}
        onShareHabit={(habitId) => sendHabitCard(conversationId, habitId)}
        onShareBadge={(badgeId) => sendBadgeCard(conversationId, badgeId)}
        onSendNudge={handleNudge}
        onTyping={(isTyping) => sendTyping(conversationId, isTyping)}
        shareTrayOpen={shareTrayOpen}
        onToggleShareTray={toggleShareTray}
      />

      {/* Group info panel */}
      <AnimatePresence>
        {showGroupInfo && (
          <GroupInfoScreen
            conversationId={conversation.id}
            onClose={() => setShowGroupInfo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
