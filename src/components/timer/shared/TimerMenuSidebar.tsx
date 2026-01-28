/**
 * TimerMenuSidebar Component
 * Sidebar menu with navigation and settings options for the Timer page
 */

import React from 'react'
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

export function TimerMenuSidebar({ isOpen, onClose, onSettingsClick, onHistoryClick, onCloudSyncClick, onThemesClick }: TimerMenuSidebarProps) {
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
      action: () => handleNavigation('/timer/analytics')
    },
    { 
      icon: 'flag', 
      label: 'Goal Tracking', 
      description: 'Set and track goals',
      disabled: false, 
      action: () => handleNavigation('/timer/goals')
    },
    { 
      icon: 'emoji_events', 
      label: 'Achievements', 
      description: 'View unlocked badges',
      disabled: false, 
      action: () => handleNavigation('/timer/achievements')
    },
    { 
      icon: 'psychology', 
      label: 'AI Insights', 
      description: 'Smart patterns & tips',
      disabled: false, 
      action: () => handleNavigation('/timer/ai-insights')
    },
    { 
      icon: 'timeline', 
      label: 'Timeline View', 
      description: 'Visual session timeline',
      disabled: false, 
      action: () => handleNavigation('/timer/timeline')
    },
  ]

  const actionItems = [
    { 
      icon: 'history', 
      label: 'Session History', 
      description: 'Browse recent sessions',
      disabled: false, 
      action: () => handleAction('history')
    },
    { 
      icon: 'file_download', 
      label: 'Export Data', 
      description: 'CSV, PDF, JSON formats',
      disabled: false, 
      action: () => handleNavigation('/timer/export')
    },
  ]

  const settingsItems = [
    { 
      icon: 'settings', 
      label: 'Timer Settings', 
      description: 'Customize timer behavior',
      disabled: false, 
      action: () => handleAction('settings')
    },
    { 
      icon: 'palette', 
      label: 'Themes', 
      description: 'Customize appearance',
      disabled: true,  // ARCHIVED: Theme module archived, feature disabled
      action: () => handleAction('themes')
    },
    { 
      icon: 'cloud_sync', 
      label: 'Cloud Sync', 
      description: 'Backup & restore',
      disabled: false, 
      action: () => handleAction('cloudSync')
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
            className="fixed inset-y-0 left-0 z-50 h-full w-[85%] max-w-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white shadow-2xl rounded-r-[32px] border-r border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold">Timer Menu</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Explore features and settings
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col overflow-y-auto h-[calc(100%-88px)]">
              <nav className="p-4 space-y-6">
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
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-98'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {item.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                      </div>
                      {!item.disabled && (
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />

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
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-98'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {item.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                      </div>
                      {!item.disabled && (
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />

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
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-98'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {item.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                      </div>
                      {item.disabled ? (
                        <span className="text-xs bg-slate-300 dark:bg-slate-700 px-2 py-1 rounded-full">
                          Soon
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
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
