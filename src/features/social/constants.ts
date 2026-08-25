/**
 * Social System Constants
 * XP values, level thresholds, league configs, and badge definitions
 */

import type { XPLevel, LeagueConfig, SocialBadge, Friend } from './types'

// ─── Design Tokens (GAP 1) ──────────────────────────────────────────────────
// Single source of truth for all social system colors, surfaces, and borders.
// Primary brand color: #13ec5b — HabitFlow's vibrant emerald-green.
// Chosen because it provides 10.8:1 contrast on dark backgrounds, harmonizes
// with all 5 league tier colors (warm metals + cool gems), and matches the
// app-wide Tailwind `primary` token already defined in tailwind.config.js.

export const SOCIAL_DESIGN_TOKENS = {
  /** Brand */
  brand: {
    primary: '#13ec5b',
    primaryFocus: '#0ebf49',
    primaryContent: '#003811',
  },

  /** League tier colors — hex values matching LEAGUE_CONFIGS */
  league: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  },

  /** Badge rarity colors — start/end of each gradient */
  rarity: {
    common: { from: '#64748b', to: '#94a3b8' },   // slate-500 → slate-400
    rare: { from: '#3b82f6', to: '#22d3ee' },       // blue-500 → cyan-400
    epic: { from: '#a855f7', to: '#f472b6' },       // purple-500 → pink-400
    legendary: { from: '#f59e0b', to: '#fb923c' },  // amber-500 → orange-400
  },

  /** Surface card backgrounds — use with `bg-white/[value]` */
  surface: {
    subtle: 0.015,    // barely visible — hero ambient areas
    default: 0.025,   // standard card background
    raised: 0.04,     // hover state or elevated cards
  },

  /** Border opacities — use with `border-white/[value]` */
  border: {
    subtle: 0.04,     // default card border
    default: 0.06,    // elevated card / input border
  },
} as const

// ─── Animation Catalogue (GAP 2) ────────────────────────────────────────────
// Complete micro-interaction timing definitions for every interactive moment.
// Each entry provides Framer Motion transition props and a reducedMotion fallback.

