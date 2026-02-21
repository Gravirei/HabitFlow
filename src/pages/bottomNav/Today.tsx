import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { useState, useEffect } from 'react'
import { format, isToday, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { GreetingHero, HabitCard, HydrationCard, TaskCard, DateStrip } from '@/components/today'

// ─── Mock tasks ───────────────────────────────────────────────────────────────
const tasks = [
  { id: '1', text: 'Reply to team emails', description: 'Review Q4 marketing proposal draft attached', time: '2:00 PM', folder: 'Work', priority: 'High', priorityColor: 'orange' },
  { id: '2', text: 'Buy groceries', description: 'Milk, Eggs, Bread, Spinach, Avocados', time: '6:00 PM', folder: 'Personal', priority: null, priorityColor: 'primary' },
]

// ─── Slide variants ───────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, countLabel, onAction, actionLabel }: {
  title: string
  count?: number
  countLabel?: string
  onAction?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.9)' }}>
            {count}
          </span>
        )}
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-emerald-400"
        >
          {actionLabel ?? 'View All'}
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
        </button>
      )}
      {countLabel && (
        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {countLabel}
        </span>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="material-symbols-outlined text-2xl text-slate-600" aria-hidden="true">{icon}</span>
      </div>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Today() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const { habits, toggleHabitCompletion, isHabitCompletedOnDate } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [waterCount, setWaterCount] = useState(0)

  // HabitTasksModal state
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')
  const [selectedHabitIcon, setSelectedHabitIcon] = useState('checklist')
  const [selectedHabitIconColor, setSelectedHabitIconColor] = useState(0)

  const formattedDate = format(selectedDate, 'yyyy-MM-dd')

  // Habit click handler
  const handleHabitClick = (habit: any) => {
    const taskCount = getTaskCount(habit.id)
    if (taskCount > 0) {
      setSelectedHabitId(habit.id)
      setSelectedHabitName(habit.name)
      setSelectedHabitIcon(habit.icon)
      setSelectedHabitIconColor(habit.iconColor ?? 0)
    } else {
      toggleHabitCompletion(habit.id, formattedDate)
    }
  }

  // Filtered habits & tasks
  const filteredHabits = habits
    .filter(h => h.isActive === true && h.categoryId !== undefined && !h.archived && !h.hiddenDates?.includes(formattedDate))
    .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredTasks = tasks.filter(t =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Progress
  const activeHabits = habits.filter(h => h.isActive === true && h.categoryId !== undefined && !h.archived && !h.hiddenDates?.includes(formattedDate))
  const completedHabits = activeHabits.filter(h => isHabitCompletedOnDate(h.id, formattedDate)).length
  const totalHabits = activeHabits.length
  const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0

  const getProgressMessage = () => {
    if (progressPercentage >= 100) return "Perfect! 🎉"
    if (progressPercentage >= 75) return 'Excellent!'
    if (progressPercentage >= 50) return 'Good Job!'
    if (progressPercentage >= 25) return 'Keep Going!'
    return "Let's Start!"
  }

  // Calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))
  }
  const days = getDaysInMonth(new Date())

  const handleDateClick = (date: Date) => {
    setDirection(isBefore(date, selectedDate) ? -1 : 1)
    setSelectedDate(date)
  }

  const getPageTitle = () => {
    if (isToday(selectedDate)) return 'Today'
    return format(selectedDate, 'EEE, MMM d')
  }

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl flex-col"
      style={{ backgroundColor: '#020617', color: '#F8FAFC' }}
    >
      <main className="flex-grow pb-28">

        {/* ── Top App Bar ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-4 pt-4 pb-2 sm:px-6 sm:pt-5 lg:px-8">
          <div className="flex h-12 sm:h-14 items-center justify-between">
            {/* Menu button */}
            <button
              onClick={() => setIsSideNavOpen(true)}
              aria-label="Open navigation menu"
              className="flex size-10 sm:size-11 cursor-pointer items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <span className="material-symbols-outlined" aria-hidden="true">menu</span>
            </button>

            {/* Title / Search */}
            <div className="flex-1 overflow-hidden px-3 text-center">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.input
                    key="search"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    type="text"
                    placeholder="Search habits & tasks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-2xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                ) : (
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.p
                      key={selectedDate.toISOString()}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.18 }}
                      className="text-lg sm:text-xl font-black text-white"
                    >
                      {getPageTitle()}
                    </motion.p>
                  </AnimatePresence>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery('') }}
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                className={`flex size-10 sm:size-11 cursor-pointer items-center justify-center rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isSearchOpen ? 'text-emerald-400' : 'text-slate-400 hover:bg-white/5'
                }`}
                style={isSearchOpen ? { background: 'rgba(34,197,94,0.12)' } : {}}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {isSearchOpen ? 'close' : 'search'}
                </span>
              </button>
              <button
                onClick={() => navigate('/calendar')}
                aria-label="Open calendar"
                className="flex size-10 sm:size-11 cursor-pointer items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              </button>
            </div>
          </div>

          {/* Date strip */}
          <DateStrip days={days} selectedDate={selectedDate} onDateClick={handleDateClick} />
        </div>

        {/* ── Animated Content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedDate.toISOString()}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
            className="px-4 sm:px-6 lg:px-8 space-y-6 mt-4"
          >

            {/* ── Greeting Hero ────────────────────────────────────── */}
            {!isSearchOpen && (
              <GreetingHero
                completedHabits={completedHabits}
                totalHabits={totalHabits}
                progressPercentage={progressPercentage}
                progressMessage={getProgressMessage()}
              />
            )}

            {/* ── Divider ──────────────────────────────────────────── */}
            {!isSearchOpen && (
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            )}

            {/* ── Habits Section ───────────────────────────────────── */}
            <section>
              <SectionHeader
                title="Habits"
                count={filteredHabits.length}
                onAction={() => navigate('/habits')}
                actionLabel="View All"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {filteredHabits.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon="checklist"
                      message={isSearchOpen ? 'No habits match your search.' : 'No habits yet — add your first one!'}
                    />
                  </div>
                ) : (
                  filteredHabits.map((habit, i) => {
                    const isCompleted = isHabitCompletedOnDate(habit.id, formattedDate)
                    const isHydration = habit.icon === 'water_drop'

                    if (isHydration) {
                      return (
                        <HydrationCard
                          key={habit.id}
                          habit={habit}
                          isCompleted={isCompleted}
                          waterCount={waterCount}
                          index={i}
                          onAddWater={() => {
                            const max = habit.goal || 8
                            if (waterCount < max) {
                              const next = waterCount + 1
                              setWaterCount(next)
                              if (next >= max && !isCompleted) toggleHabitCompletion(habit.id, formattedDate)
                            }
                          }}
                        />
                      )
                    }

                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={isCompleted}
                        index={i}
                        onToggle={() => handleHabitClick(habit)}
                      />
                    )
                  })
                )}
              </div>
            </section>

            {/* ── Divider ──────────────────────────────────────────── */}
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* ── Tasks Section ────────────────────────────────────── */}
            <section className="pb-4">
              <SectionHeader
                title="Tasks"
                countLabel={`${filteredTasks.length} Pending`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState icon="task_alt" message="No tasks pending." />
                  </div>
                ) : (
                  filteredTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} />
                  ))
                )}
              </div>
            </section>

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-4 sm:right-6 lg:right-8 z-10">
        <button
          onClick={() => navigate('/new-habit')}
          aria-label="Add new habit"
          className="group flex size-14 sm:size-16 cursor-pointer items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            boxShadow: '0 8px 30px rgba(34,197,94,0.4)',
          }}
        >
          <span
            className="material-symbols-outlined text-3xl sm:text-4xl text-white transition-transform duration-300 group-hover:rotate-90"
            aria-hidden="true"
          >
            add
          </span>
        </button>
      </div>

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />

      {/* Habit Tasks Modal */}
      {selectedHabitId && (
        <HabitTasksModal
          isOpen={!!selectedHabitId}
          onClose={() => {
            setSelectedHabitId(null)
            setSelectedHabitName('')
            setSelectedHabitIcon('checklist')
            setSelectedHabitIconColor(0)
          }}
          habitId={selectedHabitId}
          habitName={selectedHabitName}
          habitIcon={selectedHabitIcon}
          habitIconColor={selectedHabitIconColor}
        />
      )}
    </div>
  )
}
