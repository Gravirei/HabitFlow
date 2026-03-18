import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface NotionKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function NotionKanban({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onDeleteTask,
}: NotionKanbanProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.completed || t.status === 'completed')

  const getEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      Design: '🎨',
      Development: '💻',
      Meeting: '🤝',
      Documentation: '📝',
      Bug: '🐛',
      Feature: '✨',
      Work: '💼',
      Personal: '👤',
      default: '📋',
    }
    return emojiMap[category] || emojiMap.default
  }

  const formatDueDate = (dueDate: Date | string | undefined) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const today = new Date()
    const isOverdue = date < today
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) return { text: 'Today', isUrgent: true }
    if (isOverdue) return { text: 'Overdue', isUrgent: true }
    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isUrgent: false,
    }
  }

  const Column = ({ title, subtitle, borderColor, tasks: columnTasks, emoji }: any) => (
    <div
      className="glass-card rounded-2xl border border-gray-200/50 p-5 shadow-xl dark:border-gray-700/50"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className={cn('mb-4 border-l-4 pl-4', borderColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {emoji} {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
          <button className="material-symbols-outlined text-sm text-gray-400 hover:text-gray-600">
            expand_more
          </button>
        </div>
      </div>

      <div className="space-y-3">
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
              className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-start justify-between">
                <h4
                  className={cn(
                    'flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white',
                    task.completed && 'line-through'
                  )}
                >
                  {getEmoji(task.category || '')} {task.title}
                </h4>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs font-bold',
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  )}
                >
                  {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MED' : 'LOW'}
                </span>
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

              {/* Progress bar */}
              {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    {task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {dueDate ? (
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs',
                      dueDate.isUrgent ? 'font-semibold text-red-500' : 'text-gray-500'
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
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      <Column
        title="To Do"
        subtitle={`${todoTasks.length} tasks pending`}
        borderColor="border-gray-400"
        emoji="📋"
        tasks={todoTasks}
      />
      <Column
        title="In Progress"
        subtitle={`${inProgressTasks.length} tasks active`}
        borderColor="border-blue-500"
        emoji="⚡"
        tasks={inProgressTasks}
      />
      <Column
        title="Done"
        subtitle={`${doneTasks.length} tasks completed`}
        borderColor="border-green-500"
        emoji="✅"
        tasks={doneTasks}
      />
    </div>
  )
}