export const SOCIAL_ANIMATIONS = {
  /** XP bar fills from 0% to current on screen mount */
  xpBarFillMount: {
    trigger: 'Screen mount (Leaderboard, Profile)',
    duration: 800,
    easing: 'easeOut',
    framerProps: { initial: { width: 0 }, animate: { width: 'auto' }, transition: { duration: 0.8, ease: 'easeOut' } },
    reducedMotion: { initial: { width: 'auto' }, animate: { width: 'auto' }, transition: { duration: 0 } },
    notes: 'Width is set dynamically via percentage. Shine sweep starts after fill.',
  },

  /** XP bar updates when new XP is awarded mid-session */
  xpBarFillUpdate: {
    trigger: 'awardXP() called while XPProgressBar is mounted',
    duration: 600,
    easing: 'easeOut',
    framerProps: { transition: { duration: 0.6, ease: 'easeOut' } },
    reducedMotion: { transition: { duration: 0 } },
    notes: 'Shorter than mount because user expects immediate feedback.',
  },

  /** Badge unlock — locked card morphs into unlocked rarity gradient */
  badgeUnlock: {
    trigger: 'checkAndUnlockBadges() unlocks a new badge',
    duration: 600,
    easing: 'spring',
    framerProps: { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', damping: 15, stiffness: 300 } },
    reducedMotion: { initial: { scale: 1, opacity: 1 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0 } },
    notes: 'Slight overshoot (damping 15) for celebratory feel. Glow pulse overlay follows.',
  },

  /** Badge card hover — subtle lift */
  badgeHover: {
    trigger: 'Mouse hover on SocialBadgeCard',
    duration: 200,
    easing: 'ease-out',
    framerProps: { whileHover: { scale: 1.02, y: -2 }, transition: { duration: 0.2, ease: 'easeOut' } },
    reducedMotion: { whileHover: {}, transition: { duration: 0 } },
    notes: 'CSS transition-all duration-200 as fallback for non-Framer hover.',
  },

  /** Nudge button tap — press feedback */
  nudgeButtonTap: {
    trigger: 'User taps nudge bell button',
    duration: 200,
    easing: 'default',
    framerProps: { whileTap: { scale: 0.88 }, transition: { duration: 0.2 } },
    reducedMotion: { whileTap: {}, transition: { duration: 0 } },
    notes: 'Scale only, no translateY to avoid layout shift.',
  },

  /** Nudge button disabled — cooldown state appearance */
  nudgeButtonDisabled: {
    trigger: 'Nudge sent within last 24h to this friend',
    duration: 300,
    easing: 'easeOut',
    framerProps: { initial: { opacity: 0.4 }, animate: { opacity: 0.4 }, transition: { duration: 0.3, ease: 'easeOut' } },
    reducedMotion: { initial: { opacity: 0.4 }, animate: { opacity: 0.4 }, transition: { duration: 0 } },
    notes: 'Icon swaps to schedule (clock). cursor-not-allowed applied via CSS.',
  },

  /** Podium bars rise on leaderboard mount */
  podiumBarsRise: {
    trigger: 'LeaderboardScreen mounts with data',
    duration: 400,
    easing: 'easeOut',
    framerProps: { initial: { height: 0 }, animate: { height: 'auto' }, transition: { duration: 0.4, ease: 'easeOut' } },
    reducedMotion: { initial: { height: 'auto' }, animate: { height: 'auto' }, transition: { duration: 0 } },
    notes: 'Delays: 1st=200ms, 2nd=350ms, 3rd=450ms. Staggered after avatar entrance.',
  },

  /** Rank rows stagger entrance */
  rankRowStagger: {
    trigger: 'LeaderboardScreen list rows mount',
    duration: 250,
    easing: 'easeOut',
    framerProps: { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { ease: 'easeOut' } },
    reducedMotion: { initial: { opacity: 1, x: 0 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0 } },
    notes: 'Delay per row: 300ms base + index * 35ms.',
  },

  /** Rank change number count-up animation */
  rankChangeCountUp: {
    trigger: 'Rank number appears on leaderboard row',
    duration: 500,
    easing: 'easeOut',
    framerProps: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: 'easeOut' } },
    reducedMotion: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } },
    notes: 'Applied to rank change badge (+N / -N / NEW). Staggered with parent row.',
  },

  /** League tier badge shine sweep */
  tierBadgeShineSweep: {
    trigger: 'TierBadge component mounts (League screen)',
    duration: 2500,
    easing: 'easeInOut',
    framerProps: { initial: { x: '-100%' }, animate: { x: '200%' }, transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 } },
    reducedMotion: { initial: { x: '-100%' }, animate: { x: '-100%' }, transition: { duration: 0 } },
    notes: 'Skewed gradient (skewX -20deg). via-white/20. Disabled entirely in reduced motion.',
  },

  /** League promotion full-screen celebration */
  leaguePromotion: {
    trigger: 'User finishes week in top 5 of their league',
    duration: 1200,
    easing: 'spring',
    framerProps: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', damping: 20, stiffness: 200, duration: 1.2 } },
    reducedMotion: { initial: { scale: 1, opacity: 1 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0 } },
    notes: 'Full-screen modal with confetti dots. New tier badge grows in with spring. Manual dismiss only.',
  },

  /** League demotion warning toast */
  leagueDemotionWarning: {
    trigger: 'User in bottom 5 with <=2 days remaining',
    duration: 400,
    easing: 'easeOut',
    framerProps: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' } },
    reducedMotion: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } },
    notes: 'Amber-toned toast. Encouraging tone, not punishing. Max once per day.',
  },

  /** Tab switch in SocialHub */
  tabSwitch: {
    trigger: 'User taps a different tab (Rankings/Friends/League/Profile)',
    duration: 220,
    easing: 'easeOut',
    framerProps: {
      exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeOut' } },
      enter: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: 'easeOut' } },
    },
    reducedMotion: {
      exit: { opacity: 0, transition: { duration: 0 } },
      enter: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } },
    },
    notes: 'AnimatePresence mode="wait". Old exits up, new enters from below.',
  },

  /** Friend card expand/collapse */
  friendCardExpand: {
    trigger: 'User taps a friend card to reveal actions',
    duration: 200,
    easing: 'easeOut',
    framerProps: {
      expand: { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, transition: { duration: 0.2, ease: 'easeOut' } },
      collapse: { initial: { height: 'auto', opacity: 1 }, animate: { height: 0, opacity: 0 }, transition: { duration: 0.2, ease: 'easeOut' } },
    },
    reducedMotion: {
      expand: { initial: { height: 'auto', opacity: 1 }, animate: { height: 'auto', opacity: 1 }, transition: { duration: 0 } },
      collapse: { initial: { height: 0, opacity: 0 }, animate: { height: 0, opacity: 0 }, transition: { duration: 0 } },
    },
    notes: 'AnimatePresence wraps action panel. overflow-hidden on container.',
  },

  /** DailyXPSummaryCard modal entrance */
  dailySummaryEntrance: {
    trigger: 'triggerDailySummary() or manual "Summary" button tap',
    duration: 500,
    easing: 'spring',
    framerProps: {
      backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } },
      card: { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    },
    reducedMotion: {
      backdrop: { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } },
      card: { initial: { opacity: 1, scale: 1, y: 0 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0 } },
    },
    notes: 'Spring-bounce card with backdrop fade. Trophy icon has additional 200ms delay.',
  },

  /** DailyXPSummaryCard modal exit */
  dailySummaryExit: {
    trigger: 'User taps "Awesome!" or backdrop',
    duration: 250,
    easing: 'easeIn',
    framerProps: {
      backdrop: { exit: { opacity: 0 }, transition: { duration: 0.25 } },
      card: { exit: { opacity: 0, scale: 0.9, y: 20 }, transition: { duration: 0.25, ease: 'easeIn' } },
    },
    reducedMotion: {
      backdrop: { exit: { opacity: 0 }, transition: { duration: 0 } },
      card: { exit: { opacity: 0 }, transition: { duration: 0 } },
    },
    notes: 'Reverse of entrance but faster. No spring on exit.',
  },

  /** Level-up moment — XP bar overflows into next level */
  levelUp: {
    trigger: 'awardXP() causes level to increase',
    duration: 1200,
    easing: 'spring',
    framerProps: {
      bar: { animate: { width: '100%' }, transition: { duration: 0.4, ease: 'easeOut' } },
      flash: { animate: { opacity: [0, 1, 0] }, transition: { duration: 0.6, delay: 0.4 } },
      newBar: { initial: { width: 0 }, animate: { width: 'auto' }, transition: { duration: 0.4, ease: 'easeOut', delay: 0.8 } },
    },
    reducedMotion: {
      bar: { animate: { width: 'auto' }, transition: { duration: 0 } },
      flash: { animate: { opacity: 0 }, transition: { duration: 0 } },
      newBar: { initial: { width: 'auto' }, animate: { width: 'auto' }, transition: { duration: 0 } },
    },
    notes: '3-phase: fill to 100%, white flash, reset and fill new level progress. Total 1200ms.',
  },

  /** Toast notification entrance */
  toastEntrance: {
    trigger: 'Any toast notification (nudge, badge, level-up, etc.)',
    duration: 300,
    easing: 'spring',
    framerProps: { initial: { opacity: 0, y: -20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: 'spring', damping: 25, stiffness: 350, duration: 0.3 } },
    reducedMotion: { initial: { opacity: 1, y: 0, scale: 1 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0 } },
    notes: 'react-hot-toast handles this, but custom styling uses these values.',
  },

  /** Toast notification exit */
  toastExit: {
    trigger: 'Toast auto-dismisses or user swipes',
    duration: 200,
    easing: 'easeIn',
    framerProps: { exit: { opacity: 0, y: -10, scale: 0.95 }, transition: { duration: 0.2, ease: 'easeIn' } },
    reducedMotion: { exit: { opacity: 0 }, transition: { duration: 0 } },
    notes: 'Slides up and fades. Faster than entrance for snappy feel.',
  },
} as const

