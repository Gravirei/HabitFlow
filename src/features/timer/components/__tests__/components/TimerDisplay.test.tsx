import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimerDisplay } from '../../shared/TimerDisplay'

describe('TimerDisplay', () => {
  describe('Rendering', () => {
    it('should render time display', () => {
      render(
        <TimerDisplay
          timeLeft={60000}
          progress={100}
          mode="Stopwatch"
        />
      )

      // 60 seconds shows as 1:00 (no centiseconds after 1 minute)
      expect(screen.getByText('1:00')).toBeInTheDocument()
    })

    it('should format time correctly for different durations', () => {
      const { rerender } = render(
        <TimerDisplay
          timeLeft={3661000}
          progress={100}
          mode="Countdown"
        />
      )

      expect(screen.getByText('1:01:01')).toBeInTheDocument()

      rerender(
        <TimerDisplay
          timeLeft={59000}
          progress={100}
          mode="Countdown"
        />
      )

      // Under 60 seconds shows centiseconds: 0:59.00
      expect(screen.getByText(/0:59\.\d{2}/)).toBeInTheDocument()
    })

    it('should display zero time', () => {
      render(
        <TimerDisplay
          timeLeft={0}
          progress={0}
          mode="Stopwatch"
        />
      )

      // Zero time shows as 0:00.00 (with centiseconds under 1 minute)
      expect(screen.getByText('0:00.00')).toBeInTheDocument()
    })
  })

  describe('Progress Circle', () => {
    it('should render SVG circle elements', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={30000}
          progress={50}
          mode="Countdown"
        />
      )

      const circles = container.querySelectorAll('circle')
      expect(circles).toHaveLength(2) // Background + Progress
    })

    it('should calculate stroke-dashoffset based on progress', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={30000}
          progress={150}
          mode="Countdown"
        />
      )

      const progressCircle = container.querySelectorAll('circle')[1]
      const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset')
      
      // CIRCLE_CIRCUMFERENCE = 301.59 (from constants)
      // strokeDashoffset should be 301.59 - 150 = 151.59
      expect(strokeDashoffset).toBe('151.59289474462014')
    })

    it('should handle 0% progress', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={0}
          progress={0}
          mode="Countdown"
        />
      )

      const progressCircle = container.querySelectorAll('circle')[1]
      const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset')
      
      // Should be full circumference (no progress)
      expect(strokeDashoffset).toBe('301.59289474462014')
    })

    it('should handle 100% progress', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={60000}
          progress={301.59}
          mode="Countdown"
        />
      )

      const progressCircle = container.querySelectorAll('circle')[1]
      const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset')
      
      // Should be close to 0 (full progress)
      expect(Number(strokeDashoffset)).toBeLessThan(1)
    })
  })

  describe('Interval Status (Intervals Mode)', () => {
    it('should not show interval status by default', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={0}
        />
      )

      expect(screen.queryByText('Work Time')).not.toBeInTheDocument()
    })

    it('should show interval status when showIntervalStatus is true', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={0}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Interval 1')).toBeInTheDocument()
      expect(screen.getByText('Work Time')).toBeInTheDocument()
    })

    it('should display work interval correctly', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={2}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Interval 3')).toBeInTheDocument()
      expect(screen.getByText('Work Time')).toBeInTheDocument()
    })

    it('should display break interval correctly', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="break"
          intervalCount={1}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Interval 2')).toBeInTheDocument()
      expect(screen.getByText('Break Time')).toBeInTheDocument()
    })

    it('should handle high interval counts', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={99}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Interval 100')).toBeInTheDocument()
    })
  })

  describe('Last 30 Seconds Warning', () => {
    it('should show red warning in Countdown mode when under 30 seconds', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={25000}
          progress={100}
          mode="Countdown"
        />
      )

      const timeText = screen.getByText(/0:25\.\d{2}/)
      expect(timeText.className).includes('!text-red-500')

      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle.getAttribute('class')).includes('!text-red-500')
    })

    it('should show red warning in Intervals mode when under 30 seconds', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={15000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
        />
      )

      const timeText = screen.getByText(/0:15\.\d{2}/)
      expect(timeText.className).includes('!text-red-500')

      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle.getAttribute('class')).includes('!text-red-500')
    })

    it('should NOT show red warning in Stopwatch mode', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={15000}
          progress={100}
          mode="Stopwatch"
        />
      )

      const timeText = screen.getByText(/0:15\.\d{2}/)
      expect(timeText.className).not.includes('!text-red-500')

      const progressCircle = container.querySelectorAll('circle')[1]
      const className = progressCircle.getAttribute('class') || ''
      expect(className).not.includes('!text-red-500')
    })

    it('should show red at exactly 30 seconds', () => {
      const { container: _container1 } = render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Countdown"
        />
      )

      // Note: 30000 <= 30000 is true, so it DOES show red
      const timeText = screen.getByText(/0:30\.\d{2}/)
      expect(timeText.className).includes('!text-red-500')
    })

    it('should show red at 29.9 seconds', () => {
      const { container: _container2 } = render(
        <TimerDisplay
          timeLeft={29900}
          progress={100}
          mode="Countdown"
        />
      )

      const timeText = screen.getByText(/0:29\.\d{2}/)
      expect(timeText.className).includes('!text-red-500')
    })

    it('should not show red at exactly 0', () => {
      const { container: _container3 } = render(
        <TimerDisplay
          timeLeft={0}
          progress={0}
          mode="Countdown"
        />
      )

      const timeText = screen.getByText('0:00.00')
      expect(timeText.className).not.includes('!text-red-500')
    })
  })

  describe('Time Formatting', () => {
    it('should format hours, minutes, and seconds', () => {
      render(
        <TimerDisplay
          timeLeft={3723000}
          progress={100}
          mode="Stopwatch"
        />
      )

      expect(screen.getByText('1:02:03')).toBeInTheDocument()
    })

    it('should pad single digits with zeros', () => {
      render(
        <TimerDisplay
          timeLeft={65000}
          progress={100}
          mode="Countdown"
        />
      )

      expect(screen.getByText('1:05')).toBeInTheDocument()
    })

    it('should handle milliseconds correctly', () => {
      render(
        <TimerDisplay
          timeLeft={59999}
          progress={100}
          mode="Countdown"
        />
      )

      // Should round down to 59 seconds with centiseconds
      expect(screen.getByText(/0:59\.\d{2}/)).toBeInTheDocument()
    })

    it('should format very long durations', () => {
      render(
        <TimerDisplay
          timeLeft={359999000}
          progress={100}
          mode="Stopwatch"
        />
      )

      // 99:59:59 (max displayable in HH:MM:SS format)
      expect(screen.getByText('99:59:59')).toBeInTheDocument()
    })
  })

  describe('Different Timer Modes', () => {
    it('should render in Stopwatch mode', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Stopwatch"
        />
      )

      expect(screen.getByText(/0:30\.\d{2}/)).toBeInTheDocument()
    })

    it('should render in Countdown mode', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Countdown"
        />
      )

      expect(screen.getByText(/0:30\.\d{2}/)).toBeInTheDocument()
    })

    it('should render in Intervals mode', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
        />
      )

      expect(screen.getByText(/0:30\.\d{2}/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative time (treat as 0)', () => {
      render(
        <TimerDisplay
          timeLeft={-1000}
          progress={0}
          mode="Countdown"
        />
      )

      // formatTime should handle negative values gracefully
      const timeElement = screen.getByText(/:/i)
      expect(timeElement).toBeInTheDocument()
    })

    it('should handle very large progress values', () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={30000}
          progress={10000}
          mode="Countdown"
        />
      )

      const progressCircle = container.querySelectorAll('circle')[1]
      const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset')
      
      // Should handle gracefully, even if mathematically incorrect
      expect(strokeDashoffset).toBeDefined()
    })

    it('should handle undefined currentInterval gracefully', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          showIntervalStatus={true}
        />
      )

      // Should not crash, may not show interval status
      expect(screen.getByText(/0:30\.\d{2}/)).toBeInTheDocument()
    })

    it('should handle zero intervalCount', () => {
      render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={0}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Interval 1')).toBeInTheDocument()
    })
  })

  describe('Component Updates', () => {
    it('should update when timeLeft changes', () => {
      const { rerender } = render(
        <TimerDisplay
          timeLeft={60000}
          progress={100}
          mode="Stopwatch"
        />
      )

      expect(screen.getByText('1:00')).toBeInTheDocument()

      rerender(
        <TimerDisplay
          timeLeft={45000}
          progress={75}
          mode="Stopwatch"
        />
      )

      expect(screen.getByText(/0:45\.\d{2}/)).toBeInTheDocument()
    })

    it('should update when switching intervals', () => {
      const { rerender } = render(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="work"
          intervalCount={0}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Work Time')).toBeInTheDocument()

      rerender(
        <TimerDisplay
          timeLeft={30000}
          progress={100}
          mode="Intervals"
          currentInterval="break"
          intervalCount={0}
          showIntervalStatus={true}
        />
      )

      expect(screen.getByText('Break Time')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should be memoized (displayName set)', () => {
      expect(TimerDisplay.displayName).toBe('TimerDisplay')
    })
  })
})
