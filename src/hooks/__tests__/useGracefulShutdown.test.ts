/**
 * useGracefulShutdown tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGracefulShutdown } from '@/hooks/useGracefulShutdown'

describe('useGracefulShutdown', () => {
  let cleanup: () => void

  beforeEach(() => {
    cleanup = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not call cleanup on mount', () => {
    renderHook(() => useGracefulShutdown(cleanup))
    expect(cleanup).not.toHaveBeenCalled()
  })

  it('calls cleanup on beforeunload', () => {
    renderHook(() => useGracefulShutdown(cleanup))
    window.dispatchEvent(new Event('beforeunload'))
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('calls cleanup when document becomes hidden', () => {
    renderHook(() => useGracefulShutdown(cleanup))
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('does NOT call cleanup when document becomes visible', () => {
    renderHook(() => useGracefulShutdown(cleanup))
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(cleanup).not.toHaveBeenCalled()
  })

  it('swallows errors thrown by cleanup so shutdown never breaks', () => {
    const broken = vi.fn(() => {
      throw new Error('boom')
    }) as unknown as () => void
    renderHook(() => useGracefulShutdown(broken))
    expect(() => window.dispatchEvent(new Event('beforeunload'))).not.toThrow()
    expect(broken).toHaveBeenCalledTimes(1)
  })

  it('uses the latest cleanup function after re-render', () => {
    const first = vi.fn() as unknown as () => void
    const second = vi.fn() as unknown as () => void
    const { rerender } = renderHook(({ fn }: { fn: () => void }) => useGracefulShutdown(fn), {
      initialProps: { fn: first },
    })
    rerender({ fn: second })
    window.dispatchEvent(new Event('beforeunload'))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
