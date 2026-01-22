/**
 * TimerCompletionModal
 * Modern, sleek congratulatory modal for completed timer sessions
 * Features celebration animations and achievement display
 */

import React, { useEffect, useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

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
  workMinutes
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
        { title: 'Well Done!', subtitle: 'You showed up and showed out!' }
      ],
      Countdown: [
        { title: 'Perfect Timing!', subtitle: 'You nailed it!' },
        { title: 'Time Master!', subtitle: 'Every second counts!' },
        { title: 'Deadline Crusher!', subtitle: 'You made it happen!' },
        { title: 'Efficiency Expert!', subtitle: 'Time well spent!' },
        { title: 'Goal Getter!', subtitle: 'Another win!' }
      ]
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
      'Champions are made in the details.'
    ]
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  }

  const message = getCongratulationMessage()
  const motivationalQuote = getMotivationalMessage()

  return (
    <>
      {/* Animated backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in duration-500" onClick={onConfirm} aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-title"
          aria-describedby="completion-desc"
          className={`
            relative max-w-lg w-full pointer-events-auto
            bg-gradient-to-b from-white/[0.08] to-white/[0.03]
            backdrop-blur-2xl rounded-3xl
            border border-white/20
            shadow-2xl shadow-primary/10
            overflow-hidden
            ${animationPhase >= 1 ? 'animate-in zoom-in-95 fade-in duration-500' : 'opacity-0'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

          {/* Animated background shapes */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />

          {/* Content */}
          <div className="relative p-8 pt-12">
            {/* Success Icon */}
            <div
              className={`
                mb-8 flex justify-center transform
                ${animationPhase >= 2 ? 'animate-in slide-in-from-top-5 fade-in duration-500' : 'opacity-0'}
              `}
            >
              <div className="relative">
                {/* Outer ring */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                  {/* Inner circle */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-5xl animate-bounce">🎉</span>
                  </div>
                </div>

                {/* Celebration sparkles */}
                <div className="absolute -top-3 -right-3 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute top-6 -left-4 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.2s' }} />
                <div className="absolute -bottom-2 left-8 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.4s' }} />
                <div className="absolute top-1/2 -right-6 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Congratulations text */}
            <div
              className={`
                text-center mb-8 transform
                ${animationPhase >= 3 ? 'animate-in slide-in-from-bottom-4 fade-in duration-700' : 'opacity-0'}
              `}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent mb-3">
                {message.title}
              </h2>
              <p className="text-xl text-white/80 font-medium mb-2">
                {message.subtitle}
              </p>

              {/* Session details card */}
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                {sessionName && (
                  <div className="mb-3">
                    <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-1">Session</p>
                    <p className="text-white font-bold text-lg">{sessionName}</p>
                  </div>
                )}

                {mode === 'Intervals' && intervalCount && workMinutes !== undefined && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Completed</p>
                      <p className="text-white font-bold text-3xl mt-1">{intervalCount}</p>
                      <p className="text-white/60 text-xs mt-0.5">Cycle{intervalCount > 1 ? 's' : ''}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex-1 text-center">
                      <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Focus Time</p>
                      <p className="text-primary font-bold text-3xl mt-1">
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
                      <p className="text-white/60 text-xs mt-0.5">
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
                      <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Duration</p>
                      <p className="text-white font-bold text-3xl mt-1">{duration}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex-1 text-center">
                      <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Status</p>
                      <p className="text-primary font-bold text-xl mt-1">Complete!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement badge */}
            <div
              className={`
                mx-auto mb-8 max-w-xs transform
                ${animationPhase >= 3 ? 'animate-in zoom-in-90 fade-in duration-700 delay-200' : 'opacity-0'}
              `}
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-primary/20 to-green-400/20 rounded-2xl p-4 border border-primary/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Session Saved!</p>
                      <p className="text-white/60 text-xs">Added to history</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational message */}
            <div
              className={`
                text-center mb-8 transform
                ${animationPhase >= 3 ? 'animate-in fade-in duration-700 delay-300' : 'opacity-0'}
              `}
            >
              <p className="text-white/60 text-sm italic">
                "{motivationalQuote}"
              </p>
            </div>

            {/* Confirm button */}
            <div
              className={`
                transform
                ${animationPhase >= 3 ? 'animate-in slide-in-from-bottom-6 fade-in duration-500 delay-400' : 'opacity-0'}
              `}
            >
              <button
                onClick={onConfirm}
                aria-label="Close completion modal and continue"
                className="w-full bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* Helper text */}
              <p className="text-white/40 text-xs mt-3 text-center">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">Enter</kbd> or click anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
