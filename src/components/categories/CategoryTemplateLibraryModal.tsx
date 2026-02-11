import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { CATEGORY_TEMPLATE_LIBRARY } from '@/constants/categoryTemplateLibrary'
import type { CategoryTemplatePack } from '@/types/categoryTemplate'

interface CategoryTemplateLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onImportPack: (pack: CategoryTemplatePack, selectedCategories: string[], selectedHabits: { [categoryName: string]: string[] }) => void
}

interface CategoryTemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: CategoryTemplatePack | null
  onImport: (selectedCategories: string[], selectedHabits: { [categoryName: string]: string[] }) => void
}

// Category Template Preview Modal with Selective Import
function CategoryTemplatePreviewModal({ isOpen, onClose, template, onImport }: CategoryTemplatePreviewModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedHabits, setSelectedHabits] = useState<{ [categoryName: string]: Set<string> }>(({} as any))

  useEffect(() => {
    if (isOpen && template) {
      // Select all categories and habits by default
      const allCategories = new Set(template.categories.map(c => c.name))
      setSelectedCategories(allCategories)
      
      const allHabits: { [categoryName: string]: Set<string> } = {}
      template.categories.forEach(cat => {
        allHabits[cat.name] = new Set(cat.habits.map(h => h.name))
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
      const category = template.categories.find(c => c.name === categoryName)
      if (category) {
        const newHabits = { ...selectedHabits }
        newHabits[categoryName] = new Set(category.habits.map(h => h.name))
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
    
    Object.keys(selectedHabits).forEach(categoryName => {
      selectedHabitsObject[categoryName] = Array.from(selectedHabits[categoryName])
    })

    onImport(selectedCategoriesArray, selectedHabitsObject)
  }

  const totalSelected = selectedCategories.size
  const totalHabitsSelected = Object.values(selectedHabits).reduce((sum, habits) => sum + habits.size, 0)

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
              className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5',
                      template.color
                    )}>
                      <span className="material-symbols-outlined text-white text-3xl">{template.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Selection Summary */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                    <span className="material-symbols-outlined text-base">folder</span>
                    {totalSelected} {totalSelected === 1 ? 'category' : 'categories'}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {totalHabitsSelected} {totalHabitsSelected === 1 ? 'habit' : 'habits'}
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(85vh-220px)] p-6">
                <div className="space-y-4">
                  {template.categories.map((category) => {
                    const isCategorySelected = selectedCategories.has(category.name)
                    const categoryHabits = selectedHabits[category.name] || new Set()

                    return (
                      <div
                        key={category.name}
                        className={clsx(
                          'rounded-2xl border-2 transition-all overflow-hidden',
                          isCategorySelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50'
                        )}
                      >
                        {/* Category Header */}
                        <div className="p-4 flex items-center gap-4">
                          <button
                            onClick={() => toggleCategory(category.name)}
                            className={clsx(
                              'flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all',
                              isCategorySelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {isCategorySelected && (
                              <span className="material-symbols-outlined text-white text-base">check</span>
                            )}
                          </button>

                          <div className={clsx(
                            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                            category.gradient
                          )}>
                            <span className={clsx('material-symbols-outlined text-2xl', category.textColor)}>
                              {category.icon}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{category.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {category.habits.length} {category.habits.length === 1 ? 'habit' : 'habits'}
                            </p>
                          </div>
                        </div>

                        {/* Habits List */}
                        {isCategorySelected && (
                          <div className="px-4 pb-4 space-y-2">
                            {category.habits.map((habit) => {
                              const isHabitSelected = categoryHabits.has(habit.name)

                              return (
                                <button
                                  key={habit.name}
                                  onClick={() => toggleHabit(category.name, habit.name)}
                                  className={clsx(
                                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                                    isHabitSelected
                                      ? 'bg-blue-100 dark:bg-blue-500/20'
                                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  )}
                                >
                                  <div className={clsx(
                                    'flex items-center justify-center w-5 h-5 rounded border-2 transition-all flex-shrink-0',
                                    isHabitSelected
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  )}>
                                    {isHabitSelected && (
                                      <span className="material-symbols-outlined text-white text-sm">check</span>
                                    )}
                                  </div>

                                  <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 text-xl">
                                    {habit.icon}
                                  </span>

                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white">{habit.name}</div>
                                    {habit.description && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400">{habit.description}</div>
                                    )}
                                  </div>

                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
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
              <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={totalSelected === 0}
                    className={clsx(
                      'flex-1 px-6 py-3 rounded-xl font-semibold transition-all',
                      totalSelected === 0
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
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
  onClick 
}: { 
  template: CategoryTemplatePack
  onClick: () => void 
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full text-left rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden transition-all duration-200 hover:shadow-xl"
    >
      {/* Gradient Background */}
      <div className={clsx('absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity', template.color)} />

      <div className="relative p-5">
        {/* Icon and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={clsx(
            'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5',
            template.color
          )}>
            <span className="material-symbols-outlined text-white text-2xl">{template.icon}</span>
          </div>
          
          {/* Category Badge */}
          <div className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
            {template.category}
          </div>
        </div>

        {/* Name and Description */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
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
              className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs font-medium text-gray-600 dark:text-gray-400"
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
        <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-lg">arrow_forward</span>
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'productivity' | 'health' | 'personal' | 'learning' | 'lifestyle'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<CategoryTemplatePack | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Close search on outside click
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

  const filteredTemplates = CATEGORY_TEMPLATE_LIBRARY.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: CategoryTemplatePack) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleImport = (selectedCategories: string[], selectedHabits: { [categoryName: string]: string[] }) => {
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-[90rem]"
            >
              <div className="flex flex-col h-[90vh] md:h-[50rem] w-full bg-white/95 dark:bg-gray-950/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden ring-1 ring-black/5 relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Header */}
          <div className="p-8 pb-6 border-b border-gray-200/50 dark:border-white/5 relative z-10 backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
            <div className="flex items-center justify-between gap-6">
              {/* Left side: Icon + Title */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-black/5">
                  <span className="material-symbols-outlined text-white text-2xl">store</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">Category Template Store</h2>
                  <p className="text-sm text-gray-500 font-medium">Browse and import category packs with habits</p>
                </div>
              </div>

              {/* Right: Search + Category Filter Tabs + Close */}
              <div className="flex items-center gap-1">
                {/* Search with expandable pill input */}
                <div ref={searchRef} className="relative flex items-center">
                  {!isSearchOpen && (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500 relative z-10"
                      aria-label="Search"
                    >
                      <span className="material-symbols-outlined text-xl font-bold">search</span>
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-10 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 ease-out absolute right-0 ${
                      isSearchOpen ? 'w-64 opacity-100' : 'w-10 opacity-0 pointer-events-none'
                    }`}
                    autoFocus={isSearchOpen}
                  />
                  {isSearchOpen && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className="flex size-8 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 text-gray-400 dark:text-gray-500 absolute right-1 z-10"
                      aria-label="Close search"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="relative">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide relative">
                    {/* Animated sliding indicator */}
                    <motion.div
                      className="absolute bottom-2 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
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
                          'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 font-medium text-sm',
                          selectedCategory === cat.value
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50'
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
                  onClick={onClose}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl font-bold">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content - Template Grid */}
          <div className="flex-1 overflow-y-auto p-8 relative z-10">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </AnimatePresence>
  )
}
