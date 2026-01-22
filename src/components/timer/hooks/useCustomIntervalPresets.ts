/**
 * useCustomIntervalPresets Hook
 * Manages custom interval preset values with localStorage persistence
 */

import { useState, useEffect } from 'react'
import { INTERVAL_PRESETS } from '../constants/timer.constants'
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'

export interface CustomIntervalPreset {
  label: string
  work: number // in minutes
  break: number // in minutes
  loopCount: number // number of intervals
  icon?: string
  color?: string
  description?: string
}

const STORAGE_KEY = 'timer-custom-interval-presets'

export const useCustomIntervalPresets = () => {
  const [customIntervalPresets, setCustomIntervalPresets] = useState<CustomIntervalPreset[]>(() => {
    // Initialize from localStorage or use defaults
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Migration: Add loopCount to old presets that don't have it
        return parsed.map((preset: CustomIntervalPreset, index: number) => ({
          ...preset,
          loopCount: preset.loopCount ?? INTERVAL_PRESETS[index]?.loopCount ?? 4
        }))
      } catch (error) {
        logError(
          error,
          'Failed to parse stored interval presets',
          { stored },
          ErrorCategory.STORAGE,
          ErrorSeverity.MEDIUM
        )
      }
    }
    // Return default presets if nothing stored
    return INTERVAL_PRESETS.map(preset => ({ ...preset }))
  })

  // Save to localStorage whenever customIntervalPresets changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customIntervalPresets))
  }, [customIntervalPresets])

  const updateIntervalPreset = (index: number, work: number, breakTime: number, loopCount: number, label?: string) => {
    setCustomIntervalPresets(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        work,
        break: breakTime,
        loopCount,
        ...(label && { label })
      }
      return updated
    })
  }

  return {
    customIntervalPresets,
    updateIntervalPreset
  }
}
