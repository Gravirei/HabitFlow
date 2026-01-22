/**
 * Session Templates Types
 * Types for pre-configured timer setups
 */

export interface SessionTemplate {
  id: string
  name: string
  description?: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  icon?: string
  color?: string
  
  // Countdown specific
  countdownDuration?: number
  
  // Intervals specific
  workDuration?: number
  breakDuration?: number
  targetLoops?: number
  
  // Metadata
  createdAt: number
  lastUsed?: number
  useCount: number
  isFavorite: boolean
  category?: string
}

export interface TemplateCategory {
  id: string
  name: string
  icon: string
  color: string
}
