/**
 * Test Setup and Mocks for Sidebar Tests
 */

import { vi, beforeEach } from 'vitest'

// Mock localStorage first
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

global.localStorage = localStorageMock as any
global.Storage.prototype.getItem = localStorageMock.getItem
global.Storage.prototype.setItem = localStorageMock.setItem
global.Storage.prototype.removeItem = localStorageMock.removeItem
global.Storage.prototype.clear = localStorageMock.clear

// Mock all stores
vi.mock('../../goals/goalsStore', () => ({
  useGoalsStore: vi.fn(() => ({
    goals: [],
    addGoal: vi.fn(),
    updateGoal: vi.fn(),
    deleteGoal: vi.fn(),
    updateGoalProgress: vi.fn(),
    getState: vi.fn(() => ({
      goals: [],
      addGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
      updateGoalProgress: vi.fn()
    }))
  })),
  default: {
    getState: vi.fn(() => ({
      goals: [],
      addGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
      updateGoalProgress: vi.fn()
    }))
  }
}))

vi.mock('../../achievements/achievementsStore', () => ({
  useAchievementsStore: vi.fn(() => ({
    achievements: [],
    unlockedCount: 0,
    unlockAchievement: vi.fn(),
    updateProgress: vi.fn(),
    getRecentUnlocks: vi.fn(() => []),
    getState: vi.fn(() => ({
      achievements: [],
      unlockedCount: 0,
      unlockAchievement: vi.fn(),
      updateProgress: vi.fn(),
      getRecentUnlocks: vi.fn(() => [])
    }))
  })),
  default: {
    getState: vi.fn(() => ({
      achievements: [],
      unlockedCount: 0,
      unlockAchievement: vi.fn(),
      updateProgress: vi.fn(),
      getRecentUnlocks: vi.fn(() => [])
    }))
  }
}))

vi.mock('../../archive/archiveStore', () => ({
  useArchiveStore: vi.fn(() => ({
    archivedSessions: [],
    archiveSession: vi.fn(),
    archiveSessions: vi.fn(),
    restoreSession: vi.fn(),
    restoreSessions: vi.fn(),
    deleteArchivedSession: vi.fn(),
    deleteArchivedSessions: vi.fn(),
    archiveByDateRange: vi.fn(),
    archiveOlderThan: vi.fn(),
    searchArchive: vi.fn(() => []),
    filterByMode: vi.fn(() => [])
  }))
}))

vi.mock('../../notifications/notificationStore', () => {
  const mockState = {
    enabled: false,
    settings: {
      sessionReminders: false,
      streakReminders: false,
      goalReminders: false,
      dailySummary: false
    },
    history: [],
    quietHours: { start: '22:00', end: '08:00' },
    enableSessionReminders: vi.fn(),
    enableStreakReminders: vi.fn(),
    enableGoalReminders: vi.fn(),
    enableDailySummary: vi.fn(),
    scheduleSessionReminder: vi.fn(),
    scheduleDailySummary: vi.fn(),
    cancelNotification: vi.fn(),
    getScheduledNotifications: vi.fn(() => []),
    addToHistory: vi.fn(),
    clearHistory: vi.fn(),
    setQuietHours: vi.fn(),
    isQuietHours: vi.fn(() => false)
  }

  return {
    useNotificationStore: vi.fn(() => mockState),
    default: vi.fn(() => mockState)
  }
})

vi.mock('../../hooks/useFilterVisibility', () => ({
  useFilterVisibility: vi.fn(() => ({
    filterVisibility: {
      dateRange: true,
      duration: true,
      completion: true,
      search: true
    },
    setFilterVisibility: vi.fn()
  }))
}))

// Mock Notification API
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted')
} as any

// localStorage is already mocked at the top

// Mock jsPDF for PDF export tests
global.jsPDF = vi.fn(() => ({
  text: vi.fn(),
  line: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn()
})) as any

// Mock all component imports to prevent actual rendering
vi.mock('../../export/ExportModal', () => ({
  ExportModal: vi.fn(() => null)
}))

vi.mock('../../goals/GoalsModal', () => ({
  GoalsModal: vi.fn(() => null)
}))

vi.mock('../../achievements/AchievementsModal', () => ({
  AchievementsModal: vi.fn(() => null)
}))

vi.mock('../../ai-insights/AIInsightsModal', () => ({
  AIInsightsModal: vi.fn(() => null)
}))

vi.mock('../../archive/ArchiveModal', () => ({
  ArchiveModal: vi.fn(() => null)
}))

vi.mock('../../filters/FilterSettingsModal', () => ({
  FilterSettingsModal: vi.fn(() => null)
}))

vi.mock('../../notifications/NotificationSettingsModal', () => ({
  NotificationSettingsModal: vi.fn(() => null)
}))

// Export test utilities
export const mockSessionData = [
  {
    id: '1',
    mode: 'Stopwatch' as const,
    duration: 1500,
    timestamp: Date.now() - 86400000,
    completed: true
  },
  {
    id: '2',
    mode: 'Countdown' as const,
    duration: 1800,
    timestamp: Date.now() - 43200000,
    completed: true
  },
  {
    id: '3',
    mode: 'Intervals' as const,
    duration: 2400,
    timestamp: Date.now(),
    completed: false
  }
]

export const resetAllMocks = () => {
  vi.clearAllMocks()
  localStorageMock.clear()
}

// Setup before each test
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})
