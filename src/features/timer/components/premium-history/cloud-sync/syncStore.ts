/**
 * Cloud Sync Store
 * Manages cloud synchronization and backups
 * Now integrated with tieredStorage for real Supabase sync
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tieredStorage } from '@/lib/storage'
import type { SyncStatus, CloudBackup, SyncSettings } from './types'

interface SyncStore {
  syncStatus: SyncStatus
  backups: CloudBackup[]
  settings: SyncSettings
  autoSyncIntervalId: NodeJS.Timeout | null
  
  // Sync operations
  startSync: () => Promise<void>
  setSyncStatus: (status: Partial<SyncStatus>) => void
  refreshSyncStatus: () => void
  
  // Auto sync
  startAutoSync: () => void
  stopAutoSync: () => void
  triggerSyncOnLogin: () => void
  
  // Backup operations
  createBackup: (deviceName: string, data: any) => CloudBackup
  restoreBackup: (backupId: string) => Promise<void>
  deleteBackup: (backupId: string) => void
  getBackups: () => CloudBackup[]
  
  // Settings
  updateSettings: (settings: Partial<SyncSettings>) => void
  getSettings: () => SyncSettings
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      syncStatus: {
        lastSyncTime: null,
        isSyncing: false,
        syncError: null,
        itemsSynced: 0,
        pendingChanges: 0,
      },
      backups: [],
      settings: {
        autoSync: false,
        syncInterval: 30,
        syncOnLogin: false,
        syncOnLogout: false,
        backupBeforeSync: true,
        maxBackups: 10,
      },
      autoSyncIntervalId: null,

      startSync: async () => {
        // Check if user is logged in
        if (!tieredStorage.isLoggedIn()) {
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              syncError: 'Please log in to sync your data to the cloud.',
            },
          }))
          return
        }

        set((state) => ({
          syncStatus: { ...state.syncStatus, isSyncing: true, syncError: null },
        }))

        try {
          // Use real tieredStorage sync
          await tieredStorage.syncToCloud()
          
          // Refresh data from cloud
          await tieredStorage.refreshFromCloud()
          
          // Get updated sync status from tieredStorage
          const storageStatus = tieredStorage.getSyncStatus()

          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              isSyncing: false,
              lastSyncTime: storageStatus.lastSyncTime,
              pendingChanges: storageStatus.pendingChanges,
              syncError: storageStatus.error,
              itemsSynced: state.syncStatus.itemsSynced + 1, // Increment sync count
            },
          }))
        } catch (error: any) {
          console.error('[SyncStore] Sync failed:', error)
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              isSyncing: false,
              syncError: error?.message || 'Sync failed. Please try again.',
            },
          }))
        }
      },

      setSyncStatus: (status) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        }))
      },

      refreshSyncStatus: () => {
        const storageStatus = tieredStorage.getSyncStatus()
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            lastSyncTime: storageStatus.lastSyncTime,
            pendingChanges: storageStatus.pendingChanges,
            isSyncing: storageStatus.isSyncing,
          },
        }))
      },

      startAutoSync: () => {
        const { settings, autoSyncIntervalId, startSync } = get()
        
        // Clear existing interval if any
        if (autoSyncIntervalId) {
          clearInterval(autoSyncIntervalId)
        }

        if (!settings.autoSync || !tieredStorage.isLoggedIn()) {
          set({ autoSyncIntervalId: null })
          return
        }

        // Start new auto-sync interval (convert minutes to milliseconds)
        const intervalMs = settings.syncInterval * 60 * 1000
        const intervalId = setInterval(() => {
          if (tieredStorage.isLoggedIn()) {
            console.log('[SyncStore] Auto-sync triggered')
            startSync()
          }
        }, intervalMs)

        set({ autoSyncIntervalId: intervalId })
        console.log(`[SyncStore] Auto-sync started with interval: ${settings.syncInterval} minutes`)
      },

      stopAutoSync: () => {
        const { autoSyncIntervalId } = get()
        if (autoSyncIntervalId) {
          clearInterval(autoSyncIntervalId)
          set({ autoSyncIntervalId: null })
          console.log('[SyncStore] Auto-sync stopped')
        }
      },

      triggerSyncOnLogin: () => {
        const { settings, startSync, startAutoSync } = get()
        
        if (!tieredStorage.isLoggedIn()) return

        // Sync on login if enabled
        if (settings.syncOnLogin) {
          console.log('[SyncStore] Sync on login triggered')
          startSync()
        }

        // Start auto-sync if enabled
        if (settings.autoSync) {
          startAutoSync()
        }
      },

      createBackup: (deviceName, data) => {
        const backup: CloudBackup = {
          id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          deviceName,
          itemCount: Array.isArray(data) ? data.length : Object.keys(data).length,
          size: JSON.stringify(data).length,
          autoBackup: false,
        }

        // Store backup data in localStorage (for local backups)
        try {
          const backupData = {
            ...backup,
            data: data,
          }
          localStorage.setItem(`timer-backup-${backup.id}`, JSON.stringify(backupData))
        } catch (error) {
          console.error('[SyncStore] Failed to save backup data:', error)
        }

        set((state) => {
          const backups = [...state.backups, backup]
          // Keep only the latest maxBackups
          const sortedBackups = backups.sort((a, b) => b.timestamp - a.timestamp)
          const limitedBackups = sortedBackups.slice(0, state.settings.maxBackups)
          
          // Clean up old backup data from localStorage
          const removedBackups = sortedBackups.slice(state.settings.maxBackups)
          removedBackups.forEach((b) => {
            localStorage.removeItem(`timer-backup-${b.id}`)
          })
          
          return { backups: limitedBackups }
        })

        return backup
      },

      restoreBackup: async (backupId) => {
        try {
          // Get backup data from localStorage
          const backupDataStr = localStorage.getItem(`timer-backup-${backupId}`)
          if (!backupDataStr) {
            throw new Error('Backup data not found')
          }

          const backupData = JSON.parse(backupDataStr)
          const sessions = backupData.data

          if (!Array.isArray(sessions)) {
            throw new Error('Invalid backup data format')
          }

          // Restore sessions to localStorage (mode-specific keys)
          const stopwatchSessions = sessions.filter((s: any) => s.mode === 'Stopwatch')
          const countdownSessions = sessions.filter((s: any) => s.mode === 'Countdown')
          const intervalsSessions = sessions.filter((s: any) => s.mode === 'Intervals')

          if (stopwatchSessions.length > 0) {
            localStorage.setItem('timer-stopwatch-history', JSON.stringify(stopwatchSessions))
          }
          if (countdownSessions.length > 0) {
            localStorage.setItem('timer-countdown-history', JSON.stringify(countdownSessions))
          }
          if (intervalsSessions.length > 0) {
            localStorage.setItem('timer-intervals-history', JSON.stringify(intervalsSessions))
          }

          console.log(`[SyncStore] Restored backup: ${backupId} with ${sessions.length} sessions`)
        } catch (error: any) {
          console.error('[SyncStore] Failed to restore backup:', error)
          throw new Error(error?.message || 'Failed to restore backup')
        }
      },

      deleteBackup: (backupId) => {
        // Remove backup data from localStorage
        localStorage.removeItem(`timer-backup-${backupId}`)
        
        set((state) => ({
          backups: state.backups.filter((b) => b.id !== backupId),
        }))
      },

      getBackups: () => {
        return get().backups
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      getSettings: () => {
        return get().settings
      },
    }),
    {
      name: 'timer-cloud-sync',
    }
  )
)
