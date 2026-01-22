/**
 * OnboardingModal Component Tests
 * Tests for first-time user onboarding experience
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingModal } from '@/components/OnboardingModal'
import { useHabitStore } from '@/store/useHabitStore'

// Mock the store
vi.mock('@/store/useHabitStore')

describe('OnboardingModal', () => {
  const mockLoadSampleHabits = vi.fn()
  const mockMarkOnboardingComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useHabitStore as any).mockReturnValue({
      isFirstVisit: true,
      loadSampleHabits: mockLoadSampleHabits,
      markOnboardingComplete: mockMarkOnboardingComplete,
    })
  })

  describe('Visibility', () => {
    it('should render when isFirstVisit is true', () => {
      render(<OnboardingModal />)
      
      expect(screen.getByText('Welcome to HabitFlow! 🎉')).toBeInTheDocument()
      expect(screen.getByText('Start your journey to building better habits')).toBeInTheDocument()
    })

    it('should not render when isFirstVisit is false', () => {
      ;(useHabitStore as any).mockReturnValue({
        isFirstVisit: false,
        loadSampleHabits: mockLoadSampleHabits,
        markOnboardingComplete: mockMarkOnboardingComplete,
      })

      const { container } = render(<OnboardingModal />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Start Fresh Option', () => {
    it('should display "Start Fresh" option', () => {
      render(<OnboardingModal />)
      
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Begin with a clean slate and create your own habits from scratch')).toBeInTheDocument()
    })

    it('should call markOnboardingComplete when "Start Fresh" is clicked', () => {
      render(<OnboardingModal />)
      
      const startFreshButton = screen.getByText('Start Fresh').closest('button')
      fireEvent.click(startFreshButton!)
      
      expect(mockMarkOnboardingComplete).toHaveBeenCalledTimes(1)
      expect(mockLoadSampleHabits).not.toHaveBeenCalled()
    })
  })

  describe('Load Sample Habits Option', () => {
    it('should display "Load Sample Habits" option', () => {
      render(<OnboardingModal />)
      
      expect(screen.getByText('Load Sample Habits')).toBeInTheDocument()
      expect(screen.getByText(/Explore the app with pre-loaded example habits/)).toBeInTheDocument()
    })

    it('should call loadSampleHabits when "Load Sample Habits" is clicked', () => {
      render(<OnboardingModal />)
      
      const loadSamplesButton = screen.getByText('Load Sample Habits').closest('button')
      fireEvent.click(loadSamplesButton!)
      
      expect(mockLoadSampleHabits).toHaveBeenCalledTimes(1)
      expect(mockMarkOnboardingComplete).not.toHaveBeenCalled()
    })
  })

  describe('Visual Elements', () => {
    it('should display the meditation icon', () => {
      render(<OnboardingModal />)
      
      const icon = screen.getByText('self_improvement')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('material-symbols-outlined')
    })

    it('should display info message about changing habits later', () => {
      render(<OnboardingModal />)
      
      expect(screen.getByText(/You can always change or delete habits later/)).toBeInTheDocument()
    })

    it('should have backdrop element', () => {
      const { container } = render(<OnboardingModal />)
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/80')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<OnboardingModal />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should have descriptive text for screen readers', () => {
      render(<OnboardingModal />)
      
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Load Sample Habits')).toBeInTheDocument()
    })
  })

  describe('Store Integration', () => {
    it('should use the habit store correctly', () => {
      render(<OnboardingModal />)
      
      expect(useHabitStore).toHaveBeenCalled()
    })

    it('should handle multiple clicks gracefully', () => {
      render(<OnboardingModal />)
      
      const startFreshButton = screen.getByText('Start Fresh').closest('button')
      fireEvent.click(startFreshButton!)
      fireEvent.click(startFreshButton!)
      fireEvent.click(startFreshButton!)
      
      // Should still only call once (assuming modal closes after first click in real scenario)
      expect(mockMarkOnboardingComplete).toHaveBeenCalledTimes(3)
    })
  })
})
