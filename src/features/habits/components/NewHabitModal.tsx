import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNewHabitModalStore } from '@/store/useNewHabitModalStore'
import { NewHabitWizard } from './NewHabitWizard'

/**
 * In-place "Create new habit" overlay.
 * Slides up over the current page (no navigation) with a blurred backdrop.
 * Bottom sheet on mobile, centered card on larger screens.
 */
export function NewHabitModal() {
  const isOpen = useNewHabitModalStore((s) => s.isOpen)
  const close = useNewHabitModalStore((s) => s.close)

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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={requestClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Sliding panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Create new habit"
            className="relative z-10 flex w-full flex-col items-stretch"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <NewHabitWizard
              variant="sheet"
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
                  className="absolute inset-0 z-30 flex items-center justify-center rounded-t-[2rem] bg-black/40 p-6 backdrop-blur-sm sm:rounded-[2rem]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    role="alertdialog"
                    aria-label="Discard this habit?"
                    className="w-full max-w-xs rounded-3xl border border-gray-200/70 bg-surface-light p-6 text-center shadow-large dark:border-white/10 dark:bg-surface-dark"
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
                      className="mt-5 w-full cursor-pointer rounded-full bg-primary py-3 text-sm font-bold text-[#003811] shadow-medium transition-all duration-200 hover:bg-primary-focus active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
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
