/**
 * useDeviceType Hook Tests
 * Tests for device detection functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDeviceType, useIsMobile, useIsDesktop, useIsTablet } from '../useDeviceType'

describe('useDeviceType', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Reset to desktop defaults
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  describe('useDeviceType', () => {
    it('should detect desktop device (width >= 1024)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { result } = renderHook(() => useDeviceType())
      expect(result.current).toBe('desktop')
    })

    it('should detect tablet device (768 <= width < 1024)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useDeviceType())
      expect(result.current).toBe('tablet')
    })

    it('should detect mobile device (width < 768)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { result } = renderHook(() => useDeviceType())
      expect(result.current).toBe('mobile')
    })
  })

  describe('useIsMobile', () => {
    it('should return false for desktop device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })

    it('should return true for mobile device with small screen and touch', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it('should return true for mobile user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })
  })

  describe('useIsDesktop', () => {
    it('should return true for desktop device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { result } = renderHook(() => useIsDesktop())
      expect(result.current).toBe(true)
    })

    it('should return false for mobile device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { result } = renderHook(() => useIsDesktop())
      expect(result.current).toBe(false)
    })
  })

  describe('useIsTablet', () => {
    it('should return true for tablet device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useIsTablet())
      expect(result.current).toBe(true)
    })

    it('should return false for desktop device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { result } = renderHook(() => useIsTablet())
      expect(result.current).toBe(false)
    })
  })
})
