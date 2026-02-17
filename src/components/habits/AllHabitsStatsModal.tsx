import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { format } from 'date-fns'

interface AllHabitsStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AllHabitsStatsModal({ isOpen, onClose }: AllHabitsStatsModalProps) {
  const { habits } = useHabitStore()
  const { categories } = useCategoryStore()

  // Helper: Check if habit is completed today
  const today = format(new Date(), 'yyyy-MM-dd')
  const isHabitCompletedToday = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    return habit?.completedDates?.includes(today) || false
  }

  // Filter active, non-archived habits
  const activeHabits = habits.filter((h) => h.isActive && !h.archived && !h.hiddenDates?.includes(today))

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-white">
                  bar_chart
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white">All Habits Statistics</h2>
                  <p className="text-sm text-indigo-100">Complete overview of your habits</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {totalHabits === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined mx-auto mb-3 text-6xl text-gray-300 dark:text-gray-600">
                    insights
                  </span>
                  <p className="text-gray-500 dark:text-gray-400">No active habits to analyze</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Today's Progress */}
                  <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 dark:from-teal-900/20 dark:to-emerald-900/20">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">today</span>
                      Today's Progress
                    </h3>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {completedToday} of {totalHabits} completed
                      </span>
                      <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                      icon="format_list_bulleted"
                      label="Total Habits"
                      value={totalHabits.toString()}
                      color="blue"
                    />
                    <StatCard
                      icon="push_pin"
                      label="Pinned"
                      value={pinnedHabits.toString()}
                      color="orange"
                    />
                    <StatCard
                      icon="local_fire_department"
                      label="Avg Streak"
                      value={avgStreak.toFixed(1)}
                      color="red"
                    />
                    <StatCard
                      icon="emoji_events"
                      label="Best Streak"
                      value={maxStreak.toString()}
                      color="yellow"
                    />
                  </div>

                  {/* Frequency Breakdown */}
                  <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/50">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">calendar_month</span>
                      Frequency Distribution
                    </h3>
                    <div className="space-y-3">
                      <FrequencyBar label="Daily" count={dailyHabits} total={totalHabits} color="teal" icon="today" />
                      <FrequencyBar label="Weekly" count={weeklyHabits} total={totalHabits} color="purple" icon="date_range" />
                      <FrequencyBar label="Monthly" count={monthlyHabits} total={totalHabits} color="blue" icon="calendar_month" />
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {categoryStats.length > 0 && (
                    <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/50">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">category</span>
                        Category Breakdown
                      </h3>
                      <div className="space-y-3">
                        {categoryStats.map((stat) => (
                          <div key={stat.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: stat.color }}
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {stat.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {stat.completed}/{stat.total}
                              </span>
                              <span className="text-sm font-bold text-gray-800 dark:text-white">
                                {stat.rate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Performers */}
                  {(habitWithMaxStreak || bestHabit) && (
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:from-amber-900/20 dark:to-orange-900/20">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">star</span>
                        Top Performers
                      </h3>
                      <div className="space-y-3">
                        {habitWithMaxStreak && maxStreak > 0 && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Longest Streak</p>
                              <p className="text-base font-bold text-gray-800 dark:text-white">
                                {habitWithMaxStreak.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-500/20">
                              <span className="material-symbols-outlined text-sm text-orange-600 dark:text-orange-400">
                                local_fire_department
                              </span>
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {maxStreak}
                              </span>
                            </div>
                          </div>
                        )}
                        {bestHabit && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Most Completed</p>
                              <p className="text-base font-bold text-gray-800 dark:text-white">
                                {bestHabit.name}
                              </p>
                            </div>
                            <div className="rounded-full bg-teal-100 px-3 py-1 dark:bg-teal-500/20">
                              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                {bestHabit.completedDates?.length || 0} times
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}

// Frequency Bar Component
function FrequencyBar({ label, count, total, color, icon }: { label: string; count: number; total: number; color: string; icon: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colorClasses = {
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-gray-400">{icon}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 dark:text-white">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
