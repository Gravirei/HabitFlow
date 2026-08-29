// @ts-nocheck
/**
 * Export Modal Component
 * Redesigned to match Custom Tags modal theme
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: ExportFormat, options: ExportOptions) => void
  currentView?: 'sessions' | 'analytics'
}

export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface ExportOptions {
  dateRange?: {
    start: Date
    end: Date
  }
  includeStats?: boolean
  includeCharts?: boolean // For PDF only
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  currentView = 'sessions',
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [includeStats, setIncludeStats] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const formats: Array<{
    id: ExportFormat
    name: string
    icon: string
    description: string
    badge?: string
  }> = [
    {
      id: 'csv',
      name: 'CSV',
      icon: 'table_chart',
      description: 'Spreadsheet format for Excel, Google Sheets',
      badge: 'Popular',
    },
    {
      id: 'json',
      name: 'JSON',
      icon: 'code',
      description: 'Raw data format for developers',
      badge: 'Developer',
    },
    {
      id: 'pdf',
      name: 'PDF',
      icon: 'picture_as_pdf',
      description: 'Printable report with charts',
      badge: 'Premium',
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)

    const options: ExportOptions = {
      includeStats,
      includeCharts: selectedFormat === 'pdf' ? includeCharts : undefined,
    }

    try {
      await onExport(selectedFormat, options)
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
    }
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                    <span className="material-symbols-outlined text-xl text-white">download</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Export Data
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Download timer history
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
            <div className="max-h-[calc(80vh-180px)] space-y-5 overflow-y-auto p-6">
              {/* Format Selection */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-white">
                  Export Format
                </label>
                <div className="space-y-3">
                  {formats.map((format) => {
                    const isSelected = selectedFormat === format.id
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`w-full rounded-2xl p-4 text-left transition-all ${
                          isSelected
                            ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-2 border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                              isSelected
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {format.icon}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {format.name}
                              </span>
                              {format.badge && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                  }`}
                                >
                                  {format.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {format.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                              <span className="material-symbols-outlined text-sm text-white">
                                check
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-white">
                  Include in Export
                </label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={includeStats}
                        onChange={(e) => setIncludeStats(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                          includeStats
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {includeStats && (
                          <span className="material-symbols-outlined text-xs text-white">
                            check
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Statistics & Summary
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Recommended
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                        Total time, sessions count, averages
                      </p>
                    </div>
                  </label>

                  {selectedFormat === 'pdf' && (
                    <motion.label
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={includeCharts}
                          onChange={(e) => setIncludeCharts(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                            includeCharts
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {includeCharts && (
                            <span className="material-symbols-outlined text-xs text-white">
                              check
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Charts & Visualizations
                        </span>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                          Include analytics charts in PDF
                        </p>
                      </div>
                    </motion.label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 rounded-xl bg-slate-200 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="material-symbols-outlined"
                    >
                      progress_activity
                    </motion.span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">download</span>
                    Export {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
