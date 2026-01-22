import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'

type TimePeriod = 'week' | 'month' | 'all'

export function ProgressOverview() {
  const navigate = useNavigate()
  const { habits } = useHabitStore()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')

  // Calculate statistics
  const totalHabits = habits.length
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0)
  const avgCompletionRate = totalHabits > 0
    ? Math.round(habits.reduce((sum, habit) => sum + habit.completionRate, 0) / totalHabits)
    : 0
  const longestStreak = Math.max(...habits.map(h => h.currentStreak), 0)

  // Weekly completion data (mock data for visualization)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyData = [70, 90, 50, 60, 10, 50, 60] // percentage heights

  // Habit performance - sort by completion rate
  const sortedHabits = [...habits].sort((a, b) => b.completionRate - a.completionRate)
  const topHabit = sortedHabits[0]
  const needsWorkHabit = sortedHabits[sortedHabits.length - 1]

  // Category breakdown
  const categoryData = {
    health: habits.filter(h => h.category === 'health').length,
    work: habits.filter(h => h.category === 'work').length,
    personal: habits.filter(h => h.category === 'personal').length,
  }
  const totalCategories = categoryData.health + categoryData.work + categoryData.personal
  const healthPercent = totalCategories > 0 ? Math.round((categoryData.health / totalCategories) * 100) : 0
  const workPercent = totalCategories > 0 ? Math.round((categoryData.work / totalCategories) * 100) : 0
  const personalPercent = totalCategories > 0 ? Math.round((categoryData.personal / totalCategories) * 100) : 0

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between pt-safe shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-slate-800 dark:text-white flex size-12 shrink-0 items-center justify-center active:scale-95 transition-transform touch-manipulation"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Progress Overview
        </h1>
        <div className="flex size-12 shrink-0 items-center"></div>
      </header>

      <main className="flex flex-col gap-6 px-4 py-3 overflow-y-auto no-scrollbar pb-safe">
        {/* Segmented Buttons */}
        <div className="flex">
          <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-slate-200 dark:bg-[#23483c] p-1">
            {(['week', 'month', 'all'] as TimePeriod[]).map((period) => (
              <label
                key={period}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-colors ${
                  timePeriod === period
                    ? 'bg-primary shadow-lg text-slate-900'
                    : 'text-slate-500 dark:text-[#92c9b7]'
                } text-sm font-bold leading-normal`}
              >
                <span className="truncate">
                  {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
                </span>
                <input
                  className="invisible w-0"
                  name="time-period"
                  type="radio"
                  value={period}
                  checked={timePeriod === period}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-100 dark:bg-[#1a382e] border border-transparent dark:border-[#326755]">
            <p className="text-slate-600 dark:text-white text-base font-medium leading-normal">
              Completion
            </p>
            <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
              {avgCompletionRate}%
            </p>
            <p className="text-green-500 dark:text-[#0bda49] text-sm font-medium leading-normal">
              +5%
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-100 dark:bg-[#1a382e] border border-transparent dark:border-[#326755]">
            <p className="text-slate-600 dark:text-white text-base font-medium leading-normal">
              Longest Streak
            </p>
            <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
              {longestStreak} days
            </p>
            <p className="text-green-500 dark:text-[#0bda49] text-sm font-medium leading-normal">
              +2 days
            </p>
          </div>
          <div className="col-span-2 flex flex-col gap-2 rounded-lg p-4 bg-slate-100 dark:bg-[#1a382e] border border-transparent dark:border-[#326755]">
            <p className="text-slate-600 dark:text-white text-base font-medium leading-normal">
              Total Habits Completed
            </p>
            <p className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
              {totalCompletions}
            </p>
            <p className="text-green-500 dark:text-[#0bda49] text-sm font-medium leading-normal">
              +18 this week
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col gap-4 rounded-lg bg-slate-100 dark:bg-[#1a382e] p-4 border border-transparent dark:border-[#326755]">
          <div className="flex flex-col gap-2">
            <p className="text-slate-600 dark:text-white text-base font-medium leading-normal">
              Weekly Completion
            </p>
            <p className="text-slate-900 dark:text-white tracking-light text-[32px] font-bold leading-tight truncate">
              35/42
            </p>
            <div className="flex gap-1">
              <p className="text-slate-500 dark:text-[#92c9b7] text-base font-normal leading-normal">
                This week
              </p>
              <p className="text-green-500 dark:text-[#0bda49] text-base font-medium leading-normal">
                +3%
              </p>
            </div>
          </div>
          <div className="grid min-h-[180px] grid-flow-col gap-4 grid-rows-[1fr_auto] items-end justify-items-center px-1">
            {weekDays.map((day, index) => (
              <div key={day} className="contents">
                <div
                  className={`w-full rounded-t-sm ${
                    weeklyData[index] > 80
                      ? 'bg-primary dark:bg-primary'
                      : 'bg-primary/20 dark:bg-[#23483c]'
                  }`}
                  style={{ height: `${weeklyData[index]}%` }}
                ></div>
                <p className="text-slate-500 dark:text-[#92c9b7] text-[13px] font-bold leading-normal tracking-[0.015em]">
                  {day}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4">
          Habit Performance
        </h2>

        {/* Habit List */}
        <div className="flex flex-col gap-3">
          {topHabit && (
            <div className="flex items-center gap-4 rounded-lg bg-slate-100 dark:bg-[#1a382e] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-white">{topHabit.name}</p>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {topHabit.completionRate}% completion
                </p>
              </div>
              <div className="text-green-500 dark:text-green-400 font-bold">Top Habit</div>
            </div>
          )}

          {habits.slice(0, 2).map((habit) => (
            habit.id !== topHabit?.id && habit.id !== needsWorkHabit?.id && (
              <div key={habit.id} className="flex items-center gap-4 rounded-lg bg-slate-100 dark:bg-[#1a382e] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                  <span className="material-symbols-outlined">{habit.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">{habit.name}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    {habit.completionRate}% completion
                  </p>
                </div>
              </div>
            )
          ))}

          {needsWorkHabit && needsWorkHabit.completionRate < 50 && (
            <div className="flex items-center gap-4 rounded-lg bg-slate-100 dark:bg-[#1a382e] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300">
                <span className="material-symbols-outlined">trending_down</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-white">{needsWorkHabit.name}</p>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {needsWorkHabit.completionRate}% completion
                </p>
              </div>
              <div className="text-yellow-500 dark:text-yellow-400 font-bold">Needs Work</div>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4">
          Category Breakdown
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-6 rounded-lg bg-slate-100 dark:bg-[#1a382e] p-4">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle
                className="stroke-current text-purple-200 dark:text-purple-800"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeWidth="3"
              />
              <circle
                className="stroke-current text-purple-500 dark:text-purple-400"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${healthPercent}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle
                className="stroke-current text-green-500 dark:text-green-400"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${workPercent}, 100`}
                strokeDashoffset={`-${healthPercent}`}
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle
                className="stroke-current text-blue-500 dark:text-blue-400"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${personalPercent}, 100`}
                strokeDashoffset={`-${healthPercent + workPercent}`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalCompletions}
              </span>
              <span className="text-sm text-slate-500 dark:text-gray-400">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500 dark:bg-purple-400"></div>
              <span className="text-slate-800 dark:text-white">
                Health ({healthPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 dark:bg-green-400"></div>
              <span className="text-slate-800 dark:text-white">
                Work ({workPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <span className="text-slate-800 dark:text-white">
                Personal ({personalPercent}%)
              </span>
            </div>
          </div>
        </div>
        <div className="h-10"></div>
      </main>
    </div>
  )
}
