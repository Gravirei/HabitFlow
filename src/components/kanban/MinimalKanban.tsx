import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface MinimalKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function MinimalKanban({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: MinimalKanbanProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.completed || t.status === 'completed')

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const Column = ({ title, count, dotColor, tasks: columnTasks, isDone }: any) => (
    <div className="bg-white dark:bg-gray-950 p-6 border-r border-gray-200 dark:border-gray-800 last:border-r-0">
      <div className="flex items-center gap-2 mb-6">
        <div className={cn("w-2 h-2 rounded-full", dotColor)}></div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">{title}</h3>
        <span className="text-xs text-gray-400">{count}</span>
      </div>

      <div className="space-y-2">
        {columnTasks.map((task: Task) => {
          const progress = task.subtasks 
            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
            : 0

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                "group cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
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
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-sm font-medium text-gray-900 dark:text-white mb-1",
                    isDone && "line-through"
                  )}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className={cn("text-xs text-gray-500 dark:text-gray-400 mb-2", isDone && "line-through")}>
                      {task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}
                    </p>
                  )}

                  {/* Progress bar */}
                  {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 mb-2">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      )}></span>
                      {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
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
    <div className="grid grid-cols-3 gap-1 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Column title="To Do" count={todoTasks.length} dotColor="bg-gray-400" tasks={todoTasks} isDone={false} />
      <Column title="In Progress" count={inProgressTasks.length} dotColor="bg-blue-500" tasks={inProgressTasks} isDone={false} />
      <Column title="Done" count={doneTasks.length} dotColor="bg-green-500" tasks={doneTasks} isDone={true} />
    </div>
  )
}
