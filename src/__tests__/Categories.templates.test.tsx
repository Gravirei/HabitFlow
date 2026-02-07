/**
 * Phase 6 Wave 2 - Category Templates modal test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Categories } from '@/pages/bottomNav/Categories'
import type { Category } from '@/types/category'
import type { Habit } from '@/types/habit'
import type { Task } from '@/types/task'

vi.mock('@/components/BottomNav', () => ({ BottomNav: () => null }))
vi.mock('@/components/SideNav', () => ({ SideNav: () => null }))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

let mockCategories: Category[] = []
let mockHabits: Habit[] = []
let mockTasks: Task[] = []
const addCategoryMock = vi.fn((input) => {
  const newCategory: Category = {
    id: input.id || `cat-${Date.now()}`,
    name: input.name,
    icon: input.icon,
    color: input.color,
    gradient: input.gradient,
    textColor: input.textColor,
    imagePath: input.imagePath,
    height: input.height,
    isPinned: input.isPinned || false,
    order: mockCategories.length,
    createdAt: new Date().toISOString(),
    stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
  }
  mockCategories.push(newCategory)
  return newCategory
})
const addHabitMock = vi.fn()

const getCategoryState = () => ({
  categories: mockCategories,
  addCategory: addCategoryMock,
  togglePinned: vi.fn(),
  deleteCategory: vi.fn(),
  reorderCategories: vi.fn(),
  getPinnedCategories: () => mockCategories.filter((c) => c.isPinned).sort((a, b) => a.order - b.order),
  getAllCategories: () => [...mockCategories].sort((a, b) => a.order - b.order),
})

vi.mock('@/store/useCategoryStore', () => ({
  useCategoryStore: Object.assign(
    (selector?: any) => {
      const state = getCategoryState()
      return typeof selector === 'function' ? selector(state) : state
    },
    {
      getState: () => getCategoryState(),
    }
  ),
}))

const getHabitState = () => ({
  habits: mockHabits,
  addHabit: addHabitMock,
  getHabitsByCategory: (categoryId: string) => mockHabits.filter((h) => h.categoryId === categoryId),
  isHabitCompletedToday: () => false,
  clearCategoryFromHabits: vi.fn(),
})

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: Object.assign(
    (selector?: any) => {
      const state = getHabitState()
      return typeof selector === 'function' ? selector(state) : state
    },
    {
      getState: () => getHabitState(),
    }
  ),
}))

vi.mock('@/store/useTaskStore', () => ({
  useTaskStore: (selector?: any) => {
    const state = {
      tasks: mockTasks,
      clearCategoryFromTasks: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

const renderPage = () =>
  render(
    <MemoryRouter>
      <Categories />
    </MemoryRouter>
  )

describe('Categories Templates Modal (Phase 6)', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    addCategoryMock.mockClear()
    addHabitMock.mockClear()
    mockCategories = []
    mockHabits = []
    mockTasks = []
  })

  it('opens Templates modal and imports a pack', async () => {
    const user = userEvent.setup()

    mockCategories = [
      {
        id: 'existing-1',
        name: 'Existing Category',
        icon: 'star',
        color: 'blue',
        order: 1,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderPage()

    // Open Templates modal
    const templatesButton = screen.getByRole('button', { name: /Templates/i })
    await user.click(templatesButton)

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Category templates')).toBeInTheDocument()
    })

    // Find and click Import button for a pack (e.g., Fitness)
    const importButtons = screen.getAllByRole('button', { name: /Import.*template pack/i })
    expect(importButtons.length).toBeGreaterThan(0)

    await user.click(importButtons[0])

    // Verify that addCategory was called (categories were imported)
    await waitFor(() => {
      expect(addCategoryMock).toHaveBeenCalled()
    })

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/Imported/i)).toBeInTheDocument()
    })
  })

  it('shows all three template packs', async () => {
    const user = userEvent.setup()

    renderPage()

    // Open Templates modal
    const templatesButton = screen.getByRole('button', { name: /Templates/i })
    await user.click(templatesButton)

    await waitFor(() => {
      expect(screen.getByText('Category templates')).toBeInTheDocument()
    })

    // Should show three import buttons (one for each pack)
    const importButtons = screen.getAllByRole('button', { name: /Import.*template pack/i })
    expect(importButtons.length).toBe(3)
  })
})
