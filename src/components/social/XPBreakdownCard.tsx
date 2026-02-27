/**
 * XP Breakdown Card
 * Shows a detailed breakdown of how XP was earned today
 */

import { motion } from 'framer-motion'
import type { XPEvent } from './types'

interface XPBreakdownCardProps {
  events: XPEvent[]
  totalXP: number
}

export function XPBreakdownCard({ events, totalXP }: XPBreakdownCardProps) {
  // Group events by type and sum
  const grouped = events.reduce<Record<string, { label: string; icon: string; total: number; count: number }>>((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = { label: event.label, icon: event.icon, total: 0, count: 0 }
    }
    acc[event.type].total += event.amount
    acc[event.type].count += 1
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)

  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <h3 className="text-base font-bold text-white">Today's XP</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-700/50 mb-3">
            <span className="material-symbols-outlined text-3xl text-slate-500">electric_bolt</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">No XP earned yet today</p>
          <p className="text-xs text-slate-500 mt-1">Complete a habit to start earning!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <h3 className="text-base font-bold text-white">Today's XP</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
          <span className="text-sm font-bold text-primary">+{totalXP}</span>
          <span className="text-xs text-primary/70">XP</span>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2.5">
        {sortedGroups.map(([type, data], index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 rounded-xl bg-slate-700/30 px-3 py-2.5"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-700/50">
              <span className="material-symbols-outlined text-lg text-slate-300">{data.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{data.label}</p>
              {data.count > 1 && (
                <p className="text-[11px] text-slate-400">×{data.count}</p>
              )}
            </div>
            <span className="text-sm font-bold text-emerald-400">+{data.total}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
