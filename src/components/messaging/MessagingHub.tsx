/**
 * MessagingHub — Conversations list screen
 * Modern messaging-app style (glass sidebar list patterns adapted for mobile)
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMessagingStore } from './messagingStore'
import { GroupCreationFlow } from './GroupCreationFlow'
import type { Conversation, DeliveryStatus } from './types'

interface MessagingHubProps {
  onSelectConversation: (conversationId: string) => void
  onCompose: () => void
}

type ConversationFilter = 'all' | 'direct' | 'groups' | 'unread'

const FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'direct', label: 'Direct' },
  { id: 'groups', label: 'Groups' },
  { id: 'unread', label: 'Unread' },
]

function smartTimestamp(iso: string): string {
  const now = Date.now()
  const date = new Date(iso)
  const diffMs = now - date.getTime()
  if (!Number.isFinite(diffMs)) return ''

  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) return date.toLocaleDateString([], { weekday: 'short' })

  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })
}

function deliveryIcon(status?: DeliveryStatus) {
  if (!status) return null
  if (status === 'sending') return { icon: 'schedule', className: 'text-white/25' }
  if (status === 'sent') return { icon: 'check', className: 'text-white/25' }
  if (status === 'delivered') return { icon: 'done_all', className: 'text-white/25' }
  return { icon: 'done_all', className: 'text-teal-300' }
}

function StatusDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={
        `absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-[2.5px] ring-[#0F1117] ` +
        (isOnline
          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
          : 'bg-white/20')
      }
      aria-hidden="true"
    />
  )
}

// Deterministic gradient palette per user name
const AVATAR_GRADIENTS = [
  ['from-violet-500 to-purple-700', 'text-violet-100'],
  ['from-teal-400 to-cyan-600', 'text-cyan-100'],
  ['from-rose-400 to-pink-600', 'text-rose-100'],
  ['from-amber-400 to-orange-500', 'text-amber-100'],
  ['from-sky-400 to-blue-600', 'text-sky-100'],
  ['from-emerald-400 to-green-600', 'text-emerald-100'],
  ['from-fuchsia-400 to-pink-700', 'text-fuchsia-100'],
  ['from-indigo-400 to-violet-600', 'text-indigo-100'],
]

function getAvatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

function DirectAvatar({
  conversation,
  isOnline,
}: {
  conversation: Conversation
  isOnline: boolean
}) {
  const fallback = conversation.name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  const [grad, textColor] = getAvatarGradient(conversation.name)

  return (
    <div className="relative flex-shrink-0">
      {conversation.avatarUrl ? (
        <div className="relative size-12">
          <img
            src={conversation.avatarUrl}
            alt={conversation.name}
            className="size-12 rounded-[18px] object-cover"
          />
          {/* Subtle inner shadow overlay */}
          <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>
      ) : (
        <div className={`size-12 rounded-[18px] bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
          <span className={`text-[13px] font-black ${textColor} tracking-tight drop-shadow`}>
            {fallback}
          </span>
          <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/20 pointer-events-none" />
        </div>
      )}
      <StatusDot isOnline={isOnline} />
    </div>
  )
}

function GroupAvatar({ conversation }: { conversation: Conversation }) {
  const initials = conversation.name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
  const [grad] = getAvatarGradient(conversation.name + '_group')

  return (
    <div className="relative size-12 flex-shrink-0">
      {/* Background gradient base */}
      <div className={`absolute inset-0 rounded-[18px] bg-gradient-to-br ${grad} opacity-20`} />

      {/* Two overlapping avatar bubbles */}
      <img
        src={'/images/avatars/avatar1.jpg'}
        alt=""
        className="absolute top-0 left-0 size-[30px] rounded-[11px] object-cover ring-[2px] ring-[#0F1117]"
      />
      <img
        src={'/images/avatars/avatar2.jpg'}
        alt=""
        className="absolute bottom-0 right-0 size-[30px] rounded-[11px] object-cover ring-[2px] ring-[#0F1117]"
      />

      {/* Group member count badge */}
      {conversation.memberCount > 2 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-white/[0.12] border border-white/[0.15] px-1 flex items-center justify-center text-[9px] font-black text-white/70 backdrop-blur-sm">
          {conversation.memberCount}
        </span>
      )}

      {/* Initials fallback label (hidden visually, for a11y) */}
      <span className="sr-only">{initials}</span>
    </div>
  )
}

function ConversationsSkeleton({ reduced }: { reduced: boolean }) {
  const pulse = reduced ? '' : 'animate-pulse'
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 rounded-[20px] border border-white/[0.06] bg-white/[0.025] px-4 py-3.5"
        >
          <div className={`size-12 rounded-[18px] bg-white/[0.07] flex-shrink-0 ${pulse}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`h-3.5 w-36 rounded-full bg-white/[0.07] ${pulse}`} />
            <div className={`h-2.5 w-52 rounded-full bg-white/[0.04] ${pulse}`} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`h-2.5 w-8 rounded-full bg-white/[0.05] ${pulse}`} />
            <div className={`h-4 w-4 rounded-full bg-white/[0.04] ${pulse}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ConversationRowProps {
  conversation: Conversation
  isOnline: boolean
  prefersReducedMotion: boolean
  index: number
  onSelect: () => void
}

function ConversationRowInner({
  conversation,
  isOnline,
  prefersReducedMotion,
  index,
  onSelect,
}: ConversationRowProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const {
    pinConversation,
    muteConversation,
    deleteConversation,
    markConversationUnread,
    hideConversation,
    archiveConversation,
    leaveGroup,
  } = useMessagingStore()

  // Track whether the user actually dragged so we can suppress accidental clicks
  const didDragRef = React.useRef(false)
  // Ref to the whole card wrapper for click-outside detection
  const rowRef = React.useRef<HTMLDivElement>(null)
  // Long press timer ref
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = React.useRef(false)

  // Close swiped card when user clicks outside it
  React.useEffect(() => {
    if (swipeX === 0) return
    const handleOutsideClick = (e: PointerEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setSwipeX(0)
      }
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [swipeX])

  // Long press handlers
  const handlePointerDown = () => {
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setSwipeX(0)
      setShowContextMenu(true)
    }, 500)
  }

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const lastMsg = conversation.lastMessage
  const hasUnread = conversation.unreadCount > 0
  const isSentByMe = lastMsg?.senderId === 'current-user'
  const receipt = isSentByMe ? deliveryIcon(lastMsg?.deliveryStatus) : null

  const previewText = (() => {
    if (!lastMsg) return 'No messages yet'
    if (lastMsg.type === 'text') return lastMsg.text ?? ''
    if (lastMsg.type === 'habit_card') return 'Shared a habit'
    if (lastMsg.type === 'badge_card') return 'Shared a badge'
    if (lastMsg.type === 'xp_card') return 'Shared XP'
    if (lastMsg.type === 'nudge') return 'Sent a nudge'
    return 'System message'
  })()

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.03, duration: 0.18 },
      }

  const handleDragStart = () => {
    didDragRef.current = false
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    // Mark as dragged if pointer moved more than 5px horizontally
    if (Math.abs(info.offset.x) > 5) {
      didDragRef.current = true
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) setSwipeX(-156)
    else if (info.offset.x > 60) setSwipeX(120)
    else setSwipeX(0)
  }

  const handleClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (longPressFired.current) {
      longPressFired.current = false
      return
    }
    onSelect()
  }

  const dragTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { type: 'spring' as const, damping: 26, stiffness: 320 }

  return (
    <>
      <motion.div {...motionProps} ref={rowRef} className="relative rounded-[22px] overflow-visible">
        {/* Swipe-left actions */}
        <div className="absolute inset-y-[2px] right-0 z-0 flex rounded-r-[22px] overflow-hidden">
          <button
            type="button"
            onClick={() => {
              pinConversation(conversation.id)
              setSwipeX(0)
            }}
            className="flex w-[78px] items-center justify-center bg-gradient-to-b from-teal-500 to-teal-600 text-white cursor-pointer gap-1 flex-col"
            aria-label={conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
          >
            <span className="material-symbols-outlined text-[18px]">push_pin</span>
            <span className="text-[9px] font-bold tracking-wide">{conversation.isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              muteConversation(conversation.id)
              setSwipeX(0)
            }}
            className="flex w-[78px] items-center justify-center bg-white/[0.10] text-white/70 cursor-pointer flex-col gap-1 backdrop-blur-sm"
            aria-label={conversation.isMuted ? 'Unmute conversation' : 'Mute conversation'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {conversation.isMuted ? 'notifications' : 'notifications_off'}
            </span>
            <span className="text-[9px] font-bold tracking-wide">{conversation.isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </div>

        {/* Swipe-right action */}
        <div className="absolute inset-y-[2px] left-0 z-0 flex rounded-l-[22px] overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(true)
              setSwipeX(0)
            }}
            className="flex w-[120px] items-center justify-center bg-gradient-to-b from-rose-500 to-rose-600 text-white cursor-pointer flex-col gap-1"
            aria-label="Delete conversation"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span className="text-[9px] font-bold tracking-wide">Delete</span>
          </button>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -156, right: 120 }}
          dragElastic={0.08}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{ x: swipeX }}
          transition={dragTransition}
          className="relative z-10"
        >
          <button
            type="button"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
            className={[
              'group relative w-full flex items-center gap-3.5 rounded-[22px] px-4 py-3.5',
              'text-left cursor-pointer border transition-all duration-200 select-none',
              hasUnread
                ? 'bg-[#131929] border-white/[0.09] shadow-[0_2px_20px_rgba(0,0,0,0.25)]'
                : 'bg-[#0f1520] border-white/[0.055] hover:bg-[#141b2e] hover:border-white/[0.09]',
            ].join(' ')}
            aria-label={`${conversation.name}, ${hasUnread ? `${conversation.unreadCount} unread` : 'no unread'}, ${lastMsg ? `last message ${smartTimestamp(lastMsg.createdAt)}` : ''}`}
          >
            {/* Left accent bar for unread */}
            {hasUnread && (
              <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full bg-gradient-to-b from-teal-300 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            )}

            {conversation.type === 'group' ? (
              <GroupAvatar conversation={conversation} />
            ) : (
              <DirectAvatar conversation={conversation} isOnline={isOnline} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                {/* Left: name + preview */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={[
                        'truncate text-[14px] leading-snug',
                        hasUnread ? 'font-bold text-white' : 'font-semibold text-white/90',
                      ].join(' ')}
                      style={{ letterSpacing: '-0.015em' }}
                    >
                      {conversation.name}
                    </span>
                    {conversation.isPinned && (
                      <span className="material-symbols-outlined text-[11px] text-teal-400/60 flex-shrink-0">
                        push_pin
                      </span>
                    )}
                    {conversation.isMuted && (
                      <span className="material-symbols-outlined text-[11px] text-white/25 flex-shrink-0">
                        notifications_off
                      </span>
                    )}
                  </div>

                  <div className={[
                    'mt-1 flex items-center gap-1 text-[12px] leading-tight',
                    hasUnread ? 'text-white/60' : 'text-white/35',
                  ].join(' ')}>
                    {receipt && (
                      <span
                        className={`material-symbols-outlined text-[13px] flex-shrink-0 ${receipt.className}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {receipt.icon}
                      </span>
                    )}
                    <span className="truncate">{previewText}</span>
                  </div>
                </div>

                {/* Right: timestamp + badge */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {lastMsg && (
                    <span className={[
                      'text-[11px] tabular-nums font-medium',
                      hasUnread ? 'text-teal-300' : 'text-white/25',
                    ].join(' ')}>
                      {smartTimestamp(lastMsg.createdAt)}
                    </span>
                  )}

                  {hasUnread ? (
                    <span className="inline-flex min-w-[20px] h-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 px-1.5 text-[10px] font-black text-[#050810] shadow-[0_4px_12px_rgba(0,229,204,0.35)]">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  ) : (
                    <span className="size-5 opacity-0" />
                  )}
                </div>
              </div>
            </div>
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/55"
              onClick={() => setShowDeleteConfirm(false)}
              aria-label="Close delete dialog"
            />
            <motion.div
              className="relative z-10 mx-6 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0f1628]/80 p-6 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 22, stiffness: 320 }}
            >
              <p className="text-sm font-semibold text-white">Delete this conversation?</p>
              <p className="mt-1 text-xs text-white/50">This cannot be undone.</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-sm text-white/80 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConversation(conversation.id)
                    setShowDeleteConfirm(false)
                  }}
                  className="flex-1 rounded-xl bg-rose-500/90 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Long-press context menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
          >
            {/* Backdrop */}
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowContextMenu(false)}
              aria-label="Close menu"
            />

            <motion.div
              className="relative z-10 w-full max-w-sm"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 26, stiffness: 340 }}
            >
              {/* Conversation header inside menu */}
              <div className="mb-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                {conversation.type === 'group'
                  ? <GroupAvatar conversation={conversation} />
                  : <DirectAvatar conversation={conversation} isOnline={isOnline} />
                }
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-white">{conversation.name}</p>
                  <p className="text-[11px] text-white/40">
                    {conversation.type === 'group' ? `${conversation.memberCount} members` : (isOnline ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1628]/95 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                {[
                  {
                    icon: conversation.isPinned ? 'keep_off' : 'keep',
                    label: conversation.isPinned ? 'Unpin Conversation' : 'Pin Conversation',
                    color: 'text-teal-300',
                    action: () => { pinConversation(conversation.id); setShowContextMenu(false) },
                  },
                  {
                    icon: conversation.isMuted ? 'notifications' : 'notifications_off',
                    label: conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications',
                    color: 'text-violet-300',
                    action: () => { muteConversation(conversation.id); setShowContextMenu(false) },
                  },
                  {
                    icon: 'mark_chat_unread',
                    label: conversation.unreadCount > 0 ? 'Mark as Read' : 'Mark as Unread',
                    color: 'text-sky-300',
                    action: () => { markConversationUnread(conversation.id); setShowContextMenu(false) },
                  },
                  {
                    icon: 'hide_source',
                    label: 'Hide Conversation',
                    color: 'text-amber-300',
                    action: () => { hideConversation(conversation.id); setShowContextMenu(false) },
                  },
                  {
                    icon: 'archive',
                    label: 'Archive Conversation',
                    color: 'text-white/50',
                    action: () => { archiveConversation(conversation.id); setShowContextMenu(false) },
                  },
                  {
                    icon: 'delete',
                    label: 'Delete Conversation',
                    color: 'text-rose-400',
                    action: () => { setShowContextMenu(false); setShowDeleteConfirm(true) },
                    danger: true,
                  },
                  ...(conversation.type === 'group' ? [{
                    icon: 'logout',
                    label: 'Leave Group',
                    color: 'text-rose-400',
                    action: () => { leaveGroup(conversation.id); setShowContextMenu(false) },
                    danger: true,
                  }] : []),
                ].map((item, i, arr) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={[
                      'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer',
                      item.danger
                        ? 'hover:bg-rose-500/10 active:bg-rose-500/20'
                        : 'hover:bg-white/[0.05] active:bg-white/[0.08]',
                      i < arr.length - 1 ? 'border-b border-white/[0.05]' : '',
                    ].join(' ')}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${item.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                    <span className={`text-[14px] font-medium ${item.danger ? 'text-rose-400' : 'text-white/90'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const ConversationRow = React.memo(ConversationRowInner)

export function MessagingHub({ onSelectConversation, onCompose }: MessagingHubProps) {
  const reduced = useReducedMotion()
  const {
    conversations,
    conversationFilter,
    setConversationFilter,
    onlineUsers,
    totalUnread,
  } = useMessagingStore()

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [showComposeMenu, setShowComposeMenu] = useState(false)
  const [showGroupCreation, setShowGroupCreation] = useState(false)
  const [isInitialLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  const filtered = useMemo(() => {
    const lower = debounced.toLowerCase()
    return conversations
      .filter((c) => !c.isHidden && !c.isArchived)
      .filter((c) => {
        if (conversationFilter === 'direct') return c.type === 'direct'
        if (conversationFilter === 'groups') return c.type === 'group'
        if (conversationFilter === 'unread') return c.unreadCount > 0
        return true
      })
      .filter((c) => c.name.toLowerCase().includes(lower))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [conversations, conversationFilter, debounced])

  const pinned = useMemo(() => filtered.filter((c) => c.isPinned), [filtered])
  const rest = useMemo(() => filtered.filter((c) => !c.isPinned), [filtered])

  const getOnlineStatus = useCallback(
    (conversation: Conversation) => {
      if (conversation.type !== 'direct') return false
      const participantId = conversation.memberIds.find(
        (id) => id !== 'current-user'
      )
      return participantId ? !!onlineUsers[participantId] : false
    },
    [onlineUsers]
  )

  const showEmpty = !isInitialLoading && filtered.length === 0

  return (
    <div className="space-y-3">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-to-br from-teal-300 to-emerald-300 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,204,0.18)]">
            <span
              className="material-symbols-outlined text-[18px] text-[#050810]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat_bubble
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-white tracking-tight">
              Messages
            </span>
            <span className="text-[11px] text-white/35">
              Stay accountable together
            </span>
          </div>
          {totalUnread > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500/90 px-2 text-[10px] font-extrabold text-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowComposeMenu((v) => !v)}
            className="size-9 rounded-xl border border-white/[0.1] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-teal-200 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Compose"
          >
            <span className="material-symbols-outlined text-[18px]">
              edit_square
            </span>
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-500 ring-2 ring-[#0F1117]" />
            )}
          </button>

          <AnimatePresence>
            {showComposeMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-20"
                  aria-label="Close compose menu"
                  onClick={() => setShowComposeMenu(false)}
                />
                <motion.div
                  className="absolute right-0 mt-2 z-30 w-[210px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0f1628]/80 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
                  initial={reduced ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 340 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowComposeMenu(false)
                      onCompose()
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.05] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-teal-300">
                      chat_bubble
                    </span>
                    <span className="text-[13px] font-semibold text-white">
                      New Message
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowComposeMenu(false)
                      setShowGroupCreation(true)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.05] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-violet-300">
                      group_add
                    </span>
                    <span className="text-[13px] font-semibold text-white">
                      New Group
                    </span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-white/[0.055] bg-white/[0.028] px-3.5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-white/20">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-white/35 hover:text-white/70 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
        role="tablist"
        aria-label="Conversation filters"
      >
        {FILTERS.map((f) => {
          const on = conversationFilter === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setConversationFilter(f.id)}
              className={
                'rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer ' +
                (on
                  ? 'bg-teal-300/15 border border-teal-300/30 text-teal-200 shadow-[0_10px_25px_rgba(0,229,204,0.08)]'
                  : 'bg-transparent border border-white/[0.06] text-white/30 hover:text-white/55 hover:bg-white/[0.03]')
              }
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {isInitialLoading && <ConversationsSkeleton reduced={reduced} />}

      {!isInitialLoading && (
        <div role="log" aria-live="polite" aria-label="Conversations" className="space-y-2.5">
          {showEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="size-16 rounded-3xl border border-white/[0.06] bg-white/[0.028] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-white/20">
                  forum
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70">
                  No conversations yet
                </p>
                <p className="mt-1 text-xs text-white/35">
                  Start chatting with your friends.
                </p>
              </div>
              <button
                type="button"
                onClick={onCompose}
                className="mt-2 rounded-xl bg-gradient-to-br from-teal-300 to-emerald-300 px-5 py-2.5 text-[12px] font-extrabold text-[#050810] shadow-[0_10px_30px_rgba(0,229,204,0.2)] cursor-pointer active:scale-95 transition-transform"
              >
                New message
              </button>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-extrabold tracking-[0.18em] text-white/25 uppercase">
                    Pinned
                  </div>
                  <div className="space-y-2.5">
                    {pinned.map((c, i) => (
                      <ConversationRow
                        key={c.id}
                        conversation={c}
                        isOnline={getOnlineStatus(c)}
                        prefersReducedMotion={reduced}
                        index={i}
                        onSelect={() => onSelectConversation(c.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {rest.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <div className="mt-3 px-2 pb-1 text-[10px] font-extrabold tracking-[0.18em] text-white/25 uppercase">
                      Recent
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {rest.map((c, i) => (
                      <ConversationRow
                        key={c.id}
                        conversation={c}
                        isOnline={getOnlineStatus(c)}
                        prefersReducedMotion={reduced}
                        index={i + pinned.length}
                        onSelect={() => onSelectConversation(c.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <GroupCreationFlow
        isOpen={showGroupCreation}
        onClose={() => setShowGroupCreation(false)}
        onGroupCreated={(id) => {
          setShowGroupCreation(false)
          onSelectConversation(id)
        }}
      />
    </div>
  )
}
