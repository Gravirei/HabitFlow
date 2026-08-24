/**

// Type declarations for test environment
declare const global: typeof globalThis
declare const process: NodeJS.Process

 * Tests for vibrationManager utility
 * Comprehensive test suite for Vibration API integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { vibrationManager } from '../../utils/vibrationManager'

describe('vibrationManager', () => {
  let mockVibrate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Ensure navigator exists in test environment
    if (typeof navigator === 'undefined') {
      (global as any).navigator = {}
    }
    
    // Mock navigator.vibrate
    mockVibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore vibrate property to mock state for next test
    mockVibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true
    })
  })

  describe('isSupported', () => {
    it('should return true when vibrate is available', () => {
      expect(vibrationManager.isSupported()).toBe(true)
    })

    it('should return false when vibrate is not available', () => {
      // Remove vibrate from navigator by deleting the property
      delete (navigator as any).vibrate

      expect(vibrationManager.isSupported()).toBe(false)
    })

    it('should handle navigator not defined', () => {
      const originalNavigator = global.navigator
      delete (global as any).navigator

      expect(() => vibrationManager.isSupported()).not.toThrow()

      ;(global as any).navigator = originalNavigator
    })
  })

  describe('vibrate', () => {
    describe('Short Pattern', () => {
      it('should trigger short vibration (200ms)', () => {
        vibrationManager.vibrate('short')

        expect(mockVibrate).toHaveBeenCalledWith(200)
      })

      it('should call navigator.vibrate once', () => {
        vibrationManager.vibrate('short')

        expect(mockVibrate).toHaveBeenCalledTimes(1)
      })
    })

    describe('Long Pattern', () => {
      it('should trigger long vibration (500ms)', () => {
        vibrationManager.vibrate('long')

        expect(mockVibrate).toHaveBeenCalledWith(500)
      })

      it('should call navigator.vibrate once', () => {
        vibrationManager.vibrate('long')

        expect(mockVibrate).toHaveBeenCalledTimes(1)
      })
    })

    describe('Pulse Pattern', () => {
      it('should trigger pulse vibration pattern', () => {
        vibrationManager.vibrate('pulse')

        expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100, 50, 100])
      })

      it('should use array pattern for pulse', () => {
        vibrationManager.vibrate('pulse')

        const callArg = mockVibrate.mock.calls[0][0]
        expect(Array.isArray(callArg)).toBe(true)
      })

      it('should have correct pulse pattern length', () => {
        vibrationManager.vibrate('pulse')

        const pattern = mockVibrate.mock.calls[0][0]
        expect(pattern).toHaveLength(5)
      })
    })

    describe('Feature Detection', () => {
      it('should not vibrate when API not supported', () => {
        delete (navigator as any).vibrate

        vibrationManager.vibrate('short')

        expect(mockVibrate).not.toHaveBeenCalled()
      })

      it('should log warning when not supported', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        delete (navigator as any).vibrate

        vibrationManager.vibrate('short')

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Timer][vibrationManager.vibrate] Vibration API not supported'),
          '' // logger.warn outputs data ?? '' as second param
        )

        consoleWarnSpy.mockRestore()
      })
    })

    describe('Error Handling', () => {
      it('should handle vibrate errors gracefully', () => {
        mockVibrate.mockImplementation(() => {
          throw new Error('Vibration error')
        })

        expect(() => vibrationManager.vibrate('short')).not.toThrow()
      })

      it('should log errors to console', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        mockVibrate.mockImplementation(() => {
          throw new Error('Vibration error')
        })

        vibrationManager.vibrate('short')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Timer Error][VIBRATION][LOW] Failed to trigger vibration'),
          expect.any(Error),
          expect.objectContaining({ pattern: 'short' })
        )

        consoleErrorSpy.mockRestore()
      })

      it('should handle unknown pattern gracefully', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        vibrationManager.vibrate('unknown' as any)

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Timer][vibrationManager.vibrate] Unknown vibration pattern'),
          '' // logger.warn outputs data ?? '' as second param
        )

        consoleWarnSpy.mockRestore()
      })
    })
  })

  describe('stop', () => {
    it('should stop vibration by calling vibrate(0)', () => {
      vibrationManager.stop()

      expect(mockVibrate).toHaveBeenCalledWith(0)
    })

    it('should work when API is supported', () => {
      vibrationManager.stop()

      expect(mockVibrate).toHaveBeenCalledTimes(1)
    })

    it('should not call vibrate when API not supported', () => {
      delete (navigator as any).vibrate

      vibrationManager.stop()

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle stop errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockVibrate.mockImplementation(() => {
        throw new Error('Stop error')
      })

      expect(() => vibrationManager.stop()).not.toThrow()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('All Patterns', () => {
    it('should support all 3 vibration patterns', () => {
      const patterns: Array<'short' | 'long' | 'pulse'> = ['short', 'long', 'pulse']

      patterns.forEach(pattern => {
        vi.clearAllMocks()
        vibrationManager.vibrate(pattern)
        expect(mockVibrate).toHaveBeenCalled()
      })
    })

    it('should use different values for each pattern', () => {
      const results: any[] = []

      vibrationManager.vibrate('short')
      results.push(mockVibrate.mock.calls[0][0])

      vi.clearAllMocks()
      vibrationManager.vibrate('long')
      results.push(mockVibrate.mock.calls[0][0])

      vi.clearAllMocks()
      vibrationManager.vibrate('pulse')
      results.push(mockVibrate.mock.calls[0][0])

      // All patterns should be different
      expect(results[0]).not.toBe(results[1])
      expect(results[1]).not.toBe(results[2])
      expect(results[0]).not.toBe(results[2])
    })
  })

  describe('Integration', () => {
    it('should handle multiple vibrations in sequence', () => {
      vibrationManager.vibrate('short')
      vibrationManager.vibrate('long')
      vibrationManager.vibrate('pulse')

      expect(mockVibrate).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 5; i++) {
        vibrationManager.vibrate('short')
      }

      expect(mockVibrate).toHaveBeenCalledTimes(5)
    })

    it('should allow starting new vibration after stopping', () => {
      vibrationManager.vibrate('short')
      vibrationManager.stop()
      vibrationManager.vibrate('long')

      expect(mockVibrate).toHaveBeenCalledTimes(3)
      expect(mockVibrate).toHaveBeenNthCalledWith(1, 200)
      expect(mockVibrate).toHaveBeenNthCalledWith(2, 0)
      expect(mockVibrate).toHaveBeenNthCalledWith(3, 500)
    })
  })

  describe('Pattern Validation', () => {
    it('should use correct duration for short pattern', () => {
      vibrationManager.vibrate('short')

      expect(mockVibrate).toHaveBeenCalledWith(200)
    })

    it('should use correct duration for long pattern', () => {
      vibrationManager.vibrate('long')

      expect(mockVibrate).toHaveBeenCalledWith(500)
    })

    it('should use correct array for pulse pattern', () => {
      vibrationManager.vibrate('pulse')

      const pattern = mockVibrate.mock.calls[0][0]
      expect(pattern).toEqual([100, 50, 100, 50, 100])
    })

    it('should have pulse pattern with alternating vibrate/pause', () => {
      vibrationManager.vibrate('pulse')

      const pattern = mockVibrate.mock.calls[0][0]
      // Pattern should be: vibrate, pause, vibrate, pause, vibrate
      // Odd indices are vibrations, even indices (in gaps) are pauses
      expect(pattern[0]).toBe(100) // vibrate
      expect(pattern[1]).toBe(50)  // pause
      expect(pattern[2]).toBe(100) // vibrate
      expect(pattern[3]).toBe(50)  // pause
      expect(pattern[4]).toBe(100) // vibrate
    })
  })

  describe('Singleton Pattern', () => {
    it('should be a singleton instance', async () => {
      // Import the module twice to verify it's the same instance
      const module1 = await import('../../utils/vibrationManager')
      const module2 = await import('../../utils/vibrationManager')

      expect(module1.vibrationManager).toBe(module2.vibrationManager)
    })

    it('should maintain state across multiple imports', async () => {
      // Import module again
      const { vibrationManager: reimported } = await import('../../utils/vibrationManager')
      
      // Should be the same instance
      expect(reimported).toBe(vibrationManager)
    })
  })

  describe('Browser Compatibility', () => {
    it('should work on Android Chrome (supported)', () => {
      vibrationManager.vibrate('short')

      expect(mockVibrate).toHaveBeenCalled()
    })

    it('should handle iOS Safari (not supported)', () => {
      delete (navigator as any).vibrate

      expect(vibrationManager.isSupported()).toBe(false)
      vibrationManager.vibrate('short')
      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle desktop browsers (not supported)', () => {
      delete (navigator as any).vibrate

      expect(vibrationManager.isSupported()).toBe(false)
      vibrationManager.vibrate('pulse')
      expect(mockVibrate).not.toHaveBeenCalled()
    })
  })
})
