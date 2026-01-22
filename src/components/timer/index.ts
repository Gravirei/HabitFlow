/**
 * Timer Module Exports
 * Central export point for all timer components
 */

// Main Container
export { TimerContainer, useKeyboardHelp } from './TimerContainer'

// Mode Components
export { StopwatchTimer } from './modes/StopwatchTimer'
export { CountdownTimer } from './modes/CountdownTimer'
export { IntervalsTimer } from './modes/IntervalsTimer'

// Shared Components
export { TimerDisplay } from './shared/TimerDisplay'
export { AnimatedTimerButton } from './shared/AnimatedTimerButton'
export { TimerTopNav } from './shared/TimerTopNav'
export { HistoryModal } from './shared/HistoryModal'
export { EditPresetModal } from './shared/EditPresetModal'
export { EditIntervalPresetModal } from './shared/EditIntervalPresetModal'
export { WheelPicker } from './shared/WheelPicker'
export { TimerPresets } from './shared/TimerPresets'
export { IntervalPresets } from './shared/IntervalPresets'

// Settings Components
export { TimerSettingsModal } from './settings/TimerSettingsModal'

// Hooks
export { useStopwatch } from './hooks/useStopwatch'
export { useCountdown } from './hooks/useCountdown'
export { useIntervals } from './hooks/useIntervals'
export { useTimerSettings } from './hooks/useTimerSettings'
export { useTimerFocus } from './hooks/useTimerFocus'
export { useCustomPresets } from './hooks/useCustomPresets'
export { useCustomIntervalPresets } from './hooks/useCustomIntervalPresets'
export { useTimerHistory } from './hooks/useTimerHistory'
export { useTimerSound } from './hooks/useTimerSound'
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

// Types
export * from './types/timer.types'

// Constants
export * from './constants/timer.constants'

// Utils
export { soundManager } from './utils/soundManager'
export { vibrationManager } from './utils/vibrationManager'
export type { SoundType } from './utils/soundManager'
export type { VibrationPattern } from './utils/vibrationManager'
