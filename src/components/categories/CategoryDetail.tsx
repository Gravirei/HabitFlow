import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'

import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { CreateNewHabit } from '@/components/categories/CreateNewHabit'
import { EditHabit } from '@/components/categories/EditHabit'
import { ArchivedHabitsModal } from '@/components/categories/ArchivedHabitsModal'
import { HabitNotesModal } from '@/components/categories/HabitNotesModal'
import { ToggleSwitch } from '@/components/timer/settings/ToggleSwitch'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'

// Predefined icon colors with gradients (matching CreateNewHabit)
const iconColorOptions = [
  { name: 'Blue', gradient: 'from-blue-500 to-cyan-500', textColor: 'text-blue-500' },
  { name: 'Purple', gradient: 'from-purple-500 to-pink-500', textColor: 'text-purple-500' },
  { name: 'Green', gradient: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-500' },
  { name: 'Orange', gradient: 'from-orange-500 to-amber-500', textColor: 'text-orange-500' },
  { name: 'Red', gradient: 'from-red-500 to-rose-500', textColor: 'text-red-500' },
  { name: 'Teal', gradient: 'from-teal-500 to-cyan-500', textColor: 'text-teal-500' },
]

const fallbackGradientByColor: Record<string, string> = {
  primary: 'from-gray-900 to-black',
  blue: 'from-blue-500 to-blue-700',
  emerald: 'from-emerald-500 to-emerald-700',
  purple: 'from-purple-500 to-purple-700',
  yellow: 'from-yellow-400 to-yellow-600',
  orange: 'from-orange-400 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-700',
  pink: 'from-pink-500 to-pink-700',
  red: 'from-red-500 to-red-700',
  teal: 'from-teal-500 to-teal-700',
  sky: 'from-sky-400 to-blue-600',
  slate: 'from-slate-600 to-slate-800',
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export function CategoryDetail() {
  const navigate = useNavigate()
  const { categoryId } = useParams<{ categoryId: string }>()

  const { getCategoryById } = useCategoryStore()
  const allHabits = useHabitStore((state) => state.habits)
  const updateHabit = useHabitStore((state) => state.updateHabit)
  const deleteHabit = useHabitStore((state) => state.deleteHabit)
  const archiveHabit = useHabitStore((state) => state.archiveHabit)
  const { getTaskCount } = useHabitTaskStore()
  
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState<string>('')
  const [selectedHabitIcon, setSelectedHabitIcon] = useState<string>('checklist')
  const [selectedHabitIconColor, setSelectedHabitIconColor] = useState<number>(0)
  const [isArchivedHabitsOpen, setIsArchivedHabitsOpen] = useState(false)
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [habitToEdit, setHabitToEdit] = useState<string | null>(null)
  const [notesModalHabit, setNotesModalHabit] = useState<{ id: string; name: string } | null>(null)

  const category = categoryId ? getCategoryById(categoryId) : undefined

  const habits = useMemo(() => {
    if (!categoryId) return []
    return allHabits.filter((habit) => 
      habit.categoryId === categoryId && !habit.archived
    )
  }, [categoryId, allHabits])

  // Check if all habits in this category are active
  const allHabitsActive = useMemo(() => {
    if (habits.length === 0) return false
    return habits.every((habit) => habit.isActive === true)
  }, [habits])

  // Toggle activation for all habits in this category
  const handleToggleCategoryActivation = () => {
    const newActiveState = !allHabitsActive
    habits.forEach((habit) => {
      updateHabit(habit.id, { isActive: newActiveState })
    })
    toast.success(newActiveState ? '✅ Category activated!' : '⏸️ Category deactivated!')
  }

  // Handle habit deletion
  const handleDeleteHabit = () => {
    if (!habitToDelete) return
    deleteHabit(habitToDelete)
    setHabitToDelete(null)
    toast.success('🗑️ Habit deleted successfully!')
  }

  // Calculate habit statistics
  const habitStats = useMemo(() => {
    const activeHabitsCount = habits.filter(h => h.isActive === true).length
    const inactiveHabitsCount = habits.length - activeHabitsCount

    if (habits.length === 0) {
      return {
        totalTasks: 0,
        averageTasks: 0,
        mostActiveHabit: null,
        leastActiveHabit: null,
        activeHabitsCount: 0,
        inactiveHabitsCount: 0,
      }
    }

    const habitsWithTaskCounts = habits.map((habit) => ({
      ...habit,
      taskCount: getTaskCount(habit.id),
    }))

    const totalTasks = habitsWithTaskCounts.reduce((sum, h) => sum + h.taskCount, 0)
    const averageTasks = totalTasks / habits.length

    // Sort by task count
    const sortedByTasks = [...habitsWithTaskCounts].sort((a, b) => b.taskCount - a.taskCount)
    
    return {
      totalTasks,
      averageTasks: Math.round(averageTasks * 10) / 10, // Round to 1 decimal
      mostActiveHabit: sortedByTasks[0].taskCount > 0 ? sortedByTasks[0] : null,
      leastActiveHabit: sortedByTasks[sortedByTasks.length - 1],
      activeHabitsCount,
      inactiveHabitsCount,
    }
  }, [habits, getTaskCount])

  const headerGradient =
    category?.gradient ??
    (category?.color ? fallbackGradientByColor[category.color] : undefined) ??
    fallbackGradientByColor.slate

  if (!categoryId || !category) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark"
      >
        <header className="flex items-center gap-3 p-4 pb-2 pt-safe shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate('/categories')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Back to categories"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
          </motion.button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Category not found</h1>
        </header>

        <main className="flex-1 px-4 py-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 text-slate-900 shadow-lg dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/20 mx-auto">
              <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">error</span>
            </div>
            <h3 className="mt-4 text-center text-lg font-bold">Category Not Found</h3>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
              We couldn't find that category. It may have been deleted.
            </p>
            <div className="mt-6 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/categories')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Go to Categories
              </motion.button>
            </div>
          </motion.div>
        </main>
      </motion.div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Animated Hero Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative shrink-0 overflow-hidden"
      >
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0">
          {category.imagePath ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              src={category.imagePath}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${headerGradient}`} />
          )}
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 p-5 pt-safe">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/categories')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 transition-colors hover:bg-black/30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </motion.button>
          </div>

          {/* Category Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-xl"
              >
                <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">
                  {category.icon}
                </span>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
                  {category.name}
                </h1>
                <p className="mt-1 text-sm font-medium text-white/90 drop-shadow">
                  {habits.length} {habits.length === 1 ? 'Habit' : 'Habits'}
                </p>
              </div>
              
              {/* Activation Toggle - Right Side */}
              {habits.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* Status Light with Blinking Animation */}
                  <motion.div
                    animate={{
                      opacity: [1, 0.3, 1],
                      scale: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={clsx(
                      'h-3 w-3 rounded-full',
                      allHabitsActive ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'
                    )}
                  />
                  
                  {/* Toggle Switch - Using existing component */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleCategoryActivation}
                      className={clsx(
                        'relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent',
                        allHabitsActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'
                      )}
                      role="switch"
                      aria-checked={allHabitsActive}
                      aria-label="Toggle category activation"
                    >
                      <span
                        className={clsx(
                          'inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-lg',
                          allHabitsActive ? 'translate-x-6 shadow-green-400/50' : 'translate-x-1 shadow-gray-700'
                        )}
                      />
                    </button>
                    <span className="text-sm font-semibold text-white">
                      {allHabitsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-28 lg:flex lg:gap-6 lg:px-6 xl:px-8">
        {/* Left/Center Content Area */}
        <div className="flex-1 lg:min-w-0">
          {/* Habits Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-lg">track_changes</span>
                Habits
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {habits.length}
              </span>
            </div>

            {habits.length === 0 ? (
              <EmptyState
                icon="playlist_add"
                title="No habits yet"
                description="Start building momentum by adding your first habit."
                actionLabel="Add a habit"
                onAction={() => navigate(`/new-habit?categoryId=${category.id}`)}
              />
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 xl:grid-cols-2">
                {habits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    index={index}
                    taskCount={getTaskCount(habit.id)}
                    onClick={() => {
                      setSelectedHabitId(habit.id)
                      setSelectedHabitName(habit.name)
                      setSelectedHabitIcon(habit.icon)
                      setSelectedHabitIconColor(habit.iconColor ?? 0)
                    }}
                    onDelete={(habitId) => setHabitToDelete(habitId)}
                    onEdit={(habitId) => setHabitToEdit(habitId)}
                    onArchive={(habitId) => archiveHabit(habitId)}
                    onOpenNotes={(habitId, habitName) => setNotesModalHabit({ id: habitId, name: habitName })}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* Desktop Sidebar - Right */}
        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden lg:block lg:w-80 xl:w-96 shrink-0"
        >
          <div className="sticky top-6 space-y-6">
            {/* Quick Stats Card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/80">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-lg">analytics</span>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <SidebarStatItem label="Total Habits" value={habits.length.toString()} icon="playlist_add_check" />
                <SidebarStatItem label="Active Habits" value={habitStats.activeHabitsCount.toString()} icon="check_circle" />
                <SidebarStatItem label="Inactive Habits" value={habitStats.inactiveHabitsCount.toString()} icon="radio_button_unchecked" />
              </div>
            </div>

            {/* Habit Statistics Card */}
            {habits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/80"
              >
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-lg">insights</span>
                  Insights
                </h3>
                <div className="space-y-3">
                  {/* Total Tasks */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{habitStats.totalTasks}</span>
                  </div>

                  {/* Average Tasks */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-white/5">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Average per Habit</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{habitStats.averageTasks}</span>
                  </div>

                  {/* Most Active Habit */}
                  {habitStats.mostActiveHabit && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm text-primary">star</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Most Active</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{habitStats.mostActiveHabit.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {habitStats.mostActiveHabit.taskCount} {habitStats.mostActiveHabit.taskCount === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  )}

                  {/* Least Active Habit */}
                  {habitStats.leastActiveHabit && habits.length > 1 && habitStats.leastActiveHabit.taskCount === 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm text-amber-500">notifications</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Needs Attention</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{habitStats.leastActiveHabit.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No tasks yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/80">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-lg">bolt</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 p-4 text-left text-slate-900 shadow-lg shadow-primary/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-2xl">add_circle</span>
                  <span className="text-sm font-bold">Add New Habit</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsArchivedHabitsOpen(true)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-100 p-4 text-left text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                >
                  <span className="material-symbols-outlined text-2xl">archive</span>
                  <span className="text-sm font-bold">Archived Habits</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.aside>
      </main>

      {/* Floating Action Button - Only on mobile/tablet */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-20 right-6 z-20 lg:hidden"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setIsCreateHabitOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-[0_12px_40px_rgba(19,236,91,0.4)] transition-shadow hover:shadow-[0_16px_48px_rgba(19,236,91,0.5)] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          aria-label="Add a habit"
        >
          <span className="material-symbols-outlined text-4xl font-bold">add</span>
        </motion.button>
      </motion.div>

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

      {/* Create New Habit Modal */}
      <CreateNewHabit
        isOpen={isCreateHabitOpen}
        onClose={() => setIsCreateHabitOpen(false)}
        categoryId={category.id}
        categoryName={category.name}
      />

      {/* Edit Habit Modal */}
      {habitToEdit && (
        <EditHabit
          isOpen={!!habitToEdit}
          onClose={() => setHabitToEdit(null)}
          habitId={habitToEdit}
        />
      )}

      {/* Delete Habit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleDeleteHabit}
        title="Delete habit?"
        message="This will permanently delete this habit and all its data. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />

      {/* Archived Habits Modal */}
      <ArchivedHabitsModal
        isOpen={isArchivedHabitsOpen}
        onClose={() => setIsArchivedHabitsOpen(false)}
        categoryId={category?.id}
      />

      {/* Habit Notes Modal */}
      {notesModalHabit && (
        <HabitNotesModal
          isOpen={!!notesModalHabit}
          onClose={() => setNotesModalHabit(null)}
          habitId={notesModalHabit.id}
          habitName={notesModalHabit.name}
        />
      )}
    </div>
  )
}

// Sidebar Stat Item Component
function SidebarStatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-emerald-400/10">
          <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  )
}

// Sub-components

interface HabitCardProps {
  habit: any
  index: number
  taskCount: number
  onClick: () => void
  onDelete: (habitId: string) => void
  onEdit: (habitId: string) => void
  onArchive: (habitId: string) => void
  onOpenNotes: (habitId: string, habitName: string) => void
}

function HabitCard({ habit, index, taskCount, onClick, onDelete, onEdit, onArchive, onOpenNotes }: HabitCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const menuId = `habit-menu-${habit.id}`
  const menuRef = useRef<HTMLDivElement>(null)
  const weeklyBadgeRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  const openWeeklySchedule = useCallback(() => {
    if (weeklyBadgeRef.current) {
      const rect = weeklyBadgeRef.current.getBoundingClientRect()
      setPopupPosition({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }
    setShowWeeklySchedule(true)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    // Add listener on next tick to avoid closing immediately
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={clsx(
        "group relative overflow-visible rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl hover:border-slate-300 cursor-pointer dark:border-white/5 dark:bg-slate-900/80 dark:hover:border-white/10",
        isMenuOpen && "z-50"
      )}
    >
      <div className="relative flex items-center gap-4 p-4">
        {/* Icon */}
        <div className={clsx(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md",
          habit.iconColor !== undefined ? iconColorOptions[habit.iconColor]?.gradient : 'from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5'
        )}>
          <span className={clsx(
            "material-symbols-outlined text-2xl",
            habit.iconColor !== undefined ? 'text-white' : 'text-slate-700 dark:text-slate-200'
          )}>{habit.icon}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900 dark:text-white">
            {habit.name}
          </p>
          {habit.description ? (
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {habit.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {habit.goal} per {habit.goalPeriod}
            </p>
          )}
          
          {/* Task Count, Notes Badge & Frequency Badge */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-base">task</span>
              <span className="font-semibold">{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
            </div>
            
            {/* Frequency Badge */}
            <button
              ref={weeklyBadgeRef}
              type="button"
              onClick={(e) => {
                if (habit.frequency === 'weekly' && habit.weeklyTimesPerWeek) {
                  e.stopPropagation()
                  showWeeklySchedule ? setShowWeeklySchedule(false) : openWeeklySchedule()
                }
              }}
              className={clsx(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-all",
                habit.frequency === 'daily' && "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
                habit.frequency === 'weekly' && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
                habit.frequency === 'monthly' && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                habit.frequency === 'weekly' && habit.weeklyTimesPerWeek && "cursor-pointer hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-500/40"
              )}
            >
              <span className="material-symbols-outlined text-sm">
                {habit.frequency === 'daily' ? 'today' : habit.frequency === 'weekly' ? 'date_range' : 'calendar_month'}
              </span>
              <span className="capitalize">
                {habit.frequency === 'weekly' && habit.weeklyTimesPerWeek
                  ? `Weekly · ${habit.weeklyTimesPerWeek} day${habit.weeklyTimesPerWeek > 1 ? 's' : ''}`
                  : habit.frequency}
              </span>
            </button>

            {/* Weekly Schedule Popup — rendered via portal */}
            {showWeeklySchedule && habit.frequency === 'weekly' && habit.weeklyTimesPerWeek && createPortal(
              <>
                {/* Backdrop — covers entire screen */}
                <div
                  className="fixed inset-0 z-[9998] bg-black/0"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setShowWeeklySchedule(false)
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-[9999] w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-800"
                  style={{ top: popupPosition.top, left: popupPosition.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Weekly Schedule</h4>
                    <button
                      type="button"
                      onClick={() => setShowWeeklySchedule(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-base text-purple-500">repeat</span>
                      <span>
                        <strong className="text-slate-800 dark:text-white">{habit.weeklyTimesPerWeek}</strong> time{habit.weeklyTimesPerWeek > 1 ? 's' : ''} per week
                      </span>
                    </div>

                    {habit.weeklyDays && habit.weeklyDays.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Selected Days</p>
                        <div className="flex gap-1.5">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                            const isSelected = habit.weeklyDays!.includes(idx)
                            return (
                              <div
                                key={day}
                                className={clsx(
                                  'flex-1 rounded-lg py-1.5 text-center text-[10px] font-bold',
                                  isSelected
                                    ? 'bg-purple-500 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-600'
                                )}
                              >
                                {day}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>,
              document.body
            )}
            
            {/* Notes Badge */}
            {habit.notes && habit.notes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenNotes(habit.id, habit.name)
                }}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
              >
                <span className="material-symbols-outlined text-sm">note</span>
                <span>{habit.notes.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3-Dot Menu */}
        <div 
          ref={menuRef}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20"
          data-no-propagate="true"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              !isMenuOpen && 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 mobile-touch:opacity-100'
            )}
            aria-label="Habit actions"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setIsMenuOpen(!isMenuOpen)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }
            }}
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                id={menuId}
                role="menu"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-800"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onEdit(habit.id)
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                    Edit
                  </button>
                  
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onOpenNotes(habit.id, habit.name)
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">note_add</span>
                    Add Notes
                  </button>
                  
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onArchive(habit.id)
                      toast.success(`"${habit.name}" archived successfully!`)
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">archive</span>
                    Make Archive
                  </button>
                  
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onDelete(habit.id)
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}


interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-8 text-center shadow-lg dark:border-white/10 dark:bg-slate-900/80"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-400/10"
      >
        <span className="material-symbols-outlined text-5xl text-primary">{icon}</span>
      </motion.div>
      <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <span className="material-symbols-outlined">add</span>
        {actionLabel}
      </motion.button>
    </motion.div>
  )
}
