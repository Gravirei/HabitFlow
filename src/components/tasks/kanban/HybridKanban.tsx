import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface HybridKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function HybridKanban({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onDeleteTask,
}: HybridKanbanProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.completed || t.status === 'completed')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-600 dark:text-red-400',
          dot: 'bg-red-500',
        }
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          text: 'text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
        }
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          dot: 'bg-blue-500',
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          text: 'text-gray-600 dark:text-gray-400',
          dot: 'bg-gray-500',
        }
    }
  }

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const today = new Date()
    const isOverdue = date < today
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) return { text: 'Due Today', isUrgent: true }
    if (isOverdue) return { text: 'Overdue', isUrgent: true }
    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isUrgent: false,
    }
  }

  const Column = ({ title, count, borderColor, bgColor, icon, tasks: columnTasks }: any) => (
    <div
      className={cn(
        'w-full rounded-2xl border-t-4 p-4 shadow-lg sm:w-80 sm:flex-shrink-0',
        bgColor,
        borderColor
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('material-symbols-outlined text-xl', icon.color)}>{icon.name}</span>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', icon.badge)}>
            {count}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {columnTasks.map((task: Task) => {
          const priorityColors = getPriorityColor(task.priority)
          const dueDate = formatDueDate(task.due)
          const progress = task.subtasks
            ? Math.round(
                (task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100
              )
            : 0

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                'group cursor-pointer rounded-xl border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:bg-gray-800',
                borderColor,
                task.completed && 'opacity-75'
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4
                  className={cn(
                    'text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400',
                    task.completed && 'line-through'
                  )}
                >
                  {task.title}
                </h4>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-0.5',
                    priorityColors.bg
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', priorityColors.dot)}></span>
                  <span className={cn('text-xs font-bold', priorityColors.text)}>
                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                  </span>
                </div>
              </div>

              {task.description && (
                <p
                  className={cn(
                    'mb-3 text-xs text-gray-500 dark:text-gray-400',
                    task.completed && 'line-through'
                  )}
                >
                  {task.description.slice(0, 80)}
                  {task.description.length > 80 ? '...' : ''}
                </p>
              )}

              {/* Progress bar for in-progress tasks */}
              {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                {dueDate ? (
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-xs',
                      dueDate.isUrgent
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    <span className="material-symbols-outlined text-base">
                      {dueDate.isUrgent ? 'alarm' : 'schedule'}
                    </span>
                    <span>{dueDate.text}</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No due date</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory flex-col gap-4 overflow-x-auto pb-4 sm:flex-row sm:gap-4">
      <Column
        title="To Do"
        count={todoTasks.length}
        borderColor="border-gray-400"
        bgColor="bg-gray-50 dark:bg-gray-900"
        icon={{
          name: 'inbox',
          color: 'text-gray-500',
          badge: 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        }}
        tasks={todoTasks}
      />
      <Column
        title="In Progress"
        count={inProgressTasks.length}
        borderColor="border-blue-500"
        bgColor="bg-blue-50 dark:bg-blue-950/30"
        icon={{
          name: 'schedule',
          color: 'text-blue-500',
          badge: 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        }}
        tasks={inProgressTasks}
      />
      <Column
        title="Done"
        count={doneTasks.length}
        borderColor="border-green-500"
        bgColor="bg-green-50 dark:bg-green-950/30"
        icon={{
          name: 'check_circle',
          color: 'text-green-500',
          badge: 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300',
        }}
        tasks={doneTasks}
      />
    </div>
  )
}
