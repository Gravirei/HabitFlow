/**
 * useTieredStorage Hook
 * 
 * React hook for using the tiered storage service
 * Automatically syncs with auth state and provides reactive updates
 */

import { useEffect, useState, useCallback, useRef, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { tieredStorage, type SyncStatus } from './tieredStorage'
import type { TimerHistoryRecord, TimerMode } from '@/components/timer/types/timer.types'
import type { User } from '@supabase/supabase-js'

/**
 * Safe auth hook that doesn't throw when used outside AuthProvider
 * Returns null user when not in AuthProvider context
 */
function useSafeAuth(): { user: User | null; isLoading: boolean } {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}

interface UseTieredStorageReturn {
  // History management
  history: TimerHistoryRecord[]
  isLoading: boolean
  saveRecord: (record: TimerHistoryRecord) => Promise<void>
  deleteRecord: (recordId: string) => Promise<void>
  clearHistory: () => Promise<void>
  refreshHistory: () => Promise<void>
  
  // Sync status
  syncStatus: SyncStatus
  isLoggedIn: boolean
  
  // Manual sync trigger
  syncNow: () => Promise<void>
}

/**
 * Hook for managing timer history with tiered storage
 * 
 * @param mode - The timer mode (Stopwatch, Countdown, Intervals)
 * @returns Object with history data and management functions
 * 
 * @example
 * ```tsx
 * const { history, saveRecord, isLoggedIn, syncStatus } = useTieredStorage('Stopwatch')
 * 
 * // Save a new record
 * await saveRecord({
 *   id: generateUUID(),
 *   mode: 'Stopwatch',
 *   duration: 300,
 *   timestamp: Date.now()
 * })
 * ```
 */
export function useTieredStorage(mode: TimerMode): UseTieredStorageReturn {
  const { user, isLoading: isAuthLoading } = useSafeAuth()
  const [history, setHistory] = useState<TimerHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(tieredStorage.getSyncStatus())
  
  // Track if this is the initial mount
  const isInitialMount = useRef(true)
  const previousUserId = useRef<string | null>(null)

  // Update tiered storage when auth state changes
  useEffect(() => {
    const userId = user?.id || null
    
    // Only update if user ID actually changed
    if (userId !== previousUserId.current) {
      previousUserId.current = userId
      tieredStorage.setUser(userId)
    }
  }, [user])

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = tieredStorage.onSyncStatusChange(setSyncStatus)
    return unsubscribe
  }, [])

  // Subscribe to history changes and refresh when relevant changes occur
  useEffect(() => {
    const unsubscribe = tieredStorage.onHistoryChange(async (event) => {
      // Only refresh if the change is for our mode
      if (event.mode === mode) {
        const data = await tieredStorage.getHistory(mode)
        setHistory(data)
      }
    })
    return unsubscribe
  }, [mode])

  // Load history on mount and when user/mode changes
  useEffect(() => {
    const loadHistory = async () => {
      // Wait for auth to finish loading
      if (isAuthLoading) return

      setIsLoading(true)
      try {
        const data = await tieredStorage.getHistory(mode)
        setHistory(data)
      } catch (error) {
        console.error('[useTieredStorage] Error loading history:', error)
        setHistory([])
      } finally {
        setIsLoading(false)
        isInitialMount.current = false
      }
    }

    loadHistory()
  }, [mode, user?.id, isAuthLoading])

  /**
   * Save a record to history
   */
  const saveRecord = useCallback(async (record: TimerHistoryRecord) => {
    // Optimistically update local state
    setHistory((prev) => [record, ...prev].slice(0, 100))

    // Save to tiered storage
    await tieredStorage.saveRecord(record)
  }, [])

  /**
   * Delete a record from history
   */
  const deleteRecord = useCallback(async (recordId: string) => {
    // Optimistically update local state
    setHistory((prev) => prev.filter((r) => r.id !== recordId))

    // Delete from tiered storage
    await tieredStorage.deleteRecord(recordId, mode)
  }, [mode])

  /**
   * Clear all history for this mode
   */
  const clearHistory = useCallback(async () => {
    // Optimistically update local state
    setHistory([])

    // Clear from tiered storage
    await tieredStorage.clearHistory(mode)
  }, [mode])

  /**
   * Refresh history from storage
   */
  const refreshHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await tieredStorage.getHistory(mode)
      setHistory(data)
    } catch (error) {
      console.error('[useTieredStorage] Error refreshing history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [mode])

  /**
   * Manually trigger sync to cloud
   */
  const syncNow = useCallback(async () => {
    await tieredStorage.syncToCloud()
    await refreshHistory()
  }, [refreshHistory])

  return {
    history,
    isLoading: isLoading || isAuthLoading,
    saveRecord,
    deleteRecord,
    clearHistory,
    refreshHistory,
    syncStatus,
    isLoggedIn: !!user,
    syncNow,
  }
}

/**
 * Hook to get all history across all modes
 * Useful for premium history view
 */
export function useAllTimerHistory() {
  const { user, isLoading: isAuthLoading } = useSafeAuth()
  const [allHistory, setAllHistory] = useState<TimerHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(tieredStorage.getSyncStatus())

  // Update tiered storage when auth state changes
  useEffect(() => {
    tieredStorage.setUser(user?.id || null)
  }, [user])

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = tieredStorage.onSyncStatusChange(setSyncStatus)
    return unsubscribe
  }, [])

  // Load all history
  useEffect(() => {
    const loadAllHistory = async () => {
      if (isAuthLoading) return

      setIsLoading(true)
      try {
        const [stopwatch, countdown, intervals] = await Promise.all([
          tieredStorage.getHistory('Stopwatch'),
          tieredStorage.getHistory('Countdown'),
          tieredStorage.getHistory('Intervals'),
        ])

        // Combine and sort by timestamp (newest first)
        const combined = [...stopwatch, ...countdown, ...intervals].sort(
          (a, b) => b.timestamp - a.timestamp
        )
        setAllHistory(combined)
      } catch (error) {
        console.error('[useAllTimerHistory] Error loading history:', error)
        setAllHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAllHistory()
  }, [user?.id, isAuthLoading])

  const refreshHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const [stopwatch, countdown, intervals] = await Promise.all([
        tieredStorage.getHistory('Stopwatch'),
        tieredStorage.getHistory('Countdown'),
        tieredStorage.getHistory('Intervals'),
      ])

      const combined = [...stopwatch, ...countdown, ...intervals].sort(
        (a, b) => b.timestamp - a.timestamp
      )
      setAllHistory(combined)
    } catch (error) {
      console.error('[useAllTimerHistory] Error refreshing history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const syncNow = useCallback(async () => {
    await tieredStorage.syncToCloud()
    await refreshHistory()
  }, [refreshHistory])

  return {
    history: allHistory,
    isLoading: isLoading || isAuthLoading,
    refreshHistory,
    syncStatus,
    isLoggedIn: !!user,
    syncNow,
  }
}
