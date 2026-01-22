import { useState } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { DEFAULT_TEMPLATES } from './TaskTemplateLibrary'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { Task } from '@/types/task'

interface QuickActionsMenuProps {
  isOpen: boolean
  onClose: () => void
  onCreateFromTemplate: (template: TaskTemplate) => void
  onCreateBlank: () => void
  customTemplates: TaskTemplate[]
  onManageTemplates: () => void
}

export function QuickActionsMenu({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateBlank,
  customTemplates,
  onManageTemplates,
}: QuickActionsMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'personal'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates]

  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: TaskTemplate) => {
    onCreateFromTemplate(template)
    onClose()
    setSearchQuery('')
  }

  const handleCreateBlank = () => {
    onCreateBlank()
    onClose()
    setSearchQuery('')
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Actions"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header Actions */}
        <div className="px-6 pt-4 pb-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All', icon: 'grid_view' },
              { id: 'work', label: 'Work', icon: 'work' },
              { id: 'personal', label: 'Personal', icon: 'person' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={onManageTemplates}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              Manage Templates
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCreateBlank}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <div className="text-left">
                <div className="font-bold">Blank Task</div>
                <div className="text-sm opacity-90">Start from scratch</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                onCreateFromTemplate({
                  id: 'quick_today',
                  name: 'Quick Task',
                  icon: 'bolt',
                  category: 'Work',
                  color: 'bg-yellow-500',
                  isCustom: false,
                  template: {
                    title: 'Quick Task',
                    priority: 'medium',
                    status: 'todo',
                    category: 'Work',
                    tags: [],
                    subtasks: [],
                  },
                })
                onClose()
              }}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all hover:scale-[1.02] shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <div className="text-left">
                <div className="font-bold">Quick Add</div>
                <div className="text-sm opacity-90">Fast task creation</div>
              </div>
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">
                search_off
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group text-left p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center text-white shadow-lg`}>
                      <span className="material-symbols-outlined text-2xl">{template.icon}</span>
                    </div>
                    {template.isCustom && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Title and Description */}
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">folder</span>
                      {template.category}
                    </span>
                    {template.template.subtasks.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">checklist</span>
                          {template.template.subtasks.length} steps
                        </span>
                      </>
                    )}
                    {template.template.timeEstimate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {template.template.timeEstimate}m
                        </span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccessibleModal>
  )
}
