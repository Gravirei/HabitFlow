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
      await new Promise((resolve) => setTimeout(resolve, 300))

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
        isActive: false, // Habits are inactive by default
      })

      toast.success('🎉 Habit created!')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
      setIsSubmitting(false)
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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Habit</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{categoryName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(undefined)
                }}
                placeholder="e.g., Morning Exercise"
                maxLength={100}
                disabled={isSubmitting}
                className={clsx(
                  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white',
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-primary focus:ring-primary/20 dark:border-white/10'
                )}
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this important?"
                rows={2}
                maxLength={200}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Icon
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-800/50">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{icon}</span>
                </div>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Frequency *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    disabled={isSubmitting}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                      frequency === opt.value
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    )}
                  >
                    <span className={clsx(
                      'material-symbols-outlined text-2xl',
                      frequency === opt.value ? 'text-primary' : 'text-slate-400'
                    )}>{opt.icon}</span>
                    <span className={clsx(
                      'text-xs font-medium',
                      frequency === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    )}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Goal *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  min="1"
                  max="100"
                  disabled={isSubmitting}
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-sm text-slate-500">×</span>
                <select
                  value={goalPeriod}
                  onChange={(e) => setGoalPeriod(e.target.value as GoalPeriodType)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  {goalPeriodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 dark:border-white/5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className={clsx(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                  name.trim() && !isSubmitting
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-lg shadow-primary/25 hover:shadow-xl'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                )}
              >
                {isSubmitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
