import { useState, useEffect } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplateManagerModalProps {
  isOpen: boolean
  onClose: () => void
  customTemplates: TaskTemplate[]
  onSaveTemplate: (template: TaskTemplate) => void
  onDeleteTemplate: (templateId: string) => void
  editingTemplate?: TaskTemplate | null
}

export function TemplateManagerModal({
  isOpen,
  onClose,
  customTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  editingTemplate,
}: TemplateManagerModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
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
    'task', 'work', 'home', 'shopping_cart', 'fitness_center', 'school', 
    'code', 'article', 'bug_report', 'groups', 'cleaning_services', 'menu_book',
    'restaurant', 'flight', 'build', 'lightbulb', 'favorite', 'star'
  ]

  const colorOptions = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Teal', value: 'bg-teal-500' },
    { name: 'Cyan', value: 'bg-cyan-500' },
  ]

  useEffect(() => {
    if (editingTemplate) {
      setShowCreateForm(true)
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
    setShowCreateForm(false)
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

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(templateId)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
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
      <div className="flex flex-col h-full max-h-[80vh]">
        {!showCreateForm ? (
          <>
            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Your Custom Templates
                </h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Create Template
                </button>
              </div>

              {customTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No custom templates yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Create templates for tasks you do frequently to save time
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Your First Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center text-white flex-shrink-0`}>
                          <span className="material-symbols-outlined text-2xl">{template.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{template.category}</span>
                        {template.template.subtasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{template.template.subtasks.length} steps</span>
                          </>
                        )}
                        {template.template.timeEstimate && (
                          <>
                            <span>•</span>
                            <span>{template.template.timeEstimate}m</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Edit implementation would go here
                            setShowCreateForm(true)
                            // Load template data into form
                          }}
                          className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Create/Edit Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Template Info */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white">Template Info</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Routine, Client Meeting"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {iconOptions.map((ico) => (
                        <option key={ico} value={ico}>{ico}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((col) => (
                        <button
                          key={col.value}
                          onClick={() => setColor(col.value)}
                          className={`w-full h-10 rounded-lg ${col.value} ${
                            color === col.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white">Task Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Default title for tasks created from this template"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Default description"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Estimate (min)
                    </label>
                    <input
                      type="number"
                      value={timeEstimate || ''}
                      onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="60"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtasks
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                      placeholder="Add subtask..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      onClick={addSubtask}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {subtasks.length > 0 && (
                    <div className="space-y-2">
                      {subtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-lg"
                        >
                          <span className="flex-1 text-sm text-gray-900 dark:text-white">{subtask.text}</span>
                          <button
                            onClick={() => removeSubtask(index)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !title.trim()}
                className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </>
        )}
      </div>
    </AccessibleModal>
  )
}
