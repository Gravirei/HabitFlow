import { useState } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: TaskTemplate | null
  onUseAsTemplate: (template: TaskTemplate) => void
  onSaveAsTask: (taskData: any) => void
  onSaveToMyTemplates?: (template: TaskTemplate) => void
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onUseAsTemplate,
  onSaveAsTask,
  onSaveToMyTemplates,
}: TemplatePreviewModalProps) {
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>([])
  const [editedTimeEstimate, setEditedTimeEstimate] = useState<number | undefined>(undefined)
  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize form when template changes
  useState(() => {
    if (template) {
      setEditedTitle(template.name) // Use template.name to match library card
      setEditedDescription(template.description || '') // Use template.description to match library card
      setEditedPriority(template.template.priority || 'medium')
      setEditedCategory(template.template.category || template.category)
      setEditedTags(template.template.tags || [])
      setEditedSubtasks(template.template.subtasks || [])
      setEditedTimeEstimate(template.template.timeEstimate)
    }
  })

  // Update local state when template prop changes
  const [prevTemplateId, setPrevTemplateId] = useState<string | null>(null)
  if (template && template.id !== prevTemplateId) {
    setPrevTemplateId(template.id)
    setEditedTitle(template.name) // Use template.name to match library card
    setEditedDescription(template.description || '') // Use template.description to match library card
    setEditedPriority(template.template.priority || 'medium')
    setEditedCategory(template.template.category || template.category)
    setEditedTags(template.template.tags || [])
    setEditedSubtasks(template.template.subtasks || [])
    setEditedTimeEstimate(template.template.timeEstimate)
  }

  const handleUseAsTemplate = () => {
    if (!template) return
    
    const updatedTemplate: TaskTemplate = {
      ...template,
      template: {
        ...template.template,
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        category: editedCategory,
        tags: editedTags,
        subtasks: editedSubtasks,
        timeEstimate: editedTimeEstimate,
      },
    }
    
    onUseAsTemplate(updatedTemplate)
    onClose()
  }

  const handleSaveAsTask = () => {
    if (!template) return
    
    const taskData = {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      status: 'todo' as TaskStatus,
      category: editedCategory,
      tags: editedTags,
      subtasks: editedSubtasks,
      timeEstimate: editedTimeEstimate,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    onSaveAsTask(taskData)
    onClose()
  }

  if (!template) return null

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Preview"
      maxWidth="max-w-4xl"
      className="!bg-transparent !shadow-none !border-0 p-0"
    >
      <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 relative">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none -mt-32 -mr-32"></div>

        <div className="relative z-10 w-full h-[600px] overflow-hidden">
          {/* Container with two panels */}
          <div className="relative w-full h-full">
            
            {/* Preview Panel - Shrinks to left side when edit mode */}
            <div className={`absolute left-0 top-0 h-full p-12 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out ${
              isEditMode ? 'w-1/2' : 'w-full'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40 dark:to-black/20 pointer-events-none"></div>
             
              <div className="relative z-10 w-full max-w-md flex flex-col items-center h-full justify-center">
               <div className={`w-28 h-28 rounded-[2rem] ${template.color} flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 ring-4 ring-white/50 dark:ring-white/10 rotate-3`}>
                 <span className="material-symbols-outlined text-5xl text-white drop-shadow-md">{template.icon}</span>
               </div>
               
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 max-w-[250px] leading-tight">
                 {editedTitle || template.name}
               </h2>
               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mb-6 leading-relaxed">
                 {editedDescription || template.description}
               </p>

               {/* Badges: Category, Priority, Time */}
               <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
                 {/* Category Badge */}
                 {editedCategory && (
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200/50 dark:border-white/5">
                     <span className="material-symbols-outlined text-[14px] text-gray-500 dark:text-gray-400">
                       {editedCategory === 'Work' ? 'business_center' : editedCategory === 'Personal' ? 'person' : editedCategory === 'Health' ? 'favorite' : editedCategory === 'Creative' ? 'palette' : 'school'}
                     </span>
                     <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                       {editedCategory}
                     </span>
                   </div>
                 )}

                 {/* Priority Badge */}
                 {editedPriority && (
                   <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-white/5 ${
                     editedPriority === 'high' ? 'bg-red-50 dark:bg-red-500/10' :
                     editedPriority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-500/10' :
                     'bg-green-50 dark:bg-green-500/10'
                   }`}>
                     <span className={`material-symbols-outlined text-[14px] ${
                       editedPriority === 'high' ? 'text-red-500' :
                       editedPriority === 'medium' ? 'text-yellow-500' :
                       'text-green-500'
                     }`}>flag</span>
                     <span className={`text-xs font-semibold capitalize ${
                       editedPriority === 'high' ? 'text-red-600 dark:text-red-400' :
                       editedPriority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                       'text-green-600 dark:text-green-400'
                     }`}>
                       {editedPriority}
                     </span>
                   </div>
                 )}

                 {/* Time Estimate Badge */}
                 {editedTimeEstimate && (
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-200/50 dark:border-white/5">
                     <span className="material-symbols-outlined text-[14px] text-gray-500 dark:text-gray-400">schedule</span>
                     <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                       {editedTimeEstimate}m
                     </span>
                   </div>
                 )}
               </div>

               {template.isCustom && (
                 <span className="px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8">
                   Custom Template
                 </span>
               )}

               <div className="mt-auto w-full space-y-3">
                 <button
                   onClick={handleSaveAsTask}
                   className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                 >
                   <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">add_task</span>
                   Create Task
                 </button>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={() => setIsEditMode(true)}
                     className="py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white font-semibold border border-gray-200/50 dark:border-white/5 transition-all hover:-translate-y-0.5"
                   >
                     Edit
                   </button>
                   {onSaveToMyTemplates && !template.isCustom && (
                      <button
                        onClick={() => {
                          const newTemplate: TaskTemplate = {
                            ...template,
                            id: `custom_${Date.now()}`,
                            name: template.name,
                            description: template.description,
                            isCustom: true,
                            template: {
                              ...template.template,
                              title: editedTitle,
                              description: editedDescription,
                              priority: editedPriority,
                              category: editedCategory,
                              tags: editedTags,
                              subtasks: editedSubtasks,
                              timeEstimate: editedTimeEstimate,
                            },
                          }
                          onSaveToMyTemplates(newTemplate)
                          onClose()
                        }}
                        className="py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white font-semibold border border-gray-200/50 dark:border-white/5 transition-all hover:-translate-y-0.5"
                        title="Save to My Templates"
                      >
                        Save Copy
                      </button>
                   )}
                 </div>
               </div>
              </div>
            </div>

            {/* Edit Panel - Slides in from right side */}
            <div className={`absolute right-0 top-0 w-1/2 h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-white/5 transition-transform duration-500 ease-in-out ${
              isEditMode ? 'translate-x-0' : 'translate-x-full'
            }`}>
              <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">tune</span>
                    Customize Details
                  </h3>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-colors"
                    title="Close edit panel"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

            <div className="space-y-6">
              {/* Title Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Task Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Priority</label>
                  <div className="relative">
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white appearance-none focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Category</label>
                  <div className="relative">
                     <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white appearance-none focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium cursor-pointer"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Time Estimate */}
              <div className="group">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Time Estimate (Minutes)</label>
                 <div className="relative">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">schedule</span>
                   <input
                    type="number"
                    value={editedTimeEstimate || ''}
                    onChange={(e) => setEditedTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="e.g. 30"
                  />
                 </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Description</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                  placeholder="Add details about this task..."
                />
              </div>

              {/* Subtasks Preview */}
              {editedSubtasks.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subtasks included</label>
                  <div className="space-y-2">
                    {editedSubtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subtask.title}</span>
                      </div>
                    ))}
                  </div>
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
