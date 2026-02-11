import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  CreateCategoryModal,
  EditCategoryModal,
  CategoryTemplateLibraryModal,
  CategoryImportExportModal,
} from '@/components/categories'
import type { CategoryTemplatePack } from '@/types/categoryTemplate'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useTaskStore } from '@/store/useTaskStore'
import type { Category as StoreCategory } from '@/types/category'

// UI-only category shape used by the existing card variants
interface Category {
  id: string
  name: string
  count: string
  progress?: number
  icon: string
  color: string
  gradient?: string
  imagePath?: string
  textColor?: string
  height?: string
  type?:
    | 'progress'
    | 'simple'
    | 'icon-bg'
    | 'list'
    | 'progress-card'
    | 'simple-card'
    | 'image-card'
    | 'avatars'
  items?: string[]
}

const buildCategoryCountLabel = (habitCount: number) =>
  `${habitCount} Habit${habitCount === 1 ? '' : 's'}`

const mapLegacyHabitCategoryToCategoryId = (legacy?: string): string | undefined => {
  if (!legacy) return undefined

  // Keep in sync with `useHabitStore`'s internal compatibility mapping.
  switch (legacy) {
    case 'health':
      return 'health'
    case 'work':
      return 'work'
    case 'personal':
      return 'home'
    default:
      return undefined
  }
}

const getVariantForCategoryId = (id: string): Pick<Category, 'type' | 'height' | 'gradient'> => {
  // Preserve existing masonry/variant look using real category IDs.
  switch (id) {
    case 'fitness':
      return { type: 'progress', height: 'h-auto' }
    case 'zen':
      return { type: 'simple', height: 'h-36' }
    case 'finance':
      return { type: 'icon-bg', height: 'h-40' }
    case 'reading':
      return { type: 'list', height: 'h-56' }
    case 'learning':
      return { type: 'progress-card', height: 'h-auto' }
    case 'home':
    case 'health':
    case 'work':
      return { type: 'simple-card', height: 'h-auto' }
    case 'social':
      return { type: 'avatars', height: 'h-36' }
    case 'outdoor':
      return { type: 'image-card', height: 'h-40', gradient: 'from-sky-400 to-blue-600' }
    default:
      return { type: 'simple-card', height: 'h-auto' }
  }
}

const toUICategory = (category: StoreCategory, habitCount: number, progress?: number): Category => {
  const variant = getVariantForCategoryId(category.id)

  // If category has an image, use 'image-card' type, otherwise use variant type
  const type = category.imagePath ? 'image-card' : variant.type

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    gradient: category.gradient ?? variant.gradient,
    imagePath: category.imagePath,
    textColor: category.textColor,
    height: category.height ?? variant.height,
    type,
    count: buildCategoryCountLabel(habitCount),
    progress,
  }
}

