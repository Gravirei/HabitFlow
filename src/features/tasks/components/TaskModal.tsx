import { useState, useEffect, useRef } from 'react'
import type { Task, TaskPriority, TaskStatus, Subtask } from '@/types/task'
import { AccessibleModal } from '@/shared/ui/AccessibleModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task | null
  /** Prefill fields for create flow (Phase 5). Only `categoryId` association is supported. */
  prefill?: {
    categoryId?: string
  }
}

export function TaskModal({ isOpen, onClose, onSave, task, prefill }: TaskModalProps) {
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [category, setCategory] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isCategoryOpen,
    onOpenChange: setIsCategoryOpen,
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

  // Date & Time
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(null)
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>()

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')

  // UI State
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'subtasks'>('details')
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const tagInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)

  // Tab order for directional animation
  const tabOrder = ['details', 'schedule', 'subtasks'] as const

  const handleTabChange = (newTab: 'details' | 'schedule' | 'subtasks') => {
    const currentIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(newTab)
    setDirection(newIndex > currentIndex ? 'left' : 'right')
    setActiveTab(newTab)
  }

  // Initialize form when task changes or modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setStatus(task.status)
      setCategory(task.category)
      setCategoryId(task.categoryId)
      setTags(task.tags)
      setDueDate(task.due ? task.due.split('T')[0] : '')
      setDueTime(task.dueTime || '')
      setRecurring(task.recurring || null)
      setSubtasks(task.subtasks)
      setTimeEstimate(task.timeEstimate)
      return
    }

    resetForm()
    setCategoryId(prefill?.categoryId)
  }, [task, isOpen, prefill?.categoryId])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('todo')
    setCategory('')
    setCategoryId(undefined)
    setTags([])
    setTagInput('')
    setDueDate('')
    setDueTime('')
    setRecurring(null)
    setSubtasks([])
    setSubtaskInput('')
    setTimeEstimate(undefined)
    setActiveTab('details')
  }

  const handleSave = () => {
    if (!title.trim()) return

    const taskData: Task = {
      id: task?.id || `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      completed: status === 'completed', // Sync completed status
      status,
      priority,
      category: category.trim() || 'Uncategorized',
      categoryId,
      tags,
      due: dueDate ? new Date(dueDate).toISOString() : undefined,
      dueTime: dueTime || undefined,
      recurring,
      subtasks,
      timeEstimate,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: task?.notes, // Preserve notes if any, or add field if needed
    }

    onSave(taskData)
    onClose()
    if (!task) resetForm()
  }

  // --- Handlers ---

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

  // --- UI Configs ---

  const getPriorityConfig = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return {
          label: 'High Priority',
          color: 'text-rose-500',
          bg: 'bg-rose-500/10',
          border: 'border-rose-200 dark:border-rose-500/20',
        }
      case 'medium':
        return {
          label: 'Medium Priority',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/20',
        }
      case 'low':
        return {
          label: 'Low Priority',
          color: 'text-teal-500',
          bg: 'bg-teal-500/10',
          border: 'border-teal-200 dark:border-teal-500/20',
        }
    }
  }

  const getStatusConfig = (s: TaskStatus) => {
    switch (s) {
      case 'todo':
        return {
          label: 'To Do',
          icon: 'radio_button_unchecked',
          color: 'text-slate-500',
          bg: 'bg-slate-100 dark:bg-slate-800',
        }
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: 'pending',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10 dark:bg-blue-900/20',
        }
      case 'completed':
        return {
          label: 'Completed',
          icon: 'check_circle',
          color: 'text-green-500',
          bg: 'bg-green-500/10 dark:bg-green-900/20',
        }
    }
  }

  // --- Render ---

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="max-w-3xl"
      className="overflow-hidden !border !border-white/20 !bg-white/80 font-sans !shadow-2xl !backdrop-blur-xl dark:!border-white/10 dark:!bg-gray-900/80"
    >
      <div className="flex h-[70vh] max-h-[800px] flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 px-8 pb-4 pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full border-none bg-transparent p-0 text-3xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Quick Actions / Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Selector */}
            <div className="group relative">
              <button
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${getPriorityConfig(priority).bg} ${getPriorityConfig(priority).color} ${getPriorityConfig(priority).border} border`}
              >
                <span className="material-symbols-outlined filled text-[18px]">flag</span>
                <span className="capitalize">{priority}</span>
              </button>
              {/* Dropdown would go here - simplified for this implementation to cycle */}
              <div className="invisible absolute left-0 top-full z-10 mt-2 flex w-32 flex-col rounded-xl border border-gray-100 bg-white p-1 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800">
                {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-lg px-3 py-2 text-left text-sm capitalize hover:bg-gray-50 dark:hover:bg-white/5 ${priority === p ? 'font-medium text-teal-600' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selector */}
            <div className="group relative">
              <button
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${getStatusConfig(status).bg} ${getStatusConfig(status).color} border border-transparent`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {getStatusConfig(status).icon}
                </span>
                <span>{getStatusConfig(status).label}</span>
              </button>
              <div className="invisible absolute left-0 top-full z-10 mt-2 flex w-40 flex-col rounded-xl border border-gray-100 bg-white p-1 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800">
                {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${status === s ? 'font-medium text-teal-600' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {getStatusConfig(s).label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-100 px-8 dark:border-white/5">
          {[
            { id: 'details', label: 'Details' },
            { id: 'schedule', label: 'Schedule' },
            {
              id: 'subtasks',
              label: `Subtasks ${subtasks.length > 0 ? `(${subtasks.filter((t) => t.completed).length}/${subtasks.length})` : ''}`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as 'details' | 'schedule' | 'subtasks')}
              className={`relative pb-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="layout-id-underline absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-teal-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {activeTab === 'details' && (
              <motion.div
                key="details"
                custom={direction}
                initial={{ x: direction === 'right' ? -300 : 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === 'right' ? 300 : -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="custom-scrollbar absolute inset-0 overflow-y-auto px-8 py-6"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add more details about this task..."
                      rows={3}
                      className="w-full resize-none rounded-2xl border-0 bg-gray-50 p-4 text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Category
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                          folder
                        </span>

                        <button
                          ref={refs.setReference}
                          {...getReferenceProps()}
                          className={`group flex w-full items-center justify-between rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-left text-sm transition-all focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 ${category ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                        >
                          <span>{category || 'Select category'}</span>
                          <span
                            className={`material-symbols-outlined text-[20px] text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                          >
                            expand_more
                          </span>
                        </button>

                        {isCategoryOpen && (
                          <FloatingPortal>
                            <FloatingFocusManager context={context} modal={false}>
                              <div
                                ref={refs.setFloating}
                                style={floatingStyles}
                                {...getFloatingProps()}
                                className="animate-in fade-in zoom-in-95 z-50 min-w-[200px] rounded-xl border border-gray-100 bg-white/90 p-1 shadow-2xl backdrop-blur-xl duration-200 focus:outline-none dark:border-white/10 dark:bg-gray-800/95"
                              >
                                {['Work', 'Personal', 'Learning', 'Creative', 'Health'].map(
                                  (cat) => (
                                    <button
                                      key={cat}
                                      onClick={() => {
                                        setCategory(cat)
                                        setIsCategoryOpen(false)
                                      }}
                                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                        category === cat
                                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300'
                                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                                      }`}
                                    >
                                      {category === cat && (
                                        <span className="material-symbols-outlined text-[16px] text-teal-500">
                                          check
                                        </span>
                                      )}
                                      <span
                                        className={category === cat ? 'ml-1 font-medium' : 'ml-6'}
                                      >
                                        {cat}
                                      </span>
                                    </button>
                                  )
                                )}
                              </div>
                            </FloatingFocusManager>
                          </FloatingPortal>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Tags
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                          tag
                        </span>
                        <input
                          ref={tagInputRef}
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add tag and press Enter"
                          className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 dark:text-white"
                        />
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                            >
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-teal-900 dark:hover:text-white"
                              >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                custom={direction}
                initial={{ x: direction === 'right' ? -300 : 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === 'right' ? 300 : -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="custom-scrollbar absolute inset-0 overflow-y-auto px-8 py-6"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Due Date
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                          calendar_today
                        </span>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Time
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                          schedule
                        </span>
                        <input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Recurring
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: null, label: 'Never', icon: 'block' },
                        { value: 'daily', label: 'Daily', icon: 'repeat' },
                        { value: 'weekly', label: 'Weekly', icon: 'event_repeat' },
                        { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() =>
                            setRecurring(opt.value as 'daily' | 'weekly' | 'monthly' | null)
                          }
                          className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                            recurring === opt.value
                              ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300'
                              : 'border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20'
                          }`}
                        >
                          <span className="material-symbols-outlined">{opt.icon}</span>
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Est. Duration (mins)
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">
                        timer
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={timeEstimate || ''}
                        onChange={(e) =>
                          setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        placeholder="e.g. 30"
                        className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 dark:bg-black/20 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subtasks Tab */}
            {activeTab === 'subtasks' && (
              <motion.div
                key="subtasks"
                custom={direction}
                initial={{ x: direction === 'right' ? -300 : 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === 'right' ? 300 : -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="custom-scrollbar absolute inset-0 overflow-y-auto px-8 py-6"
              >
                <div className="space-y-6">
                  {/* Progress */}
                  {subtasks.length > 0 && (
                    <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all duration-500"
                          style={{
                            width: `${(subtasks.filter((s) => s.completed).length / subtasks.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {Math.round(
                          (subtasks.filter((s) => s.completed).length / subtasks.length) * 100
                        )}
                        %
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-teal-200 dark:border-white/5 dark:bg-white/5 dark:hover:border-teal-500/30"
                      >
                        <button
                          onClick={() => toggleSubtask(st.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                            st.completed
                              ? 'border-teal-500 bg-teal-500 text-white'
                              : 'border-gray-300 hover:border-teal-500 dark:border-gray-500'
                          }`}
                        >
                          {st.completed && (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                        </button>
                        <input
                          type="text"
                          value={st.text}
                          readOnly
                          className={`flex-1 border-none bg-transparent p-0 text-sm focus:ring-0 ${
                            st.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-700 dark:text-gray-200'
                          }`}
                        />
                        <button
                          onClick={() => removeSubtask(st.id)}
                          className="p-1 text-gray-400 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}

                    {/* Add New Input */}
                    <div className="flex items-center gap-3 rounded-xl border border-transparent bg-gray-50 p-3 transition-all focus-within:border-teal-500/50 focus-within:bg-white dark:bg-black/20 focus-within:dark:bg-black/40">
                      <span className="material-symbols-outlined text-gray-400">add</span>
                      <input
                        ref={subtaskInputRef}
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                        placeholder="Add a subtask..."
                        className="flex-1 border-none bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-0 dark:text-white"
                      />
                      <button
                        onClick={addSubtask}
                        disabled={!subtaskInput.trim()}
                        className="text-xs font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-gray-50/50 p-6 backdrop-blur-md dark:border-white/5 dark:bg-black/20">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="transform rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-2.5 font-medium text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-teal-500 active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            Save Task
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
