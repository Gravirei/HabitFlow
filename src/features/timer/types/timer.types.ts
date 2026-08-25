/**
 * Timer Types
 * All TypeScript interfaces and types for the timer components
 */

import type { Lap, TimerHistoryRecord, TimerMode } from '@/lib/storage/timerHistory.types'

// Canonical homes for storage-facing types live in lib/storage; re-exported
// here so timer-internal imports keep their single entry point.
export type { Lap, TimerHistoryRecord, TimerMode }

export type IntervalType = 'work' | 'break'

export type SoundType = 'beep' | 'bell' | 'chime' | 'digital' | 'tick'
export type VibrationPattern = 'short' | 'long' | 'pulse'

export interface TimerSettings {
  // Quick toggles
  notificationsEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  keyboardShortcutsEnabled: boolean

  // Detailed preferences
  soundType: SoundType
  soundVolume: number // 0-100
  vibrationPattern: VibrationPattern
  autoStartBreak: boolean // For intervals: auto-start break after work
  autoStartWork: boolean // For intervals: auto-start work after break
  keepScreenOn: boolean
  showMilliseconds: boolean // Show milliseconds under certain time
  notificationMessage: string

  // Navbar icon visibility
  showSoundIcon: boolean
  showVibrationIcon: boolean
  showNotificationIcon: boolean
  showHistoryIcon: boolean
}

// Timer State
export interface TimerState {
  timeLeft: number
  isActive: boolean
  mode: TimerMode
  laps: Lap[]
}

// Stopwatch State
export interface StopwatchState {
  timeLeft: number
  isActive: boolean
  laps: Lap[]
}

// Countdown State
export interface CountdownState {
  timeLeft: number
  isActive: boolean
  selectedHours: number
  selectedMinutes: number
  selectedSeconds: number
}

// Intervals State
export interface IntervalsState {
  timeLeft: number
  isActive: boolean
  workMinutes: number
  breakMinutes: number
  currentInterval: IntervalType
  intervalCount: number
  sessionName?: string
  targetLoopCount?: number
}

// Component Props
export interface WheelPickerProps {
  value: number
  onChange: (value: number) => void
  max: number
  label: string
  disabled?: boolean
}

export interface TimerDisplayProps {
  timeLeft: number
  progress: number
  mode: TimerMode
  currentInterval?: IntervalType
  intervalCount?: number
  showIntervalStatus?: boolean
}

export interface TimerControlsProps {
  isActive: boolean
  onToggle: () => void
  onReset: () => void
  onLap?: () => void
  mode: TimerMode
  disabled?: boolean
}

export interface CustomPreset {
  label: string
  duration: number // in seconds
  icon: string
  color: string
  description: string
}

export interface TimerPresetsProps {
  presets?: CustomPreset[]
  onPresetSelect: (minutes: number) => void
  onPresetLongPress?: (minutes: number) => void
  disabled?: boolean
}

// Hook Return Types
export interface UseTimerReturn {
  timeLeft: number
  isActive: boolean
  isPaused: boolean
  toggleTimer: () => void
  resetTimer: () => void
  startTimer: () => void
  pauseTimer: () => void
  continueTimer: () => void
  killTimer: () => number | { duration: number; intervalCount: number }
  progress: number
  strokeDashoffset: number
  settings: TimerSettings
}

export interface UseStopwatchReturn extends UseTimerReturn {
  laps: Lap[]
  addLap: () => void
  killTimer: () => number
  // Persistence properties
  timerStartTime: number | null
  pausedElapsed: number
  restoreTimer: (state: any) => void
}

export interface UseCountdownReturn extends UseTimerReturn {
  selectedHours: number
  selectedMinutes: number
  selectedSeconds: number
  setSelectedHours: (hours: number) => void
  setSelectedMinutes: (minutes: number) => void
  setSelectedSeconds: (seconds: number) => void
  setPreset: (minutes: number) => void
  killTimer: () => number
  // Persistence properties
  timerStartTime: number | null
  totalDuration: number
  pausedElapsed: number
  restoreTimer: (state: any) => void
  start: (durationMs: number) => void
}

export interface UseIntervalsReturn extends UseTimerReturn {
  workMinutes: number
  breakMinutes: number
  currentInterval: IntervalType
  intervalCount: number
  sessionName?: string
  targetLoopCount?: number
  setWorkMinutes: (minutes: number) => void
  setBreakMinutes: (minutes: number) => void
  killTimer: () => { duration: number; intervalCount: number; sessionName?: string }
  startTimer: (sessionName?: string, loopCount?: number) => void
  // Persistence properties
  intervalStartTime: number | null
  pausedElapsed: number
  restoreTimer: (state: any) => void
}

// Timer Configuration
export interface TimerConfig {
  updateInterval: number // milliseconds
  circleCircumference: number
}

export interface PresetConfig {
  label: string
  duration: number // minutes
  description?: string
  icon?: string // Material icon name
  color?: string // Hex color for text/icon
  bgColor?: string // Hex color for icon background
}

export interface IntervalPresetConfig {
  label: string
  work: number // minutes
  break: number // minutes
  loopCount: number // number of intervals (default: 4)
  description?: string
  icon?: string // Material icon name
  color?: string // Hex color for icon/text
}

export interface SessionSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (sessionName: string, loopCount: number) => void
  initialSessionName?: string
  initialLoopCount?: number
}

// Keyboard Shortcuts
export interface UseKeyboardShortcutsOptions {
  isActive: boolean
  isPaused: boolean
  mode: TimerMode
  onStart: () => void
  onPause: () => void
  onContinue: () => void
  onStop: () => void
  onKill?: () => void
  onLap?: () => void
  enabled?: boolean
}
