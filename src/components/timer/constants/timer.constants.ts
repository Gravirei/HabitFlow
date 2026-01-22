/**
 * Timer Constants
 * All magic numbers, configurations, and reusable values
 */

import type { PresetConfig, IntervalPresetConfig, TimerConfig } from '../types/timer.types'

// Time Conversions
export const MS_PER_SECOND = 1000
export const MS_PER_MINUTE = 60 * MS_PER_SECOND
export const MS_PER_HOUR = 60 * MS_PER_MINUTE

// Timer Update Intervals
export const STOPWATCH_UPDATE_INTERVAL = 10 // 10ms for centisecond precision
export const COUNTDOWN_UPDATE_INTERVAL = 10 // 10ms for smooth animation
export const INTERVALS_UPDATE_INTERVAL = 10 // 10ms for smooth animation and milliseconds display

// Circle Progress (SVG)
export const CIRCLE_RADIUS = 48
export const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS // 301.59
export const CIRCLE_STROKE_WIDTH = 4

// Wheel Picker
export const WHEEL_VISIBLE_ITEMS = 5
export const WHEEL_ITEM_HEIGHT = 48 // pixels
export const WHEEL_SNAP_THRESHOLD = 0.5

// Timer Limits
export const MAX_HOURS = 23
export const MAX_MINUTES = 59
export const MAX_SECONDS = 59
export const MAX_HISTORY_RECORDS = 100 // Maximum number of history records per timer mode
export const MAX_WORK_MINUTES = 90
export const MAX_BREAK_MINUTES = 30

// Countdown Presets
export const COUNTDOWN_PRESETS: PresetConfig[] = [
  {
    label: 'Focus',
    duration: 25,
    description: 'Pomodoro focus session',
    icon: 'self_improvement',
    color: '#13ec5b',
    bgColor: '#1c2e22'
  },
  {
    label: 'Break',
    duration: 5,
    description: 'Short break',
    icon: 'coffee',
    color: '#fb923c',
    bgColor: '#2a1e16'
  },
  {
    label: 'Nap',
    duration: 20,
    description: 'Power nap',
    icon: 'bedtime',
    color: '#60a5fa',
    bgColor: '#16202a'
  },
  {
    label: 'Meditate',
    duration: 10,
    description: 'Mindfulness session',
    icon: 'spa',
    color: '#c084fc',
    bgColor: '#25162a'
  }
]

// Interval Presets
export const INTERVAL_PRESETS: IntervalPresetConfig[] = [
  {
    label: 'Pomodoro',
    work: 25,
    break: 5,
    loopCount: 3,
    description: 'Classic Pomodoro technique',
    icon: 'self_improvement',
    color: '#13ec5b'
  },
  {
    label: 'Extended',
    work: 50,
    break: 10,
    loopCount: 2,
    description: 'Longer focus sessions',
    icon: 'schedule',
    color: '#60a5fa'
  },
  {
    label: 'Short',
    work: 15,
    break: 3,
    loopCount: 5,
    description: 'Quick sprints',
    icon: 'bolt',
    color: '#fb923c'
  },
  {
    label: 'Work',
    work: 45,
    break: 15,
    loopCount: 3,
    description: 'Standard work blocks',
    icon: 'work',
    color: '#c084fc'
  }
]

// Timer Configuration
export const TIMER_CONFIG: TimerConfig = {
  updateInterval: 10,
  circleCircumference: CIRCLE_CIRCUMFERENCE
}

// Tailwind Class Strings (reusable)
export const TIMER_CLASSES = {
  // Containers
  container: 'relative flex w-full flex-grow flex-col items-center justify-center overflow-hidden',
  backgroundGlow: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none',
  
  // Timer Display
  timerRing: {
    container: 'flex flex-grow items-center justify-center px-4 py-8',
    wrapper: 'relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80',
    svg: 'absolute inset-0',
    circleBackground: 'stroke-current text-black/10 dark:text-white/10',
    circleProgress: 'stroke-current text-primary transition-all duration-100 ease-linear timer-ring-progress',
    timeText: 'text-5xl font-bold tracking-tighter text-black dark:text-white tabular-nums'
  },
  
  // Buttons
  button: {
    primary: 'flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-background-dark text-xl font-bold leading-normal tracking-[0.015em] shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_40px_rgba(19,236,91,0.5)] transition-all hover:scale-105 active:scale-95',
    secondary: 'flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 border border-white/5',
    preset: 'shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group',
    presetDisabled: 'disabled:opacity-50',
    lap: 'flex items-center justify-between rounded-lg bg-white/5 p-4 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors'
  },
  
  // Control Groups
  controls: {
    wrapper: 'flex justify-stretch px-4 py-6 pb-24',
    container: 'flex flex-1 gap-6 items-center justify-center'
  },
  
  // Preset Buttons
  presets: {
    wrapper: 'mt-6 mb-2 w-full z-10',
    container: 'flex gap-3 overflow-x-auto px-6 pb-2 no-scrollbar mask-gradient-x',
    label: 'group-hover:text-primary transition-colors duration-300'
  },
  
  // Wheel Picker
  wheel: {
    container: 'relative w-full max-w-sm h-96 flex items-center justify-center',
    pickerWrapper: 'flex gap-4 items-center justify-center relative',
    picker: 'relative h-60 w-20 overflow-hidden',
    itemsWrapper: 'absolute w-full transition-transform duration-200',
    item: 'flex h-12 items-center justify-center text-2xl font-bold tabular-nums cursor-pointer select-none',
    itemActive: 'text-primary scale-110',
    itemInactive: 'text-white/30',
    label: 'text-sm text-white/50 absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap',
    highlight: 'absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 bg-primary/10 rounded-lg pointer-events-none border-y border-primary/20'
  },
  
  // Laps Display
  laps: {
    container: 'mt-8 h-40 w-full max-w-sm overflow-hidden relative mask-gradient-b',
    title: 'hidden',
    list: 'flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
    item: 'flex justify-between items-center py-2 px-4 border-b border-white/5 text-white/40 text-sm font-bold',
    empty: 'text-center text-white/50 py-8'
  },
  
  // Interval Status
  interval: {
    container: 'text-center mb-4 z-10',
    count: 'text-white/60 text-sm mb-1',
    label: 'text-primary text-lg font-bold'
  }
}

// Format helpers
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / MS_PER_SECOND)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % MS_PER_SECOND) / 10)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Show centiseconds only for stopwatch under 1 minute
  if (totalSeconds < 60) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Progress calculation helper
export const calculateProgress = (timeLeft: number, totalTime: number, circumference: number): number => {
  if (totalTime === 0) return 0
  return ((totalTime - timeLeft) / totalTime) * circumference
}

// Stroke dash offset calculation
export const calculateStrokeDashoffset = (progress: number, circumference: number): number => {
  return circumference - progress
}
