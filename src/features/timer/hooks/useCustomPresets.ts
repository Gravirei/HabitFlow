/**
 * useCustomPresets Hook
 * Manages custom preset values with localStorage persistence
 */

import { useState, useEffect } from 'react'
import { COUNTDOWN_PRESETS } from '../constants/timer.constants'
import { logError } from '../utils/errorMessages'

export interface CustomPreset {
  label: string
  duration: number // in seconds
  icon: string
  color: string
  description: string
}

const STORAGE_KEY = 'timer-custom-presets'

export const useCustomPresets = () => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    // Initialize from localStorage or use defaults
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          
          // Validate parsed data
          if (!Array.isArray(parsed)) {
            logError(new Error('Stored presets is not an array'), 'useCustomPresets.init')
            throw new Error('Invalid data')
          }
          
          // Validate each preset
          const validPresets = parsed.filter((preset: any) => {
            if (!preset || typeof preset !== 'object') return false
            if (typeof preset.duration !== 'number' || preset.duration <= 0) return false
            if (isNaN(preset.duration) || !isFinite(preset.duration)) return false
            return true
          })
          
          if (validPresets.length > 0) {
            return validPresets
          }
        } catch (error) {
          logError(error, 'useCustomPresets.parse')
        }
      }
    } catch (error) {
      logError(error, 'useCustomPresets.localStorage')
    }
    
    // Return default presets converted to seconds if nothing stored or error
    return COUNTDOWN_PRESETS.map(preset => ({ 
      ...preset,
      duration: preset.duration * 60 // Convert minutes to seconds
    }))
  })

  // Save to localStorage whenever customPresets changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets))
    } catch (error) {
      logError(error, 'useCustomPresets.save')
    }
  }, [customPresets])

  const updatePreset = (index: number, newDurationInSeconds: number, label?: string) => {
    try {
      // Validate index
      if (index < 0 || index >= customPresets.length) {
        logError(new Error('Invalid preset index'), 'useCustomPresets.updatePreset')
        return
      }
      
      // Validate duration
      if (newDurationInSeconds <= 0 || isNaN(newDurationInSeconds) || !isFinite(newDurationInSeconds)) {
        logError(new Error('Invalid preset duration'), 'useCustomPresets.updatePreset')
        return
      }
      
      setCustomPresets(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          duration: newDurationInSeconds,
          ...(label && { label })
        }
        return updated
      })
    } catch (error) {
      logError(error, 'useCustomPresets.updatePreset')
    }
  }

  return {
    customPresets,
    updatePreset
  }
}
