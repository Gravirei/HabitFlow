import { useEffect, useRef, useCallback } from 'react'
import { getLocalToday } from '@/utils/dateUtils'

/**
 * Detects when the calendar day changes (midnight rollover).
 * Uses two strategies:
 *   1. visibilitychange — fires when user returns to the app/tab
 *   2. setInterval — polls every 60s as a fallback for always-open tabs
 *
 * Calls the provided callback whenever a new day is detected.
 */
export function useDayChangeDetector(onDayChange: () => void) {
  const lastCheckedDate = useRef<string>(getLocalToday())

  const checkDayChange = useCallback(() => {
    const currentDate = getLocalToday()
    if (currentDate !== lastCheckedDate.current) {
      lastCheckedDate.current = currentDate
      onDayChange()
    }
  }, [onDayChange])

  useEffect(() => {
    // Strategy 1: Check on visibility change (tab focus / app resume)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDayChange()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Strategy 2: Poll every 60 seconds (fallback for always-visible tabs)
    const interval = setInterval(checkDayChange, 60_000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [checkDayChange])
}
