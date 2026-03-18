import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface MinimalKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function MinimalKanban({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onDeleteTask,
}: MinimalKanbanProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.completed || t.status === 'completed')

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const Column = ({ title, count, dotColor, tasks: columnTasks, isDone }: any) => (
    <div className="border-r border-gray-200 bg-white p-6 last:border-r-0 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6 flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', dotColor)}></div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <span className="text-xs text-gray-400">{count}</span>
      </div>

      <div className="space-y-2">
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
                'group cursor-pointer rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                task.status === 'in_progress' && 'border-l-2 border-blue-500'
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation()
                    onTaskStatusChange(task.id, task.completed ? 'todo' : 'completed')
                  }}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="min-w-0 flex-1">
                  <h4
                    className={cn(
                      'mb-1 text-sm font-medium text-gray-900 dark:text-white',
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
                      {task.description.slice(0, 50)}
                      {task.description.length > 50 ? '...' : ''}
                    </p>
                  )}

                  {/* Progress bar */}
                  {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-1 rounded-full bg-blue-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                        )}
                      ></span>
                      {task.priority === 'high'
                        ? 'High'
                        : task.priority === 'medium'
                          ? 'Medium'
                          : 'Low'}
                    </span>
                    {task.due && (
                      <>
                        <span>•</span>
                        <span>{formatDueDate(task.due)}</span>
                      </>
                    )}
                    {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{progress}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 sm:grid-cols-3">
      <Column
        title="To Do"
        count={todoTasks.length}
        dotColor="bg-gray-400"
        tasks={todoTasks}
        isDone={false}
      />
      <Column
        title="In Progress"
        count={inProgressTasks.length}
        dotColor="bg-blue-500"
        tasks={inProgressTasks}
        isDone={false}
      />
      <Column
        title="Done"
        count={doneTasks.length}
        dotColor="bg-green-500"
        tasks={doneTasks}
        isDone={true}
      />
    </div>
  )
}
