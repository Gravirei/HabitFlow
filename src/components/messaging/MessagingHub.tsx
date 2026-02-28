/**
 * MessagingHub — Conversations list screen
 * Main view for the Messages tab with search, filters, and conversation rows
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  // This week — show weekday name
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }

  // Older — MM/DD
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

// ─── Conversation Row ───────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  index,
  isOnline,
  prefersReducedMotion,
  onSelect,
}: {
  conversation: Conversation
  index: number
  isOnline: boolean
  prefersReducedMotion: boolean
  onSelect: () => void
}) {
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

  return (
    <motion.button
      {...motionProps}
      onClick={onSelect}
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
        <div className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-white flex-shrink-0">
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </div>
      )}
    </motion.button>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function MessagingHub({ onSelectConversation, onCompose }: MessagingHubProps) {
  const [search, setSearch] = useState('')
  const [showComposeMenu, setShowComposeMenu] = useState(false)
  const [showGroupCreation, setShowGroupCreation] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const {
    conversations,
    conversationFilter,
    setConversationFilter,
    setActiveConversation,
    onlineUsers,
    totalUnread,
  } = useMessagingStore()

  // Filter conversations
  const filtered = conversations
    .filter((c) => {
      if (conversationFilter === 'direct') return c.type === 'direct'
      if (conversationFilter === 'groups') return c.type === 'group'
      if (conversationFilter === 'unread') return c.unreadCount > 0
      return true
    })
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      // Then by updatedAt descending
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  // Get online status for direct conversation participant
  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.type !== 'direct') return false
    const participantId = conversation.memberIds.find((id) => id !== 'current-user')
    return participantId ? !!onlineUsers[participantId] : false
  }

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
                {/* Backdrop */}
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
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all duration-200"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setConversationFilter(f.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              conversationFilter === f.id
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25'
                : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white border border-white/[0.04]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: conversationFilter === f.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {f.icon}
            </span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-800/40 border border-dashed border-slate-700/50">
            <span className="material-symbols-outlined text-4xl text-slate-600">chat_bubble</span>
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
              Start chatting with your friends to see conversations here.
            </p>
          </div>
          {!search && conversationFilter === 'all' && (
            <button
              onClick={onCompose}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500/10 px-4 py-2.5 text-[13px] font-semibold text-teal-400 cursor-pointer hover:bg-teal-500/20 transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg">edit_square</span>
              Start a Conversation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((conversation, i) => (
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
