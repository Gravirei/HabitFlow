import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useIntegrationStore } from '../store/integrationStore'
import { googleFitService } from './googleFit'

interface FitnessMetrics {
  steps: number
  workouts: number
  activeMinutes: number
  sleepHours: number
}

interface Settings {
  syncSteps: boolean
  syncWorkouts: boolean
  syncSleep: boolean
  autoCompleteFitness: boolean
}

export function GoogleFitSettings() {
  const connection = useIntegrationStore((s) => s.connections['google-fit'])
  const { updateSettings, updateLastSynced, setStatus, setError } = useIntegrationStore()

  const isConnected = connection?.status === 'connected' && !!connection.accessToken

  const [metrics, setMetrics] = useState<FitnessMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    syncSteps: (connection?.settings?.syncSteps as boolean | undefined) ?? true,
    syncWorkouts: (connection?.settings?.syncWorkouts as boolean | undefined) ?? true,
    syncSleep: (connection?.settings?.syncSleep as boolean | undefined) ?? true,
    autoCompleteFitness: (connection?.settings?.autoCompleteFitness as boolean | undefined) ?? true,
  })

  // Fetch metrics when connected
  useEffect(() => {
    if (isConnected && connection.accessToken) {
      fetchMetrics()
    }
  }, [isConnected, connection?.accessToken])

  const fetchMetrics = async () => {
    if (!connection?.accessToken) return

    try {
      setLoading(true)
      const data = await googleFitService.syncFitnessData(connection.accessToken)
      setMetrics({
        steps: data.steps,
        workouts: data.workouts.length,
        activeMinutes: data.activeMinutes,
        sleepHours: data.sleep.reduce((total, s) => total + s.duration, 0),
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Failed to load fitness data')
      setError('google-fit', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    try {
      setStatus('google-fit', 'connecting')
      googleFitService.initiateAuth()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed'
      setError('google-fit', message)
      toast.error(message)
    }
  }

  const handleSync = async () => {
    if (!connection?.accessToken) return

    try {
      setSyncing(true)
      setStatus('google-fit', 'syncing')
      await googleFitService.syncFitnessData(connection.accessToken)
      updateLastSynced('google-fit')
      setStatus('google-fit', 'connected')
      await fetchMetrics()
      toast.success('Fitness data synced successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      setError('google-fit', message)
      toast.error('Failed to sync fitness data')
    } finally {
      setSyncing(false)
    }
  }

  const handleSettingsChange = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateSettings('google-fit', newSettings)
  }

  const handleDisconnect = async () => {
    try {
      await googleFitService.disconnect()
      toast.success('Disconnected from Google Fit')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Disconnection failed'
      setError('google-fit', message)
      toast.error('Failed to disconnect')
    }
  }

  // Disconnected state
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">
              fitness_center
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Fit</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your fitness data automatically
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected data:</p>
          <ul className="space-y-2">
            {[
              { icon: 'steps', label: 'Daily steps' },
              { icon: 'directions_run', label: 'Workouts & exercises' },
              { icon: 'bedtime', label: 'Sleep tracking' },
              { icon: 'favorite', label: 'Active minutes' },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="material-symbols-outlined text-[20px] text-green-500">
                  {item.icon}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Connect button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
        >
          <span className="material-symbols-outlined">login</span>
          Connect to Google Fit
        </motion.button>
      </motion.div>
    )
  }

  // Connected state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Connection status */}
      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Connected</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Last synced{' '}
            {connection?.lastSyncedAt
              ? new Date(connection.lastSyncedAt).toLocaleString()
              : 'never'}
          </p>
        </div>
      </div>

      {/* Fitness metrics cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Steps Today',
            value: loading ? '—' : metrics?.steps.toLocaleString() || '0',
            icon: 'steps',
            unit: 'steps',
          },
          {
            label: 'This Week',
            value: loading ? '—' : metrics?.workouts || '0',
            icon: 'directions_run',
            unit: 'workouts',
          },
          {
            label: 'Active Minutes',
            value: loading ? '—' : metrics?.activeMinutes || '0',
            icon: 'favorite',
            unit: 'min',
          },
          {
            label: 'Sleep Hours',
            value: loading ? '—' : metrics?.sleepHours.toFixed(1) || '0',
            icon: 'bedtime',
            unit: 'hrs',
          },
        ].map((metric) => (
          <motion.div
            key={metric.label}
            whileHover={{ scale: 1.02 }}
            className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
              <span className="material-symbols-outlined text-[18px] text-green-500">
                {metric.icon}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{metric.unit}</p>
          </motion.div>
        ))}
      </div>

      {/* Sync settings */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white">Sync Preferences</h4>
        {[
          { key: 'syncSteps' as const, label: 'Sync steps', icon: 'steps' },
          { key: 'syncWorkouts' as const, label: 'Sync workouts', icon: 'directions_run' },
          { key: 'syncSleep' as const, label: 'Sync sleep data', icon: 'bedtime' },
          {
            key: 'autoCompleteFitness' as const,
            label: 'Auto-complete fitness habits',
            icon: 'done_all',
          },
        ].map(({ key, label, icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-gray-400">
                {icon}
              </span>
              <label
                htmlFor={key}
                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingsChange(key, !settings[key])}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[key] ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              id={key}
            >
              <motion.span
                animate={{ x: settings[key] ? 20 : 2 }}
                className="inline-block h-5 w-5 transform rounded-full bg-white"
              />
            </motion.button>
          </div>
        ))}
      </div>

      {/* Goal mapping (placeholder) */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white">Goal Mapping</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Map your Google Fit data to habit goals. Coming soon...
        </p>
      </div>

      {/* Sync and disconnect buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSync}
          disabled={syncing || loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
        >
          <AnimatePresence mode="wait">
            {syncing ? (
              <motion.span
                key="spinner"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                className="material-symbols-outlined animate-spin"
              >
                sync
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="material-symbols-outlined"
              >
                sync
              </motion.span>
            )}
          </AnimatePresence>
          {syncing ? 'Syncing...' : 'Sync Now'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDisconnect}
          className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          <span className="material-symbols-outlined">logout</span>
          Disconnect
        </motion.button>
      </div>
    </motion.div>
  )
}
