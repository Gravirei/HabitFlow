/**
 * Session Details Modal Component
 * Shows detailed information about a timer session
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { TimerSession } from '../types/session.types'

interface SessionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  session: TimerSession | null
  formatTime: (seconds: number) => string
}

export function SessionDetailsModal({
  isOpen,
  onClose,
  session,
  formatTime,
}: SessionDetailsModalProps) {
  if (!session) return null

  const sessionDate = new Date(session.timestamp)
  const endTime = new Date(session.timestamp + session.duration * 1000)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[80vh] max-w-md -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-surface-dark"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Session Details</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-gray-400">
                  close
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase text-slate-500 dark:text-gray-500">
                  Session Name
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {session.sessionName || session.mode}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase text-slate-500 dark:text-gray-500">
                  Duration
                </p>
                <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {formatTime(session.duration)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-slate-500 dark:text-gray-500">
                    Started
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                    {sessionDate.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-slate-500 dark:text-gray-500">
                    Ended
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                    {endTime.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {session.mode === 'Intervals' && session.intervalCount && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-slate-500 dark:text-gray-500">
                    Intervals Completed
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {session.intervalCount} loops
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 border-t border-slate-200 pt-6 dark:border-white/10">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-primary py-3 font-bold text-black transition-colors hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
