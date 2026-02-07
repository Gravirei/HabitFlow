import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const cloneDefaults = async () => {
  const { DEFAULT_CATEGORIES } = await import('@/constants/defaultCategories')
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, stats: { ...c.stats } }))
}

describe('categories import/export helpers', () => {
  let mockDate = 1000000000000

  beforeEach(async () => {
    mockDate = 1000000000000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })

    localStorage.clear()

    // Ensure the store is reset to defaults each time.
    const { useCategoryStore } = await import('@/store/useCategoryStore')
    const state = useCategoryStore.getState()
    useCategoryStore.setState({
      categories: await cloneDefaults(),
      getCategoryById: state.getCategoryById,
      getPinnedCategories: state.getPinnedCategories,
      getAllCategories: state.getAllCategories,
      addCategory: state.addCategory,
      updateCategory: state.updateCategory,
      deleteCategory: state.deleteCategory,
      reorderCategories: state.reorderCategories,
      togglePinned: state.togglePinned,
    })

    await useCategoryStore.persist?.rehydrate?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('1) Export bundle includes version/exportedAt and categories only', async () => {
    const { buildCategoryExportBundle } = await import('@/lib/categories/importExport')
    const bundle = buildCategoryExportBundle()

    expect(bundle.version).toBe(1)
    expect(bundle.exportedAt).toMatch(/\d{4}-\d{2}-\d{2}T/)
    expect(Array.isArray(bundle.categories)).toBe(true)

    // Decision B1: categories-only.
    expect((bundle as any).habits).toBeUndefined()
    expect((bundle as any).tasks).toBeUndefined()
  })

  it('2) Import invalid JSON fails with a friendly error', async () => {
    const { parseCategoryExportBundle } = await import('@/lib/categories/importExport')

    expect(() => parseCategoryExportBundle('{not-valid-json')).toThrow(/invalid json/i)
  })

  it('3) Import conflict strategy (I1): same-name categories are skipped', async () => {
    const { parseCategoryExportBundle, applyCategoryImport } = await import('@/lib/categories/importExport')
    const { useCategoryStore } = await import('@/store/useCategoryStore')

    // Existing store already includes default category "Work".
    const raw = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: [
        {
          id: 'work-duplicate',
          name: 'work',
          icon: 'work',
          color: 'blue',
          isPinned: false,
          order: 1,
          createdAt: new Date().toISOString(),
          stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
        },
        {
          id: 'unique-1',
          name: 'My Imported',
          icon: 'category',
          color: 'purple',
          isPinned: false,
          order: 2,
          createdAt: new Date().toISOString(),
          stats: { habitCount: 0, taskCount: 0, completionRate: 0 },
        },
      ],
    })

    const bundle = parseCategoryExportBundle(raw)
    const summary = applyCategoryImport(bundle)

    expect(summary.importedCount).toBe(1)
    expect(summary.skippedCount).toBe(1)

    const all = useCategoryStore.getState().categories
    expect(all.some((c) => c.name === 'My Imported')).toBe(true)

    // Existing "Work" should remain.
    expect(all.some((c) => c.name === 'Work')).toBe(true)
  })
})
