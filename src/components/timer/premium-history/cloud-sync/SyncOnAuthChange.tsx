/**
 * SyncOnAuthChange Component
 * Listens to auth state changes and triggers sync operations
 * 
 * This component should be placed inside AuthProvider but doesn't render anything.
 * It handles:
 * - Triggering sync on login (if enabled)
 * - Starting/stopping auto-sync based on login state
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useSyncStore } from './syncStore'
import { tieredStorage } from '@/lib/storage'

export function SyncOnAuthChange() {
  const { user } = useAuth()
  const { triggerSyncOnLogin, stopAutoSync, settings } = useSyncStore()
  const previousUserId = useRef<string | null>(null)

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
