/**
 * Date Range Picker Modal
 * Beautiful mobile-first calendar modal for selecting date ranges
 */

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
} from 'date-fns'

interface DateRangePickerModalProps {
  isOpen: boolean
  onClose: () => void
  startDate?: Date
  endDate?: Date
  onDateRangeChange: (start: Date, end: Date) => void
}

type QuickRange =
  'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom'

export function DateRangePickerModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePickerModalProps) {
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedQuickRange, setSelectedQuickRange] = useState<QuickRange>('custom')

  // Quick range presets
  const quickRanges: Array<{ id: QuickRange; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
  ]

  const handleQuickRange = (range: QuickRange) => {
    setSelectedQuickRange(range)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (range) {
      case 'today': {
        setTempStartDate(today)
        setTempEndDate(today)
        break
      }
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        setTempStartDate(yesterday)
        setTempEndDate(yesterday)
        break
      }
      case 'last7days': {
        const week = new Date(today)
        week.setDate(week.getDate() - 6)
        setTempStartDate(week)
        setTempEndDate(today)
        break
      }
      case 'last30days': {
        const month = new Date(today)
        month.setDate(month.getDate() - 29)
        setTempStartDate(month)
        setTempEndDate(today)
        break
      }
      case 'thisMonth': {
        setTempStartDate(startOfMonth(now))
        setTempEndDate(today)
        break
      }
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1)
        setTempStartDate(startOfMonth(lastMonth))
        setTempEndDate(endOfMonth(lastMonth))
        break
      }
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedQuickRange('custom')

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date)
      setTempEndDate(undefined)
    } else {
      // Complete selection
      if (isBefore(date, tempStartDate)) {
        setTempStartDate(date)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(date)
      }
    }
  }

  const handleApply = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange(tempStartDate, tempEndDate)
      onClose()
    }
  }, [tempStartDate, tempEndDate, onDateRangeChange, onClose])

  const handleClear = () => {
    setTempStartDate(undefined)
    setTempEndDate(undefined)
    setSelectedQuickRange('custom')
  }

  // Keyboard navigation and focus management
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && tempStartDate && tempEndDate) {
        handleApply()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, tempStartDate, tempEndDate, handleApply, onClose])

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const isDateInRange = (date: Date) => {
      if (!tempStartDate || !tempEndDate) return false
      return (
        (isAfter(date, tempStartDate) || isSameDay(date, tempStartDate)) &&
        (isBefore(date, tempEndDate) || isSameDay(date, tempEndDate))
      )
    }

    const getRangeClasses = (date: Date) => {
      if (!tempStartDate || !tempEndDate) return ''
      const inRange = isDateInRange(date)
      if (!inRange) return ''

      const isStart = isSameDay(date, tempStartDate)
      const isEnd = isSameDay(date, tempEndDate)
      const isRowStart = date.getDay() === 0
      const isRowEnd = date.getDay() === 6

      const roundLeft = isStart || isRowStart
      const roundRight = isEnd || isRowEnd

      if (roundLeft && roundRight) return 'rounded-full'
      if (roundLeft) return 'rounded-l-full'
      if (roundRight) return 'rounded-r-full'
      return ''
    }

    return (
      <div className="relative">
        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const inRange = isDateInRange(day)
            const isStart = tempStartDate && isSameDay(day, tempStartDate)
            const isEnd = tempEndDate && isSameDay(day, tempEndDate)
            const isRangeStartOrEnd = isStart || isEnd

            const bgClass = inRange ? 'bg-primary/10 dark:bg-primary/20' : ''

            const roundedClass = getRangeClasses(day)

            return (
              <div key={index} className={`relative ${bgClass} ${roundedClass}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDateClick(day)
                  }}
                  disabled={!isCurrentMonth}
                  className={`relative z-10 flex aspect-square w-full items-center justify-center text-sm font-medium transition-all ${!isCurrentMonth ? 'pointer-events-none text-slate-300 opacity-0 dark:text-slate-700' : ''} ${
                    isRangeStartOrEnd
                      ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-md'
                      : inRange
                        ? 'font-semibold text-primary'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  } ${isToday(day) && !isRangeStartOrEnd ? 'ring-2 ring-primary/50 dark:ring-primary/40' : ''} `}
                >
                  {format(day, 'd')}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl dark:border-white/10 dark:from-[#1E1E24] dark:to-[#18181B]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-[20px] text-white">
                  calendar_month
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Date Range</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {tempStartDate && tempEndDate
                    ? `${format(tempStartDate, 'MMM d')} - ${format(tempEndDate, 'MMM d, yyyy')}`
                    : 'Select dates to continue'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 px-6 py-5">
            {/* Quick Select */}
            <div>
              <label className="mb-3 block px-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickRanges.map((range) => (
                  <motion.button
                    key={range.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickRange(range.id)}
                    className={`rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                      selectedQuickRange === range.id
                        ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
                        : 'border border-slate-200/50 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                    } `}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-xl border border-slate-200/50 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-white/5">
              {renderCalendar()}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-white/5">
            <button
              onClick={handleClear}
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className="hover:from-primary-dark flex-[2] rounded-xl bg-gradient-to-r from-primary to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Range
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
