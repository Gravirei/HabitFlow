import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { CATEGORY_TEMPLATE_LIBRARY } from '@/constants/categoryTemplateLibrary'
import type { CategoryTemplatePack } from '@/types/categoryTemplate'

interface CategoryTemplateLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onImportPack: (
    pack: CategoryTemplatePack,
    selectedCategories: string[],
    selectedHabits: { [categoryName: string]: string[] }
  ) => void
}

interface CategoryTemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: CategoryTemplatePack | null
  onImport: (
    selectedCategories: string[],
    selectedHabits: { [categoryName: string]: string[] }
  ) => void
}

// Category Template Preview Modal with Selective Import
function CategoryTemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onImport,
}: CategoryTemplatePreviewModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedHabits, setSelectedHabits] = useState<{ [categoryName: string]: Set<string> }>(
    {} as any
  )

  useEffect(() => {
    if (isOpen && template) {
      // Select all categories and habits by default
      const allCategories = new Set(template.categories.map((c) => c.name))
      setSelectedCategories(allCategories)

      const allHabits: { [categoryName: string]: Set<string> } = {}
      template.categories.forEach((cat) => {
        allHabits[cat.name] = new Set(cat.habits.map((h) => h.name))
      })
      setSelectedHabits(allHabits)
    }
  }, [isOpen, template])

  if (!template) return null

  const toggleCategory = (categoryName: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName)
      // Also deselect all habits in this category
      const newHabits = { ...selectedHabits }
      delete newHabits[categoryName]
      setSelectedHabits(newHabits)
    } else {
      newSelected.add(categoryName)
      // Select all habits in this category
      const category = template.categories.find((c) => c.name === categoryName)
      if (category) {
        const newHabits = { ...selectedHabits }
        newHabits[categoryName] = new Set(category.habits.map((h) => h.name))
        setSelectedHabits(newHabits)
      }
    }
    setSelectedCategories(newSelected)
  }

  const toggleHabit = (categoryName: string, habitName: string) => {
    const newHabits = { ...selectedHabits }
    if (!newHabits[categoryName]) {
      newHabits[categoryName] = new Set()
    }

    if (newHabits[categoryName].has(habitName)) {
      newHabits[categoryName].delete(habitName)
      // If no habits selected, deselect the category
      if (newHabits[categoryName].size === 0) {
        delete newHabits[categoryName]
        const newCategories = new Set(selectedCategories)
        newCategories.delete(categoryName)
        setSelectedCategories(newCategories)
      }
    } else {
      newHabits[categoryName].add(habitName)
      // Make sure category is selected
      const newCategories = new Set(selectedCategories)
      newCategories.add(categoryName)
      setSelectedCategories(newCategories)
    }
    setSelectedHabits(newHabits)
  }

  const handleImport = () => {
    const selectedCategoriesArray = Array.from(selectedCategories)
    const selectedHabitsObject: { [categoryName: string]: string[] } = {}

    Object.keys(selectedHabits).forEach((categoryName) => {
      selectedHabitsObject[categoryName] = Array.from(selectedHabits[categoryName])
    })

    onImport(selectedCategoriesArray, selectedHabitsObject)
  }

  const totalSelected = selectedCategories.size
  const totalHabitsSelected = Object.values(selectedHabits).reduce(
    (sum, habits) => sum + habits.size,
    0
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm"
          />

          {/* Preview Modal */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        'flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ring-1 ring-black/5',
                        template.color
                      )}
                    >
                      <span className="material-symbols-outlined text-3xl text-white">
                        {template.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Selection Summary */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    <span className="material-symbols-outlined text-base">folder</span>
                    {totalSelected} {totalSelected === 1 ? 'category' : 'categories'}
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {totalHabitsSelected} {totalHabitsSelected === 1 ? 'habit' : 'habits'}
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="max-h-[calc(85vh-220px)] overflow-y-auto p-6">
                <div className="space-y-4">
                  {template.categories.map((category) => {
                    const isCategorySelected = selectedCategories.has(category.name)
                    const categoryHabits = selectedHabits[category.name] || new Set()

                    return (
                      <div
                        key={category.name}
                        className={clsx(
                          'overflow-hidden rounded-2xl border-2 transition-all',
                          isCategorySelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5'
                            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50'
                        )}
                      >
                        {/* Category Header */}
                        <div className="flex items-center gap-4 p-4">
                          <button
                            onClick={() => toggleCategory(category.name)}
                            className={clsx(
                              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all',
                              isCategorySelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {isCategorySelected && (
                              <span className="material-symbols-outlined text-base text-white">
                                check
                              </span>
                            )}
                          </button>

                          <div
                            className={clsx(
                              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
                              category.gradient
                            )}
                          >
                            <span
                              className={clsx(
                                'material-symbols-outlined text-2xl',
                                category.textColor
                              )}
                            >
                              {category.icon}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {category.habits.length}{' '}
                              {category.habits.length === 1 ? 'habit' : 'habits'}
                            </p>
                          </div>
                        </div>

                        {/* Habits List */}
                        {isCategorySelected && (
                          <div className="space-y-2 px-4 pb-4">
                            {category.habits.map((habit) => {
                              const isHabitSelected = categoryHabits.has(habit.name)

                              return (
                                <button
                                  key={habit.name}
                                  onClick={() => toggleHabit(category.name, habit.name)}
                                  className={clsx(
                                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all',
                                    isHabitSelected
                                      ? 'bg-blue-100 dark:bg-blue-500/20'
                                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                                  )}
                                >
                                  <div
                                    className={clsx(
                                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all',
                                      isHabitSelected
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                    )}
                                  >
                                    {isHabitSelected && (
                                      <span className="material-symbols-outlined text-sm text-white">
                                        check
                                      </span>
                                    )}
                                  </div>

                                  <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                                    {habit.icon}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {habit.name}
                                    </div>
                                    {habit.description && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {habit.description}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {habit.goal}× {habit.goalPeriod}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={totalSelected === 0}
                    className={clsx(
                      'flex-1 rounded-xl px-6 py-3 font-semibold transition-all',
                      totalSelected === 0
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                    )}
                  >
                    Import Selected
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Library Template Card Component
function LibraryCategoryTemplateCard({
  template,
  onClick,
}: {
  template: CategoryTemplatePack
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all duration-200 hover:border-gray-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
    >
      {/* Gradient Background */}
      <div
        className={clsx(
          'absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10',
          template.color
        )}
      />

      <div className="relative p-5">
        {/* Icon and Badge */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={clsx(
              'flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ring-1 ring-black/5',
              template.color
            )}
          >
            <span className="material-symbols-outlined text-2xl text-white">{template.icon}</span>
          </div>

          {/* Category Badge */}
          <div className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {template.category}
          </div>
        </div>

        {/* Name and Description */}
        <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {template.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {template.description}
        </p>

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-base">folder</span>
            <span className="font-medium">{template.totalCategories}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span className="font-medium">{template.totalHabits}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-500">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="material-symbols-outlined text-lg text-white">arrow_forward</span>
        </div>
      </div>
    </motion.button>
  )
}

// Main Category Template Library Modal
export function CategoryTemplateLibraryModal({
  isOpen,
  onClose,
  onImportPack,
}: CategoryTemplateLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'productivity' | 'health' | 'personal' | 'learning' | 'lifestyle'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<CategoryTemplatePack | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  // Close search on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Close dropdown on outside click (mobile/tablet)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isDropdownOpen && hamburgerButtonRef.current) {
      const updatePosition = () => {
        const rect = hamburgerButtonRef.current!.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        })
      }
      updatePosition()

      // Update on scroll/resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isDropdownOpen])

  // Update sliding indicator position when category changes or modal opens
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = categoryRefs.current[selectedCategory]
      if (activeButton) {
        const container = activeButton.parentElement
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
          })
        }
      }
    }

    updateIndicator()
    const timer = setTimeout(updateIndicator, 100)
    return () => clearTimeout(timer)
  }, [selectedCategory, isOpen])

  const filteredTemplates = CATEGORY_TEMPLATE_LIBRARY.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: CategoryTemplatePack) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleImport = (
    selectedCategories: string[],
    selectedHabits: { [categoryName: string]: string[] }
  ) => {
    if (!previewTemplate) return

    onImportPack(previewTemplate, selectedCategories, selectedHabits)
    setIsPreviewOpen(false)
    setPreviewTemplate(null)
    onClose()
  }

  const categories = [
    { value: 'all' as const, label: 'All', icon: 'grid_view' },
    { value: 'productivity' as const, label: 'Productivity', icon: 'psychology' },
    { value: 'health' as const, label: 'Health', icon: 'favorite' },
    { value: 'personal' as const, label: 'Personal', icon: 'person' },
    { value: 'learning' as const, label: 'Learning', icon: 'school' },
    { value: 'lifestyle' as const, label: 'Lifestyle', icon: 'home' },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />

          {/* Modal Container */}
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-[90rem]"
            >
              <div
                className="relative flex h-[90vh] w-full flex-col rounded-[2.5rem] border border-white/20 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/5 dark:bg-gray-950/90 md:h-[50rem]"
                style={{ overflow: 'hidden' }}
              >
                {/* Decorative Background Elements */}
                <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
                <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]"></div>

                {/* Header */}
                <div className="relative z-10 border-b border-gray-200/50 bg-white/50 p-4 pb-4 backdrop-blur-xl dark:border-white/5 dark:bg-gray-950/50 sm:p-8 sm:pb-6">
                  <div className="flex items-center justify-between gap-3 sm:gap-6">
                    {/* Left side: Icon + Title */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 ring-1 ring-black/5 sm:h-14 sm:w-14">
                        <span className="material-symbols-outlined text-xl text-white sm:text-2xl">
                          store
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="mb-0.5 truncate text-lg font-bold leading-none text-gray-900 dark:text-white sm:mb-1 sm:text-2xl">
                          Template Store
                        </h2>
                        <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">
                          Import category packs
                        </p>
                      </div>
                    </div>

                    {/* Right: Hamburger (mobile/tablet) / Search + Filter Tabs (desktop) + Close */}
                    <div className="relative flex items-center gap-1">
                      {/* Hamburger Menu - mobile/tablet only */}
                      <button
                        ref={hamburgerButtonRef}
                        className="pointer-events-auto lg:hidden"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          
                          // Calculate position immediately before toggling
                          if (!isDropdownOpen && hamburgerButtonRef.current) {
                            const rect = hamburgerButtonRef.current.getBoundingClientRect()
                            const newPosition = {
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right,
                            }
                            setDropdownPosition(newPosition)
                          }
                          
                          setIsDropdownOpen(!isDropdownOpen)
                        }}
                        aria-label="Menu"
                      >
                        <div
                          className="flex size-10 items-center justify-center transition-all duration-150 active:scale-95"
                          aria-label="Menu"
                        >
                          {/* Animated Hamburger Icon */}
                          <div className="relative h-5 w-5">
                            <span
                              className={clsx(
                                'absolute left-0 top-1 h-0.5 w-5 rounded-full transition-all duration-300',
                                isDropdownOpen
                                  ? 'top-2 rotate-45 bg-gray-700 dark:bg-gray-200'
                                  : 'top-1 bg-gray-600 dark:bg-gray-400'
                              )}
                            />
                            <span
                              className={clsx(
                                'absolute left-0 top-2.5 h-0.5 w-5 rounded-full transition-all duration-300',
                                isDropdownOpen
                                  ? 'opacity-0 bg-gray-700 dark:bg-gray-200'
                                  : 'opacity-100 bg-gray-600 dark:bg-gray-400'
                              )}
                            />
                            <span
                              className={clsx(
                                'absolute left-0 top-4 h-0.5 w-5 rounded-full transition-all duration-300',
                                isDropdownOpen
                                  ? 'top-2 -rotate-45 bg-gray-700 dark:bg-gray-200'
                                  : 'top-4 bg-gray-600 dark:bg-gray-400'
                              )}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Search - visible on desktop only */}
                      <div ref={searchRef} className="relative hidden items-center lg:flex">
                        {!isSearchOpen && (
                          <button
                            onClick={() => setIsSearchOpen(true)}
                            className="relative z-10 flex size-10 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-gray-500 dark:hover:bg-white/5"
                            aria-label="Search"
                          >
                            <span className="material-symbols-outlined text-xl font-bold">
                              search
                            </span>
                          </button>
                        )}
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`absolute right-0 h-10 rounded-full border border-gray-200 bg-gray-100 pl-4 pr-10 text-sm text-gray-900 transition-all duration-300 ease-out placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white ${
                            isSearchOpen ? 'w-64 opacity-100' : 'pointer-events-none w-10 opacity-0'
                          }`}
                          autoFocus={isSearchOpen}
                        />
                        {isSearchOpen && (
                          <button
                            onClick={() => {
                              setSearchQuery('')
                              setIsSearchOpen(false)
                            }}
                            className="absolute right-1 z-10 flex size-8 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-700"
                            aria-label="Close search"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        )}
                      </div>

                      {/* Category Filter Tabs - desktop only */}
                      <div className="relative hidden lg:block">
                        <div className="scrollbar-hide relative flex items-center gap-2 overflow-x-auto pb-2">
                          {/* Animated sliding indicator */}
                          <motion.div
                            className="absolute bottom-2 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            animate={{
                              left: indicatorStyle.left,
                              width: indicatorStyle.width,
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 30,
                            }}
                          />

                          {categories.map((cat) => (
                            <button
                              key={cat.value}
                              ref={(el) => (categoryRefs.current[cat.value] = el)}
                              onClick={() => setSelectedCategory(cat.value)}
                              className={clsx(
                                'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                                selectedCategory === cat.value
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                              )}
                            >
                              <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Close button */}
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onClose()
                        }}
                        className="pointer-events-auto flex size-10 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-gray-500 dark:hover:bg-white/5"
                        aria-label="Close"
                      >
                        <span className="material-symbols-outlined text-xl font-bold">close</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content - Template Grid */}
                <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8">
                  {filteredTemplates.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 sm:h-20 sm:w-20">
                        <span className="material-symbols-outlined text-3xl text-gray-400 sm:text-4xl">
                          search_off
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                        No templates found
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {filteredTemplates.map((template) => (
                        <LibraryCategoryTemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateClick(template)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
      </AnimatePresence>

      {/* Preview Modal */}
      <CategoryTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewTemplate(null)
        }}
        template={previewTemplate}
        onImport={handleImport}
      />

      {/* Dropdown Menu Portal - renders to document.body to avoid clipping */}
      {createPortal(
        <AnimatePresence mode="wait">
          {isDropdownOpen && (
            <motion.div
              key="category-template-dropdown"
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                zIndex: 99999,
              }}
              className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800"
            >
              <div className="space-y-4 p-4">
                {/* Search in dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-300 bg-gray-100 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                    search
                  </span>
                </div>

                {/* Filter tabs in dropdown */}
                <div className="space-y-1">
                  <div className="mb-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    CATEGORIES
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCategory(cat.value)
                        setIsDropdownOpen(false)
                      }}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        selectedCategory === cat.value
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                      {cat.label}
                      {selectedCategory === cat.value && (
                        <span className="material-symbols-outlined ml-auto text-lg">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
