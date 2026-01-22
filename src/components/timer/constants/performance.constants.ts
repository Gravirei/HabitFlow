/**
 * Performance Constants
 * Magic numbers extracted for maintainability
 */

// Timer Update Intervals
export const TIMER_UPDATE_INTERVAL_MS = 10 // Update timer display every 10ms
export const ANIMATION_FRAME_INTERVAL_MS = 16 // ~60fps for smooth animations

// Persistence Timing
export const PERSISTENCE_DEBOUNCE_MS = 1000 // Debounce localStorage writes by 1 second
export const STATE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
export const EMERGENCY_SAVE_DELAY_MS = 100 // Quick save on unload

// History Limits
export const MAX_HISTORY_RECORDS = 100 // Maximum timer history entries
export const HISTORY_CLEANUP_THRESHOLD = 110 // Trigger cleanup at this count

// UI Timing
export const TOAST_DURATION_MS = 3000 // Toast notification duration
export const MODAL_ANIMATION_MS = 300 // Modal open/close animation
export const BUTTON_DEBOUNCE_MS = 300 // Prevent double-clicks

// Validation Limits
export const MAX_TIMER_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours max
export const MIN_TIMER_DURATION_MS = 1000 // 1 second minimum
export const MAX_INTERVAL_SESSIONS = 99 // Maximum interval sessions
export const MAX_LOOP_COUNT = 999 // Maximum loop count

// Performance Thresholds
export const TIMER_DRIFT_WARNING_MS = 100 // Warn if timer drifts more than 100ms
export const STORAGE_QUOTA_WARNING_BYTES = 5 * 1024 * 1024 // 5MB warning threshold