// ─── XP Award Values ────────────────────────────────────────────────────────

export const XP_VALUES = {
  habit_complete: 10,
  streak_bonus: 5, // per day of streak (capped at 50)
  milestone: 25,
  league_promotion: 50,
  daily_goal: 15, // all habits done today
  weekly_goal: 30,
  first_habit: 20,
  nudge_response: 5,
  friend_streak: 10,
  perfect_day: 20, // 100% habits completed
  comeback: 15, // returning after 3+ days inactive
} as const

export const STREAK_BONUS_CAP = 50 // max XP from streak bonus per day

// ─── XP Source Labels ───────────────────────────────────────────────────────

export const XP_SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  habit_complete: { label: 'Habit Completed', icon: 'check_circle' },
  streak_bonus: { label: 'Streak Bonus', icon: 'local_fire_department' },
  milestone: { label: 'Milestone Reached', icon: 'flag' },
  league_promotion: { label: 'League Promotion', icon: 'arrow_upward' },
  daily_goal: { label: 'Daily Goal Met', icon: 'emoji_events' },
  weekly_goal: { label: 'Weekly Goal Met', icon: 'calendar_month' },
  first_habit: { label: 'First Habit Today', icon: 'star' },
  nudge_response: { label: 'Nudge Response', icon: 'notifications_active' },
  friend_streak: { label: 'Friend Streak', icon: 'group' },
  perfect_day: { label: 'Perfect Day', icon: 'workspace_premium' },
  comeback: { label: 'Welcome Back', icon: 'waving_hand' },
}

// ─── Level System (1–50) ────────────────────────────────────────────────────

export function generateLevels(): XPLevel[] {
  const levels: XPLevel[] = []
  const titles = [
    'Seedling', 'Sprout', 'Sapling', 'Bloom', 'Bud',
    'Leaf', 'Branch', 'Tree', 'Grove', 'Forest',
    'Explorer', 'Adventurer', 'Pathfinder', 'Trailblazer', 'Pioneer',
    'Achiever', 'Performer', 'Champion', 'Warrior', 'Hero',
    'Master', 'Expert', 'Virtuoso', 'Sage', 'Oracle',
    'Guardian', 'Sentinel', 'Warden', 'Protector', 'Shield',
    'Titan', 'Colossus', 'Olympian', 'Immortal', 'Ascendant',
    'Mystic', 'Arcane', 'Ethereal', 'Celestial', 'Cosmic',
    'Radiant', 'Luminous', 'Stellar', 'Supernova', 'Nebula',
    'Phoenix', 'Dragon', 'Sovereign', 'Emperor', 'Legend',
  ]
  const icons = [
    'eco', 'eco', 'park', 'local_florist', 'spa',
    'energy_savings_leaf', 'nature', 'forest', 'forest', 'forest',
    'explore', 'hiking', 'map', 'route', 'flag',
    'emoji_events', 'stars', 'military_tech', 'shield', 'workspace_premium',
    'school', 'psychology', 'auto_awesome', 'self_improvement', 'visibility',
    'security', 'verified_user', 'admin_panel_settings', 'health_and_safety', 'shield',
    'diamond', 'castle', 'stadium', 'bolt', 'rocket_launch',
    'auto_fix_high', 'blur_on', 'air', 'nightlight', 'dark_mode',
    'light_mode', 'wb_sunny', 'star', 'flare', 'brightness_7',
    'whatshot', 'pets', 'crown', 'king_bed', 'rewarded_ads',
  ]

  for (let i = 0; i < 50; i++) {
    const level = i + 1
    // XP curve: each level requires progressively more XP
    // Level 1: 0-100, Level 2: 100-250, ... Level 50: requires ~125k total
    const minXP = i === 0 ? 0 : Math.round(50 * Math.pow(level - 1, 1.8))
    const maxXP = Math.round(50 * Math.pow(level, 1.8))

    levels.push({
      level,
      minXP,
      maxXP,
      title: titles[i],
      icon: icons[i],
    })
  }

  return levels
}

export const LEVELS = generateLevels()

