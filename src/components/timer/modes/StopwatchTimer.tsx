/**
 * StopwatchTimer Component
 * Stopwatch mode with lap functionality
 */

import React, { useEffect, useCallback } from 'react'
import { useStopwatch } from '../hooks/useStopwatch'
import { useTimerHistory } from '../hooks/useTimerHistory'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useTimerPersistence } from '../hooks/useTimerPersistence'
import { TimerDisplay } from '../shared/TimerDisplay'
import { AnimatedTimerButton } from '../shared/AnimatedTimerButton'
import { ResumeTimerModal } from '../shared/ResumeTimerModal'
import { TimerAnnouncer } from '../shared/TimerAnnouncer'
import { TIMER_CLASSES, formatTime } from '../constants/timer.constants'
import { useTimerFocus } from '../hooks/useTimerFocus'
import { timerPersistence, type StopwatchTimerState } from '../utils/timerPersistence'
import { useImmediateSave } from '../../../hooks/useDebounce'

const STORAGE_KEY = 'timer-stopwatch-history'

export const StopwatchTimer: React.FC = () => {
  const [announcement, setAnnouncement] = React.useState('')
  
  const { 
    timeLeft, 
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    continueTimer,
    killTimer,
    addLap,
    laps, 
    progress,
    timerStartTime,
    pausedElapsed,
    restoreTimer
  } = useStopwatch()

  const { saveToHistory } = useTimerHistory({
    mode: 'Stopwatch',
    storageKey: STORAGE_KEY
  })

  const { focusTimer, unfocusTimer } = useTimerFocus()

  // Create debounced save function (1 second delay)
  const saveStateCallback = useCallback((state: StopwatchTimerState) => {
    timerPersistence.saveState(state as any)
  }, [])

  const { debouncedSave, immediateSave, flush } = useImmediateSave(
    saveStateCallback,
    1000 // 1 second debounce
  )

  // Timer persistence
  const handleResumeTimer = (state: StopwatchTimerState) => {
    restoreTimer(state)
    focusTimer('Stopwatch')
  }

  const {
    savedState,
    showResumeModal,
    resumeTimer,
    discardTimer,
    closeModal
  } = useTimerPersistence('Stopwatch', handleResumeTimer)

  const handleStart = () => {
    startTimer()
    focusTimer('Stopwatch')
    // Save active timer route for persistence
    timerPersistence.saveActiveTimer('Stopwatch')
    setAnnouncement('Stopwatch started')
  }

  const handleKill = (shouldSave: boolean) => {
    console.log('🔴 Stopwatch handleKill called, shouldSave:', shouldSave)
    const durationMs = killTimer()
    const timeStr = formatTime(durationMs)
    console.log('⏱️ Duration:', durationMs, 'ms =', Math.floor(durationMs / 1000), 'seconds')
    
    if (shouldSave) {
      const historyData = {
        duration: Math.floor(durationMs / 1000), // Convert to seconds
        startTime: timerStartTime || undefined,
        lapCount: laps.length,
        bestLap: laps.length > 0 
          ? Math.min(...laps.map(l => l.timeMs)) / 1000 
          : undefined,
        laps: laps
      }
      console.log('💾 Saving to history:', historyData)
      
      // Convert milliseconds to seconds and save with metadata
      saveToHistory(historyData)
      setAnnouncement(`Stopwatch stopped at ${timeStr} and saved to history`)
    } else {
      setAnnouncement(`Stopwatch stopped at ${timeStr} without saving`)
    }
    unfocusTimer()
    // Clear saved state when timer is killed
    timerPersistence.clearState()
  }

  // Auto-save timer state when active or paused (debounced to reduce writes)
  useEffect(() => {
    if ((isActive || isPaused) && timerStartTime !== null) {
      const state: StopwatchTimerState = {
        mode: 'Stopwatch',
        isActive,
        isPaused,
        startTime: timerStartTime,
        pausedElapsed,
        laps: laps.map(lap => ({
          id: String(lap.id),
          time: lap.timeMs,
          timestamp: Date.now()
        })),
        savedAt: Date.now(),
        version: 1
      }
      // Save immediately on pause/lap, debounce during active timer
      if (isPaused || laps.length > 0) {
        immediateSave(state)
      } else {
        // Debounced save during active timer (max 1 save per second)
        debouncedSave(state)
      }
    }
  }, [isActive, isPaused, timerStartTime, pausedElapsed, laps, debouncedSave, immediateSave])

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

  // Wrapped handlers with announcements
  const handlePause = () => {
    pauseTimer()
    setAnnouncement(`Stopwatch paused at ${formatTime(timeLeft)}`)
  }

  const handleContinue = () => {
    continueTimer()
    setAnnouncement('Stopwatch resumed')
  }

  const handleLap = () => {
    addLap()
    const lapNumber = laps.length + 1
    setAnnouncement(`Lap ${lapNumber} recorded: ${formatTime(timeLeft)}`)
  }

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    isActive,
    isPaused,
    mode: 'Stopwatch',
    onStart: handleStart,
    onPause: handlePause,
    onContinue: handleContinue,
    onStop: () => handleKill(true), // Save on keyboard stop
    onKill: () => handleKill(true), // K key - Kill and save
    onLap: handleLap
  })

  return (
    <div className={TIMER_CLASSES.container}>
      {/* Background glow */}
      <div className={TIMER_CLASSES.backgroundGlow}></div>
      
      {/* Flex-grow container for timer and laps */}
      <div className="flex-[0.9] flex flex-col items-center justify-center w-full">
        {/* Timer Display */}
        <TimerDisplay 
          timeLeft={timeLeft}
          progress={progress}
          mode="Stopwatch"
        />
        
        {/* Laps Display - Integrated */}
        {laps.length > 0 && (
          <div className={TIMER_CLASSES.laps.container} role="region" aria-label="Lap times">
            <ul className={TIMER_CLASSES.laps.list} role="list" aria-live="polite">
              {laps.map((lap, _index) => (
                <li key={lap.id} className={TIMER_CLASSES.laps.item} role="listitem">
                  <span>Lap {lap.id}</span>
                  <span aria-label={`Lap ${lap.id} time: ${lap.time}`}>{lap.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Animated Button Controls - Below everything */}
      <AnimatedTimerButton
        isActive={isActive}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onContinue={handleContinue}
        onKill={handleKill}
        onLap={handleLap}
        mode="Stopwatch"
        inline={true}
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
    </div>
  )
}
