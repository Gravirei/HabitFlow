import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useIntegrationStore } from '../store/integrationStore'
import { slackService } from './slack'
import type { SlackSettings as SlackSettingsType, SlackChannel } from './types'

export function SlackSettings() {
  const store = useIntegrationStore()
  const connection = store.getConnection('slack')
  const isConnected = store.isConnected('slack')

  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [testMessageLoading, setTestMessageLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const settings = (connection.settings || {}) as unknown as SlackSettingsType

  // Fetch channels when connected
  useEffect(() => {
    if (isConnected && connection.accessToken) {
      fetchChannels()
    }
  }, [isConnected, connection.accessToken])

  const fetchChannels = async () => {
    if (!connection.accessToken) return

    setLoadingChannels(true)
    try {
      const fetchedChannels = await slackService.listChannels(connection.accessToken)
      setChannels(fetchedChannels)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      toast.error('Failed to load Slack channels')
    } finally {
      setLoadingChannels(false)
    }
  }

  const handleConnect = () => {
    try {
      slackService.initiateAuth()
    } catch (error) {
      console.error('Failed to initiate Slack auth:', error)
      toast.error('Failed to connect to Slack')
    }
  }

  const handleDisconnect = () => {
    store.disconnect('slack')
    setChannels([])
    toast.success('Slack disconnected')
  }

  const handleChannelChange = (channelId: string) => {
    const selectedChannel = channels.find((ch) => ch.id === channelId)
    if (selectedChannel) {
      store.updateSettings('slack', {
        ...settings,
        channelId,
        channelName: selectedChannel.name,
      })
    }
  }

  const handleToggleSetting = (key: keyof SlackSettingsType, value: boolean) => {
    store.updateSettings('slack', {
      ...settings,
      [key]: value,
    })
  }

  const handleDailySummaryTimeChange = (time: string) => {
    store.updateSettings('slack', {
      ...settings,
      dailySummaryTime: time,
    })
  }

  const handleSendTestMessage = async () => {
    if (!connection.accessToken || !settings.channelId) {
      toast.error('Please select a channel first')
      return
    }

    setTestMessageLoading(true)
    try {
      await slackService.sendMessage(
        connection.accessToken,
        settings.channelId,
        '✅ HabitFlow test message',
        [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*HabitFlow Connected!* 🎉\n_This is a test message from your HabitFlow app._',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: "You're all set to receive habit notifications in Slack!",
              },
            ],
          },
        ]
      )
      toast.success('Test message sent to Slack!')
    } catch (error) {
      console.error('Failed to send test message:', error)
      toast.error('Failed to send test message')
    } finally {
      setTestMessageLoading(false)
    }
  }

  // Format last synced time
  const formatLastSynced = () => {
    if (!connection.lastSyncedAt) return 'Never'
    const date = new Date(connection.lastSyncedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins === 0) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {!isConnected ? (
        // Disconnected State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 p-8 dark:border-purple-900/30 dark:from-purple-950/20 dark:to-purple-900/10"
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 dark:bg-purple-900/40">
              <span className="material-symbols-outlined text-4xl text-purple-500 dark:text-purple-400">
                chat
              </span>
            </div>

            {/* Title and Description */}
            <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Connect Slack</h3>
            <p className="mb-8 max-w-sm text-slate-600 dark:text-slate-400">
              Get habit reminders and daily summaries delivered directly to your Slack workspace.
            </p>

            {/* Features List */}
            <div className="mb-8 w-full max-w-sm space-y-2 text-left">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
              >
                <span className="text-purple-500">✓</span>
                <span className="text-sm">Habit completion notifications</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
              >
                <span className="text-purple-500">✓</span>
                <span className="text-sm">Streak milestone celebrations</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
              >
                <span className="text-purple-500">✓</span>
                <span className="text-sm">Daily habit summaries with stats</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
              >
                <span className="text-purple-500">✓</span>
                <span className="text-sm">Channel-specific notifications</span>
              </motion.div>
            </div>

            {/* Connect Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
            >
              <span className="material-symbols-outlined">login</span>
              <span>Connect Slack</span>
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // Connected State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 dark:border-purple-900/30 dark:from-purple-950/20 dark:to-purple-900/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 dark:bg-purple-900/40">
                  <span className="material-symbols-outlined text-2xl text-purple-500 dark:text-purple-400">
                    check_circle
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Slack Connected</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Last synced: {formatLastSynced()}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDisconnect}
                className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                Disconnect
              </motion.button>
            </div>
          </motion.div>

          {/* Channel Selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200/50 bg-white p-6 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50"
          >
            <label className="mb-4 block">
              <span className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-lg">forum</span>
                Select Channel
              </span>
              <div className="relative">
                <select
                  value={settings.channelId || ''}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  disabled={loadingChannels}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-400"
                >
                  <option value="">
                    {loadingChannels ? 'Loading channels...' : 'Choose a channel'}
                  </option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.is_private ? '🔒' : '#'} {channel.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-3 text-slate-400">
                  expand_more
                </span>
              </div>
            </label>
          </motion.div>

          {/* Notification Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-5 rounded-2xl border border-slate-200/50 bg-white p-6 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50"
          >
            <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <span className="material-symbols-outlined text-lg">notifications</span>
              Notifications
            </h4>

            {/* Habit Completion Toggle */}
            <motion.div
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              className="flex items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-purple-500">
                  celebration
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Notify on Habit Completion
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get a message when you complete a habit
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handleToggleSetting('notifyOnCompletion', !settings.notifyOnCompletion)
                }
                className={`relative flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                  settings.notifyOnCompletion ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <motion.div
                  layout
                  className={`h-5 w-5 rounded-full bg-white transition-all duration-300 ${
                    settings.notifyOnCompletion ? 'ml-6' : 'ml-1'
                  }`}
                />
              </motion.button>
            </motion.div>

            {/* Streak Milestone Toggle */}
            <motion.div
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              className="flex items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-orange-500">
                  local_fire_department
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Notify on Streak Milestones
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Celebrate at 7, 14, 30, 60, and 100 day streaks
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleSetting('notifyOnStreak', !settings.notifyOnStreak)}
                className={`relative flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                  settings.notifyOnStreak ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <motion.div
                  layout
                  className={`h-5 w-5 rounded-full bg-white transition-all duration-300 ${
                    settings.notifyOnStreak ? 'ml-6' : 'ml-1'
                  }`}
                />
              </motion.button>
            </motion.div>

            {/* Daily Summary Toggle */}
            <motion.div
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              className="flex items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-blue-500">summarize</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Send Daily Summary</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get daily habit completion stats
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleSetting('dailySummary', !settings.dailySummary)}
                className={`relative flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                  settings.dailySummary ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <motion.div
                  layout
                  className={`h-5 w-5 rounded-full bg-white transition-all duration-300 ${
                    settings.dailySummary ? 'ml-6' : 'ml-1'
                  }`}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Daily Summary Time Picker */}
          <AnimatePresence>
            {settings.dailySummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white p-6 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50"
              >
                <label className="block">
                  <span className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    Summary Time
                  </span>
                  <input
                    type="time"
                    value={settings.dailySummaryTime || '09:00'}
                    onChange={(e) => handleDailySummaryTimeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-400"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Your daily summary will be sent at this time every day
                  </p>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200/50 bg-white p-6 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50"
          >
            <motion.button
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between rounded-lg p-3 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-lg">settings</span>
                Advanced Settings
              </span>
              <motion.span
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="material-symbols-outlined text-slate-600 dark:text-slate-400"
              >
                expand_more
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4 overflow-hidden border-t border-slate-200 pt-4 dark:border-slate-700"
                >
                  {/* Webhook URL Display */}
                  <div>
                    <label className="mb-2 block">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Webhook URL (Read-only)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={settings.webhookUrl || 'Not configured'}
                      readOnly
                      className="w-full cursor-not-allowed overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
                    />
                  </div>

                  {/* Test Message Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendTestMessage}
                    disabled={testMessageLoading || !settings.channelId}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 px-4 py-3 font-medium text-purple-600 transition-all duration-200 hover:from-purple-500/30 hover:to-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50 dark:from-purple-900/30 dark:to-purple-900/30 dark:text-purple-400 dark:hover:from-purple-900/40 dark:hover:to-purple-900/40"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {testMessageLoading ? 'hourglass_empty' : 'send'}
                    </span>
                    <span>{testMessageLoading ? 'Sending...' : 'Send Test Message'}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
