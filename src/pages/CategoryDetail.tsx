import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { HabitTasksModal } from '@/components/HabitTasksModal'

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
  const { getHabitsByCategory, isHabitCompletedToday, toggleHabitCompletion } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()

  type ContentView = 'both' | 'habits' | 'tasks'
  const [contentView, setContentView] = useState<ContentView>('both')
  
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState<string>('')

  const tasks = useTaskStore((state) => state.tasks)

  const category = categoryId ? getCategoryById(categoryId) : undefined

  const habits = useMemo(() => {
    if (!categoryId) return []
    return getHabitsByCategory(categoryId)
  }, [categoryId, getHabitsByCategory])

  const categoryTasks = useMemo(() => {
    if (!categoryId) return []
    return tasks.filter((task) => task.categoryId === categoryId)
  }, [categoryId, tasks])

  const completedToday = useMemo(
    () => habits.filter((habit) => isHabitCompletedToday(habit.id)).length,
    [habits, isHabitCompletedToday]
  )

  const completionRate = useMemo(() => {
    if (habits.length === 0) return 0
    return clampPercent(Math.round((completedToday / habits.length) * 100))
  }, [completedToday, habits.length])

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
                  {categoryTasks.length > 0 && (
                    <> • {categoryTasks.length} {categoryTasks.length === 1 ? 'Task' : 'Tasks'}</>
                  )}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-3 gap-3 lg:hidden">
              <StatCard label="Total" value={habits.length.toString()} icon="playlist_add_check" delay={0.3} />
              <StatCard label="Done Today" value={completedToday.toString()} icon="check_circle" delay={0.35} />
              <StatCard label="Rate" value={`${completionRate}%`} icon="trending_up" delay={0.4} />
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-5 overflow-hidden rounded-full bg-black/30 backdrop-blur-xl border border-white/10"
            >
              <div className="relative h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_20px_rgba(19,236,91,0.5)]"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-28 lg:flex lg:gap-6 lg:px-6 xl:px-8">
        {/* Left/Center Content Area */}
        <div className="flex-1 lg:min-w-0">
          {/* Content Tabs - Hidden on desktop when sidebar is visible */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex justify-center lg:hidden"
          >
            <div className="inline-flex gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-1.5 shadow-lg dark:border-white/5 dark:bg-slate-900/80">
              {([
                { key: 'both', label: 'Both', icon: 'view_agenda' },
                { key: 'habits', label: 'Habits', icon: 'track_changes' },
                { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
              ] as const).map((opt) => (
                <motion.button
                  key={opt.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setContentView(opt.key)}
                  className={clsx(
                    'relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    contentView === opt.key
                      ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-lg shadow-primary/20'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  )}
                  aria-pressed={contentView === opt.key}
                >
                  <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Habits Section */}
          <AnimatePresence mode="wait">
            {(contentView === 'both' || contentView === 'habits') && (
              <motion.section
                key="habits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Tasks Section */}
          <AnimatePresence mode="wait">
            {(contentView === 'both' || contentView === 'tasks') && (
              <motion.section
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={contentView === 'both' ? 'mt-8' : ''}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-lg">task_alt</span>
                    Tasks
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => navigate(`/tasks?new=1&categoryId=${category.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Task
                  </motion.button>
                </div>

                {categoryTasks.length === 0 ? (
                  <EmptyState
                    icon="task_alt"
                    title="No tasks yet"
                    description="Add a task to keep this category moving forward."
                    actionLabel="Add a task"
                    onAction={() => navigate(`/tasks?new=1&categoryId=${category.id}`)}
                  />
                ) : (
                  <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 xl:grid-cols-2">
                    {categoryTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
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
                <SidebarStatItem label="Completed Today" value={completedToday.toString()} icon="check_circle" />
                <SidebarStatItem label="Completion Rate" value={`${completionRate}%`} icon="trending_up" />
                <SidebarStatItem label="Tasks" value={categoryTasks.length.toString()} icon="task_alt" />
              </div>
            </div>

            {/* Progress Overview */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/80">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-lg">show_chart</span>
                Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Today</span>
                    <span className="text-sm font-bold text-primary">{completionRate}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(19,236,91,0.3)]"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {completedToday} of {habits.length} habits completed
                  </p>
                </div>
              </div>
            </div>

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
                  onClick={() => navigate(`/new-habit?categoryId=${category.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 p-4 text-left text-slate-900 shadow-lg shadow-primary/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-2xl">add_circle</span>
                  <span className="text-sm font-bold">Add New Habit</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate(`/tasks?new=1&categoryId=${category.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-100 p-4 text-left text-slate-700 transition-all hover:bg-slate-200 cursor-pointer dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-2xl">add_task</span>
                  <span className="text-sm font-bold">Add New Task</span>
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
          onClick={() => navigate(`/new-habit?categoryId=${category.id}`)}
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
          }}
          habitId={selectedHabitId}
          habitName={selectedHabitName}
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

function StatCard({ label, value, icon, delay }: { label: string; value: string; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-white/70">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-black text-white drop-shadow">{value}</p>
    </motion.div>
  )
}

interface HabitCardProps {
  habit: any
  index: number
  taskCount: number
  onClick: () => void
}

function HabitCard({ habit, index, taskCount, onClick }: HabitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-lg transition-all cursor-pointer dark:border-white/5 dark:bg-slate-900/80"
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-400/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-md dark:from-white/10 dark:to-white/5 dark:text-slate-200">
          <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
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
          
          {/* Task Count */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-base">task</span>
            <span className="font-semibold">{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>

        {/* Chevron Icon */}
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface TaskCardProps {
  task: any
  index: number
}

function TaskCard({ task, index }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-4 shadow-lg transition-all dark:border-white/5 dark:bg-slate-900/80"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900 dark:text-white">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {task.description}
            </p>
          )}
        </div>
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={clsx(
            'shrink-0 rounded-full px-4 py-2 text-xs font-bold shadow-sm',
            task.completed
              ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900'
              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
          )}
        >
          {task.completed ? 'Done' : 'To Do'}
        </motion.span>
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