export function Categories() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  type CategorySort = 'order' | 'name' | 'mostUsed' | 'completionToday' | 'favorites'

  const [sort, setSort] = useState<CategorySort>(() => {
    try {
      const stored = localStorage.getItem('categories.sort')
      if (
        stored === 'order' ||
        stored === 'name' ||
        stored === 'mostUsed' ||
        stored === 'completionToday' ||
        stored === 'favorites'
      ) {
        return stored
      }
    } catch {
      // ignore
    }

    return 'order'
  })

  useEffect(() => {
    try {
      localStorage.setItem('categories.sort', sort)
    } catch {
      // ignore
    }
  }, [sort])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<string | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [reorderIds, setReorderIds] = useState<string[]>([])
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const categories = useCategoryStore((state) => state.categories)
  const { togglePinned, deleteCategory, reorderCategories, addCategory } = useCategoryStore()

  const habits = useHabitStore((state) => state.habits)
  const { isHabitCompletedToday, clearCategoryFromHabits, getHabitsByCategory, addHabit } = useHabitStore()

  const tasks = useTaskStore((state) => state.tasks)
  const clearCategoryFromTasks = useTaskStore((state) => state.clearCategoryFromTasks)

  // Handle importing category template pack
  const handleImportTemplatePack = (
    pack: CategoryTemplatePack,
    selectedCategories: string[],
    selectedHabits: { [categoryName: string]: string[] }
  ) => {
    let importedCount = 0
    const categoryIdMap: { [categoryName: string]: string } = {}

    // Import selected categories
    selectedCategories.forEach((categoryName) => {
      const categoryTemplate = pack.categories.find((c) => c.name === categoryName)
      if (!categoryTemplate) return

      // Create category
      const newCategory = addCategory({
        name: categoryTemplate.name,
        icon: categoryTemplate.icon,
        color: categoryTemplate.color,
        gradient: categoryTemplate.gradient,
        textColor: categoryTemplate.textColor,
        isPinned: false,
      })

      categoryIdMap[categoryName] = newCategory.id
      importedCount++

      // Import selected habits for this category
      const habitsToImport = selectedHabits[categoryName] || []
      habitsToImport.forEach((habitName) => {
        const habitTemplate = categoryTemplate.habits.find((h) => h.name === habitName)
        if (!habitTemplate) return

        addHabit({
          name: habitTemplate.name,
          description: habitTemplate.description,
          icon: habitTemplate.icon,
          categoryId: newCategory.id,
          frequency: habitTemplate.frequency,
          goal: habitTemplate.goal,
          goalPeriod: habitTemplate.goalPeriod,
          isActive: true,
          reminderEnabled: false,
          startDate: new Date().toISOString().split('T')[0],
        })
      })
    })

    if (importedCount > 0) {
      const totalHabits = Object.values(selectedHabits).reduce((sum, habits) => sum + habits.length, 0)
      toast.success(
        `✅ Imported ${importedCount} ${importedCount === 1 ? 'category' : 'categories'} with ${totalHabits} ${totalHabits === 1 ? 'habit' : 'habits'}!`
      )
    }
  }

  const orderedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order)
  }, [categories])

  const pinnedStoreCategories = useMemo(
    () => orderedCategories.filter((category) => category.isPinned),
    [orderedCategories]
  )

  const unpinnedStoreCategories = useMemo(
    () => orderedCategories.filter((category) => !category.isPinned),
    [orderedCategories]
  )

  const derivedStatsByCategoryId = useMemo(() => {
    const map = new Map<
      string,
      {
        habitCount: number
        taskCount: number
        completedToday: number
        completionTodayPct: number
      }
    >()

    for (const category of orderedCategories) {
      map.set(category.id, {
        habitCount: 0,
        taskCount: 0,
        completedToday: 0,
        completionTodayPct: 0,
      })
    }

    for (const habit of habits) {
      const categoryId = habit.categoryId ?? mapLegacyHabitCategoryToCategoryId(habit.category)

      if (!categoryId) continue
      const stats = map.get(categoryId)
      if (!stats) continue

      stats.habitCount += 1
      if (isHabitCompletedToday(habit.id)) {
        stats.completedToday += 1
      }
    }

    // Scan tasks once to compute taskCount per category.
    for (const task of tasks) {
      if (!task.categoryId) continue
      const stats = map.get(task.categoryId)
      if (!stats) continue
      stats.taskCount += 1
    }

    for (const [categoryId, stats] of map.entries()) {
      map.set(categoryId, {
        ...stats,
        completionTodayPct:
          stats.habitCount > 0 ? Math.round((stats.completedToday / stats.habitCount) * 100) : 0,
      })
    }

    return map
  }, [orderedCategories, habits, tasks, isHabitCompletedToday])

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const normalizedSearchQuery = useMemo(() => {
    return deferredSearchQuery.trim().toLocaleLowerCase()
  }, [deferredSearchQuery])

  const matchesSearchQuery = (category: StoreCategory) => {
    if (!normalizedSearchQuery) return true
    return category.name.toLocaleLowerCase().includes(normalizedSearchQuery)
  }

  const sortCategories = (values: StoreCategory[]) => {
    const next = [...values]

    const statFor = (category: StoreCategory) =>
      derivedStatsByCategoryId.get(category.id) ?? {
        habitCount: 0,
        taskCount: 0,
        completedToday: 0,
        completionTodayPct: 0,
      }

    next.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name)

      switch (sort) {
        case 'name':
          return nameCmp
        case 'mostUsed': {
          // Phase 5 decision (Option A): "Most used" reflects combined usage (habits + tasks).
          const diff =
            statFor(b).habitCount +
            statFor(b).taskCount -
            (statFor(a).habitCount + statFor(a).taskCount)
          return diff !== 0 ? diff : nameCmp
        }
        case 'completionToday': {
          const diff = statFor(b).completionTodayPct - statFor(a).completionTodayPct
          return diff !== 0 ? diff : nameCmp
        }
        case 'favorites': {
          // Sort pinned first, then unpinned, within each group alphabetically
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return nameCmp
        }
        case 'order':
        default: {
          const diff = a.order - b.order
          return diff !== 0 ? diff : nameCmp
        }
      }
    })

    return next
  }

  const filteredPinnedStoreCategories = useMemo(() => {
    return sortCategories(
      pinnedStoreCategories.filter((category) => {
        return matchesSearchQuery(category)
      })
    )
  }, [pinnedStoreCategories, normalizedSearchQuery, sort, derivedStatsByCategoryId])

  const filteredUnpinnedStoreCategories = useMemo(() => {
    return sortCategories(
      unpinnedStoreCategories.filter((category) => {
        return matchesSearchQuery(category)
      })
    )
  }, [unpinnedStoreCategories, normalizedSearchQuery, sort, derivedStatsByCategoryId])

  const pinnedCategories = useMemo(() => {
    return filteredPinnedStoreCategories.map((category) => {
      const stats = derivedStatsByCategoryId.get(category.id) ?? {
        habitCount: 0,
        completedToday: 0,
        completionTodayPct: 0,
      }

      return toUICategory(category, stats.habitCount, stats.completionTodayPct)
    })
  }, [filteredPinnedStoreCategories, derivedStatsByCategoryId])

  const allCollections = useMemo(() => {
    return filteredUnpinnedStoreCategories.map((category) => {
      const stats = derivedStatsByCategoryId.get(category.id) ?? {
        habitCount: 0,
        completedToday: 0,
        completionTodayPct: 0,
      }
      const ui = toUICategory(category, stats.habitCount)

      if (category.id === 'reading') {
        ui.items = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500']
      }

      return ui
    })
  }, [filteredUnpinnedStoreCategories, derivedStatsByCategoryId])

  useEffect(() => {
    if (!openMenuCategoryId && !isReorderMode) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuCategoryId(null)
        setIsReorderMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openMenuCategoryId, isReorderMode])

  useEffect(() => {
    if (!isReorderMode) return

    // When entering reorder mode, start from the current store order (including pinned)
    setIsSearchOpen(false)
    setSearchQuery('')
    setReorderIds(orderedCategories.map((c) => c.id))
    setOpenMenuCategoryId(null)
  }, [isReorderMode, orderedCategories])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || active.id === over.id) return

    setReorderIds((current) => {
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      const next = arrayMove(current, oldIndex, newIndex)

      // Persist in store immediately for fast feedback
      reorderCategories(next)
      return next
    })
  }

  const habitsInDeleteCategory = deleteCategoryId ? getHabitsByCategory(deleteCategoryId).length : 0

  const handleConfirmDelete = () => {
    if (!deleteCategoryId) return
    clearCategoryFromHabits(deleteCategoryId)
    clearCategoryFromTasks(deleteCategoryId)
    deleteCategory(deleteCategoryId)
    setDeleteCategoryId(null)
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-white"
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest('[data-prevent-menu-close]')) {
          return
        }
        setOpenMenuCategoryId(null)
      }}
      data-testid="categories-page"
    >
      {/* Ambient Background - Decorative */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] h-[30vh] w-[30vh] rounded-full bg-purple-500/10 blur-[80px]" />
      </div>

      {/* Header - Consistent with Habits Page */}
      <header className="sticky top-0 z-50 flex shrink-0 flex-col gap-4 border-b border-gray-200/50 bg-background-light/80 p-4 pb-2 backdrop-blur-xl transition-all dark:border-white/5 dark:bg-background-dark/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setIsSideNavOpen(true)}
                className="flex size-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-surface-dark"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>

              {/* Sort Dropdown - Moved to Left */}
              {!isReorderMode && (
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as CategorySort)}
                    className="appearance-none rounded-full border border-gray-200/50 bg-white/50 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-white hover:shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-gray-200 dark:hover:border-primary/50 dark:hover:bg-slate-800"
                    aria-label="Sort categories"
                    style={{
                      colorScheme: 'dark',
                    }}
                  >
                    <option value="order" className="bg-slate-900 text-gray-200">
                      Order
                    </option>
                    <option value="name" className="bg-slate-900 text-gray-200">
                      Name
                    </option>
                    <option value="mostUsed" className="bg-slate-900 text-gray-200">
                      Most Used
                    </option>
                    <option value="completionToday" className="bg-slate-900 text-gray-200">
                      Completion
                    </option>
                    <option value="favorites" className="bg-slate-900 text-gray-200">
                      Favorites
                    </option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 dark:text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              )}
            </div>

            {/* Title or Search Input */}
            <div className="flex-1 overflow-visible px-2">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full"
                  >
                    <div className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-4 py-2 transition-all focus-within:border-primary/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 dark:border-white/10 dark:bg-slate-800/50 dark:focus-within:bg-slate-800">
                      <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.h2
                    key="title"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-center text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    Categories
                  </motion.h2>
                )}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2">
              {isReorderMode ? (
                <button
                  type="button"
                  onClick={() => setIsReorderMode(false)}
                  className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTemplatesModalOpen(true)}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label="Templates"
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportExportModalOpen(true)}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label="Import/Export"
                  >
                    Import/Export
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(!isSearchOpen)
                      if (isSearchOpen) setSearchQuery('')
                    }}
                    aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                    className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                      isSearchOpen
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-surface-dark'
                    }`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {isSearchOpen ? 'close' : 'search'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col space-y-8 overflow-visible px-4 pb-32 pt-6">
        {isReorderMode ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-surface-dark">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Reorder categories
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Drag the handle to reorder. Press Escape or Done to finish.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReorderMode(false)}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Done
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={reorderIds} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {reorderIds.map((id) => {
                    const category = orderedCategories.find((c) => c.id === id)
                    if (!category) return null

                    return <SortableCategoryTile key={id} category={category} />
                  })}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeDragId ? (
                  <ReorderOverlayTile
                    category={orderedCategories.find((c) => c.id === activeDragId)}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <>
            {orderedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 bg-white p-10 text-center dark:border-white/10 dark:bg-surface-dark">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <span className="material-symbols-outlined text-3xl">category</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Create your first category</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Organize habits into collections like Work, Health, or Home.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.35)] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
                >
                  Create category
                </button>
              </div>
            ) : pinnedCategories.length === 0 && allCollections.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 bg-white p-10 text-center dark:border-white/10 dark:bg-surface-dark">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-300">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">No categories match your search</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try a different keyword or reset your filters.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {isSearchOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-surface-dark dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      Clear search
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Pinned Collection */}
                {pinnedCategories.length > 0 ? (
                  <section>
                    <div className="mb-4 flex items-center justify-between px-2">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined text-primary">push_pin</span>
                        Favorites
                      </h2>
                    </div>
                    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                      {pinnedCategories.map((category) => (
                        <div
                          key={category.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/category/${category.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              navigate(`/category/${category.id}`)
                            }
                          }}
                          className={clsx(
                            'group relative aspect-[4/3] w-[85vw] min-w-[280px] cursor-pointer snap-center overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 text-left shadow-lg backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-slate-900/40 sm:w-auto',
                            !category.imagePath && category.gradient
                          )}
                        >
                          {/* Background Image or Gradient */}
                          {category.imagePath ? (
                            <img
                              src={category.imagePath}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <>
                              {/* Rich Background Effects */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/5" />
                              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150 group-hover:bg-white/20" />
                            </>
                          )}
                          
                          {/* Dark gradient overlay for image cards */}
                          {category.imagePath && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          )}

                          <CategoryQuickActions
                            categoryId={category.id}
                            isPinned
                            isOpen={openMenuCategoryId === category.id}
                            onToggle={() =>
                              setOpenMenuCategoryId((current) =>
                                current === category.id ? null : category.id
                              )
                            }
                            onEdit={() => setEditCategoryId(category.id)}
                            onTogglePin={() => togglePinned(category.id)}
                            onDelete={() => setDeleteCategoryId(category.id)}
                            onReorder={() => setIsReorderMode(true)}
                          />

                          <div className="relative z-10 flex h-full flex-col justify-between p-6">
                            <div className="flex items-start justify-between">
                              <div
                                className={clsx(
                                  'rounded-2xl p-3 backdrop-blur-md transition-transform duration-300 group-hover:rotate-6',
                                  category.color === 'primary'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-white/20 text-white'
                                )}
                              >
                                <span className="material-symbols-outlined text-2xl">
                                  {category.icon}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                                <span>{category.progress}%</span>
                              </div>
                            </div>
                            <div>
                              <h3
                                className={clsx(
                                  'mb-1 text-2xl font-bold tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-x-1'
                                )}
                              >
                                {category.name}
                              </h3>
                              <p className="text-sm font-medium text-white/70">{category.count}</p>
                            </div>
                          </div>

                          {/* Progress Bar Background */}
                          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/20">
                            <div
                              style={{ width: `${category.progress}%` }}
                              className="h-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.5)] transition-all duration-1000 ease-out"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* All Collections - Masonry Grid */}
                <div>
                  <div className="mb-4 px-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      All Collections
                    </h2>
                  </div>
                  <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
                    {allCollections.map((category) => (
                      <div
                        key={category.id}
                        className={clsx(
                          'relative break-inside-avoid',
                          openMenuCategoryId === category.id && 'z-50'
                        )}
                      >
                        <CategoryCard
                          category={category}
                          onClick={() => navigate(`/category/${category.id}`)}
                          quickActions={
                            <CategoryQuickActions
                              categoryId={category.id}
                              isPinned={false}
                              isOpen={openMenuCategoryId === category.id}
                              onToggle={() =>
                                setOpenMenuCategoryId((current) =>
                                  current === category.id ? null : category.id
                                )
                              }
                              onEdit={() => setEditCategoryId(category.id)}
                              onTogglePin={() => togglePinned(category.id)}
                              onDelete={() => setDeleteCategoryId(category.id)}
                              onReorder={() => setIsReorderMode(true)}
                            />
                          }
                        />
                      </div>
                    ))}

                    {/* New Category Button */}
                    <div className="break-inside-avoid">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group flex h-32 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-300 bg-transparent p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:hover:border-primary/50 dark:hover:bg-primary/10"
                        aria-label="Create new category"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-primary/20 group-hover:text-primary dark:bg-white/5 dark:text-gray-500 dark:group-hover:bg-primary/20">
                          <span className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:rotate-90">
                            add
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-500 transition-colors group-hover:text-primary dark:text-gray-400">
                          New Category
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(categoryId) => {
          setIsCreateModalOpen(false)
          navigate(`/category/${categoryId}`)
        }}
      />
      {editCategoryId && (
        <EditCategoryModal
          isOpen={true}
          categoryId={editCategoryId}
          onClose={() => setEditCategoryId(null)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteCategoryId)}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete category?"
        message={`This will remove the category and set ${habitsInDeleteCategory} habit${
          habitsInDeleteCategory === 1 ? '' : 's'
        } to Uncategorized. This action can't be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />

      <CategoryTemplateLibraryModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onImportPack={handleImportTemplatePack}
      />

      <CategoryImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
      />

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />
    </div>
  )
}

