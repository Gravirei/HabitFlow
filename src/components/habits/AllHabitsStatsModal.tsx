import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { format } from 'date-fns'

// ─── Palette ──────────────────────────────────────────────────────────────────
const BLUE    = '#1E40AF'
const INDIGO  = '#6366F1'
const AMBER   = '#F59E0B'
const EMERALD = '#10B981'
const ROSE    = '#F43F5E'
const VIOLET  = '#06B6D4'

// ─── Tab config ───────────────────────────────────────────────────────────────
const TAB_IDS = ['today', 'streaks', 'frequency', 'categories'] as const
type TabId = typeof TAB_IDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────
interface AllHabitsStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function IconBarChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}
function IconFire({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z" />
      <path d="M12 12c0 3-2 4-2 7a2 2 0 0 0 4 0c0-3-2-4-2-7z" />
    </svg>
  )
}
function IconTrophy({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  )
}
function IconPin({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z" />
    </svg>
  )
}
function IconList({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
function IconCalendar({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconStar({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconTarget({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IconSun({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  )
}
function IconInbox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-12">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 112, stroke = 10, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-slate-700" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      />
    </svg>
  )
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────
function AnimatedBar({ pct, color, delay = 0, height = 'h-2' }: { pct: number; color: string; delay?: number; height?: string }) {
  return (
    <div className={`${height} overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700`}>
      <motion.div
        className={`${height} rounded-full`}
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.55, ease: 'easeOut', delay }}
      />
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps { icon: React.ReactNode; label: string; value: string; sub?: string; accent: string; delay?: number }
function KpiCard({ icon, label, value, sub, accent, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 10% 10%, ${accent}20 0%, transparent 65%)` }} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <div className="min-w-0 text-right">
          <p className="text-2xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="mt-0.5 text-xs font-semibold" style={{ color: accent }}>{sub}</p>}
        </div>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
    </motion.div>
  )
}

// ─── Frequency Bar ────────────────────────────────────────────────────────────
function FrequencyBar({ label, count, total, color, icon }: { label: string; count: number; total: number; color: string; icon: React.ReactNode }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 shrink-0 items-center gap-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <div className="flex-1"><AnimatedBar pct={pct} color={color} delay={0.1} /></div>
      <div className="w-20 shrink-0 text-right">
        <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-300">
          {count} <span className="font-normal text-slate-400 dark:text-slate-500">({pct.toFixed(0)}%)</span>
        </span>
      </div>
    </div>
  )
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ name, completed, total, rate, color, index }: { name: string; completed: number; total: number; rate: number; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-slate-100/80 dark:hover:bg-slate-700/40"
    >
      <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
      <div className="w-24 shrink-0"><AnimatedBar pct={rate} color={color} delay={0.05 + index * 0.04} /></div>
      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">{completed}/{total}</span>
      <span className="w-11 shrink-0 rounded-md px-1.5 py-0.5 text-center text-xs font-bold"
        style={{ backgroundColor: `${color}18`, color }}>{rate.toFixed(0)}%</span>
    </motion.div>
  )
}

// ─── Performer Card ───────────────────────────────────────────────────────────
function PerformerCard({ sublabel, name, badge, badgeColor, delay = 0 }: { sublabel: string; name: string; badge: string; badgeColor: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay, ease: 'easeOut' }}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{sublabel}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-800 dark:text-white">{name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ backgroundColor: `${badgeColor}18` }}>
        <span className="text-sm font-bold tabular-nums" style={{ color: badgeColor }}>{badge}</span>
      </div>
    </motion.div>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
interface TabDef { id: TabId; label: string; icon: React.ReactNode; accent: string }
function TabBar({ tabs, activeTab, onSelect }: { tabs: TabDef[]; activeTab: TabId; onSelect: (id: TabId) => void }) {
  return (
    <div className="flex shrink-0 border-b border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-800/60" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            aria-selected={isActive}
            role="tab"
            className="relative flex flex-1 cursor-pointer flex-col items-center gap-1 px-1 py-3 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            <span className="transition-colors duration-200" style={{ color: isActive ? tab.accent : '#94A3B8' }}>
              {tab.icon}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-200"
              style={{ color: isActive ? tab.accent : '#94A3B8' }}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ backgroundColor: tab.accent }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function AllHabitsStatsModal({ isOpen, onClose }: AllHabitsStatsModalProps) {
  const { habits } = useHabitStore()
  const { categories } = useCategoryStore()
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const prevTabIndex = useRef(0)

  const today = format(new Date(), 'yyyy-MM-dd')
  const isCompletedToday = (habitId: string) =>
    habits.find((h) => h.id === habitId)?.completedDates?.includes(today) ?? false

  const activeHabits = habits.filter((h) => h.isActive && !h.archived && !h.hiddenDates?.includes(today) && h.categoryId !== undefined)

  // Metrics
  const totalHabits     = activeHabits.length
  const completedToday  = activeHabits.filter((h) => isCompletedToday(h.id)).length
  const completionRate  = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0
  const pinnedHabits    = activeHabits.filter((h) => h.pinned).length
  const dailyHabits     = activeHabits.filter((h) => h.frequency === 'daily').length
  const weeklyHabits    = activeHabits.filter((h) => h.frequency === 'weekly').length
  const monthlyHabits   = activeHabits.filter((h) => h.frequency === 'monthly').length
  const habitsWithStreaks = activeHabits.filter((h) => (h.currentStreak || 0) > 0)
  const totalStreak     = activeHabits.reduce((s, h) => s + (h.currentStreak || 0), 0)
  const avgStreak       = habitsWithStreaks.length > 0 ? totalStreak / habitsWithStreaks.length : 0
  const maxStreak       = Math.max(...activeHabits.map((h) => h.currentStreak || 0), 0)
  const habitWithMaxStreak = activeHabits.find((h) => h.currentStreak === maxStreak)

  const categoryStats = categories
    .map((cat) => {
      const catHabits    = activeHabits.filter((h) => h.categoryId === cat.id)
      const catCompleted = catHabits.filter((h) => isCompletedToday(h.id)).length
      return {
        id: cat.id, name: cat.name, total: catHabits.length, completed: catCompleted,
        rate: catHabits.length > 0 ? (catCompleted / catHabits.length) * 100 : 0,
        color: cat.color || '#6366f1',
      }
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.rate - a.rate)

  const bestHabit = activeHabits.reduce<typeof activeHabits[0] | undefined>((best, h) => {
    return (h.completedDates?.length ?? 0) > (best?.completedDates?.length ?? -1) ? h : best
  }, undefined)

  const ringColor = completionRate >= 80 ? EMERALD : completionRate >= 50 ? AMBER : ROSE

  const TABS: TabDef[] = [
    { id: 'today',      label: 'Today',      accent: ringColor, icon: <IconSun className="size-5" /> },
    { id: 'streaks',    label: 'Streaks',    accent: VIOLET,    icon: <IconFire className="size-5" /> },
    { id: 'frequency',  label: 'Frequency',  accent: INDIGO,    icon: <IconCalendar className="size-5" /> },
    { id: 'categories', label: 'Categories', accent: BLUE,      icon: <IconList className="size-5" /> },
  ]

  // Directional slide: track which direction we're moving
  const handleTabSelect = (id: TabId) => {
    prevTabIndex.current = TAB_IDS.indexOf(activeTab)
    setActiveTab(id)
  }
  const currentIndex  = TAB_IDS.indexOf(activeTab)
  const direction     = currentIndex >= prevTabIndex.current ? 1 : -1

  // Slide variants — content enters/exits in correct direction
  const slideVariants = {
    enter:  (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir * -40, opacity: 0 }),
  }

  React.useEffect(() => {
    if (!isOpen) { setActiveTab('today'); prevTabIndex.current = 0 }
  }, [isOpen])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          />

          {/* Modal — fixed size, fully responsive */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl dark:bg-slate-900
                       sm:max-w-xl
                       md:max-w-2xl"
            style={{
              height: 'min(76svh, 680px)',
              maxHeight: '680px',
            }}
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="relative shrink-0 overflow-hidden">
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${INDIGO} 100%)` }} />
              <div className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '22px 22px' }} />
              <div className="relative flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                    <IconBarChart />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold leading-none tracking-tight text-white">Habit Statistics</h2>
                    <p className="mt-1 text-xs font-medium text-blue-100/70">{format(new Date(), 'EEEE, MMMM d')}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close statistics"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors duration-150 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <IconClose />
                </button>
              </div>
            </div>

            {/* ── Tab Bar ──────────────────────────────────────────────── */}
            <TabBar tabs={TABS} activeTab={activeTab} onSelect={handleTabSelect} />

            {/* ── Fixed-height content area — NEVER resizes ────────────── */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {totalHabits === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600">
                    <IconInbox />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No active habits yet</p>
                    <p className="mt-1 text-sm text-slate-500">Add habits to start seeing your statistics here.</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeTab}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="absolute inset-0 overflow-y-auto overscroll-contain"
                  >

                    {/* ══ TODAY TAB ════════════════════════════════════════ */}
                    {activeTab === 'today' && (
                      <div className="space-y-4 px-5 py-5 pb-12">
                        {/* Ring hero */}
                        <div className="flex items-center gap-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/70">
                          <div className="relative shrink-0">
                            <ProgressRing pct={completionRate} size={112} stroke={10} color={ringColor} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold tabular-nums leading-none text-slate-900 dark:text-white">
                                {completionRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Today's Progress</p>
                            <p className="mt-1 text-4xl font-bold leading-none text-slate-900 dark:text-white">
                              {completedToday}
                              <span className="text-xl font-normal text-slate-400 dark:text-slate-500">/{totalHabits}</span>
                            </p>
                            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">habits completed today</p>
                            <div className="mt-3 flex gap-0.5 overflow-hidden rounded-full">
                              {activeHabits.map((h) => (
                                <motion.div key={h.id} className="h-2 flex-1 rounded-full"
                                  style={{ backgroundColor: isCompletedToday(h.id) ? ringColor : '#E2E8F0' }}
                                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <KpiCard icon={<IconList />} label="Total Habits" value={totalHabits.toString()} accent={BLUE} delay={0} />
                          <KpiCard icon={<IconPin />} label="Pinned" value={pinnedHabits.toString()} accent={AMBER} delay={0.05} />
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/70">
                          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Completion Status</p>
                          <div className="space-y-3">
                            {[
                              { label: 'Completed', count: completedToday, color: ringColor },
                              { label: 'Remaining', count: totalHabits - completedToday, color: '#CBD5E1' },
                            ].map(({ label, count, color }) => (
                              <div key={label} className="flex items-center gap-3">
                                <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{label}</span>
                                <span className="text-sm font-bold tabular-nums text-slate-800 dark:text-white">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ══ STREAKS TAB ══════════════════════════════════════ */}
                    {activeTab === 'streaks' && (
                      <div className="space-y-4 px-5 py-5 pb-12">
                        <div className="grid grid-cols-2 gap-3">
                          <KpiCard icon={<IconFire />} label="Avg Streak" value={avgStreak.toFixed(1)} sub="days" accent={ROSE} delay={0} />
                          <KpiCard icon={<IconTrophy />} label="Best Streak" value={maxStreak.toString()} sub="days" accent={VIOLET} delay={0.05} />
                          <KpiCard icon={<IconStar />} label="Active Streaks" value={habitsWithStreaks.length.toString()} accent={AMBER} delay={0.1} />
                          <KpiCard icon={<IconTarget />} label="Total Habits" value={totalHabits.toString()} accent={BLUE} delay={0.15} />
                        </div>

                        {(habitWithMaxStreak || bestHabit) && (
                          <div className="space-y-3">
                            <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Top Performers</p>
                            {habitWithMaxStreak && maxStreak > 0 && (
                              <PerformerCard sublabel="Longest Streak" name={habitWithMaxStreak.name} badge={`${maxStreak} days`} badgeColor={ROSE} delay={0} />
                            )}
                            {bestHabit && (
                              <PerformerCard sublabel="Most Completed" name={bestHabit.name} badge={`${bestHabit.completedDates?.length ?? 0}×`} badgeColor={EMERALD} delay={0.06} />
                            )}
                          </div>
                        )}

                        {habitsWithStreaks.length > 0 && (
                          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/70">
                            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Streak Leaderboard</p>
                            <div className="space-y-3">
                              {activeHabits
                                .filter((h) => (h.currentStreak || 0) > 0)
                                .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
                                .slice(0, 5)
                                .map((h, i) => (
                                  <div key={h.id} className="flex items-center gap-3">
                                    <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-slate-400">#{i + 1}</span>
                                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">{h.name}</span>
                                    <div className="w-24 shrink-0">
                                      <AnimatedBar pct={maxStreak > 0 ? ((h.currentStreak || 0) / maxStreak) * 100 : 0} color={VIOLET} delay={0.05 + i * 0.04} />
                                    </div>
                                    <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums" style={{ color: VIOLET }}>{h.currentStreak}d</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══ FREQUENCY TAB ════════════════════════════════════ */}
                    {activeTab === 'frequency' && (
                      <div className="space-y-4 px-5 py-5 pb-12">
                        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/70">
                          <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Frequency Breakdown</p>
                          <div className="space-y-5">
                            <FrequencyBar label="Daily"   count={dailyHabits}   total={totalHabits} color={EMERALD} icon={<IconTarget />} />
                            <FrequencyBar label="Weekly"  count={weeklyHabits}  total={totalHabits} color={INDIGO}  icon={<IconCalendar />} />
                            <FrequencyBar label="Monthly" count={monthlyHabits} total={totalHabits} color={BLUE}    icon={<IconBarChart />} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <KpiCard icon={<IconTarget />}   label="Daily"   value={dailyHabits.toString()}   accent={EMERALD} delay={0} />
                          <KpiCard icon={<IconCalendar />} label="Weekly"  value={weeklyHabits.toString()}  accent={INDIGO}  delay={0.05} />
                          <KpiCard icon={<IconBarChart />} label="Monthly" value={monthlyHabits.toString()} accent={BLUE}    delay={0.1} />
                        </div>

                        {dailyHabits > 0 && (
                          <div className="rounded-xl border p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                            style={{ borderColor: `${EMERALD}30`, backgroundColor: `${EMERALD}08` }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: EMERALD }}>Insight</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              <span className="font-bold text-slate-800 dark:text-white">{((dailyHabits / totalHabits) * 100).toFixed(0)}%</span> of your habits are tracked daily — great for building long-term consistency.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══ CATEGORIES TAB — Glassmorphism Bento ════════════ */}
                    {activeTab === 'categories' && (
                      <div className="px-4 py-4 pb-12">
                        {categoryStats.length === 0 ? (
                          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <IconList className="size-8" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No categories yet</p>
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Add habits to categories to see a breakdown here.</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* ── Summary strip ── */}
                            <div className="mb-4 flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {categoryStats.length} {categoryStats.length === 1 ? 'Category' : 'Categories'}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-emerald-400" />
                                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                  Sorted by completion
                                </p>
                              </div>
                            </div>

                            {/* ── Hero card (rank #1) ── */}
                            {categoryStats[0] && (() => {
                              const s = categoryStats[0]
                              const circ = 2 * Math.PI * 26
                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                  className="group relative mb-3 overflow-hidden rounded-2xl p-5"
                                  style={{
                                    background: `linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)`,
                                    border: `1.5px solid #10B98140`,
                                  }}
                                >
                                  {/* Left accent strip — emerald */}
                                  <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
                                    style={{ background: 'linear-gradient(180deg, #34D399 0%, #10B981 100%)' }} />
                                  {/* Glow blob top-right — emerald */}
                                  <div className="pointer-events-none absolute -right-6 -top-6 size-44 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
                                    style={{ backgroundColor: '#10B981' }} />
                                  {/* Glow blob bottom-left — emerald */}
                                  <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full opacity-10 blur-2xl"
                                    style={{ backgroundColor: '#34D399' }} />

                                  <div className="relative flex items-center justify-between gap-4">
                                    {/* Left: name + stats */}
                                    <div className="min-w-0 flex-1">
                                      {/* Badge + name */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                          style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399', border: '1px solid rgba(16,185,129,0.4)' }}>
                                          #1 Top
                                        </span>
                                        <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-sm font-bold truncate text-white">{s.name}</span>
                                      </div>

                                      {/* Big % */}
                                      <p className="text-5xl font-black tabular-nums leading-none tracking-tight"
                                        style={{ color: '#34D399' }}>
                                        {s.rate.toFixed(0)}
                                        <span className="text-2xl font-bold">%</span>
                                      </p>
                                      <p className="mt-1.5 text-xs font-medium text-white/70">
                                        {s.completed} of {s.total} habits done today
                                      </p>

                                      {/* Pill stats row */}
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                          style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                          {s.total} habits
                                        </span>
                                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                          style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                          {s.completed} done
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right: donut ring — emerald */}
                                    <div className="relative shrink-0">
                                      <svg width={72} height={72} className="-rotate-90">
                                        <circle cx={36} cy={36} r={26} fill="none"
                                          stroke="rgba(16,185,129,0.2)" strokeWidth={7} />
                                        <motion.circle
                                          cx={36} cy={36} r={26} fill="none"
                                          stroke="#34D399" strokeWidth={7} strokeLinecap="round"
                                          strokeDasharray={circ}
                                          initial={{ strokeDashoffset: circ }}
                                          animate={{ strokeDashoffset: circ - (s.rate / 100) * circ }}
                                          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-black tabular-nums" style={{ color: '#34D399' }}>
                                          {s.rate.toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom progress track — emerald */}
                                  <div className="relative mt-4 h-2 overflow-hidden rounded-full"
                                    style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}>
                                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                                      style={{ background: 'linear-gradient(90deg, #10B981, #34D399)' }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${s.rate}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
                                    />
                                  </div>
                                </motion.div>
                              )
                            })()}

                            {/* ── Remaining cards grid ── */}
                            {categoryStats.length > 1 && (
                              <div className="grid grid-cols-2 gap-3">
                                {categoryStats.slice(1).map((s, i) => {
                                  const circ = 2 * Math.PI * 16
                                  const rank = i + 2
                                  return (
                                    <motion.div
                                      key={s.id}
                                      initial={{ opacity: 0, scale: 0.94, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      transition={{ duration: 0.22, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                                      className="group relative overflow-hidden rounded-2xl p-4"
                                      style={{
                                        background: `linear-gradient(145deg, ${s.color}50 0%, ${s.color}28 100%)`,
                                        border: `1.5px solid ${s.color}70`,
                                        backdropFilter: 'blur(8px)',
                                      }}
                                    >
                                      {/* Subtle glow */}
                                      <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                                        style={{ backgroundColor: s.color }} />

                                      {/* Rank badge + donut row */}
                                      <div className="relative flex items-start justify-between mb-3">
                                        <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                                          style={{ backgroundColor: `${s.color}50`, color: '#fff' }}>
                                          #{rank}
                                        </span>
                                        {/* Mini donut */}
                                        <div className="relative">
                                          <svg width={40} height={40} className="-rotate-90">
                                            <circle cx={20} cy={20} r={16} fill="none"
                                              stroke={`${s.color}20`} strokeWidth={5} />
                                            <motion.circle
                                              cx={20} cy={20} r={16} fill="none"
                                              stroke={s.color} strokeWidth={5} strokeLinecap="round"
                                              strokeDasharray={circ}
                                              initial={{ strokeDashoffset: circ }}
                                              animate={{ strokeDashoffset: circ - (s.rate / 100) * circ }}
                                              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 + i * 0.07 }}
                                            />
                                          </svg>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[9px] font-black tabular-nums" style={{ color: s.color }}>
                                              {s.rate.toFixed(0)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Category name */}
                                      <div className="relative flex items-center gap-1.5 mb-1">
                                        <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-xs font-bold truncate text-white">{s.name}</span>
                                      </div>

                                      {/* Big % */}
                                      <p className="relative text-2xl font-black tabular-nums leading-none text-white">
                                        {s.rate.toFixed(0)}%
                                      </p>
                                      <p className="relative mt-0.5 text-[10px] text-white/60">
                                        {s.completed}/{s.total} done
                                      </p>

                                      {/* Thin progress track */}
                                      <div className="relative mt-3 h-1 overflow-hidden rounded-full"
                                        style={{ backgroundColor: `${s.color}35` }}>
                                        <motion.div className="absolute inset-y-0 left-0 rounded-full"
                                          style={{ backgroundColor: s.color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${s.rate}%` }}
                                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 + i * 0.06 }}
                                        />
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
