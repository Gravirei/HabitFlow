/**
 * Statistics Dashboard (Mock)
 * Modern, sleek UI showing timer usage statistics
 * Using mock data for demonstration
 */

import React from 'react'

// Simple SVG icons (no external library needed) - unused but kept for future use

// Mock data for demonstration
const MOCK_STATS = {
  totalTime: {
    hours: 47,
    minutes: 23,
    formatted: '47h 23m'
  },
  thisWeek: {
    time: '8h 45m',
    trend: 23,
    sessions: 42
  },
  breakdown: {
    intervals: { count: 48, percentage: 40, time: '18h 56m' },
    countdown: { count: 45, percentage: 37, time: '17h 42m' },
    stopwatch: { count: 28, percentage: 23, time: '10h 45m' }
  },
  streak: {
    current: 7,
    longest: 12
  },
  averages: {
    sessionLength: '25m',
    dailyTime: '1h 15m',
    completionRate: 87
  },
  recentActivity: [
    { day: 'Mon', hours: 5.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 6.2 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 7.3 },
    { day: 'Sat', hours: 2.2 },
    { day: 'Sun', hours: 4.8 }
  ],
  topTimes: [
    { hour: '9-11am', percentage: 35 },
    { hour: '2-4pm', percentage: 28 },
    { hour: '7-9pm', percentage: 22 }
  ],
  focusScore: 85,
  bestDay: 'Friday',
  totalSessions: 121
}

