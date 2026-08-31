/**
 * Cloud Sync Modal
 * Backup and restore timer data to cloud
 * Integrated with tieredStorage for real Supabase sync
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSyncStore } from '@/features/timer/store/syncStore'
import { tieredStorage } from '@/lib/storage'
import type { TimerSession } from '../types/session.types'
import toast from 'react-hot-toast'

interface CloudSyncModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSession[]
}

export function CloudSyncModal({ isOpen, onClose, sessions }: CloudSyncModalProps) {
  const {
    syncStatus,
    backups,
    settings,
    startSync,
    createBackup,
    restoreBackup,
    deleteBackup,
    updateSettings,
    refreshSyncStatus,
    startAutoSync,
    stopAutoSync,
  } = useSyncStore()

  const [activeTab, setActiveTab] = useState<'sync' | 'backups' | 'settings'>('sync')
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const isLoggedIn = tieredStorage.isLoggedIn()

  // Refresh sync status when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshSyncStatus()
    }
  }, [isOpen, refreshSyncStatus])

  const handleSync = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to sync your data to the cloud')
      return
    }

    // Check if backup before sync is enabled
    if (settings.backupBeforeSync && sessions.length > 0) {
      const deviceName = `Auto-backup before sync - ${new Date().toLocaleDateString()}`
      createBackup(deviceName, sessions)
    }

    await startSync()
    if (!syncStatus.syncError) {
      toast.success('Sync completed successfully!')
    }
  }

  const handleDownloadLocalCopy = () => {
    setIsDownloading(true)
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        sessions: sessions,
        totalSessions: sessions.length,
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timer-sessions-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDeleteBackup = (backupId: string) => {
    deleteBackup(backupId)
    setDeleteConfirmId(null)
    toast.success('Backup deleted')
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)

    try {
      const deviceName = `${navigator.platform || 'Device'} - ${new Date().toLocaleDateString()}`
      createBackup(deviceName, sessions)
      toast.success('Backup created successfully!')
    } catch (error) {
      toast.error('Failed to create backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? Current data will be replaced.')) {
      return
    }

    setIsRestoring(backupId)
    try {
      await restoreBackup(backupId)
      toast.success('Backup restored successfully! Refreshing...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to restore backup')
    } finally {
      setIsRestoring(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                    <span className="material-symbols-outlined text-xl text-white">cloud_sync</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cloud Sync</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Backup & restore</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('sync')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'sync'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Sync Now
                </button>
                <button
                  onClick={() => setActiveTab('backups')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'backups'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Backups ({backups.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
              {/* Sync Tab */}
              {activeTab === 'sync' && (
                <div className="space-y-6">
                  {/* Login Status Banner */}
                  {!isLoggedIn && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                            account_circle
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                            Sign in to enable cloud sync
                          </h4>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Your data is currently stored locally. Sign in to sync across devices.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sync Status */}
                  <div
                    className={`rounded-2xl border p-6 ${
                      isLoggedIn
                        ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-purple-900/20'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Sync Status
                          </h3>
                          {isLoggedIn ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Connected
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                              Local Only
                            </span>
                          )}
                        </div>
                        {syncStatus.lastSyncTime ? (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Last synced: {formatTimeAgo(syncStatus.lastSyncTime)}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isLoggedIn ? 'Never synced' : 'Sign in to sync'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSync}
                        disabled={syncStatus.isSyncing || !isLoggedIn}
                        className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                          isLoggedIn
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg disabled:opacity-50'
                            : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
                        >
                          {syncStatus.isSyncing ? 'sync' : 'cloud_sync'}
                        </span>
                        {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>

                    {syncStatus.syncError && (
                      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <span className="material-symbols-outlined text-lg">error</span>
                          {syncStatus.syncError}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${isLoggedIn ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                        >
                          {isLoggedIn ? syncStatus.itemsSynced : '-'}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Syncs Done
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            syncStatus.pendingChanges > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : isLoggedIn
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {isLoggedIn ? syncStatus.pendingChanges : '-'}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Pending Changes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {sessions.length}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Total Sessions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                      Quick Actions
                    </h3>
                    <div className="grid gap-3">
                      <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <span className="material-symbols-outlined">backup</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Create Manual Backup
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            Save current data to cloud
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      </button>

                      <button
                        onClick={handleDownloadLocalCopy}
                        disabled={isDownloading || sessions.length === 0}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <span
                            className={`material-symbols-outlined ${isDownloading ? 'animate-pulse' : ''}`}
                          >
                            {isDownloading ? 'downloading' : 'download'}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Download Local Copy
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {sessions.length === 0
                              ? 'No sessions to export'
                              : `Export ${sessions.length} sessions as JSON file`}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Backups Tab */}
              {activeTab === 'backups' && (
                <div className="space-y-4">
                  {backups.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-3xl text-slate-400">
                          backup
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        No Backups Yet
                      </h3>
                      <p className="mb-6 text-slate-600 dark:text-slate-400">
                        Create your first backup to protect your data
                      </p>
                      <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                      >
                        Create Backup
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Available Backups
                        </h3>
                        <button
                          onClick={handleCreateBackup}
                          disabled={isCreatingBackup}
                          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                        >
                          New Backup
                        </button>
                      </div>
                      <div className="space-y-2">
                        {backups.map((backup) => (
                          <div
                            key={backup.id}
                            className="relative flex items-center justify-between overflow-hidden rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <span className="material-symbols-outlined">cloud_done</span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {backup.deviceName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                  {formatDate(backup.timestamp)} • {backup.itemCount} items •{' '}
                                  {formatSize(backup.size)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestoreBackup(backup.id)}
                                disabled={isRestoring === backup.id}
                                className="flex items-center gap-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isRestoring === backup.id ? (
                                  <>
                                    <span className="material-symbols-outlined animate-spin text-sm">
                                      sync
                                    </span>
                                    Restoring...
                                  </>
                                ) : (
                                  'Restore'
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(backup.id)}
                                disabled={isRestoring === backup.id}
                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                                title="Delete backup"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>

                            {/* Delete Confirmation Dialog */}
                            <AnimatePresence>
                              {deleteConfirmId === backup.id && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 z-10 flex items-center justify-between rounded-xl border-2 border-red-300 bg-white p-4 dark:border-red-700 dark:bg-slate-800"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                                      <span className="material-symbols-outlined text-xl text-red-500">
                                        delete_forever
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Delete this backup?
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        This action cannot be undone
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBackup(backup.id)}
                                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Login required notice */}
                  {!isLoggedIn && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <span className="material-symbols-outlined text-lg">info</span>
                        <span className="text-sm">Sign in to enable sync settings</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Sync Settings
                    </h3>

                    {/* Auto Sync Toggle */}
                    <div
                      className={`flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 ${isLoggedIn ? '' : 'opacity-50'}`}
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Auto Sync</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Automatically sync data in background
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.autoSync}
                        disabled={!isLoggedIn}
                        onClick={() => {
                          const newValue = !settings.autoSync
                          updateSettings({ autoSync: newValue })
                          if (newValue) {
                            startAutoSync()
                          } else {
                            stopAutoSync()
                          }
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          settings.autoSync ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            settings.autoSync ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sync Interval - only show when auto sync is enabled */}
                    {settings.autoSync && isLoggedIn && (
                      <div className="ml-4 rounded-xl border-l-2 border-indigo-500 bg-slate-50 p-4 dark:bg-slate-800/50">
                        <label className="block">
                          <div className="mb-1 font-medium text-slate-900 dark:text-white">
                            Sync Interval
                          </div>
                          <div className="mb-3 text-xs text-slate-500 dark:text-slate-500">
                            How often to automatically sync (in minutes)
                          </div>
                          <select
                            value={settings.syncInterval}
                            onChange={(e) => {
                              updateSettings({ syncInterval: parseInt(e.target.value) })
                              // Restart auto-sync with new interval
                              startAutoSync()
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="5">Every 5 minutes</option>
                            <option value="15">Every 15 minutes</option>
                            <option value="30">Every 30 minutes</option>
                            <option value="60">Every hour</option>
                            <option value="120">Every 2 hours</option>
                          </select>
                        </label>
                      </div>
                    )}

                    {/* Sync on Login Toggle */}
                    <div
                      className={`flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 ${isLoggedIn ? '' : 'opacity-50'}`}
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          Sync on Login
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Automatically sync when you sign in
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.syncOnLogin}
                        disabled={!isLoggedIn}
                        onClick={() => updateSettings({ syncOnLogin: !settings.syncOnLogin })}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          settings.syncOnLogin ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            settings.syncOnLogin ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Backup Before Sync Toggle */}
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          Backup Before Sync
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Create automatic backup before each sync
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.backupBeforeSync}
                        onClick={() =>
                          updateSettings({ backupBeforeSync: !settings.backupBeforeSync })
                        }
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                          settings.backupBeforeSync
                            ? 'bg-indigo-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            settings.backupBeforeSync ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Backup Settings
                    </h3>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <label className="block">
                        <div className="mb-1 font-medium text-slate-900 dark:text-white">
                          Max Backups to Keep
                        </div>
                        <div className="mb-3 text-xs text-slate-500 dark:text-slate-500">
                          Older backups will be automatically deleted
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={settings.maxBackups}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            if (value >= 1 && value <= 50) {
                              updateSettings({ maxBackups: value })
                            }
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Storage Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Storage Info
                    </h3>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Total Sessions</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {sessions.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Total Backups</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {backups.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Storage Mode</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {isLoggedIn ? 'Cloud + Local' : 'Local Only'}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Last Sync</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {syncStatus.lastSyncTime
                              ? formatTimeAgo(syncStatus.lastSyncTime)
                              : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
