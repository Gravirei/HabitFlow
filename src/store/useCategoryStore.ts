import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, CategoryId, CategoryStats } from '@/types/category'
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories'

interface CategoryState {
  categories: Category[]

  // Selectors
  getCategoryById: (id: CategoryId) => Category | undefined
  getPinnedCategories: () => Category[]
  getAllCategories: () => Category[]

  // CRUD
  addCategory: (
    category: Omit<Category, 'id' | 'createdAt' | 'stats'> & { id?: CategoryId }
  ) => Category
  updateCategory: (
    id: CategoryId,
    patch: Partial<Omit<Category, 'id' | 'createdAt'>>
  ) => void
  deleteCategory: (id: CategoryId) => void
  reorderCategories: (orderedIds: CategoryId[]) => void
  togglePinned: (id: CategoryId) => void
}

const sortByOrder = (categories: Category[]) =>
  [...categories].sort((a, b) => a.order - b.order)

const createStats = (): CategoryStats => ({
  habitCount: 0,
  taskCount: 0,
  completionRate: 0,
})

const ensureCreatedAt = (category: Category): Category => {
  if (category.createdAt) return category
  return { ...category, createdAt: new Date().toISOString() }
}

const seedDefaults = () => DEFAULT_CATEGORIES.map(ensureCreatedAt)

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      // State
      categories: seedDefaults(),

      getCategoryById: (id) => get().categories.find((c) => c.id === id),

      getPinnedCategories: () =>
        sortByOrder(get().categories).filter((c) => c.isPinned),

      getAllCategories: () => sortByOrder(get().categories),

      addCategory: (categoryInput) => {
        const now = new Date().toISOString()

        const normalizedName = categoryInput.name.trim()
        if (!normalizedName) {
          throw new Error('Category name is required.')
        }

        const normalizedKey = normalizedName.toLocaleLowerCase()
        const isDuplicate = get().categories.some(
          (c) => c.name.trim().toLocaleLowerCase() === normalizedKey
        )
        if (isDuplicate) {
          throw new Error('A category with that name already exists.')
        }

        const maxOrder = get().categories.reduce(
          (max, c) => Math.max(max, c.order),
          0
        )

        const created: Category = {
          ...categoryInput,
          name: normalizedName,
          id: categoryInput.id ?? Date.now().toString(),
          createdAt: now,
          order: categoryInput.order ?? maxOrder + 1,
          isPinned: categoryInput.isPinned ?? false,
          stats: createStats(),
        }

        set((state) => ({ categories: [...state.categories, created] }))
        return created
      },

      updateCategory: (id, patch) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
      },

      reorderCategories: (orderedIds) => {
        set((state) => {
          const orderMap = new Map<CategoryId, number>()
          orderedIds.forEach((id, index) => orderMap.set(id, index + 1))

          const categories = state.categories.map((c) => {
            const nextOrder = orderMap.get(c.id)
            return nextOrder ? { ...c, order: nextOrder } : c
          })

          return { categories }
        })
      },

      togglePinned: (id) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }))
      },
    }),
    {
      name: 'category-storage',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
      merge: (persisted, current) => {
        // Zustand persist passes the *inner* state object to merge(), not `{ state }`.
        const typedPersisted = persisted as Partial<CategoryState> | undefined
        const persistedCategories = typedPersisted?.categories

        return {
          ...current,
          ...typedPersisted,
          categories:
            persistedCategories && persistedCategories.length > 0
              ? persistedCategories
              : current.categories,
        }
      },
    }
  )
)
