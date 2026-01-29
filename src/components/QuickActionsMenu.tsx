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
      {/* Ultra-Modern Glassmorphic Design */}
      <div className="flex flex-col h-[92vh] w-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 dark:from-black dark:via-slate-950 dark:to-black">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 px-8 pt-7 pb-6 backdrop-blur-xl bg-white/5 dark:bg-white/[0.02] border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            {/* Title */}
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span className="text-4xl">✨</span>
                Create Task
              </h2>
              <p className="text-sm text-slate-400 mt-1">Choose a template or start fresh</p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 hover:rotate-90"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Search & Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All', icon: 'apps' },
                { id: 'work', label: 'Work', icon: 'work' },
                { id: 'personal', label: 'Personal', icon: 'person' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as 'all' | 'work' | 'personal')}
                  className={`h-11 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all backdrop-blur-md ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/50'
                      : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/15'
                  }`}
                >
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden material-symbols-outlined text-base">{cat.icon}</span>
                </button>
              ))}
              
              <button
                onClick={onManageTemplates}
                className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 text-slate-300 transition-all flex items-center justify-center"
                title="Manage Templates"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          
          {/* Quick Actions - Minimalist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Blank Task */}
            <button
              onClick={handleCreateBlank}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="relative p-8 flex items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl text-white">add_circle</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Blank Task</h3>
                  <p className="text-sm text-slate-400">Start from scratch with complete flexibility</p>
                </div>
                <span className="material-symbols-outlined text-white/30 text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl hover:border-amber-400/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500"></div>
              <div className="relative p-8 flex items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl text-white">bolt</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Quick Add</h3>
                  <p className="text-sm text-slate-400">Create a simple task for today instantly</p>
                </div>
                <span className="material-symbols-outlined text-white/30 text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* Templates Section */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white/90 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
              Templates
            </h3>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredTemplates.length} Available
            </span>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-500">search_off</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No templates found</h3>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative aspect-square rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 text-left overflow-hidden"
                >
                  {/* Gradient Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 transition-all duration-500"></div>
                  
                  <div className="relative p-4 h-full flex flex-col">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-14 h-14 rounded-xl ${template.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="material-symbols-outlined text-2xl text-white">{template.icon}</span>
                      </div>
                      {template.isCustom && (
                        <span className="px-1.5 py-0.5 text-[8px] font-black rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white uppercase tracking-widest">
                          C
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-white mb-1.5 line-clamp-2 group-hover:text-indigo-300 transition-colors leading-tight">
                        {template.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">{template.category === 'Work' ? 'work' : 'person'}</span>
                      </div>
                      {template.template.timeEstimate && (
                        <>
                          <span className="text-slate-600">•</span>
                          <div className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
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
