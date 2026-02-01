import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: TaskTemplate | null
  onUseAsTemplate: (template: TaskTemplate) => void
  onSaveAsTask: (taskData: any) => void
  onSaveToMyTemplates?: (template: TaskTemplate) => void
  onUpdateTemplate?: (template: TaskTemplate) => void
  customTemplates?: TaskTemplate[]
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onUseAsTemplate,
  onSaveAsTask,
  onSaveToMyTemplates,
  onUpdateTemplate,
  customTemplates = [],
}: TemplatePreviewModalProps) {
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>([])
  const [editedTimeEstimate, setEditedTimeEstimate] = useState<number | undefined>(undefined)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const editPanelRef = useRef<HTMLDivElement>(null)
  const [tagInput, setTagInput] = useState('')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TaskTemplate | null>(null)
  
  // Track unsaved changes for split button animation
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalValues, setOriginalValues] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: '',
    tags: [] as string[],
    subtasks: [] as Subtask[],
    timeEstimate: undefined as number | undefined,
  })
  
  const prefersReducedMotion = useReducedMotion()

  // Check if values have changed from original
  const checkForChanges = (newValues: Partial<typeof originalValues>) => {
    const current = {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      category: editedCategory,
      tags: editedTags,
      subtasks: editedSubtasks,
      timeEstimate: editedTimeEstimate,
      ...newValues,
    }
    
    const hasChanges = 
      current.title !== originalValues.title ||
      current.description !== originalValues.description ||
      current.priority !== originalValues.priority ||
      current.category !== originalValues.category ||
      JSON.stringify(current.tags) !== JSON.stringify(originalValues.tags) ||
      JSON.stringify(current.subtasks) !== JSON.stringify(originalValues.subtasks) ||
      current.timeEstimate !== originalValues.timeEstimate
    
    setHasUnsavedChanges(hasChanges)
  }

  // Handle Save - Update original values and merge buttons
  const handleSaveChanges = () => {
    if (!template) return
    
    // Create updated template with new values
    // Update both name (for card display) and title (for task)
    const updatedTemplate: TaskTemplate = {
      ...template,
      name: editedTitle, // Update card display name
      description: editedDescription,
      category: editedCategory, // Update top-level category for card display
      sourceTemplateId: template.sourceTemplateId, // Preserve source template ID
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
    
    // Call the update callback to persist changes
    if (onUpdateTemplate) {
      onUpdateTemplate(updatedTemplate)
    }
    
    // Update original values to reflect the save
    setOriginalValues({
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      category: editedCategory,
      tags: editedTags,
      subtasks: editedSubtasks,
      timeEstimate: editedTimeEstimate,
    })
    
    setHasUnsavedChanges(false)
    
    toast.success('Changes saved!', {
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: '#10b981',
        color: '#fff',
        fontWeight: '600',
      },
    })
  }

  // Handle Cancel - Restore original values and close edit panel
  const handleCancelChanges = () => {
    setEditedTitle(originalValues.title)
    setEditedDescription(originalValues.description)
    setEditedPriority(originalValues.priority)
    setEditedCategory(originalValues.category)
    setEditedTags(originalValues.tags)
    setEditedSubtasks(originalValues.subtasks)
    setEditedTimeEstimate(originalValues.timeEstimate)
    
    setHasUnsavedChanges(false)
    setIsEditMode(false)
  }

  // Check for duplicate template names
  const checkForDuplicate = (templateToSave: TaskTemplate) => {
    if (!onSaveToMyTemplates) return false
    
    // Read directly from localStorage to ensure we have the latest data
    let savedTemplates: TaskTemplate[] = []
    try {
      const stored = localStorage.getItem('taskTemplates')
      if (stored) {
        savedTemplates = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error reading taskTemplates from localStorage:', error)
    }
    
    console.log('🔍 Checking for duplicates...')
    console.log('Template to save name:', templateToSave.name)
    console.log('Saved templates count:', savedTemplates.length)
    console.log('Saved templates names:', savedTemplates.map(t => t.name))
    
    // Find if a template with the same name already exists
    const existingTemplate = savedTemplates.find(
      (t: TaskTemplate) => t.name === templateToSave.name
    )
    
    console.log('Existing template found?', !!existingTemplate)
    
    return !!existingTemplate
  }

  // Handle saving template (with or without duplicate check)
  const handleSaveTemplate = (templateToSave: TaskTemplate, force: boolean = false) => {
    if (!onSaveToMyTemplates) return
    
    if (!force && checkForDuplicate(templateToSave)) {
      // Show duplicate warning
      setPendingTemplate(templateToSave)
      setShowDuplicateWarning(true)
    } else {
      // Save directly (toast will be shown by caller)
      onSaveToMyTemplates(templateToSave)
    }
  }

  // Handle duplicate confirmation
  const handleCreateDuplicate = () => {
    if (pendingTemplate) {
      onSaveToMyTemplates(pendingTemplate)
      toast.success('Duplicate template created!', {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
        },
      })
    }
    setShowDuplicateWarning(false)
    setPendingTemplate(null)
  }

  // Handle cancel duplicate
  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false)
    setPendingTemplate(null)
  }

  // Check if template can be edited (must be custom or saved)
  const handleFieldFocus = () => {
    if (!template.isCustom) {
      setShowEditWarning(true)
      // Scroll to top of edit panel to show warning banner
      if (editPanelRef.current) {
        editPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowEditWarning(false), 5000)
    }
  }

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
    const initialTitle = template.name
    const initialDescription = template.description || ''
    const initialPriority = template.template.priority || 'medium'
    const initialCategory = template.template.category || template.category
    const initialTags = template.template.tags || []
    const initialSubtasks = template.template.subtasks || []
    const initialTimeEstimate = template.template.timeEstimate
    
    setEditedTitle(initialTitle)
    setEditedDescription(initialDescription)
    setEditedPriority(initialPriority)
    setEditedCategory(initialCategory)
    setEditedTags(initialTags)
    setEditedSubtasks(initialSubtasks)
    setEditedTimeEstimate(initialTimeEstimate)
    
    // Store original values
    setOriginalValues({
      title: initialTitle,
      description: initialDescription,
      priority: initialPriority,
      category: initialCategory,
      tags: initialTags,
      subtasks: initialSubtasks,
      timeEstimate: initialTimeEstimate,
    })
    
    setIsEditMode(false) // Reset edit mode when opening new template
    setShowEditWarning(false) // Reset warning banner
    setHasUnsavedChanges(false) // Reset unsaved changes
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
             
              <div className="relative z-10 w-full max-w-md flex flex-col items-center h-full justify-center px-4">
               {/* Icon with glow effect and animation */}
               <div className="relative mb-8 group">
                 <div className={`absolute inset-0 ${template.color} opacity-20 blur-3xl scale-110 group-hover:opacity-30 transition-opacity duration-500`}></div>
                 <div className={`relative w-32 h-32 rounded-[2.5rem] ${template.color} flex items-center justify-center shadow-2xl ring-4 ring-white/20 dark:ring-white/10 backdrop-blur-xl transform hover:scale-105 transition-all duration-300`}>
                   <span className="material-symbols-outlined text-6xl text-white drop-shadow-lg">{template.icon}</span>
                 </div>
               </div>
               
               {/* Title with better typography */}
               <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center leading-tight tracking-tight">
                 {editedTitle || template.name}
               </h2>
               
               {/* Description with better readability */}
               <p className="text-base text-gray-600 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
                 {editedDescription || template.description}
               </p>

               {/* Badges: Category, Priority, Time - Shrink in edit mode */}
               <div className={`flex items-center justify-center gap-2 flex-nowrap mb-4 transition-all duration-500 ${
                 isEditMode ? 'scale-90' : 'scale-100'
               }`}>
                 {/* Category Badge */}
                 {editedCategory && (
                   <div className={`flex items-center rounded-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 shadow-sm transition-all duration-500 ${
                     isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                   }`}>
                     <span className={`material-symbols-outlined text-indigo-600 dark:text-indigo-400 transition-all duration-500 ${
                       isEditMode ? 'text-[14px]' : 'text-[16px]'
                     }`}>
                       {editedCategory === 'Work' ? 'business_center' : editedCategory === 'Personal' ? 'person' : editedCategory === 'Health' ? 'favorite' : editedCategory === 'Creative' ? 'palette' : 'school'}
                     </span>
                     <span className={`font-bold text-gray-800 dark:text-gray-200 transition-all duration-500 ${
                       isEditMode ? 'text-xs' : 'text-sm'
                     }`}>
                       {editedCategory}
                     </span>
                   </div>
                 )}

                 {/* Priority Badge */}
                 {editedPriority && (
                   <div className={`flex items-center rounded-full backdrop-blur-sm border shadow-sm transition-all duration-500 ${
                     isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                   } ${
                     editedPriority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/20 border-red-200/50 dark:border-red-500/30' :
                     editedPriority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-500/10 dark:to-yellow-500/20 border-yellow-200/50 dark:border-yellow-500/30' :
                     'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/20 border-green-200/50 dark:border-green-500/30'
                   }`}>
                     <span className={`material-symbols-outlined transition-all duration-500 ${
                       isEditMode ? 'text-[14px]' : 'text-[16px]'
                     } ${
                       editedPriority === 'high' ? 'text-red-600 dark:text-red-400' :
                       editedPriority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                       'text-green-600 dark:text-green-400'
                     }`}>flag</span>
                     <span className={`font-bold capitalize transition-all duration-500 ${
                       isEditMode ? 'text-xs' : 'text-sm'
                     } ${
                       editedPriority === 'high' ? 'text-red-700 dark:text-red-300' :
                       editedPriority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                       'text-green-700 dark:text-green-300'
                     }`}>
                       {editedPriority}
                     </span>
                   </div>
                 )}

                 {/* Time Estimate Badge */}
                 {editedTimeEstimate && (
                   <div className={`flex items-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30 shadow-sm transition-all duration-500 ${
                     isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                   }`}>
                     <span className={`material-symbols-outlined text-blue-600 dark:text-blue-400 transition-all duration-500 ${
                       isEditMode ? 'text-[14px]' : 'text-[16px]'
                     }`}>schedule</span>
                     <span className={`font-bold text-blue-700 dark:text-blue-300 transition-all duration-500 ${
                       isEditMode ? 'text-xs' : 'text-sm'
                     }`}>
                       {editedTimeEstimate}m
                     </span>
                   </div>
                 )}
               </div>

               {/* Tags Display - Show up to 3 tags */}
               {editedTags.length > 0 && (
                 <div className={`flex items-center justify-center gap-2 flex-wrap mb-8 transition-all duration-500 ${
                   isEditMode ? 'scale-90' : 'scale-100'
                 }`}>
                   {editedTags.slice(0, 3).map((tag, index) => (
                     <span
                       key={index}
                       className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/50 dark:border-indigo-500/30"
                     >
                       #{tag}
                     </span>
                   ))}
                   {editedTags.length > 3 && (
                     <span className="text-xs font-bold text-gray-400">...</span>
                   )}
                 </div>
               )}

               {template.isCustom && (
                 <span className="px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8">
                   Custom Template
                 </span>
               )}

               <div className="mt-auto w-full space-y-4 max-w-sm">
                 {/* Animated Split Button */}
                 {!isEditMode ? (
                   // Edit Details Button
                   <button
                     onClick={() => setIsEditMode(true)}
                     className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-3 group relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                     <span className="material-symbols-outlined group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">edit</span>
                     <span className="relative z-10">Edit Details</span>
                   </button>
                 ) : (
                   // Close Edit / Split Buttons
                   <motion.div
                     layout
                     className="flex items-center justify-center w-full"
                     animate={{
                       gap: hasUnsavedChanges ? '12px' : '0px',
                     }}
                     transition={{
                       duration: prefersReducedMotion ? 0 : 0.3,
                       ease: 'easeInOut',
                     }}
                   >
                     <AnimatePresence mode="wait">
                       {!hasUnsavedChanges && (
                         <motion.button
                           key="close-edit"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{
                             duration: prefersReducedMotion ? 0 : 0.2,
                           }}
                           onClick={() => setIsEditMode(false)}
                           className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-3 group relative overflow-hidden"
                         >
                           <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                           <span className="material-symbols-outlined group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10">edit</span>
                           <span className="relative z-10">Close Edit</span>
                         </motion.button>
                       )}

                       {hasUnsavedChanges && (
                         <>
                           {/* Cancel Button */}
                           <motion.button
                             key="cancel-btn"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             transition={{
                               duration: prefersReducedMotion ? 0 : 0.2,
                             }}
                             onClick={handleCancelChanges}
                             className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg shadow-xl shadow-gray-500/30 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                           >
                             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                             <span className="material-symbols-outlined text-xl relative z-10">close</span>
                             <span className="relative z-10">Cancel</span>
                           </motion.button>

                           {/* Save Button */}
                           <motion.button
                             key="save-btn"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             transition={{
                               duration: prefersReducedMotion ? 0 : 0.2,
                             }}
                             onClick={handleSaveChanges}
                             className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                           >
                             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                             <span className="material-symbols-outlined text-xl relative z-10">check</span>
                             <span className="relative z-10">Save</span>
                           </motion.button>
                         </>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 )}
                 
                 {onSaveToMyTemplates && !template.isCustom && (
                   <button
                     onClick={() => {
                       // Save with ORIGINAL values from library template
                       // Normalize subtasks to use 'title' instead of 'text'
                       const normalizedSubtasks = (template.template.subtasks || []).map(st => ({
                         title: (st as any).title || (st as any).text || '',
                         completed: st.completed || false
                       }))
                       
                       const newTemplate: TaskTemplate = {
                         ...template,
                         id: `custom_${Date.now()}`,
                         name: template.name,
                         description: template.description,
                         isCustom: true,
                         sourceTemplateId: template.id, // Track original library template
                         template: {
                           ...template.template,
                           subtasks: normalizedSubtasks, // Use normalized subtasks with 'title' field
                         },
                       }
                       
                       // Check for duplicates before saving
                       const isDuplicate = checkForDuplicate(newTemplate)
                       
                       if (isDuplicate) {
                         // Show duplicate warning modal
                         handleSaveTemplate(newTemplate)
                       } else {
                         // Save directly
                         handleSaveTemplate(newTemplate)
                         
                         // Show success toast and close
                         toast.success(`"${template.name}" saved to My Templates!`, {
                           icon: (
                             <div className={`w-8 h-8 rounded-lg ${template.color} flex items-center justify-center`}>
                               <span className="material-symbols-outlined text-white text-lg">{template.icon}</span>
                             </div>
                           ),
                           duration: 4000,
                           style: {
                             borderRadius: '12px',
                             background: '#10b981',
                             color: '#fff',
                             fontWeight: '600',
                           },
                         })
                         onClose()
                       }
                     }}
                     className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-gray-900 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-500/10 dark:hover:to-purple-500/10 text-gray-800 dark:text-white font-bold text-lg border-2 border-indigo-600 dark:border-indigo-400 hover:border-pink-500 dark:hover:border-pink-400 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                     title="Save to My Templates"
                   >
                     <span className="material-symbols-outlined text-pink-600 dark:text-pink-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 relative z-10">favorite</span>
                     <span className="relative z-10">Make It My Template</span>
                   </button>
                 )}
               </div>
              </div>
            </div>

            {/* Edit Panel - Slides in from right side */}
            <div className={`absolute right-0 top-0 w-1/2 h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-white/5 transition-transform duration-500 ease-in-out ${
              isEditMode ? 'translate-x-0' : 'translate-x-full'
            }`}>
              <div ref={editPanelRef} className="p-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">tune</span>
                    Customize Details
                  </h3>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-medium transition-all"
                    title="Hide edit panel"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                    Hide
                  </button>
                </div>

                {/* Warning Banner - Library templates cannot be edited */}
                {showEditWarning && !template.isCustom && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-2 border-amber-200 dark:border-amber-500/30 animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">lock</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1 text-sm">
                          Template is Read-Only
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                          You cannot edit default library templates. Please save this template as your own by clicking <strong>"Make It My Template"</strong> to enable editing.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowEditWarning(false)}
                        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-amber-200 dark:hover:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                )}


            <div className="space-y-6">
              {/* Title Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Task Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => {
                    if (template.isCustom) {
                      const newValue = e.target.value
                      setEditedTitle(newValue)
                      checkForChanges({ title: newValue })
                    }
                  }}
                  onFocus={handleFieldFocus}
                  readOnly={!template.isCustom}
                  className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${!template.isCustom ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                      onChange={(e) => {
                        if (template.isCustom) {
                          const newValue = e.target.value as TaskPriority
                          setEditedPriority(newValue)
                          checkForChanges({ priority: newValue })
                        }
                      }}
                      onFocus={handleFieldFocus}
                      className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white appearance-none focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium cursor-pointer ${!template.isCustom ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
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
                      onChange={(e) => {
                        if (template.isCustom) {
                          const newValue = e.target.value
                          setEditedCategory(newValue)
                          checkForChanges({ category: newValue })
                        }
                      }}
                      onFocus={handleFieldFocus}
                      className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white appearance-none focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium cursor-pointer ${!template.isCustom ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
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
                    onChange={(e) => {
                      if (template.isCustom) {
                        const newValue = e.target.value ? parseInt(e.target.value) : undefined
                        setEditedTimeEstimate(newValue)
                        checkForChanges({ timeEstimate: newValue })
                      }
                    }}
                    onFocus={handleFieldFocus}
                    readOnly={!template.isCustom}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${!template.isCustom ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="e.g. 30"
                  />
                 </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Description</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => {
                    if (template.isCustom) {
                      const newValue = e.target.value
                      setEditedDescription(newValue)
                      checkForChanges({ description: newValue })
                    }
                  }}
                  onFocus={handleFieldFocus}
                  readOnly={!template.isCustom}
                  rows={4}
                  className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none ${!template.isCustom ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Add details about this task..."
                />
              </div>

              {/* Tags Input with Inline Chips */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">Tags</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-black/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all ${!template.isCustom ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {/* Existing tags as chips inside input */}
                  <div className="flex flex-wrap gap-2 flex-1 min-h-[2rem]">
                    {editedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
                      >
                        #{tag}
                        {template.isCustom && (
                          <button
                            onClick={() => {
                              const newTags = editedTags.filter((_, i) => i !== index)
                              setEditedTags(newTags)
                              checkForChanges({ tags: newTags })
                            }}
                            className="hover:bg-indigo-200 dark:hover:bg-indigo-500/30 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        )}
                      </span>
                    ))}
                    {/* Input field inside container */}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onFocus={handleFieldFocus}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim() && template.isCustom) {
                          e.preventDefault()
                          const newTags = [...editedTags, tagInput.trim()]
                          setEditedTags(newTags)
                          setTagInput('')
                          checkForChanges({ tags: newTags })
                        }
                      }}
                      readOnly={!template.isCustom}
                      className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
                      placeholder={editedTags.length === 0 ? "Type tag name..." : ""}
                    />
                  </div>
                  {/* Add button */}
                  {template.isCustom && (
                    <button
                      onClick={() => {
                        if (tagInput.trim()) {
                          const newTags = [...editedTags, tagInput.trim()]
                          setEditedTags(newTags)
                          setTagInput('')
                          checkForChanges({ tags: newTags })
                        }
                      }}
                      className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                      type="button"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 group-focus-within:text-indigo-600 transition-colors">Subtasks</label>
                <div className="space-y-3">
                  {editedSubtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-3 group/subtask">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center flex-shrink-0"></div>
                      <input
                        type="text"
                        value={(subtask as any).title || (subtask as any).text || ''}
                        onChange={(e) => {
                          if (template.isCustom) {
                            const newSubtasks = [...editedSubtasks]
                            newSubtasks[index] = { ...subtask, title: e.target.value }
                            setEditedSubtasks(newSubtasks)
                            checkForChanges({ subtasks: newSubtasks })
                          }
                        }}
                        onFocus={handleFieldFocus}
                        readOnly={!template.isCustom}
                        className={`flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium ${!template.isCustom ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Subtask title"
                      />
                      {template.isCustom && (
                        <button
                          onClick={() => {
                            const newSubtasks = editedSubtasks.filter((_, i) => i !== index)
                            setEditedSubtasks(newSubtasks)
                            checkForChanges({ subtasks: newSubtasks })
                          }}
                          className="opacity-0 group-hover/subtask:opacity-100 w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center transition-all flex-shrink-0"
                          type="button"
                          title="Remove subtask"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add New Subtask Button */}
                  {template.isCustom && (
                    <button
                      onClick={() => {
                        const newSubtasks = [...editedSubtasks, { title: '', completed: false }]
                        setEditedSubtasks(newSubtasks)
                        checkForChanges({ subtasks: newSubtasks })
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-all flex items-center justify-center gap-2 group/add"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px] group-hover/add:scale-110 transition-transform">add_circle</span>
                      <span>Add Subtask</span>
                    </button>
                  )}
                  
                  {editedSubtasks.length === 0 && !template.isCustom && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      No subtasks
                    </div>
                  )}
                </div>
              </div>
            </div>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Duplicate Warning Modal */}
     {showDuplicateWarning && (
       <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
         >
           {/* Warning Icon */}
           <div className="flex justify-center mb-4">
             <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
               <span className="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-400">warning</span>
             </div>
           </div>

           {/* Title */}
           <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
             Duplicate Template Name
           </h3>

           {/* Message */}
           <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
             You already have a template with the name <strong>"{pendingTemplate?.name}"</strong>. Do you want to create a duplicate?
           </p>

           {/* Buttons */}
           <div className="flex gap-3">
             <button
               onClick={handleCancelDuplicate}
               className="flex-1 py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={handleCreateDuplicate}
               className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
             >
               Create Duplicate
             </button>
           </div>
         </motion.div>
       </div>
     )}
    </AccessibleModal>
  )
}
