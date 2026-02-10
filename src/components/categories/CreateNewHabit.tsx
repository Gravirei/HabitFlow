import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Variants, Easing } from 'framer-motion'
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

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' as Easing },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15, ease: 'easeIn' as Easing },
  },
}

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

  const isFormValid = useCallback(() => {
    return name.trim().length > 0 && parseInt(goal, 10) >= 1
  }, [name, goal])

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setIcon('check_circle')
    setFrequency('daily')
    setGoal('1')
    setGoalPeriod('day')
    setError(undefined)
    setIsSubmitting(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    resetForm()
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [isOpen, resetForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Habit name is required')
      inputRef.current?.focus()
      return
    }

    const goalNumber = parseInt(goal, 10)
    if (isNaN(goalNumber) || goalNumber < 1) {
      setError('Goal must be at least 1')
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

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

      toast.success('Habit created successfully!', {
        icon: '✓',
        style: {
          background: '#134E4A',
          color: '#F0FDFA',
        },
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          variants={backdropVariants}
          onClick={onClose}
          className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <motion.div
          variants={modalVariants}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-teal-700/30 bg-gradient-to-b from-teal-900 to-teal-950 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between border-b border-teal-700/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25"
              >
                <span className="material-symbols-outlined text-xl text-teal-950">add</span>
              </motion.div>
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-teal-50">
                  New Habit
                </h2>
                <p className="text-xs text-teal-400">
                  in <span className="text-teal-300">{categoryName}</span>
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-teal-400 transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </motion.button>
          </div>

          <div className="max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="name-field"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label
                  htmlFor="habit-name"
                  className="mb-2 flex items-center gap-1 text-sm font-medium text-teal-200"
                >
                  Habit Name
                  <span className="text-teal-400">*</span>
                </label>
                <input
                  ref={inputRef}
                  id="habit-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError(undefined)
                  }}
                  placeholder="e.g., Morning Meditation"
                  maxLength={60}
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'name-error' : undefined}
                  className={clsx(
                    'w-full rounded-xl border bg-teal-800/30 px-4 py-3 text-teal-50 placeholder-teal-500/50 transition-all',
                    'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-teal-700/50 hover:border-teal-600/50'
                  )}
                />
                <div className="mt-2 flex items-center justify-between">
                  {error && (
                    <motion.p
                      id="name-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400"
                      role="alert"
                    >
                      {error}
                    </motion.p>
                  )}
                  <span
                    className={clsx(
                      'ml-auto text-xs',
                      name.length > 50 ? 'text-amber-400' : 'text-teal-500'
                    )}
                  >
                    {name.length}/60
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="description-field"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.05 }}
              >
                <label
                  htmlFor="habit-description"
                  className="mb-2 block text-sm font-medium text-teal-200"
                >
                  Description
                  <span className="ml-1 font-normal text-teal-400">(optional)</span>
                </label>
                <textarea
                  id="habit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this habit important?"
                  rows={2}
                  maxLength={120}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-teal-700/50 bg-teal-800/30 px-4 py-3 text-teal-50 placeholder-teal-500/50 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="mt-1 block text-right text-xs text-teal-500">
                  {description.length}/120
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="icon-field"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.1 }}
              >
                <label className="mb-3 block text-sm font-medium text-teal-200">Icon</label>
                <div className="rounded-xl border border-teal-700/50 bg-teal-800/20 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30"
                    >
                      <span className="material-symbols-outlined text-2xl text-teal-400">
                        {icon}
                      </span>
                    </motion.div>
                    <span className="text-sm capitalize text-teal-300">
                      {icon.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <IconPicker value={icon} onChange={setIcon} />
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="frequency-field"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.15 }}
              >
                <label className="mb-3 block text-sm font-medium text-teal-200">
                  Frequency <span className="text-teal-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencyOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setFrequency(option.value)}
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                        frequency === option.value
                          ? 'border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/10'
                          : 'border-teal-700/50 bg-teal-800/20 hover:border-teal-600/50 hover:bg-teal-800/40'
                      )}
                      aria-pressed={frequency === option.value}
                    >
                      <span
                        className={clsx(
                          'material-symbols-outlined text-2xl transition-colors',
                          frequency === option.value ? 'text-teal-400' : 'text-teal-500'
                        )}
                      >
                        {option.icon}
                      </span>
                      <span
                        className={clsx(
                          'text-xs font-medium transition-colors',
                          frequency === option.value ? 'text-teal-100' : 'text-teal-400'
                        )}
                      >
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="goal-field"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.2 }}
              >
                <label className="mb-3 block text-sm font-medium text-teal-200">
                  Goal <span className="text-teal-400">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-teal-700/50 bg-teal-800/20 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      min="1"
                      max="100"
                      disabled={isSubmitting}
                      className="w-16 rounded-lg border border-teal-700/50 bg-teal-800/50 px-2 py-2 text-center text-lg font-semibold text-teal-100 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Goal number"
                    />
                    <span className="text-sm text-teal-400">time{goal !== '1' ? 's' : ''}</span>
                  </div>
                  <select
                    value={goalPeriod}
                    onChange={(e) => setGoalPeriod(e.target.value as GoalPeriodType)}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border border-teal-700/50 bg-teal-800/50 px-3 py-2 text-sm text-teal-100 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Goal period"
                  >
                    {goalPeriodOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-teal-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </AnimatePresence>
          </form>

          <div className="flex gap-3 border-t border-teal-700/30 bg-teal-900/50 px-6 py-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 cursor-pointer rounded-xl border border-teal-700/50 bg-teal-800/30 px-4 py-3 text-sm font-medium text-teal-300 transition-all hover:bg-teal-800/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              whileHover={{ scale: isFormValid() && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid() && !isSubmitting ? 0.98 : 1 }}
              className={clsx(
                'flex flex-[2] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
                isFormValid() && !isSubmitting
                  ? 'cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 text-teal-950 shadow-lg shadow-teal-500/25'
                  : 'cursor-not-allowed bg-teal-800/50 text-teal-500'
              )}
            >
              {isSubmitting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="material-symbols-outlined text-lg"
                  >
                    progress_activity
                  </motion.span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Create Habit
                </>
              )}
            </motion.button>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
