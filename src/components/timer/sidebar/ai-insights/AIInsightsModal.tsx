/**
 * AI Insights Modal - Main Dashboard
 */

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { getAIInsights } from './index'
import { TimerSessionData, AIInsights as AIInsightsType } from './types'
import { ProductivityScoreCard } from './ProductivityScoreCard'
import { InsightCard } from './InsightCard'
import { RecommendationsList } from './RecommendationsList'
import { WeeklySummaryCard } from './WeeklySummaryCard'
import { PeakHoursChart } from './charts/PeakHoursChart'

interface AIInsightsModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSessionData[]
}

export function AIInsightsModal({ isOpen, onClose, sessions }: AIInsightsModalProps) {
  const insights = useMemo(() => getAIInsights(sessions), [sessions])

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary/10 to-purple-600/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[26px]">
                    psychology
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    AI Insights
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {insights.dataRange.sessionsAnalyzed} sessions analyzed · {insights.dataQuality === 'excellent' ? '🌟 Excellent data' : insights.dataQuality === 'good' ? '✅ Good data' : insights.dataQuality === 'limited' ? '📊 Limited data' : '⚠️ Insufficient data'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                  close
                </span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {insights.dataQuality === 'insufficient' ? (
              <InsufficientDataView insights={insights} />
            ) : (
              <InsightsContent insights={insights} />
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 Insights update automatically every 5 minutes
              </p>
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

/**
 * Insufficient Data View
 */
function InsufficientDataView({ insights }: { insights: AIInsightsType }) {
  return (
    <div className="px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[48px]">
            lightbulb
          </span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Keep Building Your Data
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Complete at least <strong>5 timer sessions</strong> to unlock personalized AI insights about your productivity patterns.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-3">
            What you'll discover:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">schedule</span>
              <span>Your peak productivity hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">timer</span>
              <span>Optimal session duration for you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">star</span>
              <span>Which timer mode works best</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">trending_up</span>
              <span>Consistency score and trends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">tips_and_updates</span>
              <span>Personalized recommendations</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
          Current sessions: <strong>{insights.dataRange.sessionsAnalyzed}</strong> / 5 minimum
        </p>
      </div>
    </div>
  )
}

/**
 * Main Insights Content
 */
function InsightsContent({ insights }: { insights: AIInsightsType }) {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Productivity Score */}
      <section>
        <ProductivityScoreCard score={insights.productivityScore} />
      </section>

      {/* Weekly Summary */}
      <section>
        <WeeklySummaryCard summary={insights.weeklySummary} />
      </section>

      {/* Key Insights Grid */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consistency */}
          <InsightCard
            icon="local_fire_department"
            title="Consistency Score"
            value={`${insights.consistency.score}/100`}
            trend={insights.consistency.trend}
            message={insights.consistency.message}
            color="orange"
          />

          {/* Peak Hours */}
          {insights.peakHours && (
            <InsightCard
              icon="schedule"
              title="Peak Hours"
              value={formatPeakHours(insights.peakHours.peakWindow.startHour, insights.peakHours.peakWindow.endHour)}
              message={insights.peakHours.message}
              color="blue"
            />
          )}

          {/* Duration Pattern */}
          {insights.durationPattern && (
            <InsightCard
              icon="timer"
              title="Optimal Duration"
              value={formatDuration(insights.durationPattern.optimalDuration.avgDuration)}
              trend={insights.durationPattern.trend === 'increasing' ? 'improving' : insights.durationPattern.trend === 'decreasing' ? 'declining' : 'stable'}
              message={insights.durationPattern.message}
              color="green"
            />
          )}

          {/* Mode Mastery */}
          {insights.modeMastery && (
            <InsightCard
              icon="star"
              title="Best Mode"
              value={insights.modeMastery.bestMode.mode}
              message={insights.modeMastery.message}
              color="purple"
            />
          )}

          {/* Productivity Trend */}
          {insights.productivityTrend && (
            <InsightCard
              icon="trending_up"
              title="Weekly Trend"
              value={insights.productivityTrend.trend === 'up' ? '📈 Up' : insights.productivityTrend.trend === 'down' ? '📉 Down' : '📊 Stable'}
              trend={insights.productivityTrend.trend === 'up' ? 'improving' : insights.productivityTrend.trend === 'down' ? 'declining' : 'stable'}
              message={insights.productivityTrend.message}
              color="indigo"
            />
          )}
        </div>
      </section>

      {/* Peak Hours Chart */}
      {insights.peakHours && (
        <section>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Hourly Productivity Distribution
          </h3>
          <PeakHoursChart data={insights.peakHours.hourlyDistribution} />
        </section>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
            Personalized Recommendations
          </h3>
          <RecommendationsList recommendations={insights.recommendations} />
        </section>
      )}
    </div>
  )
}

/**
 * Utility functions
 */
function formatPeakHours(startHour: number, endHour: number): string {
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}${period}`
  }
  return `${formatHour(startHour)}-${formatHour(endHour)}`
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
}
