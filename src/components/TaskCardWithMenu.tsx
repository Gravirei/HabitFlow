import { useFloating, autoUpdate, offset, flip, shift, limitShift } from '@floating-ui/react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types/task'

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
  const isMenuOpen = openMenuTaskId === task.id

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
      onClick={() => setEditingTask(task)}
      className={cn(
        "group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-primary/50 transition-all duration-300 cursor-pointer",
        openMenuTaskId && openMenuTaskId !== task.id && "blur-sm opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Opacity wrapper for checkbox and content only */}
        <div className={cn("flex items-center gap-4 flex-1 min-w-0", task.completed && "opacity-60")}>
          {/* Modern Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              toggleTask(task.id)
            }}
            className="flex-shrink-0"
          >
            <div className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
              task.completed
                ? 'bg-gradient-to-br from-primary to-purple-600 border-primary scale-110'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:scale-110'
            )}>
              {task.completed && (
                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold text-gray-900 dark:text-white text-base leading-tight mb-1",
                  task.completed && 'line-through opacity-50'
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>
              
              {/* Priority Indicator */}
              <div className={cn(
                "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                task.priority === 'high' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                task.priority === 'medium' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                'bg-blue-500 shadow-lg shadow-blue-500/50'
              )} />
            </div>

            {/* Metadata Row */}
            <div className="flex items-center justify-between gap-4 mt-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Status Badge */}
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                  task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {task.status.replace('_', ' ')}
                </span>

                {/* Category */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                  <span className="material-symbols-outlined text-sm">folder</span>
                  {task.category}
                </span>

                {/* Due Date */}
                {dueText && (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                    isOverdue
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  )}>
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {dueText}
                    {task.dueTime && ` ${task.dueTime}`}
                  </span>
                )}

                {/* Time Estimate */}
                {task.timeEstimate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    {task.timeEstimate}m
                  </span>
                )}

                {/* Tags */}
                {task.tags.length > 0 && task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Subtasks Progress - Compact */}
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
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
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Task actions"
          >
            <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">more_vert</span>
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
                className="w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden max-h-[calc(100vh-220px)] overflow-y-auto"
              >
                {/* Mark as Done/Undone */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTask(task.id)
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
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
                    const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
                    const currentIndex = priorities.indexOf(task.priority)
                    const nextPriority = priorities[(currentIndex + 1) % priorities.length]
                    setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: nextPriority } : t))
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">flag</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Change priority</span>
                </button>

                {/* Move to Category */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">drive_file_move</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Move</span>
                </button>

                {/* Task Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">open_in_new</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Task details</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">edit</span>
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
                      createdAt: new Date().toISOString()
                    }
                    setTasks([...tasks, newTask])
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">content_copy</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Duplicate</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this task?')) {
                      deleteTask(task.id)
                    }
                    setOpenMenuTaskId(null)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">delete</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
