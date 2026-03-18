import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TrelloKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function TrelloKanban({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onDeleteTask,
}: TrelloKanbanProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.completed || t.status === 'completed')

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const Column = ({ title, count, tasks: columnTasks, isDone }: any) => (
    <div className="w-full rounded-xl bg-gray-100 p-4 dark:bg-gray-900 sm:w-80 sm:flex-shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {count}
          </span>
        </div>
        <button className="material-symbols-outlined text-sm text-gray-400 hover:text-gray-600">
          more_horiz
        </button>
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto">
        {columnTasks.map((task: Task) => {
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
                'cursor-pointer rounded-lg border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800',
                task.priority === 'high'
                  ? 'border-red-500'
                  : task.priority === 'medium'
                    ? 'border-amber-500'
                    : 'border-blue-500',
                isDone && 'opacity-75'
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4
                  className={cn(
                    'text-sm font-semibold text-gray-900 dark:text-white',
                    isDone && 'line-through'
                  )}
                >
                  {task.title}
                </h4>
                <span
                  className={cn(
                    'material-symbols-outlined text-sm',
                    task.priority === 'high'
                      ? 'text-red-500'
                      : task.priority === 'medium'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                  )}
                >
                  flag
                </span>
              </div>

              {task.description && (
                <p
                  className={cn(
                    'mb-3 text-xs text-gray-500 dark:text-gray-400',
                    isDone && 'line-through'
                  )}
                >
                  {task.description.slice(0, 60)}
                  {task.description.length > 60 ? '...' : ''}
                </p>
              )}

              {/* Progress bar */}
              {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{formatDueDate(task.due) || 'No due date'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory flex-col gap-4 overflow-x-auto pb-4 sm:flex-row sm:gap-4">
      <Column title="To Do" count={todoTasks.length} tasks={todoTasks} isDone={false} />
      <Column
        title="In Progress"
        count={inProgressTasks.length}
        tasks={inProgressTasks}
        isDone={false}
      />
      <Column title="Done" count={doneTasks.length} tasks={doneTasks} isDone={true} />
    </div>
  )
}
