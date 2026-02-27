import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { useCategoryStore } from '@/store/useCategoryStore'

// ─── Icon Color Gradients (exact match to Habits page iconColor index 0–5) ────
const ICON_COLOR_GRADIENTS: Record<number, string> = {
  0: 'from-blue-500 to-cyan-500',      // 0: Blue
  1: 'from-purple-500 to-pink-500',    // 1: Purple
  2: 'from-emerald-500 to-teal-500',   // 2: Green
  3: 'from-orange-500 to-amber-500',   // 3: Orange
  4: 'from-red-500 to-rose-500',       // 4: Red
  5: 'from-teal-500 to-cyan-500',      // 5: Teal
}

// ─── Glow colors matching icon gradients ─────────────────────────────────────
const ICON_GLOW_COLORS: Record<number, string> = {
  0: '#3B82F6', // Blue
  1: '#A855F7', // Purple
  2: '#10B981', // Emerald/Green
  3: '#F97316', // Orange
  4: '#EF4444', // Red
  5: '#14B8A6', // Teal
}

const getIconGradient = (iconColor: number = 0): string =>
  ICON_COLOR_GRADIENTS[iconColor] ?? ICON_COLOR_GRADIENTS[0]

const getGlowColor = (iconColor: number = 0): string =>
  ICON_GLOW_COLORS[iconColor] ?? ICON_GLOW_COLORS[0]

// ─── Regular Habit Card ───────────────────────────────────────────────────────
interface HabitCardProps {
  habit: any
  isCompleted: boolean
  index: number
  onToggle: () => void
  onBodyClick?: () => void
  onLongPress?: () => void
  onNotesClick?: () => void
  enableLayoutAnimation?: boolean
}

