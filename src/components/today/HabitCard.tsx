import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'

// ─── Gradient Color Palette (Modern Glassmorphic) ─────────────────────────────
const ICON_PALETTE: Record<string, { gradient: string; glow: string; accent: string }> = {
  directions_run:   { gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)', glow: 'rgba(20,184,166,0.35)', accent: '#2DD4BF' },
  auto_stories:     { gradient: 'linear-gradient(135deg, #0369A1, #0EA5E9)', glow: 'rgba(14,165,233,0.35)', accent: '#38BDF8' },
  menu_book:        { gradient: 'linear-gradient(135deg, #0369A1, #0EA5E9)', glow: 'rgba(14,165,233,0.35)', accent: '#38BDF8' },
  self_improvement: { gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6)', glow: 'rgba(139,92,246,0.35)', accent: '#A78BFA' },
  water_drop:       { gradient: 'linear-gradient(135deg, #0E7490, #06B6D4)', glow: 'rgba(6,182,212,0.35)',  accent: '#22D3EE' },
  fitness_center:   { gradient: 'linear-gradient(135deg, #C2410C, #F97316)', glow: 'rgba(249,115,22,0.35)', accent: '#FB923C' },
  bedtime:          { gradient: 'linear-gradient(135deg, #4338CA, #6366F1)', glow: 'rgba(99,102,241,0.35)', accent: '#818CF8' },
  edit_note:        { gradient: 'linear-gradient(135deg, #BE185D, #EC4899)', glow: 'rgba(236,72,153,0.35)', accent: '#F472B6' },
  directions_walk:  { gradient: 'linear-gradient(135deg, #047857, #10B981)', glow: 'rgba(16,185,129,0.35)', accent: '#34D399' },
  home:             { gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)', glow: 'rgba(20,184,166,0.35)', accent: '#2DD4BF' },
  default:          { gradient: 'linear-gradient(135deg, #475569, #64748B)', glow: 'rgba(100,116,139,0.30)', accent: '#94A3B8' },
}

const getPalette = (icon: string) => ICON_PALETTE[icon] ?? ICON_PALETTE.default

// ─── Regular Habit Card ───────────────────────────────────────────────────────
interface HabitCardProps {
  habit: any
  isCompleted: boolean
  index: number
  onToggle: () => void
  onBodyClick?: () => void
}

