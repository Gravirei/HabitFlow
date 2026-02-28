/**
 * ConversationScreen — Full direct message thread view
 * Composes MessageBubble and MessageInputBar with scroll management,
 * date separators, typing indicator, scroll-to-bottom FAB, loading
 * skeletons, empty state, and auto-scroll
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
import { MessageBubble } from './MessageBubble'
import { MessageInputBar } from './MessageInputBar'
import { GroupInfoScreen } from './GroupInfoScreen'
import toast from 'react-hot-toast'
import type { Message } from './types'

// ─── Constants ──────────────────────────────────────────────────────────────

// TODO: Replace with actual auth user ID
const CURRENT_USER_ID = 'current-user'

// Scroll-to-bottom threshold in px
const SCROLL_FAB_THRESHOLD = 200

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

  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
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

// ─── Sender Color Helper ────────────────────────────────────────────────────

/**
 * Generate a deterministic HSL color from a userId string.
 * Same userId always produces same color. Avoids near-white and near-black
 * by constraining saturation (60-80%) and lightness (55-75%).
 */
function getSenderColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32-bit int
  }
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash >> 8) % 21)  // 60-80%
  const lightness = 55 + (Math.abs(hash >> 16) % 21)   // 55-75%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function MessagesSkeleton({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const skeletons = [
    { width: '60%', height: 40, align: 'left' },
    { width: '45%', height: 60, align: 'right' },
    { width: '70%', height: 40, align: 'left' },
    { width: '50%', height: 60, align: 'right' },
    { width: '65%', height: 40, align: 'left' },
    { width: '40%', height: 40, align: 'right' },
  ]

  return (
    <div className="space-y-3 py-4">
      {skeletons.map((s, i) => (
        <div
          key={i}
          className={`flex ${s.align === 'right' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-2xl bg-white/[0.04] ${prefersReducedMotion ? '' : 'animate-pulse'}`}
            style={{ width: s.width, height: s.height }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyConversationState({ isGroup }: { isGroup: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-white/[0.025] border border-dashed border-white/[0.05]">
        <span className="material-symbols-outlined text-4xl text-slate-600">chat_bubble_outline</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-400">No messages yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
          {isGroup
            ? 'Be the first to say something!'
            : 'Send a message to start the conversation'}
        </p>
      </div>
    </div>
  )
}

// ─── Failed Message Retry ───────────────────────────────────────────────────

interface FailedMessage {
  id: string
  text: string
}

// ─── Inline Typing Indicator ────────────────────────────────────────────────

function InlineTypingIndicator({ name, prefersReducedMotion }: { name: string; prefersReducedMotion: boolean }) {
  return (
    <div className="px-4 py-2" role="status" aria-live="polite">
      <span className="sr-only">{name} is typing</span>
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

  // Social store — nudge delegation + friends for group avatars
  const { canNudge, sendNudge, friends } = useSocialStore()

  // Group info panel state
  const [showGroupInfo, setShowGroupInfo] = useState(false)

  // Scroll-to-bottom FAB state
  const [showScrollFab, setShowScrollFab] = useState(false)
  const [unreadBelow, setUnreadBelow] = useState(0)

  // Failed messages tracking (optimistic send retry)
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([])

  // Find conversation
  const conversation = conversations.find((c) => c.id === conversationId)
  const isGroupChat = conversation?.type === 'group'
  const conversationMessages = messages[conversationId] ?? []
  const typingList = typingUsers[conversationId] ?? []
  const hasMore = hasMoreMessages[conversationId] ?? false

  // Participant info (for direct conversations)
  const participantId = conversation?.memberIds.find((id) => id !== CURRENT_USER_ID)
  const isParticipantOnline = participantId ? !!onlineUsers[participantId] : false

  // Memoize message grouping
  const grouped = useMemo(() => groupMessages(conversationMessages), [conversationMessages])

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
    if (!showScrollFab) {
      messagesEndRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    }
  }, [conversationMessages.length, prefersReducedMotion, showScrollFab])

  // Scroll handler — pagination + FAB visibility
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Scroll-up pagination
    if (container.scrollTop < 50 && hasMore && !isLoadingMessages) {
      loadMoreMessages(conversationId)
    }

    // Scroll-to-bottom FAB
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollFab(distanceFromBottom > SCROLL_FAB_THRESHOLD)

    // Clear unread-below count when at bottom
    if (distanceFromBottom <= 10) {
      setUnreadBelow(0)
    }
  }, [hasMore, isLoadingMessages, conversationId, loadMoreMessages])

  // Track new messages arriving while scrolled up
  useEffect(() => {
    if (showScrollFab && conversationMessages.length > 0) {
      const lastMsg = conversationMessages[conversationMessages.length - 1]
      if (lastMsg.senderId !== CURRENT_USER_ID) {
        setUnreadBelow((prev) => prev + 1)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages.length])

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
    setShowScrollFab(false)
    setUnreadBelow(0)
  }, [prefersReducedMotion])

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

  // Optimistic send with retry
  const handleSendText = useCallback(async (text: string) => {
    try {
      await sendTextMessage(conversationId, text)
    } catch {
      // Track failed message for retry
      const failedId = `failed-${Date.now()}`
      setFailedMessages((prev) => [...prev, { id: failedId, text }])
      toast.error('Message failed to send', {
        style: { background: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' },
      })
    }
  }, [conversationId, sendTextMessage])

  // Retry failed message
  const handleRetry = useCallback(async (failedMsg: FailedMessage) => {
    setFailedMessages((prev) => prev.filter((m) => m.id !== failedMsg.id))
    try {
      await sendTextMessage(conversationId, failedMsg.text)
    } catch {
      setFailedMessages((prev) => [...prev, failedMsg])
      toast.error('Message failed to send', {
        style: { background: '#1f2937', color: '#fff', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' },
      })
    }
  }, [conversationId, sendTextMessage])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Conversation not found</p>
      </div>
    )
  }

  const isEmptyConversation = conversationMessages.length === 0 && !isLoadingMessages
  const showLoadingSkeleton = isLoadingMessages && conversationMessages.length === 0

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

        {isGroupChat ? (
          <>
            {/* Group stacked avatars */}
            <div className="flex items-center -space-x-2 flex-shrink-0">
              {conversation.memberIds.slice(0, 3).map((memberId) => {
                const friend = friends.find((f) => f.userId === memberId)
                return (
                  <img
                    key={memberId}
                    src={friend?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-[#0F1117] object-cover"
                  />
                )
              })}
              {conversation.memberIds.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border-2 border-[#0F1117] flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  +{conversation.memberIds.length - 3}
                </div>
              )}
            </div>

            {/* Group name + member count */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">{conversation.name}</p>
              <p className="text-xs text-slate-400">{conversation.memberCount} members</p>
            </div>

            {/* Info icon for group */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setShowGroupInfo(true)}
                className="cursor-pointer p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Group info"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Direct message avatar */}
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

            {/* Right side icons for DM */}
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
                onClick={() => setShowGroupInfo(true)}
                className="cursor-pointer p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Conversation info"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      {/* TODO: Consider react-window or @tanstack/virtual for virtual scrolling on conversations with 500+ messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-3 py-4 space-y-1"
        role="log"
        aria-live="polite"
        aria-label="Messages"
      >
        {/* Loading spinner for pagination */}
        {isLoadingMessages && conversationMessages.length > 0 && (
          <div className="flex justify-center py-4">
            <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {/* Loading skeleton for initial load */}
        {showLoadingSkeleton && <MessagesSkeleton prefersReducedMotion={prefersReducedMotion} />}

        {/* Empty state */}
        {isEmptyConversation && <EmptyConversationState isGroup={!!isGroupChat} />}

        {/* Messages */}
        {grouped.map(({ message, showAvatar, isLastInGroup, showDateSeparator, dateSeparatorLabel }) => (
          <div key={message.id}>
            {/* Date separator */}
            {showDateSeparator && (
              <div className="flex items-center gap-3 py-4">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-xs text-white/40 font-medium">{dateSeparatorLabel}</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
            )}

            <MessageBubble
              message={message}
              isSent={message.senderId === CURRENT_USER_ID}
              showAvatar={showAvatar}
              senderName={message.senderName}
              senderAvatarUrl={message.senderAvatarUrl}
              isLastInGroup={isLastInGroup}
              showSenderName={isGroupChat && message.senderId !== CURRENT_USER_ID}
              senderColor={isGroupChat ? getSenderColor(message.senderId) : undefined}
            />
          </div>
        ))}

        {/* Failed messages with retry */}
        {failedMessages.map((fm) => (
          <div key={fm.id} className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="rounded-2xl rounded-br-md bg-red-500/20 border border-red-500/30 px-3.5 py-2.5">
                <p className="text-[14px] leading-relaxed text-white/80 whitespace-pre-wrap break-words">
                  {fm.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="material-symbols-outlined text-[12px] text-red-400">error</span>
                  <span className="text-[10px] text-red-400">Failed</span>
                </div>
              </div>
              <button
                onClick={() => handleRetry(fm)}
                className="mt-1 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto cursor-pointer active:scale-95 transition-transform"
                aria-label="Tap to retry sending message"
              >
                <span className="material-symbols-outlined text-[12px]">refresh</span>
                Tap to retry
              </button>
            </div>
          </div>
        ))}

        {/* Scroll target */}
        <div ref={messagesEndRef} />

        {/* Scroll-to-bottom FAB */}
        <AnimatePresence>
          {showScrollFab && (
            <motion.button
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 flex size-10 items-center justify-center rounded-full bg-teal-600 shadow-lg shadow-teal-600/20 cursor-pointer active:scale-95 transition-transform z-20"
              aria-label={unreadBelow > 0 ? `Scroll to bottom, ${unreadBelow} new messages` : 'Scroll to bottom'}
            >
              <span className="material-symbols-outlined text-[20px] text-white">keyboard_arrow_down</span>
              {/* Unread count badge */}
              {unreadBelow > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadBelow > 99 ? '99+' : unreadBelow}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Typing indicator */}
      {typingList.length > 0 && (
        <InlineTypingIndicator
          name={typingList[0].displayName}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Message Input */}
      <MessageInputBar
        recipientName={conversation.name}
        onSend={handleSendText}
        onShareHabit={() => sendHabitCard(conversationId, '')}
        onShareBadge={() => sendBadgeCard(conversationId, '')}
        onSendNudge={() => {
          if (participantId && canNudge(participantId)) {
            sendNudgeMessage(conversationId, participantId)
          }
        }}
      />

      {/* Group Info Panel */}
      <AnimatePresence>
        {showGroupInfo && conversation && (
          <GroupInfoScreen
            conversationId={conversation.id}
            onClose={() => setShowGroupInfo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
