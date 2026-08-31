import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { AccessibleModal } from '@/shared/ui/AccessibleModal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, Subtask, Task } from '@/types/task'

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: TaskTemplate | null
  onUseAsTemplate: (template: TaskTemplate) => void
  onSaveAsTask: (taskData: Omit<Task, 'id' | 'completed'>) => void
  onSaveToMyTemplates?: (template: TaskTemplate) => void
  onUpdateTemplate?: (template: TaskTemplate) => void
  onDeleteTemplate?: (template: TaskTemplate) => void
  customTemplates?: TaskTemplate[]
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onUseAsTemplate: _onUseAsTemplate,
  onSaveAsTask: _onSaveAsTask,
  onSaveToMyTemplates,
  onUpdateTemplate,
  onDeleteTemplate,
  customTemplates: _customTemplates = [],
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

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
    console.log(
      'Saved templates names:',
      savedTemplates.map((t) => t.name)
    )

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
    if (pendingTemplate && onSaveToMyTemplates) {
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

  // Handle delete template
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    if (!template || !onDeleteTemplate) return

    onDeleteTemplate(template)
    setShowDeleteConfirmation(false)
    onClose() // Close the preview modal after deletion
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  // Check if template can be edited (must be custom or saved)
  const handleFieldFocus = () => {
    if (!template) return
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
      setEditedSubtasks(
        (template.template.subtasks || []).map((st, idx) => ({
          id: `subtask_${idx}`,
          text: st.text || '',
          completed: st.completed || false,
        }))
      )
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
    const initialSubtasks: Subtask[] = (template.template.subtasks || []).map((st, idx) => ({
      id: `subtask_${idx}`,
      text: st.text || '',
      completed: st.completed || false,
    }))
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

  if (!template) return null

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Preview"
      maxWidth="max-w-4xl"
      className="!border-0 !bg-transparent p-0 !shadow-none"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/5 dark:bg-gray-950/95">
        {/* Animated Background */}
        <div className="pointer-events-none absolute right-0 top-0 -mr-32 -mt-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[120px]"></div>

        <div className="relative z-10 h-[600px] w-full overflow-hidden">
          {/* Container with two panels */}
          <div className="relative h-full w-full">
            {/* Preview Panel - Shrinks to left side when edit mode */}
            <div
              className={`absolute left-0 top-0 flex h-full flex-col items-center justify-center p-12 text-center transition-all duration-500 ease-in-out ${
                isEditMode ? 'w-1/2' : 'w-full'
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white/40 dark:to-black/20"></div>

              {/* Delete Button - Top Left Corner */}
              {template.isCustom && onDeleteTemplate && (
                <button
                  onClick={handleDeleteClick}
                  className="group/delete absolute left-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/80 dark:hover:border-red-700 dark:hover:bg-red-900/20"
                  style={{
                    animation: isEditMode
                      ? 'slideUpFade 300ms ease-in-out forwards'
                      : 'slideDownFadeIn 300ms ease-in-out',
                    pointerEvents: isEditMode ? 'none' : 'auto',
                  }}
                  title="Delete template"
                  aria-label="Delete template"
                >
                  <span className="material-symbols-outlined text-[22px] text-gray-600 transition-colors group-hover/delete:text-red-600 dark:text-gray-400 dark:group-hover/delete:text-red-500">
                    delete
                  </span>
                </button>
              )}

              <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-center px-4">
                {/* Icon with glow effect and animation */}
                <div className="group relative mb-8">
                  <div
                    className="absolute inset-0 scale-110 opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{ backgroundColor: getTemplateColorHex(template) }}
                  ></div>
                  <div
                    className="relative flex h-32 w-32 transform items-center justify-center rounded-[2.5rem] shadow-2xl ring-4 ring-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-105 dark:ring-white/10"
                    style={{ backgroundColor: getTemplateColorHex(template) }}
                  >
                    <span className="material-symbols-outlined text-6xl text-white drop-shadow-lg">
                      {template.icon}
                    </span>
                  </div>
                </div>

                {/* Title with better typography */}
                <h2 className="mb-3 text-center text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                  {editedTitle || template.name}
                </h2>

                {/* Description with better readability */}
                <p className="mb-8 max-w-sm text-center text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {editedDescription || template.description}
                </p>

                {/* Badges: Category, Priority, Time - Shrink in edit mode */}
                <div
                  className={`mb-4 flex flex-nowrap items-center justify-center gap-2 transition-all duration-500 ${
                    isEditMode ? 'scale-90' : 'scale-100'
                  }`}
                >
                  {/* Category Badge */}
                  {editedCategory && (
                    <div
                      className={`flex items-center rounded-full border border-gray-200/50 bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm backdrop-blur-sm transition-all duration-500 dark:border-white/10 dark:from-white/10 dark:to-white/5 ${
                        isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-indigo-600 transition-all duration-500 dark:text-indigo-400 ${
                          isEditMode ? 'text-[14px]' : 'text-[16px]'
                        }`}
                      >
                        {editedCategory === 'Work'
                          ? 'business_center'
                          : editedCategory === 'Personal'
                            ? 'person'
                            : editedCategory === 'Health'
                              ? 'favorite'
                              : editedCategory === 'Creative'
                                ? 'palette'
                                : 'school'}
                      </span>
                      <span
                        className={`font-bold text-gray-800 transition-all duration-500 dark:text-gray-200 ${
                          isEditMode ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        {editedCategory}
                      </span>
                    </div>
                  )}

                  {/* Priority Badge */}
                  {editedPriority && (
                    <div
                      className={`flex items-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-500 ${
                        isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                      } ${
                        editedPriority === 'high'
                          ? 'border-red-200/50 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-500/30 dark:from-red-500/10 dark:to-red-500/20'
                          : editedPriority === 'medium'
                            ? 'border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-500/30 dark:from-yellow-500/10 dark:to-yellow-500/20'
                            : 'border-green-200/50 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-500/30 dark:from-green-500/10 dark:to-green-500/20'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined transition-all duration-500 ${
                          isEditMode ? 'text-[14px]' : 'text-[16px]'
                        } ${
                          editedPriority === 'high'
                            ? 'text-red-600 dark:text-red-400'
                            : editedPriority === 'medium'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        flag
                      </span>
                      <span
                        className={`font-bold capitalize transition-all duration-500 ${
                          isEditMode ? 'text-xs' : 'text-sm'
                        } ${
                          editedPriority === 'high'
                            ? 'text-red-700 dark:text-red-300'
                            : editedPriority === 'medium'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-green-700 dark:text-green-300'
                        }`}
                      >
                        {editedPriority}
                      </span>
                    </div>
                  )}

                  {/* Time Estimate Badge */}
                  {editedTimeEstimate && (
                    <div
                      className={`flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm backdrop-blur-sm transition-all duration-500 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-blue-500/20 ${
                        isEditMode ? 'gap-1 px-2 py-1.5' : 'gap-2 px-4 py-2'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-blue-600 transition-all duration-500 dark:text-blue-400 ${
                          isEditMode ? 'text-[14px]' : 'text-[16px]'
                        }`}
                      >
                        schedule
                      </span>
                      <span
                        className={`font-bold text-blue-700 transition-all duration-500 dark:text-blue-300 ${
                          isEditMode ? 'text-xs' : 'text-sm'
                        }`}
                      >
                        {editedTimeEstimate}m
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags Display - Show up to 3 tags */}
                {editedTags.length > 0 && (
                  <div
                    className={`mb-8 flex flex-wrap items-center justify-center gap-2 transition-all duration-500 ${
                      isEditMode ? 'scale-90' : 'scale-100'
                    }`}
                  >
                    {editedTags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-indigo-200/50 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
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
                  <span className="mb-8 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    Custom Template
                  </span>
                )}

                <div className="mt-auto w-full max-w-sm space-y-4">
                  {/* Animated Split Button */}
                  {!isEditMode ? (
                    // Edit Details Button
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="bg-size-200 bg-pos-0 hover:bg-pos-100 group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40"
                    >
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
                      <span className="material-symbols-outlined relative z-10 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                        edit
                      </span>
                      <span className="relative z-10">Edit Details</span>
                    </button>
                  ) : (
                    // Close Edit / Split Buttons
                    <motion.div
                      layout
                      className="flex w-full items-center justify-center"
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
                            className="bg-size-200 bg-pos-0 hover:bg-pos-100 group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40"
                          >
                            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
                            <span className="material-symbols-outlined relative z-10 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                              edit
                            </span>
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
                              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-gray-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40"
                            >
                              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
                              <span className="material-symbols-outlined relative z-10 text-xl">
                                close
                              </span>
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
                              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-green-600 hover:to-green-700 hover:shadow-2xl hover:shadow-green-500/40"
                            >
                              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
                              <span className="material-symbols-outlined relative z-10 text-xl">
                                check
                              </span>
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
                        // Convert subtasks to proper Subtask format with text field
                        const normalizedSubtasks: Omit<Subtask, 'id'>[] = (
                          template.template.subtasks || []
                        ).map((st) => ({
                          text: st.text || '',
                          completed: st.completed || false,
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
                            title: template.name, // Keep unified with name
                            description: template.description, // Keep unified with description
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
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: getTemplateColorHex(template) }}
                              >
                                <span className="material-symbols-outlined text-lg text-white">
                                  {template.icon}
                                </span>
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
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-indigo-600 bg-white px-6 py-4 text-lg font-bold text-gray-800 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-pink-500 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:shadow-xl dark:border-indigo-400 dark:bg-gray-900 dark:text-white dark:hover:border-pink-400 dark:hover:from-pink-500/10 dark:hover:to-purple-500/10"
                      title="Save to My Templates"
                    >
                      <span className="material-symbols-outlined relative z-10 text-pink-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125 dark:text-pink-400">
                        favorite
                      </span>
                      <span className="relative z-10">Make It My Template</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Panel - Slides in from right side */}
            <div
              className={`absolute right-0 top-0 h-full w-1/2 border-l border-gray-200 bg-white transition-transform duration-500 ease-in-out dark:border-white/5 dark:bg-gray-950 ${
                isEditMode ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div ref={editPanelRef} className="custom-scrollbar h-full overflow-y-auto p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-gray-400">tune</span>
                    Customize Details
                  </h3>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 font-medium text-gray-600 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    title="Hide edit panel"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                    Hide
                  </button>
                </div>

                {/* Warning Banner - Library templates cannot be edited */}
                {showEditWarning && !template.isCustom && (
                  <div className="animate-in slide-in-from-top mb-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 duration-300 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                        <span className="material-symbols-outlined text-xl text-amber-600 dark:text-amber-400">
                          lock
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-bold text-amber-900 dark:text-amber-200">
                          Template is Read-Only
                        </h4>
                        <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                          You cannot edit default library templates. Please save this template as
                          your own by clicking <strong>"Make It My Template"</strong> to enable
                          editing.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowEditWarning(false)}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-500/20"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title Input */}
                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      Task Title
                    </label>
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
                      className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="What needs to be done?"
                    />
                  </div>

                  {/* Priority & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                        Priority
                      </label>
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
                          className={`w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'pointer-events-none cursor-not-allowed opacity-60' : ''}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div className="group">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                        Category
                      </label>
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
                          className={`w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'pointer-events-none cursor-not-allowed opacity-60' : ''}`}
                        >
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Health">Health</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      Time Estimate (Minutes)
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        schedule
                      </span>
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
                        className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'cursor-not-allowed opacity-60' : ''}`}
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      Description
                    </label>
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
                      className={`w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="Add details about this task..."
                    />
                  </div>

                  {/* Tags Input with Inline Chips */}
                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      Tags
                    </label>
                    <div
                      className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:focus-within:bg-black/40 ${!template.isCustom ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      {/* Existing tags as chips inside input */}
                      <div className="flex min-h-[2rem] flex-1 flex-wrap gap-2">
                        {editedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                          >
                            #{tag}
                            {template.isCustom && (
                              <button
                                onClick={() => {
                                  const newTags = editedTags.filter((_, i) => i !== index)
                                  setEditedTags(newTags)
                                  checkForChanges({ tags: newTags })
                                }}
                                className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
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
                          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                          placeholder={editedTags.length === 0 ? 'Type tag name...' : ''}
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
                          className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                          type="button"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtasks Section */}
                  <div className="group">
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      Subtasks
                    </label>
                    <div className="space-y-3">
                      {editedSubtasks.map((subtask, index) => (
                        <div key={index} className="group/subtask flex items-center gap-3">
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-white/20"></div>
                          <input
                            type="text"
                            value={subtask.text || ''}
                            onChange={(e) => {
                              if (template.isCustom) {
                                const newSubtasks = [...editedSubtasks]
                                newSubtasks[index] = { ...subtask, text: e.target.value }
                                setEditedSubtasks(newSubtasks)
                                checkForChanges({ subtasks: newSubtasks })
                              }
                            }}
                            onFocus={handleFieldFocus}
                            readOnly={!template.isCustom}
                            className={`flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40 ${!template.isCustom ? 'cursor-not-allowed opacity-60' : ''}`}
                            placeholder="Subtask title"
                          />
                          {template.isCustom && (
                            <button
                              onClick={() => {
                                const newSubtasks = editedSubtasks.filter((_, i) => i !== index)
                                setEditedSubtasks(newSubtasks)
                                checkForChanges({ subtasks: newSubtasks })
                              }}
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 opacity-0 transition-all hover:bg-red-200 group-hover/subtask:opacity-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
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
                            const newSubtasks: Subtask[] = [
                              ...editedSubtasks,
                              { id: `subtask_${Date.now()}`, text: '', completed: false },
                            ]
                            setEditedSubtasks(newSubtasks)
                            checkForChanges({ subtasks: newSubtasks })
                          }}
                          className="group/add flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px] transition-transform group-hover/add:scale-110">
                            add_circle
                          </span>
                          <span>Add Subtask</span>
                        </button>
                      )}

                      {editedSubtasks.length === 0 && !template.isCustom && (
                        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Warning Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/20">
                <span className="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-400">
                  warning
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              Duplicate Template Name
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              You already have a template with the name <strong>"{pendingTemplate?.name}"</strong>.
              Do you want to create a duplicate?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelDuplicate}
                className="flex-1 rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDuplicate}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                Create Duplicate
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Delete Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
                  delete
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              Delete Template?
            </h3>

            {/* Message */}
            <p className="mb-2 text-center text-gray-600 dark:text-gray-300">
              Are you sure you want to delete
            </p>
            <p className="mb-6 text-center font-bold text-gray-900 dark:text-white">
              "{template.name}"?
            </p>
            <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/40"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AccessibleModal>
  )
}
