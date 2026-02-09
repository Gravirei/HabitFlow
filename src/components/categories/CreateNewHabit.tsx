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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-md"
        />

        {/* Modal Container - Single Column, Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="relative z-10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Header Card */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-3xl text-slate-900 font-bold">add_circle</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">New Habit</h2>
                  <p className="text-sm text-slate-400">in <span className="text-primary font-semibold">{categoryName}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl backdrop-blur-2xl"
          >

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-5">
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

                {/* Icon Picker */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Icon
                  </label>
                  <div className="rounded-2xl border border-white/10 bg-slate-800/30 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-400/20">
                        <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-300">{icon}</span>
                    </div>
                    <IconPicker value={icon} onChange={setIcon} />
                  </div>
                </div>

                {/* Frequency Selector - Modern Pills */}
                <div>
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Frequency *
                  </label>
                  <div className="flex gap-3">
                    {frequencyOptions.map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setFrequency(opt.value)}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={clsx(
                          'flex flex-1 flex-col items-center gap-2 rounded-2xl border p-4 transition-all disabled:opacity-50',
                          frequency === opt.value
                            ? 'border-primary bg-gradient-to-br from-primary/20 to-emerald-400/20 shadow-lg shadow-primary/10'
                            : 'border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50'
                        )}
                      >
                        <span className={clsx(
                          'material-symbols-outlined text-3xl transition-colors',
                          frequency === opt.value ? 'text-primary' : 'text-gray-400'
                        )}>{opt.icon}</span>
                        <span className={clsx(
                          'text-xs font-bold transition-colors',
                          frequency === opt.value ? 'text-white' : 'text-gray-400'
                        )}>{opt.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Goal Section - Inline */}
                <div>
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Goal *
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/30 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        min="1"
                        max="100"
                        disabled={isSubmitting}
                        className="w-20 rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2 text-center text-lg font-bold text-white transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-400">{goal === '1' ? 'time' : 'times'}</span>
                    </div>
                    <select
                      value={goalPeriod}
                      onChange={(e) => setGoalPeriod(e.target.value as GoalPeriodType)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2 text-sm text-white transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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

            {/* Footer - Sticky Buttons */}
            <div className="sticky bottom-0 border-t border-white/10 bg-gradient-to-t from-slate-900 to-slate-900/95 p-6 backdrop-blur-xl">
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-800/50 px-6 py-3.5 text-sm font-bold text-gray-300 transition-all hover:bg-slate-800/70 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!name.trim() || isSubmitting}
                  whileHover={{ scale: name.trim() && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: name.trim() && !isSubmitting ? 0.98 : 1 }}
                  className={clsx(
                    'flex flex-[2] items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-200',
                    name.trim() && !isSubmitting
                      ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-[0_8px_30px_rgba(19,236,91,0.4)] hover:shadow-[0_12px_40px_rgba(19,236,91,0.5)]'
                      : 'cursor-not-allowed bg-slate-700/50 text-gray-500'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">rocket_launch</span>
                      Create Habit
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
