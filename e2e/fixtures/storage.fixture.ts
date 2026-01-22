import { test as base, Page } from '@playwright/test'

export type StorageFixtures = {
  clearTimerStorage: () => Promise<void>
  seedTimerHistory: (sessions: any[]) => Promise<void>
  seedTimerSettings: (settings: any) => Promise<void>
  getStorageItem: (key: string) => Promise<any>
  setStorageItem: (key: string, value: any) => Promise<void>
}

// Timer storage keys
export const STORAGE_KEYS = {
  STOPWATCH_HISTORY: 'timer-stopwatch-history',
  COUNTDOWN_HISTORY: 'timer-countdown-history',
  INTERVALS_HISTORY: 'timer-intervals-history',
  TIMER_STATE: 'flowmodoro_timer_state',
  TIMER_SETTINGS: 'timer-settings',
  ACHIEVEMENTS: 'timer-sidebar-achievements',
  GOALS: 'timer-sidebar-goals',
  THEME: 'timer-theme-settings',
} as const

export const storageTest = base.extend<StorageFixtures>({
  // Clear all timer-related localStorage
  clearTimerStorage: async ({ page }, use) => {
    const clearTimerStorage = async () => {
      await page.evaluate((keys) => {
        Object.values(keys).forEach(key => {
          localStorage.removeItem(key)
        })
        // Also clear any flowmodoro prefixed items
        Object.keys(localStorage)
          .filter(k => k.startsWith('flowmodoro_') || k.startsWith('timer-'))
          .forEach(k => localStorage.removeItem(k))
      }, STORAGE_KEYS)
    }
    await use(clearTimerStorage)
  },

  // Seed timer history with mock sessions
  seedTimerHistory: async ({ page }, use) => {
    const seedTimerHistory = async (sessions: any[]) => {
      await page.evaluate((data) => {
        const { sessions, keys } = data
        const stopwatch: any[] = []
        const countdown: any[] = []
        const intervals: any[] = []

        sessions.forEach(session => {
          switch (session.mode) {
            case 'Stopwatch':
              stopwatch.push(session)
              break
            case 'Countdown':
              countdown.push(session)
              break
            case 'Intervals':
              intervals.push(session)
              break
          }
        })

        if (stopwatch.length) {
          localStorage.setItem(keys.STOPWATCH_HISTORY, JSON.stringify(stopwatch))
        }
        if (countdown.length) {
          localStorage.setItem(keys.COUNTDOWN_HISTORY, JSON.stringify(countdown))
        }
        if (intervals.length) {
          localStorage.setItem(keys.INTERVALS_HISTORY, JSON.stringify(intervals))
        }
      }, { sessions, keys: STORAGE_KEYS })
    }
    await use(seedTimerHistory)
  },

  // Seed timer settings
  seedTimerSettings: async ({ page }, use) => {
    const seedTimerSettings = async (settings: any) => {
      await page.evaluate((data) => {
        localStorage.setItem(data.key, JSON.stringify(data.settings))
      }, { key: STORAGE_KEYS.TIMER_SETTINGS, settings })
    }
    await use(seedTimerSettings)
  },

  // Get a localStorage item
  getStorageItem: async ({ page }, use) => {
    const getStorageItem = async (key: string) => {
      return await page.evaluate((k) => {
        const item = localStorage.getItem(k)
        return item ? JSON.parse(item) : null
      }, key)
    }
    await use(getStorageItem)
  },

  // Set a localStorage item
  setStorageItem: async ({ page }, use) => {
    const setStorageItem = async (key: string, value: any) => {
      await page.evaluate((data) => {
        localStorage.setItem(data.key, JSON.stringify(data.value))
      }, { key, value })
    }
    await use(setStorageItem)
  },
})

// Mock session generators
export function createMockStopwatchSession(overrides: Partial<any> = {}) {
  return {
    id: `sw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Stopwatch' as const,
    duration: 300, // 5 minutes in seconds
    timestamp: Date.now(),
    laps: [],
    sessionName: 'Test Stopwatch Session',
    ...overrides,
  }
}

export function createMockCountdownSession(overrides: Partial<any> = {}) {
  return {
    id: `cd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Countdown' as const,
    duration: 600, // 10 minutes in seconds
    initialDuration: 600,
    timestamp: Date.now(),
    completed: true,
    sessionName: 'Test Countdown Session',
    ...overrides,
  }
}

export function createMockIntervalsSession(overrides: Partial<any> = {}) {
  return {
    id: `iv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Intervals' as const,
    duration: 1500, // 25 minutes in seconds
    timestamp: Date.now(),
    workDuration: 25,
    breakDuration: 5,
    completedLoops: 4,
    targetLoopCount: 4,
    sessionName: 'Test Intervals Session',
    ...overrides,
  }
}

export { expect } from '@playwright/test'
