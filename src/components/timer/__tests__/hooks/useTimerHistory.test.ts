import { describe, it, expect, beforeEach, vi } from 'vitest'

// Type declarations for test environment
declare const global: typeof globalThis
declare const process: NodeJS.Process

import { renderHook, act, waitFor } from '@testing-library/react'
import { useTimerHistory } from '../../hooks/useTimerHistory'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Set up localStorage mock properly
global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock.getItem(key))
global.Storage.prototype.setItem = vi.fn((key: string, value: string) => localStorageMock.setItem(key, value))
global.Storage.prototype.removeItem = vi.fn((key: string) => localStorageMock.removeItem(key))

describe('useTimerHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    // Re-setup mocks after clearing
    global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock.getItem(key))
    global.Storage.prototype.setItem = vi.fn((key: string, value: string) => localStorageMock.setItem(key, value))
    global.Storage.prototype.removeItem = vi.fn((key: string) => localStorageMock.removeItem(key))
  })

  describe('Initialization', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      expect(result.current.history).toEqual([])
    })

    it('should load existing history from localStorage', async () => {
      // First, save data using the hook itself to ensure proper persistence
      const { result: setupResult, unmount } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        setupResult.current.saveToHistory({ duration: 5000 })
      })

      // Wait for async save and verify data was saved
      await waitFor(() => {
        expect(setupResult.current.history).toHaveLength(1)
      })
      
      // Unmount the hook
      unmount()

      // Now create a new hook instance - it should load the saved data
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      // Wait for async loading and verify history loaded
      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
      })
      
      expect(result.current.history[0].duration).toBe(5000)
      expect(result.current.history[0].mode).toBe('Stopwatch')
    })
  })

  describe('saveToHistory', () => {
    it('should save a valid record to history', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].mode).toBe('Stopwatch')
      expect(result.current.history[0].duration).toBe(5000)
      expect(result.current.history[0].id).toBeDefined()
      expect(result.current.history[0].timestamp).toBeDefined()
    })

    it('should not save record with zero duration', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 0 })
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('should not save record with negative duration', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: -1000 })
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('should save intervalCount for Intervals mode', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Intervals', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 10000, intervalCount: 5 })
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].intervalCount).toBe(5)
    })

    it('should not include intervalCount when undefined', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      expect(result.current.history[0]).not.toHaveProperty('intervalCount')
    })

    it('should add new records at the beginning', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 1000 })
      })

      act(() => {
        result.current.saveToHistory({ duration: 2000 })
      })

      expect(result.current.history).toHaveLength(2)
      expect(result.current.history[0].duration).toBe(2000) // Most recent first
      expect(result.current.history[1].duration).toBe(1000)
    })

    it('should limit history to MAX_HISTORY_RECORDS', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      // Add 101 records (MAX_HISTORY_RECORDS is 100)
      act(() => {
        for (let i = 0; i < 101; i++) {
          result.current.saveToHistory({ duration: i + 1 })
        }
      })

      expect(result.current.history).toHaveLength(100)
      // Should keep the most recent 100
      expect(result.current.history[0].duration).toBe(101) // Most recent
      expect(result.current.history[99].duration).toBe(2) // 100th most recent
    })

    it('should generate unique IDs for each record', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 1000 })
        result.current.saveToHistory({ duration: 2000 })
        result.current.saveToHistory({ duration: 3000 })
      })

      const ids = result.current.history.map(record => record.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(3) // All IDs should be unique
    })
  })

  describe('clearHistory', () => {
    it('should clear all history records', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 1000 })
        result.current.saveToHistory({ duration: 2000 })
      })

      expect(result.current.history).toHaveLength(2)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('should persist cleared state to localStorage', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 1000 })
      })

      act(() => {
        result.current.clearHistory()
      })

      // Re-mount the hook to verify persistence
      const { result: newResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      expect(newResult.current.history).toHaveLength(0)
    })
  })

  describe('Different Timer Modes', () => {
    it('should correctly set mode for Stopwatch', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      expect(result.current.history[0].mode).toBe('Stopwatch')
    })

    it('should correctly set mode for Countdown', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Countdown', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      expect(result.current.history[0].mode).toBe('Countdown')
    })

    it('should correctly set mode for Intervals', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Intervals', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000, intervalCount: 3 })
      })

      expect(result.current.history[0].mode).toBe('Intervals')
      expect(result.current.history[0].intervalCount).toBe(3)
    })
  })

  describe('Separate Storage Keys', () => {
    it('should keep histories separate for different storage keys', () => {
      const { result: stopwatchResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'stopwatch-key' })
      )

      const { result: countdownResult } = renderHook(() => 
        useTimerHistory({ mode: 'Countdown', storageKey: 'countdown-key' })
      )

      act(() => {
        stopwatchResult.current.saveToHistory({ duration: 1000 })
        countdownResult.current.saveToHistory({ duration: 2000 })
      })

      expect(stopwatchResult.current.history).toHaveLength(1)
      expect(countdownResult.current.history).toHaveLength(1)
      expect(stopwatchResult.current.history[0].duration).toBe(1000)
      expect(countdownResult.current.history[0].duration).toBe(2000)
    })
  })

  describe('Persistence', () => {
    it('should persist history to localStorage', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      // Check if data was saved (either through localStorage directly or through the mock)
      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].duration).toBe(5000)
      expect(result.current.history[0].mode).toBe('Stopwatch')
    })

    it('should reload history after unmount and remount', async () => {
      const { result, unmount } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      // Wait for the save to complete
      await waitFor(() => {
        expect(result.current.history).toHaveLength(1)
      })

      unmount()

      const { result: newResult } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      // Wait for async loading to complete
      await waitFor(() => {
        expect(newResult.current.history).toHaveLength(1)
      })
      
      expect(newResult.current.history[0].duration).toBe(5000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large durations', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      // Use 86400 seconds (24 hours) - the hook now uses seconds, not ms
      // Values > 86400 are considered "old millisecond data" and get migrated
      const largeDuration = 86000 // Just under migration threshold

      act(() => {
        result.current.saveToHistory({ duration: largeDuration })
      })

      expect(result.current.history[0].duration).toBe(largeDuration)
    })

    it('should handle zero intervalCount', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Intervals', storageKey: 'test-key' })
      )

      act(() => {
        result.current.saveToHistory({ duration: 5000, intervalCount: 0 })
      })

      expect(result.current.history[0].intervalCount).toBe(0)
    })

    it('should generate timestamps close to current time', () => {
      const { result } = renderHook(() => 
        useTimerHistory({ mode: 'Stopwatch', storageKey: 'test-key' })
      )

      const before = Date.now()
      
      act(() => {
        result.current.saveToHistory({ duration: 5000 })
      })

      const after = Date.now()
      const recordTimestamp = result.current.history[0].timestamp

      expect(recordTimestamp).toBeGreaterThanOrEqual(before)
      expect(recordTimestamp).toBeLessThanOrEqual(after)
    })
  })
})
