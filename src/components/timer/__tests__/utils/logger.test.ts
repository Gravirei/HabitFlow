/**
 * Logger Utility Tests
 * Tests for the timer logging system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, TimerLogger } from '../../utils/logger'

describe('TimerLogger', () => {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }

  // Mock console methods
  beforeEach(() => {
    console.log = vi.fn()
    console.info = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    vi.clearAllMocks()
  })

  describe('Environment-aware logging', () => {
    it('should have a logger instance exported', () => {
      expect(logger).toBeDefined()
      expect(logger).toBeInstanceOf(TimerLogger)
    })

    it('should format messages with [Timer] prefix', () => {
      logger.warn('Test warning')
      expect(console.warn).toHaveBeenCalled()
      const call = (console.warn as any).mock.calls[0]
      expect(call[0]).toContain('[Timer]')
      expect(call[0]).toContain('Test warning')
    })

    it('should include context in formatted messages', () => {
      logger.warn('Test warning', { context: 'useCountdown' })
      expect(console.warn).toHaveBeenCalled()
      const call = (console.warn as any).mock.calls[0]
      expect(call[0]).toContain('[Timer][useCountdown]')
      expect(call[0]).toContain('Test warning')
    })
  })

  describe('debug()', () => {
    it('should call console.log in development', () => {
      logger.debug('Debug message')
      // Note: In test env, isDevelopment should be true
      expect(console.log).toHaveBeenCalled()
    })

    it('should include context when provided', () => {
      logger.debug('Debug with context', { context: 'TestContext' })
      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toContain('[TestContext]')
    })

    it('should include data when provided', () => {
      const testData = { mode: 'countdown', duration: 300 }
      logger.debug('Test with data', { data: testData })
      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[1]).toBeDefined()
    })
  })

  describe('info()', () => {
    it('should call console.info in development', () => {
      logger.info('Info message')
      expect(console.info).toHaveBeenCalled()
    })

    it('should support context and data', () => {
      const testData = { value: 42 }
      logger.info('Info with extras', { context: 'Test', data: testData })
      expect(console.info).toHaveBeenCalled()
      const call = (console.info as any).mock.calls[0]
      expect(call[0]).toContain('[Test]')
    })
  })

  describe('warn()', () => {
    it('should always call console.warn', () => {
      logger.warn('Warning message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should format warning with context', () => {
      logger.warn('Critical warning', { context: 'Storage' })
      expect(console.warn).toHaveBeenCalled()
      const call = (console.warn as any).mock.calls[0]
      expect(call[0]).toContain('[Timer][Storage]')
      expect(call[0]).toContain('Critical warning')
    })

    it('should include data in warnings', () => {
      const errorData = { quota: 'exceeded' }
      logger.warn('Storage warning', { data: errorData })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('error()', () => {
    it('should always call console.error', () => {
      logger.error('Error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('should log Error objects', () => {
      const testError = new Error('Test error')
      logger.error('Operation failed', testError)
      expect(console.error).toHaveBeenCalled()
      const call = (console.error as any).mock.calls[0]
      expect(call[0]).toContain('[Timer]')
      expect(call[0]).toContain('Operation failed')
    })

    it('should support context in error logs', () => {
      const error = new Error('Save failed')
      logger.error('Failed to save', error, { context: 'Persistence' })
      expect(console.error).toHaveBeenCalled()
      const call = (console.error as any).mock.calls[0]
      expect(call[0]).toContain('[Timer][Persistence]')
      expect(call[0]).toContain('Failed to save')
    })

    it('should handle non-Error objects', () => {
      const errorLike = { message: 'Something went wrong' }
      logger.error('Generic error', errorLike)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Specialized logging methods', () => {
    describe('stateChange()', () => {
      it('should log state transitions', () => {
        logger.stateChange('idle', 'active')
        expect(console.log).toHaveBeenCalled()
        const call = (console.log as any).mock.calls[0]
        expect(call[0]).toContain('State: idle → active')
      })

      it('should include context in state changes', () => {
        logger.stateChange('paused', 'running', 'useCountdown')
        expect(console.log).toHaveBeenCalled()
        const call = (console.log as any).mock.calls[0]
        expect(call[0]).toContain('[useCountdown]')
        expect(call[0]).toContain('State: paused → running')
      })
    })

    describe('performance()', () => {
      it('should log performance metrics', () => {
        logger.performance('saveState', 42)
        expect(console.log).toHaveBeenCalled()
        const call = (console.log as any).mock.calls[0]
        expect(call[0]).toContain('Performance: saveState took 42ms')
      })

      it('should include context in performance logs', () => {
        logger.performance('calculation', 15, 'useIntervals')
        expect(console.log).toHaveBeenCalled()
        const call = (console.log as any).mock.calls[0]
        expect(call[0]).toContain('[useIntervals]')
        expect(call[0]).toContain('Performance: calculation took 15ms')
      })
    })

    describe('persistence()', () => {
      it('should log persistence operations', () => {
        logger.persistence('State saved')
        expect(console.log).toHaveBeenCalled()
        const call = (console.log as any).mock.calls[0]
        expect(call[0]).toContain('[Timer][Storage]')
        expect(call[0]).toContain('Persistence: State saved')
      })

      it('should include data in persistence logs', () => {
        const saveData = { mode: 'countdown', duration: 600 }
        logger.persistence('State restored', saveData)
        expect(console.log).toHaveBeenCalled()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty messages', () => {
      logger.warn('')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should handle undefined context', () => {
      logger.debug('Test', { context: undefined })
      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toContain('[Timer]')
    })

    it('should handle null data', () => {
      logger.info('Test', { data: null })
      expect(console.info).toHaveBeenCalled()
    })

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000)
      logger.debug(longMessage)
      expect(console.log).toHaveBeenCalled()
      const call = (console.log as any).mock.calls[0]
      expect(call[0]).toBeDefined()
    })

    it('should handle special characters in messages', () => {
      const specialMessage = 'Test: 🎉 [Special] {chars} & more!'
      logger.info(specialMessage)
      expect(console.info).toHaveBeenCalled()
      const call = (console.info as any).mock.calls[0]
      expect(call[0]).toContain(specialMessage)
    })
  })

  describe('Integration scenarios', () => {
    it('should work in timer persistence flow', () => {
      // Simulate persistence operations
      logger.persistence('Starting save')
      logger.debug('Serializing state', { context: 'Persistence' })
      logger.persistence('State saved', { mode: 'countdown' })
      
      expect(console.log).toHaveBeenCalledTimes(3)
    })

    it('should work in error recovery flow', () => {
      // Simulate error scenario
      logger.warn('Invalid state detected', { context: 'Restore' })
      logger.error('Failed to parse state', new Error('Parse error'))
      logger.persistence('State cleared')
      
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid logging calls', () => {
      // Simulate many rapid logs
      for (let i = 0; i < 100; i++) {
        logger.debug(`Log ${i}`)
      }
      
      expect(console.log).toHaveBeenCalledTimes(100)
    })
  })

  describe('Production behavior', () => {
    it('should always log errors regardless of environment', () => {
      const error = new Error('Critical error')
      logger.error('System failure', error)
      
      // Errors should always be logged
      expect(console.error).toHaveBeenCalled()
    })

    it('should always log warnings regardless of environment', () => {
      logger.warn('Important warning')
      
      // Warnings should always be logged
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('Type safety', () => {
    it('should accept all valid log levels', () => {
      // These should not throw TypeScript errors
      expect(() => logger.debug('test')).not.toThrow()
      expect(() => logger.info('test')).not.toThrow()
      expect(() => logger.warn('test')).not.toThrow()
      expect(() => logger.error('test')).not.toThrow()
    })

    it('should accept optional parameters', () => {
      expect(() => logger.debug('test', { context: 'Test' })).not.toThrow()
      expect(() => logger.debug('test', { data: { key: 'value' } })).not.toThrow()
      expect(() => logger.debug('test', { context: 'Test', data: {} })).not.toThrow()
    })
  })
})
