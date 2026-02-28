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
        `absolute -bottom-0.5 -right-0.5 size-[11px] rounded-full ring-2 ring-[#0F1117] ` +
        (isOnline
          ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
          : 'bg-white/25')
      }
      aria-hidden="true"
    />
  )
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

  return (
    <div className="relative flex-shrink-0">
      {conversation.avatarUrl ? (
        <img
          src={conversation.avatarUrl}
          alt={conversation.name}
          className="size-11 rounded-2xl object-cover border border-white/[0.06]"
          onError={(e) => {
            const img = e.currentTarget
            img.onerror = null
            img.style.display = 'none'
            img.parentElement?.querySelector('.avatar-initials')?.removeAttribute('hidden')
          }}
        />
      ) : (
        <div className="size-11 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#003d36] to-[#005a4e] flex items-center justify-center">
          <span className="text-[12px] font-extrabold text-teal-300 tracking-tight">
            {fallback}
          </span>
        </div>
      )}
      <StatusDot isOnline={isOnline} />
    </div>
  )
}

function GroupAvatar(_props: { conversation: Conversation }) {
  return (
    <div className="relative size-11 flex-shrink-0">
      <img
        src={'/images/avatars/avatar1.jpg'}
        alt=""
        className="absolute top-0 left-0 size-7 rounded-xl object-cover ring-2 ring-[#0F1117] border border-white/[0.06]"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/avatar1.jpg' }}
      />
      <img
        src={'/images/avatars/avatar2.jpg'}
        alt=""
        className="absolute bottom-0 right-0 size-7 rounded-xl object-cover ring-2 ring-[#0F1117] border border-white/[0.06]"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/avatar2.jpg' }}
      />
    </div>
  )
}

function ConversationsSkeleton({ reduced }: { reduced: boolean }) {
  const pulse = reduced ? '' : 'animate-pulse'
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.028] px-3.5 py-3"
        >
          <div className={`size-11 rounded-2xl bg-white/[0.06] ${pulse}`} />
          <div className="min-w-0 flex-1">
            <div className={`h-3.5 w-40 rounded bg-white/[0.06] ${pulse}`} />
            <div className={`mt-2 h-3 w-56 rounded bg-white/[0.05] ${pulse}`} />
          </div>
          <div className={`h-3 w-10 rounded bg-white/[0.05] ${pulse}`} />
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
  const { pinConversation, muteConversation, deleteConversation } =
    useMessagingStore()

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

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) setSwipeX(-156)
    else if (info.offset.x > 60) setSwipeX(120)
    else setSwipeX(0)
  }

  const dragTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { type: 'spring' as const, damping: 26, stiffness: 320 }

  const rowBase =
    'relative w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left cursor-pointer border transition-colors duration-200 '

  const rowStyle =
    'bg-white/[0.028] border-white/[0.055] hover:bg-white/[0.05]'

  return (
    <>
      <motion.div {...motionProps} className="relative overflow-hidden rounded-2xl">
        {/* Swipe-left actions */}
        <div className="absolute inset-y-0 right-0 z-0 flex">
          <button
            type="button"
            onClick={() => {
              pinConversation(conversation.id)
              setSwipeX(0)
            }}
            className="flex w-[78px] items-center justify-center bg-teal-600/90 text-white cursor-pointer"
            aria-label={
              conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'
            }
          >
            <span className="material-symbols-outlined text-[20px]">push_pin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              muteConversation(conversation.id)
              setSwipeX(0)
            }}
            className="flex w-[78px] items-center justify-center bg-white/[0.14] text-white cursor-pointer"
            aria-label={
              conversation.isMuted ? 'Unmute conversation' : 'Mute conversation'
            }
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications_off
            </span>
          </button>
        </div>

        {/* Swipe-right action */}
        <div className="absolute inset-y-0 left-0 z-0 flex">
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(true)
              setSwipeX(0)
            }}
            className="flex w-[120px] items-center justify-center bg-rose-500/90 text-white cursor-pointer"
            aria-label="Delete conversation"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -156, right: 120 }}
          dragElastic={0.08}
          onDragEnd={handleDragEnd}
          animate={{ x: swipeX }}
          transition={dragTransition}
          className="relative z-10"
        >
          <button
            type="button"
            onClick={onSelect}
            className={rowBase + rowStyle}
            aria-label={`${conversation.name}, ${hasUnread ? `${conversation.unreadCount} unread` : 'no unread'}, ${lastMsg ? `last message ${smartTimestamp(lastMsg.createdAt)}` : ''}`}
          >
            {conversation.type === 'group' ? (
              <GroupAvatar conversation={conversation} />
            ) : (
              <DirectAvatar conversation={conversation} isOnline={isOnline} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={
                        'truncate font-semibold ' +
                        (hasUnread ? 'text-white' : 'text-white/95')
                      }
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {conversation.name}
                    </span>
                    {conversation.isPinned && (
                      <span className="material-symbols-outlined text-[12px] text-white/25">
                        push_pin
                      </span>
                    )}
                    {conversation.isMuted && (
                      <span className="material-symbols-outlined text-[12px] text-white/25">
                        notifications_off
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      'mt-0.5 flex items-center gap-1 truncate text-[12px] ' +
                      (hasUnread ? 'text-white/70' : 'text-white/40')
                    }
                  >
                    {receipt && (
                      <span
                        className={`material-symbols-outlined text-[14px] ${receipt.className}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {receipt.icon}
                      </span>
                    )}
                    <span className="truncate">{previewText}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {lastMsg && (
                    <span
                      className={
                        'text-[11px] tabular-nums ' +
                        (hasUnread ? 'text-teal-300' : 'text-white/25')
                      }
                    >
                      {smartTimestamp(lastMsg.createdAt)}
                    </span>
                  )}

                  {hasUnread && (
                    <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-teal-300 px-1.5 text-[10px] font-extrabold text-[#050810] shadow-[0_10px_25px_rgba(0,229,204,0.25)]">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
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
              initial={
                prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94, y: 10 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', damping: 22, stiffness: 320 }
              }
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
        <div role="log" aria-live="polite" aria-label="Conversations" className="space-y-2">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
