// @ts-nocheck
/**
 * HistorySettings Component
 * Premium timer history configuration with advanced features
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerSettings } from '@/features/timer/hooks/useTimerSettings'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch'

const PREMIUM_FEATURES = [
  {
    icon: 'analytics',
    title: 'Analytics Dashboard',
    description: 'View comprehensive charts and statistics',
    premium: true,
  },
  {
    icon: 'download',
    title: 'Export Options',
    description: 'Export history as CSV, PDF, or JSON',
    premium: true,
  },
  {
    icon: 'filter_list',
    title: 'Advanced Filters',
    description: 'Filter by date, timer type, and duration',
    premium: true,
  },
  {
    icon: 'search',
    title: 'Search History',
    description: 'Quickly find specific timer sessions',
    premium: true,
  },
  {
    icon: 'trending_up',
    title: 'Detailed Insights',
    description: 'Longest session, averages, and streaks',
    premium: true,
  },
  {
    icon: 'cloud_sync',
    title: 'Cloud Backup',
    description: 'Sync history across all devices',
    premium: true,
  },
  {
    icon: 'inventory_2',
    title: 'Archive System',
    description: 'Organize and archive old records',
    premium: true,
  },
  {
    icon: 'emoji_events',
    title: 'Achievement Tracking',
    description: 'Earn badges for timer milestones',
    premium: true,
  },
]

export const HistorySettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()
  const navigate = useNavigate()
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Simulate subscription status (will be replaced with real check later)
  const isPremiumUser = true // Set to true as requested

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  const handleUpgradeClick = () => {
    setIsUpgrading(true)

    // Show upgrading animation for 1.5 seconds then navigate
    setTimeout(() => {
      navigate('/timer/premium-history')
    }, 1500)
  }

  return (
    <SettingsSection
      icon="history"
      title="Timer History"
      description="Track and analyze your timer sessions"
      gradient="from-amber-500/20 via-yellow-500/20 to-orange-500/20"
      isPremium={true}
    >
      {/* Show icon in navbar toggle */}
      <ToggleSwitch
        enabled={settings.showHistoryIcon}
        onChange={() => handleToggle('showHistoryIcon')}
        label="Show icon in navbar"
        description="Display history icon in timer navbar"
      />

      {/* Premium Features */}
      <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
          <label className="text-sm font-bold text-amber-300">Premium Features</label>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {PREMIUM_FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 rounded-xl border border-amber-500/10 bg-black/20 p-3 transition-all duration-200 hover:border-amber-500/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 transition-colors group-hover:bg-amber-500/30">
                <span className="material-symbols-outlined text-lg text-amber-400">
                  {feature.icon}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  {feature.premium && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                      <span className="text-xs">💎</span>
                      PRO
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{feature.description}</p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/50">
                <span className="material-symbols-outlined text-lg text-gray-500">lock</span>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA or Access Button */}
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-amber-300">
                {isPremiumUser ? 'Access Premium History' : 'Unlock All Premium Features'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {isPremiumUser
                  ? 'View your complete history with analytics and insights'
                  : 'Get access to advanced history analytics and insights'}
              </p>
            </div>
            <button
              onClick={handleUpgradeClick}
              disabled={isUpgrading}
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-400 hover:to-yellow-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpgrading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="material-symbols-outlined text-base"
                  >
                    progress_activity
                  </motion.span>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isPremiumUser ? (
                    <>
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Open
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">workspace_premium</span>
                      Upgrade
                    </>
                  )}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

HistorySettings.displayName = 'HistorySettings'
