import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface HybridKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function HybridKanban({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: HybridKanbanProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  const doneTasks = tasks.filter(t => t.completed || t.status === 'done')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' }
      case 'medium': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' }
      case 'low': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' }
      default: return { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' }
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
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isUrgent: false }
  }

  const Column = ({ title, count, borderColor, bgColor, icon, tasks: columnTasks }: any) => (
    <div className={cn("flex-shrink-0 w-80 rounded-2xl p-4 shadow-lg border-t-4", bgColor, borderColor)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("material-symbols-outlined text-xl", icon.color)}>{icon.name}</span>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full", icon.badge)}>
            {count}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {columnTasks.map((task: Task) => {
          const priorityColors = getPriorityColor(task.priority)
          const dueDate = formatDueDate(task.due)
          const progress = task.subtasks 
            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
            : 0

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-l-4 group",
                borderColor,
                task.completed && "opacity-75"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={cn(
                  "font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                  task.completed && "line-through"
                )}>
                  {task.title}
                </h4>
                <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md", priorityColors.bg)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", priorityColors.dot)}></span>
                  <span className={cn("text-xs font-bold", priorityColors.text)}>
                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className={cn("text-xs text-gray-500 dark:text-gray-400 mb-3", task.completed && "line-through")}>
                  {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
                </p>
              )}

              {/* Progress bar for in-progress tasks */}
              {task.status === 'in-progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                    {task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                {dueDate ? (
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs",
                    dueDate.isUrgent ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-500 dark:text-gray-400"
                  )}>
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      <Column
        title="To Do"
        count={todoTasks.length}
        borderColor="border-gray-400"
        bgColor="bg-gray-50 dark:bg-gray-900"
        icon={{ name: 'inbox', color: 'text-gray-500', badge: 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }}
        tasks={todoTasks}
      />
      <Column
        title="In Progress"
        count={inProgressTasks.length}
        borderColor="border-blue-500"
        bgColor="bg-blue-50 dark:bg-blue-950/30"
        icon={{ name: 'schedule', color: 'text-blue-500', badge: 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300' }}
        tasks={inProgressTasks}
      />
      <Column
        title="Done"
        count={doneTasks.length}
        borderColor="border-green-500"
        bgColor="bg-green-50 dark:bg-green-950/30"
        icon={{ name: 'check_circle', color: 'text-green-500', badge: 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300' }}
        tasks={doneTasks}
      />
    </div>
  )
}
