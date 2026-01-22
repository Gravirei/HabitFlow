/**
 * Cloud Sync Modal
 * Backup and restore timer data to cloud
 * Integrated with tieredStorage for real Supabase sync
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSyncStore } from './syncStore'
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">cloud_sync</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cloud Sync</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Backup & restore</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('sync')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'sync'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Sync Now
                </button>
                <button
                  onClick={() => setActiveTab('backups')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'backups'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Backups ({backups.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Sync Tab */}
              {activeTab === 'sync' && (
                <div className="space-y-6">
                  {/* Login Status Banner */}
                  {!isLoggedIn && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">account_circle</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200">Sign in to enable cloud sync</h4>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Your data is currently stored locally. Sign in to sync across devices.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sync Status */}
                  <div className={`p-6 rounded-2xl border ${
                    isLoggedIn 
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Sync Status
                          </h3>
                          {isLoggedIn ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                              Connected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
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
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                          isLoggedIn
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg disabled:opacity-50'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span className={`material-symbols-outlined ${syncStatus.isSyncing ? 'animate-spin' : ''}`}>
                          {syncStatus.isSyncing ? 'sync' : 'cloud_sync'}
                        </span>
                        {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>

                    {syncStatus.syncError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                          <span className="material-symbols-outlined text-lg">error</span>
                          {syncStatus.syncError}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isLoggedIn ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                          {isLoggedIn ? syncStatus.itemsSynced : '-'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Syncs Done
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          syncStatus.pendingChanges > 0 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : isLoggedIn ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                        }`}>
                          {isLoggedIn ? syncStatus.pendingChanges : '-'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Pending Changes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {sessions.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Total Sessions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Quick Actions
                    </h3>
                    <div className="grid gap-3">
                      <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      </button>

                      <button
                        onClick={handleDownloadLocalCopy}
                        disabled={isDownloading || sessions.length === 0}
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <span className={`material-symbols-outlined ${isDownloading ? 'animate-pulse' : ''}`}>
                            {isDownloading ? 'downloading' : 'download'}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Download Local Copy
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {sessions.length === 0 ? 'No sessions to export' : `Export ${sessions.length} sessions as JSON file`}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Backups Tab */}
              {activeTab === 'backups' && (
                <div className="space-y-4">
                  {backups.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">backup</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No Backups Yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Create your first backup to protect your data
                      </p>
                      <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Create Backup
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Available Backups
                        </h3>
                        <button
                          onClick={handleCreateBackup}
                          disabled={isCreatingBackup}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                        >
                          New Backup
                        </button>
                      </div>
                      <div className="space-y-2">
                        {backups.map((backup) => (
                          <div
                            key={backup.id}
                            className="relative flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors overflow-hidden"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <span className="material-symbols-outlined">cloud_done</span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {backup.deviceName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                  {formatDate(backup.timestamp)} • {backup.itemCount} items • {formatSize(backup.size)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestoreBackup(backup.id)}
                                disabled={isRestoring === backup.id}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {isRestoring === backup.id ? (
                                  <>
                                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                    Restoring...
                                  </>
                                ) : (
                                  'Restore'
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(backup.id)}
                                disabled={isRestoring === backup.id}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"
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
                                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between z-10 border-2 border-red-300 dark:border-red-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
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
                                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBackup(backup.id)}
                                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
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
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
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
                    <div className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl ${isLoggedIn ? '' : 'opacity-50'}`}>
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
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl ml-4 border-l-2 border-indigo-500">
                        <label className="block">
                          <div className="font-medium text-slate-900 dark:text-white mb-1">
                            Sync Interval
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                            How often to automatically sync (in minutes)
                          </div>
                          <select
                            value={settings.syncInterval}
                            onChange={(e) => {
                              updateSettings({ syncInterval: parseInt(e.target.value) })
                              // Restart auto-sync with new interval
                              startAutoSync()
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <div className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl ${isLoggedIn ? '' : 'opacity-50'}`}>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Sync on Login</div>
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
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Backup Before Sync</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Create automatic backup before each sync
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.backupBeforeSync}
                        onClick={() => updateSettings({ backupBeforeSync: !settings.backupBeforeSync })}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                          settings.backupBeforeSync ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
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

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <label className="block">
                        <div className="font-medium text-slate-900 dark:text-white mb-1">
                          Max Backups to Keep
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">
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
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Storage Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Storage Info
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Total Sessions</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{sessions.length}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Total Backups</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{backups.length}</div>
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
                            {syncStatus.lastSyncTime ? formatTimeAgo(syncStatus.lastSyncTime) : 'Never'}
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
