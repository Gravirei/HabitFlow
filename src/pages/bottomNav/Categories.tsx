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

import { CreateCategoryModal, EditCategoryModal } from '@/components/categories'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'
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

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    gradient: category.gradient ?? variant.gradient,
    textColor: category.textColor,
    height: category.height ?? variant.height,
    type: variant.type,
    count: buildCategoryCountLabel(habitCount),
    progress,
  }
}

export function Categories() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  type CategoryFilter = 'All' | 'Habits' | 'Tasks' | 'Favorites' | 'Empty'
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All')

  type CategorySort = 'order' | 'name' | 'mostUsed' | 'completionToday'

  const [sort, setSort] = useState<CategorySort>(() => {
    try {
      const stored = localStorage.getItem('categories.sort')
      if (
        stored === 'order' ||
        stored === 'name' ||
        stored === 'mostUsed' ||
        stored === 'completionToday'
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

  const filters: Array<{ key: CategoryFilter; label: string; disabled?: boolean; hint?: string }> = [
    { key: 'All', label: 'All' },
    { key: 'Habits', label: 'Habits' },
    { key: 'Tasks', label: 'Tasks', disabled: true, hint: 'Coming soon' },
    { key: 'Favorites', label: 'Favorites' },
    { key: 'Empty', label: 'Empty' },
  ]

  const categories = useCategoryStore((state) => state.categories)
  const { togglePinned, deleteCategory, reorderCategories } = useCategoryStore()

  const habits = useHabitStore((state) => state.habits)
  const { isHabitCompletedToday, clearCategoryFromHabits, getHabitsByCategory } = useHabitStore()

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
        completedToday: number
        completionTodayPct: number
      }
    >()

    for (const category of orderedCategories) {
      map.set(category.id, { habitCount: 0, completedToday: 0, completionTodayPct: 0 })
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

    for (const [categoryId, stats] of map.entries()) {
      map.set(categoryId, {
        ...stats,
        completionTodayPct:
          stats.habitCount > 0
            ? Math.round((stats.completedToday / stats.habitCount) * 100)
            : 0,
      })
    }

    return map
  }, [orderedCategories, habits, isHabitCompletedToday])

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const normalizedSearchQuery = useMemo(() => {
    return deferredSearchQuery.trim().toLocaleLowerCase()
  }, [deferredSearchQuery])

  const filterCounts = useMemo(() => {
    const all = orderedCategories.length
    let habitsCount = 0
    let favoritesCount = 0
    let emptyCount = 0

    for (const category of orderedCategories) {
      const stats = derivedStatsByCategoryId.get(category.id)
      const habitCount = stats?.habitCount ?? 0

      if (habitCount > 0) habitsCount += 1
      if (category.isPinned) favoritesCount += 1
      if (habitCount === 0 && category.stats.taskCount === 0) emptyCount += 1
    }

    return {
      All: all,
      Habits: habitsCount,
      Favorites: favoritesCount,
      Empty: emptyCount,
    }
  }, [orderedCategories, derivedStatsByCategoryId])

  const isCategoryVisibleForFilter = (category: StoreCategory) => {
    const stats = derivedStatsByCategoryId.get(category.id)
    const habitCount = stats?.habitCount ?? 0

    switch (activeFilter) {
      case 'Habits':
        return habitCount > 0
      case 'Favorites':
        return category.isPinned
      case 'Empty':
        return habitCount === 0 && category.stats.taskCount === 0
      case 'Tasks':
      case 'All':
      default:
        return true
    }
  }

  const matchesSearchQuery = (category: StoreCategory) => {
    if (!normalizedSearchQuery) return true
    return category.name.toLocaleLowerCase().includes(normalizedSearchQuery)
  }

  const sortCategories = (values: StoreCategory[]) => {
    const next = [...values]

    const statFor = (category: StoreCategory) =>
      derivedStatsByCategoryId.get(category.id) ?? {
        habitCount: 0,
        completedToday: 0,
        completionTodayPct: 0,
      }

    next.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name)

      switch (sort) {
        case 'name':
          return nameCmp
        case 'mostUsed': {
          const diff = statFor(b).habitCount - statFor(a).habitCount
          return diff !== 0 ? diff : nameCmp
        }
        case 'completionToday': {
          const diff = statFor(b).completionTodayPct - statFor(a).completionTodayPct
          return diff !== 0 ? diff : nameCmp
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
        if (!isCategoryVisibleForFilter(category)) return false
        return matchesSearchQuery(category)
      })
    )
  }, [pinnedStoreCategories, activeFilter, normalizedSearchQuery, sort, derivedStatsByCategoryId])

  const filteredUnpinnedStoreCategories = useMemo(() => {
    if (activeFilter === 'Favorites') return []

    return sortCategories(
      unpinnedStoreCategories.filter((category) => {
        if (!isCategoryVisibleForFilter(category)) return false
        return matchesSearchQuery(category)
      })
    )
  }, [unpinnedStoreCategories, activeFilter, normalizedSearchQuery, sort, derivedStatsByCategoryId])

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

  const habitsInDeleteCategory = deleteCategoryId
    ? getHabitsByCategory(deleteCategoryId).length
    : 0

  const handleConfirmDelete = () => {
    if (!deleteCategoryId) return
    clearCategoryFromHabits(deleteCategoryId)
    deleteCategory(deleteCategoryId)
    setDeleteCategoryId(null)
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-white"
      onClickCapture={() => setOpenMenuCategoryId(null)}
      data-testid="categories-page"
    >
      {/* Header - Consistent with Habits Page */}
      <header className="sticky top-0 z-20 flex shrink-0 flex-col gap-4 bg-background-light p-4 pb-2 dark:bg-background-dark">
        <div className="flex h-12 items-center justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <button
              onClick={() => setIsSideNavOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-surface-dark"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          {/* Title or Search Input */}
          <div className="flex-1 overflow-hidden px-2">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-full border-none bg-slate-100 px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:bg-surface-dark"
                  />
                </motion.div>
              ) : (
                <motion.h2
                  key="title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-lg font-bold tracking-tight"
                >
                  Categories
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          <div className="flex size-12 shrink-0 items-center justify-end gap-2">
            {isReorderMode ? (
              <button
                type="button"
                onClick={() => setIsReorderMode(false)}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen)
                  if (isSearchOpen) setSearchQuery('')
                }}
                className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                  isSearchOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-surface-dark'
                }`}
              >
                <span className="material-symbols-outlined">{isSearchOpen ? 'close' : 'search'}</span>
              </button>
            )}
          </div>
        </div>

        {!isReorderMode && (
          <>
            <div className="flex items-center justify-end px-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as CategorySort)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-surface-dark dark:text-gray-200"
                  aria-label="Sort categories"
                >
                  <option value="order">Order</option>
                  <option value="name">Name (A→Z)</option>
                  <option value="mostUsed">Most used</option>
                  <option value="completionToday">Completion today</option>
                </select>
              </label>
            </div>

            {/* Filter Chips */}
            <div className="w-full px-4 pb-2">
              <div className="grid grid-cols-5 gap-2">
                {filters.map((filter) => {
                  const count = filterCounts[filter.key as keyof typeof filterCounts]
                  const label =
                    typeof count === 'number' && filter.key !== 'Tasks'
                      ? `${filter.label} (${count})`
                      : filter.label

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => {
                        if (filter.disabled) return
                        setActiveFilter(filter.key)
                      }}
                      disabled={filter.disabled}
                      className={clsx(
                        'whitespace-nowrap rounded-full py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm',
                        filter.disabled &&
                          'cursor-not-allowed border border-gray-200 bg-white/60 text-gray-400 dark:border-white/5 dark:bg-surface-dark/60 dark:text-gray-500',
                        !filter.disabled &&
                          (activeFilter === filter.key
                            ? 'bg-primary text-background-dark shadow-[0_4px_12px_rgba(19,236,91,0.3)]'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/5 dark:bg-surface-dark dark:text-gray-300 dark:hover:bg-white/5')
                      )}
                      aria-label={
                        filter.disabled && filter.hint
                          ? `${filter.label}. ${filter.hint}`
                          : label
                      }
                      title={filter.disabled ? filter.hint : undefined}
                    >
                      {label}
                      {filter.disabled && filter.hint ? (
                        <span className="sr-only">{filter.hint}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div className="mt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {filters.find((f) => f.key === 'Tasks')?.hint}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow space-y-6 overflow-y-auto px-4 pb-32">
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
            {/* Pinned Section */}
            <div>
              <div className="mb-3 flex items-center justify-between px-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pinned
                </h2>
                <span className="material-symbols-outlined text-sm text-gray-400">more_horiz</span>
              </div>
              <div className="no-scrollbar -mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-4">
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
                      'group relative h-40 min-w-[280px] cursor-pointer snap-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      category.gradient
                    )}
                  >
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
                    {category.color === 'primary' && (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(19,236,91,0.15),transparent_70%)] opacity-30"></div>
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
                      </>
                    )}
                    {category.color === 'blue' && (
                      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
                    )}

                    <div className="relative z-10 flex h-full flex-col justify-between p-5">
                      <div className="flex items-start justify-between">
                        <div
                          className={clsx(
                            'rounded-xl p-2.5 backdrop-blur-sm',
                            category.color === 'primary'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-blue-500/20 text-blue-500'
                          )}
                        >
                          <span className="material-symbols-outlined">{category.icon}</span>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-black backdrop-blur-sm dark:text-white">
                          {category.progress}% Done
                        </span>
                      </div>
                      <div>
                        <h3 className={clsx('mb-1 text-xl font-bold', category.textColor)}>
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Collections - Masonry Grid */}
            <div>
              <div className="mb-3 px-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  All Collections
                </h2>
              </div>
              <div className="columns-2 gap-4 space-y-4 px-2">
                {allCollections.map((category) => (
                  <div key={category.id} className="break-inside-avoid">
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
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-5 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:hover:bg-white/5"
                    aria-label="Create new category"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <span className="material-symbols-outlined">add</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      New Category
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-24 right-4 z-20">
        <button
          onClick={() => navigate('/new-habit')}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.4)] transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">
            add
          </span>
        </button>
      </div>

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
        'relative flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors dark:border-white/5 dark:bg-surface-dark dark:shadow-none',
        isDragging && 'opacity-50'
      )}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined">{category.icon}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {category.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {category.isPinned ? 'Pinned' : 'Not pinned'}
          </div>
        </div>
      </div>

      <button
        type="button"
        ref={setActivatorNodeRef}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-surface-dark dark:text-gray-300 dark:hover:bg-white/5"
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
    <div className="pointer-events-none rounded-3xl border border-white/10 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <span className="material-symbols-outlined">{category.icon}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{category.name}</div>
          <div className="text-xs text-white/70">Release to drop</div>
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
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          !isOpen && 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        )}
        aria-label="Category actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
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
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 p-1 shadow-2xl backdrop-blur-xl"
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
              label={isPinned ? 'Unpin' : 'Pin'}
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
            <div className="my-1 h-px bg-white/10" />
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
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        variant === 'danger'
          ? 'text-red-200 hover:bg-red-500/10'
          : 'text-gray-100 hover:bg-white/5'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <span
        className={clsx(
          'material-symbols-outlined text-[18px]',
          variant === 'danger' ? 'text-red-300' : 'text-gray-300'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>{label}</span>
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
  // Use a div with button semantics so we don't nest <button> elements (quick actions uses a real <button>).
  const Wrapper: ElementType = onClick ? 'div' : 'div'
  const wrapperProps = onClick
    ? ({
        role: 'button',
        tabIndex: 0,
        onClick,
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
        bg: 'bg-emerald-100 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        ring: 'ring-emerald-500/20',
        bar: 'bg-emerald-500',
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        ring: 'ring-purple-500/20',
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-500/10',
        text: 'text-yellow-600 dark:text-yellow-400',
        ring: 'ring-yellow-500/20',
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-orange-500/20',
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-500/10',
        text: 'text-indigo-600 dark:text-indigo-400',
        ring: 'ring-indigo-500/20',
        bar: 'bg-indigo-500',
      },
      pink: {
        bg: 'bg-pink-100 dark:bg-pink-500/10',
        text: 'text-pink-600 dark:text-pink-400',
        ring: 'ring-pink-500/20',
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        ring: 'ring-red-500/20',
      },
      teal: {
        bg: 'bg-teal-100 dark:bg-teal-500/10',
        text: 'text-teal-600 dark:text-teal-400',
        ring: 'ring-teal-500/20',
      },
      slate: {
        bg: 'bg-white dark:bg-white/5',
        text: 'text-slate-600 dark:text-slate-300',
        ring: 'ring-white/5',
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
          'relative flex w-full flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-b p-5 transition-all duration-300 hover:scale-[1.02]',
          onClick &&
            'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          category.gradient,
          category.height
        )}
      >
        {quickActions}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white">{category.name}</h3>
          <p className="text-xs text-white/80">{category.count}</p>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={clsx(
        'relative flex w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] dark:border-white/5 dark:bg-surface-dark dark:shadow-none',
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
              'mb-1 flex h-16 w-16 items-center justify-center rounded-full ring-1',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined text-3xl">{category.icon}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
            <div className={clsx('h-full w-3/4', colors.bar)}></div>
          </div>
        </div>
      )}

      {category.type === 'simple' && (
        <div className="flex h-full flex-col justify-between">
          <div className="absolute right-0 top-0 p-4">
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}

      {category.type === 'icon-bg' && (
        <div className="flex h-full flex-col justify-between">
          <div className="absolute right-0 top-0 p-4 opacity-50">
            <span className="material-symbols-outlined pointer-events-none absolute -right-8 -top-8 rotate-12 transform text-[6rem] text-yellow-50 dark:text-yellow-500/5">
              {category.icon}
            </span>
          </div>
          <div
            className={clsx(
              'relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-1',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined">{category.icon}</span>
          </div>
          <div className="relative z-10 mt-auto pt-4">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}

      {category.type === 'list' && (
        <div className="flex h-full flex-col justify-between">
          <div
            className={clsx(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-xl ring-1',
              colors.bg,
              colors.text,
              colors.ring
            )}
          >
            <span className="material-symbols-outlined">{category.icon}</span>
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-bold leading-tight text-black dark:text-white">
              Read
              <br />
              List
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full bg-gray-300 ring-2 ring-white dark:ring-surface-dark"></div>
              <div className="inline-block h-6 w-6 rounded-full bg-gray-400 ring-2 ring-white dark:ring-surface-dark"></div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 text-[8px] text-white ring-2 ring-white dark:ring-surface-dark">
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
                'flex h-12 w-12 items-center justify-center rounded-xl ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              Daily
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div className={clsx('h-full w-1/2', colors.bar)}></div>
            </div>
          </div>
        </div>
      )}

      {category.type === 'simple-card' && (
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-start justify-between">
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            {category.name === 'Home' && (
              <span className="font-mono text-xs text-gray-400">06</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
        </div>
      )}

      {category.type === 'avatars' && (
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full ring-1',
                colors.bg,
                colors.text,
                colors.ring
              )}
            >
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            <div className="flex -space-x-2">
              <div className="dark:border-surface-card h-5 w-5 rounded-full border border-white bg-gray-200 dark:bg-gray-600"></div>
              <div className="dark:border-surface-card h-5 w-5 rounded-full border border-white bg-gray-300 dark:bg-gray-500"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}
    </Wrapper>
  )
}
