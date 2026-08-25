import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useIntegrationStore } from '../store/integrationStore'
import { zapierService } from './zapier'

interface ZapierEvent {
  type: string
  timestamp: string
  success: boolean
}

interface ZapierSettingsData {
  webhookUrl: string
  notifyOnCompletion: boolean
  notifyOnCreated: boolean
  notifyOnMilestone: boolean
  notifyOnDailySummary: boolean
  eventLog: ZapierEvent[]
}

export function ZapierSettings() {
  const connection = useIntegrationStore((s) => s.connections['zapier'])
  const { connect, updateSettings, disconnect: disconnectStore } = useIntegrationStore()

  const [webhookUrl, setWebhookUrl] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [showUpdateUrl, setShowUpdateUrl] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  // Settings are persisted JSON of unknown shape; fields are individually
  // guarded with defaults where consumed below.
  const settings = (connection.settings || {}) as unknown as ZapierSettingsData
  const isConnected = connection.status === 'connected'

  useEffect(() => {
    if (isConnected && settings.webhookUrl) {
      setWebhookUrl(settings.webhookUrl)
    }
  }, [isConnected, settings.webhookUrl])

  const handleConnect = async () => {
    setUrlError('')

    if (!webhookUrl.trim()) {
      setUrlError('Please enter a webhook URL')
      return
    }

    if (!zapierService.validateWebhookUrl(webhookUrl)) {
      setUrlError('Please enter a valid webhook URL (must start with http:// or https://)')
      return
    }

    try {
      const testSuccess = await zapierService.testWebhook(webhookUrl)
      if (!testSuccess) {
        setUrlError('Failed to connect to webhook. Please verify the URL is correct.')
        return
      }

      // Connect with the webhook URL as the access token
      connect('zapier', webhookUrl)
      updateSettings('zapier', {
        webhookUrl,
        notifyOnCompletion: true,
        notifyOnCreated: false,
        notifyOnMilestone: true,
        notifyOnDailySummary: false,
        eventLog: [],
      })

      setWebhookUrl('')
      toast.success('Zapier connected successfully!')
    } catch (error) {
      console.error('Connection error:', error)
      setUrlError('An unexpected error occurred. Please try again.')
    }
  }

  const handleDisconnect = () => {
    disconnectStore('zapier')
    setWebhookUrl('')
    toast.success('Zapier disconnected')
  }

  const handleToggleEvent = (key: keyof ZapierSettingsData) => {
    if (typeof settings[key] === 'boolean') {
      updateSettings('zapier', {
        ...settings,
        [key]: !settings[key],
      })
    }
  }

  const handleSendTestEvent = async () => {
    if (!settings.webhookUrl) {
      toast.error('No webhook URL configured')
      return
    }

    setTestLoading(true)
    try {
      const success = await zapierService.testWebhook(settings.webhookUrl)

      if (success) {
        toast.success('Test event sent successfully!')
        // Add to event log
        const newEvent: ZapierEvent = {
          type: 'test',
          timestamp: new Date().toLocaleTimeString(),
          success: true,
        }
        const eventLog = [...(settings.eventLog || []), newEvent].slice(-5)
        updateSettings('zapier', { ...settings, eventLog })
      } else {
        toast.error('Failed to send test event')
        const newEvent: ZapierEvent = {
          type: 'test',
          timestamp: new Date().toLocaleTimeString(),
          success: false,
        }
        const eventLog = [...(settings.eventLog || []), newEvent].slice(-5)
        updateSettings('zapier', { ...settings, eventLog })
      }
    } catch (error) {
      console.error('Error sending test event:', error)
      toast.error('Failed to send test event')
    } finally {
      setTestLoading(false)
    }
  }

  const handleUpdateWebhookUrl = async () => {
    setUrlError('')

    if (!newWebhookUrl.trim()) {
      setUrlError('Please enter a webhook URL')
      return
    }

    if (!zapierService.validateWebhookUrl(newWebhookUrl)) {
      setUrlError('Please enter a valid webhook URL (must start with http:// or https://)')
      return
    }

    try {
      const testSuccess = await zapierService.testWebhook(newWebhookUrl)
      if (!testSuccess) {
        setUrlError('Failed to connect to new webhook. Please verify the URL is correct.')
        return
      }

      updateSettings('zapier', {
        ...settings,
        webhookUrl: newWebhookUrl,
      })
      connect('zapier', newWebhookUrl)

      setNewWebhookUrl('')
      setShowUpdateUrl(false)
      toast.success('Webhook URL updated successfully!')
    } catch (error) {
      console.error('Update error:', error)
      setUrlError('An unexpected error occurred. Please try again.')
    }
  }

  const maskWebhookUrl = (url: string): string => {
    if (!url || url.length <= 8) return url
    return '•'.repeat(url.length - 8) + url.slice(-8)
  }

  // Disconnected state
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 dark:border-orange-800 dark:from-orange-950 dark:to-orange-900"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-500 p-3 text-white">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect Zapier</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automate workflows with 5000+ apps
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Features</h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Trigger Zaps on habit completion
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Connect with 5000+ apps
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Create automated workflows
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Custom event triggers
            </li>
          </ul>
        </div>

        {/* How it works */}
        <div className="space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">How it works</h4>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Create a Zap</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Go to zapier.com and create a new Zap
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Paste webhook URL</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use your Zap webhook URL below
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Start automating</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Events will automatically trigger your Zap
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook URL input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Webhook URL
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value)
              setUrlError('')
            }}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <AnimatePresence>
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500"
              >
                {urlError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 dark:hover:bg-orange-700"
        >
          Connect Zapier
        </button>
      </motion.div>
    )
  }

  // Connected state
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 dark:border-orange-800 dark:from-orange-950 dark:to-orange-900"
    >
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Connected</span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

      {/* Webhook URL display */}
      <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Connected Webhook
        </label>
        <div className="flex items-center justify-between">
          <code className="break-all font-mono text-xs text-gray-600 dark:text-gray-300">
            {maskWebhookUrl(settings.webhookUrl || '')}
          </code>
          <button
            onClick={() => setShowUpdateUrl(!showUpdateUrl)}
            className="ml-2 flex-shrink-0 rounded bg-gray-200 px-3 py-1 text-xs text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Update
          </button>
        </div>
      </div>

      {/* Update webhook URL section */}
      <AnimatePresence>
        {showUpdateUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              New Webhook URL
            </label>
            <input
              type="text"
              value={newWebhookUrl}
              onChange={(e) => {
                setNewWebhookUrl(e.target.value)
                setUrlError('')
              }}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <AnimatePresence>
              {urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500"
                >
                  {urlError}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateWebhookUrl}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
              >
                Save URL
              </button>
              <button
                onClick={() => {
                  setShowUpdateUrl(false)
                  setNewWebhookUrl('')
                  setUrlError('')
                }}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event toggles */}
      <div className="space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Events to Send</h4>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifyOnCompletion ?? true}
              onChange={() => handleToggleEvent('notifyOnCompletion')}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Habit completed</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifyOnCreated ?? false}
              onChange={() => handleToggleEvent('notifyOnCreated')}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Habit created</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifyOnMilestone ?? true}
              onChange={() => handleToggleEvent('notifyOnMilestone')}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Streak milestones</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifyOnDailySummary ?? false}
              onChange={() => handleToggleEvent('notifyOnDailySummary')}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Daily summary</span>
          </label>
        </div>
      </div>

      {/* Test button */}
      <button
        onClick={handleSendTestEvent}
        disabled={testLoading}
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-orange-700"
      >
        {testLoading ? 'Sending...' : 'Send Test Event'}
      </button>

      {/* Event log */}
      {settings.eventLog && settings.eventLog.length > 0 && (
        <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Events</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {settings.eventLog.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 py-1 text-xs text-gray-600 last:border-0 dark:border-gray-700 dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      event.success ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="capitalize">{event.type}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-500">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
