import { useNavigate, useParams } from 'react-router-dom'
import { useHabitStore } from '@/store/useHabitStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { useState } from 'react'

export function HabitDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { habits, deleteHabit, toggleHabitCompletion } = useHabitStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const habit = habits.find((h) => h.id === id)

  if (!habit) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Habit not found</p>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habit.id)
      navigate('/')
    }
  }

  // Calendar logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startingDayOfWeek = getDay(monthStart)

  const isDateCompleted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return habit.completedDates.includes(dateStr)
  }

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  }

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between pt-safe shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex size-12 shrink-0 items-center justify-start active:scale-95 transition-transform touch-manipulation"
        >
          <span className="material-symbols-outlined text-zinc-900 dark:text-white text-2xl">
            arrow_back
          </span>
        </button>
        <h2 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center truncate px-2">
          {habit.name}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center h-12 bg-transparent text-zinc-900 dark:text-white active:scale-95 transition-transform touch-manipulation">
            <span className="material-symbols-outlined text-2xl">edit</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-safe">

      {/* Stats */}
      <div className="flex flex-wrap gap-4 p-4 shrink-0">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-[#1A382E] p-6 border border-zinc-200 dark:border-[#3b544b]">
          <p className="text-zinc-500 dark:text-[#9db9b0] text-base font-medium leading-normal">
            Current Streak
          </p>
          <p className="text-zinc-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
            {habit.currentStreak} Days
          </p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-[#1A382E] p-6 border border-zinc-200 dark:border-[#3b544b]">
          <p className="text-zinc-500 dark:text-[#9db9b0] text-base font-medium leading-normal">
            Best Streak
          </p>
          <p className="text-zinc-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
            {habit.bestStreak} Days
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-xl bg-white dark:bg-[#1A382E] p-6 border border-zinc-200 dark:border-[#3b544b]">
          <p className="text-zinc-500 dark:text-[#9db9b0] text-base font-medium leading-normal">
            Completion Rate
          </p>
          <p className="text-zinc-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
            {habit.completionRate}%
          </p>
        </div>
      </div>

      {/* Calendar Picker */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-4">
        <div className="flex w-full flex-1 flex-col gap-0.5 rounded-xl bg-white dark:bg-[#1A382E] p-4 border border-zinc-200 dark:border-[#3b544b]">
          <div className="flex items-center p-1 justify-between">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <span className="material-symbols-outlined text-zinc-900 dark:text-white flex size-10 items-center justify-center text-lg">
                chevron_left
              </span>
            </button>
            <p className="text-zinc-900 dark:text-white text-base font-bold leading-tight flex-1 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </p>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <span className="material-symbols-outlined text-zinc-900 dark:text-white flex size-10 items-center justify-center text-lg">
                chevron_right
              </span>
            </button>
          </div>
          
          <div className="grid grid-cols-7">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <p
                key={index}
                className="text-zinc-500 dark:text-white text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
              >
                {day}
              </p>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-12 w-full" />
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((date) => {
              const completed = isDateCompleted(date)
              const today = isToday(date)
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => toggleHabitCompletion(habit.id, format(date, 'yyyy-MM-dd'))}
                  className="h-12 w-full text-zinc-900 dark:text-white text-sm font-medium leading-normal"
                >
                  <div
                    className={`flex size-full items-center justify-center rounded-full ${
                      today
                        ? 'bg-primary text-black dark:text-[#10221c]'
                        : completed
                        ? 'bg-primary/20 dark:bg-primary/30'
                        : ''
                    }`}
                  >
                    {format(date, 'd')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <h3 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Additional Information
      </h3>
      
      {/* Description List */}
      <div className="px-4">
        <div className="flex justify-between gap-x-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-[#9db9b0] text-sm font-normal leading-normal">
            Start Date
          </p>
          <p className="text-zinc-900 dark:text-white text-sm font-normal leading-normal text-right">
            {format(new Date(habit.startDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex justify-between gap-x-6 py-3">
          <p className="text-zinc-500 dark:text-[#9db9b0] text-sm font-normal leading-normal">
            Total Times Completed
          </p>
          <p className="text-zinc-900 dark:text-white text-sm font-normal leading-normal text-right">
            {habit.totalCompletions}
          </p>
        </div>
      </div>

      {/* Delete Button */}
      <div className="mt-8 px-4 pb-8">
        <button
          onClick={handleDelete}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 active:scale-[0.98] transition-transform touch-manipulation"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
          Delete Habit
        </button>
      </div>
      </div>
    </div>
  )
}
