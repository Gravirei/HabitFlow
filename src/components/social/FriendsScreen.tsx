/**
 * Friends Screen — Friend list with streaks, nudges, last active, and XP
 * Modern card design with status indicators and interaction feedback
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { getLeagueTierColor } from './constants'
import type { Friend, FriendStatus } from './types'
import toast from 'react-hot-toast'

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

function FriendCard({
  friend,
  index,
  onNudge,
  onRemove,
}: {
  friend: Friend
  index: number
  onNudge: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, ease: 'easeOut' }}
      className="rounded-2xl bg-white/[0.025] border border-white/[0.05] hover:bg-white/[0.04] transition-colors duration-200"
    >
      <div
        className="flex items-center gap-3 p-3.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar + status */}
        <div className="relative flex-shrink-0">
          <img
            src={friend.avatarUrl}
            alt={friend.displayName}
            className="size-11 rounded-xl object-cover"
          />
          <div
            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-[1.5px] border-slate-900 shadow-sm ${statusColor[friend.status]}`}
          />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-white truncate">{friend.displayName}</p>
            <div
              className="flex size-4 items-center justify-center rounded"
              style={{ backgroundColor: getLeagueTierColor(friend.leagueTier) + '22' }}
            >
              <span
                className="material-symbols-outlined text-[9px]"
                style={{ color: getLeagueTierColor(friend.leagueTier), fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium">
            <span>Lv.{friend.level}</span>
            <span className="text-slate-700">·</span>
            <span>{timeAgo(friend.lastActive)}</span>
          </div>
        </div>

        {/* Streak flame */}
        {friend.mutualStreak > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/15 px-2 py-1">
            <span
              className="material-symbols-outlined text-[14px] text-orange-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-[11px] font-bold text-orange-400 tabular-nums">{friend.mutualStreak}</span>
          </div>
        )}

        {/* Nudge or check */}
        {!friend.todayCompleted ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation()
              onNudge(friend.userId)
            }}
            className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary cursor-pointer transition-colors duration-200 hover:bg-primary/20 active:bg-primary/30"
            title={`Nudge ${friend.displayName}`}
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          </motion.button>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <span
              className="material-symbols-outlined text-[18px] text-emerald-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        )}
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
                  onNudge(friend.userId)
                  setExpanded(false)
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2.5 text-xs font-semibold text-primary cursor-pointer hover:bg-primary/20 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                Send Nudge
              </button>
              <button
                onClick={() => {
                  onRemove(friend.userId)
                  setExpanded(false)
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 cursor-pointer hover:bg-red-500/20 transition-colors duration-200"
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

export function FriendsScreen() {
  const { friends, loadDemoFriends, sendNudge, removeFriend } = useSocialStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'streak'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadDemoFriends() }, [])

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
    sendNudge(id)
    const f = friends.find((x) => x.userId === id)
    toast.success(`Nudge sent to ${f?.displayName}!`, { icon: '🔔' })
  }

  const handleRemove = (id: string) => {
    removeFriend(id)
    toast.success('Friend removed')
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
          { v: activeCount, l: 'Online', c: 'text-emerald-400', icon: 'circle', ic: 'text-emerald-400' },
          { v: streakCount, l: 'Streaks', c: 'text-orange-400', icon: 'local_fire_department', ic: 'text-orange-400' },
        ].map((s) => (
          <div key={s.l} className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.025] border border-white/[0.04] py-3">
            <span className={`material-symbols-outlined text-sm ${s.ic}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {s.icon}
            </span>
            <span className={`text-lg font-bold ${s.c} tabular-nums`}>{s.v}</span>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`
              flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold cursor-pointer
              transition-all duration-200 ease-out
              ${filter === f.id
                ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
                : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white border border-white/[0.04]'
              }
            `}
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
          <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-800/40 border border-dashed border-slate-700/50">
            <span className="material-symbols-outlined text-4xl text-slate-600">
              {search ? 'search_off' : 'group_add'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400">
              {search ? 'No friends match your search' : 'No friends yet'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto">
              {search ? 'Try different keywords' : 'Add friends to compete and share streaks!'}
            </p>
          </div>
          {!search && (
            <button className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2.5 text-[13px] font-semibold text-primary cursor-pointer hover:bg-primary/20 transition-colors duration-200">
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
              onNudge={handleNudge}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
