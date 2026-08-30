// @ts-nocheck
/**
 * ProfilePreviewModal — Full social profile preview for any user.
 * Used in Leaderboard, League, and Friends screens.
 *
 * Shows: avatar, name, bio, join date, league tier, level, XP,
 * activity stats, weekly heatmap, top 3 habits, badges, mutual streak.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { getLeagueTierColor } from '../constants'
import type {
  ProfilePreviewData,
  ProfilePreviewHabit,
  ProfilePreviewBadge,
  LeagueTier,
  BadgeRarity,
} from '../types'

// ─── Dummy data generators ─────────────────────────────────────────────

const DUMMY_BIOS: string[] = [
  'Fitness enthusiast | 30-day streak warrior 💪',
  'Early riser & productivity nerd 🌅',
  'Building better habits, one day at a time 🧱',
  'Meditation + journaling = clarity 🧘',
  'Learning something new every single day 📚',
  'Running towards my best self 🏃',
  'Consistency over perfection ✨',
  'Health first, everything else follows 🌿',
  'Chasing discipline, not motivation 🔥',
  'Small steps, big results 🎯',
  'Coffee ☕ + Focus = Greatness',
  'Habit stacking evangelist 📊',
  'Sleep, train, repeat 😴',
  'Mindfulness practitioner & reader 📖',
  'Making my future self proud 💫',
]

const DUMMY_HABITS: { name: string; icon: string }[] = [
  { name: 'Morning Run', icon: '🏃' },
  { name: 'Meditation', icon: '🧘' },
  { name: 'Read 30 mins', icon: '📚' },
  { name: 'Drink 2L Water', icon: '💧' },
  { name: 'Journaling', icon: '✍️' },
  { name: 'Gym Workout', icon: '🏋️' },
  { name: 'No Screen Before Bed', icon: '📵' },
  { name: 'Healthy Breakfast', icon: '🥗' },
  { name: 'Walk 10K Steps', icon: '👟' },
  { name: 'Study 1 Hour', icon: '🎓' },
  { name: 'Gratitude List', icon: '🙏' },
  { name: 'Cold Shower', icon: '🚿' },
  { name: 'Stretch Routine', icon: '🤸' },
  { name: 'Practice Guitar', icon: '🎸' },
  { name: 'Deep Work Block', icon: '🎯' },
]

const DUMMY_BADGES: { name: string; icon: string; rarity: BadgeRarity }[] = [
  { name: '7-Day Streak', icon: '🔥', rarity: 'common' },
  { name: 'Early Bird', icon: '🐦', rarity: 'common' },
  { name: 'Social Butterfly', icon: '🦋', rarity: 'uncommon' },
  { name: '30-Day Warrior', icon: '⚔️', rarity: 'uncommon' },
  { name: 'Habit Master', icon: '🏆', rarity: 'rare' },
  { name: 'XP Machine', icon: '⚡', rarity: 'rare' },
  { name: 'Century Club', icon: '💯', rarity: 'epic' },
  { name: 'League Champion', icon: '👑', rarity: 'epic' },
  { name: 'Diamond Mind', icon: '💎', rarity: 'legendary' },
  { name: 'Unstoppable', icon: '🚀', rarity: 'legendary' },
]

const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

/**
 * Generates a deterministic but varied profile preview from minimal user data.
 * Uses the userId hash to pick consistent dummy data per user.
 */
