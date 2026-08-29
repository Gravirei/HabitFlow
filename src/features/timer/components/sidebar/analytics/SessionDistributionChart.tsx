// @ts-nocheck
/**
 * Session Distribution Chart Component
 * Mobile-first donut chart showing breakdown by timer mode
 * Optimized for touch interactions and small screens
 */

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { motion } from 'framer-motion'

interface DistributionData {
  name: string
  value: number // in minutes or count
  color: string
  sessions: number
}

interface SessionDistributionChartProps {
  data: DistributionData[]
}

export function SessionDistributionChart({ data }: SessionDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'time' | 'count'>('time')

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  // Custom active shape for hover/touch
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handlePieLeave = () => {
    setActiveIndex(null)
  }

  const formatValue = (value: number) => {
    if (viewMode === 'time') {
      const hours = Math.floor(value / 60)
      const mins = value % 60
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }
    return value.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 backdrop-blur-xl transition-all duration-500 hover:border-emerald-400/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] sm:p-7"
    >
      {/* Animated background glow */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-700 group-hover:bg-emerald-400/10" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-700 group-hover:blur-xl" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                Session Breakdown
              </h3>
            </div>
            <p className="ml-4 text-xs font-medium text-white/60 sm:text-sm">
              Distribution by timer mode
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/50 p-1">
            <button
              onClick={() => setViewMode('time')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${
                viewMode === 'time'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setViewMode('count')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${
                viewMode === 'count'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Count
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          {/* Donut Chart */}
          <div className="relative h-[220px] w-full sm:h-[250px] lg:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey={viewMode === 'time' ? 'value' : 'sessions'}
                  onMouseEnter={handlePieEnter}
                  onMouseLeave={handlePieLeave}
                  onTouchStart={(_, index) => setActiveIndex(index)}
                  onTouchEnd={handlePieLeave}
                  activeIndex={activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-1 text-xs font-semibold text-white/60">Total</div>
              <div className="font-mono text-2xl font-black text-white">
                {viewMode === 'time' ? formatValue(totalValue) : totalValue}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3.5 lg:w-1/2">
            {data.map((item, index) => {
              const percentage =
                ((viewMode === 'time' ? item.value : item.sessions) /
                  (viewMode === 'time'
                    ? totalValue
                    : data.reduce((sum, d) => sum + d.sessions, 0))) *
                100
              const isActive = activeIndex === index

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onTouchStart={() => setActiveIndex(index)}
                  className={`group/item cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                    isActive
                      ? 'scale-[1.02] border-white/20 bg-gradient-to-r from-white/10 to-white/5 shadow-lg'
                      : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-black text-white">{item.name}</span>
                    </div>
                    <span className="text-base font-black text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="ml-7 flex items-baseline gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white/50">Time: </span>
                      <span className="font-mono text-xs font-black text-white">
                        {formatValue(item.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white/50">Sessions: </span>
                      <span className="text-xs font-black text-white">{item.sessions}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Insights */}
        {data.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20">
                <span className="material-symbols-outlined text-xl text-emerald-300">
                  lightbulb
                </span>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-black text-emerald-300">Quick Insight</div>
                <div className="text-xs font-medium leading-relaxed text-white/80">
                  Your most used mode is{' '}
                  <span className="font-black text-white">{data[0].name}</span> with{' '}
                  {((data[0].value / totalValue) * 100).toFixed(0)}% of your total time.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
