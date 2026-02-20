import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { useState, useRef, useEffect } from 'react'
import { format, isToday, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// Mock tasks for the UI
const tasks = [
  { id: '1', text: 'Reply to team emails', description: 'Review Q4 marketing proposal draft attached', time: '2:00 PM', folder: 'Work', priority: 'High', priorityColor: 'orange' },
  { id: '2', text: 'Buy groceries', description: 'Milk, Eggs, Bread, Spinach, Avocados', time: '6:00 PM', folder: 'Personal', priority: null, priorityColor: 'primary' },
]

// Color mapping for habits - based on icon for visual variety
const getHabitColor = (icon: string) => {
  const colors: Record<string, { bg: string; text: string; badge: string; badgeText: string; accent: string; checkBg: string }> = {
    directions_run: { bg: 'bg-green-50 dark:bg-primary/10', text: 'text-primary', badge: 'bg-green-100 dark:bg-green-900/30', badgeText: 'text-green-700 dark:text-green-400', accent: 'bg-primary', checkBg: 'bg-primary' },
    auto_stories: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/30', badgeText: 'text-blue-700 dark:text-blue-400', accent: 'bg-blue-500', checkBg: 'bg-blue-500' },
    menu_book: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/30', badgeText: 'text-blue-700 dark:text-blue-400', accent: 'bg-blue-500', checkBg: 'bg-blue-500' },
    self_improvement: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-500', badge: 'bg-purple-100 dark:bg-purple-900/30', badgeText: 'text-purple-700 dark:text-purple-400', accent: 'bg-purple-500', checkBg: 'bg-purple-500' },
    water_drop: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-500', badge: 'bg-cyan-100 dark:bg-cyan-900/30', badgeText: 'text-cyan-700 dark:text-cyan-400', accent: 'bg-cyan-500', checkBg: 'bg-cyan-500' },
    fitness_center: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/30', badgeText: 'text-orange-700 dark:text-orange-400', accent: 'bg-orange-500', checkBg: 'bg-orange-500' },
    bedtime: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-500', badge: 'bg-indigo-100 dark:bg-indigo-900/30', badgeText: 'text-indigo-700 dark:text-indigo-400', accent: 'bg-indigo-500', checkBg: 'bg-indigo-500' },
    edit_note: { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-500', badge: 'bg-pink-100 dark:bg-pink-900/30', badgeText: 'text-pink-700 dark:text-pink-400', accent: 'bg-pink-500', checkBg: 'bg-pink-500' },
    directions_walk: { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-500', badge: 'bg-teal-100 dark:bg-teal-900/30', badgeText: 'text-teal-700 dark:text-teal-400', accent: 'bg-teal-500', checkBg: 'bg-teal-500' },
    default: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500', badge: 'bg-slate-100 dark:bg-slate-900/30', badgeText: 'text-slate-700 dark:text-slate-400', accent: 'bg-slate-500', checkBg: 'bg-slate-500' },
  }
  return colors[icon] || colors.default
}

export function Today() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const { habits, toggleHabitCompletion, isHabitCompletedOnDate } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [waterCount, setWaterCount] = useState(0) // Track hydration progress
  
  // For HabitTasksModal
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')
  const [selectedHabitIcon, setSelectedHabitIcon] = useState('checklist')
  const [selectedHabitIconColor, setSelectedHabitIconColor] = useState(0)

  // Format selected date for store operations
  const formattedDate = format(selectedDate, 'yyyy-MM-dd')

  // Hybrid habit click handler
  const handleHabitClick = (habit: any) => {
    const taskCount = getTaskCount(habit.id)
    
    if (taskCount > 0) {
      // Has tasks - open modal
      setSelectedHabitId(habit.id)
      setSelectedHabitName(habit.name)
      setSelectedHabitIcon(habit.icon)
      setSelectedHabitIconColor(habit.iconColor ?? 0)
    } else {
      // No tasks - direct toggle
      toggleHabitCompletion(habit.id, formattedDate)
    }
  }

  // Filter habits and tasks based on search query
  const filteredHabits = habits
    .filter(habit => habit.isActive === true && habit.categoryId !== undefined && !habit.archived) // Only show active habits with valid category
    .filter(habit => habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredTasks = tasks.filter(task => 
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate progress for selected date
  const activeHabits = habits.filter(h => h.isActive === true && h.categoryId !== undefined && !h.archived)
  const completedHabits = activeHabits.filter(h => isHabitCompletedOnDate(h.id, formattedDate)).length
  const totalHabits = activeHabits.length
  const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0

  // Generate days for the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))
  }

  const days = getDaysInMonth(new Date())

  // Scroll to current date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const today = new Date().getDate()
      const itemWidth = 50
      const gap = 12
      const containerWidth = scrollRef.current.clientWidth
      const scrollPos = (today - 1) * (itemWidth + gap) - containerWidth / 2 + itemWidth / 2
      scrollRef.current.scrollLeft = scrollPos
    }
  }, [])

  const handleDateClick = (date: Date) => {
    setDirection(isBefore(date, selectedDate) ? -1 : 1)
    setSelectedDate(date)
  }

  const getPageTitle = () => {
    if (isToday(selectedDate)) return 'Today'
    return format(selectedDate, 'EEE, MMM d')
  }

  const getProgressMessage = () => {
    if (progressPercentage >= 100) return 'Perfect!'
    if (progressPercentage >= 75) return 'Excellent!'
    if (progressPercentage >= 50) return 'Good Job!'
    if (progressPercentage >= 25) return 'Keep Going!'
    return "Let's Start!"
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl flex-col font-display text-slate-800 dark:text-slate-200">
      {/* Main Content */}
      <main className="flex-grow pb-28 overflow-hidden">
        {/* Top App Bar */}
        <div className="flex flex-col gap-4 p-4 pb-2 sm:p-6 sm:pb-2 lg:px-8">
          <div className="flex h-12 sm:h-14 items-center justify-between">
            <div className="flex size-12 shrink-0 items-center">
              <button 
                onClick={() => setIsSideNavOpen(true)}
                className="flex size-10 sm:size-11 items-center justify-center rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined sm:text-[28px]" aria-hidden="true">menu</span>
              </button>
            </div>
            
            {/* Title or Search Input */}
            <div className="flex-1 overflow-hidden px-2">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full"
                  >
                    <input
                      type="text"
                      placeholder="Search habits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full rounded-full border-none bg-slate-100 dark:bg-surface-dark px-4 py-1.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </motion.div>
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.p
                        key={selectedDate.toISOString()}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                        className="text-lg sm:text-xl lg:text-2xl font-bold dark:text-slate-200 text-center"
                      >
                        {getPageTitle()}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen)
                  if (isSearchOpen) setSearchQuery('')
                }}
                className={`flex size-10 sm:size-11 items-center justify-center rounded-full transition-colors ${
                  isSearchOpen 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark'
                }`}
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              >
                <span className="material-symbols-outlined sm:text-[28px]" aria-hidden="true">
                  {isSearchOpen ? 'close' : 'search'}
                </span>
              </button>
              <button 
                onClick={() => navigate('/calendar')}
                className="flex size-10 sm:size-11 items-center justify-center rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
                aria-label="Open calendar"
              >
                <span className="material-symbols-outlined sm:text-[28px]" aria-hidden="true">calendar_month</span>
              </button>
            </div>
          </div>
          
          {/* Horizontal Calendar */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-3 py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
          >
            {days.map((date) => {
              const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth()
              const isTodayDate = isToday(date)
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`flex min-w-[50px] sm:min-w-[60px] lg:min-w-[68px] flex-col items-center justify-center gap-0.5 rounded-xl sm:rounded-2xl py-2 sm:py-3 transition-all ${
                    isSelected 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10'
                  }`}
                  aria-label={format(date, 'EEEE, MMMM d, yyyy')}
                  aria-current={isTodayDate ? 'date' : undefined}
                  aria-pressed={isSelected}
                >
                  <span className={`text-[10px] sm:text-xs font-bold uppercase ${isSelected ? 'text-white/80' : ''}`} aria-hidden="true">
                    {format(date, 'EEE')}
                  </span>
                  <span className={`text-lg sm:text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`} aria-hidden="true">
                    {date.getDate()}
                  </span>
                  {isTodayDate && !isSelected && (
                    <div className="h-1 w-1 rounded-full bg-primary mt-0.5" aria-hidden="true"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* NEW CONTENT STARTS HERE */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedDate.toISOString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
            className="w-full px-4 sm:px-6 lg:px-8"
          >
            {/* Daily Goal Card - NEW */}
            {!isSearchOpen && (
              <div className="py-2">
                <div className="relative w-full bg-slate-900 dark:bg-[#1A2F22] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden text-white group cursor-pointer transition-transform hover:scale-[1.01] duration-500">
                  <div className="absolute top-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-primary/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:bg-primary/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-48 lg:w-72 h-48 lg:h-72 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-primary mb-1 block">DAILY GOAL</span>
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold">{getProgressMessage()}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm sm:text-base text-slate-300 font-medium">You've completed</span>
                        <span className="text-base sm:text-lg lg:text-xl font-semibold text-white">{completedHabits} of {totalHabits} habits</span>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-center h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
                      <svg className="size-28 sm:size-36 lg:size-44" viewBox="0 0 100 100">
                        <circle 
                          className="text-primary/20 dark:text-primary/10" 
                          cx="50" cy="50" 
                          fill="transparent" 
                          r="40" 
                          stroke="currentColor" 
                          strokeWidth="8"
                        ></circle>
                        <circle 
                          className="text-primary transition-all duration-500 ease-out" 
                          cx="50" cy="50" 
                          fill="transparent" 
                          r="40" 
                          stroke="currentColor" 
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 * (1 - progressPercentage / 100)}
                          strokeLinecap="round" 
                          strokeWidth="8"
                          style={{ 
                            transform: 'rotate(-90deg)', 
                            transformOrigin: '50% 50%' 
                          }}
                        ></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{Math.round(progressPercentage)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Habits Section */}
            <section className="mt-6 sm:mt-8">
              <div className="flex items-end justify-between mb-4 px-1">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-white">Habits</h3>
                <button 
                  onClick={() => navigate('/habits')}
                  className="text-sm sm:text-base font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                >
                  View All <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredHabits.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <p>{isSearchOpen ? 'No habits found.' : 'No habits yet.'}</p>
                  </div>
                ) : (
                  filteredHabits.map((habit) => {
                    const isCompleted = isHabitCompletedOnDate(habit.id, formattedDate)
                    const colors = getHabitColor(habit.icon)
                    const isHydration = habit.icon === 'water_drop'
                    
                    // Hydration Card - Special Layout
                    if (isHydration) {
                      const maxCups = habit.goal || 8
                      const isFullyCompleted = waterCount >= maxCups
                      
                      const handleAddWater = () => {
                        if (waterCount < maxCups) {
                          const newCount = waterCount + 1
                          setWaterCount(newCount)
                          // Mark as completed when all cups are filled
                          if (newCount >= maxCups && !isCompleted) {
                            toggleHabitCompletion(habit.id, formattedDate)
                          }
                        }
                      }
                      
                      return (
                        <div 
                          key={habit.id}
                          className="group relative bg-white dark:bg-surface-dark rounded-[1.75rem] p-4 shadow-sm border border-slate-100 dark:border-white/5 hover:border-cyan-400/20 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                                <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display leading-tight">{habit.name}</h4>
                                <span className="text-xs text-slate-500 font-medium">{waterCount}/{maxCups} Cups</span>
                              </div>
                            </div>
                            <button 
                              onClick={handleAddWater}
                              disabled={isFullyCompleted}
                              className={clsx(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-lg active:scale-90 transform duration-200",
                                isFullyCompleted 
                                  ? "bg-cyan-500 text-white shadow-cyan-500/30 cursor-default" 
                                  : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-500/30"
                              )}
                              aria-label={isFullyCompleted ? `${habit.name} completed` : `Add cup to ${habit.name}`}
                            >
                              <span className="material-symbols-outlined" aria-hidden="true">{isFullyCompleted ? 'check' : 'add'}</span>
                            </button>
                          </div>
                          <div className="flex gap-1.5 h-10 px-1">
                            {Array.from({ length: maxCups }).map((_, i) => (
                              <div 
                                key={i} 
                                className={clsx(
                                  "flex-1 rounded-md transition-all duration-300",
                                  i < waterCount ? "bg-cyan-400 opacity-100" : "bg-slate-100 dark:bg-slate-700/50"
                                )}
                              ></div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Regular Habit Card
                    return (
                      <div 
                        key={habit.id}
                        className="group relative bg-white dark:bg-surface-dark rounded-[1.75rem] p-2 pr-4 pl-3 flex items-center justify-between shadow-sm border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className={clsx("absolute left-0 top-5 bottom-5 w-1 rounded-r-full", colors.accent)}></div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className={clsx("h-14 w-14 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-95 transition-transform duration-300", colors.bg, colors.text)}>
                            <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
                          </div>
                          <div className="flex flex-col py-1">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">{habit.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-md", colors.badge, colors.badgeText)}>
                                {habit.category || 'General'}
                              </span>
                              {habit.goal && <span className="text-xs text-slate-400">{habit.goal} {habit.goalPeriod}</span>}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="cursor-pointer relative h-11 w-11"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHabitClick(habit)
                          }}
                          role="checkbox"
                          aria-checked={isCompleted}
                          aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
                        >
                          <div className={clsx("absolute inset-0 rounded-full transition-colors duration-300", isCompleted ? colors.checkBg : "bg-slate-100 dark:bg-slate-800")}></div>
                          <div className={clsx("absolute inset-1 rounded-full transition-colors duration-300 flex items-center justify-center", isCompleted ? "bg-transparent" : "bg-white dark:bg-surface-dark")}>
                            <span className={clsx("material-symbols-outlined text-xl font-bold transition-colors duration-300", isCompleted ? "text-white dark:text-slate-900" : "text-slate-300")} aria-hidden="true">check</span>
                          </div>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Tasks Section */}
            <section className="mt-8 sm:mt-10 pb-4">
              <div className="flex items-end justify-between mb-4 px-1">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-white">Tasks</h3>
                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider bg-white dark:bg-surface-dark px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-white/5">
                  {filteredTasks.length} Pending
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="relative group overflow-hidden bg-white dark:bg-surface-dark rounded-[1.5rem] p-4 shadow-sm border border-slate-100 dark:border-white/5 flex gap-3 transition-all hover:shadow-lg"
                  >
                    <div className={clsx("absolute top-0 left-0 w-1.5 h-full", task.priorityColor === 'orange' ? 'bg-orange-400' : 'bg-primary')}></div>
                    <label className="relative flex items-start pt-0.5 cursor-pointer">
                      <input className="peer sr-only" type="checkbox"/>
                      <div className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-slate-800 dark:peer-checked:bg-primary dark:peer-checked:border-primary peer-checked:border-slate-800 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white dark:text-[#050b07] text-sm scale-0 peer-checked:scale-100 transition-transform font-bold">check</span>
                      </div>
                    </label>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight mb-1 group-hover:text-primary transition-colors">{task.text}</p>
                        {task.priority && (
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wide ml-2 shrink-0">{task.priority}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {task.time}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <span className="material-symbols-outlined text-[14px]">folder</span>
                          {task.folder}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 lg:right-8 z-10">
        <button 
          onClick={() => navigate('/new-habit')}
          className="group flex items-center justify-center rounded-full h-14 w-14 sm:h-16 sm:w-16 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Add new habit"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:rotate-90 transition-transform duration-300" aria-hidden="true">add</span>
        </button>
      </div>

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />
      
      {/* Habit Tasks Modal */}
      {selectedHabitId && (
        <HabitTasksModal
          isOpen={!!selectedHabitId}
          onClose={() => {
            setSelectedHabitId(null)
            setSelectedHabitName('')
            setSelectedHabitIcon('checklist')
            setSelectedHabitIconColor(0)
          }}
          habitId={selectedHabitId}
          habitName={selectedHabitName}
          habitIcon={selectedHabitIcon}
          habitIconColor={selectedHabitIconColor}
        />
      )}
    </div>
  )
}
