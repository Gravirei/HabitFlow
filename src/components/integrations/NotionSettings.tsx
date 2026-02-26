import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { notionService } from './notion'
import { useIntegrationStore } from './integrationStore'

export function NotionSettings() {
  const connection = useIntegrationStore((s) => s.connections['notion'])
  const { connect, disconnect, updateSettings, updateLastSynced, setStatus } = useIntegrationStore()

  const [databases, setDatabases] = useState<
    Array<{ id: string; title: string }>
  >([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>(
    (connection.settings?.databaseId as string) || ''
  )
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false)
  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportToggles, setExportToggles] = useState({
    habits: (connection.settings?.exportHabits as boolean) ?? true,
    notes: (connection.settings?.exportNotes as boolean) ?? false,
    stats: (connection.settings?.exportStats as boolean) ?? false,
  })

  const isConnected = connection.status === 'connected' && !!connection.accessToken

  useEffect(() => {
    if (isConnected) {
      loadDatabases()
    }
  }, [isConnected])

  const loadDatabases = async () => {
    if (!connection.accessToken) return

    setIsLoadingDatabases(true)
    try {
      const dbs = await notionService.searchDatabases(connection.accessToken)
      setDatabases(dbs)
    } catch (error) {
      toast.error('Failed to load Notion databases')
      console.error(error)
    } finally {
      setIsLoadingDatabases(false)
    }
  }

  const handleCreateDatabase = async () => {
    const workspaceId = connection.settings?.workspaceId as string
    if (!connection.accessToken || !workspaceId) return

    setIsCreatingDatabase(true)
    try {
      const dbId = await notionService.createHabitDatabase(
        connection.accessToken,
        workspaceId
      )
      setSelectedDatabase(dbId)
      updateSettings('notion', { databaseId: dbId })
      await loadDatabases()
      toast.success('Notion database created successfully')
    } catch (error) {
      toast.error('Failed to create Notion database')
      console.error(error)
    } finally {
      setIsCreatingDatabase(false)
    }
  }

  const handleExportNow = async () => {
    if (!connection.accessToken || !selectedDatabase) {
      toast.error('Please select or create a database first')
      return
    }

    setIsExporting(true)
    try {
      const habits = [] // TODO: Get habits from habit store
      const result = await notionService.exportHabits(
        connection.accessToken,
        selectedDatabase,
        habits
      )

      if (result.errors.length > 0) {
        toast.error(`Exported ${result.exported} habits with ${result.errors.length} errors`)
      } else {
        toast.success(`Successfully exported ${result.exported} habits`)
      }

      updateLastSynced('notion')
      updateSettings('notion', {
        exportHabits: exportToggles.habits,
        exportNotes: exportToggles.notes,
        exportStats: exportToggles.stats,
        databaseId: selectedDatabase,
      })
    } catch (error) {
      toast.error('Failed to export habits')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await notionService.disconnect()
      toast.success('Disconnected from Notion')
    } catch (error) {
      toast.error('Failed to disconnect from Notion')
      console.error(error)
    }
  }

  const handleConnect = () => {
    notionService.initiateAuth()
  }

  const formatLastSynced = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connect to Notion
                </h3>
                <p className="text-slate-400">
                  Sync your habits directly to a Notion database for better tracking and
                  organization.
                </p>
              </div>

              <div className="space-y-3 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-sm font-semibold text-slate-300 mb-3">
                  Features:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base text-slate-400 mt-0.5 flex-shrink-0">
                      check_circle
                    </span>
                    <span>Export all your habits to a dedicated database</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base text-slate-400 mt-0.5 flex-shrink-0">
                      check_circle
                    </span>
                    <span>Track streaks, frequency, and completion status</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base text-slate-400 mt-0.5 flex-shrink-0">
                      check_circle
                    </span>
                    <span>Automatic syncing and real-time updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base text-slate-400 mt-0.5 flex-shrink-0">
                      check_circle
                    </span>
                    <span>Organize habits by category and frequency</span>
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">link</span>
                Connect Notion
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Connection Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      Connected to Notion
                    </p>
                    <p className="text-xs text-slate-500">
                      Workspace: {notionIntegration?.workspaceId}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Last synced: {formatLastSynced(notionIntegration?.lastSynced)}
              </p>
            </motion.div>

            {/* Database Selection */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6"
            >
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Habit Database
              </label>
              <div className="flex gap-3 mb-3">
                <div className="relative flex-1">
                  <select
                    value={selectedDatabase}
                    onChange={(e) => setSelectedDatabase(e.target.value)}
                    disabled={isLoadingDatabases}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl text-white px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingDatabases
                        ? 'Loading databases...'
                        : 'Select a database'}
                    </option>
                    {databases.map((db) => (
                      <option key={db.id} value={db.id}>
                        {db.title}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateDatabase}
                  disabled={isCreatingDatabase}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  New
                </motion.button>
              </div>
              <p className="text-xs text-slate-500">
                {databases.length} database{databases.length !== 1 ? 's' : ''} found
              </p>
            </motion.div>

            {/* Export Toggles */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 space-y-4"
            >
              <p className="text-sm font-semibold text-slate-300">
                Export Options
              </p>

              {[
                {
                  key: 'habits' as const,
                  label: 'Export Habits',
                  description: 'Sync all your habits',
                },
                {
                  key: 'notes' as const,
                  label: 'Export Notes',
                  description: 'Include habit notes and descriptions',
                },
                {
                  key: 'stats' as const,
                  label: 'Export Statistics',
                  description: 'Include streaks and completion data',
                },
              ].map((toggle) => (
                <motion.div
                  key={toggle.key}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors cursor-pointer"
                  onClick={() =>
                    setExportToggles({
                      ...exportToggles,
                      [toggle.key]: !exportToggles[toggle.key],
                    })
                  }
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {toggle.label}
                    </p>
                    <p className="text-xs text-slate-500">{toggle.description}</p>
                  </div>
                  <motion.div
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      exportToggles[toggle.key]
                        ? 'bg-slate-600'
                        : 'bg-slate-700'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
                      animate={{
                        x: exportToggles[toggle.key] ? 20 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Export Now Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportNow}
                disabled={isExporting || !selectedDatabase}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                {isExporting ? (
                  <>
                    <motion.span
                      className="material-symbols-outlined"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      sync
                    </motion.span>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">
                      upload
                    </span>
                    <span>Export Now</span>
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Disconnect Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDisconnect}
              className="w-full bg-slate-800 hover:bg-red-900/20 hover:border-red-700 border border-slate-700 text-slate-400 hover:text-red-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">link_off</span>
              Disconnect Notion
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
