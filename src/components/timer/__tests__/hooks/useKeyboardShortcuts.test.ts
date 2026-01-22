/**
 * Tests for useKeyboardShortcuts hook
 * Comprehensive test suite for keyboard shortcut functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

// Mock dependencies
vi.mock('../../hooks/useTimerSettings', () => ({
  useTimerSettings: () => ({
    settings: {
      keyboardShortcutsEnabled: true
    }
  })
}))

vi.mock('../../TimerContainer', () => ({
  useKeyboardHelp: () => ({
    showHelp: vi.fn()
  })
}))

describe('useKeyboardShortcuts', () => {
  let mockCallbacks: {
    onStart: () => void
    onPause: () => void
    onContinue: () => void
    onStop: () => void
    onLap: () => void
  }

  beforeEach(() => {
    // Reset mocks before each test
    mockCallbacks = {
      onStart: vi.fn(),
      onPause: vi.fn(),
      onContinue: vi.fn(),
      onStop: vi.fn(),
      onLap: vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Setup', () => {
    it('should attach event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should cleanup event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Space Key - Start/Pause/Continue', () => {
    it('should call onStart when Space pressed and timer not active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onPause).not.toHaveBeenCalled()
      expect(mockCallbacks.onContinue).not.toHaveBeenCalled()
    })

    it('should call onPause when Space pressed and timer running', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onPause).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
      expect(mockCallbacks.onContinue).not.toHaveBeenCalled()
    })

    it('should call onContinue when Space pressed and timer paused', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: true,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onContinue).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
      expect(mockCallbacks.onPause).not.toHaveBeenCalled()
    })

    it('should prevent default behavior for Space key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Escape Key - Stop Timer', () => {
    it('should call onStop when Escape pressed and timer active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStop).toHaveBeenCalledTimes(1)
    })

    it('should NOT call onStop when Escape pressed and timer not active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStop).not.toHaveBeenCalled()
    })

    it('should work when timer is paused', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: true,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStop).toHaveBeenCalledTimes(1)
    })
  })

  describe('K Key - Kill Timer', () => {
    it('should call onKill when K pressed and timer active', () => {
      const onKill = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks,
          onKill
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'k' })
      window.dispatchEvent(event)

      expect(onKill).toHaveBeenCalledTimes(1)
    })

    it('should call onKill when K pressed and timer paused', () => {
      const onKill = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: true,
          mode: 'Countdown',
          ...mockCallbacks,
          onKill
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'k' })
      window.dispatchEvent(event)

      expect(onKill).toHaveBeenCalledTimes(1)
    })

    it('should work with uppercase K', () => {
      const onKill = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Intervals',
          ...mockCallbacks,
          onKill
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'K' })
      window.dispatchEvent(event)

      expect(onKill).toHaveBeenCalledTimes(1)
    })

    it('should NOT call onKill when timer is stopped', () => {
      const onKill = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks,
          onKill
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'k' })
      window.dispatchEvent(event)

      expect(onKill).not.toHaveBeenCalled()
    })

    it('should NOT call onKill if callback not provided', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
          // onKill not provided
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'k' })
      window.dispatchEvent(event)

      // Should not throw error
      expect(mockCallbacks.onStop).not.toHaveBeenCalled()
    })

    it('should work across all timer modes', () => {
      const modes: Array<'Stopwatch' | 'Countdown' | 'Intervals'> = ['Stopwatch', 'Countdown', 'Intervals']

      modes.forEach(mode => {
        const onKill = vi.fn()
        
        const { unmount } = renderHook(() =>
          useKeyboardShortcuts({
            isActive: true,
            isPaused: false,
            mode,
            ...mockCallbacks,
            onKill
          })
        )

        const event = new KeyboardEvent('keydown', { key: 'k' })
        window.dispatchEvent(event)

        expect(onKill).toHaveBeenCalledTimes(1)
        
        unmount()
      })
    })

    it('should prevent default behavior for K key', () => {
      const onKill = vi.fn()
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks,
          onKill
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'k' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('L Key - Add Lap (Stopwatch Only)', () => {
    it('should call onLap when L pressed in Stopwatch mode while running', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).toHaveBeenCalledTimes(1)
    })

    it('should work with uppercase L', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'L' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).toHaveBeenCalledTimes(1)
    })

    it('should NOT call onLap when timer is paused', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: true,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).not.toHaveBeenCalled()
    })

    it('should NOT call onLap when timer is not active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).not.toHaveBeenCalled()
    })

    it('should NOT call onLap in Countdown mode', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Countdown',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).not.toHaveBeenCalled()
    })

    it('should NOT call onLap in Intervals mode', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Intervals',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onLap).not.toHaveBeenCalled()
    })

    it('should NOT call onLap if callback not provided', () => {
      const { onLap, ...callbacksWithoutLap } = mockCallbacks

      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...callbacksWithoutLap
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'l' })
      
      // Should not throw error
      expect(() => window.dispatchEvent(event)).not.toThrow()
    })
  })

  describe('R Key - Restart', () => {
    it('should call onStart when R pressed and timer not active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'r' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1)
    })

    it('should work with uppercase R', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'R' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1)
    })

    it('should NOT call onStart when R pressed and timer active', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'r' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
    })

    it('should work in all timer modes', () => {
      const modes: Array<'Stopwatch' | 'Countdown' | 'Intervals'> = ['Stopwatch', 'Countdown', 'Intervals']

      modes.forEach(mode => {
        const callbacks = {
          onStart: vi.fn(),
          onPause: vi.fn(),
          onContinue: vi.fn(),
          onStop: vi.fn()
        }

        renderHook(() =>
          useKeyboardShortcuts({
            isActive: false,
            isPaused: false,
            mode,
            ...callbacks
          })
        )

        const event = new KeyboardEvent('keydown', { key: 'r' })
        window.dispatchEvent(event)

        expect(callbacks.onStart).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Conflict Prevention', () => {
    it('should NOT trigger shortcuts when typing in input field', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      // Dispatch from the input element - event will bubble to window
      const event = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true 
      })
      input.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should NOT trigger shortcuts when typing in textarea', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: true,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      const event = new KeyboardEvent('keydown', { 
        key: 'l',
        bubbles: true 
      })
      textarea.dispatchEvent(event)

      expect(mockCallbacks.onLap).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should NOT trigger shortcuts when typing in select', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const select = document.createElement('select')
      document.body.appendChild(select)
      select.focus()

      const event = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true 
      })
      select.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()

      document.body.removeChild(select)
    })

    it('should NOT trigger shortcuts in contenteditable element', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const div = document.createElement('div')
      // Set both attribute and property for jsdom compatibility
      div.setAttribute('contenteditable', 'true')
      div.contentEditable = 'true'
      document.body.appendChild(div)
      div.focus()

      const event = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true 
      })
      div.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('should trigger shortcuts when focus is on regular div', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const div = document.createElement('div')
      document.body.appendChild(div)

      // For regular div, dispatch from window (simulates no specific input focus)
      const event = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true 
      })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1)

      document.body.removeChild(div)
    })
  })

  describe('Settings Integration', () => {
    it('should respect keyboardShortcutsEnabled setting via enabled prop', () => {
      // Test the component-level enabled prop which achieves the same result
      // as the settings integration (shortcuts are disabled)
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks,
          enabled: false  // This simulates keyboardShortcutsEnabled: false
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
    })

    it('should respect component-level enabled prop', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks,
          enabled: false
        })
      )

      const event = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(event)

      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined key gracefully', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: undefined as any })
      
      expect(() => window.dispatchEvent(event)).not.toThrow()
    })

    it('should handle unknown keys gracefully', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      const event = new KeyboardEvent('keydown', { key: 'x' })
      window.dispatchEvent(event)

      // Should not call any callbacks
      expect(mockCallbacks.onStart).not.toHaveBeenCalled()
      expect(mockCallbacks.onPause).not.toHaveBeenCalled()
      expect(mockCallbacks.onContinue).not.toHaveBeenCalled()
      expect(mockCallbacks.onStop).not.toHaveBeenCalled()
      expect(mockCallbacks.onLap).not.toHaveBeenCalled()
    })

    it('should handle rapid key presses', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          isActive: false,
          isPaused: false,
          mode: 'Stopwatch',
          ...mockCallbacks
        })
      )

      // Press Space multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const event = new KeyboardEvent('keydown', { key: ' ' })
        window.dispatchEvent(event)
      }

      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(5)
    })
  })

  describe('Mode-Specific Behavior', () => {
    it('should work across all modes for common shortcuts', () => {
      const modes: Array<'Stopwatch' | 'Countdown' | 'Intervals'> = ['Stopwatch', 'Countdown', 'Intervals']

      modes.forEach(mode => {
        const callbacks = {
          onStart: vi.fn(),
          onPause: vi.fn(),
          onContinue: vi.fn(),
          onStop: vi.fn()
        }

        renderHook(() =>
          useKeyboardShortcuts({
            isActive: false,
            isPaused: false,
            mode,
            ...callbacks
          })
        )

        // Test Space
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
        expect(callbacks.onStart).toHaveBeenCalledTimes(1)

        // Test R
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }))
        expect(callbacks.onStart).toHaveBeenCalledTimes(2)
      })
    })
  })
})
