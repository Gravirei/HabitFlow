/**
 * Tiered Storage Service
 * 
 * Implements a tiered storage strategy:
 * - Non-logged-in users: LocalStorage only
 * - Logged-in users: Supabase + LocalStorage cache with sync
 * 
 * Features:
 * - Automatic sync when online
 * - Offline queue for changes
 * - Migration of local data on first login
 * - Deduplication using local_id
 */

import { supabase } from '@/lib/supabase'
import type { TimerHistoryRecord, TimerMode } from '@/components/timer/types/timer.types'

// Storage keys
const STORAGE_KEYS = {
  STOPWATCH: 'timer-stopwatch-history',
  COUNTDOWN: 'timer-countdown-history',
  INTERVALS: 'timer-intervals-history',
  SYNC_QUEUE: 'timer-sync-queue',
  LAST_SYNC: 'timer-last-sync',
  MIGRATION_DONE: 'timer-migration-done',
} as const

// Supabase table name
const TABLE_NAME = 'timer_sessions'

// Types
export interface SyncQueueItem {
  id: string
  action: 'insert' | 'delete'
  record?: TimerHistoryRecord
  timestamp: number
}

export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: number | null
  pendingChanges: number
  error: string | null
}

export interface HistoryChangeEvent {
  mode: TimerMode
  action: 'save' | 'delete' | 'clear'
  recordId?: string
}

/**
 * Convert TimerHistoryRecord to Supabase row format
 * Maps to production schema with proper column names
 */
function toSupabaseRow(record: TimerHistoryRecord, userId: string) {
  return {
    user_id: userId,
    local_id: record.id,
    mode: record.mode,
    duration: record.duration,
    session_timestamp: new Date(record.timestamp).toISOString(), // Convert to TIMESTAMPTZ
    start_time: record.startTime ? new Date(record.startTime).toISOString() : null,
    session_name: record.sessionName || null,
    lap_count: record.lapCount || null,
    best_lap: record.bestLap || null,
    laps: record.laps || null,
    target_duration: record.targetDuration || null,
    completed: record.completed ?? false,
    interval_count: record.intervalCount || null,
    completed_loops: record.completedLoops || null,
    work_duration: record.workDuration || null,
    break_duration: record.breakDuration || null,
    target_loop_count: record.targetLoopCount || null,
  }
}

/**
 * Convert Supabase row to TimerHistoryRecord format
 * Maps from production schema column names
 */
function fromSupabaseRow(row: any): TimerHistoryRecord {
  return {
    id: row.local_id || row.id,
    mode: row.mode as TimerMode,
    duration: row.duration,
    timestamp: new Date(row.session_timestamp).getTime(), // Convert TIMESTAMPTZ to Unix timestamp
    startTime: row.start_time ? new Date(row.start_time).getTime() : undefined,
    sessionName: row.session_name || undefined,
    lapCount: row.lap_count || undefined,
    bestLap: row.best_lap || undefined,
    laps: row.laps || undefined,
    targetDuration: row.target_duration || undefined,
    completed: row.completed ?? undefined,
    intervalCount: row.interval_count || undefined,
    completedLoops: row.completed_loops || undefined,
    workDuration: row.work_duration || undefined,
    breakDuration: row.break_duration || undefined,
    targetLoopCount: row.target_loop_count || undefined,
  }
}

/**
 * Get storage key for a timer mode
 */
function getStorageKey(mode: TimerMode): string {
  switch (mode) {
    case 'Stopwatch':
      return STORAGE_KEYS.STOPWATCH
    case 'Countdown':
      return STORAGE_KEYS.COUNTDOWN
    case 'Intervals':
      return STORAGE_KEYS.INTERVALS
  }
}

/**
 * LocalStorage helpers with integrity checks
 * Security: Uses checksums to detect tampering
 */
import { secureGetItem, secureSetItem } from '@/components/timer/utils/storageIntegrity'