export function HabitCard({ habit, isCompleted, index, onToggle, onBodyClick, onLongPress, onNotesClick, enableLayoutAnimation }: HabitCardProps) {
  const iconGradient = getIconGradient(habit.iconColor ?? 0)
  const glowColor = getGlowColor(habit.iconColor ?? 0)
  const { getTaskCount, getCompletedTaskCount } = useHabitTaskStore()
  const taskCount = getTaskCount(habit.id)
  const completedTaskCount = getCompletedTaskCount(habit.id)
  const allTasksDone = taskCount > 0 && completedTaskCount === taskCount

  // ── Scrolling marquee text (Category | Frequency | Goal) ────────────────
  const getCategoryById = useCategoryStore((s) => s.getCategoryById)
  const categoryName = habit.categoryId
    ? getCategoryById(habit.categoryId)?.name ?? habit.category ?? 'General'
    : habit.category ?? 'General'
  const frequencyLabel = habit.frequency
    ? habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)
    : ''
  const goalLabel = habit.goal ? `${habit.goal} ${habit.goalPeriod || ''}`.trim() : ''
  const marqueeText = [categoryName, frequencyLabel, goalLabel].filter(Boolean).join(' | ')
  const marqueeDelay = useMemo(() => -(Math.random() * 14), [])

  // ── Long Press Detection ──────────────────────────────────────────────────
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const handlePointerDown = () => {
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      onLongPress?.()
    }, 400)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Animation phase: 'ring' | 'shrinking' | 'filling' | 'done'
  const [orbPhase, setOrbPhase] = useState<'ring' | 'shrinking' | 'filling' | 'done'>(
    isCompleted ? 'done' : 'ring'
  )
  const prevAllTasksDone = useRef(allTasksDone)
  const isAnimating = useRef(false)

  useEffect(() => {
    // Trigger animation only when transitioning from not-all-done → all-done
    if (allTasksDone && !prevAllTasksDone.current && !isCompleted) {
      isAnimating.current = true
      setOrbPhase('shrinking')
      // After ring shrinks (750ms), start orb fill
      const t1 = setTimeout(() => setOrbPhase('filling'), 750)
      // After orb fills (750ms), finalize done phase and mark habit complete
      const t2 = setTimeout(() => {
        setOrbPhase('done')
        isAnimating.current = false
        onToggle()
      }, 1500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    prevAllTasksDone.current = allTasksDone
  }, [allTasksDone])

  useEffect(() => {
    // Don't interrupt the shrinking → filling → done animation
    if (isAnimating.current) return
    // Sync phase when isCompleted changes externally (e.g. un-toggling)
    if (!isCompleted && orbPhase === 'done') setOrbPhase('ring')
    if (isCompleted && orbPhase !== 'done') setOrbPhase('done')
  }, [isCompleted])

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
        "group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all duration-300 isolate",
        "border border-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        "bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]"
      )}
      style={{ backdropFilter: 'blur(20px)' }}
      onClick={() => { if (!longPressFired.current) onBodyClick?.() }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${habit.name}`}
    >
      {/* ── Ambient Glow (appears on hover, matches icon color) ── */}
      <div
        className="absolute -left-8 -top-8 size-32 rounded-full blur-[60px] transition-opacity duration-500 -z-10 opacity-0 group-hover:opacity-40"
        style={{ backgroundColor: glowColor }}
      />

      {/* ── Icon ── */}
      <div className="relative shrink-0 self-center">
        {/* Icon glow ring */}
        <div
          className="absolute inset-0 rounded-xl blur-lg transition-opacity duration-300 opacity-30 group-hover:opacity-50"
          style={{ background: 'rgba(45,212,191,0.35)' }}
        />
        <div
          className={cn(
            "relative flex size-12 items-center justify-center rounded-xl transition-all duration-300 shadow-lg bg-gradient-to-br",
            iconGradient
          )}
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
              ? "text-slate-500 line-through decoration-slate-400 decoration-2"
              : "text-slate-100 group-hover:text-white"
          )}>
            {habit.name}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Pin indicator — minimal, no badge */}
            {habit.pinned && (
              <span className="material-symbols-outlined text-[14px] text-teal-400/60">keep</span>
            )}

            {/* Streak — shows current/goal with color states */}
            {habit.currentStreak > 0 && (
              <div className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border backdrop-blur-sm",
                habit.goal > 1 && habit.currentStreak > habit.goal
                  ? "bg-red-500/10 border-red-400/20"
                  : habit.goal > 1 && habit.currentStreak >= habit.goal
                    ? "bg-green-500/10 border-green-400/20"
                    : "bg-orange-500/10 border-orange-400/20"
              )}>
                <span className={cn(
                  "material-symbols-outlined text-[13px]",
                  habit.goal > 1 && habit.currentStreak > habit.goal
                    ? "text-red-400"
                    : habit.goal > 1 && habit.currentStreak >= habit.goal
                      ? "text-green-400"
                      : "text-orange-400"
                )}>local_fire_department</span>
                <span className={cn(
                  "text-[11px] font-bold tabular-nums",
                  habit.goal > 1 && habit.currentStreak > habit.goal
                    ? "text-red-300/90 animate-pulse"
                    : habit.goal > 1 && habit.currentStreak >= habit.goal
                      ? "text-green-300/90"
                      : "text-orange-300/90"
                )}>
                  {habit.goal > 1 ? `${habit.currentStreak}/${habit.goal}` : habit.currentStreak}
                </span>
              </div>
            )}

            {/* Tasks */}
            {taskCount > 0 && (
              <div className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg backdrop-blur-sm transition-colors duration-300",
                allTasksDone
                  ? "bg-emerald-500/15 border border-emerald-400/30"
                  : "bg-blue-500/10 border border-blue-400/20"
              )}>
                <span className={cn(
                  "material-symbols-outlined text-[13px] transition-colors duration-300",
                  allTasksDone ? "text-emerald-400" : "text-blue-400"
                )}>checklist</span>
                <span className={cn(
                  "text-[11px] font-bold tabular-nums transition-colors duration-300",
                  allTasksDone ? "text-emerald-300/90" : "text-blue-300/90"
                )}>
                  {allTasksDone ? completedTaskCount : `${completedTaskCount}/${taskCount}`}
                </span>
              </div>
            )}

            {/* Notes Badge */}
            {habit.notes && habit.notes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNotesClick?.()
                }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-400/20 backdrop-blur-sm hover:bg-amber-500/20 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-[13px] text-amber-400">note</span>
                <span className="text-[11px] font-bold text-amber-300/90 tabular-nums">{habit.notes.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className={cn(
            "text-[13px] leading-relaxed line-clamp-1 transition-colors duration-200 text-slate-400 group-hover:text-slate-300",
            isCompleted && "line-through decoration-slate-400/70"
          )}>
            {habit.description}
          </p>
        )}

        {/* Category Info — Scrolling Marquee */}
        <div className="marquee-container mt-0.5 h-5">
          <div className="marquee-track" style={{ animationDelay: `${marqueeDelay}s` }}>
            <span className="text-[11px] font-medium text-slate-500/80 tracking-wide">{marqueeText}</span>
            <span className="text-[11px] font-medium text-slate-500/80 tracking-wide">{marqueeText}</span>
          </div>
        </div>
      </div>

      {/* ── Glowing Orb Completion Button ── */}
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
              ? { opacity: [0.3, 0.5, 0.3], scale: [0.95, 1, 0.95] }
              : {}
          }
          transition={
            isCompleted
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        />

        {/* SVG Progress Ring — visible during 'ring' and 'shrinking' phases */}
        <AnimatePresence>
          {taskCount > 0 && (orbPhase === 'ring' || orbPhase === 'shrinking') && (() => {
            const size = 32
            const strokeWidth = 2.5
            const radius = (size - strokeWidth) / 2
            const circumference = 2 * Math.PI * radius
            const progress = completedTaskCount / taskCount
            const dashOffset = circumference * (1 - progress)
            return (
              <motion.svg
                key="progress-ring"
                className="absolute z-20 pointer-events-none"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ top: '50%', left: '50%', marginTop: -size/2, marginLeft: -size/2 }}
                initial={{ scale: 1, opacity: 1, rotate: -90 }}
                animate={
                  orbPhase === 'shrinking'
                    ? { scale: 0, opacity: 0, rotate: -90 }
                    : { scale: 1, opacity: 1, rotate: -90 }
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeIn' }}
              >
                {/* Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(45,212,191,0.15)"
                  strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(45,212,191,0.9)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </motion.svg>
            )
          })()}
        </AnimatePresence>

        {/* Inner orb - main button */}
        <motion.div
          className={cn(
            'relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            orbPhase === 'done'
              ? 'border-teal-400 bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]'
              : taskCount > 0
                ? 'border-transparent bg-slate-900/60 backdrop-blur-sm'
                : 'border-teal-400/40 bg-slate-900/60 backdrop-blur-sm hover:border-teal-400/70 hover:bg-slate-800/60'
          )}
          whileHover={orbPhase !== 'done' ? { boxShadow: '0 0 20px rgba(45,212,191,0.4)' } : {}}
        >
          {/* Orb fill ripple — expands from center during 'filling' phase */}
          <AnimatePresence>
            {orbPhase === 'filling' && (
              <motion.div
                key="orb-fill"
                className="absolute rounded-full bg-gradient-to-br from-teal-400 to-teal-600"
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: 32, height: 32, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
          </AnimatePresence>

          {/* Checkmark */}
          <motion.span
            className="material-symbols-outlined text-base font-bold text-white relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: orbPhase === 'done' ? 1 : 0,
              opacity: orbPhase === 'done' ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
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