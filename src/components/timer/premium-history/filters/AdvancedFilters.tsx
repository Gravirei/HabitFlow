/**
 * Advanced Filters Component
 * Button to open duration filters modal
 */

import React, { useState } from 'react'
import { AdvancedFiltersModal } from './AdvancedFiltersModal'

interface AdvancedFiltersProps {
  minDuration?: number
  maxDuration?: number
  onDurationChange: (min: number, max: number) => void
  hasActiveFilters?: boolean
}

export function AdvancedFilters({ 
  minDuration, 
  maxDuration, 
  onDurationChange,
  hasActiveFilters = false
}: AdvancedFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleDurationChange = (min: number, max: number) => {
    onDurationChange(min, max)
  }

  return (
    <>
      <button 
        onClick={handleClick}
        className={`
          size-[58px] shrink-0 flex items-center justify-center rounded-2xl 
          bg-white dark:bg-surface-dark text-slate-400 dark:text-slate-500
          border border-slate-100 dark:border-white/5 shadow-sm 
          active:scale-95 transition-all hover:text-primary hover:border-primary/20 hover:shadow-primary/5 hover:bg-slate-50 dark:hover:bg-white/5 relative
          ${hasActiveFilters ? 'ring-2 ring-primary/30 text-primary border-primary/20 bg-primary/5 dark:bg-primary/10' : ''}
        `}
        aria-label="Duration filters"
        title="Duration filters"
      >
        <span className="material-symbols-outlined text-[24px]">tune</span>
        {hasActiveFilters && (
          <span className="absolute top-3 right-3 size-2 bg-primary rounded-full ring-2 ring-white dark:ring-surface-dark" />
        )}
      </button>

      <AdvancedFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        minDuration={minDuration}
        maxDuration={maxDuration}
        onDurationChange={handleDurationChange}
      />
    </>
  )
}
