// Add custom matchers or setup code for tests
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Storage - use simple object with arrow functions for best compatibility
const createStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

// Setup global mocks before all tests
beforeAll(() => {
  // Create fresh instances for each test run
  const localStorage = createStorage()
  const sessionStorage = createStorage()

  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true,
    configurable: true,
  })

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorage,
    writable: true,
    configurable: true,
  })

  // Mock Notification API
  Object.defineProperty(window, 'Notification', {
    value: class Notification {
      static permission = 'default'
      static requestPermission = vi.fn().mockResolvedValue('granted')
      constructor(title: string, options?: NotificationOptions) {
        return { title, ...options }
      }
    },
    writable: true,
    configurable: true, // Allow deletion
  })

})

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear localStorage and sessionStorage after each test
  // Wrap in try-catch in case they've been mocked to throw errors
  try {
    if (window.localStorage?.clear) {
      window.localStorage.clear()
    }
  } catch (e) {
    // localStorage might be mocked in tests
  }
  try {
    if (window.sessionStorage?.clear) {
      window.sessionStorage.clear()
    }
  } catch (e) {
    // sessionStorage might be mocked in tests
  }
  // Clear all mocks
  vi.clearAllMocks()
})
