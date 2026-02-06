/**
 * TimerTopNav Component
 * Top navigation bar with back button, title, and action icons
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimerSettings } from '../hooks/useTimerSettings'
import { TimerSettingsModal } from '../settings/TimerSettingsModal'
import { HistoryModal } from './HistoryModal'
import { TimerMenuSidebar } from './TimerMenuSidebar'
import { CloudSyncModal } from '../premium-history/cloud-sync'
// ARCHIVED: ThemesModal import removed (theme module archived)
import { tieredStorage } from '../../../lib/storage/tieredStorage'
import type { TimerHistoryRecord } from '../types/timer.types'

export const TimerTopNav: React.FC = () => {
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false)
  // ARCHIVED: isThemesOpen state removed (theme module archived)
  const {
    notificationsEnabled,
    soundEnabled,
    vibrationEnabled,
    showNotificationIcon,
    showSoundIcon,
    showVibrationIcon,
    showHistoryIcon,
    toggleNotifications,
    toggleSound,
    toggleVibration,
  } = useTimerSettings()

  // Load history from all modes to count records (reactive to changes)
  const [stopwatchHistory, setStopwatchHistory] = useState<TimerHistoryRecord[]>([])
  const [countdownHistory, setCountdownHistory] = useState<TimerHistoryRecord[]>([])
  const [intervalsHistory, setIntervalsHistory] = useState<TimerHistoryRecord[]>([])

  // Load initial history
  useEffect(() => {
    const loadHistory = async () => {
      // Force cloud fetch on initial load to get the latest data from Supabase
      const [stopwatch, countdown, intervals] = await Promise.all([
        tieredStorage.getHistory('Stopwatch', true), // forceCloud: true for initial load
        tieredStorage.getHistory('Countdown', true),
        tieredStorage.getHistory('Intervals', true),
      ])
      
      setStopwatchHistory(stopwatch)
      setCountdownHistory(countdown)
      setIntervalsHistory(intervals)
    }
    loadHistory()
  }, [])

  // Subscribe to history changes and update counts
  useEffect(() => {
    const unsubscribe = tieredStorage.onHistoryChange(async (event) => {
      // OPTIMIZATION: Use local cache (forceCloud: false) for instant updates
      // The cache is already updated before this event is emitted
      const updatedHistory = await tieredStorage.getHistory(event.mode, false)
      
      if (event.mode === 'Stopwatch') {
        setStopwatchHistory(updatedHistory)
      } else if (event.mode === 'Countdown') {
        setCountdownHistory(updatedHistory)
      } else if (event.mode === 'Intervals') {
        setIntervalsHistory(updatedHistory)
      }
    })

    return unsubscribe
  }, [])

  const totalHistoryCount = useMemo(() => {
    return stopwatchHistory.length + countdownHistory.length + intervalsHistory.length
  }, [stopwatchHistory, countdownHistory, intervalsHistory])

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

  const handleHistoryClick = () => {
    setIsHistoryOpen(true)
  }

  const handleCloudSyncClick = () => {
    setIsCloudSyncOpen(true)
  }

  // ARCHIVED: handleThemesClick removed (theme module archived)

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm shrink-0">
        {/* Left: Back Button + Hamburger Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-xl text-gray-900 dark:text-white">
              arrow_back
            </span>
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-xl text-gray-900 dark:text-white">
              menu
            </span>
          </button>
        </div>

        {/* Center: Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-white">
          Timer
        </h1>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-1">
          {/* History Button */}
          {showHistoryIcon && (
            <button
              onClick={handleHistoryClick}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-semibold transition-all duration-200 active:scale-95 shadow-lg"
              aria-label="View History"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span className="text-sm">History</span>
              {totalHistoryCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-background-dark text-xs font-bold">
                  {totalHistoryCount > 99 ? '99+' : totalHistoryCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Toggle */}
          {showNotificationIcon && (
            <button
              onClick={toggleNotifications}
              className={`flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 ${
                notificationsEnabled ? 'text-white font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label={`Notifications ${notificationsEnabled ? 'enabled' : 'disabled'}`}
            >
              <span className="material-symbols-outlined text-xl font-bold">
                {notificationsEnabled ? 'notifications' : 'notifications_off'}
              </span>
            </button>
          )}

          {/* Sound Toggle */}
          {showSoundIcon && (
            <button
              onClick={toggleSound}
              className={`flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 ${
                soundEnabled ? 'text-white font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label={`Sound ${soundEnabled ? 'enabled' : 'disabled'}`}
            >
              <span className="material-symbols-outlined text-xl font-bold">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          )}

          {/* Vibration Toggle */}
          {showVibrationIcon && (
            <button
              onClick={toggleVibration}
              className={`flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 ${
                vibrationEnabled ? 'text-white font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label={`Vibration ${vibrationEnabled ? 'enabled' : 'disabled'}`}
            >
              <span className="material-symbols-outlined text-xl font-bold">
                {vibrationEnabled ? 'vibration' : 'mobile_off'}
              </span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={handleSettingsClick}
            className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-white font-bold"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-xl font-bold">settings</span>
          </button>
        </div>
      </div>

      {/* Modals - Rendered at root level for proper positioning */}
      <TimerSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <CloudSyncModal 
        isOpen={isCloudSyncOpen} 
        onClose={() => setIsCloudSyncOpen(false)}
        sessions={[...stopwatchHistory, ...countdownHistory, ...intervalsHistory]}
      />
      {/* ARCHIVED: ThemesModal removed (theme module archived) */}
      <TimerMenuSidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onSettingsClick={handleSettingsClick}
        onHistoryClick={handleHistoryClick}
        onCloudSyncClick={handleCloudSyncClick}
        // ARCHIVED: onThemesClick removed (theme module archived)
      />
    </>
  )
}
