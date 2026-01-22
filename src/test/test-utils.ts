/**
 * Test Utilities
 * Shared utilities and setup for tests
 */

import { vi } from 'vitest'

/**
 * Setup localStorage mock that works with zustand persist middleware
 */
export const setupLocalStorage = () => {
  // Create storage object with proper method bindings
  const createStorage = () => {
    let store: Record<string, string> = {}

    const storage = {
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

    return storage
  }

  // Create and assign localStorage
  const localStorage = createStorage()
  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true,
  })

  // Create and assign sessionStorage
  const sessionStorage = createStorage()
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorage,
    writable: true,
  })

  return { localStorage, sessionStorage }
}

/**
 * Clear all storage
 */
export const clearStorage = () => {
  window.localStorage?.clear()
  window.sessionStorage?.clear()
}
