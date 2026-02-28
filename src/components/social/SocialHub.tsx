/**
 * Social Hub — Main container for the Social Networking System
 * Polished tabbed interface with animated hero header
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { LeaderboardScreen } from './LeaderboardScreen'
import { FriendsScreen } from './FriendsScreen'
import { LeagueScreen } from './LeagueScreen'
import { ProfileTab } from './ProfileTab'
import { SocialOnboarding } from './SocialOnboarding'
import { MessagingHub } from '../messaging/MessagingHub'
import { ConversationScreen } from '../messaging/ConversationScreen'
import { useMessagingStore } from '../messaging/messagingStore'

// ─── Tab types ──────────────────────────────────────────────────────────────

import type { SocialTab } from './SocialBottomNav'

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
  } = useSocialStore()

  const { activeConversationId, setActiveConversation } = useMessagingStore()

  useEffect(() => {
    initializeBadges()
  }, [])

  // Reset active conversation when switching away from messages tab
  useEffect(() => {
    if (activeTab !== 'messages') {
      setActiveConversation(null)
    }
  }, [activeTab, setActiveConversation])

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
          {activeTab === 'league' && <LeagueScreen />}
          {activeTab === 'messages' && (
            activeConversationId ? (
              <ConversationScreen
                conversationId={activeConversationId}
                onBack={() => setActiveConversation(null)}
              />
            ) : (
              <MessagingHub
                onSelectConversation={(id) => setActiveConversation(id)}
                onCompose={() => console.log('Compose new conversation')}
              />
            )
          )}
          {activeTab === 'profile' && <ProfileTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
