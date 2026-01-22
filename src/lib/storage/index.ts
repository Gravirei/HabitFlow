/**
 * Storage Module
 * 
 * Exports tiered storage service and hooks for managing
 * timer history with localStorage + Supabase sync
 */

export { tieredStorage, TieredStorageService } from './tieredStorage'
export type { SyncQueueItem, SyncStatus } from './tieredStorage'

export { useTieredStorage, useAllTimerHistory } from './useTieredStorage'
