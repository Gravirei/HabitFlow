import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnimatedTimerButton } from '../../shared/AnimatedTimerButton'

describe('AnimatedTimerButton', () => {
  const mockHandlers = {
    onStart: vi.fn(),
    onPause: vi.fn(),
    onContinue: vi.fn(),
    onKill: vi.fn(),
    onLap: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State (Idle)', () => {
    it('should render start button when not active', () => {
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Start Timer')).toBeInTheDocument()
    })

    it('should call onStart when start button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Start Timer'))
      expect(mockHandlers.onStart).toHaveBeenCalledTimes(1)
    })

    it('should disable start button when disabled prop is true', () => {
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          disabled={true}
          {...mockHandlers}
        />
      )

      const button = screen.getByText('Start Timer')
      expect(button).toBeDisabled()
    })
  })

  describe('Active State (Running)', () => {
    it('should render pause button when active', () => {
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Pause')).toBeInTheDocument()
      expect(screen.queryByText('Start Timer')).not.toBeInTheDocument()
    })

    it('should call onPause when pause button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Pause'))
      expect(mockHandlers.onPause).toHaveBeenCalledTimes(1)
    })

    it('should show lap button in Stopwatch mode', () => {
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          mode="Stopwatch"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Lap')).toBeInTheDocument()
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })

    it('should not show lap button in Countdown mode', () => {
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          mode="Countdown"
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Lap')).not.toBeInTheDocument()
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })

    it('should not show lap button in Intervals mode', () => {
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          mode="Intervals"
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('Lap')).not.toBeInTheDocument()
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })

    it('should call onLap when lap button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          mode="Stopwatch"
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Lap'))
      expect(mockHandlers.onLap).toHaveBeenCalledTimes(1)
    })
  })

  describe('Paused State', () => {
    it('should render continue and kill buttons when paused', () => {
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.getByText('Kill')).toBeInTheDocument()
      expect(screen.queryByText('Start Timer')).not.toBeInTheDocument()
    })

    it('should call onContinue when continue button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Continue'))
      expect(mockHandlers.onContinue).toHaveBeenCalledTimes(1)
    })

    it('should show kill confirmation modal when kill button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Kill'))

      await waitFor(() => {
        expect(screen.getByText('Stop Timer?')).toBeInTheDocument()
      })
    })
  })

  describe('Kill Confirmation Modal', () => {
    it('should show modal with correct content', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Kill'))

      await waitFor(() => {
        expect(screen.getByText('Stop Timer?')).toBeInTheDocument()
        expect(screen.getByText('This will end your current session')).toBeInTheDocument()
        expect(screen.getByText('Keep this record in history?')).toBeInTheDocument()
        expect(screen.getByText('No')).toBeInTheDocument()
        expect(screen.getByText('Yes, Save')).toBeInTheDocument()
      })
    })

    it('should call onKill with true when "Yes, Save" is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Kill'))
      
      await waitFor(() => {
        expect(screen.getByText('Yes, Save')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Yes, Save'))

      expect(mockHandlers.onKill).toHaveBeenCalledWith(true)
    })

    it('should call onKill with false when "No" is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Kill'))
      
      await waitFor(() => {
        expect(screen.getByText('No')).toBeInTheDocument()
      })

      await user.click(screen.getByText('No'))

      expect(mockHandlers.onKill).toHaveBeenCalledWith(false)
    })

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('Kill'))
      
      await waitFor(() => {
        expect(screen.getByText('Stop Timer?')).toBeInTheDocument()
      })

      // Click backdrop (div with backdrop class)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/60')
      if (backdrop) {
        await user.click(backdrop as Element)
      }

      await waitFor(() => {
        expect(screen.queryByText('Stop Timer?')).not.toBeInTheDocument()
      })

      expect(mockHandlers.onKill).not.toHaveBeenCalled()
    })
  })

  describe('State Transitions', () => {
    it('should handle idle -> active transition', async () => {
      const { rerender } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Start Timer')).toBeInTheDocument()

      rerender(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          {...mockHandlers}
        />
      )

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument()
      })
    })

    it('should handle active -> paused transition', async () => {
      const { rerender } = render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Pause')).toBeInTheDocument()

      rerender(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Continue')).toBeInTheDocument()
        expect(screen.getByText('Kill')).toBeInTheDocument()
      })
    })

    it('should handle paused -> active transition', async () => {
      const { rerender } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Continue')).toBeInTheDocument()

      rerender(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          {...mockHandlers}
        />
      )

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument()
      })
    })

    it('should handle paused -> idle transition (after kill)', async () => {
      const { rerender } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Continue')).toBeInTheDocument()

      rerender(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Start Timer')).toBeInTheDocument()
      })
    })
  })

  describe('Inline vs Fixed Layout', () => {
    it('should use inline layout by default', () => {
      const { container } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      const wrapper = container.querySelector('.w-full.px-6.py-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('should use fixed layout when inline is false', () => {
      const { container } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          inline={false}
          {...mockHandlers}
        />
      )

      const wrapper = container.querySelector('.fixed.bottom-0')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button elements', () => {
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      const button = screen.getByText('Start Timer')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      const button = screen.getByText('Start Timer')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(mockHandlers.onStart).toHaveBeenCalled()
    })

    it('should handle multiple buttons with keyboard', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          {...mockHandlers}
        />
      )

      // Tab to continue button and activate
      await user.tab()
      await user.keyboard('{Enter}')
      
      expect(mockHandlers.onContinue).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup()
      render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          {...mockHandlers}
        />
      )

      const button = screen.getByText('Start Timer')
      
      // Click multiple times rapidly
      await user.click(button)
      await user.click(button)
      await user.click(button)

      // Should only register legitimate clicks based on state
      expect(mockHandlers.onStart).toHaveBeenCalled()
    })

    it('should not break with missing onLap handler', () => {
      const { onLap, ...handlersWithoutLap } = mockHandlers
      
      render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          mode="Stopwatch"
          {...handlersWithoutLap}
        />
      )

      // Should still render lap button even without handler
      expect(screen.getByText('Lap')).toBeInTheDocument()
    })
  })
})
