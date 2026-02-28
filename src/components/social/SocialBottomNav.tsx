/**
 * Social Bottom Nav — Dedicated bottom navigation for the Social page
 * Appears with bouncy spring animation when entering the Social page
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { useMessagingStore } from '../messaging/messagingStore'

export type SocialTab = 'profile' | 'leaderboard' | 'friends' | 'league' | 'messages'

const SOCIAL_NAV_ITEMS: { id: SocialTab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'military_tech' },
  { id: 'leaderboard', label: 'Rankings', icon: 'leaderboard' },
  { id: 'friends', label: 'Friends', icon: 'group' },
  { id: 'league', label: 'League', icon: 'shield' },
  { id: 'messages', label: 'Messages', icon: 'chat_bubble' },
]

interface SocialBottomNavProps {
  activeTab: SocialTab
  onChange: (tab: SocialTab) => void
}

export function SocialBottomNav({ activeTab, onChange }: SocialBottomNavProps) {
  const { getUnreadNudges } = useSocialStore()
  const unreadCount = getUnreadNudges().length
  const totalUnread = useMessagingStore((s) => s.totalUnread)

  return (
    <motion.nav
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center"
      initial={{ y: 80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.8,
      }}
    >
      <div className="flex items-center justify-center rounded-full border border-white/20 bg-white/95 px-6 py-2 shadow-2xl backdrop-blur-xl">
        {SOCIAL_NAV_ITEMS.map((item, index) => {
          const active = activeTab === item.id
          const hasBadge = (item.id === 'friends' && unreadCount > 0) || (item.id === 'messages' && totalUnread > 0)
          const badgeCount = item.id === 'friends' ? unreadCount : totalUnread
          const badgeDisplay = badgeCount > 99 ? '99+' : `${badgeCount}`
          const badgeColor = item.id === 'messages'
            ? 'bg-teal-500 shadow-teal-500/30'
            : 'bg-red-500 shadow-red-500/30'

          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`group relative flex min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-all duration-300 ${
                active
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <motion.span
                className="material-symbols-outlined"
                initial={{ scale: 0, y: 10 }}
                animate={{
                  scale: active ? 1.2 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 12,
                  mass: 0.5,
                  delay: index * 0.06,
                }}
                whileTap={{ scale: 0.85 }}
                style={{
                  fontSize: '24px',
                  fontVariationSettings: active ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </motion.span>

              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  active ? 'font-bold tracking-wide' : 'font-normal'
                }`}
              >
                {item.label}
              </span>

              <AnimatePresence>
                {hasBadge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`absolute -top-0.5 right-1 flex ${badgeCount > 99 ? 'h-4 px-1 min-w-[16px]' : 'size-4'} items-center justify-center rounded-full ${badgeColor} shadow-lg`}
                  >
                    <span className="text-[8px] font-bold text-white">{badgeDisplay}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
