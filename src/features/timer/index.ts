/**
 * Timer Module Exports
 * Central export point for all timer components
 */

// Main Container
export { TimerContainer, useKeyboardHelp } from './components/TimerContainer'

// Mode Components
export { StopwatchTimer } from './components/modes/StopwatchTimer'
export { CountdownTimer } from './components/modes/CountdownTimer'
export { IntervalsTimer } from './components/modes/IntervalsTimer'

// Shared Components
export { TimerDisplay } from './components/shared/TimerDisplay'
export { AnimatedTimerButton } from './components/shared/AnimatedTimerButton'
export { TimerTopNav } from './components/shared/TimerTopNav'
export { HistoryModal } from './components/shared/HistoryModal'
export { EditPresetModal } from './components/shared/EditPresetModal'
export { EditIntervalPresetModal } from './components/shared/EditIntervalPresetModal'
export { WheelPicker } from './components/shared/WheelPicker'
export { TimerPresets } from './components/shared/TimerPresets'
export { IntervalPresets } from './components/shared/IntervalPresets'

// Settings Components
export { TimerSettingsModal } from './components/settings/TimerSettingsModal'

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
