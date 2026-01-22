/**
 * Date Range Picker Component
 * Button to select date range for filtering sessions
 */

import React, { useState } from 'react'
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
        className="flex-1 flex items-center justify-between gap-2 text-sm font-bold text-slate-700 dark:text-gray-100 bg-white dark:bg-surface-dark py-3.5 px-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all group hover:border-primary/20 hover:shadow-primary/5"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] uppercase text-slate-400 dark:text-gray-500 font-bold tracking-wider group-hover:text-primary/70 transition-colors">
            Date Range
          </span>
          <span className="text-sm font-bold truncate">{formatDateRange()}</span>
        </div>
        <div className="size-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[18px]">
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
