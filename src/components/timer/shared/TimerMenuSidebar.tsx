/**
 * TimerMenuSidebar Component
 * Sidebar menu with navigation and settings options for the Timer page
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface TimerMenuSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSettingsClick?: () => void
  onHistoryClick?: () => void
  onCloudSyncClick?: () => void
  onThemesClick?: () => void
}

export function TimerMenuSidebar({
  isOpen,
  onClose,
  onSettingsClick,
  onHistoryClick,
  onCloudSyncClick,
  onThemesClick,
}: TimerMenuSidebarProps) {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleAction = (action: string) => {
    if (action === 'settings' && onSettingsClick) {
      onSettingsClick()
    } else if (action === 'history' && onHistoryClick) {
      onHistoryClick()
    } else if (action === 'cloudSync' && onCloudSyncClick) {
      onCloudSyncClick()
    } else if (action === 'themes' && onThemesClick) {
      onThemesClick()
    }
    onClose()
  }

  const premiumHistoryItems = [
    {
      icon: 'analytics',
      label: 'Analytics Dashboard',
      description: 'Charts, stats & insights',
      disabled: false,
      action: () => handleNavigation('/timer/analytics'),
    },
    {
      icon: 'flag',
      label: 'Goal Tracking',
      description: 'Set and track goals',
      disabled: false,
      action: () => handleNavigation('/timer/goals'),
    },
    {
      icon: 'emoji_events',
      label: 'Achievements',
      description: 'View unlocked badges',
      disabled: false,
      action: () => handleNavigation('/timer/achievements'),
    },
    {
      icon: 'psychology',
      label: 'AI Insights',
      description: 'Smart patterns & tips',
      disabled: false,
      action: () => handleNavigation('/timer/ai-insights'),
    },
    {
      icon: 'timeline',
      label: 'Timeline View',
      description: 'Visual session timeline',
      disabled: false,
      action: () => handleNavigation('/timer/timeline'),
    },
  ]

  const actionItems = [
    {
      icon: 'history',
      label: 'Session History',
      description: 'Browse recent sessions',
      disabled: false,
      action: () => handleAction('history'),
    },
    {
      icon: 'file_download',
      label: 'Export Data',
      description: 'CSV, PDF, JSON formats',
      disabled: false,
      action: () => handleNavigation('/timer/export'),
    },
  ]

  const settingsItems = [
    {
      icon: 'settings',
      label: 'Timer Settings',
      description: 'Customize timer behavior',
      disabled: false,
      action: () => handleAction('settings'),
    },
    {
      icon: 'palette',
      label: 'Themes',
      description: 'Customize appearance',
      disabled: true, // ARCHIVED: Theme module archived, feature disabled
      action: () => handleAction('themes'),
    },
    {
      icon: 'cloud_sync',
      label: 'Cloud Sync',
      description: 'Backup & restore',
      disabled: false,
      action: () => handleAction('cloudSync'),
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 h-full w-[85%] max-w-sm overflow-hidden rounded-r-[32px] border-r border-slate-200 bg-slate-50 text-slate-800 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold">Timer Menu</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Explore features and settings
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200 active:scale-95 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="no-scrollbar flex h-[calc(100%-88px)] flex-col overflow-y-auto">
              <nav className="space-y-6 p-4">
                {/* Premium History Features */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Premium Features
                    </p>
                  </div>
                  {premiumHistoryItems.map((item, index) => (
                    <button
                      key={index}
                      disabled={item.disabled}
                      onClick={item.action}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                        item.disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'active:scale-98 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </div>
                      </div>
                      {!item.disabled && (
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mx-2 h-px bg-slate-200 dark:bg-slate-800" />

                {/* Actions */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actions
                    </p>
                  </div>
                  {actionItems.map((item, index) => (
                    <button
                      key={index}
                      disabled={item.disabled}
                      onClick={item.action}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                        item.disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'active:scale-98 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </div>
                      </div>
                      {!item.disabled && (
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mx-2 h-px bg-slate-200 dark:bg-slate-800" />

                {/* Settings */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Settings
                    </p>
                  </div>
                  {settingsItems.map((item, index) => (
                    <button
                      key={index}
                      disabled={item.disabled}
                      onClick={item.action}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                        item.disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'active:scale-98 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </div>
                      </div>
                      {item.disabled ? (
                        <span className="rounded-full bg-slate-300 px-2 py-1 text-xs dark:bg-slate-700">
                          Soon
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
