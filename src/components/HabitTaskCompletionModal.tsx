import { motion, AnimatePresence } from 'framer-motion'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { useEffect } from 'react'
import clsx from 'clsx'

interface HabitTaskCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
  onTaskToggle: (taskId: string) => void
  onAllTasksComplete: (habitId: string) => void
}

export function HabitTaskCompletionModal({
  isOpen,
  onClose,
  habitId,
  habitName,
  onTaskToggle,
  onAllTasksComplete,
}: HabitTaskCompletionModalProps) {
  const { tasks } = useHabitTaskStore()
  const habitTasks = tasks.filter((t) => t.habitId === habitId)
  const completedCount = habitTasks.filter((t) => t.completed).length
  const totalCount = habitTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  
  // DEBUG - Log everything
  console.log('📋 HabitTaskCompletionModal Debug:', {
    isOpen,
    habitId,
    habitName,
    allTasks: tasks,
    allTasksCount: tasks.length,
    habitTasks,
    habitTasksCount: habitTasks.length,
    completedCount,
    totalCount,
    progress,
    firstTask: habitTasks[0]
  })

  // Auto-complete habit when all tasks are done
  useEffect(() => {
    if (isOpen && totalCount > 0 && completedCount === totalCount) {
      // Small delay for animation feedback
      const timeout = setTimeout(() => {
        onAllTasksComplete(habitId)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, completedCount, totalCount, habitId, onAllTasksComplete])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-gray-900"
            >
              {/* Header with glassmorphism */}
              <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-6 pb-6 pt-5">
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>

                  {/* Title */}
                  <div className="pr-8">
                    <div className="flex items-center gap-2">
                      <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="material-symbols-outlined text-2xl text-white"
                      >
                        task_alt
                      </motion.span>
                      <h2 className="text-lg font-bold text-white">Complete Tasks</h2>
                    </div>
                    <p className="mt-1 text-sm text-white/80">{habitName}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-white/90">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="h-full rounded-full bg-white shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Task list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {habitTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">
                      check_circle
                    </span>
                    <p className="text-sm text-gray-500">No tasks for this habit</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {habitTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => onTaskToggle(task.id)}
                          className={clsx(
                            'group relative w-full overflow-hidden rounded-2xl p-4 text-left shadow-sm ring-1 transition-all duration-200',
                            task.completed
                              ? 'bg-teal-50 ring-teal-200/60 dark:bg-teal-950/20 dark:ring-teal-500/20'
                              : 'bg-gray-50 ring-gray-200/60 hover:bg-gray-100 dark:bg-gray-800/50 dark:ring-white/5 dark:hover:bg-gray-800'
                          )}
                        >
                          {task.completed && (
                            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-teal-400/10 blur-xl" />
                          )}

                          <div className="relative z-10 flex items-center gap-3">
                            {/* iOS Toggle */}
                            <div
                              className={clsx(
                                'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                                task.completed
                                  ? 'bg-teal-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              )}
                            >
                              <motion.div
                                animate={{ x: task.completed ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
                              />
                            </div>

                            {/* Task name */}
                            <span
                              className={clsx(
                                'flex-1 text-sm font-medium transition-colors',
                                task.completed
                                  ? 'text-teal-800 dark:text-teal-300'
                                  : 'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              {task.title}
                            </span>

                            {/* Check icon */}
                            <AnimatePresence>
                              {task.completed && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: 'spring', stiffness: 500 }}
                                  className="material-symbols-outlined text-xl text-teal-500"
                                >
                                  check_circle
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
