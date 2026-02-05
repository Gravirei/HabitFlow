import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import { TemplateLibraryModal } from './TemplateLibraryModal'
import { ToggleSwitch } from './timer/settings/ToggleSwitch'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { Task } from '@/types/task'

function TemplateCard({
  template,
  onClick,
  onQuickAdd,
}: {
  template: TaskTemplate
  onClick: () => void
  onQuickAdd?: (template: TaskTemplate) => void
}) {
  // Get hex color from template (supports both colorHex and color properties)
  const getTemplateColorHex = (tmpl: TaskTemplate) => {
    if (tmpl.colorHex) return tmpl.colorHex

    // Fallback: Extract from Tailwind class
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#a855f7',
      'bg-green-500': '#22c55e',
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-yellow-500': '#eab308',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-teal-500': '#14b8a6',
      'bg-cyan-500': '#06b6d4',
    }

    if (colorMap[tmpl.color]) return colorMap[tmpl.color]

    // Extract from custom bg-[...] format
    const customMatch = tmpl.color.match(/bg-\[([a-fA-F0-9]{6})\]/)
    if (customMatch) return '#' + customMatch[1]

    return '#3b82f6' // fallback
  }

  return (
    <button
      onClick={onClick}
      className="group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/60 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/5 dark:bg-gray-800/40 dark:hover:border-white/10 dark:hover:bg-gray-800/60"
    >
      {/* Background Gradient Mesh */}
      <div
        className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ backgroundColor: getTemplateColorHex(template) }}
      ></div>

      {/* Custom Badge */}
      {template.isCustom && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1.5 shadow-lg shadow-indigo-500/30">
          <span className="material-symbols-outlined text-[14px] text-white">star</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Custom</span>
        </div>
      )}

      {/* Quick Add Button - Bottom Right with Animations */}
      {template.isCustom && onQuickAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent card click
            onQuickAdd(template)
          }}
          className="group/quickadd absolute bottom-4 right-4 z-20 flex h-12 w-12 translate-y-2 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-0 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-black/30 group-hover:translate-y-0 group-hover:opacity-100"
          title="Quick add as task"
        >
          {/* Pulse Animation Ring */}
          <div className="absolute inset-0 animate-ping rounded-xl bg-emerald-400 opacity-20"></div>

          {/* Icon */}
          <span className="material-symbols-outlined relative z-10 text-[28px] font-light text-white transition-transform duration-300 group-hover/quickadd:rotate-90">
            add
          </span>
        </button>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-black/5 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110"
            style={{ backgroundColor: getTemplateColorHex(template) }}
          >
            <span className="material-symbols-outlined text-2xl">{template.icon}</span>
          </div>
        </div>

        <h4 className="mb-2 text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {template.name || '(No name)'}
        </h4>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {template.description || '(No description)'}
        </p>

        <div className="mt-auto space-y-3">
          {/* Category, Priority, Time Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200/50 bg-gray-100/50 px-2.5 py-1 dark:border-white/5 dark:bg-white/5">
              <span className="material-symbols-outlined text-[14px] text-gray-400">
                {template.category === 'Work'
                  ? 'business_center'
                  : template.category === 'Personal'
                    ? 'person'
                    : template.category === 'Health'
                      ? 'favorite'
                      : template.category === 'Creative'
                        ? 'palette'
                        : 'school'}
              </span>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                {template.category}
              </span>
            </div>

            {template.template.priority && (
              <div
                className={`flex items-center gap-1.5 rounded-lg border border-gray-200/50 px-2.5 py-1 dark:border-white/5 ${
                  template.template.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-500/10'
                    : template.template.priority === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-500/10'
                      : 'bg-green-50 dark:bg-green-500/10'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    template.template.priority === 'high'
                      ? 'text-red-500'
                      : template.template.priority === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }`}
                >
                  flag
                </span>
                <span
                  className={`text-[11px] font-medium capitalize ${
                    template.template.priority === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : template.template.priority === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {template.template.priority}
                </span>
              </div>
            )}

            {template.template.timeEstimate && (
              <div className="flex items-center gap-1.5 rounded-lg border border-gray-200/50 bg-gray-100/50 px-2.5 py-1 dark:border-white/5 dark:bg-white/5">
                <span className="material-symbols-outlined text-[14px] text-gray-400">
                  schedule
                </span>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  {template.template.timeEstimate}m
                </span>
              </div>
            )}
          </div>

          {/* Tags - Show up to 3 */}
          {template.template.tags && template.template.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {template.template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-indigo-200/30 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
                >
                  #{tag}
                </span>
              ))}
              {template.template.tags.length > 3 && (
                <span className="text-[10px] font-bold text-gray-400">
                  +{template.template.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

interface QuickActionsMenuProps {
  isOpen: boolean
  onClose: () => void
  onCreateFromTemplate: (template: TaskTemplate) => void
  onCreateBlank: () => void
  customTemplates: TaskTemplate[]
  onCreateNewTemplate: () => void
  onSaveTemplate?: (template: TaskTemplate) => void
  onUpdateTemplate?: (template: TaskTemplate) => void
  onDeleteTemplate?: (templateId: string) => void
  existingTasks?: Task[] // Pass existing tasks to check for duplicates
}

export function QuickActionsMenu({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateBlank,
  customTemplates,
  onCreateNewTemplate,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  existingTasks = [],
}: QuickActionsMenuProps) {
  // Helper function to get hex color from template
  const getTemplateColorHex = (template: TaskTemplate): string => {
    if (template.colorHex) return template.colorHex

    // Fallback: Extract from Tailwind class
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#a855f7',
      'bg-green-500': '#22c55e',
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-yellow-500': '#eab308',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-teal-500': '#14b8a6',
      'bg-cyan-500': '#06b6d4',
    }

    if (colorMap[template.color]) return colorMap[template.color]

    // Extract from custom bg-[...] format
    const customMatch = template.color.match(/bg-\[([a-fA-F0-9]{6})\]/)
    if (customMatch) return '#' + customMatch[1]

    return '#3b82f6' // fallback
  }

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['all']))
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showTaskDuplicateWarning, setShowTaskDuplicateWarning] = useState(false)
  const [pendingTaskTemplate, setPendingTaskTemplate] = useState<TaskTemplate | null>(null)
  const [duplicateTaskStatus, setDuplicateTaskStatus] = useState<'completed' | 'active'>('active')
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false)
  const [templateListCollapsed, setTemplateListCollapsed] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Settings state with localStorage
  const [showFilter, setShowFilter] = useState(() => {
    const saved = localStorage.getItem('quickActionsShowFilter')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [enableQuickAdd, setEnableQuickAdd] = useState(() => {
    const saved = localStorage.getItem('quickActionsEnableQuickAdd')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [selectedQuickAddTemplate, setSelectedQuickAddTemplate] = useState<string | null>(() => {
    const saved = localStorage.getItem('quickActionsSelectedTemplate')
    return saved !== null ? saved : null
  })

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('quickActionsShowFilter', JSON.stringify(showFilter))
  }, [showFilter])

  useEffect(() => {
    localStorage.setItem('quickActionsEnableQuickAdd', JSON.stringify(enableQuickAdd))
  }, [enableQuickAdd])

  useEffect(() => {
    if (selectedQuickAddTemplate) {
      localStorage.setItem('quickActionsSelectedTemplate', selectedQuickAddTemplate)
    }
  }, [selectedQuickAddTemplate])

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

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = new Set(selectedCategories)
    const allCategories = ['work', 'personal', 'health', 'creative', 'learning']

    if (categoryId === 'all') {
      // Turn on All, turn off everything else
      setSelectedCategories(new Set(['all']))
    } else {
      // Remove 'all' if it's there
      newCategories.delete('all')

      // Toggle the selected category
      if (newCategories.has(categoryId)) {
        newCategories.delete(categoryId)
      } else {
        newCategories.add(categoryId)
      }

      // Check if all 5 categories are now selected
      const allSelected = allCategories.every((cat) => newCategories.has(cat))

      if (allSelected) {
        // If all categories selected, turn them all off and enable "All"
        setSelectedCategories(new Set(['all']))
      } else if (newCategories.size === 0) {
        // If no categories selected, auto-enable All
        setSelectedCategories(new Set(['all']))
      } else {
        setSelectedCategories(newCategories)
      }
    }
  }

  const filteredTemplates = customTemplates.filter((template) => {
    const matchesCategory =
      selectedCategories.has('all') || selectedCategories.has(template.category.toLowerCase())
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: TaskTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  // Handle duplicate task confirmation
  const handleCreateDuplicateTask = () => {
    if (pendingTaskTemplate) {
      onCreateFromTemplate(pendingTaskTemplate)
      toast.success(`Task created from "${pendingTaskTemplate.name}"!`, {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
        },
      })
    }
    setShowTaskDuplicateWarning(false)
    setPendingTaskTemplate(null)
  }

  const handleCancelDuplicateTask = () => {
    setShowTaskDuplicateWarning(false)
    setPendingTaskTemplate(null)
  }

  const handleUseAsTemplate = (template: TaskTemplate) => {
    onCreateFromTemplate(template)
    setIsPreviewOpen(false)
    onClose()
    setSearchQuery('')
  }

  const handleSaveAsTask = (taskData: TaskTemplate['template']) => {
    const modifiedTemplate: TaskTemplate = {
      ...previewTemplate!,
      template: taskData,
    }
    onCreateFromTemplate(modifiedTemplate)
    setIsPreviewOpen(false)
    onClose()
    setSearchQuery('')
  }

  const handleDeleteTemplate = (template: TaskTemplate) => {
    try {
      // Update localStorage
      const stored = localStorage.getItem('taskTemplates')
      if (stored) {
        const templates: TaskTemplate[] = JSON.parse(stored)
        const updatedTemplates = templates.filter((t) => t.id !== template.id)
        localStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates))
      }

      // Call the parent callback to update state
      if (onDeleteTemplate) {
        onDeleteTemplate(template.id)
      }

      // Close preview modal
      setIsPreviewOpen(false)

      // Show success toast
      toast.success(`"${template.name}" deleted!`, {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600',
        },
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template', {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600',
        },
      })
    }
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New"
      className="overflow-visible !border-0 !bg-transparent p-0 !shadow-none"
      maxWidth="max-w-[90rem]"
    >
      <div className="relative flex h-[90vh] w-full flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/5 dark:bg-gray-950/90 md:h-[50rem] md:flex-row">
        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]"></div>
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]"></div>

        {/* Sidebar */}
        <div className="relative z-10 flex w-full flex-col gap-8 border-b border-gray-200/50 bg-gray-50/80 p-8 backdrop-blur-xl dark:border-white/5 dark:bg-white/5 md:w-72 md:border-b-0 md:border-r">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 ring-1 ring-black/5">
              <span className="material-symbols-outlined text-2xl text-white">add</span>
            </div>
            <div>
              <h2 className="mb-1 text-xl font-bold leading-none text-gray-900 dark:text-white">
                Create
              </h2>
              <p className="text-sm font-medium text-gray-500">Select a starting point</p>
            </div>
          </div>

          {showFilter && (
            <div className="space-y-1">
              <button
                onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                className="mb-3 flex w-full items-center justify-between px-4 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span>Filters</span>
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${filtersCollapsed ? '' : 'rotate-180'}`}
                >
                  expand_more
                </span>
              </button>
              <div
                className={`space-y-0.5 overflow-hidden transition-all duration-300 ${filtersCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}
              >
                {[
                  { id: 'all', label: 'All Templates', icon: 'grid_view' },
                  { id: 'work', label: 'Work', icon: 'business_center' },
                  { id: 'personal', label: 'Personal', icon: 'person' },
                  { id: 'health', label: 'Health', icon: 'favorite' },
                  { id: 'creative', label: 'Creative', icon: 'palette' },
                  { id: 'learning', label: 'Learning', icon: 'school' },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    className="flex origin-center scale-[0.85] transform items-center justify-center gap-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">
                        {cat.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <ToggleSwitch
                        enabled={selectedCategories.has(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        label={cat.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Library
            </h3>
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <div className="rounded-lg bg-gray-100 p-1.5 transition-colors group-hover:bg-white dark:bg-white/5 dark:group-hover:bg-white/10">
                <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white">
                  store
                </span>
              </div>
              Template Store
            </button>
          </div>

          <div className="mt-auto space-y-4">
            <button
              onClick={onCreateBlank}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20 dark:from-white dark:to-gray-200 dark:text-gray-900"
            >
              <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0"></div>
              <span className="material-symbols-outlined text-2xl">edit_square</span>
              <div className="text-left">
                <div className="text-sm font-bold">Blank Task</div>
                <div className="text-[10px] font-medium opacity-70">Start from scratch</div>
              </div>
            </button>

            {enableQuickAdd && (
              <button
                onClick={() => {
                  if (!selectedQuickAddTemplate) {
                    toast.error('No template selected! Please select a template from Settings for Quick Add functionality.', {
                      duration: 4000,
                    })
                    return
                  }

                  const template = customTemplates.find((t) => t.id === selectedQuickAddTemplate)
                  if (template) {
                    onCreateFromTemplate(template)
                    toast.success('Quick task added!', {
                      icon: (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              template.colorHex || template.color.replace('bg-', '#'),
                          }}
                        >
                          <span className="material-symbols-outlined text-lg text-white">
                            {template.icon}
                          </span>
                        </div>
                      ),
                      duration: 3000,
                    })
                    onClose()
                  }
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400"
              >
                <span className="material-symbols-outlined text-2xl">bolt</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Quick Add</div>
                  <div className="text-[10px] font-medium opacity-80">
                    {selectedQuickAddTemplate
                      ? customTemplates.find((t) => t.id === selectedQuickAddTemplate)?.name ||
                        'Minimal fields'
                      : 'Minimal fields'}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-6 p-8 pb-4">
            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
              {/* Search with expandable pill input */}
              <div ref={searchRef} className="relative flex items-center">
                {!isSearchOpen && (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="relative z-10 flex size-10 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-gray-500 dark:hover:bg-white/5"
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
                  className={`absolute right-0 h-10 rounded-full border border-gray-200 bg-gray-100 pl-4 pr-10 text-sm text-gray-900 transition-all duration-300 ease-out placeholder:text-gray-400 focus:rounded-full focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white ${
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
                    <span className="material-symbols-outlined text-lg font-bold">close</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowSettingsSidebar(true)}
                className="flex size-10 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-gray-500 dark:hover:bg-white/5"
                title="Settings"
                aria-label="Open settings"
              >
                <span className="material-symbols-outlined text-xl font-bold">settings</span>
              </button>

              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-gray-500 dark:hover:bg-white/5"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-xl font-bold">close</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-8 pt-2">
            {/* My Templates Section - Always Visible */}
            <div className="space-y-6 pb-12">
              {/* Header - Only show when templates exist */}
              {customTemplates.length > 0 && (
                <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200/50 bg-white/90 px-2 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-gray-950/90">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                      <span className="material-symbols-outlined text-xl text-white">favorite</span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-xl font-bold leading-none text-gray-900 dark:text-white">
                        My Templates
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        Create and manage your personal templates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {customTemplates.length}{' '}
                      {customTemplates.length === 1 ? 'template' : 'templates'}
                    </span>
                    <button
                      onClick={onCreateNewTemplate}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      New Template
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              {filteredTemplates.length === 0 ? (
                customTemplates.length === 0 ? (
                  /* Empty State - No Templates */
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner dark:from-indigo-500/10 dark:to-purple-500/10">
                      <span className="material-symbols-outlined text-6xl text-indigo-300 dark:text-indigo-600">
                        dashboard_customize
                      </span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                      No templates yet
                    </h3>
                    <p className="mb-8 max-w-md leading-relaxed text-gray-500 dark:text-gray-400">
                      Start building your template collection! Create custom templates to streamline
                      your workflow and save time.
                    </p>
                    <button
                      onClick={onCreateNewTemplate}
                      className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/50"
                    >
                      <span className="material-symbols-outlined text-2xl">add_circle</span>
                      Create Your First Template
                    </button>
                    <div className="mt-8 border-t border-gray-200 pt-8 dark:border-white/5">
                      <p className="mb-3 text-sm text-gray-400">or explore our template store</p>
                      <button
                        onClick={() => setShowTemplateLibrary(true)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Browse Template Store →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No Search Results */
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-50 shadow-inner dark:bg-white/5">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">
                        search_off
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      No matches found
                    </h3>
                    <p className="text-gray-500">Try adjusting your search for "{searchQuery}"</p>
                  </div>
                )
              ) : (
                /* Templates Grid */
                <div className="grid grid-cols-1 gap-5 px-2 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                      onQuickAdd={(template) => {
                        // Check for duplicate tasks
                        const taskTitle = template.template.title || template.name
                        const existingTask = existingTasks.find((task) => task.title === taskTitle)

                        if (existingTask) {
                          // Task exists - show warning based on status
                          setPendingTaskTemplate(template)
                          setDuplicateTaskStatus(
                            existingTask.completed || existingTask.status === 'completed'
                              ? 'completed'
                              : 'active'
                          )
                          setShowTaskDuplicateWarning(true)
                        } else {
                          // No duplicate - create directly
                          onCreateFromTemplate(template)
                          toast.success(`Task created from "${template.name}"!`, {
                            duration: 3000,
                            style: {
                              borderRadius: '12px',
                              background: '#10b981',
                              color: '#fff',
                              fontWeight: '600',
                            },
                          })
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={previewTemplate}
        onUseAsTemplate={handleUseAsTemplate}
        onSaveAsTask={handleSaveAsTask}
        onSaveToMyTemplates={onSaveTemplate}
        onUpdateTemplate={onUpdateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        customTemplates={customTemplates}
      />

      <TemplateLibraryModal
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSaveToMyTemplates={onSaveTemplate}
        customTemplates={customTemplates}
      />

      {/* Duplicate Task Warning Modal */}
      {showTaskDuplicateWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Warning Icon */}
            <div className="mb-4 flex justify-center">
              <div
                className={`h-16 w-16 rounded-full ${duplicateTaskStatus === 'completed' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-yellow-100 dark:bg-yellow-500/20'} flex items-center justify-center`}
              >
                <span
                  className={`material-symbols-outlined text-4xl ${duplicateTaskStatus === 'completed' ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                >
                  {duplicateTaskStatus === 'completed' ? 'check_circle' : 'warning'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              {duplicateTaskStatus === 'completed' ? 'Task Already Completed' : 'Duplicate Task'}
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              {duplicateTaskStatus === 'completed'
                ? "You've already completed this task. Start fresh?"
                : 'You already have this task in progress. Do you want to create a duplicate?'}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelDuplicateTask}
                className="flex-1 rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDuplicateTask}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                {duplicateTaskStatus === 'completed' ? 'Start Fresh' : 'Create Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      <div
        className={`absolute inset-0 z-[60] flex items-end justify-end overflow-hidden transition-all duration-500 ${showSettingsSidebar ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${showSettingsSidebar ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowSettingsSidebar(false)}
        />

        {/* Sidebar */}
        <div
          className={`relative flex h-full w-80 flex-col rounded-r-[2.5rem] border-l border-gray-200/50 bg-gray-50/80 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-in-out dark:border-white/5 dark:bg-white/5 ${
            showSettingsSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-outlined text-2xl text-white">settings</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Settings</h3>
                <p className="mt-0.5 text-xs text-gray-400">Customize your quick actions</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsSidebar(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              aria-label="Close settings"
            >
              <span className="material-symbols-outlined text-xl text-gray-400">arrow_forward</span>
            </button>
          </div>

          {/* Content */}
          <div className="scrollbar-hide flex-1 space-y-1 overflow-y-auto p-6">
            <ToggleSwitch
              enabled={showFilter}
              onChange={() => setShowFilter(!showFilter)}
              label="Show Filter"
              description="Display category filter dropdown in quick actions menu"
            />

            <div className="space-y-2">
              {/* Collapsible Quick Add Section */}
              <div className="space-y-2">
                {/* Clickable header without arrow */}
                <div
                  onClick={(e) => {
                    // Only toggle if not clicking on the toggle switch itself
                    const target = e.target as HTMLElement
                    if (
                      !target.closest('button[role="switch"]') &&
                      !target.closest('.toggle-switch-wrapper')
                    ) {
                      setTemplateListCollapsed(!templateListCollapsed)
                    }
                  }}
                  className="cursor-pointer rounded-lg transition-colors hover:bg-white/5"
                >
                  <ToggleSwitch
                    enabled={enableQuickAdd}
                    onChange={() => setEnableQuickAdd(!enableQuickAdd)}
                    label="Enable Quick Add Button"
                    description="Show quick add button at the bottom of the menu"
                  />
                </div>

                {/* Collapsible Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${templateListCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'}`}
                >
                  {/* Template Selector */}
                  {enableQuickAdd && (
                    <div className="ml-8 mt-2 space-y-2">
                      {customTemplates.length > 0 ? (
                        <div className="space-y-1.5">
                          {customTemplates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => {
                                if (selectedQuickAddTemplate === template.id) {
                                  setSelectedQuickAddTemplate(null)
                                } else {
                                  setSelectedQuickAddTemplate(template.id)
                                }
                              }}
                              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                                selectedQuickAddTemplate === template.id
                                  ? 'bg-white/10 ring-1 ring-white/20'
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                                style={{ backgroundColor: getTemplateColorHex(template) }}
                              >
                                <span className="material-symbols-outlined text-sm text-white">
                                  {template.icon}
                                </span>
                              </div>
                              <span className="flex-1 truncate text-left text-sm font-medium text-white">
                                {template.name}
                              </span>
                              {selectedQuickAddTemplate === template.id && (
                                <span className="material-symbols-outlined text-lg text-green-400">
                                  check_circle
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-400">
                          No custom templates available.
                          <br />
                          <span className="text-xs">Create one to use Quick Add.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
