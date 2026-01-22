/**
 * Notification Settings Modal
 * Redesigned to match Custom Tags modal theme
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from './notificationStore'
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendNotification,
  initializeNotificationScheduler 
} from './notificationService'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { settings, updateSettings, permissionGranted, setPermissionGranted } = useNotificationStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus())

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionStatus(getNotificationPermissionStatus())
    if (granted) {
      sendNotification('Notifications Enabled', {
        body: 'You will now receive timer notifications',
      })
    }
  }

  const handleSave = () => {
    updateSettings(localSettings)
    initializeNotificationScheduler()
    onClose()
  }

  const handleTest = () => {
    sendNotification('Test Notification', {
      body: 'This is a test notification from your timer app!',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">notifications</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Configure reminders and alerts</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6 space-y-4">
              {/* Permission Status */}
              {permissionStatus !== 'granted' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                        Browser Notifications Disabled
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        {permissionStatus === 'denied'
                          ? 'You have denied notification permissions. Please enable them in your browser settings.'
                          : 'Grant permission to receive notifications.'}
                      </p>
                      {permissionStatus !== 'denied' && (
                        <button
                          onClick={handleRequestPermission}
                          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
                        >
                          Enable Notifications
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Enable Notifications</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Master switch for all notifications</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enabled: !localSettings.enabled })}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
                    ${localSettings.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                    hover:scale-105 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                  role="switch"
                  aria-checked={localSettings.enabled}
                  aria-label="Enable Notifications"
                >
                  <span
                    className={`
                      inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg
                      ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Session Reminders */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Session Reminders</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Remind you to start a timer session</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({
                      ...localSettings,
                      sessionReminders: { ...localSettings.sessionReminders, enabled: !localSettings.sessionReminders.enabled }
                    })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
                      ${localSettings.sessionReminders.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                      hover:scale-105 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    role="switch"
                    aria-checked={localSettings.sessionReminders.enabled}
                    aria-label="Session Reminders"
                  >
                    <span
                      className={`
                        inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg
                        ${localSettings.sessionReminders.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {localSettings.sessionReminders.enabled && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Reminder times (comma-separated, e.g., 09:00, 14:00, 20:00)
                    </label>
                    <input
                      type="text"
                      value={localSettings.sessionReminders.times.join(', ')}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        sessionReminders: {
                          ...localSettings.sessionReminders,
                          times: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }
                      })}
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Streak Reminder */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Streak Reminder</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Keep your daily streak alive</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({
                      ...localSettings,
                      streakReminder: { ...localSettings.streakReminder, enabled: !localSettings.streakReminder.enabled }
                    })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
                      ${localSettings.streakReminder.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                      hover:scale-105 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    role="switch"
                    aria-checked={localSettings.streakReminder.enabled}
                    aria-label="Streak Reminder"
                  >
                    <span
                      className={`
                        inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg
                        ${localSettings.streakReminder.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {localSettings.streakReminder.enabled && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Time</label>
                    <input
                      type="time"
                      value={localSettings.streakReminder.time}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        streakReminder: { ...localSettings.streakReminder, time: e.target.value }
                      })}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Daily Summary */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Daily Summary</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">End-of-day productivity summary</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({
                      ...localSettings,
                      dailySummary: { ...localSettings.dailySummary, enabled: !localSettings.dailySummary.enabled }
                    })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
                      ${localSettings.dailySummary.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                      hover:scale-105 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    role="switch"
                    aria-checked={localSettings.dailySummary.enabled}
                    aria-label="Daily Summary"
                  >
                    <span
                      className={`
                        inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg
                        ${localSettings.dailySummary.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {localSettings.dailySummary.enabled && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Time</label>
                    <input
                      type="time"
                      value={localSettings.dailySummary.time}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        dailySummary: { ...localSettings.dailySummary, time: e.target.value }
                      })}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Notification Sound</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Play sound with notifications</p>
                </div>
                <button
                  onClick={() => setLocalSettings({
                    ...localSettings,
                    browserNotifications: { ...localSettings.browserNotifications, sound: !localSettings.browserNotifications.sound }
                  })}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
                    ${localSettings.browserNotifications.sound ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                    hover:scale-105 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                  role="switch"
                  aria-checked={localSettings.browserNotifications.sound}
                  aria-label="Notification Sound"
                >
                  <span
                    className={`
                      inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg
                      ${localSettings.browserNotifications.sound ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-3">
              <button
                onClick={handleTest}
                disabled={permissionStatus !== 'granted'}
                className="px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
