/**
 * Clear All Filters Button
 * Shows active filter count and clears all filters
 */

interface ClearFiltersButtonProps {
  activeFilterCount: number
  onClearAll: () => void
}

export function ClearFiltersButton({ activeFilterCount, onClearAll }: ClearFiltersButtonProps) {
  if (activeFilterCount === 0) return null

  return (
    <button
      onClick={onClearAll}
      className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
      aria-label={`Clear ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
    >
      <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
      <span>Clear {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}</span>
    </button>
  )
}
