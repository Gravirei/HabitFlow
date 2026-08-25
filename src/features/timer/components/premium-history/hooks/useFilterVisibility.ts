/**
 * Hook to manage filter visibility settings
 * Persists user preferences to localStorage
 */

import { useState, useEffect } from 'react'

export interface FilterVisibility {
  dateRange: boolean
  duration: boolean
  completion: boolean
  search: boolean
}

const STORAGE_KEY = 'timer-premium-history-filter-visibility'

const DEFAULT_VISIBILITY: FilterVisibility = {
  dateRange: true,
  duration: true,
  completion: true,
  search: true
}

export function useFilterVisibility() {
  const [filterVisibility, setFilterVisibility] = useState<FilterVisibility>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Failed to load filter visibility settings:', error)
    }
    return DEFAULT_VISIBILITY
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filterVisibility))
    } catch (error) {
      console.error('Failed to save filter visibility settings:', error)
    }
  }, [filterVisibility])

  return {
    filterVisibility,
    setFilterVisibility
  }
}
