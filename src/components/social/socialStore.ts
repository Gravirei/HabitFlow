/**
 * Social Store
 * Zustand store for XP, leaderboards, friends, leagues, and badges
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  XPEvent,
  XPSourceType,
  DailyXPSummary,
  LeaderboardPeriod,
  LeaderboardEntry,
  Friend,
  FriendRequest,
  Nudge,
  LeagueTier,
  LeagueMember,
  SocialBadge,
  SocialProfile,
} from './types'
import {
  XP_VALUES,
  XP_SOURCE_LABELS,
  STREAK_BONUS_CAP,
  getLevelForXP,
  SOCIAL_BADGE_DEFINITIONS,
  generateDemoLeaderboard,
  generateDemoFriends,
  generateDemoLeagueMembers,
} from './constants'

// ─── Helper ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── State Interface ────────────────────────────────────────────────────────

interface SocialState {
  // XP
  totalXP: number
  weeklyXP: number
  xpEvents: XPEvent[]
  dailySummaries: DailyXPSummary[]
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null

  // Leaderboard
  leaderboardPeriod: LeaderboardPeriod
  leaderboardEntries: LeaderboardEntry[]
  leaderboardLastUpdated: string | null

  // Friends
  friends: Friend[]
  friendRequests: FriendRequest[]
  nudges: Nudge[]
  sentNudgesCount: number

  // League
  currentLeagueTier: LeagueTier
  leagueMembers: LeagueMember[]
  leagueWeekStart: string | null
  leagueWeekEnd: string | null

  // Badges
  badges: SocialBadge[]

  // ─── XP Actions ─────────────────────────────────────────────────────────

  awardXP: (type: XPSourceType, habitId?: string, habitName?: string) => void
  getTodayXP: () => number
  getTodayEvents: () => XPEvent[]
  getTodaySummary: () => DailyXPSummary
  getLevel: () => { level: number; title: string; icon: string }

  // ─── Leaderboard Actions ────────────────────────────────────────────────

  setLeaderboardPeriod: (period: LeaderboardPeriod) => void
  refreshLeaderboard: () => void

  // ─── Friend Actions ─────────────────────────────────────────────────────

  sendFriendRequest: (toUserId: string, toDisplayName: string, toAvatarUrl: string) => void
  acceptFriendRequest: (requestId: string) => void
  declineFriendRequest: (requestId: string) => void
  removeFriend: (userId: string) => void
  sendNudge: (toUserId: string) => void
  markNudgeRead: (nudgeId: string) => void
  getUnreadNudges: () => Nudge[]
  loadDemoFriends: () => void

  // ─── League Actions ─────────────────────────────────────────────────────

  refreshLeague: () => void
  getLeagueDaysRemaining: () => number

  // ─── Badge Actions ──────────────────────────────────────────────────────

  initializeBadges: () => void
  checkAndUnlockBadges: () => void
  getUnlockedBadges: () => SocialBadge[]
  getLockedBadges: () => SocialBadge[]

  // ─── Profile ────────────────────────────────────────────────────────────

  getSocialProfile: (displayName: string, avatarUrl: string) => SocialProfile

  // ─── Streak ─────────────────────────────────────────────────────────────

  recordActivity: () => void

  // ─── Daily Summary (GAP 3) ─────────────────────────────────────────────

  dailySummaryShownDate: string | null
  shouldShowDailySummary: boolean
  triggerDailySummary: () => void
  dismissDailySummary: () => void
  checkSessionEndSummary: () => void

  // ─── Nudge Cooldown (GAP 4) ────────────────────────────────────────────

  nudgeCooldowns: Record<string, string>  // userId → ISO timestamp of last nudge
  canNudge: (userId: string) => boolean
  getNudgeCooldownRemaining: (userId: string) => { hours: number; minutes: number } | null

  // ─── Onboarding (GAP 5) ────────────────────────────────────────────────

  hasSeenSocialOnboarding: boolean
  dismissOnboarding: () => void

  // ─── Reset ──────────────────────────────────────────────────────────────

  resetSocial: () => void
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXP: 0,
      weeklyXP: 0,
      xpEvents: [],
      dailySummaries: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,

      leaderboardPeriod: 'weekly',
      leaderboardEntries: [],
      leaderboardLastUpdated: null,

      friends: [],
      friendRequests: [],
      nudges: [],
      sentNudgesCount: 0,

      currentLeagueTier: 'bronze',
      leagueMembers: [],
      leagueWeekStart: null,
      leagueWeekEnd: null,

      badges: [],

      dailySummaryShownDate: null,
      shouldShowDailySummary: false,
      hasSeenSocialOnboarding: false,
      nudgeCooldowns: {},

      // ─── XP Actions ───────────────────────────────────────────────────

      awardXP: (type, habitId, habitName) => {
        const baseAmount: number = XP_VALUES[type] ?? 10
        let amount: number = baseAmount

        // Cap streak bonus
        if (type === 'streak_bonus') {
          const streakDays = get().currentStreak
          amount = Math.min(streakDays * XP_VALUES.streak_bonus, STREAK_BONUS_CAP)
        }

        const sourceInfo = XP_SOURCE_LABELS[type] || { label: type, icon: 'star' }

        const event: XPEvent = {
          id: generateId(),
          type,
          amount,
          label: sourceInfo.label,
          icon: sourceInfo.icon,
          timestamp: new Date().toISOString(),
          habitId,
          habitName,
        }

        set((state) => {
          const newTotalXP = state.totalXP + amount
          const newWeeklyXP = state.weeklyXP + amount
          const newEvents = [event, ...state.xpEvents].slice(0, 500) // keep last 500

          // Update or create today's summary
          const today = todayKey()
          const existingSummaries = [...state.dailySummaries]
          const todayIdx = existingSummaries.findIndex((s) => s.date === today)

          if (todayIdx >= 0) {
            existingSummaries[todayIdx] = {
              ...existingSummaries[todayIdx],
              totalXP: existingSummaries[todayIdx].totalXP + amount,
              events: [event, ...existingSummaries[todayIdx].events],
              habitsCompleted:
                type === 'habit_complete'
                  ? existingSummaries[todayIdx].habitsCompleted + 1
                  : existingSummaries[todayIdx].habitsCompleted,
              streakBonus:
                type === 'streak_bonus'
                  ? existingSummaries[todayIdx].streakBonus + amount
                  : existingSummaries[todayIdx].streakBonus,
            }
          } else {
            existingSummaries.unshift({
              date: today,
              totalXP: amount,
              events: [event],
              habitsCompleted: type === 'habit_complete' ? 1 : 0,
              streakBonus: type === 'streak_bonus' ? amount : 0,
            })
          }

          // Update league tier based on total XP
          let newTier = state.currentLeagueTier
          if (newTotalXP >= 15000) newTier = 'diamond'
          else if (newTotalXP >= 5000) newTier = 'platinum'
          else if (newTotalXP >= 2000) newTier = 'gold'
          else if (newTotalXP >= 500) newTier = 'silver'
          else newTier = 'bronze'

          return {
            totalXP: newTotalXP,
            weeklyXP: newWeeklyXP,
            xpEvents: newEvents,
            dailySummaries: existingSummaries.slice(0, 90), // keep 90 days
            currentLeagueTier: newTier,
          }
        })

        // Check badges after XP award
        get().checkAndUnlockBadges()
      },

      getTodayXP: () => {
        const today = todayKey()
        const summary = get().dailySummaries.find((s) => s.date === today)
        return summary?.totalXP ?? 0
      },

      getTodayEvents: () => {
        const today = todayKey()
        return get().xpEvents.filter((e) => e.timestamp.startsWith(today))
      },

      getTodaySummary: () => {
        const today = todayKey()
        const existing = get().dailySummaries.find((s) => s.date === today)
        return (
          existing ?? {
            date: today,
            totalXP: 0,
            events: [],
            habitsCompleted: 0,
            streakBonus: 0,
          }
        )
      },

      getLevel: () => {
        const level = getLevelForXP(get().totalXP)
        return { level: level.level, title: level.title, icon: level.icon }
      },

      // ─── Leaderboard Actions ──────────────────────────────────────────

      setLeaderboardPeriod: (period) => {
        set({ leaderboardPeriod: period })
        get().refreshLeaderboard()
      },

      refreshLeaderboard: () => {
        // Generate demo data (in production, this would be an API call)
        const entries = generateDemoLeaderboard('You', get().weeklyXP)
        set({
          leaderboardEntries: entries,
          leaderboardLastUpdated: new Date().toISOString(),
        })
      },

      // ─── Friend Actions ───────────────────────────────────────────────

      sendFriendRequest: (toUserId, _toDisplayName, _toAvatarUrl) => {
        const request: FriendRequest = {
          id: generateId(),
          fromUserId: 'current-user',
          fromDisplayName: 'You',
          fromAvatarUrl: '',
          fromLevel: get().getLevel().level,
          toUserId,
          status: 'pending',
          sentAt: new Date().toISOString(),
        }
        set((state) => ({
          friendRequests: [...state.friendRequests, request],
        }))
      },

      acceptFriendRequest: (requestId) => {
        const request = get().friendRequests.find((r) => r.id === requestId)
        if (!request) return

        const newFriend: Friend = {
          userId: request.fromUserId,
          displayName: request.fromDisplayName,
          avatarUrl: request.fromAvatarUrl,
          level: request.fromLevel,
          xp: 0,
          mutualStreak: 0,
          lastActive: new Date().toISOString(),
          status: 'active',
          leagueTier: 'bronze',
          todayCompleted: false,
          friendSince: new Date().toISOString(),
        }

        set((state) => ({
          friends: [...state.friends, newFriend],
          friendRequests: state.friendRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'accepted' as const } : r
          ),
        }))

        get().checkAndUnlockBadges()
      },

      declineFriendRequest: (requestId) => {
        set((state) => ({
          friendRequests: state.friendRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'declined' as const } : r
          ),
        }))
      },

      removeFriend: (userId) => {
        set((state) => ({
          friends: state.friends.filter((f) => f.userId !== userId),
        }))
      },

      sendNudge: (toUserId) => {
        const friend = get().friends.find((f) => f.userId === toUserId)
        if (!friend) return

        // GAP 4: Check cooldown before sending
        if (!get().canNudge(toUserId)) return

        const nudge: Nudge = {
          id: generateId(),
          fromUserId: 'current-user',
          fromDisplayName: 'You',
          fromAvatarUrl: '',
          toUserId,
          message: `Hey ${friend.displayName}! Don't forget to log your habits today`,
          sentAt: new Date().toISOString(),
          read: false,
        }

        const now = new Date().toISOString()

        set((state) => ({
          nudges: [...state.nudges, nudge],
          sentNudgesCount: state.sentNudgesCount + 1,
          nudgeCooldowns: { ...state.nudgeCooldowns, [toUserId]: now },
        }))

        get().checkAndUnlockBadges()
      },

      markNudgeRead: (nudgeId) => {
        set((state) => ({
          nudges: state.nudges.map((n) =>
            n.id === nudgeId ? { ...n, read: true } : n
          ),
        }))
      },

      getUnreadNudges: () => {
        return get().nudges.filter((n) => !n.read && n.toUserId === 'current-user')
      },

      loadDemoFriends: () => {
        if (get().friends.length > 0) return
        set({ friends: generateDemoFriends() })
      },

      // ─── League Actions ───────────────────────────────────────────────

      refreshLeague: () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(now)
        monday.setDate(now.getDate() + mondayOffset)
        monday.setHours(0, 0, 0, 0)

        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        const members = generateDemoLeagueMembers('You')

        set({
          leagueMembers: members,
          leagueWeekStart: monday.toISOString(),
          leagueWeekEnd: sunday.toISOString(),
        })
      },

      getLeagueDaysRemaining: () => {
        const weekEnd = get().leagueWeekEnd
        if (!weekEnd) return 7
        const now = new Date()
        const end = new Date(weekEnd)
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(0, diff)
      },

      // ─── Badge Actions ────────────────────────────────────────────────

      initializeBadges: () => {
        if (get().badges.length > 0) return

        const badges: SocialBadge[] = SOCIAL_BADGE_DEFINITIONS.map((def) => ({
          ...def,
          unlocked: false,
        }))
        set({ badges })
      },

      checkAndUnlockBadges: () => {
        const state = get()
        const { totalXP, currentStreak, friends, sentNudgesCount, currentLeagueTier } = state
        const level = getLevelForXP(totalXP).level

        const updatedBadges = state.badges.map((badge) => {
          if (badge.unlocked) return badge

          let shouldUnlock = false

          switch (badge.id) {
            // Streak badges
            case 'streak-7': shouldUnlock = currentStreak >= 7; break
            case 'streak-30': shouldUnlock = currentStreak >= 30; break
            case 'streak-100': shouldUnlock = currentStreak >= 100; break
            case 'streak-365': shouldUnlock = currentStreak >= 365; break

            // Social badges
            case 'first-friend': shouldUnlock = friends.length >= 1; break
            case 'nudge-5': shouldUnlock = sentNudgesCount >= 5; break
            case 'friend-streak-7': shouldUnlock = friends.some((f) => f.mutualStreak >= 7); break
            case 'friend-10': shouldUnlock = friends.length >= 10; break

            // Milestone badges
            case 'level-10': shouldUnlock = level >= 10; break
            case 'level-25': shouldUnlock = level >= 25; break
            case 'level-50': shouldUnlock = level >= 50; break
            case 'xp-1000': shouldUnlock = totalXP >= 1000; break
            case 'xp-10000': shouldUnlock = totalXP >= 10000; break

            // League badges
            case 'league-silver': shouldUnlock = ['silver', 'gold', 'platinum', 'diamond'].includes(currentLeagueTier); break
            case 'league-gold': shouldUnlock = ['gold', 'platinum', 'diamond'].includes(currentLeagueTier); break
            case 'league-platinum': shouldUnlock = ['platinum', 'diamond'].includes(currentLeagueTier); break
            case 'league-diamond': shouldUnlock = currentLeagueTier === 'diamond'; break
          }

          if (shouldUnlock) {
            return { ...badge, unlocked: true, earnedAt: new Date().toISOString() }
          }
          return badge
        })

        set({ badges: updatedBadges })
      },

      getUnlockedBadges: () => get().badges.filter((b) => b.unlocked),
      getLockedBadges: () => get().badges.filter((b) => !b.unlocked),

      // ─── Profile ──────────────────────────────────────────────────────

      getSocialProfile: (displayName, avatarUrl) => {
        const state = get()
        const level = getLevelForXP(state.totalXP)
        return {
          userId: 'current-user',
          displayName,
          avatarUrl,
          level: level.level,
          totalXP: state.totalXP,
          weeklyXP: state.weeklyXP,
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          leagueTier: state.currentLeagueTier,
          badges: state.getUnlockedBadges(),
          friendCount: state.friends.length,
          habitsCompleted: state.dailySummaries.reduce((sum, s) => sum + s.habitsCompleted, 0),
          joinedAt: state.dailySummaries[state.dailySummaries.length - 1]?.date ?? todayKey(),
        }
      },

      // ─── Streak ───────────────────────────────────────────────────────

      recordActivity: () => {
        const today = todayKey()
        const lastActive = get().lastActiveDate

        if (lastActive === today) return // already recorded today

        let newStreak = 1
        if (lastActive) {
          const lastDate = new Date(lastActive)
          const todayDate = new Date(today)
          const diffDays = Math.round(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diffDays === 1) {
            newStreak = get().currentStreak + 1
          } else if (diffDays > 3 && get().currentStreak > 0) {
            // Comeback bonus
            get().awardXP('comeback')
          }
        }

        set((state) => ({
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastActiveDate: today,
        }))

        get().checkAndUnlockBadges()
      },

      // ─── Daily Summary (GAP 3) ────────────────────────────────────────

      /**
       * triggerDailySummary()
       *
       * Trigger priority (highest to lowest):
       * 1. Perfect Day — called when user completes 100% of habits for the day.
       *    External caller (habit store integration) invokes this directly.
       * 2. Manual — user taps "See Today's Summary" button in ProfileTab.
       *    Calls this method via button onClick.
       * 3. Session End (fallback) — if XP was earned today but modal hasn't
       *    been shown, fires on next app open after midnight.
       *    checkSessionEndSummary() handles this case.
       *
       * Guard: modal only shows once per calendar day (tracked by dailySummaryShownDate).
       * Guard: never shows if totalXP === 0 (first-time user with no data).
       */
      triggerDailySummary: () => {
        const state = get()
        const today = todayKey()

        // Never show if no XP has ever been earned
        if (state.totalXP === 0) return

        // Don't auto-show more than once per day
        if (state.dailySummaryShownDate === today) return

        set({ shouldShowDailySummary: true })
      },

      dismissDailySummary: () => {
        set({
          shouldShowDailySummary: false,
          dailySummaryShownDate: todayKey(),
        })
      },

      /**
       * checkSessionEndSummary() — Fallback trigger (priority 3).
       * Called on app mount / SocialHub mount. If the user earned XP
       * yesterday but never saw the summary, shows it now.
       */
      checkSessionEndSummary: () => {
        const state = get()
        const today = todayKey()

        // Never show on first-ever session
        if (state.totalXP === 0) return

        // Already shown today
        if (state.dailySummaryShownDate === today) return

        // Check if there's a summary for the last active date that wasn't shown
        if (
          state.lastActiveDate &&
          state.lastActiveDate !== today &&
          state.dailySummaryShownDate !== state.lastActiveDate
        ) {
          const lastSummary = state.dailySummaries.find(
            (s) => s.date === state.lastActiveDate
          )
          if (lastSummary && lastSummary.totalXP > 0) {
            set({ shouldShowDailySummary: true })
          }
        }
      },

      // ─── Nudge Cooldown (GAP 4) ──────────────────────────────────────

      canNudge: (userId) => {
        const lastNudge = get().nudgeCooldowns[userId]
        if (!lastNudge) return true
        const elapsed = Date.now() - new Date(lastNudge).getTime()
        const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours
        return elapsed >= COOLDOWN_MS
      },

      getNudgeCooldownRemaining: (userId) => {
        const lastNudge = get().nudgeCooldowns[userId]
        if (!lastNudge) return null
        const elapsed = Date.now() - new Date(lastNudge).getTime()
        const COOLDOWN_MS = 24 * 60 * 60 * 1000
        const remaining = COOLDOWN_MS - elapsed
        if (remaining <= 0) return null
        const hours = Math.floor(remaining / (60 * 60 * 1000))
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
        return { hours, minutes }
      },

      // ─── Onboarding (GAP 5) ──────────────────────────────────────────

      dismissOnboarding: () => {
        set({ hasSeenSocialOnboarding: true })
      },

      // ─── Reset ────────────────────────────────────────────────────────

      resetSocial: () => {
        set({
          totalXP: 0,
          weeklyXP: 0,
          xpEvents: [],
          dailySummaries: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          leaderboardPeriod: 'weekly',
          leaderboardEntries: [],
          leaderboardLastUpdated: null,
          friends: [],
          friendRequests: [],
          nudges: [],
          sentNudgesCount: 0,
          currentLeagueTier: 'bronze',
          leagueMembers: [],
          leagueWeekStart: null,
          leagueWeekEnd: null,
          badges: [],
          dailySummaryShownDate: null,
          shouldShowDailySummary: false,
          hasSeenSocialOnboarding: false,
          nudgeCooldowns: {},
        })
      },
    }),
    {
      name: 'social-store',
      version: 1,
    }
  )
)
