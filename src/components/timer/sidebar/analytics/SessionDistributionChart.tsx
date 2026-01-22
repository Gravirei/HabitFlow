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
      className="group bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 hover:border-emerald-400/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
    >
      {/* Animated background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl group-hover:blur-xl transition-all duration-700" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
              <h3 className="text-white font-black text-lg sm:text-xl tracking-tight">
                Session Breakdown
              </h3>
            </div>
            <p className="text-white/60 text-xs sm:text-sm font-medium ml-4">
              Distribution by timer mode
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('time')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                viewMode === 'time'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setViewMode('count')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                viewMode === 'count'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Count
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="w-full lg:w-1/2 h-[220px] sm:h-[250px] relative">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-white/60 text-xs mb-1 font-semibold">Total</div>
              <div className="text-white font-black text-2xl font-mono">
                {viewMode === 'time' ? formatValue(totalValue) : totalValue}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full lg:w-1/2 space-y-3.5">
            {data.map((item, index) => {
              const percentage = ((viewMode === 'time' ? item.value : item.sessions) /
                (viewMode === 'time' ? totalValue : data.reduce((sum, d) => sum + d.sessions, 0))) * 100
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
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group/item ${
                    isActive
                      ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 scale-[1.02] shadow-lg'
                      : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white font-black text-sm">{item.name}</span>
                    </div>
                    <span className="text-white font-black text-base">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4 ml-7">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/50 text-xs font-semibold">Time: </span>
                      <span className="text-white text-xs font-black font-mono">
                        {formatValue(item.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/50 text-xs font-semibold">Sessions: </span>
                      <span className="text-white text-xs font-black">
                        {item.sessions}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Insights */}
        {data.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30">
                <span className="material-symbols-outlined text-emerald-300 text-xl">lightbulb</span>
              </div>
              <div>
                <div className="text-emerald-300 font-black text-sm mb-1.5">Quick Insight</div>
                <div className="text-white/80 text-xs leading-relaxed font-medium">
                  Your most used mode is <span className="text-white font-black">{data[0].name}</span> with{' '}
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
