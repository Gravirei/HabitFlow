import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
import clsx from 'clsx'

interface HabitTaskCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
  isHabitCompleted: boolean
  onTaskToggle: (taskId: string) => void
  onAllTasksComplete: (habitId: string) => void
  onTasksIncomplete: (habitId: string) => void
}

export function HabitTaskCompletionModal({
  isOpen,
  onClose,
  habitId,
  habitName,
  isHabitCompleted,
  onTaskToggle,
  onAllTasksComplete,
  onTasksIncomplete,
}: HabitTaskCompletionModalProps) {
  const [showUnmarkWarning, setShowUnmarkWarning] = useState(false)
  
  // Draft mode: Store original task states and local changes
  const originalTaskStates = useRef<Map<string, boolean>>(new Map())
  const [draftTaskStates, setDraftTaskStates] = useState<Map<string, boolean>>(new Map())
  const isSavingRef = useRef(false) // Flag to prevent revert when saving
  const prevIsOpenRef = useRef(false) // Track previous isOpen state
  const { tasks } = useHabitTaskStore()
  const habitTasks = useMemo(() => tasks.filter((t) => t.habitId === habitId), [tasks, habitId])
  
  // Use draft states for display, fallback to actual task states
  const completedCount = habitTasks.filter((t) => {
    const draftState = draftTaskStates.get(t.id)
    return draftState !== undefined ? draftState : t.completed
  }).length
  const totalCount = habitTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Initialize draft states when modal opens (only on open transition)
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    const isNowOpen = isOpen
    
    // Only initialize when transitioning from closed to open
    if (!wasOpen && isNowOpen) {
      // Delay to ensure Zustand store has updated
      const timeoutId = setTimeout(() => {
        const originalStates = new Map<string, boolean>()
        const draftStates = new Map<string, boolean>()
        
        habitTasks.forEach(task => {
          originalStates.set(task.id, task.completed)
          draftStates.set(task.id, task.completed)
        })
        
        originalTaskStates.current = originalStates
        setDraftTaskStates(draftStates)
        isSavingRef.current = false // Reset flag when opening
      }, 100) // 100ms delay for store to update
      
      return () => clearTimeout(timeoutId)
    }
    
    // Update prev ref
    prevIsOpenRef.current = isOpen
    
    // Clear draft states when closing
    if (!isNowOpen && wasOpen) {
      setDraftTaskStates(new Map())
    }
  }, [isOpen, habitId, tasks, habitTasks])

  // Handle task toggle in draft mode
  const handleTaskToggleDraft = (taskId: string) => {
    setDraftTaskStates(prev => {
      const newMap = new Map(prev)
      const currentState = newMap.get(taskId)
      newMap.set(taskId, !currentState)
      return newMap
    })
  }
  
  // Close modal without saving changes
  const handleCancelClose = () => {
    // If we're saving, skip revert logic
    if (isSavingRef.current) {
      onClose()
      return
    }
    
    // Don't revert here - just close
    // Next time modal opens, it will initialize from fresh database state
    onClose()
  }
  
  // Save changes and close modal
  const handleDoneClick = () => {
    // Check if we need to show warning BEFORE persisting changes
    if (isHabitCompleted && completedCount < totalCount) {
      // Show warning without persisting yet
      setShowUnmarkWarning(true)
    } else {
      // No warning needed - persist changes and close
      draftTaskStates.forEach((draftState, taskId) => {
        const originalState = originalTaskStates.current.get(taskId)
        if (draftState !== originalState) {
          onTaskToggle(taskId)
        }
      })
      
      if (completedCount === totalCount && totalCount > 0) {
        onAllTasksComplete(habitId)
      }
      // Close directly - bypass cancel logic
      isSavingRef.current = true
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div 
            className="fixed inset-0 z-[101] flex items-end justify-center sm:items-center"
            onClick={handleCancelClose}
          >
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
                    onClick={handleCancelClose}
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
                    {habitTasks.map((task, index) => {
                      const isCompleted = draftTaskStates.get(task.id) ?? task.completed
                      return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => handleTaskToggleDraft(task.id)}
                          className={clsx(
                            'group relative w-full overflow-hidden rounded-2xl p-4 text-left shadow-sm ring-1 transition-all duration-200',
                            isCompleted
                              ? 'bg-teal-50 ring-teal-200/60 dark:bg-teal-950/20 dark:ring-teal-500/20'
                              : 'bg-gray-50 ring-gray-200/60 hover:bg-gray-100 dark:bg-gray-800/50 dark:ring-white/5 dark:hover:bg-gray-800'
                          )}
                        >
                          {isCompleted && (
                            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-teal-400/10 blur-xl" />
                          )}

                          <div className="relative z-10 flex items-center gap-3">
                            {/* iOS Toggle */}
                            <div
                              className={clsx(
                                'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                                isCompleted
                                  ? 'bg-teal-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              )}
                            >
                              <motion.div
                                animate={{ x: isCompleted ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
                              />
                            </div>

                            {/* Task name */}
                            <span
                              className={clsx(
                                'flex-1 text-sm font-medium transition-colors',
                                isCompleted
                                  ? 'text-teal-800 dark:text-teal-300'
                                  : 'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              {task.title}
                            </span>

                            {/* Check icon */}
                            <AnimatePresence>
                              {isCompleted && (
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
                      )}
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  onClick={handleDoneClick}
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

    {/* Warning Dialog - Higher z-index than modal */}
    <div style={{ zIndex: 9999 }}>
      <ConfirmDialog
        isOpen={showUnmarkWarning}
        onClose={() => setShowUnmarkWarning(false)}
      onConfirm={() => {
        // Persist the draft changes first
        draftTaskStates.forEach((draftState, taskId) => {
          const originalState = originalTaskStates.current.get(taskId)
          if (draftState !== originalState) {
            onTaskToggle(taskId)
          }
        })
        // Then unmark the habit
        onTasksIncomplete(habitId)
        setShowUnmarkWarning(false)
        isSavingRef.current = true
        onClose()
      }}
      title="Unmark Habit as Complete?"
      message="This habit is already complete. Marking tasks as incomplete will unmark the habit. Do you want to continue?"
      confirmText="Yes, Unmark"
      cancelText="Cancel"
      variant="warning"
      icon="warning"
      />
    </div>
  </>
  )
}
