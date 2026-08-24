/**
 * Error Messages Tests
 * 
 * Tests for centralized error message generation and formatting
 */

import { describe, it, expect, vi } from 'vitest'
import {
  getTimerErrorMessage,
  getStorageErrorMessage,
  getValidationErrorMessage,
  getNotificationErrorMessage,
  getSoundErrorMessage,
  getVibrationErrorMessage,
  formatErrorForUser,
  logError,
  ErrorCategory,
  ErrorSeverity
} from '../../utils/errorMessages'

describe('Error Messages', () => {
  describe('getTimerErrorMessage', () => {
    it('should return start error message', () => {
      const message = getTimerErrorMessage('START_FAILED')
      expect(message).toContain('Failed to start timer')
      expect(message).toBeTruthy()
    })

    it('should return pause error message', () => {
      const message = getTimerErrorMessage('PAUSE_FAILED')
      expect(message).toContain('pause')
      expect(message).toBeTruthy()
    })

    it('should return stop error message', () => {
      const message = getTimerErrorMessage('STOP_FAILED')
      expect(message).toContain('stop')
      expect(message).toBeTruthy()
    })

    it('should return reset error message', () => {
      const message = getTimerErrorMessage('RESET_FAILED')
      expect(message).toContain('reset')
      expect(message).toBeTruthy()
    })

    it('should return resume error message', () => {
      const message = getTimerErrorMessage('RESUME_FAILED')
      expect(message).toContain('resume')
      expect(message).toBeTruthy()
    })

    it('should return invalid state error message', () => {
      const message = getTimerErrorMessage('INVALID_STATE')
      expect(message).toContain('state')
      expect(message).toBeTruthy()
    })

    it('should return calculation error message', () => {
      const message = getTimerErrorMessage('CALCULATION_ERROR')
      expect(message).toContain('calculation')
      expect(message).toBeTruthy()
    })
  })

  describe('getStorageErrorMessage', () => {
    it('should return save error message', () => {
      const message = getStorageErrorMessage('SAVE_FAILED')
      expect(message).toContain('save')
      expect(message).toBeTruthy()
    })

    it('should return load error message', () => {
      const message = getStorageErrorMessage('LOAD_FAILED')
      expect(message).toContain('load')
      expect(message).toBeTruthy()
    })

    it('should return quota exceeded message', () => {
      const message = getStorageErrorMessage('QUOTA_EXCEEDED')
      expect(message).toContain('storage')
      expect(message).toContain('full')
    })

    it('should return parse error message', () => {
      const message = getStorageErrorMessage('PARSE_ERROR')
      expect(message).toContain('parse')
      expect(message).toBeTruthy()
    })

    it('should return corrupted data message', () => {
      const message = getStorageErrorMessage('CORRUPTED_DATA')
      expect(message).toContain('corrupted')
      expect(message).toBeTruthy()
    })

    it('should return unavailable message', () => {
      const message = getStorageErrorMessage('STORAGE_UNAVAILABLE')
      expect(message).toContain('unavailable')
      expect(message).toBeTruthy()
    })
  })

  describe('getValidationErrorMessage', () => {
    it('should return invalid duration message', () => {
      const message = getValidationErrorMessage('INVALID_DURATION')
      expect(message).toContain('duration')
      expect(message).toContain('invalid')
    })

    it('should return invalid interval message', () => {
      const message = getValidationErrorMessage('INVALID_INTERVAL')
      expect(message).toContain('interval')
      expect(message).toBeTruthy()
    })

    it('should return invalid preset message', () => {
      const message = getValidationErrorMessage('INVALID_PRESET')
      expect(message).toContain('preset')
      expect(message).toBeTruthy()
    })

    it('should return invalid history message', () => {
      const message = getValidationErrorMessage('INVALID_HISTORY_RECORD')
      expect(message).toContain('history')
      expect(message).toBeTruthy()
    })

    it('should return invalid mode message', () => {
      const message = getValidationErrorMessage('INVALID_MODE')
      expect(message).toContain('mode')
      expect(message).toBeTruthy()
    })

    it('should return out of range message', () => {
      const message = getValidationErrorMessage('OUT_OF_RANGE')
      expect(message).toContain('range')
      expect(message).toBeTruthy()
    })
  })

  describe('getNotificationErrorMessage', () => {
    it('should return permission denied message', () => {
      const message = getNotificationErrorMessage('PERMISSION_DENIED')
      expect(message).toContain('permission')
      expect(message).toContain('denied')
    })

    it('should return not supported message', () => {
      const message = getNotificationErrorMessage('NOT_SUPPORTED')
      expect(message).toContain('not supported')
      expect(message).toBeTruthy()
    })

    it('should return send failed message', () => {
      const message = getNotificationErrorMessage('SEND_FAILED')
      expect(message).toContain('send')
      expect(message).toContain('failed')
    })
  })

  describe('getSoundErrorMessage', () => {
    it('should return load failed message', () => {
      const message = getSoundErrorMessage('LOAD_FAILED')
      expect(message).toContain('load')
      expect(message).toContain('sound')
    })

    it('should return play failed message', () => {
      const message = getSoundErrorMessage('PLAY_FAILED')
      expect(message).toContain('play')
      expect(message).toBeTruthy()
    })

    it('should return not supported message', () => {
      const message = getSoundErrorMessage('NOT_SUPPORTED')
      expect(message).toContain('not supported')
      expect(message).toBeTruthy()
    })

    it('should return decode error message', () => {
      const message = getSoundErrorMessage('DECODE_ERROR')
      expect(message).toContain('decode')
      expect(message).toBeTruthy()
    })
  })

  describe('getVibrationErrorMessage', () => {
    it('should return not supported message', () => {
      const message = getVibrationErrorMessage('NOT_SUPPORTED')
      expect(message).toContain('not supported')
      expect(message).toBeTruthy()
    })

    it('should return trigger failed message', () => {
      const message = getVibrationErrorMessage('TRIGGER_FAILED')
      expect(message).toContain('vibration')
      expect(message).toContain('failed')
    })

    it('should return invalid pattern message', () => {
      const message = getVibrationErrorMessage('INVALID_PATTERN')
      expect(message).toContain('pattern')
      expect(message).toContain('invalid')
    })
  })

  describe('formatErrorForUser', () => {
    it('should format error with title and message', () => {
      const error = new Error('Test error')
      const formatted = formatErrorForUser(error, 'Test Title')
      
      expect(formatted.title).toBe('Test Title')
      expect(formatted.message).toContain('Test error')
    })

    it('should include category if provided', () => {
      const error = new Error('Test error')
      const formatted = formatErrorForUser(error, 'Test Title', ErrorCategory.TIMER)
      
      expect(formatted.category).toBe(ErrorCategory.TIMER)
    })

    it('should include severity if provided', () => {
      const error = new Error('Test error')
      const formatted = formatErrorForUser(error, 'Test Title', ErrorCategory.TIMER, ErrorSeverity.HIGH)
      
      expect(formatted.severity).toBe(ErrorSeverity.HIGH)
    })

    it('should handle errors without messages', () => {
      const error = new Error()
      const formatted = formatErrorForUser(error, 'Test Title')
      
      expect(formatted.title).toBe('Test Title')
      expect(formatted.message).toBeTruthy()
    })

    it('should sanitize error messages', () => {
      const error = new Error('Error with <script>alert("xss")</script>')
      const formatted = formatErrorForUser(error, 'Test Title')
      
      expect(formatted.message).not.toContain('<script>')
    })

    it('should truncate very long error messages', () => {
      const longMessage = 'a'.repeat(1000)
      const error = new Error(longMessage)
      const formatted = formatErrorForUser(error, 'Test Title')
      
      expect(formatted.message.length).toBeLessThan(longMessage.length)
    })
  })

  describe('logError', () => {
    it('should log error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      
      logError(error, 'Test context')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should include context in log', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      const context = 'Timer operation'
      
      logError(error, context)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(context),
        error,
        undefined
      )
      consoleSpy.mockRestore()
    })

    it('should handle errors without context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      
      logError(error)
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Error Categories', () => {
    it('should define timer category', () => {
      expect(ErrorCategory.TIMER).toBeDefined()
    })

    it('should define storage category', () => {
      expect(ErrorCategory.STORAGE).toBeDefined()
    })

    it('should define validation category', () => {
      expect(ErrorCategory.VALIDATION).toBeDefined()
    })

    it('should define notification category', () => {
      expect(ErrorCategory.NOTIFICATION).toBeDefined()
    })

    it('should define sound category', () => {
      expect(ErrorCategory.SOUND).toBeDefined()
    })

    it('should define vibration category', () => {
      expect(ErrorCategory.VIBRATION).toBeDefined()
    })
  })

  describe('Error Severities', () => {
    it('should define low severity', () => {
      expect(ErrorSeverity.LOW).toBeDefined()
    })

    it('should define medium severity', () => {
      expect(ErrorSeverity.MEDIUM).toBeDefined()
    })

    it('should define high severity', () => {
      expect(ErrorSeverity.HIGH).toBeDefined()
    })

    it('should define critical severity', () => {
      expect(ErrorSeverity.CRITICAL).toBeDefined()
    })
  })
})
