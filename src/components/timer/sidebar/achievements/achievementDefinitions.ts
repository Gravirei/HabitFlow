/**
 * Achievement Definitions
 * All available achievements in the system
 */

import type { AchievementDefinition, UserStats } from './types'

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============================================================================
  // TIME-BASED ACHIEVEMENTS
  // ============================================================================
  {
    id: 'time_10h',
    name: 'Getting Started',
    description: 'Complete 10 hours of focused time',
    icon: 'schedule',
    rarity: 'common',
    category: 'time',
    requirement: 36000, // 10 hours in seconds
    checkProgress: (stats) => stats.totalTime,
  },
  {
    id: 'time_50h',
    name: 'Dedicated',
    description: 'Reach 50 hours of total focus time',
    icon: 'timer',
    rarity: 'common',
    category: 'time',
    requirement: 180000, // 50 hours
    checkProgress: (stats) => stats.totalTime,
  },
  {
    id: 'time_100h',
    name: 'Centurion',
    description: 'Achieve 100 hours of focused work',
    icon: 'military_tech',
    rarity: 'rare',
    category: 'time',
    requirement: 360000, // 100 hours
    checkProgress: (stats) => stats.totalTime,
  },
  {
    id: 'time_500h',
    name: 'Time Master',
    description: 'Complete an incredible 500 hours',
    icon: 'workspace_premium',
    rarity: 'epic',
    category: 'time',
    requirement: 1800000, // 500 hours
    checkProgress: (stats) => stats.totalTime,
  },
  {
    id: 'time_1000h',
    name: 'Legend of Time',
    description: 'Reach the mythical 1000 hours milestone',
    icon: 'emoji_events',
    rarity: 'legendary',
    category: 'time',
    requirement: 3600000, // 1000 hours
    checkProgress: (stats) => stats.totalTime,
  },

  // ============================================================================
  // SESSION-BASED ACHIEVEMENTS
  // ============================================================================
  {
    id: 'sessions_10',
    name: 'First Steps',
    description: 'Complete your first 10 sessions',
    icon: 'play_circle',
    rarity: 'common',
    category: 'sessions',
    requirement: 10,
    checkProgress: (stats) => stats.completedSessions,
  },
  {
    id: 'sessions_50',
    name: 'Regular User',
    description: 'Complete 50 timer sessions',
    icon: 'repeat',
    rarity: 'common',
    category: 'sessions',
    requirement: 50,
    checkProgress: (stats) => stats.completedSessions,
  },
  {
    id: 'sessions_100',
    name: 'Century Club',
    description: 'Finish 100 focused sessions',
    icon: 'stars',
    rarity: 'rare',
    category: 'sessions',
    requirement: 100,
    checkProgress: (stats) => stats.completedSessions,
  },
  {
    id: 'sessions_500',
    name: 'Session Master',
    description: 'Complete an amazing 500 sessions',
    icon: 'auto_awesome',
    rarity: 'epic',
    category: 'sessions',
    requirement: 500,
    checkProgress: (stats) => stats.completedSessions,
  },
  {
    id: 'sessions_1000',
    name: 'Eternal Focus',
    description: 'Achieve 1000 completed sessions',
    icon: 'diamond',
    rarity: 'legendary',
    category: 'sessions',
    requirement: 1000,
    checkProgress: (stats) => stats.completedSessions,
  },

  // ============================================================================
  // STREAK-BASED ACHIEVEMENTS
  // ============================================================================
  {
    id: 'streak_3',
    name: 'Momentum',
    description: 'Maintain a 3-day streak',
    icon: 'local_fire_department',
    rarity: 'common',
    category: 'streak',
    requirement: 3,
    checkProgress: (stats) => stats.currentStreak,
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Keep a 7-day streak going',
    icon: 'whatshot',
    rarity: 'common',
    category: 'streak',
    requirement: 7,
    checkProgress: (stats) => stats.currentStreak,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Achieve an impressive 30-day streak',
    icon: 'local_fire_department',
    rarity: 'rare',
    category: 'streak',
    requirement: 30,
    checkProgress: (stats) => stats.currentStreak,
  },
  {
    id: 'streak_100',
    name: 'Unstoppable',
    description: 'Maintain a legendary 100-day streak',
    icon: 'local_fire_department',
    rarity: 'epic',
    category: 'streak',
    requirement: 100,
    checkProgress: (stats) => stats.currentStreak,
  },
  {
    id: 'streak_365',
    name: 'Year of Focus',
    description: 'Complete a full year streak - incredible!',
    icon: 'celebration',
    rarity: 'legendary',
    category: 'streak',
    requirement: 365,
    checkProgress: (stats) => stats.currentStreak,
  },

  // ============================================================================
  // MODE-SPECIFIC ACHIEVEMENTS - STOPWATCH
  // ============================================================================
  {
    id: 'mode_stopwatch_100',
    name: 'Stopwatch Pro',
    description: 'Complete 100 Stopwatch sessions',
    icon: 'timer',
    rarity: 'rare',
    category: 'mode',
    requirement: 100,
    mode: 'Stopwatch',
    checkProgress: (stats) => stats.stopwatchSessions,
  },
  {
    id: 'mode_stopwatch_500',
    name: 'Stopwatch Master',
    description: 'Achieve 500 Stopwatch sessions',
    icon: 'speed',
    rarity: 'epic',
    category: 'mode',
    requirement: 500,
    mode: 'Stopwatch',
    checkProgress: (stats) => stats.stopwatchSessions,
  },

  // MODE-SPECIFIC - COUNTDOWN
  {
    id: 'mode_countdown_100',
    name: 'Countdown Champion',
    description: 'Complete 100 Countdown sessions',
    icon: 'hourglass_bottom',
    rarity: 'rare',
    category: 'mode',
    requirement: 100,
    mode: 'Countdown',
    checkProgress: (stats) => stats.countdownSessions,
  },
  {
    id: 'mode_countdown_500',
    name: 'Countdown Legend',
    description: 'Finish 500 Countdown sessions',
    icon: 'hourglass_top',
    rarity: 'epic',
    category: 'mode',
    requirement: 500,
    mode: 'Countdown',
    checkProgress: (stats) => stats.countdownSessions,
  },

  // MODE-SPECIFIC - INTERVALS
  {
    id: 'mode_intervals_100',
    name: 'Interval Expert',
    description: 'Complete 100 Intervals sessions',
    icon: 'all_inclusive',
    rarity: 'rare',
    category: 'mode',
    requirement: 100,
    mode: 'Intervals',
    checkProgress: (stats) => stats.intervalsSessions,
  },
  {
    id: 'mode_intervals_500',
    name: 'Interval Virtuoso',
    description: 'Master 500 Intervals sessions',
    icon: 'autorenew',
    rarity: 'epic',
    category: 'mode',
    requirement: 500,
    mode: 'Intervals',
    checkProgress: (stats) => stats.intervalsSessions,
  },

  // ============================================================================
  // SPECIAL ACHIEVEMENTS
  // ============================================================================
  {
    id: 'special_first_session',
    name: 'Journey Begins',
    description: 'Complete your very first timer session',
    icon: 'rocket_launch',
    rarity: 'common',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => stats.completedSessions,
  },
  {
    id: 'special_early_bird',
    name: 'Early Bird',
    description: 'Start a session before 6 AM',
    icon: 'wb_twilight',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_night_owl',
    name: 'Night Owl',
    description: 'Work past midnight',
    icon: 'nightlight',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_marathon',
    name: 'Marathon Runner',
    description: 'Complete a single session over 4 hours',
    icon: 'directions_run',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_consistency',
    name: 'Consistency King',
    description: 'Be active for 30 different days',
    icon: 'event_available',
    rarity: 'rare',
    category: 'special',
    requirement: 30,
    checkProgress: (stats) => stats.daysActive,
  },
  {
    id: 'special_all_modes',
    name: 'Jack of All Modes',
    description: 'Complete 10+ sessions in each timer mode',
    icon: 'apps',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => {
      if (
        stats.stopwatchSessions >= 10 &&
        stats.countdownSessions >= 10 &&
        stats.intervalsSessions >= 10
      ) {
        return 1
      }
      return 0
    },
  },
  {
    id: 'special_weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete sessions on both Saturday and Sunday',
    icon: 'beach_access',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_sunrise_session',
    name: 'Sunrise Seeker',
    description: 'Start a session between 5 AM and 7 AM',
    icon: 'wb_sunny',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_golden_hour',
    name: 'Golden Hour',
    description: 'Complete a session during sunset (6 PM - 8 PM)',
    icon: 'wb_twilight',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_lunch_break',
    name: 'Lunch Break Champion',
    description: 'Use timer during lunch time (12 PM - 2 PM)',
    icon: 'lunch_dining',
    rarity: 'common',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 sessions in a single day',
    icon: 'bolt',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_power_hour',
    name: 'Power Hour',
    description: 'Complete exactly 1 hour in a single session',
    icon: 'schedule',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_double_century',
    name: 'Double Century',
    description: 'Complete a 2-hour focused session',
    icon: 'hourglass_full',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_minimalist',
    name: 'Minimalist',
    description: 'Complete 10 short sessions under 5 minutes',
    icon: 'timer_3',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_perfectionist',
    name: 'Perfectionist',
    description: 'Complete 25 sessions without missing a day',
    icon: 'verified',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_multitasker',
    name: 'Multitasker',
    description: 'Use all 3 timer modes in one day',
    icon: 'dynamic_feed',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_century_day',
    name: 'Century Day',
    description: 'Complete 100 minutes in a single day',
    icon: 'today',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_first_week',
    name: 'First Week Hero',
    description: 'Use timer every day for your first week',
    icon: 'celebration',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after 30 days of inactivity',
    icon: 'restart_alt',
    rarity: 'rare',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
  {
    id: 'special_pomodoro_master',
    name: 'Pomodoro Master',
    description: 'Complete 10 sessions of exactly 25 minutes',
    icon: 'timer',
    rarity: 'epic',
    category: 'special',
    requirement: 1,
    checkProgress: (stats) => 0, // Special check needed
  },
]

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((def) => def.id === id)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((def) => def.category === category)
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: string): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((def) => def.rarity === rarity)
}
