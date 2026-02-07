import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

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
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'Habits', 'Tasks', 'Favorites']

  const { getPinnedCategories, getAllCategories } = useCategoryStore()
  const { getHabitsByCategory, isHabitCompletedToday } = useHabitStore()

  const pinnedCategories = getPinnedCategories().map((category) => {
    const habits = getHabitsByCategory(category.id)
    const completedToday = habits.filter((h) => isHabitCompletedToday(h.id)).length
    const progress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

    return toUICategory(category, habits.length, progress)
  })

  const allCollections = getAllCategories()
    .filter((c) => !c.isPinned)
    .map((category) => {
      const habits = getHabitsByCategory(category.id)
      const ui = toUICategory(category, habits.length)

      if (category.id === 'reading') {
        ui.items = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500']
      }

      return ui
    })

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-white">
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
          </div>
        </div>

        {/* Filter Chips */}
        <div className="w-full px-4 pb-2">
          <div className="grid grid-cols-4 gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={clsx(
                  'whitespace-nowrap rounded-full py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm',
                  activeFilter === filter
                    ? 'bg-primary text-background-dark shadow-[0_4px_12px_rgba(19,236,91,0.3)]'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/5 dark:bg-surface-dark dark:text-gray-300 dark:hover:bg-white/5'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow space-y-6 overflow-y-auto px-4 pb-32">
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
              <button
                key={category.id}
                type="button"
                onClick={() => navigate(`/category/${category.id}`)}
                className={clsx(
                  'group relative h-40 min-w-[280px] cursor-pointer snap-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br text-left',
                  category.gradient
                )}
              >
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
              </button>
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
                />
              </div>
            ))}

            {/* New Category Button */}
            <div className="break-inside-avoid">
              <button className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-5 transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
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

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />
    </div>
  )
}

function CategoryCard({ category, onClick }: { category: Category; onClick?: () => void }) {
  const Wrapper: any = onClick ? 'button' : 'div'
  const wrapperProps = onClick ? ({ type: 'button', onClick } as const) : undefined

  const getColorClasses = (color: string) => {
    const map: Record<string, any> = {
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
