/**
 * Empty State Component
 * Displays when no sessions match the current filters
 */

import { motion } from 'framer-motion'

interface EmptyStateProps {
  searchQuery?: string
  filterMode?: string
  onClearSearch?: () => void
}

export function EmptyState({ searchQuery, filterMode, onClearSearch }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-20 text-center"
    >
      <div className="relative mb-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-primary/20 via-blue-500/20 to-violet-500/20 blur-3xl" />

        {/* Icon container with multiple layers */}
        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent" />
          <span className="material-symbols-outlined text-6xl text-white/30">history</span>
        </div>
      </div>

      <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
        {searchQuery ? 'No Results Found' : 'No History Yet'}
      </h3>

      <p className="mb-6 max-w-sm leading-relaxed text-slate-600 dark:text-white/50">
        {searchQuery ? (
          <>
            No sessions match "<span className="font-semibold text-primary">{searchQuery}</span>".
            Try adjusting your search or filters.
          </>
        ) : filterMode === 'All' ? (
          'Your timer journey starts here. Complete your first session to see your progress tracked beautifully.'
        ) : (
          `Start a ${filterMode?.toLowerCase()} timer to begin tracking your ${filterMode?.toLowerCase()} sessions.`
        )}
      </p>

      {searchQuery && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-black transition-colors hover:bg-primary/90"
        >
          Clear Search
        </button>
      )}
    </motion.div>
  )
}
