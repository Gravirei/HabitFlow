/**
 * Export Modal Component for Timer Sidebar
 * Brand new export functionality separate from premium history
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [step, setStep] = useState<'format' | 'options' | 'preview'>('format')
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf' | 'xlsx'>('csv')
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeTags, setIncludeTags] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const formats = [
    {
      id: 'csv',
      label: 'CSV',
      description: 'Spreadsheet compatible',
      icon: 'table_chart',
      popular: true
    },
    {
      id: 'xlsx',
      label: 'Excel',
      description: 'Native Excel format',
      icon: 'grid_on',
      popular: true
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'Developer-friendly',
      icon: 'code',
      popular: false
    },
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Document format',
      icon: 'picture_as_pdf',
      popular: false
    },
  ]

  const ranges = [
    { id: 'all', label: 'All Time', description: 'Every session' },
    { id: 'week', label: 'Last 7 Days', description: 'Past week' },
    { id: 'month', label: 'Last 30 Days', description: 'Past month' },
    { id: 'year', label: 'Last Year', description: 'Past 12 months' },
    { id: 'custom', label: 'Custom Range', description: 'Choose dates' },
  ]

  const getStepTitle = () => {
    switch (step) {
      case 'format': return 'Choose Format'
      case 'options': return 'Select Options'
      case 'preview': return 'Preview & Export'
      default: return 'Export Data'
    }
  }

  const handleNext = () => {
    if (step === 'format') setStep('options')
    else if (step === 'options') setStep('preview')
  }

  const handleBack = () => {
    if (step === 'options') setStep('format')
    else if (step === 'preview') setStep('options')
  }

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Exporting:', {
      format: selectedFormat,
      dateRange,
      customStartDate,
      customEndDate,
      includeMetadata,
      includeTags,
      includeNotes
    })
    setIsExporting(false)
    onClose()
    setStep('format')
  }

  const handleClose = () => {
    onClose()
    setStep('format')
    setSelectedFormat('csv')
    setDateRange('all')
    setCustomStartDate('')
    setCustomEndDate('')
    setIncludeMetadata(true)
    setIncludeTags(true)
    setIncludeNotes(true)
    setIsExporting(false)
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-900/70 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.99] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col h-full max-h-[90vh]">
              {/* Ambient glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-2xl opacity-50 -z-10" />

              {/* Header - Fixed */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white/50 via-white/30 to-transparent dark:from-slate-800/50 dark:via-slate-800/30 dark:to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-primary to-purple-500 rounded-lg text-white">
                        <span className="material-symbols-outlined text-xl">file_download</span>
                      </div>
                      {getStepTitle()}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-12">
                      {step === 'format' && 'Select your preferred export format'}
                      {step === 'options' && 'Customize export settings'}
                      {step === 'preview' && 'Review and confirm'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex size-9 items-center justify-center rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 group"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">close</span>
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mt-4 px-14">
                  {['format', 'options', 'preview'].map((s, idx) => (
                    <React.Fragment key={s}>
                      <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                        step === s
                          ? 'bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30'
                          : ['format', 'options', 'preview'].indexOf(step) > idx
                            ? 'bg-gradient-to-r from-primary/60 to-purple-500/60'
                            : 'bg-slate-200/80 dark:bg-slate-700/80'
                      }`} />
                      {idx < 2 && (
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                          ['format', 'options', 'preview'].indexOf(step) > idx
                            ? 'bg-gradient-to-r from-primary to-purple-500 shadow-md shadow-primary/40'
                            : 'bg-slate-200/80 dark:bg-slate-700/80'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Content Container - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {/* Step 1: Format Selection */}
                  {step === 'format' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {formats.map((format) => (
                          <motion.button
                            key={format.id}
                            onClick={() => setSelectedFormat(format.id as any)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-6 rounded-2xl border transition-all duration-300 group ${
                              selectedFormat === format.id
                                ? 'border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent shadow-xl shadow-primary/20'
                                : 'border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 hover:border-slate-300/60 dark:hover:border-slate-600/60 hover:bg-white/80 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              format.popular
                                ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30'
                                : selectedFormat === format.id
                                  ? 'bg-primary text-white'
                                  : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400'
                            }`}>
                              {format.popular ? 'Popular' : selectedFormat === format.id ? 'Selected' : 'Available'}
                            </div>

                            <motion.span
                              className={`material-symbols-outlined text-5xl block mb-4 transition-all duration-300 ${
                                selectedFormat === format.id
                                  ? 'text-primary drop-shadow-sm'
                                  : 'text-slate-400 group-hover:text-primary/80'
                              }`}
                              animate={selectedFormat === format.id ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ duration: 0.5 }}
                            >
                              {format.icon}
                            </motion.span>

                            <div className={`text-lg font-bold mb-1 transition-colors ${
                              selectedFormat === format.id
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}>
                              {format.label}
                            </div>

                            <div className={`text-sm transition-colors ${
                              selectedFormat === format.id
                                ? 'text-slate-600 dark:text-slate-300'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {format.description}
                            </div>

                            {selectedFormat === format.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <span className="material-symbols-outlined text-white text-sm">check</span>
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      <motion.div
                        key={selectedFormat}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 p-5 bg-gradient-to-br from-amber-50/90 via-amber-50/70 to-transparent dark:from-amber-900/30 dark:via-amber-900/20 dark:to-transparent border border-amber-200/50 dark:border-amber-800/30 rounded-2xl backdrop-blur-sm"
                      >
                        <div className="flex gap-3.5">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">auto_awesome</span>
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1.5">Smart Recommendation</p>
                            <p className="text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                              {selectedFormat === 'csv' && 'Perfect for opening in Excel, Google Sheets, or any spreadsheet application. Great for data analysis and visualization.'}
                              {selectedFormat === 'xlsx' && 'Native Excel format with support for multiple worksheets, advanced formatting, and pivot tables.'}
                              {selectedFormat === 'json' && 'Machine-readable format ideal for developers, APIs, and integration with other systems.'}
                              {selectedFormat === 'pdf' && 'Shareable document format with beautiful formatting, perfect for reports and presentations.'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 2: Options */}
                  {step === 'options' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="space-y-7"
                    >
                      {/* Date Range */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          Date Range
                        </label>
                        <div className="space-y-2.5">
                          {ranges.map((range) => (
                            <motion.button
                              key={range.id}
                              onClick={() => setDateRange(range.id as any)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full p-5 rounded-2xl text-left transition-all duration-300 ${
                                dateRange === range.id
                                  ? 'bg-gradient-to-r from-primary/90 to-purple-500/90 text-white shadow-xl shadow-primary/30'
                                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/60 dark:hover:border-slate-600/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-base">{range.label}</div>
                                  <div className={`text-sm mt-1 ${
                                    dateRange === range.id ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {range.description}
                                  </div>
                                </div>
                                {dateRange === range.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Custom Date Inputs */}
                        {dateRange === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-5 grid grid-cols-2 gap-4 p-5 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent rounded-2xl border border-primary/20 dark:border-primary/30"
                          >
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-primary focus:outline-none backdrop-blur-sm transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-primary focus:outline-none backdrop-blur-sm transition-all"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Data Options */}
                      <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                          Include in Export
                        </label>
                        <div className="space-y-3">
                          {[
                            { id: 'metadata', label: 'Session Metadata', desc: 'Timestamps, duration, intervals', icon: 'timeline', color: 'from-blue-500 to-cyan-500' },
                            { id: 'tags', label: 'Tags & Categories', desc: 'Custom tags and labels', icon: 'sell', color: 'from-purple-500 to-pink-500' },
                            { id: 'notes', label: 'Session Notes', desc: 'Personal notes and reflections', icon: 'note', color: 'from-amber-500 to-orange-500' },
                          ].map((item) => {
                            const isChecked = (item.id === 'metadata' && includeMetadata) ||
                                            (item.id === 'tags' && includeTags) ||
                                            (item.id === 'notes' && includeNotes);

                            return (
                              <motion.div
                                key={item.id}
                                whileHover={{ y: -2 }}
                                className={`relative group overflow-hidden rounded-2xl transition-all duration-300 ${
                                  isChecked
                                    ? 'shadow-xl shadow-black/10'
                                    : 'shadow-lg shadow-black/5'
                                }`}
                              >
                                {/* Animated background gradient */}
                                <div className={`absolute inset-0 transition-opacity duration-300 ${
                                  isChecked
                                    ? 'opacity-100 bg-gradient-to-r from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-800/70'
                                    : 'opacity-100 bg-white/70 dark:bg-slate-800/70 group-hover:bg-white/90 group-hover:dark:bg-slate-800/90'
                                }`} />

                                {/* Border */}
                                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                                  isChecked
                                    ? 'border-2 border-primary/40'
                                    : 'border-2 border-transparent group-hover:border-slate-200/50 dark:group-hover:border-slate-700/50'
                                }`} />

                                {/* Content */}
                                <div className="relative flex items-center gap-4 p-4">
                                  {/* Icon */}
                                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg transform transition-transform duration-300 ${
                                    isChecked ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                                  }`}>
                                    <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1">
                                    <span className="font-bold text-slate-900 dark:text-white block text-base">{item.label}</span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                                  </div>

                                  {/* Toggle Switch */}
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (item.id === 'metadata') setIncludeMetadata(e.target.checked)
                                        else if (item.id === 'tags') setIncludeTags(e.target.checked)
                                        else setIncludeNotes(e.target.checked)
                                      }}
                                      className="sr-only"
                                    />
                                    <div className="relative w-16 h-8">
                                      {/* Track */}
                                      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                                        isChecked
                                          ? `bg-gradient-to-r ${item.color} shadow-inner`
                                          : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600'
                                      }`} />

                                      {/* Thumb */}
                                      <motion.div
                                        animate={{
                                          x: isChecked ? 32 : 0,
                                        }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                      >
                                        {isChecked && (
                                          <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="material-symbols-outlined text-primary text-sm"
                                          >
                                            check
                                          </motion.span>
                                        )}
                                      </motion.div>

                                      {/* Shine effect */}
                                      <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                                        isChecked ? 'opacity-20' : 'opacity-0 group-hover:opacity-20'
                                      } bg-gradient-to-r from-white/50 to-transparent`} />
                                    </div>
                                  </div>
                                </div>

                                {/* Decorative corner accent */}
                                <div className={`absolute top-0 right-0 w-20 h-20 transition-opacity duration-300 ${
                                  isChecked ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-xl`} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Preview */}
                  {step === 'preview' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      {/* Summary Card */}
                      <div className="relative p-4 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent dark:from-primary/30 dark:via-purple-500/20 dark:to-transparent border-2 border-primary/30 rounded-2xl backdrop-blur-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl -mr-12 -mt-12" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-primary/20 rounded-full blur-lg -ml-8 -mb-8" />

                        <div className="relative">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-primary to-purple-500 rounded-xl shadow-lg">
                              <span className="material-symbols-outlined text-white text-lg">preview</span>
                            </div>
                            Export Summary
                          </h3>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Format</p>
                              <p className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                {selectedFormat.toUpperCase()}
                              </p>
                            </div>

                            <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Date Range</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {ranges.find(r => r.id === dateRange)?.label}
                                {dateRange === 'custom' && customStartDate && customEndDate && (
                                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                                    {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Export Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Sessions', value: '156', color: 'from-primary to-blue-500', icon: 'event_note' },
                          { label: 'Total Time', value: '42h', color: 'from-purple-500 to-pink-500', icon: 'schedule' },
                          { label: 'Est. Size', value: '3.2MB', color: 'from-amber-500 to-orange-500', icon: 'database' },
                        ].map((stat, idx) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/40 dark:border-slate-700/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                                <span className="material-symbols-outlined text-white text-sm">{stat.icon}</span>
                              </div>
                            </div>
                            <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Included Data */}
                      <div className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/30 dark:border-slate-700/30 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-sm">inventory_2</span>
                          Included Data
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {includeMetadata && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary text-xs font-bold rounded-full border border-primary/30 shadow-sm"
                            >
                              Session Metadata
                            </motion.span>
                          )}
                          {includeTags && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.05 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 text-xs font-bold rounded-full border border-purple-500/30 shadow-sm"
                            >
                              Tags & Categories
                            </motion.span>
                          )}
                          {includeNotes && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 text-xs font-bold rounded-full border border-amber-500/30 shadow-sm"
                            >
                              Session Notes
                            </motion.span>
                          )}
                          {!includeMetadata && !includeTags && !includeNotes && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">No additional data selected</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white/30 via-white/20 to-transparent dark:from-slate-900/30 dark:via-slate-900/20 dark:to-transparent backdrop-blur-xl flex gap-3">
              {step !== 'format' && (
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-300 border-2 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 shadow-lg shadow-black/10"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ x: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="material-symbols-outlined text-lg"
                    >
                      arrow_back
                    </motion.span>
                    <span className="font-bold">Back</span>
                  </div>

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                </motion.button>
              )}
              {step === 'preview' ? (
                <motion.button
                  onClick={handleExport}
                  disabled={isExporting}
                  whileHover={{ scale: isExporting ? 1 : 1.02 }}
                  whileTap={{ scale: isExporting ? 1 : 0.98 }}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary via-primary to-purple-500 hover:from-primary/90 hover:via-primary/90 hover:to-purple-500/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/30"
                >
                  {isExporting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="material-symbols-outlined text-lg"
                      >
                        progress_activity
                      </motion.span>
                      <span className="font-bold">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">download</span>
                      <span className="font-bold">Start Export</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 group relative overflow-hidden px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 border-2 border-transparent hover:border-primary/50 shadow-lg shadow-black/20"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-primary via-purple-500 to-primary" />

                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="font-bold">Continue</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="material-symbols-outlined text-lg"
                    >
                      arrow_forward
                    </motion.span>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                </motion.button>
              )}
            </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
