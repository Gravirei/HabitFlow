import type { TaskPriority, TaskStatus, Subtask } from './task'

export interface TaskTemplate {
  id: string
  name: string
  description?: string
  icon: string
  category: string
  color: string
  isCustom: boolean
  sourceTemplateId?: string // Track original library template ID
  template: {
    title: string
    description?: string
    priority: TaskPriority
    status: TaskStatus
    category: string
    tags: string[]
    subtasks: Omit<Subtask, 'id'>[]
    notes?: string
    timeEstimate?: number
    recurring?: 'daily' | 'weekly' | 'monthly' | null
  }
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  action: () => void
}
