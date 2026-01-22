/**
 * useTimerSettings Hook
 * Manages timer settings (notifications, sound, vibration) with localStorage persistence
 */

import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { logError } from '../utils/errorMessages'

import type { TimerSettings, SoundType, VibrationPattern } from '../types/timer.types'

export type { TimerSettings, SoundType, VibrationPattern }

const DEFAULT_SETTINGS: TimerSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  keyboardShortcutsEnabled: true,
  soundType: 'beep',
  soundVolume: 70,
  vibrationPattern: 'short',
  autoStartBreak: false,
  autoStartWork: false,
  keepScreenOn: false,
  showMilliseconds: true,
  notificationMessage: 'Timer completed!',
  showSoundIcon: true,
  showVibrationIcon: true,
  showNotificationIcon: true,
  showHistoryIcon: true,
}

export const useTimerSettings = () => {
  const [settings, setSettings] = useLocalStorage<TimerSettings>(
    'timer-settings',
    DEFAULT_SETTINGS
  )

  const toggleNotifications = () => {
    setSettings((prev) => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }))
  }

  const toggleSound = () => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }))
  }

  const toggleVibration = () => {
    setSettings((prev) => ({
      ...prev,
      vibrationEnabled: !prev.vibrationEnabled,
    }))
  }

  const updateSettings = (updates: Partial<TimerSettings>) => {
    try {
      // Validate volume if provided
      if (updates.soundVolume !== undefined) {
        if (isNaN(updates.soundVolume) || !isFinite(updates.soundVolume)) {
          logError(new Error('Invalid sound volume: must be a number'), 'useTimerSettings.updateSettings')
          return
        }
        // Clamp volume to 0-100
        updates.soundVolume = Math.max(0, Math.min(100, updates.soundVolume))
      }
      
      setSettings((prev) => ({
        ...prev,
        ...updates,
      }))
    } catch (error) {
      logError(error, 'useTimerSettings.updateSettings')
    }
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    notificationsEnabled: settings.notificationsEnabled,
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    showSoundIcon: settings.showSoundIcon,
    showVibrationIcon: settings.showVibrationIcon,
    showNotificationIcon: settings.showNotificationIcon,
    showHistoryIcon: settings.showHistoryIcon,
    toggleNotifications,
    toggleSound,
    toggleVibration,
    updateSettings,
    resetSettings,
  }
}
