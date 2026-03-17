import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { HabitTaskCompletionModal } from '@/components/habits/HabitTaskCompletionModal'
import { HabitDetailsModal } from '@/components/habits/HabitDetailsModal'
import { HabitNotesViewModal } from '@/components/habits/HabitNotesViewModal'
import { HabitNotesModal } from '@/components/categories/HabitNotesModal'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { EditHabit } from '@/components/categories/EditHabit'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
import { useState, useEffect } from 'react'
import { format, isToday, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { GreetingHero, HabitCard, HydrationCard, TaskCard, DateStrip } from '@/components/today'
import { cn } from '@/utils/cn'
import { shouldResetTaskForStartFresh } from '@/utils/habitResetUtils'
import { createPortal } from 'react-dom'

// ─── Mock tasks ───────────────────────────────────────────────────────────────
const tasks = [
  {
    id: '1',
    text: 'Reply to team emails',
    description: 'Review Q4 marketing proposal draft attached',
    time: '2:00 PM',
    folder: 'Work',
    priority: 'High',
    priorityColor: 'orange',
  },
  {
    id: '2',
    text: 'Buy groceries',
    description: 'Milk, Eggs, Bread, Spinach, Avocados',
    time: '6:00 PM',
    folder: 'Personal',
    priority: null,
    priorityColor: 'primary',
  },
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
  onModeChange,
}: {
  currentMode: 'list' | 'grid'
  onModeChange: (mode: 'list' | 'grid') => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-teal-400"
      >
        <span>View: {currentMode === 'grid' ? '2 Column' : 'List'}</span>
        <span
          className="material-symbols-outlined text-sm transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
            <button
              onClick={() => {
                onModeChange('list')
                setIsOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors',
                currentMode === 'list'
                  ? 'bg-teal-500/10 text-teal-400'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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
                'flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors',
                currentMode === 'grid'
                  ? 'bg-teal-500/10 text-teal-400'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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
  onViewModeChange,
}: {
  title: string
  count?: number
  onAction?: () => void
  actionLabel?: string
  viewMode?: 'list' | 'grid'
  onViewModeChange?: (mode: 'list' | 'grid') => void
}) {
  return (
    <div className="mb-4 mt-8 flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-1.5 text-xs font-bold text-teal-400">
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
            className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-teal-400"
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-700/50 bg-slate-800/20 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-800/50 shadow-inner">
        <span className="material-symbols-outlined text-3xl text-slate-500">{icon}</span>
      </div>
      <p className="max-w-[200px] text-sm font-medium text-slate-500">{message}</p>
    </div>
  )
}

// ─── Habit Context Menu Items (shared between mobile & desktop) ───────────────
function HabitContextMenuItems({
  habit,
  onClose,
  onAction,
}: {
  habit: any
  onClose: () => void
  onAction: (action: string, habit: any) => void
}) {
  return (
    <div className="py-2">
      <button
        onClick={() => onAction('details', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-400">info</span>
        <span className="text-sm font-medium text-slate-200">View Details</span>
      </button>
      <button
        onClick={() => onAction('edit', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-400">edit</span>
        <span className="text-sm font-medium text-slate-200">Edit Habit</span>
      </button>
      <button
        onClick={() => onAction('tasks', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-400">checklist</span>
        <span className="text-sm font-medium text-slate-200">Manage Tasks</span>
      </button>
      <button
        onClick={() => onAction('notes', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-400">note</span>
        <span className="text-sm font-medium text-slate-200">Notes</span>
      </button>
      <button
        onClick={() => onAction('pin', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-400">
          {habit.pinned ? 'keep_off' : 'keep'}
        </span>
        <span className="text-sm font-medium text-slate-200">
          {habit.pinned ? 'Unpin Habit' : 'Pin Habit'}
        </span>
      </button>
      <div className="my-1 border-t border-white/[0.06]" />
      <button
        onClick={() => onAction('hide', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-orange-400">hide_source</span>
        <span className="text-sm font-medium text-orange-300">Hide for Today</span>
      </button>
      <button
        onClick={() => onAction('archive', habit)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
      >
        <span className="material-symbols-outlined text-[20px] text-red-400">archive</span>
        <span className="text-sm font-medium text-red-300">Archive Habit</span>
      </button>
    </div>
  )
}

// ─── Habit Icon Header (shared between mobile & desktop) ─────────────────────
function HabitSheetHeader({ habit }: { habit: any }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
      <div
        className={cn(
          'flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
          {
            'from-blue-500 to-cyan-500': (habit.iconColor ?? 0) === 0,
            'from-purple-500 to-pink-500': habit.iconColor === 1,
            'from-emerald-500 to-teal-500': habit.iconColor === 2,
            'from-orange-500 to-amber-500': habit.iconColor === 3,
            'from-red-500 to-rose-500': habit.iconColor === 4,
            'from-teal-500 to-cyan-500': habit.iconColor === 5,
          }
        )}
      >
        <span className="material-symbols-outlined text-[22px] text-white">{habit.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{habit.name}</p>
        <p className="mt-0.5 text-xs text-slate-400">{habit.category || 'General'}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Today() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const { habits, toggleHabitCompletion, isHabitCompletedOnDate } = useHabitStore()
  const { getTaskCount, getTasksByHabitId, updateTask, resetTasksIfNeeded } = useHabitTaskStore()
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

  // Long-press bottom sheet
  const [longPressHabit, setLongPressHabit] = useState<any | null>(null)

  // Modals opened from bottom sheet
  const [detailsModalHabitId, setDetailsModalHabitId] = useState<string | null>(null)
  const [editModalHabitId, setEditModalHabitId] = useState<string | null>(null)
  const [notesViewModalHabit, setNotesViewModalHabit] = useState<{
    id: string
    name: string
  } | null>(null)
  const [notesModalHabit, setNotesModalHabit] = useState<{ id: string; name: string } | null>(null)
  const [manageTasksHabit, setManageTasksHabit] = useState<any | null>(null)
  const [confirmDeleteToday, setConfirmDeleteToday] = useState<{ id: string; name: string } | null>(
    null
  )
  const [confirmArchive, setConfirmArchive] = useState<{ id: string; name: string } | null>(null)

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
    const habit = habits.find((h) => h.id === habitId)
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

  // Confirm start fresh - unmark habit and reset tasks for current period only
  const handleConfirmStartFresh = () => {
    if (confirmDialogState.habitId) {
      const habit = habits.find((h) => h.id === confirmDialogState.habitId)
      // Unmark habit
      toggleHabitCompletion(confirmDialogState.habitId, formattedDate)

      // Unmark tasks for the current period (frequency-aware)
      const habitTasksForHabit = getTasksByHabitId(confirmDialogState.habitId)
      habitTasksForHabit.forEach((ht) => {
        if (habit && shouldResetTaskForStartFresh(ht, habit.frequency, formattedDate)) {
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
      updateTask(taskId, {
        completed: !task.completed,
        completedDate: !task.completed ? formattedDate : undefined,
      })
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

  // Handle bottom sheet menu actions
  const handleBottomSheetAction = (action: string, habit: any) => {
    setLongPressHabit(null)
    switch (action) {
      case 'details':
        setDetailsModalHabitId(habit.id)
        break
      case 'edit':
        setEditModalHabitId(habit.id)
        break
      case 'tasks':
        setManageTasksHabit(habit)
        break
      case 'notes':
        setNotesModalHabit({ id: habit.id, name: habit.name })
        break
      case 'pin':
        // Delay pin state change so the bottom sheet exit animation completes first
        // giving framer-motion a clean stable snapshot before layout reorder
        setTimeout(() => {
          if (habit.pinned) {
            useHabitStore.getState().unpinHabit(habit.id)
          } else {
            useHabitStore.getState().pinHabit(habit.id)
          }
        }, 350)
        break
      case 'hide':
        setConfirmDeleteToday({ id: habit.id, name: habit.name })
        break
      case 'archive':
        setConfirmArchive({ id: habit.id, name: habit.name })
        break
    }
  }

  // Filtered habits & tasks
  // Convert JS day (0=Sun) to weeklyDays format (0=Mon, 1=Tue, ..., 6=Sun)
  const todayDayIndex = (() => {
    const jsDay = selectedDate.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    return jsDay === 0 ? 6 : jsDay - 1 // Convert to 0=Mon, ..., 6=Sun
  })()

  const filteredHabits = habits
    .filter(
      (h) =>
        h.isActive === true &&
        h.categoryId !== undefined &&
        !h.archived &&
        !h.hiddenDates?.includes(formattedDate)
    )
    .filter((h) => {
      // Hide weekly habits on non-matching days (only if weeklyDays is configured)
      if (h.frequency === 'weekly' && h.weeklyDays && h.weeklyDays.length > 0) {
        return h.weeklyDays.includes(todayDayIndex)
      }
      // Hide monthly habits on non-matching dates (only if monthlyDays is configured)
      if (h.frequency === 'monthly' && h.monthlyDays && h.monthlyDays.length > 0) {
        const dateOfMonth = selectedDate.getDate()
        const lastDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        ).getDate()
        return h.monthlyDays.some((d) => {
          const effective = d > lastDay ? lastDay : d
          return effective === dateOfMonth
        })
      }
      return true
    })
    .filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })

  // Reset habit tasks when page mounts or selected date changes
  useEffect(() => {
    filteredHabits.forEach((habit) => {
      resetTasksIfNeeded(habit.id, habit.frequency)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedDate])

  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Progress
  const activeHabits = habits
    .filter(
      (h) =>
        h.isActive === true &&
        h.categoryId !== undefined &&
        !h.archived &&
        !h.hiddenDates?.includes(formattedDate)
    )
    .filter((h) => {
      if (h.frequency === 'weekly' && h.weeklyDays && h.weeklyDays.length > 0) {
        return h.weeklyDays.includes(todayDayIndex)
      }
      if (h.frequency === 'monthly' && h.monthlyDays && h.monthlyDays.length > 0) {
        const dateOfMonth = selectedDate.getDate()
        const lastDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        ).getDate()
        return h.monthlyDays.some((d) => {
          const effective = d > lastDay ? lastDay : d
          return effective === dateOfMonth
        })
      }
      return true
    })
  const completedHabits = activeHabits.filter((h) =>
    isHabitCompletedOnDate(h.id, formattedDate)
  ).length
  const totalHabits = activeHabits.length
  const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0

  const getProgressMessage = () => {
    if (progressPercentage >= 100) return 'Perfect! 🎉'
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
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
      {/* Fixed Header */}
      <header className="fixed left-0 right-0 top-0 z-30 mx-auto max-w-md shrink-0 bg-background-light/95 backdrop-blur-sm dark:bg-background-dark/95 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <div className="flex flex-col gap-2 px-4 pb-3 pt-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Menu button */}
            <button
              onClick={() => setIsSideNavOpen(true)}
              aria-label="Open navigation menu"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
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
                    className="relative mx-auto max-w-xs"
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2 text-lg text-slate-500">
                      search
                    </span>
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
                      className="text-lg font-bold tracking-tight text-white"
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
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen)
                  if (isSearchOpen) setSearchQuery('')
                }}
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                className={cn(
                  'flex size-10 cursor-pointer items-center justify-center rounded-xl transition-all active:scale-95',
                  isSearchOpen
                    ? 'bg-teal-500/10 text-teal-400 ring-2 ring-teal-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="material-symbols-outlined text-xl font-bold">
                  {isSearchOpen ? 'close' : 'search'}
                </span>
              </button>
              <button
                onClick={() => navigate('/calendar')}
                aria-label="Open calendar"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
              >
                <span className="material-symbols-outlined text-xl font-bold">calendar_month</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-0 flex-grow pb-32 pt-20">
        {/* ── Date Strip ────────────────────────────────────────────── */}
        <div>
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
            className="mx-auto mt-6 max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8"
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
              <div
                className={cn(
                  'grid gap-4',
                  habitViewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                )}
              >
                {filteredHabits.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon="checklist"
                      message={
                        isSearchOpen ? 'No habits match your search.' : 'No habits for today.'
                      }
                    />
                  </div>
                ) : (
                  <>
                    {filteredHabits.map((habit, i) => {
                      const isCompleted = isHabitCompletedOnDate(habit.id, formattedDate)
                      const isHydration = habit.icon === 'water_drop'

                      if (isHydration) {
                        return (
                          <motion.div key={habit.id} layout>
                            <HydrationCard
                              habit={habit}
                              isCompleted={isCompleted}
                              waterCount={waterCount}
                              index={i}
                              onAddWater={() => {
                                const max = habit.goal || 8
                                if (waterCount < max) {
                                  const next = waterCount + 1
                                  setWaterCount(next)
                                  if (next >= max && !isCompleted)
                                    toggleHabitCompletion(habit.id, formattedDate)
                                }
                              }}
                            />
                          </motion.div>
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
                          onLongPress={() => setLongPressHabit(habit)}
                          onNotesClick={() =>
                            setNotesViewModalHabit({ id: habit.id, name: habit.name })
                          }
                          enableLayoutAnimation={habitViewMode === 'list'}
                        />
                      )
                    })}
                  </>
                )}
              </div>
            </section>

            {/* ── Tasks Section ────────────────────────────────────── */}
            <section>
              <SectionHeader title="Pending Tasks" count={filteredTasks.length} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      <div className="fixed bottom-24 right-6 z-30 lg:right-10">
        <motion.button
          onClick={() => navigate('/new-habit')}
          aria-label="Add new habit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex size-14 cursor-pointer items-center justify-center rounded-2xl shadow-2xl ring-2 ring-white/10 transition-all duration-300 sm:size-16"
          style={{
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', // Teal Gradient
            boxShadow: '0 8px 30px rgba(20,184,166,0.4)',
          }}
        >
          <span
            className="material-symbols-outlined text-3xl text-white transition-transform duration-300 group-hover:rotate-90 sm:text-4xl"
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

      {/* ── Long-press Bottom Sheet (mobile) / Centered Modal (desktop) ── */}
      {longPressHabit &&
        createPortal(
          <AnimatePresence>
            {/* Backdrop */}
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setLongPressHabit(null)}
            />

            {/* ── Mobile: slides up from bottom ── */}
            <motion.div
              key="sheet-mobile"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-white/10 bg-slate-900 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-slate-700" />
              </div>
              <HabitSheetHeader habit={longPressHabit} />
              <HabitContextMenuItems
                habit={longPressHabit}
                onClose={() => setLongPressHabit(null)}
                onAction={handleBottomSheetAction}
              />
              <div className="h-6" />
            </motion.div>

            {/* ── Desktop/Tablet: centered modal ── */}
            <div className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center md:flex">
              <motion.div
                key="sheet-desktop"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="pointer-events-auto relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setLongPressHabit(null)}
                  className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    close
                  </span>
                </button>
                <HabitSheetHeader habit={longPressHabit} />
                <HabitContextMenuItems
                  habit={longPressHabit}
                  onClose={() => setLongPressHabit(null)}
                  onAction={handleBottomSheetAction}
                />
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}

      {/* ── Notes View Modal (read-only, from badge click) ── */}
      {notesViewModalHabit && (
        <HabitNotesViewModal
          isOpen={!!notesViewModalHabit}
          onClose={() => setNotesViewModalHabit(null)}
          habitId={notesViewModalHabit.id}
          habitName={notesViewModalHabit.name}
        />
      )}

      {/* ── Modals from bottom sheet ── */}
      {detailsModalHabitId && (
        <HabitDetailsModal
          isOpen={!!detailsModalHabitId}
          onClose={() => setDetailsModalHabitId(null)}
          habitId={detailsModalHabitId}
        />
      )}

      {editModalHabitId && (
        <EditHabit
          isOpen={!!editModalHabitId}
          onClose={() => setEditModalHabitId(null)}
          habitId={editModalHabitId}
        />
      )}

      {notesModalHabit && (
        <HabitNotesModal
          isOpen={!!notesModalHabit}
          onClose={() => setNotesModalHabit(null)}
          habitId={notesModalHabit.id}
          habitName={notesModalHabit.name}
        />
      )}

      {manageTasksHabit && (
        <HabitTasksModal
          isOpen={!!manageTasksHabit}
          onClose={() => setManageTasksHabit(null)}
          habitId={manageTasksHabit.id}
          habitName={manageTasksHabit.name}
          habitIcon={manageTasksHabit.icon}
          habitIconColor={manageTasksHabit.iconColor ?? 0}
        />
      )}

      {/* Hide for Today confirm */}
      <ConfirmDialog
        isOpen={!!confirmDeleteToday}
        onClose={() => setConfirmDeleteToday(null)}
        onConfirm={() => {
          if (confirmDeleteToday) {
            useHabitStore.getState().hideHabitForToday(confirmDeleteToday.id, formattedDate)
          }
          setConfirmDeleteToday(null)
        }}
        title="Hide for Today?"
        message={`This will hide "${confirmDeleteToday?.name}" for today only. It will appear again tomorrow.`}
        confirmText="Hide for Today"
        cancelText="Cancel"
        variant="danger"
        icon="hide_source"
      />

      {/* Archive confirm */}
      <ConfirmDialog
        isOpen={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={() => {
          if (confirmArchive) {
            useHabitStore.getState().archiveHabit(confirmArchive.id)
          }
          setConfirmArchive(null)
        }}
        title="Archive Habit?"
        message={`"${confirmArchive?.name}" will be archived and removed from your daily view. You can restore it later.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="danger"
        icon="archive"
      />
    </div>
  )
}
