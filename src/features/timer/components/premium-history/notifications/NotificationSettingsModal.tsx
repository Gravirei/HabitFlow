// @ts-nocheck
/**
 * Notification Settings Modal
 * Redesigned to match Custom Tags modal theme
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/features/timer/store/notificationStore'
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendNotification,
  initializeNotificationScheduler,
} from './notificationService'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { settings, updateSettings, permissionGranted, setPermissionGranted } =
    useNotificationStore()
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                    <span className="material-symbols-outlined text-xl text-white">
                      notifications
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure reminders and alerts
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-180px)] space-y-4 overflow-y-auto p-6">
              {/* Permission Status */}
              {permissionStatus !== 'granted' && (
                <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">
                        warning
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-orange-800 dark:text-orange-200">
                        Browser Notifications Disabled
                      </h3>
                      <p className="mb-3 text-sm text-orange-700 dark:text-orange-300">
                        {permissionStatus === 'denied'
                          ? 'You have denied notification permissions. Please enable them in your browser settings.'
                          : 'Grant permission to receive notifications.'}
                      </p>
                      {permissionStatus !== 'denied' && (
                        <button
                          onClick={handleRequestPermission}
                          className="rounded-xl bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700"
                        >
                          Enable Notifications
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Master Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Enable Notifications
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Master switch for all notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({ ...localSettings, enabled: !localSettings.enabled })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${localSettings.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={localSettings.enabled}
                  aria-label="Enable Notifications"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'} `}
                  />
                </button>
              </div>

              {/* Session Reminders */}
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Session Reminders
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Remind you to start a timer session
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        sessionReminders: {
                          ...localSettings.sessionReminders,
                          enabled: !localSettings.sessionReminders.enabled,
                        },
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${localSettings.sessionReminders.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={localSettings.sessionReminders.enabled}
                    aria-label="Session Reminders"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${localSettings.sessionReminders.enabled ? 'translate-x-6' : 'translate-x-1'} `}
                    />
                  </button>
                </div>
                {localSettings.sessionReminders.enabled && (
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">
                      Reminder times (comma-separated, e.g., 09:00, 14:00, 20:00)
                    </label>
                    <input
                      type="text"
                      value={localSettings.sessionReminders.times.join(', ')}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          sessionReminders: {
                            ...localSettings.sessionReminders,
                            times: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Streak Reminder */}
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Streak Reminder
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Keep your daily streak alive
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        streakReminder: {
                          ...localSettings.streakReminder,
                          enabled: !localSettings.streakReminder.enabled,
                        },
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${localSettings.streakReminder.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={localSettings.streakReminder.enabled}
                    aria-label="Streak Reminder"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${localSettings.streakReminder.enabled ? 'translate-x-6' : 'translate-x-1'} `}
                    />
                  </button>
                </div>
                {localSettings.streakReminder.enabled && (
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">
                      Time
                    </label>
                    <input
                      type="time"
                      value={localSettings.streakReminder.time}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          streakReminder: { ...localSettings.streakReminder, time: e.target.value },
                        })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Daily Summary */}
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Daily Summary</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      End-of-day productivity summary
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        dailySummary: {
                          ...localSettings.dailySummary,
                          enabled: !localSettings.dailySummary.enabled,
                        },
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${localSettings.dailySummary.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={localSettings.dailySummary.enabled}
                    aria-label="Daily Summary"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${localSettings.dailySummary.enabled ? 'translate-x-6' : 'translate-x-1'} `}
                    />
                  </button>
                </div>
                {localSettings.dailySummary.enabled && (
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">
                      Time
                    </label>
                    <input
                      type="time"
                      value={localSettings.dailySummary.time}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          dailySummary: { ...localSettings.dailySummary, time: e.target.value },
                        })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Notification Sound
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Play sound with notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      browserNotifications: {
                        ...localSettings.browserNotifications,
                        sound: !localSettings.browserNotifications.sound,
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${localSettings.browserNotifications.sound ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={localSettings.browserNotifications.sound}
                  aria-label="Notification Sound"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${localSettings.browserNotifications.sound ? 'translate-x-6' : 'translate-x-1'} `}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <button
                onClick={handleTest}
                disabled={permissionStatus !== 'granted'}
                className="rounded-xl px-4 py-3 font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Test
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-200 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-medium text-white transition-all hover:shadow-lg"
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