export function getLevelForXP(totalXP: number): XPLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export function getLevelProgress(totalXP: number): { current: number; required: number; percentage: number } {
  const level = getLevelForXP(totalXP)
  const current = totalXP - level.minXP
  const required = level.maxXP - level.minXP
  const percentage = Math.min(100, (current / required) * 100)
  return { current, required, percentage }
}

// ─── League Configuration ───────────────────────────────────────────────────

export const LEAGUE_CONFIGS: LeagueConfig[] = [
  {
    tier: 'reis',
    label: 'Reis League',
    icon: 'dark_mode',
    color: '#6400c8',
    gradient: 'from-purple-500 to-fuchsia-600',
    minXP: 0,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 0,
  },
  {
    tier: 'gravirei',
    label: 'Gravirei League',
    icon: 'dark_mode',
    color: '#6a00ce',
    gradient: 'from-purple-600 to-fuchsia-500',
    minXP: 100,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'gigano_reis',
    label: 'Gigano Reis League',
    icon: 'dark_mode',
    color: '#7000d4',
    gradient: 'from-purple-700 to-fuchsia-400',
    minXP: 250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ion_gravirei',
    label: 'Ion Gravirei League',
    icon: 'dark_mode',
    color: '#7600da',
    gradient: 'from-purple-800 to-fuchsia-600',
    minXP: 450,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'rioru_reis',
    label: 'Rioru Reis League',
    icon: 'dark_mode',
    color: '#7d00e1',
    gradient: 'from-purple-500 to-fuchsia-500',
    minXP: 700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'oruga_reis',
    label: 'Oruga Reis League',
    icon: 'dark_mode',
    color: '#8300e7',
    gradient: 'from-purple-600 to-fuchsia-400',
    minXP: 1000,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'baber_gravidon',
    label: 'Baber Gravidon League',
    icon: 'dark_mode',
    color: '#8900ed',
    gradient: 'from-purple-700 to-fuchsia-600',
    minXP: 1350,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'dioga_gravidon',
    label: 'Dioga Gravidon League',
    icon: 'dark_mode',
    color: '#8f00f3',
    gradient: 'from-purple-800 to-fuchsia-500',
    minXP: 1750,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'diborudo_jii_gravidon',
    label: 'Diborudo Jii Gravidon League',
    icon: 'dark_mode',
    color: '#9600fa',
    gradient: 'from-purple-500 to-fuchsia-400',
    minXP: 2200,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'nyuborutsu_ma_gurabirei',
    label: 'Nyuborutsu Ma Gurabirei League',
    icon: 'dark_mode',
    color: '#9c00100',
    gradient: 'from-purple-600 to-fuchsia-600',
    minXP: 2700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'nyuborutsu_shin_gurabirei',
    label: 'Nyuborutsu Shin Gurabirei League',
    icon: 'dark_mode',
    color: '#a200106',
    gradient: 'from-purple-700 to-fuchsia-500',
    minXP: 3250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'berudo_gravirei',
    label: 'Berudo Gravirei League',
    icon: 'dark_mode',
    color: '#a80010c',
    gradient: 'from-purple-800 to-fuchsia-400',
    minXP: 3850,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'bidom_gravirei',
    label: 'Bidom Gravirei League',
    icon: 'dark_mode',
    color: '#af00113',
    gradient: 'from-purple-500 to-fuchsia-600',
    minXP: 4500,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'kueaborutsu_gravirei',
    label: 'Kueaborutsu Gravirei League',
    icon: 'dark_mode',
    color: '#b500119',
    gradient: 'from-purple-600 to-fuchsia-500',
    minXP: 5200,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'digou_gurabiruku',
    label: 'Digou Gurabiruku League',
    icon: 'dark_mode',
    color: '#bb0011f',
    gradient: 'from-purple-700 to-fuchsia-400',
    minXP: 5950,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'shin_baberuga_gravidon',
    label: 'Shin Baberuga Gravidon League',
    icon: 'dark_mode',
    color: '#c100125',
    gradient: 'from-purple-800 to-fuchsia-600',
    minXP: 6750,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'zaker',
    label: 'Zaker League',
    icon: 'bolt',
    color: '#FFc800',
    gradient: 'from-yellow-400 to-amber-500',
    minXP: 7600,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'zakeruga',
    label: 'Zakeruga League',
    icon: 'bolt',
    color: '#FFc300',
    gradient: 'from-yellow-500 to-amber-400',
    minXP: 8500,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'teozaker',
    label: 'Teozaker League',
    icon: 'bolt',
    color: '#FFbe00',
    gradient: 'from-yellow-600 to-amber-300',
    minXP: 9450,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ganreizu_zakeru',
    label: 'Ganreizu Zakeru League',
    icon: 'bolt',
    color: '#FFb900',
    gradient: 'from-yellow-700 to-amber-500',
    minXP: 10450,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'rashirudo',
    label: 'Rashirudo League',
    icon: 'bolt',
    color: '#FFb400',
    gradient: 'from-yellow-400 to-amber-400',
    minXP: 11500,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'jikerudo',
    label: 'Jikerudo League',
    icon: 'bolt',
    color: '#FFaf00',
    gradient: 'from-yellow-500 to-amber-300',
    minXP: 12600,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'maazu_jikerudon',
    label: 'Maazu Jikerudon League',
    icon: 'bolt',
    color: '#FFaa00',
    gradient: 'from-yellow-600 to-amber-500',
    minXP: 13750,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'rauzaruku',
    label: 'Rauzaruku League',
    icon: 'bolt',
    color: '#FFa500',
    gradient: 'from-yellow-700 to-amber-400',
    minXP: 14950,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'zaguruzemu',
    label: 'Zaguruzemu League',
    icon: 'bolt',
    color: '#FFa000',
    gradient: 'from-yellow-400 to-amber-300',
    minXP: 16200,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'bao_zakeruga',
    label: 'Bao Zakeruga League',
    icon: 'bolt',
    color: '#FF9b00',
    gradient: 'from-yellow-500 to-amber-500',
    minXP: 17500,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'baou_kurou_disugurugu',
    label: 'Baou Kurou Disugurugu League',
    icon: 'bolt',
    color: '#FF9600',
    gradient: 'from-yellow-600 to-amber-400',
    minXP: 18850,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'jiou_renzu_zakeruga',
    label: 'Jiou Renzu Zakeruga League',
    icon: 'bolt',
    color: '#FF9100',
    gradient: 'from-yellow-700 to-amber-300',
    minXP: 20250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'shin_beruwan_bao_zakeruga',
    label: 'Shin Beruwan Bao Zakeruga League',
    icon: 'bolt',
    color: '#FF8c00',
    gradient: 'from-yellow-400 to-amber-500',
    minXP: 21700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'barudo_forusu',
    label: 'Barudo Forusu League',
    icon: 'bolt',
    color: '#FF8700',
    gradient: 'from-yellow-500 to-amber-400',
    minXP: 23200,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'seoshi',
    label: 'Seoshi League',
    icon: 'favorite',
    color: '#FF6496',
    gradient: 'from-pink-400 to-rose-500',
    minXP: 24750,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ma_seshield',
    label: 'Ma Seshield League',
    icon: 'favorite',
    color: '#FF6ea0',
    gradient: 'from-pink-500 to-rose-400',
    minXP: 26350,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'giga_la_seoshi',
    label: 'Giga La Seoshi League',
    icon: 'favorite',
    color: '#FF78aa',
    gradient: 'from-pink-600 to-rose-300',
    minXP: 28000,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'chajiru_seshieldon',
    label: 'Chajiru Seshieldon League',
    icon: 'favorite',
    color: '#FF82b4',
    gradient: 'from-pink-700 to-rose-500',
    minXP: 29700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'rima_chajiru_seshieldon',
    label: 'Rima Chajiru Seshieldon League',
    icon: 'favorite',
    color: '#FF8cbe',
    gradient: 'from-pink-400 to-rose-400',
    minXP: 31450,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'saifojio',
    label: 'Saifojio League',
    icon: 'favorite',
    color: '#FF96c8',
    gradient: 'from-pink-500 to-rose-300',
    minXP: 33250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'shin_saifojio',
    label: 'Shin Saifojio League',
    icon: 'favorite',
    color: '#FFa0d2',
    gradient: 'from-pink-600 to-rose-500',
    minXP: 35100,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'saisu',
    label: 'Saisu League',
    icon: 'favorite',
    color: '#FFaadc',
    gradient: 'from-pink-700 to-rose-400',
    minXP: 37000,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'gigano_saisu',
    label: 'Gigano Saisu League',
    icon: 'favorite',
    color: '#FFb4e6',
    gradient: 'from-pink-400 to-rose-300',
    minXP: 38950,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'chajiru_saifodon',
    label: 'Chajiru Saifodon League',
    icon: 'favorite',
    color: '#FFbef0',
    gradient: 'from-pink-500 to-rose-500',
    minXP: 40950,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'radisu',
    label: 'Radisu League',
    icon: 'auto_awesome',
    color: '#c8c8c8',
    gradient: 'from-slate-300 to-gray-400',
    minXP: 43000,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'rajia_radisu',
    label: 'Rajia Radisu League',
    icon: 'auto_awesome',
    color: '#cccccc',
    gradient: 'from-slate-400 to-gray-300',
    minXP: 45100,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'teoradisu',
    label: 'Teoradisu League',
    icon: 'auto_awesome',
    color: '#d0d0d0',
    gradient: 'from-slate-500 to-gray-200',
    minXP: 47250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ba_radisu',
    label: 'Ba Radisu League',
    icon: 'auto_awesome',
    color: '#d4d4d4',
    gradient: 'from-slate-600 to-gray-400',
    minXP: 49450,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'giru_ranzu_radisu',
    label: 'Giru Ranzu Radisu League',
    icon: 'auto_awesome',
    color: '#d8d8d8',
    gradient: 'from-slate-300 to-gray-300',
    minXP: 51700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'dioga_ranzu_radisu',
    label: 'Dioga Ranzu Radisu League',
    icon: 'auto_awesome',
    color: '#dcdcdc',
    gradient: 'from-slate-400 to-gray-200',
    minXP: 54000,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ranzu_radisu',
    label: 'Ranzu Radisu League',
    icon: 'auto_awesome',
    color: '#e0e0e0',
    gradient: 'from-slate-500 to-gray-400',
    minXP: 56350,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'supurifo',
    label: 'Supurifo League',
    icon: 'auto_awesome',
    color: '#e4e4e4',
    gradient: 'from-slate-600 to-gray-300',
    minXP: 58750,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ba_supurifo',
    label: 'Ba Supurifo League',
    icon: 'auto_awesome',
    color: '#e8e8e8',
    gradient: 'from-slate-300 to-gray-200',
    minXP: 61200,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'qua_supurifo',
    label: 'Qua Supurifo League',
    icon: 'auto_awesome',
    color: '#ececec',
    gradient: 'from-slate-400 to-gray-400',
    minXP: 63700,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'shin_kuria_seunousu',
    label: 'Shin Kuria Seunousu League',
    icon: 'auto_awesome',
    color: '#f0f0f0',
    gradient: 'from-slate-500 to-gray-300',
    minXP: 66250,
    usersPerLeague: 30,
    promoteCount: 5,
    demoteCount: 5,
  },
  {
    tier: 'ria_uruku',
    label: 'Ria Uruku League',
    icon: 'auto_awesome',
    color: '#f4f4f4',
    gradient: 'from-slate-600 to-gray-200',
    minXP: 68850,
    usersPerLeague: 30,
    promoteCount: 0,
    demoteCount: 5,
  },
];

