/**
 * ConversationScreen — Full message thread view
 * Redesigned for a premium, modern messaging experience with 
 * enhanced glassmorphism, depth, and fluid interactions.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
import { MessageBubble } from './MessageBubble'
import { MessageInputBar } from './MessageInputBar'
import { GroupInfoScreen } from './GroupInfoScreen'
import { TypingIndicator } from './TypingIndicator'
import toast from 'react-hot-toast'
import type { Message } from './types'
import clsx from 'clsx'

const CURRENT_USER_ID = 'current-user'
const SCROLL_FAB_THRESHOLD = 240

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function formatDateSeparator(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
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
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 75%)`
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function DateSeparator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="sticky top-4 z-10 my-8 flex justify-center"
    >
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white/50 backdrop-blur-md shadow-sm">
        {label}
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className={clsx(
            "flex items-end gap-3",
            i % 2 === 0 ? "flex-row" : "flex-row-reverse"
          )}
        >
          <div className="size-8 rounded-xl bg-white/5 animate-pulse" />
          <div 
            className={clsx(
              "h-12 rounded-2xl bg-white/5 animate-pulse",
              i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"
            )}
            style={{ width: `${40 + Math.random() * 40}%` }}
          />
        </div>
      ))}
    </div>
  )
}

function EmptyConversation({ name, onAction }: { name: string; onAction: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-6 py-20 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative flex size-24 items-center justify-center rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
          <span className="material-symbols-outlined text-5xl text-teal-400/60">
            forum
          </span>
        </div>
      </div>
      
      <div className="max-w-[280px]">
        <h3 className="text-xl font-bold tracking-tight text-white">
          Say hello to {name}!
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/40">
          Start your journey together. Share a habit, send a nudge, or just say hi.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20"
      >
        <span className="material-symbols-outlined text-lg">waving_hand</span>
        Send a Wave
      </motion.button>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */

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

  // Scroll position tracking for progress bar
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    setActiveConversation(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  useEffect(() => {
    if (!showScrollFab) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: reduced ? 'auto' : 'smooth',
        block: 'end'
      })
    }
  }, [conversationMessages.length, reduced, showScrollFab])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    // Load more at top
    if (container.scrollTop < 100 && hasMore && !isLoadingMessages) {
      loadMoreMessages(conversationId)
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollFab(distanceFromBottom > SCROLL_FAB_THRESHOLD)

    if (distanceFromBottom <= 20) setUnreadBelow(0)
  }, [hasMore, isLoadingMessages, conversationId, loadMoreMessages])

  const prevMessageCountRef = useRef(conversationMessages.length)
  useEffect(() => {
    if (showScrollFab && conversationMessages.length > prevMessageCountRef.current) {
      const newMessages = conversationMessages.slice(prevMessageCountRef.current)
      const newFromOthers = newMessages.filter((m) => m.senderId !== CURRENT_USER_ID).length
      if (newFromOthers > 0) setUnreadBelow((p) => p + newFromOthers)
    }
    prevMessageCountRef.current = conversationMessages.length
  }, [conversationMessages.length, showScrollFab])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    setShowScrollFab(false)
    setUnreadBelow(0)
  }, [reduced])

  const handleNudge = () => {
    if (!participantId || !conversation) return
    if (!canNudge(participantId)) {
      toast.error('Nudge is on cooldown', {
        icon: '⏳',
        style: {
          background: '#1a1f2e',
          color: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      })
      return
    }
    sendNudgeMessage(conversationId, participantId)
    toast.success(`Nudge sent to ${conversation.name}`, {
      icon: '🔔',
      style: {
        background: '#1a1f2e',
        color: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(20,184,166,0.3)',
      },
    })
  }

  const handleSendText = useCallback(
    async (text: string) => {
      try {
        await sendTextMessage(conversationId, text)
      } catch {
        toast.error('Failed to send message')
      }
    },
    [conversationId, sendTextMessage]
  )

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0f1c]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/5 text-white/20">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <p className="text-sm font-medium text-white/40">Conversation not found</p>
          <button 
            onClick={onBack}
            className="mt-4 text-sm font-bold text-teal-400"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#000000] font-sans">
      {/* Header */}
      <header className="relative z-30 shrink-0 border-b border-[#222222] bg-[#000000]/90 backdrop-blur-xl">
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#32D74B] origin-left"
          style={{ scaleX }}
        />

        <div className="flex items-center gap-2 px-3 pb-3 pt-safe">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#32D74B] transition-colors hover:bg-[#1C1C1E]"
          >
            <span className="material-symbols-outlined text-[28px] font-light">chevron_left</span>
          </motion.button>

          {/* User Info Section */}
          <div 
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 active:opacity-70 transition-opacity"
            onClick={() => setShowGroupInfo(true)}
          >
            <div className="relative shrink-0">
              {isGroupChat ? (
                <div className="flex items-center -space-x-3">
                  {conversation.memberIds.slice(0, 2).map((id, idx) => {
                    const friend = friends.find((f) => f.userId === id)
                    return (
                      <img
                        key={id}
                        src={friend?.avatarUrl || `/images/avatars/avatar${idx + 1}.jpg`}
                        alt=""
                        className="size-10 rounded-full border-[2.5px] border-[#000000] object-cover bg-[#1C1C1E]"
                      />
                    )
                  })}
                  {conversation.memberCount > 2 && (
                    <div className="flex size-10 items-center justify-center rounded-full border-[2.5px] border-[#000000] bg-[#2C2C2E] text-[11px] font-medium text-white">
                      +{conversation.memberCount - 2}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <img
                    src={conversation.avatarUrl || '/images/avatars/avatar1.jpg'}
                    alt={conversation.name}
                    className="size-11 rounded-full object-cover bg-[#1C1C1E]"
                  />
                  {isParticipantOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-[2.5px] border-[#000000] bg-[#32D74B]" />
                  )}
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[17px] font-semibold tracking-tight text-white">
                {conversation.name}
              </h2>
              <p className="flex items-center gap-1 text-[13px] font-normal text-[#8E8E93]">
                {isGroupChat ? (
                  <>
                    <span>{conversation.memberCount} members</span>
                    <span className="text-[10px]">·</span>
                    <span className="text-[#32D74B]">{conversation.onlineCount} online</span>
                  </>
                ) : (
                  <span className={isParticipantOnline ? 'text-[#32D74B]' : ''}>
                    {isParticipantOnline ? 'Active Now' : 'Offline'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center">
            {!isGroupChat && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleNudge}
                className="flex size-10 items-center justify-center rounded-full text-[#32D74B] transition-colors hover:bg-[#1C1C1E]"
                aria-label="Send nudge"
              >
                <span className="material-symbols-outlined text-[24px]">notifications_active</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGroupInfo(true)}
              className="flex size-10 items-center justify-center rounded-full text-[#32D74B] transition-colors hover:bg-[#1C1C1E]"
            >
              <span className="material-symbols-outlined text-[24px]">info</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Message Thread */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 pb-8"
      >
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <LoadingSkeleton />
        ) : conversationMessages.length === 0 ? (
          <EmptyConversation 
            name={conversation.name} 
            onAction={() => handleSendText('👋 Hey there!')} 
          />
        ) : (
          <div className="flex flex-col gap-0.5 py-6">
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
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}

        {/* Typing Overlay */}
        <AnimatePresence>
          {typingList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="sticky bottom-0 z-20 pb-4"
            >
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0f1c]/80 px-4 py-2 backdrop-blur-xl shadow-xl">
                <TypingIndicator conversationId={conversationId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed UI Overlays */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={scrollToBottom}
            className="absolute bottom-28 right-5 z-40 flex items-center gap-3 rounded-full border border-white/10 bg-teal-500 px-5 py-3 font-bold text-white shadow-2xl shadow-teal-500/25 backdrop-blur-lg"
          >
            {unreadBelow > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-teal-600">
                {unreadBelow > 9 ? '9+' : unreadBelow}
              </span>
            )}
            <span className="text-sm">New Messages</span>
            <span className="material-symbols-outlined text-[20px]">south</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="relative z-30 border-t border-[#222222] bg-[#000000]/90 backdrop-blur-xl">
        <MessageInputBar
          onSend={handleSendText}
          onShareHabit={(habitId) => sendHabitCard(conversationId, habitId)}
          onShareBadge={(badgeId) => sendBadgeCard(conversationId, badgeId)}
          onSendNudge={handleNudge}
          onTyping={(isTyping) => sendTyping(conversationId, isTyping)}
          shareTrayOpen={shareTrayOpen}
          onToggleShareTray={toggleShareTray}
        />
      </div>

      {/* Info Sidebar/Overlay */}
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
