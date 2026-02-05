import { useState, useEffect, useRef } from 'react'
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
  const [isHoveringSave, setIsHoveringSave] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)

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
      tagInputRef.current?.focus()
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        { id: `st_${Date.now()}`, text: subtaskInput.trim(), completed: false },
      ])
      setSubtaskInput('')
      subtaskInputRef.current?.focus()
    }
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)))
  }

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id))
  }

  const getPriorityConfig = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return {
          color: 'bg-gradient-to-br from-rose-500 to-red-600',
          icon: 'priority_high',
          textColor: 'text-rose-500',
          bgLight: 'bg-rose-50 dark:bg-rose-500/10',
          border: 'border-rose-200 dark:border-rose-500/30',
          shadow: 'shadow-rose-500/20',
        }
      case 'medium':
        return {
          color: 'bg-gradient-to-br from-amber-500 to-orange-500',
          icon: 'error',
          textColor: 'text-amber-500',
          bgLight: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/30',
          shadow: 'shadow-amber-500/20',
        }
      case 'low':
        return {
          color: 'bg-gradient-to-br from-emerald-500 to-green-600',
          icon: 'low_priority',
          textColor: 'text-emerald-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          shadow: 'shadow-emerald-500/20',
        }
      default:
        return {
          color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          icon: 'flag',
          textColor: 'text-blue-500',
          bgLight: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/30',
          shadow: 'shadow-blue-500/20',
        }
    }
  }

  const getStatusConfig = (s: TaskStatus) => {
    switch (s) {
      case 'todo':
        return {
          color: 'bg-gradient-to-br from-gray-400 to-gray-600',
          icon: 'radio_button_unchecked',
          bgLight: 'bg-gray-50 dark:bg-gray-500/10',
          border: 'border-gray-200 dark:border-gray-500/30',
        }
      case 'in_progress':
        return {
          color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          icon: 'pending',
          bgLight: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/30',
        }
      case 'completed':
        return {
          color: 'bg-gradient-to-br from-emerald-500 to-green-500',
          icon: 'check_circle',
          bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
        }
      default:
        return {
          color: 'bg-gradient-to-br from-gray-400 to-gray-600',
          icon: 'circle',
          bgLight: 'bg-gray-50 dark:bg-gray-500/10',
          border: 'border-gray-200 dark:border-gray-500/30',
        }
    }
  }

  const getRecurringConfig = (r: string | null) => {
    switch (r) {
      case 'daily':
        return {
          icon: 'today',
          color: 'from-violet-500 to-purple-600',
          bg: 'bg-violet-50 dark:bg-violet-500/10',
        }
      case 'weekly':
        return {
          icon: 'date_range',
          color: 'from-blue-500 to-cyan-600',
          bg: 'bg-blue-50 dark:bg-blue-500/10',
        }
      case 'monthly':
        return {
          icon: 'calendar_month',
          color: 'from-amber-500 to-orange-500',
          bg: 'bg-amber-50 dark:bg-amber-500/10',
        }
      default:
        return {
          icon: 'block',
          color: 'from-gray-400 to-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-500/10',
        }
    }
  }

  const completedSubtasks = subtasks.filter((st) => st.completed).length
  const progressPercent = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="max-w-4xl"
      className="!border-0 !bg-transparent !shadow-none"
    >
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute -inset-6 overflow-hidden">
          <div
            className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-[100px]"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute bottom-0 right-1/4 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-rose-500/10 blur-[80px]"
            style={{ animationDuration: '10s', animationDelay: '1s' }}
          />
          <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 blur-[120px]" />
        </div>

        {/* Main Container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/30 bg-white/70 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/10 dark:bg-gray-900/70">
          {/* Header */}
          <div className="relative bg-gradient-to-b from-white/50 to-transparent px-8 py-6 dark:from-white/5 dark:to-transparent">
            {/* Decorative gradient line */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="flex items-center justify-between gap-6 pr-12">
              {/* Title Section */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-2xl ${getPriorityConfig(priority).color} flex items-center justify-center shadow-xl shadow-black/10 ring-2 ring-white/20`}
                >
                  <span className="material-symbols-outlined text-2xl text-white">task_alt</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {task ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    {task ? 'Update your task details' : 'Fill in the details below'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Help Button */}
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-black/5 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-lg text-gray-500 dark:text-gray-400">
                    help_outline
                  </span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-black/5 transition-all duration-200 hover:scale-105 hover:bg-red-50 active:scale-95 dark:bg-white/5 dark:hover:bg-red-500/10"
                >
                  <span className="material-symbols-outlined text-lg text-gray-400 transition-colors group-hover:text-red-500">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-8 pb-2">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200/50 bg-gray-100/50 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {[
                { id: 'details', label: 'Details', icon: 'info', badge: null },
                { id: 'schedule', label: 'Schedule', icon: 'event', badge: null },
                { id: 'subtasks', label: 'Subtasks', icon: 'checklist', badge: subtasks.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:bg-white/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'text-indigo-500' : ''}`}
                  >
                    {tab.icon}
                  </span>
                  <span className="text-sm font-semibold">{tab.label}</span>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span
                      className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        activeTab === tab.id
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-gray-300 text-white dark:bg-gray-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="custom-scrollbar h-[520px] overflow-y-auto">
            <div className="px-8 py-6">
              <div className="space-y-6">
                {/* Title Input - Floating Style */}
                <div className="group relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 text-2xl font-semibold text-gray-900 transition-all placeholder:text-gray-300 placeholder:transition-colors focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
                    autoFocus
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ${title.trim() ? 'w-full' : 'w-0'}`}
                  />
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="animate-fadeIn space-y-6">
                    {/* Description */}
                    <div className="group relative">
                      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                      <div className="relative">
                        <label className="mb-2 ml-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add a detailed description..."
                          rows={4}
                          className="w-full resize-none rounded-2xl border border-gray-200/50 bg-gray-50/50 px-5 py-4 text-sm leading-relaxed text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700/50 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Priority & Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Priority Selector */}
                      <div className="rounded-2xl border border-gray-200/50 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-4 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          Priority
                        </label>
                        <div className="space-y-2">
                          {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => {
                            const config = getPriorityConfig(p)
                            const isSelected = priority === p
                            return (
                              <button
                                key={p}
                                onClick={() => setPriority(p)}
                                className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 ${
                                  isSelected
                                    ? `${config.bgLight} scale-[1.02] ring-2 ring-indigo-500/50`
                                    : 'hover:scale-[1.01] hover:bg-white dark:hover:bg-white/5'
                                }`}
                              >
                                {isSelected && (
                                  <div
                                    className={`absolute inset-0 rounded-xl ${config.color.replace('bg-gradient-to-br', 'bg-gradient-to-r')} opacity-10 blur-sm`}
                                  />
                                )}
                                <div
                                  className={`h-9 w-9 rounded-xl ${config.color} flex flex-shrink-0 items-center justify-center shadow-lg shadow-black/10`}
                                >
                                  <span className="material-symbols-outlined text-[20px] text-white">
                                    {config.icon}
                                  </span>
                                </div>
                                <span
                                  className={`flex-1 text-left font-semibold capitalize ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                  {p}
                                </span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[20px] text-indigo-500">
                                    check_circle
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="rounded-2xl border border-gray-200/50 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-4 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          Status
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'todo' as TaskStatus, label: 'To Do' },
                            { value: 'in_progress' as TaskStatus, label: 'In Progress' },
                            { value: 'completed' as TaskStatus, label: 'Completed' },
                          ].map((s) => {
                            const config = getStatusConfig(s.value)
                            const isSelected = status === s.value
                            return (
                              <button
                                key={s.value}
                                onClick={() => setStatus(s.value)}
                                className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 ${
                                  isSelected
                                    ? `${config.bgLight} scale-[1.02] ring-2 ring-indigo-500/50`
                                    : 'hover:scale-[1.01] hover:bg-white dark:hover:bg-white/5'
                                }`}
                              >
                                {isSelected && (
                                  <div
                                    className={`absolute inset-0 rounded-xl ${config.color.replace('bg-gradient-to-br', 'bg-gradient-to-r')} opacity-10 blur-sm`}
                                  />
                                )}
                                <div
                                  className={`h-9 w-9 rounded-xl ${config.color} flex flex-shrink-0 items-center justify-center shadow-lg shadow-black/10`}
                                >
                                  <span className="material-symbols-outlined text-[20px] text-white">
                                    {config.icon}
                                  </span>
                                </div>
                                <span
                                  className={`flex-1 text-left font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                  {s.label}
                                </span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[20px] text-indigo-500">
                                    check_circle
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-200/50 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Category
                        </label>
                        <div className="group relative">
                          <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Work, Personal"
                            className="w-full rounded-xl border border-gray-200/50 bg-white/50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700/50 dark:bg-black/20 dark:text-white"
                          />
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined text-[18px] text-gray-400">
                              category
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200/50 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="h-2 w-2 rounded-full bg-cyan-500" />
                          Tags
                        </label>
                        <div className="flex gap-2">
                          <div className="group relative flex-1">
                            <input
                              ref={tagInputRef}
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === 'Enter' && (e.preventDefault(), addTag())
                              }
                              placeholder="Add tag..."
                              className="w-full rounded-xl border border-gray-200/50 bg-white/50 px-4 py-3 pr-10 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700/50 dark:bg-black/20 dark:text-white"
                            />
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                              tag
                            </span>
                          </div>
                          <button
                            onClick={addTag}
                            className="flex h-auto items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="animate-fadeIn flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:shadow-md dark:border-indigo-500/30 dark:text-indigo-400"
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 rounded-full p-0.5 opacity-60 transition-colors hover:bg-indigo-100 group-hover:opacity-100 dark:hover:bg-indigo-500/20"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="animate-fadeIn space-y-6">
                    {/* Due Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/80 p-5 dark:border-violet-500/20 dark:from-violet-500/5 dark:to-purple-500/5">
                        <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          Due Date
                        </label>
                        <div className="group relative">
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-violet-200/50 bg-white/50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-violet-500/30 dark:bg-black/20 dark:text-white"
                          />
                          {dueDate && (
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="material-symbols-outlined text-[18px] text-green-500">
                                check_circle
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-cyan-200/50 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 p-5 dark:border-cyan-500/20 dark:from-cyan-500/5 dark:to-blue-500/5">
                        <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          Due Time
                        </label>
                        <div className="group relative">
                          <input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-cyan-200/50 bg-white/50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-500/30 dark:bg-black/20 dark:text-white"
                          />
                          {dueTime && (
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="material-symbols-outlined text-[18px] text-green-500">
                                check_circle
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time Estimate */}
                    <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-5 dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5">
                      <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        Time Estimate
                      </label>
                      <div className="group relative">
                        <input
                          type="number"
                          value={timeEstimate || ''}
                          onChange={(e) =>
                            setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          placeholder="Enter minutes"
                          min="0"
                          className="w-full rounded-xl border border-amber-200/50 bg-white/50 px-4 py-3 pr-16 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-500/30 dark:bg-black/20 dark:text-white"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-amber-50 px-2 py-1 text-sm font-medium text-amber-500 dark:bg-amber-500/10">
                          min
                        </span>
                      </div>
                      {timeEstimate && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                          <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                          Estimated: {Math.floor(timeEstimate / 60)}h {timeEstimate % 60}m
                        </div>
                      )}
                    </div>

                    {/* Recurring */}
                    <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-5 dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-teal-500/5">
                      <label className="mb-4 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">repeat</span>
                        Recurring
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { value: null, label: 'None', icon: 'block' },
                          { value: 'daily', label: 'Daily', icon: 'today' },
                          { value: 'weekly', label: 'Weekly', icon: 'date_range' },
                          { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
                        ].map((r) => {
                          const config = getRecurringConfig(r.value)
                          const isSelected = recurring === r.value
                          return (
                            <button
                              key={r.label}
                              onClick={() => setRecurring(r.value as any)}
                              className={`relative flex flex-col items-center gap-2 rounded-xl px-3 py-4 transition-all duration-300 ${
                                isSelected
                                  ? `${config.bg} scale-[1.02] ring-2 ring-emerald-500/50`
                                  : 'hover:scale-[1.01] hover:bg-white dark:hover:bg-white/5'
                              }`}
                            >
                              {isSelected && (
                                <div
                                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.color} opacity-10 blur-sm`}
                                />
                              )}
                              <div
                                className={`h-12 w-12 rounded-xl ${
                                  isSelected
                                    ? `bg-gradient-to-br ${config.color} shadow-lg shadow-black/10`
                                    : 'bg-gray-100 dark:bg-white/10'
                                } flex items-center justify-center transition-all`}
                              >
                                <span
                                  className={`material-symbols-outlined text-[24px] ${isSelected ? 'text-white' : 'text-gray-400'}`}
                                >
                                  {r.icon}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                              >
                                {r.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtasks Tab */}
                {activeTab === 'subtasks' && (
                  <div className="animate-fadeIn space-y-6">
                    {/* Progress Bar */}
                    {subtasks.length > 0 && (
                      <div className="rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-4 dark:border-indigo-500/20">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Progress
                          </span>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {completedSubtasks}/{subtasks.length}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200/50 dark:bg-gray-700/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Add Subtask */}
                    <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-5 dark:border-blue-500/20 dark:from-blue-500/5 dark:to-indigo-500/5">
                      <label className="mb-3 block flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined text-[14px]">add_task</span>
                        Add Subtask
                      </label>
                      <div className="flex gap-3">
                        <input
                          ref={subtaskInputRef}
                          type="text"
                          value={subtaskInput}
                          onChange={(e) => setSubtaskInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), addSubtask())
                          }
                          placeholder="What needs to be done first?"
                          className="flex-1 rounded-xl border border-blue-200/50 bg-white/50 px-4 py-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/30 dark:bg-black/20 dark:text-white"
                        />
                        <button
                          onClick={addSubtask}
                          disabled={!subtaskInput.trim()}
                          className="flex h-auto items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-6 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          <span className="material-symbols-outlined text-[20px]">add</span>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Subtasks List */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-[14px]">checklist</span>
                          Subtasks
                        </label>
                        {subtasks.length > 0 && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400 dark:bg-white/5">
                            {completedSubtasks} of {subtasks.length} completed
                          </span>
                        )}
                      </div>
                      <div className="custom-scrollbar max-h-[350px] space-y-3 overflow-y-auto pr-2">
                        {subtasks.length > 0 ? (
                          subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 ${
                                subtask.completed
                                  ? 'border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:border-green-500/30 dark:from-green-500/5 dark:to-emerald-500/5'
                                  : 'border-gray-200/50 bg-white/50 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/30'
                              }`}
                            >
                              <button
                                onClick={() => toggleSubtask(subtask.id)}
                                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                                  subtask.completed
                                    ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/20'
                                    : 'border-gray-300 hover:border-indigo-500 dark:border-gray-600'
                                }`}
                              >
                                {subtask.completed && (
                                  <span className="material-symbols-outlined text-[14px] font-bold text-white">
                                    check
                                  </span>
                                )}
                              </button>
                              <span
                                className={`flex-1 text-sm transition-all ${
                                  subtask.completed
                                    ? 'text-gray-400 line-through dark:text-gray-500'
                                    : 'text-gray-700 dark:text-gray-200'
                                }`}
                              >
                                {subtask.text}
                              </span>
                              <button
                                onClick={() => removeSubtask(subtask.id)}
                                className="rounded-lg p-2 opacity-0 transition-all hover:scale-110 hover:bg-red-50 active:scale-95 group-hover:opacity-100 dark:hover:bg-red-500/10"
                              >
                                <span className="material-symbols-outlined text-[18px] text-red-500">
                                  delete
                                </span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-gray-200/50 bg-gray-50/30 px-4 py-16 text-center dark:border-gray-700/50 dark:bg-white/5">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">
                                checklist
                              </span>
                            </div>
                            <p className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
                              No subtasks yet
                            </p>
                            <p className="mx-auto max-w-xs text-sm text-gray-500 dark:text-gray-400">
                              Break down your task into smaller, manageable steps
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
          <div className="border-t border-gray-200/50 bg-gray-50/30 px-8 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <button
                onClick={resetForm}
                className="group flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-180">
                  restart_alt
                </span>
                Reset
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  onMouseEnter={() => setIsHoveringSave(true)}
                  onMouseLeave={() => setIsHoveringSave(false)}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-opacity duration-300 ${isHoveringSave ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                      save
                    </span>
                    {task ? 'Save Changes' : 'Create Task'}
                  </span>
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
