/**
 * NewHabit Form Integration Tests
 * Tests for the new habit creation form with validation
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
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
})

describe('NewHabit Form', () => {
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

  describe('Form Rendering', () => {
    it('should render the form with all fields', () => {
      renderForm()

      expect(screen.getByPlaceholderText('e.g., Drink Water')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Add more details here')).toBeInTheDocument()
      expect(screen.getByText('daily')).toBeInTheDocument()
      expect(screen.getByText('weekly')).toBeInTheDocument()
      expect(screen.getByText('monthly')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save habit/i })).toBeInTheDocument()
    })

    it('should have default values', () => {
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water') as HTMLInputElement
      expect(nameInput.value).toBe('')

      const weeklyRadio = screen.getByDisplayValue('weekly') as HTMLInputElement
      expect(weeklyRadio).toBeChecked()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting with empty name', async () => {
      renderForm()

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a habit name')
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should show validation error for empty name field', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      const saveButton = screen.getByRole('button', { name: /save habit/i })

      await user.click(nameInput)
      await user.tab() // Blur the field
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/habit name is required/i)).toBeInTheDocument()
      })
    })

    it('should show error for whitespace-only name', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, '   ')

      // Wait for any validation to complete after typing
      await waitFor(() => {
        expect(nameInput).toHaveValue('   ')
      })

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/cannot be only spaces/i)).toBeInTheDocument()
      })
    })

    it('should show error for name longer than 100 characters', async () => {
      const user = userEvent.setup()
      renderForm()

      const longName = 'a'.repeat(101)
      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, longName)

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/less than 100 characters/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show error for description longer than 500 characters', async () => {
      const user = userEvent.setup()
      renderForm()

      const longDescription = 'a'.repeat(501)
      const descriptionInput = screen.getByPlaceholderText('Add more details here')
      
      // Type more efficiently to avoid timeout - paste instead of typing each character
      await user.click(descriptionInput)
      await user.paste(longDescription)

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/less than 500 characters/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    }, 10000) // Increase timeout for slow typing operations
  })

  describe('Form Submission', () => {
    it('should include categoryId when provided via query param', async () => {
      const user = userEvent.setup()
      ;(router.useSearchParams as any).mockReturnValue([
        new URLSearchParams('categoryId=fitness'),
      ])

      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, 'Test Habit')

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

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
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, 'Morning Meditation')

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('🎉 Habit created successfully!')
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should submit form with description', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, 'Morning Meditation')

      const descriptionInput = screen.getByPlaceholderText('Add more details here')
      await user.type(descriptionInput, 'Meditate for 10 minutes each morning')

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
      await user.type(nameInput, 'Test Habit')

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      // Button should show "Saving..." briefly
      expect(screen.queryByText(/saving/i)).toBeInTheDocument()
    })
  })

  describe('Frequency Selection', () => {
    it('should change frequency when clicking radio buttons', async () => {
      renderForm()

      const dailyRadio = screen.getByDisplayValue('daily') as HTMLInputElement
      fireEvent.click(dailyRadio)

      expect(dailyRadio).toBeChecked()
    })

    it('should update goal display based on frequency', async () => {
      renderForm()

      // Default is weekly
      expect(screen.getByText(/per week/i)).toBeInTheDocument()

      // Change to daily
      const dailyRadio = screen.getByDisplayValue('daily')
      fireEvent.click(dailyRadio)

      await waitFor(() => {
        expect(screen.getByText(/per day/i)).toBeInTheDocument()
      })

      // Change to monthly
      const monthlyRadio = screen.getByDisplayValue('monthly')
      fireEvent.click(monthlyRadio)

      await waitFor(() => {
        expect(screen.getByText(/per month/i)).toBeInTheDocument()
      })
    })
  })

  describe('Goal Controls', () => {
    it('should increment goal when clicking + button', () => {
      renderForm()

      const incrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.material-symbols-outlined')?.textContent === 'add'
      )

      expect(screen.getByText(/3 times/i)).toBeInTheDocument()

      fireEvent.click(incrementButton!)

      expect(screen.getByText(/4 times/i)).toBeInTheDocument()
    })

    it('should decrement goal when clicking - button', () => {
      renderForm()

      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.material-symbols-outlined')?.textContent === 'remove'
      )

      expect(screen.getByText(/3 times/i)).toBeInTheDocument()

      fireEvent.click(decrementButton!)

      expect(screen.getByText(/2 times/i)).toBeInTheDocument()
    })

    it('should not allow goal below 1', () => {
      renderForm()

      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.material-symbols-outlined')?.textContent === 'remove'
      )

      // Click 3 times to try to get to 0
      fireEvent.click(decrementButton!)
      fireEvent.click(decrementButton!)
      fireEvent.click(decrementButton!)

      expect(screen.getByText(/1 time per/i)).toBeInTheDocument()
    })

    it('should not allow goal above 100', () => {
      renderForm()

      const incrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.material-symbols-outlined')?.textContent === 'add'
      )

      // Click 98 times to try to exceed 100
      for (let i = 0; i < 98; i++) {
        fireEvent.click(incrementButton!)
      }

      expect(screen.getByText(/100 times/i)).toBeInTheDocument()
    })
  })

  describe('Reminder Toggle', () => {
    it('should toggle reminder on/off', () => {
      renderForm()

      const reminderToggle = screen.getByRole('checkbox') as HTMLInputElement
      expect(reminderToggle).toBeChecked() // Default is true

      fireEvent.click(reminderToggle)
      expect(reminderToggle).not.toBeChecked()

      fireEvent.click(reminderToggle)
      expect(reminderToggle).toBeChecked()
    })

    it('should show time picker when reminder is enabled', () => {
      renderForm()

      expect(screen.getByText('Reminder Time')).toBeInTheDocument()
      expect(screen.getByDisplayValue(/\d{2}:\d{2}/)).toBeInTheDocument()
    })

    it('should hide time picker when reminder is disabled', () => {
      renderForm()

      const reminderToggle = screen.getByRole('checkbox')
      fireEvent.click(reminderToggle)

      expect(screen.queryByText('Reminder Time')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate back when clicking close button', () => {
      renderForm()

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('Error Display', () => {
    it('should show error icon with error messages', async () => {
      renderForm()

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        const errorIcon = screen.getByText('error')
        expect(errorIcon).toBeInTheDocument()
        expect(errorIcon).toHaveClass('material-symbols-outlined')
      })
    })

    it('should apply error styling to invalid fields', async () => {
      renderForm()

      const saveButton = screen.getByRole('button', { name: /save habit/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('e.g., Drink Water')
        expect(nameInput).toHaveClass('border-red-500')
      })
    })
  })
})
