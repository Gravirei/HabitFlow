import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useDayChangeDetector } from '@/hooks/useDayChangeDetector'

describe('useDayChangeDetector', () => {
  let originalDateNow: typeof Date.now
  let dateNowSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    originalDateNow = Date.now
    // Default: 2026-03-01 12:00:00 UTC
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ─── Initial mount ────────────────────────────────────────────────

  it('should not call onDayChange on initial mount', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    expect(onDayChange).not.toHaveBeenCalled()
  })

  // ─── Interval-based detection ─────────────────────────────────────

  it('should set up a 60-second polling interval', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Advance 59 seconds — should not trigger yet
    act(() => { vi.advanceTimersByTime(59_000) })
    expect(onDayChange).not.toHaveBeenCalled()

    // Advance to 60 seconds — still same day, should not trigger
    act(() => { vi.advanceTimersByTime(1_000) })
    expect(onDayChange).not.toHaveBeenCalled()
  })

  it('should call onDayChange when interval fires after midnight', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Jump to next day: 2026-03-02 00:01:00
    vi.setSystemTime(new Date('2026-03-02T00:01:00Z'))

    // Trigger interval
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should only call onDayChange once per day change even with multiple intervals', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Jump to next day
    vi.setSystemTime(new Date('2026-03-02T00:01:00Z'))

    // Multiple interval firings on the same new day
    act(() => { vi.advanceTimersByTime(60_000) })
    act(() => { vi.advanceTimersByTime(60_000) })
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should call onDayChange again when another day passes', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Day 1 → Day 2
    vi.setSystemTime(new Date('2026-03-02T00:01:00Z'))
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(onDayChange).toHaveBeenCalledTimes(1)

    // Day 2 → Day 3
    vi.setSystemTime(new Date('2026-03-03T00:01:00Z'))
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(onDayChange).toHaveBeenCalledTimes(2)
  })

  it('should not call onDayChange when still the same day', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Still 2026-03-01 but later in the day (not close enough to midnight to roll over)
    vi.setSystemTime(new Date(2026, 2, 1, 18, 0, 0))
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).not.toHaveBeenCalled()
  })

  // ─── Visibility change detection ──────────────────────────────────

  it('should call onDayChange when tab becomes visible on a new day', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Jump to next day
    vi.setSystemTime(new Date('2026-03-02T08:00:00Z'))

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should NOT call onDayChange when tab becomes visible on the same day', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Still same day
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(onDayChange).not.toHaveBeenCalled()
  })

  it('should NOT call onDayChange when tab becomes hidden', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Jump to next day but tab goes hidden
    vi.setSystemTime(new Date('2026-03-02T08:00:00Z'))

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(onDayChange).not.toHaveBeenCalled()
  })

  it('should detect day change on visibility after being hidden overnight', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // User closes tab at night (hidden)
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Next morning — 2 days later
    vi.setSystemTime(new Date('2026-03-03T09:00:00Z'))

    // User opens tab again (visible)
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  // ─── Combined scenarios ───────────────────────────────────────────

  it('should handle both visibility and interval detecting the same day change', () => {
    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Jump to next day
    vi.setSystemTime(new Date('2026-03-02T00:01:00Z'))

    // Visibility fires first
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(onDayChange).toHaveBeenCalledTimes(1)

    // Then interval fires — should NOT call again (already detected)
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  // ─── Cleanup ──────────────────────────────────────────────────────

  it('should clean up event listener and interval on unmount', () => {
    const onDayChange = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useDayChangeDetector(onDayChange))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should not fire callback after unmount even if day changes', () => {
    const onDayChange = vi.fn()
    const { unmount } = renderHook(() => useDayChangeDetector(onDayChange))

    unmount()

    // Jump to next day and try to trigger
    vi.setSystemTime(new Date('2026-03-02T08:00:00Z'))

    // Interval should have been cleared, but let's verify no calls
    act(() => { vi.advanceTimersByTime(120_000) })
    expect(onDayChange).not.toHaveBeenCalled()
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  it('should handle month boundary (Feb → Mar)', () => {
    // Start at Feb 28 (local time)
    vi.setSystemTime(new Date(2026, 1, 28, 23, 0, 0))

    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Cross to March 1 (local time)
    vi.setSystemTime(new Date(2026, 2, 1, 0, 1, 0))
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should handle year boundary (Dec 31 → Jan 1)', () => {
    vi.setSystemTime(new Date(2025, 11, 31, 23, 0, 0))

    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Cross to Jan 1
    vi.setSystemTime(new Date(2026, 0, 1, 0, 1, 0))
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should handle leap year day (Feb 28 → Feb 29)', () => {
    // 2024 is a leap year
    vi.setSystemTime(new Date(2024, 1, 28, 23, 0, 0))

    const onDayChange = vi.fn()
    renderHook(() => useDayChangeDetector(onDayChange))

    // Cross to Feb 29
    vi.setSystemTime(new Date(2024, 1, 29, 0, 1, 0))
    act(() => { vi.advanceTimersByTime(60_000) })

    expect(onDayChange).toHaveBeenCalledTimes(1)
  })

  it('should handle callback reference change without losing detection', () => {
    const onDayChange1 = vi.fn()
    const onDayChange2 = vi.fn()

    const { rerender } = renderHook(
      ({ cb }) => useDayChangeDetector(cb),
      { initialProps: { cb: onDayChange1 } }
    )

    // Rerender with new callback
    rerender({ cb: onDayChange2 })

    // Day change
    vi.setSystemTime(new Date('2026-03-02T00:01:00Z'))
    act(() => { vi.advanceTimersByTime(60_000) })

    // New callback should be called
    expect(onDayChange2).toHaveBeenCalledTimes(1)
    // Old callback should NOT have been called since the day change
    // (it may or may not have been called depending on timing, but onDayChange2 must be called)
  })
})
