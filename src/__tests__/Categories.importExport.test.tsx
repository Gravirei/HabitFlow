/**
 * Phase 6 Wave 3 - Category Import/Export modal test
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
  addHabit: vi.fn(),
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

describe('Categories Import/Export Modal (Phase 6)', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    addCategoryMock.mockClear()
    mockCategories = []
    mockHabits = []
    mockTasks = []

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('exports categories as downloadable JSON', async () => {
    const user = userEvent.setup()

    mockCategories = [
      {
        id: 'work',
        name: 'Work',
        icon: 'work',
        color: 'blue',
        order: 1,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderPage()

    // Open Import/Export modal
    const importExportButton = screen.getByRole('button', { name: /Import\/Export/i })
    await user.click(importExportButton)

    await waitFor(() => {
      expect(screen.getByText('Import/Export Categories')).toBeInTheDocument()
    })

    // Should be on Export tab by default
    expect(screen.getByText(/Download all your categories/i)).toBeInTheDocument()

    // Click Download JSON
    const downloadButton = screen.getByRole('button', { name: /Download JSON/i })
    await user.click(downloadButton)

    // Verify URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('shows error message for invalid JSON import', async () => {
    const user = userEvent.setup()

    renderPage()

    // Open Import/Export modal
    const importExportButton = screen.getByRole('button', { name: /Import\/Export/i })
    await user.click(importExportButton)

    await waitFor(() => {
      expect(screen.getByText('Import/Export Categories')).toBeInTheDocument()
    })

    // Switch to Import tab
    const importTab = screen.getByRole('button', { name: /^Import$/i })
    await user.click(importTab)

    // Upload invalid JSON
    const fileInput = screen.getByLabelText(/Choose JSON file to import/i)
    const invalidFile = new File(['{ invalid json'], 'test.json', { type: 'application/json' })

    await user.upload(fileInput, invalidFile)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Import Failed/i)).toBeInTheDocument()
    })
  })

  it('shows import tab with file upload option', async () => {
    const user = userEvent.setup()

    renderPage()

    // Open Import/Export modal
    const importExportButton = screen.getByRole('button', { name: /Import\/Export/i })
    await user.click(importExportButton)

    await waitFor(() => {
      expect(screen.getByText('Import/Export Categories')).toBeInTheDocument()
    })

    // Switch to Import tab
    const importTab = screen.getByRole('button', { name: /^Import$/i })
    await user.click(importTab)

    // Should show import UI
    expect(screen.getByText(/Upload a JSON file to restore categories/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Choose JSON file to import/i)).toBeInTheDocument()
    expect(screen.getByText(/Choose File/i)).toBeInTheDocument()
  })
})
