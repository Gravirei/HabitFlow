import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { motion, useReducedMotion } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import {
  sidebarEdge,
  sidebarItem,
  sidebarList,
  stepContainer,
  stepItem,
} from './newHabitAnimations'
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
  const reducedMotion = useReducedMotion() ?? false
  // Flips shortly after the modal panel has fully opened; step content
  // waits for it on first mount so the text arrives after the slide-in.
  const [entranceDone, setEntranceDone] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setEntranceDone(true)
      return
    }
    const t = setTimeout(() => setEntranceDone(true), 550)
    return () => clearTimeout(t)
  }, [reducedMotion])

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

  // Outer shell adapts to where the wizard lives — glassy card, violet accent.
  const rootClass =
    variant === 'page'
      ? 'relative flex h-dvh w-full max-w-md flex-col overflow-hidden border border-white/40 bg-white/70 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/80 md:h-auto md:min-h-[600px] md:max-w-4xl md:flex-row md:rounded-[2rem] lg:max-w-5xl'
      : 'relative flex max-h-[calc(100dvh_-_2rem)] w-full max-w-none flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/90 sm:min-h-[560px] sm:max-h-[90vh] sm:max-w-4xl md:flex-row lg:max-w-5xl'

  return (
    <div className={rootClass}>
      {/* Desktop step navigator */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200/60 bg-violet-500/[0.04] p-8 backdrop-blur-xl md:flex dark:border-white/5 dark:bg-violet-500/[0.06] lg:w-72">
        <motion.div
          variants={sidebarEdge(reducedMotion, 0.15)}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              New habit
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              Shape a new routine
            </p>
          </div>
        </motion.div>

        <motion.ol
          variants={sidebarList}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col gap-1"
        >
          {WIZARD_STEPS.map(({ title, hint }, i) => {
            const isCurrent = i === step
            const isDone = i < step
            const isLocked = i > maxVisitedStep
            return (
              <motion.li key={title} variants={sidebarItem(reducedMotion)}>
                <button
                  type="button"
                  onClick={() => !isLocked && setStep(i)}
                  disabled={isLocked}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
                    isCurrent
                      ? 'bg-violet-500/10 ring-1 ring-violet-500/30 dark:bg-violet-500/15'
                      : isLocked
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-gray-900/5 dark:hover:bg-white/5'
                  } focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30'
                        : isDone
                          ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
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
              </motion.li>
            )
          })}
        </motion.ol>

        <motion.p
          variants={sidebarEdge(reducedMotion, 0.9)}
          initial="hidden"
          animate="visible"
          className="mt-auto text-xs leading-relaxed text-gray-400 dark:text-gray-500"
        >
          Small steps, steady progress.
        </motion.p>
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
                      ? 'w-8 bg-gradient-to-r from-violet-500 to-purple-600'
                      : i < step
                        ? 'size-2 bg-violet-500/50'
                        : 'size-2 bg-gray-300 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onRequestClose ?? onClose}
              aria-label="Close"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-900/5 active:bg-gray-900/10 focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/15"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Spacer balances the close button on mobile */}
            <div className="size-11 shrink-0 md:hidden" aria-hidden="true" />
          </div>
        </header>

        <form id="new-habit-form" onSubmit={onFormSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar">
          <div key={step} className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-8 pb-8 sm:px-8 lg:px-10">
            {/* ─── Step 1 · Name ─── */}
            {step === 0 && (
              <motion.section
                aria-label="Habit name"
                variants={stepContainer(reducedMotion, entranceDone)}
                initial="hidden"
                animate="visible"
                className="flex flex-1 flex-col"
              >
                <motion.div variants={stepItem(reducedMotion)} className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">emoji_objects</span>
                </motion.div>
                <motion.h3 variants={stepItem(reducedMotion)} className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  What do you want to achieve?
                </motion.h3>
                <motion.p variants={stepItem(reducedMotion)} className="mt-2 text-sm text-gray-500 dark:text-gray-400 lg:text-base">
                  Give your habit a name — keep it short and specific.
                </motion.p>

                <motion.div variants={stepItem(reducedMotion)} className="mt-8">
                  <label htmlFor="habit-name" className="sr-only">Habit name</label>
                  <input
                    id="habit-name"
                    {...register('name')}
                    autoFocus
                    autoComplete="off"
                    placeholder="Name your habit…"
                    maxLength={100}
                    className={`w-full rounded-3xl border bg-white/60 px-5 py-5 font-display text-xl font-bold text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-4 dark:bg-white/5 dark:text-white placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 lg:text-2xl ${
                      errors.name
                        ? 'border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200/70 dark:border-white/10 focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                  />
                  {errors.name && (
                    <p role="alert" className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={stepItem(reducedMotion)} className="mt-5">
                  <label htmlFor="habit-description" className="sr-only">Description (optional)</label>
                  <textarea
                    id="habit-description"
                    {...register('description')}
                    rows={3}
                    placeholder="Add details (optional)"
                    className={`w-full resize-none rounded-3xl border bg-white/60 px-5 py-4 text-sm leading-relaxed text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-4 dark:bg-white/5 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 lg:text-base ${
                      errors.description
                        ? 'border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200/70 dark:border-white/10 focus:border-violet-500 focus:ring-violet-500/20'
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
                </motion.div>
              </motion.section>
            )}

            {/* ─── Step 2 · Frequency ─── */}
            {step === 1 && (
              <motion.section
                aria-label="Frequency"
                variants={stepContainer(reducedMotion, entranceDone)}
                initial="hidden"
                animate="visible"
                className="flex flex-1 flex-col"
              >
                <motion.div variants={stepItem(reducedMotion)} className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">event_repeat</span>
                </motion.div>
                <motion.h3 variants={stepItem(reducedMotion)} className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  How often will you do it?
                </motion.h3>
                <motion.p variants={stepItem(reducedMotion)} className="mt-2 text-sm text-gray-500 dark:text-gray-400 lg:text-base">
                  Pick a rhythm you can sustain.
                </motion.p>

                <motion.fieldset variants={stepItem(reducedMotion)} className="mt-8">
                  <legend className="sr-only">Frequency</legend>
                  <div className="grid grid-cols-3 gap-3 lg:gap-4">
                    {FREQUENCIES.map(({ value, label, icon }) => {
                      const selected = frequency === value
                      return (
                        <label
                          key={value}
                          className={`flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border backdrop-blur transition-all duration-300 focus-within:ring-4 focus-within:ring-violet-500/20 hover:-translate-y-0.5 lg:h-36 ${
                            selected
                              ? 'border-transparent bg-violet-500/10 text-gray-900 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500 dark:bg-violet-500/15 dark:text-white'
                              : 'border-gray-200/70 bg-white/50 text-gray-500 shadow-sm hover:border-violet-500/40 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-violet-500/40'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-2xl lg:text-3xl ${selected ? 'text-violet-600 dark:text-violet-400' : ''}`} aria-hidden="true">
                            {icon}
                          </span>
                          <span className="text-sm font-semibold lg:text-base">{label}</span>
                          <input {...register('frequency')} type="radio" value={value} className="sr-only" />
                        </label>
                      )
                    })}
                  </div>
                </motion.fieldset>
              </motion.section>
            )}

            {/* ─── Step 3 · Goal ─── */}
            {step === 2 && (
              <motion.section
                aria-label="Goal"
                variants={stepContainer(reducedMotion, entranceDone)}
                initial="hidden"
                animate="visible"
                className="flex flex-1 flex-col"
              >
                <motion.div variants={stepItem(reducedMotion)} className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">flag</span>
                </motion.div>
                <motion.h3 variants={stepItem(reducedMotion)} className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Set a gentle goal.
                </motion.h3>
                <motion.p variants={stepItem(reducedMotion)} className="mt-2 text-sm text-gray-500 dark:text-gray-400 lg:text-base">
                  Small wins add up — you can always raise it later.
                </motion.p>

                <motion.div variants={stepItem(reducedMotion)} className="mt-8">
                  <div className="flex flex-col items-center rounded-3xl border border-gray-200/70 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:p-12">
                    <div className="flex items-center gap-6 lg:gap-10">
                      <button
                        type="button"
                        aria-label="Decrease goal"
                        onClick={() => setValue('goal', Math.max(1, goal - 1), { shouldValidate: true })}
                        disabled={goal <= 1}
                        className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-white/70 text-gray-700 shadow-sm transition-all duration-200 hover:bg-violet-500/10 hover:text-violet-600 active:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70 disabled:hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-violet-500/20 dark:hover:text-violet-400 lg:size-16"
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
                        className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-white/70 text-gray-700 shadow-sm transition-all duration-200 hover:bg-violet-500/10 hover:text-violet-600 active:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70 disabled:hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-violet-500/20 dark:hover:text-violet-400 lg:size-16"
                      >
                        <span className="material-symbols-outlined text-2xl" aria-hidden="true">add</span>
                      </button>
                    </div>

                    <p
                      className="mt-4 inline-flex items-center rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
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
                </motion.div>
              </motion.section>
            )}

            {/* ─── Step 4 · Reminder ─── */}
            {step === 3 && (
              <motion.section
                aria-label="Reminder"
                variants={stepContainer(reducedMotion, entranceDone)}
                initial="hidden"
                animate="visible"
                className="flex flex-1 flex-col"
              >
                <motion.div variants={stepItem(reducedMotion)} className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">notifications</span>
                </motion.div>
                <motion.h3 variants={stepItem(reducedMotion)} className="font-display text-2xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Stay on track.
                </motion.h3>
                <motion.p variants={stepItem(reducedMotion)} className="mt-2 text-sm text-gray-500 dark:text-gray-400 lg:text-base">
                  A gentle nudge at the right moment works wonders.
                </motion.p>

                <motion.div variants={stepItem(reducedMotion)} className="mt-8 flex flex-col gap-3 lg:gap-4">
                  <div className="flex items-center justify-between rounded-3xl border border-gray-200/70 bg-white/50 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:p-6">
                    <label htmlFor="reminder-toggle" className="cursor-pointer select-none">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Daily reminder</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Get a nudge once a day</span>
                    </label>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input id="reminder-toggle" {...register('reminderEnabled')} type="checkbox" className="peer sr-only" />
                      <div className="h-7 w-12 rounded-full bg-gray-300 transition-colors duration-200 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:bg-violet-500 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50 peer-checked:after:translate-x-5 dark:bg-white/15" />
                    </label>
                  </div>

                  {reminderEnabled && (
                    <div className="flex items-center justify-between rounded-3xl border border-gray-200/70 bg-white/50 p-5 shadow-sm backdrop-blur motion-safe:animate-fade-in dark:border-white/10 dark:bg-white/5 lg:p-6">
                      <label htmlFor="reminder-time" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Remind me at
                      </label>
                      <input
                        id="reminder-time"
                        {...register('reminderTime')}
                        type="time"
                        className="cursor-pointer rounded-2xl bg-white/70 px-4 py-2 font-display text-lg font-bold tabular-nums text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-white/10 dark:text-white"
                      />
                    </div>
                  )}
                </motion.div>
              </motion.section>
            )}
          </div>
        </form>

        {/* Bottom Action Bar */}
        <div className="shrink-0 p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-lg items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-200/70 px-5 py-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-900/5 active:bg-gray-900/10 focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 dark:active:bg-white/10 touch-manipulation"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
                Back
              </button>
            )}
            <motion.button
              type="submit"
              form="new-habit-form"
              disabled={isSubmitting}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.97 }}
              transition={
                reducedMotion
                  ? { duration: 0.2 }
                  : {
                      scale: { delay: 0.2, type: 'spring', stiffness: 500, damping: 20, mass: 0.9 },
                      opacity: { delay: 0.2, duration: 0.15, ease: 'easeOut' },
                    }
              }
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition-colors duration-200 hover:from-violet-600 hover:to-purple-700 hover:shadow-xl hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark touch-manipulation"
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
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
