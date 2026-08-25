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
  isSameMonth
} from 'date-fns'

interface DateRangePickerModalProps {
  isOpen: boolean
  onClose: () => void
  startDate?: Date
  endDate?: Date
  onDateRangeChange: (start: Date, end: Date) => void
}

type QuickRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom'

export function DateRangePickerModal({ 
  isOpen, 
  onClose, 
  startDate, 
  endDate, 
  onDateRangeChange 
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="size-9 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="size-9 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
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

            const bgClass = inRange
              ? 'bg-primary/10 dark:bg-primary/20'
              : ''

            const roundedClass = getRangeClasses(day)

            return (
              <div key={index} className={`relative ${bgClass} ${roundedClass}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDateClick(day)
                  }}
                  disabled={!isCurrentMonth}
                  className={`
                    w-full aspect-square flex items-center justify-center text-sm font-medium relative z-10 transition-all
                    ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-700 opacity-0 pointer-events-none' : ''}
                    ${isRangeStartOrEnd
                      ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-md'
                      : inRange
                        ? 'text-primary font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }
                    ${isToday(day) && !isRangeStartOrEnd ? 'ring-2 ring-primary/50 dark:ring-primary/40' : ''}
                  `}
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-white to-slate-50 dark:from-[#1E1E24] dark:to-[#18181B] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-white text-[20px]">calendar_month</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Date Range
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tempStartDate && tempEndDate
                    ? `${format(tempStartDate, 'MMM d')} - ${format(tempEndDate, 'MMM d, yyyy')}`
                    : 'Select dates to continue'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            {/* Quick Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 px-1">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickRanges.map((range) => (
                  <motion.button
                    key={range.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickRange(range.id)}
                    className={`
                      px-4 py-3 rounded-xl text-xs font-semibold transition-all
                      ${selectedQuickRange === range.id
                        ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5'
                      }
                    `}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-slate-50/80 dark:bg-white/5 rounded-xl p-4 border border-slate-200/50 dark:border-white/5">
              {renderCalendar()}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className="flex-[2] py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
