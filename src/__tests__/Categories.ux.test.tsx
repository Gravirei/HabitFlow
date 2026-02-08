/**
 * Phase 4 - Categories enhanced UX tests (search / filters / sorting / empty states)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
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

type TaskStoreState = {
  tasks: Array<{ id: string; categoryId?: string }>
  clearCategoryFromTasks: (categoryId: string) => void
}

const reorderCategoriesMock = vi.fn()

let mockCategories: Category[] = []
let mockHabits: Habit[] = []
let mockTasks: Array<{ id: string; categoryId?: string }> = []
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

const clearCategoryFromTasksMock = vi.fn()

vi.mock('@/store/useTaskStore', () => ({
  useTaskStore: (selector?: any) => {
    const state: TaskStoreState = {
      tasks: mockTasks,
      clearCategoryFromTasks: clearCategoryFromTasksMock,
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
    clearCategoryFromTasksMock.mockClear()
    mockCategories = []
    mockHabits = []
    mockTasks = []
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

    // Phase 5: All filter shows categories with habits OR tasks.
    mockTasks = [
      { id: 't-work-1', categoryId: 'work' },
      { id: 't-home-1', categoryId: 'home' },
    ]

    renderCategories()

    await user.click(screen.getByRole('button', { name: 'Open search' }))

    const input = await screen.findByPlaceholderText('Search categories...')
    await user.type(input, 'wor')

    // Categories uses useDeferredValue(searchQuery), so results update async.
    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
    })
  })

  it('default view shows all categories', async () => {
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

    // Both categories should be visible (including empty ones)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
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

    // Phase 5: All filter shows categories with habits OR tasks.
    mockTasks = [
      { id: 't-a', categoryId: 'a' },
      { id: 't-b', categoryId: 'b' },
    ]

    renderCategories()

    await user.selectOptions(screen.getByLabelText('Sort categories'), 'name')

    // Alpha should appear before Beta in the DOM.
    const pos = screen.getByText('Alpha').compareDocumentPosition(screen.getByText('Beta'))
    expect(pos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

    // Phase 5: All filter shows categories with habits OR tasks.
    mockTasks = [{ id: 't-home-1', categoryId: 'home' }]

    renderCategories()

    await user.click(screen.getByRole('button', { name: 'Open search' }))
    await user.type(await screen.findByPlaceholderText('Search categories...'), 'zzz')

    expect(await screen.findByText('No categories match your search')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('shows onboarding empty state when there are no categories', () => {
    mockCategories = []
    renderCategories()

    expect(screen.getByText('Create your first category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create category' })).toBeInTheDocument()
  })

  it('Favorites sort shows pinned first, then unpinned', async () => {
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

    await user.selectOptions(screen.getByLabelText('Sort categories'), 'favorites')

    // Work (pinned) should appear before Home (unpinned)
    const workPos = screen.getByText('Work').compareDocumentPosition(screen.getByText('Home'))
    expect(workPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('all categories are shown by default', async () => {
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
      {
        id: 'work',
        name: 'Work',
        icon: 'work',
        color: 'blue',
        order: 2,
        isPinned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    renderCategories()

    // Both categories should be visible
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })
})
