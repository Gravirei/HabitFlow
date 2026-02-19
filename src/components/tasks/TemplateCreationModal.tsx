import { useState, useEffect } from 'react'
import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplateCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveTemplate: (template: TaskTemplate) => void
  editingTemplate?: TaskTemplate | null
}

const iconOptions = [
  'task',
  'work',
  'home',
  'shopping_cart',
  'fitness_center',
  'school',
  'code',
  'article',
  'bug_report',
  'groups',
  'cleaning_services',
  'menu_book',
  'restaurant',
  'flight',
  'build',
  'lightbulb',
  'favorite',
  'star',
]

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Purple', value: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Green', value: 'bg-green-500', hex: '#22c55e' },
  { name: 'Red', value: 'bg-red-500', hex: '#ef4444' },
  { name: 'Orange', value: 'bg-orange-500', hex: '#f97316' },
  { name: 'Yellow', value: 'bg-yellow-500', hex: '#eab308' },
  { name: 'Pink', value: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Indigo', value: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Teal', value: 'bg-teal-500', hex: '#14b8a6' },
  { name: 'Cyan', value: 'bg-cyan-500', hex: '#06b6d4' },
]

const priorityOptions = [
  {
    value: 'high',
    label: 'High',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    value: 'low',
    label: 'Low',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
]

export function TemplateCreationModal({
  isOpen,
  onClose,
  onSaveTemplate,
  editingTemplate,
}: TemplateCreationModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('task')
  const [category, setCategory] = useState('Work')
  const [color, setColor] = useState('bg-blue-500')
  const [customHex, setCustomHex] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [subtasks, setSubtasks] = useState<Omit<Subtask, 'id'>[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [notes, setNotes] = useState('')
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>()
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(null)

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name)
      setDescription(editingTemplate.description || '')
      setIcon(editingTemplate.icon)
      setCategory(editingTemplate.category)
      setColor(editingTemplate.color)
      setCustomHex(null)
      setTitle(editingTemplate.template.title)
      setPriority(editingTemplate.template.priority)
      setStatus(editingTemplate.template.status)
      setTags(editingTemplate.template.tags)
      setSubtasks(editingTemplate.template.subtasks)
      setNotes(editingTemplate.template.notes || '')
      setTimeEstimate(editingTemplate.template.timeEstimate)
      setRecurring(editingTemplate.template.recurring || null)
    }
  }, [editingTemplate])

  const resetForm = () => {
    setName('')
    setDescription('')
    setIcon('task')
    setCategory('Work')
    setColor('bg-blue-500')
    setCustomHex(null)
    setTitle('')
    setPriority('medium')
    setStatus('todo')
    setTags([])
    setTagInput('')
    setSubtasks([])
    setSubtaskInput('')
    setNotes('')
    setTimeEstimate(undefined)
    setRecurring(null)
  }

  const handleSave = () => {
    if (!name.trim()) return

    const template: TaskTemplate = {
      id: editingTemplate?.id || `tmpl_custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      category,
      color,
      colorHex: selectedColorHex, // Save the hex color
      isCustom: true,
      template: {
        title: title.trim() || name.trim(), // Use template name as default title
        description: description.trim() || undefined, // Use same description as template
        priority,
        status,
        category,
        tags,
        subtasks,
        notes: notes.trim() || undefined,
        timeEstimate,
        recurring,
      },
    }

    onSaveTemplate(template)
    resetForm()
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, { text: subtaskInput.trim(), completed: false }])
      setSubtaskInput('')
    }
  }

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  // Get hex color from color value (handles both preset and custom colors)
  const selectedColorHex = (() => {
    const matched = colorOptions.find((c) => c.value === color)
    if (matched) return matched.hex
    
    // Extract hex from custom bg-[...] format
    const customMatch = color.match(/bg-\[([a-fA-F0-9]{6})\]/)
    if (customMatch) return '#' + customMatch[1]
    
    return '#3b82f6' // fallback
  })()

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        resetForm()
      }}
      title={editingTemplate ? 'Edit Template' : 'Create Template'}
      maxWidth="max-w-xl"
      closeOnBackdropClick={true}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900">
        {/* Header */}
        <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-6 py-5 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
              style={{ backgroundColor: selectedColorHex }}
            >
              <span className="material-symbols-outlined text-white">{icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingTemplate
                  ? 'Update your template details'
                  : 'Design a reusable task template'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose()
                resetForm()
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">info</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Basic Info
              </h3>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Routine"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Work, Personal"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-10 w-10 flex-shrink-0 rounded-lg border-2 border-gray-200 shadow-sm dark:border-gray-700"
                      style={{ backgroundColor: selectedColorHex }}
                    />
                    <input
                      type="text"
                      value={selectedColorHex.replace('#', '')}
                      onChange={(e) => {
                        const hex = '#' + e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
                        if (/^#[a-fA-F0-9]{6}$/.test(hex)) {
                          const matched = colorOptions.find((c) => c.hex === hex)
                          if (matched) {
                            setColor(matched.value)
                          } else {
                            setColor('bg-[' + hex.replace('#', '') + ']')
                          }
                        }
                      }}
                      maxLength={6}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm uppercase text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">widgets</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Icon
              </h3>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((ico) => (
                <button
                  key={ico}
                  onClick={() => setIcon(ico)}
                  className={`flex h-12 w-full items-center justify-center rounded-xl transition-all duration-200 ${
                    icon === ico
                      ? 'shadow-md shadow-indigo-500/20'
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                  style={icon === ico ? { backgroundColor: selectedColorHex } : undefined}
                  title={ico}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      icon === ico ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {ico}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">palette</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Color Palette
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col.value}
                  onClick={() => {
                    setColor(col.value)
                    setCustomHex(col.hex)
                  }}
                  className={`h-10 w-full rounded-lg transition-all duration-200 ${
                    color === col.value
                      ? 'scale-105 shadow-md ring-2 ring-gray-400 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
            {/* Simple Color Picker */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={selectedColorHex}
                  onChange={(e) => {
                    const hex = e.target.value
                    const matched = colorOptions.find((c) => c.hex === hex.toUpperCase())
                    if (matched) {
                      setColor(matched.value)
                      setCustomHex(matched.hex)
                    } else {
                      setColor('bg-[' + hex.replace('#', '') + ']')
                      setCustomHex(hex)
                    }
                  }}
                  className="absolute inset-0 h-12 w-12 cursor-pointer opacity-0"
                />
                <div
                  className="h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-md cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: selectedColorHex }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Custom Color
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                  <span className="text-sm font-bold text-gray-500">#</span>
                  <input
                    type="text"
                    value={selectedColorHex.replace('#', '')}
                    onChange={(e) => {
                      const hex = '#' + e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
                      if (/^#[a-fA-F0-9]{6}$/.test(hex)) {
                        const matched = colorOptions.find((c) => c.hex === hex.toUpperCase())
                        if (matched) {
                          setColor(matched.value)
                        } else {
                          setColor('bg-[' + hex.replace('#', '') + ']')
                        }
                      }
                    }}
                    maxLength={6}
                    className="flex-1 bg-transparent font-mono text-sm font-semibold uppercase text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
                    placeholder="3B82F6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Task Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">task_alt</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Task Details
              </h3>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPriority(opt.value as TaskPriority)}
                        className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ${
                          priority === opt.value
                            ? 'bg-white shadow-sm dark:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time (min)
                  </label>
                  <input
                    type="number"
                    value={timeEstimate || ''}
                    onChange={(e) =>
                      setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="60"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">tag</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Tags
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={addTag}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="material-symbols-outlined text-gray-400">check_box</span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Subtasks
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                placeholder="Add subtask..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={addSubtask}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Add
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
                  >
                    <div className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">
                      {subtask.text}
                    </span>
                    <button
                      onClick={() => removeSubtask(index)}
                      className="p-1 text-gray-400 transition-colors hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose()
                resetForm()
              }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