export function getLeagueConfig(tier: string): LeagueConfig {
  return LEAGUE_CONFIGS.find(c => c.tier === tier) || LEAGUE_CONFIGS[0]
}

export function getLeagueTierColor(tier: string): string {
  const colors: Record<string, string> = {
  'reis': '#6400c8',
  'gravirei': '#6a00ce',
  'gigano_reis': '#7000d4',
  'ion_gravirei': '#7600da',
  'rioru_reis': '#7d00e1',
  'oruga_reis': '#8300e7',
  'baber_gravidon': '#8900ed',
  'dioga_gravidon': '#8f00f3',
  'diborudo_jii_gravidon': '#9600fa',
  'nyuborutsu_ma_gurabirei': '#9c00100',
  'nyuborutsu_shin_gurabirei': '#a200106',
  'berudo_gravirei': '#a80010c',
  'bidom_gravirei': '#af00113',
  'kueaborutsu_gravirei': '#b500119',
  'digou_gurabiruku': '#bb0011f',
  'shin_baberuga_gravidon': '#c100125',
  'zaker': '#FFc800',
  'zakeruga': '#FFc300',
  'teozaker': '#FFbe00',
  'ganreizu_zakeru': '#FFb900',
  'rashirudo': '#FFb400',
  'jikerudo': '#FFaf00',
  'maazu_jikerudon': '#FFaa00',
  'rauzaruku': '#FFa500',
  'zaguruzemu': '#FFa000',
  'bao_zakeruga': '#FF9b00',
  'baou_kurou_disugurugu': '#FF9600',
  'jiou_renzu_zakeruga': '#FF9100',
  'shin_beruwan_bao_zakeruga': '#FF8c00',
  'barudo_forusu': '#FF8700',
  'seoshi': '#FF6496',
  'ma_seshield': '#FF6ea0',
  'giga_la_seoshi': '#FF78aa',
  'chajiru_seshieldon': '#FF82b4',
  'rima_chajiru_seshieldon': '#FF8cbe',
  'saifojio': '#FF96c8',
  'shin_saifojio': '#FFa0d2',
  'saisu': '#FFaadc',
  'gigano_saisu': '#FFb4e6',
  'chajiru_saifodon': '#FFbef0',
  'radisu': '#c8c8c8',
  'rajia_radisu': '#cccccc',
  'teoradisu': '#d0d0d0',
  'ba_radisu': '#d4d4d4',
  'giru_ranzu_radisu': '#d8d8d8',
  'dioga_ranzu_radisu': '#dcdcdc',
  'ranzu_radisu': '#e0e0e0',
  'supurifo': '#e4e4e4',
  'ba_supurifo': '#e8e8e8',
  'qua_supurifo': '#ececec',
  'shin_kuria_seunousu': '#f0f0f0',
  'ria_uruku': '#f4f4f4',
};
  return colors[tier] || colors.reis
}

