import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit } from '@/types/habit'
import clsx from 'clsx'

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

const today = () => new Date().toISOString().split('T')[0]

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

/** Returns ISO date strings for the last 7 days (Mon→Sun of current week) */
function getLast7Days(): string[] {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() + mondayOffset + i)
    return d.toISOString().split('T')[0]
  })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */

export function Habits() {
  const navigate = useNavigate()
  const { habits, toggleHabitCompletion } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()

  const [isFabOpen, setIsFabOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Habit Tasks Modal
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')

  const handleHabitClick = (habit: Habit) => {
    const taskCount = getTaskCount(habit.id)
    if (taskCount > 0) {
      setSelectedHabitId(habit.id)
      setSelectedHabitName(habit.name)
    } else {
      toggleHabitCompletion(habit.id)
    }
  }

  const filteredHabits = habits
    .filter((h) => h.isActive === true && h.categoryId !== undefined)
    .filter((h) => h.frequency === activeTab)
    .filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const tabs = [
    { id: 'daily' as const, label: 'Daily', icon: 'today' },
    { id: 'weekly' as const, label: 'Weekly', icon: 'date_range' },
    { id: 'monthly' as const, label: 'Monthly', icon: 'calendar_month' },
  ]

  // Stats
  const completedToday = habits.filter((h) =>
    h.completedDates.includes(today()) &&
    h.isActive === true &&
    h.categoryId !== undefined
  ).length
  const totalDailyHabits = habits.filter((h) => 
    h.frequency === 'daily' && 
    h.isActive === true &&
    h.categoryId !== undefined
  ).length
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak), 0)
  const completionPct = totalDailyHabits > 0 ? Math.round((completedToday / totalDailyHabits) * 100) : 0

  // 7-day heatmap
  const last7 = useMemo(() => getLast7Days(), [])
  const dayCompletions = useMemo(() => {
    return last7.map((date) => {
      const count = habits.filter((h) => h.completedDates.includes(date)).length
      return { date, count }
    })
  }, [last7, habits])

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 dark:bg-gray-950 font-display">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 shrink-0">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/90 via-teal-600/85 to-emerald-700/90 dark:from-teal-900/90 dark:via-gray-900/95 dark:to-gray-950" />
        <div className="absolute inset-0 backdrop-blur-2xl" />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-8 h-32 w-32 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative z-10">
          {/* Top row: Menu / Title / Search */}
          <div className="flex h-14 items-center justify-between px-4">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsSideNavOpen(true)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </motion.button>

            <div className="flex-1 overflow-hidden px-3">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <input
                      type="text"
                      placeholder="Search habits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition-all focus:border-white/40 focus:bg-white/20"
                    />
                  </motion.div>
                ) : (
                  <motion.p
                    key="title"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-center text-sm font-semibold tracking-wide text-white/90"
                  >
                    My Habits
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                if (isSearchOpen) setSearchQuery('')
              }}
              className={clsx(
                'flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors',
                isSearchOpen ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'
              )}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isSearchOpen ? 'close' : 'search'}
              </span>
            </motion.button>
          </div>

          {/* Greeting + Progress Summary */}
          <div className="px-5 pb-5 pt-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">
              {formatDate()}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {getGreeting()}
            </h1>

            {/* Progress capsule */}
            <div className="mt-4 flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative flex size-14 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28" cy="28" r="24"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="28" cy="28" r="24"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '150.8', strokeDashoffset: '150.8' }}
                    animate={{ strokeDashoffset: 150.8 - (150.8 * completionPct) / 100 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <span className="text-sm font-bold text-white">{completionPct}%</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {completedToday}/{totalDailyHabits} completed
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  {bestStreak > 0 ? `Best streak: ${bestStreak} days` : 'Start building your streak!'}
                </p>
              </div>

              {/* Streak badge */}
              {bestStreak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1.5 backdrop-blur-sm">
                  <span className="material-symbols-outlined icon-filled text-sm text-orange-300">
                    local_fire_department
                  </span>
                  <span className="text-xs font-bold text-orange-200">{bestStreak}</span>
                </div>
              )}
            </div>
          </div>

          {/* 7-day heatmap strip */}
          <div className="flex items-center justify-between gap-1 border-t border-white/10 px-5 py-3">
            {dayCompletions.map((day, i) => {
              const isToday = day.date === today()
              const intensity = day.count === 0 ? 0 : Math.min(day.count / 3, 1)
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-white/40">{WEEKDAYS[i]}</span>
                  <div
                    className={clsx(
                      'flex size-8 items-center justify-center rounded-lg text-[10px] font-semibold transition-all',
                      isToday && 'ring-2 ring-white/40',
                      day.count > 0
                        ? 'text-white'
                        : 'text-white/30'
                    )}
                    style={{
                      backgroundColor: day.count > 0
                        ? `rgba(255,255,255,${0.1 + intensity * 0.25})`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    {day.count > 0 ? day.count : '·'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Frequency Tabs ── */}
      <div className="sticky top-0 z-20 shrink-0 bg-gray-50/80 px-5 py-4 backdrop-blur-xl dark:bg-gray-950/80">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.96 }}
              className={clsx(
                'relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="habitsActiveTab"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25 dark:from-teal-600 dark:to-teal-700"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined relative z-10 text-lg">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filteredHabits.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                activeTab={activeTab}
                onCreateHabit={() => navigate(`/new-habit?frequency=${activeTab}`)}
              />
            ) : (
              <HabitList
                habits={filteredHabits}
                onHabitClick={handleHabitClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Floating Action Button (Speed Dial) ── */}
      <div className="fixed bottom-24 right-4 z-20 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <>
              {[
                { label: 'Monthly', icon: 'calendar_month', freq: 'monthly', color: 'from-blue-500 to-blue-600', delay: 0.1 },
                { label: 'Weekly', icon: 'date_range', freq: 'weekly', color: 'from-purple-500 to-purple-600', delay: 0.05 },
                { label: 'Daily', icon: 'today', freq: 'daily', color: 'from-teal-500 to-teal-600', delay: 0 },
              ].map((item) => (
                <motion.button
                  key={item.freq}
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.85 }}
                  transition={{ delay: item.delay }}
                  onClick={() => navigate(`/new-habit?frequency=${item.freq}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white py-2.5 pl-3 pr-5 shadow-xl dark:border-white/10 dark:bg-gray-800"
                >
                  <div className={clsx(
                    'flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                    item.color
                  )}>
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsFabOpen(!isFabOpen)}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isFabOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={clsx(
            'flex size-14 cursor-pointer items-center justify-center rounded-2xl shadow-xl transition-all duration-200',
            isFabOpen
              ? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
              : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/30'
          )}
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </motion.button>
      </div>

      {/* ── Side Nav ── */}
      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />

      {/* ── Bottom Nav ── */}
      <BottomNav />

      {/* ── Habit Tasks Modal ── */}
      {selectedHabitId && (
        <HabitTasksModal
          isOpen={!!selectedHabitId}
          onClose={() => {
            setSelectedHabitId(null)
            setSelectedHabitName('')
          }}
          habitId={selectedHabitId}
          habitName={selectedHabitName}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Empty State
   ───────────────────────────────────────────── */

function EmptyState({
  searchQuery,
  activeTab,
  onCreateHabit,
}: {
  searchQuery: string
  activeTab: string
  onCreateHabit: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
      >
        <span className="material-symbols-outlined text-4xl text-gray-400">
          {searchQuery ? 'search_off' : 'checklist'}
        </span>
      </motion.div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
        {searchQuery ? 'No matching habits' : `No ${activeTab} habits yet`}
      </h3>
      <p className="mt-1.5 max-w-[240px] text-sm text-gray-500 dark:text-gray-400">
        {searchQuery ? 'Try a different search term' : `Start building your ${activeTab} routine!`}
      </p>

      {!searchQuery && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCreateHabit}
          className="mt-6 flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-shadow hover:shadow-xl"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create {activeTab} habit
        </motion.button>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Habit List (grouped by category)
   ───────────────────────────────────────────── */

function HabitList({
  habits,
  onHabitClick,
}: {
  habits: Habit[]
  onHabitClick: (habit: Habit) => void
}) {
  const { isHabitCompletedToday } = useHabitStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['health', 'work', 'personal', 'other'])
  )

  const habitsByCategory = habits.reduce((acc, habit) => {
    const category = habit.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(habit)
    return acc
  }, {} as Record<string, Habit[]>)

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'health':
        return { name: 'Health & Wellness', icon: 'favorite', gradient: 'from-teal-500 to-emerald-600' }
      case 'work':
        return { name: 'Work & Productivity', icon: 'work', gradient: 'from-blue-500 to-indigo-600' }
      case 'personal':
        return { name: 'Personal Growth', icon: 'emoji_events', gradient: 'from-purple-500 to-violet-600' }
      default:
        return { name: 'Other Habits', icon: 'star', gradient: 'from-gray-500 to-gray-600' }
    }
  }

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setExpandedCategories(next)
  }

  return (
    <div className="space-y-5 pt-1">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
        const info = getCategoryInfo(category)
        const completedCount = categoryHabits.filter((h) => isHabitCompletedToday(h.id)).length
        const isExpanded = expandedCategories.has(category)

        return (
          <div key={category} className="space-y-2.5">
            {/* Category header */}
            <motion.button
              onClick={() => toggleCategory(category)}
              whileTap={{ scale: 0.98 }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/70 p-3.5 shadow-sm ring-1 ring-gray-200/60 backdrop-blur-xl transition-all hover:shadow-md dark:bg-gray-800/50 dark:ring-white/5"
            >
              <div
                className={clsx(
                  'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md',
                  info.gradient
                )}
              >
                <span className="material-symbols-outlined text-lg text-white">{info.icon}</span>
              </div>

              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{info.name}</h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  {completedCount}/{categoryHabits.length} completed
                </p>
              </div>

              {/* Mini progress dots */}
              <div className="flex items-center gap-1 pr-1">
                {categoryHabits.map((h) => (
                  <div
                    key={h.id}
                    className={clsx(
                      'size-2 rounded-full transition-colors',
                      isHabitCompletedToday(h.id)
                        ? 'bg-teal-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  />
                ))}
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="material-symbols-outlined text-xl text-gray-400">expand_more</span>
              </motion.div>
            </motion.button>

            {/* Habit cards */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {categoryHabits.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <HabitCard habit={habit} onHabitClick={onHabitClick} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Habit Card
   ───────────────────────────────────────────── */

function HabitCard({
  habit,
  onHabitClick,
}: {
  habit: Habit
  onHabitClick: (habit: Habit) => void
}) {
  const { isHabitCompletedToday } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()
  const completed = isHabitCompletedToday(habit.id)
  const taskCount = getTaskCount(habit.id)

  const getIconGradient = (iconName: string) => {
    const map: Record<string, string> = {
      self_improvement: 'from-teal-400 to-teal-600',
      water_drop: 'from-blue-400 to-cyan-600',
      book_2: 'from-purple-400 to-violet-600',
      menu_book: 'from-purple-400 to-violet-600',
      edit_note: 'from-pink-400 to-rose-600',
      directions_walk: 'from-green-400 to-emerald-600',
      fitness_center: 'from-orange-400 to-red-500',
      bedtime: 'from-indigo-400 to-blue-600',
      restaurant: 'from-amber-400 to-orange-600',
    }
    return map[iconName] || 'from-gray-400 to-gray-500'
  }

  // Progress ring values
  const ringSize = 44
  const strokeWidth = 3.5
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = completed ? 1 : 0

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl p-4 shadow-sm ring-1 transition-all duration-200 cursor-pointer',
        completed
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50/50 ring-teal-200/60 dark:from-teal-950/30 dark:to-emerald-950/20 dark:ring-teal-500/20'
          : 'bg-white ring-gray-200/60 hover:shadow-md dark:bg-gray-800/60 dark:ring-white/5'
      )}
      onClick={() => onHabitClick(habit)}
    >
      {/* Completed shimmer */}
      {completed && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-400/10 blur-2xl" />
      )}

      <div className="relative z-10 flex items-center gap-3.5">
        {/* Icon badge */}
        <div
          className={clsx(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md transition-transform group-hover:scale-105',
            getIconGradient(habit.icon)
          )}
        >
          <span className="material-symbols-outlined text-xl text-white">{habit.icon}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h5
              className={clsx(
                'truncate text-sm font-bold transition-colors',
                completed
                  ? 'text-teal-800 dark:text-teal-300'
                  : 'text-gray-800 dark:text-white'
              )}
            >
              {habit.name}
            </h5>

            {/* Streak badge */}
            {habit.currentStreak > 0 && (
              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 dark:bg-orange-500/15">
                <span className="material-symbols-outlined icon-filled text-[11px] text-orange-500 dark:text-orange-400">
                  local_fire_department
                </span>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {habit.currentStreak}
                </span>
              </div>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-2">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {habit.goal > 1 ? `${habit.goal} ${habit.goalPeriod}` : habit.description || habit.goalPeriod}
            </p>
            {taskCount > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined text-[12px]">task_alt</span>
                {taskCount}
              </span>
            )}
          </div>
        </div>

        {/* Progress ring / check */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            className="-rotate-90"
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={completed ? 'transparent' : 'currentColor'}
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="url(#ringGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="material-symbols-outlined icon-filled text-xl text-teal-500"
                >
                  check_circle
                </motion.span>
              ) : (
                <motion.span
                  key="empty"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="material-symbols-outlined text-lg text-gray-300 dark:text-gray-600"
                >
                  circle
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
