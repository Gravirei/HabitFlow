import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TrelloKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function TrelloKanban({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: TrelloKanbanProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.completed || t.status === 'completed')

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const Column = ({ title, count, tasks: columnTasks, isDone }: any) => (
    <div className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
            {count}
          </span>
        </div>
        <button className="material-symbols-outlined text-gray-400 hover:text-gray-600 text-sm">more_horiz</button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {columnTasks.map((task: Task) => {
          const progress = task.subtasks 
            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
            : 0

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4",
                task.priority === 'high' ? 'border-red-500' :
                task.priority === 'medium' ? 'border-amber-500' : 'border-blue-500',
                isDone && "opacity-75"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={cn(
                  "font-semibold text-gray-900 dark:text-white text-sm",
                  isDone && "line-through"
                )}>
                  {task.title}
                </h4>
                <span className={cn(
                  "material-symbols-outlined text-sm",
                  task.priority === 'high' ? 'text-red-500' :
                  task.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                )}>
                  flag
                </span>
              </div>

              {task.description && (
                <p className={cn("text-xs text-gray-500 dark:text-gray-400 mb-3", isDone && "line-through")}>
                  {task.description.slice(0, 60)}{task.description.length > 60 ? '...' : ''}
                </p>
              )}

              {/* Progress bar */}
              {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded">
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      <Column title="To Do" count={todoTasks.length} tasks={todoTasks} isDone={false} />
      <Column title="In Progress" count={inProgressTasks.length} tasks={inProgressTasks} isDone={false} />
      <Column title="Done" count={doneTasks.length} tasks={doneTasks} isDone={true} />
    </div>
  )
}
