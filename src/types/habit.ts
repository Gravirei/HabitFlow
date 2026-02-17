export interface Habit {
  id: string
  name: string
  description?: string
  icon: string
  iconColor?: number // Index of the selected gradient color (0-5)
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

  /**
   * New category reference (stable string id). Optional for backward compatibility.
   */
  categoryId?: string

  /**
   * Legacy category enum kept for migration/backward compatibility.
   */
  category?: 'health' | 'work' | 'personal'

  /**
   * Whether this habit is active and should appear in Today/Habits pages.
   * Inactive habits only show in CategoryDetail page.
   * Default: false
   */
  isActive?: boolean

  /**
   * Whether this habit is archived.
   * Archived habits don't show in normal views, only in "Archived Habits" modal.
   * Default: false
   */
  archived?: boolean

  /**
   * ISO date string when the habit was archived.
   */
  archivedDate?: string

  /**
   * Short notes attached to this habit.
   * Each note has an id, text content, and creation timestamp.
   */
  notes?: HabitNote[]
}

export interface HabitNote {
  id: string
  text: string
  createdAt: string
}

export interface HabitCompletion {
  habitId: string
  date: string
  completed: boolean
}
