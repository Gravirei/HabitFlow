/**
 * Create Goal Modal
 * Modal for creating new goals
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { addDays, addWeeks, addMonths } from 'date-fns'
import type { GoalType, GoalPeriod, TimerMode } from './types'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGoal: (goal: {
    type: GoalType
    target: number
    period: GoalPeriod
    mode?: TimerMode
    name: string
    description?: string
    startDate: Date
    endDate: Date
  }) => void
}

export function CreateGoalModal({ isOpen, onClose, onCreateGoal }: CreateGoalModalProps) {
  const [goalType, setGoalType] = useState<GoalType>('time')
  const [period, setPeriod] = useState<GoalPeriod>('weekly')
  const [target, setTarget] = useState<number>(10)
  const [mode, setMode] = useState<TimerMode | undefined>()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string>('')

  const goalTypes = [
    { id: 'time' as GoalType, name: 'Total Time', icon: 'schedule', description: 'Track total time spent', unit: 'hours' },
    { id: 'sessions' as GoalType, name: 'Sessions', icon: 'event_repeat', description: 'Number of completed sessions', unit: 'sessions' },
    { id: 'streak' as GoalType, name: 'Streak', icon: 'local_fire_department', description: 'Consecutive days active', unit: 'days' },
    { id: 'mode-specific' as GoalType, name: 'Mode Specific', icon: 'tune', description: 'Track specific timer mode', unit: 'sessions' },
  ]

  const periods = [
    { id: 'daily' as GoalPeriod, name: 'Daily', icon: 'today' },
    { id: 'weekly' as GoalPeriod, name: 'Weekly', icon: 'date_range' },
    { id: 'monthly' as GoalPeriod, name: 'Monthly', icon: 'calendar_month' },
  ]

  const modes: TimerMode[] = ['Stopwatch', 'Countdown', 'Intervals']

  const calculateEndDate = () => {
    const start = new Date()
    switch (period) {
      case 'daily': return addDays(start, 1)
      case 'weekly': return addWeeks(start, 1)
      case 'monthly': return addMonths(start, 1)
      default: return addWeeks(start, 1)
    }
  }

  const generateGoalName = () => {
    if (name) return name

    const typeLabel = goalTypes.find(t => t.id === goalType)?.name
    const periodLabel = period
    const targetStr = goalType === 'time' ? `${target}h` : target

    return `${periodLabel} ${typeLabel}: ${targetStr}`
  }

  const handleSubmit = () => {
    // Clear previous errors
    setError('')

    if (!name.trim()) {
      setError('Please enter a goal name')
      return
    }

    if (target <= 0) {
      setError('Target must be greater than 0')
      return
    }

    if (goalType === 'mode-specific' && !mode) {
      setError('Please select a timer mode')
      return
    }

    const targetValue = goalType === 'time' ? target * 3600 : target // Convert hours to seconds for time goals

    onCreateGoal({
      type: goalType,
      target: targetValue,
      period,
      mode: goalType === 'mode-specific' ? mode : undefined,
      name: generateGoalName(),
      description: description.trim() || undefined,
      startDate: new Date(),
      endDate: calculateEndDate(),
    })

    // Reset form
    setName('')
    setDescription('')
    setTarget(10)
    setGoalType('time')
    setPeriod('weekly')
    setMode(undefined)
    setError('')
    onClose()
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Backdrop with animated gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-xl"
        />

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-goal-title"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Container - Card Design */}
          <div className="relative bg-gradient-to-b from-slate-800/50 to-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1">
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-violet-500/20 to-pink-500/20 opacity-50" style={{ padding: '2px' }}>
              <div className="w-full h-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-3xl" />
            </div>

            {/* Header - Sticky */}
            <div className="relative p-5 pb-3 flex-shrink-0">
              {/* Header Section */}
              <div className="text-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-pink-400/30 mb-3"
                >
                  <span className="material-symbols-outlined text-3xl text-pink-400">flag</span>
                </motion.div>
                <motion.h2
                  id="create-goal-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-white mb-1 tracking-tight"
                >
                  Create New Goal
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 font-medium text-sm"
                >
                  Set your target and start tracking progress
                </motion.p>
                <button
                  onClick={handleClose}
                  className="absolute top-0 right-0 size-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:border-white/20"
                >
                  <span className="material-symbols-outlined text-[20px] text-white/70">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="relative flex-1 overflow-y-auto p-6 pb-0">
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 mb-4"
                  >
                    <span className="material-symbols-outlined text-red-400 text-[22px] mt-0.5">error</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-300">{error}</p>
                    </div>
                    <button
                      onClick={() => setError('')}
                      className="size-6 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                      aria-label="Dismiss error"
                    >
                      <span className="material-symbols-outlined text-red-400 text-[16px]">close</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Goal Type Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-pink-400 to-violet-600 rounded-full" />
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Goal Type
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {goalTypes.map((type, index) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        onClick={() => setGoalType(type.id)}
                        className={`
                          group relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden
                          ${goalType === type.id
                            ? 'border-pink-400/60 bg-gradient-to-r from-pink-500/10 to-violet-500/10 shadow-lg shadow-pink-500/10'
                            : 'border-white/10 hover:border-pink-400/30 bg-white/5'
                          }
                        `}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                          <span className={`material-symbols-outlined text-[32px] mb-3 block ${goalType === type.id ? 'text-pink-400' : 'text-white/70'}`}>
                            {type.icon}
                          </span>
                          <div className="font-bold text-base text-white mb-1">{type.name}</div>
                          <div className="text-xs text-white/60">{type.description}</div>
                        </div>

                        {goalType === type.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3"
                          >
                            <span className="material-symbols-outlined text-pink-400 text-[20px]">check_circle</span>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Period Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-violet-400 to-purple-600 rounded-full" />
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Time Period
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {periods.map((p, index) => (
                      <motion.button
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        onClick={() => setPeriod(p.id)}
                        className={`
                          py-3 px-5 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2
                          ${period === p.id
                            ? 'border-violet-400/60 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/10'
                            : 'border-white/10 text-white/70 hover:border-violet-400/30 hover:bg-white/5'
                          }
                        `}
                      >
                        <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                        {p.name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Mode Selection (for mode-specific goals) */}
                <AnimatePresence>
                  {goalType === 'mode-specific' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-6 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full" />
                        <label className="text-sm font-bold text-white uppercase tracking-wider">
                          Timer Mode
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {modes.map((m, index) => (
                          <motion.button
                            key={m}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setMode(m)}
                            className={`
                              py-3 px-5 rounded-2xl border-2 transition-all font-bold text-sm
                              ${mode === m
                                ? 'border-purple-400/60 bg-purple-500/10 text-purple-300'
                                : 'border-white/10 text-white/70 hover:border-purple-400/30 hover:bg-white/5'
                              }
                            `}
                          >
                            {m}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Target Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Target ({goalTypes.find(t => t.id === goalType)?.unit})
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-white/10 bg-slate-800/50 text-white font-bold text-2xl focus:border-pink-400/50 focus:outline-none backdrop-blur-sm transition-all hover:border-white/20"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
                      {goalTypes.find(t => t.id === goalType)?.unit}
                    </div>
                  </div>
                </motion.div>

                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full" />
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Goal Name
                    </label>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={generateGoalName()}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-white/10 bg-slate-800/50 text-white font-medium text-lg focus:border-pink-400/50 focus:outline-none backdrop-blur-sm transition-all hover:border-white/20"
                  />
                </motion.div>

                {/* Description Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full" />
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Description (Optional)
                    </label>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a note about this goal..."
                    rows={3}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-white/10 bg-slate-800/50 text-white font-medium text-base focus:border-pink-400/50 focus:outline-none resize-none backdrop-blur-sm transition-all hover:border-white/20"
                  />
                </motion.div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="sticky bottom-0 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-xl border-t border-white/10 p-5 flex gap-3 flex-shrink-0"
            >
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all border border-white/10 hover:border-white/20 text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-violet-500 to-purple-600 hover:from-pink-400 hover:via-violet-400 hover:to-purple-500 transition-all border border-pink-400/30 hover:shadow-xl hover:shadow-pink-500/20 text-base relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">add</span>
                  Create Goal
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
