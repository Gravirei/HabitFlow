/**
 * NewHabit Wizard Integration Tests
 * Tests for the step-by-step habit creation flow with validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { NewHabit } from '@/pages/NewHabit'
import * as router from 'react-router-dom'
import toast from 'react-hot-toast'

const { addHabitMock } = vi.hoisted(() => ({
  addHabitMock: vi.fn(),
}))

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams()]),
  }
})

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: vi.fn(() => ({
    habits: [],
    isFirstVisit: true,
    addHabit: addHabitMock,
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
    toggleHabitCompletion: vi.fn(),
    isHabitCompletedToday: vi.fn(),
    isHabitCompletedOnDate: vi.fn(),
    loadSampleHabits: vi.fn(),
    markOnboardingComplete: vi.fn(),
  }))
}))

const mockNavigate = vi.fn()

// Mock localStorage with Storage interface for Zustand
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
})

const NAME_PLACEHOLDER = 'Name your habit…'

// Marker text per wizard step, used to wait for step transitions
const STEP_MARKERS = [
  /what do you want to achieve/i,
  /how often will you do it/i,
  /set a gentle goal/i,
  /stay on track/i,
] as const

describe('NewHabit Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    ;(router.useNavigate as any).mockReturnValue(mockNavigate)
    ;(router.useSearchParams as any).mockReturnValue([new URLSearchParams()])
  })

  const renderForm = () => {
    return render(
      <BrowserRouter>
        <NewHabit />
      </BrowserRouter>
    )
  }

  /** Renders the form and walks to the given step (0-indexed), filling the required name along the way. */
  const goToStep = async (targetStep: number, name = 'Test Habit') => {
    const user = userEvent.setup()
    renderForm()

    if (targetStep === 0) return user

    await user.type(screen.getByPlaceholderText(NAME_PLACEHOLDER), name)

    for (let s = 1; s <= targetStep; s++) {
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByText(STEP_MARKERS[s])
    }
    return user
  }

  describe('Form Rendering', () => {
    it('should render each step with its fields', async () => {
      const user = await goToStep(0)

      // Step 1: name + description
      expect(screen.getByPlaceholderText(NAME_PLACEHOLDER)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Add details/)).toBeInTheDocument()
      await user.type(screen.getByPlaceholderText(NAME_PLACEHOLDER), 'Test Habit')

      // Step 2: frequency options
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByText(/how often will you do it/i)).toBeInTheDocument()
      expect(screen.getByText('Daily')).toBeInTheDocument()
      expect(screen.getByText('Weekly')).toBeInTheDocument()
      expect(screen.getByText('Monthly')).toBeInTheDocument()

      // Step 3: goal stepper
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByText(/set a gentle goal/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /decrease goal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /increase goal/i })).toBeInTheDocument()

      // Step 4: reminder + create button
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByText(/stay on track/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create habit/i })).toBeInTheDocument()

      expect(user).toBeDefined()
    })

    it('should have default values', async () => {
      const user = await goToStep(0)

      const nameInput = screen.getByPlaceholderText(NAME_PLACEHOLDER) as HTMLInputElement
      expect(nameInput.value).toBe('')

      // Walk to frequency step to inspect the default selection
      await user.type(nameInput, 'Test Habit')
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      const weeklyRadio = await screen.findByDisplayValue('weekly') as HTMLInputElement
      expect(weeklyRadio).toBeChecked()
    })
  })

  describe('Form Validation', () => {
    it('should stay on step 1 when submitting with empty name', async () => {
      const user = await goToStep(0)
      expect(user).toBeDefined()

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a habit name')
      })

      // Still on the first step
      expect(screen.getByPlaceholderText(NAME_PLACEHOLDER)).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should show validation error for empty name field', async () => {
      await goToStep(0)

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/habit name is required/i)).toBeInTheDocument()
      })
    })

    it('should show error for whitespace-only name', async () => {
      const user = await goToStep(0)

      const nameInput = screen.getByPlaceholderText(NAME_PLACEHOLDER)
      await user.clear(nameInput)
      await user.type(nameInput, '   ')

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/cannot be only spaces/i)).toBeInTheDocument()
      })
    })

    it('should cap name input at 100 characters', async () => {
      const user = await goToStep(0)

      const longName = 'a'.repeat(101)
      const nameInput = screen.getByPlaceholderText(NAME_PLACEHOLDER) as HTMLInputElement
      await user.type(nameInput, longName)

      // The input enforces maxLength=100, so the browser truncates instead of
      // letting the zod schema reject an over-length value.
      expect(nameInput.value.length).toBe(100)
    }, 10000)

    it('should show error for description longer than 500 characters', async () => {
      const user = await goToStep(0)

      const longDescription = 'a'.repeat(501)
      const descriptionInput = screen.getByPlaceholderText(/Add details/)

      await user.click(descriptionInput)
      await user.paste(longDescription)

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/less than 500 characters/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Form Submission', () => {
    it('should include categoryId when provided via query param', async () => {
      ;(router.useSearchParams as any).mockReturnValue([
        new URLSearchParams('categoryId=fitness'),
      ])

      await goToStep(3)

      fireEvent.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(addHabitMock).toHaveBeenCalledTimes(1)
        expect(addHabitMock).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Habit',
            categoryId: 'fitness',
          })
        )
      })
    })

    it('should submit valid form successfully', async () => {
      await goToStep(3)

      fireEvent.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Habit created successfully!')
        expect(mockNavigate).toHaveBeenCalledWith('/today')
      })
    })

    it('should submit form with description', async () => {
      const user = await goToStep(0)

      await user.type(screen.getByPlaceholderText(NAME_PLACEHOLDER), 'Morning Meditation')
      const descriptionInput = screen.getByPlaceholderText(/Add details/)
      await user.type(descriptionInput, 'Meditate for 10 minutes each morning')

      // Walk to the last step and create the habit
      for (let s = 1; s <= 3; s++) {
        fireEvent.click(screen.getByRole('button', { name: /continue/i }))
        await screen.findByText(STEP_MARKERS[s])
      }

      fireEvent.click(screen.getByRole('button', { name: /create habit/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      await goToStep(3)

      const createButton = screen.getByRole('button', { name: /create habit/i })
      fireEvent.click(createButton)

      // Button should show "Saving…" briefly
      expect(screen.queryByText(/saving/i)).toBeInTheDocument()
    })
  })

  describe('Frequency Selection', () => {
    it('should change frequency when clicking radio buttons', async () => {
      await goToStep(1)

      const dailyRadio = screen.getByDisplayValue('daily') as HTMLInputElement
      fireEvent.click(dailyRadio)

      expect(dailyRadio).toBeChecked()
    })

    it('should update goal display based on frequency', async () => {
      await goToStep(2)

      // Default is weekly
      expect(screen.getByText(/per week/i)).toBeInTheDocument()

      // Go back, pick daily, come forward again
      fireEvent.click(screen.getByRole('button', { name: /back/i }))
      fireEvent.click(screen.getByDisplayValue('daily'))
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/per day/i)).toBeInTheDocument()
      })

      // Switch to monthly
      fireEvent.click(screen.getByRole('button', { name: /back/i }))
      fireEvent.click(screen.getByDisplayValue('monthly'))
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/per month/i)).toBeInTheDocument()
      })
    })
  })

  describe('Goal Controls', () => {
    const getSummaryText = () => {
      const value = screen.getByTestId('goal-value').textContent ?? ''
      const unit = screen.getByTestId('goal-unit').textContent ?? ''
      return `${value}${unit}`.replace(/\s+/g, ' ')
    }

    it('should increment goal when clicking + button', async () => {
      await goToStep(2)

      const incrementButton = screen.getByRole('button', { name: /increase goal/i })

      expect(getSummaryText()).toMatch(/3\s*times/i)

      fireEvent.click(incrementButton)

      expect(getSummaryText()).toMatch(/4\s*times/i)
    })

    it('should decrement goal when clicking - button', async () => {
      await goToStep(2)

      const decrementButton = screen.getByRole('button', { name: /decrease goal/i })

      expect(getSummaryText()).toMatch(/3\s*times/i)

      fireEvent.click(decrementButton)

      expect(getSummaryText()).toMatch(/2\s*times/i)
    })

    it('should not allow goal below 1', async () => {
      await goToStep(2)

      const decrementButton = screen.getByRole('button', { name: /decrease goal/i })

      // Click 3 times to try to get to 0
      fireEvent.click(decrementButton)
      fireEvent.click(decrementButton)
      fireEvent.click(decrementButton)

      expect(getSummaryText()).toMatch(/1\s*time\s*per/i)
    })

    it('should not allow goal above 100', async () => {
      await goToStep(2)

      const incrementButton = screen.getByRole('button', { name: /increase goal/i })

      // Click 98 times to try to exceed 100
      for (let i = 0; i < 98; i++) {
        fireEvent.click(incrementButton)
      }

      expect(getSummaryText()).toMatch(/100\s*times/i)
    })
  })

  describe('Reminder Toggle', () => {
    it('should toggle reminder on/off', async () => {
      await goToStep(3)

      const reminderToggle = screen.getByRole('checkbox') as HTMLInputElement
      expect(reminderToggle).toBeChecked() // Default is true

      fireEvent.click(reminderToggle)
      expect(reminderToggle).not.toBeChecked()

      fireEvent.click(reminderToggle)
      expect(reminderToggle).toBeChecked()
    })

    it('should show time picker when reminder is enabled', async () => {
      await goToStep(3)

      expect(screen.getByText('Remind me at')).toBeInTheDocument()
      expect(screen.getByDisplayValue(/\d{2}:\d{2}/)).toBeInTheDocument()
    })

    it('should hide time picker when reminder is disabled', async () => {
      await goToStep(3)

      const reminderToggle = screen.getByRole('checkbox')
      fireEvent.click(reminderToggle)

      expect(screen.queryByText('Remind me at')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate back when clicking close button', async () => {
      await goToStep(0)

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(mockNavigate).toHaveBeenCalledWith('/today')
    })

    it('should go back to the previous step when clicking Back', async () => {
      await goToStep(1)

      fireEvent.click(screen.getByRole('button', { name: /back/i }))

      expect(await screen.findByText(STEP_MARKERS[0])).toBeInTheDocument()
    })

    it('should not show Back on the first step', async () => {
      await goToStep(0)

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should show error icon with error messages', async () => {
      await goToStep(0)

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        const errorIcon = screen.getByText('error')
        expect(errorIcon).toBeInTheDocument()
        expect(errorIcon).toHaveClass('material-symbols-outlined')
      })
    })

    it('should apply error styling to invalid fields', async () => {
      await goToStep(0)

      fireEvent.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(NAME_PLACEHOLDER)
        expect(nameInput).toHaveClass('border-red-500')
      })
    })
  })
})
