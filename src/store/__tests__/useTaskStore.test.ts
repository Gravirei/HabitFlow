/**
 * useTaskStore helpers + persist/migration semantics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Task } from '@/types/task'

const sampleTasks: Task[] = [
  {
    id: 't1',
    title: 'One',
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
  {
    id: 't2',
    title: 'Two',
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
  {
    id: 't3',
    title: 'Three',
    completed: false,
    status: 'todo',
    priority: 'medium',
    category: 'Other',
    tags: [],
    subtasks: [],
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
]

describe('useTaskStore (helpers + migration)', () => {
  beforeEach(async () => {
    localStorage.clear()

    // Reset singleton store state between tests.
    const { useTaskStore } = await import('@/store/useTaskStore')
    const state = useTaskStore.getState()

    useTaskStore.setState({
      tasks: [],
      setTasks: state.setTasks,
      addTask: state.addTask,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      toggleTask: state.toggleTask,
      getTasksByCategory: state.getTasksByCategory,
      clearCategoryFromTasks: state.clearCategoryFromTasks,
    })

    await useTaskStore.persist?.rehydrate?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getTasksByCategory(categoryId) returns only matching tasks', async () => {
    const { useTaskStore } = await import('@/store/useTaskStore')

    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.setTasks(sampleTasks)
    })

    expect(result.current.getTasksByCategory('work').map((t) => t.id)).toEqual(['t1'])
    expect(result.current.getTasksByCategory('home').map((t) => t.id)).toEqual(['t2'])
  })

  it('clearCategoryFromTasks(categoryId) clears association but does not delete tasks', async () => {
    const { useTaskStore } = await import('@/store/useTaskStore')

    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.setTasks(sampleTasks)
      result.current.clearCategoryFromTasks('home')
    })

    const t2 = result.current.tasks.find((t) => t.id === 't2')
    expect(t2).toBeTruthy()
    expect(t2!.categoryId).toBeUndefined()

    expect(result.current.tasks).toHaveLength(3)
  })

  it("migrates legacy localStorage['tasks'] into task-storage when task-storage is empty", async () => {
    // Arrange: write legacy tasks only
    localStorage.setItem('tasks', JSON.stringify([sampleTasks[0], sampleTasks[2]]))

    vi.resetModules()
    const { useTaskStore: freshStore } = await import('@/store/useTaskStore')

    await act(async () => {
      await freshStore.persist.rehydrate()
    })

    const { result } = renderHook(() => freshStore())
    expect(result.current.tasks.map((t) => t.id)).toEqual(['t1', 't3'])
  })
})
