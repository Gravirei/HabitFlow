/**
 * Time Series Chart Component
 * Mobile-first line chart showing daily/weekly trends
 * Optimized for small screens with touch interactions
 */

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
        <div className="bg-background-dark/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white/60 text-xs mb-1">{payload[0].payload.date}</p>
          {activeMetric === 'duration' ? (
            <p className="text-white font-bold text-sm">
              {payload[0].value} minutes
            </p>
          ) : (
            <p className="text-white font-bold text-sm">
              {payload[0].value} sessions
            </p>
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
      className="group bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 hover:border-cyan-400/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
    >
      {/* Animated background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-400/10 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl group-hover:blur-xl transition-all duration-700" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
              <h3 className="text-white font-black text-lg sm:text-xl tracking-tight">
                Activity Trend
              </h3>
            </div>
            <p className="text-white/60 text-xs sm:text-sm font-medium ml-4">
              Track your progress over time
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveMetric('duration')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeMetric === 'duration'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setActiveMetric('sessions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeMetric === 'sessions'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Sessions
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
          {[
            { value: '7days' as const, label: '7 Days' },
            { value: '30days' as const, label: '30 Days' },
            { value: '90days' as const, label: '90 Days' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                timeRange === range.value
                  ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/50 text-white/50 hover:bg-slate-800/70 hover:text-white/80 border border-transparent hover:border-white/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-[220px] sm:h-[280px] bg-slate-900/30 rounded-2xl p-2 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
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
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Average</div>
            <div className="text-white font-black text-base font-mono">
              {activeMetric === 'duration'
                ? `${Math.floor(data.reduce((sum, d) => sum + d.duration, 0) / data.length)}m`
                : Math.floor(data.reduce((sum, d) => sum + d.sessions, 0) / data.length)
              }
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Peak</div>
            <div className="text-white font-black text-base font-mono">
              {activeMetric === 'duration'
                ? `${Math.max(...data.map(d => d.duration))}m`
                : Math.max(...data.map(d => d.sessions))
              }
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <div className="text-white/60 text-xs mb-1.5 font-semibold">Total</div>
            <div className="text-white font-black text-base font-mono">
              {activeMetric === 'duration'
                ? `${Math.floor(data.reduce((sum, d) => sum + d.duration, 0) / 60)}h`
                : data.reduce((sum, d) => sum + d.sessions, 0)
              }
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