export function getLeagueTierGradient(tier: string): string {
  const gradients: Record<string, string> = {
  'reis': 'from-purple-500 to-fuchsia-600',
  'gravirei': 'from-purple-600 to-fuchsia-500',
  'gigano_reis': 'from-purple-700 to-fuchsia-400',
  'ion_gravirei': 'from-purple-800 to-fuchsia-600',
  'rioru_reis': 'from-purple-500 to-fuchsia-500',
  'oruga_reis': 'from-purple-600 to-fuchsia-400',
  'baber_gravidon': 'from-purple-700 to-fuchsia-600',
  'dioga_gravidon': 'from-purple-800 to-fuchsia-500',
  'diborudo_jii_gravidon': 'from-purple-500 to-fuchsia-400',
  'nyuborutsu_ma_gurabirei': 'from-purple-600 to-fuchsia-600',
  'nyuborutsu_shin_gurabirei': 'from-purple-700 to-fuchsia-500',
  'berudo_gravirei': 'from-purple-800 to-fuchsia-400',
  'bidom_gravirei': 'from-purple-500 to-fuchsia-600',
  'kueaborutsu_gravirei': 'from-purple-600 to-fuchsia-500',
  'digou_gurabiruku': 'from-purple-700 to-fuchsia-400',
  'shin_baberuga_gravidon': 'from-purple-800 to-fuchsia-600',
  'zaker': 'from-yellow-400 to-amber-500',
  'zakeruga': 'from-yellow-500 to-amber-400',
  'teozaker': 'from-yellow-600 to-amber-300',
  'ganreizu_zakeru': 'from-yellow-700 to-amber-500',
  'rashirudo': 'from-yellow-400 to-amber-400',
  'jikerudo': 'from-yellow-500 to-amber-300',
  'maazu_jikerudon': 'from-yellow-600 to-amber-500',
  'rauzaruku': 'from-yellow-700 to-amber-400',
  'zaguruzemu': 'from-yellow-400 to-amber-300',
  'bao_zakeruga': 'from-yellow-500 to-amber-500',
  'baou_kurou_disugurugu': 'from-yellow-600 to-amber-400',
  'jiou_renzu_zakeruga': 'from-yellow-700 to-amber-300',
  'shin_beruwan_bao_zakeruga': 'from-yellow-400 to-amber-500',
  'barudo_forusu': 'from-yellow-500 to-amber-400',
  'seoshi': 'from-pink-400 to-rose-500',
  'ma_seshield': 'from-pink-500 to-rose-400',
  'giga_la_seoshi': 'from-pink-600 to-rose-300',
  'chajiru_seshieldon': 'from-pink-700 to-rose-500',
  'rima_chajiru_seshieldon': 'from-pink-400 to-rose-400',
  'saifojio': 'from-pink-500 to-rose-300',
  'shin_saifojio': 'from-pink-600 to-rose-500',
  'saisu': 'from-pink-700 to-rose-400',
  'gigano_saisu': 'from-pink-400 to-rose-300',
  'chajiru_saifodon': 'from-pink-500 to-rose-500',
  'radisu': 'from-slate-300 to-gray-400',
  'rajia_radisu': 'from-slate-400 to-gray-300',
  'teoradisu': 'from-slate-500 to-gray-200',
  'ba_radisu': 'from-slate-600 to-gray-400',
  'giru_ranzu_radisu': 'from-slate-300 to-gray-300',
  'dioga_ranzu_radisu': 'from-slate-400 to-gray-200',
  'ranzu_radisu': 'from-slate-500 to-gray-400',
  'supurifo': 'from-slate-600 to-gray-300',
  'ba_supurifo': 'from-slate-300 to-gray-200',
  'qua_supurifo': 'from-slate-400 to-gray-400',
  'shin_kuria_seunousu': 'from-slate-500 to-gray-300',
  'ria_uruku': 'from-slate-600 to-gray-200',
};
  return gradients[tier] || gradients.reis
}

