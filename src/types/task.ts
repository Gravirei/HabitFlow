export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type TaskView = 'list' | 'calendar' | 'kanban'

export interface Subtask {
  id: string
  text: string
  completed: boolean
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  status: TaskStatus
  priority: TaskPriority
  category: string
  tags: string[]
  due?: string // ISO date string
  dueTime?: string // HH:mm format
  reminder?: string // ISO date string
  recurring?: 'daily' | 'weekly' | 'monthly' | null
  subtasks: Subtask[]
  notes?: string
  attachments?: TaskAttachment[]
  timeEstimate?: number // in minutes
  createdAt: string
  updatedAt: string
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  category?: string[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface TaskSort {
  field: 'priority' | 'dueDate' | 'createdAt' | 'title'
  direction: 'asc' | 'desc'
}
