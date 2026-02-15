import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import type { HabitTask, HabitTaskPriority } from '@/types/habitTask'

interface HabitTasksModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
}

export function HabitTasksModal({ isOpen, onClose, habitId, habitName }: HabitTasksModalProps) {
  const { getTasksByHabitId, addTask, updateTask, deleteTask } = useHabitTaskStore()
  const tasks = getTasksByHabitId(habitId)

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as HabitTaskPriority,
    dueDate: '',
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState('')

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
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative border-b border-slate-200 bg-gradient-to-r from-primary/5 to-emerald-400/5 px-6 py-5 dark:border-white/10 dark:from-primary/10 dark:to-emerald-400/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 shadow-lg">
                  <span className="material-symbols-outlined text-2xl text-white">task</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{habitName}</h2>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-600 backdrop-blur-sm transition-all hover:bg-white hover:scale-105 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Task List */}
            {tasks.length === 0 && !isAddingTask ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col items-center justify-center text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-primary/20 to-emerald-400/20 blur-2xl" />
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-400/10 ring-1 ring-primary/20">
                    <span className="material-symbols-outlined text-6xl text-primary">task_alt</span>
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">No tasks yet</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                  Break down this habit into smaller, actionable tasks to track your progress better.
                </p>
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 dark:bg-primary/10">
                  <span className="material-symbols-outlined text-sm text-primary">lightbulb</span>
                  <p className="text-xs font-medium text-primary">Tip: Start with 2-3 simple tasks</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            )}

            {/* Add/Edit Task Form */}
            <AnimatePresence>
              {isAddingTask && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className={clsx('rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/80', tasks.length > 0 && 'mt-4')}
                >
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                    {editingTaskId ? 'Edit Task' : 'New Task'}
                  </h3>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Read 10 pages"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add more details..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Priority and Due Date */}
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as HabitTaskPriority })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Add a tag..."
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-primary/70"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTask(false)
                        setEditingTaskId(null)
                        resetForm()
                      }}
                      className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.title.trim()}
                      className={clsx(
                        'flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all',
                        formData.title.trim()
                          ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                          : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                      )}
                    >
                      {editingTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!isAddingTask && (
            <div className="border-t border-slate-200 bg-gradient-to-b from-transparent to-slate-50/50 px-6 py-4 dark:border-white/10 dark:to-slate-900/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsAddingTask(true)}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <span className="material-symbols-outlined transition-transform group-hover:rotate-90">add_circle</span>
                Add New Task
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Task Item Component
interface TaskItemProps {
  task: HabitTask
  index: number
  onEdit: () => void
  onDelete: () => void
}

function TaskItem({ task, index, onEdit, onDelete }: TaskItemProps) {
  const priorityConfig = {
    low: { 
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'arrow_downward',
      ring: 'ring-blue-200/50 dark:ring-blue-500/20'
    },
    medium: { 
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      icon: 'remove',
      ring: 'ring-amber-200/50 dark:ring-amber-500/20'
    },
    high: { 
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      icon: 'priority_high',
      ring: 'ring-red-200/50 dark:ring-red-500/20'
    },
  }

  const priority = task.priority || 'medium'
  const config = priorityConfig[priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:hover:border-primary/30"
    >
      {/* Left accent bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1', config.bg)} />

      <div className="flex items-start gap-4 pl-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="flex-1 font-bold text-slate-900 dark:text-white">{task.title}</h4>
            {task.priority && (
              <div className={clsx('flex items-center gap-1 rounded-lg px-2 py-1 ring-1', config.bg, config.text, config.ring)}>
                <span className="material-symbols-outlined text-xs">{config.icon}</span>
                <span className="text-xs font-bold uppercase">{priority}</span>
              </div>
            )}
          </div>
          
          {task.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{task.description}</p>
          )}
          
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-white/5">
                <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">event</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-xs">tag</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.button
            type="button"
            onClick={onEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-white/5 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={onDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
