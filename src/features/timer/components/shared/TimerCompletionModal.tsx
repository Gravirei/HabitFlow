/**
 * TimerCompletionModal
 * Modern, sleek congratulatory modal for completed timer sessions
 * Features celebration animations and achievement display
 */

import React, { useEffect, useState } from 'react'
import { useFocusTrap } from '@/shared/hooks/useFocusTrap'
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock'

interface TimerCompletionModalProps {
  isOpen: boolean
  onConfirm: () => void
  mode: 'Countdown' | 'Intervals'
  duration?: string
  intervalCount?: number
  sessionName?: string
  workMinutes?: number
}

export const TimerCompletionModal: React.FC<TimerCompletionModalProps> = ({
  isOpen,
  onConfirm,
  mode,
  duration,
  intervalCount,
  sessionName,
  workMinutes,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0)

  // Accessibility: Focus trap and body scroll lock
  const containerRef = useFocusTrap({
    isActive: isOpen,
    onEscape: onConfirm,
    restoreFocus: true,
  })

  useBodyScrollLock(isOpen)

  // Animate elements in sequence
  useEffect(() => {
    if (!isOpen) return

    const timer1 = setTimeout(() => setAnimationPhase(1), 100)
    const timer2 = setTimeout(() => setAnimationPhase(2), 300)
    const timer3 = setTimeout(() => setAnimationPhase(3), 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      setAnimationPhase(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getCongratulationMessage = () => {
    const messages = {
      Intervals: [
        { title: 'Amazing Work!', subtitle: 'You crushed your goals!' },
        { title: 'Session Master!', subtitle: 'Consistency is key!' },
        { title: 'Champion!', subtitle: 'You own your time!' },
        { title: 'Incredible!', subtitle: 'Focus mode: ON!' },
        { title: 'Well Done!', subtitle: 'You showed up and showed out!' },
      ],
      Countdown: [
        { title: 'Perfect Timing!', subtitle: 'You nailed it!' },
        { title: 'Time Master!', subtitle: 'Every second counts!' },
        { title: 'Deadline Crusher!', subtitle: 'You made it happen!' },
        { title: 'Efficiency Expert!', subtitle: 'Time well spent!' },
        { title: 'Goal Getter!', subtitle: 'Another win!' },
      ],
    }

    const modeMessages = messages[mode]
    const randomIndex = Math.floor(Math.random() * modeMessages.length)
    return modeMessages[randomIndex]
  }

  const getMotivationalMessage = () => {
    const messages = [
      'Small steps lead to big results.',
      'Discipline equals freedom.',
      'You are building unstoppable momentum.',
      'Progress, not perfection.',
      'Every session makes you stronger.',
      'Great things never came from comfort zones.',
      'Your future self is thanking you.',
      'Champions are made in the details.',
    ]
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  }

  const message = getCongratulationMessage()
  const motivationalQuote = getMotivationalMessage()

  return (
    <>
      {/* Animated backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 z-50 bg-black/70 backdrop-blur-md duration-500"
        onClick={onConfirm}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-title"
          aria-describedby="completion-desc"
          className={`pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-2xl shadow-primary/10 backdrop-blur-2xl ${animationPhase >= 1 ? 'animate-in zoom-in-95 fade-in duration-500' : 'opacity-0'} `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

          {/* Animated background shapes */}
          <div className="absolute -right-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-300" />

          {/* Content */}
          <div className="relative p-8 pt-12">
            {/* Success Icon */}
            <div
              className={`mb-8 flex transform justify-center ${animationPhase >= 2 ? 'animate-in slide-in-from-top-5 fade-in duration-500' : 'opacity-0'} `}
            >
              <div className="relative">
                {/* Outer ring */}
                <div className="flex h-28 w-28 animate-[spin_3s_linear_infinite] items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5">
                  {/* Inner circle */}
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10">
                    <span className="animate-bounce text-5xl">🎉</span>
                  </div>
                </div>

                {/* Celebration sparkles */}
                <div
                  className="absolute -right-3 -top-3 h-4 w-4 animate-ping rounded-full bg-yellow-400"
                  style={{ animationDuration: '1.5s' }}
                />
                <div
                  className="absolute -left-4 top-6 h-3 w-3 animate-ping rounded-full bg-blue-400"
                  style={{ animationDuration: '2s', animationDelay: '0.2s' }}
                />
                <div
                  className="absolute -bottom-2 left-8 h-2 w-2 animate-ping rounded-full bg-purple-400"
                  style={{ animationDuration: '1.8s', animationDelay: '0.4s' }}
                />
                <div
                  className="absolute -right-6 top-1/2 h-2.5 w-2.5 animate-ping rounded-full bg-green-400"
                  style={{ animationDuration: '2.2s', animationDelay: '0.6s' }}
                />
              </div>
            </div>

            {/* Congratulations text */}
            <div
              className={`mb-8 transform text-center ${animationPhase >= 3 ? 'animate-in slide-in-from-bottom-4 fade-in duration-700' : 'opacity-0'} `}
            >
              <h2 className="mb-3 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                {message.title}
              </h2>
              <p className="mb-2 text-xl font-medium text-white/80">{message.subtitle}</p>

              {/* Session details card */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                {sessionName && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/50">
                      Session
                    </p>
                    <p className="text-lg font-bold text-white">{sessionName}</p>
                  </div>
                )}

                {mode === 'Intervals' && intervalCount && workMinutes !== undefined && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        Completed
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">{intervalCount}</p>
                      <p className="mt-0.5 text-xs text-white/60">
                        Cycle{intervalCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        Focus Time
                      </p>
                      <p className="mt-1 text-3xl font-bold text-primary">
                        {(() => {
                          const totalMinutes = intervalCount * workMinutes
                          const hours = Math.floor(totalMinutes / 60)
                          const minutes = totalMinutes % 60

                          if (hours > 0 && minutes > 0) {
                            return `${hours}h ${minutes}m`
                          } else if (hours > 0) {
                            return hours
                          } else {
                            return totalMinutes
                          }
                        })()}
                      </p>
                      <p className="mt-0.5 text-xs text-white/60">
                        {(() => {
                          const totalMinutes = intervalCount * workMinutes
                          const hours = Math.floor(totalMinutes / 60)

                          if (hours > 0) {
                            return ''
                          } else {
                            return totalMinutes === 1 ? 'Minute' : 'Minutes'
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'Countdown' && duration && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        Duration
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">{duration}</p>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        Status
                      </p>
                      <p className="mt-1 text-xl font-bold text-primary">Complete!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement badge */}
            <div
              className={`mx-auto mb-8 max-w-xs transform ${animationPhase >= 3 ? 'animate-in zoom-in-90 fade-in delay-200 duration-700' : 'opacity-0'} `}
            >
              <div className="relative">
                <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/20 to-green-400/20 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Session Saved!</p>
                      <p className="text-xs text-white/60">Added to history</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational message */}
            <div
              className={`mb-8 transform text-center ${animationPhase >= 3 ? 'animate-in fade-in delay-300 duration-700' : 'opacity-0'} `}
            >
              <p className="text-sm italic text-white/60">"{motivationalQuote}"</p>
            </div>

            {/* Confirm button */}
            <div
              className={`transform ${animationPhase >= 3 ? 'animate-in slide-in-from-bottom-6 fade-in delay-400 duration-500' : 'opacity-0'} `}
            >
              <button
                onClick={onConfirm}
                aria-label="Close completion modal and continue"
                className="w-full transform rounded-2xl bg-gradient-to-r from-primary to-green-400 px-8 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-primary/90 hover:to-green-400/90 hover:shadow-xl hover:shadow-primary/50 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>

              {/* Helper text */}
              <p className="mt-3 text-center text-xs text-white/40">
                Press <kbd className="rounded bg-white/10 px-2 py-1 text-[10px]">Enter</kbd> or
                click anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
