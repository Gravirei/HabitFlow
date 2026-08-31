/**
 * SyncOnAuthChange Component
 * Listens to auth state changes and triggers sync operations
 *
 * This component should be placed inside AuthProvider but doesn't render anything.
 * It handles:
 * - Triggering sync on login (if enabled)
 * - Starting/stopping auto-sync based on login state
 * - Graceful shutdown of auto-sync on page hide / unload (so the interval
 *   is cleared when the user leaves the app — avoids orphan timers and
 *   keeps battery and Supabase request budgets in check)
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useSyncStore } from '@/features/timer/store/syncStore'
import { tieredStorage } from '@/lib/storage'
import { useGracefulShutdown } from '@/hooks/useGracefulShutdown'

export function SyncOnAuthChange() {
  const { user } = useAuth()
  const { triggerSyncOnLogin, stopAutoSync } = useSyncStore()
  const previousUserId = useRef<string | null>(null)

  // Graceful shutdown — clear the auto-sync interval when the tab is hidden
  // or the page is unloading. Calling stopAutoSync() is a no-op if no
  // interval is active, so this is safe to wire unconditionally.
  useGracefulShutdown(() => {
    stopAutoSync()
  })

  useEffect(() => {
    const currentUserId = user?.id || null

    // Detect login (user went from null to having an id)
    if (currentUserId && !previousUserId.current) {
      console.log('[SyncOnAuthChange] User logged in, triggering sync on login')
      // Update tieredStorage with user
      tieredStorage.setUser(currentUserId)
      // Trigger sync on login
      triggerSyncOnLogin()
    }

    // Detect logout (user went from having an id to null)
    if (!currentUserId && previousUserId.current) {
      console.log('[SyncOnAuthChange] User logged out, stopping auto-sync')
      tieredStorage.setUser(null)
      stopAutoSync()
    }

    previousUserId.current = currentUserId
  }, [user, triggerSyncOnLogin, stopAutoSync])

  // This component doesn't render anything
  return null
}
