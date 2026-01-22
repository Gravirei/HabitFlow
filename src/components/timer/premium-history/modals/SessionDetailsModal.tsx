/**
 * Session Details Modal Component
 * Shows detailed information about a timer session
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimerSession } from '../types/session.types'

interface SessionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  session: TimerSession | null
  formatTime: (seconds: number) => string
}

export function SessionDetailsModal({ isOpen, onClose, session, formatTime }: SessionDetailsModalProps) {
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Session Details
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-gray-400">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mb-1">Session Name</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{session.sessionName || session.mode}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mb-1">Duration</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatTime(session.duration)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mb-1">Started</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                    {sessionDate.toLocaleString([], { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mb-1">Ended</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                    {endTime.toLocaleString([], { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>

              {session.mode === 'Intervals' && session.intervalCount && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase mb-1">Intervals Completed</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{session.intervalCount} loops</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-colors"
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
