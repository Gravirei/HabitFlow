export type CategoryId = string

export interface CategoryStats {
  habitCount: number
  taskCount: number
  completionRate: number
}

export interface Category {
  id: CategoryId
  name: string
  icon: string
  color: string

  // Optional visual fields for later UI work
  gradient?: string
  textColor?: string
  imagePath?: string
  height?: string

  // Organization
  isPinned: boolean
  order: number
  createdAt: string
  updatedAt?: string

  // Placeholder stats shape for future computation
  stats: CategoryStats
}
