/**
 * Cloud Sync Types
 */

export interface SyncStatus {
  lastSyncTime: number | null
  isSyncing: boolean
  syncError: string | null
  itemsSynced: number
  pendingChanges: number
}

export interface CloudBackup {
  id: string
  timestamp: number
  deviceName: string
  itemCount: number
  size: number // in bytes
  autoBackup: boolean
}

export interface SyncSettings {
  autoSync: boolean
  syncInterval: number // in minutes
  syncOnLogin: boolean
  syncOnLogout: boolean
  backupBeforeSync: boolean
  maxBackups: number
}
