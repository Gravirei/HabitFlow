// @ts-nocheck
/**
 * Clear History Confirmation Modal
 * Warns user before clearing all history data
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ClearHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  sessionCount: number
}

export function ClearHistoryModal({
  isOpen,
  onClose,
  onConfirm,
  sessionCount,
}: ClearHistoryModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.99] }}
              className="pointer-events-auto w-full max-w-lg"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/70">
                {/* Ambient glow */}
                <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 opacity-60 blur-2xl" />

                {/* Warning pulse effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 top-0 h-1 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                />

                {/* Header */}
                <div className="border-b border-slate-200/60 bg-gradient-to-br from-red-50/30 via-transparent to-transparent px-8 py-6 dark:border-slate-700/60 dark:from-red-900/10">
                  <div className="flex items-center gap-5">
                    {/* Animated Warning Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative"
                    >
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/30">
                        <span className="material-symbols-outlined text-3xl text-white">
                          warning
                        </span>
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 rounded-2xl bg-red-500"
                      />
                    </motion.div>

                    {/* Title */}
                    <div className="flex-1">
                      <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-1 text-2xl font-bold text-slate-900 dark:text-white"
                      >
                        Clear All History?
                      </motion.h2>
                      <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-slate-500 dark:text-slate-400"
                      >
                        This action cannot be undone
                      </motion.p>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={onClose}
                      className="group flex size-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                    >
                      <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                        close
                      </span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white/60 p-6 shadow-xl dark:border-slate-700/60 dark:from-slate-800/80 dark:to-slate-900/60"
                  >
                    {/* Warning badge */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500">error</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        PERMANENT ACTION
                      </span>
                    </div>

                    <p className="mb-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      You are about to permanently delete{' '}
                      <motion.span
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="font-bold text-red-600 dark:text-red-400"
                      >
                        {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                      </motion.span>{' '}
                      from your history. This will remove all timer records including:
                    </p>

                    <ul className="mb-5 space-y-3">
                      {[
                        { icon: 'timer', label: 'All stopwatch sessions' },
                        { icon: 'hourglass_empty', label: 'All countdown timers' },
                        { icon: 'update', label: 'All interval sessions' },
                        { icon: 'history', label: 'All session history & notes' },
                      ].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <div className="flex size-6 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                            <span className="material-symbols-outlined text-base text-red-500">
                              close
                            </span>
                          </div>
                          <span>{item.label}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-orange-50/90 p-4 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-orange-900/20"
                    >
                      <p className="flex items-start gap-3 text-sm font-medium text-amber-800 dark:text-amber-200">
                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-amber-600 dark:text-amber-400">
                          lightbulb
                        </span>
                        <span>
                          <strong>Pro tip:</strong> Consider exporting your data before clearing to
                          keep a backup of your valuable timer history.
                        </span>
                      </p>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Actions */}
                <div className="bg-gradient-to-t from-slate-50/50 via-transparent to-transparent px-8 py-6 pt-0 dark:from-slate-900/50">
                  <div className="flex gap-3">
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={onClose}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 rounded-xl border border-slate-200/60 bg-white/80 px-5 py-3.5 text-sm font-bold text-slate-700 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={handleConfirm}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-500/30 transition-all duration-300 hover:from-red-700 hover:via-red-600 hover:to-red-700"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Button content */}
                      <div className="relative flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">delete</span>
                        <span>Clear All History</span>
                      </div>

                      {/* Warning pulse */}
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 rounded-xl border-2 border-white/30"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