// ─── Badge Definitions ──────────────────────────────────────────────────────

export const SOCIAL_BADGE_DEFINITIONS: Omit<SocialBadge, 'earnedAt' | 'unlocked'>[] = [
  // Streak badges
  { id: 'streak-7', name: '7-Day Streak', description: 'Complete habits for 7 days in a row', icon: 'local_fire_department', category: 'streak', rarity: 'common' },
  { id: 'streak-30', name: '30-Day Streak', description: 'Complete habits for 30 days in a row', icon: 'local_fire_department', category: 'streak', rarity: 'rare' },
  { id: 'streak-100', name: 'Century Streak', description: '100-day streak — incredible dedication', icon: 'whatshot', category: 'streak', rarity: 'epic' },
  { id: 'streak-365', name: 'Year of Fire', description: '365-day streak — legendary commitment', icon: 'whatshot', category: 'streak', rarity: 'legendary' },

  // Social badges
  { id: 'first-friend', name: 'Social Butterfly', description: 'Add your first friend', icon: 'person_add', category: 'social', rarity: 'common' },
  { id: 'nudge-5', name: 'Encourager', description: 'Send 5 nudges to friends', icon: 'notifications_active', category: 'social', rarity: 'common' },
  { id: 'friend-streak-7', name: 'Accountability Duo', description: '7-day mutual streak with a friend', icon: 'group', category: 'social', rarity: 'rare' },
  { id: 'friend-10', name: 'Popular', description: 'Have 10 friends', icon: 'groups', category: 'social', rarity: 'rare' },

  // Milestone badges
  { id: 'level-10', name: 'Rising Star', description: 'Reach Level 10', icon: 'star', category: 'milestone', rarity: 'common' },
  { id: 'level-25', name: 'Seasoned Pro', description: 'Reach Level 25', icon: 'star', category: 'milestone', rarity: 'rare' },
  { id: 'level-50', name: 'Grandmaster', description: 'Reach the maximum Level 50', icon: 'star', category: 'milestone', rarity: 'legendary' },
  { id: 'xp-1000', name: 'XP Hunter', description: 'Earn 1,000 total XP', icon: 'bolt', category: 'milestone', rarity: 'common' },
  { id: 'xp-10000', name: 'XP Master', description: 'Earn 10,000 total XP', icon: 'bolt', category: 'milestone', rarity: 'epic' },
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete all habits every day for a week', icon: 'workspace_premium', category: 'milestone', rarity: 'rare' },

  // League badges
  { id: 'league-silver', name: 'Silver Rank', description: 'Reach the Silver League', icon: 'shield', category: 'league', rarity: 'common' },
  { id: 'league-gold', name: 'Gold Rank', description: 'Reach the Gold League', icon: 'shield', category: 'league', rarity: 'rare' },
  { id: 'league-platinum', name: 'Platinum Rank', description: 'Reach the Platinum League', icon: 'diamond', category: 'league', rarity: 'epic' },
  { id: 'league-diamond', name: 'Diamond Rank', description: 'Reach the Diamond League', icon: 'diamond', category: 'league', rarity: 'legendary' },
  { id: 'league-top3', name: 'Podium Finish', description: 'Finish in the top 3 of your league', icon: 'emoji_events', category: 'league', rarity: 'rare' },

  // Special badges
  { id: 'early-bird', name: 'Early Bird', description: 'Complete a habit before 7 AM', icon: 'wb_twilight', category: 'special', rarity: 'common' },
  { id: 'night-owl', name: 'Night Owl', description: 'Complete a habit after 11 PM', icon: 'dark_mode', category: 'special', rarity: 'common' },
  { id: 'comeback-kid', name: 'Comeback Kid', description: 'Return after 7+ days and complete a habit', icon: 'replay', category: 'special', rarity: 'rare' },
]

