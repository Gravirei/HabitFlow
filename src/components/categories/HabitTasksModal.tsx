import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import type { HabitTask, HabitTaskPriority } from '@/types/habitTask'
import { iconColorOptions } from './CreateNewHabit'

interface HabitTasksModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
  habitIcon?: string
  habitIconColor?: number
}

export function HabitTasksModal({ isOpen, onClose, habitId, habitName, habitIcon = 'checklist', habitIconColor = 0 }: HabitTasksModalProps) {
  const { getTasksByHabitId, addTask, updateTask, deleteTask } = useHabitTaskStore()
  const tasks = getTasksByHabitId(habitId)
  
  // Get gradient and base color from habit's iconColor
  const colorScheme = iconColorOptions[habitIconColor] || iconColorOptions[0]
  const gradientClass = colorScheme.gradient // e.g., 'from-blue-500 to-cyan-500'
  const baseColorClass = colorScheme.textColor.replace('text-', '') // e.g., 'blue-500'
  
  // Extract actual color values for inline styles (Tailwind dynamic classes don't work)
  const colorMap: Record<string, { from: string; to: string; base: string; light: string }> = {
    'blue-500': { from: '#3b82f6', to: '#06b6d4', base: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },
    'purple-500': { from: '#a855f7', to: '#ec4899', base: '#a855f7', light: 'rgba(168, 85, 247, 0.1)' },
    'emerald-500': { from: '#10b981', to: '#14b8a6', base: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },
    'orange-500': { from: '#f97316', to: '#f59e0b', base: '#f97316', light: 'rgba(249, 115, 22, 0.1)' },
    'red-500': { from: '#ef4444', to: '#f43f5e', base: '#ef4444', light: 'rgba(239, 68, 68, 0.1)' },
    'teal-500': { from: '#14b8a6', to: '#06b6d4', base: '#14b8a6', light: 'rgba(20, 184, 166, 0.1)' },
  }
  const colors = colorMap[baseColorClass] || colorMap['blue-500']

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as HabitTaskPriority,
    dueDate: '',
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState('')

  // Total task count
  const totalTasks = tasks.length

  // Check for duplicate task name
  const hasDuplicateName = useMemo(() => {
    if (!formData.title.trim()) return false
    
    return tasks.some(task => {
      // If editing, exclude current task from duplicate check
      if (editingTaskId && task.id === editingTaskId) return false
      
      // Case-insensitive comparison
      return task.title.toLowerCase().trim() === formData.title.toLowerCase().trim()
    })
  }, [formData.title, tasks, editingTaskId])

  useEffect(() => {
    if (!isOpen) {
      setIsAddingTask(false)
      setEditingTaskId(null)
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: [],
    })
    setTagInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return

    // Check for duplicate when adding new task (not editing)
    if (!editingTaskId && hasDuplicateName) {
      setShowDuplicateConfirm(true)
      return
    }

    proceedWithSubmit()
  }

  const proceedWithSubmit = () => {
    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      })
      setEditingTaskId(null)
    } else {
      addTask({
        habitId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      })
    }
    
    resetForm()
    setIsAddingTask(false)
    setShowDuplicateConfirm(false)
  }

  const handleEdit = (task: HabitTask) => {
    setEditingTaskId(task.id)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      tags: task.tags || [],
    })
    setIsAddingTask(true)
  }

  const handleDelete = (taskId: string) => {
    deleteTask(taskId)
  }

  const confirmDelete = () => {
    if (deletingTaskId) {
      handleDelete(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Container - NEW DESIGN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Compact & Modern */}
          <div className={clsx(
            "relative flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700",
            `bg-gradient-to-r from-${baseColorClass}/10 via-white to-${baseColorClass}/10 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800`
          )}>
            <div className="flex items-center gap-3">
              <div className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm bg-gradient-to-br",
                iconColorOptions[habitIconColor]?.gradient || 'from-teal-500 to-teal-600'
              )}>
                <span className="material-symbols-outlined text-xl text-white">{habitIcon}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{habitName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>


          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/30">
            {/* Empty State (no animation container needed) */}
            {tasks.length === 0 && !isAddingTask ? (
              <div className="p-6 pb-24">
                <EmptyState onAddTask={() => setIsAddingTask(true)} colors={colors} />
              </div>
            ) : (
              /* Container without slide animation */
              <div className="p-6 pb-24">
                {/* Task List */}
                <div className="space-y-2 mb-6">
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEdit={() => handleEdit(task)}
                        onDelete={() => setDeletingTaskId(task.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add/Edit Task Form */}
                <AnimatePresence mode="wait">
                  {isAddingTask && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    >
                      <TaskForm
                      formData={formData}
                      setFormData={setFormData}
                      tagInput={tagInput}
                      setTagInput={setTagInput}
                      isEditing={!!editingTaskId}
                      onSubmit={handleSubmit}
                      onCancel={() => {
                        setIsAddingTask(false)
                        setEditingTaskId(null)
                        resetForm()
                      }}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      hasExistingTasks={tasks.length > 0}
                      hasDuplicateName={hasDuplicateName}
                      gradientClass={gradientClass}
                      baseColorClass={baseColorClass}
                      colors={colors}
                    />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Floating Pill Button - Outside scrollable area */}
          <AnimatePresence>
            {!isAddingTask && tasks.length > 0 && (
              <motion.button
                type="button"
                onClick={() => setIsAddingTask(true)}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 17,
                  delay: 0.1
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  "group absolute bottom-6 left-0 right-0 z-10 mx-auto w-fit flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-xl transition-shadow hover:shadow-2xl",
                  gradientClass,
                  `shadow-${baseColorClass}/30 hover:shadow-${baseColorClass}/40`
                )}
              >
                <motion.span 
                  className="material-symbols-outlined text-lg"
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{ 
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  add_circle
                </motion.span>
                <span>Add Task</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Duplicate Name Confirmation Modal */}
          <AnimatePresence>
            {showDuplicateConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setShowDuplicateConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                      <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">
                        warning
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Duplicate Task Name
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This name is already in use
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    A task with the name "<span className="font-medium text-slate-900 dark:text-white">{formData.title}</span>" already exists. Are you sure you want to create another task with the same name?
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDuplicateConfirm(false)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={proceedWithSubmit}
                      className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                    >
                      Create Anyway
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deletingTaskId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setDeletingTaskId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                      <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">
                        warning
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Delete Task?
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeletingTaskId(null)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Empty State Component
interface EmptyStateProps {
  onAddTask: () => void
  colors: { from: string; to: string; base: string; light: string }
}

function EmptyState({ onAddTask, colors }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"
    >
      <div 
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${colors.light}, ${colors.light})`
        }}
      >
        <span className="material-symbols-outlined text-5xl" style={{ color: colors.base }}>task_alt</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">No tasks yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Create your first task to start tracking progress on this habit.</p>
      <button
        type="button"
        onClick={onAddTask}
        className="mt-6 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.from}, ${colors.to})`
        }}
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Create Task
      </button>
    </motion.div>
  )
}

// Task Card Component
interface TaskCardProps {
  task: HabitTask
  index: number
  onEdit: () => void
  onDelete: () => void
}

function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const priorityConfig = {
    low: {
      color: 'bg-blue-500',
      label: 'Low',
      icon: 'arrow_downward',
    },
    medium: {
      color: 'bg-amber-500',
      label: 'Medium',
      icon: 'remove',
    },
    high: {
      color: 'bg-red-500',
      label: 'High',
      icon: 'priority_high',
    },
  }

  const priority = task.priority || 'medium'
  const config = priorityConfig[priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      layout
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Priority Indicator */}
      <div className={clsx('absolute left-0 top-0 h-full w-1', config.color)} />

      <div className="flex items-center gap-3 pl-2">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-slate-900 dark:text-white">
              {task.title}
            </h4>
            
            {/* Priority Badge */}
            <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-xs">{config.icon}</span>
              {config.label}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {task.dueDate && (
              <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <span className="material-symbols-outlined text-xs">event</span>
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions - Center aligned on right */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Task Form Component
interface TaskFormProps {
  formData: {
    title: string
    description: string
    priority: HabitTaskPriority
    dueDate: string
    tags: string[]
  }
  setFormData: (data: any) => void
  tagInput: string
  setTagInput: (value: string) => void
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  hasExistingTasks: boolean
  hasDuplicateName: boolean
  gradientClass: string
  baseColorClass: string
  colors: { from: string; to: string; base: string; light: string }
}

function TaskForm({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  isEditing,
  onSubmit,
  onCancel,
  onAddTag,
  onRemoveTag,
  hasExistingTasks,
  hasDuplicateName,
  gradientClass,
  baseColorClass,
  colors,
}: TaskFormProps) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onSubmit={onSubmit}
      className={clsx(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800',
        hasExistingTasks && 'mt-4'
      )}
    >
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {isEditing ? 'Edit Task' : 'New Task'}
      </h3>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Read 10 pages"
          className={clsx(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500",
            hasDuplicateName
              ? "border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 dark:border-amber-500/50 dark:focus:border-amber-400"
              : "border-slate-300 dark:border-slate-600"
          )}
          style={!hasDuplicateName ? {
            ['--tw-ring-color' as any]: `${colors.base}33`,
          } : {}}
          onFocus={(e) => {
            if (!hasDuplicateName) {
              e.target.style.borderColor = colors.base
            }
          }}
          onBlur={(e) => {
            if (!hasDuplicateName) {
              e.target.style.borderColor = ''
            }
          }}
          autoFocus
        />
        
        {/* Duplicate Name Warning */}
        <AnimatePresence>
          {hasDuplicateName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-500/10"
            >
              <span className="material-symbols-outlined text-base text-amber-600 dark:text-amber-400">
                warning
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                A task with this name already exists. Consider using a different name.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="task-description" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add details..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
          style={{
            ['--tw-ring-color' as any]: `${colors.base}33`,
          }}
          onFocus={(e) => e.target.style.borderColor = colors.base}
          onBlur={(e) => e.target.style.borderColor = ''}
        />
      </div>

      {/* Priority and Due Date */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-priority" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Priority
          </label>
          <select
            id="task-priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as HabitTaskPriority })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-teal-400"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-duedate" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Due Date
          </label>
          <input
            id="task-duedate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            style={{
              ['--tw-ring-color' as any]: `${colors.base}33`,
            }}
            onFocus={(e) => e.target.style.borderColor = colors.base}
            onBlur={(e) => e.target.style.borderColor = ''}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mb-5">
        <label htmlFor="task-tags" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Tags
        </label>
        <div className="flex gap-2">
          <input
            id="task-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAddTag()
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
            style={{
              ['--tw-ring-color' as any]: `${colors.base}33`,
            }}
            onFocus={(e) => e.target.style.borderColor = colors.base}
            onBlur={(e) => e.target.style.borderColor = ''}
          />
          <button
            type="button"
            onClick={onAddTag}
            className="rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                  `bg-${baseColorClass}/10 text-${baseColorClass} dark:bg-${baseColorClass}/10 dark:text-${baseColorClass}`
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className={`hover:text-${baseColorClass} dark:hover:text-${baseColorClass}`}
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.title.trim()}
          className={clsx(
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
            formData.title.trim()
              ? `bg-gradient-to-r ${gradientClass} text-white shadow-sm hover:shadow-md`
              : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
          )}
        >
          {isEditing ? 'Update' : 'Create'} Task
        </button>
      </div>
    </motion.form>
  )
}