const localStorageHelper = {
  get<T>(key: string, defaultValue: T): T {
    try {
      // Use secure getter with integrity check
      return secureGetItem(key, defaultValue)
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    try {
      // Use secure setter with checksum
      const success = secureSetItem(key, value)
      if (!success) {
        console.error('[TieredStorage] Failed to save to localStorage')
      }
    } catch (error) {
      console.error('[TieredStorage] Failed to save to localStorage:', error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore
    }
  },
}

/**
 * Sync Queue Management
 */
const syncQueue = {
  get(): SyncQueueItem[] {
    return localStorageHelper.get<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, [])
  },

  add(item: SyncQueueItem): void {
    const queue = this.get()
    queue.push(item)
    localStorageHelper.set(STORAGE_KEYS.SYNC_QUEUE, queue)
  },

  remove(id: string): void {
    const queue = this.get().filter((item) => item.id !== id)
    localStorageHelper.set(STORAGE_KEYS.SYNC_QUEUE, queue)
  },

  clear(): void {
    localStorageHelper.set(STORAGE_KEYS.SYNC_QUEUE, [])
  },
}

/**
 * TieredStorageService Class
 * Main service for managing tiered storage
 */
export class TieredStorageService {
  private userId: string | null = null
  private isSyncing = false
  private syncListeners: Set<(status: SyncStatus) => void> = new Set()
  private historyChangeListeners: Set<(event: HistoryChangeEvent) => void> = new Set()

  /**
   * Set the current user ID (call on auth state change)
   */
  setUser(userId: string | null): void {
    const previousUserId = this.userId
    this.userId = userId

    // If user just logged in, trigger migration and sync
    if (userId && !previousUserId) {
      this.migrateLocalDataToCloud().then(() => {
        this.syncToCloud()
      })
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.userId !== null
  }

  /**
   * Get all history records for a mode
   * @param mode - Timer mode to get history for
   * @param forceCloud - Force fetch from Supabase instead of using cache (default: false)
   */
  async getHistory(mode: TimerMode, forceCloud: boolean = false): Promise<TimerHistoryRecord[]> {
    const storageKey = getStorageKey(mode)
    const localHistory = localStorageHelper.get<TimerHistoryRecord[]>(storageKey, [])

    // If not logged in, return local history only
    if (!this.userId) {
      return localHistory
    }

    // If logged in and not forcing cloud fetch, return local cache (fast path)
    // This is the optimization: trust the local cache for real-time updates
    if (!forceCloud) {
      return localHistory
    }

    // Only fetch from Supabase when explicitly requested (e.g., initial load, manual refresh)
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', this.userId)
        .eq('mode', mode)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[TieredStorage] Failed to fetch from Supabase:', error)
        return localHistory // Fallback to local
      }

      // Convert and merge with local (local takes precedence for offline changes)
      const cloudHistory = (data || []).map(fromSupabaseRow)
      
      // Update local cache
      localStorageHelper.set(storageKey, cloudHistory)

      return cloudHistory
    } catch (error) {
      console.error('[TieredStorage] Error fetching history:', error)
      return localHistory
    }
  }

  /**
   * Save a record to history
   */
  async saveRecord(record: TimerHistoryRecord): Promise<void> {
    const storageKey = getStorageKey(record.mode)

    // Always save to localStorage first (offline-first)
    const localHistory = localStorageHelper.get<TimerHistoryRecord[]>(storageKey, [])
    const newHistory = [record, ...localHistory].slice(0, 100) // Keep max 100 records locally
    localStorageHelper.set(storageKey, newHistory)

    // Notify history change listeners
    this.notifyHistoryChange({ mode: record.mode, action: 'save', recordId: record.id })

    // If logged in, also save to Supabase
    if (this.userId) {
      try {
        const { error } = await supabase
          .from(TABLE_NAME)
          .insert(toSupabaseRow(record, this.userId))

        if (error) {
          console.error('[TieredStorage] Failed to save to Supabase:', error)
          // Queue for later sync
          syncQueue.add({
            id: record.id,
            action: 'insert',
            record,
            timestamp: Date.now(),
          })
          this.notifyListeners()
        }
      } catch (error) {
        console.error('[TieredStorage] Error saving record:', error)
        // Queue for later sync
        syncQueue.add({
          id: record.id,
          action: 'insert',
          record,
          timestamp: Date.now(),
        })
        this.notifyListeners()
      }
    }
  }

  /**
   * Delete a record from history
   */
  async deleteRecord(recordId: string, mode: TimerMode): Promise<void> {
    const storageKey = getStorageKey(mode)

    // Remove from localStorage
    const localHistory = localStorageHelper.get<TimerHistoryRecord[]>(storageKey, [])
    const newHistory = localHistory.filter((r) => r.id !== recordId)
    localStorageHelper.set(storageKey, newHistory)

    // Notify history change listeners
    this.notifyHistoryChange({ mode, action: 'delete', recordId })

    // If logged in, also delete from Supabase
    if (this.userId) {
      try {
        const { error } = await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('user_id', this.userId)
          .eq('local_id', recordId)

        if (error) {
          console.error('[TieredStorage] Failed to delete from Supabase:', error)
          // Queue for later sync
          syncQueue.add({
            id: recordId,
            action: 'delete',
            timestamp: Date.now(),
          })
          this.notifyListeners()
        }
      } catch (error) {
        console.error('[TieredStorage] Error deleting record:', error)
        syncQueue.add({
          id: recordId,
          action: 'delete',
          timestamp: Date.now(),
        })
        this.notifyListeners()
      }
    }
  }

  /**
   * Clear all history for a mode
   */
  async clearHistory(mode: TimerMode): Promise<void> {
    const storageKey = getStorageKey(mode)

    // Clear localStorage
    localStorageHelper.set(storageKey, [])

    // Notify history change listeners
    this.notifyHistoryChange({ mode, action: 'clear' })

    // If logged in, also clear from Supabase
    if (this.userId) {
      try {
        const { error } = await supabase
          .from(TABLE_NAME)
          .delete()
          .eq('user_id', this.userId)
          .eq('mode', mode)

        if (error) {
          console.error('[TieredStorage] Failed to clear from Supabase:', error)
        }
      } catch (error) {
        console.error('[TieredStorage] Error clearing history:', error)
      }
    }
  }

  /**
   * Migrate local data to cloud on first login
   */
  async migrateLocalDataToCloud(): Promise<void> {
    if (!this.userId) return

    // Check if migration already done for this user
    const migrationKey = `${STORAGE_KEYS.MIGRATION_DONE}-${this.userId}`
    if (localStorageHelper.get(migrationKey, false)) {
      console.log('[TieredStorage] Migration already done for this user')
      return
    }

    console.log('[TieredStorage] Starting migration of local data to cloud...')

    const modes: TimerMode[] = ['Stopwatch', 'Countdown', 'Intervals']
    let totalMigrated = 0

    for (const mode of modes) {
      const storageKey = getStorageKey(mode)
      const localHistory = localStorageHelper.get<TimerHistoryRecord[]>(storageKey, [])

      if (localHistory.length === 0) continue

      // Get existing cloud records to avoid duplicates
      const { data: existingRecords } = await supabase
        .from(TABLE_NAME)
        .select('local_id')
        .eq('user_id', this.userId)
        .eq('mode', mode)

      const existingIds = new Set((existingRecords || []).map((r) => r.local_id))

      // Filter out records that already exist in cloud
      const recordsToMigrate = localHistory.filter((r) => !existingIds.has(r.id))

      if (recordsToMigrate.length === 0) continue

      // Insert in batches
      const batchSize = 50
      for (let i = 0; i < recordsToMigrate.length; i += batchSize) {
        const batch = recordsToMigrate.slice(i, i + batchSize)
        const rows = batch.map((r) => toSupabaseRow(r, this.userId!))

        const { error } = await supabase.from(TABLE_NAME).insert(rows)

        if (error) {
          console.error('[TieredStorage] Migration batch error:', error)
        } else {
          totalMigrated += batch.length
        }
      }
    }

    // Mark migration as done
    localStorageHelper.set(migrationKey, true)
    console.log(`[TieredStorage] Migration complete. Migrated ${totalMigrated} records.`)
  }

  /**
   * Sync pending changes to cloud
   */
  async syncToCloud(): Promise<void> {
    if (!this.userId || this.isSyncing) return

    const queue = syncQueue.get()
    if (queue.length === 0) return

    this.isSyncing = true
    this.notifyListeners()

    console.log(`[TieredStorage] Syncing ${queue.length} pending changes...`)

    for (const item of queue) {
      try {
        if (item.action === 'insert' && item.record) {
          const { error } = await supabase
            .from(TABLE_NAME)
            .upsert(toSupabaseRow(item.record, this.userId), {
              onConflict: 'user_id,local_id',
            })

          if (!error) {
            syncQueue.remove(item.id)
          }
        } else if (item.action === 'delete') {
          const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('user_id', this.userId)
            .eq('local_id', item.id)

          if (!error) {
            syncQueue.remove(item.id)
          }
        }
      } catch (error) {
        console.error('[TieredStorage] Sync error for item:', item.id, error)
      }
    }

    // Update last sync time
    localStorageHelper.set(STORAGE_KEYS.LAST_SYNC, Date.now())

    this.isSyncing = false
    this.notifyListeners()
    console.log('[TieredStorage] Sync complete')
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: localStorageHelper.get<number | null>(STORAGE_KEYS.LAST_SYNC, null),
      pendingChanges: syncQueue.get().length,
      error: null,
    }
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(callback)
    return () => {
      this.syncListeners.delete(callback)
    }
  }

  /**
   * Subscribe to history changes
   */
  onHistoryChange(callback: (event: HistoryChangeEvent) => void): () => void {
    this.historyChangeListeners.add(callback)
    return () => {
      this.historyChangeListeners.delete(callback)
    }
  }

  private notifyListeners(): void {
    const status = this.getSyncStatus()
    this.syncListeners.forEach((cb) => cb(status))
  }

  private notifyHistoryChange(event: HistoryChangeEvent): void {
    this.historyChangeListeners.forEach((cb) => cb(event))
  }

  /**
   * Force a full refresh from cloud
   */
  async refreshFromCloud(): Promise<void> {
    if (!this.userId) return

    const modes: TimerMode[] = ['Stopwatch', 'Countdown', 'Intervals']

    for (const mode of modes) {
      await this.getHistory(mode) // This updates local cache
    }
  }
}

// Export singleton instance
export const tieredStorage = new TieredStorageService()

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[TieredStorage] Back online, syncing...')
    tieredStorage.syncToCloud()
  })
}
