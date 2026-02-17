export type HabitTaskPriority = 'low' | 'medium' | 'high'

export interface HabitTask {
  id: string
  habitId: string
  title: string
  description?: string
  priority?: HabitTaskPriority
  dueDate?: string
  tags?: string[]
  completed: boolean
  completedDate?: string // ISO date string when task was completed (YYYY-MM-DD)
  createdAt: string
  updatedAt: string
}
