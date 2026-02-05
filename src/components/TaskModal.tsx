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
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'subtasks'>('details')

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
    setActiveTab('details')
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

  const getPriorityConfig = (p: TaskPriority) => {
    switch(p) {
      case 'high': return { color: 'from-rose-500 to-red-600', icon: 'priority_high', textColor: 'text-rose-500' }
      case 'medium': return { color: 'from-amber-500 to-orange-600', icon: 'error', textColor: 'text-amber-500' }
      case 'low': return { color: 'from-emerald-500 to-green-600', icon: 'low_priority', textColor: 'text-emerald-500' }
      default: return { color: 'from-blue-500 to-indigo-600', icon: 'flag', textColor: 'text-blue-500' }
    }
  }

  const getStatusConfig = (s: TaskStatus) => {
    switch(s) {
      case 'todo': return { color: 'from-gray-500 to-gray-700', icon: 'radio_button_unchecked' }
      case 'in_progress': return { color: 'from-blue-500 to-indigo-600', icon: 'pending' }
      case 'completed': return { color: 'from-emerald-500 to-green-600', icon: 'check_circle' }
      default: return { color: 'from-gray-500 to-gray-700', icon: 'circle' }
    }
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="max-w-4xl"
      className="!bg-transparent !shadow-none !border-0"
    >
      <div className="relative">
        {/* Ambient Background Glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-30 dark:opacity-20" />
        
        {/* Main Container */}
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
          
          {/* Header - Unified Single Row Design */}
          <div className="relative px-8 py-5">
            {/* Title and Tabs - Single Row */}
            <div className="flex items-center justify-between gap-6 pr-10">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getPriorityConfig(priority).color} flex items-center justify-center shadow-lg`}>
                  <span className="material-symbols-outlined text-white text-xl">task_alt</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {task ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {task ? 'Update details' : 'Fill in the details'}
                  </p>
                </div>
              </div>

              {/* Tabs - Right Side */}
              <div className="inline-flex gap-1 p-1 rounded-full bg-gray-800/50 backdrop-blur-xl border border-white/5">
                {[
                  { id: 'details', label: 'Details', icon: 'info' },
                  { id: 'schedule', label: 'Schedule', icon: 'event' },
                  { id: 'subtasks', label: 'Subtasks', icon: 'checklist', badge: subtasks.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="font-medium text-sm">{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                        activeTab === tab.id
                          ? 'bg-indigo-500 text-white'
                          : 'bg-indigo-500/80 text-white'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Close Button - End of Row */}
              <button
                onClick={onClose}
                className="group h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Content - Tabbed Layout */}
          <div className="h-[500px] overflow-y-auto">
            <div className="px-8 py-6">
              <div className="space-y-6">
                {/* Title Input - Always Visible */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full text-2xl font-semibold bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 px-0 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a detailed description..."
                        rows={4}
                        className="w-full resize-none rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>

                    {/* Priority & Status - Visual Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                          Priority
                        </label>
                        <div className="space-y-2">
                          {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => {
                            const config = getPriorityConfig(p)
                            return (
                              <button
                                key={p}
                                onClick={() => setPriority(p)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                  priority === p
                                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg shadow-${p === 'high' ? 'rose' : p === 'medium' ? 'amber' : 'emerald'}-500/30 scale-[1.02]`
                                    : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-[1.01]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">{config.icon}</span>
                                <span className="font-medium capitalize">{p}</span>
                                {priority === p && (
                                  <span className="ml-auto material-symbols-outlined text-lg">check</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                          Status
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'todo' as TaskStatus, label: 'To Do' },
                            { value: 'in_progress' as TaskStatus, label: 'In Progress' },
                            { value: 'completed' as TaskStatus, label: 'Completed' },
                          ].map((s) => {
                            const config = getStatusConfig(s.value)
                            return (
                              <button
                                key={s.value}
                                onClick={() => setStatus(s.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                  status === s.value
                                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-[1.02]`
                                    : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-[1.01]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">{config.icon}</span>
                                <span className="font-medium">{s.label}</span>
                                {status === s.value && (
                                  <span className="ml-auto material-symbols-outlined text-lg">check</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g., Work, Personal"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Add Tags
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            placeholder="Add tag..."
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          />
                          <button
                            onClick={addTag}
                            className="px-3 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-200 dark:border-indigo-500/30"
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    {/* Due Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Due Time
                        </label>
                        <input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Time Estimate */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Time Estimate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={timeEstimate || ''}
                          onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Minutes"
                          min="0"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-2.5 pr-16 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">min</span>
                      </div>
                    </div>

                    {/* Recurring */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Recurring
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { value: null, label: 'None', icon: 'block' },
                          { value: 'daily', label: 'Daily', icon: 'today' },
                          { value: 'weekly', label: 'Weekly', icon: 'date_range' },
                          { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
                        ].map((r) => (
                          <button
                            key={r.label}
                            onClick={() => setRecurring(r.value as any)}
                            className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all duration-200 ${
                              recurring === r.value
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-2xl">{r.icon}</span>
                            <span className="text-xs font-medium">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtasks Tab */}
                {activeTab === 'subtasks' && (
                  <div className="space-y-6">
                    {/* Add Subtask */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Add Subtask
                      </label>
                  
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={subtaskInput}
                          onChange={(e) => setSubtaskInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                          placeholder="Add a subtask..."
                          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <button
                          onClick={addSubtask}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtasks List */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Subtasks ({subtasks.length})
                        </label>
                        {subtasks.length > 0 && (
                          <span className="text-xs text-gray-400">
                            {subtasks.filter(st => st.completed).length} completed
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {subtasks.length > 0 ? (
                          subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                            >
                              <button
                                onClick={() => toggleSubtask(subtask.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  subtask.completed
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                                }`}
                              >
                                {subtask.completed && (
                                  <span className="material-symbols-outlined text-white text-sm">check</span>
                                )}
                              </button>
                              <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {subtask.text}
                              </span>
                              <button
                                onClick={() => removeSubtask(subtask.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-red-500 text-lg">delete</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-3 block">
                              checklist
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              No subtasks yet
                            </p>
                            <p className="text-xs text-gray-400">
                              Break down your task into smaller steps
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Reset Form
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="group relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">save</span>
                    {task ? 'Save Changes' : 'Create Task'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
