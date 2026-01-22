/**
 * Compare Sessions Modal
 * Side-by-side session analysis and comparison
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compareSessionMetrics, calculateImprovementScore } from './compareUtils'
import type { TimerSession } from '../types/session.types'

interface CompareSessionsModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSession[]
}

export function CompareSessionsModal({ isOpen, onClose, sessions }: CompareSessionsModalProps) {
  const [selectedSession1, setSelectedSession1] = useState<TimerSession | null>(null)
  const [selectedSession2, setSelectedSession2] = useState<TimerSession | null>(null)
  const [searchQuery1, setSearchQuery1] = useState('')
  const [searchQuery2, setSearchQuery2] = useState('')

  const filteredSessions1 = sessions.filter((session) => {
    if (!searchQuery1.trim()) return true
    const query = searchQuery1.toLowerCase()
    return (
      session.mode.toLowerCase().includes(query) ||
      session.sessionName?.toLowerCase().includes(query)
    )
  })

  const filteredSessions2 = sessions.filter((session) => {
    if (!searchQuery2.trim()) return true
    const query = searchQuery2.toLowerCase()
    return (
      session.mode.toLowerCase().includes(query) ||
      session.sessionName?.toLowerCase().includes(query)
    )
  })

  const comparisonMetrics = selectedSession1 && selectedSession2
    ? compareSessionMetrics(selectedSession1, selectedSession2)
    : []

  const improvementScore = selectedSession1 && selectedSession2
    ? calculateImprovementScore(selectedSession1, selectedSession2)
    : 0

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'bg-blue-500'
      case 'Countdown': return 'bg-purple-500'
      case 'Intervals': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">compare</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compare Sessions</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Side-by-side analysis</p>
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
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              {/* Session Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Session 1 Selector */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Session 1</h3>
                  <input
                    type="text"
                    value={searchQuery1}
                    onChange={(e) => setSearchQuery1(e.target.value)}
                    placeholder="Search sessions..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                  {selectedSession1 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${getModeColor(selectedSession1.mode)} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-lg">timer</span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {selectedSession1.sessionName || selectedSession1.mode}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {formatTime(selectedSession1.duration)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSession1(null)}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(selectedSession1.timestamp).toLocaleDateString()} • {new Date(selectedSession1.timestamp).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredSessions1.slice(0, 10).map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession1(session)}
                          disabled={session.id === selectedSession2?.id}
                          className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className={`w-8 h-8 rounded-lg ${getModeColor(session.mode)} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-white text-sm">timer</span>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {session.sessionName || session.mode}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {formatTime(session.duration)} • {new Date(session.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Session 2 Selector */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Session 2</h3>
                  <input
                    type="text"
                    value={searchQuery2}
                    onChange={(e) => setSearchQuery2(e.target.value)}
                    placeholder="Search sessions..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                  {selectedSession2 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${getModeColor(selectedSession2.mode)} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-lg">timer</span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {selectedSession2.sessionName || selectedSession2.mode}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {formatTime(selectedSession2.duration)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSession2(null)}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(selectedSession2.timestamp).toLocaleDateString()} • {new Date(selectedSession2.timestamp).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredSessions2.slice(0, 10).map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession2(session)}
                          disabled={session.id === selectedSession1?.id}
                          className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className={`w-8 h-8 rounded-lg ${getModeColor(session.mode)} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-white text-sm">timer</span>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {session.sessionName || session.mode}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {formatTime(session.duration)} • {new Date(session.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Results */}
              {selectedSession1 && selectedSession2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Improvement Score */}
                  <div className={`p-6 rounded-2xl text-center ${
                    improvementScore > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : improvementScore < 0
                      ? 'bg-gradient-to-r from-red-500 to-pink-500'
                      : 'bg-gradient-to-r from-slate-500 to-slate-600'
                  }`}>
                    <div className="text-white/80 text-sm font-medium mb-1">Improvement Score</div>
                    <div className="text-white text-4xl font-bold">
                      {improvementScore > 0 ? '+' : ''}{improvementScore}%
                    </div>
                    <div className="text-white/80 text-sm mt-1">
                      {improvementScore > 0 ? 'Session 2 is longer' : improvementScore < 0 ? 'Session 1 is longer' : 'Same duration'}
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Metric</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Session 1</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Session 2</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {comparisonMetrics.map((metric, index) => (
                          <tr key={index} className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                              {metric.label}
                            </td>
                            <td className={`px-4 py-3 text-sm ${
                              metric.better === 1
                                ? 'text-green-600 dark:text-green-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {metric.session1Value}
                              {metric.better === 1 && (
                                <span className="ml-1 material-symbols-outlined text-xs align-middle">trending_up</span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-sm ${
                              metric.better === 2
                                ? 'text-green-600 dark:text-green-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {metric.session2Value}
                              {metric.better === 2 && (
                                <span className="ml-1 material-symbols-outlined text-xs align-middle">trending_up</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500">
                              {metric.difference || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {(!selectedSession1 || !selectedSession2) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">compare</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Select Two Sessions
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose sessions from the lists above to compare them side-by-side
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
