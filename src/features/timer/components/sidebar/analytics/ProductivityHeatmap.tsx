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
        display: date.getDate().toString()
      })
    }
    return days
  }

  const days = generateDays()

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    const maxValue = Math.max(...data.map(d => d.value), 1)
    const intensity = value / maxValue

    if (value === 0) return 'bg-white/5'
    if (intensity < 0.25) return 'bg-blue-500/20'
    if (intensity < 0.5) return 'bg-blue-500/40'
    if (intensity < 0.75) return 'bg-blue-500/60'
    return 'bg-blue-500/80'
  }

  // Get data for specific date
  const getDataForDate = (dateStr: string) => {
    return data.find(d => d.date === dateStr) || { date: dateStr, value: 0, sessions: 0 }
  }

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Calculate stats
  const totalMinutes = data.reduce((sum, d) => sum + d.value, 0)
  const activeDays = data.filter(d => d.value > 0).length
  const avgPerActiveDay = activeDays > 0 ? Math.floor(totalMinutes / activeDays) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="group bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 hover:border-violet-400/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)]"
    >
      {/* Animated background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-400/10 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/5 rounded-full blur-2xl group-hover:blur-xl transition-all duration-700" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-violet-400 to-violet-600 rounded-full" />
            <h3 className="text-white font-black text-lg sm:text-xl tracking-tight">
              Activity Calendar
            </h3>
          </div>
          <p className="text-white/60 text-xs sm:text-sm font-medium ml-4">
            Last {daysToShow} days of activity
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Active Days</div>
            <div className="text-white font-black text-xl">{activeDays}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Total Time</div>
            <div className="text-white font-black text-xl font-mono">{formatTime(totalMinutes)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Avg/Day</div>
            <div className="text-white font-black text-xl">{avgPerActiveDay}m</div>
          </div>
        </div>

        {/* Heatmap Grid - Mobile Optimized */}
        <div className="mb-4">
          {/* Week Day Labels */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-white/50 text-xs font-bold">
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
                  className={`
                    aspect-square rounded-xl border transition-all duration-300 relative group/btn
                    ${getColorIntensity(dayData.value)}
                    ${isSelected
                      ? 'border-violet-400 ring-2 ring-violet-400/50 scale-105 shadow-lg shadow-violet-500/20'
                      : 'border-white/10 hover:border-white/30 hover:scale-105'
                    }
                    ${isToday && !isSelected ? 'ring-1 ring-white/50' : ''}
                  `}
                >
                  {/* Day Number */}
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 group-hover/btn:text-white transition-colors">
                    {day.display}
                  </span>

                  {/* Activity Indicator */}
                  {dayData.value > 0 && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-400 rounded-full shadow-sm" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-5 px-1">
          <span className="text-white/50 text-xs font-semibold">Less</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-5 h-5 rounded ${
                  level === 0 ? 'bg-white/5 border border-white/10' :
                  level === 1 ? 'bg-violet-500/20' :
                  level === 2 ? 'bg-violet-500/40' :
                  level === 3 ? 'bg-violet-500/60' :
                  'bg-violet-500/80'
                }`}
              />
            ))}
          </div>
          <span className="text-white/50 text-xs font-semibold">More</span>
        </div>

        {/* Selected Day Details */}
        {selectedDay && selectedDay.value > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/10 border border-violet-400/30 shadow-lg shadow-violet-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-violet-300 text-xs font-black mb-1.5 tracking-wide uppercase">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-white font-black text-2xl font-mono">
                  {formatTime(selectedDay.value)}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 hover:text-white transition-all duration-200 border border-violet-400/30 hover:border-violet-400/50"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-400 text-lg">timer</span>
                <span className="text-white/80 font-semibold">{selectedDay.sessions} sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-400 text-lg">schedule</span>
                <span className="text-white/80 font-semibold">
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
            className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 text-center"
          >
            <span className="material-symbols-outlined text-white/30 text-4xl mb-3 block">
              calendar_today
            </span>
            <p className="text-white/60 text-sm font-medium mb-3">
              No activity on{' '}
              {new Date(selectedDay.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <button
              onClick={() => setSelectedDay(null)}
              className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-bold transition-all duration-200 border border-violet-400/30 hover:border-violet-400/50"
            >
              Close
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
