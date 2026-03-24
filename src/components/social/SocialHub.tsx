/**
 * Social Hub — Main container for the Social Networking System
 * Polished tabbed interface with animated hero header
 */

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSocialStore } from './socialStore'
import { LeaderboardScreen } from './LeaderboardScreen'
import { FriendsScreen } from './FriendsScreen'
import { LeagueScreen } from './LeagueScreen'
import { ProfileTab } from './ProfileTab'
import { SocialOnboarding } from './SocialOnboarding'
import { MessagingHub } from '../messaging/MessagingHub'
import { ConversationScreen } from '../messaging/ConversationScreen'
import { useMessagingStore } from '../messaging/messagingStore'
import { LeagueMapScreen } from './LeagueMapScreen'

// ─── Tab types ──────────────────────────────────────────────────────────────

import type { SocialTab } from './SocialBottomNav'
import type { LeagueTier } from './types'

// ─── Main Component ─────────────────────────────────────────────────────────

interface SocialHubProps {
  activeTab: SocialTab
  onNavigateToMessages?: () => void
}

export function SocialHub({ activeTab, onNavigateToMessages }: SocialHubProps) {
  const {
    initializeBadges,
    hasSeenSocialOnboarding,
    friends,
    totalXP,
    getUnlockedBadges,
    currentLeagueTier,
  } = useSocialStore()

  const { activeConversationId, setActiveConversation, createDirectConversation, conversations } = useMessagingStore()

  const [leagueMode, setLeagueMode] = useState<'map' | 'details'>('map')
  const [selectedLeagueTier, setSelectedLeagueTier] = useState<LeagueTier>(currentLeagueTier)

  useEffect(() => {
    initializeBadges()
  }, [])

  // Sync selected tier with current league tier when store updates
  useEffect(() => {
    setSelectedLeagueTier(currentLeagueTier)
  }, [currentLeagueTier])

  // Reset active conversation when switching away from messages tab
  useEffect(() => {
    if (activeTab !== 'messages') {
      setActiveConversation(null)
    }
  }, [activeTab, setActiveConversation])

  // Reset league mode when switching away from league tab
  useEffect(() => {
    if (activeTab !== 'league') {
      setLeagueMode('map')
    }
  }, [activeTab])

  // Compose new direct message — find a friend without an existing conversation
  const handleCompose = useCallback(async () => {
    const existingDMUserIds = new Set(
      conversations
        .filter((c) => c.type === 'direct')
        .flatMap((c) => c.memberIds)
    )
    const availableFriend = friends.find((f) => !existingDMUserIds.has(f.userId))

    if (availableFriend) {
      const convId = await createDirectConversation(availableFriend.userId)
      if (convId) setActiveConversation(convId)
    } else if (friends.length > 0) {
      // All friends already have conversations — open the first one
      const firstFriendConv = conversations.find(
        (c) => c.type === 'direct' && c.memberIds.some((id) => friends.some((f) => f.userId === id))
      )
      if (firstFriendConv) setActiveConversation(firstFriendConv.id)
    } else {
      toast('Add some friends first!', {
        icon: '👋',
        style: { background: '#0f1628', color: '#fff', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' },
      })
    }
  }, [friends, conversations, createDirectConversation, setActiveConversation])

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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {activeTab === 'leaderboard' && <LeaderboardScreen />}
          {activeTab === 'friends' && <FriendsScreen onNavigateToMessages={onNavigateToMessages} />}
          {activeTab === 'league' && (
            leagueMode === 'map' ? (
              <LeagueMapScreen 
                onSelectTier={(tier) => {
                  setSelectedLeagueTier(tier)
                  setLeagueMode('details')
                }} 
              />
            ) : (
              <div className="mx-auto mt-4 max-w-3xl px-4 sm:px-6 lg:px-8">
                <LeagueScreen 
                  tier={selectedLeagueTier} 
                  onBack={() => setLeagueMode('map')} 
                />
              </div>
            )
          )}
          {activeTab === 'messages' && (
            activeConversationId ? (
              <ConversationScreen
                conversationId={activeConversationId}
                onBack={() => setActiveConversation(null)}
              />
            ) : (
              <MessagingHub
                onSelectConversation={(id) => setActiveConversation(id)}
                onCompose={handleCompose}
              />
            )
          )}
          {activeTab === 'profile' && <ProfileTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
