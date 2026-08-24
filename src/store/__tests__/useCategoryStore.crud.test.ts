/**
 * useCategoryStore CRUD/pin/reorder/persist semantics
 * Mirrors patterns from src/__tests__/useHabitStore.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCategoryStore } from '@/store/useCategoryStore'
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories'

const cloneDefaults = () => DEFAULT_CATEGORIES.map((c) => ({ ...c, stats: { ...c.stats } }))

describe('useCategoryStore (CRUD semantics)', () => {
  let mockDate = 1000000000000

  beforeEach(async () => {
    // Deterministic IDs
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })

    // Ensure clean persistence between tests
    localStorage.clear()

    // Reset store to defaults - preserve methods
    const state = useCategoryStore.getState()
    useCategoryStore.setState({
      categories: cloneDefaults(),
      getCategoryById: state.getCategoryById,
      getPinnedCategories: state.getPinnedCategories,
      getAllCategories: state.getAllCategories,
      addCategory: state.addCategory,
      updateCategory: state.updateCategory,
      deleteCategory: state.deleteCategory,
      reorderCategories: state.reorderCategories,
      togglePinned: state.togglePinned,
    })

    // Make sure persist layer is not holding onto previous in-memory hydrated state
    // (rehydrate will apply merge logic using current localStorage)
    await useCategoryStore.persist?.rehydrate?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('1) Defaults initialize (12)', () => {
    const { result } = renderHook(() => useCategoryStore())
    expect(result.current.categories).toHaveLength(12)

    const orders = result.current.getAllCategories().map((c) => c.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('2) addCategory increments order and sets stats', () => {
    const { result } = renderHook(() => useCategoryStore())

    let createdId: string
    act(() => {
      const created = result.current.addCategory({
        name: 'New Category',
        icon: 'category',
        color: 'primary',
        isPinned: false,
        order: undefined as unknown as number, // omit order; ensure defaulting logic
      })
      createdId = created.id
    })

    const created = result.current.getCategoryById(createdId!)
    expect(created).toBeTruthy()
    expect(created!.order).toBe(13)
    expect(created!.stats).toEqual({ habitCount: 0, taskCount: 0, completionRate: 0 })
  })

  it('3) updateCategory patches', () => {
    const { result } = renderHook(() => useCategoryStore())

    let id: string
    act(() => {
      id = result.current.addCategory({
        name: 'Patch Me',
        icon: 'edit',
        color: 'blue',
        isPinned: false,
        order: 99,
      }).id
    })

    act(() => {
      result.current.updateCategory(id!, { name: 'Patched', color: 'red' })
    })

    const updated = result.current.getCategoryById(id!)
    expect(updated!.name).toBe('Patched')
    expect(updated!.color).toBe('red')
    expect(updated!.icon).toBe('edit')
  })

  it('4) togglePinned toggles only isPinned', () => {
    const { result } = renderHook(() => useCategoryStore())

    let id: string
    act(() => {
      id = result.current.addCategory({
        name: 'Pin Me',
        icon: 'push_pin',
        color: 'emerald',
        isPinned: false,
        order: 50,
      }).id
    })

    const before = result.current.getCategoryById(id!)!

    act(() => {
      result.current.togglePinned(id!)
    })

    const after = result.current.getCategoryById(id!)!
    expect(after.isPinned).toBe(true)

    // Everything else should be identical
    const { isPinned: _beforePinned, ...beforeRest } = before
    const { isPinned: _afterPinned, ...afterRest } = after
    expect(afterRest).toEqual(beforeRest)
  })

  it('5) reorderCategories updates order', () => {
    const { result } = renderHook(() => useCategoryStore())

    const initial = result.current.getAllCategories()
    const [a, b, c] = initial

    act(() => {
      result.current.reorderCategories([c.id, b.id, a.id])
    })

    const next = result.current.getAllCategories()
    const nextA = next.find((x) => x.id === a.id)!
    const nextB = next.find((x) => x.id === b.id)!
    const nextC = next.find((x) => x.id === c.id)!

    expect(nextC.order).toBe(1)
    expect(nextB.order).toBe(2)
    expect(nextA.order).toBe(3)
  })

  it('6) persist merge behavior (persisted categories win)', async () => {
    // Arrange: persisted categories should replace current defaults via persist.merge()
    const persistedCategories = [
      {
        id: 'persisted-1',
        name: 'Persisted One',
        icon: 'star',
        color: 'purple',
        isPinned: true,
        order: 1,
        createdAt: '2026-01-02T00:00:00.000Z',
        stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
      },
    ]

    // Important: useCategoryStore is a singleton module. To test persist hydration/merge behavior
    // deterministically, set localStorage first and then reload the module.
    localStorage.setItem(
      'category-storage',
      JSON.stringify({ state: { categories: persistedCategories }, version: 0 })
    )

    vi.resetModules()
    const { useCategoryStore: freshStore } = await import('@/store/useCategoryStore')

    await act(async () => {
      await freshStore.persist.rehydrate()
    })

    const { result } = renderHook(() => freshStore())
    expect(result.current.categories).toEqual(persistedCategories)
  })

  it('7) duplicate name rejection (case-insensitive)', () => {
    const { result } = renderHook(() => useCategoryStore())

    expect(() => {
      act(() => {
        result.current.addCategory({
          name: 'work', // default category exists: "Work"
          icon: 'work',
          color: 'blue',
          isPinned: false,
          order: 999,
        })
      })
    }).toThrow(/already exists/i)
  })
})
