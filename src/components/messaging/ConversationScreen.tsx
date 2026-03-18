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

    const isLastInGroup =
      !next || next.senderId !== msg.senderId || !isSameDay(msg.createdAt, next.createdAt)

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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 flex items-center gap-4"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="border-white/8 rounded-full border bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
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
        style: {
          background: '#0f1628',
          color: '#fff',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      })
      return
    }
    // sendNudgeMessage handles the socialStore.sendNudge call internally — do NOT call it here too
    sendNudgeMessage(conversationId, participantId)
    toast.success(`Nudge sent to ${conversation.name}`, {
      style: {
        background: '#0f1628',
        color: '#fff',
        borderRadius: '14px',
        border: '1px solid rgba(0,229,204,0.2)',
      },
    })
  }

  const handleSendText = useCallback(
    async (text: string) => {
      try {
        await sendTextMessage(conversationId, text)
      } catch {
        toast.error('Message failed to send', {
          style: {
            background: '#0f1628',
            color: '#fff',
            borderRadius: '14px',
            border: '1px solid rgba(255,77,109,0.3)',
          },
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
    <div className="flex h-full flex-col bg-[#0a0f1c]">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0f1c]/80 backdrop-blur-2xl">
        <div className="pt-safe flex items-center gap-3 px-4 pb-3">
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={{ scale: 0.92 }}
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Back to conversations"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </motion.button>

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
                      className="size-9 rounded-xl border-2 border-[#0a0f1c] object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.src = '/images/avatars/avatar1.jpg'
                      }}
                    />
                  )
                })}
                {conversation.memberCount > 3 && (
                  <div className="flex size-9 items-center justify-center rounded-xl border-2 border-[#0a0f1c] bg-white/10 text-[10px] font-bold text-white">
                    +{conversation.memberCount - 3}
                  </div>
                )}
              </div>
            ) : (
              <>
                <img
                  src={conversation.avatarUrl || '/images/avatars/avatar1.jpg'}
                  alt={conversation.name}
                  className="size-11 rounded-2xl border border-white/10 object-cover shadow-lg"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.src = '/images/avatars/avatar1.jpg'
                  }}
                />
                <span
                  className={
                    `absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0a0f1c] ring-2 ring-[#0a0f1c] ` +
                    (isParticipantOnline
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                      : 'bg-white/30')
                  }
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold tracking-tight text-white">
              {conversation.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/40">
              {isGroupChat ? (
                <>
                  <span>{conversation.memberCount} members</span>
                  <span className="text-white/20">·</span>
                  <span className="text-emerald-400/80">{conversation.onlineCount} online</span>
                </>
              ) : isParticipantOnline ? (
                <span className="text-emerald-400/80">Active now</span>
              ) : (
                <span>Offline</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isGroupChat && (
              <motion.button
                type="button"
                onClick={handleNudge}
                whileTap={{ scale: 0.9 }}
                className="border-white/8 flex size-10 cursor-pointer items-center justify-center rounded-xl border bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-amber-300"
                aria-label="Send nudge"
              >
                <span className="material-symbols-outlined text-xl">notifications_active</span>
              </motion.button>
            )}

            <motion.button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              whileTap={{ scale: 0.9 }}
              className="border-white/8 flex size-10 cursor-pointer items-center justify-center rounded-xl border bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={isGroupChat ? 'Group info' : 'Conversation info'}
            >
              <span className="material-symbols-outlined text-xl">info</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex-1 overflow-y-auto px-4 py-5"
        role="log"
        aria-live="polite"
        aria-label="Message list"
      >
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <div className="space-y-4 py-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-14 rounded-2xl border border-white/5 bg-white/5 ${reduced ? '' : 'animate-pulse'}`}
                style={{ width: `${60 + Math.random() * 35}%` }}
              />
            ))}
          </div>
        ) : conversationMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="size-18 border-white/8 flex items-center justify-center rounded-3xl border bg-white/5">
              <span className="material-symbols-outlined text-4xl text-white/20">
                chat_bubble_outline
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white/70">No messages yet</p>
              <p className="mt-1.5 text-[13px] text-white/35">
                Send a message to start the conversation.
              </p>
            </div>
          </motion.div>
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
        <AnimatePresence>
          {typingList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3"
            >
              <TypingIndicator conversationId={conversationId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll-to-bottom FAB */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            type="button"
            onClick={scrollToBottom}
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-5 z-30 flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0f1628]/90 px-4 py-2.5 text-[12px] font-semibold text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-colors hover:bg-[#1a2235] hover:text-white"
            aria-label="Scroll to latest messages"
          >
            {unreadBelow > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-400 px-2 text-[10px] font-bold text-[#050810]">
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
