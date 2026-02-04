import { useState } from 'react'
import { useFloating, autoUpdate, offset, flip, shift, limitShift } from '@floating-ui/react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types/task'
import { SubtaskModal } from './SubtaskModal'

interface TaskCardWithMenuProps {
  task: Task
  dueText: string | null
  isOverdue: boolean
  completionPercentage: number
  openMenuTaskId: string | null
  setOpenMenuTaskId: (id: string | null) => void
  setEditingTask: (task: Task) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

export function TaskCardWithMenu({
  task,
  dueText,
  isOverdue,
  completionPercentage,
  openMenuTaskId,
  setOpenMenuTaskId,
  setEditingTask,
  toggleTask,
  deleteTask,
  tasks,
  setTasks,
}: TaskCardWithMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showSubtaskModal, setShowSubtaskModal] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>(task.priority)
  const [showIncompleteSubtasksWarning, setShowIncompleteSubtasksWarning] = useState(false)
  const isMenuOpen = openMenuTaskId === task.id

  // Check if task has incomplete subtasks
  const hasIncompleteSubtasks =
    task.subtasks && task.subtasks.length > 0 && task.subtasks.some((st) => !st.completed)
  const incompleteSubtasksCount = task.subtasks
    ? task.subtasks.filter((st) => !st.completed).length
    : 0

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // If uncompleting a task, just do it
    if (task.completed) {
      toggleTask(task.id)
      return
    }

    // If completing and has incomplete subtasks, show warning
    if (hasIncompleteSubtasks) {
      setShowIncompleteSubtasksWarning(true)
      return
    }

