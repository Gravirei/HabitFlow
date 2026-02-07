/**
 * Phase 4 - Categories enhanced UX tests (search / filters / sorting / empty states)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Categories } from '@/pages/bottomNav/Categories'
import type { Category } from '@/types/category'
import type { Habit } from '@/types/habit'

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

type CategoryStoreState = {
  categories: Category[]
  togglePinned: (id: string) => void
  deleteCategory: (id: string) => void
  reorderCategories: (ids: string[]) => void
  getPinnedCategories: () => Category[]
  getAllCategories: () => Category[]
}

type HabitStoreState = {
  habits: Habit[]
  getHabitsByCategory: (categoryId: string) => Habit[]
  isHabitCompletedToday: (habitId: string) => boolean
  clearCategoryFromHabits: (categoryId: string) => void
}

const reorderCategoriesMock = vi.fn()

let mockCategories: Category[] = []
let mockHabits: Habit[] = []
let completedTodayIds = new Set<string>()

vi.mock('@/store/useCategoryStore', () => ({
  useCategoryStore: (selector?: any) => {
    const state: CategoryStoreState = {
      categories: mockCategories,
      togglePinned: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: reorderCategoriesMock,
      getPinnedCategories: () => mockCategories.filter((c) => c.isPinned).sort((a, b) => a.order - b.order),
      getAllCategories: () => [...mockCategories].sort((a, b) => a.order - b.order),
    }

    return typeof selector === 'function' ? selector(state) : state
  },
}))

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: (selector?: any) => {
    const state: HabitStoreState = {
      habits: mockHabits,
      getHabitsByCategory: (categoryId: string) => mockHabits.filter((h) => h.categoryId === categoryId),
      isHabitCompletedToday: (habitId: string) => completedTodayIds.has(habitId),
      clearCategoryFromHabits: vi.fn(),
    }

    return typeof selector === 'function' ? selector(state) : state
  },
}))

const renderCategories = () => {
  return render(
    <MemoryRouter>
      <Categories />
    </MemoryRouter>
  )
}

describe('Categories (Phase 4 UX)', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    reorderCategoriesMock.mockClear()
    mockCategories = []
    mockHabits = []
    completedTodayIds = new Set()

    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  })

  it('search filters both pinned and unpinned categories', async () => {
    const user = userEvent.setup()

    mockCategories = [
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

    renderCategories()

    await user.click(screen.getByRole('button', { name: 'Open search' }))

    const input = await screen.findByPlaceholderText('Search categories...')
    await user.type(input, 'wo')

    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('Empty filter shows only categories with no habits', async () => {
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

    mockHabits = [
      {
        id: 'h1',
        name: 'Deep work',
        description: '',
        frequency: 'daily',
        timeOfDay: 'anytime',
        duration: 5,
        reminderEnabled: false,
        reminderTime: '09:00',
        categoryId: 'work',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletions: 0,
        completedDates: [],
      } as Habit,
    ]

    renderCategories()

    const emptyChip = screen.getByRole('button', { name: /Empty/i })
    await user.click(emptyChip)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Work')).not.toBeInTheDocument()
  })

  it('sorting by name orders categories A→Z', async () => {
    const user = userEvent.setup()

    mockCategories = [
      {
        id: 'b',
        name: 'Beta',
        icon: 'work',
        color: 'blue',
        order: 1,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
      {
        id: 'a',
        name: 'Alpha',
        icon: 'home',
        color: 'primary',
        order: 2,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderCategories()

    await user.selectOptions(screen.getByLabelText('Sort categories'), 'name')

    const cards = screen.getAllByRole('button')

    // Safer: check order within "All Collections" section.
    const allCollectionsHeading = screen.getByText('All Collections')
    const section = allCollectionsHeading.closest('div')
    expect(section).toBeTruthy()

    // Query text nodes in order of appearance
    const alphaIndex = screen.getByText('Alpha').compareDocumentPosition(screen.getByText('Beta'))
    expect(alphaIndex & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    expect(cards.length).toBeGreaterThan(0)
  })

  it('no-results empty state appears and Clear search restores results', async () => {
    const user = userEvent.setup()

    mockCategories = [
      {
        id: 'home',
        name: 'Home',
        icon: 'home',
        color: 'primary',
        order: 1,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderCategories()

    await user.click(screen.getByRole('button', { name: 'Open search' }))
    await user.type(await screen.findByPlaceholderText('Search categories...'), 'zzz')

    expect(screen.getByText('No categories match your search')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('shows onboarding empty state when there are no categories', () => {
    mockCategories = []
    renderCategories()

    expect(screen.getByText('Create your first category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create category' })).toBeInTheDocument()
  })

  it('Favorites filter shows pinned-only view', async () => {
    const user = userEvent.setup()

    mockCategories = [
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

    renderCategories()

    await user.click(screen.getByRole('button', { name: /Favorites/i }))

    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.queryByText('All Collections')).not.toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('Tasks chip is visible but disabled with coming soon hint', () => {
    mockCategories = [
      {
        id: 'home',
        name: 'Home',
        icon: 'home',
        color: 'primary',
        order: 1,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderCategories()

    const tasksChip = screen.getByRole('button', { name: /Tasks/i })
    expect(tasksChip).toBeDisabled()
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0)
  })
})
