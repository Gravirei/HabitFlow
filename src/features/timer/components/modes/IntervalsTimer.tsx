/**
 * IntervalsTimer Component
 * Intervals mode with work/break cycles - Modern redesign
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useIntervals } from '@/features/timer/hooks/useIntervals'
import { useCustomIntervalPresets } from '@/features/timer/hooks/useCustomIntervalPresets'
import { useTimerHistory } from '@/features/timer/hooks/useTimerHistory'
import { useKeyboardShortcuts } from '@/features/timer/hooks/useKeyboardShortcuts'
import { useTimerPersistence } from '@/features/timer/hooks/useTimerPersistence'
import { TimerDisplay } from '../shared/TimerDisplay'
import { AnimatedTimerButton } from '../shared/AnimatedTimerButton'
import { WheelPicker } from '../shared/WheelPicker'
import { IntervalPresets } from '../shared/IntervalPresets'
import { EditIntervalPresetModal } from '../shared/EditIntervalPresetModal'
import { SessionSetupModal } from '../shared/SessionSetupModal'
import { TimerCompletionModal } from '../shared/TimerCompletionModal'
import { ResumeTimerModal } from '../shared/ResumeTimerModal'
import { TimerAnnouncer } from '../shared/TimerAnnouncer'
import {
  MAX_WORK_MINUTES,
  MAX_BREAK_MINUTES,
  CIRCLE_CIRCUMFERENCE,
  formatTime,
} from '@/features/timer/constants/timer.constants'
import { useTimerFocus } from '@/features/timer/hooks/useTimerFocus'
import {
  timerPersistence,
  type IntervalsTimerState,
  type SavedTimerState,
} from '@/features/timer/utils/timerPersistence'
import { soundManager } from '@/features/timer/utils/soundManager'
import { useImmediateSave } from '@/hooks/useDebounce'

const STORAGE_KEY = 'timer-intervals-history'

export const IntervalsTimer: React.FC = () => {
  const [announcement, setAnnouncement] = React.useState('')

  const { saveToHistory } = useTimerHistory({
    mode: 'Intervals',
    storageKey: STORAGE_KEY,
  })

  const {
    timeLeft,
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    continueTimer,
    killTimer,
    workMinutes,
    breakMinutes,
    currentInterval,
    intervalCount,
    sessionName,
    targetLoopCount,
    setWorkMinutes,
    setBreakMinutes,
    progress,
    intervalStartTime,
    pausedElapsed,
    restoreTimer,
    settings,
  } = useIntervals({
    onSessionComplete: (durationMs, intervalCount) => {
      // Auto-complete callback - convert to seconds and save with metadata
      saveToHistory({
        duration: Math.floor(durationMs / 1000),
        startTime: intervalStartTime || undefined,
        intervalCount: intervalCount,
        completedLoops: intervalCount,
        workDuration: workMinutes * 60,
        breakDuration: breakMinutes * 60,
        sessionName: sessionName,
        targetLoopCount: targetLoopCount,
      })
    },
    onTimerComplete: () => setIsCompletionModalOpen(true),
  })

  const { focusTimer, unfocusTimer } = useTimerFocus()

  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSessionSetupOpen, setIsSessionSetupOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0)
  const [selectedPresetName, setSelectedPresetName] = useState<string>('Pomodoro') // Track selected preset name

  const { customIntervalPresets, updateIntervalPreset } = useCustomIntervalPresets()

  // Create debounced save function (1 second delay)
  const saveStateCallback = useCallback((state: IntervalsTimerState) => {
    timerPersistence.saveState(state)
  }, [])

  const { debouncedSave, immediateSave, flush } = useImmediateSave(
    saveStateCallback,
    1000 // 1 second debounce
  )

  // Timer persistence
  const handleResumeTimer = (state: SavedTimerState) => {
    if (state.mode === 'Intervals') {
      restoreTimer(state)
      focusTimer('Intervals')
    }
  }

  const { savedState, showResumeModal, resumeTimer, discardTimer, closeModal } =
    useTimerPersistence('Intervals', handleResumeTimer)

  // Check for repeat session configuration on mount
  useEffect(() => {
    const repeatConfig = timerPersistence.loadRepeatSession()
    if (repeatConfig && repeatConfig.mode === 'Intervals') {
      // Apply the repeat session settings
      if (repeatConfig.workMinutes !== undefined) {
        setWorkMinutes(repeatConfig.workMinutes)
      }
      if (repeatConfig.breakMinutes !== undefined) {
        setBreakMinutes(repeatConfig.breakMinutes)
      }
      // If we have a session name and target loops, start the session setup modal
      if (repeatConfig.sessionName || repeatConfig.targetLoops) {
        setSelectedPresetName(repeatConfig.sessionName || 'Custom Session')
        setAnnouncement(
          `Loaded intervals settings: ${repeatConfig.workMinutes || 25}min work, ${repeatConfig.breakMinutes || 5}min break`
        )
      }
    }
  }, []) // Only run on mount

  const handleStart = () => {
    // Check if current values match a preset
    const matchedPreset = customIntervalPresets.find(
      (p) => p.work === workMinutes && p.break === breakMinutes
    )

    if (matchedPreset) {
      // If preset is matched, start timer directly with preset's loop count and name
      startTimer(matchedPreset.label, matchedPreset.loopCount)
      focusTimer('Intervals')
      // Save active timer route for persistence
      timerPersistence.saveActiveTimer('Intervals')
      setAnnouncement(
        `Intervals session started: ${matchedPreset.label}. ${matchedPreset.loopCount} loops. Work time: ${workMinutes} minutes`
      )
    } else {
      // If custom values, open session setup modal
      setIsSessionSetupOpen(true)
    }
  }

  const handleSessionSetupConfirm = (name: string, loops: number) => {
    startTimer(name, loops)
    focusTimer('Intervals')
    setIsSessionSetupOpen(false)
    // Save active timer route for persistence
    timerPersistence.saveActiveTimer('Intervals')
    setAnnouncement(
      `Intervals session started: ${name}. ${loops} loops. Work time: ${workMinutes} minutes`
    )
  }

  const handleKill = (shouldSave: boolean) => {
    const result = killTimer()
    const timeStr = formatTime(result.duration)
    if (shouldSave) {
      // Convert milliseconds to seconds and save with metadata
      saveToHistory({
        duration: Math.floor(result.duration / 1000), // Convert to seconds
        startTime: intervalStartTime || undefined,
        intervalCount: result.intervalCount,
        completedLoops: result.intervalCount,
        workDuration: workMinutes * 60, // In seconds
        breakDuration: breakMinutes * 60, // In seconds
        sessionName: sessionName,
        targetLoopCount: targetLoopCount,
      })
      setAnnouncement(
        `Intervals session stopped at ${timeStr}. Completed ${result.intervalCount} of ${targetLoopCount} loops. Saved to history`
      )
    } else {
      setAnnouncement(`Intervals session stopped at ${timeStr} without saving`)
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
    setAnnouncement(`Intervals session completed! ${targetLoopCount} loops finished`)
  }

  // Auto-save timer state when active or paused (debounced to reduce writes)
  useEffect(() => {
    if ((isActive || isPaused) && intervalStartTime !== null) {
      const state: IntervalsTimerState = {
        mode: 'Intervals',
        isActive,
        isPaused,
        currentLoop: intervalCount,
        targetLoops: targetLoopCount,
        currentInterval,
        intervalStartTime: intervalStartTime || Date.now(),
        workDuration: workMinutes * 60 * 1000,
        breakDuration: breakMinutes * 60 * 1000,
        pausedElapsed,
        savedAt: Date.now(),
        version: 1,
      }
      // Save immediately on pause or interval transition, debounce during active timer
      if (isPaused) {
        immediateSave(state)
      } else {
        // Debounced save during active timer (max 1 save per second)
        debouncedSave(state)
      }
    }
  }, [
    isActive,
    isPaused,
    intervalCount,
    targetLoopCount,
    currentInterval,
    intervalStartTime,
    workMinutes,
    breakMinutes,
    pausedElapsed,
    debouncedSave,
    immediateSave,
  ])

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

  const handlePresetClick = (work: number, breakTime: number) => {
    // Regular click: Set the timer directly
    setWorkMinutes(work)
    setBreakMinutes(breakTime)

    // Find and set the preset name
    const matchedPreset = customIntervalPresets.find(
      (p) => p.work === work && p.break === breakTime
    )
    if (matchedPreset) {
      setSelectedPresetName(matchedPreset.label)
    }
  }

  const handlePresetLongPress = (work: number, breakTime: number) => {
    // Long press: Open edit modal
    const presetIndex = customIntervalPresets.findIndex(
      (p) => p.work === work && p.break === breakTime
    )
    setSelectedPresetIndex(presetIndex >= 0 ? presetIndex : 0)
    setIsEditModalOpen(true)
  }

  const handleModalConfirm = (
    work: number,
    breakTime: number,
    loopCount: number,
    label: string
  ) => {
    // Update the preset value
    updateIntervalPreset(selectedPresetIndex, work, breakTime, loopCount, label)
  }

  // Effect to detect preset changes when work/break minutes are manually adjusted
  useEffect(() => {
    // Find matching preset
    const matchedPreset = customIntervalPresets.find(
      (p) => p.work === workMinutes && p.break === breakMinutes
    )

    if (matchedPreset) {
      setSelectedPresetName(matchedPreset.label)
    } else {
      // If no match, it's custom
      setSelectedPresetName('Custom')
    }
  }, [workMinutes, breakMinutes, customIntervalPresets])

  // Track interval transitions for announcements
  const prevIntervalRef = React.useRef(currentInterval)

  React.useEffect(() => {
    if (isActive && prevIntervalRef.current !== currentInterval) {
      // Play switch sound
      if (settings.soundEnabled) {
        // Use 'digital' sound for interval switches
        soundManager.playSound('digital', settings.soundVolume)
      }

      // Interval changed
      if (currentInterval === 'work') {
        const loopNum = intervalCount + 1
        setAnnouncement(`Loop ${loopNum} starting. Work time: ${workMinutes} minutes`)
      } else if (currentInterval === 'break') {
        setAnnouncement(`Work complete. Break time: ${breakMinutes} minutes`)
      }
      prevIntervalRef.current = currentInterval
    }
  }, [
    currentInterval,
    isActive,
    intervalCount,
    workMinutes,
    breakMinutes,
    settings.soundEnabled,
    settings.soundVolume,
  ])

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

  // Wrapped handlers with announcements
  const handlePause = () => {
    pauseTimer()
    const intervalType = currentInterval === 'work' ? 'Work' : 'Break'
    setAnnouncement(`${intervalType} time paused at ${formatTime(timeLeft)}`)
  }

  const handleContinue = () => {
    continueTimer()
    const intervalType = currentInterval === 'work' ? 'Work' : 'Break'
    setAnnouncement(`${intervalType} time resumed`)
  }

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    isActive,
    isPaused,
    mode: 'Intervals',
    onStart: handleStart, // Opens setup modal
    onPause: handlePause,
    onContinue: handleContinue,
    onStop: () => handleKill(true), // Save on keyboard stop
    onKill: () => handleKill(true), // K key - Kill and save
  })

  return (
    <>
      <div className="relative flex w-full flex-grow flex-col items-center justify-start overflow-visible py-4">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="bg-blue-500/3 pointer-events-none absolute bottom-1/3 left-1/4 h-64 w-64 rounded-full blur-[100px]"></div>
        <div className="bg-purple-500/3 pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"></div>

        {/* Timer Display or Configuration */}
        {isActive || isPaused || timeLeft > 0 ? (
          <>
            {/* Active Timer View */}
            <div className="flex w-full max-w-lg flex-col items-center justify-center px-6">
              {/* Interval Progress Bar */}
              <div className="mb-8 w-full">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${currentInterval === 'work' ? 'animate-pulse bg-primary' : 'animate-pulse bg-blue-400'}`}
                    ></div>
                    <span className="text-sm font-medium text-white/80">
                      {currentInterval === 'work' ? 'Focus Time' : 'Break Time'}
                    </span>
                  </div>
                  <div className="text-right">
                    {targetLoopCount ? (
                      <>
                        <span className="block font-mono text-xs text-white/50">
                          Loop {Math.min(intervalCount + 1, targetLoopCount)} of {targetLoopCount}
                        </span>
                        {sessionName && (
                          <span
                            className="mt-0.5 block max-w-[120px] truncate text-xs font-medium text-white/30"
                            title={sessionName}
                          >
                            {sessionName}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-mono text-xs text-white/50">
                        Session {intervalCount + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                  role="progressbar"
                  aria-label={`${currentInterval === 'work' ? 'Work' : 'Break'} time progress`}
                  aria-valuenow={Math.round((progress / CIRCLE_CIRCUMFERENCE) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`Loop ${intervalCount + 1} of ${targetLoopCount || intervalCount + 1}, ${currentInterval === 'work' ? 'Focus Time' : 'Break Time'}, ${Math.round((progress / CIRCLE_CIRCUMFERENCE) * 100)}% complete`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      currentInterval === 'work'
                        ? 'bg-gradient-to-r from-primary to-green-400'
                        : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                    }`}
                    style={{
                      width: `${((progress / CIRCLE_CIRCUMFERENCE) * 100).toFixed(2)}%`,
                    }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>

              {/* Timer Display */}
              <TimerDisplay
                timeLeft={timeLeft}
                progress={progress}
                mode="Intervals"
                currentInterval={currentInterval}
                intervalCount={intervalCount}
                showIntervalStatus={false}
              />

              {/* Stats Cards */}
              <div className="mt-8 grid w-full grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <p className="text-xs font-medium text-white/50">Work</p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-white">
                    {workMinutes}
                    <span className="ml-1 text-sm text-white/50">min</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <p className="text-xs font-medium text-white/50">Break</p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-white">
                    {breakMinutes}
                    <span className="ml-1 text-sm text-white/50">min</span>
                  </p>
                </div>
              </div>

              {/* Animated Button Controls - Inline with Timer */}
              <AnimatedTimerButton
                isActive={isActive}
                isPaused={isPaused}
                onStart={handleStart}
                onPause={pauseTimer}
                onContinue={continueTimer}
                onKill={handleKill}
                inline={true}
              />
            </div>
          </>
        ) : (
          <>
            {/* Configuration View */}
            <div className="relative flex w-full max-w-lg flex-col items-center justify-center px-6">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-white">Set Your Intervals</h2>
                <p className="text-sm text-white/50">Configure work and break durations</p>
              </div>

              {/* Wheel Picker with Side-by-Side Layout */}
              <div className="mask-gradient-y relative mb-8 flex h-96 w-full max-w-sm items-center justify-center">
                {/* Center highlight box */}
                <div className="absolute left-4 right-4 top-1/2 z-0 h-20 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-2xl bg-primary/40 shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                  <div className="absolute bottom-0 right-0 top-0 w-1.5 rounded-r-2xl bg-blue-400/40 shadow-[0_0_10px_rgba(96,165,250,0.3)]"></div>
                </div>

                {/* Labels Row */}
                <div className="absolute left-0 right-0 top-6 z-30 flex justify-around px-12">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/20 backdrop-blur-sm">
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/70">Focus</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/20 backdrop-blur-sm">
                      <svg
                        className="h-4 w-4 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-white/70">Break</span>
                  </div>
                </div>

                {/* Pickers */}
                <div className="z-10 flex h-full w-full items-center justify-around px-12 py-4">
                  <WheelPicker
                    value={workMinutes}
                    onChange={setWorkMinutes}
                    max={MAX_WORK_MINUTES}
                    label="MIN"
                    disabled={isActive}
                  />
                  <div className="select-none pb-2 text-3xl font-light text-white/10">:</div>
                  <WheelPicker
                    value={breakMinutes}
                    onChange={setBreakMinutes}
                    max={MAX_BREAK_MINUTES}
                    label="MIN"
                    disabled={isActive}
                  />
                </div>
              </div>

              {/* Selected Mode Display */}
              <div className="mb-6 flex w-full justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <span className="text-xs font-medium text-white/50">Selected Mode:</span>
                  <span className="text-sm font-bold text-primary">{selectedPresetName}</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex w-full flex-col items-center">
                <button
                  onClick={() => setIsPresetsOpen(!isPresetsOpen)}
                  className="mb-3 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/70 active:scale-95"
                >
                  <span>Quick Presets</span>
                  <span
                    className="material-symbols-outlined text-sm transition-transform duration-300"
                    style={{ transform: isPresetsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>

                {/* Collapsible Presets */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isPresetsOpen ? '500px' : '0px',
                    opacity: isPresetsOpen ? 1 : 0,
                  }}
                >
                  <IntervalPresets
                    presets={customIntervalPresets}
                    onPresetSelect={handlePresetClick}
                    onPresetLongPress={handlePresetLongPress}
                    disabled={isActive}
                  />
                </div>
              </div>

              {/* Animated Button Controls - Inline after Presets */}
              <AnimatedTimerButton
                isActive={isActive}
                isPaused={isPaused}
                onStart={handleStart}
                onPause={pauseTimer}
                onContinue={continueTimer}
                onKill={handleKill}
                inline={true}
              />
            </div>
          </>
        )}
      </div>

      {/* Session Setup Modal */}
      <SessionSetupModal
        isOpen={isSessionSetupOpen}
        onClose={() => setIsSessionSetupOpen(false)}
        onConfirm={handleSessionSetupConfirm}
      />

      {/* Timer Completion Modal */}
      <TimerCompletionModal
        isOpen={isCompletionModalOpen}
        onConfirm={handleCompletionConfirm}
        mode="Intervals"
        intervalCount={targetLoopCount}
        sessionName={sessionName}
        workMinutes={workMinutes}
      />

      {/* Edit Interval Preset Modal */}
      <EditIntervalPresetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleModalConfirm}
        presetLabel={customIntervalPresets[selectedPresetIndex]?.label || 'Timer'}
        presetIcon={customIntervalPresets[selectedPresetIndex]?.icon}
        presetColor={customIntervalPresets[selectedPresetIndex]?.color}
        initialWork={customIntervalPresets[selectedPresetIndex]?.work || 25}
        initialBreak={customIntervalPresets[selectedPresetIndex]?.break || 5}
        initialLoopCount={customIntervalPresets[selectedPresetIndex]?.loopCount || 4}
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
