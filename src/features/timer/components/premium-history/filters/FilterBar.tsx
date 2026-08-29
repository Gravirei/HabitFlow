// @ts-nocheck
/**
 * Filter Bar Component
 * Sticky filter section with date range, duration filter, settings, and mode tabs
 */

import React from 'react'
import { DateRangePicker } from './DateRangePicker'
import { AdvancedFilters } from './AdvancedFilters'
import { ModeFilter, FilterMode } from './ModeFilter'

interface FilterBarProps {
  activeMode: FilterMode
  onModeChange: (mode: FilterMode) => void
  startDate?: Date
  endDate?: Date
  onDateRangeChange?: (start: Date, end: Date) => void
  minDuration?: number
  maxDuration?: number
  onDurationChange: (min: number, max: number) => void
  hasActiveFilters?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  completionFilter?: 'all' | 'completed' | 'stopped'
  onCompletionFilterChange?: (filter: 'all' | 'completed' | 'stopped') => void
  filterVisibility?: {
    dateRange: boolean
    duration: boolean
    completion: boolean
    search: boolean
  }
}

export function FilterBar({
  activeMode,
  onModeChange,
  startDate,
  endDate,
  onDateRangeChange,
  minDuration,
  maxDuration,
  onDurationChange,
  hasActiveFilters = false,
  searchQuery = '',
  onSearchChange,
  completionFilter = 'all',
  onCompletionFilterChange,
  filterVisibility = {
    dateRange: true,
    duration: true,
    completion: true,
    search: true,
  },
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-30 border-b border-black/5 bg-background-light/95 pb-4 pt-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-background-dark/95 dark:shadow-none">
      {/* Search Bar */}
      {onSearchChange && filterVisibility.search && (
        <div className="mb-3 px-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sessions by name or mode..."
              aria-label="Search sessions"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  close
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Date Range, Duration Filter, Completion Filter */}
      <div className="no-scrollbar mb-4 flex items-center gap-3 overflow-x-auto px-4">
        {filterVisibility.dateRange && (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={onDateRangeChange}
          />
        )}
        {filterVisibility.duration && (
          <AdvancedFilters
            minDuration={minDuration}
            maxDuration={maxDuration}
            onDurationChange={onDurationChange}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        {onCompletionFilterChange && filterVisibility.completion && (
          <button
            onClick={() => {
              const next =
                completionFilter === 'all'
                  ? 'completed'
                  : completionFilter === 'completed'
                    ? 'stopped'
                    : 'all'
              onCompletionFilterChange(next)
            }}
            aria-label={`Filter by completion status: ${completionFilter === 'all' ? 'All sessions' : completionFilter === 'completed' ? 'Completed only' : 'Stopped only'}`}
            aria-pressed={completionFilter !== 'all'}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              completionFilter !== 'all'
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {completionFilter === 'completed'
                ? 'check_circle'
                : completionFilter === 'stopped'
                  ? 'cancel'
                  : 'filter_list'}
            </span>
            {completionFilter === 'all'
              ? 'All'
              : completionFilter === 'completed'
                ? 'Completed'
                : 'Stopped'}
          </button>
        )}
      </div>

      {/* Mode Filter Tabs */}
      <ModeFilter activeMode={activeMode} onModeChange={onModeChange} />
    </div>
  )
}
