/**
 * Tests for useReducedMotion hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from '../useReducedMotion'

describe('useReducedMotion', () => {
  let mockMatchMedia: any

  beforeEach(() => {
    // Mock window.matchMedia
    mockMatchMedia = vi.fn()
    window.matchMedia = mockMatchMedia
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false when user prefers motion (no-preference)', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
  })

  it('should return true when user prefers reduced motion', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(true)
  })

  it('should update when preference changes', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler
      },
      removeEventListener: vi.fn(),
    }))

    const { result, rerender } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)

    // Simulate preference change
    if (changeHandler) {
      changeHandler({ matches: true } as MediaQueryListEvent)
    }

    rerender()

    expect(result.current).toBe(true)
  })

  it('should handle legacy browsers with addListener', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: undefined, // Legacy browser doesn't have this
      addListener: (handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler
      },
      removeListener: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
    expect(changeHandler).toBeTruthy()
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListener = vi.fn()
    const removeListener = vi.fn()

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener,
      addListener: vi.fn(),
      removeListener,
    }))

    const { unmount } = renderHook(() => useReducedMotion())

    unmount()

    // Should call either modern or legacy cleanup
    expect(removeEventListener.mock.calls.length + removeListener.mock.calls.length).toBeGreaterThan(0)
  })

  it('should return false as default when matchMedia is not available', () => {
    // Mock matchMedia as undefined (very old browser)
    const originalMatchMedia = window.matchMedia
    // @ts-ignore
    window.matchMedia = undefined

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)

    // Restore matchMedia
    window.matchMedia = originalMatchMedia
  })
})
