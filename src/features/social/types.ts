/**
 * Social Networking System Types
 * Complete type definitions for XP, Leaderboards, Friends, and Leagues
 */

// ─── XP & Levels ────────────────────────────────────────────────────────────

export type XPSourceType =
  | 'habit_complete'
  | 'streak_bonus'
  | 'milestone'
  | 'league_promotion'
  | 'daily_goal'
  | 'weekly_goal'
  | 'first_habit'
  | 'nudge_response'
  | 'friend_streak'
  | 'perfect_day'
  | 'comeback'

export interface XPEvent {
  id: string
  type: XPSourceType
  amount: number
  label: string
  icon: string
  timestamp: string // ISO string
  habitId?: string
  habitName?: string
}

export interface XPLevel {
  level: number
  minXP: number
  maxXP: number
  title: string
  icon: string
}

export interface DailyXPSummary {
  date: string // YYYY-MM-DD
  totalXP: number
  events: XPEvent[]
  habitsCompleted: number
  streakBonus: number
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

export type LeaderboardPeriod = 'weekly' | 'allTime'

export type RankChange = 'up' | 'down' | 'same' | 'new'

export interface LeaderboardEntry {
  userId: string
  displayName: string
  avatarUrl: string
  xp: number
  rank: number
  previousRank: number | null
  rankChange: RankChange
  level: number
  leagueTier: LeagueTier
  isCurrentUser: boolean
}

export interface LeaderboardState {
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  currentUserEntry: LeaderboardEntry | null
  lastUpdated: string
  weekStartDate: string
}

// ─── Friends & Nudges ───────────────────────────────────────────────────────

export type FriendStatus = 'active' | 'inactive' | 'away'
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

export interface Friend {
  userId: string
  displayName: string
  avatarUrl: string
  level: number
  xp: number
  mutualStreak: number // days of parallel habit completion
  lastActive: string // ISO string
  status: FriendStatus
  leagueTier: LeagueTier
  todayCompleted: boolean // has logged at least one habit today
  friendSince: string // ISO string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromDisplayName: string
  fromAvatarUrl: string
  fromLevel: number
  toUserId: string
  status: FriendRequestStatus
  sentAt: string
}

export interface Nudge {
  id: string
  fromUserId: string
  fromDisplayName: string
  fromAvatarUrl: string
  toUserId: string
  message: string
  sentAt: string
  read: boolean
}

// ─── Leagues ────────────────────────────────────────────────────────────────

export type LeagueTier =
  // Brago
  | 'reis' | 'gravirei' | 'gigano_reis' | 'ion_gravirei' | 'rioru_reis' | 'oruga_reis' | 'baber_gravidon' | 'dioga_gravidon' | 'diborudo_jii_gravidon' | 'nyuborutsu_ma_gurabirei' | 'nyuborutsu_shin_gurabirei' | 'berudo_gravirei' | 'bidom_gravirei' | 'kueaborutsu_gravirei' | 'digou_gurabiruku' | 'shin_baberuga_gravidon'
  // Zatch
  | 'zaker' | 'zakeruga' | 'teozaker' | 'ganreizu_zakeru' | 'rashirudo' | 'jikerudo' | 'maazu_jikerudon' | 'rauzaruku' | 'zaguruzemu' | 'bao_zakeruga' | 'baou_kurou_disugurugu' | 'jiou_renzu_zakeruga' | 'shin_beruwan_bao_zakeruga' | 'barudo_forusu'
  // Tio
  | 'seoshi' | 'ma_seshield' | 'giga_la_seoshi' | 'chajiru_seshieldon' | 'rima_chajiru_seshieldon' | 'saifojio' | 'shin_saifojio' | 'saisu' | 'gigano_saisu' | 'chajiru_saifodon'
  // Clear Note
  | 'radisu' | 'rajia_radisu' | 'teoradisu' | 'ba_radisu' | 'giru_ranzu_radisu' | 'dioga_ranzu_radisu' | 'ranzu_radisu' | 'supurifo' | 'ba_supurifo' | 'qua_supurifo' | 'shin_kuria_seunousu' | 'ria_uruku'

export interface LeagueConfig {
  tier: LeagueTier
  label: string
  icon: string
  color: string
  gradient: string
  minXP: number
  usersPerLeague: number
  promoteCount: number // top N promote
  demoteCount: number // bottom N demote
}

export interface LeagueMember {
  userId: string
  displayName: string
  avatarUrl: string
  weeklyXP: number
  rank: number
  level: number
  isCurrentUser: boolean
  zone: 'promotion' | 'safe' | 'demotion'
}

export interface League {
  id: string
  tier: LeagueTier
  members: LeagueMember[]
  weekStartDate: string
  weekEndDate: string
  daysRemaining: number
}

// ─── Achievement Badges (Social Layer) ──────────────────────────────────────

export type BadgeCategory = 'streak' | 'social' | 'milestone' | 'league' | 'special'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface SocialBadge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  earnedAt?: string
  unlocked: boolean
}

// ─── Discoverable Users ─────────────────────────────────────────────────

export interface DiscoverableUser {
  userId: string
  displayName: string
  avatarUrl: string
  level: number
  leagueTier: LeagueTier
  suggestionReason?: string
  requestStatus: 'none' | 'pending' | 'friend'
}

// ─── Profile Preview ────────────────────────────────────────────────────

export interface ProfilePreviewHabit {
  name: string
  streak: number
  completionRate: number // 0-100
  icon: string
}

export interface ProfilePreviewBadge {
  name: string
  icon: string
  rarity: BadgeRarity
}

export interface ProfilePreviewData {
  userId: string
  displayName: string
  avatarUrl: string
  bio: string
  level: number
  xp: number
  weeklyXP: number
  leagueTier: LeagueTier
  joinedAt: string // ISO date string
  topHabits: ProfilePreviewHabit[]
  badges: ProfilePreviewBadge[]
  currentStreak: number
  activeHabitsCount: number
  todayCompleted: boolean
  weeklyActivity: boolean[] // 7 booleans (Mon-Sun)
  isCurrentUser: boolean
  // Friend-only fields
  mutualStreak?: number
  lastActive?: string // ISO date string
}

// ─── Social Profile ─────────────────────────────────────────────────────────

export interface SocialProfile {
  userId: string
  displayName: string
  avatarUrl: string
  level: number
  totalXP: number
  weeklyXP: number
  currentStreak: number
  longestStreak: number
  leagueTier: LeagueTier
  badges: SocialBadge[]
  friendCount: number
  habitsCompleted: number
  joinedAt: string
}
