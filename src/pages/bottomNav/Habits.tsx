import { useState } from 'react'
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

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      {/* Header */}
      <header className="shrink-0 flex flex-col gap-4 p-4 pb-2 bg-background-light dark:bg-background-dark z-20">
        <div className="flex h-12 items-center justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <button 
              onClick={() => setIsSideNavOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
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
                    className="w-full rounded-full border-none bg-slate-100 dark:bg-surface-dark px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </motion.div>
              ) : (
                <motion.h2
                  key="title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-bold text-center tracking-tight"
                >
                  My Habits
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end gap-2 size-12 shrink-0">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                if (isSearchOpen) setSearchQuery('')
              }}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                isSearchOpen 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark'
              }`}
            >
              <span className="material-symbols-outlined">
                {isSearchOpen ? 'close' : 'search'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 px-6 py-6 z-20">
        <div className="flex p-1.5 rounded-3xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 relative shadow-lg">
          {tabs.map((tab) => (
            <label key={tab.id} className="flex-1 relative cursor-pointer group">
              <input
                checked={activeTab === tab.id}
                onChange={() => setActiveTab(tab.id)}
                className="peer sr-only"
                name="view"
                type="radio"
                value={tab.id}
              />
              <div className="absolute inset-0 rounded-2xl bg-black dark:bg-primary shadow-glow opacity-0 peer-checked:opacity-100 transition-all duration-300 transform peer-checked:scale-100 scale-95 origin-center" />
              <div className="relative w-full py-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 peer-checked:text-white dark:peer-checked:text-black transition-colors z-10">
                <span>{tab.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-28 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/5 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
            <div className="flex items-start justify-between mb-2">
              <span className="text-text-secondary-dark text-xs font-bold uppercase tracking-wider">Completed</span>
              <span className="material-symbols-outlined text-primary text-xl icon-filled">check_circle</span>
            </div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                {completedToday}
                <span className="text-lg text-text-secondary-dark font-medium">/{totalDailyHabits}</span>
              </h3>
            </div>
            <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary w-[66%] rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]"
                style={{ width: `${totalDailyHabits > 0 ? (completedToday / totalDailyHabits) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/5 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors" />
            <div className="flex items-start justify-between mb-2">
              <span className="text-text-secondary-dark text-xs font-bold uppercase tracking-wider">Best Streak</span>
              <span className="material-symbols-outlined text-orange-500 text-xl icon-filled">local_fire_department</span>
            </div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{bestStreak}</h3>
              <span className="text-sm text-text-secondary-dark font-medium">days</span>
            </div>
            <div className="mt-3 text-xs text-orange-400 font-medium">
              On fire! 🔥
            </div>
          </div>
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
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 rounded-full bg-slate-100 p-6 dark:bg-surface-dark">
                  <span className="material-symbols-outlined text-4xl text-slate-400">checklist</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {searchQuery ? 'No matching habits' : `No ${activeTab} habits`}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-[200px]">
                  {searchQuery ? 'Try a different search term' : `You haven't created any ${activeTab} habits yet. Start building your routine!`}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => navigate(`/new-habit?frequency=${activeTab}`)}
                    className="mt-6 px-6 py-2.5 bg-primary text-black font-semibold rounded-full hover:opacity-90 transition-opacity"
                  >
                    Create {activeTab} habit
                  </button>
                )}
              </div>
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

        <button
          onClick={toggleFab}
          className={`flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 active:scale-95 ${
            isFabOpen
              ? 'bg-slate-200 dark:bg-surface-dark text-slate-900 dark:text-white rotate-45'
              : 'bg-primary text-black hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
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
        return { name: 'Health & Wellness', icon: 'self_improvement', color: 'teal' }
      case 'work':
        return { name: 'Work', icon: 'work', color: 'blue' }
      case 'personal':
        return { name: 'Personal', icon: 'person', color: 'purple' }
      default:
        return { name: 'Other', icon: 'star', color: 'gray' }
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
        const categoryInfo = getCategoryInfo(category)
        const completedCount = categoryHabits.filter(h => isHabitCompletedToday(h.id)).length

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">wb_sunny</span>
                {categoryInfo.name}
              </h4>
              <span className="text-xs font-bold bg-surface-dark border border-white/10 text-text-secondary-dark px-2 py-1 rounded-lg">
                {completedCount}/{categoryHabits.length} Done
              </span>
            </div>

            {categoryHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function HabitCard({ habit }: { habit: Habit }) {
  const { toggleHabitCompletion, isHabitCompletedToday } = useHabitStore()
  const completed = isHabitCompletedToday(habit.id)

  const getIconColor = (iconName: string) => {
    const colorMap: Record<string, string> = {
      self_improvement: 'bg-teal-500/10 text-teal-400',
      water_drop: 'bg-blue-500/10 text-blue-400',
      book_2: 'bg-purple-500/10 text-purple-400',
      menu_book: 'bg-purple-500/10 text-purple-400',
      edit_note: 'bg-pink-500/10 text-pink-400',
      directions_walk: 'bg-green-500/10 text-green-400',
    }
    return colorMap[iconName] || 'bg-gray-500/10 text-gray-400'
  }

  const getButtonStyle = () => {
    if (completed) {
      return 'bg-primary text-primary-content shadow-glow hover:scale-110 active:scale-90'
    }
    const colorMap: Record<string, string> = {
      self_improvement: 'border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-500/10 text-transparent hover:text-teal-500',
      water_drop: 'border-2 border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500',
      book_2: 'border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 text-transparent hover:text-purple-500',
      menu_book: 'border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 text-transparent hover:text-purple-500',
      edit_note: 'border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 hover:bg-pink-500/10 text-transparent hover:text-pink-500',
      directions_walk: 'border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-500',
    }
    return colorMap[habit.icon] || 'border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/10 text-transparent hover:text-primary'
  }

  return (
    <div className="group relative bg-white dark:bg-[#121814] p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={clsx(
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300',
          getIconColor(habit.icon)
        )}>
          <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h5 className="font-bold text-slate-900 dark:text-white text-base truncate pr-2">{habit.name}</h5>
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/10">
              <span className="material-symbols-outlined icon-filled text-[12px]">local_fire_department</span>
              {habit.currentStreak}
            </div>
          </div>
          <p className="text-text-secondary-dark text-sm mt-0.5">
            {habit.goal > 1 ? `${habit.goal} ${habit.goalPeriod}` : habit.description || habit.goalPeriod}
          </p>
        </div>

        <button
          onClick={() => handleHabitClick(habit)}
          className={clsx(
            'shrink-0 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all duration-300',
            getButtonStyle()
          )}
        >
          <span className="material-symbols-outlined icon-bold">{completed ? 'check' : 'check'}</span>
        </button>
      </div>
    </div>
  )
}
