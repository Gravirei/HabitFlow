import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { format } from 'date-fns'
import { useState } from 'react'

interface AllHabitsStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

// Animation variants following UI/UX Pro Max principles
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      damping: 30,
      stiffness: 300,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 30,
    transition: { duration: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: 'spring', damping: 15, stiffness: 400 }
  }
}

export function AllHabitsStatsModal({ isOpen, onClose }: AllHabitsStatsModalProps) {
  const { habits } = useHabitStore()
  const { categories } = useCategoryStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'insights'>('overview')

  // Helper: Check if habit is completed today
  const today = format(new Date(), 'yyyy-MM-dd')
  const isHabitCompletedToday = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    return habit?.completedDates?.includes(today) || false
  }

  // Filter active, non-archived habits
  const activeHabits = habits.filter((h) => h.isActive === true && !h.archived && !h.hiddenDates?.includes(today))

  // Overall Stats
  const totalHabits = activeHabits.length
  const completedToday = activeHabits.filter((h) => isHabitCompletedToday(h.id)).length
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0
  const pinnedHabits = activeHabits.filter((h) => h.pinned).length

  // Frequency breakdown
  const dailyHabits = activeHabits.filter((h) => h.frequency === 'daily').length
  const weeklyHabits = activeHabits.filter((h) => h.frequency === 'weekly').length
  const monthlyHabits = activeHabits.filter((h) => h.frequency === 'monthly').length

  // Streak stats
  const habitsWithStreaks = activeHabits.filter((h) => (h.currentStreak || 0) > 0)
  const totalStreak = activeHabits.reduce((sum, h) => sum + (h.currentStreak || 0), 0)
  const avgStreak = habitsWithStreaks.length > 0 ? totalStreak / habitsWithStreaks.length : 0
  const maxStreak = Math.max(...activeHabits.map((h) => h.currentStreak || 0), 0)
  const habitWithMaxStreak = activeHabits.find((h) => h.currentStreak === maxStreak)

  // Category breakdown
  const categoryStats = categories.map((category) => {
    const categoryHabits = activeHabits.filter((h) => h.categoryId === category.id)
    const categoryCompleted = categoryHabits.filter((h) => isHabitCompletedToday(h.id)).length
    const categoryRate = categoryHabits.length > 0 ? (categoryCompleted / categoryHabits.length) * 100 : 0

    return {
      id: category.id,
      name: category.name,
      total: categoryHabits.length,
      completed: categoryCompleted,
      rate: categoryRate,
      color: category.color || '#6366f1',
    }
  }).filter((stat) => stat.total > 0) // Only show categories with habits

  // Best performing habit
  const bestHabit = activeHabits.reduce((best, habit) => {
    const habitRate = habit.completedDates?.length || 0
    const bestRate = best?.completedDates?.length || 0
    return habitRate > bestRate ? habit : best
  }, activeHabits[0])

  // Tab data
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'insights', label: 'Insights', icon: 'insights' }
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl"
          />

          {/* Modal - Glassmorphic Design */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white/90 shadow-2xl backdrop-blur-2xl dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50"
          >
            {/* Modern Header with Gradient Overlay */}
            <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-700/50">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
              
              {/* Animated orbs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-700" />
              
              <div className="relative flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-3xl text-white">
                      bar_chart
                    </span>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Habit Analytics</h2>
                    <p className="text-sm text-white/80">Complete overview & insights</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex size-11 items-center justify-center rounded-xl text-white transition-all hover:bg-white/20 hover:rotate-90 duration-300"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="relative flex gap-2 px-6 pb-4">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                    <span className="material-symbols-outlined text-lg relative z-10">{tab.icon}</span>
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content with Tab Views */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {totalHabits === 0 ? (
                <motion.div 
                  variants={itemVariants}
                  className="py-16 text-center"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="material-symbols-outlined mx-auto mb-4 text-8xl text-gray-300 dark:text-gray-600">
                      insights
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">No Active Habits</h3>
                  <p className="text-gray-500 dark:text-gray-500">Start creating habits to see analytics here</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <>
                      {/* Today's Progress - Enhanced */}
                      <motion.div 
                        variants={itemVariants}
                        whileHover="hover"
                        initial="rest"
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 shadow-lg"
                      >
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                              <span className="material-symbols-outlined text-3xl">today</span>
                              Today's Progress
                            </h3>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                            >
                              <span className="text-2xl font-bold text-white">{completionRate.toFixed(0)}%</span>
                            </motion.div>
                          </div>
                          
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-base font-semibold text-white/90">
                              {completedToday} of {totalHabits} completed
                            </span>
                            <span className="text-sm text-white/80">
                              {totalHabits - completedToday} remaining
                            </span>
                          </div>
                          
                          {/* Enhanced progress bar */}
                          <div className="relative h-4 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-white to-white/80 shadow-lg"
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-900 mix-blend-difference">
                                {completedToday}/{totalHabits}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Enhanced Overview Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <EnhancedStatCard
                          icon="format_list_bulleted"
                          label="Total Habits"
                          value={totalHabits.toString()}
                          gradient="from-blue-500 to-indigo-600"
                          delay={0}
                        />
                        <EnhancedStatCard
                          icon="push_pin"
                          label="Pinned"
                          value={pinnedHabits.toString()}
                          gradient="from-orange-500 to-red-600"
                          delay={0.1}
                        />
                        <EnhancedStatCard
                          icon="local_fire_department"
                          label="Avg Streak"
                          value={avgStreak.toFixed(1)}
                          gradient="from-red-500 to-pink-600"
                          delay={0.2}
                        />
                        <EnhancedStatCard
                          icon="emoji_events"
                          label="Best Streak"
                          value={maxStreak.toString()}
                          gradient="from-yellow-500 to-amber-600"
                          delay={0.3}
                        />
                      </div>

                      {/* Frequency Breakdown - Enhanced */}
                      <motion.div 
                        variants={itemVariants}
                        className="rounded-3xl bg-white/60 backdrop-blur-sm p-6 dark:bg-gray-800/60 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <h3 className="mb-6 flex items-center gap-3 text-lg font-bold text-gray-800 dark:text-white">
                          <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">calendar_month</span>
                          Frequency Distribution
                        </h3>
                        <div className="space-y-4">
                          <EnhancedFrequencyBar label="Daily" count={dailyHabits} total={totalHabits} gradient="from-teal-500 to-emerald-500" icon="today" />
                          <EnhancedFrequencyBar label="Weekly" count={weeklyHabits} total={totalHabits} gradient="from-purple-500 to-indigo-500" icon="date_range" />
                          <EnhancedFrequencyBar label="Monthly" count={monthlyHabits} total={totalHabits} gradient="from-blue-500 to-cyan-500" icon="calendar_month" />
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Categories Tab */}
                  {activeTab === 'categories' && categoryStats.length > 0 && (
                    <motion.div 
                      variants={itemVariants}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {categoryStats.map((stat, index) => (
                        <RadialCategoryCard
                          key={stat.id}
                          name={stat.name}
                          total={stat.total}
                          completed={stat.completed}
                          rate={stat.rate}
                          color={stat.color}
                          delay={index * 0.1}
                        />
                      ))}
                    </motion.div>
                  )}

                  {/* Insights Tab */}
                  {activeTab === 'insights' && (habitWithMaxStreak || bestHabit) && (
                    <>
                      {/* Top Performers - Enhanced */}
                      <motion.div 
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 shadow-lg"
                      >
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                            <span className="material-symbols-outlined text-3xl">star</span>
                            Top Performers
                          </h3>
                          <div className="space-y-4">
                            {habitWithMaxStreak && maxStreak > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
                              >
                                <div>
                                  <p className="text-sm font-medium text-white/80 mb-1">Longest Streak</p>
                                  <p className="text-lg font-bold text-white">
                                    {habitWithMaxStreak.name}
                                  </p>
                                </div>
                                <motion.div 
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2"
                                >
                                  <span className="material-symbols-outlined text-xl text-orange-600">
                                    local_fire_department
                                  </span>
                                  <span className="text-lg font-bold text-orange-600">
                                    {maxStreak}
                                  </span>
                                </motion.div>
                              </motion.div>
                            )}
                            {bestHabit && (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
                              >
                                <div>
                                  <p className="text-sm font-medium text-white/80 mb-1">Most Completed</p>
                                  <p className="text-lg font-bold text-white">
                                    {bestHabit.name}
                                  </p>
                                </div>
                                <div className="rounded-full bg-white px-4 py-2">
                                  <span className="text-lg font-bold text-emerald-600">
                                    {bestHabit.completedDates?.length || 0} times
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Additional Insights */}
                      <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <InsightCard
                          title="Consistency Rate"
                          value={`${completionRate.toFixed(1)}%`}
                          description="Today's completion"
                          icon="trending_up"
                          gradient="from-green-500 to-emerald-600"
                        />
                        <InsightCard
                          title="Active Streaks"
                          value={habitsWithStreaks.length.toString()}
                          description="Habits with streaks"
                          icon="local_fire_department"
                          gradient="from-orange-500 to-red-600"
                        />
                        <InsightCard
                          title="Total Streaks"
                          value={totalStreak.toString()}
                          description="Combined days"
                          icon="calendar_today"
                          gradient="from-blue-500 to-indigo-600"
                        />
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Enhanced Stat Card Component
function EnhancedStatCard({ 
  icon, 
  label, 
  value, 
  gradient,
  delay 
}: { 
  icon: string
  label: string
  value: string
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-5 shadow-lg dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Gradient overlay */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`} />
      
      <div className="relative z-10">
        <div className={`mb-3 inline-flex rounded-xl p-3 bg-gradient-to-br ${gradient}`}>
          <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
        </div>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </motion.div>
  )
}

// Enhanced Frequency Bar Component
function EnhancedFrequencyBar({ 
  label, 
  count, 
  total, 
  gradient, 
  icon 
}: { 
  label: string
  count: number
  total: number
  gradient: string
  icon: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
            <span className="material-symbols-outlined text-base text-white">{icon}</span>
          </div>
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-base font-bold text-gray-800 dark:text-white">
          {count} <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  )
}

// Radial Category Card Component
function RadialCategoryCard({
  name,
  total,
  completed,
  rate,
  color,
  delay
}: {
  name: string
  total: number
  completed: number
  rate: number
  color: string
  delay: number
}) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (rate / 100) * circumference

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm p-6 shadow-lg dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {completed} of {total} completed
          </p>
          <p className="text-2xl font-bold" style={{ color }}>
            {rate.toFixed(0)}%
          </p>
        </div>
        
        {/* Radial Progress */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl" style={{ color }}>
              category
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Insight Card Component
function InsightCard({
  title,
  value,
  description,
  icon,
  gradient
}: {
  title: string
  value: string
  description: string
  icon: string
  gradient: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-5 shadow-lg dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl`} />
      
      <div className="relative z-10">
        <div className={`mb-3 inline-flex rounded-xl p-2 bg-gradient-to-br ${gradient}`}>
          <span className="material-symbols-outlined text-xl text-white">{icon}</span>
        </div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
      </div>
    </motion.div>
  )
}
