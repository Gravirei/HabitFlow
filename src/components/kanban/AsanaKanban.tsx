import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface AsanaKanbanProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export function AsanaKanban({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: AsanaKanbanProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed)
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  const doneTasks = tasks.filter(t => t.completed || t.status === 'done')

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

  const Column = ({ title, count, barColor, bgGradient, tasks: columnTasks, isDone }: any) => (
    <div className="flex-shrink-0 w-80">
      <div className={cn("rounded-2xl p-4", bgGradient)}>
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-1 h-6 rounded-full", barColor)}></div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md shadow-sm">
              {count}
            </span>
          </div>
          <button className="material-symbols-outlined text-gray-400 hover:text-gray-600 text-lg">add</button>
        </div>

        <div className="space-y-2">
          {columnTasks.map((task: Task) => {
            const dueDate = formatDueDate(task.due)
            const progress = task.subtasks 
              ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
              : 0

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation()
                      onTaskStatusChange(task.id, task.completed ? 'todo' : 'done')
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                      isDone && "line-through"
                    )}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className={cn("text-xs text-gray-500 dark:text-gray-400 mb-2", isDone && "line-through")}>
                        {task.description.slice(0, 60)}{task.description.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {task.status === 'in-progress' && task.subtasks && task.subtasks.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md",
                      task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      <span className="material-symbols-outlined text-xs">flag</span>
                      {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                    </span>
                    {task.category && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-md">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {dueDate ? (
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs",
                      dueDate.isUrgent ? "font-semibold text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
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
    </div>
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
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
