import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useNewHabitModalStore } from '@/store/useNewHabitModalStore'
import { NewHabitWizard } from './NewHabitWizard'

/**
 * In-place "Create new habit" overlay.
 * Slides up over the current page (no navigation) with a blurred backdrop,
 * landing as a centered card at every breakpoint.
 */
/**
 * Panel motion: rises in on a critically damped spring (glides, no bounce)
 * while fading in; dismissal is a quicker ease-out slide. Reduced motion
 * gets a plain crossfade.
 */
const panelVariants: Variants = {
  enter: (reduced: boolean) => (reduced ? { y: 0, opacity: 0 } : { y: '100%', opacity: 0.4 }),
  center: (reduced: boolean) => ({
    y: 0,
    opacity: 1,
    transition: reduced
      ? { duration: 0.2, ease: 'easeOut' }
      : {
          y: { type: 'spring', stiffness: 380, damping: 40, mass: 0.9 },
          opacity: { duration: 0.25, ease: 'easeOut' },
        },
  }),
  exit: (reduced: boolean) => ({
    y: reduced ? 0 : '100%',
    opacity: 0,
    transition: reduced
      ? { duration: 0.15, ease: 'easeIn' }
      : {
          y: { duration: 0.28, ease: [0.4, 0, 1, 1] },
          opacity: { duration: 0.28, ease: 'easeIn' },
        },
  }),
}

export function NewHabitModal() {
  const isOpen = useNewHabitModalStore((s) => s.isOpen)
  const close = useNewHabitModalStore((s) => s.close)
  const defaultFrequency = useNewHabitModalStore((s) => s.defaultFrequency)
  const categoryId = useNewHabitModalStore((s) => s.categoryId)
  const reducedMotion = useReducedMotion() ?? false

  const [dirty, setDirty] = useState(false)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty

  useEffect(() => {
    if (!isOpen) {
      // Reset guard state once the modal has fully closed
      const t = setTimeout(() => {
        setDirty(false)
        setConfirmingDiscard(false)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const doClose = () => close()

  const requestClose = () => {
    if (dirtyRef.current) {
      setConfirmingDiscard(true)
    } else {
      doClose()
    }
  }

  // Escape to dismiss + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
            onClick={requestClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl dark:bg-black/70"
            aria-hidden="true"
          />

          {/* Sliding panel — springs into place, eases out on dismiss */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Create new habit"
            className="relative z-10 flex w-full flex-col items-center transform-gpu will-change-transform"
            custom={reducedMotion}
            initial="enter"
            animate="center"
            exit="exit"
            variants={panelVariants}
          >
            <NewHabitWizard
              variant="sheet"
              defaultFrequency={defaultFrequency}
              categoryId={categoryId}
              onClose={doClose}
              onRequestClose={requestClose}
              onDirtyChange={setDirty}
            />

            {/* Discard confirmation */}
            <AnimatePresence>
              {confirmingDiscard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 flex items-center justify-center rounded-[2rem] bg-black/40 p-6 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    role="alertdialog"
                    aria-label="Discard this habit?"
                    className="w-full max-w-xs rounded-3xl border border-white/40 bg-white/80 p-6 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/90"
                  >
                    <span
                      className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-warning-light/15 text-warning-light dark:text-warning-dark"
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined text-2xl">delete</span>
                    </span>
                    <h4 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                      Discard this habit?
                    </h4>
                    <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Your entries won't be saved.
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirmingDiscard(false)}
                      className="mt-5 w-full cursor-pointer rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:from-violet-600 hover:to-purple-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      Keep editing
                    </button>
                    <button
                      type="button"
                      onClick={doClose}
                      className="mt-2 w-full cursor-pointer rounded-full py-3 text-sm font-semibold text-error-light transition-colors hover:bg-error-light/10 focus-visible:ring-2 focus-visible:ring-error-light dark:text-error-dark"
                    >
                      Discard changes
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
