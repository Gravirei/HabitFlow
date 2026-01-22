/**
 * Filter Settings Modal
 * Redesigned to match Custom Tags modal theme
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  filterVisibility: {
    dateRange: boolean
    duration: boolean
    completion: boolean
    search: boolean
  }
  onVisibilityChange: (filters: {
    dateRange: boolean
    duration: boolean
    completion: boolean
    search: boolean
  }) => void
}

export function FilterSettingsModal({
  isOpen,
  onClose,
  filterVisibility,
  onVisibilityChange
}: FilterSettingsModalProps) {
  type FilterKey = keyof typeof filterVisibility

  const filterOptions: Array<{
    key: FilterKey
    label: string
    description: string
    icon: string
  }> = [
    {
      key: 'search',
      label: 'Search Bar',
      description: 'Search sessions by name or mode',
      icon: 'search'
    },
    {
      key: 'dateRange',
      label: 'Date Range Filter',
      description: 'Filter by date range with calendar',
      icon: 'calendar_month'
    },
    {
      key: 'duration',
      label: 'Duration Filter',
      description: 'Filter by session duration',
      icon: 'schedule'
    },
    {
      key: 'completion',
      label: 'Completion Status',
      description: 'Filter by completed/stopped sessions',
      icon: 'check_circle'
    }
  ]

  const handleToggle = (key: keyof typeof filterVisibility) => {
    onVisibilityChange({
      ...filterVisibility,
      [key]: !filterVisibility[key]
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">tune</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filter Settings</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Show or hide filter options</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              <div className="space-y-3">
                {filterOptions.map((option) => (
                  <motion.div
                    key={option.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        filterVisibility[option.key]
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <span className={`material-symbols-outlined ${
                          filterVisibility[option.key] ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {option.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {option.label}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(option.key)}
                      className={`relative w-11 h-6 rounded-full transition-all ${
                        filterVisibility[option.key]
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md ${
                          filterVisibility[option.key] ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Info Message */}
              <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">info</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">
                      Customize Your Experience
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Hide filters you don't use to keep the interface clean and focused.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
