import { useState, useMemo } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { TaskModal } from '@/components/TaskModal'
import { KanbanBoard } from '@/components/KanbanBoard'
import { QuickActionsMenu } from '@/components/QuickActionsMenu'
import { TemplateManagerModal } from '@/components/TemplateManagerModal'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Task, TaskPriority, TaskStatus, TaskSort, TaskView } from '@/types/task'
import type { TaskTemplate } from '@/types/taskTemplate'
import { cn } from '@/utils/cn'

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design the new landing page',
    description: 'Create mockups and wireframes for the redesigned homepage',
    completed: false,
    status: 'in_progress',
    priority: 'high',
    category: 'Work',
    tags: ['design', 'urgent'],
    due: new Date(Date.now() + 86400000 * 2).toISOString(),
    dueTime: '22:00',
    subtasks: [
      { id: 's1', text: 'Research competitors', completed: true },
      { id: 's2', text: 'Create wireframes', completed: true },
      { id: 's3', text: 'Design mockups', completed: false },
    ],
    notes: 'Focus on mobile-first design',
    timeEstimate: 240,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Finalize Q3 report',
    description: 'Compile financial data and prepare presentation',
    completed: false,
    status: 'todo',
    priority: 'high',
    category: 'Work',
    tags: ['finance', 'report'],
    due: new Date(Date.now() + 86400000).toISOString(),
    timeEstimate: 180,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Schedule dentist appointment',
    completed: true,
    status: 'completed',
    priority: 'low',
    category: 'Personal',
    tags: ['health'],
    due: new Date(Date.now() + 86400000 * 5).toISOString(),
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Grocery shopping',
    description: 'Buy ingredients for the week',
    completed: false,
    status: 'todo',
    priority: 'medium',
    category: 'Personal',
    tags: ['errands'],
    due: new Date().toISOString(),
    subtasks: [
      { id: 's4', text: 'Vegetables', completed: false },
      { id: 's5', text: 'Fruits', completed: false },
      { id: 's6', text: 'Dairy', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Review pull requests',
    description: 'Code review for team members',
    completed: false,
    status: 'in_progress',
    priority: 'medium',
    category: 'Work',
    tags: ['code', 'team'],
    due: new Date().toISOString(),
    timeEstimate: 60,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function Tasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', SAMPLE_TASKS)
  const [customTemplates, setCustomTemplates] = useLocalStorage<TaskTemplate[]>('taskTemplates', [])
  const [view, setView] = useState<TaskView>('list')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sort, setSort] = useState<TaskSort>({ field: 'dueDate', direction: 'asc' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)

  // Get unique categories and tags
  const categories = useMemo(() => Array.from(new Set(tasks.map(t => t.category))), [tasks])
  const allTags = useMemo(() => Array.from(new Set(tasks.flatMap(t => t.tags))), [tasks])

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { 
        ...t, 
        completed: !t.completed,
        status: !t.completed ? 'completed' : 'todo',
        updatedAt: new Date().toISOString()
      } : t
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(t => t.id === task.id ? task : t))
    } else {
      // Add new task
      setTasks([task, ...tasks])
    }
    setEditingTask(null)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'completed', updatedAt: new Date().toISOString() } : t
    ))
  }

  const handleCreateFromTemplate = (template: TaskTemplate) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: template.template.title,
      description: template.template.description,
      completed: false,
      status: template.template.status,
      priority: template.template.priority,
      category: template.template.category,
      tags: [...template.template.tags],
      subtasks: template.template.subtasks.map(st => ({
        ...st,
        id: `st_${Date.now()}_${Math.random()}`
      })),
      notes: template.template.notes,
      timeEstimate: template.template.timeEstimate,
      recurring: template.template.recurring,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks([newTask, ...tasks])
  }

  const handleSaveTemplate = (template: TaskTemplate) => {
    if (customTemplates.find(t => t.id === template.id)) {
      // Update existing
      setCustomTemplates(customTemplates.map(t => t.id === template.id ? template : t))
    } else {
      // Add new
      setCustomTemplates([...customTemplates, template])
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    setCustomTemplates(customTemplates.filter(t => t.id !== templateId))
  }

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(t => !t.completed)
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(t => t.completed)
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(t => selectedPriorities.includes(t.priority))
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category))
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sort.field) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'dueDate':
          if (!a.due && !b.due) comparison = 0
          else if (!a.due) comparison = 1
          else if (!b.due) comparison = -1
          else comparison = new Date(a.due).getTime() - new Date(b.due).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sort.direction === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, filterStatus, selectedPriorities, selectedCategories, searchQuery, sort])

  // Helper functions
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'priority_high'
      case 'medium': return 'drag_handle'
      case 'low': return 'arrow_downward'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'todo': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const formatDueDate = (due?: string) => {
    if (!due) return null
    const dueDate = new Date(due)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    if (dueDate.getTime() === today.getTime()) return 'Today'
    if (dueDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    if (dueDate < today) return 'Overdue'
    
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 7) return `${diff}d`
    
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getCompletionPercentage = (task: Task) => {
    if (task.subtasks.length === 0) return task.completed ? 100 : 0
    const completed = task.subtasks.filter(s => s.completed).length
    return Math.round((completed / task.subtasks.length) * 100)
  }

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Tasks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView('list')}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  view === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                title="List View"
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
              <button
                onClick={() => setView('kanban')}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  view === 'kanban'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                title="Kanban View"
              >
                <span className="material-symbols-outlined text-[20px]">view_kanban</span>
              </button>
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                isFilterOpen || selectedPriorities.length > 0 || selectedCategories.length > 0
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>

            <button
              onClick={() => setIsQuickActionsOpen(true)}
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[22px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Modern Filter Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200",
                  filterStatus === status
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className="text-xs opacity-70">
                    {status === 'all' && `${tasks.length}`}
                    {status === 'active' && `${tasks.filter(t => !t.completed).length}`}
                    {status === 'completed' && `${tasks.filter(t => t.completed).length}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modern Advanced Filters Panel */}
        {isFilterOpen && (
          <div className="px-6 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            {/* Sort Options */}
            <div>
              <label className="text-xs font-bold text-gray-900 dark:text-white mb-3 block uppercase tracking-wider">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { field: 'dueDate', label: 'Due Date', icon: 'schedule' },
                  { field: 'priority', label: 'Priority', icon: 'flag' },
                  { field: 'createdAt', label: 'Created', icon: 'add_circle' },
                  { field: 'title', label: 'Title', icon: 'sort_by_alpha' },
                ].map(({ field, label, icon }) => (
                  <button
                    key={field}
                    onClick={() => setSort(prev => ({
                      field: field as TaskSort['field'],
                      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                    }))}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                      sort.field === field
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    {label}
                    {sort.field === field && (
                      <span className="material-symbols-outlined text-base">
                        {sort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs font-bold text-gray-900 dark:text-white mb-3 block uppercase tracking-wider">Priority</label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      setSelectedPriorities(prev =>
                        prev.includes(priority)
                          ? prev.filter(p => p !== priority)
                          : [...prev, priority]
                      )
                    }}
                    className={cn(
                      "flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                      selectedPriorities.includes(priority)
                        ? priority === 'high'
                          ? 'bg-red-500 text-white shadow-md'
                          : priority === 'medium'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    )}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white mb-3 block uppercase tracking-wider">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(category)
                            ? prev.filter(c => c !== category)
                            : [...prev, category]
                        )
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                        selectedCategories.includes(category)
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedPriorities.length > 0 || selectedCategories.length > 0) && (
              <button
                onClick={() => {
                  setSelectedPriorities([])
                  setSelectedCategories([])
                }}
                className="w-full py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </header>

      {/* Content Area */}
      <main className="flex-1 pb-24 pt-2">
        {view === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={setEditingTask}
            onTaskStatusChange={handleTaskStatusChange}
            onDeleteTask={deleteTask}
          />
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-32 h-32 mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary">task_alt</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsQuickActionsOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-200"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 px-6">
            {filteredTasks.map((task) => {
              const dueText = formatDueDate(task.due)
              const isOverdue = dueText === 'Overdue'
              const completionPercentage = getCompletionPercentage(task)

              return (
                <div
                  key={task.id}
                  onClick={() => setEditingTask(task)}
                  className={cn(
                    "group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-primary/50 transition-all duration-300 cursor-pointer",
                    task.completed && 'opacity-60'
                  )}
                >
                  {/* Modern Priority Indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 w-2 h-2 rounded-full",
                    task.priority === 'high' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    task.priority === 'medium' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                    'bg-blue-500 shadow-lg shadow-blue-500/50'
                  )} />

                  {/* Delete Button - Shows on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this task?')) {
                        deleteTask(task.id)
                      }
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 active:scale-95"
                    aria-label="Delete task"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>

                  <div className="flex items-start gap-4">
                    {/* Modern Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTask(task.id)
                      }}
                      className="flex-shrink-0 mt-1"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                        task.completed
                          ? 'bg-gradient-to-br from-primary to-purple-600 border-primary scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:scale-110'
                      )}>
                        {task.completed && (
                          <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={cn(
                          "font-bold text-gray-900 dark:text-white text-lg leading-tight",
                          task.completed && 'line-through opacity-50'
                        )}>
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Modern Metadata */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Status Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                          task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        )}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {task.status.replace('_', ' ')}
                        </span>

                        {/* Category */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          <span className="material-symbols-outlined text-sm">folder</span>
                          {task.category}
                        </span>

                        {/* Due Date */}
                        {dueText && (
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                            isOverdue
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                          )}>
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {dueText}
                            {task.dueTime && ` ${task.dueTime}`}
                          </span>
                        )}

                        {/* Time Estimate */}
                        {task.timeEstimate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <span className="material-symbols-outlined text-sm">timer</span>
                            {task.timeEstimate}m
                          </span>
                        )}
                      </div>

                      {/* Modern Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Modern Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                            </span>
                            <span className="font-bold text-primary">
                              {completionPercentage}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Modals */}
      <TaskModal
        isOpen={isAddModalOpen || editingTask !== null}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
      
      <QuickActionsMenu
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onCreateFromTemplate={handleCreateFromTemplate}
        onCreateBlank={() => {
          setIsQuickActionsOpen(false)
          setIsAddModalOpen(true)
        }}
        customTemplates={customTemplates}
        onManageTemplates={() => {
          setIsQuickActionsOpen(false)
          setIsTemplateManagerOpen(true)
        }}
      />
      
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        customTemplates={customTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      {/* Modern Floating Action Button */}
      <button
        onClick={() => setIsQuickActionsOpen(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        aria-label="Quick Actions"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </button>
    </div>
  )
}
