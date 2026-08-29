/**
 * Create Template Modal
 * Form to create new session templates
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTemplateStore } from '@/features/timer/store/templateStore'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTemplateModal({ isOpen, onClose }: CreateTemplateModalProps) {
  const { addTemplate } = useTemplateStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'Stopwatch' | 'Countdown' | 'Intervals'>('Countdown')
  const [countdownDuration, setCountdownDuration] = useState(1500) // 25 min default
  const [workDuration, setWorkDuration] = useState(1500)
  const [breakDuration, setBreakDuration] = useState(300)
  const [targetLoops, setTargetLoops] = useState(4)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addTemplate({
      name,
      description,
      mode,
      ...(mode === 'Countdown' && { countdownDuration }),
      ...(mode === 'Intervals' && { workDuration, breakDuration, targetLoops }),
    })

    // Reset form
    setName('')
    setDescription('')
    setMode('Countdown')
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-[60] mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Create Template</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Pomodoro Focus"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Timer Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Stopwatch', 'Countdown', 'Intervals'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          mode === m
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode-specific settings */}
                {mode === 'Countdown' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={countdownDuration}
                      onChange={(e) => setCountdownDuration(Number(e.target.value))}
                      min="1"
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {mode === 'Intervals' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Work (sec)
                        </label>
                        <input
                          type="number"
                          value={workDuration}
                          onChange={(e) => setWorkDuration(Number(e.target.value))}
                          min="1"
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Break (sec)
                        </label>
                        <input
                          type="number"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(Number(e.target.value))}
                          min="1"
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Target Loops
                      </label>
                      <input
                        type="number"
                        value={targetLoops}
                        onChange={(e) => setTargetLoops(Number(e.target.value))}
                        min="1"
                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 bg-slate-50 px-6 py-4 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-slate-200 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Template
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
