import { useState } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import type { TaskTemplate } from '@/types/taskTemplate'
import type { TaskPriority, TaskStatus, Subtask } from '@/types/task'

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: TaskTemplate | null
  onUseAsTemplate: (template: TaskTemplate) => void
  onSaveAsTask: (taskData: any) => void
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onUseAsTemplate,
  onSaveAsTask,
}: TemplatePreviewModalProps) {
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>([])
  const [editedTimeEstimate, setEditedTimeEstimate] = useState<number | undefined>(undefined)

  // Initialize form when template changes
  useState(() => {
    if (template) {
      setEditedTitle(template.template.title || template.name)
      setEditedDescription(template.template.description || '')
      setEditedPriority(template.template.priority || 'medium')
      setEditedCategory(template.template.category || template.category)
      setEditedTags(template.template.tags || [])
      setEditedSubtasks(template.template.subtasks || [])
      setEditedTimeEstimate(template.template.timeEstimate)
    }
  })

  const handleUseAsTemplate = () => {
    if (!template) return
    
    const updatedTemplate: TaskTemplate = {
      ...template,
      template: {
        ...template.template,
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        category: editedCategory,
        tags: editedTags,
        subtasks: editedSubtasks,
        timeEstimate: editedTimeEstimate,
      },
    }
    
    onUseAsTemplate(updatedTemplate)
    onClose()
  }

  const handleSaveAsTask = () => {
    if (!template) return
    
    const taskData = {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      status: 'todo' as TaskStatus,
      category: editedCategory,
      tags: editedTags,
      subtasks: editedSubtasks,
      timeEstimate: editedTimeEstimate,
      dueDate: new Date().toISOString().split('T')[0],
    }
    
    onSaveAsTask(taskData)
    onClose()
  }

  if (!template) return null

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Preview"
      maxWidth="max-w-3xl"
    >
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 dark:from-black dark:via-slate-950 dark:to-black rounded-2xl overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 -left-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-start gap-6 mb-8 pb-6 border-b border-white/10">
            <div className={`w-16 h-16 rounded-2xl ${template.color} flex items-center justify-center shadow-2xl flex-shrink-0`}>
              <span className="material-symbols-outlined text-3xl text-white">{template.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{template.name}</h2>
              <p className="text-sm text-slate-400">{template.description}</p>
              {template.isCustom && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white uppercase tracking-wider">
                  Custom Template
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Task Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-500 focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Description</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-500 focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                placeholder="Add description..."
              />
            </div>

            {/* Priority & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Priority</label>
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                >
                  <option value="low" className="bg-slate-900">Low</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="high" className="bg-slate-900">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                >
                  <option value="Work" className="bg-slate-900">Work</option>
                  <option value="Personal" className="bg-slate-900">Personal</option>
                  <option value="Shopping" className="bg-slate-900">Shopping</option>
                  <option value="Health" className="bg-slate-900">Health</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            {/* Time Estimate */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Time Estimate (minutes)</label>
              <input
                type="number"
                value={editedTimeEstimate || ''}
                onChange={(e) => setEditedTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-500 focus:bg-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="e.g., 30"
              />
            </div>

            {/* Subtasks */}
            {editedSubtasks.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Subtasks</label>
                <div className="space-y-2">
                  {editedSubtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="material-symbols-outlined text-slate-400 text-sm">check_circle</span>
                      <span className="text-sm text-white flex-1">{subtask.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUseAsTemplate}
              className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Use as Template
            </button>
            <button
              onClick={handleSaveAsTask}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_task</span>
              Save as Task
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
