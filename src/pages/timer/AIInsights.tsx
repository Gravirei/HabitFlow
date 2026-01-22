/**
 * AI Insights Page
 * Smart analytics and productivity recommendations with modern professional UI
 */

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getAIInsights } from '../../components/timer/sidebar/ai-insights'
import type { TimerSessionData } from '../../components/timer/sidebar/ai-insights/types'
import { ProductivityScoreCard } from '../../components/timer/sidebar/ai-insights/ProductivityScoreCard'
import { InsightCard } from '../../components/timer/sidebar/ai-insights/InsightCard'
import { RecommendationsList } from '../../components/timer/sidebar/ai-insights/RecommendationsList'
import { WeeklySummaryCard } from '../../components/timer/sidebar/ai-insights/WeeklySummaryCard'
import { PeakHoursChart } from '../../components/timer/sidebar/ai-insights/charts/PeakHoursChart'

export default function AIInsights() {
  const navigate = useNavigate()

  // Load timer history from localStorage
  const [rawStopwatchHistory] = useLocalStorage<any[]>('timer-stopwatch-history', [])
  const [rawCountdownHistory] = useLocalStorage<any[]>('timer-countdown-history', [])
  const [rawIntervalsHistory] = useLocalStorage<any[]>('timer-intervals-history', [])

  // Ensure history values are always arrays to prevent "not iterable" errors
  const stopwatchHistory = useMemo(() => Array.isArray(rawStopwatchHistory) ? rawStopwatchHistory : [], [rawStopwatchHistory])
  const countdownHistory = useMemo(() => Array.isArray(rawCountdownHistory) ? rawCountdownHistory : [], [rawCountdownHistory])
  const intervalsHistory = useMemo(() => Array.isArray(rawIntervalsHistory) ? rawIntervalsHistory : [], [rawIntervalsHistory])

  // Combine all sessions and convert to AI Insights format
  const aiSessionsData = useMemo((): TimerSessionData[] => {
    const allHistory = [...stopwatchHistory, ...countdownHistory, ...intervalsHistory]
    
    return allHistory.map(record => ({
      id: record.id,
      mode: record.mode,
      duration: record.duration,
      startTime: new Date(record.timestamp),
      endTime: new Date(record.timestamp + record.duration * 1000),
      completed: record.mode === 'Countdown' 
        ? (record.targetTime ? record.duration >= record.targetTime : true)
        : true,
      intervals: record.mode === 'Intervals' ? {
        workDuration: record.workDuration || 1500,
        breakDuration: record.breakDuration || 300,
        rounds: record.rounds || 4
      } : undefined
    }))
  }, [stopwatchHistory, countdownHistory, intervalsHistory])

  const insights = useMemo(() => getAIInsights(aiSessionsData), [aiSessionsData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex size-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-700 dark:text-slate-300">arrow_back</span>
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined text-white text-[20px] sm:text-[22px]">
                    psychology
                  </span>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    AI Insights
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                    {insights.dataRange.sessionsAnalyzed} sessions · {
                      insights.dataQuality === 'excellent' ? '🌟 Excellent' : 
                      insights.dataQuality === 'good' ? '✅ Good' : 
                      insights.dataQuality === 'limited' ? '📊 Limited' : 
                      '⚠️ Insufficient'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28">
        {insights.dataQuality === 'insufficient' ? (
          <InsufficientDataView insights={insights} />
        ) : (
          <InsightsContent insights={insights} />
        )}
      </main>
    </div>
  )
}

/**
 * Insufficient Data View
 */
function InsufficientDataView({ insights }: { insights: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[40px] sm:text-[48px]">
            lightbulb
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Keep Building Your Data
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6">
          Complete at least <strong className="text-primary">5 timer sessions</strong> to unlock personalized AI insights.
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800/50">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-3">
            What you'll discover:
          </p>
          <div className="grid gap-2 text-left">
            {[
              { icon: 'schedule', text: 'Your peak productivity hours' },
              { icon: 'timer', text: 'Optimal session duration' },
              { icon: 'star', text: 'Best timer mode' },
              { icon: 'trending_up', text: 'Consistency and trends' },
              { icon: 'tips_and_updates', text: 'Personalized tips' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                  {item.icon}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current sessions: <strong className="text-primary text-base">{insights.dataRange.sessionsAnalyzed}</strong> / 5 minimum
          </p>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min((insights.dataRange.sessionsAnalyzed / 5) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Main Insights Content
 */
function InsightsContent({ insights }: { insights: any }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Productivity Score */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProductivityScoreCard score={insights.productivityScore} />
      </motion.section>

      {/* Weekly Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WeeklySummaryCard summary={insights.weeklySummary} />
      </motion.section>

      {/* Key Insights Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">analytics</span>
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      </motion.section>

      {/* Peak Hours Chart */}
      {insights.peakHours && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">schedule</span>
            Hourly Distribution
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-3 sm:p-4">
            <PeakHoursChart data={insights.peakHours.hourlyDistribution} />
          </div>
        </motion.section>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">tips_and_updates</span>
            Recommendations
          </h2>
          <RecommendationsList recommendations={insights.recommendations} />
        </motion.section>
      )}

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-6 border-t border-slate-200 dark:border-slate-800"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 Insights update automatically based on your sessions
        </p>
      </motion.div>
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
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
