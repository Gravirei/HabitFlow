/**
 * Social Hub — Main container for the Social Networking System
 * Polished tabbed interface with animated hero header
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { useProfileStore, getAvatarFallbackUrl } from '@/store/useProfileStore'
import { LeaderboardScreen } from './LeaderboardScreen'
import { FriendsScreen } from './FriendsScreen'
import { LeagueScreen } from './LeagueScreen'
import { ProfileTab } from './ProfileTab'
import { SocialOnboarding } from './SocialOnboarding'
import { getLevelForXP, getLevelProgress } from './constants'

// ─── Tab types ──────────────────────────────────────────────────────────────

type SocialTab = 'leaderboard' | 'friends' | 'league' | 'messages' | 'profile'

const TABS: { id: SocialTab; label: string; icon: string }[] = [
  { id: 'leaderboard', label: 'Rankings', icon: 'leaderboard' },
  { id: 'friends', label: 'Friends', icon: 'group' },
  { id: 'league', label: 'League', icon: 'shield' },
  { id: 'messages', label: 'Messages', icon: 'chat_bubble' },
  { id: 'profile', label: 'Profile', icon: 'military_tech' },
]

// ─── Hero Header ────────────────────────────────────────────────────────────

function HeroHeader() {
  const { totalXP, weeklyXP, currentStreak, friends } = useSocialStore()
  const { fullName, avatarUrl } = useProfileStore()
  const displayAvatar = avatarUrl || getAvatarFallbackUrl(fullName)
  const level = getLevelForXP(totalXP)
  const progress = getLevelProgress(totalXP)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border border-white/[0.06] p-5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-cyan-500/8 blur-3xl" />

      <div className="relative flex items-center gap-4">
        {/* Avatar with ring */}
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-primary via-emerald-400 to-cyan-400 opacity-80" />
          <img
            src={displayAvatar}
            alt={fullName}
            className="relative size-[60px] rounded-2xl object-cover ring-2 ring-slate-800"
          />
          {/* Level chip */}
          <div className="absolute -bottom-1.5 -right-1.5 flex h-6 items-center gap-0.5 rounded-lg bg-slate-900 border border-primary/30 px-1.5 shadow-lg">
            <span
              className="material-symbols-outlined text-primary text-[11px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {level.icon}
            </span>
            <span className="text-[10px] font-extrabold text-primary">{level.level}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white truncate leading-tight">{fullName}</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{level.title}</p>

          {/* XP Progress */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-[6px] rounded-full bg-slate-700/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 tabular-nums whitespace-nowrap">
              {progress.current}/{progress.required}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {[
          { value: totalXP.toLocaleString(), label: 'XP', icon: 'bolt', color: 'text-primary' },
          { value: `${weeklyXP}`, label: 'Weekly', icon: 'trending_up', color: 'text-emerald-400' },
          { value: `${currentStreak}`, label: 'Streak', icon: 'local_fire_department', color: 'text-orange-400' },
          { value: `${friends.length}`, label: 'Friends', icon: 'group', color: 'text-cyan-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.03] py-2"
          >
            <span
              className={`material-symbols-outlined text-sm ${stat.color}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {stat.icon}
            </span>
            <span className="text-sm font-bold text-white tabular-nums">{stat.value}</span>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab Bar ────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  onChange,
  friendNotifications,
}: {
  activeTab: SocialTab
  onChange: (tab: SocialTab) => void
  friendNotifications: number
}) {
  return (
    <div className="flex rounded-2xl bg-slate-800/60 border border-white/[0.04] p-1 gap-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const hasBadge = tab.id === 'friends' && friendNotifications > 0

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 cursor-pointer
              transition-all duration-200 ease-out
              ${isActive
                ? 'bg-primary shadow-lg shadow-primary/25'
                : 'hover:bg-white/[0.04] active:scale-95'
              }
            `}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-colors duration-200 ${
                isActive ? 'text-primary-content' : 'text-slate-400'
              }`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-primary-content' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </span>

            {hasBadge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30"
              >
                <span className="text-[8px] font-bold text-white">{friendNotifications}</span>
              </motion.div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SocialHub() {
  const [activeTab, setActiveTab] = useState<SocialTab>('leaderboard')
  const {
    getUnreadNudges,
    initializeBadges,
    hasSeenSocialOnboarding,
    friends,
    totalXP,
    getUnlockedBadges,
  } = useSocialStore()

  useEffect(() => {
    initializeBadges()
  }, [])

  const unreadCount = getUnreadNudges().length

  // GAP 5: Show onboarding when user has no social data and hasn't dismissed
  const showOnboarding =
    !hasSeenSocialOnboarding &&
    friends.length === 0 &&
    totalXP === 0 &&
    getUnlockedBadges().length === 0

  if (showOnboarding) {
    return <SocialOnboarding />
  }

  return (
    <div className="space-y-4">
      <HeroHeader />
      <TabBar activeTab={activeTab} onChange={setActiveTab} friendNotifications={unreadCount} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {activeTab === 'leaderboard' && <LeaderboardScreen />}
          {activeTab === 'friends' && <FriendsScreen />}
          {activeTab === 'league' && <LeagueScreen />}
          {activeTab === 'messages' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  chat_bubble
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Messages</h3>
              <p className="text-sm text-slate-400 max-w-xs">Coming soon! You'll be able to chat with your friends and share your progress here.</p>
            </div>
          )}
          {activeTab === 'profile' && <ProfileTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
