/**
 * Timeline Page
 * Visual timeline view of all timer sessions
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { TimelineView } from '@/features/timer/components/sidebar/timeline'

export function Timeline() {
  const navigate = useNavigate()

  // Load timer history from localStorage
  const [rawStopwatchHistory] = useLocalStorage<any[]>('timer-stopwatch-history', [])
  const [rawCountdownHistory] = useLocalStorage<any[]>('timer-countdown-history', [])
  const [rawIntervalsHistory] = useLocalStorage<any[]>('timer-intervals-history', [])

  // Ensure history values are always arrays to prevent "not iterable" errors
  const stopwatchHistory = useMemo(
    () => (Array.isArray(rawStopwatchHistory) ? rawStopwatchHistory : []),
    [rawStopwatchHistory]
  )
  const countdownHistory = useMemo(
    () => (Array.isArray(rawCountdownHistory) ? rawCountdownHistory : []),
    [rawCountdownHistory]
  )
  const intervalsHistory = useMemo(
    () => (Array.isArray(rawIntervalsHistory) ? rawIntervalsHistory : []),
    [rawIntervalsHistory]
  )

  // Combine all sessions
  const allSessions = useMemo(() => {
    return [...stopwatchHistory, ...countdownHistory, ...intervalsHistory].sort(
      (a, b) => b.timestamp - a.timestamp
    )
  }, [stopwatchHistory, countdownHistory, intervalsHistory])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#1E1E24]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            {/* Title */}
            <div className="flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white">
                <span className="material-symbols-outlined text-[28px] text-primary">timeline</span>
                Timeline View
              </h1>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Visual timeline of your timer sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl px-4 py-6"
      >
        <TimelineView sessions={allSessions} />
      </motion.div>
    </div>
  )
}
