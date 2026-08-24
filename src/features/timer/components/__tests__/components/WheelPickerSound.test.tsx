/**
 * WheelPicker Tick Sound Tests
 * Comprehensive test suite for verifying tick sound plays in all interaction scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WheelPicker } from '../../shared/WheelPicker'
import { soundManager } from '../../utils/soundManager'

// Mock soundManager
vi.mock('../../utils/soundManager', () => ({
  soundManager: {
    playSound: vi.fn(),
    cleanup: vi.fn(),
  },
}))

describe('WheelPicker - Tick Sound Integration', () => {
  const defaultProps = {
    value: 5,
    onChange: vi.fn(),
    max: 59,
    label: 'Minutes',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Mouse Wheel Scrolling', () => {
    it('should play tick sound when scrolling up with mouse wheel', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate mouse wheel scroll up
      fireEvent.wheel(picker, { deltaY: -100 })
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound when scrolling down with mouse wheel', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate mouse wheel scroll down
      fireEvent.wheel(picker, { deltaY: 100 })
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound for each wheel notch during rapid scrolling', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate multiple rapid wheel scrolls
      fireEvent.wheel(picker, { deltaY: -100 })
      fireEvent.wheel(picker, { deltaY: -100 })
      fireEvent.wheel(picker, { deltaY: -100 })
      
      expect(soundManager.playSound).toHaveBeenCalledTimes(3)
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should NOT play tick sound when disabled', () => {
      render(<WheelPicker {...defaultProps} disabled={true} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      fireEvent.wheel(picker, { deltaY: -100 })
      
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })
  })

  describe('Mouse Drag Interaction', () => {
    it('should play tick sound when dragging up (increasing value)', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate drag up
      fireEvent.mouseDown(picker, { clientY: 100 })
      fireEvent.mouseMove(picker, { clientY: 50 }) // Move up 50px (more than threshold)
      fireEvent.mouseUp(picker)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should play tick sound when dragging down (decreasing value)', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate drag down
      fireEvent.mouseDown(picker, { clientY: 50 })
      fireEvent.mouseMove(picker, { clientY: 100 }) // Move down 50px
      fireEvent.mouseUp(picker)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should NOT play tick sound for small movements below threshold', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Small movement (below itemHeight / 2 threshold)
      fireEvent.mouseDown(picker, { clientY: 100 })
      fireEvent.mouseMove(picker, { clientY: 95 }) // Only 5px movement
      fireEvent.mouseUp(picker)
      
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })

    it('should NOT play tick sound when disabled during drag', () => {
      render(<WheelPicker {...defaultProps} disabled={true} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      fireEvent.mouseDown(picker, { clientY: 100 })
      fireEvent.mouseMove(picker, { clientY: 50 })
      fireEvent.mouseUp(picker)
      
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })
  })

  describe('Touch Drag Interaction', () => {
    it('should play tick sound when touch dragging up', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate touch drag up
      fireEvent.touchStart(picker, { touches: [{ clientY: 100 }] })
      fireEvent.touchMove(picker, { touches: [{ clientY: 50 }] })
      fireEvent.touchEnd(picker)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should play tick sound when touch dragging down', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Simulate touch drag down
      fireEvent.touchStart(picker, { touches: [{ clientY: 50 }] })
      fireEvent.touchMove(picker, { touches: [{ clientY: 100 }] })
      fireEvent.touchEnd(picker)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should NOT play tick sound when disabled during touch', () => {
      render(<WheelPicker {...defaultProps} disabled={true} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      fireEvent.touchStart(picker, { touches: [{ clientY: 100 }] })
      fireEvent.touchMove(picker, { touches: [{ clientY: 50 }] })
      fireEvent.touchEnd(picker)
      
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })
  })

  describe('Button Click Interactions', () => {
    it('should play tick sound when clicking +1 button', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      // Find the +1 button (next value button)
      const nextButton = screen.getByRole('button', { name: /set minutes to 6/i })
      
      fireEvent.click(nextButton)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound when clicking -1 button', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      // Find the -1 button (previous value button)
      const prevButton = screen.getByRole('button', { name: /set minutes to 4/i })
      
      fireEvent.click(prevButton)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound when clicking +2 button', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      // Find the +2 button (2 steps ahead)
      const plus2Button = screen.getByRole('button', { name: /set minutes to 7/i })
      
      fireEvent.click(plus2Button)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound when clicking -2 button', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      // Find the -2 button (2 steps back)
      const minus2Button = screen.getByRole('button', { name: /set minutes to 3/i })
      
      fireEvent.click(minus2Button)
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
    })

    it('should play tick sound for rapid button clicks', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      const nextButton = screen.getByRole('button', { name: /set minutes to 6/i })
      
      // Rapid clicks
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)
      
      expect(soundManager.playSound).toHaveBeenCalledTimes(3)
    })

    it('should NOT play tick sound when buttons disabled', () => {
      render(<WheelPicker {...defaultProps} disabled={true} value={5} />)
      
      const nextButton = screen.getByRole('button', { name: /set minutes to 6/i })
      
      fireEvent.click(nextButton)
      
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })
  })

  describe('Manual Input (Click to Edit)', () => {
    it('should NOT play tick sound when clicking to enter edit mode', () => {
      render(<WheelPicker {...defaultProps} value={5} />)
      
      // Find the main display value by title
      const displayValue = screen.getByTitle('Click to edit or use arrow keys')
      
      fireEvent.click(displayValue)
      
      // Sound should NOT play for entering edit mode
      // Note: Manual input via clicking and typing doesn't trigger sound
      // Only scroll/drag/button interactions trigger sound
      expect(soundManager.playSound).not.toHaveBeenCalled()
    })
  })

  describe('Sound Configuration', () => {
    it('should always use "tick" sound type', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      fireEvent.wheel(picker, { deltaY: -100 })
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', expect.any(Number))
      const [soundType] = (soundManager.playSound as any).mock.calls[0]
      expect(soundType).toBe('tick')
    })

    it('should use volume of 20 for all interactions', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      fireEvent.wheel(picker, { deltaY: -100 })
      
      const [, volume] = (soundManager.playSound as any).mock.calls[0]
      expect(volume).toBe(20)
    })
  })

  describe('Edge Cases', () => {
    it('should handle value wrapping at max boundary with sound', () => {
      render(<WheelPicker {...defaultProps} value={59} max={59} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Scroll up past max (should wrap to 0)
      fireEvent.wheel(picker, { deltaY: -100 })
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should handle value wrapping at min boundary with sound', () => {
      render(<WheelPicker {...defaultProps} value={0} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Scroll down past min (should wrap to max)
      fireEvent.wheel(picker, { deltaY: 100 })
      
      expect(soundManager.playSound).toHaveBeenCalledWith('tick', 20)
    })

    it('should play sound even with very fast interactions', () => {
      const onChange = vi.fn()
      render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Multiple rapid interactions
      for (let i = 0; i < 10; i++) {
        fireEvent.wheel(picker, { deltaY: -100 })
      }
      
      expect(soundManager.playSound).toHaveBeenCalledTimes(10)
    })

    it('should not accumulate sound calls or memory leaks', () => {
      const onChange = vi.fn()
      const { unmount } = render(<WheelPicker {...defaultProps} onChange={onChange} />)
      
      const picker = screen.getByRole('group', { name: /minutes picker/i })
      
      // Multiple interactions
      fireEvent.wheel(picker, { deltaY: -100 })
      fireEvent.wheel(picker, { deltaY: -100 })
      
      const callCount = (soundManager.playSound as any).mock.calls.length
      
      unmount()
      
      // Should not have additional calls after unmount
      expect((soundManager.playSound as any).mock.calls.length).toBe(callCount)
    })
  })

  describe('Multiple WheelPickers', () => {
    it('should play sounds independently for multiple pickers', () => {
      render(
        <>
          <WheelPicker value={5} onChange={vi.fn()} max={59} label="Minutes" />
          <WheelPicker value={30} onChange={vi.fn()} max={59} label="Seconds" />
        </>
      )
      
      const minutesPicker = screen.getByRole('group', { name: /minutes picker/i })
      const secondsPicker = screen.getByRole('group', { name: /seconds picker/i })
      
      fireEvent.wheel(minutesPicker, { deltaY: -100 })
      expect(soundManager.playSound).toHaveBeenCalledTimes(1)
      
      fireEvent.wheel(secondsPicker, { deltaY: -100 })
      expect(soundManager.playSound).toHaveBeenCalledTimes(2)
    })
  })
})
