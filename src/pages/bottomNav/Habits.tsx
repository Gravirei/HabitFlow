import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { HabitTasksModal } from '@/components/categories/HabitTasksModal'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit } from '@/types/habit'
import clsx from 'clsx'

export function Habits() {
  const navigate = useNavigate()
  const { habits, toggleHabitCompletion } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['health', 'work', 'personal', 'other']))
  const [prevCompletedToday, setPrevCompletedToday] = useState(0)
  
  // For HabitTasksModal
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedHabitName, setSelectedHabitName] = useState('')
  
  // Hybrid habit click handler
  const handleHabitClick = (habit: any) => {
    const taskCount = getTaskCount(habit.id)
    
    if (taskCount > 0) {
      // Has tasks - open modal
      setSelectedHabitId(habit.id)
      setSelectedHabitName(habit.name)
    } else {
      // No tasks - direct toggle
      toggleHabitCompletion(habit.id)
    }
  }

  const filteredHabits = habits
    .filter(h => h.isActive === true) // Only show active habits
    .filter(h => h.frequency === activeTab)
    .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFab = () => setIsFabOpen(!isFabOpen)

  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ] as const

  // Calculate stats
  const completedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length
  const totalDailyHabits = habits.filter(h => h.frequency === 'daily').length
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
  
  // Animated counter effect
  useEffect(() => {
    setPrevCompletedToday(completedToday)
  }, [completedToday])

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-teal-50/30 to-orange-50/20 dark:from-gray-950 dark:to-gray-900 text-slate-900 dark:text-white font-display">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-gray-200/50 bg-white/80 backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
        <div className="flex h-16 items-center justify-between px-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSideNavOpen(true)}
            className="flex size-10 items-center justify-center rounded-full text-slate-800 transition-all duration-150 hover:bg-gray-100 active:scale-95 dark:text-slate-200 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">menu</span>
          </motion.button>
          
          {/* Title or Search Input */}
          <div className="flex-1 overflow-hidden px-4">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-full border border-gray-200 bg-gray-100 px-4 py-2 font-raleway text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </motion.div>
              ) : (
                <motion.h2
                  key="title"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="font-lora text-xl font-bold text-center tracking-tight"
                >
                  My Habits
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsSearchOpen(!isSearchOpen)
              if (isSearchOpen) setSearchQuery('')
            }}
            className={clsx(
              'flex size-10 items-center justify-center rounded-full transition-all duration-150',
              isSearchOpen 
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' 
                : 'text-slate-800 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-gray-800'
            )}
          >
            <span className="material-symbols-outlined">
              {isSearchOpen ? 'close' : 'search'}
            </span>
          </motion.button>
        </div>
      </header>

      {/* Tabs - Redesigned with Sliding Indicator */}
      <div className="shrink-0 px-6 py-6 z-20">
        <div className="relative flex gap-2 rounded-3xl bg-white/60 p-2 backdrop-blur-xl dark:bg-gray-800/60 border border-gray-200/50 dark:border-white/5 shadow-lg">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'relative z-10 flex-1 rounded-2xl px-4 py-3 font-raleway text-sm font-bold transition-colors duration-200',
                activeTab === tab.id
                  ? 'text-white dark:text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              whileTap={{ scale: 0.97 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-28 space-y-8">
        {/* Stats Cards - Redesigned */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-teal-50/50 p-5 shadow-lg ring-1 ring-gray-200/50 backdrop-blur-xl dark:from-gray-800 dark:to-teal-500/5 dark:ring-white/5"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-500/20 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 flex items-start justify-between">
                <span className="font-raleway text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Completed
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
                  <span className="material-symbols-outlined text-lg text-teal-600 dark:text-teal-400 icon-filled">
                    check_circle
                  </span>
                </div>
              </div>
              <motion.div
                key={completedToday}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-baseline gap-1"
              >
                <h3 className="font-lora text-4xl font-bold text-slate-900 dark:text-white">
                  {completedToday}
                </h3>
                <span className="font-raleway text-lg font-medium text-gray-600 dark:text-gray-400">
                  /{totalDailyHabits}
                </span>
              </motion.div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${totalDailyHabits > 0 ? (completedToday / totalDailyHabits) * 100 : 0}%` 
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/50"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-orange-50/50 p-5 shadow-lg ring-1 ring-gray-200/50 backdrop-blur-xl dark:from-gray-800 dark:to-orange-500/5 dark:ring-white/5"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-orange-500/20 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 flex items-start justify-between">
                <span className="font-raleway text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Best Streak
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20">
                  <span className="material-symbols-outlined text-lg text-orange-600 dark:text-orange-400 icon-filled">
                    local_fire_department
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-lora text-4xl font-bold text-slate-900 dark:text-white">{bestStreak}</h3>
                <span className="font-raleway text-sm font-medium text-gray-600 dark:text-gray-400">days</span>
              </div>
              <div className="mt-3 font-raleway text-xs font-semibold text-orange-600 dark:text-orange-400">
                Keep it burning! 🔥
              </div>
            </div>
          </motion.div>
        </div>

        {/* Habits List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {filteredHabits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-8 dark:from-gray-800 dark:to-gray-700"
                >
                  <span className="material-symbols-outlined text-5xl text-gray-400">
                    checklist
                  </span>
                </motion.div>
                <h3 className="font-lora text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {searchQuery ? 'No matching habits' : `No ${activeTab} habits yet`}
                </h3>
                <p className="font-raleway text-slate-600 dark:text-slate-400 max-w-[250px] mb-6">
                  {searchQuery ? 'Try a different search term' : `Start building your ${activeTab} routine!`}
                </p>
                {!searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/new-habit?frequency=${activeTab}`)}
                    className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 font-raleway font-bold text-white shadow-lg shadow-teal-500/30 transition-shadow hover:shadow-xl"
                  >
                    Create {activeTab} habit
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Group habits by category or just display them */}
                <HabitList habits={filteredHabits} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-20 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isFabOpen && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate('/new-habit?frequency=monthly')}
                className="flex items-center gap-3 rounded-full bg-white dark:bg-surface-dark p-3 pr-6 shadow-lg border border-slate-100 dark:border-white/10"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Monthly Habit</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.05 }}
                onClick={() => navigate('/new-habit?frequency=weekly')}
                className="flex items-center gap-3 rounded-full bg-white dark:bg-surface-dark p-3 pr-6 shadow-lg border border-slate-100 dark:border-white/10"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined">date_range</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Weekly Habit</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                onClick={() => navigate('/new-habit?frequency=daily')}
                className="flex items-center gap-3 rounded-full bg-white dark:bg-surface-dark p-3 pr-6 shadow-lg border border-slate-100 dark:border-white/10"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined">today</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Daily Habit</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleFab}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isFabOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={clsx(
            'flex size-16 items-center justify-center rounded-full shadow-xl transition-all duration-200',
            isFabOpen
              ? 'bg-white/90 text-slate-900 ring-2 ring-gray-200 dark:bg-gray-800/90 dark:text-white dark:ring-gray-700'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-teal-500/30'
          )}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </motion.button>
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
          }}
          habitId={selectedHabitId}
          habitName={selectedHabitName}
        />
      )}
    </div>
  )
}

