/**
 * Filter Persistence Hook
 * Saves and restores filter state to/from localStorage
 */

import { useEffect } from 'react'
import { FilterMode } from '../filters/ModeFilter'

interface FilterState {
  filterMode: FilterMode
  dateRangeStart?: string // ISO string
  dateRangeEnd?: string // ISO string
  minDuration: number
  maxDuration: number
}

const STORAGE_KEY = 'premium-history-filters'

export function useFilterPersistence(
  filterMode: FilterMode,
  dateRangeStart: Date | undefined,
  dateRangeEnd: Date | undefined,
  minDuration: number,
  maxDuration: number,
  setFilterMode: (mode: FilterMode) => void,
  setDateRangeStart: (date: Date | undefined) => void,
  setDateRangeEnd: (date: Date | undefined) => void,
  setMinDuration: (min: number) => void,
  setMaxDuration: (max: number) => void
) {
  // Load filters on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state: FilterState = JSON.parse(stored)
        setFilterMode(state.filterMode)
        setDateRangeStart(state.dateRangeStart ? new Date(state.dateRangeStart) : undefined)
        setDateRangeEnd(state.dateRangeEnd ? new Date(state.dateRangeEnd) : undefined)
        setMinDuration(state.minDuration)
        setMaxDuration(state.maxDuration)
      }
    } catch (error) {
      console.error('Failed to load filter state:', error)
    }
  }, [])

  // Save filters when they change
  useEffect(() => {
    try {
      const state: FilterState = {
        filterMode,
        dateRangeStart: dateRangeStart?.toISOString(),
        dateRangeEnd: dateRangeEnd?.toISOString(),
        minDuration,
        maxDuration,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save filter state:', error)
    }
  }, [filterMode, dateRangeStart, dateRangeEnd, minDuration, maxDuration])
}
