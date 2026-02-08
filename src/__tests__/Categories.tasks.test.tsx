/**
 * Phase 5 - Categories tasks integration test (Tasks chip filters categories with tasks)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

vi.mock('@/store/useCategoryStore', () => ({
  useCategoryStore: (selector?: any) => {
    const state = {
      categories: mockCategories,
      togglePinned: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: vi.fn(),
      getPinnedCategories: () => mockCategories.filter((c) => c.isPinned).sort((a, b) => a.order - b.order),
      getAllCategories: () => [...mockCategories].sort((a, b) => a.order - b.order),
    }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: (selector?: any) => {
    const state = {
      habits: mockHabits,
      getHabitsByCategory: (categoryId: string) => mockHabits.filter((h) => h.categoryId === categoryId),
      isHabitCompletedToday: () => false,
      clearCategoryFromHabits: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  },
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

describe('Categories (Phase 5 tasks integration)', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockCategories = []
    mockHabits = []
    mockTasks = []
  })

  it('shows all categories including those with tasks', async () => {
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

    mockTasks = [
      {
        id: 't1',
        title: 'Work task',
        completed: false,
        status: 'todo',
        priority: 'medium',
        category: 'Work',
        categoryId: 'work',
        tags: [],
        subtasks: [],
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]

    renderPage()

    // Both categories should be visible (no filter tabs)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
