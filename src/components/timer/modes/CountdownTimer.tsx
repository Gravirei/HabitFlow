/**
 * CountdownTimer Component
 * Countdown mode with preset buttons and wheel picker
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { useCustomPresets } from '../hooks/useCustomPresets'
import { useTimerHistory } from '../hooks/useTimerHistory'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useTimerPersistence } from '../hooks/useTimerPersistence'
import { TimerDisplay } from '../shared/TimerDisplay'
import { AnimatedTimerButton } from '../shared/AnimatedTimerButton'
import { WheelPicker } from '../shared/WheelPicker'
import { TimerPresets } from '../shared/TimerPresets'
import { EditPresetModal } from '../shared/EditPresetModal'
import { TimerCompletionModal } from '../shared/TimerCompletionModal'
import { ResumeTimerModal } from '../shared/ResumeTimerModal'
import { TimerAnnouncer } from '../shared/TimerAnnouncer'
import { TIMER_CLASSES, MAX_HOURS, MAX_MINUTES, MAX_SECONDS, formatTime } from '../constants/timer.constants'
import { useTimerFocus } from '../hooks/useTimerFocus'
import { timerPersistence, type CountdownTimerState, type SavedTimerState } from '../utils/timerPersistence'
import { soundManager } from '../utils/soundManager'
import { useImmediateSave } from '../../../hooks/useDebounce'

const STORAGE_KEY = 'timer-countdown-history'

export const CountdownTimer: React.FC = () => {
  const { customPresets, updatePreset } = useCustomPresets()
  
  const { saveToHistory } = useTimerHistory({
    mode: 'Countdown',
    storageKey: STORAGE_KEY
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  // Handler needs to be defined before useCountdown
  const handleTimerComplete = () => {
    setAnnouncement(`Countdown completed!`)
    setIsCompletionModalOpen(true)
  }

  const { 
    timeLeft, 
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    continueTimer,
    killTimer,
    selectedHours,
    selectedMinutes,
    selectedSeconds,
    setSelectedHours,
    setSelectedMinutes,
    setSelectedSeconds,
    progress,
    timerStartTime,
    pausedElapsed,
    totalDuration,
    restoreTimer,
    settings
  } = useCountdown({
    onSessionComplete: (durationMs) => {
      // Auto-complete callback - convert to seconds and mark as completed
      saveToHistory({
        duration: Math.floor(durationMs / 1000),
        startTime: timerStartTime || undefined,
        targetDuration: Math.floor(totalDuration / 1000),
        completed: true // Auto-complete is always completed
      })
    },
    onTimerComplete: handleTimerComplete
  })

  const { focusTimer, unfocusTimer } = useTimerFocus()

  // Create debounced save function (1 second delay)
  const saveStateCallback = useCallback((state: CountdownTimerState) => {
    timerPersistence.saveState(state)
  }, [])

  const { debouncedSave, immediateSave, flush } = useImmediateSave(
    saveStateCallback,
    1000 // 1 second debounce
  )

  // Timer persistence
  const handleResumeTimer = (state: SavedTimerState) => {
    if (state.mode === 'Countdown') {
      restoreTimer(state)
      focusTimer('Countdown')
    }
  }

  const {
    savedState,
    showResumeModal,
    resumeTimer,
    discardTimer,
    closeModal
  } = useTimerPersistence('Countdown', handleResumeTimer)

  // Check for repeat session configuration on mount
  useEffect(() => {
    const repeatConfig = timerPersistence.loadRepeatSession()
    if (repeatConfig && repeatConfig.mode === 'Countdown') {
      // Apply the repeat session settings
      if (repeatConfig.hours !== undefined) {
        setSelectedHours(repeatConfig.hours)
      }
      if (repeatConfig.minutes !== undefined) {
        setSelectedMinutes(repeatConfig.minutes)
      }
      if (repeatConfig.seconds !== undefined) {
        setSelectedSeconds(repeatConfig.seconds)
      }
      setAnnouncement(`Loaded countdown settings: ${repeatConfig.hours || 0}h ${repeatConfig.minutes || 0}m ${repeatConfig.seconds || 0}s`)
    }
  }, []) // Only run on mount

  const handleStart = () => {
    startTimer()
    focusTimer('Countdown')
    // Save active timer route for persistence
    timerPersistence.saveActiveTimer('Countdown')
    setAnnouncement(`Countdown timer started for ${formatDuration()}`)
  }

  const handlePause = () => {
    pauseTimer()
    setAnnouncement(`Countdown paused at ${formatTime(timeLeft)}`)
  }

  const handleContinue = () => {
    continueTimer()
    setAnnouncement('Countdown resumed')
  }

  const handleKill = (shouldSave: boolean) => {
    const durationMs = killTimer()
    const wasCompleted = timeLeft === 0 // Check if completed before killing
    
    if (shouldSave) {
      // Convert milliseconds to seconds and save with metadata
      saveToHistory({
        duration: Math.floor(durationMs / 1000), // Convert to seconds
        startTime: timerStartTime || undefined,
        targetDuration: Math.floor(totalDuration / 1000), // Goal in seconds
        completed: wasCompleted // Completion status
      })
      setAnnouncement('Timer stopped and saved to history')
    } else {
      setAnnouncement('Timer stopped without saving')
    }
    unfocusTimer()
    // Clear saved state when timer is killed
    timerPersistence.clearState()
  }

  const handleCompletionConfirm = () => {
    setIsCompletionModalOpen(false)
    unfocusTimer()
    // Clear saved state and active route when timer completes
    timerPersistence.clearState()
  }

  // Auto-save timer state when active or paused (debounced to reduce writes)
  useEffect(() => {
    if ((isActive || isPaused) && timerStartTime !== null) {
      const state: CountdownTimerState = {
        mode: 'Countdown',
        isActive,
        isPaused,
        startTime: timerStartTime,
        totalDuration,
        pausedElapsed,
        savedAt: Date.now(),
        version: 1
      }
      // Save immediately on pause, debounce during active timer
      if (isPaused) {
        immediateSave(state)
      } else {
        // Debounced save during active timer (max 1 save per second)
        debouncedSave(state)
      }
    }
  }, [isActive, isPaused, timerStartTime, totalDuration, pausedElapsed, debouncedSave, immediateSave])

  // Emergency save on page unload and component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Flush any pending debounced saves immediately
      flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Flush on unmount as well
      flush()
    }
  }, [flush])

  // Helper to format duration for modal display
  const formatDuration = () => {
    if (selectedHours > 0) {
      return `${selectedHours}h ${selectedMinutes}m ${selectedSeconds}s`
    } else if (selectedMinutes > 0) {
      return `${selectedMinutes}m ${selectedSeconds}s`
    } else {
      return `${selectedSeconds}s`
    }
  }

  const handlePresetClick = (durationInSeconds: number) => {
    // Regular click: Set the countdown timer directly
    setSelectedHours(Math.floor(durationInSeconds / 3600))
    setSelectedMinutes(Math.floor((durationInSeconds % 3600) / 60))
    setSelectedSeconds(durationInSeconds % 60)
  }

  const handlePresetLongPress = (durationInSeconds: number) => {
    // Long press: Open edit modal
    const presetIndex = customPresets.findIndex(p => p.duration === durationInSeconds)
    setSelectedPresetIndex(presetIndex >= 0 ? presetIndex : 0)
    setIsEditModalOpen(true)
  }

  const handleModalConfirm = (totalSeconds: number, label: string) => {
    // Update the preset value including the label
    updatePreset(selectedPresetIndex, totalSeconds, label)
  }

  // Ticking sound for last 10 seconds
  const lastTickRef = React.useRef<number>(0)

  useEffect(() => {
    if (isActive && timeLeft <= 10000 && timeLeft > 0 && settings.soundEnabled) {
      const currentSecond = Math.ceil(timeLeft / 1000)
      if (currentSecond !== lastTickRef.current) {
        lastTickRef.current = currentSecond
        // Use 'tick' sound
        soundManager.playSound('tick', settings.soundVolume)
      }
    } else if (!isActive || timeLeft > 10000) {
      // Reset tick ref when timer is not in ticking zone
      lastTickRef.current = 0
    }
  }, [timeLeft, isActive, settings.soundEnabled, settings.soundVolume])

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    isActive,
    isPaused,
    mode: 'Countdown',
    onStart: handleStart,
    onPause: handlePause,
    onContinue: handleContinue,
    onStop: () => handleKill(true), // Save on keyboard stop
    onKill: () => handleKill(true)  // K key - Kill and save
  })

  return (
    <>
      <div className={TIMER_CLASSES.container}>
        {/* Background glow */}
        <div className={TIMER_CLASSES.backgroundGlow}></div>
        
        {/* Timer Display or Wheel Picker */}
        {(isActive || isPaused || timeLeft > 0) ? (
          <>
            <TimerDisplay 
              timeLeft={timeLeft}
              progress={progress}
              mode="Countdown"
            />
            
            {/* Animated Button Controls - Inline with Timer */}
            <AnimatedTimerButton
              isActive={isActive}
              isPaused={isPaused}
              onStart={startTimer}
              onPause={handlePause}
              onContinue={handleContinue}
              onKill={handleKill}
              inline={true}
            />
          </>
        ) : (
          <>
            {/* Wheel Picker with Original Design */}
            <div className="relative w-full max-w-sm h-96 flex items-center justify-center mask-gradient-y">

              
              {/* Center highlight box */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-20 bg-white/[0.02] rounded-2xl border border-white/[0.08] z-0">
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary/40 rounded-l-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-primary/40 rounded-r-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
              </div>
              
              {/* Pickers */}
              <div className="flex w-full justify-between items-center h-full z-10 px-8 py-4">
                <WheelPicker 
                  value={selectedHours}
                  onChange={setSelectedHours}
                  max={MAX_HOURS}
                  label="HRS"
                  disabled={isActive}
                />
                <div className="text-white/10 text-3xl font-light pb-2 select-none">:</div>
                <WheelPicker 
                  value={selectedMinutes}
                  onChange={setSelectedMinutes}
                  max={MAX_MINUTES}
                  label="MIN"
                  disabled={isActive}
                />
                <div className="text-white/10 text-3xl font-light pb-2 select-none">:</div>
                <WheelPicker 
                  value={selectedSeconds}
                  onChange={setSelectedSeconds}
                  max={MAX_SECONDS}
                  label="SEC"
                  disabled={isActive}
                />
              </div>
            </div>
            
            {/* Preset Buttons */}
            <TimerPresets 
              presets={customPresets}
              onPresetSelect={handlePresetClick}
              onPresetLongPress={handlePresetLongPress}
              disabled={isActive}
            />
            
            {/* Animated Button Controls - Inline after Presets */}
            <AnimatedTimerButton
              isActive={isActive}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onContinue={handleContinue}
              onKill={handleKill}
              disabled={selectedHours === 0 && selectedMinutes === 0 && selectedSeconds === 0}
              inline={true}
            />
          </>
        )}
      </div>

      {/* Timer Completion Modal */}
      <TimerCompletionModal
        isOpen={isCompletionModalOpen}
        onConfirm={handleCompletionConfirm}
        mode="Countdown"
        duration={formatDuration()}
      />

      {/* Edit Preset Modal */}
      <EditPresetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleModalConfirm}
        presetLabel={customPresets[selectedPresetIndex]?.label || 'Timer'}
        presetIcon={customPresets[selectedPresetIndex]?.icon}
        presetColor={customPresets[selectedPresetIndex]?.color}
        initialSeconds={customPresets[selectedPresetIndex]?.duration || 1500}
      />

      {/* Resume Timer Modal */}
      <ResumeTimerModal
        isOpen={showResumeModal}
        savedState={savedState}
        onResume={resumeTimer}
        onDiscard={discardTimer}
        onClose={closeModal}
      />

      {/* Screen Reader Announcements */}
      {announcement && <TimerAnnouncer message={announcement} />}
    </>
  )
}
