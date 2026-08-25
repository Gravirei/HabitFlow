import { supabase } from '@/lib/supabase'

export interface LogoutOptions {
  logoutAllDevices?: boolean
  clearLocalData?: boolean
}

/**
 * Signs out the current user with atomic cleanup.
 *
 * Design principles:
 * 1. Server revocation ALWAYS runs first — even if it fails, local cleanup proceeds.
 * 2. Local storage is ALWAYS cleared (except preserved keys) — no partial state.
 * 3. IndexedDB cleanup is best-effort — failures are logged, not thrown.
 * 4. Hard redirect to /login only when clearLocalData is true.
 *
 * @param options - Optional logout configuration
 * @param options.logoutAllDevices - If true, terminates all sessions across devices
 * @param options.clearLocalData - If true, also clears IndexedDB and redirects to /login
 */
export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { logoutAllDevices = false, clearLocalData = false } = options

  // Step 1: Server-side revocation — always attempt, never block on failure
  try {
    await supabase.auth.signOut({
      scope: logoutAllDevices ? 'global' : 'local',
    })
  } catch (e) {
    console.error('signOut failed, proceeding with local cleanup', e)
  }

  // Step 2: Preserve keys that should survive logout
  const theme = localStorage.getItem('theme')

  // Step 3: Single-pass clear — no partial state windows
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    console.error('Storage clear failed', e)
  }

  // Step 4: Restore preserved keys
  if (theme) localStorage.setItem('theme', theme)

  // Step 5: IndexedDB — best effort, only when full clear requested
  if (clearLocalData) {
    await clearIndexedDB()

    // Step 6: Hard navigate to login (full page reload clears any in-memory state)
    window.location.href = '/login'
  }
}

async function clearIndexedDB(): Promise<void> {
  if (!('indexedDB' in window) || !indexedDB.databases) return
  try {
    const databases = await indexedDB.databases()
    await Promise.allSettled(
      databases.map(
        (db) =>
          new Promise<void>((resolve) => {
            if (!db.name) {
              resolve()
              return
            }
            const req = indexedDB.deleteDatabase(db.name)
            req.onsuccess = () => resolve()
            req.onerror = () => {
              console.error(`IndexedDB delete failed: ${db.name}`, req.error)
              resolve()
            }
          })
      )
    )
  } catch (e) {
    console.error('IndexedDB cleanup failed', e)
  }
}
