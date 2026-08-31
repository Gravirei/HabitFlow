/**
 * Mode Filter Component
 * Horizontal scrollable filter tabs for timer modes
 */

import { motion } from 'framer-motion'

export type FilterMode = 'All' | 'Stopwatch' | 'Countdown' | 'Intervals'

interface ModeFilterProps {
  activeMode: FilterMode
  onModeChange: (mode: FilterMode) => void
}

export function ModeFilter({ activeMode, onModeChange }: ModeFilterProps) {
  const modes: FilterMode[] = ['All', 'Stopwatch', 'Countdown', 'Intervals']

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-5 transition-all duration-300 active:scale-95 ${
            activeMode === mode
              ? 'bg-slate-900 shadow-md shadow-slate-900/10 dark:bg-white dark:shadow-white/10'
              : 'border border-slate-200 bg-white hover:border-primary/50 hover:bg-primary/5 dark:border-white/10 dark:bg-surface-dark dark:hover:border-primary/50'
          }`}
        >
          {activeMode === mode && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="material-symbols-outlined text-[18px] text-white dark:text-black"
            >
              check
            </motion.span>
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
              activeMode === mode
                ? 'text-white dark:text-black'
                : 'text-slate-600 dark:text-gray-300'
            }`}
          >
            {mode}
          </span>
        </button>
      ))}
    </div>
  )
}
