/**
 * Tests for useTimerSound hook
 * Comprehensive test suite for timer sound integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTimerSound } from '../../hooks/useTimerSound'
import { soundManager } from '../../utils/soundManager'
import { vibrationManager } from '../../utils/vibrationManager'

// Mock dependencies
vi.mock('../../utils/soundManager', () => ({
  soundManager: {
    playSound: vi.fn(),
    cleanup: vi.fn()
  }
}))

vi.mock('../../utils/vibrationManager', () => ({
  vibrationManager: {
    vibrate: vi.fn(),
    stop: vi.fn(),
    isSupported: vi.fn(() => true)
  }
}))

vi.mock('../../hooks/useTimerSettings', () => ({
  useTimerSettings: () => ({
    settings: {
      soundEnabled: true,
      soundType: 'beep' as const,
      soundVolume: 70,
      vibrationEnabled: true,
      vibrationPattern: 'short' as const
    }
  })
}))

describe('useTimerSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should return all expected functions', () => {
      const { result } = renderHook(() => useTimerSound())

      expect(result.current.playCompletionSound).toBeDefined()
      expect(result.current.playPreviewSound).toBeDefined()
      expect(result.current.playPreviewVibration).toBeDefined()
      expect(result.current.stopVibration).toBeDefined()
      expect(result.current.isVibrationSupported).toBeDefined()
    })
  })

  describe('playCompletionSound', () => {
    it('should play sound and vibrate when both are enabled', () => {
      const { result } = renderHook(() => useTimerSound())
      result.current.playCompletionSound()

      expect(soundManager.playSound).toHaveBeenCalledWith('beep', 70)
      expect(vibrationManager.vibrate).toHaveBeenCalledWith('short')
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
      expect(vibrationManager.vibrate).toHaveBeenCalledTimes(1)
    })
  })
})
