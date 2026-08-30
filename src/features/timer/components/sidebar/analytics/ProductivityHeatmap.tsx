/**
 * Productivity Heatmap Component
 * Mobile-first calendar heatmap showing daily activity
 * Optimized for touch and small screens
 */

import { useState } from 'react'
import { motion } from 'framer-motion'

interface HeatmapData {
  date: string // YYYY-MM-DD
  value: number // minutes of activity
  sessions: number
}

interface ProductivityHeatmapProps {
  data: HeatmapData[]
  daysToShow?: number // default 30 for mobile
}

export function ProductivityHeatmap({ data, daysToShow = 30 }: ProductivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<HeatmapData | null>(null)

  // Generate last N days
  const generateDays = () => {
    const days: Array<{ date: string; dayOfWeek: number; display: string }> = []
    const today = new Date()

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        display: date.getDate().toString(),
      })
    }
    return days
  }

  const days = generateDays()

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1)
    const intensity = value / maxValue

    if (value === 0) return 'bg-white/5'
    if (intensity < 0.25) return 'bg-blue-500/20'
    if (intensity < 0.5) return 'bg-blue-500/40'
    if (intensity < 0.75) return 'bg-blue-500/60'
    return 'bg-blue-500/80'
  }

  // Get data for specific date
  const getDataForDate = (dateStr: string) => {
    return data.find((d) => d.date === dateStr) || { date: dateStr, value: 0, sessions: 0 }
  }

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Calculate stats
  const totalMinutes = data.reduce((sum, d) => sum + d.value, 0)
  const activeDays = data.filter((d) => d.value > 0).length
  const avgPerActiveDay = activeDays > 0 ? Math.floor(totalMinutes / activeDays) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 backdrop-blur-xl transition-all duration-500 hover:border-violet-400/20 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)] sm:p-7"
    >
      {/* Animated background glow */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/5 blur-3xl transition-all duration-700 group-hover:bg-violet-400/10" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl transition-all duration-700 group-hover:blur-xl" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-violet-600" />
            <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
              Activity Calendar
            </h3>
          </div>
          <p className="ml-4 text-xs font-medium text-white/60 sm:text-sm">
            Last {daysToShow} days of activity
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Active Days</div>
            <div className="text-xl font-black text-white">{activeDays}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Total Time</div>
            <div className="font-mono text-xl font-black text-white">
              {formatTime(totalMinutes)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Avg/Day</div>
            <div className="text-xl font-black text-white">{avgPerActiveDay}m</div>
          </div>
        </div>

        {/* Heatmap Grid - Mobile Optimized */}
        <div className="mb-4">
          {/* Week Day Labels */}
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-bold text-white/50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, index) => {
              const dayData = getDataForDate(day.date)
              const isSelected = selectedDay?.date === day.date
              const isToday = day.date === new Date().toISOString().split('T')[0]

              return (
                <motion.button
                  key={day.date}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedDay(dayData)}
                  className={`group/btn relative aspect-square rounded-xl border transition-all duration-300 ${getColorIntensity(dayData.value)} ${
                    isSelected
                      ? 'scale-105 border-violet-400 shadow-lg shadow-violet-500/20 ring-2 ring-violet-400/50'
                      : 'border-white/10 hover:scale-105 hover:border-white/30'
                  } ${isToday && !isSelected ? 'ring-1 ring-white/50' : ''} `}
                >
                  {/* Day Number */}
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 transition-colors group-hover/btn:text-white">
                    {day.display}
                  </span>

                  {/* Activity Indicator */}
                  {dayData.value > 0 && (
                    <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-sm" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-5 flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-white/50">Less</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-5 w-5 rounded ${
                  level === 0
                    ? 'border border-white/10 bg-white/5'
                    : level === 1
                      ? 'bg-violet-500/20'
                      : level === 2
                        ? 'bg-violet-500/40'
                        : level === 3
                          ? 'bg-violet-500/60'
                          : 'bg-violet-500/80'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-white/50">More</span>
        </div>

        {/* Selected Day Details */}
        {selectedDay && selectedDay.value > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-violet-600/10 p-5 shadow-lg shadow-violet-500/10"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-1.5 text-xs font-black uppercase tracking-wide text-violet-300">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="font-mono text-2xl font-black text-white">
                  {formatTime(selectedDay.value)}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-xl border border-violet-400/30 bg-violet-500/20 p-2 text-violet-200 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-500/30 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-violet-400">timer</span>
                <span className="font-semibold text-white/80">{selectedDay.sessions} sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-violet-400">schedule</span>
                <span className="font-semibold text-white/80">
                  {Math.floor(selectedDay.value / selectedDay.sessions)}m avg
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {selectedDay && selectedDay.value === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-center"
          >
            <span className="material-symbols-outlined mb-3 block text-4xl text-white/30">
              calendar_today
            </span>
            <p className="mb-3 text-sm font-medium text-white/60">
              No activity on{' '}
              {new Date(selectedDay.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-xl border border-violet-400/30 bg-violet-500/20 px-4 py-2 text-xs font-bold text-violet-300 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-500/30"
            >
              Close
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
