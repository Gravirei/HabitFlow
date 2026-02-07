import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useHabitStore } from '@/store/useHabitStore'
import { habitSchema, type HabitFormData } from '@/schemas/habitSchema'
import { format } from 'date-fns'

type Frequency = 'daily' | 'weekly' | 'monthly'

export function NewHabit() {
  const navigate = useNavigate()
  const { addHabit } = useHabitStore()
  const [searchParams] = useSearchParams()

  // Phase 2 Categories: allow preselecting category via query param.
  // Example: /new-habit?categoryId=fitness
  // Keep backward compatibility: when absent (or empty), store nothing.
  const categoryIdFromQuery = searchParams.get('categoryId')?.trim() || undefined

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      description: '',
      frequency: (searchParams.get('frequency') as Frequency) || 'weekly',
      goal: 3,
      reminderEnabled: true,
      reminderTime: '09:00'
    }
  })

  const frequency = watch('frequency')
  const goal = watch('goal')
  const reminderEnabled = watch('reminderEnabled')

  const onSubmit = (data: HabitFormData) => {
    const goalPeriod = data.frequency === 'daily' ? 'day' : data.frequency === 'weekly' ? 'week' : 'month'

    addHabit({
      name: data.name,
      description: data.description || undefined,
      icon: 'check_circle',
      frequency: data.frequency,
      goal: data.goal,
      goalPeriod,
      reminderEnabled: data.reminderEnabled,
      reminderTime: data.reminderEnabled ? data.reminderTime : undefined,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      categoryId: categoryIdFromQuery,
    })

    toast.success('🎉 Habit created successfully!')
    navigate('/')
  }

  const onError = (errors: any) => {
    // Show error toast when form validation fails
    if (errors.name) {
      toast.error('Please enter a habit name')
    } else if (errors.description) {
      toast.error('Please check your form for errors')
    } else {
      toast.error('Please check your form for errors')
    }
  }

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between pt-safe shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          New Habit
        </h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-1 flex-col px-4 pt-4 pb-24 overflow-y-auto no-scrollbar">
        {/* Section 1: What to achieve? */}
        <div className="flex flex-col gap-3 mb-6">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-2">
            What do you want to achieve?
          </h3>
          
          {/* Habit Name TextField */}
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
              Habit Name
            </p>
            <input
              {...register('name')}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5 border text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-300 dark:border-white/10 focus:ring-primary/50'
              }`}
              placeholder="e.g., Drink Water"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">error</span>
                {errors.name.message}
              </p>
            )}
          </label>

          {/* Description TextField */}
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
              Description (Optional)
            </p>
            <textarea
              {...register('description')}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5 border text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:border-primary min-h-36 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-300 dark:border-white/10 focus:ring-primary/50'
              }`}
              placeholder="Add more details here"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">error</span>
                {errors.description.message}
              </p>
            )}
          </label>
        </div>

        {/* Section 2: How often? */}
        <div className="flex flex-col gap-3 mb-6">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-2">
            How often?
          </h3>
          
          {/* Frequency SegmentedButtons */}
          <div className="flex">
            <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 p-1.5">
              {(['daily', 'weekly', 'monthly'] as Frequency[]).map((freq) => (
                <label
                  key={freq}
                  className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-colors ${
                    frequency === freq
                      ? 'bg-white dark:bg-black/20 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  } text-sm font-semibold leading-normal`}
                >
                  <span className="truncate capitalize">{freq}</span>
                  <input
                    {...register('frequency')}
                    className="sr-only"
                    type="radio"
                    value={freq}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Goal Stepper */}
          <div className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-white/5 p-4 mt-2">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium">Goal</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setValue('goal', Math.max(1, goal - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
              <span className="text-gray-900 dark:text-white font-semibold text-lg w-32 text-center">
                {goal} {goal === 1 ? 'time' : 'times'} per {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}
              </span>
              <button
                type="button"
                onClick={() => setValue('goal', Math.min(100, goal + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
          {errors.goal && (
            <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">error</span>
              {errors.goal.message}
            </p>
          )}
        </div>

        {/* Section 3: Stay on track */}
        <div className="flex flex-col gap-3">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-2">
            Stay on track
          </h3>
          
          {/* Reminder Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-white/5 p-4">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium">Set Reminder</p>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                {...register('reminderEnabled')}
                className="peer sr-only"
                type="checkbox"
              />
              <div className="peer h-7 w-12 rounded-full bg-gray-200 dark:bg-black/20 after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Time Picker */}
          {reminderEnabled && (
            <div className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-white/5 p-4 mt-2">
              <p className="text-gray-800 dark:text-gray-200 text-base font-medium">
                Reminder Time
              </p>
              <div className="flex items-center gap-2">
                <input
                  {...register('reminderTime')}
                  type="time"
                  className="bg-transparent text-gray-900 dark:text-white text-lg font-semibold border-none focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 pb-safe bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-gray-200 dark:border-white/10">
        <button
          type="submit"
          onClick={handleSubmit(onSubmit, onError)}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-center text-base font-bold text-black shadow-sm active:scale-[0.98] transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Habit'}
        </button>
      </div>
    </div>
  )
}
