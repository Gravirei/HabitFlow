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

export function ExportModal({ isOpen, onClose, onExport, currentView = 'sessions' }: ExportModalProps) {
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
      badge: 'Popular'
    },
    {
      id: 'json',
      name: 'JSON',
      icon: 'code',
      description: 'Raw data format for developers',
      badge: 'Developer'
    },
    {
      id: 'pdf',
      name: 'PDF',
      icon: 'picture_as_pdf',
      description: 'Printable report with charts',
      badge: 'Premium'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)

    const options: ExportOptions = {
      includeStats,
      includeCharts: selectedFormat === 'pdf' ? includeCharts : undefined
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">download</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export Data</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Download timer history</p>
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
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6 space-y-5">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Export Format
                </label>
                <div className="space-y-3">
                  {formats.map((format) => {
                    const isSelected = selectedFormat === format.id
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}>
                            <span className={`material-symbols-outlined text-xl ${
                              isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {format.icon}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 dark:text-white">{format.name}</span>
                              {format.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isSelected
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {format.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {format.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-sm">check</span>
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
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Include in Export
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={includeStats}
                        onChange={(e) => setIncludeStats(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        includeStats
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {includeStats && (
                          <span className="material-symbols-outlined text-white text-xs">check</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Statistics & Summary
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                        Total time, sessions count, averages
                      </p>
                    </div>
                  </label>

                  {selectedFormat === 'pdf' && (
                    <motion.label
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={includeCharts}
                          onChange={(e) => setIncludeCharts(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          includeCharts
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {includeCharts && (
                            <span className="material-symbols-outlined text-white text-xs">check</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Charts & Visualizations
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                          Include analytics charts in PDF
                        </p>
                      </div>
                    </motion.label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
