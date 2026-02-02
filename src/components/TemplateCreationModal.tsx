import { useState, useEffect } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplateCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveTemplate: (template: TaskTemplate) => void
  editingTemplate?: TaskTemplate | null
}

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
  const [title, setTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [subtasks, setSubtasks] = useState<Omit<Subtask, 'id'>[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [notes, setNotes] = useState('')
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>()
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(null)

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

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name)
      setDescription(editingTemplate.description || '')
      setIcon(editingTemplate.icon)
      setCategory(editingTemplate.category)
      setColor(editingTemplate.color)
      setTitle(editingTemplate.template.title)
      setTaskDescription(editingTemplate.template.description || '')
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
    setTitle('')
    setTaskDescription('')
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
    if (!name.trim() || !title.trim()) return

    const template: TaskTemplate = {
      id: editingTemplate?.id || `tmpl_custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      category,
      color,
      isCustom: true,
      template: {
        title: title.trim(),
        description: taskDescription.trim() || undefined,
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

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        resetForm()
      }}
      title="Template Manager"
      maxWidth="max-w-4xl"
    >
      <div className="flex h-full max-h-[80vh] flex-col">
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Template Info */}
              <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white">Template Info</h4>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Routine, Client Meeting"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Choose Icon
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {iconOptions.map((ico) => (
                        <button
                          key={ico}
                          onClick={() => setIcon(ico)}
                          className={`group relative h-14 w-full rounded-xl transition-all duration-300 ${
                            icon === ico
                              ? `shadow-lg ring-2 ring-offset-2 ${color} scale-110`
                              : 'bg-white hover:scale-105 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                          }`}
                          title={ico}
                        >
                          <span
                            className={`material-symbols-outlined text-xl transition-colors duration-200 ${
                              icon === ico
                                ? 'text-white'
                                : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                            }`}
                          >
                            {ico}
                          </span>
                          {icon === ico && (
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md">
                              <span className="material-symbols-outlined text-sm text-gray-900">
                                check
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Choose Color
                    </label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-6 gap-2">
                        {colorOptions.map((col) => (
                          <button
                            key={col.value}
                            onClick={() => setColor(col.value)}
                            className={`h-11 w-full rounded-xl transition-all duration-300 ${
                              color === col.value
                                ? 'scale-110 shadow-md ring-2 ring-offset-2'
                                : 'hover:scale-105 hover:shadow-sm'
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {color === col.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                  check
                                </span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="relative">
                          <input
                            type="color"
                            value={colorOptions.find((c) => c.value === color)?.hex || '#3b82f6'}
                            onChange={(e) => {
                              const hex = e.target.value
                              const matchedColor = colorOptions.find((c) => c.hex === hex)
                              if (matchedColor) {
                                setColor(matchedColor.value)
                              } else {
                                setColor('bg-[' + hex.replace('#', '') + ']')
                              }
                            }}
                            className="h-11 w-11 cursor-pointer rounded-xl border-0 opacity-0"
                          />
                          <div
                            className="h-11 w-11 cursor-pointer rounded-xl border-2 border-gray-200 shadow-sm transition-transform hover:scale-105"
                            style={{
                              backgroundColor:
                                colorOptions.find((c) => c.value === color)?.hex || '#3b82f6',
                            }}
                          ></div>
                          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm dark:from-gray-700 dark:to-gray-600">
                            <span className="material-symbols-outlined text-[14px] text-gray-600 dark:text-gray-300">
                              expand_more
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 dark:bg-gray-900/50">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              #
                            </span>
                            <input
                              type="text"
                              value={
                                colorOptions
                                  .find((c) => c.value === color)
                                  ?.hex?.replace('#', '') || '3b82f6'
                              }
                              onChange={(e) => {
                                const hex =
                                  '#' + e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
                                const matchedColor = colorOptions.find((c) => c.hex === hex)
                                if (/^#[a-fA-F0-9]{6}$/.test(hex)) {
                                  if (matchedColor) {
                                    setColor(matchedColor.value)
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
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white">Task Details</h4>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Default title for tasks created from this template"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Default description"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Estimate (min)
                    </label>
                    <input
                      type="number"
                      value={timeEstimate || ''}
                      onChange={(e) =>
                        setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder="60"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addTag}
                      className="rounded-xl bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="rounded-full p-0.5 hover:bg-primary/20"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subtasks
                  </label>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                      placeholder="Add subtask..."
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addSubtask}
                      className="rounded-xl bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  {subtasks.length > 0 && (
                    <div className="space-y-2">
                      {subtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg bg-white p-2 dark:bg-gray-900"
                        >
                          <span className="flex-1 text-sm text-gray-900 dark:text-white">
                            {subtask.text}
                          </span>
                          <button
                            onClick={() => removeSubtask(index)}
                            className="rounded p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <span className="material-symbols-outlined text-sm text-red-600 dark:text-red-400">
                              delete
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="rounded-xl px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !title.trim()}
                className="rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
      </div>
    </AccessibleModal>
  )
}
