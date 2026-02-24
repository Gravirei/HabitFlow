import { supabase } from '@/lib/supabase'

export interface LogoutOptions {
  logoutAllDevices?: boolean
  clearLocalData?: boolean
}

/**
 * Signs out the current user.
 *
 * Note: supabase-js clears its own session storage when signing out.
 * We additionally clear common app storage keys as a defense-in-depth.
 * 
 * @param options - Optional logout configuration
 * @param options.logoutAllDevices - If true, terminates all sessions across devices
 * @param options.clearLocalData - If true, clears all local storage data
 */
export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { logoutAllDevices = false, clearLocalData = false } = options

  // Sign out from Supabase
  // Use 'global' scope to sign out from all devices if requested
  const { error } = await supabase.auth.signOut({
    scope: logoutAllDevices ? 'global' : 'local'
  })
  if (error) throw error

  // Clear local data if requested
  if (clearLocalData) {
    try {
      // Clear all localStorage except critical system items
      const keysToPreserve = ['theme'] // Preserve theme preference
      const allKeys = Object.keys(localStorage)
      
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key)
        }
      })

      // Clear sessionStorage
      sessionStorage.clear()

      // Clear IndexedDB databases (if any)
      if ('indexedDB' in window) {
        const databases = await window.indexedDB.databases?.()
        databases?.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name)
          }
        })
      }
    } catch {
      // Ignore cleanup errors
    }
  } else {
    // Default cleanup (safe even if keys don't exist)
    try {
      // If you later store additional auth-related items, clear them here
      localStorage.removeItem('habitflow_device_id')
    } catch {
      // ignore
    }
  }
}
