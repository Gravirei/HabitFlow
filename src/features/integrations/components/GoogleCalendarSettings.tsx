import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useIntegrationStore } from '../store/integrationStore'
import { googleCalendarService } from './googleCalendar'
import type { GoogleCalendarSettings as GoogleCalendarSettingsType } from './types'

const GOOGLE_COLORS = [
  { id: '1', name: 'Peacock', hex: '#a4bdfc' },
  { id: '2', name: 'Flamingo', hex: '#f691b2' },
  { id: '3', name: 'Tangerine', hex: '#fbbc04' },
  { id: '4', name: 'Banana', hex: '#f7f06b' },
  { id: '5', name: 'Sage', hex: '#33b679' },
  { id: '6', name: 'Basil', hex: '#0b8043' },
  { id: '7', name: 'Blueberry', hex: '#3c82f6' },
  { id: '8', name: 'Lavender', hex: '#e6d7f3' },
  { id: '9', name: 'Grape', hex: '#d500f9' },
  { id: '10', name: 'Graphite', hex: '#616161' },
]

export function GoogleCalendarSettings(): React.ReactElement {
  const store = useIntegrationStore()
  const connection = store.getConnection('google-calendar')
  const settings = connection.settings as Partial<GoogleCalendarSettingsType>

  const [isOpen, setIsOpen] = useState(false)
  const [calendars, setCalendars] = useState<
    Array<{ id: string; summary: string; primary: boolean }>
  >([])
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  // Load calendars when modal opens and connection exists
  useEffect(() => {
    if (
      isOpen &&
      connection.status === 'connected' &&
      connection.accessToken &&
      !calendars.length
    ) {
      loadCalendars()
    }
  }, [isOpen, connection.status, connection.accessToken])

  const loadCalendars = async () => {
    if (!connection.accessToken) return

    setIsLoadingCalendars(true)
    try {
      const cals = await googleCalendarService.listCalendars(connection.accessToken)
      setCalendars(cals)
    } catch {
      toast.error('Failed to load calendars')
      store.setError('google-calendar', 'Failed to load calendars')
    } finally {
      setIsLoadingCalendars(false)
    }
  }

  const handleConnect = () => {
    store.setStatus('google-calendar', 'connecting')
    googleCalendarService.initiateAuth()
  }

  const handleSyncNow = async () => {
    if (!connection.accessToken || !settings.calendarId) {
      toast.error('Please select a calendar first')
      return
    }

    setIsSyncing(true)
    try {
      store.setStatus('google-calendar', 'syncing')
      // Note: In a real implementation, you would fetch habits from the store
      // and sync them. This is a placeholder.
      const result = await googleCalendarService.syncHabits(
        connection.accessToken,
        settings.calendarId,
        []
      )
      store.updateLastSynced('google-calendar')
      toast.success(`Synced ${result.synced} habits`)
      if (result.errors.length > 0) {
        toast.error(`Failed to sync ${result.errors.length} habits`)
      }
    } catch {
      toast.error('Sync failed')
      store.setError('google-calendar', 'Sync failed')
    } finally {
      store.setStatus('google-calendar', 'connected')
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await googleCalendarService.disconnect()
      setCalendars([])
      setIsOpen(false)
      toast.success('Disconnected from Google Calendar')
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setShowDisconnectConfirm(false)
    }
  }

  const updateSetting = (key: keyof GoogleCalendarSettingsType, value: any) => {
    store.updateSettings('google-calendar', { ...settings, [key]: value })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center justify-between rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-blue-600/10 px-4 py-3 font-medium text-blue-400 transition-all duration-200 hover:border-blue-500/40"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span>Google Calendar</span>
        </div>
        {connection.status === 'connected' && (
          <span className="text-xs text-green-400">● Connected</span>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4"
            >
              <div className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl">
                {/* Decorative gradient orbs */}
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />

                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-white/5 p-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-blue-400">
                      calendar_month
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">Google Calendar</h2>
                      <p className="text-xs text-gray-400">Sync your habits with calendar events</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ rotate: 90 }}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </motion.button>
                </div>

                {/* Content */}
                <div className="relative max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto p-6">
                  {connection.status === 'disconnected' ? (
                    // Disconnected State
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4 py-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                          <span className="material-symbols-outlined text-3xl text-blue-400">
                            calendar_month
                          </span>
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-semibold text-white">
                            Connect Google Calendar
                          </h3>
                          <p className="text-sm text-gray-400">
                            Automatically create calendar events for your habits and sync your
                            progress
                          </p>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 rounded-xl bg-white/5 p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Features
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined mt-0.5 text-sm text-green-400">
                              done
                            </span>
                            Auto-create calendar events for habits
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined mt-0.5 text-sm text-green-400">
                              done
                            </span>
                            Two-way sync support
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined mt-0.5 text-sm text-green-400">
                              done
                            </span>
                            Custom event colors and reminders
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined mt-0.5 text-sm text-green-400">
                              done
                            </span>
                            Sync completed habit status
                          </li>
                        </ul>
                      </div>

                      {/* Connect Button */}
                      <motion.button
                        onClick={handleConnect}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
                      >
                        <span className="material-symbols-outlined">login</span>
                        Connect to Google Calendar
                      </motion.button>
                    </motion.div>
                  ) : (
                    // Connected State
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-5"
                    >
                      {/* Connection Status */}
                      <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-green-400">Connected</p>
                            {connection.connectedAt && (
                              <p className="text-xs text-green-300/70">
                                Connected on {formatDate(connection.connectedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Calendar Selector */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="material-symbols-outlined text-lg">calendar_today</span>
                          Select Calendar
                        </label>
                        <div className="relative">
                          {isLoadingCalendars ? (
                            <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-400">
                              <span className="animate-spin">
                                <span className="material-symbols-outlined text-lg">sync</span>
                              </span>
                              Loading calendars...
                            </div>
                          ) : (
                            <select
                              value={settings.calendarId || ''}
                              onChange={(e) => updateSetting('calendarId', e.target.value)}
                              className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:border-white/20 focus:border-blue-500/50 focus:outline-none"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888888' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 1rem center',
                                paddingRight: '2.5rem',
                              }}
                            >
                              <option value="">Choose a calendar...</option>
                              {calendars.map((cal) => (
                                <option key={cal.id} value={cal.id}>
                                  {cal.summary} {cal.primary ? '(Primary)' : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Sync Direction */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="material-symbols-outlined text-lg">sync</span>
                          Sync Direction
                        </label>
                        <div className="space-y-2">
                          {(['to-calendar', 'from-calendar', 'both'] as const).map((direction) => (
                            <label
                              key={direction}
                              className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                            >
                              <input
                                type="radio"
                                name="syncDirection"
                                value={direction}
                                checked={settings.syncDirection === direction}
                                onChange={(e) =>
                                  updateSetting('syncDirection', e.target.value as any)
                                }
                                className="h-4 w-4 accent-blue-500"
                              />
                              <span className="text-sm text-gray-300">
                                {direction === 'to-calendar' && 'Habits → Calendar'}
                                {direction === 'from-calendar' && 'Calendar → Habits'}
                                {direction === 'both' && 'Two-way Sync'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Include Completed Habits */}
                      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-lg text-gray-400">
                            check
                          </span>
                          <label className="cursor-pointer text-sm font-medium text-white">
                            Include Completed Habits
                          </label>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.includeCompletedHabits || false}
                          onChange={(e) =>
                            updateSetting('includeCompletedHabits', e.target.checked)
                          }
                          className="h-5 w-5 cursor-pointer rounded accent-blue-500"
                        />
                      </div>

                      {/* Event Color Selector */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="material-symbols-outlined text-lg">palette</span>
                          Event Color
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {GOOGLE_COLORS.map((color) => (
                            <motion.button
                              key={color.id}
                              onClick={() => updateSetting('eventColor', color.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex h-10 w-full items-center justify-center rounded-lg transition-all duration-200 ${
                                settings.eventColor === color.id
                                  ? 'ring-2 ring-white/30 ring-offset-2'
                                  : ''
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            >
                              {settings.eventColor === color.id && (
                                <span className="material-symbols-outlined text-lg text-white">
                                  check
                                </span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Reminder Minutes */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="material-symbols-outlined text-lg">notifications</span>
                          Reminder (minutes before)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1440"
                          step="5"
                          value={settings.reminderMinutes || 0}
                          onChange={(e) =>
                            updateSetting('reminderMinutes', parseInt(e.target.value))
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
                        />
                      </div>

                      {/* Last Synced */}
                      {connection.lastSyncedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="material-symbols-outlined text-sm">info</span>
                          Last synced {formatDate(connection.lastSyncedAt)}
                        </div>
                      )}

                      {/* Sync Now Button */}
                      <motion.button
                        onClick={handleSyncNow}
                        disabled={isSyncing || !settings.calendarId}
                        whileHover={{ scale: !isSyncing && settings.calendarId ? 1.02 : 1 }}
                        whileTap={{ scale: !isSyncing && settings.calendarId ? 0.98 : 1 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-teal-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <>
                            <span className="animate-spin">
                              <span className="material-symbols-outlined text-lg">sync</span>
                            </span>
                            Syncing...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">cloud_upload</span>
                            Sync Now
                          </>
                        )}
                      </motion.button>

                      {/* Disconnect Button */}
                      {!showDisconnectConfirm ? (
                        <motion.button
                          onClick={() => setShowDisconnectConfirm(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition-all duration-200 hover:border-red-500/40"
                        >
                          <span className="material-symbols-outlined text-lg">logout</span>
                          Disconnect
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
                        >
                          <p className="text-sm font-medium text-red-300">
                            Are you sure you want to disconnect?
                          </p>
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => setShowDisconnectConfirm(false)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 rounded-lg bg-white/10 px-3 py-2 font-medium text-white transition-colors hover:bg-white/20"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              onClick={handleDisconnect}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 rounded-lg bg-red-600 px-3 py-2 font-medium text-white transition-colors hover:bg-red-700"
                            >
                              Disconnect
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
