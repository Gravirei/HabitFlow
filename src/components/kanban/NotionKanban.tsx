import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface NotionKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function NotionKanban({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: NotionKanbanProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.completed || t.status === 'completed')

  const getEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'Design': '🎨',
      'Development': '💻',
      'Meeting': '🤝',
      'Documentation': '📝',
      'Bug': '🐛',
      'Feature': '✨',
      'Work': '💼',
      'Personal': '👤',
      'default': '📋'
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
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isUrgent: false }
  }

  const Column = ({ title, subtitle, borderColor, tasks: columnTasks, emoji }: any) => (
    <div className="glass-card rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className={cn("border-l-4 pl-4 mb-4", borderColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{emoji} {title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
          <button className="material-symbols-outlined text-gray-400 hover:text-gray-600 text-sm">expand_more</button>
        </div>
      </div>

      <div className="space-y-3">
        {columnTasks.map((task: Task) => {
          const dueDate = formatDueDate(task.due)
          const progress = task.subtasks 
            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
            : 0

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={cn(
                  "font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2",
                  task.completed && "line-through"
                )}>
                  {getEmoji(task.category || '')} {task.title}
                </h4>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-bold rounded",
                  task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                )}>
                  {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MED' : 'LOW'}
                </span>
              </div>

              {task.description && (
                <p className={cn("text-xs text-gray-500 dark:text-gray-400 mb-3", task.completed && "line-through")}>
                  {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
                </p>
              )}

              {/* Progress bar */}
              {task.status === 'in_progress' && task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <span>Progress</span>
                    <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full shadow-sm" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {task.category && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
                    {task.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {dueDate ? (
                  <div className={cn(
                    "flex items-center gap-2 text-xs",
                    dueDate.isUrgent ? "text-red-500 font-semibold" : "text-gray-500"
                  )}>
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
    <div className="grid grid-cols-3 gap-6">
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
