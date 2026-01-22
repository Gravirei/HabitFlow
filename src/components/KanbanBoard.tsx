import { useState } from 'react'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
}

interface KanbanColumn {
  status: TaskStatus
  title: string
  icon: string
  color: string
}

const columns: KanbanColumn[] = [
  {
    status: 'todo',
    title: 'To Do',
    icon: 'radio_button_unchecked',
    color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
  },
  {
    status: 'in_progress',
    title: 'In Progress',
    icon: 'pending',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
  },
  {
    status: 'completed',
    title: 'Completed',
    icon: 'check_circle',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600'
  }
]

export function KanbanBoard({ tasks, onTaskClick, onTaskStatusChange, onDeleteTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-orange-500'
      case 'low': return 'border-l-blue-500'
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'priority_high'
      case 'medium': return 'drag_handle'
      case 'low': return 'arrow_downward'
    }
  }

  const formatDueDate = (due?: string) => {
    if (!due) return null
    const dueDate = new Date(due)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    if (dueDate.getTime() === today.getTime()) return 'Today'
    if (dueDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    if (dueDate < today) return 'Overdue'
    
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    // Add a slight transparency to the dragged element
    const target = e.target as HTMLElement
    setTimeout(() => {
      target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status) {
      onTaskStatusChange(draggedTask.id, status)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)
        const isDragOver = dragOverColumn === column.status

        return (
          <div
            key={column.status}
            className="flex-shrink-0 w-80 flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className={`rounded-t-2xl border-2 border-b-0 ${column.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                    {column.icon}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div
              className={`flex-1 rounded-b-2xl border-2 ${column.color} p-4 min-h-[500px] space-y-3 transition-all ${
                isDragOver ? 'bg-primary/5 border-primary' : ''
              }`}
            >
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                    {column.icon}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tasks {column.title.toLowerCase()}
                  </p>
                  {isDragOver && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      Drop here to move task
                    </p>
                  )}
                </div>
              ) : (
                columnTasks.map((task) => {
                  const dueText = formatDueDate(task.due)
                  const isOverdue = dueText === 'Overdue'
                  const completionPercentage = task.subtasks.length > 0
                    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
                    : task.completed ? 100 : 0

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className={`group relative bg-white dark:bg-gray-700 rounded-xl border-l-4 ${getPriorityColor(
                        task.priority
                      )} p-4 shadow-sm hover:shadow-md transition-all cursor-move hover:scale-[1.02]`}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this task?')) {
                            onDeleteTask(task.id)
                          }
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">
                          close
                        </span>
                      </button>

                      {/* Task Title */}
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 pr-6">
                        {task.title}
                      </h4>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                            >
                              #{tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">checklist</span>
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {completionPercentage}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs">
                        {/* Priority Badge */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                              task.priority === 'high'
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : task.priority === 'medium'
                                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {getPriorityIcon(task.priority)}
                            </span>
                            {task.priority}
                          </span>
                        </div>

                        {/* Due Date */}
                        {dueText && (
                          <span
                            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                              isOverdue
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {dueText}
                          </span>
                        )}
                      </div>

                      {/* Time Estimate */}
                      {task.timeEstimate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-xs">timer</span>
                          {task.timeEstimate}m
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
