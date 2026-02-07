/**
 * Categories reorder mode UI test
 * (intentionally minimal: verify entry/exit and no crashes)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Categories } from '@/pages/bottomNav/Categories'
import type { Category } from '@/types/category'

vi.mock('@/components/BottomNav', () => ({
  BottomNav: () => null,
}))

vi.mock('@/components/SideNav', () => ({
  SideNav: () => null,
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const categories: Category[] = [
  {
    id: 'work',
    name: 'Work',
    icon: 'work',
    color: 'blue',
    order: 1,
    isPinned: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
  },
  {
    id: 'home',
    name: 'Home',
    icon: 'home',
    color: 'primary',
    order: 2,
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
  },
]

const reorderCategoriesMock = vi.fn()

vi.mock('@/store/useCategoryStore', () => ({
  useCategoryStore: (selector?: any) => {
    const state = {
      categories,
      getPinnedCategories: () => categories.filter((c) => c.isPinned),
      getAllCategories: () => [...categories].sort((a, b) => a.order - b.order),
      togglePinned: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: reorderCategoriesMock,
    }

    return typeof selector === 'function' ? selector(state) : state
  },
}))

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: (selector?: any) => {
    const state = {
      habits: [],
      getHabitsByCategory: () => [],
      isHabitCompletedToday: () => false,
      clearCategoryFromHabits: vi.fn(),
    }

    return typeof selector === 'function' ? selector(state) : state
  },
}))

describe('Categories (reorder mode)', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    reorderCategoriesMock.mockClear()
  })

  it('enters and exits reorder mode via kebab menu', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    )

    const actionButtons = screen.getAllByLabelText('Category actions')
    await user.click(actionButtons[0])

    await user.click(screen.getByRole('menuitem', { name: 'Reorder' }))

    expect(screen.getByText('Reorder categories')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Done' }).length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Done' })[0])

    expect(screen.queryByText('Reorder categories')).not.toBeInTheDocument()
  })
})
