/**
 * Friends Screen — Friend list with streaks, nudges, last active, and XP
 * Modern card design with status indicators and interaction feedback
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '../store/socialStore'
import { getLeagueTierColor } from '../constants'
import type { Friend, FriendStatus } from '../types'
import toast from 'react-hot-toast'
import { useMessagingStore } from '@/features/social/store/messagingStore'
import { AddFriendsModal } from './AddFriendsModal'
import { FriendRequestInbox } from './FriendRequestInbox'
import { ProfilePreviewModal, generateProfilePreview } from './ProfilePreviewModal'
import type { ProfilePreviewData } from '../types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}

const statusColor: Record<FriendStatus, string> = {
  active: 'bg-emerald-400 shadow-emerald-400/40',
  inactive: 'bg-amber-400 shadow-amber-400/30',
  away: 'bg-slate-500',
}

// ─── Friend Card ────────────────────────────────────────────────────────────

/**
 * Nudge Button — 4 states:
 * 1. `available`  — friend hasn't logged, no recent nudge → bell icon, primary tint
 * 2. `sent`       — nudge sent, within 24hr cooldown → clock icon, muted, cursor-not-allowed
 * 3. `completed`  — friend already logged today → green check, no nudge
 * 4. `loading`    — API call in flight → spinner, disabled
 */
type NudgeState = 'available' | 'sent' | 'completed' | 'loading'

function NudgeButton({
  state,
  friendName,
  cooldown,
  onNudge,
}: {
  state: NudgeState
  friendName: string
  cooldown: { hours: number; minutes: number } | null
  onNudge: () => void
}) {
  const [showCooldownHint, setShowCooldownHint] = useState(false)

  useEffect(() => {
    if (showCooldownHint) {
      const t = setTimeout(() => setShowCooldownHint(false), 2000)
      return () => clearTimeout(t)
    }
  }, [showCooldownHint])

  if (state === 'completed') {
    return (
      <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10">
        <span
          className="material-symbols-outlined text-[18px] text-emerald-400"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex size-11 items-center justify-center rounded-xl bg-white/[0.03]">
        <span className="material-symbols-outlined animate-spin text-[18px] text-slate-500">
          progress_activity
        </span>
      </div>
    )
  }

  if (state === 'sent') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowCooldownHint(true)}
          className="flex size-11 cursor-not-allowed items-center justify-center rounded-xl bg-white/[0.03] opacity-40"
          title={
            cooldown
              ? `You already nudged ${friendName}. Come back in ${cooldown.hours}h ${cooldown.minutes}m`
              : undefined
          }
          aria-label={`Nudge on cooldown for ${friendName}`}
        >
          <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
        </button>
        {/* Cooldown hint on tap (touch devices) */}
        <AnimatePresence>
          {showCooldownHint && cooldown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-7 right-0 z-10 whitespace-nowrap rounded-lg border border-white/[0.06] bg-slate-800/95 px-2 py-1 backdrop-blur-sm"
            >
              <span className="text-[10px] font-medium text-slate-400">
                Nudge in {cooldown.hours}h {cooldown.minutes}m
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // available
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onNudge}
      className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 hover:bg-primary/20 active:bg-primary/30"
      title={`Nudge ${friendName}`}
      aria-label={`Send nudge to ${friendName}`}
    >
      <span className="material-symbols-outlined text-[18px]">notifications_active</span>
    </motion.button>
  )
}

