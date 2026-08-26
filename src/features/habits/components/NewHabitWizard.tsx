import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useHabitStore } from '@/store/useHabitStore'
import { habitSchema, type HabitFormData } from '@/schemas/habitSchema'
import { format } from 'date-fns'

export type Frequency = 'daily' | 'weekly' | 'monthly'

const FREQUENCIES: { value: Frequency; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: 'today' },
  { value: 'weekly', label: 'Weekly', icon: 'view_week' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
]

const WIZARD_STEPS = [
  { title: 'The habit', hint: 'Name & details' },
  { title: 'Rhythm', hint: 'How often' },
  { title: 'Goal', hint: 'Pace yourself' },
  { title: 'Reminder', hint: 'Gentle nudges' },
] as const

const periodWord = (freq: Frequency) =>
  freq === 'daily' ? 'day' : freq === 'weekly' ? 'week' : 'month'

const STEP_COUNT = WIZARD_STEPS.length

export interface NewHabitWizardProps {
  /**
   * Visual context the wizard renders in:
   * - `page`: standalone route — fills the viewport, centered card on md+
   * - `sheet`: inside a modal overlay — a centered card capped to the viewport
   */
  variant?: 'page' | 'sheet'
  /** Preselected category (e.g. via /new-habit?categoryId=fitness deep link). */
  categoryId?: string
  /** Initial frequency selection when the caller wants to preset one. */
  defaultFrequency?: Frequency
  /** Called after the habit was created successfully (close modal / navigate). */
  onClose?: () => void
  /** User tapped X — lets a parent run a discard guard before actually closing. */
  onRequestClose?: () => void
  /** Reports whether the user has entered any data (used for discard guards). */
  onDirtyChange?: (dirty: boolean) => void
}

