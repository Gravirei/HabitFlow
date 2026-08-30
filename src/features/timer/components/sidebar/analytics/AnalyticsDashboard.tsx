/**
 * Analytics Dashboard Component
 * Mobile-first analytics dashboard with comprehensive insights
 * Displays charts, statistics, and activity trends
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { StatisticsCards } from './StatisticsCards'
import { TimeSeriesChart } from './TimeSeriesChart'
import { SessionDistributionChart } from './SessionDistributionChart'
import { ProductivityHeatmap } from './ProductivityHeatmap'
import { useTimerHistory } from '@/features/timer/hooks/useTimerHistory'

type TimeRange = '7days' | '30days' | '90days'

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  // Load history from all timer modes
  const { history: stopwatchHistory } = useTimerHistory({
    mode: 'Stopwatch',
    storageKey: 'timer-stopwatch-history',
  })
  const { history: countdownHistory } = useTimerHistory({
    mode: 'Countdown',
    storageKey: 'timer-countdown-history',
  })
  const { history: intervalsHistory } = useTimerHistory({
    mode: 'Intervals',
    storageKey: 'timer-intervals-history',
  })

  // Combine all history
  const allHistory = useMemo(() => {
    return [...stopwatchHistory, ...countdownHistory, ...intervalsHistory].sort(
      (a, b) => b.timestamp - a.timestamp
    )
  }, [stopwatchHistory, countdownHistory, intervalsHistory])

  // Calculate current streak (defined before stats useMemo)
  const calculateStreak = (history: any[]) => {
    if (history.length === 0) return 0

    const sortedDates = Array.from(
      new Set(history.map((r) => new Date(r.timestamp).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // Check if there's activity today or yesterday (streak is still alive)
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0
    }

    // Count consecutive days
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString()
      if (sortedDates[i] === expectedDate) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTime = allHistory.reduce((sum, record) => sum + record.duration, 0)
    const totalSessions = allHistory.length
    const longestSession = allHistory.reduce(
      (max, record) => (record.duration > max ? record.duration : max),
      0
    )
    const avgSessionLength = totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0

    // Calculate this week and last week
    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const thisWeekStart = now - oneWeekMs
    const lastWeekStart = now - 2 * oneWeekMs

    const thisWeekTime = allHistory
      .filter((r) => r.timestamp >= thisWeekStart)
      .reduce((sum, r) => sum + r.duration, 0)

    const lastWeekTime = allHistory
      .filter((r) => r.timestamp >= lastWeekStart && r.timestamp < thisWeekStart)
      .reduce((sum, r) => sum + r.duration, 0)

    // Calculate streak
    const currentStreak = calculateStreak(allHistory)

    return {
      totalTime,
      totalSessions,
      currentStreak,
      longestSession,
      avgSessionLength,
      thisWeekTime,
      lastWeekTime,
    }
  }, [allHistory])

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayRecords = allHistory.filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd)

      data.push({
        date: dateStr,
        duration: Math.floor(dayRecords.reduce((sum, r) => sum + r.duration, 0) / 60), // Convert to minutes
        sessions: dayRecords.length,
      })
    }

    return data
  }, [allHistory, timeRange])

  // Prepare distribution data
  const distributionData = useMemo(() => {
    const modes = [
      { name: 'Stopwatch', color: '#3b82f6', history: stopwatchHistory },
      { name: 'Countdown', color: '#10b981', history: countdownHistory },
      { name: 'Intervals', color: '#8b5cf6', history: intervalsHistory },
    ]

    return modes
      .map((mode) => ({
        name: mode.name,
        value: Math.floor(mode.history.reduce((sum, r) => sum + r.duration, 0) / 60), // minutes
        sessions: mode.history.length,
        color: mode.color,
      }))
      .filter((mode) => mode.value > 0) // Only show modes with activity
      .sort((a, b) => b.value - a.value) // Sort by value
  }, [stopwatchHistory, countdownHistory, intervalsHistory])

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    const data = []
    const daysToShow = 30

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayRecords = allHistory.filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd)

      data.push({
        date: dateStr,
        value: Math.floor(dayRecords.reduce((sum, r) => sum + r.duration, 0) / 60), // minutes
        sessions: dayRecords.length,
      })
    }

    return data
  }, [allHistory])

  // Empty state
  if (allHistory.length === 0) {
    return (
      <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-8 backdrop-blur-xl">
        {/* Animated background glow */}
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mb-6 inline-block"
          >
            <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10">
              <span className="material-symbols-outlined text-5xl text-cyan-300">analytics</span>
            </div>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-2xl font-black tracking-tight text-white"
          >
            No Data Yet
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-sm font-medium leading-relaxed text-white/60"
          >
            Complete some timer sessions to see your analytics and insights here.
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div id="statistics-cards">
        <StatisticsCards
          totalTime={stats.totalTime}
          totalSessions={stats.totalSessions}
          currentStreak={stats.currentStreak}
          longestSession={stats.longestSession}
          avgSessionLength={stats.avgSessionLength}
          thisWeekTime={stats.thisWeekTime}
          lastWeekTime={stats.lastWeekTime}
        />
      </div>

      {/* Time Series Chart */}
      <div id="time-series-chart">
        <TimeSeriesChart
          data={timeSeriesData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      {/* Distribution & Heatmap - Stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Session Distribution */}
        {distributionData.length > 0 && (
          <div id="distribution-chart">
            <SessionDistributionChart data={distributionData} />
          </div>
        )}

        {/* Productivity Heatmap */}
        <div id="heatmap-chart">
          <ProductivityHeatmap data={heatmapData} />
        </div>
      </div>

      {/* Quick Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 backdrop-blur-xl transition-all duration-500 hover:border-pink-400/30 hover:shadow-[0_0_50px_rgba(236,72,153,0.15)] sm:p-7"
      >
        {/* Animated background glow */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-pink-500/5 blur-3xl transition-all duration-700 group-hover:bg-pink-400/10" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-pink-500/5 blur-2xl transition-all duration-700 group-hover:blur-xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:32px_32px]" />

        <div className="relative z-10">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-pink-500/20 blur-md transition-all duration-300 group-hover:bg-pink-400/30" />
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/30 to-pink-600/20">
                <span className="material-symbols-outlined text-2xl text-pink-300">
                  auto_awesome
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-7 w-1 rounded-full bg-gradient-to-b from-pink-400 to-pink-600" />
                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  Keep Up The Great Work!
                </h3>
              </div>
              <div className="ml-4 space-y-3 text-sm text-white/70">
                <p className="font-medium">
                  You've tracked{' '}
                  <span className="font-black text-white">{stats.totalSessions} sessions</span>{' '}
                  totaling{' '}
                  <span className="font-mono font-black text-white">
                    {Math.floor(stats.totalTime / 3600)}h{' '}
                    {Math.floor((stats.totalTime % 3600) / 60)}m
                  </span>
                  .
                </p>
                {stats.currentStreak > 0 && (
                  <p className="font-medium">
                    You're on a{' '}
                    <span className="font-black text-orange-400">
                      {stats.currentStreak}-day streak
                    </span>
                    ! 🔥
                  </p>
                )}
                {distributionData.length > 0 && (
                  <p className="font-medium">
                    Your favorite mode is{' '}
                    <span className="font-black text-white">{distributionData[0].name}</span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
