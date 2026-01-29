import { useState } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import { DEFAULT_TEMPLATES } from './TaskTemplateLibrary'
import type { TaskTemplate } from '@/types/taskTemplate'


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
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates]

  const filteredTemplates = allTemplates.filter(template => {
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
    // Create a modified template with the updated data
    const modifiedTemplate: TaskTemplate = {
      ...previewTemplate!,
      template: taskData
    }
    onCreateFromTemplate(modifiedTemplate)
    setIsPreviewOpen(false)
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
      title="Create Task"
      maxWidth="max-w-[95vw]"
    >
      {/* Sleek Modern Design with Minimal Aesthetic */}
      <div className="flex flex-col h-[92vh] w-full relative overflow-hidden bg-gray-50 dark:bg-gray-950">
        
        {/* Subtle Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(100 100 100) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Floating Accent Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

        {/* Unique Floating Header Design */}
        <div className="relative z-10 px-8 pt-8 pb-6">
          {/* Floating Card Header */}
          <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-xl shadow-gray-900/5 dark:shadow-black/20 overflow-hidden">
            {/* Animated Gradient Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <div className="relative p-6">
              {/* Top Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Animated Icon */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Create Task
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick a template or start fresh</p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-500 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all group"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">close</span>
                </button>
              </div>

              {/* Search Bar with Integrated Filters */}
              <div className="relative">
                {/* Search Input */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-5 text-gray-400 dark:text-gray-500 text-xl pointer-events-none">search</span>
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-base font-medium"
                    />
                  </div>
                </div>

                {/* Category Pills - Positioned as floating chips */}
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">Filter:</span>
                  {[
                    { id: 'all', label: 'All', icon: 'apps', color: 'from-gray-600 to-gray-700' },
                    { id: 'work', label: 'Work', icon: 'business_center', color: 'from-blue-600 to-indigo-600' },
                    { id: 'personal', label: 'Personal', icon: 'person', color: 'from-purple-600 to-pink-600' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as 'all' | 'work' | 'personal')}
                      className={`relative h-10 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-lg transform scale-105`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-current"></span>
                      )}
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                  
                  {/* Settings Button */}
                  <button
                    onClick={onManageTemplates}
                    className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center group"
                    title="Manage Templates"
                  >
                    <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {/* Blank Task */}
            <button
              onClick={handleCreateBlank}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="p-6 flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl text-white">edit_square</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Blank Task</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start from scratch</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-2xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
            </button>

            {/* Quick Add */}
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
              className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="p-6 flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl text-white">bolt</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Quick Add</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fast task creation</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-2xl group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* Templates Section */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-1 h-5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
              Templates
            </h3>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {filteredTemplates.length} available
            </span>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-600">search_off</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative aspect-square rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 text-left overflow-hidden"
                >
                  <div className="relative p-4 h-full flex flex-col">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <span className="material-symbols-outlined text-xl text-white">{template.icon}</span>
                      </div>
                      {template.isCustom && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white uppercase tracking-wide">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-600 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">{template.category === 'Work' ? 'work' : 'person'}</span>
                        <span className="capitalize">{template.category}</span>
                      </div>
                      {template.template.timeEstimate && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            <span>{template.template.timeEstimate}m</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={previewTemplate}
        onUseAsTemplate={handleUseAsTemplate}
        onSaveAsTask={handleSaveAsTask}
      />
    </AccessibleModal>
  )
}