export function HabitCard({ habit, isCompleted, index, onToggle, onBodyClick }: HabitCardProps) {
  const palette = getPalette(habit.icon)
  const { getTaskCount } = useHabitTaskStore()
  const taskCount = getTaskCount(habit.id)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onBodyClick?.()
    }
  }

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onToggle()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 flex items-start gap-3.5 cursor-pointer transition-all duration-300 isolate",
        "border border-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        isCompleted
          ? "bg-slate-900/40"
          : "bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]"
      )}
      style={{ backdropFilter: 'blur(20px)' }}
      onClick={onBodyClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${habit.name}`}
    >
      {/* ── Ambient Glow (appears on hover, fades for completed) ── */}
      <div
        className={cn(
          "absolute -left-8 -top-8 size-32 rounded-full blur-[60px] transition-opacity duration-500 -z-10",
          isCompleted ? "opacity-0" : "opacity-0 group-hover:opacity-40"
        )}
        style={{ backgroundColor: palette.accent }}
      />

      {/* ── Icon ── */}
      <div className="relative shrink-0">
        {/* Icon glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl blur-lg transition-opacity duration-300",
            isCompleted ? "opacity-0" : "opacity-30 group-hover:opacity-50"
          )}
          style={{ background: palette.glow }}
        />
        <div
          className={cn(
            "relative flex size-12 items-center justify-center rounded-xl transition-all duration-300 shadow-lg",
            isCompleted && "opacity-50 saturate-50 scale-95"
          )}
          style={{ background: palette.gradient }}
        >
          <span className="material-symbols-outlined text-[26px] text-white/90 drop-shadow-sm">
            {habit.icon}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Title & Badges */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "text-[15px] font-semibold leading-snug tracking-tight transition-colors duration-200",
            isCompleted
              ? "text-slate-500 line-through decoration-slate-600/50"
              : "text-slate-100 group-hover:text-white"
          )}>
            {habit.name}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Streak */}
            {habit.currentStreak > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-orange-500/10 border border-orange-400/20 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[13px] text-orange-400">local_fire_department</span>
                <span className="text-[11px] font-bold text-orange-300/90 tabular-nums">{habit.currentStreak}</span>
              </div>
            )}

            {/* Tasks */}
            {taskCount > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[13px] text-blue-400">checklist</span>
                <span className="text-[11px] font-bold text-blue-300/90 tabular-nums">{taskCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className={cn(
            "text-[13px] leading-relaxed line-clamp-1 transition-colors duration-200",
            isCompleted ? "text-slate-600" : "text-slate-400 group-hover:text-slate-300"
          )}>
            {habit.description}
          </p>
        )}

        {/* Category & Goal */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-[3px] rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
            {habit.category || 'General'}
          </span>
          {habit.goal && (
            <span className="text-[11px] text-slate-500/80 tabular-nums font-medium">
              {habit.goal} {habit.goalPeriod}
            </span>
          )}
        </div>
      </div>

      {/* ── Glowing Orb Completion Button (Option 5) ── */}
      <motion.div
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        onKeyDown={handleCheckboxKeyDown}
        className="relative flex size-10 shrink-0 self-center items-center justify-center cursor-pointer"
        tabIndex={0}
        role="checkbox"
        aria-checked={isCompleted}
        aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring - pulsing (uncompleted only) */}
        {!isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-teal-400/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Middle glow - subtle */}
        <motion.div
          className={cn(
            'absolute inset-1 rounded-full transition-all duration-300',
            isCompleted
              ? 'bg-teal-400/30 shadow-[0_0_20px_rgba(45,212,191,0.5)]'
              : 'bg-teal-400/10 group-hover:bg-teal-400/20'
          )}
          animate={
            isCompleted
              ? {
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.95, 1, 0.95],
                }
              : {}
          }
          transition={
            isCompleted
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
        />

        {/* Inner orb - main button */}
        <motion.div
          className={cn(
            'relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            isCompleted
              ? 'border-teal-400 bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]'
              : 'border-teal-400/40 bg-slate-900/60 backdrop-blur-sm hover:border-teal-400/70 hover:bg-slate-800/60'
          )}
          whileHover={!isCompleted ? { boxShadow: '0 0 20px rgba(45,212,191,0.4)' } : {}}
        >
          {/* Checkmark */}
          <motion.span
            className="material-symbols-outlined text-base font-bold text-white"
            initial={false}
            animate={{
              scale: isCompleted ? [0, 1.2, 1] : 0,
              opacity: isCompleted ? 1 : 0,
              rotate: isCompleted ? [0, 10, 0] : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 28,
            }}
          >
            check
          </motion.span>
        </motion.div>
      </motion.div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 isolate",
        "bg-white/[0.03] border border-white/[0.06]"
      )}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* ── Liquid fill background ── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to top, rgba(34,211,238,${isCompleted ? 0.12 : 0.06}) ${pct}%, transparent ${pct}%)`,
          transition: 'background 0.6s ease-out',
        }}
      />

      {/* ── Ambient glow ── */}
      <div
        className="absolute -bottom-12 -left-12 size-40 rounded-full bg-cyan-500/20 blur-[80px] -z-10 transition-opacity duration-500"
        style={{ opacity: pct > 30 ? 0.4 : 0.15 }}
      />

      {/* ── Header row ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 rounded-xl blur-lg transition-opacity duration-300",
                isCompleted ? "opacity-40" : "opacity-25 group-hover:opacity-45"
              )}
              style={{ background: 'rgba(34,211,238,0.4)' }}
            />
            <div className="relative flex size-11 items-center justify-center rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0E7490, #22D3EE)' }}
            >
              <span className="material-symbols-outlined text-[22px] text-white/90 drop-shadow-sm">water_drop</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-[15px] font-semibold text-slate-100 leading-tight tracking-tight">{habit.name}</h3>
            <p className="text-[13px] font-medium text-cyan-300/50 tabular-nums mt-0.5">
              {waterCount} / {maxCups} cups
            </p>
          </div>
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onAddWater}
          disabled={isCompleted}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40",
            isCompleted
              ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]"
              : "bg-white/[0.05] border border-cyan-400/25 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          )}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCompleted ? 'check' : 'add'}
          </span>
        </motion.button>
      </div>

      {/* ── Cup Indicators ── */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxCups }).map((_, i) => (
          <motion.div
            key={i}
            className="h-7 flex-1 rounded-full relative overflow-hidden"
            style={{
              background: i < waterCount ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i < waterCount ? 'rgba(34,211,238,0.25)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{
                background: 'linear-gradient(to top, rgba(34,211,238,0.6), rgba(34,211,238,0.25))',
              }}
              initial={{ height: '0%' }}
              animate={{ height: i < waterCount ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 22, delay: i * 0.03 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}