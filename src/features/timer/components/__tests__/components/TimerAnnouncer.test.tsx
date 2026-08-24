/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimerAnnouncer } from '../../shared/TimerAnnouncer'

describe('TimerAnnouncer', () => {
  describe('Rendering', () => {
    it('should render with message', () => {
      const { container } = render(<TimerAnnouncer message="Test announcement" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toBeInTheDocument()
      expect(announcer).toHaveTextContent('Test announcement')
    })

    it('should render empty message', () => {
      const { container } = render(<TimerAnnouncer message="" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toBeInTheDocument()
      expect(announcer).toHaveTextContent('')
    })
  })

  describe('ARIA Attributes', () => {
    it('should have role="status"', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toBeInTheDocument()
    })

    it('should have aria-live="polite" by default', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      const announcer = container.querySelector('[aria-live="polite"]')
      expect(announcer).toBeInTheDocument()
    })

    it('should support aria-live="assertive"', () => {
      const { container } = render(<TimerAnnouncer message="Test" priority="assertive" />)
      
      const announcer = container.querySelector('[aria-live="assertive"]')
      expect(announcer).toBeInTheDocument()
    })

    it('should have aria-atomic="true"', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      const announcer = container.querySelector('[aria-atomic="true"]')
      expect(announcer).toBeInTheDocument()
    })
  })

  describe('Visibility', () => {
    it('should have sr-only class for screen reader only visibility', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      const announcer = container.querySelector('.sr-only')
      expect(announcer).toBeInTheDocument()
    })

    it('should not be visible to sighted users', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveClass('sr-only')
    })
  })

  describe('Message Updates', () => {
    it('should update message when prop changes', () => {
      const { container, rerender } = render(<TimerAnnouncer message="First message" />)
      
      let announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('First message')
      
      rerender(<TimerAnnouncer message="Second message" />)
      
      announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Second message')
    })

    it('should handle multiple rapid updates', () => {
      const { container, rerender } = render(<TimerAnnouncer message="Message 1" />)
      
      rerender(<TimerAnnouncer message="Message 2" />)
      rerender(<TimerAnnouncer message="Message 3" />)
      rerender(<TimerAnnouncer message="Final message" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Final message')
    })
  })

  describe('Different Message Types', () => {
    it('should announce timer start', () => {
      const { container } = render(<TimerAnnouncer message="Countdown timer started for 5 minutes" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Countdown timer started for 5 minutes')
    })

    it('should announce timer pause', () => {
      const { container } = render(<TimerAnnouncer message="Stopwatch paused at 2 minutes 30 seconds" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Stopwatch paused at 2 minutes 30 seconds')
    })

    it('should announce lap recording', () => {
      const { container } = render(<TimerAnnouncer message="Lap 3 recorded: 1 minute 45 seconds" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Lap 3 recorded: 1 minute 45 seconds')
    })

    it('should announce interval transitions', () => {
      const { container } = render(<TimerAnnouncer message="Work complete. Break time: 5 minutes" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Work complete. Break time: 5 minutes')
    })

    it('should announce completion', () => {
      const { container } = render(<TimerAnnouncer message="Countdown completed!" />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent('Countdown completed!')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'This is a very long announcement that contains a lot of information about the timer state including the time remaining and the current interval and the loop number and the session name and all sorts of other details that might be useful to the user'
      
      const { container } = render(<TimerAnnouncer message={longMessage} />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent(longMessage)
    })

    it('should handle special characters', () => {
      const message = "Timer started: 5'30\" remaining!"
      
      const { container } = render(<TimerAnnouncer message={message} />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent(message)
    })

    it('should handle unicode characters', () => {
      const message = "Timer completed! 🎉"
      
      const { container } = render(<TimerAnnouncer message={message} />)
      
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toHaveTextContent(message)
    })
  })

  describe('Accessibility Compliance', () => {
    it('should meet WCAG 4.1.3 Status Messages requirement', () => {
      const { container } = render(<TimerAnnouncer message="Test" />)
      
      // Should have role="status" for status messages
      const announcer = container.querySelector('[role="status"]')
      expect(announcer).toBeInTheDocument()
      
      // Should have aria-live for automatic announcements
      expect(announcer).toHaveAttribute('aria-live')
      
      // Should have aria-atomic for complete message reading
      expect(announcer).toHaveAttribute('aria-atomic', 'true')
    })

    it('should be discoverable by assistive technologies', () => {
      render(<TimerAnnouncer message="Test announcement" />)
      
      // Should be findable by screen readers (not display: none or visibility: hidden)
      const announcer = screen.getByText('Test announcement')
      expect(announcer).toBeInTheDocument()
    })
  })
})
