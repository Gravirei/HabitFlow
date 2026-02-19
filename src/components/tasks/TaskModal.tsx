import { useState, useEffect, useRef } from 'react'
import type { Task, TaskPriority, TaskStatus, Subtask } from '@/types/task'
import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
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
  FloatingFocusManager
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

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ])
  
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
      notes: task?.notes // Preserve notes if any, or add field if needed
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
      case 'high': return { label: 'High Priority', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' }
      case 'medium': return { label: 'Medium Priority', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' }
      case 'low': return { label: 'Low Priority', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/20' }
    }
  }

  const getStatusConfig = (s: TaskStatus) => {
    switch (s) {
      case 'todo': return { label: 'To Do', icon: 'radio_button_unchecked', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' }
      case 'in_progress': return { label: 'In Progress', icon: 'pending', color: 'text-blue-500', bg: 'bg-blue-500/10 dark:bg-blue-900/20' }
      case 'completed': return { label: 'Completed', icon: 'check_circle', color: 'text-green-500', bg: 'bg-green-500/10 dark:bg-green-900/20' }
    }
  }

  // --- Render ---

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      maxWidth="max-w-3xl"
      className="!bg-white/80 dark:!bg-gray-900/80 !backdrop-blur-xl !border !border-white/20 dark:!border-white/10 !shadow-2xl overflow-hidden font-sans"
    >
      <div className="flex flex-col h-[70vh] max-h-[800px]">
        
        {/* Header Section */}
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-3xl font-bold bg-transparent border-none p-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white focus:ring-0 focus:outline-none"
              />
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Quick Actions / Metadata */}
          <div className="flex flex-wrap items-center gap-3">
             {/* Priority Selector */}
             <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${getPriorityConfig(priority).bg} ${getPriorityConfig(priority).color} ${getPriorityConfig(priority).border} border`}>
                  <span className="material-symbols-outlined text-[18px] filled">flag</span>
                  <span className="capitalize">{priority}</span>
                </button>
                {/* Dropdown would go here - simplified for this implementation to cycle */}
                 <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-1 flex flex-col">
                  {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setPriority(p)}
                      className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 capitalize ${priority === p ? 'text-teal-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {p}
                    </button>
                  ))}
                 </div>
             </div>

             {/* Status Selector */}
             <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${getStatusConfig(status).bg} ${getStatusConfig(status).color} border border-transparent`}>
                  <span className="material-symbols-outlined text-[18px]">{getStatusConfig(status).icon}</span>
                  <span>{getStatusConfig(status).label}</span>
                </button>
                 <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-1 flex flex-col">
                  {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map(s => (
                    <button 
                      key={s} 
                      onClick={() => setStatus(s)}
                      className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${status === s ? 'text-teal-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {getStatusConfig(s).label}
                    </button>
                  ))}
                 </div>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-8 border-b border-gray-100 dark:border-white/5">
          {[
            { id: 'details', label: 'Details' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'subtasks', label: `Subtasks ${subtasks.length > 0 ? `(${subtasks.filter(t => t.completed).length}/${subtasks.length})` : ''}` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as 'details' | 'schedule' | 'subtasks')}
              className={`pb-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full layout-id-underline" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {activeTab === 'details' && (
              <motion.div
                key="details"
                custom={direction}
                initial={{ x: direction === 'right' ? -300 : 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === 'right' ? 300 : -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 px-8 py-6 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details about this task..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-2xl p-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                   <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">folder</span>
                      
                      <button
                        ref={refs.setReference}
                        {...getReferenceProps()}
                        className={`w-full text-left bg-gray-50 dark:bg-black/20 border-0 rounded-xl py-3 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-teal-500/20 flex items-center justify-between group ${category ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                      >
                        <span>{category || 'Select category'}</span>
                        <span className={`material-symbols-outlined text-[20px] text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>

                      {isCategoryOpen && (
                        <FloatingPortal>
                          <FloatingFocusManager context={context} modal={false}>
                            <div
                              ref={refs.setFloating}
                              style={floatingStyles}
                              {...getFloatingProps()}
                              className="z-50 min-w-[200px] p-1 bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none"
                            >
                               {['Work', 'Personal', 'Learning', 'Creative', 'Health'].map((cat) => (
                                 <button
                                   key={cat}
                                   onClick={() => {
                                     setCategory(cat)
                                     setIsCategoryOpen(false)
                                   }}
                                   className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                     category === cat 
                                       ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300' 
                                       : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                   }`}
                                 >
                                   {category === cat && (
                                     <span className="material-symbols-outlined text-[16px] text-teal-500">check</span>
                                   )}
                                   <span className={category === cat ? 'font-medium ml-1' : 'ml-6'}>{cat}</span>
                                 </button>
                               ))}
                            </div>
                          </FloatingFocusManager>
                        </FloatingPortal>
                      )}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
                   <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">tag</span>
                      <input 
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag and press Enter"
                        className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20"
                      />
                   </div>
                   {tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-2">
                       {tags.map(tag => (
                         <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 text-xs font-medium">
                           #{tag}
                           <button onClick={() => removeTag(tag)} className="hover:text-teal-900 dark:hover:text-white">
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
                className="absolute inset-0 px-8 py-6 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</label>
                    <div className="relative">
                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">calendar_today</span>
                       <input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</label>
                    <div className="relative">
                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">schedule</span>
                       <input 
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20"
                       />
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recurring</label>
                  <div className="grid grid-cols-4 gap-3">
                     {[
                       { value: null, label: 'Never', icon: 'block' },
                       { value: 'daily', label: 'Daily', icon: 'repeat' },
                       { value: 'weekly', label: 'Weekly', icon: 'event_repeat' },
                       { value: 'monthly', label: 'Monthly', icon: 'calendar_month' }
                     ].map((opt) => (
                       <button
                         key={String(opt.value)}
                         onClick={() => setRecurring(opt.value as 'daily' | 'weekly' | 'monthly' | null)}
                         className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                           recurring === opt.value
                             ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-300'
                             : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-white/20'
                         }`}
                       >
                         <span className="material-symbols-outlined">{opt.icon}</span>
                         <span className="text-xs font-medium">{opt.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. Duration (mins)</label>
                  <div className="relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">timer</span>
                     <input 
                      type="number"
                      min="0"
                      value={timeEstimate || ''}
                      onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g. 30"
                      className="w-full bg-gray-50 dark:bg-black/20 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500/20"
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
                className="absolute inset-0 px-8 py-6 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-6">
               {/* Progress */}
               {subtasks.length > 0 && (
                 <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-teal-500 rounded-full transition-all duration-500"
                         style={{ width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` }}
                       />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)}%
                    </span>
                 </div>
               )}

               <div className="space-y-3">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl group hover:border-teal-200 dark:hover:border-teal-500/30 transition-colors">
                       <button 
                         onClick={() => toggleSubtask(st.id)}
                         className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                           st.completed 
                             ? 'bg-teal-500 border-teal-500 text-white' 
                             : 'border-gray-300 dark:border-gray-500 hover:border-teal-500'
                         }`}
                       >
                         {st.completed && <span className="material-symbols-outlined text-[16px]">check</span>}
                       </button>
                       <input 
                         type="text"
                         value={st.text}
                         readOnly
                         className={`flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm ${
                           st.completed 
                             ? 'text-gray-400 line-through' 
                             : 'text-gray-700 dark:text-gray-200'
                         }`}
                       />
                       <button onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                  ))}

                  {/* Add New Input */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 border border-transparent rounded-xl focus-within:bg-white focus-within:dark:bg-black/40 focus-within:border-teal-500/50 transition-all">
                     <span className="material-symbols-outlined text-gray-400">add</span>
                     <input
                       ref={subtaskInputRef}
                       type="text"
                       value={subtaskInput}
                       onChange={(e) => setSubtaskInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                       placeholder="Add a subtask..."
                       className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-500"
                     />
                     <button 
                       onClick={addSubtask}
                       disabled={!subtaskInput.trim()}
                       className="text-xs font-semibold uppercase tracking-wider text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-teal-700"
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
        <div className="flex-shrink-0 p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-8 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
          >
            Save Task
          </button>
        </div>

      </div>
    </AccessibleModal>
  )
}
