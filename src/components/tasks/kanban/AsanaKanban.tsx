import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface AsanaKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function AsanaKanban({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onDeleteTask,
}: AsanaKanbanProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.completed || t.status === 'completed')

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

  const Column = ({ title, count, barColor, bgGradient, tasks: columnTasks, isDone }: any) => (
    <div className="w-full sm:w-80 sm:flex-shrink-0">
      <div className={cn('rounded-2xl p-4', bgGradient)}>
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className={cn('h-6 w-1 rounded-full', barColor)}></div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-400">
              {count}
            </span>
          </div>
          <button className="material-symbols-outlined text-lg text-gray-400 hover:text-gray-600">
            add
          </button>
        </div>

        <div className="space-y-2">
          {columnTasks.map((task: Task) => {
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
                className="group cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-900"
              >
                <div className="mb-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onTaskStatusChange(task.id, task.completed ? 'todo' : 'completed')
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'mb-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400',
                        isDone && 'line-through'
                      )}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p
                        className={cn(
                          'mb-2 text-xs text-gray-500 dark:text-gray-400',
                          isDone && 'line-through'
                        )}
                      >
                        {task.description.slice(0, 60)}
                        {task.description.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      )}
                    >
                      <span className="material-symbols-outlined text-xs">flag</span>
                      {task.priority === 'high'
                        ? 'High'
                        : task.priority === 'medium'
                          ? 'Med'
                          : 'Low'}
                    </span>
                    {task.category && (
                      <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  {dueDate ? (
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        dueDate.isUrgent
                          ? 'font-semibold text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {dueDate.isUrgent ? 'alarm' : 'calendar_today'}
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
    </div>
  )

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory flex-col gap-4 overflow-x-auto pb-4 sm:flex-row sm:gap-4">
      <Column
        title="To Do"
        count={todoTasks.length}
        barColor="bg-gray-400"
        bgGradient="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950"
        tasks={todoTasks}
        isDone={false}
      />
      <Column
        title="In Progress"
        count={inProgressTasks.length}
        barColor="bg-blue-500"
        bgGradient="bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/20"
        tasks={inProgressTasks}
        isDone={false}
      />
      <Column
        title="Done"
        count={doneTasks.length}
        barColor="bg-green-500"
        bgGradient="bg-gradient-to-b from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-950/20"
        tasks={doneTasks}
        isDone={true}
      />
    </div>
  )
}
