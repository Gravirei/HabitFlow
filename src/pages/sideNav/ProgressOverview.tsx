/**
 * Progress Overview — Full-featured habit progress dashboard
 * Features: Stats hero, calendar heatmap, weekly chart, habit strength + sparklines,
 *           milestone tracker, target vs actual, day patterns, motivational banner
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useNewHabitModalStore } from '@/store/useNewHabitModalStore'
import {
  buildHeatmapData,
  getSparklineData,
  getDayOfWeekPatterns,
  calculateHabitStrength,
  calculateCompletionRate,
  getUpcomingMilestones,
  getTargetVsActual,
  getMotivation,
} from '@/utils/progressUtils'
import { calculateCurrentStreak, calculateBestStreak } from '@/utils/streakUtils'

type TimePeriod = 'week' | 'month' | 'all'

/** Map a habit's iconColor index (0-5) to a Tailwind gradient pair. */
const ICON_GRADIENTS = [
  'from-blue-500 to-cyan-500', // 0: Blue
  'from-purple-500 to-pink-500', // 1: Purple
  'from-emerald-500 to-teal-500', // 2: Green
  'from-orange-500 to-amber-500', // 3: Orange
  'from-red-500 to-rose-500', // 4: Red
  'from-teal-500 to-cyan-500', // 5: Teal
]
const getIconGradient = (iconColor: number = 0) => ICON_GRADIENTS[iconColor] || ICON_GRADIENTS[0]

const periodLabels: Record<TimePeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
}

/* ═══════════════════════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ─── Section Header ────────────────────────────────────────────────────────── */
function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between sm:mb-5">
      <div>
        <h3 className="text-base font-bold text-white sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─── Card Wrapper ──────────────────────────────────────────────────────────── */
function Card({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 ${
        hover ? 'transition-colors duration-200 hover:border-slate-700' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  suffix,
  icon,
  gradient,
  change,
}: {
  label: string
  value: string | number
  suffix?: string
  icon: string
  gradient: string
  change?: string
}) {
  return (
    <Card hover className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br sm:h-8 sm:w-8 ${gradient}`}
        >
          <span className="material-symbols-outlined text-sm text-white sm:text-base">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</span>
        {suffix && <span className="text-sm font-medium text-slate-500 sm:text-lg">{suffix}</span>}
      </div>
      {change && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-400">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          {change}
        </div>
      )}
    </Card>
  )
}

/* ─── Sparkline (mini bar chart) ────────────────────────────────────────────── */
function Sparkline({ data }: { data: boolean[] }) {
  return (
    <div className="flex h-4 items-end gap-[3px]">
      {data.map((completed, i) => (
        <div
          key={i}
          className={`w-[4px] rounded-full transition-all duration-300 ${
            completed ? 'h-full bg-gradient-to-t from-primary to-green-400' : 'h-1.5 bg-slate-700'
          }`}
        />
      ))}
    </div>
  )
}

/* ─── Habit Strength — Interactive Donut + List ─────────────────────────────── */
interface HabitStrengthEntry {
  habit: { id: string; name: string; icon?: string; iconColor?: number }
  strength: { overall: number; recency: number; frequency: number; streak: number }
  sparkline: boolean[]
}

function DonutChart({
  recency,
  frequency,
  streak,
  overall,
}: {
  recency: number
  frequency: number
  streak: number
  overall: number
}) {
  const total = recency + frequency + streak || 1
  const radius = 40
  const circumference = 2 * Math.PI * radius

  // Calculate arc lengths for each segment
  const recencyArc = (recency / total) * circumference
  const frequencyArc = (frequency / total) * circumference
  const streakArc = (streak / total) * circumference

  // Gap between segments
  const gap = total > 0 ? 4 : 0
  const recencyDash = Math.max(0, recencyArc - gap)
  const frequencyDash = Math.max(0, frequencyArc - gap)
  const streakDash = Math.max(0, streakArc - gap)

  const scoreColor =
    overall >= 70 ? 'text-green-400' : overall >= 40 ? 'text-blue-400' : 'text-amber-400'

  return (
    <div className="relative aspect-square w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[260px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
        {/* Background ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-800"
        />

        {/* Recency arc (cyan) */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-cyan-400 transition-all duration-700"
          strokeDasharray={`${recencyDash} ${circumference - recencyDash}`}
          strokeDashoffset={0}
        />

        {/* Frequency arc (green) */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-green-400 transition-all duration-700"
          strokeDasharray={`${frequencyDash} ${circumference - frequencyDash}`}
          strokeDashoffset={-recencyArc}
        />

        {/* Streak arc (orange) */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-orange-400 transition-all duration-700"
          strokeDasharray={`${streakDash} ${circumference - streakDash}`}
          strokeDashoffset={-(recencyArc + frequencyArc)}
        />
      </svg>
      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black sm:text-3xl ${scoreColor}`}>{overall}</span>
        <span className="-mt-0.5 text-[9px] font-medium text-slate-500 sm:text-[10px]">score</span>
      </div>
    </div>
  )
}

