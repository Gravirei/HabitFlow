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

// Category Template Preview Modal with Selective Import - REDESIGNED
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [prevTotalSelected, setPrevTotalSelected] = useState(0)

  useEffect(() => {
    if (isOpen && template) {
      // Select all categories and habits by default
      const allCategories = new Set(template.categories.map((c) => c.name))
      setSelectedCategories(allCategories)
      // Expand all categories by default
      setExpandedCategories(allCategories)

      const allHabits: { [categoryName: string]: Set<string> } = {}
      template.categories.forEach((cat) => {
        allHabits[cat.name] = new Set(cat.habits.map((h) => h.name))
      })
      setSelectedHabits(allHabits)
      
      const totalHabits = Object.values(allHabits).reduce((sum, habits) => sum + habits.size, 0)
      setPrevTotalSelected(totalHabits)
    }
  }, [isOpen, template])

  if (!template) return null

  const toggleCategoryExpanded = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

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

  // Animated counter effect
  useEffect(() => {
    setPrevTotalSelected(totalHabitsSelected)
  }, [totalHabitsSelected])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with stronger blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md"
          />

          {/* Preview Modal */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50/50 shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:from-gray-900 dark:to-gray-950/50 dark:shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Glassmorphism */}
              <div className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 px-6 py-5 backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className={clsx(
                        'flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-teal-500/20 ring-1 ring-black/5',
                        template.color
                      )}
                    >
                      <span className="material-symbols-outlined text-4xl text-white">
                        {template.icon}
                      </span>
                    </motion.div>
                    <div>
                      <h3 className="mb-1.5 font-lora text-2xl font-bold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="font-raleway text-sm font-medium text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Selection Summary - Animated */}
                <div className="mt-5 flex items-center gap-3 text-sm">
                  <motion.div
                    key={totalSelected}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-teal-100/50 px-4 py-2 font-raleway font-semibold text-teal-700 ring-1 ring-teal-200/50 dark:from-teal-500/10 dark:to-teal-500/5 dark:text-teal-400 dark:ring-teal-500/20"
                  >
                    <span className="material-symbols-outlined text-base">folder</span>
                    <span>{totalSelected}</span>
                    <span className="text-xs font-medium opacity-75">
                      {totalSelected === 1 ? 'category' : 'categories'}
                    </span>
                  </motion.div>
                  <motion.div
                    key={totalHabitsSelected}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-50 to-orange-100/50 px-4 py-2 font-raleway font-semibold text-orange-700 ring-1 ring-orange-200/50 dark:from-orange-500/10 dark:to-orange-500/5 dark:text-orange-400 dark:ring-orange-500/20"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{totalHabitsSelected}</span>
                    <span className="text-xs font-medium opacity-75">
                      {totalHabitsSelected === 1 ? 'habit' : 'habits'}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="max-h-[calc(90vh-260px)] overflow-y-auto p-6">
                <div className="space-y-3">
                  {template.categories.map((category, index) => {
                    const isCategorySelected = selectedCategories.has(category.name)
                    const isExpanded = expandedCategories.has(category.name)
                    const categoryHabits = selectedHabits[category.name] || new Set()
                    const selectedCount = categoryHabits.size
                    const totalCount = category.habits.length

                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        className={clsx(
                          'overflow-hidden rounded-2xl transition-all duration-200',
                          isCategorySelected
                            ? 'bg-gradient-to-br shadow-lg ring-2 ring-teal-500/30'
                            : 'bg-white/60 shadow-sm ring-1 ring-gray-200/50 dark:bg-gray-800/40 dark:ring-white/5',
                          category.gradient
                        )}
                      >
                        {/* Category Header - Horizontal Layout */}
                        <div
                          className="flex cursor-pointer items-center gap-4 p-4 transition-all duration-150 hover:bg-white/30 active:scale-[0.99] dark:hover:bg-white/5"
                          onClick={() => toggleCategoryExpanded(category.name)}
                        >
                          {/* Icon */}
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={clsx(
                              'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-md',
                              isCategorySelected ? 'bg-white/90 dark:bg-gray-900/90' : 'bg-white/50 dark:bg-gray-800/50'
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
                          </motion.div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 font-lora text-lg font-bold text-gray-900 dark:text-white">
                              {category.name}
                            </h4>
                            <p className="font-raleway text-xs font-medium text-gray-600 dark:text-gray-400">
                              {isCategorySelected ? (
                                <span className="text-teal-700 dark:text-teal-400">
                                  {selectedCount} of {totalCount} selected
                                </span>
                              ) : (
                                <span>{totalCount} {totalCount === 1 ? 'habit' : 'habits'}</span>
                              )}
                            </p>
                          </div>

                          {/* iOS Toggle Switch */}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCategory(category.name)
                            }}
                            className={clsx(
                              'relative h-8 w-14 flex-shrink-0 rounded-full transition-all duration-200',
                              isCategorySelected
                                ? 'bg-teal-500 shadow-inner shadow-teal-600/50'
                                : 'bg-gray-300 dark:bg-gray-600'
                            )}
                          >
                            <motion.div
                              layout
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className={clsx(
                                'absolute top-1 h-6 w-6 rounded-full bg-white shadow-md',
                                isCategorySelected ? 'left-7' : 'left-1'
                              )}
                            />
                          </motion.button>

                          {/* Expand/Collapse Icon */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-xl text-gray-500 dark:text-gray-400">
                              expand_more
                            </span>
                          </motion.div>
                        </div>

                        {/* Habits Cards - Progressive Disclosure */}
                        <AnimatePresence>
                          {isExpanded && isCategorySelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 px-4 pb-4">
                                {category.habits.map((habit, habitIndex) => {
                                  const isHabitSelected = categoryHabits.has(habit.name)

                                  return (
                                    <motion.button
                                      key={habit.name}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: habitIndex * 0.05 }}
                                      onClick={() => toggleHabit(category.name, habit.name)}
                                      whileHover={{ scale: 1.02, x: 4 }}
                                      whileTap={{ scale: 0.98 }}
                                      className={clsx(
                                        'group flex w-full items-center gap-3 rounded-xl p-3 text-left shadow-sm transition-all duration-150',
                                        isHabitSelected
                                          ? 'bg-gradient-to-r from-white to-teal-50/50 ring-2 ring-teal-500/30 dark:from-gray-800 dark:to-teal-500/10'
                                          : 'bg-white/80 ring-1 ring-gray-200/50 hover:bg-white hover:shadow-md dark:bg-gray-800/60 dark:ring-white/5 dark:hover:bg-gray-800'
                                      )}
                                    >
                                      {/* Habit Icon */}
                                      <div
                                        className={clsx(
                                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150',
                                          isHabitSelected
                                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400'
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                        )}
                                      >
                                        <span className="material-symbols-outlined text-xl">
                                          {habit.icon}
                                        </span>
                                      </div>

                                      {/* Habit Info */}
                                      <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 font-raleway font-semibold text-gray-900 dark:text-white">
                                          {habit.name}
                                        </div>
                                        {habit.description && (
                                          <div className="font-raleway text-xs text-gray-600 dark:text-gray-400">
                                            {habit.description}
                                          </div>
                                        )}
                                      </div>

                                      {/* Goal Badge */}
                                      <div
                                        className={clsx(
                                          'flex-shrink-0 rounded-full px-2.5 py-1 font-raleway text-xs font-semibold transition-all duration-150',
                                          isHabitSelected
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        )}
                                      >
                                        {habit.goal}× {habit.goalPeriod}
                                      </div>

                                      {/* Checkmark Indicator */}
                                      <motion.div
                                        initial={false}
                                        animate={{
                                          scale: isHabitSelected ? 1 : 0,
                                          opacity: isHabitSelected ? 1 : 0,
                                        }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-500"
                                      >
                                        <span className="material-symbols-outlined text-sm text-white">
                                          check
                                        </span>
                                      </motion.div>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Footer - Glassmorphism */}
              <div className="sticky bottom-0 border-t border-gray-200/50 bg-white/80 px-6 py-4 backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-gray-300 bg-white/50 px-6 py-3 font-raleway font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleImport}
                    disabled={totalSelected === 0}
                    whileHover={totalSelected > 0 ? { scale: 1.02 } : {}}
                    whileTap={totalSelected > 0 ? { scale: 0.98 } : {}}
                    className={clsx(
                      'relative flex-[2] overflow-hidden rounded-xl px-6 py-3 font-raleway font-bold transition-all duration-150',
                      totalSelected === 0
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40'
                    )}
                  >
                    {totalSelected === 0 ? (
                      <span>Select at least one category</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Import Selected</span>
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="material-symbols-outlined text-lg"
                        >
                          arrow_forward
                        </motion.span>
                      </span>
                    )}
                    {/* Shimmer effect */}
                    {totalSelected > 0 && (
                      <motion.div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ translateX: ['100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                    )}
                  </motion.button>
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
