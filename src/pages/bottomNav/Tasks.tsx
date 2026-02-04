import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { TaskModal } from '@/components/TaskModal'
import { KanbanBoard } from '@/components/KanbanBoard'
import { HybridKanban } from '@/components/kanban/HybridKanban'
import { TrelloKanban } from '@/components/kanban/TrelloKanban'
import { MinimalKanban } from '@/components/kanban/MinimalKanban'
import { NotionKanban } from '@/components/kanban/NotionKanban'
import { AsanaKanban } from '@/components/kanban/AsanaKanban'
import { AccessibilityButton } from '@/components/AccessibilityButton'
import { TaskCardWithMenu } from '@/components/TaskCardWithMenu'
import { QuickActionsMenu } from '@/components/QuickActionsMenu'
import { TemplateCreationModal } from '../../components/TemplateCreationModal'
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
  const navigate = useNavigate()
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', SAMPLE_TASKS)
  const [customTemplates, setCustomTemplates] = useLocalStorage<TaskTemplate[]>('taskTemplates', [])
  const [view, setView] = useState<TaskView>('list')
  
  // Migrate broken templates on mount
  useEffect(() => {
    const fixBrokenTemplates = () => {
      let needsUpdate = false
      const fixed = customTemplates.map(template => {
        // Check if template has no name or description (broken template)
        if (!template.name || !template.description) {
          console.warn('Found broken template:', template.id)
          needsUpdate = true
          // Try to restore name/description from template.title/description
          return {
            ...template,
            name: template.name || template.template.title || 'Unnamed Template',
            description: template.description || template.template.description || 'No description available'
          }
        }
        return template
      })
      
      if (needsUpdate) {
        console.log('Fixing broken templates...')
        setCustomTemplates(fixed)
      }
    }
    
    fixBrokenTemplates()
  }, []) // Run only once on mount
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
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [kanbanStyle, setKanbanStyle] = useLocalStorage<'trello' | 'minimal' | 'notion' | 'asana' | 'hybrid'>('kanbanStyle', 'hybrid')
  
  // Refs for sliding highlight
  const allRef = useRef<HTMLButtonElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const completedRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 })
  
  // Ref for search container
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Update highlight position when tab changes
  useEffect(() => {
    const activeTabRef = filterStatus === 'all' ? allRef : filterStatus === 'active' ? activeRef : completedRef
    const container = containerRef.current
    const activeTab = activeTabRef.current
    
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTab.getBoundingClientRect()
      setHighlightStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      })
    }
  }, [filterStatus, tasks])
  
  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Disable scrolling when menu is open
  useEffect(() => {
    if (openMenuTaskId) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      // Prevent scrolling on touch devices
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [openMenuTaskId])

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
      // Primary sort: Completed tasks always go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // Secondary sort: Within each group (active/completed), sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      
      // Tertiary sort: Use the selected sort field
      let comparison = 0
      
      switch (sort.field) {
        case 'priority':
          comparison = priorityComparison
          break
        case 'dueDate':
          if (!a.due && !b.due) comparison = priorityComparison
          else if (!a.due) comparison = 1
          else if (!b.due) comparison = -1
          else comparison = new Date(a.due).getTime() - new Date(b.due).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          if (comparison === 0) comparison = priorityComparison
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          if (comparison === 0) comparison = priorityComparison
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
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Header - Similar to Timer Page */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-background-light/95 dark:bg-background-dark/95 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back Button + Hamburger Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-xl text-gray-900 dark:text-white">
                arrow_back
              </span>
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-xl text-gray-900 dark:text-white">
                menu
              </span>
            </button>
          </div>

          {/* Center: Title */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-1">
            {/* Search with expandable pill input */}
            <div ref={searchRef} className="relative flex items-center">
              {!isSearchOpen && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500 relative z-10"
                  aria-label="Search"
                >
                  <span className="material-symbols-outlined text-xl font-bold">search</span>
                </button>
              )}
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-10 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:rounded-full transition-all duration-300 ease-out absolute right-0 ${
                  isSearchOpen ? 'w-48 opacity-100' : 'w-10 opacity-0 pointer-events-none'
                }`}
                autoFocus={isSearchOpen}
              />
              {isSearchOpen && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearchOpen(false)
                  }}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 text-gray-400 dark:text-gray-500 absolute right-1 z-10"
                  aria-label="Close search"
                >
                  <span className="material-symbols-outlined text-lg font-bold">close</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setView('list')}
              className={`flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 ${
                view === 'list' ? 'text-white font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-xl font-bold">view_list</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 ${
                view === 'kanban' ? 'text-white font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label="Kanban view"
            >
              <span className="material-symbols-outlined text-xl font-bold">view_kanban</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modern Filters Sidebar - Slide in from left */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-500 shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-white text-xl font-bold">tune</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customize your view</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
                aria-label="Close filters"
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sort Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">sort</span>
                  Sort By
                </h3>
                <div className="space-y-2">
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
                        "w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between group",
                        sort.field === field
                          ? 'bg-gradient-to-r from-primary to-green-500 text-white shadow-lg shadow-primary/30'
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "material-symbols-outlined text-lg",
                          sort.field === field ? 'text-white' : 'text-gray-400'
                        )}>{icon}</span>
                        {label}
                      </div>
                      {sort.field === field && (
                        <span className="material-symbols-outlined text-lg">
                          {sort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">flag</span>
                  Priority
                </h3>
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
                        "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1",
                        selectedPriorities.includes(priority)
                          ? priority === 'high'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                            : priority === 'medium'
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                            : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {priority === 'high' ? 'priority_high' : priority === 'medium' ? 'drag_handle' : 'arrow_downward'}
                      </span>
                      <span className="text-xs">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">folder</span>
                    Categories
                  </h3>
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
                          "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                          selectedCategories.includes(category)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {(selectedPriorities.length > 0 || selectedCategories.length > 0) && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Active Filters</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-primary text-white rounded-full">
                      {selectedPriorities.length + selectedCategories.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPriorities([])
                      setSelectedCategories([])
                    }}
                    className="w-full mt-2 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">clear_all</span>
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Kanban Settings Section */}
              {view === 'kanban' && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">dashboard</span>
                    Kanban Style
                  </h3>
                  <div className="space-y-3">
                    {[
                      { value: 'hybrid', label: 'Hybrid', desc: 'Best of all designs' },
                      { value: 'trello', label: 'Trello', desc: 'Classic card layout' },
                      { value: 'minimal', label: 'Minimal', desc: 'Clean & compact' },
                      { value: 'notion', label: 'Notion', desc: 'Modern with emojis' },
                      { value: 'asana', label: 'Asana', desc: 'Structured workflow' },
                    ].map(({ value, label, desc }) => (
                      <div key={value} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">{label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                        </div>
                        <button
                          onClick={() => setKanbanStyle(value as any)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
                            kanbanStyle === value
                              ? 'bg-gradient-to-r from-primary to-green-500'
                              : 'bg-gray-300 dark:bg-gray-700'
                          )}
                          role="switch"
                          aria-checked={kanbanStyle === value}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                              kanbanStyle === value ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <main className="flex-1 pb-24 pt-2 px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Filter Tabs - Always Visible */}
        <div className="flex justify-center mb-6">
          <div ref={containerRef} className="inline-flex gap-1 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-full relative">
            {/* Sliding highlight background */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-primary to-green-500 rounded-full shadow-lg shadow-primary/30 transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${highlightStyle.left}px`,
                width: `${highlightStyle.width}px`
              }}
            />
            <button
              ref={allRef}
              onClick={() => setFilterStatus('all')}
              className={cn(
                "relative z-10 px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 whitespace-nowrap",
                filterStatus === 'all'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span className="font-bold">All</span>
              <span className="ml-1.5 opacity-70">({tasks.length})</span>
            </button>
            <button
              ref={activeRef}
              onClick={() => setFilterStatus('active')}
              className={cn(
                "relative z-10 px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 whitespace-nowrap",
                filterStatus === 'active'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span className="font-bold">Active</span>
              <span className="ml-1.5 opacity-70">({tasks.filter(t => !t.completed).length})</span>
            </button>
            <button
              ref={completedRef}
              onClick={() => setFilterStatus('completed')}
              className={cn(
                "relative z-10 px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 whitespace-nowrap",
                filterStatus === 'completed'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span className="font-bold">Completed</span>
              <span className="ml-1.5 opacity-70">({tasks.filter(t => t.completed).length})</span>
            </button>
          </div>
        </div>

        {view === 'kanban' ? (
          <>
            {kanbanStyle === 'hybrid' && (
              <HybridKanban
                tasks={filteredTasks}
                onTaskClick={setEditingTask}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTask={deleteTask}
              />
            )}
            {kanbanStyle === 'trello' && (
              <TrelloKanban
                tasks={filteredTasks}
                onTaskClick={setEditingTask}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTask={deleteTask}
              />
            )}
            {kanbanStyle === 'minimal' && (
              <MinimalKanban
                tasks={filteredTasks}
                onTaskClick={setEditingTask}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTask={deleteTask}
              />
            )}
            {kanbanStyle === 'notion' && (
              <NotionKanban
                tasks={filteredTasks}
                onTaskClick={setEditingTask}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTask={deleteTask}
              />
            )}
            {kanbanStyle === 'asana' && (
              <AsanaKanban
                tasks={filteredTasks}
                onTaskClick={setEditingTask}
                onTaskStatusChange={handleTaskStatusChange}
                onDeleteTask={deleteTask}
              />
            )}
          </>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => {
              const dueText = formatDueDate(task.due)
              const isOverdue = dueText === 'Overdue'
              const completionPercentage = getCompletionPercentage(task)

              return (
                <TaskCardWithMenu
                  key={task.id}
                  task={task}
                  dueText={dueText}
                  isOverdue={isOverdue}
                  completionPercentage={completionPercentage}
                  openMenuTaskId={openMenuTaskId}
                  setOpenMenuTaskId={setOpenMenuTaskId}
                  setEditingTask={setEditingTask}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  tasks={tasks}
                  setTasks={setTasks}
                />
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
        onCreateNewTemplate={() => {
          // Don't close QuickActionsMenu - keep it open behind the modal
          setIsTemplateManagerOpen(true)
        }}
        onSaveTemplate={handleSaveTemplate}
        onUpdateTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        existingTasks={tasks}
      />
      
      <TemplateCreationModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* Accessibility Button Demo */}
      <AccessibilityButton />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsQuickActionsOpen(true)}
        className="w-16 h-16 bg-gradient-to-br from-primary via-emerald-500 to-teal-500 text-white rounded-2xl shadow-2xl shadow-primary/50 hover:shadow-[0_20px_60px_-15px_rgba(19,236,91,0.6)] hover:scale-110 hover:-translate-y-1 active:scale-100 transition-all duration-300 flex items-center justify-center group overflow-hidden"
        aria-label="Quick Actions"
        style={{
          position: 'fixed',
          bottom: '6rem',
          right: '1.5rem',
          left: 'unset',
          zIndex: 30
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Pulse effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping group-hover:block hidden"></div>
        
        {/* Icon with rotation */}
        <span className="material-symbols-outlined text-3xl font-bold relative z-10 group-hover:rotate-180 transition-transform duration-500 ease-out">
          add
        </span>
      </button>
    </div>
  )
}
