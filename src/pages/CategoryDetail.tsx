import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useTaskStore } from '@/store/useTaskStore'

const fallbackGradientByColor: Record<string, string> = {
  primary: 'from-gray-900 to-black dark:from-surface-card dark:to-surface-dark',
  blue: 'from-slate-100 to-white dark:from-surface-card dark:to-surface-dark',
  emerald: 'from-emerald-400/30 to-emerald-600/10 dark:from-emerald-500/20 dark:to-black/20',
  purple: 'from-purple-400/30 to-purple-600/10 dark:from-purple-500/20 dark:to-black/20',
  yellow: 'from-yellow-300/30 to-yellow-600/10 dark:from-yellow-500/20 dark:to-black/20',
  orange: 'from-orange-300/30 to-orange-600/10 dark:from-orange-500/20 dark:to-black/20',
  indigo: 'from-indigo-400/30 to-indigo-600/10 dark:from-indigo-500/20 dark:to-black/20',
  pink: 'from-pink-400/30 to-pink-600/10 dark:from-pink-500/20 dark:to-black/20',
  red: 'from-red-400/30 to-red-600/10 dark:from-red-500/20 dark:to-black/20',
  teal: 'from-teal-400/30 to-teal-600/10 dark:from-teal-500/20 dark:to-black/20',
  sky: 'from-sky-400 to-blue-600',
  slate: 'from-slate-200 to-white dark:from-surface-card dark:to-surface-dark',
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export function CategoryDetail() {
  const navigate = useNavigate()
  const { categoryId } = useParams<{ categoryId: string }>()

  const { getCategoryById } = useCategoryStore()
  const { getHabitsByCategory, isHabitCompletedToday, toggleHabitCompletion } = useHabitStore()

  type ContentView = 'both' | 'habits' | 'tasks'
  const [contentView, setContentView] = useState<ContentView>('both')

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
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <header className="flex items-center gap-3 p-4 pb-2 pt-safe shrink-0">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Back to categories"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Category not found</h1>
        </header>

        <main className="flex-1 px-4 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-white/10 dark:bg-surface-dark dark:text-white">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              We couldn’t find that category.
            </p>
            <div className="mt-4 flex">
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background-dark shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Go to Categories
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">
      {/* Header / Hero */}
      <header className="relative shrink-0">
        <div className="absolute inset-0">
          {category.imagePath ? (
            <img
              src={category.imagePath}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${headerGradient}`} />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 p-4 pt-safe">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/new-habit?categoryId=${category.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Habit
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
              <span className="material-symbols-outlined text-2xl text-white">
                {category.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className={`text-2xl font-extrabold tracking-tight ${category.textColor ?? 'text-white'}`}>
                {category.name}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {habits.length} Habit{habits.length === 1 ? '' : 's'}
                {categoryTasks.length > 0
                  ? ` • ${categoryTasks.length} Task${categoryTasks.length === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatPill label="Total" value={`${habits.length}`} />
            <StatPill label="Done today" value={`${completedToday}`} />
            <StatPill label="Rate" value={`${completionRate}%`} />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28">
        {/* Content toggle */}
        <div className="mb-6">
          <div
            className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-surface-dark"
            role="group"
            aria-label="Category content view"
          >
            {([
              { key: 'both', label: 'Both' },
              { key: 'habits', label: 'Habits' },
              { key: 'tasks', label: 'Tasks' },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setContentView(opt.key)}
                className={
                  'rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm ' +
                  (contentView === opt.key
                    ? 'bg-primary text-background-dark shadow-[0_4px_12px_rgba(19,236,91,0.25)]'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5')
                }
                aria-pressed={contentView === opt.key}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-surface-dark">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Today’s completion</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {completedToday}/{habits.length}
            </p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {(contentView === 'both' || contentView === 'habits') && (
          <section>
            {/* Habits list */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Habits
            </h2>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-surface-dark">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">playlist_add</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                No habits yet
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Add your first habit to start building momentum.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate(`/new-habit?categoryId=${category.id}`)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-background-dark shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Add a habit
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {habits.map((habit) => {
                const completed = isHabitCompletedToday(habit.id)

                return (
                  <li key={habit.id}>
                    <div className="group relative flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-colors dark:border-white/5 dark:bg-surface-dark">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200">
                        <span className="material-symbols-outlined">{habit.icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {habit.name}
                        </p>
                        {habit.description ? (
                          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                            {habit.description}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {habit.goal} per {habit.goalPeriod}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className={
                          'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
                          (completed
                            ? 'bg-primary text-background-dark shadow-glow'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10')
                        }
                        aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <span className="material-symbols-outlined">check</span>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          </section>
        )}

        {(contentView === 'both' || contentView === 'tasks') && (
          <section className={contentView === 'both' ? 'mt-8' : ''}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tasks
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/tasks?new=1&categoryId=${category.id}`)}
                className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
              >
                Add Task
              </button>
            </div>

            {categoryTasks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-surface-dark">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  No tasks yet
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Add a task to keep this category moving.
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks?new=1&categoryId=${category.id}`)}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-background-dark shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Add a task
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {categoryTasks.map((task) => (
                  <li key={task.id}>
                    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-surface-dark">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {task.title}
                        </p>
                        {task.description ? (
                          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={
                          'rounded-full px-3 py-1 text-[11px] font-bold ' +
                          (task.completed
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300')
                        }
                      >
                        {task.completed ? 'Done' : 'To do'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {/* FAB (always available, mirrors Categories page pattern) */}
      <div className="fixed bottom-6 right-4 z-20 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate(`/new-habit?categoryId=${category.id}`)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.4)] transition-transform duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Add a habit"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">
            add
          </span>
        </button>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur-sm ring-1 ring-white/10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-white">{value}</p>
    </div>
  )
}
