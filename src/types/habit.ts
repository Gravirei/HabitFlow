export interface Habit {
  id: string
  name: string
  description?: string
  icon: string
  frequency: 'daily' | 'weekly' | 'monthly'
  goal: number
  goalPeriod: string
  reminderEnabled: boolean
  reminderTime?: string
  currentStreak: number
  bestStreak: number
  completionRate: number
  startDate: string
  totalCompletions: number
  completedDates: string[]
  category?: 'health' | 'work' | 'personal'
}

export interface HabitCompletion {
  habitId: string
  date: string
  completed: boolean
}