    // Otherwise, complete normally
    toggleTask(task.id)
  }

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          }
        }
        return t
      })
    )
  }

  // Floating UI setup
  const { refs, floatingStyles } = useFloating({
    open: isMenuOpen,
    onOpenChange: (open) => {
      if (!open) setOpenMenuTaskId(null)
    },
    middleware: [
      offset(8), // 8px gap from button
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 10,
      }),
      shift({
        padding: 10,
        limiter: limitShift({
          offset: 200, // Keep menu below header (approx 200px)
        }),
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'right-start', // Default: open to the right, aligned with top
  })

  return (
    <div
      onClick={() => setShowSubtaskModal(true)}
      className={cn(
        'group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-gray-900/50',
        openMenuTaskId && openMenuTaskId !== task.id && 'pointer-events-none opacity-50 blur-sm'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Opacity wrapper for checkbox and content only */}
        <div
          className={cn('flex min-w-0 flex-1 items-center gap-4', task.completed && 'opacity-60')}
        >
          {/* Modern Checkbox */}
          <div onClick={handleCheckboxClick} className="flex-shrink-0 cursor-pointer">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-200',
                task.completed
                  ? 'scale-110 border-primary bg-gradient-to-br from-primary to-purple-600'
                  : 'border-gray-300 hover:scale-110 hover:border-primary dark:border-gray-600'
              )}
            >
              {task.completed && (
                <span className="material-symbols-outlined text-base font-bold text-white">
                  check
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="min-w-0 flex-1">
            {/* Title and Priority */}
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    'mb-1 text-base font-bold leading-tight text-gray-900 dark:text-white',
                    task.completed && 'line-through opacity-50'
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="line-clamp-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Priority Indicator */}
              <div
                className={cn(
                  'mt-2 h-2 w-2 flex-shrink-0 rounded-full',
                  task.priority === 'high'
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : task.priority === 'medium'
                      ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                      : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                )}
              />
            </div>

            {/* Metadata Row */}
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {/* Status Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium',
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {task.status.replace('_', ' ')}
                </span>

                {/* Category */}
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <span className="material-symbols-outlined text-sm">folder</span>
                  {task.category}
                </span>

                {/* Due Date */}
                {dueText && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium',
                      isOverdue
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    )}
                  >
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {dueText}
                    {task.dueTime && ` ${task.dueTime}`}
                  </span>
                )}

                {/* Time Estimate */}
                {task.timeEstimate && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    {task.timeEstimate}m
                  </span>
                )}

                {/* Tags */}
                {task.tags.length > 0 &&
                  task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                {task.tags.length > 2 && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Subtasks Progress - Compact */}
              {task.subtasks.length > 0 && (
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Dot Menu - Outside opacity wrapper */}
        <div className="relative flex-shrink-0">
          <button
            ref={refs.setReference}
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenuTaskId(isMenuOpen ? null : task.id)
            }}
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Task actions"
          >
            <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">
              more_vert
            </span>
          </button>

          {/* Action Menu Modal with Floating UI */}
          {isMenuOpen && (
            <>
              {/* Backdrop - no blur on backdrop itself */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenMenuTaskId(null)
                }}
              />

              {/* Menu */}
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                className="z-[60] max-h-[calc(100vh-220px)] w-56 overflow-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Mark as Done/Undone */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuTaskId(null)

                    // If uncompleting, just do it
                    if (task.completed) {
                      toggleTask(task.id)
                      return
                    }

                    // If completing and has incomplete subtasks, show warning
                    if (hasIncompleteSubtasks) {
                      setShowIncompleteSubtasksWarning(true)
                      return
                    }

                    // Otherwise, complete normally
                    toggleTask(task.id)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    {task.completed ? 'radio_button_unchecked' : 'check_circle'}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {task.completed ? 'Mark as undone' : 'Mark as done'}
                  </span>
                </button>

                {/* Change Priority */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPriorityMenu(true)
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    flag
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Change priority
                  </span>
                </button>

                {/* Move to Status */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoveMenu(true)
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    drive_file_move
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Move to...
                  </span>
                </button>

                {/* Task Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    open_in_new
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Task details
                  </span>
                </button>

                {/* Divider */}
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    edit
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Edit</span>
                </button>

                {/* Duplicate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newTask: Task = {
                      ...task,
                      id: Date.now().toString(),
                      title: `${task.title} (Copy)`,
                      completed: false,
                      createdAt: new Date().toISOString(),
                    }
                    setTasks([...tasks, newTask])
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    content_copy
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Duplicate
                  </span>
                </button>

                {/* Divider */}
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                    setOpenMenuTaskId(null)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">
                    delete
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div
            className="animate-in fade-in fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm duration-200"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowDeleteConfirm(false)
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div
            className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="animate-in zoom-in-95 pointer-events-auto w-full max-w-md rounded-2xl bg-white shadow-2xl duration-200 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">
                      warning
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Delete Task?
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">"{task.title}"</span>?
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
                      This task has {task.subtasks.length} subtask
                      {task.subtasks.length > 1 ? 's' : ''} that will also be deleted.
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(false)
                  }}
                  className="rounded-xl px-6 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTask(task.id)
                    setShowDeleteConfirm(false)
                  }}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Move to Status Modal */}
      {showMoveMenu && (
        <>
          {/* Backdrop */}
          <div
            className="animate-in fade-in fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm duration-200"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowMoveMenu(false)
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div
            className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="animate-in zoom-in-95 pointer-events-auto w-full max-w-md rounded-2xl bg-white shadow-2xl duration-200 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">
                      drive_file_move
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Move Task</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change task status</p>
                  </div>
                </div>
              </div>

              {/* Content - Status Options */}
              <div className="space-y-2 px-6 py-5">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Move <span className="font-semibold">"{task.title}"</span> to:
                </p>

                {[
                  {
                    value: 'todo',
                    label: 'To Do',
                    icon: 'inbox',
                    color: 'text-gray-600 dark:text-gray-400',
                  },
                  {
                    value: 'in-progress',
                    label: 'In Progress',
                    icon: 'schedule',
                    color: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    value: 'done',
                    label: 'Done',
                    icon: 'check_circle',
                    color: 'text-green-600 dark:text-green-400',
                  },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      setTasks(
                        tasks.map((t) =>
                          t.id === task.id
                            ? {
                                ...t,
                                status: status.value as any,
                                completed: status.value === 'done',
                              }
                            : t
                        )
                      )
                      setShowMoveMenu(false)
                    }}
                    disabled={task.status === status.value}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
                      task.status === status.value
                        ? 'cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-800'
                        : 'hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-2xl', status.color)}>
                      {status.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {status.label}
                      </div>
                      {task.status === status.value && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Current status
                        </div>
                      )}
                    </div>
                    {task.status === status.value && (
                      <span className="material-symbols-outlined text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoveMenu(false)
                  }}
                  className="rounded-xl px-6 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Change Priority Modal */}
      {showPriorityMenu && (
        <>
          {/* Backdrop with outside click */}
          <div
            className="animate-in fade-in fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm duration-200"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowPriorityMenu(false)
              setSelectedPriority(task.priority) // Reset to original priority
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div
            className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="animate-in zoom-in-95 pointer-events-auto w-full max-w-md rounded-2xl bg-white shadow-2xl duration-200 dark:bg-gray-900"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <span className="material-symbols-outlined text-2xl text-orange-600 dark:text-orange-400">
                      flag
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Change Priority
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Set task priority level
                    </p>
                  </div>
                </div>
              </div>

              {/* Content - Priority Options */}
              <div className="space-y-2 px-6 py-5">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Set priority for <span className="font-semibold">"{task.title}"</span>:
                </p>

                {[
                  {
                    value: 'high',
                    label: 'High Priority',
                    icon: 'priority_high',
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-500',
                  },
                  {
                    value: 'medium',
                    label: 'Medium Priority',
                    icon: 'drag_handle',
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    border: 'border-amber-500',
                  },
                  {
                    value: 'low',
                    label: 'Low Priority',
                    icon: 'arrow_downward',
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-500',
                  },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPriority(priority.value as any)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200',
                      selectedPriority === priority.value
                        ? cn('border-2', priority.border, priority.bg)
                        : 'border-transparent hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-2xl', priority.color)}>
                      {priority.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {priority.label}
                      </div>
                      {selectedPriority === priority.value && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">Selected</div>
                      )}
                    </div>
                    {selectedPriority === priority.value && (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPriorityMenu(false)
                    setSelectedPriority(task.priority) // Reset to original
                  }}
                  className="rounded-xl px-6 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setTasks(
                      tasks.map((t) =>
                        t.id === task.id ? { ...t, priority: selectedPriority } : t
                      )
                    )
                    setShowPriorityMenu(false)
                  }}
                  className="rounded-xl bg-gradient-to-r from-primary to-green-500 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Incomplete Subtasks Warning Modal */}
      {showIncompleteSubtasksWarning && (
        <>
          {/* Backdrop */}
          <div
            className="animate-in fade-in fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm duration-200"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowIncompleteSubtasksWarning(false)
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div
            className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="animate-in zoom-in-95 pointer-events-auto w-full max-w-md rounded-2xl bg-white shadow-2xl duration-200 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">
                      warning
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Incomplete Subtasks
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Some subtasks are not completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">"{task.title}"</span> still has{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {incompleteSubtasksCount} incomplete subtask
                    {incompleteSubtasksCount > 1 ? 's' : ''}
                  </span>
                  .
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Do you really want to mark this task as done without completing all subtasks?
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowIncompleteSubtasksWarning(false)
                  }}
                  className="rounded-xl px-6 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTask(task.id)
                    setShowIncompleteSubtasksWarning(false)
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
                >
                  Mark as Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subtask Modal */}
      <SubtaskModal
        isOpen={showSubtaskModal}
        onClose={() => setShowSubtaskModal(false)}
        task={task}
        onToggleSubtask={handleToggleSubtask}
      />
    </div>
  )
}