export function generateProfilePreview(
  userId: string,
  displayName: string,
  avatarUrl: string,
  opts: {
    level?: number
    xp?: number
    weeklyXP?: number
    leagueTier?: LeagueTier
    isCurrentUser?: boolean
    friendSince?: string
    mutualStreak?: number
    lastActive?: string
    todayCompleted?: boolean
  } = {}
): ProfilePreviewData {
  // Deterministic hash from userId
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  const bio = DUMMY_BIOS[hash % DUMMY_BIOS.length]

  // Pick 3 unique habits deterministically
  const habitIndices = [
    hash % DUMMY_HABITS.length,
    (hash + 3) % DUMMY_HABITS.length,
    (hash + 7) % DUMMY_HABITS.length,
  ]
  const seenH = new Set<number>()
  const uniqueHabitIndices: number[] = []
  for (const idx of habitIndices) {
    let i = idx
    while (seenH.has(i)) i = (i + 1) % DUMMY_HABITS.length
    seenH.add(i)
    uniqueHabitIndices.push(i)
  }

  const topHabits: ProfilePreviewHabit[] = uniqueHabitIndices.map((i, rank) => ({
    name: DUMMY_HABITS[i].name,
    icon: DUMMY_HABITS[i].icon,
    streak: Math.max(3, 60 - rank * 15 - (hash % 20)),
    completionRate: Math.min(100, Math.max(50, 95 - rank * 10 - (hash % 15))),
  }))

  // Pick 3 unique badges (sorted by rarity — rarest first)
  const badgeIndices = [
    (hash + 2) % DUMMY_BADGES.length,
    (hash + 5) % DUMMY_BADGES.length,
    (hash + 9) % DUMMY_BADGES.length,
  ]
  const seenB = new Set<number>()
  const uniqueBadgeIndices: number[] = []
  for (const idx of badgeIndices) {
    let i = idx
    while (seenB.has(i)) i = (i + 1) % DUMMY_BADGES.length
    seenB.add(i)
    uniqueBadgeIndices.push(i)
  }
  const rarityOrder: BadgeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common']
  const badges: ProfilePreviewBadge[] = uniqueBadgeIndices
    .map((i) => DUMMY_BADGES[i])
    .sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity))

  // Weekly activity (7 bools, deterministic)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => (hash + i * 13) % 5 !== 0)

  // Streak
  const currentStreak = Math.max(1, 45 - (hash % 40))

  // Active habits count
  const activeHabitsCount = 3 + (hash % 6)

  // Generate a plausible join date (30-365 days ago, deterministic)
  const daysAgo = 30 + (hash % 335)
  const joinDate = new Date()
  joinDate.setDate(joinDate.getDate() - daysAgo)

  // Generate lastActive if not provided
  const lastActiveHours = (hash % 12) + 1
  const lastActiveDate = new Date(Date.now() - lastActiveHours * 3600000)

  return {
    userId,
    displayName,
    avatarUrl,
    bio,
    level: opts.level ?? Math.floor(hash / 5) + 1,
    xp: opts.xp ?? (hash * 47) % 10000,
    weeklyXP: opts.weeklyXP ?? (hash * 23) % 2000,
    leagueTier: opts.leagueTier ?? 'bronze',
    joinedAt: opts.friendSince ?? joinDate.toISOString(),
    topHabits,
    badges,
    currentStreak,
    activeHabitsCount,
    todayCompleted: opts.todayCompleted ?? hash % 3 !== 0,
    weeklyActivity,
    isCurrentUser: opts.isCurrentUser ?? false,
    mutualStreak: opts.mutualStreak,
    lastActive: opts.lastActive ?? lastActiveDate.toISOString(),
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────

function formatJoinDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  const months = Math.floor(d / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ─── Component ──────────────────────────────────────────────────────────

interface ProfilePreviewModalProps {
  profile: ProfilePreviewData | null
  isOpen: boolean
  onClose: () => void
  showAddFriend?: boolean
  onAddFriend?: (userId: string) => void
  showMessage?: boolean
  onMessage?: (userId: string) => void
}

export function ProfilePreviewModal({
  profile,
  isOpen,
  onClose,
  showAddFriend,
  onAddFriend,
  showMessage,
  onMessage,
}: ProfilePreviewModalProps) {
  if (!isOpen || !profile) return null

  const tierColor = getLeagueTierColor(profile.leagueTier)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#0f1628] sm:rounded-3xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/[0.06] transition-colors hover:bg-white/[0.1]"
          >
            <span className="material-symbols-outlined text-lg text-slate-400">close</span>
          </button>

          {/* Scrollable content */}
          <div className="no-scrollbar flex-1 overflow-y-auto">
            {/* ── Header: Avatar + Name + Bio ─────────────────────────── */}
            <div className="flex flex-col items-center px-5 pb-4 pt-8">
              {/* Avatar with league badge */}
              <div className="relative mb-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="size-24 rounded-2xl object-cover shadow-xl ring-2 ring-white/10"
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-lg border-2 border-[#0f1628]"
                  style={{ backgroundColor: tierColor }}
                >
                  <span className="text-[9px] font-black capitalize text-white">
                    {profile.leagueTier.charAt(0)}
                  </span>
                </div>
                {/* Online / last active indicator */}
                {profile.lastActive && (
                  <div
                    className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-[#0f1628] bg-emerald-400"
                    title="Recently active"
                  />
                )}
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-white">
                {profile.isCurrentUser ? 'You' : profile.displayName}
              </h3>

              {/* Bio */}
              <p className="mt-1.5 max-w-[300px] text-center text-[13px] leading-relaxed text-slate-400">
                {profile.bio}
              </p>

              {/* Last active */}
              {profile.lastActive && !profile.isCurrentUser && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-slate-500">
                    Active {timeAgo(profile.lastActive)}
                  </span>
                </div>
              )}

              {/* Joined date */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-600">
                  calendar_month
                </span>
                <span className="text-[11px] text-slate-500">
                  Joined {formatJoinDate(profile.joinedAt)}
                  <span className="text-slate-600"> · {timeAgo(profile.joinedAt)}</span>
                </span>
              </div>
            </div>

            {/* ── Mutual Streak (friends only) ────────────────────────── */}
            {profile.mutualStreak != null && profile.mutualStreak > 0 && (
              <div className="mx-5 mb-3">
                <div className="flex items-center justify-center gap-2 rounded-xl border border-orange-400/15 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 px-4 py-2.5">
                  <span className="text-lg">🔥</span>
                  <span className="text-[13px] font-semibold text-orange-300">
                    {profile.mutualStreak}-day mutual streak with you!
                  </span>
                </div>
              </div>
            )}

            {/* ── Stats Grid (2×2) ────────────────────────────────────── */}
            <div className="mx-5 mb-4 grid grid-cols-4 gap-2">
              {/* Current Streak */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
                <span className="text-base">🔥</span>
                <p className="text-sm font-bold text-white">{profile.currentStreak}</p>
                <p className="text-[10px] font-medium text-slate-500">Streak</p>
              </div>

              {/* Weekly XP */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
                <span className="text-base">⚡</span>
                <p className="text-sm font-bold text-white">{profile.weeklyXP.toLocaleString()}</p>
                <p className="text-[10px] font-medium text-slate-500">Week XP</p>
              </div>

              {/* Active Habits */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
                <span className="text-base">📋</span>
                <p className="text-sm font-bold text-white">{profile.activeHabitsCount}</p>
                <p className="text-[10px] font-medium text-slate-500">Habits</p>
              </div>

              {/* Today Status */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
                <span className="text-base">{profile.todayCompleted ? '✅' : '⏳'}</span>
                <p
                  className={`text-sm font-bold ${profile.todayCompleted ? 'text-emerald-400' : 'text-amber-400'}`}
                >
                  {profile.todayCompleted ? 'Done' : 'Not yet'}
                </p>
                <p className="text-[10px] font-medium text-slate-500">Today</p>
              </div>
            </div>

            {/* ── Main Stats Bar ──────────────────────────────────────── */}
            <div className="mx-5 mb-4 flex items-center justify-center gap-6 rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
              <div className="text-center">
                <p className="text-base font-bold text-white">{profile.level}</p>
                <p className="text-[10px] font-medium text-slate-500">Level</p>
              </div>
              <div className="h-8 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-base font-bold text-white">{profile.xp.toLocaleString()}</p>
                <p className="text-[10px] font-medium text-slate-500">Total XP</p>
              </div>
              <div className="h-8 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-base font-bold capitalize" style={{ color: tierColor }}>
                  {profile.leagueTier}
                </p>
                <p className="text-[10px] font-medium text-slate-500">League</p>
              </div>
            </div>

            {/* ── Weekly Activity Heatmap ─────────────────────────────── */}
            <div className="mx-5 mb-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                This Week
              </p>
              <div className="flex items-center justify-between gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                {profile.weeklyActivity.map((active, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? 'border border-emerald-400/30 bg-emerald-400/20'
                          : 'border border-white/[0.04] bg-white/[0.03]'
                      }`}
                    >
                      {active ? (
                        <span
                          className="material-symbols-outlined text-sm text-emerald-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="size-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${active ? 'text-emerald-400/70' : 'text-slate-600'}`}
                    >
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Top 3 Habits ────────────────────────────────────────── */}
            <div className="mx-5 mb-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Top Habits
              </p>
              <div className="space-y-2">
                {profile.topHabits.map((habit, i) => (
                  <div
                    key={habit.name}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
                  >
                    {/* Rank medal */}
                    <div className="flex size-8 flex-shrink-0 items-center justify-center">
                      <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    </div>

                    {/* Habit icon + name */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{habit.icon}</span>
                        <span className="truncate text-[13px] font-semibold text-white">
                          {habit.name}
                        </span>
                      </div>
                    </div>

                    {/* Streak + completion */}
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">🔥</span>
                        <span className="text-[12px] font-semibold text-orange-400">
                          {habit.streak}d
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-emerald-400/70"
                            style={{ width: `${habit.completionRate}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] font-medium text-slate-500">
                          {habit.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Badges Showcase ─────────────────────────────────────── */}
            <div className="mx-5 mb-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Badges
              </p>
              <div className="flex gap-2">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.name}
                    className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-3"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="w-full truncate text-center text-[11px] font-semibold leading-tight text-white">
                      {badge.name}
                    </span>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        color: RARITY_COLORS[badge.rarity],
                        backgroundColor: RARITY_COLORS[badge.rarity] + '15',
                      }}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Buttons ──────────────────────────────────────── */}
            {!profile.isCurrentUser && (showAddFriend || showMessage) && (
              <div className="mx-5 mb-6 flex gap-2">
                {showMessage && onMessage && (
                  <button
                    onClick={() => onMessage(profile.userId)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-3 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Message
                  </button>
                )}
                {showAddFriend && onAddFriend && (
                  <button
                    onClick={() => onAddFriend(profile.userId)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-400/10 py-3 text-[13px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Add Friend
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