function FriendCard({
  friend,
  index,
  nudgeState,
  cooldown,
  onNudge,
  onRemove,
  onMessage,
  onShowDetails,
}: {
  friend: Friend
  index: number
  nudgeState: NudgeState
  cooldown: { hours: number; minutes: number } | null
  onNudge: (id: string) => void
  onRemove: (id: string) => void
  onMessage: (id: string) => void
  onShowDetails: (friend: Friend) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const canSendNudge = nudgeState === 'available'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, ease: 'easeOut' }}
      className="rounded-2xl border border-white/[0.05] bg-white/[0.025] transition-colors duration-200 hover:bg-white/[0.04]"
    >
      <div
        className="flex cursor-pointer items-center gap-3 p-3.5"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar + status */}
        <div className="relative flex-shrink-0">
          <img
            src={friend.avatarUrl}
            alt={friend.displayName}
            className="size-11 rounded-xl object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/avatar1.jpg'
            }}
          />
          <div
            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-[1.5px] border-slate-900 shadow-sm ${statusColor[friend.status]}`}
          />
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13px] font-semibold text-white">{friend.displayName}</p>
            <div
              className="flex size-4 items-center justify-center rounded"
              style={{ backgroundColor: getLeagueTierColor(friend.leagueTier) + '22' }}
            >
              <span
                className="material-symbols-outlined text-[9px]"
                style={{
                  color: getLeagueTierColor(friend.leagueTier),
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                shield
              </span>
            </div>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
            <span>Lv.{friend.level}</span>
            <span className="text-slate-700">·</span>
            <span>{timeAgo(friend.lastActive)}</span>
          </div>
        </div>

        {/* Streak flame */}
        {friend.mutualStreak > 0 && (
          <div className="flex items-center gap-1 rounded-lg border border-orange-500/15 bg-orange-500/10 px-2 py-1">
            <span
              className="material-symbols-outlined text-[14px] text-orange-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-[11px] font-bold tabular-nums text-orange-400">
              {friend.mutualStreak}
            </span>
          </div>
        )}

        {/* Message button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.stopPropagation()
            onMessage(friend.userId)
          }}
          className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition-colors duration-200 hover:bg-cyan-500/20 active:bg-cyan-500/30"
          title={`Message ${friend.displayName}`}
          aria-label={`Send message to ${friend.displayName}`}
        >
          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
        </motion.button>

        {/* Nudge button with all 4 states */}
        <NudgeButton
          state={nudgeState}
          friendName={friend.displayName}
          cooldown={cooldown}
          onNudge={() => onNudge(friend.userId)}
        />
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 px-3.5 pb-3.5 pt-0.5">
              <button
                onClick={() => {
                  if (canSendNudge) onNudge(friend.userId)
                  setExpanded(false)
                }}
                disabled={!canSendNudge}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors duration-200 ${
                  canSendNudge
                    ? 'cursor-pointer bg-primary/10 text-primary hover:bg-primary/20'
                    : 'cursor-not-allowed bg-white/[0.02] text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {canSendNudge ? 'notifications_active' : 'schedule'}
                </span>
                {canSendNudge
                  ? 'Send Nudge'
                  : cooldown
                    ? `In ${cooldown.hours}h ${cooldown.minutes}m`
                    : 'Sent'}
              </button>
              <button
                onClick={() => {
                  onMessage(friend.userId)
                  setExpanded(false)
                }}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-cyan-500/10 py-2.5 text-xs font-semibold text-cyan-400 transition-colors duration-200 hover:bg-cyan-500/20"
              >
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                Message
              </button>
              <button
                onClick={() => {
                  onShowDetails(friend)
                  setExpanded(false)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-400 transition-colors duration-200 hover:bg-violet-500/20"
                aria-label="Show details"
              >
                <span className="material-symbols-outlined text-sm">info</span>
              </button>
              <button
                onClick={() => {
                  onRemove(friend.userId)
                  setExpanded(false)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors duration-200 hover:bg-red-500/20"
                aria-label="Remove friend"
              >
                <span className="material-symbols-outlined text-sm">person_remove</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────

interface FriendsScreenProps {
  onNavigateToMessages?: () => void
}

export function FriendsScreen({ onNavigateToMessages }: FriendsScreenProps) {
  const {
    friends,
    loadDemoFriends,
    sendNudge,
    removeFriend,
    canNudge,
    getNudgeCooldownRemaining,
    simulateIncomingRequests,
  } = useSocialStore()
  const { createDirectConversation, setActiveConversation } = useMessagingStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'streak'>('all')
  const [search, setSearch] = useState('')
  const [showAddFriends, setShowAddFriends] = useState(false)
  const [previewProfile, setPreviewProfile] = useState<ProfilePreviewData | null>(null)

  const handleShowDetails = (friend: Friend) => {
    setPreviewProfile(
      generateProfilePreview(friend.userId, friend.displayName, friend.avatarUrl, {
        level: friend.level,
        xp: friend.xp,
        leagueTier: friend.leagueTier,
        isCurrentUser: false,
        friendSince: friend.friendSince,
        mutualStreak: friend.mutualStreak,
        lastActive: friend.lastActive,
        todayCompleted: friend.todayCompleted,
      })
    )
  }

  useEffect(() => {
    loadDemoFriends()
    simulateIncomingRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = friends
    .filter((f) => {
      if (filter === 'active') return f.status === 'active'
      if (filter === 'streak') return f.mutualStreak > 0
      return true
    })
    .filter((f) => f.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return b.mutualStreak - a.mutualStreak || b.level - a.level
    })

  const handleNudge = (id: string) => {
    if (!canNudge(id)) return
    sendNudge(id)
    const f = friends.find((x) => x.userId === id)
    toast.success(`Nudge sent to ${f?.displayName}!`, {
      icon: '🔔',
      style: {
        background: '#1f2937',
        color: '#fff',
        borderRadius: '12px',
        border: '1px solid rgba(19, 236, 91, 0.3)',
      },
    })
  }

  const getNudgeState = (friend: Friend): NudgeState => {
    if (friend.todayCompleted) return 'completed'
    if (!canNudge(friend.userId)) return 'sent'
    return 'available'
  }

  const handleRemove = (id: string) => {
    removeFriend(id)
    toast.success('Friend removed')
  }

  const handleMessage = async (friendUserId: string) => {
    const conversationId = await createDirectConversation(friendUserId)
    if (conversationId) {
      setActiveConversation(conversationId)
      onNavigateToMessages?.()
    }
  }

  const activeCount = friends.filter((f) => f.status === 'active').length
  const streakCount = friends.filter((f) => f.mutualStreak > 0).length

  const filters: { id: typeof filter; label: string; icon: string; count?: number }[] = [
    { id: 'all', label: 'All', icon: 'group', count: friends.length },
    { id: 'active', label: 'Online', icon: 'circle', count: activeCount },
    { id: 'streak', label: 'Streaks', icon: 'local_fire_department', count: streakCount },
  ]

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: friends.length, l: 'Friends', c: 'text-white', icon: 'group', ic: 'text-slate-400' },
          {
            v: activeCount,
            l: 'Online',
            c: 'text-emerald-400',
            icon: 'circle',
            ic: 'text-emerald-400',
          },
          {
            v: streakCount,
            l: 'Streaks',
            c: 'text-orange-400',
            icon: 'local_fire_department',
            ic: 'text-orange-400',
          },
        ].map((s) => (
          <div
            key={s.l}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.04] bg-white/[0.025] py-3"
          >
            <span
              className={`material-symbols-outlined text-sm ${s.ic}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
            <span className={`text-lg font-bold ${s.c} tabular-nums`}>{s.v}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              {s.l}
            </span>
          </div>
        ))}
      </div>

      {/* Add Friends button */}
      <button
        onClick={() => setShowAddFriends(true)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <span className="material-symbols-outlined text-lg">person_add</span>
        Add Friends
      </button>

      {/* Friend Request Inbox */}
      <FriendRequestInbox />

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">
          search
        </span>
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[13px] text-white transition-all duration-200 placeholder:text-slate-500 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all duration-200 ease-out ${
              filter === f.id
                ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
                : 'border border-white/[0.04] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white'
            } `}
          >
            <span
              className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: filter === f.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {f.icon}
            </span>
            {f.label}
            {f.count !== undefined && (
              <span className={`text-[10px] ${filter === f.id ? 'opacity-70' : 'text-slate-600'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl border border-dashed border-slate-700/50 bg-slate-800/40">
            <span className="material-symbols-outlined text-4xl text-slate-600">
              {search ? 'search_off' : 'group_add'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400">
              {search ? 'No friends match your search' : 'No friends yet'}
            </p>
            <p className="mx-auto mt-1 max-w-[220px] text-xs text-slate-500">
              {search ? 'Try different keywords' : 'Add friends to compete and share streaks!'}
            </p>
          </div>
          {!search && (
            <button
              onClick={() => setShowAddFriends(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors duration-200 hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Add Friends
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((friend, i) => (
            <FriendCard
              key={friend.userId}
              friend={friend}
              index={i}
              nudgeState={getNudgeState(friend)}
              cooldown={getNudgeCooldownRemaining(friend.userId)}
              onNudge={handleNudge}
              onRemove={handleRemove}
              onMessage={handleMessage}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
      )}

      {/* Add Friends Modal */}
      <AddFriendsModal isOpen={showAddFriends} onClose={() => setShowAddFriends(false)} />

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        profile={previewProfile}
        isOpen={!!previewProfile}
        onClose={() => setPreviewProfile(null)}
        showMessage
        onMessage={(userId) => {
          handleMessage(userId)
          setPreviewProfile(null)
        }}
      />
    </div>
  )
}
