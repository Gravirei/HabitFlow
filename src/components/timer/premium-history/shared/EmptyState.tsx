/**
 * Empty State Component
 * Displays when no sessions match the current filters
 */

import React from 'react'
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
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="relative mb-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/20 to-violet-500/20 blur-3xl rounded-full animate-pulse" />
        
        {/* Icon container with multiple layers */}
        <div className="relative flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
          <span className="material-symbols-outlined text-6xl text-white/30">history</span>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {searchQuery ? 'No Results Found' : 'No History Yet'}
      </h3>
      
      <p className="text-slate-600 dark:text-white/50 max-w-sm mb-6 leading-relaxed">
        {searchQuery ? (
          <>
            No sessions match "<span className="text-primary font-semibold">{searchQuery}</span>". 
            Try adjusting your search or filters.
          </>
        ) : filterMode === 'All' ? (
          "Your timer journey starts here. Complete your first session to see your progress tracked beautifully."
        ) : (
          `Start a ${filterMode?.toLowerCase()} timer to begin tracking your ${filterMode?.toLowerCase()} sessions.`
        )}
      </p>

      {searchQuery && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
        >
          Clear Search
        </button>
      )}
    </motion.div>
  )
}
