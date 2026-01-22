/**
 * Automated Accessibility Audit Tests
 * 
 * Uses axe-core to detect accessibility violations
 * Tests WCAG 2.1 Level AA compliance
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TimerDisplay } from '../../shared/TimerDisplay'
import { AnimatedTimerButton } from '../../shared/AnimatedTimerButton'
import { AccessibleModal } from '../../shared/AccessibleModal'
import { TimerSettingsModal } from '../../settings/TimerSettingsModal'

// Extend expect with axe matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Audit - axe-core', () => {
  describe('TimerDisplay', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TimerDisplay
          timeLeft={60000}
          progress={0.5}
          mode="Countdown"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with different modes', async () => {
      const { container: countdownContainer } = render(
        <TimerDisplay timeLeft={30000} progress={0.25} mode="Countdown" />
      )
      expect(await axe(countdownContainer)).toHaveNoViolations()

      const { container: stopwatchContainer } = render(
        <TimerDisplay timeLeft={45000} progress={0.75} mode="Stopwatch" />
      )
      expect(await axe(stopwatchContainer)).toHaveNoViolations()

      const { container: intervalsContainer } = render(
        <TimerDisplay
          timeLeft={15000}
          progress={0.5}
          mode="Intervals"
          currentInterval="work"
          intervalCount={2}
          showIntervalStatus={true}
        />
      )
      expect(await axe(intervalsContainer)).toHaveNoViolations()
    })
  })

  describe('AnimatedTimerButton', () => {
    it('should have no violations when inactive', async () => {
      const { container } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={false}
          onStart={() => {}}
          onPause={() => {}}
          onContinue={() => {}}
          onKill={() => {}}
          mode="Countdown"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when active', async () => {
      const { container } = render(
        <AnimatedTimerButton
          isActive={true}
          isPaused={false}
          onStart={() => {}}
          onPause={() => {}}
          onContinue={() => {}}
          onKill={() => {}}
          mode="Countdown"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when paused', async () => {
      const { container } = render(
        <AnimatedTimerButton
          isActive={false}
          isPaused={true}
          onStart={() => {}}
          onPause={() => {}}
          onContinue={() => {}}
          onKill={() => {}}
          mode="Countdown"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('AccessibleModal', () => {
    it('should have no violations when open', async () => {
      const { container } = render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          description="This is a test modal"
        >
          <div>Modal content</div>
        </AccessibleModal>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with different sizes', async () => {
      const { container: smContainer } = render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Small Modal"
          size="sm"
        >
          <p>Small content</p>
        </AccessibleModal>
      )
      expect(await axe(smContainer)).toHaveNoViolations()

      const { container: lgContainer } = render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Large Modal"
          size="lg"
        >
          <p>Large content</p>
        </AccessibleModal>
      )
      expect(await axe(lgContainer)).toHaveNoViolations()
    })
  })

  describe('TimerSettingsModal', () => {
    it('should have no violations', async () => {
      const { container } = render(
        <MemoryRouter>
          <TimerSettingsModal
            isOpen={true}
            onClose={() => {}}
          />
        </MemoryRouter>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    }, 10000) // Increase timeout for complex modal analysis
  })

  describe('WCAG Compliance', () => {
    it('should meet WCAG 2.1 Level AA standards for timer controls', async () => {
      const { container } = render(
        <div>
          <TimerDisplay timeLeft={60000} progress={0.5} mode="Countdown" />
          <AnimatedTimerButton
            isActive={false}
            isPaused={false}
            onStart={() => {}}
            onPause={() => {}}
            onContinue={() => {}}
            onKill={() => {}}
            mode="Countdown"
          />
        </div>
      )
      
      // Run with WCAG 2 AA rules
      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      })
      
      expect(results).toHaveNoViolations()
    }, 10000) // Increase timeout for WCAG compliance analysis
  })
})
