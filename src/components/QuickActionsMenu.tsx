import { useState, useRef, useEffect } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import { TemplateLibraryModal } from './TemplateLibraryModal'
import type { TaskTemplate } from '@/types/taskTemplate'

function TemplateCard({ 
  template, 
  onClick 
}: { 
  template: TaskTemplate
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col text-left h-full min-h-[180px] p-6 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:border-white/40 dark:hover:border-white/10 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Background Gradient Mesh */}
      <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${template.color.replace('bg-', 'bg-')}`}></div>
      
      {/* Custom Badge */}
      {template.isCustom && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30">
          <span className="material-symbols-outlined text-[14px] text-white">star</span>
          <span className="text-[11px] font-bold text-white uppercase tracking-wide">Custom</span>
        </div>
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${template.color} flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className="material-symbols-outlined text-2xl">{template.icon}</span>
          </div>
        </div>

        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {template.name || '(No name)'}
        </h4>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {template.description || '(No description)'}
        </p>

        <div className="mt-auto space-y-3">
          {/* Category, Priority, Time Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
              <span className="material-symbols-outlined text-[14px] text-gray-400">
                {template.category === 'Work' ? 'business_center' : template.category === 'Personal' ? 'person' : template.category === 'Health' ? 'favorite' : template.category === 'Creative' ? 'palette' : 'school'}
              </span>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                {template.category}
              </span>
            </div>

            {template.template.priority && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200/50 dark:border-white/5 ${
                template.template.priority === 'high' ? 'bg-red-50 dark:bg-red-500/10' :
                template.template.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-500/10' :
                'bg-green-50 dark:bg-green-500/10'
              }`}>
                <span className={`material-symbols-outlined text-[14px] ${
                  template.template.priority === 'high' ? 'text-red-500' :
                  template.template.priority === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>flag</span>
                <span className={`text-[11px] font-medium capitalize ${
                  template.template.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                  template.template.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {template.template.priority}
                </span>
              </div>
            )}
            
            {template.template.timeEstimate && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <span className="material-symbols-outlined text-[14px] text-gray-400">schedule</span>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  {template.template.timeEstimate}m
                </span>
              </div>
            )}
          </div>

          {/* Tags - Show up to 3 */}
          {template.template.tags && template.template.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {template.template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200/30 dark:border-indigo-500/20"
                >
                  #{tag}
                </span>
              ))}
              {template.template.tags.length > 3 && (
                <span className="text-[10px] font-bold text-gray-400">+{template.template.tags.length - 3}</span>
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
  onManageTemplates: () => void
  onSaveTemplate?: (template: TaskTemplate) => void
  onUpdateTemplate?: (template: TaskTemplate) => void
}

export function QuickActionsMenu({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateBlank,
  customTemplates,
  onManageTemplates,
  onSaveTemplate,
  onUpdateTemplate,
}: QuickActionsMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'personal'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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

  const filteredTemplates = customTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: TaskTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
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
      template: taskData
    }
    onCreateFromTemplate(modifiedTemplate)
    setIsPreviewOpen(false)
    onClose()
    setSearchQuery('')
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New"
      className="!bg-transparent !shadow-none !border-0 p-0 overflow-visible"
      maxWidth="max-w-[90rem]"
    >
      <div className="flex flex-col md:flex-row h-[90vh] md:h-[50rem] w-full bg-white/95 dark:bg-gray-950/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden ring-1 ring-black/5 relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Sidebar */}
        <div className="w-full md:w-72 bg-gray-50/80 dark:bg-white/5 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-white/5 p-8 flex flex-col gap-8 relative z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-black/5">
              <span className="material-symbols-outlined text-white text-2xl">add</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">Create</h2>
              <p className="text-sm text-gray-500 font-medium">Select a starting point</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              className="w-full flex items-center justify-between px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span>Filters</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${filtersCollapsed ? '' : 'rotate-180'}`}>
                expand_more
              </span>
            </button>
            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${filtersCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
              {[
                { id: 'all', label: 'All Templates', icon: 'grid_view' },
                { id: 'work', label: 'Work', icon: 'business_center' },
                { id: 'personal', label: 'Personal', icon: 'person' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as 'all' | 'work' | 'personal')}
                  className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-md shadow-gray-200/50 dark:shadow-none ring-1 ring-gray-200/50 dark:ring-white/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-indigo-50 dark:bg-white/20' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${selectedCategory === cat.id ? 'text-indigo-600 dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white'}`}>{cat.icon}</span>
                  </div>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 mt-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Library</h3>
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
            >
              <div className="p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10">
                <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-white">store</span>
              </div>
              Template Store
            </button>
          </div>

          <div className="space-y-4 mt-auto">
            <button
              onClick={onCreateBlank}
              className="w-full group relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="material-symbols-outlined text-2xl">edit_square</span>
              <div className="text-left">
                <div className="text-sm font-bold">Blank Task</div>
                <div className="text-[10px] opacity-70 font-medium">Start from scratch</div>
              </div>
            </button>

            <button
              onClick={() => {
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
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-2xl">bolt</span>
              <div className="text-left">
                <div className="text-sm font-bold">Quick Add</div>
                <div className="text-[10px] opacity-80 font-medium">Minimal fields</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between gap-6">
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2">
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
                  className={`h-10 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:rounded-full transition-all duration-300 ease-out absolute right-0 ${
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
                    <span className="material-symbols-outlined text-lg font-bold">close</span>
                  </button>
                )}
              </div>

              <button 
                onClick={onManageTemplates}
                className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500"
                title="Manage Templates"
                aria-label="Manage Templates"
              >
                <span className="material-symbols-outlined text-xl font-bold">settings</span>
              </button>
              
              <button 
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-xl font-bold">close</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
            {/* My Templates Section - Always Visible */}
            <div className="space-y-6 pb-12">
              {/* Header - Only show when templates exist */}
              {customTemplates.length > 0 && (
                <div className="flex items-center justify-between gap-4 px-2 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl py-4 z-30 border-b border-gray-200/50 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <span className="material-symbols-outlined text-white text-xl">favorite</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">My Templates</h3>
                      <p className="text-sm text-gray-500 font-medium">Create and manage your personal templates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                      {customTemplates.length} {customTemplates.length === 1 ? 'template' : 'templates'}
                    </span>
                    <button
                      onClick={onManageTemplates}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
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
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 flex items-center justify-center mb-8 shadow-inner">
                      <span className="material-symbols-outlined text-6xl text-indigo-300 dark:text-indigo-600">dashboard_customize</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No templates yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
                      Start building your template collection! Create custom templates to streamline your workflow and save time.
                    </p>
                    <button
                      onClick={onManageTemplates}
                      className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base font-bold shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-2xl">add_circle</span>
                      Create Your First Template
                    </button>
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5">
                      <p className="text-sm text-gray-400 mb-3">or explore our template store</p>
                      <button
                        onClick={() => setShowTemplateLibrary(true)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold hover:underline"
                      >
                        Browse Template Store →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No Search Results */
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
                    <p className="text-gray-500">Try adjusting your search for "{searchQuery}"</p>
                  </div>
                )
              ) : (
                /* Templates Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-2">
                  {filteredTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      template={template} 
                      onClick={() => handleTemplateClick(template)} 
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
      />

      <TemplateLibraryModal
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSaveToMyTemplates={onSaveTemplate}
        customTemplates={customTemplates}
      />
    </AccessibleModal>
  )
}
