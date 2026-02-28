/**
 * MessagingHub — Conversations list screen
 * Main view for the Messages tab with search, filters, swipe actions,
 * loading/error/empty states, and full accessibility support
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { GroupCreationFlow } from './GroupCreationFlow'
import type { Conversation } from './types'

// ─── Props ──────────────────────────────────────────────────────────────────

interface MessagingHubProps {
  onSelectConversation: (conversationId: string) => void
  onCompose: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function smartTimestamp(iso: string): string {
  const now = Date.now()
  const date = new Date(iso)
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }

  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })
}

// ─── Filter Config ──────────────────────────────────────────────────────────

type ConversationFilter = 'all' | 'direct' | 'groups' | 'unread'

const filters: { id: ConversationFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'chat_bubble' },
  { id: 'direct', label: 'Direct', icon: 'person' },
  { id: 'groups', label: 'Groups', icon: 'group' },
  { id: 'unread', label: 'Unread', icon: 'mark_chat_unread' },
]

// ─── Delivery Receipt Mini Icon ─────────────────────────────────────────────

function DeliveryMiniIcon({ status }: { status: string }) {
  if (status === 'sending') return <span className="material-symbols-outlined text-[10px] text-slate-500 mr-1">schedule</span>
  if (status === 'sent') return <span className="material-symbols-outlined text-[10px] text-slate-500 mr-1">check</span>
  if (status === 'delivered') return <span className="material-symbols-outlined text-[10px] text-slate-500 mr-1">done_all</span>
  if (status === 'read') return <span className="material-symbols-outlined text-[10px] text-teal-400 mr-1">done_all</span>
  return null
}

// ─── Avatar Components ──────────────────────────────────────────────────────

function DirectAvatar({ conversation, isOnline }: { conversation: Conversation; isOnline: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <img
        src={conversation.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.name}`}
        alt={conversation.name}
        className="size-12 rounded-full object-cover"
      />
      <div
        className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-[#0F1117] ${
          isOnline
            ? 'bg-emerald-400 shadow-emerald-400/40 shadow-sm'
            : 'bg-slate-500'
        }`}
      />
    </div>
  )
}

function GroupAvatar({ conversation }: { conversation: Conversation }) {
  const members = conversation.memberIds
  return (
    <div className="relative size-12 flex-shrink-0">
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${members[0] ?? 'a'}`}
        alt=""
        className="absolute top-0 left-0 size-8 rounded-full object-cover ring-2 ring-[#0F1117] z-[3]"
      />
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${members[1] ?? 'b'}`}
        alt=""
        className="absolute top-1 left-3 size-8 rounded-full object-cover ring-2 ring-[#0F1117] z-[2]"
      />
      {members.length > 3 ? (
        <div className="absolute top-2 left-5 size-7 rounded-full bg-white/[0.06] ring-2 ring-[#0F1117] z-[1] flex items-center justify-center text-[9px] font-bold text-slate-400">
          +{members.length - 2}
        </div>
      ) : members.length === 3 ? (
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${members[2]}`}
          alt=""
          className="absolute top-2 left-5 size-7 rounded-full object-cover ring-2 ring-[#0F1117] z-[1]"
        />
      ) : null}
    </div>
  )
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function ConversationsSkeleton({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const pulseClass = prefersReducedMotion ? '' : 'animate-pulse'
  return (
    <div className="space-y-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
          <div className={`size-12 rounded-full bg-white/[0.04] ${pulseClass}`} />
          <div className="flex-1">
            <div className={`h-4 w-32 rounded bg-white/[0.04] ${pulseClass}`} />
            <div className={`h-3 w-48 rounded bg-white/[0.04] ${pulseClass} mt-1.5`} />
          </div>
          <div className={`h-3 w-10 rounded bg-white/[0.04] ${pulseClass} ml-auto`} />
        </div>
      ))}
    </div>
  )
}

// ─── Error State ────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-white/[0.025] border border-dashed border-white/[0.05]">
        <span className="material-symbols-outlined text-4xl text-slate-600">cloud_off</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-400">Couldn&apos;t load conversations</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
          Check your connection and try again
        </p>
      </div>
      <button
        onClick={onRetry}
        className="mt-4 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white active:scale-95 transition-transform cursor-pointer"
      >
        Try Again
      </button>
    </div>
  )
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────────

function DeleteConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  prefersReducedMotion,
}: {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  prefersReducedMotion: boolean
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
          <motion.div
            className="relative z-10 mx-6 w-full max-w-sm rounded-2xl bg-white/[0.025] border border-white/[0.05] backdrop-blur-xl p-6"
            initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 400 }}
          >
            <p className="text-sm text-white font-semibold mb-2">Delete this conversation?</p>
            <p className="text-xs text-slate-400 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-full border border-white/[0.1] py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white cursor-pointer active:scale-95 transition-transform"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Conversation Row with Swipe Actions ───────────────────────────────────

interface ConversationRowProps {
  conversation: Conversation
  index: number
  isOnline: boolean
  prefersReducedMotion: boolean
  onSelect: () => void
}

const ConversationRowInner = ({
  conversation,
  index,
  isOnline,
  prefersReducedMotion,
  onSelect,
}: ConversationRowProps) => {
  const [swipeX, setSwipeX] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { pinConversation, muteConversation, deleteConversation } = useMessagingStore()

  const hasUnread = conversation.unreadCount > 0
  const lastMsg = conversation.lastMessage
  const isSentByMe = lastMsg?.senderId === 'current-user'

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.03, duration: 0.2 },
      }

  // Preview text
  let previewText = ''
  let previewClass = 'text-slate-500'
  if (lastMsg) {
    if (lastMsg.type === 'text') {
      previewText = lastMsg.text ?? ''
    } else {
      const typeLabels: Record<string, string> = {
        habit_card: 'Shared a habit',
        badge_card: 'Shared a badge',
        nudge: 'Sent a nudge',
        xp_card: 'XP milestone',
        system: 'System message',
      }
      previewText = typeLabels[lastMsg.type] ?? lastMsg.type
    }
    if (hasUnread) previewClass = 'text-slate-300 font-medium'
  }

  // Build aria-label
  const buildRowAriaLabel = () => {
    const parts: string[] = []
    parts.push(conversation.name)
    if (conversation.type === 'group') {
      parts.push(`${conversation.memberCount} members`)
    }
    if (lastMsg) {
      parts.push(`last message: ${previewText}`)
      parts.push(smartTimestamp(lastMsg.createdAt))
    }
    if (hasUnread) parts.push(`${conversation.unreadCount} unread`)
    if (conversation.isMuted) parts.push('muted')
    if (conversation.isPinned) parts.push('pinned')
    return parts.join(', ')
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) {
      setSwipeX(-160)
    } else if (info.offset.x > 60) {
      setSwipeX(120)
    } else {
      setSwipeX(0)
    }
  }

  const handlePin = () => {
    pinConversation(conversation.id)
    setSwipeX(0)
  }

  const handleMute = () => {
    muteConversation(conversation.id)
    setSwipeX(0)
  }

  const handleDeleteConfirm = () => {
    deleteConversation(conversation.id)
    setShowDeleteConfirm(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  const dragTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, damping: 25, stiffness: 300 }

  return (
    <>
      <motion.div {...motionProps} className="relative overflow-hidden rounded-2xl">
        {/* Swipe-left actions (Pin & Mute) — behind the row */}
        <div className="absolute inset-y-0 right-0 flex z-0">
          <button
            onClick={handlePin}
            className="flex items-center justify-center w-20 bg-teal-600 cursor-pointer active:scale-95 transition-transform"
            aria-label={conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
          >
            <span className="material-symbols-outlined text-[20px] text-white">push_pin</span>
          </button>
          <button
            onClick={handleMute}
            className="flex items-center justify-center w-20 bg-white/[0.15] cursor-pointer active:scale-95 transition-transform"
            aria-label={conversation.isMuted ? 'Unmute conversation' : 'Mute conversation'}
          >
            <span className="material-symbols-outlined text-[20px] text-white">notifications_off</span>
          </button>
        </div>

        {/* Swipe-right action (Delete) — behind the row */}
        <div className="absolute inset-y-0 left-0 flex z-0">
          <button
            onClick={() => { setShowDeleteConfirm(true); setSwipeX(0) }}
            className="flex items-center justify-center w-[120px] bg-red-500 cursor-pointer active:scale-95 transition-transform"
            aria-label="Delete conversation"
          >
            <span className="material-symbols-outlined text-[20px] text-white">delete</span>
          </button>
        </div>

        {/* Draggable conversation row */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -160, right: 120 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={{ x: swipeX }}
          transition={dragTransition}
          className="relative z-10"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            aria-label={buildRowAriaLabel()}
            className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.025] border border-white/[0.05] p-3.5 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 text-left"
          >
            {/* Avatar */}
            {conversation.type === 'direct' ? (
              <DirectAvatar conversation={conversation} isOnline={isOnline} />
            ) : (
              <GroupAvatar conversation={conversation} />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row: name + indicators */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[14px] truncate ${hasUnread ? 'font-bold text-white' : 'font-semibold text-white'}`}>
                    {conversation.name}
                  </span>
                  {conversation.isPinned && (
                    <span className="material-symbols-outlined text-[12px] text-slate-500 flex-shrink-0">push_pin</span>
                  )}
                  {conversation.isMuted && (
                    <span className="material-symbols-outlined text-[12px] text-slate-500 flex-shrink-0">notifications_off</span>
                  )}
                </div>
              </div>

              {/* Bottom row: preview + timestamp */}
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <div className={`text-[12px] truncate max-w-[200px] ${previewClass} flex items-center`}>
                  {lastMsg && isSentByMe && <DeliveryMiniIcon status={lastMsg.deliveryStatus} />}
                  {lastMsg ? previewText : <span className="italic text-slate-600">No messages yet</span>}
                </div>
                {lastMsg && (
                  <span className={`text-[10px] whitespace-nowrap tabular-nums flex-shrink-0 ${hasUnread ? 'text-teal-400 font-semibold' : 'text-slate-500'}`}>
                    {smartTimestamp(lastMsg.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Unread badge */}
            {hasUnread && (
              <div
                className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-white flex-shrink-0"
                aria-label={`${conversation.unreadCount} unread messages`}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        prefersReducedMotion={prefersReducedMotion}
      />
    </>
  )
}

const ConversationRow = React.memo(ConversationRowInner, (prev, next) => {
  return (
    prev.conversation.id === next.conversation.id &&
    prev.conversation.lastMessage === next.conversation.lastMessage &&
    prev.conversation.unreadCount === next.conversation.unreadCount &&
    prev.conversation.isPinned === next.conversation.isPinned &&
    prev.conversation.isMuted === next.conversation.isMuted &&
    prev.conversation.updatedAt === next.conversation.updatedAt &&
    prev.isOnline === next.isOnline &&
    prev.prefersReducedMotion === next.prefersReducedMotion
  )
})

// ─── Main Component ─────────────────────────────────────────────────────────

export function MessagingHub({ onSelectConversation, onCompose }: MessagingHubProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showComposeMenu, setShowComposeMenu] = useState(false)
  const [showGroupCreation, setShowGroupCreation] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const {
    conversations,
    conversationFilter,
    setConversationFilter,
    setActiveConversation,
    onlineUsers,
    totalUnread,
  } = useMessagingStore()

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Memoize filtered + sorted conversation list
  const filtered = useMemo(() => {
    return conversations
      .filter((c) => {
        if (conversationFilter === 'direct') return c.type === 'direct'
        if (conversationFilter === 'groups') return c.type === 'group'
        if (conversationFilter === 'unread') return c.unreadCount > 0
        return true
      })
      .filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        // Then by updatedAt descending
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [conversations, conversationFilter, debouncedSearch])

  // Split pinned vs unpinned
  const pinnedConversations = useMemo(() => filtered.filter((c) => c.isPinned), [filtered])
  const unpinnedConversations = useMemo(() => filtered.filter((c) => !c.isPinned), [filtered])

  // Get online status for direct conversation participant
  const getOnlineStatus = useCallback((conversation: Conversation) => {
    if (conversation.type !== 'direct') return false
    const participantId = conversation.memberIds.find((id) => id !== 'current-user')
    return participantId ? !!onlineUsers[participantId] : false
  }, [onlineUsers])

  // Retry loading
  const handleRetry = () => {
    setLoadError(false)
    setIsInitialLoading(true)
    // Simulate retry — store would handle actual loading
    setTimeout(() => setIsInitialLoading(false), 1000)
  }

  const showEmptyState = !isInitialLoading && !loadError && filtered.length === 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[22px] text-teal-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            chat_bubble
          </span>
          <h2 className="text-lg font-bold text-white">Messages</h2>
          {totalUnread > 0 && (
            <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowComposeMenu((prev) => !prev)}
            className="cursor-pointer"
            aria-label="New conversation"
          >
            <span className="material-symbols-outlined text-[22px] text-slate-400 hover:text-teal-400 transition-colors">
              edit_square
            </span>
          </button>

          {/* Compose menu dropdown */}
          <AnimatePresence>
            {showComposeMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowComposeMenu(false)}
                />
                <motion.div
                  className="absolute right-0 top-10 z-30 bg-[#1a1b23] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden min-w-[200px]"
                  {...(prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, scale: 0.9, y: -8 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.9, y: -8 },
                        transition: { type: 'spring', damping: 25, stiffness: 400, duration: 0.2 },
                      })}
                >
                  <button
                    onClick={() => {
                      setShowComposeMenu(false)
                      onCompose()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-xl text-teal-400">chat_bubble</span>
                    <span className="text-sm text-white">New Message</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowGroupCreation(true)
                      setShowComposeMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-xl text-emerald-400">group_add</span>
                    <span className="text-sm text-white">New Group</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="relative" role="search">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
          search
        </span>
        <input
          type="search"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search conversations"
          className="w-full rounded-full bg-white/[0.03] border border-white/[0.06] pl-10 pr-10 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500 hover:text-white transition-colors">
              close
            </span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        role="tablist"
        aria-label="Filter conversations"
      >
        {filters.map((f) => {
          const isActive = conversationFilter === f.id
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`Show ${f.label.toLowerCase()} conversations`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => setConversationFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25'
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white border border-white/[0.04]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {f.icon}
              </span>
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Loading skeleton */}
      {isInitialLoading && <ConversationsSkeleton prefersReducedMotion={prefersReducedMotion} />}

      {/* Error state */}
      {loadError && <ErrorState onRetry={handleRetry} />}

      {/* Conversation List */}
      {!isInitialLoading && !loadError && (
        <>
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-white/[0.025] border border-dashed border-white/[0.05]">
                <span className="material-symbols-outlined text-4xl text-slate-600">
                  {search ? 'search_off' : conversationFilter !== 'all' ? 'filter_list_off' : 'forum'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  {search
                    ? 'No conversations match your search'
                    : conversationFilter !== 'all'
                      ? `No ${conversationFilter} conversations`
                      : 'No conversations yet'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
                  {search
                    ? 'Try a different search term.'
                    : 'Start chatting with your friends!'}
                </p>
              </div>
              {!search && conversationFilter === 'all' && (
                <button
                  onClick={onCompose}
                  className="rounded-full bg-teal-600 px-6 py-2.5 text-[13px] font-semibold text-white cursor-pointer active:scale-95 transition-transform"
                >
                  Start a Conversation
                </button>
              )}
            </div>
          ) : (
            <div role="log" aria-live="polite" aria-label="Conversations">
              {/* Pinned section */}
              {pinnedConversations.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium px-4 py-1">
                    Pinned
                  </span>
                  <div className="space-y-1.5 mt-1">
                    {pinnedConversations.map((conversation, i) => (
                      <ConversationRow
                        key={conversation.id}
                        conversation={conversation}
                        index={i}
                        isOnline={getOnlineStatus(conversation)}
                        prefersReducedMotion={prefersReducedMotion}
                        onSelect={() => onSelectConversation(conversation.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unpinned conversations */}
              <div className="space-y-1.5">
                {unpinnedConversations.map((conversation, i) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    index={i + pinnedConversations.length}
                    isOnline={getOnlineStatus(conversation)}
                    prefersReducedMotion={prefersReducedMotion}
                    onSelect={() => onSelectConversation(conversation.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Group Creation Flow */}
      <GroupCreationFlow
        isOpen={showGroupCreation}
        onClose={() => setShowGroupCreation(false)}
        onGroupCreated={(id) => {
          setActiveConversation(id)
          onSelectConversation(id)
        }}
      />
    </div>
  )
}