// ─── Mock/Demo Data Generators ──────────────────────────────────────────────

export const DEMO_NAMES = [
  'Sarah Chen', 'Marcus Rivera', 'Aisha Patel', 'Liam O\'Brien', 'Yuki Tanaka',
  'Zara Okafor', 'Noah Schmidt', 'Priya Sharma', 'Ethan Kim', 'Fatima Al-Hassan',
  'Oliver James', 'Isabella Santos', 'Ahmed Khan', 'Emma Wilson', 'David Park',
  'Sophia Liu', 'James Brown', 'Amara Diallo', 'Lucas Martin', 'Mia Thompson',
  'Benjamin Lee', 'Chloe Wang', 'Ryan Murphy', 'Ava Johnson', 'Daniel Garcia',
  'Grace Taylor', 'Alexander Wright', 'Lily Anderson', 'William Davis', 'Aria Nguyen',
]

export function generateDemoLeaderboard(currentUserName: string, currentUserXP: number): any[] {
  const entries = DEMO_NAMES.slice(0, 15).map((name, i) => {
    const xp = Math.max(10, Math.round(800 - i * 45 + (Math.random() * 80 - 40)))
    const prevRank = Math.max(1, i + 1 + Math.floor(Math.random() * 5 - 2))
    return {
      userId: `demo-${i}`,
      displayName: name,
      avatarUrl: `/images/avatars/avatar${(i % 15) + 1}.jpg`,
      xp,
      rank: i + 1,
      previousRank: Math.random() > 0.2 ? prevRank : null,
      rankChange: (prevRank > i + 1 ? 'up' : prevRank < i + 1 ? 'down' : Math.random() > 0.7 ? 'new' : 'same') as any,
      level: Math.max(1, Math.floor(xp / 100)),
      leagueTier: 'reis' as const,
      isCurrentUser: false,
    }
  })

  // Insert current user
  const userRank = Math.floor(Math.random() * 10) + 3
  const userEntry = {
    userId: 'current-user',
    displayName: currentUserName,
    avatarUrl: `/images/avatars/avatar15.jpg`,
    xp: currentUserXP,
    rank: userRank,
    previousRank: userRank + 2,
    rankChange: 'up' as const,
    level: Math.max(1, Math.floor(currentUserXP / 100)),
    leagueTier: 'reis' as const,
    isCurrentUser: true,
  }

  entries.splice(userRank - 1, 0, userEntry)
  // Re-rank
  return entries.slice(0, 15).map((e, i) => ({ ...e, rank: i + 1 }))
}

export function generateDemoFriends(): Friend[] {
  return DEMO_NAMES.slice(0, 8).map((name, i) => {
    const hoursAgo = Math.floor(Math.random() * 72)
    const lastActive = new Date(Date.now() - hoursAgo * 3600000).toISOString()
    const status = hoursAgo < 2 ? 'active' : hoursAgo < 24 ? 'inactive' : 'away'
    return {
      userId: `friend-${i}`,
      displayName: name,
      avatarUrl: `/images/avatars/avatar${(i % 15) + 1}.jpg`,
      level: Math.floor(Math.random() * 30) + 1,
      xp: Math.floor(Math.random() * 5000),
      mutualStreak: Math.floor(Math.random() * 20),
      lastActive,
      status: status as any,
      leagueTier: LEAGUE_CONFIGS[Math.floor(Math.random() * LEAGUE_CONFIGS.length)].tier,
      todayCompleted: Math.random() > 0.4,
      friendSince: new Date(Date.now() - Math.floor(Math.random() * 180) * 86400000).toISOString(),
    }
  })
}

export function generateDemoLeagueMembers(currentUserName: string): any[] {
  return DEMO_NAMES.slice(0, 30).map((name, i) => {
    const isCurrentUser = i === Math.floor(Math.random() * 10) + 5
    const weeklyXP = Math.max(5, Math.round(600 - i * 18 + (Math.random() * 60 - 30)))
    return {
      userId: isCurrentUser ? 'current-user' : `league-${i}`,
      displayName: isCurrentUser ? currentUserName : name,
      avatarUrl: isCurrentUser ? `/images/avatars/avatar15.jpg` : `/images/avatars/avatar${(i % 14) + 1}.jpg`,
      weeklyXP,
      rank: i + 1,
      level: Math.max(1, Math.floor(weeklyXP / 50)),
      isCurrentUser,
      zone: i < 5 ? 'promotion' : i >= 25 ? 'demotion' : 'safe',
    }
  }).sort((a, b) => b.weeklyXP - a.weeklyXP).map((m, i) => ({
    ...m,
    rank: i + 1,
    zone: i < 5 ? 'promotion' : i >= 25 ? 'demotion' : 'safe',
  }))
}

