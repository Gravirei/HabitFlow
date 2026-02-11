import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'

import { useHabitStore } from '@/store/useHabitStore'
import { IconPicker } from './IconPicker'

interface EditHabitProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
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

export function EditHabit({ isOpen, onClose, habitId }: EditHabitProps) {
  const { habits, updateHabit } = useHabitStore()
  const habit = habits.find(h => h.id === habitId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('check_circle')
  const [frequency, setFrequency] = useState<FrequencyType>('daily')
  const [goal, setGoal] = useState('1')
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriodType>('day')

  const [error, setError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load habit data when modal opens
  useEffect(() => {
    if (!isOpen || !habit) return
    
    setName(habit.name)
    setDescription(habit.description || '')
    setIcon(habit.icon)
    setFrequency(habit.frequency)
    setGoal(habit.goal.toString())
    setGoalPeriod(habit.goalPeriod)
    setError(undefined)
    setIsSubmitting(false)
    
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen, habit])

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

      updateHabit(habitId, {
        name: trimmedName,
        description: description.trim() || undefined,
        icon,
        frequency,
        goal: goalNumber,
        goalPeriod,
      })

      toast.success('✅ Habit updated!')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
      setIsSubmitting(false)
    }
  }

  if (!habit) return null

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Habit</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 sm:max-h-[80vh]">
                <div className="space-y-6">
                  {/* Habit Name */}
                  <div>
                    <label htmlFor="habit-name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Habit Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={inputRef}
                      id="habit-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Morning workout"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                      maxLength={50}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="habit-description" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Description <span className="text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      id="habit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about your habit..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                      maxLength={200}
                    />
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Icon
                    </label>
                    <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Frequency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {frequencyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFrequency(option.value)}
                          className={clsx(
                            'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                            frequency === option.value
                              ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600'
                          )}
                        >
                          <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                          <span className="text-xs font-semibold">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Goal
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        min="1"
                        max="999"
                        className="w-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      />
                      <span className="text-slate-600 dark:text-slate-400">times</span>
                      <select
                        value={goalPeriod}
                        onChange={(e) => setGoalPeriod(e.target.value as GoalPeriodType)}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      >
                        {goalPeriodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx(
                      'flex-1 rounded-xl px-6 py-3 font-semibold text-slate-900 transition-all',
                      isSubmitting
                        ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-700'
                        : 'bg-gradient-to-r from-primary to-emerald-400 hover:shadow-lg hover:shadow-primary/25'
                    )}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