export function NewHabitWizard({
  variant = 'page',
  categoryId,
  defaultFrequency,
  onClose,
  onRequestClose,
  onDirtyChange
}: NewHabitWizardProps) {
  const { addHabit } = useHabitStore()
  const [step, setStep] = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      description: '',
      frequency: defaultFrequency || 'weekly',
      goal: 3,
      reminderEnabled: true,
      reminderTime: '09:00'
    }
  })

  const frequency = watch('frequency')
  const goal = watch('goal')
  const reminderEnabled = watch('reminderEnabled')
  const description = watch('description') || ''

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

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
      categoryId,
    })

    toast.success('Habit created successfully!')
    onClose?.()
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

  const isLastStep = step === STEP_COUNT - 1

  const advance = () => {
    setMaxVisitedStep((m) => Math.max(m, step + 1))
    setStep(step + 1)
  }

  const onFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLastStep) {
      handleSubmit(onSubmit, onError)()
      return
    }
    if (step === 0) {
      const ok = await trigger('name')
      if (!ok) {
        toast.error('Please enter a habit name')
        return
      }
    }
    advance()
  }

  // Outer shell adapts to where the wizard lives.
  const rootClass =
    variant === 'page'
      ? 'relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background-light dark:bg-background-dark md:h-auto md:min-h-[600px] md:max-w-4xl md:flex-row md:rounded-[2rem] md:border md:border-gray-200/70 md:bg-surface-light md:shadow-large dark:md:border-white/10 dark:md:bg-surface-dark lg:max-w-5xl'
      : 'relative flex max-h-[calc(100dvh_-_2rem)] w-full max-w-none flex-col overflow-hidden rounded-[2rem] border border-gray-200/70 bg-background-light shadow-large dark:border-white/10 dark:bg-background-dark sm:min-h-[560px] sm:max-h-[90vh] sm:max-w-4xl md:flex-row lg:max-w-5xl'

  return (
    <div className={rootClass}>
      {/* Desktop step navigator */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200/70 bg-primary/5 p-8 dark:border-white/10 dark:bg-primary/[0.06] md:flex lg:w-72">
        <p className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          New habit
        </p>

        <ol className="mt-8 flex flex-col gap-1">
          {WIZARD_STEPS.map(({ title, hint }, i) => {
            const isCurrent = i === step
            const isDone = i < step
            const isLocked = i > maxVisitedStep
            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => !isLocked && setStep(i)}
                  disabled={isLocked}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors duration-200 ${
                    isCurrent
                      ? 'bg-primary/10 dark:bg-primary/15'
                      : isLocked
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5'
                  } focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-primary text-[#003811]'
                        : isDone
                          ? 'bg-primary/15 text-primary-focus dark:text-primary'
                          : 'bg-gray-200/80 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                    }`}
                    aria-hidden="true"
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-lg">check</span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-semibold ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {title}
                    </span>
                    <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                      {hint}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <p className="mt-auto text-xs leading-relaxed text-gray-400 dark:text-gray-500">
          Small steps, steady progress.
        </p>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top App Bar */}
        <header className="shrink-0 pt-safe">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 md:justify-end">
            {/* Progress dots (mobile / tablet portrait) */}
            <div
              className="flex items-center gap-1.5 md:hidden"
              role="group"
              aria-label={`Step ${step + 1} of ${STEP_COUNT}`}
            >
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-8 bg-primary'
                      : i < step
                        ? 'size-2 bg-primary/40'
                        : 'size-2 bg-gray-300 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onRequestClose ?? onClose}
              aria-label="Close"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-900 dark:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Spacer balances the close button on mobile */}
            <div className="size-11 shrink-0 md:hidden" aria-hidden="true" />
          </div>
        </header>

        <form id="new-habit-form" onSubmit={onFormSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar">
          <div key={step} className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-8 pb-8 sm:px-8 lg:px-10 motion-safe:animate-fade-in">
            {/* ─── Step 1 · Name ─── */}
            {step === 0 && (
              <section aria-label="Habit name" className="flex flex-1 flex-col">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-primary-focus dark:text-primary">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">emoji_objects</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  What do you want to achieve?
                </h3>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark lg:text-base">
                  Give your habit a name — keep it short and specific.
                </p>

                <div className="mt-8">
                  <label htmlFor="habit-name" className="sr-only">Habit name</label>
                  <input
                    id="habit-name"
                    {...register('name')}
                    autoFocus
                    autoComplete="off"
                    placeholder="Name your habit…"
                    maxLength={100}
                    className={`w-full rounded-3xl bg-surface-light dark:bg-white/5 border px-5 py-5 font-display text-xl font-bold text-gray-900 dark:text-white placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-soft focus:outline-none focus:ring-4 transition-colors lg:text-2xl ${
                      errors.name
                        ? 'border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200/80 dark:border-white/10 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                  {errors.name && (
                    <p role="alert" className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <label htmlFor="habit-description" className="sr-only">Description (optional)</label>
                  <textarea
                    id="habit-description"
                    {...register('description')}
                    rows={3}
                    placeholder="Add details (optional)"
                    className={`w-full resize-none rounded-3xl bg-surface-light dark:bg-white/5 border px-5 py-4 text-sm leading-relaxed text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-soft focus:outline-none focus:ring-4 transition-colors lg:text-base ${
                      errors.description
                        ? 'border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200/80 dark:border-white/10 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {errors.description && (
                      <p role="alert" className="flex items-center gap-1 text-sm text-red-500">
                        <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                        {errors.description.message}
                      </p>
                    )}
                    <span className={`ml-auto shrink-0 text-xs tabular-nums ${description.length > 450 ? 'text-warning-light dark:text-warning-dark' : 'text-gray-400 dark:text-gray-500'}`}>
                      {description.length}/500
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* ─── Step 2 · Frequency ─── */}
            {step === 1 && (
              <section aria-label="Frequency" className="flex flex-1 flex-col">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-primary-focus dark:text-primary">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">event_repeat</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  How often will you do it?
                </h3>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark lg:text-base">
                  Pick a rhythm you can sustain.
                </p>

                <fieldset className="mt-8">
                  <legend className="sr-only">Frequency</legend>
                  <div className="grid grid-cols-3 gap-3 lg:gap-4">
                    {FREQUENCIES.map(({ value, label, icon }) => {
                      const selected = frequency === value
                      return (
                        <label
                          key={value}
                          className={`flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border transition-all duration-200 focus-within:ring-4 focus-within:ring-primary/20 lg:h-36 ${
                            selected
                              ? 'border-transparent bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/60 text-gray-900 dark:text-white'
                              : 'border-gray-200/80 dark:border-white/10 bg-surface-light dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 shadow-soft'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-2xl lg:text-3xl ${selected ? 'text-primary-focus dark:text-primary' : ''}`} aria-hidden="true">
                            {icon}
                          </span>
                          <span className="text-sm font-semibold lg:text-base">{label}</span>
                          <input {...register('frequency')} type="radio" value={value} className="sr-only" />
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              </section>
            )}

            {/* ─── Step 3 · Goal ─── */}
            {step === 2 && (
              <section aria-label="Goal" className="flex flex-1 flex-col">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-primary-focus dark:text-primary">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">flag</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Set a gentle goal.
                </h3>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark lg:text-base">
                  Small wins add up — you can always raise it later.
                </p>

                <div className="mt-8">
                  <div className="flex flex-col items-center rounded-3xl bg-surface-light dark:bg-white/5 border border-gray-200/80 dark:border-white/10 p-8 shadow-soft lg:p-12">
                    <div className="flex items-center gap-6 lg:gap-10">
                      <button
                        type="button"
                        aria-label="Decrease goal"
                        onClick={() => setValue('goal', Math.max(1, goal - 1), { shouldValidate: true })}
                        disabled={goal <= 1}
                        className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-background-light dark:bg-white/10 text-gray-700 dark:text-gray-200 shadow-soft transition-colors hover:bg-gray-100 dark:hover:bg-white/15 active:bg-gray-200 dark:active:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary lg:size-16"
                      >
                        <span className="material-symbols-outlined text-2xl" aria-hidden="true">remove</span>
                      </button>

                      <span
                        className="min-w-24 text-center font-display text-6xl font-bold tabular-nums leading-none text-gray-900 dark:text-white lg:min-w-32 lg:text-7xl"
                        data-testid="goal-value"
                      >
                        {goal}
                      </span>

                      <button
                        type="button"
                        aria-label="Increase goal"
                        onClick={() => setValue('goal', Math.min(100, goal + 1), { shouldValidate: true })}
                        disabled={goal >= 100}
                        className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-background-light dark:bg-white/10 text-gray-700 dark:text-gray-200 shadow-soft transition-colors hover:bg-gray-100 dark:hover:bg-white/15 active:bg-gray-200 dark:active:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary lg:size-16"
                      >
                        <span className="material-symbols-outlined text-2xl" aria-hidden="true">add</span>
                      </button>
                    </div>

                    <p
                      className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                      data-testid="goal-unit"
                    >
                      time{goal !== 1 ? 's' : ''} per {periodWord(frequency)}
                    </p>
                  </div>
                  {errors.goal && (
                    <p role="alert" className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                      {errors.goal.message}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ─── Step 4 · Reminder ─── */}
            {step === 3 && (
              <section aria-label="Reminder" className="flex flex-1 flex-col">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-primary-focus dark:text-primary">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">notifications</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Stay on track.
                </h3>
                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark lg:text-base">
                  A gentle nudge at the right moment works wonders.
                </p>

                <div className="mt-8 flex flex-col gap-3 lg:gap-4">
                  <div className="flex items-center justify-between rounded-3xl bg-surface-light dark:bg-white/5 border border-gray-200/80 dark:border-white/10 p-5 shadow-soft lg:p-6">
                    <label htmlFor="reminder-toggle" className="cursor-pointer select-none">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Daily reminder</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Get a nudge once a day</span>
                    </label>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input id="reminder-toggle" {...register('reminderEnabled')} type="checkbox" className="peer sr-only" />
                      <div className="h-7 w-12 rounded-full bg-gray-300 dark:bg-white/15 transition-colors duration-200 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {reminderEnabled && (
                    <div className="flex items-center justify-between rounded-3xl bg-surface-light dark:bg-white/5 border border-gray-200/80 dark:border-white/10 p-5 shadow-soft motion-safe:animate-fade-in lg:p-6">
                      <label htmlFor="reminder-time" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Remind me at
                      </label>
                      <input
                        id="reminder-time"
                        {...register('reminderTime')}
                        type="time"
                        className="cursor-pointer rounded-2xl bg-surface-light dark:bg-white/10 px-4 py-2 font-display text-lg font-bold tabular-nums text-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </form>

        {/* Bottom Action Bar */}
        <div className="shrink-0 p-4 pb-safe sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-lg items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-200/80 dark:border-white/10 px-5 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary touch-manipulation"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
                Back
              </button>
            )}
            <button
              type="submit"
              form="new-habit-form"
              disabled={isSubmitting}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-[#003811] shadow-medium transition-all duration-200 hover:bg-primary-focus active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark touch-manipulation"
            >
              {isSubmitting ? (
                'Saving…'
              ) : isLastStep ? (
                <>
                  Create Habit
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">check</span>
                </>
              ) : (
                <>
                  Continue
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
