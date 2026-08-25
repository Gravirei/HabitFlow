/**
 * AnimatedTimerButton Component
 * Morphing button system: Start → Pause → Split (Continue/Kill)
 * Uses Framer Motion for elastic snap animations matching the HTML prototype
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface AnimatedTimerButtonProps {
  isActive: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onContinue: () => void
  onKill: (saveToHistory: boolean) => void
  onLap?: () => void
  mode?: 'Stopwatch' | 'Countdown' | 'Intervals'
  disabled?: boolean
  inline?: boolean
}

// Elastic cubic-bezier equivalent from HTML prototype
const ELASTIC_EASE: [number, number, number, number] = [0.68, -0.6, 0.32, 1.6];
const elasticTransition = {
  duration: 0.8,
  ease: ELASTIC_EASE,
};
const reducedMotionTransition = {
  duration: 0.01,
  ease: 'linear' as const,
};

export const AnimatedTimerButton: React.FC<AnimatedTimerButtonProps> = React.memo(({
  isActive,
  isPaused,
  onStart,
  onPause,
  onContinue,
  onKill,
  onLap,
  mode,
  disabled = false,
  inline = true
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [showKillConfirm, setShowKillConfirm] = useState(false)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const firstButtonRef = React.useRef<HTMLButtonElement>(null)

  const handleKillClick = () => {
    setShowKillConfirm(true)
  }

  const handleConfirmKill = (saveToHistory: boolean) => {
    setShowKillConfirm(false)
    onKill(saveToHistory)
  }

  const handleCancelKill = () => {
    setShowKillConfirm(false)
  }

  // Focus trap and ESC handler for kill dialog
  React.useEffect(() => {
    if (!showKillConfirm) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowKillConfirm(false)
      }

      // Focus trap
      if (e.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return

        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Set initial focus
    setTimeout(() => firstButtonRef.current?.focus(), 100)

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showKillConfirm])

  const isStopwatch = mode === 'Stopwatch';

  return (
    <>
      <div className={inline
        ? "w-full px-6 py-4 z-10"
        : "fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 px-6 py-6 z-40"
      }>
        <div className="max-w-xs mx-auto">
          {/* Main Elastic Container */}
          <motion.div
            layout
            className="relative flex items-center justify-center"
            animate={{
              gap: (isActive || isPaused) ? '20px' : '0px',
            }}
            transition={prefersReducedMotion ? reducedMotionTransition : elasticTransition}
          >
            <AnimatePresence mode="popLayout">
              {/* START BUTTON */}
              {!isActive && !isPaused && (
                <motion.button
                  key="start-btn"
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                  transition={prefersReducedMotion ? reducedMotionTransition : elasticTransition}
                  onClick={onStart}
                  disabled={disabled}
                  aria-label={`Start ${mode || 'timer'}`}
                  className="w-full h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Timer
                </motion.button>
              )}

              {/* LAP BUTTON (Stopwatch Mode Only) */}
              {isActive && !isPaused && isStopwatch && (
                <motion.button
                  key="lap-btn"
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5, x: -50 }}
                  transition={prefersReducedMotion ? reducedMotionTransition : elasticTransition}
                  onClick={onLap}
                  aria-label="Record lap time"
                  className="flex-1 h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 active:scale-95"
                >
                  Lap
                </motion.button>
              )}

              {/* PAUSE BUTTON */}
              {isActive && !isPaused && (
                <motion.button
                  key="pause-btn"
                  layout
                  initial={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: isStopwatch ? 50 : 0,
                    width: isStopwatch ? '50%' : '100%' 
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    width: isStopwatch ? '50%' : '100%'
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: isStopwatch ? 50 : 0 
                  }}
                  transition={elasticTransition}
                  onClick={onPause}
                  aria-label={`Pause ${mode || 'timer'}`}
                  className="h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 bg-slate-500 text-white shadow-lg shadow-slate-500/30 hover:bg-slate-600 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
                  </svg>
                  Pause
                </motion.button>
              )}

              {/* CONTINUE BUTTON (Paused State) */}
              {isPaused && (
                <motion.button
                  key="continue-btn"
                  layout
                  initial={{ opacity: 0, scale: 0.5, x: -100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -100 }}
                  transition={elasticTransition}
                  onClick={onContinue}
                  aria-label={`Continue ${mode || 'timer'}`}
                  className="flex-1 h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-95"
                >
                  Continue
                </motion.button>
              )}

              {/* KILL BUTTON (Paused State) */}
              {isPaused && (
                <motion.button
                  key="kill-btn"
                  layout
                  initial={{ opacity: 0, scale: 0.5, x: 100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 100 }}
                  transition={elasticTransition}
                  onClick={handleKillClick}
                  aria-label={`Stop ${mode || 'timer'} and choose to save or discard`}
                  className="flex-1 h-12 rounded-full font-semibold text-base flex items-center justify-center gap-2 bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95"
                >
                  Kill
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Kill Confirmation Modal - Enhanced Version with Warning Icon */}
      {showKillConfirm && createPortal(
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {showKillConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                onClick={handleCancelKill}
                aria-label="Close dialog"
              />
            )}
          </AnimatePresence>

          {/* Modal - Centered with CSS Grid */}
          <AnimatePresence>
            {showKillConfirm && (
              <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <motion.div
                  ref={dialogRef}
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="kill-dialog-title"
                  aria-describedby="kill-dialog-description"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30" aria-hidden="true">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 id="kill-dialog-title" className="text-white font-bold text-lg">Stop Timer?</h3>
                        <p className="text-white/50 text-sm">This will end your current session</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-6">
                    <p id="kill-dialog-description" className="text-white/70 text-center mb-2 text-lg font-medium">
                      Keep this record in history?
                    </p>
                    <p className="text-white/40 text-center text-xs">
                      Save your progress for future reference
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-6 pb-6 flex gap-3">
                    <motion.button
                      ref={firstButtonRef}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                      onClick={() => handleConfirmKill(false)}
                      aria-label="Stop timer without saving to history"
                      className="flex-1 h-12 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      No
                    </motion.button>
                    <motion.button
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                      onClick={() => handleConfirmKill(true)}
                      aria-label="Stop timer and save to history"
                      className="flex-1 h-12 rounded-xl font-semibold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      Yes, Save
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  )
})