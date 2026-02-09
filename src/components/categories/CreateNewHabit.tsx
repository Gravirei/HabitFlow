import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { useHabitStore } from '@/store/useHabitStore'
import { IconPicker } from './IconPicker'

interface CreateNewHabitProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName: string
}

type FrequencyType = 'daily' | 'weekly' | 'monthly'
type GoalPeriodType = 'day' | 'week' | 'month'

const frequencyOptions: { value: FrequencyType; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: 'today' },
  { value: 'weekly', label: 'Weekly', icon: 'date_range' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
]

const goalPeriodOptions: { value: GoalPeriodType; label: string }[] = [
  { value: 'day', label: 'per day' },
  { value: 'week', label: 'per week' },
  { value: 'month', label: 'per month' },
]

export function CreateNewHabit({ isOpen, onClose, categoryId, categoryName }: CreateNewHabitProps) {
  const { addHabit } = useHabitStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('check_circle')
  const [frequency, setFrequency] = useState<FrequencyType>('daily')
  const [goal, setGoal] = useState('1')
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriodType>('day')

  const [error, setError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setName('')
    setDescription('')
    setIcon('check_circle')
    setFrequency('daily')
    setGoal('1')
    setGoalPeriod('day')
    setError(undefined)
    setIsSubmitting(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Habit name is required')
      return
    }

    const goalNumber = parseInt(goal, 10)
    if (isNaN(goalNumber) || goalNumber < 1) {
      setError('Goal must be at least 1')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate async operation for smooth animation
      await new Promise((resolve) => setTimeout(resolve, 400))

      addHabit({
        name: trimmedName,
        description: description.trim() || undefined,
        icon,
        frequency,
        goal: goalNumber,
        goalPeriod,
        reminderEnabled: false,
        reminderTime: undefined,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        categoryId,
      })

      toast.success('🎉 Habit created successfully!')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey && !isSubmitting && name.trim()) {
      handleSubmit(e as any)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/5 dark:bg-gray-950/90 md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Panel - Preview */}
          <div className="hidden w-64 flex-shrink-0 border-r border-gray-200/50 bg-gray-50/80 p-6 backdrop-blur-xl dark:border-white/5 dark:bg-white/5 md:block">
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-symbols-outlined text-3xl text-white">add_circle</span>
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-white">New Habit</h3>
                <p className="text-sm text-gray-400">{categoryName}</p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gray-500">visibility</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Preview</p>
              </div>

              <motion.div
                layout
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-sm backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xl text-white">{icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white">
                      {name || 'Habit Name'}
                    </h3>
                    {description && (
                      <p className="mt-0.5 truncate text-xs text-white/70">{description}</p>
                    )}
                    <p className="mt-1 text-xs text-white/60">
                      {goal} {goal === '1' ? 'time' : 'times'} {goalPeriodOptions.find(p => p.value === goalPeriod)?.label}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Frequency Badge */}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gray-500">
                  {frequencyOptions.find(f => f.value === frequency)?.icon}
                </span>
                <span className="text-xs text-gray-400 capitalize">{frequency}</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Habit</h2>
                <p className="text-sm text-gray-400">for {categoryName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Habit Name *
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError(undefined)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Morning Meditation"
                    maxLength={100}
                    disabled={isSubmitting}
                    className={clsx(
                      'w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 disabled:opacity-50',
                      error
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-white/10 focus:border-primary focus:ring-primary/20'
                    )}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                    <span className="ml-auto text-xs text-gray-500">
                      {name.length}/100
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why is this habit important to you?"
                    rows={3}
                    maxLength={200}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                  <span className="mt-1 block text-xs text-gray-500 text-right">
                    {description.length}/200
                  </span>
                </div>

                {/* Icon and Frequency Row */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Icon */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Icon
                    </label>
                    <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
                        <span className="text-sm text-gray-300">{icon}</span>
                      </div>
                      <IconPicker value={icon} onChange={setIcon} />
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Frequency *
                    </label>
                    <div className="space-y-2">
                      {frequencyOptions.map((opt) => (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => setFrequency(opt.value)}
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={clsx(
                            'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all disabled:opacity-50',
                            frequency === opt.value
                              ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20'
                              : 'border-white/10 bg-slate-800/50 text-gray-300 hover:border-white/20 hover:bg-slate-800/70'
                          )}
                        >
                          <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                          <span className="text-sm font-semibold">{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Goal and Goal Period */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Goal */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Goal *
                    </label>
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      min="1"
                      max="100"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    />
                  </div>

                  {/* Goal Period */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Goal Period *
                    </label>
                    <select
                      value={goalPeriod}
                      onChange={(e) => setGoalPeriod(e.target.value as GoalPeriodType)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      {goalPeriodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className={clsx(
                  'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200',
                  name.trim() && !isSubmitting
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95'
                    : 'cursor-not-allowed bg-white/10 text-gray-500'
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check</span>
                    Create Habit
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
