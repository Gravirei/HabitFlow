/**
 * NewHabitModal Integration Tests
 * Tests the in-place creation overlay: slide-in over blurred page,
 * dismiss guards (X / backdrop / Escape) and discard confirmation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewHabitModal } from '../NewHabitModal'
import { useNewHabitModalStore } from '@/store/useNewHabitModalStore'
import toast from 'react-hot-toast'

const { addHabitMock } = vi.hoisted(() => ({
  addHabitMock: vi.fn(),
}))

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
  })),
}))

describe('NewHabitModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNewHabitModalStore.setState({ isOpen: false })
    document.body.style.overflow = ''
  })

  const openModal = () => {
    useNewHabitModalStore.getState().open()
    render(<NewHabitModal />)
  }

  const expectClosed = () => {
    expect(useNewHabitModalStore.getState().isOpen).toBe(false)
  }

  it('renders nothing when closed', () => {
    render(<NewHabitModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the wizard as a dialog when triggered', () => {
    openModal()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/what do you want to achieve/i)).toBeInTheDocument()
  })

  it('preselects the frequency passed via open() options', async () => {
    const user = userEvent.setup()
    useNewHabitModalStore.getState().open({ defaultFrequency: 'monthly' })
    render(<NewHabitModal />)

    await user.type(screen.getByPlaceholderText('Name your habit…'), 'Monthly Habit')
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await screen.findByText(/how often will you do it/i)
    expect(screen.getByRole('radio', { name: /monthly/i })).toBeChecked()
  }, 10000)

  it('files habits created without a category under the built-in General category', async () => {
    const user = userEvent.setup()
    openModal()

    await user.type(screen.getByPlaceholderText('Name your habit…'), 'No Category Habit')

    // Walk through all steps
    const markers = [
      /how often will you do it/i,
      /set a gentle goal/i,
      /stay on track/i,
    ]
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    for (const marker of markers) {
      await screen.findByText(marker)
      fireEvent.click(screen.getByRole('button', { name: /continue|create habit/i }))
    }

    await waitFor(() => {
      expect(addHabitMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'No Category Habit', categoryId: 'general' })
      )
    })
  }, 10000)

  it('creates a habit in the category passed via open() options', async () => {    const user = userEvent.setup()
    useNewHabitModalStore.getState().open({ categoryId: 'cat-123' })
    render(<NewHabitModal />)

    await user.type(screen.getByPlaceholderText('Name your habit…'), 'Categorized Habit')

    // Walk through all steps
    const markers = [
      /how often will you do it/i,
      /set a gentle goal/i,
      /stay on track/i,
    ]
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    for (const marker of markers) {
      await screen.findByText(marker)
      fireEvent.click(screen.getByRole('button', { name: /continue|create habit/i }))
    }

    await waitFor(() => {
      expect(addHabitMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Categorized Habit', categoryId: 'cat-123' })
      )
    })
  }, 10000)

  it('locks body scroll while open', () => {
    openModal()

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('clears presets on close so the next open starts fresh', () => {
    useNewHabitModalStore.getState().open({ defaultFrequency: 'daily', categoryId: 'cat-1' })
    useNewHabitModalStore.getState().close()

    const state = useNewHabitModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.defaultFrequency).toBeUndefined()
    expect(state.categoryId).toBeUndefined()
  })

  it('closes immediately via X button when nothing was entered', async () => {
    openModal()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    expectClosed()
    // Panel unmounts after the exit animation finishes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes immediately via Escape when nothing was entered', () => {
    openModal()

    fireEvent.keyDown(document, { key: 'Escape' })

    expectClosed()
  })

  it('closes immediately via backdrop click when nothing was entered', async () => {
    const { container } = render(<NewHabitModal />)
    useNewHabitModalStore.getState().open()

    // Wait for AnimatePresence to mount the backdrop
    const backdrop = await waitFor(() => {
      const el = container.querySelector<HTMLElement>('.bg-black\\/40.backdrop-blur-xl')
      expect(el).not.toBeNull()
      return el!
    })

    fireEvent.click(backdrop)

    expectClosed()
  })

  describe('discard guard', () => {
    it('asks for confirmation instead of closing when name was typed', async () => {
      const user = userEvent.setup()
      openModal()

      await user.type(screen.getByPlaceholderText('Name your habit…'), 'My Habit')

      fireEvent.click(screen.getByRole('button', { name: /close/i }))

      // Still open, confirmation shown
      expect(useNewHabitModalStore.getState().isOpen).toBe(true)
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText(/discard this habit/i)).toBeInTheDocument()
    })

    it('keeps the modal open when choosing "Keep editing"', async () => {
      const user = userEvent.setup()
      openModal()

      await user.type(screen.getByPlaceholderText('Name your habit…'), 'My Habit')
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      fireEvent.click(screen.getByRole('button', { name: /keep editing/i }))

      expect(useNewHabitModalStore.getState().isOpen).toBe(true)
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
      expect(screen.getByPlaceholderText('Name your habit…')).toHaveValue('My Habit')
    })

    it('discards and closes when choosing "Discard changes"', async () => {
      const user = userEvent.setup()
      openModal()

      await user.type(screen.getByPlaceholderText('Name your habit…'), 'My Habit')
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      fireEvent.click(screen.getByRole('button', { name: /discard changes/i }))

      expectClosed()
      expect(addHabitMock).not.toHaveBeenCalled()
    })

    it('guards Escape dismissal too', async () => {
      const user = userEvent.setup()
      openModal()

      await user.type(screen.getByPlaceholderText('Name your habit…'), 'My Habit')
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(useNewHabitModalStore.getState().isOpen).toBe(true)
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })

  it('creates the habit and closes without discard prompt', async () => {
    const user = userEvent.setup()
    openModal()

    await user.type(screen.getByPlaceholderText('Name your habit…'), 'Morning Run')

    // Walk through all steps
    const markers = [
      /how often will you do it/i,
      /set a gentle goal/i,
      /stay on track/i,
    ]
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    for (const marker of markers) {
      await screen.findByText(marker)
      fireEvent.click(screen.getByRole('button', { name: /continue|create habit/i }))
    }

    await waitFor(() => {
      expect(addHabitMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Morning Run' })
      )
    })
    expect(toast.success).toHaveBeenCalled()
    expectClosed()
  }, 10000)

  it('restores body scroll after closing', async () => {
    const { unmount } = render(<NewHabitModal />)
    act(() => {
      useNewHabitModalStore.getState().open()
    })
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })
})
