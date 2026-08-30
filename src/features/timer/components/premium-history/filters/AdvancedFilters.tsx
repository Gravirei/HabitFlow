// @ts-nocheck
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
  hasActiveFilters = false,
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
        className={`relative flex size-[58px] shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:border-primary/20 hover:bg-slate-50 hover:text-primary hover:shadow-primary/5 active:scale-95 dark:border-white/5 dark:bg-surface-dark dark:text-slate-500 dark:hover:bg-white/5 ${hasActiveFilters ? 'border-primary/20 bg-primary/5 text-primary ring-2 ring-primary/30 dark:bg-primary/10' : ''} `}
        aria-label="Duration filters"
        title="Duration filters"
      >
        <span className="material-symbols-outlined text-[24px]">tune</span>
        {hasActiveFilters && (
          <span className="absolute right-3 top-3 size-2 rounded-full bg-primary ring-2 ring-white dark:ring-surface-dark" />
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
