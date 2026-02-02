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
      title={editingTemplate ? 'Edit Template' : 'Create Template'}
      maxWidth="max-w-7xl"
    >
      <div className="flex h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        
        {/* Left Panel - Live Preview */}
        <div className="w-2/5 border-r border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <span className="material-symbols-outlined text-white text-xl">visibility</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">See your template in real-time</p>
            </div>
          </div>

          {/* Preview Card */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-6 space-y-6">
              
              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={`h-16 w-16 rounded-2xl ${color} flex items-center justify-center shadow-lg transition-all duration-300`}>
                  <span className="material-symbols-outlined text-white text-3xl">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {name || 'Template Name'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category}</p>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
              )}

              {/* Task Preview */}
              {title && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">task</span>
                    Task Details
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
                    {taskDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{taskDescription}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                {priority && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                    <span className="material-symbols-outlined text-sm text-orange-600 dark:text-orange-400">flag</span>
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300 capitalize">{priority}</span>
                  </div>
                )}
                {timeEstimate && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">schedule</span>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{timeEstimate}m</span>
                  </div>
                )}
                {status && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400">circle</span>
                    <span className="text-xs font-medium text-green-700 dark:text-green-300 capitalize">{status}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span key={index} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks Preview */}
              {subtasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtasks ({subtasks.length})</p>
                  <div className="space-y-1.5">
                    {subtasks.slice(0, 3).map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">{subtask.text}</span>
                      </div>
                    ))}
                    {subtasks.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">+{subtasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-xl">lightbulb</span>
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Pro Tip</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                  Create detailed templates to save time on recurring tasks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
          {/* Form Header with Progress */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Your Template' : 'Create New Template'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Fill in the details below • Changes update in real-time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${name && title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {name && title ? 'Ready' : 'In Progress'}
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                style={{ 
                  width: `${((name ? 25 : 0) + (description ? 15 : 0) + (icon !== 'task' ? 10 : 0) + (title ? 25 : 0) + (tags.length > 0 ? 15 : 0) + (subtasks.length > 0 ? 10 : 0))}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
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


          {/* Floating Action Bar */}
          <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <button
                onClick={resetForm}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined text-xl">close</span>
                <span>Cancel</span>
              </button>
              
              <div className="flex items-center gap-3">
                {/* Validation Status */}
                {name.trim() && title.trim() ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span className="text-sm font-medium">Ready to save</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="material-symbols-outlined text-xl">error</span>
                    <span className="text-sm font-medium">Fill required fields</span>
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !title.trim()}
                  className="group relative flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {editingTemplate ? 'save' : 'add'}
                  </span>
                  <span>{editingTemplate ? 'Save Changes' : 'Create Template'}</span>
                  {!(!name.trim() || !title.trim()) && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
