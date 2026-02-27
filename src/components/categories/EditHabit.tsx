import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'

import { useHabitStore } from '@/store/useHabitStore'
import { IconPicker } from './IconPicker'

// Predefined icon colors with gradients
const iconColorOptions = [
  { name: 'Blue', gradient: 'from-blue-500 to-cyan-500', textColor: 'text-blue-500' },
  { name: 'Purple', gradient: 'from-purple-500 to-pink-500', textColor: 'text-purple-500' },
  { name: 'Green', gradient: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-500' },
  { name: 'Orange', gradient: 'from-orange-500 to-amber-500', textColor: 'text-orange-500' },
  { name: 'Red', gradient: 'from-red-500 to-rose-500', textColor: 'text-red-500' },
  { name: 'Teal', gradient: 'from-teal-500 to-cyan-500', textColor: 'text-teal-500' },
]

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
  const [iconColorIndex, setIconColorIndex] = useState(0)
  const [frequency, setFrequency] = useState<FrequencyType>('daily')
  const [goal, setGoal] = useState('1')
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriodType>('day')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [weeklyTimesPerWeek, setWeeklyTimesPerWeek] = useState('')
  const [weeklyTimesSet, setWeeklyTimesSet] = useState(false)
  const [weeklyDays, setWeeklyDays] = useState<number[]>([])
  const [monthlyTimesPerMonth, setMonthlyTimesPerMonth] = useState('')
  const [monthlyTimesSet, setMonthlyTimesSet] = useState(false)
  const [monthlyDays, setMonthlyDays] = useState<number[]>([])

  const [error, setError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load habit data when modal opens
  useEffect(() => {
    if (!isOpen || !habit) return
    
    setName(habit.name)
    setDescription(habit.description || '')
    setIcon(habit.icon)
    setIconColorIndex(habit.iconColor ?? 0)
    setFrequency(habit.frequency)
    setGoal(habit.goal.toString())
    setGoalPeriod(habit.goalPeriod)
    setShowIconPicker(false)
    setWeeklyTimesPerWeek(habit.weeklyTimesPerWeek?.toString() || '')
    setWeeklyTimesSet(!!habit.weeklyTimesPerWeek)
    setWeeklyDays(habit.weeklyDays || [])
    setMonthlyTimesPerMonth(habit.monthlyTimesPerMonth?.toString() || '')
    setMonthlyTimesSet(!!habit.monthlyTimesPerMonth)
    setMonthlyDays(habit.monthlyDays || [])
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

    // Validate weekly day selection
    if (frequency === 'weekly') {
      const timesNum = parseInt(weeklyTimesPerWeek, 10)
      if (!weeklyTimesSet || isNaN(timesNum) || timesNum < 1) {
        setError('Please set how many times per week')
        return
      }
      if (weeklyDays.length !== timesNum) {
        setError(`Please select exactly ${timesNum} day${timesNum > 1 ? 's' : ''}`)
        return
      }
    }

    // Validate monthly date selection
    if (frequency === 'monthly') {
      const timesNum = parseInt(monthlyTimesPerMonth, 10)
      if (!monthlyTimesSet || isNaN(timesNum) || timesNum < 1) {
        setError('Please set how many times per month')
        return
      }
      if (monthlyDays.length !== timesNum) {
        setError(`Please select exactly ${timesNum} date${timesNum > 1 ? 's' : ''}`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      updateHabit(habitId, {
        name: trimmedName,
        description: description.trim() || undefined,
        icon,
        iconColor: iconColorIndex,
        frequency,
        goal: goalNumber,
        goalPeriod,
        weeklyTimesPerWeek: frequency === 'weekly' ? parseInt(weeklyTimesPerWeek, 10) : undefined,
        weeklyDays: frequency === 'weekly' ? [...weeklyDays].sort() : undefined,
        monthlyTimesPerMonth: frequency === 'monthly' ? parseInt(monthlyTimesPerMonth, 10) : undefined,
        monthlyDays: frequency === 'monthly' ? [...monthlyDays].sort((a, b) => a - b) : undefined,
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
              <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-5 sm:max-h-[80vh] custom-scrollbar">
                {/* Icon Preview Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="flex items-center gap-4">
                    {/* Large Icon Preview */}
                    <motion.div
                      key={`${icon}-${iconColorIndex}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={clsx(
                        'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                        iconColorOptions[iconColorIndex].gradient
                      )}
                    >
                      <span className="material-symbols-outlined text-3xl text-white">{icon}</span>
                    </motion.div>

                    {/* Preview Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Preview</p>
                      <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                        {name || 'Your Habit Name'}
                      </h3>
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                        {description || 'Add a description...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Habit Name */}
                <div>
                  <label htmlFor="habit-name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Habit Name *
                  </label>
                  <input
                    ref={inputRef}
                    id="habit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Exercise"
                    maxLength={100}
                    disabled={isSubmitting}
                    className={clsx(
                      'w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white',
                      error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/20 dark:border-white/10'
                    )}
                  />
                  {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="habit-description" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Description (Optional)
                  </label>
                  <textarea
                    id="habit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why is this important to you?"
                    rows={2}
                    maxLength={200}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white resize-none"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {description.length}/200 characters
                  </p>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Icon & Color
                  </label>
                  
                  {/* Icon & Color Grid */}
                  <div className="space-y-3">
                    {/* Icon Selector Button */}
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="group w-full rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 transition-all hover:border-primary hover:bg-primary/5 dark:border-white/10 dark:bg-slate-800 dark:hover:border-primary dark:hover:bg-primary/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                            iconColorOptions[iconColorIndex].gradient
                          )}>
                            <span className="material-symbols-outlined text-xl text-white">{icon}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {icon.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Click to change icon
                            </p>
                          </div>
                        </div>
                        <span className={clsx(
                          'material-symbols-outlined text-slate-400 transition-transform group-hover:text-primary',
                          showIconPicker && 'rotate-180'
                        )}>
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Icon Picker Dropdown */}
                    <AnimatePresence>
                      {showIconPicker && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-800/50">
                            <IconPicker 
                              value={icon} 
                              onChange={(newIcon) => {
                                setIcon(newIcon)
                                setShowIconPicker(false)
                              }} 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Color Selector */}
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                        Choose Color
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {iconColorOptions.map((color, index) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => setIconColorIndex(index)}
                            className={clsx(
                              'group relative h-10 rounded-lg bg-gradient-to-br transition-all',
                              color.gradient,
                              iconColorIndex === index
                                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110'
                                : 'hover:scale-105'
                            )}
                          >
                            {iconColorIndex === index && (
                              <motion.div
                                layoutId="selected-color-edit"
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-lg text-white drop-shadow">
                                  check
                                </span>
                              </motion.div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
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
                        onClick={() => {
                          setFrequency(opt.value)
                          if (opt.value !== 'weekly') {
                            setWeeklyTimesPerWeek('')
                            setWeeklyTimesSet(false)
                            setWeeklyDays([])
                          }
                          if (opt.value !== 'monthly') {
                            setMonthlyTimesPerMonth('')
                            setMonthlyTimesSet(false)
                            setMonthlyDays([])
                          }
                        }}
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

                  {/* Weekly Day Selector — inline expand */}
                  <AnimatePresence>
                    {frequency === 'weekly' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 dark:border-white/10 dark:bg-slate-800/50">
                          {/* Step 1: How many times per week */}
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              How many times do you want to do this habit in a week?
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={weeklyTimesPerWeek}
                                onChange={(e) => {
                                  setWeeklyTimesPerWeek(e.target.value)
                                  setWeeklyTimesSet(false)
                                  setWeeklyDays([])
                                }}
                                min="1"
                                max="7"
                                placeholder="e.g. 3"
                                disabled={isSubmitting}
                                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const n = parseInt(weeklyTimesPerWeek, 10)
                                  if (!isNaN(n) && n >= 1 && n <= 7) {
                                    setWeeklyTimesSet(true)
                                    setWeeklyDays([])
                                  }
                                }}
                                disabled={isSubmitting || !weeklyTimesPerWeek || parseInt(weeklyTimesPerWeek, 10) < 1 || parseInt(weeklyTimesPerWeek, 10) > 7}
                                className={clsx(
                                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                                  weeklyTimesPerWeek && parseInt(weeklyTimesPerWeek, 10) >= 1 && parseInt(weeklyTimesPerWeek, 10) <= 7 && !isSubmitting
                                    ? 'bg-primary text-slate-900 hover:bg-primary/90'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                )}
                              >
                                Set
                              </button>
                            </div>
                          </div>

                          {/* Step 2: Select specific days */}
                          <AnimatePresence>
                            {weeklyTimesSet && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Please select {weeklyTimesPerWeek} specific day{parseInt(weeklyTimesPerWeek, 10) > 1 ? 's' : ''} you want to complete this habit
                                </p>
                                <div className="flex gap-1.5">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                    const isSelected = weeklyDays.includes(index)
                                    const maxReached = weeklyDays.length >= parseInt(weeklyTimesPerWeek, 10) && !isSelected
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setWeeklyDays(weeklyDays.filter((d) => d !== index))
                                          } else if (!maxReached) {
                                            setWeeklyDays([...weeklyDays, index])
                                          }
                                        }}
                                        disabled={isSubmitting || (maxReached && !isSelected)}
                                        className={clsx(
                                          'flex-1 rounded-lg py-2 text-xs font-bold transition-all',
                                          isSelected
                                            ? 'bg-primary text-slate-900 shadow-sm ring-2 ring-primary/30'
                                            : maxReached
                                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-600'
                                              : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary dark:bg-slate-800 dark:text-slate-400 dark:border-white/10 dark:hover:border-primary'
                                        )}
                                      >
                                        {day}
                                      </button>
                                    )
                                  })}
                                </div>
                                {weeklyDays.length > 0 && weeklyDays.length < parseInt(weeklyTimesPerWeek, 10) && (
                                  <p className="mt-2 text-xs text-amber-500">
                                    Select {parseInt(weeklyTimesPerWeek, 10) - weeklyDays.length} more day{parseInt(weeklyTimesPerWeek, 10) - weeklyDays.length > 1 ? 's' : ''}
                                  </p>
                                )}
                                {weeklyDays.length === parseInt(weeklyTimesPerWeek, 10) && (
                                  <p className="mt-2 text-xs text-emerald-500 font-medium">
                                    ✓ All days selected
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Monthly Date Selector — inline expand */}
                  <AnimatePresence>
                    {frequency === 'monthly' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 dark:border-white/10 dark:bg-slate-800/50">
                          {/* Step 1: How many times per month */}
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              How many times do you want to do this habit in a month?
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={monthlyTimesPerMonth}
                                onChange={(e) => {
                                  setMonthlyTimesPerMonth(e.target.value)
                                  setMonthlyTimesSet(false)
                                  setMonthlyDays([])
                                }}
                                min="1"
                                max="31"
                                placeholder="e.g. 5"
                                disabled={isSubmitting}
                                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const n = parseInt(monthlyTimesPerMonth, 10)
                                  if (!isNaN(n) && n >= 1 && n <= 31) {
                                    setMonthlyTimesSet(true)
                                    setMonthlyDays([])
                                  }
                                }}
                                disabled={isSubmitting || !monthlyTimesPerMonth || parseInt(monthlyTimesPerMonth, 10) < 1 || parseInt(monthlyTimesPerMonth, 10) > 31}
                                className={clsx(
                                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                                  monthlyTimesPerMonth && parseInt(monthlyTimesPerMonth, 10) >= 1 && parseInt(monthlyTimesPerMonth, 10) <= 31 && !isSubmitting
                                    ? 'bg-primary text-slate-900 hover:bg-primary/90'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                )}
                              >
                                Set
                              </button>
                            </div>
                          </div>

                          {/* Step 2: Select specific dates */}
                          <AnimatePresence>
                            {monthlyTimesSet && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Select {monthlyTimesPerMonth} specific date{parseInt(monthlyTimesPerMonth, 10) > 1 ? 's' : ''} of the month
                                </p>
                                <div className="grid grid-cols-7 gap-1.5">
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                                    const isSelected = monthlyDays.includes(date)
                                    const maxReached = monthlyDays.length >= parseInt(monthlyTimesPerMonth, 10) && !isSelected
                                    return (
                                      <button
                                        key={date}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setMonthlyDays(monthlyDays.filter((d) => d !== date))
                                          } else if (!maxReached) {
                                            setMonthlyDays([...monthlyDays, date])
                                          }
                                        }}
                                        disabled={isSubmitting || (maxReached && !isSelected)}
                                        className={clsx(
                                          'rounded-lg py-2 text-xs font-bold transition-all',
                                          isSelected
                                            ? 'bg-primary text-slate-900 shadow-sm ring-2 ring-primary/30'
                                            : maxReached
                                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-600'
                                              : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary dark:bg-slate-800 dark:text-slate-400 dark:border-white/10 dark:hover:border-primary'
                                        )}
                                      >
                                        {date}
                                      </button>
                                    )
                                  })}
                                </div>
                                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                                  💡 Dates like 29, 30, 31 will roll to the last day in shorter months
                                </p>
                                {monthlyDays.length > 0 && monthlyDays.length < parseInt(monthlyTimesPerMonth, 10) && (
                                  <p className="mt-1 text-xs text-amber-500">
                                    Select {parseInt(monthlyTimesPerMonth, 10) - monthlyDays.length} more date{parseInt(monthlyTimesPerMonth, 10) - monthlyDays.length > 1 ? 's' : ''}
                                  </p>
                                )}
                                {monthlyDays.length === parseInt(monthlyTimesPerMonth, 10) && (
                                  <p className="mt-1 text-xs text-emerald-500 font-medium">
                                    ✓ All dates selected
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Goal */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Set Your Streak Goal *
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
