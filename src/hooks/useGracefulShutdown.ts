/**
 * useGracefulShutdown — runs the supplied cleanup on `beforeunload` (page
 * close / navigation) and `visibilitychange` (tab hidden).
 *
 * Use this for any long-running in-browser interval or subscription that
 * should pause when the user is not actively using the app:
 *   - Auto-sync timers
 *   - Live data pollers
 *   - WebSocket reconnects
 *
 * The cleanup runs once per event; subsequent registrations from the same
 * hook instance are deduped.
 *
 * Example:
 *   useEffect(() => {
 *     const id = setInterval(() => sync(), 30_000)
 *     return useGracefulShutdown(() => clearInterval(id))
 *   }, [])
 */
import { useEffect, useRef } from 'react'

export function useGracefulShutdown(cleanup: () => void): () => void {
  // Guard so we only attach the listener once per cleanup function.
  const attached = useRef(false)
  const cleanupRef = useRef(cleanup)
  cleanupRef.current = cleanup

  useEffect(() => {
    if (attached.current) return
    attached.current = true

    const run = () => {
      try {
        cleanupRef.current()
      } catch {
        // Shutdown must never throw — the page is going away.
      }
    }

    const onBeforeUnload = () => run()
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        run()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibility)
      attached.current = false
    }
  }, [])

  return cleanup
}
