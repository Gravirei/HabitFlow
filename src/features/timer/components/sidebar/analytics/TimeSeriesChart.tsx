/**
 * Time Series Chart Component
 * Mobile-first line chart showing daily/weekly trends
 * Optimized for small screens with touch interactions
 */

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'

interface TimeSeriesData {
  date: string
  duration: number // in minutes
  sessions: number
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  timeRange: '7days' | '30days' | '90days'
  onTimeRangeChange: (range: '7days' | '30days' | '90days') => void
}

export function TimeSeriesChart({ data, timeRange, onTimeRangeChange }: TimeSeriesChartProps) {
  const [activeMetric, setActiveMetric] = useState<'duration' | 'sessions'>('duration')

  // Custom tooltip for mobile
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-background-dark/95 p-3 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-xs text-white/60">{payload[0].payload.date}</p>
          {activeMetric === 'duration' ? (
            <p className="text-sm font-bold text-white">{payload[0].value} minutes</p>
          ) : (
            <p className="text-sm font-bold text-white">{payload[0].value} sessions</p>
          )}
        </div>
      )
    }
    return null
  }

  // Format axis labels for mobile
  const formatXAxis = (value: string) => {
    const parts = value.split(' ')
    return parts[0] // Show only day (e.g., "Mon" from "Mon 15")
  }

  const formatYAxis = (value: number) => {
    if (activeMetric === 'duration') {
      return value >= 60 ? `${Math.floor(value / 60)}h` : `${value}m`
    }
    return value.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/20 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] sm:p-7"
    >
      {/* Animated background glow */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl transition-all duration-700 group-hover:bg-cyan-400/10" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-2xl transition-all duration-700 group-hover:blur-xl" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
              <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                Activity Trend
              </h3>
            </div>
            <p className="ml-4 text-xs font-medium text-white/60 sm:text-sm">
              Track your progress over time
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveMetric('duration')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${
                activeMetric === 'duration'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setActiveMetric('sessions')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${
                activeMetric === 'sessions'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Sessions
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="no-scrollbar mb-6 flex items-center gap-2 overflow-x-auto">
          {[
            { value: '7days' as const, label: '7 Days' },
            { value: '30days' as const, label: '30 Days' },
            { value: '90days' as const, label: '90 Days' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value)}
              className={`shrink-0 rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 ${
                timeRange === range.value
                  ? 'border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'border border-transparent bg-slate-900/50 text-white/50 hover:border-white/10 hover:bg-slate-800/70 hover:text-white/80'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[220px] w-full rounded-2xl border border-white/5 bg-slate-900/30 p-2 sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255, 255, 255, 0.4)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontWeight: 500 }}
                tickFormatter={formatXAxis}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontWeight: 500 }}
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(34, 211, 238, 0.2)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4, opacity: 0 }}
                activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2, opacity: 1 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Average</div>
            <div className="font-mono text-base font-black text-white">
              {activeMetric === 'duration'
                ? `${Math.floor(data.reduce((sum, d) => sum + d.duration, 0) / data.length)}m`
                : Math.floor(data.reduce((sum, d) => sum + d.sessions, 0) / data.length)}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Peak</div>
            <div className="font-mono text-base font-black text-white">
              {activeMetric === 'duration'
                ? `${Math.max(...data.map((d) => d.duration))}m`
                : Math.max(...data.map((d) => d.sessions))}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
            <div className="mb-1.5 text-xs font-semibold text-white/60">Total</div>
            <div className="font-mono text-base font-black text-white">
              {activeMetric === 'duration'
                ? `${Math.floor(data.reduce((sum, d) => sum + d.duration, 0) / 60)}h`
                : data.reduce((sum, d) => sum + d.sessions, 0)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
