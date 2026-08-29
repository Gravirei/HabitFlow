import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { motion } from 'framer-motion'

export function Calendar() {
  const navigate = useNavigate()
  const { habits } = useHabitStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Calendar logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const daysInView = eachDayOfInterval({ start: startDate, end: endDate })

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // Get all completions for a specific date
  const getCompletionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return habits.filter((habit) => habit.completedDates.includes(dateStr)).length
  }

  // Get completion percentage for a day
  const getCompletionPercentage = (date: Date) => {
    if (habits.length === 0) return 0
    const completions = getCompletionsForDate(date)
    return Math.round((completions / habits.length) * 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto my-4 flex h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 font-display shadow-2xl dark:border-slate-800 dark:bg-slate-950"
    >
      {/* Glassmorphism Header */}
      <div className="pt-safe sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 pb-2 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70">
        <button
          onClick={() => navigate('/today')}
          className="flex size-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-200/50 active:scale-95 dark:text-white dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
          Calendar
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <main className="no-scrollbar pb-safe flex flex-1 flex-col overflow-y-auto px-4 pt-4">
        {/* Month Navigation */}
        <div className="mb-2 flex items-center justify-between py-4">
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        useState
        {/* Calendar Grid */}
        <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Day Headers */}
          <div className="mb-4 grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="flex h-8 items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInView.map((date, index) => {
              const today = isToday(date)
              const currentMonthDay = isCurrentMonth(date)
              const completionPercentage = getCompletionPercentage(date)
              const hasCompletions = completionPercentage > 0

              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex h-10 w-full flex-col items-center justify-center rounded-2xl transition-all ${
                    today
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                      : ''
                  } ${!currentMonthDay ? 'opacity-30' : ''}`}
                >
                  <span
                    className={`text-sm font-bold ${
                      today
                        ? 'text-white'
                        : currentMonthDay
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  {hasCompletions && currentMonthDay && !today && (
                    <div className="absolute bottom-1.5 flex gap-0.5">
                      <div
                        className={`h-1 w-1 rounded-full ${
                          completionPercentage === 100 ? 'bg-emerald-500' : 'bg-teal-500'
                        }`}
                      ></div>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
        {/* Stats Summary */}
        <div className="space-y-4 pb-8">
          <h3 className="px-1 text-lg font-bold text-slate-900 dark:text-white">
            Monthly Overview
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Habits */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Habits
                </p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {habits.length}
              </p>
            </div>

            {/* This Month Completions */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {habits.reduce((sum, habit) => {
                  const monthCompletions = habit.completedDates.filter((date) => {
                    const d = new Date(date)
                    return (
                      d.getMonth() === currentMonth.getMonth() &&
                      d.getFullYear() === currentMonth.getFullYear()
                    )
                  }).length
                  return sum + monthCompletions
                }, 0)}
              </p>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