function HabitStrengthCard({ habitStrengths }: { habitStrengths: HabitStrengthEntry[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = habitStrengths[selectedIdx]

  return (
    <Card className="p-4 sm:p-6">
      <SectionHeader title="Habit Strength" subtitle="Tap a habit to see its breakdown" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left column: donut chart + legend */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <DonutChart
            recency={selected.strength.recency}
            frequency={selected.strength.frequency}
            streak={selected.strength.streak}
            overall={selected.strength.overall}
          />
          {/* Legend */}
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400 sm:text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400"></span>
              Recency{' '}
              <span className="ml-auto pl-2 text-slate-500">{selected.strength.recency}%</span>
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 sm:text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-400"></span>
              Frequency{' '}
              <span className="ml-auto pl-2 text-slate-500">{selected.strength.frequency}%</span>
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-400 sm:text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400"></span>
              Streak{' '}
              <span className="ml-auto pl-2 text-slate-500">{selected.strength.streak}%</span>
            </span>
          </div>
        </div>

        {/* Right column: habit list */}
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          {habitStrengths.map(({ habit, strength, sparkline }, idx) => {
            const isActive = idx === selectedIdx
            const scoreColor =
              strength.overall >= 70
                ? 'text-green-400'
                : strength.overall >= 40
                  ? 'text-blue-400'
                  : 'text-amber-400'

            return (
              <button
                key={habit.id}
                onClick={() => setSelectedIdx(idx)}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-2 text-left transition-all duration-200 sm:gap-3 sm:p-2.5 ${
                  isActive
                    ? 'border border-slate-600/60 bg-slate-700/60 shadow-sm'
                    : 'border border-transparent bg-transparent hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br sm:h-9 sm:w-9 ${getIconGradient(habit.iconColor)} shadow-md`}
                >
                  <span className="material-symbols-outlined text-sm text-white sm:text-base">
                    {habit.icon || 'check_circle'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white sm:text-sm">
                    {habit.name}
                  </p>
                  <div className="mt-0.5">
                    <Sparkline data={sparkline} />
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-black sm:text-base ${scoreColor}`}>
                  {strength.overall}
                </span>
                {isActive && (
                  <span className="material-symbols-outlined shrink-0 text-sm text-slate-400">
                    chevron_right
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

/* ─── Heatmap Level Colors ──────────────────────────────────────────────────── */
const HEATMAP_COLORS = [
  'bg-slate-800/60', // 0 = no activity
  'bg-primary/20', // 1 = low
  'bg-primary/40', // 2 = medium
  'bg-primary/70', // 3 = high
  'bg-primary', // 4 = max
]

/* ─── Status Badge ──────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: 'on-track' | 'behind' | 'ahead' }) {
  const styles = {
    ahead: 'bg-green-500/15 text-green-400 border-green-500/20',
    'on-track': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    behind: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }
  const icons = { ahead: 'arrow_upward', 'on-track': 'check', behind: 'arrow_downward' }
  const labels = { ahead: 'Ahead', 'on-track': 'On Track', behind: 'Behind' }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold sm:text-xs ${styles[status]}`}
    >
      <span className="material-symbols-outlined text-xs">{icons[status]}</span>
      {labels[status]}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export function ProgressOverview() {
  const navigate = useNavigate()
  const openNewHabit = useNewHabitModalStore((s) => s.open)
  const { getActiveHabits } = useHabitStore()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')

  // ── Computed data (all dynamically calculated from completedDates) ──
  const activeHabits = useMemo(() => getActiveHabits(), [getActiveHabits])
  const totalHabits = activeHabits.length
  const totalCompletions = activeHabits.reduce((s, h) => s + h.completedDates.length, 0)
  const avgCompletion = useMemo(() => {
    if (totalHabits === 0) return 0
    const sum = activeHabits.reduce(
      (s, h) =>
        s +
        calculateCompletionRate(
          h.frequency,
          h.startDate,
          h.completedDates.length,
          h.goal,
          h.weeklyTimesPerWeek
        ),
      0
    )
    return Math.round(sum / totalHabits)
  }, [activeHabits, totalHabits])
  const longestStreak = useMemo(
    () => Math.max(...activeHabits.map((h) => calculateCurrentStreak(h.completedDates)), 0),
    [activeHabits]
  )
  const bestStreak = useMemo(
    () => Math.max(...activeHabits.map((h) => calculateBestStreak(h.completedDates)), 0),
    [activeHabits]
  )

  const heatmapData = useMemo(() => buildHeatmapData(activeHabits, 12), [activeHabits])
  const dayPatterns = useMemo(() => getDayOfWeekPatterns(activeHabits), [activeHabits])
  const milestones = useMemo(() => getUpcomingMilestones(activeHabits, 3), [activeHabits])
  const targetVsActual = useMemo(() => getTargetVsActual(activeHabits).slice(0, 5), [activeHabits])
  const motivation = useMemo(
    () => getMotivation(avgCompletion, longestStreak, totalHabits),
    [avgCompletion, longestStreak, totalHabits]
  )

  const sortedHabits = useMemo(
    () =>
      [...activeHabits].sort((a, b) => {
        const rateA = calculateCompletionRate(
          a.frequency,
          a.startDate,
          a.completedDates.length,
          a.goal,
          a.weeklyTimesPerWeek
        )
        const rateB = calculateCompletionRate(
          b.frequency,
          b.startDate,
          b.completedDates.length,
          b.goal,
          b.weeklyTimesPerWeek
        )
        return rateB - rateA
      }),
    [activeHabits]
  )

  const habitStrengths = useMemo(
    () =>
      sortedHabits.slice(0, 5).map((h) => ({
        habit: h,
        strength: calculateHabitStrength(h),
        sparkline: getSparklineData(h, 7),
      })),
    [sortedHabits]
  )

  // Weekly chart mock (we derive from day patterns for visual)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyPctData = dayPatterns
    .slice(1) // Skip Sunday (idx 0)
    .concat(dayPatterns.slice(0, 1)) // Append Sunday at end
  const maxDayPct = Math.max(...weeklyPctData.map((d) => d.percentage), 1)

  // Heatmap grid: organize into columns (weeks)
  const heatmapWeeks: (typeof heatmapData)[] = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    heatmapWeeks.push(heatmapData.slice(i, i + 7))
  }

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 shrink-0 bg-background-light/95 backdrop-blur-sm dark:bg-background-dark/95">
        <div className="flex flex-col gap-2 px-4 pb-3 pt-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <button
              onClick={() => navigate('/today')}
              aria-label="Go back"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="flex-1 overflow-hidden px-4 text-center">
              <h1 className="text-lg font-bold tracking-tight text-white">Progress</h1>
            </div>
            <button
              onClick={() => navigate('/statistics')}
              aria-label="View detailed statistics"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">bar_chart</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5 pt-4 sm:space-y-6 sm:pt-6">
          {/* ── Motivational Banner ──────────────────────────────────── */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 sm:p-6 ${motivation.gradient}`}
          >
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/5 sm:h-48 sm:w-48 sm:-translate-y-24 sm:translate-x-24" />
            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
                <span className="material-symbols-outlined text-lg text-white sm:text-2xl">
                  {motivation.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-sm font-black text-white sm:text-base">
                  {motivation.title}
                </p>
                <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                  {motivation.message}
                </p>
              </div>
            </div>
          </div>

          {/* ── Time Period Selector ──────────────────────────────────── */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
            {(['week', 'month', 'all'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm ${
                  timePeriod === p
                    ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                aria-pressed={timePeriod === p}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* ── Hero Stats Grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Completion"
              value={avgCompletion}
              suffix="%"
              icon="check_circle"
              gradient="from-green-500 to-emerald-500"
            />
            <StatCard
              label="Current Streak"
              value={longestStreak}
              suffix="days"
              icon="local_fire_department"
              gradient="from-orange-500 to-red-500"
              change={`Best: ${bestStreak}`}
            />
            <StatCard
              label="Completions"
              value={totalCompletions}
              icon="task_alt"
              gradient="from-blue-500 to-indigo-500"
            />
            <StatCard
              label="Active Habits"
              value={totalHabits}
              icon="self_improvement"
              gradient="from-violet-500 to-purple-500"
            />
          </div>

          {/* ── Calendar Heatmap ───────────────────────────────────────── */}
          <Card className="p-4 sm:p-6">
            <SectionHeader
              title="Activity Heatmap"
              subtitle="Last 12 weeks"
              action={
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-[10px] text-slate-500">Less</span>
                  {HEATMAP_COLORS.map((color, i) => (
                    <div key={i} className={`h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5 ${color}`} />
                  ))}
                  <span className="ml-1 text-[10px] text-slate-500">More</span>
                </div>
              }
            />
            <div className="-mx-2 overflow-x-auto px-2">
              <div className="flex min-w-fit gap-[3px] sm:gap-1">
                {heatmapWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px] sm:gap-1">
                    {week.map((cell) => (
                      <div
                        key={cell.date}
                        className={`h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5 ${HEATMAP_COLORS[cell.level]} group relative cursor-default transition-colors duration-200`}
                        title={`${cell.date}: ${cell.count} completions`}
                      >
                        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {cell.count} · {cell.date.slice(5)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Weekly Completion + Day Patterns (side by side on lg) ──── */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            {/* Weekly Bar Chart */}
            <Card className="p-4 sm:p-6">
              <SectionHeader title="Weekly Completion" />
              <div className="flex h-28 items-end justify-between gap-1.5 sm:h-36 sm:gap-3">
                {weekDays.map((day, i) => {
                  const pct = weeklyPctData[i]?.percentage ?? 0
                  const heightPct = Math.round((pct / maxDayPct) * 100)
                  const isHighest = pct === maxDayPct && pct > 0
                  return (
                    <div
                      key={day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2"
                    >
                      <div
                        className={`group relative min-h-[4px] w-full cursor-pointer rounded-t-md transition-all duration-200 sm:rounded-t-lg ${
                          isHighest
                            ? 'bg-gradient-to-t from-primary to-green-400'
                            : pct > 0
                              ? 'bg-gradient-to-t from-primary/30 to-primary/50 hover:from-primary/50 hover:to-primary/70'
                              : 'bg-slate-800'
                        }`}
                        style={{ height: `${Math.max(heightPct, 3)}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:-top-8 sm:px-2 sm:py-1 sm:text-xs">
                          {weeklyPctData[i]?.completions ?? 0}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-medium sm:text-xs ${isHighest ? 'text-primary' : 'text-slate-500'}`}
                      >
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Day Patterns */}
            <Card className="p-4 sm:p-6">
              <SectionHeader title="Best Days" subtitle="When you're most consistent" />
              <div className="space-y-2.5 sm:space-y-3">
                {dayPatterns
                  .filter((d) => d.completions > 0)
                  .sort((a, b) => b.completions - a.completions)
                  .slice(0, 5)
                  .map((day, i) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black sm:h-8 sm:w-8 sm:text-sm ${
                          i === 0
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white sm:text-sm">
                            {day.day}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {day.completions} {day.completions === 1 ? 'completion' : 'completions'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              i === 0
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-primary/50 to-primary'
                            }`}
                            style={{ width: `${day.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                {dayPatterns.every((d) => d.completions === 0) && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Complete some habits to see your patterns
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* ── Milestone Tracker ──────────────────────────────────────── */}
          {milestones.length > 0 && (
            <Card className="p-4 sm:p-6">
              <SectionHeader title="Upcoming Milestones" subtitle="Keep going to unlock these" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {milestones.map((m) => (
                  <div
                    key={`${m.habitName}-${m.nextMilestone}`}
                    className="group flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 transition-colors duration-200 hover:border-amber-500/30 sm:p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 transition-colors duration-200 group-hover:from-amber-500/30 group-hover:to-orange-500/30 sm:h-11 sm:w-11">
                      <span className="material-symbols-outlined text-lg text-amber-400 sm:text-xl">
                        {m.habitIcon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white sm:text-sm">
                        {m.habitName}
                      </p>
                      <p className="mb-2 text-[10px] text-slate-500 sm:text-xs">
                        {m.daysRemaining} days to {m.nextMilestone}-day milestone
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{m.currentStreak} days</span>
                        <span className="text-[10px] font-bold text-amber-400">{m.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Habit Strength — Interactive Donut + List ────────────── */}
          {habitStrengths.length > 0 && <HabitStrengthCard habitStrengths={habitStrengths} />}

          {/* ── Target vs Actual ───────────────────────────────────────── */}
          {targetVsActual.length > 0 && (
            <Card className="p-4 sm:p-6">
              <SectionHeader title="Target vs Actual" subtitle="How you compare to your goals" />
              <div className="space-y-3">
                {targetVsActual.map((item) => (
                  <div
                    key={item.habitName}
                    className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3 sm:gap-4"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-10 sm:w-10 ${getIconGradient(item.habitIconColor)} shadow-md`}
                    >
                      <span className="material-symbols-outlined text-base text-white sm:text-lg">
                        {item.habitIcon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="truncate text-xs font-semibold text-white sm:text-sm">
                          {item.habitName}
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-xs">
                        <span>
                          Target: <span className="font-medium text-slate-300">{item.target}</span>
                        </span>
                        <span className="text-slate-700">·</span>
                        <span>
                          Actual: <span className="font-medium text-slate-300">{item.actual}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Insights Row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {/* Consistency Score */}
            <Card
              hover
              className="group relative overflow-hidden p-4 hover:border-blue-500/40 sm:p-6"
            >
              <div className="absolute right-3 top-2 sm:right-4 sm:top-3">
                <span className="material-symbols-outlined text-4xl text-slate-800/50 transition-colors duration-200 group-hover:text-blue-500/10 sm:text-5xl">
                  speed
                </span>
              </div>
              <div className="relative">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  Consistency
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                    {avgCompletion}
                  </span>
                  <span className="text-sm font-medium text-slate-500 sm:text-lg">/100</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${avgCompletion}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Best Streak */}
            <Card
              hover
              className="group relative overflow-hidden p-4 hover:border-orange-500/40 sm:p-6"
            >
              <div className="absolute right-3 top-2 sm:right-4 sm:top-3">
                <span className="material-symbols-outlined text-4xl text-slate-800/50 transition-colors duration-200 group-hover:text-orange-500/10 sm:text-5xl">
                  emoji_events
                </span>
              </div>
              <div className="relative">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  Best Streak
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                    {bestStreak}
                  </span>
                  <span className="text-sm font-medium text-slate-500 sm:text-lg">days</span>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500 sm:text-xs">Personal record</p>
              </div>
            </Card>

            {/* Total Completions */}
            <Card
              hover
              className="group relative overflow-hidden p-4 hover:border-green-500/40 sm:p-6"
            >
              <div className="absolute right-3 top-2 sm:right-4 sm:top-3">
                <span className="material-symbols-outlined text-4xl text-slate-800/50 transition-colors duration-200 group-hover:text-green-500/10 sm:text-5xl">
                  military_tech
                </span>
              </div>
              <div className="relative">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  Total Done
                </p>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                  {totalCompletions}
                </span>
                <p className="mt-1.5 text-[10px] text-slate-500 sm:text-xs">All time</p>
              </div>
            </Card>
          </div>

          {/* ── Empty State ───────────────────────────────────────────── */}
          {totalHabits === 0 && (
            <Card className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 sm:h-20 sm:w-20">
                <span className="material-symbols-outlined text-3xl text-primary sm:text-4xl">
                  add_circle
                </span>
              </div>
              <h3 className="mb-2 text-base font-bold text-white sm:text-lg">No Habits Yet</h3>
              <p className="mx-auto mb-5 max-w-sm text-sm text-slate-400">
                Start adding habits to see your progress, streaks, heatmap, and insights here.
              </p>
              <button
                onClick={() => openNewHabit()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-slate-900 transition-colors duration-200 hover:bg-primary-focus focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create Your First Habit
              </button>
            </Card>
          )}

          {/* ── Footer spacer ─────────────────────────────────────────── */}
          <div className="h-4" />
        </div>
      </main>
    </div>
  )
}
