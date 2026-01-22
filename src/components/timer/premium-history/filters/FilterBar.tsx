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
    search: true
  }
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md pt-4 pb-4 shadow-sm dark:shadow-none border-b border-black/5 dark:border-white/5">
      {/* Search Bar */}
      {onSearchChange && filterVisibility.search && (
        <div className="px-4 mb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sessions by name or mode..."
              aria-label="Search sessions"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Date Range, Duration Filter, Completion Filter */}
      <div className="px-4 mb-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
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
              const next = completionFilter === 'all' ? 'completed' : completionFilter === 'completed' ? 'stopped' : 'all'
              onCompletionFilterChange(next)
            }}
            aria-label={`Filter by completion status: ${completionFilter === 'all' ? 'All sessions' : completionFilter === 'completed' ? 'Completed only' : 'Stopped only'}`}
            aria-pressed={completionFilter !== 'all'}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              completionFilter !== 'all'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {completionFilter === 'completed' ? 'check_circle' : completionFilter === 'stopped' ? 'cancel' : 'filter_list'}
            </span>
            {completionFilter === 'all' ? 'All' : completionFilter === 'completed' ? 'Completed' : 'Stopped'}
          </button>
        )}
      </div>

      {/* Mode Filter Tabs */}
      <ModeFilter activeMode={activeMode} onModeChange={onModeChange} />
    </div>
  )
}
