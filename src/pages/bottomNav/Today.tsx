import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { HabitTaskCompletionModal } from '@/components/habits/HabitTaskCompletionModal'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
import { useState } from 'react'
import { format, isToday, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { GreetingHero, HabitCard, HydrationCard, TaskCard, DateStrip } from '@/components/today'
import { cn } from '@/utils/cn'

// ─── Mock tasks ───────────────────────────────────────────────────────────────
const tasks = [
  { id: '1', text: 'Reply to team emails', description: 'Review Q4 marketing proposal draft attached', time: '2:00 PM', folder: 'Work', priority: 'High', priorityColor: 'orange' },
  { id: '2', text: 'Buy groceries', description: 'Milk, Eggs, Bread, Spinach, Avocados', time: '6:00 PM', folder: 'Personal', priority: null, priorityColor: 'primary' },
]

// ─── Slide variants ───────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0 }),
}

// ─── View Mode Dropdown ──────────────────────────────────────────────────────
function ViewModeDropdown({ 
  currentMode, 
  onModeChange 
}: { 
  currentMode: 'list' | 'grid'
  onModeChange: (mode: 'list' | 'grid') => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-teal-400 hover:bg-slate-800/50 px-2.5 py-1.5 rounded-lg"
      >
        <span>View: {currentMode === 'grid' ? '2 Column' : 'List'}</span>
        <span className="material-symbols-outlined text-sm transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 z-50 w-32 rounded-lg bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
            <button
              onClick={() => {
                onModeChange('list')
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors",
                currentMode === 'list' 
                  ? "bg-teal-500/10 text-teal-400" 
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <span>List View</span>
              {currentMode === 'list' && (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
            </button>
            <button
              onClick={() => {
                onModeChange('grid')
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors",
                currentMode === 'grid' 
                  ? "bg-teal-500/10 text-teal-400" 
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <span>2 Column</span>
              {currentMode === 'grid' && (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ 
  title, 
  count, 
  onAction, 
  actionLabel,
  viewMode,
  onViewModeChange
}: {
  title: string
  count?: number
  onAction?: () => void
  actionLabel?: string
  viewMode?: 'list' | 'grid'
  onViewModeChange?: (mode: 'list' | 'grid') => void
}) {
  return (
    <div className="flex items-center justify-between px-2 mb-4 mt-8">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold bg-slate-800 text-teal-400 border border-slate-700">
            {count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {viewMode && onViewModeChange && (
          <ViewModeDropdown currentMode={viewMode} onModeChange={onViewModeChange} />
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-teal-400 hover:bg-slate-800/50 px-2 py-1 rounded-lg"
          >
            {actionLabel ?? 'View All'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-800/50 shadow-inner">
        <span className="material-symbols-outlined text-3xl text-slate-500">{icon}</span>
      </div>
      <p className="text-sm font-medium text-slate-500 max-w-[200px]">{message}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Today() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const { habits, toggleHabitCompletion, isHabitCompletedOnDate } = useHabitStore()
  const { getTaskCount, getTasksByHabitId, updateTask } = useHabitTaskStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [waterCount, setWaterCount] = useState(0)
  
  // Hydration tracking (standalone, not tied to habits)
  const hydrationGoal = 8 // Default goal: 8 cups
  const isHydrationComplete = waterCount >= hydrationGoal

  // Habit view mode: 'list' or 'grid' (default: grid/2-column)
  const [habitViewMode, setHabitViewMode] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem('today-habit-view-mode')
    return (saved as 'list' | 'grid') || 'grid'
  })

  // Persist view mode to localStorage
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setHabitViewMode(mode)
    localStorage.setItem('today-habit-view-mode', mode)
  }

  // HabitTasksModal state
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')
  const [selectedHabitIcon, setSelectedHabitIcon] = useState('checklist')
  const [selectedHabitIconColor, setSelectedHabitIconColor] = useState(0)

  // Confirmation dialogs
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean
    type: 'incomplete-tasks' | 'start-fresh' | null
    habitId: string | null
    habitName?: string
    incompleteTasks?: number
  }>({ isOpen: false, type: null, habitId: null })

  const formattedDate = format(selectedDate, 'yyyy-MM-dd')

  // Habit body click handler - only open modal if habit has tasks
  const handleHabitBodyClick = (habit: any) => {
    const taskCount = getTaskCount(habit.id)
    if (taskCount > 0) {
      // Open task completion modal
      setSelectedHabitId(habit.id)
      setSelectedHabitName(habit.name)
      setSelectedHabitIcon(habit.icon)
      setSelectedHabitIconColor(habit.iconColor ?? 0)
    }
    // If no tasks, do nothing (only completion checkbox toggles)
  }

  // Habit completion toggle handler
  const handleHabitCompletion = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const isCompleted = isHabitCompletedOnDate(habitId, formattedDate)

    if (isCompleted) {
      // Scenario: Already completed - warn before resetting
      setConfirmDialogState({
        isOpen: true,
        type: 'start-fresh',
        habitId: habit.id,
        habitName: habit.name,
      })
    } else {
      // Only check for incomplete tasks if the habit actually has tasks
      const totalTaskCount = getTaskCount(habitId)
      if (totalTaskCount > 0) {
        const habitTasksForHabit = getTasksByHabitId(habitId)
        const incompleteTasks = habitTasksForHabit.filter((ht) => !ht.completed).length

        if (incompleteTasks > 0) {
          // Scenario: Has incomplete tasks - warn
          setConfirmDialogState({
            isOpen: true,
            type: 'incomplete-tasks',
            habitId: habit.id,
            habitName: habit.name,
            incompleteTasks,
          })
          return
        }
      }
      // Scenario: No tasks, or all tasks complete - normal toggle
      toggleHabitCompletion(habitId, formattedDate)
    }
  }

  // Confirm complete habit with incomplete tasks
  const handleConfirmComplete = () => {
    if (confirmDialogState.habitId) {
      toggleHabitCompletion(confirmDialogState.habitId, formattedDate)
    }
    setConfirmDialogState({ isOpen: false, type: null, habitId: null })
  }

  // Confirm start fresh - unmark habit and reset all tasks
  const handleConfirmStartFresh = () => {
    if (confirmDialogState.habitId) {
      // Unmark habit
      toggleHabitCompletion(confirmDialogState.habitId, formattedDate)

      // Unmark all tasks for this habit
      const habitTasksForHabit = getTasksByHabitId(confirmDialogState.habitId)
      habitTasksForHabit.forEach((ht) => {
        if (ht.completed) {
          updateTask(ht.id, { completed: false })
        }
      })
    }
    setConfirmDialogState({ isOpen: false, type: null, habitId: null })
  }

  // Handle task toggle from modal
  const handleTaskToggle = (taskId: string) => {
    const task = getTasksByHabitId(selectedHabitId || '').find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, { completed: !task.completed })
    }
  }

  // Mark habit as complete when all tasks are done
  const handleAllTasksComplete = (habitId: string) => {
    const isCompleted = isHabitCompletedOnDate(habitId, formattedDate)
    if (!isCompleted) {
      toggleHabitCompletion(habitId, formattedDate)
    }
  }

  // Unmark habit if tasks are incomplete
  const handleTasksIncomplete = (habitId: string) => {
    const isCompleted = isHabitCompletedOnDate(habitId, formattedDate)
    if (isCompleted) {
      toggleHabitCompletion(habitId, formattedDate)
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
    return format(selectedDate, 'MMMM d')
  }

  return (
    <div
      className="relative mx-auto flex h-auto min-h-screen w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col overflow-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30"
    >
      <main className="flex-grow pb-32 relative z-0">

        {/* ── Top App Bar ───────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 backdrop-blur-sm bg-background-light/95 dark:bg-background-dark/95 shrink-0">
          <div className="flex flex-col gap-2 px-4 pt-4 pb-3 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              {/* Menu button */}
              <button
                onClick={() => setIsSideNavOpen(true)}
                aria-label="Open navigation menu"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>

              {/* Title / Search */}
              <div className="flex-1 overflow-hidden px-4 text-center">
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative max-w-xs mx-auto"
                    >
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full rounded-xl px-4 py-2 pl-10 text-sm bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder:text-slate-500"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-lg">search</span>
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.h1
                        key={selectedDate.toISOString()}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="text-lg font-bold text-white tracking-tight"
                      >
                        {getPageTitle()}
                      </motion.h1>
                    </AnimatePresence>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery('') }}
                  aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                  className={cn(
                    "flex size-10 cursor-pointer items-center justify-center rounded-xl transition-all active:scale-95",
                    isSearchOpen ? "bg-teal-500/10 text-teal-400 ring-2 ring-teal-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="material-symbols-outlined text-xl font-bold">
                    {isSearchOpen ? 'close' : 'search'}
                  </span>
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  aria-label="Open calendar"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-xl font-bold">calendar_month</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Date Strip ────────────────────────────────────────────── */}
        <div className="pt-1">
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
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="px-4 sm:px-6 lg:px-8 space-y-8 mt-6 max-w-3xl mx-auto"
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

            {/* ── Habits Section ───────────────────────────────────── */}
            <section>
              <SectionHeader
                title="Your Habits"
                count={filteredHabits.length}
                viewMode={habitViewMode}
                onViewModeChange={handleViewModeChange}
                onAction={() => navigate('/habits')}
                actionLabel="View All"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={habitViewMode}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={cn(
                    "grid gap-4",
                    habitViewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {filteredHabits.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState
                        icon="checklist"
                        message={isSearchOpen ? 'No habits match your search.' : 'No habits for today.'}
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
                          onToggle={() => handleHabitCompletion(habit.id)}
                          onBodyClick={() => handleHabitBodyClick(habit)}
                        />
                      )
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

            {/* ── Tasks Section ────────────────────────────────────── */}
            <section>
              <SectionHeader
                title="Pending Tasks"
                count={filteredTasks.length}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hydration Card - Always visible */}
                <HydrationCard
                  habit={{
                    id: 'hydration-tracker',
                    name: 'Hydration',
                    icon: 'water_drop',
                    goal: hydrationGoal,
                  }}
                  isCompleted={isHydrationComplete}
                  waterCount={waterCount}
                  index={0}
                  onAddWater={() => {
                    if (waterCount < hydrationGoal) {
                      setWaterCount(waterCount + 1)
                    }
                  }}
                />
                
                {filteredTasks.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState icon="task_alt" message="You're all caught up!" />
                  </div>
                ) : (
                  filteredTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i + 1} />
                  ))
                )}
              </div>
            </section>

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-6 lg:right-10 z-30">
        <motion.button
          onClick={() => navigate('/new-habit')}
          aria-label="Add new habit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex size-14 sm:size-16 cursor-pointer items-center justify-center rounded-2xl shadow-2xl transition-all duration-300 ring-2 ring-white/10"
          style={{
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', // Teal Gradient
            boxShadow: '0 8px 30px rgba(20,184,166,0.4)',
          }}
        >
          <span
            className="material-symbols-outlined text-3xl sm:text-4xl text-white transition-transform duration-300 group-hover:rotate-90"
            aria-hidden="true"
          >
            add
          </span>
        </motion.button>
      </div>

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />

      {/* Habit Task Completion Modal */}
      {selectedHabitId && (
        <HabitTaskCompletionModal
          isOpen={!!selectedHabitId}
          onClose={() => {
            setSelectedHabitId(null)
            setSelectedHabitName('')
            setSelectedHabitIcon('checklist')
            setSelectedHabitIconColor(0)
          }}
          habitId={selectedHabitId}
          habitName={habits.find((h) => h.id === selectedHabitId)?.name || 'Habit Tasks'}
          isHabitCompleted={isHabitCompletedOnDate(selectedHabitId, formattedDate)}
          onTaskToggle={handleTaskToggle}
          onAllTasksComplete={handleAllTasksComplete}
          onTasksIncomplete={handleTasksIncomplete}
        />
      )}

      {/* ── Confirmation Dialogs ── */}
      {/* Incomplete Tasks Warning */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen && confirmDialogState.type === 'incomplete-tasks'}
        onClose={() => setConfirmDialogState({ isOpen: false, type: null, habitId: null })}
        onConfirm={handleConfirmComplete}
        title="Incomplete Tasks"
        message={`"${confirmDialogState.habitName}" has ${confirmDialogState.incompleteTasks} task${confirmDialogState.incompleteTasks === 1 ? '' : 's'} remaining. Mark habit as complete anyway?`}
        confirmText="Complete Anyway"
        cancelText="Cancel"
        variant="warning"
        icon="warning"
      />

      {/* Start Fresh Warning */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen && confirmDialogState.type === 'start-fresh'}
        onClose={() => setConfirmDialogState({ isOpen: false, type: null, habitId: null })}
        onConfirm={handleConfirmStartFresh}
        title="Start Fresh?"
        message={`"${confirmDialogState.habitName}" is already complete. Starting fresh will unmark the habit and reset all tasks. Continue?`}
        confirmText="Start Fresh"
        cancelText="Cancel"
        variant="warning"
        icon="restart_alt"
      />
    </div>
  )
}