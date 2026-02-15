/**
 * Phase 5 - CategoryDetail tasks integration test (toggle + tasks rendering)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CategoryDetail } from '@/components/categories/CategoryDetail'
import type { Category } from '@/types/category'
import type { Habit } from '@/types/habit'
import type { Task } from '@/types/task'

let mockCategory: Category | undefined
let mockHabits: Habit[] = []
let mockTasks: Task[] = []

vi.mock('@/store/useCategoryStore', () => ({
  useCategoryStore: () => ({
    getCategoryById: () => mockCategory,
  }),
}))

vi.mock('@/store/useHabitStore', () => ({
  useHabitStore: () => ({
    getHabitsByCategory: () => mockHabits,
    isHabitCompletedToday: () => false,
    toggleHabitCompletion: vi.fn(),
  }),
}))

vi.mock('@/store/useTaskStore', () => ({
  useTaskStore: (selector?: any) => {
    const state = { tasks: mockTasks }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={['/category/home']}>
      <Routes>
        <Route path="/category/:categoryId" element={<CategoryDetail />} />
      </Routes>
    </MemoryRouter>
  )

describe('CategoryDetail (Phase 5 tasks)', () => {
  beforeEach(() => {
    mockCategory = {
      id: 'home',
      name: 'Home',
      icon: 'home',
      color: 'primary',
      order: 1,
      isPinned: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
    }

    mockHabits = [
      {
        id: 'h1',
        name: 'Home habit',
        description: '',
        frequency: 'daily',
        timeOfDay: 'anytime',
        duration: 5,
        reminderEnabled: false,
        reminderTime: '09:00',
        categoryId: 'home',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletions: 0,
        completedDates: [],
      } as Habit,
    ]

    mockTasks = [
      {
        id: 't1',
        title: 'Home task',
        completed: false,
        status: 'todo',
        priority: 'medium',
        category: 'Personal',
        categoryId: 'home',
        tags: [],
        subtasks: [],
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]
  })

  it('toggle to Tasks shows tasks and Habits hides tasks', async () => {
    const user = userEvent.setup()

    renderDetail()

    // Default is Both
    expect(screen.getByText('Home habit')).toBeInTheDocument()
    expect(screen.getByText('Home task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Habits' }))
    expect(screen.getByText('Home habit')).toBeInTheDocument()
    expect(screen.queryByText('Home task')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tasks' }))
    expect(screen.getByText('Home task')).toBeInTheDocument()
    expect(screen.queryByText('Home habit')).not.toBeInTheDocument()
  })
})
