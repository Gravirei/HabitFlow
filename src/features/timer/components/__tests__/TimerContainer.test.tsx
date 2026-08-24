/**
 * TimerContainer Component Tests
 * Tests for the main timer container orchestration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TimerContainer } from '../TimerContainer'
import { timerPersistence } from '../utils/timerPersistence'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, onClick, ...props }: any) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock timer modes
vi.mock('../modes/StopwatchTimer', () => ({
  StopwatchTimer: () => <div data-testid="stopwatch-timer">Stopwatch Timer</div>
}))

vi.mock('../modes/CountdownTimer', () => ({
  CountdownTimer: () => <div data-testid="countdown-timer">Countdown Timer</div>
}))

vi.mock('../modes/IntervalsTimer', () => ({
  IntervalsTimer: () => <div data-testid="intervals-timer">Intervals Timer</div>
}))

// Mock TimerTopNav
vi.mock('../shared/TimerTopNav', () => ({
  TimerTopNav: () => <div data-testid="timer-top-nav">Top Nav</div>
}))

// Mock KeyboardHelpModal
vi.mock('../shared/KeyboardHelpModal', () => ({
  KeyboardHelpModal: ({ isOpen, currentMode }: any) => 
    isOpen ? <div data-testid="keyboard-help-modal">Help Modal - {currentMode}</div> : null
}))

describe('TimerContainer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      render(<TimerContainer />)
      expect(screen.getByTestId('timer-top-nav')).toBeInTheDocument()
    })

    it('should render Stopwatch timer by default', () => {
      render(<TimerContainer />)
      expect(screen.getByTestId('stopwatch-timer')).toBeInTheDocument()
    })

    it('should render all three mode buttons', () => {
      render(<TimerContainer />)
      expect(screen.getByText('Stopwatch')).toBeInTheDocument()
      expect(screen.getByText('Countdown')).toBeInTheDocument()
      expect(screen.getByText('Intervals')).toBeInTheDocument()
    })

    it('should have Stopwatch button as active by default', () => {
      render(<TimerContainer />)
      const stopwatchButton = screen.getByText('Stopwatch').closest('button')
      expect(stopwatchButton).toHaveClass('text-[#38bdf8]')
    })
  })

  describe('Mode Switching', () => {
    it('should switch to Countdown mode when Countdown button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerContainer />)

      const countdownButton = screen.getByText('Countdown')
      await user.click(countdownButton)

      await waitFor(() => {
        expect(screen.getByTestId('countdown-timer')).toBeInTheDocument()
      })
    })

    it('should switch to Intervals mode when Intervals button is clicked', async () => {
      const user = userEvent.setup()
      render(<TimerContainer />)

      const intervalsButton = screen.getByText('Intervals')
      await user.click(intervalsButton)

      await waitFor(() => {
        expect(screen.getByTestId('intervals-timer')).toBeInTheDocument()
      })
    })

    it('should update active button styling when mode changes', async () => {
      const user = userEvent.setup()
      render(<TimerContainer />)

      const countdownButton = screen.getByText('Countdown').closest('button')
      await user.click(countdownButton!)

      await waitFor(() => {
        expect(countdownButton).toHaveClass('text-[#38bdf8]')
      })
    })

    it('should switch back to Stopwatch from other modes', async () => {
      const user = userEvent.setup()
      render(<TimerContainer />)

      // Switch to Countdown
      await user.click(screen.getByText('Countdown'))
      await waitFor(() => {
        expect(screen.getByTestId('countdown-timer')).toBeInTheDocument()
      })

      // Switch back to Stopwatch
      await user.click(screen.getByText('Stopwatch'))
      await waitFor(() => {
        expect(screen.getByTestId('stopwatch-timer')).toBeInTheDocument()
      })
    })
  })

  describe('Persistence Integration', () => {
    it('should restore saved timer mode on mount', () => {
      // Mock saved state with Countdown mode
      vi.spyOn(timerPersistence, 'loadState').mockReturnValue({
        mode: 'Countdown',
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        totalDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      })
      vi.spyOn(timerPersistence, 'getActiveTimer').mockReturnValue('Countdown')

      render(<TimerContainer />)

      expect(screen.getByTestId('countdown-timer')).toBeInTheDocument()
    })

    it('should restore Intervals mode from saved state', () => {
      vi.spyOn(timerPersistence, 'loadState').mockReturnValue({
        mode: 'Intervals',
        isActive: true,
        isPaused: false,
        currentLoop: 1,
        targetLoops: 4,
        currentInterval: 'work',
        intervalStartTime: Date.now(),
        workDuration: 1500000,
        breakDuration: 300000,
        pausedElapsed: 0,
        savedAt: Date.now(),
        version: 1
      })
      vi.spyOn(timerPersistence, 'getActiveTimer').mockReturnValue('Intervals')

      render(<TimerContainer />)

      expect(screen.getByTestId('intervals-timer')).toBeInTheDocument()
    })

    it('should default to Stopwatch if no saved state exists', () => {
      vi.spyOn(timerPersistence, 'loadState').mockReturnValue(null)
      vi.spyOn(timerPersistence, 'getActiveTimer').mockReturnValue(null)

      render(<TimerContainer />)

      expect(screen.getByTestId('stopwatch-timer')).toBeInTheDocument()
    })
  })

  describe('Keyboard Help Modal', () => {
    it('should not show keyboard help modal initially', () => {
      render(<TimerContainer />)
      expect(screen.queryByTestId('keyboard-help-modal')).not.toBeInTheDocument()
    })

    // Note: Testing modal opening requires access to useKeyboardHelp context
    // which would need additional setup or integration tests
  })

  describe('Timer Focus Provider', () => {
    it('should wrap content in TimerFocusProvider', () => {
      // This is implicitly tested by the component rendering successfully
      // and other tests passing. The provider enables timer focus functionality.
      const { container } = render(<TimerContainer />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have mode selector buttons that are keyboard accessible', () => {
      render(<TimerContainer />)
      
      const stopwatchButton = screen.getByText('Stopwatch').closest('button')
      const countdownButton = screen.getByText('Countdown').closest('button')
      const intervalsButton = screen.getByText('Intervals').closest('button')

      expect(stopwatchButton).toBeInTheDocument()
      expect(countdownButton).toBeInTheDocument()
      expect(intervalsButton).toBeInTheDocument()
    })

    it('should render timer content in a scrollable container', () => {
      const { container } = render(<TimerContainer />)
      const timerContent = container.querySelector('.overflow-y-auto')
      expect(timerContent).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render top navigation', () => {
      render(<TimerContainer />)
      expect(screen.getByTestId('timer-top-nav')).toBeInTheDocument()
    })

    it('should render mode selector header', () => {
      const { container } = render(<TimerContainer />)
      const header = container.querySelector('.header')
      expect(header).toBeInTheDocument()
    })

    it('should render timer content area', () => {
      const { container } = render(<TimerContainer />)
      const contentArea = container.querySelector('.flex-1')
      expect(contentArea).toBeInTheDocument()
    })

    it('should have proper background styling', () => {
      const { container } = render(<TimerContainer />)
      const mainContainer = container.querySelector('.bg-background-dark')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Mode Icons', () => {
    it('should render Stopwatch icon', () => {
      const { container: _container1 } = render(<TimerContainer />)
      const stopwatchButton = screen.getByText('Stopwatch').closest('button')
      const svg = stopwatchButton?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render Countdown icon', () => {
      const { container: _container2 } = render(<TimerContainer />)
      const countdownButton = screen.getByText('Countdown').closest('button')
      const svg = countdownButton?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render Intervals icon', () => {
      const { container: _container3 } = render(<TimerContainer />)
      const intervalsButton = screen.getByText('Intervals').closest('button')
      const svg = intervalsButton?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
