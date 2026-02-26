/**
 * Statistics Dashboard
 * Modern, responsive UI showing timer usage statistics
 * Matches app-wide dark theme (Today page style)
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

// Mock data for demonstration
const MOCK_STATS = {
  totalTime: { hours: 47, minutes: 23, formatted: '47h 23m' },
  thisWeek: { time: '8h 45m', trend: 23, sessions: 42 },
  breakdown: {
    intervals: { count: 48, percentage: 40, time: '18h 56m' },
    countdown: { count: 45, percentage: 37, time: '17h 42m' },
    stopwatch: { count: 28, percentage: 23, time: '10h 45m' },
  },
  streak: { current: 7, longest: 12 },
  averages: { sessionLength: '25m', dailyTime: '1h 15m', completionRate: 87 },
  recentActivity: [
    { day: 'Mon', hours: 5.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 6.2 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 7.3 },
    { day: 'Sat', hours: 2.2 },
    { day: 'Sun', hours: 4.8 },
  ],
  topTimes: [
    { hour: '9-11am', percentage: 35 },
    { hour: '2-4pm', percentage: 28 },
    { hour: '7-9pm', percentage: 22 },
  ],
  focusScore: 85,
  bestDay: 'Friday',
  totalSessions: 121,
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  suffix,
  icon,
  gradient,
  progress,
  trend,
}: {
  label: string
  value: string | number
  suffix?: string
  icon: string
  gradient: string
  progress?: number
  trend?: { value: number; positive: boolean }
}) {
  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-800 group hover:border-slate-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
          <span className="material-symbols-outlined text-white text-sm sm:text-base">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</span>
        {suffix && <span className="text-base sm:text-lg text-slate-500 font-medium">{suffix}</span>}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          <span className="material-symbols-outlined text-sm">
            {trend.positive ? 'trending_up' : 'trending_down'}
          </span>
          {trend.positive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  )
}

/* ─── Breakdown Legend Item ──────────────────────────────────────────────────── */
function BreakdownItem({
  label,
  count,
  time,
  percentage,
  gradient,
  selected,
  onClick,
  color,
}: {
  label: string
  count: number
  time: string
  percentage: number
  gradient: string
  selected: boolean
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full cursor-pointer flex items-start gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 ${
        selected ? `${color} border` : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
        <span className="text-white font-bold text-sm sm:text-lg">{percentage}%</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-sm sm:text-lg text-white mb-0.5">{label}</p>
        <p className="text-xs sm:text-sm text-slate-400">{count} sessions</p>
        <p className={`text-lg sm:text-2xl font-bold mt-0.5 ${color.includes('blue') ? 'text-blue-400' : color.includes('green') ? 'text-green-400' : 'text-purple-400'}`}>
          {time}
        </p>
      </div>
    </button>
  )
}

/* ─── Main Statistics component ─────────────────────────────────────────────── */
export const Statistics: React.FC = () => {
  const navigate = useNavigate()
  const maxHours = Math.max(...MOCK_STATS.recentActivity.map((d) => d.hours))
  const [selectedSegment, setSelectedSegment] = React.useState<string | null>(null)

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col overflow-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30">
      {/* ── Header (matches Today page) ────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-background-light/95 dark:bg-background-dark/95 shrink-0">
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <button
              onClick={() => navigate('/')}
              aria-label="Go back"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="flex-1 overflow-hidden px-4 text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">Statistics</h1>
            </div>
            <button
              onClick={() => {}}
              aria-label="Share statistics"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">ios_share</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 pt-4 sm:pt-6">

          {/* ── Hero: Total Time + Streak ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Time - Primary Hero */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32" />
              <div className="relative">
                <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-white/70 mb-1 sm:mb-2">
                  Total Time
                </p>
                <p className="text-4xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-4 tracking-tight text-white">
                  {MOCK_STATS.totalTime.formatted}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/80" />
                    <span className="text-white/80">{MOCK_STATS.thisWeek.sessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/80" />
                    <span className="text-white/80">This week: {MOCK_STATS.thisWeek.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-slate-900/60 rounded-2xl p-5 sm:p-8 border border-slate-800 relative overflow-hidden group hover:border-orange-500/40 transition-colors duration-200">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-1 sm:mb-2">
                  Streak
                </p>
                <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl font-black text-white">{MOCK_STATS.streak.current}</span>
                  <span className="text-lg sm:text-2xl text-slate-500 font-medium">days</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400 text-base sm:text-lg">local_fire_department</span>
                  <span className="text-xs sm:text-sm text-slate-500">Best: {MOCK_STATS.streak.longest} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Stats Grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Completion"
              value={`${MOCK_STATS.averages.completionRate}%`}
              icon="check_circle"
              gradient="from-green-500 to-emerald-500"
              progress={MOCK_STATS.averages.completionRate}
            />
            <StatCard
              label="Avg Session"
              value={MOCK_STATS.averages.sessionLength}
              icon="timer"
              gradient="from-blue-500 to-indigo-500"
            />
            <StatCard
              label="Daily Avg"
              value={MOCK_STATS.averages.dailyTime}
              icon="schedule"
              gradient="from-violet-500 to-purple-500"
            />
            <StatCard
              label="Trend"
              value={`+${MOCK_STATS.thisWeek.trend}%`}
              icon="trending_up"
              gradient="from-teal-500 to-cyan-500"
              trend={{ value: MOCK_STATS.thisWeek.trend, positive: true }}
            />
          </div>

          {/* ── Activity Breakdown (Pie + Legend) ─────────────────────── */}
          <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Activity Breakdown</h3>
                {selectedSegment && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Viewing: {selectedSegment}</p>
                )}
              </div>
              {selectedSegment && (
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="cursor-pointer text-xs text-slate-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64">
                  <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#blueGradient)"
                      strokeWidth={selectedSegment === 'Intervals' ? 24 : 20}
                      strokeDasharray="251.2" strokeDashoffset="0"
                      opacity={selectedSegment && selectedSegment !== 'Intervals' ? 0.3 : 1}
                      className="transition-all duration-300 cursor-pointer hover:opacity-100"
                      style={{ filter: selectedSegment === 'Intervals' ? 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' : 'none' }}
                      onClick={() => setSelectedSegment(selectedSegment === 'Intervals' ? null : 'Intervals')}
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#greenGradient)"
                      strokeWidth={selectedSegment === 'Countdown' ? 24 : 20}
                      strokeDasharray="251.2" strokeDashoffset="-100.5"
                      opacity={selectedSegment && selectedSegment !== 'Countdown' ? 0.3 : 1}
                      className="transition-all duration-300 cursor-pointer hover:opacity-100"
                      style={{ filter: selectedSegment === 'Countdown' ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' : 'none' }}
                      onClick={() => setSelectedSegment(selectedSegment === 'Countdown' ? null : 'Countdown')}
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#purpleGradient)"
                      strokeWidth={selectedSegment === 'Stopwatch' ? 24 : 20}
                      strokeDasharray="251.2" strokeDashoffset="-193.4"
                      opacity={selectedSegment && selectedSegment !== 'Stopwatch' ? 0.3 : 1}
                      className="transition-all duration-300 cursor-pointer hover:opacity-100"
                      style={{ filter: selectedSegment === 'Stopwatch' ? 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' : 'none' }}
                      onClick={() => setSelectedSegment(selectedSegment === 'Stopwatch' ? null : 'Stopwatch')}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                    {!selectedSegment ? (
                      <>
                        <span className="text-2xl sm:text-4xl font-black text-white">121</span>
                        <span className="text-[10px] sm:text-xs text-slate-500">Total Sessions</span>
                      </>
                    ) : selectedSegment === 'Intervals' ? (
                      <>
                        <span className="text-2xl sm:text-4xl font-black text-blue-400">{MOCK_STATS.breakdown.intervals.percentage}%</span>
                        <span className="text-[10px] sm:text-xs text-slate-500">Intervals</span>
                        <span className="text-xs sm:text-sm text-slate-400 mt-0.5">{MOCK_STATS.breakdown.intervals.count} sessions</span>
                      </>
                    ) : selectedSegment === 'Countdown' ? (
                      <>
                        <span className="text-2xl sm:text-4xl font-black text-green-400">{MOCK_STATS.breakdown.countdown.percentage}%</span>
                        <span className="text-[10px] sm:text-xs text-slate-500">Countdown</span>
                        <span className="text-xs sm:text-sm text-slate-400 mt-0.5">{MOCK_STATS.breakdown.countdown.count} sessions</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl sm:text-4xl font-black text-purple-400">{MOCK_STATS.breakdown.stopwatch.percentage}%</span>
                        <span className="text-[10px] sm:text-xs text-slate-500">Stopwatch</span>
                        <span className="text-xs sm:text-sm text-slate-400 mt-0.5">{MOCK_STATS.breakdown.stopwatch.count} sessions</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 sm:space-y-4">
                <BreakdownItem
                  label="Intervals"
                  count={MOCK_STATS.breakdown.intervals.count}
                  time={MOCK_STATS.breakdown.intervals.time}
                  percentage={MOCK_STATS.breakdown.intervals.percentage}
                  gradient="from-blue-500 to-cyan-500"
                  color="bg-blue-500/10 border-blue-500/30"
                  selected={selectedSegment === 'Intervals'}
                  onClick={() => setSelectedSegment(selectedSegment === 'Intervals' ? null : 'Intervals')}
                />
                <BreakdownItem
                  label="Countdown"
                  count={MOCK_STATS.breakdown.countdown.count}
                  time={MOCK_STATS.breakdown.countdown.time}
                  percentage={MOCK_STATS.breakdown.countdown.percentage}
                  gradient="from-green-500 to-emerald-500"
                  color="bg-green-500/10 border-green-500/30"
                  selected={selectedSegment === 'Countdown'}
                  onClick={() => setSelectedSegment(selectedSegment === 'Countdown' ? null : 'Countdown')}
                />
                <BreakdownItem
                  label="Stopwatch"
                  count={MOCK_STATS.breakdown.stopwatch.count}
                  time={MOCK_STATS.breakdown.stopwatch.time}
                  percentage={MOCK_STATS.breakdown.stopwatch.percentage}
                  gradient="from-purple-500 to-pink-500"
                  color="bg-purple-500/10 border-purple-500/30"
                  selected={selectedSegment === 'Stopwatch'}
                  onClick={() => setSelectedSegment(selectedSegment === 'Stopwatch' ? null : 'Stopwatch')}
                />
              </div>
            </div>
          </div>

          {/* ── Weekly Activity Chart ─────────────────────────────────── */}
          <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-800">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Weekly Activity</h3>
            <div className="h-32 sm:h-40 flex items-end justify-between gap-1.5 sm:gap-3">
              {MOCK_STATS.recentActivity.map((day, index) => {
                const barHeightPct = Math.round((day.hours / maxHours) * 100)
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-md sm:rounded-t-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 relative group cursor-pointer min-h-[8px]"
                      style={{ height: `${barHeightPct}%` }}
                    >
                      <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap border border-slate-700 z-10">
                        {day.hours}h
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-medium">{day.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Peak Hours ────────────────────────────────────────────── */}
          <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-800">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-5">Peak Productivity Hours</h3>
            <div className="space-y-3 sm:space-y-4">
              {MOCK_STATS.topTimes.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
                    <span className="material-symbols-outlined text-white text-sm sm:text-base">schedule</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-white">{slot.hour}</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400">{slot.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${slot.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Insights Grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Focus Score */}
            <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition-colors duration-200">
              <div className="absolute top-2 right-3 sm:top-3 sm:right-4">
                <span className="material-symbols-outlined text-4xl sm:text-6xl text-slate-800/50 group-hover:text-blue-500/10 transition-colors duration-200">
                  target
                </span>
              </div>
              <div className="relative">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Focus Score</p>
                <div className="flex items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {MOCK_STATS.focusScore}
                  </span>
                  <span className="text-sm sm:text-lg text-slate-500 font-medium">/100</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Above average
                </div>
              </div>
            </div>

            {/* Best Day */}
            <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-800 relative overflow-hidden group hover:border-green-500/40 transition-colors duration-200">
              <div className="absolute top-2 right-3 sm:top-3 sm:right-4">
                <span className="material-symbols-outlined text-4xl sm:text-6xl text-slate-800/50 group-hover:text-green-500/10 transition-colors duration-200">
                  emoji_events
                </span>
              </div>
              <div className="relative">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Best Day</p>
                <p className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {MOCK_STATS.bestDay}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400">Most productive this week</p>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="bg-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-colors duration-200">
              <div className="absolute top-2 right-3 sm:top-3 sm:right-4">
                <span className="material-symbols-outlined text-4xl sm:text-6xl text-slate-800/50 group-hover:text-purple-500/10 transition-colors duration-200">
                  bar_chart
                </span>
              </div>
              <div className="relative">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Sessions</p>
                <p className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {MOCK_STATS.totalSessions}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400">All time record</p>
              </div>
            </div>
          </div>

          {/* ── Mock Data Notice ───────────────────────────────────────── */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm text-center">
              <span className="text-white font-semibold">Mock Data</span> · This preview uses sample data for demonstration
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
