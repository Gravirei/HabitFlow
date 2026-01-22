import { useState, useEffect } from 'react'
import type { Task, TaskPriority, TaskStatus, Subtask } from '@/types/task'
import { AccessibleModal } from './timer/shared/AccessibleModal'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [reminder, setReminder] = useState('')
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [notes, setNotes] = useState('')
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>()
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'subtasks'>('basic')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setStatus(task.status)
      setCategory(task.category)
      setTags(task.tags)
      setDueDate(task.due ? task.due.split('T')[0] : '')
      setDueTime(task.dueTime || '')
      setReminder(task.reminder || '')
      setRecurring(task.recurring || null)
      setSubtasks(task.subtasks)
      setNotes(task.notes || '')
      setTimeEstimate(task.timeEstimate)
    } else {
      resetForm()
    }
  }, [task, isOpen])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('todo')
    setCategory('')
    setTags([])
    setTagInput('')
    setDueDate('')
    setDueTime('')
    setReminder('')
    setRecurring(null)
    setSubtasks([])
    setSubtaskInput('')
    setNotes('')
    setTimeEstimate(undefined)
    setActiveTab('basic')
  }

  const handleSave = () => {
    if (!title.trim()) return

    const taskData: Task = {
      id: task?.id || `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      completed: task?.completed || false,
      status,
      priority,
      category: category.trim() || 'Uncategorized',
      tags,
      due: dueDate ? new Date(dueDate).toISOString() : undefined,
      dueTime: dueTime || undefined,
      reminder: reminder || undefined,
      recurring,
      subtasks,
      notes: notes.trim() || undefined,
      timeEstimate,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(taskData)
    onClose()
    if (!task) resetForm()
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
      setSubtasks([...subtasks, { id: `st_${Date.now()}`, text: subtaskInput.trim(), completed: false }])
      setSubtaskInput('')
    }
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st))
  }

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Tabs */}
        <div className="flex border-b border-white/10 dark:border-white/10 px-6 pt-4">
          {[
            { id: 'basic', label: 'Basic Info', icon: 'info' },
            { id: 'details', label: 'Details', icon: 'calendar_month' },
            { id: 'subtasks', label: 'Subtasks', icon: 'checklist', badge: subtasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="input-modern"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  className="input-modern resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        priority === p
                          ? p === 'high'
                            ? 'bg-gradient-to-r from-error-light to-error-dark text-white shadow-soft'
                            : p === 'medium'
                            ? 'bg-gradient-to-r from-warning-light to-warning-dark text-white shadow-soft'
                            : 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-soft'
                          : 'glass text-gray-700 dark:text-gray-300 hover:bg-white/30 active:scale-95'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value as TaskStatus)}
                      className={`py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        status === s.value
                          ? 'bg-gradient-to-r from-primary to-primary-focus text-white shadow-soft'
                          : 'glass text-gray-700 dark:text-gray-300 hover:bg-white/30 active:scale-95'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Work, Personal, Health"
                  className="input-modern"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 input-modern"
                  />
                  <button
                    onClick={addTag}
                    className="px-6 py-3 bg-gradient-to-br from-primary to-primary-focus text-white rounded-xl font-semibold hover:shadow-medium active:scale-95 transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent-purple/20 text-primary rounded-xl text-sm font-medium border border-primary/30"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-modern"
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="input-modern"
                />
              </div>

              {/* Time Estimate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Time Estimate (minutes)
                </label>
                <input
                  type="number"
                  value={timeEstimate || ''}
                  onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 60"
                  min="0"
                  className="input-modern"
                />
              </div>

              {/* Recurring */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">
                  Recurring
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: null, label: 'None' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setRecurring(r.value as any)}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        recurring === r.value
                          ? 'bg-gradient-to-r from-primary to-primary-focus text-white shadow-soft'
                          : 'glass text-gray-700 dark:text-gray-300 hover:bg-white/30 active:scale-95'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or instructions..."
                  rows={4}
                  className="input-modern resize-none"
                />
              </div>
            </>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <>
              {/* Add Subtask */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Add Subtask
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                    placeholder="What needs to be done?"
                    className="flex-1 input-modern"
                  />
                  <button
                    onClick={addSubtask}
                    className="px-6 py-3 bg-gradient-to-br from-primary to-primary-focus text-white rounded-xl font-semibold hover:shadow-medium active:scale-95 transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Subtasks List */}
              {subtasks.length > 0 ? (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-4 card-modern"
                    >
                      <button
                        onClick={() => toggleSubtask(subtask.id)}
                        className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                          subtask.completed
                            ? 'bg-gradient-to-br from-primary to-primary-focus border-primary shadow-soft'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                        }`}
                      >
                        {subtask.completed && (
                          <span className="material-symbols-outlined text-white text-sm icon-bold">check</span>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-gray-900 dark:text-white font-medium ${
                          subtask.completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => removeSubtask(subtask.id)}
                        className="p-2 hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-error-light dark:text-error-dark text-xl">
                          delete
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">
                    checklist
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No subtasks yet. Add one to break down this task.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-br from-primary to-primary-focus text-white hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
