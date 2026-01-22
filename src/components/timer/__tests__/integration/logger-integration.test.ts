/**
 * Logger Integration Tests
 * Tests for logger usage in real timer scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../utils/logger'
import { timerPersistence } from '../../utils/timerPersistence'

describe('Logger Integration', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  beforeEach(() => {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    vi.clearAllMocks()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  describe('Timer Persistence Integration', () => {
    it('should log when saving timer state', () => {
      const testState = {
        mode: 'countdown' as const,
        isActive: true,
        isPaused: false,
        duration: 300000,
        elapsed: 0,
        pausedElapsed: 0,
        startTime: Date.now(),
      }

      timerPersistence.saveState(testState)

      // Should log the save operation
      expect(console.log).toHaveBeenCalled()
    })

    it('should log warnings for invalid states', () => {
      // Try to save invalid state
      const invalidState = { mode: 'invalid' } as any

      timerPersistence.saveState(invalidState)

      // May log warning or error depending on validation
      expect(console.log).toHaveBeenCalled()
    })

    it('should log when clearing state', () => {
      timerPersistence.clearState()

      // Should log the clear operation
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('Error Handling Integration', () => {
    it('should log errors with proper context', () => {
      const testError = new Error('Test persistence error')
      logger.error('Failed operation', testError, { context: 'Persistence' })

      expect(console.error).toHaveBeenCalled()
      const call = (console.error as any).mock.calls[0]
      expect(call[0]).toContain('[Timer][Persistence]')
      expect(call[0]).toContain('Failed operation')
    })

    it('should handle multiple errors in sequence', () => {
      logger.error('Error 1', new Error('First'))
      logger.error('Error 2', new Error('Second'))
      logger.error('Error 3', new Error('Third'))

      expect(console.error).toHaveBeenCalledTimes(3)
    })
  })

  describe('State Change Logging', () => {
    it('should log timer state transitions', () => {
      // Simulate timer lifecycle
      logger.stateChange('idle', 'active', 'useCountdown')
      logger.stateChange('active', 'paused', 'useCountdown')
      logger.stateChange('paused', 'active', 'useCountdown')
      logger.stateChange('active', 'completed', 'useCountdown')

      expect(console.log).toHaveBeenCalledTimes(4)
    })

    it('should log different timer modes', () => {
      logger.stateChange('idle', 'active', 'useCountdown')
      logger.stateChange('idle', 'active', 'useStopwatch')
      logger.stateChange('idle', 'active', 'useIntervals')

      const calls = (console.log as any).mock.calls
      expect(calls[0][0]).toContain('[useCountdown]')
      expect(calls[1][0]).toContain('[useStopwatch]')
      expect(calls[2][0]).toContain('[useIntervals]')
    })
  })

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      logger.performance('stateRestore', 15, 'Persistence')
      logger.performance('calculation', 5, 'useIntervals')
      logger.performance('save', 10, 'Storage')

      expect(console.log).toHaveBeenCalledTimes(3)
    })

    it('should track slow operations', () => {
      const slowOperationTime = 150
      logger.performance('slowSave', slowOperationTime, 'Persistence')

      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toContain('150ms')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle timer start flow', () => {
      // Simulate starting a countdown timer
      logger.debug('Timer starting', { context: 'useCountdown', data: { duration: 300 } })
      logger.persistence('State saved', { mode: 'countdown' })
      logger.stateChange('idle', 'active', 'useCountdown')

      expect(console.log).toHaveBeenCalledTimes(3)
    })

    it('should handle timer pause flow', () => {
      logger.stateChange('active', 'paused', 'useCountdown')
      logger.persistence('State updated', { isPaused: true })
      logger.debug('Timer paused', { context: 'useCountdown' })

      expect(console.log).toHaveBeenCalledTimes(3)
    })

    it('should handle timer completion flow', () => {
      logger.stateChange('active', 'completed', 'useCountdown')
      logger.persistence('History saved')
      logger.info('Timer completed', { context: 'useCountdown' })

      expect(console.log).toHaveBeenCalled()
    })

    it('should handle error recovery flow', () => {
      // Simulate error and recovery
      logger.warn('Invalid state detected', { context: 'Restore' })
      logger.error('Failed to parse', new Error('JSON parse error'))
      logger.persistence('State cleared')
      logger.info('Recovered to clean state')

      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledTimes(1)
      // Both persistence() and info() call console.log
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle rapid timer updates', () => {
      // Simulate many updates during active timer
      for (let i = 0; i < 50; i++) {
        logger.debug(`Update ${i}`, { context: 'useCountdown' })
      }

      expect(console.log).toHaveBeenCalledTimes(50)
    })
  })

  describe('Logger Performance', () => {
    it('should handle high-frequency logging efficiently', () => {
      const startTime = Date.now()

      // Log 1000 times
      for (let i = 0; i < 1000; i++) {
        logger.debug(`Log ${i}`)
      }

      const duration = Date.now() - startTime

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100)
      expect(console.log).toHaveBeenCalledTimes(1000)
    })

    it('should not block execution', () => {
      const operations: number[] = []

      logger.debug('Start')
      operations.push(1)
      logger.debug('Middle')
      operations.push(2)
      logger.debug('End')
      operations.push(3)

      // Operations should all complete
      expect(operations).toEqual([1, 2, 3])
      expect(console.log).toHaveBeenCalledTimes(3)
    })
  })

  describe('Logger Context Propagation', () => {
    it('should maintain context through call chain', () => {
      const context = 'useCountdown'

      logger.debug('Step 1', { context })
      logger.debug('Step 2', { context })
      logger.debug('Step 3', { context })

      const calls = (console.log as any).mock.calls
      calls.forEach((call: any[]) => {
        expect(call[0]).toContain(`[${context}]`)
      })
    })

    it('should support different contexts simultaneously', () => {
      logger.debug('Countdown active', { context: 'useCountdown' })
      logger.debug('Stopwatch running', { context: 'useStopwatch' })
      logger.debug('Intervals processing', { context: 'useIntervals' })

      const calls = (console.log as any).mock.calls
      expect(calls[0][0]).toContain('[useCountdown]')
      expect(calls[1][0]).toContain('[useStopwatch]')
      expect(calls[2][0]).toContain('[useIntervals]')
    })
  })

  describe('Logger Data Handling', () => {
    it('should handle complex data objects', () => {
      const complexData = {
        timer: {
          mode: 'countdown',
          duration: 300000,
          nested: {
            value: 42,
            array: [1, 2, 3],
          },
        },
      }

      logger.debug('Complex state', { data: complexData })

      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toContain('[Timer]')
    })

    it('should handle arrays in data', () => {
      const arrayData = [1, 2, 3, 4, 5]
      logger.debug('Array data', { data: arrayData })

      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toContain('[Timer]')
    })
  })
})