function SortableCategoryTile({ category }: { category: StoreCategory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative flex items-center justify-between rounded-3xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none',
        isDragging && 'opacity-50 ring-2 ring-primary/50'
      )}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors">
          <span className="material-symbols-outlined">{category.icon}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {category.name}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {category.isPinned ? 'Pinned' : 'Not pinned'}
          </div>
        </div>
      </div>

      <button
        type="button"
        ref={setActivatorNodeRef}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/50 bg-white/50 text-gray-500 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
        aria-label={`Drag handle for ${category.name}`}
        {...listeners}
      >
        <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
      </button>
    </div>
  )
}

function ReorderOverlayTile({ category }: { category?: StoreCategory }) {
  if (!category) return null

  return (
    <div className="pointer-events-none rounded-3xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <span className="material-symbols-outlined">{category.icon}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {category.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Release to drop</div>
        </div>
      </div>
    </div>
  )
}

function CategoryQuickActions({
  categoryId,
  isPinned,
  isOpen,
  onToggle,
  onEdit,
  onTogglePin,
  onReorder,
  onDelete,
}: {
  categoryId: string
  isPinned: boolean
  isOpen: boolean
  onToggle: () => void
  onEdit: () => void
  onTogglePin: () => void
  onReorder?: () => void
  onDelete: () => void
}) {
  const menuId = `category-actions-${categoryId}`

  return (
    <div
      className="absolute right-3 top-3 z-20"
      data-no-propagate="true"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          !isOpen &&
            'mobile-touch:opacity-100 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
        )}
        data-prevent-menu-close
        aria-label="Category actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onToggle()
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            onToggle()
          }
        }}
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Category actions"
            data-prevent-menu-close
            initial={{ opacity: 0, scale: 0.95, y: -4, originX: 1, originY: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionItem
              label="Edit"
              icon="edit"
              onSelect={() => {
                onToggle()
                onEdit()
              }}
            />
            <ActionItem
              label={isPinned ? 'Remove from Favorites' : 'Add to Favorites'}
              icon={isPinned ? 'keep_off' : 'keep'}
              onSelect={() => {
                onToggle()
                onTogglePin()
              }}
            />
            {onReorder && (
              <ActionItem
                label="Reorder"
                icon="drag_indicator"
                onSelect={() => {
                  onToggle()
                  onReorder()
                }}
              />
            )}
            <div className="my-1 h-px bg-gray-200/50 dark:bg-white/10" />
            <ActionItem
              label="Delete"
              icon="delete"
              variant="danger"
              onSelect={() => {
                onToggle()
                onDelete()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionItem({
  label,
  icon,
  variant = 'default',
  onSelect,
}: {
  label: string
  icon: string
  variant?: 'default' | 'danger'
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={clsx(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        variant === 'danger'
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <span
        className={clsx(
          'material-symbols-outlined text-[18px]',
          variant === 'danger'
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-400 dark:text-gray-400'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function CategoryCard({
  category,
  onClick,
  quickActions,
}: {
  category: Category
  onClick?: () => void
  quickActions?: ReactNode
}) {
  // Use a div with button semantics for accessibility while allowing nested interactive elements
  const Wrapper: ElementType = onClick ? 'div' : 'div'
  const wrapperProps = onClick
    ? ({
        role: 'button',
        tabIndex: 0,
        onClick: (e: React.MouseEvent) => {
          // Only trigger if not clicking on interactive elements
          if ((e.target as HTMLElement).closest('[data-no-propagate]')) {
            return
          }
          onClick()
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        },
      } as const)
    : undefined

  const getColorClasses = (color: string) => {
    const map: Record<string, Record<string, string>> = {
      emerald: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        ring: 'ring-emerald-500/20 dark:ring-emerald-400/20',
        bar: 'bg-emerald-500',
      },
      purple: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        ring: 'ring-purple-500/20 dark:ring-purple-400/20',
      },
      yellow: {
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        ring: 'ring-yellow-500/20 dark:ring-yellow-400/20',
      },
      orange: {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-orange-500/20 dark:ring-orange-400/20',
      },
      indigo: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        ring: 'ring-indigo-500/20 dark:ring-indigo-400/20',
        bar: 'bg-indigo-500',
      },
      pink: {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400',
        ring: 'ring-pink-500/20 dark:ring-pink-400/20',
      },
      red: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        ring: 'ring-red-500/20 dark:ring-red-400/20',
      },
      teal: {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-600 dark:text-teal-400',
        ring: 'ring-teal-500/20 dark:ring-teal-400/20',
      },
      slate: {
        bg: 'bg-slate-500/10 dark:bg-white/10',
        text: 'text-slate-600 dark:text-slate-300',
        ring: 'ring-slate-500/20 dark:ring-white/10',
      },
    }
    return map[color] || map.slate
  }

  const colors = getColorClasses(category.color)

  if (category.type === 'image-card') {
    return (
      <Wrapper
        {...wrapperProps}
        className={clsx(
          'group relative flex w-full flex-col justify-end overflow-visible rounded-3xl bg-gradient-to-b p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
          onClick &&
            'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          !category.imagePath && category.gradient,
          category.height
        )}
      >
        {/* Inner wrapper for overflow control - keeps image contained */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Background Image or Gradient */}
          {category.imagePath ? (
            <img
              src={category.imagePath}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            category.gradient && (
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`} />
            )
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Quick actions - rendered after overlay so it appears on top */}
        {quickActions}

        {/* Category icon */}
        <div className="relative z-10 mb-auto">
          <div
            className={clsx(
              'inline-flex rounded-2xl p-3 backdrop-blur-md transition-transform duration-300 group-hover:rotate-6',
              category.color === 'primary' ? 'bg-primary/20 text-primary' : 'bg-white/20 text-white'
            )}
          >
            <span className="material-symbols-outlined text-2xl">{category.icon}</span>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h3 className="text-xl font-bold drop-shadow-md">{category.name}</h3>
          <p className="text-sm font-medium opacity-90">{category.count}</p>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={clsx(
        'group relative flex w-full flex-col overflow-visible rounded-3xl border border-white/20 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80 hover:shadow-lg dark:border-white/5 dark:bg-slate-900/40 dark:hover:bg-slate-900/60',
        onClick &&
          'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        category.height
      )}
    >
      {quickActions}
      {category.type === 'progress' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={clsx(
              'mb-1 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined text-3xl">{category.icon}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div className={clsx('h-full w-3/4 rounded-full', colors.bar)}></div>
          </div>
        </div>
      )}

      {category.type === 'simple' && (
        <div className="flex h-full flex-col justify-between">
          <div className="absolute right-0 top-0 p-4">
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:rotate-12',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined text-2xl">{category.icon}</span>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
          </div>
        </div>
      )}

      {category.type === 'icon-bg' && (
        <div className="flex h-full flex-col justify-between">
          <div className="absolute right-0 top-0 p-4 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
            <span className="material-symbols-outlined pointer-events-none absolute -right-8 -top-8 rotate-12 transform text-[7rem] text-slate-900/5 dark:text-white/5">
              {category.icon}
            </span>
          </div>
          <div
            className={clsx(
              'relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined text-2xl">{category.icon}</span>
          </div>
          <div className="relative z-10 mt-auto pt-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
          </div>
        </div>
      )}

      {category.type === 'list' && (
        <div className="flex h-full flex-col justify-between">
          <div
            className={clsx(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined text-2xl">{category.icon}</span>
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-bold leading-tight text-slate-800 dark:text-white">
              {category.name.split(' ').map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </h3>
            <p className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
            <div className="flex -space-x-2 overflow-hidden pl-1">
              <div className="inline-block h-8 w-8 rounded-full bg-slate-200 ring-2 ring-white dark:bg-slate-700 dark:ring-slate-800"></div>
              <div className="inline-block h-8 w-8 rounded-full bg-slate-300 ring-2 ring-white dark:bg-slate-600 dark:ring-slate-800"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-[10px] font-bold text-white ring-2 ring-white dark:bg-slate-500 dark:ring-slate-800">
                +2
              </div>
            </div>
          </div>
        </div>
      )}

      {category.type === 'progress-card' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined text-2xl">{category.icon}</span>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
              Daily
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div className={clsx('h-full w-1/2 rounded-full', colors.bar)}></div>
            </div>
          </div>
        </div>
      )}

      {category.type === 'simple-card' && (
        <div className="flex flex-col gap-3">
          <div className="mb-1 flex items-start justify-between">
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-all duration-300 group-hover:scale-110',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined text-2xl">{category.icon}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
          </div>
        </div>
      )}

      {category.type === 'avatars' && (
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined text-2xl">{category.icon}</span>
            </div>
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 dark:border-slate-800 dark:bg-slate-600"></div>
              <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-300 dark:border-slate-800 dark:bg-slate-500"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{category.name}</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {category.count}
            </p>
          </div>
        </div>
      )}
    </Wrapper>
  )
}
