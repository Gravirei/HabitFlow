/**
 * Date Range Picker Component
 * Button to select date range for filtering sessions
 */

import { useState } from 'react'
import { DateRangePickerModal } from './DateRangePickerModal'

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onDateRangeChange?: (start: Date, end: Date) => void
}

export function DateRangePicker({ startDate, endDate, onDateRangeChange }: DateRangePickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleDateRangeChange = (start: Date, end: Date) => {
    onDateRangeChange?.(start, end)
  }

  const formatDateRange = () => {
    if (!startDate || !endDate) {
      return 'All Time'
    }
    // Format dates nicely
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="group flex flex-1 items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-primary/20 hover:shadow-primary/5 active:scale-[0.98] dark:border-white/5 dark:bg-surface-dark dark:text-gray-100"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-primary/70 dark:text-gray-500">
            Date Range
          </span>
          <span className="truncate text-sm font-bold">{formatDateRange()}</span>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-primary/10 dark:bg-white/5">
          <span className="material-symbols-outlined text-[18px] text-slate-400 transition-colors group-hover:text-primary">
            calendar_month
          </span>
        </div>
      </button>

      <DateRangePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />
    </>
  )
}
