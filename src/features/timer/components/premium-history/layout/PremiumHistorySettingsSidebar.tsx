/**
 * Premium History Settings Sidebar
 * Slide-in sidebar with options including Analytics view
 * Matches the design of the main app SideNav component
 */

import { motion, AnimatePresence } from 'framer-motion'

interface PremiumHistorySettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onExportClick?: () => void
  onArchiveClick?: () => void
  onNotificationsClick?: () => void
  onFilterSettingsClick?: () => void
  onClearHistoryClick?: () => void
  onTemplatesClick?: () => void
  onCustomTagsClick?: () => void
  onCalendarViewClick?: () => void
  onCompareSessionsClick?: () => void
  onSmartReportsClick?: () => void
  onTeamSharingClick?: () => void
  onCloudSyncClick?: () => void
}

export function PremiumHistorySettingsSidebar({ 
  isOpen, 
  onClose, 
  onExportClick,
  onArchiveClick,
  onNotificationsClick,
  onFilterSettingsClick,
  onClearHistoryClick,
  onTemplatesClick,
  onCustomTagsClick,
  onCalendarViewClick,
  onCompareSessionsClick,
  onSmartReportsClick,
  onTeamSharingClick,
  onCloudSyncClick
}: PremiumHistorySettingsSidebarProps) {

  const actionOptions = [
    {
      icon: 'file_download',
      label: 'Export Data',
      description: 'CSV, PDF, JSON formats',
      onClick: () => {
        onExportClick?.()
        onClose()
      }
    },
    {
      icon: 'delete_forever',
      label: 'Clear History',
      description: 'Remove all sessions',
      onClick: () => {
        onClearHistoryClick?.()
        onClose()
      },
      isDanger: true
    }
  ]

  const featureOptions = [
    {
      icon: 'inventory_2',
      label: 'Archive',
      description: 'Manage old sessions',
      disabled: false,
      onClick: () => {
        onArchiveClick?.()
        onClose()
      }
    },
  ]

  const premiumOptions: {
    icon: string
    label: string
    description: string
    disabled: boolean
    onClick: () => void
    badge?: string
  }[] = [
    {
      icon: 'workspace_premium',
      label: 'Session Templates',
      description: 'Pre-configured timer setups',
      disabled: false,
      onClick: () => {
        onTemplatesClick?.()
        onClose()
      }
    },
    {
      icon: 'summarize',
      label: 'Smart Reports',
      description: 'Automated insights & PDFs',
      disabled: false,
      onClick: () => {
        onSmartReportsClick?.()
        onClose()
      }
    },
    {
      icon: 'compare',
      label: 'Compare Sessions',
      description: 'Side-by-side analysis',
      disabled: false,
      onClick: () => {
        onCompareSessionsClick?.()
        onClose()
      }
    },
    {
      icon: 'label',
      label: 'Custom Tags',
      description: 'Organize with labels',
      disabled: false,
      onClick: () => {
        onCustomTagsClick?.()
        onClose()
      }
    },
    {
      icon: 'calendar_month',
      label: 'Calendar View',
      description: 'Monthly overview',
      disabled: false,
      onClick: () => {
        onCalendarViewClick?.()
        onClose()
      }
    },
    {
      icon: 'share',
      label: 'Team Sharing',
      description: 'Collaborate & share',
      disabled: false,
      onClick: () => {
        onTeamSharingClick?.()
        onClose()
      }
    },
  ]

  const settingsOptions = [
    {
      icon: 'tune',
      label: 'Filter Visibility',
      description: 'Show/hide filter buttons',
      disabled: false,
      onClick: () => {
        onFilterSettingsClick?.()
        onClose()
      }
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      description: 'Session reminders',
      disabled: false,
      onClick: () => {
        onNotificationsClick?.()
        onClose()
      }
    },
    {
      icon: 'cloud_sync',
      label: 'Cloud Sync',
      description: 'Backup & restore',
      disabled: false,
      onClick: () => {
        onCloudSyncClick?.()
        onClose()
      }
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 h-full w-[85%] max-w-sm bg-slate-50 dark:bg-slate-950 p-6 text-slate-800 dark:text-white shadow-2xl rounded-l-[32px] border-l border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header Section */}
              <div className="mb-8 flex items-center justify-between px-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">View Options</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Choose your view</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  aria-label="Close sidebar"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
                {/* Actions */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actions
                    </p>
                  </div>
                  {actionOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.onClick}
                      className={`flex h-12 w-full items-center gap-4 rounded-2xl px-4 transition-all active:scale-95 ${
                        option.isDanger
                          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined">{option.icon}</span>
                      <span className="text-base font-medium">{option.label}</span>
                      <span className="ml-auto material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-2" />

                {/* Features */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Features
                    </p>
                  </div>
                  {featureOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.disabled ? undefined : option.onClick}
                      className={`flex h-12 w-full items-center gap-4 rounded-2xl px-4 transition-all ${
                        option.disabled
                          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
                      }`}
                      disabled={option.disabled}
                      title={`${option.label} - ${option.description}`}
                    >
                      <span className="material-symbols-outlined">{option.icon}</span>
                      <span className="text-base font-medium">{option.label}</span>
                      {!option.disabled && (
                        <span className="ml-auto material-symbols-outlined text-slate-400">chevron_right</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-2" />

                {/* Premium Features */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Premium Features
                    </p>
                  </div>
                  {premiumOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.disabled ? undefined : option.onClick}
                      className={`flex h-12 w-full items-center gap-3 rounded-2xl px-4 transition-all ${
                        option.disabled
                          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
                      }`}
                      disabled={option.disabled}
                      title={`${option.label} - ${option.description}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{option.description}</div>
                      </div>
                      {option.disabled && option.badge && (
                        <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          {option.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-2" />

                {/* Settings & Sync */}
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Settings
                    </p>
                  </div>
                  {settingsOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.disabled ? undefined : option.onClick}
                      className={`flex h-12 w-full items-center gap-4 rounded-2xl px-4 transition-all ${
                        option.disabled
                          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
                      }`}
                      disabled={option.disabled}
                      title={`${option.label} - ${option.description}`}
                    >
                      <span className="material-symbols-outlined">{option.icon}</span>
                      <span className="text-base font-medium">{option.label}</span>
                      {!option.disabled && (
                        <span className="ml-auto material-symbols-outlined text-slate-400">chevron_right</span>
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