function HabitList({ habits }: { habits: Habit[] }) {
  const { isHabitCompletedToday } = useHabitStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['health', 'work', 'personal', 'other'])
  )

  // Group habits by category
  const habitsByCategory = habits.reduce((acc, habit) => {
    const category = habit.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(habit)
    return acc
  }, {} as Record<string, Habit[]>)

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'health':
        return { name: 'Health & Wellness', icon: 'favorite', gradient: 'from-teal-400 to-teal-600' }
      case 'work':
        return { name: 'Work & Productivity', icon: 'work', gradient: 'from-blue-400 to-blue-600' }
      case 'personal':
        return { name: 'Personal Growth', icon: 'emoji_events', gradient: 'from-purple-400 to-purple-600' }
      default:
        return { name: 'Other Habits', icon: 'star', gradient: 'from-gray-400 to-gray-600' }
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="space-y-4">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
        const categoryInfo = getCategoryInfo(category)
        const completedCount = categoryHabits.filter(h => isHabitCompletedToday(h.id)).length
        const isExpanded = expandedCategories.has(category)

        return (
          <div key={category} className="space-y-3">
            {/* Category Header - Collapsible */}
            <motion.button
              onClick={() => toggleCategory(category)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex w-full items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-xl ring-1 ring-gray-200/50 transition-all hover:shadow-md dark:bg-gray-800/40 dark:ring-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md',
                  categoryInfo.gradient
                )}>
                  <span className="material-symbols-outlined text-lg text-white">
                    {categoryInfo.icon}
                  </span>
                </div>
                <h4 className="font-lora text-lg font-bold text-slate-900 dark:text-white">
                  {categoryInfo.name}
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-teal-100 px-3 py-1 font-raleway text-xs font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
                  {completedCount}/{categoryHabits.length} Done
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="material-symbols-outlined text-xl text-gray-500 dark:text-gray-400">
                    expand_more
                  </span>
                </motion.div>
              </div>
            </motion.button>

            {/* Habits - Collapsible */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-3 overflow-hidden"
                >
                  {categoryHabits.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <HabitCard habit={habit} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function HabitCard({ habit }: { habit: Habit }) {
  const { toggleHabitCompletion, isHabitCompletedToday } = useHabitStore()
  const { getTaskCount } = useHabitTaskStore()
  const completed = isHabitCompletedToday(habit.id)
  const taskCount = getTaskCount(habit.id)

  const handleHabitClick = (habit: Habit) => {
    if (taskCount > 0) {
      // Has tasks - this will be handled by parent
      return
    } else {
      // No tasks - direct toggle
      toggleHabitCompletion(habit.id)
    }
  }

  const getIconGradient = (iconName: string) => {
    const gradientMap: Record<string, string> = {
      self_improvement: 'from-teal-400 to-teal-600',
      water_drop: 'from-blue-400 to-blue-600',
      book_2: 'from-purple-400 to-purple-600',
      menu_book: 'from-purple-400 to-purple-600',
      edit_note: 'from-pink-400 to-pink-600',
      directions_walk: 'from-green-400 to-green-600',
    }
    return gradientMap[iconName] || 'from-gray-400 to-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={clsx(
        'group relative overflow-hidden rounded-3xl p-5 shadow-lg ring-1 transition-all duration-200',
        completed
          ? 'bg-gradient-to-br from-white to-teal-50/50 ring-teal-200/50 dark:from-gray-800 dark:to-teal-500/5 dark:ring-teal-500/20'
          : 'bg-white/60 ring-gray-200/50 backdrop-blur-xl dark:bg-gray-800/40 dark:ring-white/5'
      )}
    >
      {/* Gradient background effect */}
      <div className={clsx(
        'absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300',
        completed ? 'bg-teal-500/20 opacity-100' : 'bg-gray-500/10 opacity-0 group-hover:opacity-100'
      )} />

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md',
            getIconGradient(habit.icon)
          )}
        >
          <span className="material-symbols-outlined text-2xl text-white">
            {habit.icon}
          </span>
        </motion.div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h5 className="font-lora text-base font-bold text-slate-900 dark:text-white">
              {habit.name}
            </h5>
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
              <span className="material-symbols-outlined icon-filled text-[12px]">local_fire_department</span>
              {habit.currentStreak}
            </div>
          </div>
          <p className="font-raleway text-sm text-gray-600 dark:text-gray-400">
            {habit.goal > 1 ? `${habit.goal} ${habit.goalPeriod}` : habit.description || habit.goalPeriod}
          </p>
        </div>

        {/* iOS Toggle Switch */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleHabitClick(habit)}
          className={clsx(
            'relative h-10 w-16 flex-shrink-0 rounded-full transition-all duration-200',
            completed
              ? 'bg-teal-500 shadow-inner shadow-teal-600/50'
              : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={clsx(
              'absolute top-1 h-8 w-8 rounded-full bg-white shadow-md',
              completed ? 'left-7' : 'left-1'
            )}
          />
        </motion.button>
      </div>
    </motion.div>
  )
}