export const Statistics: React.FC = () => {
  const maxHours = Math.max(...MOCK_STATS.recentActivity.map(d => d.hours))
  const [selectedSegment, setSelectedSegment] = React.useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Statistics</h1>
          <p className="text-sm text-gray-500">Your productivity insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero Stats - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Time - Primary */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="relative">
              <div className="text-sm font-medium text-white/70 mb-2">TOTAL TIME</div>
              <div className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">{MOCK_STATS.totalTime.formatted}</div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                  <span className="text-white/80">{MOCK_STATS.thisWeek.sessions} sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                  <span className="text-white/80">This week: {MOCK_STATS.thisWeek.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Streak - Accent Card */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-white/5 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-sm font-medium text-gray-500 mb-2">STREAK</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">{MOCK_STATS.streak.current}</span>
                <span className="text-2xl text-gray-500">days</span>
              </div>
              <div className="text-sm text-gray-500">Best: {MOCK_STATS.streak.longest} days</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="text-xs font-medium text-gray-500 mb-2">COMPLETION</div>
            <div className="text-3xl font-bold mb-1">{MOCK_STATS.averages.completionRate}%</div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${MOCK_STATS.averages.completionRate}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="text-xs font-medium text-gray-500 mb-2">AVG SESSION</div>
            <div className="text-3xl font-bold">{MOCK_STATS.averages.sessionLength}</div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="text-xs font-medium text-gray-500 mb-2">DAILY AVG</div>
            <div className="text-3xl font-bold">{MOCK_STATS.averages.dailyTime}</div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5">
            <div className="text-xs font-medium text-gray-500 mb-2">TREND</div>
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold text-green-500">+{MOCK_STATS.thisWeek.trend}%</div>
            </div>
          </div>
        </div>

        {/* Session Breakdown - Pie Chart */}
        <div className="bg-zinc-900 rounded-2xl p-8 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Activity Breakdown</h3>
              {selectedSegment && (
                <p className="text-sm text-gray-400 mt-1">Viewing: {selectedSegment}</p>
              )}
            </div>
            {selectedSegment && (
              <button 
                onClick={() => setSelectedSegment(null)}
                className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64 group">
                {/* SVG Pie Chart */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Intervals - 40% (144 degrees) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#blueGradient)"
                    strokeWidth={selectedSegment === 'Intervals' ? "24" : "20"}
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                    opacity={selectedSegment && selectedSegment !== 'Intervals' ? 0.3 : 1}
                    className="transition-all duration-300 cursor-pointer hover:opacity-100"
                    style={{ filter: selectedSegment === 'Intervals' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none' }}
                    onClick={() => setSelectedSegment(selectedSegment === 'Intervals' ? null : 'Intervals')}
                  />
                  {/* Countdown - 37% (133.2 degrees) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#greenGradient)"
                    strokeWidth={selectedSegment === 'Countdown' ? "24" : "20"}
                    strokeDasharray="251.2"
                    strokeDashoffset="-100.5"
                    opacity={selectedSegment && selectedSegment !== 'Countdown' ? 0.3 : 1}
                    className="transition-all duration-300 cursor-pointer hover:opacity-100"
                    style={{ filter: selectedSegment === 'Countdown' ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none' }}
                    onClick={() => setSelectedSegment(selectedSegment === 'Countdown' ? null : 'Countdown')}
                  />
                  {/* Stopwatch - 23% (82.8 degrees) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth={selectedSegment === 'Stopwatch' ? "24" : "20"}
                    strokeDasharray="251.2"
                    strokeDashoffset="-193.4"
                    opacity={selectedSegment && selectedSegment !== 'Stopwatch' ? 0.3 : 1}
                    className="transition-all duration-300 cursor-pointer hover:opacity-100"
                    style={{ filter: selectedSegment === 'Stopwatch' ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' : 'none' }}
                    onClick={() => setSelectedSegment(selectedSegment === 'Stopwatch' ? null : 'Stopwatch')}
                  />
                  
                  {/* Gradients */}
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
                
                {/* Center Label - Dynamic */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                  {!selectedSegment ? (
                    <>
                      <div className="text-4xl font-bold">121</div>
                      <div className="text-xs text-gray-500">Total Sessions</div>
                    </>
                  ) : selectedSegment === 'Intervals' ? (
                    <>
                      <div className="text-4xl font-bold text-blue-400">{MOCK_STATS.breakdown.intervals.percentage}%</div>
                      <div className="text-xs text-gray-500">Intervals</div>
                      <div className="text-sm text-gray-400 mt-1">{MOCK_STATS.breakdown.intervals.count} sessions</div>
                    </>
                  ) : selectedSegment === 'Countdown' ? (
                    <>
                      <div className="text-4xl font-bold text-green-400">{MOCK_STATS.breakdown.countdown.percentage}%</div>
                      <div className="text-xs text-gray-500">Countdown</div>
                      <div className="text-sm text-gray-400 mt-1">{MOCK_STATS.breakdown.countdown.count} sessions</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-purple-400">{MOCK_STATS.breakdown.stopwatch.percentage}%</div>
                      <div className="text-xs text-gray-500">Stopwatch</div>
                      <div className="text-sm text-gray-400 mt-1">{MOCK_STATS.breakdown.stopwatch.count} sessions</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-6">
              {/* Intervals */}
              <div 
                className={`flex items-start gap-4 group cursor-pointer p-3 rounded-xl transition-all ${
                  selectedSegment === 'Intervals' ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-zinc-800'
                }`}
                onClick={() => setSelectedSegment(selectedSegment === 'Intervals' ? null : 'Intervals')}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="text-white font-bold text-lg">{MOCK_STATS.breakdown.intervals.percentage}%</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">Intervals</div>
                  <div className="text-sm text-gray-400 mb-1">{MOCK_STATS.breakdown.intervals.count} sessions</div>
                  <div className="text-2xl font-bold text-blue-400">{MOCK_STATS.breakdown.intervals.time}</div>
                </div>
              </div>

              {/* Countdown */}
              <div 
                className={`flex items-start gap-4 group cursor-pointer p-3 rounded-xl transition-all ${
                  selectedSegment === 'Countdown' ? 'bg-green-500/10 border border-green-500/30' : 'hover:bg-zinc-800'
                }`}
                onClick={() => setSelectedSegment(selectedSegment === 'Countdown' ? null : 'Countdown')}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="text-white font-bold text-lg">{MOCK_STATS.breakdown.countdown.percentage}%</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">Countdown</div>
                  <div className="text-sm text-gray-400 mb-1">{MOCK_STATS.breakdown.countdown.count} sessions</div>
                  <div className="text-2xl font-bold text-green-400">{MOCK_STATS.breakdown.countdown.time}</div>
                </div>
              </div>

              {/* Stopwatch */}
              <div 
                className={`flex items-start gap-4 group cursor-pointer p-3 rounded-xl transition-all ${
                  selectedSegment === 'Stopwatch' ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-zinc-800'
                }`}
                onClick={() => setSelectedSegment(selectedSegment === 'Stopwatch' ? null : 'Stopwatch')}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="text-white font-bold text-lg">{MOCK_STATS.breakdown.stopwatch.percentage}%</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">Stopwatch</div>
                  <div className="text-sm text-gray-400 mb-1">{MOCK_STATS.breakdown.stopwatch.count} sessions</div>
                  <div className="text-2xl font-bold text-purple-400">{MOCK_STATS.breakdown.stopwatch.time}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold mb-6">Weekly Activity</h3>
          <div className="h-40 flex items-end justify-between gap-3">
            {MOCK_STATS.recentActivity.map((day, index) => {
              const barHeightPx = Math.round((day.hours / maxHours) * 160) // 160px max height
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-200 relative group cursor-pointer min-h-[12px]"
                    style={{ height: `${barHeightPx}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-white/10 z-10">
                      {day.hours}h
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Focus Score */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">🎯</div>
            <div className="relative">
              <div className="text-xs font-medium text-gray-500 mb-2">FOCUS SCORE</div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{MOCK_STATS.focusScore}</span>
                <span className="text-lg text-gray-500">/100</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Above average</span>
              </div>
            </div>
          </div>

          {/* Best Day */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-green-500/50 transition-colors">
            <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">🏆</div>
            <div className="relative">
              <div className="text-xs font-medium text-gray-500 mb-2">BEST DAY</div>
              <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {MOCK_STATS.bestDay}
              </div>
              <div className="text-xs text-gray-400">
                Most productive this week
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">📈</div>
            <div className="relative">
              <div className="text-xs font-medium text-gray-500 mb-2">TOTAL SESSIONS</div>
              <div className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {MOCK_STATS.totalSessions}
              </div>
              <div className="text-xs text-gray-400">
                All time record
              </div>
            </div>
          </div>
        </div>

        {/* Mock Data Notice */}
        <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
          <p className="text-gray-400 text-sm text-center">
            <span className="text-white font-medium">Mock Data</span> · This preview uses sample data for demonstration
          </p>
        </div>
      </div>
    </div>
  )
}
