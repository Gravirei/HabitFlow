import { motion } from 'framer-motion'
import clsx from 'clsx'

// ─── Color map ────────────────────────────────────────────────────────────────
const ICON_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  directions_run:  { accent: '#22C55E', glow: 'rgba(34,197,94,0.2)',   bg: 'rgba(34,197,94,0.08)'   },
  auto_stories:    { accent: '#3B82F6', glow: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.08)'  },
  menu_book:       { accent: '#3B82F6', glow: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.08)'  },
  self_improvement:{ accent: '#A855F7', glow: 'rgba(168,85,247,0.2)',  bg: 'rgba(168,85,247,0.08)'  },
  water_drop:      { accent: '#06B6D4', glow: 'rgba(6,182,212,0.2)',   bg: 'rgba(6,182,212,0.08)'   },
  fitness_center:  { accent: '#F97316', glow: 'rgba(249,115,22,0.2)',  bg: 'rgba(249,115,22,0.08)'  },
  bedtime:         { accent: '#6366F1', glow: 'rgba(99,102,241,0.2)',  bg: 'rgba(99,102,241,0.08)'  },
  edit_note:       { accent: '#EC4899', glow: 'rgba(236,72,153,0.2)',  bg: 'rgba(236,72,153,0.08)'  },
  directions_walk: { accent: '#14B8A6', glow: 'rgba(20,184,166,0.2)',  bg: 'rgba(20,184,166,0.08)'  },
  default:         { accent: '#94A3B8', glow: 'rgba(148,163,184,0.2)', bg: 'rgba(148,163,184,0.08)' },
}

const getColors = (icon: string) => ICON_COLORS[icon] ?? ICON_COLORS.default

// ─── Regular Habit Card ───────────────────────────────────────────────────────
interface HabitCardProps {
  habit: any
  isCompleted: boolean
  index: number
  onToggle: () => void
}

export function HabitCard({ habit, isCompleted, index, onToggle }: HabitCardProps) {
  const c = getColors(habit.icon)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200"
      style={{
        background: isCompleted
          ? `linear-gradient(135deg, ${c.bg} 0%, rgba(255,255,255,0.03) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isCompleted ? c.accent + '40' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isCompleted ? `0 4px 20px ${c.glow}` : 'none',
      }}
      onClick={onToggle}
      role="checkbox"
      aria-checked={isCompleted}
      aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
    >
      {/* Glow blob on completed */}
      {isCompleted && (
        <div className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: c.accent }} />
      )}

      {/* Left accent strip */}
      <div className="absolute left-0 inset-y-3 w-[3px] rounded-r-full transition-all duration-300"
        style={{ backgroundColor: isCompleted ? c.accent : 'transparent' }} />

      {/* Icon */}
      <div
        className="relative flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: c.bg, border: `1px solid ${c.accent}20` }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ color: c.accent }} aria-hidden="true">
          {habit.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          "text-sm font-bold leading-tight truncate transition-colors duration-200",
          isCompleted ? "text-white/60 line-through" : "text-white"
        )}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${c.accent}18`, color: c.accent }}>
            {habit.category || 'General'}
          </span>
          {habit.goal && (
            <span className="text-[10px] text-slate-600 tabular-nums">
              {habit.goal} {habit.goalPeriod}
            </span>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div
        className="relative flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300"
        style={{
          backgroundColor: isCompleted ? c.accent : 'rgba(255,255,255,0.05)',
          border: `2px solid ${isCompleted ? c.accent : 'rgba(255,255,255,0.12)'}`,
          boxShadow: isCompleted ? `0 0 12px ${c.glow}` : 'none',
        }}
      >
        <motion.svg
          viewBox="0 0 12 10"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <motion.path d="M1 5l3.5 3.5L11 1" />
        </motion.svg>
      </div>
    </motion.div>
  )
}

// ─── Hydration Card ───────────────────────────────────────────────────────────
interface HydrationCardProps {
  habit: any
  isCompleted: boolean
  waterCount: number
  index: number
  onAddWater: () => void
}

export function HydrationCard({ habit, isCompleted, waterCount, index, onAddWater }: HydrationCardProps) {
  const maxCups = habit.goal || 8
  const pct = (waterCount / maxCups) * 100
  const c = ICON_COLORS.water_drop

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl p-4"
      style={{
        background: 'rgba(6,182,212,0.06)',
        border: `1px solid ${isCompleted ? c.accent + '40' : 'rgba(6,182,212,0.15)'}`,
        boxShadow: isCompleted ? `0 4px 20px ${c.glow}` : 'none',
      }}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: c.accent }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: c.bg, border: `1px solid ${c.accent}20` }}>
            <span className="material-symbols-outlined text-xl" style={{ color: c.accent }} aria-hidden="true">water_drop</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{habit.name}</p>
            <p className="text-[10px] tabular-nums" style={{ color: c.accent }}>
              {waterCount} / {maxCups} cups
            </p>
          </div>
        </div>

        <button
          onClick={onAddWater}
          disabled={isCompleted}
          aria-label={isCompleted ? `${habit.name} completed` : `Add cup`}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200 active:scale-90 disabled:cursor-default"
          style={{
            backgroundColor: isCompleted ? c.accent : `${c.accent}22`,
            border: `1.5px solid ${c.accent}`,
            color: isCompleted ? 'white' : c.accent,
          }}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {isCompleted ? 'check' : 'add'}
          </span>
        </button>
      </div>

      {/* Cups grid */}
      <div className="flex gap-1.5">
        {Array.from({ length: maxCups }).map((_, i) => (
          <motion.div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{ backgroundColor: i < waterCount ? c.accent : 'rgba(255,255,255,0.06)' }}
            animate={{ backgroundColor: i < waterCount ? c.accent : 'rgba(255,255,255,0.06)' }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Progress label */}
      <p className="mt-1.5 text-right text-[10px] font-semibold tabular-nums" style={{ color: c.accent }}>
        {Math.round(pct)}%
      </p>
    </motion.div>
  )
}
