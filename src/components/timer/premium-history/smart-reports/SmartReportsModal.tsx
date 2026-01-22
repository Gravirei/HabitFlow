/**
 * Smart Reports Modal
 * Automated insights and PDF generation
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateReport } from './reportUtils'
import type { ReportPeriod } from './types'
import type { TimerSession } from '../types/session.types'

interface SmartReportsModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSession[]
}

export function SmartReportsModal({ isOpen, onClose, sessions }: SmartReportsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')

  const reportData = useMemo(() => {
    return generateReport(sessions, selectedPeriod)
  }, [sessions, selectedPeriod])

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'negative': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'suggestion': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 dark:text-green-400'
      case 'negative': return 'text-red-600 dark:text-red-400'
      case 'suggestion': return 'text-amber-600 dark:text-amber-400'
      default: return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'bg-blue-500'
      case 'Countdown': return 'bg-purple-500'
      case 'Intervals': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    alert('PDF export feature coming soon! This would generate a beautiful PDF report.')
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">summarize</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Reports</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Automated insights & analytics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    Export PDF
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Period Selector */}
              <div className="flex gap-2">
                {(['week', 'month', 'quarter', 'year', 'all'] as ReportPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {period === 'all' ? 'All Time' : period}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white">
                  <div className="text-sm opacity-90 mb-1">Total Sessions</div>
                  <div className="text-3xl font-bold">{reportData.totalSessions}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
                  <div className="text-sm opacity-90 mb-1">Total Time</div>
                  <div className="text-3xl font-bold">{formatDuration(reportData.totalDuration)}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white">
                  <div className="text-sm opacity-90 mb-1">Avg Session</div>
                  <div className="text-3xl font-bold">{formatDuration(reportData.averageDuration)}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
                  <div className="text-sm opacity-90 mb-1">Best Day</div>
                  <div className="text-xl font-bold truncate">{reportData.mostProductiveDay}</div>
                </div>
              </div>

              {/* Trends */}
              {reportData.trends.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Trends</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {reportData.trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {trend.label}
                        </span>
                        <div className={`flex items-center gap-1 font-semibold ${
                          trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {trend.isPositive ? 'trending_up' : 'trending_down'}
                          </span>
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Insights</h3>
                <div className="grid gap-3">
                  {reportData.insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-2xl p-4 ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-900/50 flex items-center justify-center shrink-0 ${getInsightIconColor(insight.type)}`}>
                          <span className="material-symbols-outlined text-lg">{insight.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{insight.title}</h4>
                            {insight.metric && (
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                                {insight.metric}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mode Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Mode Breakdown</h3>
                <div className="space-y-3">
                  {reportData.modeBreakdown.map((mode) => (
                    <div key={mode.mode} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${getModeColor(mode.mode)} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">timer</span>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{mode.mode}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {mode.count} sessions
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {formatDuration(mode.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`${getModeColor(mode.mode)} h-2 rounded-full transition-all`}
                          style={{ width: `${mode.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">schedule</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Most Productive Time</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {reportData.mostProductiveTime}
                  </div>
                </div>
                {reportData.longestSession && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">trophy</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Longest Session</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatDuration(reportData.longestSession.duration)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {reportData.longestSession.mode} • {new Date(reportData.longestSession.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
