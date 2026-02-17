import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'

interface HabitNotesViewModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
}

export function HabitNotesViewModal({ isOpen, onClose, habitId, habitName }: HabitNotesViewModalProps) {
  const { habits } = useHabitStore()
  const habit = habits.find((h) => h.id === habitId)
  const notes = habit?.notes || []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800"
          >
            {/* Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-white">note</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Habit Notes</h2>
                    <p className="text-sm text-amber-50">{habitName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="material-symbols-outlined mb-3 text-5xl text-slate-300 dark:text-slate-600">
                    note_stack
                  </span>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No notes yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Notes can be added from the category detail page
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="group rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-200">{note.text}</p>
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                View only • Edit notes from category detail page
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
