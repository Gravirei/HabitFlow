import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'

import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { HabitTaskCompletionModal } from '@/components/HabitTaskCompletionModal'
import { HabitNotesViewModal } from '@/components/habits/HabitNotesViewModal'
import { HabitNotesModal } from '@/components/categories/HabitNotesModal'
import { HabitDetailsModal } from '@/components/habits/HabitDetailsModal'
import { AllHabitsStatsModal } from '@/components/habits/AllHabitsStatsModal'
import { SelectPinHabitsModal } from '@/components/habits/SelectPinHabitsModal'
import { EditHabit } from '@/components/categories/EditHabit'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
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
  const { habits, toggleHabitCompletion, archiveHabit, pinHabit, unpinHabit, hideHabitForToday } = useHabitStore()
  const { getTaskCount, tasks: habitTasks, updateTask } = useHabitTaskStore()

  const [isFabOpen, setIsFabOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Habit Tasks Modal (for creating tasks)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')
  const [selectedHabitIcon, setSelectedHabitIcon] = useState('checklist')
  const [selectedHabitIconColor, setSelectedHabitIconColor] = useState(0)

  // Task Completion Modal (for completing tasks)
  const [taskCompletionHabitId, setTaskCompletionHabitId] = useState<string | null>(null)

  // Notes Modal (view-only when clicking badge, full when clicking menu)
  const [notesModalHabit, setNotesModalHabit] = useState<{ id: string; name: string } | null>(null)
  const [fullNotesModalHabit, setFullNotesModalHabit] = useState<{ id: string; name: string } | null>(null)

  // Details Modal
  const [detailsModalHabitId, setDetailsModalHabitId] = useState<string | null>(null)

  // Edit Modal
  const [editModalHabitId, setEditModalHabitId] = useState<string | null>(null)

  // All Habits Stats Modal
  const [isAllStatsModalOpen, setIsAllStatsModalOpen] = useState(false)

  // Select Pin Habits Modal
  const [isSelectPinModalOpen, setIsSelectPinModalOpen] = useState(false)

  // Confirmation dialogs
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean
    type: 'incomplete-tasks' | 'start-fresh' | 'delete-today' | null
    habitId: string | null
    habitName?: string
    incompleteTasks?: number
  }>({ isOpen: false, type: null, habitId: null })

  const handleHabitClick = (habit: Habit) => {
    const taskCount = getTaskCount(habit.id)
    if (taskCount > 0) {
      // Open task completion modal
      setTaskCompletionHabitId(habit.id)
    }
    // If no tasks, do nothing (only completion button toggles)
  }

  const handleCompletionButtonClick = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation() // Prevent card click

    const isCompleted = habit.completedDates.includes(today())

    if (isCompleted) {
      // Scenario C: Already completed - warn before resetting
      setConfirmDialogState({
        isOpen: true,
        type: 'start-fresh',
        habitId: habit.id,
        habitName: habit.name,
      })
    } else {
      // Check if has incomplete tasks
      const habitTasksForHabit = habitTasks.filter((ht) => ht.habitId === habit.id)
      const incompleteTasks = habitTasksForHabit.filter((ht) => !ht.completed).length

      if (incompleteTasks > 0) {
        // Scenario A: Has incomplete tasks - warn
        setConfirmDialogState({
          isOpen: true,
          type: 'incomplete-tasks',
          habitId: habit.id,
          habitName: habit.name,
          incompleteTasks,
        })
      } else {
        // Scenario B: No incomplete tasks - normal toggle
        toggleHabitCompletion(habit.id)
      }
    }
  }

  const handleConfirmComplete = () => {
    if (confirmDialogState.habitId) {
      toggleHabitCompletion(confirmDialogState.habitId)
    }
    setConfirmDialogState({ isOpen: false, type: null, habitId: null })
  }

  const handleConfirmStartFresh = () => {
    if (confirmDialogState.habitId) {
      // Unmark habit
      toggleHabitCompletion(confirmDialogState.habitId)

      // Unmark all tasks for this habit
      const habitTasksForHabit = habitTasks.filter(
        (ht) => ht.habitId === confirmDialogState.habitId
      )
      habitTasksForHabit.forEach((ht) => {
        if (ht.completed) {
          updateTask(ht.id, { completed: false })
        }
      })
    }
    setConfirmDialogState({ isOpen: false, type: null, habitId: null })
  }

  const handleTaskToggle = (taskId: string) => {
    const task = habitTasks.find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, { completed: !task.completed })
    }
  }

  const handleAllTasksComplete = (habitId: string) => {
    // Mark habit as complete when all tasks are done
    const isCompleted = habits.find((h) => h.id === habitId)?.completedDates.includes(today())
    if (!isCompleted) {
      toggleHabitCompletion(habitId)
    }
  }

  const handleTasksIncomplete = (habitId: string) => {
    // Unmark habit if tasks are incomplete
    const isCompleted = habits.find((h) => h.id === habitId)?.completedDates.includes(today())
    if (isCompleted) {
      toggleHabitCompletion(habitId)
    }
  }

  // Helper: today's date
  const todayDate = format(new Date(), 'yyyy-MM-dd')

  const filteredHabits = habits
    .filter((h) => h.isActive === true && h.categoryId !== undefined && !h.archived)
    .filter((h) => !h.hiddenDates?.includes(todayDate)) // Filter out hidden habits for today
    .filter((h) => h.frequency === activeTab)
    .filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Sort: pinned habits first
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })

  const tabs = [
    { id: 'daily' as const, label: 'Daily', icon: 'today' },
    { id: 'weekly' as const, label: 'Weekly', icon: 'date_range' },
    { id: 'monthly' as const, label: 'Monthly', icon: 'calendar_month' },
  ]

  // Stats - Tab-based progress (contextual to active tab)
  const completedToday = habits.filter(
    (h) =>
      h.completedDates.includes(today()) &&
      h.frequency === activeTab &&
      h.isActive === true &&
      h.categoryId !== undefined &&
      !h.archived
  ).length
  const totalActiveTabHabits = habits.filter(
    (h) => h.frequency === activeTab && h.isActive === true && h.categoryId !== undefined && !h.archived
  ).length
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak), 0)
  const completionPct =
    totalActiveTabHabits > 0 ? Math.round((completedToday / totalActiveTabHabits) * 100) : 0

  // 7-day heatmap
  const last7 = useMemo(() => getLast7Days(), [])
  const dayCompletions = useMemo(() => {
    return last7.map((date) => {
      const count = habits.filter((h) => h.completedDates.includes(date)).length
      return { date, count }
    })
  }, [last7, habits])

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 font-display dark:bg-gray-950">
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
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{getGreeting()}</h1>

            {/* Progress capsule */}
            <div className="mt-4 flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative flex size-14 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '150.8', strokeDashoffset: '150.8' }}
                    animate={{ strokeDashoffset: 150.8 * (1 - completionPct / 100) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <span className="text-sm font-bold text-white">{completionPct}%</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {completedToday}/{totalActiveTabHabits} completed
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  {bestStreak > 0
                    ? `Best streak: ${bestStreak} days`
                    : 'Start building your streak!'}
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
                      day.count > 0 ? 'text-white' : 'text-white/30'
                    )}
                    style={{
                      backgroundColor:
                        day.count > 0
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
      <main className="no-scrollbar mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 pb-32">
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
                onCompletionClick={handleCompletionButtonClick}
                onManageTasks={(habit) => {
                  setSelectedHabitId(habit.id)
                  setSelectedHabitName(habit.name)
                  setSelectedHabitIcon(habit.icon)
                  setSelectedHabitIconColor(habit.iconColor ?? 0)
                }}
                onOpenNotes={(habitId, habitName) => setNotesModalHabit({ id: habitId, name: habitName })}
                onAddNote={(habitId, habitName) => setFullNotesModalHabit({ id: habitId, name: habitName })}
                onOpenDetails={(habitId) => setDetailsModalHabitId(habitId)}
                onOpenEdit={(habitId) => setEditModalHabitId(habitId)}
                onTogglePin={(habitId, isPinned) => {
                  if (isPinned) {
                    unpinHabit(habitId)
                  } else {
                    pinHabit(habitId)
                  }
                }}
                onArchive={(habitId) => archiveHabit(habitId)}
                onDeleteToday={(habitId, habitName) => {
                  setConfirmDialogState({
                    isOpen: true,
                    type: 'delete-today',
                    habitId,
                    habitName,
                  })
                }}
                onOpenAllStats={() => setIsAllStatsModalOpen(true)}
                onOpenPinModal={() => setIsSelectPinModalOpen(true)}
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
                {
                  label: 'Monthly',
                  icon: 'calendar_month',
                  freq: 'monthly',
                  color: 'from-blue-500 to-blue-600',
                  delay: 0.1,
                },
                {
                  label: 'Weekly',
                  icon: 'date_range',
                  freq: 'weekly',
                  color: 'from-purple-500 to-purple-600',
                  delay: 0.05,
                },
                {
                  label: 'Daily',
                  icon: 'today',
                  freq: 'daily',
                  color: 'from-teal-500 to-teal-600',
                  delay: 0,
                },
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
                  <div
                    className={clsx(
                      'flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                      item.color
                    )}
                  >
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

      {/* ── Habit Tasks Modal (for creating tasks) ── */}
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

      {/* ── Task Completion Modal ── */}
      {taskCompletionHabitId && (
        <HabitTaskCompletionModal
          key={`task-modal-${taskCompletionHabitId}`}
          isOpen={true}
          onClose={() => setTaskCompletionHabitId(null)}
          habitId={taskCompletionHabitId}
          habitName={habits.find((h) => h.id === taskCompletionHabitId)?.name || 'Habit Tasks'}
          isHabitCompleted={
            habits.find((h) => h.id === taskCompletionHabitId)?.completedDates.includes(today()) ||
            false
          }
          onTaskToggle={handleTaskToggle}
          onAllTasksComplete={handleAllTasksComplete}
          onTasksIncomplete={handleTasksIncomplete}
        />
      )}

      {/* ── Notes View Modal (read-only) ── */}
      {notesModalHabit && (
        <HabitNotesViewModal
          isOpen={!!notesModalHabit}
          onClose={() => setNotesModalHabit(null)}
          habitId={notesModalHabit.id}
          habitName={notesModalHabit.name}
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

      {/* Delete for Today Warning */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen && confirmDialogState.type === 'delete-today'}
        onClose={() => setConfirmDialogState({ isOpen: false, type: null, habitId: null })}
        onConfirm={() => {
          if (confirmDialogState.habitId) {
            hideHabitForToday(confirmDialogState.habitId, todayDate)
          }
          setConfirmDialogState({ isOpen: false, type: null, habitId: null })
        }}
        title="Delete for Today?"
        message={`This will hide "${confirmDialogState.habitName}" for today only. The habit will appear again tomorrow. If you want to delete this habit permanently, delete it from the category page.`}
        confirmText="Hide for Today"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />

      {/* ── Details Modal ── */}
      {detailsModalHabitId && (
        <HabitDetailsModal
          isOpen={!!detailsModalHabitId}
          onClose={() => setDetailsModalHabitId(null)}
          habitId={detailsModalHabitId}
        />
      )}

      {/* ── Edit Modal ── */}
      {editModalHabitId && (
        <EditHabit
          isOpen={!!editModalHabitId}
          onClose={() => setEditModalHabitId(null)}
          habitId={editModalHabitId}
        />
      )}

      {/* ── Full Notes Modal (from menu) ── */}
      {fullNotesModalHabit && (
        <HabitNotesModal
          isOpen={!!fullNotesModalHabit}
          onClose={() => setFullNotesModalHabit(null)}
          habitId={fullNotesModalHabit.id}
          habitName={fullNotesModalHabit.name}
        />
      )}

      {/* ── All Habits Stats Modal ── */}
      <AllHabitsStatsModal
        isOpen={isAllStatsModalOpen}
        onClose={() => setIsAllStatsModalOpen(false)}
      />

      {/* ── Select Pin Habits Modal ── */}
      <SelectPinHabitsModal
        isOpen={isSelectPinModalOpen}
        onClose={() => setIsSelectPinModalOpen(false)}
        habits={filteredHabits}
      />
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
  onCompletionClick,
  onManageTasks,
  onOpenNotes,
  onAddNote,
  onOpenDetails,
  onOpenEdit,
  onTogglePin,
  onArchive,
  onDeleteToday,
  onOpenAllStats,
  onOpenPinModal,
}: {
  habits: Habit[]
  onHabitClick: (habit: Habit) => void
  onCompletionClick: (e: React.MouseEvent, habit: Habit) => void
  onManageTasks?: (habit: Habit) => void
  onOpenNotes?: (habitId: string, habitName: string) => void
  onAddNote?: (habitId: string, habitName: string) => void
  onOpenDetails?: (habitId: string) => void
  onOpenEdit?: (habitId: string) => void
  onTogglePin?: (habitId: string, isPinned: boolean) => void
  onArchive?: (habitId: string) => void
  onDeleteToday?: (habitId: string, habitName: string) => void
  onOpenAllStats?: () => void
  onOpenPinModal?: () => void
}) {
  const { isHabitCompletedToday, toggleHabitCompletion, pinHabit, unpinHabit } = useHabitStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['health', 'work', 'personal', 'other'])
  )
  const [categorySettingsOpen, setCategorySettingsOpen] = useState<string | null>(null)
  const [universalEditEnabled, setUniversalEditEnabled] = useState(() => {
    const saved = localStorage.getItem('universalEditEnabled')
    return saved ? JSON.parse(saved) : false
  })
  const [individualEditEnabled, setIndividualEditEnabled] = useState(() => {
    const saved = localStorage.getItem('individualEditEnabled')
    return saved ? JSON.parse(saved) : false
  })
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const [settingsMenuPosition, setSettingsMenuPosition] = useState<{
    top: number
    left: number | 'auto'
    right: number | 'auto'
  }>({
    top: 0,
    left: 0,
    right: 'auto',
  })

  // Universal menu state
  const [isUniversalMenuOpen, setIsUniversalMenuOpen] = useState(false)
  const universalMenuRef = useRef<HTMLDivElement>(null)
  const universalButtonRef = useRef<HTMLButtonElement>(null)
  const [universalMenuPosition, setUniversalMenuPosition] = useState<{
    top: number
    left: number | 'auto'
    right: number | 'auto'
  }>({
    top: 0,
    left: 0,
    right: 'auto',
  })

  // Reset All confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Close universal menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universalMenuRef.current && !universalMenuRef.current.contains(event.target as Node)) {
        setIsUniversalMenuOpen(false)
      }
    }

    if (isUniversalMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUniversalMenuOpen])

  // Persist universal edit state
  useEffect(() => {
    localStorage.setItem('universalEditEnabled', JSON.stringify(universalEditEnabled))
  }, [universalEditEnabled])

  // Persist individual edit state
  useEffect(() => {
    localStorage.setItem('individualEditEnabled', JSON.stringify(individualEditEnabled))
  }, [individualEditEnabled])

  // Handler functions for universal menu
  const handleCompleteAllHabits = () => {
    habits.forEach((habit) => {
      if (!isHabitCompletedToday(habit.id)) {
        toggleHabitCompletion(habit.id)
      }
    })
    setIsUniversalMenuOpen(false)
  }

  const handleResetAllHabits = () => {
    habits.forEach((habit) => {
      if (isHabitCompletedToday(habit.id)) {
        toggleHabitCompletion(habit.id)
      }
    })
    setIsUniversalMenuOpen(false)
  }

  // Check if all habits are completed today
  const allHabitsComplete = habits.length > 0 && habits.every((h) => isHabitCompletedToday(h.id))

  const handleOpenPinModal = () => {
    setIsUniversalMenuOpen(false)
    if (onOpenPinModal) onOpenPinModal()
  }

  const habitsByCategory = habits.reduce(
    (acc, habit) => {
      const category = habit.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push(habit)
      return acc
    },
    {} as Record<string, Habit[]>
  )

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'health':
        return {
          name: 'Health & Wellness',
          icon: 'favorite',
          gradient: 'from-teal-500 to-emerald-600',
        }
      case 'work':
        return {
          name: 'Work & Productivity',
          icon: 'work',
          gradient: 'from-blue-500 to-indigo-600',
        }
      case 'personal':
        return {
          name: 'Personal Growth',
          icon: 'emoji_events',
          gradient: 'from-purple-500 to-violet-600',
        }
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

  const calculateSettingsMenuPosition = () => {
    if (!settingsButtonRef.current) return

    const buttonRect = settingsButtonRef.current.getBoundingClientRect()
    const menuWidth = 300 // Wider for toggle switches
    const menuHeight = 150 // Approximate height
    const spacing = 4

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = buttonRect.bottom + spacing
    let left: number | 'auto' = buttonRect.right - menuWidth // Align menu's right edge to button's right edge
    const right: number | 'auto' = 'auto'

    // Vertical positioning
    if (top + menuHeight > viewportHeight) {
      top = buttonRect.top - spacing - menuHeight
      if (top < spacing) {
        top = spacing
      }
    }

    // Horizontal positioning - Check if menu overflows left edge
    if (left < spacing) {
      left = spacing
    }

    // Check if menu overflows right edge
    if (left + menuWidth > viewportWidth - spacing) {
      left = viewportWidth - menuWidth - spacing
    }

    setSettingsMenuPosition({ top, left, right })
  }

  return (
    <div className="space-y-5 pt-1">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
        const info = getCategoryInfo(category)
        
        // Sort habits: pinned first, then by original order
        const sortedCategoryHabits = [...categoryHabits].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return 0
        })
        
        const completedCount = sortedCategoryHabits.filter((h) => isHabitCompletedToday(h.id)).length
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

              {/* Right side icons - Simple approach: all icons together */}
              <div className="flex items-center gap-2">
                {/* Mini progress dots */}
                <div className="flex items-center gap-1 pr-1">
                  {sortedCategoryHabits.map((h) => (
                    <div
                      key={h.id}
                      className={clsx(
                        'size-2 rounded-full transition-colors',
                        isHabitCompletedToday(h.id) ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  ))}
                </div>

                {/* Settings icon */}
                <motion.button
                  ref={settingsButtonRef}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (categorySettingsOpen !== category) {
                      calculateSettingsMenuPosition()
                      setCategorySettingsOpen(category)
                    } else {
                      setCategorySettingsOpen(null)
                    }
                  }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ rotate: 180, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </motion.button>

                {/* 3-dot menu - Always in DOM, width/opacity animated */}
                <motion.button
                  animate={{
                    width: universalEditEnabled ? 32 : 0,
                    opacity: universalEditEnabled ? 1 : 0,
                    scale: universalEditEnabled ? 1 : 0.8,
                  }}
                  ref={universalButtonRef}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (universalEditEnabled && universalButtonRef.current) {
                      const rect = universalButtonRef.current.getBoundingClientRect()
                      setUniversalMenuPosition({
                        top: rect.bottom + 4,
                        left: 'auto',
                        right: window.innerWidth - rect.right,
                      })
                      setIsUniversalMenuOpen(!isUniversalMenuOpen)
                    }
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 overflow-hidden"
                  style={{ pointerEvents: universalEditEnabled ? 'auto' : 'none' }}
                >
                  <span className="material-symbols-outlined text-[18px] whitespace-nowrap">more_vert</span>
                </motion.button>

                {/* Universal Menu Dropdown - Rendered via Portal */}
                {isUniversalMenuOpen &&
                  universalEditEnabled &&
                  createPortal(
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUniversalMenuOpen(false)}
                      />
                      {/* Menu */}
                      <div
                        ref={universalMenuRef}
                        className="fixed z-50 w-48 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200/60 dark:bg-gray-800 dark:ring-white/10"
                        style={{
                          top: `${universalMenuPosition.top}px`,
                          left: universalMenuPosition.left === 'auto' ? 'auto' : `${universalMenuPosition.left}px`,
                          right: universalMenuPosition.right === 'auto' ? 'auto' : `${universalMenuPosition.right}px`,
                        }}
                      >
                        <div className="py-2">
                          {/* Complete All / Reset All (Dynamic) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (allHabitsComplete) {
                                // Show confirmation for Reset All
                                setShowResetConfirm(true)
                              } else {
                                // Complete all directly
                                handleCompleteAllHabits()
                              }
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                          >
                            <span className={`material-symbols-outlined text-[18px] ${allHabitsComplete ? 'text-orange-500' : 'text-teal-500'}`}>
                              {allHabitsComplete ? 'restart_alt' : 'check_circle'}
                            </span>
                            <span>{allHabitsComplete ? 'Reset All' : 'Complete All'}</span>
                          </button>

                          {/* Pin Habits */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenPinModal()
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                          >
                            <span className="material-symbols-outlined text-[18px] text-orange-500">
                              push_pin
                            </span>
                            <span>Pin Habits</span>
                          </button>

                          {/* View All Habits Stats */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsUniversalMenuOpen(false)
                              if (onOpenAllStats) onOpenAllStats()
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                          >
                            <span className="material-symbols-outlined text-[18px] text-indigo-500">
                              bar_chart
                            </span>
                            <span>View Stats</span>
                          </button>
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
              </div>

              {/* Expand arrow */}
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
                  {sortedCategoryHabits.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.04,
                        layout: { duration: 0.4, ease: 'easeInOut' }
                      }}
                    >
                      <HabitCard
                        habit={habit}
                        onHabitClick={onHabitClick}
                        onCompletionClick={onCompletionClick}
                        showEditIcon={individualEditEnabled}
                        onManageTasks={onManageTasks}
                        onOpenNotes={onOpenNotes}
                        onAddNote={onAddNote}
                        onOpenDetails={onOpenDetails}
                        onOpenEdit={onOpenEdit}
                        onTogglePin={onTogglePin}
                        onArchive={onArchive}
                        onDeleteToday={onDeleteToday}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Category Settings Menu Portal */}
      {categorySettingsOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={(e) => {
                e.stopPropagation()
                setCategorySettingsOpen(null)
              }}
            />

            {/* Settings Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: `${settingsMenuPosition.top}px`,
                left:
                  settingsMenuPosition.left === 'auto' ? 'auto' : `${settingsMenuPosition.left}px`,
                right:
                  settingsMenuPosition.right === 'auto'
                    ? 'auto'
                    : `${settingsMenuPosition.right}px`,
                zIndex: 9999,
              }}
              className="w-[300px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200/60 dark:bg-gray-800 dark:ring-white/10"
            >
              <div className="space-y-4 p-5">
                {/* Universal Edit Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Universal Edit
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Edit all habits at once
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setUniversalEditEnabled(!universalEditEnabled)
                    }}
                    className={clsx(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                      universalEditEnabled ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={clsx(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        universalEditEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Individual Edit Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Individual Edit
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Edit habits separately
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIndividualEditEnabled(!individualEditEnabled)
                    }}
                    className={clsx(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                      individualEditEnabled ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={clsx(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        individualEditEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </>,
          document.body
        )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Habit Card
   ───────────────────────────────────────────── */

function HabitCard({
  habit,
  onHabitClick,
  onCompletionClick,
  showEditIcon = false,
  onManageTasks,
  onOpenNotes,
  onAddNote,
  onOpenDetails,
  onOpenEdit,
  onTogglePin,
  onArchive,
  onDeleteToday,
}: {
  habit: Habit
  onHabitClick: (habit: Habit) => void
  onCompletionClick: (e: React.MouseEvent, habit: Habit) => void
  showEditIcon?: boolean
  onManageTasks?: (habit: Habit) => void
  onOpenNotes?: (habitId: string, habitName: string) => void
  onAddNote?: (habitId: string, habitName: string) => void
  onOpenDetails?: (habitId: string) => void
  onOpenEdit?: (habitId: string) => void
  onTogglePin?: (habitId: string, isPinned: boolean) => void
  onArchive?: (habitId: string) => void
  onDeleteToday?: (habitId: string, habitName: string) => void
}) {
  const navigate = useNavigate()
  const { isHabitCompletedToday } = useHabitStore()
  const { getTaskCount, getTasksByHabitId, resetTasksIfNeeded } = useHabitTaskStore()
  
  // Reset tasks if needed based on habit frequency
  useEffect(() => {
    resetTasksIfNeeded(habit.id, habit.frequency)
  }, [habit.id, habit.frequency, resetTasksIfNeeded])
  
  const completed = isHabitCompletedToday(habit.id)
  const taskCount = getTaskCount(habit.id)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    left: number | 'auto'
    right: number | 'auto'
  }>({
    top: 0,
    left: 0,
    right: 'auto',
  })

  // Smart menu positioning to avoid viewport overflow
  const calculateMenuPosition = () => {
    if (!menuButtonRef.current) return

    const buttonRect = menuButtonRef.current.getBoundingClientRect()
    const menuWidth = 192 // w-48 = 12rem = 192px
    // Calculate actual menu height more accurately
    // py-2 container = 0.5rem top + 0.5rem bottom = 8px top + 8px bottom = 16px
    // Each item: py-2.5 (0.625rem = 10px top + 10px bottom) + text/icon ≈ 22px content = 42px total
    // Dividers: my-2 = 0.5rem top + 0.5rem bottom = 8px, border = 1px, total ≈ 17px each
    const containerPadding = 16 // py-2
    const itemHeight = 42 // Each menu item
    const numItems = taskCount > 0 ? 7 : 6 // 7 items if has tasks, 6 otherwise
    const dividerHeight = 17 // Each divider with margins
    const numDividers = 2
    const menuHeight = containerPadding + itemHeight * numItems + dividerHeight * numDividers
    const spacing = 4 // Gap between button and menu

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = buttonRect.bottom + spacing
    let left: number | 'auto' = 'auto'
    let right: number | 'auto' = viewportWidth - buttonRect.right

    // Vertical positioning: Check if menu overflows bottom
    if (top + menuHeight > viewportHeight) {
      // Position above button - bottom of menu should be 4px above top of button
      // Menu top = button top - gap - menu height
      top = buttonRect.top - spacing - menuHeight

      // If still overflows top, align to viewport top with margin
      if (top < spacing) {
        top = spacing
      }
    }

    // Horizontal positioning: Check if menu overflows right edge
    const rightEdge = viewportWidth - (typeof right === 'number' ? right : 0)
    if (rightEdge + menuWidth > viewportWidth) {
      // Switch to left-aligned
      left = buttonRect.left
      right = 'auto'

      // If still overflows left, clamp to left edge
      if (left < spacing) {
        left = spacing
      }
    }

    setMenuPosition({ top, left, right })
  }

  // Get gradient based on habit's iconColor (0-5)
  const getIconGradient = (iconColor: number = 0) => {
    const gradients = [
      'from-blue-500 to-cyan-500',      // 0: Blue
      'from-purple-500 to-pink-500',    // 1: Purple
      'from-emerald-500 to-teal-500',   // 2: Green
      'from-orange-500 to-amber-500',   // 3: Orange
      'from-red-500 to-rose-500',       // 4: Red
      'from-teal-500 to-cyan-500',      // 5: Teal
    ]
    return gradients[iconColor] || gradients[0]
  }

  // Calculate progress based on tasks or habit completion
  const calculateProgress = () => {
    const today = new Date().toISOString().split('T')[0]
    
    if (taskCount === 0) {
      // No tasks: binary completion (0 or 1)
      return completed ? 1 : 0
    } else {
      // Has tasks: show task completion progress based on TODAY's completions
      const tasks = getTasksByHabitId(habit.id)
      
      // Count tasks completed TODAY (based on frequency)
      const completedTodayCount = tasks.filter((t) => {
        if (!t.completed || !t.completedDate) return false
        
        // Check if task was completed in current period based on frequency
        if (habit.frequency === 'daily') {
          return t.completedDate === today
        } else if (habit.frequency === 'weekly') {
          // Check if in same week
          const taskDate = new Date(t.completedDate)
          const todayDate = new Date(today)
          const getMonday = (d: Date) => {
            const day = d.getDay()
            const diff = d.getDate() - day + (day === 0 ? -6 : 1)
            return new Date(d.setDate(diff)).toISOString().split('T')[0]
          }
          return getMonday(taskDate) === getMonday(todayDate)
        } else if (habit.frequency === 'monthly') {
          // Check if in same month
          return t.completedDate.substring(0, 7) === today.substring(0, 7)
        }
        return false
      }).length
      
      const taskProgress = completedTodayCount / taskCount
      
      // If habit is completed, show full progress; otherwise show task progress
      return completed ? 1 : taskProgress
    }
  }

  // Progress ring values
  const ringSize = 44
  const strokeWidth = 3.5
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = calculateProgress()

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'group relative cursor-pointer rounded-2xl p-4 transition-all duration-200',
        completed
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/20'
          : 'bg-white dark:bg-gray-800/60'
      )}
      onClick={() => onHabitClick(habit)}
    >
      {/* Completed shimmer - removed to prevent visual artifacts */}

      <div className="relative z-0 flex items-center gap-3.5">
        {/* Icon badge */}
        <div
          className={clsx(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-105',
            getIconGradient(habit.iconColor ?? 0)
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
                completed ? 'text-teal-800 dark:text-teal-300' : 'text-gray-800 dark:text-white'
              )}
            >
              {habit.name}
            </h5>

            {/* Pin indicator */}
            {habit.pinned && (
              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 dark:bg-orange-500/15">
                <span className="material-symbols-outlined icon-filled text-[11px] text-orange-500 dark:text-orange-400">
                  push_pin
                </span>
              </div>
            )}

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
              {habit.goal > 1
                ? `${habit.goal} ${habit.goalPeriod}`
                : habit.description || habit.goalPeriod}
            </p>
            {taskCount > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined text-[12px]">task_alt</span>
                {taskCount}
              </span>
            )}
            {/* Notes Badge */}
            {habit.notes && habit.notes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenNotes?.(habit.id, habit.name)
                }}
                className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
              >
                <span className="material-symbols-outlined text-[12px]">note</span>
                {habit.notes.length}
              </button>
            )}
          </div>
        </div>

        {/* Progress ring / check */}
        <motion.button
          onClick={(e) => onCompletionClick(e, habit)}
          className="relative flex shrink-0 cursor-pointer items-center justify-center transition-transform hover:scale-105 active:scale-95"
          animate={{
            marginRight: showEditIcon ? 8 : 0,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
          }}
        >
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
        </motion.button>

        {/* 3-dot menu - Always in DOM, width/opacity animated */}
        <motion.button
          ref={menuButtonRef}
          animate={{
            width: showEditIcon ? 32 : 0,
            opacity: showEditIcon ? 1 : 0,
            scale: showEditIcon ? 1 : 0.8,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={(e) => {
            e.stopPropagation()
            if (showEditIcon && !isMenuOpen) {
              calculateMenuPosition()
            }
            if (showEditIcon) {
              setIsMenuOpen(!isMenuOpen)
            }
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 overflow-hidden"
          style={{ pointerEvents: showEditIcon ? 'auto' : 'none' }}
        >
          <span className="material-symbols-outlined text-[18px] whitespace-nowrap">more_vert</span>
        </motion.button>
      </div>

      {/* Dropdown menu - rendered via Portal */}
      {isMenuOpen &&
        createPortal(
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(false)
              }}
            />

            {/* Menu dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: menuPosition.left === 'auto' ? 'auto' : `${menuPosition.left}px`,
                right: menuPosition.right === 'auto' ? 'auto' : `${menuPosition.right}px`,
                zIndex: 9999,
              }}
              className="w-48 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200/60 dark:bg-gray-800 dark:ring-white/10"
            >
              {/* Menu items */}
              <div className="py-2">
                {/* View Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onOpenDetails) onOpenDetails(habit.id)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-500">
                    visibility
                  </span>
                  <span>View Details</span>
                </button>

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onOpenEdit) onOpenEdit(habit.id)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-teal-500">edit</span>
                  <span>Edit Habit</span>
                </button>

                {/* Manage Tasks */}
                {taskCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onManageTasks?.(habit)
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                  >
                    <span className="material-symbols-outlined text-[18px] text-purple-500">
                      task_alt
                    </span>
                    <span>Manage Tasks</span>
                  </button>
                )}

                {/* Add Note */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onAddNote) onAddNote(habit.id, habit.name)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-500">
                    note_add
                  </span>
                  <span>Add Note</span>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                {/* Pin/Unpin */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onTogglePin) onTogglePin(habit.id, habit.pinned || false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-orange-500">
                    push_pin
                  </span>
                  <span>{habit.pinned ? 'Unpin Habit' : 'Pin Habit'}</span>
                </button>

                {/* Archive */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onArchive) onArchive(habit.id)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-500">
                    archive
                  </span>
                  <span>Archive</span>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                    if (onDeleteToday) onDeleteToday(habit.id, habit.name)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Delete for Today</span>
                </button>
              </div>
            </motion.div>
          </>,
          document.body
        )}
    </motion.div>
  )
}
