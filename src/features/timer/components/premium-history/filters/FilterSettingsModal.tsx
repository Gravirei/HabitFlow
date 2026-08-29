// @ts-nocheck
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
  onVisibilityChange,
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
      icon: 'search',
    },
    {
      key: 'dateRange',
      label: 'Date Range Filter',
      description: 'Filter by date range with calendar',
      icon: 'calendar_month',
    },
    {
      key: 'duration',
      label: 'Duration Filter',
      description: 'Filter by session duration',
      icon: 'schedule',
    },
    {
      key: 'completion',
      label: 'Completion Status',
      description: 'Filter by completed/stopped sessions',
      icon: 'check_circle',
    },
  ]

  const handleToggle = (key: keyof typeof filterVisibility) => {
    onVisibilityChange({
      ...filterVisibility,
      [key]: !filterVisibility[key],
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                    <span className="material-symbols-outlined text-xl text-white">tune</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Filter Settings
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Show or hide filter options
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto p-6">
              <div className="space-y-3">
                {filterOptions.map((option) => (
                  <motion.div
                    key={option.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                          filterVisibility[option.key]
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${
                            filterVisibility[option.key]
                              ? 'text-white'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {option.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {option.label}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(option.key)}
                      className={`relative h-6 w-11 rounded-full transition-all ${
                        filterVisibility[option.key]
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md ${
                          filterVisibility[option.key] ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Info Message */}
              <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <span className="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">
                      info
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
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
            <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-medium text-white transition-all hover:shadow-lg"
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
