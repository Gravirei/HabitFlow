export interface CategoryTemplateHabit {
  name: string
  description?: string
  icon: string
  frequency: 'daily' | 'weekly' | 'monthly'
  goal: number
  goalPeriod: 'day' | 'week' | 'month'
}

export interface CategoryTemplateCategory {
  name: string
  icon: string
  color: string
  gradient: string
  textColor: string
  habits: CategoryTemplateHabit[]
}

export interface CategoryTemplatePack {
  id: string
  name: string
  description: string
  icon: string
  category: 'productivity' | 'health' | 'personal' | 'learning' | 'lifestyle'
  color: string
  tags: string[]
  isCustom: boolean
  categories: CategoryTemplateCategory[]
  totalCategories: number
  totalHabits: number
}
