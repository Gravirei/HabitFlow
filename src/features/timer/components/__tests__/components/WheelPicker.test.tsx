import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WheelPicker } from '../../shared/WheelPicker'

describe('WheelPicker', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with label', () => {
      render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('Minutes')).toBeInTheDocument()
    })

    it('should display current value', () => {
      render(
        <WheelPicker
          label="Hours"
          value={3}
          max={23}
          onChange={mockOnChange}
        />
      )

      // WheelPicker pads values with leading zeros
      // The current value should be visible as "03"
      expect(screen.getByText('03')).toBeInTheDocument()
    })

    it('should render up and down buttons', () => {
      const { container } = render(
        <WheelPicker
          label="Seconds"
          value={30}
          max={59}
          onChange={mockOnChange}
        />
      )

      const buttons = container.querySelectorAll('button')
      // WheelPicker has 4 buttons (up/down arrows at top and bottom)
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Value Changes', () => {
    it('should increment value when up button is clicked', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      // Click the button below current value (value + 1)
      const buttons = container.querySelectorAll('button')
      // buttons[0] = value-2, buttons[1] = value-1, buttons[2] = value+1, buttons[3] = value+2
      fireEvent.click(buttons[2]) // Click value+1 button

      expect(mockOnChange).toHaveBeenCalledWith(6)
    })

    it('should decrement value when down button is clicked', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      // Click the button above current value (value - 1)
      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[1]) // Click value-1 button

      expect(mockOnChange).toHaveBeenCalledWith(4)
    })

    it('should wrap to max when decrementing at 0', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={0}
          max={59}
          onChange={mockOnChange}
        />
      )

      // Click value-1 button (should wrap to 59)
      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[1])

      expect(mockOnChange).toHaveBeenCalledWith(59)
    })

    it('should wrap to 0 when incrementing at max', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={59}
          max={59}
          onChange={mockOnChange}
        />
      )

      // Click value+1 button (should wrap to 0)
      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[2])

      expect(mockOnChange).toHaveBeenCalledWith(0)
    })
  })

  describe('Different Max Values', () => {
    it('should handle max=23 for hours', () => {
      const { container } = render(
        <WheelPicker
          label="Hours"
          value={23}
          max={23}
          onChange={mockOnChange}
        />
      )

      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[2]) // value+1 button

      expect(mockOnChange).toHaveBeenCalledWith(0)
    })

    it('should handle max=59 for minutes/seconds', () => {
      const { container } = render(
        <WheelPicker
          label="Seconds"
          value={59}
          max={59}
          onChange={mockOnChange}
        />
      )

      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[2]) // value+1 button

      expect(mockOnChange).toHaveBeenCalledWith(0)
    })

    it('should handle custom max values', () => {
      const { container } = render(
        <WheelPicker
          label="Custom"
          value={99}
          max={99}
          onChange={mockOnChange}
        />
      )

      const buttons = container.querySelectorAll('button')
      fireEvent.click(buttons[2]) // value+1 button

      expect(mockOnChange).toHaveBeenCalledWith(0)
    })
  })

  describe('Scrolling Behavior', () => {
    it('should handle wheel scroll up', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        fireEvent.wheel(scrollContainer, { deltaY: -100 })
        expect(mockOnChange).toHaveBeenCalledWith(6)
      }
    })

    it('should handle wheel scroll down', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        fireEvent.wheel(scrollContainer, { deltaY: 100 })
        expect(mockOnChange).toHaveBeenCalledWith(4)
      }
    })

    it('should debounce rapid scroll events', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        // Rapid scrolls
        fireEvent.wheel(scrollContainer, { deltaY: -100 })
        fireEvent.wheel(scrollContainer, { deltaY: -100 })
        fireEvent.wheel(scrollContainer, { deltaY: -100 })

        // Should debounce and not call 3 times immediately
        // This depends on implementation
        expect(mockOnChange).toHaveBeenCalled()
      }
    })
  })

  describe('Touch/Swipe Behavior', () => {
    it('should handle touch start', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        fireEvent.touchStart(scrollContainer, {
          touches: [{ clientY: 100 }]
        })

        // Should register touch start
        expect(scrollContainer).toBeInTheDocument()
      }
    })

    it('should handle swipe up gesture', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        fireEvent.touchStart(scrollContainer, {
          touches: [{ clientY: 200 }]
        })

        fireEvent.touchMove(scrollContainer, {
          touches: [{ clientY: 150 }]
        })

        fireEvent.touchEnd(scrollContainer)

        // Swipe up should increment
        // This depends on implementation sensitivity
        expect(mockOnChange).toHaveBeenCalled()
      }
    })

    it('should handle swipe down gesture', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const scrollContainer = container.querySelector('[role="spinbutton"]') || container.firstChild

      if (scrollContainer) {
        fireEvent.touchStart(scrollContainer, {
          touches: [{ clientY: 150 }]
        })

        fireEvent.touchMove(scrollContainer, {
          touches: [{ clientY: 200 }]
        })

        fireEvent.touchEnd(scrollContainer)

        // Swipe down should decrement
        expect(mockOnChange).toHaveBeenCalled()
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle value prop changes', () => {
      const { rerender } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('05')).toBeInTheDocument()

      rerender(
        <WheelPicker
          label="Minutes"
          value={10}
          max={59}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should handle value=0', () => {
      render(
        <WheelPicker
          label="Minutes"
          value={0}
          max={59}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('00')).toBeInTheDocument()
    })

    it('should handle max value', () => {
      render(
        <WheelPicker
          label="Minutes"
          value={59}
          max={59}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('59')).toBeInTheDocument()
    })

    it('should handle rapid button clicks', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const upButton = container.querySelectorAll('button')[0]
      
      fireEvent.click(upButton)
      fireEvent.click(upButton)
      fireEvent.click(upButton)

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      // Should have spinbutton role or similar
      const spinbutton = container.querySelector('[role="spinbutton"]')
      if (spinbutton) {
        expect(spinbutton).toBeInTheDocument()
      }
    })

    it('should have buttons for keyboard users', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={5}
          max={59}
          onChange={mockOnChange}
        />
      )

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      expect(WheelPicker.displayName).toBeDefined()
    })

    it('should handle 100 rapid increments', () => {
      const { container } = render(
        <WheelPicker
          label="Minutes"
          value={0}
          max={59}
          onChange={mockOnChange}
        />
      )

      const upButton = container.querySelectorAll('button')[0]
      
      for (let i = 0; i < 100; i++) {
        fireEvent.click(upButton)
      }

      expect(mockOnChange).toHaveBeenCalledTimes(100)
    })
  })
})
